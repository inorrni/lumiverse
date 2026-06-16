import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthStore'
import { todayISO, daysUntil, addDaysISO } from '../lib/date'
import { instantiateStars } from '../lib/stars'
import { planetClarity, galaxyClarity } from '../lib/clarity'

// 목표(은하) 보관소 — 디데이-별 모델(galaxies → planets → stars)을 Supabase 에 영속.
// 화면은 기존과 같은 goals/steps 형태로 소비하도록 deriveGoal 로 변환한다.
// 별 체크는 낙관적 업데이트(프론트 즉시) + DB write(영속). 충돌 시 reload 가 신뢰 소스.
const GoalContext = createContext(null)

// 디데이 미선택 시 기본 기간(일). 별 = 일수 규칙상 날짜 범위가 필요하다.
const DEFAULT_DAYS = 30

const modeToIntensity = (mode) => (mode === 'sparta' ? 'spartan' : 'easy')

// 원본 galaxy(+planets+stars) → 화면용 goal/steps 형태.
function deriveGoal(g) {
  const today = todayISO()
  const planets = [...(g.planets || [])].sort((a, b) => a.order_idx - b.order_idx)
  const steps = planets.map((p) => {
    const stars = [...(p.stars || [])].sort((a, b) => a.due_date.localeCompare(b.due_date))
    const done = stars.filter((s) => s.done).length
    const todayStar = stars.find((s) => s.due_date === today)
    return {
      id: p.id,
      title: p.name,
      detail: p.symbol || '',
      symbol: p.symbol,
      stars: stars.length, // 목표 별 수 = 배정된 별 개수
      done, // 완료한 별 수
      clarity: planetClarity(stars),
      todayStarId: todayStar?.id ?? null,
      checkedToday: !!todayStar?.done,
    }
  })
  return {
    id: g.id,
    title: g.name,
    dday: g.dday_end,
    days: daysUntil(g.dday_end),
    mode: g.intensity === 'spartan' ? 'sparta' : 'gentle',
    intensity: g.intensity,
    status: g.status,
    stars: steps.reduce((n, s) => n + s.stars, 0),
    starsEarned: steps.reduce((n, s) => n + s.done, 0),
    clarity: galaxyClarity(planets),
    steps,
  }
}

export function GoalProvider({ children }) {
  const { user } = useAuth()
  const [rows, setRows] = useState([]) // 원본 galaxies(+planets+stars)
  const [loading, setLoading] = useState(false)
  const userId = user?.id ?? null

  const reload = useCallback(async () => {
    if (!userId) {
      setRows([])
      return
    }
    setLoading(true)
    // 임베드 별칭(planets:/stars:)으로 코드가 쓰는 키 이름은 그대로 유지.
    const { data, error } = await supabase
      .from('lumiverse_galaxies')
      .select('*, planets:lumiverse_planets(*, stars:lumiverse_stars(*))')
      .neq('status', 'blackhole')
      .order('created_at', { ascending: false })
    if (!error) setRows(data || [])
    setLoading(false)
  }, [userId])

  // 로그인/로그아웃에 따라 우주를 로드/초기화.
  useEffect(() => {
    reload()
  }, [reload])

  const goals = useMemo(() => rows.map(deriveGoal), [rows])

  // { goal, planets, dday, days, mode, inputMode } → 은하+행성+별 일괄 생성.
  const addGoal = useCallback(
    async ({ goal, planets = [], dday = null, mode = 'gentle', inputMode = 'self' }) => {
      const start = todayISO()
      const end = dday || addDaysISO(start, DEFAULT_DAYS)
      const payload = {
        name: goal,
        dday_start: start,
        dday_end: end,
        intensity: modeToIntensity(mode),
        input_mode: inputMode,
        planets: planets.map((p, i) => ({
          name: p.title,
          symbol: p.symbol || null,
          order_idx: i,
          stars: instantiateStars(p.todo_pattern, start, end, p.title),
        })),
      }
      const { data, error } = await supabase.rpc('lumiverse_create_galaxy_with_planets', { payload })
      if (error) throw error
      await reload()
      return data // 새 galaxy id
    },
    [reload],
  )

  // 오늘의 별 체크 토글 — 해당 행성의 오늘(due_date) 별 done 을 뒤집는다.
  // 낙관적 업데이트 후 DB 반영, 실패 시 reload 로 복구.
  const toggleStarToday = useCallback(
    async (galaxyId, planetId) => {
      const today = todayISO()
      let starId = null
      let nextDone = null
      setRows((prev) =>
        prev.map((g) => {
          if (g.id !== galaxyId) return g
          return {
            ...g,
            planets: (g.planets || []).map((p) => {
              if (p.id !== planetId) return p
              return {
                ...p,
                stars: (p.stars || []).map((s) => {
                  if (s.due_date !== today) return s
                  starId = s.id
                  nextDone = !s.done
                  return { ...s, done: nextDone, done_at: nextDone ? new Date().toISOString() : null }
                }),
              }
            }),
          }
        }),
      )
      if (!starId) return // 오늘 배정된 별 없음
      const { error } = await supabase
        .from('lumiverse_stars')
        .update({ done: nextDone, done_at: nextDone ? new Date().toISOString() : null })
        .eq('id', starId)
      if (error) await reload()
    },
    [reload],
  )

  // 별 추가 — 행성에 오늘 날짜 별을 1개 더한다(행성상세 [+별 추가]).
  const addStar = useCallback(
    async (galaxyId, planetId) => {
      const today = todayISO()
      const planet = rows.find((g) => g.id === galaxyId)?.planets?.find((p) => p.id === planetId)
      const { data, error } = await supabase
        .from('lumiverse_stars')
        .insert({ planet_id: planetId, galaxy_id: galaxyId, due_date: today, title: planet?.name || '추가한 별' })
        .select()
        .single()
      if (error) return
      setRows((prev) =>
        prev.map((g) =>
          g.id !== galaxyId
            ? g
            : {
                ...g,
                planets: (g.planets || []).map((p) =>
                  p.id !== planetId ? p : { ...p, stars: [...(p.stars || []), data] },
                ),
              },
        ),
      )
    },
    [rows],
  )

  // 강도(모드) 변경 — galaxies.intensity 갱신.
  const setGoalMode = useCallback(
    async (galaxyId, mode) => {
      const intensity = modeToIntensity(mode)
      setRows((prev) => prev.map((g) => (g.id === galaxyId ? { ...g, intensity } : g)))
      const { error } = await supabase.from('lumiverse_galaxies').update({ intensity }).eq('id', galaxyId)
      if (error) await reload()
    },
    [reload],
  )

  // 목표 폐기(블랙홀) — 하드삭제 대신 status 토글(보존·복원). 현재는 목록에서 제거.
  const removeGoal = useCallback(
    async (galaxyId) => {
      setRows((prev) => prev.filter((g) => g.id !== galaxyId))
      const { error } = await supabase.from('lumiverse_galaxies').update({ status: 'blackhole' }).eq('id', galaxyId)
      if (error) await reload()
    },
    [reload],
  )

  // 데이터 초기화 — 본인 은하 전체 하드삭제(cascade 로 행성·별 제거). 설정 화면 전용.
  const clearGoals = useCallback(async () => {
    if (!userId) return
    setRows([])
    const { error } = await supabase.from('lumiverse_galaxies').delete().eq('user_id', userId)
    if (error) await reload()
  }, [userId, reload])

  const value = useMemo(
    () => ({ goals, loading, reload, addGoal, toggleStarToday, addStar, setGoalMode, removeGoal, clearGoals }),
    [goals, loading, reload, addGoal, toggleStarToday, addStar, setGoalMode, removeGoal, clearGoals],
  )

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>
}

export function useGoals() {
  const ctx = useContext(GoalContext)
  if (!ctx) throw new Error('useGoals must be used within <GoalProvider>')
  return ctx
}
