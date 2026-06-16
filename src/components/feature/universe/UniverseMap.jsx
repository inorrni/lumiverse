import { Planet, BlackHole } from '../../ui/Celestial'
import { StarIcon } from '../../ui/icons'
import styles from './UniverseMap.module.css'

// 내 우주 무대 feature — 궤도 위에 목표(행성)들 + 블랙홀 배지 + '새 목표' 타일.
// 임의 개수(0..N)에 견고하도록 궤도 타원은 배경 장식, 행성은 중앙 클러스터로 배치.
export default function UniverseMap({ goals, onAdd, onSelect }) {
  return (
    <div className={styles.stage}>
      <div className={styles.orbit} aria-hidden="true" />
      <div className={styles.blackhole}>
        <BlackHole size={34} />
        <span className={styles.bhLabel}>Black Hole ◍ 0</span>
      </div>

      <div className={styles.cluster}>
        {goals.map((g) => {
          const size = Math.min(70, 40 + g.stars * 0.35)
          const pips = Math.round((g.clarity / 100) * 3)
          return (
            <button key={g.id} className={styles.planet} onClick={() => onSelect?.(g.id)}>
              <Planet size={size} />
              <div className={styles.name}>{g.title}</div>
              <div className={styles.meta}>{g.days ? `D-${g.days}` : '∞'} · {g.clarity}%</div>
              <div className={styles.pips}>
                {[0, 1, 2].map((i) => <StarIcon key={i} size={11} filled={i < pips} />)}
              </div>
            </button>
          )
        })}

        <button className={styles.add} onClick={onAdd}>
          <span className={styles.addCircle} aria-hidden="true">＋</span>
          <span className={styles.addLabel}>새 목표 추가</span>
        </button>
      </div>
    </div>
  )
}
