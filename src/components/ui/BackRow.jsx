import { useNavigate } from 'react-router-dom'
import styles from './BackRow.module.css'

// 뒤로가기 행 molecule — 좌측 back, 우측 슬롯(right).
// to 가 있으면 해당 경로로, 없으면 history back.
export default function BackRow({ label = '뒤로', to, right = null }) {
  const navigate = useNavigate()
  const onBack = () => (to ? navigate(to) : navigate(-1))
  return (
    <div className={styles.row}>
      <button className={styles.back} onClick={onBack} aria-label={`${label}로 이동`}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="15 4 7 12 15 20" />
        </svg>
        <span>{label}</span>
      </button>
      {right}
    </div>
  )
}
