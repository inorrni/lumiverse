import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BottomNav from '../components/layout/BottomNav'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import { EmptyView } from '../components/ui/DataView'
import { StarIcon, Sparkle } from '../components/ui/icons'
import CheckRow from '../components/feature/today/CheckRow'
import { useGoals } from '../store/GoalStore'
import { todayLabel } from '../lib/date'
import styles from './TodayPage.module.css'

// 한 줄 회고 입력 — 별 아래에 노출(체크 무관). blur/Enter 시 저장(변경된 경우만).
function ReviewField({ initial, onSave, autoFocus }) {
  const [text, setText] = useState(initial || '')
  useEffect(() => { setText(initial || '') }, [initial])
  const commit = () => {
    if ((text || '').trim() !== (initial || '').trim()) onSave(text)
  }
  return (
    <input
      className={styles.reviewInput}
      type="text"
      value={text}
      maxLength={60}
      autoFocus={autoFocus}
      placeholder="한 줄 회고 — 오늘 어땠나요?"
      onChange={(e) => setText(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur() }}
    />
  )
}

// 8 · 오늘의 투두 (Must 핵심 루프) — 오늘의 별을 체크하면 선명도가 오른다.
export default function TodayPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { goals, toggleStarToday, setStarReview } = useGoals()
  const [undoneOnly, setUndoneOnly] = useState(false)
  // 아이콘으로 펼친 회고 입력칸 키 모음 (체크 여부와 무관하게 작성 가능)
  const [openReview, setOpenReview] = useState(() => new Set())
  const toggleReview = (key) =>
    setOpenReview((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  // 펼침/접힘(목표별 드롭다운) — 기본 접힘. 대시보드 Today에서 넘어오면 그 은하를 펼친 채로 시작.
  const [expanded, setExpanded] = useState(() => {
    const gid = location.state?.goalId
    return new Set(gid ? [gid] : [])
  })
  const toggleGroup = (id) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  // 오늘(due_date) 배정된 별을 목표(은하)별로 묶는다.
  const groups = goals
    .map((g) => ({
      id: g.id,
      title: g.title,
      rows: g.steps.filter((s) => s.todayStarId).map((s) => ({ step: s, checked: s.checkedToday })),
    }))
    .filter((grp) => grp.rows.length > 0)

  const total = groups.reduce((n, grp) => n + grp.rows.length, 0)
  const doneCount = groups.reduce((n, grp) => n + grp.rows.filter((r) => r.checked).length, 0)
  const allDone = total > 0 && doneCount === total

  // 완료 안 된 별만 보기 필터 적용 후 표시할 그룹
  const shownGroups = groups
    .map((grp) => ({ ...grp, rows: undoneOnly ? grp.rows.filter((r) => !r.checked) : grp.rows }))
    .filter((grp) => grp.rows.length > 0)

  return (
    <AppScreen padTop={22} seed={61} density={80} nav={<BottomNav />}>
      <BackRow right={<Kicker>{todayLabel()}</Kicker>} />
      <Kicker>TODAY'S STARS</Kicker>
      <h1 className={styles.title}>오늘의 투두</h1>

      {total === 0 ? (
        <EmptyView
          title="오늘 배정된 별이 없어요"
          message="첫 목표를 만들면 매일의 별이 여기 쌓여요."
          action={<Button onClick={() => navigate('/mode')}>✦&ensp;첫 목표 만들기</Button>}
        />
      ) : (
        <>
          <div className={styles.progress}>{doneCount} / {total} 완료</div>

          {shownGroups.length === 0 ? (
            <Card variant="paper" pad="4px 18px">
              <div className={styles.emptyDone}>{undoneOnly ? '완료 안 된 별이 없어요. 다 끝냈어요!' : '표시할 별이 없어요.'}</div>
            </Card>
          ) : (
            shownGroups.map((grp) => {
              const open = expanded.has(grp.id)
              const gDone = grp.rows.filter((r) => r.checked).length
              return (
                <Card key={grp.id} variant="paper" pad={0} className={styles.group}>
                  <button
                    type="button"
                    className={styles.groupHead}
                    onClick={() => toggleGroup(grp.id)}
                    aria-expanded={open}
                  >
                    <span className={styles.groupTitle}>
                      <svg className={`${styles.chev} ${open ? styles.chevOpen : ''}`} width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="9 6 15 12 9 18" />
                      </svg>
                      {grp.title}
                    </span>
                    <span className={styles.groupCount}>{gDone} / {grp.rows.length}</span>
                  </button>

                  {open && (
                    <div className={styles.groupBody}>
                      {grp.rows.map(({ step, checked }, idx) => {
                        const key = `${grp.id}-${step.id}`
                        const hasReview = !!step.todayReview
                        const reviewOpen = openReview.has(key)
                        return (
                          <div key={key} className={`${styles.item} ${idx === grp.rows.length - 1 ? styles.itemLast : ''}`}>
                            <CheckRow
                              ink
                              last
                              title={step.title}
                              meta={`${step.done}/${step.stars}`}
                              done={checked}
                              onToggle={() => toggleStarToday(grp.id, step.id)}
                              onReview={() => toggleReview(key)}
                              reviewFilled={hasReview}
                              reviewOpen={reviewOpen}
                            />
                            {reviewOpen && (
                              <ReviewField
                                autoFocus={!hasReview}
                                initial={step.todayReview}
                                onSave={(text) => setStarReview(grp.id, step.id, step.todayStarId, text)}
                              />
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </Card>
              )
            })
          )}

          {/* 완료 연출 — 오늘 별을 모두 채우면 */}
          {allDone && (
            <div className={styles.celebrate}>
              <div className={styles.bigStar}>
                <StarIcon filled size={42} />
                <Sparkle size={9} className={styles.sp1} />
                <Sparkle size={6} className={styles.sp2} />
              </div>
              <div className={styles.celebTitle}>완료! 별이 선명해졌어요</div>
              <p className={styles.celebSub}>별 하나가 잡음을 뚫고 또렷해졌어요.<br />행성 100%가 되면 — 펑, 또렷.</p>
            </div>
          )}

          <div className={styles.spacer} />
          <Button variant="ghost" fullWidth onClick={() => setUndoneOnly((v) => !v)}>
            {undoneOnly ? '전체 별 보기' : '완료 안 된 별만 보기'}
          </Button>
        </>
      )}
    </AppScreen>
  )
}
