import { NavLink } from 'react-router-dom'
import styles from './BottomNav.module.css'
import { NavIcon } from '../ui/icons'

const TABS = [
  { to: '/app', label: '우주', kind: 'universe' },
  { to: '/app/today', label: '투두', kind: 'todo' },
  { to: '/app/blackhole', label: '블랙홀', kind: 'blackhole' },
  { to: '/app/check', label: '점검', kind: 'check' },
  { to: '/app/settings', label: '설정', kind: 'settings' },
]

// 하단 탭 내비 organism — 모바일 단순 내비. NavLink 가 활성 탭을 표시.
export default function BottomNav() {
  return (
    <nav className={styles.nav} aria-label="주요 메뉴">
      {TABS.map(({ to, label, kind }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/app'}
          className={({ isActive }) => `${styles.tab} ${isActive ? styles.active : ''}`}
        >
          <NavIcon kind={kind} />
          <span className={styles.label}>{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
