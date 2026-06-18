// 3D 우주 배치 계산 — 모두 seed 결정적(같은 goal은 항상 같은 모양·위치).
import { rngFor } from '../../../lib/seededRandom'

// 황금각(golden angle) — 점들을 겹치지 않게 고르게 흩뿌리는 데 쓰는 상수.
const GOLDEN = Math.PI * (3 - Math.sqrt(5))

// 은하계들을 둥근 타원체(우주)에 결정적으로 흩뿌린 3D 좌표 배열을 만든다.
// 피보나치 구 분포로 균등하게 두되, 세로축을 flatten 비율(0.7)로 눌러
// 납작하지 않은 둥근 타원형 군집을 만든다. seed 지터로 자연스럽게.
export function galaxyPositions(goals, { radius = 9, flatten = 0.7 } = {}) {
  const n = Math.max(1, goals.length)
  return goals.map((goal, i) => {
    const rnd = rngFor(goal.id)
    const yNorm = 1 - ((i + 0.5) / n) * 2 // 1 … -1 (위→아래)
    const ring = Math.sqrt(Math.max(0, 1 - yNorm * yNorm)) // 해당 높이의 단면 반지름
    const theta = i * GOLDEN + rnd() * 0.5
    const rr = radius * (0.78 + 0.22 * rnd()) // 껍질에서 살짝 안쪽으로 깊이감
    const x = Math.cos(theta) * ring * rr
    const z = Math.sin(theta) * ring * rr
    const y = yNorm * rr * flatten // 세로축 70% → 둥근 타원체
    return [x, y, z]
  })
}

// 은하의 콘텐츠(행성+별)를 감싸는 반경. 행성 수·별 수가 많을수록 커진다.
// 이 값으로 별 구름의 퍼짐과 중심 글로우 크기를 함께 맞춘다.
export function galaxyExtent(goal) {
  const planetCount = (goal.steps || []).length
  const starCount = goal.stars || 0
  const planetR = 0.9 + Math.max(0, planetCount - 1) * 0.55 + 0.35 // 가장 바깥 궤도 + 여유
  const starR = 1.5 + Math.sqrt(starCount) * 0.42 // 별이 많을수록 넓게
  return Math.max(planetR, starR, 1.4)
}

// 은하 내 행성(step)들을 중심 주변 궤도에 결정적으로 배치.
// done/clarity 에 따라 크기·밝기를 차등.
export function planetLayout(goal) {
  const rnd = rngFor('p:' + goal.id)
  const steps = goal.steps || []
  const spread = 0.85 + steps.length * 0.28 // 행성 많을수록 넓게
  return steps.map((step) => {
    // 자유로운 3D 산개 — 방향(구면)·거리 모두 seed 랜덤(규칙성 제거).
    const theta = 2 * Math.PI * rnd()
    const phi = Math.acos(2 * rnd() - 1)
    const r = (0.4 + 0.6 * Math.cbrt(rnd())) * spread
    const x = r * Math.sin(phi) * Math.cos(theta)
    const y = r * Math.cos(phi) * 0.65 // 살짝 납작하게
    const z = r * Math.sin(phi) * Math.sin(theta)
    const progress = step.stars > 0 ? step.done / step.stars : 0
    const clarity = step.clarity / 100 || progress
    return {
      id: step.id,
      title: step.title,
      symbol: step.symbol,
      pos: [x, y, z],
      size: 0.18 + 0.12 * progress, // 진행할수록 커짐
      glow: 0.3 + 0.6 * clarity, // 밝기
      noise: 1 - clarity, // 선명도 낮을수록 노이즈(울퉁불퉁) ↑
      done: step.done >= step.stars && step.stars > 0,
    }
  })
}

// 체크된 별 좌표(Float32Array, xyz)를 무게중심 기준 각도순으로 정렬한 좌표를 만든다.
// xz 평면(위에서 본) 각도로 정렬 → 하나의 비교차 닫힌 윤곽(별자리 테두리)을 이룬다.
// LineLoop 용이라 닫는 점은 따로 붙이지 않는다(마지막→첫 점 자동 연결). 3개 미만이면 null.
export function constellationLoop(positions) {
  const n = positions.length / 3
  if (n < 3) return null
  let cx = 0
  let cz = 0
  for (let i = 0; i < n; i++) {
    cx += positions[i * 3]
    cz += positions[i * 3 + 2]
  }
  cx /= n
  cz /= n
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (a, b) =>
      Math.atan2(positions[a * 3 + 2] - cz, positions[a * 3] - cx) -
      Math.atan2(positions[b * 3 + 2] - cz, positions[b * 3] - cx),
  )
  const out = new Float32Array(n * 3)
  order.forEach((idx, k) => {
    out[k * 3] = positions[idx * 3]
    out[k * 3 + 1] = positions[idx * 3 + 1]
    out[k * 3 + 2] = positions[idx * 3 + 2]
  })
  return out
}

// 별 좌표(Float32Array)를 모양별 buckets개 그룹으로 나눈다(별 i → i % buckets).
// 각 그룹을 서로 다른 별 모양 텍스처로 렌더하기 위함.
export function splitByShape(arr, buckets = 3) {
  const out = Array.from({ length: buckets }, () => [])
  const count = arr.length / 3
  for (let i = 0; i < count; i++) {
    const b = out[i % buckets]
    b.push(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2])
  }
  return out.map((a) => new Float32Array(a))
}

// 누적 별(starsEarned) 개수만큼 은하 주변에 작은 점 구름을 생성.
// Three.Points 용 Float32Array(xyz) 반환.
export function starCloud(count, seed, { radius = 3.2 } = {}) {
  const n = Math.max(0, count | 0)
  const arr = new Float32Array(n * 3)
  const rnd = rngFor('s:' + seed)
  for (let i = 0; i < n; i++) {
    // 구 껍질 근처에 살짝 두께를 준 분포(은하 후광 느낌).
    const u = rnd()
    const v = rnd()
    const phi = Math.acos(2 * u - 1)
    const theta = 2 * Math.PI * v
    const rr = radius * (0.45 + 0.55 * Math.cbrt(rnd()))
    arr[i * 3] = rr * Math.sin(phi) * Math.cos(theta)
    arr[i * 3 + 1] = rr * Math.cos(phi) * 0.55 // 살짝 납작하게
    arr[i * 3 + 2] = rr * Math.sin(phi) * Math.sin(theta)
  }
  return arr
}
