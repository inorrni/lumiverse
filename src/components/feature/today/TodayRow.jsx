import { StarIcon } from '../../ui/icons'
import styles from './TodayRow.module.css'

// 오늘의 별 한 줄 (갱지 카드용, 잉크 톤). done 이면 DONE 오벌, 아니면 카운트.
export default function TodayRow({ title, sub, done = false, count = '0 / 1', last = false }) {
  return (
    <div className={`${styles.row} ${last ? styles.last : ''}`}>
      <StarIcon filled={done} size={21} style={{ color: 'var(--paper-ink)' }} />
      <div className={styles.body}>
        <div className={styles.title}>{title}</div>
        {sub && <div className={styles.sub}>{sub}</div>}
      </div>
      {done
        ? <span className={styles.done}>DONE</span>
        : <span className={styles.count}>{count}</span>}
    </div>
  )
}
