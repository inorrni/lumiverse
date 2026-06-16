import { createContext, useContext, useState, useCallback, useEffect } from 'react'

// 인증 — 지금은 mock(로컬). 추후 Supabase Auth 로 교체(인터페이스 유지).
const STORAGE_KEY = 'lumiverse.auth'
const AuthContext = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(load)

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* 무시 */
    }
  }, [user])

  // 이메일 로그인(mock) — 이메일 앞부분을 이름으로 쓴다.
  const login = useCallback((email) => {
    const name = (email || '').split('@')[0] || 'stargazer'
    setUser({ email, name, provider: 'email' })
  }, [])

  const loginWithGoogle = useCallback(() => {
    setUser({ email: 'stargazer@gmail.com', name: 'stargazer', provider: 'google' })
  }, [])

  const logout = useCallback(() => setUser(null), [])

  return (
    <AuthContext.Provider value={{ user, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
