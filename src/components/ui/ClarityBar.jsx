import styles from './ClarityBar.module.css'

// 선명도(진행률) 바 atom — 12칸 세그먼트. pct(0~100) 만큼 채운다.
// 접근성: role=progressbar + aria 값.
export default function ClarityBar({ pct = 0, segs = 12, ink = false }) {
  const clamped = Math.max(0, Math.min(100, pct))
  const on = Math.round((segs * clamped) / 100)
  return (
    <div
      className={`${styles.bar} ${ink ? styles.ink : ''}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="선명도"
    >
      {Array.from({ length: segs }).map((_, i) => (
        <div key={i} className={`${styles.seg} ${i < on ? styles.on : ''}`} />
      ))}
    </div>
  )
}
