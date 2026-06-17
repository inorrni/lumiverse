import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import TextInput from '../components/ui/TextInput'
import Button from '../components/ui/Button'
import { StarIcon } from '../components/ui/icons'
import { todayISO, daysUntil } from '../lib/date'
import styles from './GoalInputPage.module.css'

const MAX = 30

// 4 · 목표 입력 — 목표 + D-Day(필수). 별 개수 = 일수. 추천=AI분해 / 알아서=직접입력으로 넘긴다.
export default function GoalInputPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const mode = state?.mode || 'gentle'
  const inputMethod = state?.inputMethod || 'recommend'
  // /plan 에서 뒤로 올 때 state 로 복원 — 새로 들어오면 빈값.
  const [goal, setGoal] = useState(state?.goal || '')
  const [dday, setDday] = useState(state?.dday || '')
  const [error, setError] = useState('')        // 목표 에러
  const [ddayError, setDdayError] = useState('') // 디데이 에러

  const days = useMemo(() => daysUntil(dday), [dday])

  const submit = (e) => {
    e.preventDefault()
    setError(''); setDdayError('')
    const text = goal.trim()
    if (!text) {
      setError('탐험의 목적지(목표)를 한 줄로 적어 주세요.')
      return
    }
    if (!dday) {
      setDdayError('탐험 기간을 정할 디데이를 골라 주세요.')
      return
    }
    if (days === null) {
      setDdayError('디데이는 오늘 이후 날짜로 골라 주세요.')
      return
    }
    navigate('/plan', { state: { goal: text, dday, days, mode, inputMethod } })
  }

  return (
    <AppScreen padTop={22} seed={31} density={55} dim nebula={false}>
      <BackRow label="뒤로" to="/mode" />
      <Kicker>NEW GALAXY</Kicker>
      <h1 className={styles.title}>탐험의 목적지를<br />입력해 주세요</h1>

      <form className={styles.form} onSubmit={submit}>
        <div className={styles.fields}>
          <TextInput
            label="목표"
            placeholder="예: 영어 공부하기"
            value={goal}
            onChange={(e) => { setGoal(e.target.value.slice(0, MAX)); if (error) setError('') }}
            error={error}
            autoFocus
            maxLength={MAX}
            right={<span className={styles.counter}>{goal.length}/{MAX}</span>}
          />
          <TextInput
            label="D-Day"
            type="date"
            min={todayISO()}
            value={dday}
            error={ddayError}
            onChange={(e) => { setDday(e.target.value); if (ddayError) setDdayError('') }}
          />
        </div>

        {/* 별 개수(=일수) 미리보기 */}
        <div className={styles.preview}>
          <div className={styles.count}>
            <span className={styles.countNum}>{days ?? '—'}</span>
            <span className={styles.countUnit}>{days ? '일의 별' : '날짜를 골라 주세요'}</span>
          </div>
          <div className={styles.stars} aria-hidden="true">
            {Array.from({ length: Math.min(days || 0, 15) || 6 }).map((_, i) => (
              <StarIcon key={i} size={9} filled={false} />
            ))}
          </div>
        </div>

        <p className={styles.note}>
          <span aria-hidden="true">ⓘ</span>
          별 14개 이상부터 별자리를 만들 수 있어요. 별 개수 = 디데이까지 남은 일수.
        </p>

        <div className={styles.spacer} />
        <Button type="submit" fullWidth>
          {inputMethod === 'auto' ? '내 우주 직접 그리기' : '우주 항해사에게 분해받기'}&ensp;▸
        </Button>
      </form>
    </AppScreen>
  )
}
