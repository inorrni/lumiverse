import { Planet } from '../../ui/Celestial'
import styles from './PlanetRow.module.css'

// 행성(세부목표) 한 줄 — AI 분해 결과 편집용. 이름 인라인 수정 + 삭제.
export default function PlanetRow({ planet, editing, onTitleChange, onEditToggle, onDelete, last }) {
  return (
    <div className={`${styles.row} ${last ? styles.last : ''}`}>
      <Planet size={34} />
      <div className={styles.body}>
        {editing ? (
          <input
            className={styles.edit}
            value={planet.title}
            autoFocus
            maxLength={24}
            onChange={(e) => onTitleChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onEditToggle() }}
            onBlur={onEditToggle}
            aria-label="행성 이름 수정"
          />
        ) : (
          <div className={styles.name}>{planet.title}</div>
        )}
        <div className={styles.desc}>{planet.detail} · 별 {planet.stars}개</div>
      </div>
      <div className={styles.actions}>
        <button className={styles.icon} onClick={onEditToggle} aria-label="이름 수정">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" aria-hidden="true">
            <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" />
          </svg>
        </button>
        <button className={styles.icon} onClick={onDelete} aria-label="행성 삭제">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="1.5" aria-hidden="true">
            <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  )
}
