import { useId } from 'react'
import styles from './TextInput.module.css'
import Kicker from './Kicker'

// 입력 molecule — 라벨(Kicker) + 실제 <input>/<textarea> + 에러 메시지.
// 접근성: label htmlFor 연결, 에러 시 aria-invalid/aria-describedby.
export default function TextInput({
  label,
  error,
  multiline = false,
  right = null,
  id,
  className = '',
  ...rest
}) {
  const autoId = useId()
  const inputId = id || autoId
  const errId = `${inputId}-err`
  const Tag = multiline ? 'textarea' : 'input'

  return (
    <div className={`${styles.field} ${className}`}>
      {label && (
        <label htmlFor={inputId}>
          <Kicker>{label}</Kicker>
        </label>
      )}
      <div className={`${styles.wrap} ${error ? styles.invalid : ''}`}>
        <Tag
          id={inputId}
          className={`${styles.input} ${multiline ? styles.area : ''}`}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errId : undefined}
          {...rest}
        />
        {right && <span className={styles.right}>{right}</span>}
      </div>
      {error && <span id={errId} className={styles.errorText}>{error}</span>}
    </div>
  )
}
