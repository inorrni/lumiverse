import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import ClarityBar from '../components/ui/ClarityBar'
import { EmptyView } from '../components/ui/DataView'
import { Sparkle } from '../components/ui/icons'
import { Planet } from '../components/ui/Celestial'
import CheckGoalMenu from '../components/feature/check/CheckGoalMenu'
import { useGoals } from '../store/GoalStore'
import { computeMidCheck, STATE_META, VERDICT_META } from '../lib/midcheck'
import { fetchMidCheck } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { friendlyError } from '../lib/errors'
import styles from './MidCheckPage.module.css'

// 9 · AI 중간점검 — 목표별. §5-3 상태 레이블 판단 + 전체 진행률 + 보완/마무리 액션.
export default function MidCheckPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { goals, historyOf, saveMidCheck, blackholePlanet, addPlanet, removeGoal } = useGoals()
  const goal = goals.find((g) => g.id === id)

  const mc = goal ? computeMidCheck(historyOf(id)) : null
  const stateMeta = mc ? STATE_META[mc.state] : null
  const verdictMeta = mc ? VERDICT_META[mc.verdict] : null
  const { status, data, error, run } = useAsync(fetchMidCheck)

  const [mode, setMode] = useState('result') // result | supplement | finishing
  const [keep, setKeep] = useState(() => new Set())
  const [addRec, setAddRec] = useState(true)
  const savedRef = useRef(false)

  const runCheck = () => {
    if (!goal || !mc) return
    run({
      goalName: goal.title,
      intensity: goal.intensity,
      state: mc.state,
      verdict: mc.verdict,
      stats: {
        completionPct: mc.completionPct,
        overallPct: goal.clarity,
        daysTracked: mc.daysTracked,
        streak: mc.streak,
        failStreak: mc.failStreak,
      },
      samples: mc.samples.map((s) => ({ title: s.title, review: s.review, done: s.done })),
      existingPlanets: goal.steps.map((s) => s.title),
    }).catch(() => {})
  }

  // 마운트/상태 변화 시 1회 호출 + 기존 행성 전체 유지로 초기화
  useEffect(() => {
    if (!goal || !mc?.state) return
    savedRef.current = false
    setKeep(new Set(goal.steps.map((s) => s.id)))
    runCheck()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, mc?.state, mc?.verdict])

  // 성공 시 1회 결과 저장
  useEffect(() => {
    if (status !== 'success' || savedRef.current || !goal || !mc) return
    savedRef.current = true
    saveMidCheck(goal.id, {
      state: mc.state,
      verdict: mc.verdict,
      reason: data?.reason,
      message: data?.message,
      completionPct: mc.completionPct,
      overallPct: goal.clarity,
      streak: mc.streak,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  if (!goal) {
    return (
      <AppScreen padTop={20} seed={71} nav={<BottomNav />}>
        <EmptyView
          title="목표를 찾을 수 없어요"
          message="대시보드에서 목표를 골라 점검해 보세요."
          action={<Button onClick={() => navigate('/app')}>내 우주로</Button>}
        />
      </AppScreen>
    )
  }

  // 마무리(폭파) 진행 중 — 애니메이션 후 은하 블랙홀 보관
  const startFinish = () => {
    setMode('finishing')
    setTimeout(async () => {
      await removeGoal(goal.id)
      navigate('/app')
    }, 1300)
  }

  if (mode === 'finishing') {
    return (
      <AppScreen padTop={22} seed={71} density={40} nav={<BottomNav />}>
        <div className={styles.boom}>
          <div className={styles.boomCore}>
            <Planet size={64} />
          </div>
          {[...Array(8)].map((_, i) => (
            <Sparkle key={i} size={10} className={styles.boomSpark} style={{ '--i': i }} />
          ))}
          <p className={styles.boomMsg}>{goal.title}을(를) 블랙홀로 보냈어요.</p>
        </div>
      </AppScreen>
    )
  }

  // 보완 선택 뷰 — 기존 행성 유지 체크 + 추천 행성 추가
  if (mode === 'supplement') {
    const rec = data?.recommendation
    const toggleKeep = (pid) =>
      setKeep((prev) => {
        const n = new Set(prev)
        n.has(pid) ? n.delete(pid) : n.add(pid)
        return n
      })
    // 유지할 행성이 하나도 없고 추천도 안 넣으면 빈 은하가 남음 — 막는다.
    const willHaveNone = keep.size === 0 && !(rec && addRec)
    const confirm = async () => {
      if (willHaveNone) return
      const drop = goal.steps.filter((s) => !keep.has(s.id))
      for (const s of drop) await blackholePlanet(goal.id, s.id)
      if (rec && addRec) await addPlanet(goal.id, { name: rec.name, symbol: rec.symbol, todo_pattern: rec.todo_pattern })
      navigate('/app')
    }
    return (
      <AppScreen padTop={22} seed={71} density={60} nav={<BottomNav />}>
        <BackRow label="점검 결과" onClick={() => setMode('result')} right={<Kicker>{goal.title}</Kicker>} />
        <Kicker>SUPPLEMENT</Kicker>
        <h1 className={styles.title}>목표 보완하기</h1>
        <p className={styles.lead}>이어갈 행성만 남기고, 점검 추천을 더해요. 해제한 행성은 블랙홀에 보관돼요.</p>

        <Kicker>기존 행성</Kicker>
        <Card variant="paper" pad="4px 16px" className={styles.list}>
          {goal.steps.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`${styles.pick} ${keep.has(s.id) ? styles.pickOn : ''} ${i === goal.steps.length - 1 ? styles.pickLast : ''}`}
              onClick={() => toggleKeep(s.id)}
              aria-pressed={keep.has(s.id)}
            >
              <span className={styles.pickBox}>{keep.has(s.id) ? '✓' : ''}</span>
              <span className={styles.pickBody}>
                <span className={styles.pickTitle}>{s.symbol ? `${s.symbol} ` : ''}{s.title}</span>
                <span className={styles.pickSub}>별 {s.stars}개 · {s.done}개 완료</span>
              </span>
              <span className={styles.pickState}>{keep.has(s.id) ? '유지' : '블랙홀'}</span>
            </button>
          ))}
        </Card>

        {rec && (
          <>
            <Kicker>점검 추천 행성</Kicker>
            <Card pad="4px 16px" className={styles.list}>
              <button
                type="button"
                className={`${styles.pick} ${addRec ? styles.pickOn : ''} ${styles.pickLast}`}
                onClick={() => setAddRec((v) => !v)}
                aria-pressed={addRec}
              >
                <span className={styles.pickBox}>{addRec ? '✓' : ''}</span>
                <span className={styles.pickBody}>
                  <span className={styles.pickTitle}>{rec.symbol ? `${rec.symbol} ` : ''}{rec.name}</span>
                  <span className={styles.pickSub}>{(rec.todo_pattern || []).map((t) => t.title).join(' · ') || '추천 투두'}</span>
                </span>
                <span className={styles.pickState}>{addRec ? '추가' : '안 함'}</span>
              </button>
            </Card>
          </>
        )}

        <div className={styles.spacer} />
        {willHaveNone && <p className={styles.failNote}>이어갈 행성을 하나 이상 남기거나 추천을 추가해 주세요.</p>}
        <Button fullWidth onClick={confirm} disabled={willHaveNone}>보완 적용하기&ensp;▸</Button>
        <Button variant="ghost" fullWidth onClick={() => setMode('result')} style={{ marginTop: 8 }}>돌아가기</Button>
      </AppScreen>
    )
  }

  // 결과 뷰
  const loading = status === 'loading' || status === 'idle'
  const failed = status === 'error'
  const reason = data?.reason || verdictMeta.fallbackReason
  const message = data?.message || verdictMeta.fallbackMessage
  const isAtRisk = mc.state === 'at_risk'
  const isSupplement = mc.verdict === 'supplement'

  return (
    <AppScreen padTop={22} seed={71} density={70} nav={<BottomNav />}>
      <BackRow right={<Kicker>{goal.title}</Kicker>} />
      <Kicker>MID-CHECK</Kicker>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>중간점검 결과</h1>
        <CheckGoalMenu goals={goals} value={goal.id} />
      </div>

      {/* 상태 레이블 + 전체 진행률 */}
      <div className={styles.stateRow}>
        <span className={styles.stateLabel}>{stateMeta.label}</span>
        <span className={styles.progressPct}>전체 진행률 {goal.clarity}%</span>
      </div>
      <ClarityBar pct={goal.clarity} />

      {loading ? (
        <Card className={styles.loadingCard}>
          <Sparkle size={14} className={styles.spark} />
          <p className={styles.loadingMsg}>당신의 별을 읽는 중… ✦</p>
        </Card>
      ) : (
        <>
          <Card variant="paper" pad="18px 18px" className={styles.resultCard}>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>{verdictMeta.badge}</span>
              <span className={styles.badgeTitle}>{stateMeta.label}</span>
            </div>
            <div className={styles.grid}>
              <Kicker>판단</Kicker>
              <span className={styles.verdict}>
                {verdictMeta.label} <span className={styles.verdictHint}>({verdictMeta.hint})</span>
              </span>
              <Kicker>이유</Kicker>
              <span className={styles.reason}>{reason}</span>
            </div>
          </Card>

          <div className={styles.coachRow}>
            <div className={styles.coachPlanet}>
              <Planet size={46} />
              <Sparkle size={8} className={styles.coachSpark} />
            </div>
            <div className={styles.bubble}>
              {message}
              <div className={styles.coachName}>— 항해사</div>
            </div>
          </div>

          {failed && (
            <p className={styles.failNote}>
              {friendlyError(error)} <button className={styles.retry} onClick={runCheck}>다시 시도</button>
            </p>
          )}
        </>
      )}

      <div className={styles.spacer} />

      {/* 액션 — verdict/state 별 (로딩 중엔 숨김) */}
      {!loading &&
        (isAtRisk ? (
          <div className={styles.actions}>
            <Button fullWidth onClick={() => setMode('supplement')}>보완하기</Button>
            <Button variant="ghost" fullWidth onClick={startFinish}>마무리하기</Button>
          </div>
        ) : isSupplement ? (
          <Button fullWidth onClick={() => setMode('supplement')}>목표 보완하기&ensp;▸</Button>
        ) : (
          <Button fullWidth onClick={() => navigate('/app')}>목표 진행하기&ensp;▸</Button>
        ))}
    </AppScreen>
  )
}
