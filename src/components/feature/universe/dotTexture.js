import * as THREE from 'three'

// 부드러운 원형 스프라이트 텍스처(별/글로우용)를 런타임 canvas로 1회 생성·캐시.
// 외부 이미지 에셋이 없어 GitHub Pages base 경로 문제에서 자유롭다.
let cached = null

export function getDotTexture() {
  if (cached) return cached
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  cached = tex
  return tex
}

// 뾰족한 별(spikes 개)을 흰색으로 채워 그린다.
function drawSpikeStar(ctx, cx, cy, spikes, outerR, innerR) {
  let rot = -Math.PI / 2
  const step = Math.PI / spikes
  ctx.beginPath()
  ctx.moveTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
  for (let i = 0; i < spikes; i++) {
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * innerR, cy + Math.sin(rot) * innerR)
    rot += step
    ctx.lineTo(cx + Math.cos(rot) * outerR, cy + Math.sin(rot) * outerR)
  }
  ctx.closePath()
  ctx.fill()
}

let starCache = null
// 빈티지 별 모양 3종(4각 스파클 / 5각 별 / 6각 트윙클) 텍스처 배열을 1회 생성·캐시.
// 모두 흰색으로 그려 머티리얼 color 로 톤 입힘.
export function getStarTextures() {
  if (starCache) return starCache
  const size = 96
  const c = size / 2
  // inner 비율을 낮춰 얇고 긴 바늘형 스파클. (값이 작을수록 가늘고 뾰족)
  const specs = [
    { spikes: 4, inner: 0.06 }, // 긴 4방향 스파클
    { spikes: 5, inner: 0.1 }, // 얇은 5각
    { spikes: 6, inner: 0.12 }, // 얇은 6각 트윙클
  ]
  starCache = specs.map(({ spikes, inner }) => {
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = size
    const ctx = canvas.getContext('2d')
    // 작고 옅은 중심 코어만 — 글로우가 스파클을 덮어 동그래 보이지 않게.
    const g = ctx.createRadialGradient(c, c, 0, c, c, c * 0.4)
    g.addColorStop(0, 'rgba(255,255,255,0.32)')
    g.addColorStop(0.6, 'rgba(255,255,255,0.05)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, size, size)
    // 얇고 긴 별 모양 — 끝까지 뻗게.
    ctx.fillStyle = 'rgba(255,255,255,1)'
    drawSpikeStar(ctx, c, c, spikes, c * 0.98, c * 0.98 * inner)
    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  })
  return starCache
}
