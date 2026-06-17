import { todayISO } from './date'

// 중간점검 판정 — 한 목표(은하)의 별 이력으로 §5-3 상태 레이블 + verdict 를 결정한다.
// 상태(근거) → verdict(액션) 도출. LLM 은 이 판정에 맞는 문구만 생성한다.

const ELIGIBLE_DAYS = 3 // 3일 미만 = 초반 진입
const GO_RATE = 0.7
const GO_STREAK = 5
const RISK_RATE = 0.4
const FINISH_MIN_DAYS = 7
const MAX_SAMPLES = 5

// 상태 레이블(§5-3) — 색 이모지 없이 텍스트만.
export const STATE_META = {
  early: { key: 'early', label: '초반 진입' },
  steady: { key: 'steady', label: '꾸준함 유지' },
  plateau: { key: 'plateau', label: '정체기' },
  at_risk: { key: 'at_risk', label: '이탈 위험' },
}

// verdict 메타 — UI 배지/라벨 + LLM 실패 시 폴백 문구.
export const VERDICT_META = {
  encourage: {
    key: 'encourage',
    badge: 'START',
    label: '격려',
    hint: '이제 시작',
    fallbackReason: '이제 막 시작했어요. 며칠 쌓이면 흐름이 보이기 시작해요.',
    fallbackMessage: '첫 별들이 켜지는 중이에요. 오늘 한 걸음이면 충분해요.',
  },
  go: {
    key: 'go',
    badge: 'GOOD',
    label: 'go',
    hint: '강도 올리기',
    fallbackReason: '꾸준히 잘 이어가고 있어요. 지금 페이스라면 강도를 조금 올려도 좋아요.',
    fallbackMessage: '지금처럼만 하면 목표 달성 충분히 가능해요. 한 걸음 더 욕심내 볼까요?',
  },
  supplement: {
    key: 'supplement',
    badge: 'CHECK',
    label: '보완',
    hint: '페이스 점검',
    fallbackReason: '흐름이 조금 느슨해졌어요. 무리하지 말고 목표를 다듬어 다시 잡아봐요.',
    fallbackMessage: '완벽하지 않아도 괜찮아요. 버거운 행성은 잠시 보내고, 지금 맞는 걸로 다시 채워봐요.',
  },
  finish: {
    key: 'finish',
    badge: 'FINISH',
    label: 'finish',
    hint: '마무리 고려',
    fallbackReason: '한동안 별이 잘 안 채워졌어요. 목표를 잠시 보내주는 것도 좋은 선택이에요.',
    fallbackMessage: '멈춰도 실패가 아니에요. 이 목표를 마무리하고, 가볍게 다시 그려도 돼요.',
  },
}

// 날짜별 집계 — { date: { total, done } } (due_date ≤ today 만)
function byDate(stars, today) {
  const map = new Map()
  for (const s of stars) {
    if (!s.due_date || s.due_date > today) continue
    const cur = map.get(s.due_date) || { total: 0, done: 0 }
    cur.total += 1
    if (s.done) cur.done += 1
    map.set(s.due_date, cur)
  }
  return map
}

// stars: [{ due_date, done, review, title }]
export function computeMidCheck(stars = []) {
  const today = todayISO()
  const dayMap = byDate(stars, today)
  const dates = [...dayMap.keys()].sort() // 오름차순

  const daysTracked = dates.length
  let total = 0
  let done = 0
  for (const d of dates) {
    total += dayMap.get(d).total
    done += dayMap.get(d).done
  }
  const completionRate = total > 0 ? done / total : 0

  // streak — 최근부터 거꾸로 "그날 별 전부 done" 연속일. 오늘 미완료면 끊지 않고 건너뜀.
  let streak = 0
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i]
    const { total: t, done: dn } = dayMap.get(d)
    const full = t > 0 && dn === t
    if (full) streak += 1
    else if (d === today) continue
    else break
  }

  // failStreak — 어제부터 거꾸로 "그날 하나도 done 안 함" 연속일(오늘 제외).
  let failStreak = 0
  for (let i = dates.length - 1; i >= 0; i--) {
    const d = dates[i]
    if (d === today) continue
    const { done: dn } = dayMap.get(d)
    if (dn === 0) failStreak += 1
    else break
  }

  // 상태(§5-3): early → steady → at_risk → plateau(기본)
  let state
  if (daysTracked < ELIGIBLE_DAYS) state = 'early'
  else if (completionRate >= GO_RATE && streak >= GO_STREAK) state = 'steady'
  else if (failStreak >= 3 || completionRate < RISK_RATE) state = 'at_risk'
  else state = 'plateau'

  // 상태 → verdict. at_risk 는 사용자가 보완/마무리를 고르므로 기본 supplement.
  let verdict = 'supplement'
  if (state === 'early') verdict = 'encourage'
  else if (state === 'steady') verdict = 'go'
  else if (state === 'at_risk') verdict = 'supplement' // 사용자 선택 시 finish 로 전환 가능

  // samples — 한줄평 있는 별 우선, 최근순 N개(LLM 개인화 주입용).
  const samples = [...stars]
    .filter((s) => s.due_date && s.due_date <= today)
    .sort((a, b) => b.due_date.localeCompare(a.due_date))
    .sort((a, b) => (b.review ? 1 : 0) - (a.review ? 1 : 0))
    .slice(0, MAX_SAMPLES)
    .map((s) => ({ title: s.title || '', review: (s.review || '').trim(), done: !!s.done, due_date: s.due_date }))

  return {
    state,
    verdict,
    daysTracked,
    completionRate,
    completionPct: Math.round(completionRate * 100),
    streak,
    failStreak,
    totalStars: total,
    doneStars: done,
    samples,
  }
}
