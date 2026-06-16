import { useState, useCallback, useRef } from 'react'

// 비동기 호출 상태 관리 훅 — 4상태 UI의 데이터 소스.
// status: 'idle' | 'loading' | 'error' | 'success'
// run(...args) 로 실행. 마지막 호출만 반영(경합 방지).
export function useAsync(fn) {
  const [state, setState] = useState({ status: 'idle', data: null, error: null })
  const fnRef = useRef(fn)
  fnRef.current = fn
  const callId = useRef(0)

  const run = useCallback(async (...args) => {
    const id = ++callId.current
    setState({ status: 'loading', data: null, error: null })
    try {
      const data = await fnRef.current(...args)
      if (id === callId.current) setState({ status: 'success', data, error: null })
      return data
    } catch (error) {
      if (id === callId.current) setState({ status: 'error', data: null, error })
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    callId.current++
    setState({ status: 'idle', data: null, error: null })
  }, [])

  return { ...state, run, reset }
}
