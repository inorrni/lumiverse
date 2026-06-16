import styles from './Toggle.module.css'

// 스위치 atom — 제어형. on/onChange. role=switch.
export default function Toggle({ on = false, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      className={styles.btn}
      onClick={() => onChange?.(!on)}
    >
      <span className={`${styles.track} ${on ? styles.on : ''}`}>
        <span className={styles.knob} />
      </span>
    </button>
  )
}
