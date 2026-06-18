import { Suspense, useMemo } from 'react'
import * as THREE from 'three'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useTexture } from '@react-three/drei'
import { useTheme } from '../../../hooks/useTheme'
import { asset } from '../../../lib/asset'
import { galaxyPositions } from './galaxyLayout'
import Galaxy3D from './Galaxy3D'

const PLANET_URL = asset('assets/celestial/planet_2.png')

// 행성 텍스처를 1회 로드해 모든 은하에 공유(useTexture는 URL 단위 캐시).
// Canvas 내부 + Suspense 경계 안에서 호출해야 안전.
function Galaxies({ goals, positions, dot, mid, additive, onHover, onSelect }) {
  const planetTex = useTexture(PLANET_URL)
  planetTex.colorSpace = THREE.SRGBColorSpace // 빈티지 일러스트 색 보존
  return goals.map((goal, i) => (
    <Galaxy3D
      key={goal.id}
      goal={goal}
      position={positions[i]}
      color={dot}
      colorMid={mid}
      additive={additive}
      planetTex={planetTex}
      onHover={onHover}
      onSelect={onSelect}
    />
  ))
}

// 테마별 점/글로우 색 — 흑백+갱지 톤 유지.
// dot=밝은톤(체크한 별·행성·글로우), mid=중간톤(체크 안 한 별).
const COLORS = {
  ink: { dot: '#ece9e2', mid: '#8f897b', additive: true }, // 어두운 우주 위 아이보리 발광
  paper: { dot: '#171310', mid: '#6e6555', additive: false }, // 갱지 위 먹점
}

// 실시간 3D 우주 — 여러 은하계를 디스크에 흩뿌리고 회전/줌/클릭을 지원.
export default function UniverseScene({ goals, onHover, onSelect }) {
  const theme = useTheme()
  const { dot, mid, additive } = COLORS[theme] || COLORS.ink

  const positions = useMemo(() => galaxyPositions(goals), [goals])

  return (
    <Canvas
      camera={{ position: [0, 6, 17], fov: 55, near: 0.1, far: 200 }}
      dpr={[1, 2]}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <ambientLight intensity={0.7} />
      <pointLight position={[12, 14, 10]} intensity={1.1} />
      <pointLight position={[-12, -8, -10]} intensity={0.4} />

      <Suspense fallback={null}>
        <Galaxies
          goals={goals}
          positions={positions}
          dot={dot}
          mid={mid}
          additive={additive}
          onHover={onHover}
          onSelect={onSelect}
        />
      </Suspense>

      <OrbitControls
        enablePan
        screenSpacePanning
        panSpeed={0.8}
        enableDamping
        dampingFactor={0.08}
        minDistance={7}
        maxDistance={34}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.88}
        rotateSpeed={0.7}
        zoomSpeed={0.8}
      />
    </Canvas>
  )
}
