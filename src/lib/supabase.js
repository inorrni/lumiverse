import { createClient } from '@supabase/supabase-js'

// Supabase 클라이언트 싱글턴. anon 키는 공개 전제(클라이언트 번들 포함) — RLS 로 보호.
// service_role 키는 절대 여기/프론트에 넣지 말 것 (Edge Function secrets 전용).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // 빌드는 통과시키되, 미설정 시 콘솔에서 바로 알 수 있게 경고.
  console.warn('[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY 가 비어 있어요. .env.local 을 확인하세요.')
}

export const supabase = createClient(url ?? '', anonKey ?? '')
