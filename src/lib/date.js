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

// 'YYYY-MM-DD' 에 n일을 더한 로컬 날짜 문자열.
export function addDaysISO(iso, n) {
  const [y, m, d] = iso.split('-').map(Number)
  const dt = new Date(y, m - 1, d + n)
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`
}

// [startISO, endISO] 양끝 포함 날짜 배열(로컬). end < start 면 빈 배열.
export function enumerateDatesISO(startISO, endISO) {
  const out = []
  const [sy, sm, sd] = startISO.split('-').map(Number)
  const [ey, em, ed] = endISO.split('-').map(Number)
  const cur = new Date(sy, sm - 1, sd)
  const end = new Date(ey, em - 1, ed)
  while (cur <= end) {
    out.push(`${cur.getFullYear()}-${pad(cur.getMonth() + 1)}-${pad(cur.getDate())}`)
    cur.setDate(cur.getDate() + 1)
  }
  return out
}
