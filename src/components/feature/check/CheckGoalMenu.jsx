import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './CheckGoalMenu.module.css'

// 점검 대상 선택 — 제목 옆 햄버거. 클릭 시 깃트리(세로선+점)로 목표를 나열.
// value='' → 전체(내 우주 점검, /app/check) · value=goalId → 해당 목표(/app/check/:id)
export default function CheckGoalMenu({ goals, value = '' }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const go = (id) => {
    setOpen(false)
    navigate(id ? `/app/check/${id}` : '/app/check')
  }

  const nodes = [{ id: '', title: '전체 — 내 우주 점검' }, ...goals.map((g) => ({ id: g.id, title: g.title }))]

  return (
    <div className={styles.root} ref={ref}>
      <button
        type="button"
        className={styles.trigger}
        aria-label="점검 대상 선택"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
      </button>

      {open && (
        <div className={styles.menu} role="menu">
          <ul className={styles.tree}>
            {nodes.map((n) => {
              const active = n.id === value
              return (
                <li key={n.id || 'all'} className={styles.node}>
                  <button
                    type="button"
                    role="menuitem"
                    className={`${styles.item} ${active ? styles.itemOn : ''}`}
                    onClick={() => go(n.id)}
                  >
                    <span className={styles.dot} aria-hidden="true" />
                    <span className={styles.label}>{n.title}</span>
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
