import { useNavigate } from 'react-router-dom'
import styles from './BackRow.module.css'

// 뒤로가기 행 molecule — 좌측 back, 우측 슬롯(right).
// onClick 이 있으면 그걸, 없으면 to(state 동반) 또는 history back.
export default function BackRow({ label, to, state, right = null, onClick }) {
  const navigate = useNavigate()
  const onBack = onClick ? onClick : () => (to ? navigate(to, { state }) : navigate(-1))
  return (
    <div className={styles.row}>
      <button className={styles.back} onClick={onBack} aria-label={label ? `${label}로 이동` : '뒤로 가기'}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 4 7 12 15 20" />
        </svg>
        {label && <span>{label}</span>}
      </button>
      {right}
    </div>
  )
}
