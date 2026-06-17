import { StarIcon } from '../../ui/icons'
import styles from './TodayRow.module.css'

// 오늘의 별 한 줄 (갱지 카드용, 잉크 톤). 채워진 별이 곧 완료 표시.
export default function TodayRow({ title, sub, done = false, last = false }) {
  return (
    <div className={`${styles.row} ${last ? styles.last : ''}`}>
      <StarIcon filled={done} size={21} style={{ color: 'var(--paper-ink)' }} />
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {sub && <div className={styles.sub}>{sub}</div>}
      </div>
    </div>
  )
}
