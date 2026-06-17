// 디자인 테마(먹/갱지) 적용 유틸. <html> 의 data-theme 속성 하나로
// tokens.css 의 의미 토큰을 오버라이드한다. 설정 › 디자인에서 전환한다.
// 저장 형식은 useLocalStorage 와 동일하게 JSON 문자열("ink"/"paper").
//
// 컴포넌트가 테마에 반응할 수 있도록(예: 배경 이미지 교체) 작은 구독 스토어를
// 겸한다 — useTheme() 훅이 useSyncExternalStore 로 여기에 붙는다.
export const THEME_KEY = 'lumiverse.theme'

const listeners = new Set()
let current = 'ink'

export function getStoredTheme() {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw !== null ? JSON.parse(raw) : 'ink'
  } catch {
    return 'ink'
  }
}

export function applyTheme(theme) {
  const t = theme === 'paper' ? 'paper' : 'ink'
  current = t
  document.documentElement.setAttribute('data-theme', t)
  listeners.forEach((l) => l())
}

// ── 구독 스토어 (useTheme 용) ──
export function getTheme() {
  return current
}

export function subscribeTheme(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
