import { useState, useEffect } from 'react'
import styles from './ReviewField.module.css'

// 한 줄 회고 입력 — 별 아래에 노출(체크 무관). blur/Enter 시 저장(변경된 경우만).
export default function ReviewField({ initial, onSave, autoFocus }) {
  const [text, setText] = useState(initial || '')
  useEffect(() => { setText(initial || '') }, [initial])
  const commit = () => {
    if ((text || '').trim() !== (initial || '').trim()) onSave(text)
  }
  return (
    <input
      className={styles.reviewInput}
      type="text"
      value={text}
      maxLength={60}
      autoFocus={autoFocus}
      placeholder="한 줄 회고 — 오늘 어땠나요?"
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
    />
  )
}
