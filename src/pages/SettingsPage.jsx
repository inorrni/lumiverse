import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import Toggle from '../components/ui/Toggle'
import { StarIcon } from '../components/ui/icons'
import { useAuth } from '../store/AuthStore'
import { useGoals } from '../store/GoalStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import styles from './SettingsPage.module.css'

function SetRow({ label, children, last = false }) {
  return (
    <div className={`${styles.row} ${last ? styles.last : ''}`}>
      <span className={styles.rowLabel}>{label}</span>
      {children}
    </div>
  )
}

function ThemeSwatch({ label, paper = false, on = false }) {
  return (
    <div className={styles.swatchWrap}>
      <span className={`${styles.swatch} ${paper ? styles.swatchPaper : styles.swatchInk} ${on ? styles.swatchOn : ''}`}>
        <StarIcon size={15} filled style={{ color: paper ? 'var(--paper-ink)' : 'var(--text-hi)' }} />
      </span>
      <span className={`${styles.swatchLabel} ${on ? styles.swatchLabelOn : ''}`}>{label}</span>
    </div>
  )
}

// 11 · 설정 (Could) — 알림 토글·데이터 초기화·로그아웃. MVP 최소 골격.
export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { clearGoals } = useGoals()
  const [prefs, setPrefs] = useLocalStorage('lumiverse.settings', {
    todo: true, planet: true, constellation: false,
  })
  const set = (key) => (v) => setPrefs((p) => ({ ...p, [key]: v }))

  const resetData = () => {
    if (window.confirm('내 우주의 모든 목표를 삭제할까요? 되돌릴 수 없어요.')) clearGoals()
  }
  const signOut = () => { logout(); navigate('/') }

  return (
    <AppScreen padTop={22} seed={91} density={45} dim nav={<BottomNav />}>
      <BackRow label="내 우주" to="/app" />
      <h1 className={styles.title}>설정</h1>

      {user && <p className={styles.account}>{user.email}</p>}

      <Kicker>알림 설정</Kicker>
      <div className={styles.group}>
        <SetRow label="투두 알리미"><Toggle on={prefs.todo} onChange={set('todo')} label="투두 알리미" /></SetRow>
        <SetRow label="행성 활성화 · 또렷"><Toggle on={prefs.planet} onChange={set('planet')} label="행성 활성화 알림" /></SetRow>
        <SetRow label="별자리 생성" last><Toggle on={prefs.constellation} onChange={set('constellation')} label="별자리 생성 알림" /></SetRow>
      </div>

      <Kicker>디자인 · 흑백 + 갱지 프리셋</Kicker>
      <div className={styles.swatches}>
        <ThemeSwatch label="먹 (기본)" on />
        <ThemeSwatch label="갱지" paper />
      </div>

      <Kicker>일반</Kicker>
      <div className={styles.group}>
        <button className={styles.linkRow} onClick={resetData}>
          <span className={styles.rowLabel}>데이터 초기화</span>
          <span className={styles.chevron}>›</span>
        </button>
        <SetRow label="정보" last>
          <span className={styles.version}>v1.0.0</span>
        </SetRow>
      </div>

      <div className={styles.spacer} />
      <Button variant="ghost" fullWidth onClick={signOut}>로그아웃</Button>
    </AppScreen>
  )
}
