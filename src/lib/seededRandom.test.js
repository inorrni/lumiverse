import { describe, it, expect } from 'vitest'
import { hashSeed, mulberry32, rngFor } from './seededRandom'

describe('hashSeed', () => {
  it('같은 입력은 같은 해시(결정적)', () => expect(hashSeed('goal-1')).toBe(hashSeed('goal-1')))
  it('다른 입력은 다른 해시', () => expect(hashSeed('a')).not.toBe(hashSeed('b')))
  it('부호 없는 32bit 정수', () => {
    const h = hashSeed('x')
    expect(Number.isInteger(h)).toBe(true)
    expect(h).toBeGreaterThanOrEqual(0)
  })
})

describe('mulberry32 / rngFor', () => {
  it('[0,1) 범위', () => {
    const rnd = mulberry32(123)
    for (let i = 0; i < 100; i++) {
      const v = rnd()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
  it('같은 seed → 같은 시퀀스(결정적)', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    expect([a(), a(), a()]).toEqual([b(), b(), b()])
  })
  it('다른 seed → 다른 첫 값', () => {
    expect(mulberry32(1)()).not.toBe(mulberry32(2)())
  })
  it('rngFor 는 문자열 seed로 결정적', () => {
    expect(rngFor('seed-A')()).toBe(rngFor('seed-A')())
  })
})
