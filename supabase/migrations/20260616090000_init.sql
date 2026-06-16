-- Lumiverse 초기 스키마 (디데이-별 모델, 아키텍처 v4 §3-2)
-- User → Galaxy(목표) → Planet(세부목표) → Star(날짜별 투두) + Constellation + llm_cache
-- 모든 테이블 RLS: 본인 데이터만. supabase-js가 PostgREST에 직접 접근(JWT).
--
-- 네임스페이스: 한 Supabase 프로젝트에 여러 앱이 공존할 수 있어 모든 객체에 lumiverse_ 접두사.

-- ─────────────────────────── 테이블 ───────────────────────────

create table lumiverse_profiles (        -- auth.users 연동 프로필
  id          uuid primary key references auth.users(id) on delete cascade,
  nickname    text,
  settings    jsonb default '{}',        -- 알림 토글·테마·별 모양 (설정 화면)
  created_at  timestamptz default now()
);

create table lumiverse_galaxies (        -- 은하계 = 목표
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references lumiverse_profiles(id) on delete cascade,
  name        text not null,
  dday_start  date not null,
  dday_end    date not null,             -- 디데이(자유 설정), 별 수 = 기간 일수
  intensity   text not null default 'normal'
              check (intensity in ('easy','normal','spartan')),
  input_mode  text not null default 'self'
              check (input_mode in ('self','ai')),
  status      text not null default 'active'
              check (status in ('active','blackhole','done')),
  created_at  timestamptz default now()
);

create table lumiverse_planets (         -- 행성 = 세부목표 (3~5개)
  id          uuid primary key default gen_random_uuid(),
  galaxy_id   uuid not null references lumiverse_galaxies(id) on delete cascade,
  name        text not null,
  symbol      text,                      -- 상징 이모지 (예: 📖)
  order_idx   int not null default 0,
  status      text not null default 'active'
              check (status in ('active','blackhole')),
  created_at  timestamptz default now()
);

create table lumiverse_stars (           -- 별 = 매일의 투두 (행성마다 디데이 일수만큼)
  id          uuid primary key default gen_random_uuid(),
  planet_id   uuid not null references lumiverse_planets(id) on delete cascade,
  galaxy_id   uuid not null references lumiverse_galaxies(id) on delete cascade,  -- 은하 직속 조회용
  due_date    date not null,             -- 이 별이 배정된 날짜
  title       text,
  done        boolean not null default false,
  done_at     timestamptz,
  created_at  timestamptz default now()
);

create table lumiverse_constellations (  -- 별자리 = 은하계당 1개 (별 14개↑부터)
  id          uuid primary key default gen_random_uuid(),
  galaxy_id   uuid not null references lumiverse_galaxies(id) on delete cascade unique,
  symbol      text,
  star_count  int not null default 0,
  created_at  timestamptz default now()
);

create table lumiverse_llm_cache (        -- 동일 입력 재호출 차단
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references lumiverse_profiles(id) on delete cascade,
  trigger     text not null,             -- 'goal_breakdown'|'mid_check'|'reward_message'|'symbol'
  input_hash  text not null,
  response    jsonb not null,
  created_at  timestamptz default now()
);

-- ─────────────────────────── 인덱스 ───────────────────────────

create index idx_lum_galaxies_user_status on lumiverse_galaxies (user_id, status);
create index idx_lum_planets_galaxy       on lumiverse_planets (galaxy_id);
create index idx_lum_stars_galaxy_due     on lumiverse_stars (galaxy_id, due_date);
create index idx_lum_stars_planet         on lumiverse_stars (planet_id);
create unique index idx_lum_llm_cache_lookup on lumiverse_llm_cache (user_id, trigger, input_hash);

-- ─────────────────────── 가입 시 프로필 자동 생성 ───────────────────────

create or replace function public.lumiverse_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.lumiverse_profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger lumiverse_on_auth_user_created
  after insert on auth.users
  for each row execute function public.lumiverse_handle_new_user();

-- ─────────────────────────── RLS ───────────────────────────
-- 본인 데이터만. 하위 테이블은 소유 galaxy(또는 profile)의 user_id로 판정.

alter table lumiverse_profiles       enable row level security;
alter table lumiverse_galaxies       enable row level security;
alter table lumiverse_planets        enable row level security;
alter table lumiverse_stars          enable row level security;
alter table lumiverse_constellations enable row level security;
alter table lumiverse_llm_cache      enable row level security;

-- profiles
create policy "lum_profiles_select_own" on lumiverse_profiles for select using (id = auth.uid());
create policy "lum_profiles_update_own" on lumiverse_profiles for update using (id = auth.uid()) with check (id = auth.uid());

-- galaxies
create policy "lum_galaxies_all_own" on lumiverse_galaxies for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- planets (소유 galaxy 경유)
create policy "lum_planets_all_own" on lumiverse_planets for all
  using (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_planets.galaxy_id and g.user_id = auth.uid()))
  with check (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_planets.galaxy_id and g.user_id = auth.uid()));

-- stars (galaxy_id 직속 판정)
create policy "lum_stars_all_own" on lumiverse_stars for all
  using (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_stars.galaxy_id and g.user_id = auth.uid()))
  with check (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_stars.galaxy_id and g.user_id = auth.uid()));

-- constellations
create policy "lum_constellations_all_own" on lumiverse_constellations for all
  using (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_constellations.galaxy_id and g.user_id = auth.uid()))
  with check (exists (select 1 from lumiverse_galaxies g where g.id = lumiverse_constellations.galaxy_id and g.user_id = auth.uid()));

-- llm_cache
create policy "lum_llm_cache_all_own" on lumiverse_llm_cache for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ─────────────── 은하+행성+별 일괄 생성 (한 트랜잭션, 왕복 1회) ───────────────
-- payload 예:
-- {
--   "name":"영어공부","dday_start":"2026-06-16","dday_end":"2026-09-14",
--   "intensity":"normal","input_mode":"ai",
--   "planets":[
--     {"name":"단어외우기","symbol":"📖","order_idx":0,
--      "stars":[{"due_date":"2026-06-16","title":"단어 20개"}, ...]}
--   ]
-- }
-- 별 인스턴스화(todo_pattern × due_date)는 클라이언트가 수행해 stars 배열로 전달.
-- security invoker(기본) — RLS의 with check(user_id=auth.uid())를 그대로 통과해야 한다.
create or replace function public.lumiverse_create_galaxy_with_planets(payload jsonb)
returns uuid
language plpgsql
as $$
declare
  v_galaxy_id uuid;
  v_planet_id uuid;
  v_planet    jsonb;
  v_star      jsonb;
begin
  insert into lumiverse_galaxies (user_id, name, dday_start, dday_end, intensity, input_mode)
  values (
    auth.uid(),
    payload->>'name',
    (payload->>'dday_start')::date,
    (payload->>'dday_end')::date,
    coalesce(payload->>'intensity', 'normal'),
    coalesce(payload->>'input_mode', 'self')
  )
  returning id into v_galaxy_id;

  for v_planet in select * from jsonb_array_elements(coalesce(payload->'planets', '[]'::jsonb))
  loop
    insert into lumiverse_planets (galaxy_id, name, symbol, order_idx)
    values (
      v_galaxy_id,
      v_planet->>'name',
      v_planet->>'symbol',
      coalesce((v_planet->>'order_idx')::int, 0)
    )
    returning id into v_planet_id;

    for v_star in select * from jsonb_array_elements(coalesce(v_planet->'stars', '[]'::jsonb))
    loop
      insert into lumiverse_stars (planet_id, galaxy_id, due_date, title)
      values (
        v_planet_id,
        v_galaxy_id,
        (v_star->>'due_date')::date,
        v_star->>'title'
      );
    end loop;
  end loop;

  return v_galaxy_id;
end;
$$;
