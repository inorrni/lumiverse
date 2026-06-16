// 천체 이미지 atom — public/assets/celestial 의 PNG 를 감싼다.
// 장식이므로 기본 alt="". 경로는 asset() 로 배포 base 에 맞춘다.
import { asset } from '../../lib/asset'

export function Planet({ size = 64, alt = '', style }) {
  return <img src={asset('assets/celestial/planet.png')} alt={alt} width={size} height={size}
    style={{ flex: 'none', objectFit: 'contain', ...style }} />
}

export function BlackHole({ size = 56, alt = '', style }) {
  return <img src={asset('assets/celestial/blackhole.png')} alt={alt} width={size} height={size}
    style={{ flex: 'none', objectFit: 'contain', ...style }} />
}

export function Constellation({ w = 110, h = 54, dim = false, alt = '', style }) {
  return <img src={asset('assets/celestial/constellation.png')} alt={alt} width={w} height={h}
    style={{ flex: 'none', opacity: dim ? 0.36 : 0.88, objectFit: 'contain', ...style }} />
}

export function Galaxy({ size = 80, alt = '', style }) {
  return <img src={asset('assets/celestial/galaxy.png')} alt={alt} width={size} height={size}
    style={{ flex: 'none', objectFit: 'contain', ...style }} />
}
