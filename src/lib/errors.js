// 기술 에러 → 사용자 친화 문구 매핑.
// 규칙: NetworkError → 인터넷 연결 확인, 401 → 로그인 필요, 500 → 서버 일시 오류.
export function friendlyError(err) {
  const msg = (err && err.message) || String(err || '')
  if (/network|failed to fetch|networkerror/i.test(msg)) return '인터넷 연결을 확인해 주세요.'
  if (/\b401\b|unauthorized/i.test(msg)) return '로그인이 필요해요.'
  if (/\b429\b|too many/i.test(msg)) return '요청이 많아요. 잠시 후 다시 시도해 주세요.'
  if (/\b5\d\d\b|server/i.test(msg)) return '서버에 일시적인 문제가 생겼어요. 다시 시도해 주세요.'
  return 'AI가 목표를 분해하지 못했어요. 다시 시도해 주세요.'
}
