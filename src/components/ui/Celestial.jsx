// 천체 이미지 atom — public/assets/celestial 의 PNG 를 감싼다.
// 장식이므로 기본 alt="".

export function Planet({ size = 64, alt = '', style }) {
  return <img src="/assets/celestial/planet.png" alt={alt} width={size} height={size}
    style={{ flex: 'none', objectFit: 'contain', ...style }} />
}

export function BlackHole({ size = 56, alt = '', style }) {
  return <img src="/assets/celestial/blackhole.png" alt={alt} width={size} height={size}
    style={{ flex: 'none', objectFit: 'contain', ...style }} />
}

export function Constellation({ w = 110, h = 54, dim = false, alt = '', style }) {
  return <img src="/assets/celestial/constellation.png" alt={alt} width={w} height={h}
    style={{ flex: 'none', opacity: dim ? 0.36 : 0.88, objectFit: 'contain', ...style }} />
}
