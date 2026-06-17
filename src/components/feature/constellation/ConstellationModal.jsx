import { useEffect, useState } from 'react'
import Button from '../../ui/Button'
import Kicker from '../../ui/Kicker'
import { Sparkle } from '../../ui/icons'
import ConstellationArt from './ConstellationArt'
import { useGoals } from '../../../store/GoalStore'
import { fetchConstellationSymbols } from '../../../lib/api'
import { useAsync } from '../../../hooks/useAsync'
import { friendlyError } from '../../../lib/errors'
import styles from './ConstellationModal.module.css'

// 별자리 만들기 모달 — 상징 후보 로드 → 선택 → 생성 → 완성 연출.
export default function ConstellationModal({ goal, onClose }) {
  const { createConstellation } = useGoals()
  const { status, data, error, run } = useAsync(fetchConstellationSymbols)
  const [picked, setPicked] = useState(null)
  const [creating, setCreating] = useState(false)
  const [born, setBorn] = useState(false) // 완성 연출 단계

  useEffect(() => {
    run({ goal: goal.title, intensity: goal.intensity }).catch(() => {})
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const create = async () => {
    if (!picked || creating) return
    setCreating(true)
    try {
      await createConstellation(goal.id, picked, goal.starsEarned)
      setBorn(true)
    } catch {
      /* status 가 아니라 별도 — 간단히 alert 대신 무시하고 버튼 유지 */
      setCreating(false)
    }
  }

  const symbols = data?.symbols || []
  const loading = status === 'loading' || status === 'idle'

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="닫기">✕</button>

        {born ? (
          <div className={styles.born}>
            <div className={styles.bigArt}>
              <ConstellationArt seed={goal.id} count={goal.starsEarned} symbol={picked} size={180} />
              <Sparkle size={12} className={styles.sp1} />
              <Sparkle size={8} className={styles.sp2} />
            </div>
            <div className={styles.bornTitle}>별자리가 태어났어요</div>
            <p className={styles.bornSub}>{goal.title} · 별 {goal.starsEarned}개</p>
            <Button fullWidth onClick={onClose}>완료</Button>
          </div>
        ) : (
          <>
            <Kicker>CONSTELLATION</Kicker>
            <h2 className={styles.title}>별자리 만들기</h2>
            <p className={styles.lead}>{goal.title} — 별 {goal.starsEarned}개를 모았어요. 어울리는 상징을 골라 별자리로 남겨요.</p>

            {loading ? (
              <div className={styles.state}><Sparkle size={14} /> <span>상징을 고르는 중…</span></div>
            ) : status === 'error' ? (
              <p className={styles.state}>
                {friendlyError(error)} <button className={styles.retry} onClick={() => run({ goal: goal.title, intensity: goal.intensity }).catch(() => {})}>다시 시도</button>
              </p>
            ) : (
              <div className={styles.grid}>
                {symbols.map((s, i) => (
                  <button
                    key={`${s.symbol}-${i}`}
                    type="button"
                    className={`${styles.symbol} ${picked === s.symbol ? styles.symbolOn : ''}`}
                    onClick={() => setPicked(s.symbol)}
                    aria-pressed={picked === s.symbol}
                  >
                    <span className={styles.emoji}>{s.symbol}</span>
                    {s.label && <span className={styles.label}>{s.label}</span>}
                  </button>
                ))}
              </div>
            )}

            <Button fullWidth onClick={create} disabled={!picked || creating}>
              {creating ? '별자리를 그리는 중…' : '별자리 만들기 ✦'}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
