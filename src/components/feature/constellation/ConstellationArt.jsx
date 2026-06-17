import { useMemo } from 'react'

// 별자리 그리기 — 누적 별(count)을 점으로 흩뿌려 선으로 잇는 절차적 SVG 라인아트.
// seed(목표 id)로 결정적: 같은 목표는 항상 같은 모양. stroke/fill=currentColor(먹/갱지 적응).
// UniverseMap 의 황금비 quasi-random 배치 패턴을 재사용한다.
function seedNum(seed) {
  const s = String(seed || '')
  let n = 0
  for (let i = 0; i < s.length; i++) n = (n * 31 + s.charCodeAt(i)) % 100000
  return n
}

export default function ConstellationArt({ seed, count = 14, symbol, size = 120, className, style }) {
  const off = seedNum(seed)
  const nodes = Math.max(5, Math.min(16, count || 5))

  const pts = useMemo(
    () =>
      Array.from({ length: nodes }, (_, i) => ({
        // 여백 14~86% 안에 분산(가장자리 잘림 방지)
        x: (((i * 6180 + off * 7 + 3100) % 10000) / 10000) * 72 + 14,
        y: (((i * 4142 + off * 13 + 7850) % 10000) / 10000) * 72 + 14,
        r: 1.4 + ((i + off) % 3) * 0.7,
      })),
    [nodes, off],
  )

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      style={{ flex: 'none', color: 'currentColor', ...style }}
      aria-hidden="true"
    >
      {/* 잇는 선 */}
      <path d={path} fill="none" stroke="currentColor" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.5" />
      {/* 별 점 */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="currentColor" opacity={0.65 + ((i + off) % 3) * 0.12} />
      ))}
      {/* 엠블럼 — 중앙에 살짝 */}
      {symbol && (
        <text x="50" y="53" textAnchor="middle" dominantBaseline="middle" fontSize="22" opacity="0.92">
          {symbol}
        </text>
      )}
    </svg>
  )
}
