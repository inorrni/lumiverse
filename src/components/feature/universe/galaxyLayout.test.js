import { describe, it, expect } from 'vitest'
import { constellationLoop, splitByShape, galaxyExtent } from './galaxyLayout'

// xyz 평탄 배열 헬퍼
const pts = (...xyz) => new Float32Array(xyz)

describe('constellationLoop', () => {
  it('점 3개 미만이면 null', () => {
    expect(constellationLoop(pts(0, 0, 0, 1, 0, 1))).toBeNull()
    expect(constellationLoop(new Float32Array([]))).toBeNull()
  })

  it('입력 점들의 순열을 반환(개수·구성 보존)', () => {
    const input = pts(1, 0, 1, -1, 0, 1, -1, 0, -1, 1, 0, -1) // 정사각 4점
    const out = constellationLoop(input)
    expect(out).toHaveLength(input.length) // n*3, 닫는 점은 LineLoop가 처리
    // 같은 점 집합인지(키 집합 비교)
    const key = (a, i) => `${a[i]},${a[i + 1]},${a[i + 2]}`
    const setOf = (a) => new Set(Array.from({ length: a.length / 3 }, (_, i) => key(a, i * 3)))
    expect(setOf(out)).toEqual(setOf(input))
  })

  it('무게중심 기준 각도(xz)가 단조 증가하도록 정렬', () => {
    // 일부러 섞은 정사각 모서리
    const out = constellationLoop(pts(1, 0, 1, 1, 0, -1, -1, 0, 1, -1, 0, -1))
    const n = out.length / 3
    let cx = 0, cz = 0
    for (let i = 0; i < n; i++) { cx += out[i * 3]; cz += out[i * 3 + 2] }
    cx /= n; cz /= n
    const angles = Array.from({ length: n }, (_, i) => Math.atan2(out[i * 3 + 2] - cz, out[i * 3] - cx))
    for (let i = 1; i < angles.length; i++) expect(angles[i]).toBeGreaterThanOrEqual(angles[i - 1])
  })
})

describe('splitByShape', () => {
  it('점들을 buckets개로 나누고 총 개수 보존', () => {
    const input = pts(0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4) // 5점
    const groups = splitByShape(input, 3)
    expect(groups).toHaveLength(3)
    const totalPts = groups.reduce((n, g) => n + g.length / 3, 0)
    expect(totalPts).toBe(5)
    // i % 3 분배: bucket0=2점, bucket1=2점, bucket2=1점
    expect(groups.map((g) => g.length / 3)).toEqual([2, 2, 1])
  })
})

describe('galaxyExtent', () => {
  it('최소 반경 보장', () => {
    expect(galaxyExtent({ steps: [], stars: 0 })).toBeGreaterThanOrEqual(1.4)
  })
  it('행성·별이 많을수록 커진다', () => {
    const small = galaxyExtent({ steps: [{}], stars: 1 })
    const big = galaxyExtent({ steps: [{}, {}, {}, {}, {}], stars: 40 })
    expect(big).toBeGreaterThan(small)
  })
})
