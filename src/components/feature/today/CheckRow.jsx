import { StarIcon, NoteIcon, PlanetIcon } from '../../ui/icons'
import styles from './CheckRow.module.css'

// 체크 가능한 별 한 줄 — 데일리 체크의 기본 단위. 별 영역을 누르면 onToggle.
// ink: 갱지 카드(잉크 톤) / 기본: 다크 카드. done 이면 별이 채워진다.
// onReview 가 있으면 우측에 한 줄 회고 토글 버튼, 없으면 count 표기.
// reviewFilled: 회고 유무(아이콘 색) / reviewOpen: 입력칸 열림(버튼 눌림 배경).
// onPress: 행성 목록 전용 — 좌측 정적 행성 아이콘 + 본문 클릭 시 네비게이션.
export default function CheckRow({ title, sub, meta, done = false, count = '0 / 1', ink = false, onToggle, last = false, onReview, reviewFilled = false, reviewOpen = false, onPress }) {
  return (
    <div className={`${styles.row} ${ink ? styles.ink : ''} ${last ? styles.last : ''}`}>
      {onPress ? (
        <>
          <span className={styles.planetIcon}>
            <PlanetIcon size={20} />
          </span>
          <button type="button" className={styles.bodyBtn} onClick={onPress}>
            <span className={styles.title}>{title}</span>
            {sub && <span className={styles.sub}>{sub}</span>}
          </button>
        </>
      ) : (
        <button type="button" className={styles.main} onClick={onToggle} aria-pressed={done}>
          <StarIcon filled={done} size={21} className={styles.star} />
          <span className={styles.body}>
            <span className={styles.titleLine}>
              <span className={styles.title}>{title}</span>
              {meta && <span className={styles.meta}>{meta}</span>}
            </span>
            {sub && <span className={styles.sub}>{sub}</span>}
          </span>
        </button>
      )}
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
        <span className={styles.count}>
          {onPress && <StarIcon filled size={11} className={styles.countStar} />}
          {count}
        </span>
      )}
    </div>
  )
}
