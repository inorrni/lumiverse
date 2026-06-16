# Lumiverse 백엔드 (Supabase)

데이터(PostgreSQL) + 인증(Auth, JWT) + LLM 프록시(Edge Functions).
프론트는 `supabase-js`로 PostgREST에 직접 접근하고 **RLS**가 본인 데이터만 허용한다.
LLM 호출만 Edge Function으로 분리한다. (아키텍처 v4 기준)

```
supabase/
├── config.toml                       로컬 개발 설정 (auth redirect·카카오 주석 포함)
├── migrations/20260616090000_init.sql  스키마 + RLS + 트리거 + RPC
└── functions/
    ├── _shared/{cors,llm}.ts         CORS · LLM(OpenAI 호환) 래퍼
    └── goal-breakdown/index.ts       목표 분해(캐시·rate limit·JWT)
```

## 1. 프로젝트 연결

```bash
npm i -D supabase                       # 이미 devDependency
npx supabase login
npx supabase link --project-ref <PROJECT_REF>
```

프론트 `.env.local` (`.env.example` 복사):
```
VITE_SUPABASE_URL=https://<ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```

## 2. 스키마 배포

```bash
npx supabase db push        # 호스팅 DB에 마이그레이션 적용
# (Docker 있으면 로컬: npx supabase start && npx supabase db reset)
```

대시보드에서 확인 (모든 객체 `lumiverse_` 접두사 — 한 프로젝트 내 앱 네임스페이스):
테이블 6종 `lumiverse_profiles`/`_galaxies`/`_planets`/`_stars`/`_constellations`/`_llm_cache`,
각 테이블 RLS 활성화, `lumiverse_create_galaxy_with_planets` 함수, `lumiverse_on_auth_user_created` 트리거.

## 3. 인증 설정 (대시보드)

- **이메일**: Authentication > Providers > Email 활성화. 데모 편의를 위해
  **Confirm email**을 끄면 가입 즉시 로그인된다(켜면 메일 확인 필요).
- **카카오**: Authentication > Providers > Kakao 활성화 →
  카카오 개발자 앱의 **REST API 키 = Client ID**, **Client Secret** 입력.
  카카오 앱 Redirect URI = `https://<ref>.supabase.co/auth/v1/callback`.
- **Redirect URLs**: Authentication > URL Configuration 에
  `https://inorrni.github.io/lumiverse/` 와 로컬 `http://localhost:5173` 추가.

## 4. Edge Function 배포

LLM 키는 **secrets(서버측)** 에만 — 클라이언트/번들 금지.
```bash
# Solar(이달) — response_format(JSON 모드)은 solar-pro2 에서만 지원:
npx supabase secrets set LLM_API_KEY=<solar key> \
  LLM_BASE_URL=https://api.upstage.ai/v1 LLM_MODEL=solar-pro2
# Groq(7월~)로 전환: env 3개만 교체 (코드 변경 없음)
#   LLM_BASE_URL=https://api.groq.com/openai/v1  LLM_MODEL=llama-3.3-70b-versatile
# Solar API 키 발급: https://console.upstage.ai/api-keys

npx supabase functions deploy goal-breakdown
```

로컬 테스트:
```bash
npx supabase functions serve goal-breakdown
# JWT 필요 — 앱에서 로그인 후 supabase.functions.invoke 로 호출
```

## 5. 검증 체크리스트

- [ ] 다른 계정으로 로그인 시 타인 데이터 0건(RLS)
- [ ] 가입 시 `profiles` row 자동 생성(트리거)
- [ ] 목표 분해 → galaxy+planets+stars 생성(별 수 = 디데이 일수 × 행성 수)
- [ ] 동일 입력 2회차 분해 = `cached: true`(LLM 미호출)
- [ ] 별 체크 → `stars.done` 토글 + 선명도 상승, 새로고침 후 영속

> ⚠️ 무료 티어는 **7일 미접속 시 일시정지** — 데모 전 한 번 깨워둘 것.
