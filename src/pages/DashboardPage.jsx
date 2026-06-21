import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import Wordmark from '../components/ui/Wordmark'
import Kicker from '../components/ui/Kicker'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { EmptyView } from '../components/ui/DataView'
import { Sparkle, StarIcon } from '../components/ui/icons'
import { Telescope, Constellation } from '../components/ui/Celestial'
import UniverseMap from '../components/feature/universe/UniverseMap'
import CheckRow from '../components/feature/today/CheckRow'
import ReviewField from '../components/feature/today/ReviewField'
import ConstellationArt from '../components/feature/constellation/ConstellationArt'
import ConstellationModal from '../components/feature/constellation/ConstellationModal'
import ConstellationViewModal from '../components/feature/constellation/ConstellationViewModal'
import { useGoals } from '../store/GoalStore'
import { useAuth } from '../store/AuthStore'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { STATE_META } from '../lib/midcheck'
import { formatDday } from '../lib/date'
import styles from './DashboardPage.module.css'

const CONSTELLATION_MIN = 14

// 시간대별 인사말
function greeting() {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 18) return 'Good afternoon'
  if (h >= 18 && h < 23) return 'Good evening'
  return 'Good night'
}

// 6 · 대시보드 — 내 우주. 목표 0개면 빈 상태(첫 목표 유도).
export default function DashboardPage() {
  const navigate = useNavigate()
  const { goals, toggleStarToday, setStarReview } = useGoals()
  const { nickname } = useAuth()
  const goNew = () => navigate('/mode')
  // Today 카드에서 펼친 회고 입력칸 키 모음 (체크 여부와 무관하게 작성 가능)
  const [openReview, setOpenReview] = useState(() => new Set())
  const toggleReview = (key) =>
    setOpenReview((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })
  // 대시보드 캐러셀 — 오늘 할 일(오늘 별)이 있는 목표만. 기간종료/완료/오늘 별 없는 목표는 우주탭에서.
  const dashGoals = goals.filter((g) => g.steps.some((s) => s.todayStarId))
  const carouselRef = useRef(null)
  const [activeIdx, setActiveIdx] = useState(0)
  // 마지막으로 보던 목표를 기억해 다른 페이지에서 돌아와도 그 목표로 복원
  const [lastGoalId, setLastGoalId] = useLocalStorage('lumiverse:lastGoalId', null)
  const restoredRef = useRef(false)
  const [constModalGoal, setConstModalGoal] = useState(null)
  const [viewConstGoal, setViewConstGoal] = useState(null)

  const handleScroll = () => {
    const el = carouselRef.current
    if (!el) return
    const idx = Math.round(el.scrollLeft / el.offsetWidth)
    setActiveIdx(idx)
    if (dashGoals[idx]) setLastGoalId(dashGoals[idx].id)
  }
  const scrollCarousel = (dir) => {
    const el = carouselRef.current
    if (!el) return
    el.scrollBy({ left: dir * el.offsetWidth, behavior: 'smooth' })
  }

  // 진입 시 1회 — 저장된 목표 위치로 캐러셀 복원
  useEffect(() => {
    if (restoredRef.current || dashGoals.length === 0) return
    restoredRef.current = true
    const idx = lastGoalId ? dashGoals.findIndex((g) => g.id === lastGoalId) : 0
    if (idx > 0) {
      setActiveIdx(idx)
      const el = carouselRef.current
      if (el) el.scrollLeft = idx * el.offsetWidth
    }
  }, [dashGoals, lastGoalId])

  const allSteps = dashGoals.flatMap((g) => g.steps)
  // Daily Stars — 오늘 배정된 별만 분모로(오늘 별 없는 행성 제외 → X/Y 가 100% 도달 가능)
  const totalPlanets = allSteps.filter((s) => s.todayStarId).length
  const doneToday = allSteps.filter((s) => s.checkedToday).length
  // Today·Mid-Check 카드는 현재 보고 있는(활성) 목표 기준
  const activeGoal = dashGoals[activeIdx] || dashGoals[0]
  // 활성 목표의 오늘 별 있는 행성 — Today 카드 목록·카운트 공통 소스(보완으로 추가한 행성 포함)
  const todaySteps = activeGoal ? activeGoal.steps.filter((s) => s.todayStarId) : []
  const todayDone = todaySteps.filter((s) => s.checkedToday).length
  const todayTotal = todaySteps.length

  return (
    <AppScreen padTop={20} seed={5} nav={<BottomNav />}>
      <header className={styles.topbar}>
        <Wordmark size={17} sparkle />
        <div className={styles.topIcons}>
          {/* 알림 — 기본 틀(동작 향후) */}
          <button type="button" className={styles.iconBtn} aria-label="알림">
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 19a2 2 0 0 0 4 0" />
            </svg>
          </button>
          {/* 사용자 — 설정으로 */}
          <button type="button" className={styles.iconBtn} aria-label="내 정보" onClick={() => navigate('/app/settings')}>
            <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8.5" r="3.6" /><path d="M4.5 20c1.4-3.6 4.2-5 7.5-5s6.1 1.4 7.5 5" />
            </svg>
          </button>
        </div>
      </header>

      <div className={styles.greetingRow}>
        <div>
          <h1 className={styles.hello}>{greeting()},<br />{nickname || 'stargazer'}.</h1>
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
      ) : dashGoals.length === 0 ? (
        <Card pad={0} className={styles.universe}>
          <div className={styles.cardHead}>
            <span className={styles.headLeft}><Sparkle size={10} /><Kicker tone="hi">My Universe</Kicker></span>
          </div>
          <div className={styles.universeBody}>
            <EmptyView
              title="오늘 할 일을 다 마쳤어요"
              message="오늘 별이 남은 목표가 없어요. 우주탭에서 전체 목표를 둘러보세요."
              action={<Button variant="ghost" onClick={() => navigate('/app/universe')}>✦&ensp;내 우주 보기</Button>}
            />
          </div>
        </Card>
      ) : (
        <>
          {/* 카드 바깥 — 새 목표 / 전체 보기 (캐러셀 공통 액션) */}
          <div className={styles.universeHeader}>
            <span className={styles.headLeft}><Sparkle size={10} /><Kicker tone="hi">My Universe</Kicker></span>
            <div className={styles.headRight}>
              <button className={styles.addBtn} onClick={goNew}>＋ 새 목표</button>
              <span className={styles.viewAll} onClick={() => navigate('/app/universe')}>전체 보기 →</span>
            </div>
          </div>
          <div className={styles.carouselWrapper}>
            {dashGoals.length > 1 && activeIdx > 0 && (
              <button className={`${styles.arrow} ${styles.arrowLeft}`} onClick={() => scrollCarousel(-1)} aria-label="이전">
                <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M7.5 1L1.5 7l6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          <div className={styles.universeCarousel} ref={carouselRef} onScroll={handleScroll}>
            {dashGoals.map((goal) => {
              const earned = goal.starsEarned
              const total = goal.stars
              const hasConst = !!goal.constellation
              const canConst = earned >= CONSTELLATION_MIN
              const reachable = total >= CONSTELLATION_MIN // 총 별 수로 별자리 도달 가능 여부
              const showMakeBtn = !hasConst && canConst // 버튼은 만들 수 있을 때만 — 그 외엔 가운데 정렬
              const ddayText = goal.dday
                ? `~${formatDday(goal.dday)} · ${goal.days === 0 ? 'D-DAY' : `D-${goal.days}`}`
                : '기간 자유'
              const styleTag = goal.inputMode === 'ai'
                ? `추천 · ${goal.mode === 'sparta' ? '스파르타' : '살살'}`
                : '알아서'
              return (
                <div key={goal.id} className={styles.universeSlide}>
                  <Card pad={0} className={styles.universeCard}>
                    <div className={styles.cardHead}>
                      <span className={styles.headLeft}><Sparkle size={10} /><Kicker tone="hi">{goal.title}</Kicker></span>
                      <div className={styles.cardMeta}>
                        <span className={styles.ddayMeta}>{ddayText}</span>
                        <span className={styles.modeTag}>{styleTag}</span>
                      </div>
                    </div>
                    <div className={styles.universeBody}>
                      <UniverseMap
                        steps={goal.steps}
                        onAdd={goNew}
                        onSelect={(stepId) => navigate(`/app/planet/${stepId}`)}
                      />
                    </div>
                    <div className={`${styles.footer} ${!showMakeBtn ? styles.footerDone : ''}`}>
                      <div className={styles.footerLeft}>
                        {hasConst ? (
                          <button type="button" className={styles.constArt} onClick={() => setViewConstGoal(goal)} aria-label="별자리 크게 보기">
                            <ConstellationArt seed={goal.id} count={goal.constellation.star_count} symbol={goal.constellation.symbol} size={40} />
                          </button>
                        ) : (
                          <Constellation w={66} h={32} dim />
                        )}
                        <span className={styles.footerText}>
                          {hasConst
                            ? `별 ${goal.constellation.star_count}개로 별자리를 완성했어요`
                            : canConst
                              ? `별 ${earned}개 — 지금 별자리를 만들 수 있어요`
                              : reachable
                                ? `별 ${earned}개 — ${CONSTELLATION_MIN - earned}개 더 모으면 별자리가 돼요`
                                : `별 ${earned}개를 모았어요 ✦ 오늘도 한 걸음씩`}
                        </span>
                      </div>
                      {showMakeBtn ? (
                        <button type="button" className={styles.pill} onClick={() => setConstModalGoal(goal)}>
                          <Sparkle size={8} /> 별자리 만들기
                        </button>
                      ) : null}
                    </div>
                  </Card>
                </div>
              )
            })}
          </div>
            {dashGoals.length > 1 && activeIdx < dashGoals.length - 1 && (
              <button className={`${styles.arrow} ${styles.arrowRight}`} onClick={() => scrollCarousel(1)} aria-label="다음">
                <svg width="9" height="14" viewBox="0 0 9 14" fill="none"><path d="M1.5 1l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
            )}
          </div>
          {dashGoals.length > 1 && (
            <div className={styles.dots}>
              {dashGoals.map((_, i) => (
                <span key={i} className={`${styles.dot} ${i === activeIdx ? styles.dotActive : ''}`} />
              ))}
            </div>
          )}
        </>
      )}

      {activeGoal && (
        <Card variant="paper" className={styles.today}>
          <div className={styles.todayHead}>
            <Kicker tone="ink">Today</Kicker>
            <span className={styles.todayDate}>{todayDone}/{todayTotal}</span>
          </div>
          {todaySteps.length === 0 ? (
            <p className={styles.todayEmpty}>오늘 배정된 별이 없어요.</p>
          ) : (
            todaySteps.map((s, i, arr) => {
              const key = `${activeGoal.id}-${s.id}`
              const hasReview = !!s.todayReview
              const reviewOpen = openReview.has(key)
              return (
                <CheckRow
                  key={s.id}
                  ink
                  last={i === arr.length - 1}
                  title={s.title}
                  meta={`${s.done}/${s.stars}`}
                  done={s.checkedToday}
                  onToggle={() => toggleStarToday(activeGoal.id, s.id)}
                  onReview={() => toggleReview(key)}
                  reviewFilled={hasReview}
                  reviewOpen={reviewOpen}
                  review={
                    <ReviewField
                      autoFocus={!hasReview}
                      initial={s.todayReview}
                      onSave={(text) => setStarReview(activeGoal.id, s.id, s.todayStarId, text)}
                    />
                  }
                />
              )
            })
          )}
          <button className={styles.todayMore} onClick={() => navigate('/app/today', { state: { goalId: activeGoal.id } })}>모두 보기 →</button>
        </Card>
      )}

      {activeGoal && (
        <Card className={styles.midcheck}>
          <div className={styles.midHead}>
            <span className={styles.headLeft}><Sparkle size={10} /><Kicker tone="hi">Mid-Check</Kicker></span>
            <span className={styles.midDate}>
              {activeGoal.midCheck
                ? `${STATE_META[activeGoal.midCheck.state]?.label ?? '점검'} · 전체 ${activeGoal.clarity}%`
                : `점검 전 · 전체 ${activeGoal.clarity}%`}
            </span>
          </div>
          <div className={styles.midBody}>
            <Telescope size={40} />
            <p className={styles.midMsg}>
              {activeGoal.midCheck?.message || '아직 중간점검 전이에요 — 눌러서 점검해 봐요.'}
            </p>
            <Button variant="ghost" className={styles.midBtn} onClick={() => navigate(`/app/check/${activeGoal.id}`)}>
              중간점검
            </Button>
          </div>
        </Card>
      )}

      {constModalGoal && (
        <ConstellationModal goal={constModalGoal} onClose={() => setConstModalGoal(null)} />
      )}
      {viewConstGoal && (
        <ConstellationViewModal goal={viewConstGoal} onClose={() => setViewConstGoal(null)} />
      )}
    </AppScreen>
  )
}
