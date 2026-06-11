#!/bin/bash
# stdin으로 도구 입력(JSON)을 받아 시크릿 패턴 검사. 발견 시 exit 2 → 도구 실행 차단.
INPUT=$(cat)

# 탐지할 민감 정보 패턴
# - sk- / sk-ant- : OpenAI / Anthropic API 키
# - AIza...       : Google API 키
# - eyJhbGciOi    : JWT(Supabase service_role 키 등) — 실제 키 값만 잡고 단어 언급은 통과
PATTERNS='sk-[A-Za-z0-9]{20,}|sk-ant-[A-Za-z0-9-]{20,}|AIza[0-9A-Za-z_-]{30,}|eyJhbGciOi'

# -q: 결과 출력 생략, -E: 확장 정규식, -i: 대소문자 구분 없음
if echo "$INPUT" | grep -qEi "$PATTERNS"; then
  echo "[보안 알림] 민감한 시크릿 패턴이 감지되어 작업을 차단했습니다." >&2
  echo "비밀번호나 API 키는 소스코드에 직접 쓰지 말고 .env 파일로 분리하세요." >&2
  exit 2
fi

exit 0
