import { useMemo } from 'react'
import { Planet } from '../../ui/Celestial'
import styles from './UniverseMap.module.css'

const MAX_PIXEL = 50

// 내 우주 무대 — 세부목표(steps)를 타원 궤도 위에 행성으로 배치.
// 행성은 중심(50%, 50%)을 기준으로 등간격 타원 궤도(rx=30%, ry=28%)에 올라간다.
export default function UniverseMap({ steps, onAdd, onSelect }) {
  const n = steps.length
  const totalDone = steps.reduce((acc, s) => acc + s.done, 0)
  const pixelStars = useMemo(() => {
    const count = Math.min(totalDone, MAX_PIXEL)
    // 황금비(6180)·√2-1(4142) 기반 quasi-random — 선형 패턴 없이 고르게 산재
    return Array.from({ length: count }, (_, i) => ({
      x: (((i * 6180 + 3100) % 10000) / 10000) * 84 + 4,
      y: (((i * 4142 + 7850) % 10000) / 10000) * 84 + 4,
      sz: 6 + ((i * 7) % 10), // 6~15px, 패턴 없이 분산
    }))
  }, [totalDone])

  return (
    <div className={styles.stage}>
      <div className={styles.orbit} aria-hidden="true" />
      {pixelStars.map((s, i) => (
        <span
          key={i}
          className={styles.pixelStar}
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.sz }}
          aria-hidden="true"
        >✦</span>
      ))}
      {steps.map((s, i) => {
        const size = Math.min(66, 38 + s.stars * 0.35)
        const angle = (2 * Math.PI / Math.max(n, 1)) * i - Math.PI / 2
        const lx = 50 + 30 * Math.cos(angle)
        const ly = 50 + 28 * Math.sin(angle)
        return (
          <button
            key={s.id}
            className={styles.planet}
            style={{ left: `${lx}%`, top: `${ly}%` }}
            onClick={() => onSelect?.()}
          >
            <Planet size={size} />
            <div className={styles.name}>{s.title}</div>
            <div className={styles.meta}>{s.done} / {s.stars} · {s.clarity}%</div>
          </button>
        )
      })}

      {/* 새 목표 추가 — 궤도 중심에 배치 */}
      <button className={styles.add} onClick={onAdd}>
        <span className={styles.addCircle} aria-hidden="true">＋</span>
        <span className={styles.addLabel}>새 목표</span>
      </button>
    </div>
  )
}
