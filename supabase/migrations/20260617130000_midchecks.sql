-- 중간점검 결과 보관 — 점검 1회 = 1행. 상태/판정/문구/통계 스냅샷(이력·학습 자산).
-- RLS: 본인 은하의 점검만(galaxy 경유) — lum_stars/lum_planets 정책과 동일 패턴.
create table if not exists lumiverse_midchecks (
  id             uuid primary key default gen_random_uuid(),
  galaxy_id      uuid not null references lumiverse_galaxies(id) on delete cascade,
  state          text not null,             -- early|steady|plateau|at_risk
  verdict        text not null,             -- encourage|go|supplement|finish
  reason         text,
  message        text,
  completion_pct int,                        -- 지난 별 달성률(%)
  overall_pct    int,                        -- 은하 전체 진행률(선명도, %)
  streak         int,
  created_at     timestamptz default now()
);

create index if not exists idx_lum_midchecks_galaxy on lumiverse_midchecks (galaxy_id, created_at desc);

alter table lumiverse_midchecks enable row level security;

create policy "lum_midchecks_all_own" on lumiverse_midchecks for all
  using (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_midchecks.galaxy_id and g.user_id = auth.uid()))
  with check (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_midchecks.galaxy_id and g.user_id = auth.uid()));
