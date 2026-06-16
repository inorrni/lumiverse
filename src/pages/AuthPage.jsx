import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import Wordmark from '../components/ui/Wordmark'
import Kicker from '../components/ui/Kicker'
import TextInput from '../components/ui/TextInput'
import Button from '../components/ui/Button'
import { Spinner } from '../components/ui/DataView'
import { useAuth } from '../store/AuthStore'
import { useGoals } from '../store/GoalStore'
import styles from './AuthPage.module.css'

// 2 · 로그인/가입 (Must) — Supabase Auth. 신규 → 모드 선택 / 기존(우주 보유) → 대시보드.
export default function AuthPage() {
  const navigate = useNavigate()
  const { login, loginWithKakao, user, ready } = useAuth()
  const { goals } = useGoals()
  const [params, setParams] = useSearchParams()
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const afterAuth = () => navigate(goals.length > 0 ? '/app' : '/mode')

  // 카카오 OAuth 복귀(?postLogin=1) — 세션이 붙으면 로그인 화면을 떠나 다음 화면으로.
  useEffect(() => {
    if (!params.has('postLogin')) return
    if (!ready) return // 세션 복원 대기
    if (user) {
      afterAuth()
    } else {
      // 세션이 끝내 안 붙음(취소·미동의 등) — 플래그 정리하고 로그인 폼 노출.
      params.delete('postLogin')
      setParams(params, { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, ready, user])

  // OAuth 복귀 처리 중에는 폼 대신 로딩만 — 랜딩 깜빡임 없이 로그인 화면에서 매끄럽게 이어진다.
  const resolvingOAuth = params.has('postLogin') && (!ready || user)
  if (resolvingOAuth) {
    return (
      <AppScreen padTop={26} seed={11} density={60} dim nebula={false}>
        <header className={styles.brand}>
          <Wordmark size={16} sparkle />
        </header>
        <div className={styles.loading}>
          <Spinner />
          <p className={styles.loadingMsg}>우주로 들어가는 중…</p>
        </div>
      </AppScreen>
    )
  }

  const submit = async (e) => {
    e.preventDefault()
    const v = email.trim()
    if (!/^\S+@\S+\.\S+$/.test(v)) {
      setError('이메일 형식을 확인해 주세요.')
      return
    }
    if (pw.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      return
    }
    setBusy(true)
    const { error: authErr } = await login(v, pw)
    setBusy(false)
    if (authErr) {
      setError('로그인에 실패했어요. 다시 시도해 주세요.')
      return
    }
    afterAuth()
  }

  // 카카오는 OAuth 리다이렉트 — 복귀 후 onAuthStateChange 가 세션을 채운다.
  const kakao = async () => {
    setBusy(true)
    const { error: oErr } = await loginWithKakao()
    if (oErr) { setBusy(false); setError('카카오 로그인을 시작하지 못했어요.') }
  }

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

        <Button type="submit" fullWidth className={styles.cta} disabled={busy}>
          {busy ? '잠시만요…' : <>계속하기&ensp;→</>}
        </Button>

        <div className={styles.divider}>
          <span className={styles.line} />
          <span className={styles.or}>또는</span>
          <span className={styles.line} />
        </div>

        <Button variant="ghost" fullWidth onClick={kakao} disabled={busy}>
          <span className={styles.g}>K</span>카카오로 계속
        </Button>
      </form>
    </AppScreen>
  )
}
