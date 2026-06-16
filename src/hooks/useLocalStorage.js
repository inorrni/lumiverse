import { useState, useEffect } from 'react'

// localStorage 에 영속되는 상태 훅 (설정 토글 등).
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw !== null ? JSON.parse(raw) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* 무시 */
    }
  }, [key, value])

  return [value, setValue]
}
