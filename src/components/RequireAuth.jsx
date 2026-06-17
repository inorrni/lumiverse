import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../store/AuthStore'

// 인증 가드 — 세션 복원(ready) 전엔 판단을 보류(깜빡 리다이렉트 방지),
// 미로그인이면 /login 으로 보낸다. 레이아웃 라우트(<Outlet/>) 와 래퍼 모두 지원.
export default function RequireAuth({ children }) {
  const { user, ready, nickname, profileReady } = useAuth()
  const location = useLocation()
  if (!ready) return null // 세션 복원 중: 아직 판단하지 않는다
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />
  // 닉네임 미설정(신규 가입)이면 /welcome 으로. 프로필 조회 전엔 보류(깜빡 방지).
  if (profileReady && !nickname && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />
  }
  return children ?? <Outlet />
}
