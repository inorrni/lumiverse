import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import LandingPage from './pages/LandingPage'
import AuthPage from './pages/AuthPage'
import ModePage from './pages/ModePage'
import GoalInputPage from './pages/GoalInputPage'
import AiBreakdownPage from './pages/AiBreakdownPage'
import DashboardPage from './pages/DashboardPage'
import TodayPage from './pages/TodayPage'
import PlanetDetailPage from './pages/PlanetDetailPage'
import SettingsPage from './pages/SettingsPage'
import ComingSoonPage from './pages/ComingSoonPage'

// 디자인 캔버스(목업 11화면)는 무겁고 개발용이라 지연 로드한다.
const DesignCanvasApp = lazy(() => import('./sample/DesignCanvasApp'))

export default function App() {
  return (
    <Routes>
      {/* 온보딩: 랜딩 → 로그인 → 모드 → 목표 → AI분해 */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<AuthPage />} />
      <Route path="/mode" element={<ModePage />} />
      <Route path="/goal" element={<GoalInputPage />} />
      <Route path="/breakdown" element={<AiBreakdownPage />} />

      {/* 메인 앱 (하단 탭) + 핵심 루프 */}
      <Route path="/app" element={<DashboardPage />} />
      <Route path="/app/today" element={<TodayPage />} />
      <Route path="/app/planet/:id" element={<PlanetDetailPage />} />
      <Route path="/app/settings" element={<SettingsPage />} />
      {/* Should — 추후 구현 */}
      <Route path="/app/blackhole" element={<ComingSoonPage title="블랙홀 — 준비 중" />} />
      <Route path="/app/check" element={<ComingSoonPage title="AI 점검 — 준비 중" />} />

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
