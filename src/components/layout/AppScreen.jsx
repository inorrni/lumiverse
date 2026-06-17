import styles from './AppScreen.module.css'
import CosmicBackground from './CosmicBackground'

// 모든 화면을 감싸는 셸 organism — 우주 배경 + 스크롤 본문 + (옵션) 하단 내비.
// 페이지는 레이아웃을 신경 쓰지 않고 children 만 채운다.
export default function AppScreen({
  children, nav = null, padTop, seed, bg = true,
  nebula = true, density, dim = false, brightness,
}) {
  return (
    <div className={styles.screen}>
      {bg && <CosmicBackground seed={seed} nebula={nebula} density={density} dim={dim} brightness={brightness} />}
      <main
        className={styles.content}
        style={padTop !== undefined ? { '--pad-top': `${padTop}px` } : undefined}
      >
        {children}
      </main>
      {nav && <div className={styles.nav}>{nav}</div>}
    </div>
  )
}
