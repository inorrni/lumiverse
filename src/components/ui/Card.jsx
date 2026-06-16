import styles from './Card.module.css'
import { asset } from '../../lib/asset'

// 종이질감 텍스처 — paper 변형 배경. asset()으로 배포 하위경로(BASE_URL) 보정.
const PAPER_TEXTURE = `url(${asset('assets/bg/paper.png')})`

// 카드 atom. variant: hair(반투명 헤어라인, 기본) | paper(종이질감 포인트).
// pad 로 패딩 오버라이드, 나머지 스타일은 style 로 합성.
export default function Card({ variant = 'hair', pad, className = '', style, children, ...rest }) {
  const padStyle = pad !== undefined ? { padding: pad } : null

  if (variant === 'paper') {
    return (
      <div
        className={`${styles.paper} ${className}`}
        style={{ backgroundImage: PAPER_TEXTURE, ...padStyle, ...style }}
        {...rest}
      >
        {children}
      </div>
    )
  }
  return (
    <div className={`${styles.hair} ${className}`} style={{ ...padStyle, ...style }} {...rest}>
      {children}
    </div>
  )
}
