import styles from './Button.module.css'

// 버튼 atom. variant: primary(갱지 솔리드) | ghost(보더) | dim.
// aria-* 등 추가 속성은 ...rest 로 통과시킨다.
export default function Button({
  variant = 'primary',
  fullWidth = false,
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const cls = [styles.btn, styles[variant], fullWidth && styles.fullWidth, className]
    .filter(Boolean)
    .join(' ')
  return (
    <button type={type} className={cls} {...rest}>
      {children}
    </button>
  )
}
