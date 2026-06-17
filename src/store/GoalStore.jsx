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
  const planets = [...(g.planets || [])]
    .filter((p) => p.status !== 'blackhole') // 블랙홀 보관 행성은 활성 화면에서 제외
    .sort((a, b) => a.order_idx - b.order_idx)
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
      todayReview: todayStar?.review ?? '', // 오늘 별의 한줄평(입력칸 초기값)
    }
  })
  // 별자리 — 임베드는 배열(또는 객체)로 올 수 있어 정규화. 없으면 null.
  const cRaw = g.constellation
  const constellation = Array.isArray(cRaw) ? cRaw[0] ?? null : cRaw ?? null
  // 중간점검 — 가장 최근 저장값 1개(created_at desc).
  const midCheck = (Array.isArray(g.midchecks) ? [...g.midchecks] : [])
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))[0] ?? null
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
    constellation, // { symbol, star_count } | null
    midCheck, // { state, verdict, message, created_at } | null (최근 저장 점검)
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
      .select('*, planets:lumiverse_planets(*, stars:lumiverse_stars(*)), constellation:lumiverse_constellations(*), midchecks:lumiverse_midchecks(state, verdict, message, created_at)')
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
  // 대상 별/다음 상태는 rows 에서 동기적으로 구한다(setRows 업데이터는 나중에 실행되므로
  // 그 안에서 잡은 값은 이 함수 흐름에서 아직 null 이다 → DB write 가 skip 되던 버그).
  // 낙관적 업데이트 후 DB 반영, 실패 시 reload 로 복구.
  const toggleStarToday = useCallback(
    async (galaxyId, planetId) => {
      const today = todayISO()
      const planet = rows.find((g) => g.id === galaxyId)?.planets?.find((p) => p.id === planetId)
      const star = (planet?.stars || []).find((s) => s.due_date === today)
      if (!star) return // 오늘 배정된 별 없음
      const starId = star.id
      const nextDone = !star.done
      const doneAt = nextDone ? new Date().toISOString() : null
      setRows((prev) =>
        prev.map((g) =>
          g.id !== galaxyId
            ? g
            : {
                ...g,
                planets: (g.planets || []).map((p) =>
                  p.id !== planetId
                    ? p
                    : {
                        ...p,
                        stars: (p.stars || []).map((s) =>
                          s.id === starId ? { ...s, done: nextDone, done_at: doneAt } : s,
                        ),
                      },
                ),
              },
        ),
      )
      const { error } = await supabase
        .from('lumiverse_stars')
        .update({ done: nextDone, done_at: doneAt })
        .eq('id', starId)
      if (error) await reload()
    },
    [rows, reload],
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

  // 별 한줄평 저장 — 중간점검 개인화 입력. 낙관적 업데이트 후 DB write.
  const setStarReview = useCallback(
    async (galaxyId, planetId, starId, review) => {
      const text = (review || '').trim()
      setRows((prev) =>
        prev.map((g) =>
          g.id !== galaxyId
            ? g
            : {
                ...g,
                planets: (g.planets || []).map((p) =>
                  p.id !== planetId
                    ? p
                    : {
                        ...p,
                        stars: (p.stars || []).map((s) => (s.id === starId ? { ...s, review: text } : s)),
                      },
                ),
              },
        ),
      )
      const { error } = await supabase.from('lumiverse_stars').update({ review: text }).eq('id', starId)
      if (error) await reload()
    },
    [reload],
  )

  // 한 목표의 별 이력 평탄화 — 중간점검 통계/한줄평 주입용. rows(원본)에서 직접.
  const historyOf = useCallback(
    (galaxyId) => {
      const g = rows.find((x) => x.id === galaxyId)
      if (!g) return []
      return (g.planets || [])
        .filter((p) => p.status !== 'blackhole') // 블랙홀 행성은 점검 통계에서도 제외(화면과 일치)
        .flatMap((p) =>
        (p.stars || []).map((s) => ({
          due_date: s.due_date,
          done: !!s.done,
          review: s.review ?? '',
          title: s.title || p.name || '',
        })),
      )
    },
    [rows],
  )

  // 중간점검 결과 저장 — 점검 1회 = 1행(이력·학습 자산).
  const saveMidCheck = useCallback(async (galaxyId, rec) => {
    const { error } = await supabase.from('lumiverse_midchecks').insert({
      galaxy_id: galaxyId,
      state: rec.state,
      verdict: rec.verdict,
      reason: rec.reason ?? '',
      message: rec.message ?? '',
      completion_pct: rec.completionPct ?? null,
      overall_pct: rec.overallPct ?? null,
      streak: rec.streak ?? null,
    })
    if (error) console.error('saveMidCheck:', error.message)
  }, [])

  // 행성 블랙홀 보관 — 보완 시 미선택 행성. status 토글(보존), 활성 화면에서 숨김.
  const blackholePlanet = useCallback(
    async (galaxyId, planetId) => {
      setRows((prev) =>
        prev.map((g) =>
          g.id !== galaxyId
            ? g
            : {
                ...g,
                planets: (g.planets || []).map((p) =>
                  p.id === planetId ? { ...p, status: 'blackhole' } : p,
                ),
              },
        ),
      )
      const { error } = await supabase
        .from('lumiverse_planets')
        .update({ status: 'blackhole' })
        .eq('id', planetId)
      if (error) await reload()
    },
    [reload],
  )

  // 블랙홀 보관함 — 보관된 행성 목록(부모 목표가 active 인 것만). status 별도 조회.
  const loadBlackholePlanets = useCallback(async () => {
    if (!userId) return []
    const { data, error } = await supabase
      .from('lumiverse_planets')
      .select('id, name, symbol, created_at, galaxy_id, galaxy:lumiverse_galaxies(name, status)')
      .eq('status', 'blackhole')
      .order('created_at', { ascending: false })
    if (error) throw error
    return (data || [])
      .filter((p) => p.galaxy?.status === 'active') // 부모가 블랙홀인 행성은 제외
      .map((p) => ({
        id: p.id,
        name: p.name,
        symbol: p.symbol,
        created_at: p.created_at,
        galaxyName: p.galaxy?.name || '',
      }))
  }, [userId])

  // 행성 복원 — status='active' 로 되돌려 원 소속 목표로 귀속.
  const restorePlanets = useCallback(
    async (planetIds) => {
      const ids = (planetIds || []).filter(Boolean)
      if (ids.length === 0) return
      const { error } = await supabase.from('lumiverse_planets').update({ status: 'active' }).in('id', ids)
      if (error) throw error
      await reload()
    },
    [reload],
  )

  // 별자리 생성 — 누적 별 14개↑ 보상. 은하당 1개(galaxy_id unique). symbol=엠블럼, star_count=생성 시점 누적 별.
  const createConstellation = useCallback(
    async (galaxyId, symbol, starCount) => {
      const { error } = await supabase
        .from('lumiverse_constellations')
        .insert({ galaxy_id: galaxyId, symbol, star_count: starCount ?? 0 })
      if (error) throw error
      await reload()
    },
    [reload],
  )

  // 행성 추가 — 보완 추천 행성. 오늘~디데이 기간에 todo_pattern 으로 별을 인스턴스화.
  const addPlanet = useCallback(
    async (galaxyId, { name, symbol = null, todo_pattern = null }) => {
      const g = rows.find((x) => x.id === galaxyId)
      if (!g) return
      const start = todayISO()
      const end = g.dday_end || start
      const orderIdx = Math.max(-1, ...(g.planets || []).map((p) => p.order_idx ?? 0)) + 1
      const { data: planet, error: pErr } = await supabase
        .from('lumiverse_planets')
        .insert({ galaxy_id: galaxyId, name, symbol, order_idx: orderIdx })
        .select()
        .single()
      if (pErr) return
      const stars = instantiateStars(todo_pattern, start, end, name).map((s) => ({
        planet_id: planet.id,
        galaxy_id: galaxyId,
        due_date: s.due_date,
        title: s.title,
      }))
      if (stars.length) await supabase.from('lumiverse_stars').insert(stars)
      await reload()
    },
    [rows, reload],
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
    () => ({ goals, loading, reload, addGoal, toggleStarToday, addStar, setStarReview, historyOf, saveMidCheck, blackholePlanet, addPlanet, loadBlackholePlanets, restorePlanets, createConstellation, setGoalMode, removeGoal, clearGoals }),
    [goals, loading, reload, addGoal, toggleStarToday, addStar, setStarReview, historyOf, saveMidCheck, blackholePlanet, addPlanet, loadBlackholePlanets, restorePlanets, createConstellation, setGoalMode, removeGoal, clearGoals],
  )

  return <GoalContext.Provider value={value}>{children}</GoalContext.Provider>
}

export function useGoals() {
  const ctx = useContext(GoalContext)
  if (!ctx) throw new Error('useGoals must be used within <GoalProvider>')
  return ctx
}
