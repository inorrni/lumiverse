import styles from './Kicker.module.css'

// 라벨/구분 텍스트 atom (모노 대문자). tone 으로 명도만 바꾼다.
export default function Kicker({ tone, className = '', style, children }) {
  const cls = [styles.kicker, tone && styles[tone], className].filter(Boolean).join(' ')
  return <div className={cls} style={style}>{children}</div>
}
