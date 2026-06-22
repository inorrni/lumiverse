// 시연용 더미데이터 시드 (LLM 생성판) — stargazer 계정에 "중간점검·인사이트"를 보여줄
// 은하 4개를, 앱이 쓰는 LLM 엣지 함수를 전부 실제로 호출해 만든다.
//
//   · goal-breakdown        → 세부목표(행성) + 대표 투두 패턴 + 은하 메시지
//   · mid-check             → 상태/판정에 맞는 사유·항해사 메시지 (+보완 추천 행성)
//   · constellation-symbol  → 별자리 상징(이모지) 후보 → 첫 후보 채택
//   · self-insight          → 우주 전체를 가로지른 자기 인사이트 (확인·캐시 워밍)
//
// 상태 레이블 4종(초반 진입/꾸준함 유지/정체기/이탈 위험)은 별 이력(done)을 설계해
// computeMidCheck 규칙이 그대로 산출하도록 만든다. "꾸준함" 은하의 오늘 별 4개로
// 회고 4조합(체크○회고○ / 체크○회고✕ / 체크✕회고○ / 체크✕회고✕)도 보여준다.
//
// 인증: service_role 키가 없으므로 anon 키 + 본인 로그인(RLS 통과)으로 심는다.
//   실행:  SEED_PASSWORD='비번' node scripts/seed-demo.mjs [--wipe]
//   옵션:  --wipe       기존 은하 전체 삭제 후 시드 (깨끗한 녹화용, 권장)
//          SEED_EMAIL   기본 stargazer@gmail.com

import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

// ── .env.local 에서 URL / anon key 읽기 (Vite 변수) ──────────────────────────
function loadEnv(path) {
  const env = {}
  try {
    for (const line of readFileSync(path, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  } catch { /* 없으면 process.env 사용 */ }
  return env
}
const fileEnv = loadEnv(new URL('../.env.local', import.meta.url).pathname)
const URL_ = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL
const ANON = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY
const EMAIL = process.env.SEED_EMAIL || 'stargazer@gmail.com'
const PASSWORD = process.env.SEED_PASSWORD
const WIPE = process.argv.includes('--wipe')

if (!URL_ || !ANON) { console.error('✗ VITE_SUPABASE_URL / ANON 키를 찾지 못했어요 (.env.local).'); process.exit(1) }
if (!PASSWORD) { console.error('✗ SEED_PASSWORD 환경변수가 필요해요.  예) SEED_PASSWORD=xxxx node scripts/seed-demo.mjs --wipe'); process.exit(1) }

// ── 날짜 유틸 (src/lib/date.js 와 동일 규칙: 로컬 달력) ───────────────────────
const pad = (n) => String(n).padStart(2, '0')
const toISO = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
const TODAY = new Date(); TODAY.setHours(0, 0, 0, 0)
const todayISO = toISO(TODAY)
const addDays = (iso, n) => { const [y, m, d] = iso.split('-').map(Number); return toISO(new Date(y, m - 1, d + n)) }
const enumerate = (s, e) => { const out = []; let c = s; while (c <= e) { out.push(c); c = addDays(c, 1) } return out }
const daysAgoOf = (iso) => Math.round((Date.parse(`${todayISO}T00:00:00`) - Date.parse(`${iso}T00:00:00`)) / 86400000)
const daysUntil = (iso) => Math.max(1, daysAgoOf(iso) * -1)

// ── 상태 산출(src/lib/midcheck.js computeMidCheck 와 동일) ─────────────────────
function computeStats(stars) {
  const map = new Map()
  for (const s of stars) {
    if (!s.due_date || s.due_date > todayISO) continue
    const c = map.get(s.due_date) || { t: 0, d: 0 }
    c.t++; if (s.done) c.d++; map.set(s.due_date, c)
  }
  const dates = [...map.keys()].sort()
  let total = 0, done = 0
  for (const d of dates) { total += map.get(d).t; done += map.get(d).d }
  const rate = total ? done / total : 0
  let streak = 0
  for (let i = dates.length - 1; i >= 0; i--) { const { t, d } = map.get(dates[i]); const full = t > 0 && d === t; if (full) streak++; else if (dates[i] === todayISO) continue; else break }
  let fail = 0
  for (let i = dates.length - 1; i >= 0; i--) { const d = dates[i]; if (d === todayISO) continue; if (map.get(d).d === 0) fail++; else break }
  const samples = [...stars]
    .filter((s) => s.due_date <= todayISO)
    .sort((a, b) => b.due_date.localeCompare(a.due_date))
    .sort((a, b) => (b.review ? 1 : 0) - (a.review ? 1 : 0))
    .slice(0, 5)
    .map((s) => ({ title: s.title || '', review: (s.review || '').trim(), done: !!s.done }))
  return { daysTracked: dates.length, completionPct: Math.round(rate * 100), streak, failStreak: fail, samples }
}

// ── 더미 설계 ────────────────────────────────────────────────────────────────
// rule(pIdx, iso) → { done, review }  ·  과거(daysAgo>0)·오늘(0)만 의미, 미래는 손대지 않음.
const start3 = addDays(todayISO, -9)   // 과거 10일(T-9..T)
const end3 = addDays(todayISO, 21)     // D-21 (미래 별까지 풍성하게)

const GOALS = [
  // 1) 꾸준함 유지(steady → go) — 최근 줄곧 완료 + 오늘 별 4개로 회고 4조합 + 별자리 생성 가능(미생성·14↑)
  {
    goal: '토익 900 달성', intensity: 'spartan', count: 4, state: 'steady', verdict: 'go',
    dday_start: start3, dday_end: end3, constellation: false,
    rule: (pIdx, iso) => {
      const a = daysAgoOf(iso)
      if (a > 0) return { done: true, review: a === 2 && pIdx === 1 ? '모의고사 점수 올라서 뿌듯' : a === 4 && pIdx === 2 ? '단어 외우는 게 제일 지겹다' : '' }
      if (pIdx === 0) return { done: true, review: '오늘 컨디션 좋아서 계획대로 끝냈다' } // 체크○ 회고○
      if (pIdx === 1) return { done: true, review: '' }                                  // 체크○ 회고✕
      if (pIdx === 2) return { done: false, review: '이건 오늘 못 했다, 내일 보충하자' }  // 체크✕ 회고○
      return { done: false, review: '' }                                                  // 체크✕ 회고✕
    },
  },
  // 2) 정체기(plateau → 보완) — 완료율 50%, 격일
  {
    goal: '매일 30분 러닝', intensity: 'easy', count: 3, state: 'plateau', verdict: 'supplement',
    dday_start: start3, dday_end: end3, constellation: false,
    rule: (pIdx, iso) => {
      const a = daysAgoOf(iso)
      const done = a >= 0 && a % 2 === 1
      let review = ''
      if (a === 0 && pIdx === 0) review = '오늘은 무리하지 말고 쉬자'
      if (a === 3 && pIdx === 1) review = '비 오면 자꾸 빼먹게 된다'
      if (a === 1 && pIdx === 2) review = '그래도 뛰고 나면 개운하다'
      if (a === 5 && pIdx === 0) review = '무릎이 좀 아프다'
      return { done, review }
    },
  },
  // 3) 이탈 위험(at_risk → 보완) — 초반 반짝 뒤 최근 6일 손 놓음
  {
    goal: '포트폴리오 사이트 완성', intensity: 'spartan', count: 3, state: 'at_risk', verdict: 'supplement',
    dday_start: start3, dday_end: end3, constellation: false,
    rule: (pIdx, iso) => {
      const a = daysAgoOf(iso)
      const done = a >= 6
      let review = ''
      if (a === 0 && pIdx === 0) review = '요즘 일이 바빠서 손을 못 댔다'
      if (a === 2 && pIdx === 1) review = '동기부여가 안 생긴다'
      if (a === 7 && pIdx === 0) review = '디자인 고민만 하다 시간 다 갔다'
      return { done, review }
    },
  },
  // 4) 초반 진입(early → 격려) — 어제 시작, 추적 2일
  {
    goal: '독서 습관 만들기', intensity: 'easy', count: 3, state: 'early', verdict: 'encourage',
    dday_start: addDays(todayISO, -1), dday_end: addDays(todayISO, 20), constellation: false,
    rule: (pIdx, iso) => {
      const a = daysAgoOf(iso)
      if (a === 1) return { done: true, review: pIdx === 0 ? '첫 챕터 생각보다 재밌다' : '' }
      if (a === 0 && pIdx === 0) return { done: true, review: '20쪽 금방이네' }
      return { done: false, review: '' }
    },
  },
  // 5) 별자리 생성용 A — 행성 3개 · 과거 전부 완료(별 14↑) · 미생성 → "별자리 만들기" 활성
  {
    goal: '기타 한 곡 마스터', intensity: 'easy', count: 3, state: 'steady', verdict: 'go',
    dday_start: start3, dday_end: end3, constellation: false,
    rule: (pIdx, iso) => {
      const a = daysAgoOf(iso)
      if (a > 0) return { done: true, review: a === 3 && pIdx === 1 ? '코드 전환이 슬슬 부드러워진다' : '' }
      if (a === 0 && pIdx === 0) return { done: true, review: '오늘도 한 곡 연습 완료' }
      return { done: false, review: '' }
    },
  },
  // 6) 별자리 생성용 B — 행성 3개 · 과거 전부 완료(별 14↑) · 미생성 → "별자리 만들기" 활성
  {
    goal: '블로그 글 30개 쓰기', intensity: 'easy', count: 3, state: 'steady', verdict: 'go',
    dday_start: start3, dday_end: end3, constellation: false,
    rule: (pIdx, iso) => {
      const a = daysAgoOf(iso)
      if (a > 0) return { done: true, review: a === 5 && pIdx === 2 ? '초안은 막 써도 일단 끝내자' : '' }
      if (a === 0 && pIdx === 1) return { done: true, review: '' }
      return { done: false, review: '' }
    },
  },
]

// ── 엣지 함수 호출 헬퍼 ───────────────────────────────────────────────────────
const sb = createClient(URL_, ANON)
async function invoke(name, body) {
  const { data, error } = await sb.functions.invoke(name, { body })
  if (error) {
    let detail = error.message
    try { detail += ' · ' + (await error.context.text()) } catch { /* */ }
    throw new Error(`[${name}] ${detail}`)
  }
  return data
}

async function main() {
  const { data: auth, error: authErr } = await sb.auth.signInWithPassword({ email: EMAIL, password: PASSWORD })
  if (authErr) { console.error('✗ 로그인 실패:', authErr.message); process.exit(1) }
  const userId = auth.user.id
  console.log(`✓ 로그인: ${EMAIL} (${userId})`)

  if (WIPE) {
    const { error } = await sb.from('lumiverse_galaxies').delete().eq('user_id', userId)
    if (error) { console.error('✗ 초기화 실패:', error.message); process.exit(1) }
    console.log('✓ 기존 은하 전체 삭제(--wipe)')
  }

  const insightInput = [] // self-insight 용 집계
  let totDone = 0, totAll = 0

  for (const G of GOALS) {
    const ddayDays = daysUntil(G.dday_end)

    // 1) goal-breakdown — 세부목표(행성) + 대표 투두 패턴
    const bd = await invoke('goal-breakdown', {
      goal: G.goal, galaxy_name: G.goal, dday_days: ddayDays, intensity: G.intensity, exclude: [], count: G.count,
    })
    const planets = (bd.planets || []).slice(0, G.count)
    console.log(`\n● ${G.goal} — 행성 ${planets.length}개${bd.cached ? ' (캐시)' : ''}: ${planets.map((p) => `${p.symbol || ''}${p.name}`).join(', ')}`)

    // 2) 은하+행성+별 생성 (앱과 동일하게 todo_pattern 을 날짜에 순환 배치)
    const starsEnd = addDays(G.dday_end, -1)
    const dates = enumerate(G.dday_start, starsEnd)
    const payload = {
      name: G.goal, dday_start: G.dday_start, dday_end: G.dday_end, intensity: G.intensity, input_mode: 'ai',
      planets: planets.map((p, i) => {
        const pat = Array.isArray(p.todo_pattern) && p.todo_pattern.length ? p.todo_pattern : [{ title: p.name }]
        return {
          name: p.name, symbol: p.symbol || null, order_idx: i,
          stars: dates.map((due_date, di) => ({ due_date, title: pat[di % pat.length]?.title || p.name })),
        }
      }),
    }
    const { data: galaxyId, error: rpcErr } = await sb.rpc('lumiverse_create_galaxy_with_planets', { payload })
    if (rpcErr) { console.error(`✗ [${G.goal}] 생성 실패:`, rpcErr.message); continue }

    // 3) done/review 적용 (과거·오늘만)
    const { data: pls } = await sb.from('lumiverse_planets').select('id, name, order_idx').eq('galaxy_id', galaxyId).order('order_idx')
    const idxOf = new Map(pls.map((p) => [p.id, p.order_idx]))
    const { data: stars } = await sb.from('lumiverse_stars').select('id, planet_id, due_date, title').eq('galaxy_id', galaxyId)
    const seeded = []
    for (const s of stars) {
      const pIdx = idxOf.get(s.planet_id)
      let done = false, review = ''
      if (s.due_date <= todayISO) ({ done, review } = G.rule(pIdx, s.due_date))
      seeded.push({ ...s, done, review })
      if (!done && !review) continue
      const patch = {}
      if (done) { patch.done = true; patch.done_at = `${s.due_date}T12:00:00+09:00` }
      if (review) patch.review = review
      const { error } = await sb.from('lumiverse_stars').update(patch).eq('id', s.id)
      if (error) console.error(`  · 별 갱신 실패:`, error.message)
    }

    // 4) 통계 산출 → mid-check 호출
    const st = computeStats(seeded)
    const doneAll = seeded.filter((s) => s.done).length
    const overallPct = Math.round((doneAll / seeded.length) * 100)
    const planetNames = pls.map((p) => p.name)
    const mc = await invoke('mid-check', {
      goal_name: G.goal, intensity: G.intensity, state: G.state, verdict: G.verdict,
      stats: { completionPct: st.completionPct, overallPct, daysTracked: st.daysTracked, streak: st.streak, failStreak: st.failStreak },
      samples: st.samples, existing_planets: planetNames,
    })
    console.log(`  ↳ mid-check${mc.cached ? '(캐시)' : ''}: "${mc.message}"`)
    if (mc.recommendation) console.log(`  ↳ 보완 추천 행성: ${mc.recommendation.symbol || ''}${mc.recommendation.name}`)

    const { error: mcErr } = await sb.from('lumiverse_midchecks').insert({
      galaxy_id: galaxyId, state: G.state, verdict: mc.verdict || G.verdict,
      reason: mc.reason, message: mc.message, completion_pct: st.completionPct, overall_pct: overallPct, streak: st.streak,
    })
    if (mcErr) console.error('  · 중간점검 저장 실패:', mcErr.message)

    // 5) 별자리 — constellation-symbol 로 상징 추천 → 첫 후보 채택
    if (G.constellation) {
      const sym = await invoke('constellation-symbol', { goal: G.goal, intensity: G.intensity })
      const pick = sym.symbols?.[0]
      if (pick) {
        const { error } = await sb.from('lumiverse_constellations').insert({ galaxy_id: galaxyId, symbol: pick.symbol, star_count: doneAll })
        if (error) console.error('  · 별자리 실패:', error.message)
        else console.log(`  ↳ 별자리: ${pick.symbol} (${pick.label || ''}) · 별 ${doneAll}개`)
      }
    }

    console.log(`✓ ${G.goal} → ${G.state} · 완료율 ${st.completionPct}% · 추적 ${st.daysTracked}일 · streak ${st.streak} · fail ${st.failStreak}`)

    totDone += doneAll; totAll += seeded.length
    insightInput.push({
      name: G.goal, intensity: G.intensity, state: G.state, completion_pct: st.completionPct,
      sub_goals: planetNames, reviews: seeded.filter((s) => s.review).map((s) => s.review),
    })
  }

  // 6) self-insight — 우주 전체 인사이트 (확인 + 캐시 워밍)
  console.log('\n─ self-insight ─')
  try {
    const totals = { goals: insightInput.length, done_stars: totDone, total_stars: totAll }
    const ins = await invoke('self-insight', { goals: insightInput, totals, nickname: '' })
    console.log('summary:', ins.summary)
    if (ins.doing_well?.length) console.log('잘 진행 중:', ins.doing_well.join(', '))
    if (ins.frequent_words?.length) console.log('자주 하는 말:', ins.frequent_words.join(', '))
    if (ins.dislikes?.length) console.log('피하고 싶은 것:', ins.dislikes.join(', '))
    console.log('message:', ins.message)
  } catch (e) {
    console.error('self-insight 실패(페이지에서 다시 호출됨):', e.message)
  }

  console.log('\n✦ 시드 완료. 앱에서 stargazer 로 로그인해 확인하세요.')
  process.exit(0)
}

main().catch((e) => { console.error(e); process.exit(1) })
