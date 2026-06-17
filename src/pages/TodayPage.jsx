import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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
  const { goals, toggleStarToday, setStarReview } = useGoals()
  const [doneOnly, setDoneOnly] = useState(false)
  // 아이콘으로 펼친 회고 입력칸 키 모음 (체크 여부와 무관하게 작성 가능)
  const [openReview, setOpenReview] = useState(() => new Set())
  const toggleReview = (key) =>
    setOpenReview((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      return next
    })

  // 오늘(due_date) 배정된 별만 오늘의 투두로 펼친다.
  const items = goals.flatMap((g) =>
    g.steps
      .filter((s) => s.todayStarId)
      .map((s) => ({ goalId: g.id, goalTitle: g.title, step: s, checked: s.checkedToday }))
  )
  const doneCount = items.filter((i) => i.checked).length
  const total = items.length
  const allDone = total > 0 && doneCount === total
  const shown = doneOnly ? items.filter((i) => i.checked) : items

  return (
    <AppScreen padTop={22} seed={61} density={80} nav={<BottomNav />}>
      <BackRow label="내 우주" to="/app" right={<Kicker>{todayLabel()}</Kicker>} />
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

          <Card variant="paper" pad="4px 18px">
            {shown.map((i, idx) => {
              const key = `${i.goalId}-${i.step.id}`
              const hasReview = !!i.step.todayReview
              const open = openReview.has(key)
              return (
                <div
                  key={key}
                  className={`${styles.item} ${idx === shown.length - 1 ? styles.itemLast : ''}`}
                >
                  <CheckRow
                    ink
                    title={i.step.title}
                    sub={`${i.goalTitle} · 별 ${i.step.stars}개`}
                    done={i.checked}
                    onToggle={() => toggleStarToday(i.goalId, i.step.id)}
                    onReview={() => toggleReview(key)}
                    reviewFilled={hasReview}
                    reviewOpen={open}
                    last
                  />
                  {open && (
                    <ReviewField
                      autoFocus={!hasReview}
                      initial={i.step.todayReview}
                      onSave={(text) => setStarReview(i.goalId, i.step.id, i.step.todayStarId, text)}
                    />
                  )}
                </div>
              )
            })}
            {doneOnly && shown.length === 0 && (
              <div className={styles.emptyDone}>아직 완료한 별이 없어요.</div>
            )}
          </Card>

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
          <Button variant="ghost" fullWidth onClick={() => setDoneOnly((v) => !v)}>
            {doneOnly ? '전체 별 보기' : '완료된 별만 보기'}
          </Button>
        </>
      )}
    </AppScreen>
  )
}
