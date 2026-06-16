import styles from './Wordmark.module.css'
import { Sparkle } from './icons'

// 브랜드 워드마크 atom. sparkle 옵션으로 옆에 반짝임을 붙인다.
export default function Wordmark({ size = 19, sparkle = false, style }) {
  return (
    <span className={styles.row} style={style}>
      <span className={styles.mark} style={{ fontSize: size }}>LUMIVERSE</span>
      {sparkle && <Sparkle size={Math.round(size * 0.55)} />}
    </span>
  )
}
