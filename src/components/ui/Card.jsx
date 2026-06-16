import styles from './Card.module.css'

// 카드 atom. variant: hair(반투명 헤어라인, 기본) | paper(갱지 포인트).
// pad 로 패딩 오버라이드, 나머지 스타일은 style 로 합성.
export default function Card({ variant = 'hair', pad, className = '', style, children, ...rest }) {
  const padStyle = pad !== undefined ? { padding: pad } : null

  if (variant === 'paper') {
    return (
      <div className={`${styles.paper} ${className}`} style={{ ...padStyle, ...style }} {...rest}>
        <span className={styles.grain} aria-hidden="true" />
        <div className={styles.content}>{children}</div>
      </div>
    )
  }
  return (
    <div className={`${styles.hair} ${className}`} style={{ ...padStyle, ...style }} {...rest}>
      {children}
    </div>
  )
}
