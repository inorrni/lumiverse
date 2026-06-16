import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import { EmptyView } from '../components/ui/DataView'
import { StarIcon, Sparkle } from '../components/ui/icons'
import { Galaxy, BlackHole, Constellation } from '../components/ui/Celestial'
import { useGoals } from '../store/GoalStore'
import styles from './UniversePage.module.css'

const CONSTELLATION_MIN = 14

// 은하계마다 산개 배치 좌표 [x%, y%] — 자연스러운 우주 느낌.
// 목표 개수가 늘어나면 순환.
const SCATTER = [
  [50, 12],
  [18, 35],
  [82, 30],
  [32, 62],
  [70, 58],
  [50, 80],
  [14, 68],
  [86, 66],
  [50, 44],
]

// 전체 우주 화면 — 내 모든 목표(은하계)를 산개 배치로 보여준다.
export default function UniversePage() {
  const navigate = useNavigate()
  const { goals } = useGoals()

  const clusterH = goals.length <= 3 ? 320 : goals.length <= 6 ? 400 : 460

  return (
    <AppScreen padTop={22} seed={77} density={100} nav={<BottomNav />}>
      <BackRow label="대시보드" to="/app" right={<Kicker>MY UNIVERSE</Kicker>} />
      <h1 className={styles.title}>내 우주</h1>

      {goals.length === 0 ? (
        <EmptyView
          title="아직 우주가 비어 있어요"
          message="첫 목표를 입력해 나만의 은하계를 만들어 보세요."
          action={<Button onClick={() => navigate('/mode')}>✦&ensp;첫 목표 만들기</Button>}
        />
      ) : (
        <>
          <div className={styles.cluster} style={{ minHeight: clusterH }}>
            {/* 배경 궤도 타원 */}
            <div className={styles.orbit} aria-hidden="true" />

            {goals.map((goal, i) => {
              const [lx, ly] = SCATTER[i % SCATTER.length]
              const pips = Math.round((goal.clarity / 100) * 3)
              const canConst = goal.stars >= CONSTELLATION_MIN
              return (
                <button
                  key={goal.id}
                  className={styles.galaxy}
                  style={{ left: `${lx}%`, top: `${ly}%` }}
                  onClick={() => navigate(`/app/planet/${goal.id}`)}
                >
                  <div className={styles.galaxyVisual}>
                    <Galaxy size={76} />
                    {canConst && <Sparkle size={9} className={styles.sparkle} />}
                  </div>
                  <div className={styles.galaxyName}>{goal.title}</div>
                  <div className={styles.galaxyMeta}>
                    {goal.days ? `D-${goal.days}` : '∞'} · {goal.clarity}%
                  </div>
                  <div className={styles.pips}>
                    {[0, 1, 2].map((j) => (
                      <StarIcon key={j} size={11} filled={j < pips} />
                    ))}
                  </div>
                  {canConst && <Constellation w={44} h={22} className={styles.constellationBadge} />}
                </button>
              )
            })}

            {/* 새 목표 추가 */}
            <button
              className={styles.addGalaxy}
              style={{ left: `${SCATTER[goals.length % SCATTER.length][0]}%`, top: `${SCATTER[goals.length % SCATTER.length][1]}%` }}
              onClick={() => navigate('/mode')}
            >
              <span className={styles.addCircle} aria-hidden="true">＋</span>
              <span className={styles.addLabel}>새 목표</span>
            </button>
          </div>

          <div className={styles.blackholeRow}>
            <button className={styles.blackholeBtn} onClick={() => navigate('/app/blackhole')}>
              <BlackHole size={26} />
              <span className={styles.blackholeLabel}>블랙홀 보관함</span>
            </button>
          </div>
        </>
      )}
    </AppScreen>
  )
}
