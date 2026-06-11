# Lumiverse (가제)

AI가 목표를 작은 단계로 쪼개고, 매일의 행동을 별로 보상하며, 진행할수록 나만의 천체가 선명해지는 게임화 목표관리 서비스.

> 막연해서 못 시작하고, 보상이 멀어 못 버티는 사람에게 — AI가 목표를 쪼개주고(실행), 매일의 작은 보상(별)을 눈에 보이게 준다(지속).

## 컨셉 — SNR 우주

천문 관측의 **SNR(신호 대 잡음비)**: 희미한 천체도 관측을 누적하면 잡음을 뚫고 또렷해진다. 매일의 투두 체크(=관측)가 쌓이면 별 → 행성 → 은하계가 점점 선명해진다.

| 천체 | 매핑 | 선명화 규칙 |
|---|---|---|
| **별** | 매일의 투두 | 체크 즉시 on/off (디데이 일수만큼 생성) |
| **행성** | 세부목표 (3~5개) | 별 50% 활성화 / 100% 또렷 |
| **은하계** | 목표 | 행성 평균 선명도 |
| **별자리** | 은하계당 1개 | 별 14개↑ 모이면 생성 가능 |
| **블랙홀** | 폐기·재도전 보관함 | 삭제 아닌 보존·복원 |

## 핵심 기능

1. **AI 목표 분해** — 목표 + 디데이 → 세부목표(행성) 3~5개 + 매일의 투두(별)
2. **데일리 투두 체크** — 별 선명화로 즉각 보상
3. **천체 게임화 시각화** — 별→행성→은하계, 별자리, 블랙홀 (Canvas/SVG)
4. **AI 중간점검** — 누적 이력 기반 `강도↑(go) / 보완 / 종료(finish)` 판단
5. **블랙홀** — 포기한 목표를 비-처벌적으로 보관, 재도전 시 복원

## 스택

| 영역 | 기술 |
|---|---|
| **Frontend** | Vite + React (PWA) + Canvas/SVG (천체 렌더) |
| **Backend** | Python FastAPI (Render) |
| **DB / Auth** | Supabase (PostgreSQL + Auth, JWT) |
| **LLM** | Groq (Llama 3.3 70B, 무료) — 메인 / Solar(Upstage) 이달까지 |
| **배포** | Vercel (FE) + Render (BE) |

## 빠른 시작 (프론트엔드)

```bash
git clone https://github.com/inorrni/lumiverse.git
cd lumiverse
cp .env.example .env.local   # 개발용 키 입력 (커밋되지 않음)
npm install                  # (package.json이 있을 때)
npm run dev
```

> LLM API 키는 클라이언트에 두지 않고 **백엔드(FastAPI) 서버 환경변수**로만 보관합니다.

## 협업 가이드

- 📋 **[협업 가이드 (CONTRIBUTING.md)](CONTRIBUTING.md)** — 브랜치·커밋·PR 규칙부터 읽으세요.
- 🛠 [환경설정 A to Z](docs/github/0_환경설정.md) — 내 컴퓨터 세팅 (한 번만)
- 🌿 [Claude Code로 git 하기](docs/github/1_깃_협업_클로드코드.md) — 매일의 작업 흐름
- 🔒 [보안 체크리스트](docs/github/2_보안_체크리스트.md) — 키·.env 다루기
- 🆘 [오류방지 FAQ](docs/github/3_오류방지_FAQ.md) — 막혔을 때
