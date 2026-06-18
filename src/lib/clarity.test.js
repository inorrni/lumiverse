import { describe, it, expect } from 'vitest'
import { planetClarity, galaxyClarity } from './clarity'

describe('planetClarity', () => {
  it('별이 없으면 0', () => expect(planetClarity([])).toBe(0))
  it('절반 완료 → 50', () => expect(planetClarity([{ done: true }, { done: false }])).toBe(50))
  it('전부 완료 → 100', () => expect(planetClarity([{ done: true }, { done: true }])).toBe(100))
  it('1/3 반올림 → 33', () => expect(planetClarity([{ done: true }, { done: false }, { done: false }])).toBe(33))
})

describe('galaxyClarity', () => {
  it('행성이 없으면 0', () => expect(galaxyClarity([])).toBe(0))
  it('행성 선명도 평균', () =>
    expect(galaxyClarity([{ stars: [{ done: true }] }, { stars: [{ done: false }] }])).toBe(50))
  it('빈 별 행성은 0으로 포함', () =>
    expect(galaxyClarity([{ stars: [{ done: true }, { done: true }] }, { stars: [] }])).toBe(50))
})
