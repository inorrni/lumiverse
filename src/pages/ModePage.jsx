import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AppScreen from '../components/layout/AppScreen'
import BackRow from '../components/ui/BackRow'
import Kicker from '../components/ui/Kicker'
import Button from '../components/ui/Button'
import RadioRow from '../components/ui/RadioRow'
import { StarIcon } from '../components/ui/icons'
import styles from './ModePage.module.css'

const MODES = [
  { key: 'gentle', title: '살살모드', sub: '여유롭게, 적은 양으로 천천히 가요' },
  { key: 'sparta', title: '스파르타모드', sub: '촘촘한 투두로 강하게 끝까지 가요' },
]

function ModeCard({ mode, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`${styles.card} ${selected ? styles.cardOn : ''}`}
      aria-pressed={selected}
      onClick={onSelect}
    >
      {selected && <span className={styles.check}><StarIcon filled size={13} /></span>}
      <span className={styles.cardTitle}>{mode.title}</span>
      <span className={styles.cardSub}>{mode.sub}</span>
    </button>
  )
}

// 3 · 모드 선택 (Must) — 입력방식(알아서/추천) 먼저, 추천일 때만 강도(살살/스파르타) 노출.
// 강도는 AI 분해에만 쓰이므로 알아서 모드에선 감춘다. 기본 프리선택(추천·살살)으로 스킵 방지.
export default function ModePage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  // /goal 에서 뒤로 올 때 이전 선택 복원 — 새로 들어오면 기본값(추천·살살).
  const [mode, setMode] = useState(state?.mode || 'gentle')
  const [inputMethod, setInputMethod] = useState(state?.inputMethod || 'recommend')

  const next = () => navigate('/goal', { state: { mode, inputMethod } })

  return (
    <AppScreen padTop={22} seed={21} density={50} dim nebula={false}>
      <BackRow label="뒤로" to="/" />
      <Kicker>NAVIGATION STYLE</Kicker>
      <h1 className={styles.title}>당신만의 항해 스타일을<br />선택하세요</h1>
      <p className={styles.sub}>언제든 설정에서 목표별로 바꿀 수 있어요.</p>

      <Kicker>입력 방식</Kicker>
      <div className={styles.radios} role="radiogroup" aria-label="입력 방식">
        <RadioRow
          label="알아서" sub="— 우주 항해사 없이 직접 입력할게요"
          selected={inputMethod === 'auto'} onSelect={() => setInputMethod('auto')}
        />
        <RadioRow
          label="추천" sub="— 우주 항해사가 목표를 분해해줘요"
          selected={inputMethod === 'recommend'} onSelect={() => setInputMethod('recommend')} last
        />
      </div>

      {/* 강도(살살/스파르타)는 AI 분해 프롬프트에만 영향 → 추천일 때만 노출. */}
      {inputMethod === 'recommend' && (
        <>
          <Kicker>강도 · 목표치</Kicker>
          <div className={styles.cards}>
            {MODES.map((m) => (
              <ModeCard key={m.key} mode={m} selected={mode === m.key} onSelect={() => setMode(m.key)} />
            ))}
          </div>
        </>
      )}

      <div className={styles.spacer} />
      <Button fullWidth onClick={next}>다음&ensp;▸</Button>
    </AppScreen>
  )
}
