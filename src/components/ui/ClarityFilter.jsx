import { useId } from 'react'

// 달성률(clarity 0~100)에 반비례하는 블러+노이즈 필터 래퍼.
// clarity 미전달 시 이미지만 렌더(효과 없음).
// 사용법: <ClarityFilter src={imgSrc} size={64} clarity={step.clarity} />
export default function ClarityFilter({ src, size = 64, alt = '', clarity, style }) {
  const uid = useId().replace(/[^a-z0-9]/gi, '')

  if (clarity === undefined || clarity === null) {
    return (
      <img src={src} alt={alt} width={size} height={size}
        style={{ flex: 'none', objectFit: 'contain', ...style }} />
    )
  }

  const noiseOpacity = Math.max(0, (100 - clarity) / 100)
  const blurPx = (noiseOpacity * 4).toFixed(1)

  return (
    <div style={{ position: 'relative', width: size, height: size, flex: 'none', flexShrink: 0, ...style }}>
      <img src={src} alt={alt} width={size} height={size}
        style={{ objectFit: 'contain', display: 'block', filter: `blur(${blurPx}px)` }} />
      <svg
        style={{
          position: 'absolute', top: 0, left: 0,
          width: '100%', height: '100%',
          pointerEvents: 'none',
          opacity: noiseOpacity,
          maskImage: `url(${src})`,
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          WebkitMaskImage: `url(${src})`,
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
        }}
      >
        <defs>
          <filter id={uid}>
            <feTurbulence type="fractalNoise" baseFrequency="0.2" numOctaves="3" stitchTiles="stitch">
              <animate attributeName="seed" values="0;17;34;51;68;85" dur="1s" calcMode="discrete" repeatCount="indefinite" />
            </feTurbulence>
            <feColorMatrix type="saturate" values="0" />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${uid})`} />
      </svg>
    </div>
  )
}
