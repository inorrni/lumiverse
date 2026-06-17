import { supabase } from './supabase'

// AI 목표 분해 — Supabase Edge Function(goal-breakdown) 호출.
// 공급자(Solar/Groq)는 함수 secrets 로 추상화. 동일 입력은 서버에서 캐시 반환.
//
// 반환(화면 호환): { goal, days, galaxy_message, steps: [{ id, title, detail, symbol, stars, todo_pattern }] }
//   - steps = 행성(세부목표). stars = 미리보기용 별 개수(=일수, 실제 별은 확정 시 인스턴스화).
//   - todo_pattern = 행성별 대표 투두(앱이 due_date 별로 별을 펼칠 때 사용).
export async function breakdownGoal(goal, { days, intensity, exclude, count } = {}) {
  const text = (goal || '').trim()
  if (!text) throw new Error('목표가 비어 있어요.')

  const { data, error } = await supabase.functions.invoke('goal-breakdown', {
    body: {
      goal: text,
      galaxy_name: text,
      dday_days: days ?? null,
      intensity: intensity || 'normal',
      // 리프레시: 이미 본 행성 이름을 제외해 다른 분해를 요청(캐시 키도 달라짐).
      exclude: Array.isArray(exclude) ? exclude.filter(Boolean) : [],
      // 리프레시: 현재 행성 개수에 맞춰 분해(미지정이면 함수가 3~5 자유 선택).
      count: count ?? null,
    },
  })
  // functions.invoke 는 비-2xx 를 FunctionsHttpError 로 던진다 — friendlyError 가 매핑.
  if (error) throw error

  const planets = Array.isArray(data?.planets) ? data.planets : []
  const per = days && days > 0 ? days : 30
  const steps = planets.map((p, i) => ({
    id: `s${i + 1}`,
    title: p.name,
    detail: p.symbol || '',
    symbol: p.symbol || null,
    stars: per,
    todo_pattern: Array.isArray(p.todo_pattern) ? p.todo_pattern : null,
  }))

  return { goal: text, days: days ?? null, galaxy_message: data?.galaxy_message || '', steps }
}

// AI 중간점검 — Edge Function(mid-check) 호출. 판정(state/verdict)은 클라이언트가 §5-3 규칙으로
// 정하고, 함수는 그 판정에 맞는 reason/message + (보완 계열) 추천 행성만 생성한다.
// args: { goalName, intensity, state, verdict,
//         stats:{completionPct,overallPct,daysTracked,streak,failStreak},
//         samples:[{title,review,done}], existingPlanets:[name] }
export async function fetchMidCheck({ goalName, intensity, state, verdict, stats, samples, existingPlanets } = {}) {
  const name = (goalName || '').trim()
  if (!name) throw new Error('목표가 비어 있어요.')

  const { data, error } = await supabase.functions.invoke('mid-check', {
    body: {
      goal_name: name,
      intensity: intensity || 'normal',
      state: state || 'plateau',
      verdict: verdict || 'supplement',
      stats: stats || {},
      samples: Array.isArray(samples) ? samples : [],
      existing_planets: Array.isArray(existingPlanets) ? existingPlanets : [],
    },
  })
  if (error) throw error

  return {
    verdict: data?.verdict || verdict || 'supplement',
    reason: data?.reason || '',
    message: data?.message || '',
    recommendation: data?.recommendation || null,
    cached: !!data?.cached,
  }
}
