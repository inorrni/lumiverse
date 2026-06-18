import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { planetLayout, starCloud, splitByShape, galaxyExtent, constellationLoop } from './galaxyLayout'
import { getDotTexture, getStarTextures } from './dotTexture'

// 큰 점(행성/step) — planet 일러스트를 카메라 향한 빌보드 스프라이트로.
// 진행도에 따라 크기, 선명도(clarity)에 따라 또렷함(opacity)을 반영.
// 스케일을 이미지 실제 가로:세로 비율에 맞춰 찌그러짐 방지(높이 기준).
function Planet({ data, tex }) {
  const s = data.size * 6.4 // 스프라이트 월드 스케일(세로 기준)
  const img = tex?.image
  const aspect = img && img.height ? img.width / img.height : 1
  return (
    <sprite position={data.pos} scale={[s * aspect, s, 1]}>
      <spriteMaterial map={tex} transparent opacity={0.6 + 0.4 * (1 - data.noise)} depthWrite={false} />
    </sprite>
  )
}

// 작은 점(별) 구름 — Three.Points 한 덩어리.
function StarPoints({ positions, color, tex, blending, opacity, size }) {
  if (!positions || positions.length === 0) return null
  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        sizeAttenuation
        blending={blending}
      />
    </points>
  )
}

// 단일 은하계 — 큰 점(행성) + 작은 점(별: 체크=밝은톤 / 미체크=중간톤) + 중심 글로우.
export default function Galaxy3D({ goal, position, color, colorMid, additive, planetTex, onHover, onSelect }) {
  const group = useRef()
  const [hovered, setHovered] = useState(false)

  const planets = useMemo(() => planetLayout(goal), [goal])
  const glowTex = useMemo(() => getDotTexture(), [])
  const starTex = useMemo(() => getStarTextures(), []) // [4각, 5각, 6각]

  // 행성·별 개수로 은하 반경을 정해 글로우·별 퍼짐을 콘텐츠에 맞춘다.
  const extent = useMemo(() => galaxyExtent(goal), [goal])

  // 배정된 전체 별을 흩뿌린 뒤 앞쪽 done개=체크(밝은톤) / 나머지=미체크(중간톤),
  // 각 그룹을 다시 별 모양 3종으로 분리.
  const allStars = useMemo(() => starCloud(goal.stars, goal.id, { radius: extent }), [goal.stars, goal.id, extent])
  const doneCount = Math.min(goal.starsEarned, goal.stars)
  const checkedPos = useMemo(() => allStars.subarray(0, doneCount * 3), [allStars, doneCount])
  const checkedShapes = useMemo(() => splitByShape(checkedPos, 3), [checkedPos])
  const uncheckedShapes = useMemo(() => splitByShape(allStars.subarray(doneCount * 3), 3), [allStars, doneCount])

  // 별자리 — 달성(constellation 생성)했을 때만 체크된 별들을 각도순 닫힌 윤곽으로 잇는다.
  const constLoop = useMemo(() => (goal.constellation ? constellationLoop(checkedPos) : null), [checkedPos, goal.constellation])

  const glow = 0.25 + 0.55 * (goal.clarity / 100)
  const blending = additive ? THREE.AdditiveBlending : THREE.NormalBlending

  useFrame((_, delta) => {
    const g = group.current
    if (!g) return
    g.rotation.y += delta * 0.12
    const target = hovered ? 1.18 : 1
    g.scale.x += (target - g.scale.x) * Math.min(1, delta * 8)
    g.scale.y = g.scale.z = g.scale.x
  })

  const onOver = (e) => {
    e.stopPropagation()
    setHovered(true)
    onHover?.(goal, true)
    document.body.style.cursor = 'pointer'
  }
  const onOut = () => {
    setHovered(false)
    onHover?.(goal, false)
    document.body.style.cursor = 'auto'
  }

  // 드래그(회전/팬)와 진짜 클릭(탭) 구분 — 누른 위치에서 거의 안 움직였을 때만 이동.
  const down = useRef(null)
  const onDown = (e) => {
    e.stopPropagation()
    down.current = { x: e.clientX, y: e.clientY }
  }
  const onClick = (e) => {
    e.stopPropagation()
    const d = down.current
    down.current = null
    if (!d) return // 이 은하에서 시작한 누름이 아니면(=빈 공간에서 드래그해 옴) 무시
    const moved = Math.hypot(e.clientX - d.x, e.clientY - d.y)
    if (moved > 6) return // 6px 이상 움직였으면 드래그로 보고 이동 안 함
    onSelect(goal.id)
  }

  return (
    <group ref={group} position={position}>
      {/* 클릭/hover 판정용 투명 구(은하 전체 범위) */}
      <mesh onPointerOver={onOver} onPointerOut={onOut} onPointerDown={onDown} onClick={onClick}>
        <sphereGeometry args={[Math.max(extent * 0.82, 1.3), 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* 중심 글로우 — 행성·별을 가리지 않도록 아주 옅은 후광만. 테두리 페이드는 텍스처 그대로 */}
      <sprite scale={[extent * 2.2, extent * 2.2, 1]}>
        <spriteMaterial map={glowTex} color={color} transparent opacity={glow * 0.2} depthWrite={false} blending={blending} />
      </sprite>

      {/* 별자리 윤곽 — 체크된 별들을 각도순 닫힌 루프로 연결 */}
      {constLoop && (
        <lineLoop>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[constLoop, 3]} />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.45} depthWrite={false} blending={blending} />
        </lineLoop>
      )}

      {/* 별: 체크=밝은톤 / 미체크=중간톤, 각 모양 3종 */}
      {checkedShapes.map((pos, s) => (
        <StarPoints key={`c${s}`} positions={pos} color={color} tex={starTex[s]} blending={blending} opacity={0.95} size={0.3} />
      ))}
      {uncheckedShapes.map((pos, s) => (
        <StarPoints key={`u${s}`} positions={pos} color={colorMid} tex={starTex[s]} blending={blending} opacity={0.6} size={0.22} />
      ))}

      {/* 큰 점(행성) — planet.png 스프라이트 */}
      {planets.map((p) => (
        <Planet key={p.id} data={p} tex={planetTex} />
      ))}
    </group>
  )
}
