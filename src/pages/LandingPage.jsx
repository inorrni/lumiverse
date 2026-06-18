import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import Wordmark from '../components/ui/Wordmark'
import Button from '../components/ui/Button'
import { Planet, Constellation } from '../components/ui/Celestial'
import { useGoals } from '../store/GoalStore'
import { useAuth } from '../store/AuthStore'
import { useTheme } from '../hooks/useTheme'
import { asset } from '../lib/asset'
import styles from './LandingPage.module.css'

// 1 · 랜딩 — 조립만. 미로그인 → 로그인, 우주 있으면 이어하기, 없으면 모드 선택.
export default function LandingPage() {
  const navigate = useNavigate()
  const { goals } = useGoals()
  const { user } = useAuth()
  const theme = useTheme()
  const isPaper = theme === 'paper'
  const hasUniverse = goals.length > 0
  // 시작 버튼의 다음 행선지: 미로그인→로그인 / 우주 보유→대시보드 / 그 외→모드
  const startTo = !user ? '/login' : hasUniverse ? '/app' : '/mode'

  return (
    <AppScreen padTop={26} seed={isPaper ? 3 : 0} density={isPaper ? 110 : 0}>
      {!isPaper && (
        <div className={styles.bgWrap}>
          <img
            src={asset('assets/bg/onboarding_bg.png')}
            alt=""
            className={styles.bg}
          />
          <div className={styles.textFade} />
        </div>
      )}

      <header className={styles.brand}>
        <Wordmark size={20} sparkle />
      </header>

      <div className={styles.hero}>
        {isPaper && (
          <div className={styles.stage}>
            <Planet size={104} className={styles.planetMain} />
            <Planet size={30} className={styles.planetSmall} />
            <Constellation dim className={styles.constellation} />
            {/* 지평선 위 작은 실루엣 */}
            <div className={styles.horizon}>
              <span className={styles.arc} />
              <span className={styles.silBody} />
              <span className={styles.silDot} />
            </div>
          </div>
        )}

        <h1 className={styles.title}>
          작은 행동들의 여정을 따라<br />점점 더 또렷해지는 우주
        </h1>
        <p className={styles.sub}>당신만의 우주 탐험이 시작됩니다.</p>
      </div>

      <div className={styles.actions}>
        <Button fullWidth onClick={() => navigate(startTo)}>
          {hasUniverse ? '▸ 이어하기' : '▸ 시작하기'}
        </Button>
        {hasUniverse && (
          <Button variant="ghost" fullWidth onClick={() => navigate('/mode')}>
            새 우주 만들기
          </Button>
        )}
      </div>
    </AppScreen>
  )
}
