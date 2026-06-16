import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import RequireAuth from './components/RequireAuth'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ModePage from './pages/ModePage'
import GoalInputPage from './pages/GoalInputPage'
import PlanPage from './pages/PlanPage'
import DashboardPage from './pages/DashboardPage'
import TodayPage from './pages/TodayPage'
import UniversePage from './pages/UniversePage'
import PlanetDetailPage from './pages/PlanetDetailPage'
import SettingsPage from './pages/SettingsPage'
import ComingSoonPage from './pages/ComingSoonPage'

// 디자인 캔버스(목업 11화면)는 무겁고 개발용이라 지연 로드한다.
const DesignCanvasApp = lazy(() => import('./sample/DesignCanvasApp'))

export default function App() {
  return (
    <Routes>
      {/* 공개: 랜딩 → 로그인 */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />

      {/* 보호 라우트 — 세션 없으면 /login 으로. (온보딩 + 메인 앱) */}
      <Route element={<RequireAuth />}>
        {/* 온보딩: 모드 → 목표 → 경로 설계(AI분해 또는 직접입력) */}
        <Route path="/mode" element={<ModePage />} />
        <Route path="/goal" element={<GoalInputPage />} />
        <Route path="/plan" element={<PlanPage />} />

        {/* 메인 앱 (하단 탭) + 핵심 루프 */}
        <Route path="/app" element={<DashboardPage />} />
        <Route path="/app/today" element={<TodayPage />} />
        <Route path="/app/universe" element={<UniversePage />} />
        <Route path="/app/planet/:id" element={<PlanetDetailPage />} />
        <Route path="/app/settings" element={<SettingsPage />} />
        {/* Should — 추후 구현 */}
        <Route path="/app/blackhole" element={<ComingSoonPage title="블랙홀 — 준비 중" />} />
        <Route path="/app/check" element={<ComingSoonPage title="중간 점검 — 준비 중" />} />
      </Route>

      {/* 디자인 레퍼런스 캔버스 */}
      <Route
        path="/design"
        element={
          <Suspense fallback={null}>
            <DesignCanvasApp />
          </Suspense>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
