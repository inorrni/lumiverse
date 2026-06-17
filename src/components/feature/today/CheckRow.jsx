import { StarIcon, NoteIcon } from '../../ui/icons'
import styles from './CheckRow.module.css'

// 체크 가능한 별 한 줄 — 데일리 체크의 기본 단위. 별 영역을 누르면 onToggle.
// ink: 갱지 카드(잉크 톤) / 기본: 다크 카드. done 이면 별이 채워진다.
// onReview 가 있으면 우측에 한 줄 회고 토글 버튼, 없으면 count 표기.
// reviewFilled: 회고 유무(아이콘 색) / reviewOpen: 입력칸 열림(버튼 눌림 배경).
export default function CheckRow({ title, sub, done = false, count = '0 / 1', ink = false, onToggle, last = false, onReview, reviewFilled = false, reviewOpen = false }) {
  return (
    <div className={`${styles.row} ${ink ? styles.ink : ''} ${last ? styles.last : ''}`}>
      <button type="button" className={styles.main} onClick={onToggle} aria-pressed={done}>
        <StarIcon filled={done} size={21} className={styles.star} />
        <span className={styles.body}>
          <span className={styles.title}>{title}</span>
          {sub && <span className={styles.sub}>{sub}</span>}
        </span>
      </button>
      {onReview ? (
        <button
          type="button"
          className={`${styles.reviewBtn} ${reviewFilled ? styles.hasReview : ''} ${reviewOpen ? styles.open : ''}`}
          onClick={onReview}
          aria-label="한 줄 회고"
          aria-pressed={reviewOpen}
        >
          <NoteIcon filled={reviewFilled} size={19} />
        </button>
      ) : (
        <span className={styles.count}>{count}</span>
      )}
    </div>
  )
}
