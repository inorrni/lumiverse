import styles from './CosmicBackground.module.css'
import { asset } from '../../lib/asset'
import { useTheme } from '../../hooks/useTheme'

// 배경 organism — 배경 이미지 한 장으로 전체를 덮는다.
// 먹(기본) 테마는 우주 사진, 갱지 테마는 종이질감(Card 와 동일 텍스처)을 깐다.
// AppScreen 안에서 절대배치로 깔린다. 장식이므로 aria-hidden.
// dim: 내부 화면에서 살짝 어둡게 덮어 본문 가독성 확보.
export default function CosmicBackground({ dim = false }) {
  const isPaper = useTheme() === 'paper'
  return (
    <div className={styles.bg} aria-hidden="true">
      <img
        className={styles.image}
        src={asset(isPaper ? 'assets/bg/paper.webp' : 'assets/bg/space.webp')}
        alt=""
      />
      {dim && <div className={styles.dim} />}
    </div>
  )
}
