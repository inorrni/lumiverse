import { useMemo } from 'react'
import styles from './CosmicBackground.module.css'
import { asset } from '../../lib/asset'

// 결정적 별밭 — seed 가 같으면 항상 같은 배치(리렌더 깜빡임 없음).
function starShadows(seed, n, w, h) {
  let s = seed
  const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
  const out = []
  for (let i = 0; i < n; i++) {
    const x = Math.round(rnd() * w)
    const y = Math.round(rnd() * h)
    const o = (0.15 + rnd() * 0.85).toFixed(2)
    const big = rnd() > 0.93
    out.push(`${x}px ${y}px ${big ? '1px 1px' : '0 0'} rgba(236,231,220,${o})`)
  }
  return out.join(',')
}

// 우주 배경 organism — 별밭 + 그레인 + (옵션) 성운 이미지.
// AppScreen 안에서 절대배치로 깔린다. 장식이므로 aria-hidden.
// dim: 내부 화면용 흐린 별밭 / nebula: 성운 표시 여부.
export default function CosmicBackground({ seed = 7, density = 90, nebula = true, dim = false }) {
  const sh1 = useMemo(() => starShadows(seed, density, 430, 932), [seed, density])
  const sh2 = useMemo(() => starShadows(seed + 13, Math.round(density / 3.5), 430, 932), [seed, density])
  return (
    <div className={styles.bg} style={{ opacity: dim ? 0.4 : 1 }} aria-hidden="true">
      <div className={styles.stars} style={{ boxShadow: sh1 }} />
      <div className={styles.starsBig} style={{ boxShadow: sh2 }} />
      {nebula && (
        <img className={styles.nebula} src={asset('assets/bg/nebula.png')} alt=""
          style={{ top: -40, right: -90, width: 400, height: 360 }} />
      )}
      <div className={styles.grain} />
    </div>
  )
}
