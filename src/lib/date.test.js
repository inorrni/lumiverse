import { describe, it, expect } from 'vitest'
import { formatDday, ddayDelta, todayISO, addDaysISO } from './date'

describe('formatDday', () => {
  it('YYYY-MM-DD → YYYY.MM.DD', () => expect(formatDday('2026-07-01')).toBe('2026.07.01'))
  it('미선택이면 null', () => expect(formatDday(null)).toBe(null))
})

describe('ddayDelta', () => {
  it('미선택이면 null', () => expect(ddayDelta(null)).toBe(null))
  it('오늘 → 0', () => expect(ddayDelta(todayISO())).toBe(0))
  it('미래 → 양수', () => expect(ddayDelta(addDaysISO(todayISO(), 5))).toBe(5))
  it('과거 → 음수(daysUntil 과 달리 버리지 않음)', () => expect(ddayDelta(addDaysISO(todayISO(), -3))).toBe(-3))
})
