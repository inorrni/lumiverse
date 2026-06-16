import { enumerateDatesISO } from './date'

// 별 인스턴스화 — 행성의 대표 투두 패턴(todo_pattern)을 디데이 기간의
// 각 날짜에 순환 배치해 별(투두) 배열을 만든다. (아키텍처 v4 §5-2 토큰 절약 설계)
//
// todoPattern: [{ title }] | undefined  ·  fallbackTitle: 패턴 없을 때 쓸 제목
// 반환: [{ due_date: 'YYYY-MM-DD', title }]
export function instantiateStars(todoPattern, startISO, endISO, fallbackTitle = '오늘의 한 걸음') {
  const pattern =
    Array.isArray(todoPattern) && todoPattern.length
      ? todoPattern
      : [{ title: fallbackTitle }]
  const dates = enumerateDatesISO(startISO, endISO)
  return dates.map((due_date, i) => ({
    due_date,
    title: pattern[i % pattern.length]?.title || fallbackTitle,
  }))
}
