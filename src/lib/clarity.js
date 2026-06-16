// 선명도(SNR) 계산 — 아키텍처 v4 §3-3.
//   별(Star)    : done ? 1.0 : 0.0 (이진)
//   행성(Planet): 체크된 별 수 / 전체 별 수
//   은하(Galaxy): 행성 선명도 평균
// 프론트 즉시 계산값(시각 반영). DB 가 최종 신뢰 소스.

// stars: [{ done }]  →  0~100 정수
export function planetClarity(stars = []) {
  if (!stars.length) return 0
  const done = stars.filter((s) => s.done).length
  return Math.round((done / stars.length) * 100)
}

// planets: [{ stars: [...] }]  →  0~100 정수 (행성 평균)
export function galaxyClarity(planets = []) {
  if (!planets.length) return 0
  const sum = planets.reduce((n, p) => n + planetClarity(p.stars || []), 0)
  return Math.round(sum / planets.length)
}
