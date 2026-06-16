import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import Wordmark from '../components/ui/Wordmark'
import Kicker from '../components/ui/Kicker'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { EmptyView } from '../components/ui/DataView'
import { Sparkle, StarIcon } from '../components/ui/icons'
import { Planet, Constellation } from '../components/ui/Celestial'
import UniverseMap from '../components/feature/universe/UniverseMap'
import TodayRow from '../components/feature/today/TodayRow'
import { useGoals } from '../store/GoalStore'
import { todayLabel } from '../lib/date'
import styles from './DashboardPage.module.css'

const CONSTELLATION_MIN = 14

// 6 · 대시보드 — 내 우주. 목표 0개면 빈 상태(첫 목표 유도).
export default function DashboardPage() {
  const navigate = useNavigate()
  const { goals } = useGoals()
  const goNew = () => navigate('/mode')
  const carouselRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)
  const handleScroll = () => {
    const el = carouselRef.current
    if (!el) return
    setActiveIdx(Math.round(el.scrollLeft / el.offsetWidth))
  }
  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.offsetWidth, behavior: 'smooth' })
  }

  const allSteps = goals.flatMap((g) => g.steps)
  const totalPlanets = allSteps.length
  const doneToday = allSteps.filter((s) => s.checkedToday).length
  const featured = goals[0]
  const canConstellation = featured && featured.stars >= CONSTELLATION_MIN

  return (
    <AppScreen padTop={20} seed={5} nav={<BottomNav />}>
      <header className={styles.topbar}>
        <Wordmark size={17} sparkle />
        <div className={styles.topIcons} aria-hidden="true">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" />
          </svg>
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="8.5" r="3.6" /><path d="M4.5 20c1.4-3.6 4.2-5 7.5-5s6.1 1.4 7.5 5" />
          </svg>
        </div>
      </header>

      <div className={styles.greetingRow}>
        <div>
          <h1 className={styles.hello}>Good evening,<br />stargazer.</h1>
          <p className={styles.subhello}>오늘의 작은 행동이<br />너의 우주를 선명하게 만들어.</p>
        </div>
        <Card className={styles.daily} pad="12px 14px">
          <Kicker>Daily Stars</Kicker>
          <div className={styles.dailyNum}>
            <span className={styles.dailyBig}>{doneToday}</span>
            <span className={styles.dailyTotal}>/ {totalPlanets}</span>
            <StarIcon size={13} filled={doneToday > 0 && doneToday === totalPlanets} />
          </div>
          <Kicker tone="low">Today</Kicker>
        </Card>
      </div>

      {goals.length === 0 ? (
        <Card pad={0} className={styles.universe}>
          <div className={styles.cardHead}>
            <span className={styles.headLeft}><Sparkle size={10} /><Kicker tone="hi">My Universe</Kicker></span>
          </div>
          <div className={styles.universeBody}>
            <EmptyView
              title="아직 우주가 비어 있어요"
              message="첫 목표를 입력해 나만의 우주를 만들어 보세요."
              action={<Button onClick={goNew}>✦&ensp;첫 목표 만들기</Button>}
            />
          </div>
        </Card>
      ) : (
        <>
          <div className={styles.carouselWrapper}>
            {goals.length > 1 && activeIdx > 0 && (
              <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => scrollCarousel(-1)} aria-label="이전">
                <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M7.5 1L1.5 7l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          <div className={styles.universeCarousel} ref={carouselRef} onScroll={handleScroll}>
            {goals.map((goal) => {
              const canConst = goal.stars >= CONSTELLATION_MIN
              return (
                <div key={goal.id} className={styles.universeSlide}>
                  <Card pad={0} className={styles.universeCard}>
                    <div className={styles.cardHead}>
                      <span className={styles.headLeft}><Sparkle size={10} /><Kicker tone="hi">{goal.title}</Kicker></span>
                      <span className={styles.viewAll} onClick={() => navigate('/app/universe')}>전체 보기 →</span>
                    </div>
                    <div className={styles.universeBody}>
                      <UniverseMap
                        steps={goal.steps}
                        onAdd={goNew}
                        onSelect={() => navigate(`/app/planet/${goal.id}`)}
                      />
                    </div>
                    <div className={styles.footer}>
                      <div className={styles.footerLeft}>
                        <Constellation w={66} h={32} dim />
                        <span className={styles.footerText}>
                          {goal.title} 별 {goal.stars}개 — {canConst ? '별자리 가능' : `${CONSTELLATION_MIN - goal.stars}개 더`}
                        </span>
                      </div>
                      <span className={`${styles.pill} ${canConst ? '' : styles.pillOff}`}>
                        <Sparkle size={8} /> 별자리 만들기
                      </span>
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
            {goals.length > 1 && activeIdx < goals.length - 1 && (
              <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => scrollCarousel(1)} aria-label="다음">
                <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M1.5 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
          {goals.length > 1 && (
            <div className={styles.dots}>
              {goals.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`} />
              ))}
            </div>
          )}
        </>
      )}

      {featured && (
        <Card variant="paper" className={styles.today}>
          <div className={styles.todayHead}>
            <Kicker tone="ink">Today</Kicker>
            <span className={styles.todayDate}>{todayLabel()}</span>
          </div>
          {featured.steps.slice(0, 3).map((s, i, arr) => (
            <TodayRow
              key={s.id}
              title={s.title}
              sub={`${featured.title} · 별 ${s.stars}개`}
              done={s.checkedToday}
              count="0 / 1"
              last={i === arr.length - 1}
            />
          ))}
          <button className={styles.todayMore} onClick={() => navigate('/app/today')}>모두 보기 →</button>
        </Card>
      )}

      {featured && (
        <Card className={styles.midcheck}>
          <div className={styles.midHead}>
            <span className={styles.headLeft}><Sparkle size={10} /><Kicker tone="hi">Mid-Check AI Agent</Kicker></span>
            <span className={styles.midDate}>기록 3일 이상부터</span>
          </div>
          <div className={styles.midBody}>
            <Planet size={40} />
            <p className={styles.midMsg}>좋은 출발이에요, stargazer.<br />며칠 쌓이면 페이스를 점검해 줄게요.</p>
            <Button variant="ghost" className={styles.midBtn} onClick={() => navigate('/app/check')}>결과 보기 →</Button>
          </div>
        </Card>
      )}
    </AppScreen>
  )
}
