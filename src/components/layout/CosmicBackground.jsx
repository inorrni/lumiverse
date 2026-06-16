import styles from './CosmicBackground.module.css'
import { asset } from '../../lib/asset'

// 배경 organism — 배경 이미지 한 장으로 전체를 덮는다(코스믹/성운/별밭 생성 제거).
// AppScreen 안에서 절대배치로 깔린다. 장식이므로 aria-hidden.
// dim: 내부 화면에서 살짝 어둡게 덮어 본문 가독성 확보.
export default function CosmicBackground({ dim = false }) {
  return (
    <div className={styles.bg} aria-hidden="true">
      <img className={styles.image} src={asset('assets/bg/space.png')} alt="" />
      {dim && <div className={styles.dim} />}
    </div>
  )
}
