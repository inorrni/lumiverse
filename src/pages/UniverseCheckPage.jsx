import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { EmptyView } from '../components/ui/DataView'
import { Sparkle } from '../components/ui/icons'
import { Planet } from '../components/ui/Celestial'
import { useGoals } from '../store/GoalStore'
import { computeMidCheck } from '../lib/midcheck'
import { fetchSelfInsight } from '../lib/api'
import { useAsync } from '../hooks/useAsync'
import { friendlyError } from '../lib/errors'
import styles from './UniverseCheckPage.module.css'

function ChipSection({ title, items }) {
  if (!items || items.length === 0) return null
  return (
    <section className={styles.section}>
      <Kicker>{title}</Kicker>
      <div className={styles.chips}>
        {items.map((t, i) => (
          <span key={`${t}-${i}`} className={styles.chip}>{t}</span>
        ))}
      </div>
    </section>
  )
}

// 점검 탭 — 내 우주 전체를 읽어 "나"를 안내하는 읽기 전용 인사이트.
export default function UniverseCheckPage() {
  const navigate = useNavigate()
  const { goals, historyOf } = useGoals()
  const { status, data, error, run } = useAsync(fetchSelfInsight)

  // 전체 집계 — 목표별 전체 내용(세부목표·상태·완료율·한줄평) + 합계 + 평균 진행률.
  // LLM 이 모든 목표를 가로질러 종합 판단하도록 목표 단위로 내용을 싣는다.
  const agg = useMemo(() => {
    const goalStats = goals.map((g) => {
      const h = historyOf(g.id)
      const mc = computeMidCheck(h)
      return {
        name: g.title,
        intensity: g.intensity,
        state: mc.state,
        completion_pct: mc.completionPct,
        sub_goals: g.steps.map((s) => s.title),
        reviews: h.filter((s) => s.review).map((s) => s.review),
      }
    })
    const doneStars = goals.reduce((n, g) => n + g.starsEarned, 0)
    const totalStars = goals.reduce((n, g) => n + g.stars, 0)
    const reviewCount = goalStats.reduce((n, g) => n + g.reviews.length, 0)
    const avgClarity = goals.length ? Math.round(goals.reduce((n, g) => n + g.clarity, 0) / goals.length) : 0
    return {
      goalStats,
      reviewCount,
      totals: { goals: goals.length, done_stars: doneStars, total_stars: totalStars },
      avgClarity,
    }
  }, [goals, historyOf])

  // 데이터가 의미있게 바뀔 때만 재호출(불필요 렌더로 재호출 방지)
  const sig = `${agg.goalStats.length}|${agg.reviewCount}|${agg.totals.done_stars}`
  useEffect(() => {
    if (goals.length === 0) return
    run({ goals: agg.goalStats, totals: agg.totals }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig])

  if (goals.length === 0) {
    return (
      <AppScreen padTop={20} seed={71} nav={<BottomNav />}>
        <EmptyView
          title="아직 읽어줄 우주가 없어요"
          message="첫 목표를 만들고 별을 채우면, 너의 우주를 읽어 줄게요."
          action={<Button onClick={() => navigate('/mode')}>✦&ensp;첫 목표 만들기</Button>}
        />
      </AppScreen>
    )
  }

  const loading = status === 'loading' || status === 'idle'
  const failed = status === 'error'

  return (
    <AppScreen padTop={22} seed={71} density={80} nav={<BottomNav />}>
      <BackRow label="내 우주" to="/app" right={<Kicker>SELF-CHECK</Kicker>} />
      <h1 className={styles.title}>내 우주 점검</h1>
      <p className={styles.sub}>목표 {agg.totals.goals}개 · 별 {agg.totals.done_stars}/{agg.totals.total_stars} · 평균 진행률 {agg.avgClarity}%</p>

      {loading ? (
        <Card className={styles.loadingCard}>
          <Sparkle size={14} className={styles.spark} />
          <p className={styles.loadingMsg}>내 우주를 읽는 중… ✦</p>
        </Card>
      ) : (
        <>
          {data?.summary && (
            <Card variant="paper" pad="18px 18px" className={styles.summaryCard}>
              <Kicker>전체 상태</Kicker>
              <p className={styles.summary}>{data.summary}</p>
            </Card>
          )}

          <ChipSection title="잘 진행 중" items={data?.doingWell} />
          <ChipSection title="자주 하는 말" items={data?.frequentWords} />
          <ChipSection title="피하고 싶은 것" items={data?.dislikes} />

          {data?.message && (
            <div className={styles.coachRow}>
              <div className={styles.coachPlanet}>
                <Planet size={46} />
                <Sparkle size={8} className={styles.coachSpark} />
              </div>
              <div className={styles.bubble}>
                {data.message}
                <div className={styles.coachName}>— 항해사</div>
              </div>
            </div>
          )}

          {failed && (
            <p className={styles.failNote}>
              {friendlyError(error)}{' '}
              <button className={styles.retry} onClick={() => run({ goals: agg.goalStats, totals: agg.totals }).catch(() => {})}>
                다시 시도
              </button>
            </p>
          )}
        </>
      )}

      <div className={styles.spacer} />
      <Button variant="ghost" fullWidth onClick={() => navigate('/app')}>내 우주로&ensp;▸</Button>
    </AppScreen>
  )
}
