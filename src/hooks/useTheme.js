import { useSyncExternalStore } from 'react'
import { subscribeTheme, getTheme } from '../lib/theme'

// 현재 디자인 테마('ink' | 'paper')를 구독한다. applyTheme 호출 시 리렌더.
export function useTheme() {
  return useSyncExternalStore(subscribeTheme, getTheme, getTheme)
}
