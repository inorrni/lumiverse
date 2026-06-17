import { useEffect, useState } from 'react'
import { useNavigate, useLocation, Navigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import DataView, { EmptyView, LoadingSkeleton } from '../components/ui/DataView'
import { Planet } from '../components/ui/Celestial'
import PlanetRow from '../components/feature/galaxy/PlanetRow'
import { useAsync } from '../hooks/useAsync'
import { breakdownGoal } from '../lib/api'
import { friendlyError } from '../lib/errors'
import { useGoals } from '../store/GoalStore'
import styles from './PlanPage.module.css'

const MIN_PLANETS = 3
const MAX_PLANETS = 5

// /plan 재진입 시 입력(goal·dday·intensity)이 같으면 분해/편집 결과를 유지해
// 매번 재분해되는 것을 막는다(B안). 모듈 레벨이라 네비게이션엔 살아남고 새로고침엔 초기화된다.
// confirm(우주 생성) 시 비워 새 목표 흐름에 이전 draft가 새지 않게 한다.
let planDraft = null // { sig, planets, excluded }

function PlanLoading() {
  return (
    <div className={styles.loading}>
      <Planet size={72} style={{ opacity: 0.7 }} />
      <p className={styles.loadingMsg}>별을 계산하는 중… ✦</p>
      <LoadingSkeleton rows={3} />
    </div>
  )
}

// 5 · 경로 설계 (Must) — 추천: 비동기 4상태로 AI 분해 / 알아서: 빈 목록에서 직접 입력.
// 어느 쪽이든 행성을 수정·추가·삭제한 뒤 우주로 떠난다.
export default function PlanPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const { addGoal } = useGoals()
  const { status, data, error, run } = useAsync(breakdownGoal)

  const goal = state?.goal
  const dday = state?.dday ?? null
  const days = state?.days ?? null
  const mode = state?.mode || 'gentle'
  const isAuto = state?.inputMethod === 'auto'
  const intensity = mode === 'sparta' ? 'spartan' : 'easy'

  // 분해를 결정하는 입력 시그니처. 같으면 재분해 없이 draft 복원(B안).
  const sig = `${isAuto ? 'self' : 'ai'}|${goal ?? ''}|${dday ?? ''}|${intensity}`
  const hasDraft = planDraft?.sig === sig && planDraft.planets.length > 0

  const [planets, setPlanets] = useState(() => (hasDraft ? planDraft.planets : []))
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  // 리프레시로 이미 본 행성 이름 누적
  const [excluded, setExcluded] = useState(() => (hasDraft ? planDraft.excluded : []))

  // 추천 모드만 AI 호출. 입력이 그대로면(draft 존재) 재분해 skip → 편집/리프레시 결과 유지.
  useEffect(() => {
    if (!goal || isAuto || hasDraft) return
    run(goal, { days, intensity })
  }, [goal, days, intensity, isAuto, hasDraft, run])

  useEffect(() => {
    if (!isAuto && status === 'success' && data?.steps) {
      setPlanets(data.steps.map((s) => ({ ...s })))
    }
  }, [isAuto, status, data])

  // 편집/분해 결과를 draft 에 보존(네비게이션 후 복원용). 빈 목록은 저장하지 않는다.
  useEffect(() => {
    if (planets.length > 0) planDraft = { sig, planets, excluded }
  }, [sig, planets, excluded])

  if (!goal) return <Navigate to="/goal" replace />

  const defaultStars = planets[0]?.stars || (days ? Math.max(1, Math.round(days / 3)) : 30)
  const addPlanet = () => {
    const id = `s_${Date.now().toString(36)}`
    setPlanets((p) => [...p, { id, title: '새 행성', detail: '직접 입력해 주세요', stars: defaultStars }])
    setEditingId(id)
  }
  const updateTitle = (id, title) => setPlanets((p) => p.map((x) => (x.id === id ? { ...x, title } : x)))
  const removePlanet = (id) => setPlanets((p) => p.filter((x) => x.id !== id))

  // 다른 추천 받기 — 현재(+이전) 행성 이름을 제외하고, 현재 행성 개수(3~5 클램프)에 맞춰 재요청.
  const refresh = () => {
    const next = [...new Set([...excluded, ...planets.map((p) => p.title)])]
    setExcluded(next)
    const count = Math.min(MAX_PLANETS, Math.max(MIN_PLANETS, planets.length))
    run(goal, { days, intensity, exclude: next, count })
  }

  const inRange = planets.length >= MIN_PLANETS && planets.length <= MAX_PLANETS
  const confirm = async () => {
    setSaving(true)
    try {
      await addGoal({ goal, planets, dday, mode, inputMode: isAuto ? 'self' : 'ai' })
      planDraft = null // 우주 생성 완료 — 새 목표 흐름에 이전 draft가 새지 않게 비움
      navigate('/app')
    } catch {
      setSaving(false)
    }
  }

  // 추천/알아서 공통 편집 UI
  const editor = () => (
    <div className={styles.result}>
      {planets.length > 0 && (
        <Card pad="0 16px">
          {planets.map((p, i) => (
            <PlanetRow
              key={p.id}
              planet={p}
              editing={editingId === p.id}
              onTitleChange={(t) => updateTitle(p.id, t)}
              onEditToggle={() => setEditingId((cur) => (cur === p.id ? null : p.id))}
              onDelete={() => removePlanet(p.id)}
              last={i === planets.length - 1}
            />
          ))}
        </Card>
      )}

      {!isAuto && planets.length > 0 && (
        <Button variant="ghost" fullWidth onClick={refresh}>
          ↻&ensp;다른 분해 추천받기
        </Button>
      )}

      <Button variant="ghost" fullWidth onClick={addPlanet} disabled={planets.length >= MAX_PLANETS}>
        ＋&ensp;행성 추가
      </Button>

      <div className={styles.spacer} />
      {!inRange && (
        <p className={styles.hint}>행성은 {MIN_PLANETS}~{MAX_PLANETS}개여야 우주로 떠날 수 있어요. (현재 {planets.length}개)</p>
      )}
      <Button fullWidth onClick={confirm} disabled={!inRange || saving}>
        {saving ? '우주를 만드는 중…' : <>확인하고 우주로 떠나기&ensp;▸</>}
      </Button>
    </div>
  )

  return (
    <AppScreen padTop={22} seed={41} density={55} dim nebula={false}>
      <BackRow label="뒤로" to="/goal" state={state} right={<Kicker>{isAuto ? 'MANUAL' : 'RECOMMENDED'}</Kicker>} />
      <Kicker>{isAuto ? 'DIRECT INPUT' : 'NAVIGATOR'}</Kicker>
      <h1 className={styles.title}>
        {isAuto ? <>행성을 직접<br />입력해 주세요</> : <>항해사가 경로를<br />설계했어요</>}
      </h1>
      <p className={styles.sub}>행성(세부목표) {MIN_PLANETS}~{MAX_PLANETS}개 · 수정하거나 추가할 수 있어요.</p>

      {isAuto ? editor() : (
        <DataView
          status={status}
          data={data?.steps}
          error={friendlyError(error)}
          onRetry={() => run(goal, { days, intensity, exclude: excluded })}
          loading={<PlanLoading />}
          empty={
            <EmptyView
              title="분해 결과가 없어요"
              message="목표를 조금 더 구체적으로 적으면 별로 나누기 쉬워요."
              action={<Button variant="ghost" onClick={() => navigate('/goal', { state: { mode, inputMethod: isAuto ? 'auto' : 'recommend' } })}>목표 다시 입력</Button>}
            />
          }
        >
          {() => editor()}
        </DataView>
      )}
    </AppScreen>
  )
}
