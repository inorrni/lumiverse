import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// 인증 — Supabase Auth(JWT). 세션은 supabase-js 가 localStorage 에 보관·복원한다.
// 노출 인터페이스(user / login / loginWithKakao / logout)는 기존 mock 과 호환 유지.
const AuthContext = createContext(null)

// Supabase 세션 → 앱이 쓰는 user shape({ id, email, name, provider }) 로 정규화.
function toUser(session) {
  const u = session?.user
  if (!u) return null
  const meta = u.user_metadata ?? {}
  const name = meta.name || meta.full_name || (u.email || '').split('@')[0] || 'stargazer'
  return {
    id: u.id,
    email: u.email ?? '',
    name,
    provider: u.app_metadata?.provider ?? 'email',
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false) // 최초 세션 복원 완료 여부

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setUser(toUser(data.session))
      setReady(true)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toUser(session))
    })
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // 이메일 로그인 — 없는 계정이면 가입으로 폴백(단일 "계속하기" UX).
  // 반환: { error } (성공 시 error=null). 호출부에서 메시지 표시.
  const login = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (!error) return { error: null }
    // 자격 증명 불일치 = 미가입으로 보고 가입 시도.
    if (/invalid login credentials/i.test(error.message)) {
      const { error: signUpErr } = await supabase.auth.signUp({ email, password })
      return { error: signUpErr ?? null }
    }
    return { error }
  }, [])

  // 카카오 OAuth — 호스팅 Auth 에서 Kakao provider 활성화 필요.
  const loginWithKakao = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: window.location.origin + import.meta.env.BASE_URL },
    })
    return { error }
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, ready, login, loginWithKakao, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>')
  return ctx
}
