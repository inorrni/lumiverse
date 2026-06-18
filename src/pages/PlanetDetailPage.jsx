import { useParams, useNavigate, Navigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Card from '../components/ui/Card'
import ClarityBar from '../components/ui/ClarityBar'
import CheckRow from '../components/feature/today/CheckRow'
import { Planet, BlackHole } from '../components/ui/Celestial'
import { useGoals } from '../store/GoalStore'
import { useTheme } from '../hooks/useTheme'
import styles from './PlanetDetailPage.module.css'

// SVG 오솔길 트레일 — 대각선 1줄에 달성 노드 4개 (STEP=3)
function Trail({ checkedDays, todayIdx }) {
  const theme = useTheme()
  const total = Math.min((checkedDays || []).length, 30)
  if (!total) return null

  const W = 300, PAD = 18
  const LX = 70, RX = 230
  const R = 7, GR = 12
  const SP = 60   // 대각선 세그먼트당 수직 간격
  const STEP = 3  // 세그먼트당 노드 인덱스 수 (앵커 포함, 다음 앵커 제외)

  const isPaper = theme === 'paper'
  const doneLine   = isPaper ? '#3a2a14' : '#c0c0c0'
  const futureLine = isPaper ? '#7a6a52' : '#999'
  const doneOp   = isPaper ? 0.75 : 0.7
  const futureOp = isPaper ? 0.55 : 0.65

  // 노드 인덱스 → SVG 좌표
  function pos(i) {
    const seg = Math.floor(i / STEP)
    const t = (i % STEP) / STEP
    const fromLeft = seg % 2 === 0
    const ax = fromLeft ? LX : RX
    const bx = fromLeft ? RX : LX
    const ay = PAD + R + seg * SP
    return { x: ax + (bx - ax) * t, y: ay + SP * t }
  }

  const lastPos = pos(total - 1)
  const H = lastPos.y + GR + PAD
  const isAllDone = checkedDays.slice(0, total).every(Boolean)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', overflow: 'visible' }}>
      {/* 연결선 — 오늘 이전은 실선, 이후는 점선 */}
      {Array.from({ length: total - 1 }, (_, i) => {
        const p1 = pos(i), p2 = pos(i + 1)
        const lineIsInPast = todayIdx >= 0 ? i < todayIdx : false
        const lc = lineIsInPast ? doneLine : futureLine
        const lo = lineIsInPast ? doneOp : futureOp
        return (
          <line key={`l${i}`}
            x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y}
            stroke={lc} strokeWidth="2"
            strokeDasharray={lineIsInPast ? '' : '4 3'}
            opacity={lo} />
        )
      })}

      {/* 달성 노드 — 날짜별 달성 여부로 채움/빈 노드 결정 */}
      {Array.from({ length: total }, (_, i) => {
        const isDone = isAllDone || !!checkedDays[i]
        const isCurrent = i === todayIdx && todayIdx >= 0 && !isAllDone
        const isGoal = i === total - 1
        const { x, y } = pos(i)
        const r = isGoal ? GR : R
        const isOnLeft = x < W / 2
        const labelX = isOnLeft ? x - r - 7 : x + r + 7
        const anchor = isOnLeft ? 'end' : 'start'

        return (
          <g key={`n${i}`}>
            {isGoal && (
              <circle cx={x} cy={y} r={r + 5} fill="none"
                stroke={doneLine} strokeWidth="1"
                opacity={isDone ? 0.45 : 0.18} />
            )}
            {isCurrent && (
              <circle cx={x} cy={y} r={r + 4} fill="none"
                stroke="var(--text-primary)" strokeWidth="1" opacity="0.15" />
            )}
            <circle cx={x} cy={y} r={r}
              fill={isDone ? 'var(--text-primary)' : 'var(--surface)'}
              stroke={isDone ? 'none' : isCurrent ? 'var(--text-primary)' : futureLine}
              strokeWidth={isCurrent ? 2 : 1.5}
              strokeDasharray={!isDone && !isCurrent ? '2 2' : ''}
              opacity={!isDone && !isCurrent ? (isGoal ? 0.55 : 0.35) : 1}
            />
            {isDone && (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                fontSize={isGoal ? '10' : '5'} fill="var(--surface)" fontFamily="monospace">
                {isGoal ? '★' : '✦'}
              </text>
            )}
            {!isDone && isGoal && (
              <text x={x} y={y} textAnchor="middle" dominantBaseline="central"
                fontSize="10" fill={futureLine} fontFamily="monospace" opacity="0.5">★</text>
            )}
            {isCurrent && !isGoal && (
              <text x={labelX} y={y} textAnchor={anchor} dominantBaseline="central"
                fontSize="10" fontWeight="bold" fill="var(--text-primary)" fontFamily="sans-serif">
                오늘
              </text>
            )}
            {isGoal && (
              <text x={labelX} y={y} textAnchor={anchor} dominantBaseline="central"
                fontSize="9" fontFamily="sans-serif"
                fill={isDone ? 'var(--text-primary)' : futureLine}
                opacity={isDone ? 1 : 0.6}>
                {isDone ? '완료 ★' : '목표'}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// 7 · 행성(목표) 상세 (Must 핵심 루프) — 선명도 + 별 체크 + 강도.
export default function PlanetDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { goals, toggleStarToday } = useGoals()

  // step ID로 먼저 조회(행성 클릭), 없으면 goal ID로 fallback(은하계 클릭)
  let step = null
  let goal = null
  for (const g of goals) {
    const s = g.steps.find((s) => s.id === id)
    if (s) { step = s; goal = g; break }
  }
  if (!goal) goal = goals.find((g) => g.id === id)
  if (!goal) return <Navigate to="/app" replace />

  const doneToday = goal.steps.filter((s) => s.checkedToday).length

  return (
    <AppScreen padTop={22} seed={51} density={70} nav={<BottomNav />}>
      <BackRow
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
        {step && <Planet size={130} />}
        <div className={styles.name}>{step ? step.title : goal.title}</div>
        <div className={styles.meta}>
          {step
            ? goal.title
            : `${goal.days ? `D-${goal.days}` : '디데이 자유'} · ${goal.mode === 'sparta' ? '스파르타모드' : '살살모드'}`}
        </div>
      </div>

      <div className={styles.clarity}>
        <Kicker>선명도</Kicker>
        <ClarityBar pct={goal.clarity} />
        <span className={styles.clarityPct}>{goal.clarity}%</span>
      </div>

      {step ? (
        <>
          <div className={styles.trailHead}>
            <Kicker>여정</Kicker>
            <span className={styles.trailCount}>{step.done} / {step.stars} 완료</span>
          </div>
          <div className={styles.trail}>
            <Trail
                checkedDays={step.checkedDays.slice(0, 30)}
                todayIdx={step.todayIdx >= 0 && step.todayIdx < 30 ? step.todayIdx : -1}
              />
          </div>
        </>
      ) : (
        <>
          <div className={styles.starsHead}>
            <Kicker>행성</Kicker>
            <span className={styles.starsCount}>{doneToday} / {goal.steps.length} 완료</span>
          </div>
          <Card pad="2px 16px" className={styles.list}>
            {goal.steps.map((s, i) => (
              <CheckRow
                key={s.id}
                title={s.title}
                done={s.checkedToday}
                count={`${s.done}/${s.stars}`}
                onToggle={() => toggleStarToday(goal.id, s.id)}
                onPress={() => navigate(`/app/planet/${s.id}`)}
                last={i === goal.steps.length - 1}
              />
            ))}
          </Card>
        </>
      )}

    </AppScreen>
  )
}
