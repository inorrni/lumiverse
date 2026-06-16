import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import Wordmark from '../components/ui/Wordmark'
import Kicker from '../components/ui/Kicker'
import TextInput from '../components/ui/TextInput'
import Button from '../components/ui/Button'
import { useAuth } from '../store/AuthStore'
import { useGoals } from '../store/GoalStore'
import styles from './AuthPage.module.css'

// 2 · 로그인/가입 (Must) — mock 인증. 신규 → 모드 선택 / 기존(우주 보유) → 대시보드.
export default function AuthPage() {
  const navigate = useNavigate()
  const { login, loginWithGoogle } = useAuth()
  const { goals } = useGoals()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')

  const afterAuth = () => navigate(goals.length > 0 ? '/app' : '/mode')

  const submit = (e) => {
    e.preventDefault()
    const v = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(v)) {
      setError('이메일 형식을 확인해 주세요.')
      return
    }
    login(v)
    afterAuth()
  }

  const google = () => { loginWithGoogle(); afterAuth() }

  return (
    <AppScreen padTop={26} seed={11} density={60} dim nebula={false}>
      <header className={styles.brand}>
        <Wordmark size={16} sparkle />
      </header>

      <form className={styles.body} onSubmit={submit}>
        <Kicker>SIGN IN</Kicker>
        <h1 className={styles.title}>탐험가의 이름으로<br />로그인하세요</h1>

        <div className={styles.fields}>
          <TextInput
            label="이메일" type="email" inputMode="email" placeholder="stargazer@lumiverse.kr"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (error) setError('') }}
            error={error}
            autoFocus
          />
          <TextInput
            label="비밀번호" type="password" placeholder="••••••••"
            value={pw} onChange={(e) => setPw(e.target.value)}
          />
        </div>

        <Button type="submit" fullWidth className={styles.cta}>계속하기&ensp;→</Button>

        <div className={styles.divider}>
          <span className={styles.line} />
          <span className={styles.or}>또는</span>
          <span className={styles.line} />
        </div>

        <Button variant="ghost" fullWidth onClick={google}>
          <span className={styles.g}>G</span>Google로 계속
        </Button>
      </form>
    </AppScreen>
  )
}
