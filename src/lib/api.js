// AI 목표 분해 — 지금은 mock. 2주차 2-1 에서 Solar/Claude API 호출로 교체한다.
// (system/user 메시지 설계 후 fetch 로 대체. 인터페이스는 그대로 유지.)
//
// 4상태 UI 시연을 위한 결정적 테스트 훅(목표 텍스트에 키워드 포함 시):
//   "실패" → 에러(서버 오류)    ·   "없음" → 빈 결과(steps: [])
// 그 외 → 행성(세부목표) 3개로 분해. 모든 호출에 ~1.1s 지연을 둬 로딩이 보이게.
//
// 별 = 일수 규칙: days(디데이까지 일수)를 행성들에 나눠 담는다. days 가 없으면
// 행성당 30개(기획 기본값 느낌)로 둔다.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function mockSteps(goal, days) {
  const base = goal.replace(/[.!?]+$/, '')
  const templates = [
    { title: `'${base}' 시작하기`, detail: '가장 작은 첫 행동부터 출발해요' },
    { title: '매일 반복할 습관 만들기', detail: '하루 1별 — 꾸준함이 핵심이에요' },
    { title: '중간 점검하고 강도 조절', detail: 'AI 항해사가 페이스를 도와줘요' },
  ]
  const total = days && days > 0 ? days : templates.length * 30
  const per = Math.max(1, Math.round(total / templates.length))
  return templates.map((t, i) => ({ id: `s${i + 1}`, ...t, stars: per }))
}

export async function breakdownGoal(goal, { days } = {}) {
  await wait(1100)
  const text = (goal || '').trim()
  if (!text) throw new Error('목표가 비어 있어요.')
  if (text.includes('실패')) throw new Error('500 server error (mock)')
  if (text.includes('없음')) return { goal: text, days, steps: [] }
  return { goal: text, days, steps: mockSteps(text, days) }
}
