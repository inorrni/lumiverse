// 날짜 유틸 — 모두 로컬 달력 기준(toISOString 은 UTC 라 KST 에서 하루 밀림).

const DAY = 86400000
const WD = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
const pad = (n) => String(n).padStart(2, '0')

// 'YYYY-MM-DD' (로컬)
export function todayISO() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

// 'MM.DD WED' (대시보드/투두 헤더)
export function todayLabel() {
  const d = new Date()
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${WD[d.getDay()]}`
}

// 디데이까지 남은 일수(별 개수). 미선택/과거면 null.
export function daysUntil(dday) {
  if (!dday) return null
  const diff = Math.ceil((new Date(dday).getTime() - new Date(todayISO()).getTime()) / DAY)
  return diff > 0 ? diff : null
}
