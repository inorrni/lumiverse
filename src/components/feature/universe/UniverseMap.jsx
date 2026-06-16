import { Planet } from '../../ui/Celestial'
import { StarIcon } from '../../ui/icons'
import styles from './UniverseMap.module.css'

// 내 우주 무대 — 세부목표(steps)를 타원 궤도 위에 행성으로 배치.
// 행성은 중심(50%, 50%)을 기준으로 등간격 타원 궤도(rx=30%, ry=28%)에 올라간다.
export default function UniverseMap({ steps, onAdd, onSelect }) {
  const n = steps.length

  return (
    <div className={styles.stage}>
      <div className={styles.orbit} aria-hidden="true" />
      {steps.map((s, i) => {
        const size = Math.min(66, 38 + s.stars * 0.35)
        const pips = Math.round((s.clarity / 100) * 3)
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
            <div className={styles.pips}>
              {[0, 1, 2].map((j) => <StarIcon key={j} size={10} filled={j < pips} />)}
            </div>
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
