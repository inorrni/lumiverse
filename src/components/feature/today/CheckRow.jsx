import { StarIcon } from '../../ui/icons'
import styles from './CheckRow.module.css'

// 체크 가능한 별 한 줄 — 데일리 체크의 기본 단위. 누르면 onToggle.
// ink: 갱지 카드(잉크 톤) / 기본: 다크 카드. done 이면 별 채워지고 완료 표기.
export default function CheckRow({ title, sub, done = false, count = '0 / 1', ink = false, onToggle, last = false }) {
  return (
    <button
      type="button"
      className={`${styles.row} ${ink ? styles.ink : ''} ${last ? styles.last : ''}`}
      onClick={onToggle}
      aria-pressed={done}
    >
      <StarIcon filled={done} size={21} className={styles.star} />
      <span className={styles.body}>
        <span className={styles.title}>{title}</span>
        {sub && <span className={styles.sub}>{sub}</span>}
      </span>
      {done
        ? <span className={styles.done}>DONE</span>
        : <span className={styles.count}>{count}</span>}
    </button>
  )
}
