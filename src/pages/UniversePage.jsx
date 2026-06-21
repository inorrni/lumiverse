import { lazy, Suspense, useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import { EmptyView } from '../components/ui/DataView'
import { BlackHole } from '../components/ui/Celestial'
import { useGoals } from '../store/GoalStore'
import { ddayDelta } from '../lib/date'
import styles from './UniversePage.module.css'

// Three.js 번들은 무거우므로 우주 화면 진입 시에만 로드(코드 스플릿).
const UniverseScene = lazy(() => import('../components/feature/universe/UniverseScene'))

// 상태 필터 — 라이프사이클(진행중/기간종료/완료) + 중간점검 단계(go/보완/마무리).
const FILTERS = [
  { key: 'all', label: '전체', test: () => true },
  { key: 'active', label: '진행중', test: (g) => g.lifecycle === 'active' },
  { key: 'expired', label: '기간종료', test: (g) => g.lifecycle === 'expired' },
  { key: 'completed', label: '완료', test: (g) => g.lifecycle === 'completed' },
  { key: 'go', label: 'go', test: (g) => g.midCheck?.verdict === 'go' },
  { key: 'supplement', label: '보완', test: (g) => g.midCheck?.verdict === 'supplement' },
  { key: 'finish', label: '마무리', test: (g) => g.midCheck?.verdict === 'finish' },
]

// 디데이 라벨 — 미래 D-N, 당일 D-DAY, 과거 D+N, 미선택 ∞.
function ddayText(dday) {
  const d = ddayDelta(dday)
  if (d == null) return '∞'
  if (d === 0) return 'D-DAY'
  return d > 0 ? `D-${d}` : `D+${-d}`
}

// 전체 우주 화면 — 내 모든 목표(은하계)를 Three.js 실시간 3D로 보여준다.
// 큰 점=행성(step), 작은 점=별(누적 달성), 은하계=목표. 클릭 시 행성상세로 이동.
export default function UniversePage() {
  const navigate = useNavigate()
  const { goals } = useGoals()
  // hover한 은하의 목표명을 화면 상단 중앙에 고정 표시(줌/회전과 무관하게 또렷).
  const [active, setActive] = useState(null)
  const [filter, setFilter] = useState('all')
  const handleHover = useCallback((goal, entering) => {
    setActive((prev) => (entering ? goal : prev?.id === goal.id ? null : prev))
  }, [])
  const current = FILTERS.find((f) => f.key === filter) || FILTERS[0]
  const filtered = goals.filter(current.test)

  return (
    <AppScreen padTop={22} seed={77} density={100} nav={<BottomNav />} brightness={0.5}>
      <BackRow right={<Kicker>MY UNIVERSE</Kicker>} />
      <div className={styles.titleRow}>
        <h1 className={styles.title}>내 우주</h1>
        <button className={styles.addBtn} onClick={() => navigate('/mode')}>＋ 새 목표</button>
      </div>

      {goals.length === 0 ? (
        <EmptyView
          title="아직 우주가 비어 있어요"
          message="첫 목표를 입력해 나만의 은하계를 만들어 보세요."
          action={<Button onClick={() => navigate('/mode')}>✦&ensp;첫 목표 만들기</Button>}
        />
      ) : (
        <div className={styles.body}>
          {/* 상태 필터 칩 — 라이프사이클 + 중간점검 단계 */}
          <div className={styles.filterBar}>
            {FILTERS.map((f) => {
              const count = goals.filter(f.test).length
              return (
                <button
                  key={f.key}
                  type="button"
                  className={`${styles.chip} ${filter === f.key ? styles.chipOn : ''}`}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}{f.key !== 'all' ? ` ${count}` : ''}
                </button>
              )
            })}
          </div>
          <div className={styles.scene}>
            {/* 상단 중앙 고정 목표명 — hover한 은하 이름 */}
            <div className={`${styles.activeName} ${active ? styles.activeNameOn : ''}`} aria-hidden="true">
              {active && (
                <>
                  <span className={styles.activeTitle}>{active.title}</span>
                  <span className={styles.activeMeta}>
                    {ddayText(active.dday)} · {active.clarity}%
                  </span>
                </>
              )}
            </div>
            {filtered.length === 0 ? (
              <div className={styles.loading}>이 상태의 목표가 없어요.</div>
            ) : (
              <Suspense fallback={<div className={styles.loading}>우주를 그리는 중…</div>}>
                <UniverseScene goals={filtered} onHover={handleHover} onSelect={(id) => navigate(`/app/planet/${id}`)} />
              </Suspense>
            )}
          </div>

          <div className={styles.footer}>
            {/* <p className={styles.hint} aria-hidden="true">
              드래그로 회전 · 휠로 확대 · 은하계를 눌러 들어가기
            </p> */}
            <div className={styles.blackholeRow}>
              <button className={styles.blackholeBtn} onClick={() => navigate('/app/blackhole')}>
                <BlackHole size={26} />
                <span className={styles.blackholeLabel}>블랙홀 보관함</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AppScreen>
  )
}
