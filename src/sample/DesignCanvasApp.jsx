// 디자인 레퍼런스 — 11개 화면 시안을 Figma식 캔버스로 한눈에 본다.
// 실제 앱이 아니라 "보기용" 목업이다. 실 동작 앱은 src/pages/ 에 있고,
// 이 캔버스는 라우터의 /design 경로에서 열린다.
import { DesignCanvas, DCSection, DCArtboard } from './design-canvas'
import ScrLanding from './screens/ScrLanding'
import ScrAuth from './screens/ScrAuth'
import ScrMode from './screens/ScrMode'
import ScrGoalInput from './screens/ScrGoalInput'
import ScrAiBreakdown from './screens/ScrAiBreakdown'
import ScrDashboard from './screens/ScrDashboard'
import ScrPlanetDetail from './screens/ScrPlanetDetail'
import ScrToday from './screens/ScrToday'
import ScrMidCheck from './screens/ScrMidCheck'
import ScrBlackhole from './screens/ScrBlackhole'
import ScrSettings from './screens/ScrSettings'

export default function DesignCanvasApp() {
  return (
    <DesignCanvas>
      <DCSection id="onboarding" title="온보딩" subtitle="첫 실행 플로우 1~5">
        <DCArtboard id="landing"   label="1 · 랜딩"      width={375} height={812}><ScrLanding /></DCArtboard>
        <DCArtboard id="auth"      label="2 · 로그인"     width={375} height={812}><ScrAuth /></DCArtboard>
        <DCArtboard id="mode"      label="3 · 모드 선택"  width={375} height={812}><ScrMode /></DCArtboard>
        <DCArtboard id="goal"      label="4 · 목표 입력"  width={375} height={812}><ScrGoalInput /></DCArtboard>
        <DCArtboard id="ai"        label="5 · AI 분해"    width={375} height={812}><ScrAiBreakdown /></DCArtboard>
      </DCSection>
      <DCSection id="main" title="메인 앱" subtitle="대시보드 ~ 설정 6~11">
        <DCArtboard id="dashboard" label="6 · 대시보드"   width={375} height={812}><ScrDashboard /></DCArtboard>
        <DCArtboard id="planet"    label="7 · 행성 상세"  width={375} height={812}><ScrPlanetDetail /></DCArtboard>
        <DCArtboard id="today"     label="8 · 오늘 투두"  width={375} height={812}><ScrToday /></DCArtboard>
        <DCArtboard id="midcheck"  label="9 · AI 중간점검" width={375} height={812}><ScrMidCheck /></DCArtboard>
        <DCArtboard id="blackhole" label="10 · 블랙홀"    width={375} height={812}><ScrBlackhole /></DCArtboard>
        <DCArtboard id="settings"  label="11 · 설정"      width={375} height={812}><ScrSettings /></DCArtboard>
      </DCSection>
    </DesignCanvas>
  )
}
