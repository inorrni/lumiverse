import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import TextInput from '../components/ui/TextInput'
import Toggle from '../components/ui/Toggle'
import { StarIcon } from '../components/ui/icons'
import { useAuth } from '../store/AuthStore'
import { useGoals } from '../store/GoalStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { THEME_KEY, applyTheme } from '../lib/theme'
import styles from './SettingsPage.module.css'

function SetRow({ label, children, last = false }) {
  return (
    <div className={`${styles.row} ${last ? styles.last : ''}`}>
      <span className={styles.rowLabel}>{label}</span>
      {children}
    </div>
  )
}

function ThemeSwatch({ label, paper = false, on = false, onSelect }) {
  return (
    <button type="button" className={styles.swatchWrap} onClick={onSelect} aria-pressed={on}>
      <span className={`${styles.swatch} ${paper ? styles.swatchPaper : styles.swatchInk} ${on ? styles.swatchOn : ''}`}>
        {/* 미리보기 색은 활성 테마와 무관하게 고정한다 (먹 스와치 별은 항상 밝게) */}
        <StarIcon size={15} filled style={{ color: paper ? 'var(--paper-ink)' : '#ece9e2' }} />
      </span>
      <span className={`${styles.swatchLabel} ${on ? styles.swatchLabelOn : ''}`}>{label}</span>
    </button>
  )
}

// 11 · 설정 (Could) — 알림 토글·데이터 초기화·로그아웃. MVP 최소 골격.
export default function SettingsPage() {
  const navigate = useNavigate()
  const { user, logout, nickname, updateNickname } = useAuth()
  const { clearGoals } = useGoals()

  // 닉네임 인라인 수정
  const [editNick, setEditNick] = useState(false)
  const [draft, setDraft] = useState('')
  const [nickBusy, setNickBusy] = useState(false)
  const [nickErr, setNickErr] = useState('')
  const startEditNick = () => { setDraft(nickname || ''); setNickErr(''); setEditNick(true) }
  const saveNick = async () => {
    if (!draft.trim()) { setNickErr('닉네임을 입력해 주세요.'); return }
    setNickBusy(true)
    const { error } = await updateNickname(draft)
    setNickBusy(false)
    if (error) { setNickErr('저장하지 못했어요. 다시 시도해 주세요.'); return }
    setEditNick(false)
  }
  const [prefs, setPrefs] = useLocalStorage('lumiverse.settings', {
    todo: true, planet: true, constellation: false,
  })
  const set = (key) => (v) => setPrefs((p) => ({ ...p, [key]: v }))

  // 디자인 테마(먹/갱지) — 선택 즉시 저장하고 <html> 에 반영한다.
  const [theme, setTheme] = useLocalStorage(THEME_KEY, 'ink')
  useEffect(() => { applyTheme(theme) }, [theme])

  const resetData = () => {
    if (window.confirm('내 우주의 모든 목표를 삭제할까요? 되돌릴 수 없어요.')) clearGoals()
  }
  const signOut = () => { logout(); navigate('/') }

  return (
    <AppScreen padTop={22} seed={91} density={45} nav={<BottomNav />}>
      <BackRow />
      <h1 className={styles.title}>설정</h1>

      {user && <p className={styles.account}>{user.email}</p>}

      <Kicker>프로필</Kicker>
      <div className={styles.group}>
        {editNick ? (
          <div className={styles.nickEdit}>
            <TextInput
              label="닉네임"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); if (nickErr) setNickErr('') }}
              error={nickErr}
              maxLength={20}
              autoFocus
            />
            <div className={styles.nickBtns}>
              <Button variant="ghost" onClick={() => setEditNick(false)} disabled={nickBusy}>취소</Button>
              <Button onClick={saveNick} disabled={nickBusy}>{nickBusy ? '저장 중…' : '저장'}</Button>
            </div>
          </div>
        ) : (
          <button className={styles.linkRow} onClick={startEditNick}>
            <span className={styles.rowLabel}>닉네임</span>
            <span className={styles.nickVal}>{nickname || '미설정'}<span className={styles.chevron}>›</span></span>
          </button>
        )}
      </div>

      <Kicker>알림 설정</Kicker>
      <div className={styles.group}>
        <SetRow label="투두 알리미"><Toggle on={prefs.todo} onChange={set('todo')} label="투두 알리미" /></SetRow>
        <SetRow label="행성 활성화 · 또렷"><Toggle on={prefs.planet} onChange={set('planet')} label="행성 활성화 알림" /></SetRow>
        <SetRow label="별자리 생성" last><Toggle on={prefs.constellation} onChange={set('constellation')} label="별자리 생성 알림" /></SetRow>
      </div>

      <Kicker>디자인 · 흑백 + 갱지 프리셋</Kicker>
      <div className={styles.swatches}>
        <ThemeSwatch label="먹 (기본)" on={theme === 'ink'} onSelect={() => setTheme('ink')} />
        <ThemeSwatch label="갱지" paper on={theme === 'paper'} onSelect={() => setTheme('paper')} />
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
