-- 프로필 백필 + 트리거 멱등성 (FK 위반 23503 대응)
-- 증상: lumiverse_handle_new_user 트리거가 생기기 *전*에 가입한 계정은
--       auth.users 에는 있지만 lumiverse_profiles 에 행이 없어,
--       galaxy 생성 시 lumiverse_galaxies_user_id_fkey 위반(23503)이 난다.
-- 공유 단일 프로젝트라 마이그레이션 적용 전 가입한 팀원 계정 전부 해당.

-- 1) 누락된 프로필 백필 (이미 막힌 계정 즉시 복구)
insert into public.lumiverse_profiles (id, nickname)
select u.id, coalesce(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1))
from auth.users u
left join public.lumiverse_profiles p on p.id = u.id
where p.id is null;

-- 2) 트리거 함수 멱등화 — 어떤 이유로든 중복 호출돼도 안전하게.
create or replace function public.lumiverse_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.lumiverse_profiles (id, nickname)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;
