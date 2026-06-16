import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { todayISO } from '../lib/date'

// 생성된 목표(은하) 보관소 — 핵심 루프(데일리 체크 → 선명화)의 단일 소스.
// localStorage 에 저장해 새로고침 후에도 우주가 유지된다.
// 모델: goal(은하) → steps(세부목표=별). 각 step 에 done/lastCheck.
const STORAGE_KEY = 'lumiverse.goals'
const GoalContext = createContext(null)

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// 별 합계·완료·선명도(clarity) 재계산. 별=일수, 선명도=완료/목표.
function recompute(goal) {
  const target = goal.steps.reduce((n, s) => n + (s.stars || 0), 0)
  const done = goal.steps.reduce((n, s) => n + (s.done || 0), 0)
  return {
    ...goal,
    stars: target,
    starsEarned: done,
    clarity: target ? Math.round((done / target) * 100) : 0,
  }
}

export function GoalProvider({ children }) {
  const [goals, setGoals] = useState(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(goals))
    } catch {
      /* 저장 실패는 무시 — 메모리 상태는 유지 */
    }
  }, [goals])

  // { goal, steps, days, dday, mode } 를 받아 새 은하로 추가하고 id 를 돌려준다.
  const addGoal = useCallback(({ goal, steps = [], days = null, dday = null, mode = 'gentle' }) => {
    const id = `g_${Date.now().toString(36)}`
    const entry = recompute({
      id,
      title: goal,
      steps: steps.map((s) => ({ ...s, done: 0, lastCheck: null })),
      days,
      dday,
      mode,
      createdAt: new Date().toISOString(),
    })
    setGoals((prev) => [entry, ...prev])
    return id
  }, [])

  // 오늘의 별 체크 토글 — 오늘 이미 체크했으면 해제, 아니면 완료(done±1).
  const toggleStarToday = useCallback((goalId, stepId) => {
    const today = todayISO()
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const steps = g.steps.map((s) => {
          if (s.id !== stepId) return s
          const checkedToday = s.lastCheck === today
          return checkedToday
            ? { ...s, done: Math.max(0, (s.done || 0) - 1), lastCheck: null }
            : { ...s, done: Math.min(s.stars, (s.done || 0) + 1), lastCheck: today }
        })
        return recompute({ ...g, steps })
      })
    )
  }, [])

  // 별(목표치) 추가 — 세부목표의 stars 를 1 늘린다.
  const addStar = useCallback((goalId, stepId) => {
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== goalId) return g
        const steps = g.steps.map((s) => (s.id === stepId ? { ...s, stars: s.stars + 1 } : s))
        return recompute({ ...g, steps })
      })
    )
  }, [])

  // 목표별 강도(모드) 변경.
  const setGoalMode = useCallback((goalId, mode) => {
    setGoals((prev) => prev.map((g) => (g.id === goalId ? { ...g, mode } : g)))
  }, [])

  const removeGoal = useCallback((id) => {
    setGoals((prev) => prev.filter((g) => g.id !== id))
  }, [])

  const clearGoals = useCallback(() => setGoals([]), [])

  return (
    <GoalContext.Provider value={{ goals, addGoal, toggleStarToday, addStar, setGoalMode, removeGoal, clearGoals }}>
      {children}
    </GoalContext.Provider>
  )
}

export function useGoals() {
  const ctx = useContext(GoalContext)
  if (!ctx) throw new Error('useGoals must be used within <GoalProvider>')
  return ctx
}
