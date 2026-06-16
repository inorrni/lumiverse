import styles from './RadioRow.module.css'

// 라디오 행 molecule — 선택형. label + sub, 선택 시 채워진 점.
export default function RadioRow({ label, sub, selected = false, onSelect, last = false }) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`${styles.row} ${last ? styles.last : ''}`}
      onClick={onSelect}
    >
      <span className={`${styles.dot} ${selected ? styles.on : ''}`}>
        {selected && <span className={styles.fill} />}
      </span>
      <span className={`${styles.label} ${selected ? styles.labelOn : ''}`}>{label}</span>
      {sub && <span className={styles.sub}>{sub}</span>}
    </button>
  )
}
