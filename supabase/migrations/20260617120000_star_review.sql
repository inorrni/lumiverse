-- 투두(별) 한줄평 — 중간점검(mid-check) 개인화 입력용.
-- 사용자가 오늘의 별을 체크할 때 남기는 한 줄 회고. nullable(선택 입력).
-- RLS: 기존 lumiverse_stars 정책(galaxy_id 경유 본인만)이 이 컬럼에도 그대로 적용된다.
alter table lumiverse_stars add column if not exists review text;
