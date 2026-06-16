import { useParams, useNavigate, Navigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ClarityBar from '../components/ui/ClarityBar'
import CheckRow from '../components/feature/today/CheckRow'
import { Planet, BlackHole } from '../components/ui/Celestial'
import { useGoals } from '../store/GoalStore'
import styles from './PlanetDetailPage.module.css'

const INTENSITY = [{ key: 'gentle', label: '살살' }, { key: 'sparta', label: '스파르타' }]

// 7 · 행성(목표) 상세 (Must 핵심 루프) — 선명도 + 별 체크 + 강도.
export default function PlanetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { goals, toggleStarToday, addStar, setGoalMode } = useGoals()

  const goal = goals.find((g) => g.id === id)
  if (!goal) return <Navigate to="/app" replace />

  const doneToday = goal.steps.filter((s) => s.checkedToday).length

  return (
    <AppScreen padTop={22} seed={51} density={70} nav={<BottomNav />}>
      <BackRow
        label="내 우주" to="/app"
        right={
          <span className={styles.headIcons} aria-hidden="true">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M4 20l1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19z" />
            </svg>
            <BlackHole size={17} />
          </span>
        }
      />

      <div className={styles.hero}>
        <Planet size={92} />
        <div className={styles.name}>{goal.title}</div>
        <div className={styles.meta}>
          {goal.days ? `D-${goal.days}` : '디데이 자유'} · {goal.mode === 'sparta' ? '스파르타모드' : '살살모드'}
        </div>
      </div>

      <div className={styles.clarity}>
        <Kicker>선명도</Kicker>
        <ClarityBar pct={goal.clarity} />
        <span className={styles.clarityPct}>{goal.clarity}%</span>
      </div>

      <div className={styles.starsHead}>
        <Kicker>오늘의 별</Kicker>
        <span className={styles.starsCount}>{doneToday} / {goal.steps.length} 완료</span>
      </div>
      <Card pad="2px 16px" className={styles.list}>
        {goal.steps.map((s, i) => (
          <CheckRow
            key={s.id}
            title={s.title}
            sub={s.detail}
            done={s.checkedToday}
            count={`${s.done}/${s.stars}`}
            onToggle={() => toggleStarToday(goal.id, s.id)}
            last={i === goal.steps.length - 1}
          />
        ))}
      </Card>

      <div className={styles.intensityRow}>
        <Kicker>강도</Kicker>
        <div className={styles.intensity} role="radiogroup" aria-label="강도">
          {INTENSITY.map((m) => (
            <button
              key={m.key}
              type="button"
              role="radio"
              aria-checked={goal.mode === m.key}
              className={`${styles.chip} ${goal.mode === m.key ? styles.chipOn : ''}`}
              onClick={() => setGoalMode(goal.id, m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.spacer} />
      {goal.steps[0] && (
        <Button variant="ghost" fullWidth onClick={() => addStar(goal.id, goal.steps[0].id)}>
          ＋&ensp;별 추가
        </Button>
      )}
    </AppScreen>
  )
}
