-- 닉네임 직접 입력 — 트리거가 nickname 을 자동 채우지 않게(null) 한다.
-- 신규 가입자는 nickname=null → 앱이 /welcome 으로 보내 직접 입력받는다.
-- 기존 유저는 이미 nickname 이 채워져 있어 영향 없음.
create or replace function public.lumiverse_handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.lumiverse_profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;
