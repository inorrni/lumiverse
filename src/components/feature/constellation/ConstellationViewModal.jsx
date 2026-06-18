import { useEffect } from 'react'
import Button from '../../ui/Button'
import Kicker from '../../ui/Kicker'
import { Sparkle } from '../../ui/icons'
import ConstellationArt from './ConstellationArt'
import styles from './ConstellationModal.module.css'

// 완성된 별자리 보기 모달 — 대시보드 별자리 클릭 시 크게 본다(읽기 전용).
export default function ConstellationViewModal({ goal, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const c = goal.constellation
  if (!c) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="닫기">✕</button>
        <div className={styles.born}>
          <Kicker>CONSTELLATION</Kicker>
          <div className={styles.bigArt}>
            <ConstellationArt seed={goal.id} count={c.star_count} symbol={c.symbol} size={180} />
            <Sparkle size={12} className={styles.sp1} />
            <Sparkle size={8} className={styles.sp2} />
          </div>
          <div className={styles.bornTitle}>{goal.title}</div>
          <p className={styles.bornSub}>별 {c.star_count}개로 완성한 별자리</p>
          <Button fullWidth onClick={onClose}>닫기</Button>
        </div>
      </div>
    </div>
  )
}
