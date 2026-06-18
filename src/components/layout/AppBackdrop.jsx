import styles from './AppBackdrop.module.css'
import { asset } from '../../lib/asset'
import { useTheme } from '../../hooks/useTheme'

// 전체 뷰포트를 덮는 앰비언트 배경. 가운데 앱 컬럼(.screen, max 430px) 뒤에 깔려
// 넓은 화면(펼친 폴드·태블릿·데스크톱)에서 양옆 검은 여백을 우주로 채운다.
// 컬럼이 화면을 꽉 채우는 폰에선 컬럼에 완전히 가려 보이지 않는다. 장식이라 aria-hidden.
export default function AppBackdrop() {
  const isPaper = useTheme() === 'paper'
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <img
        className={styles.image}
        src={asset(isPaper ? 'assets/bg/paper.webp' : 'assets/bg/space.webp')}
        alt=""
      />
    </div>
  )
}
