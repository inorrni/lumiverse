// self-insight — 내 우주 전체 점검(자기 인사이트). 모든 목표 + 한줄평(review) corpus 로
// "나"를 읽어 안내한다. 목표 수정이 아니라 읽기 전용 안내(전체 상태·잘 하는 키워드·자주
// 쓰는 단어·피하고 싶은 것·한마디). 근거 없는 추측 금지(없으면 빈 배열).
//
// 호출: supabase.functions.invoke('self-insight', { body: {...} }) — JWT 자동 첨부.
// 캐시: 동일 입력(input_hash, trigger='self_insight')은 LLM 호출 없이 반환.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { chatJSON } from '../_shared/llm.ts'

const RATE_LIMIT_PER_HOUR = 30

interface GoalStat {
  name: string
  intensity?: string
  state?: string
  completion_pct?: number
  sub_goals?: string[] // 세부목표(행성) 이름들
  reviews?: string[] // 이 목표의 한줄평들
}
interface InsightInput {
  goals?: GoalStat[]
  totals?: { goals?: number; done_stars?: number; total_stars?: number }
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function buildMessages(input: InsightInput) {
  const goalCount = (input.goals ?? []).length
  const system = `You are "항해사", a calm guide for Lumiverse (a goal app: goal=galaxy, sub-goal=planet, daily todo=star).
You are given the reader's ENTIRE universe: ALL of their ${goalCount} goal(s), each with its sub-goals, progress state, completion %, and one-line reviews (한줄평).
Speak directly TO the reader in second person — address them as "당신은 …". NEVER refer to them in third person ("사용자").
Your job is to read the reader as a whole by SYNTHESIZING ACROSS ALL GOALS — not to summarize or pick a single goal.

Return ONLY JSON of this exact shape:
{
  "summary": string,            // 2-4 문장. 여러 목표를 가로질러 본 "당신"의 전반적 패턴/성향/현재 상태. "당신은 …" 어투. 한 목표만 설명하지 말 것.
  "doing_well": string[],       // 여러 목표에 걸쳐 당신이 잘 해내는 키워드/패턴. 0-6개.
  "frequent_words": string[],   // 모든 한줄평을 통틀어 자주 나오는 단어/표현. 0-6개.
  "dislikes": string[],         // 한줄평 전반에서 드러나는, 당신이 싫어하거나 버거워하는 것. 0-5개.
  "message": string             // "당신"에게 건네는 항해사의 따뜻한 한마디 1-2문장.
}

RULES:
- Address the reader as "당신" (second person). Do NOT use the word "사용자" anywhere.
- SYNTHESIZE across ALL goals. Compare goals: where do you thrive vs stall? What themes recur across different goals and their reviews? Even with ${goalCount} goal(s), frame it as reading the whole person, not one project.
- All text MUST be in Korean. No emoji. No excessive cheer.
- Extract doing_well / frequent_words / dislikes ONLY from real evidence across the goals, sub-goals, and reviews. If there is not enough signal, return an EMPTY array — do NOT invent.
- Keep each array item short (a word or short phrase), no sentences.
- summary/message are always required and grounded in the actual data; if reviews are sparse, say so gently in message.`

  const user = JSON.stringify({
    totals: input.totals ?? {},
    goals: (input.goals ?? []).map((g) => ({
      name: g.name,
      intensity: g.intensity ?? 'normal',
      state: g.state ?? '',
      completion_percent: g.completion_pct ?? null,
      sub_goals: g.sub_goals ?? [],
      reviews: g.reviews ?? [],
    })),
  })

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ]
}

const strArray = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((x): x is string => typeof x === 'string' && x.trim().length > 0).map((x) => x.trim()).slice(0, 6)
    : []

function validate(parsed: unknown) {
  const obj = parsed as Record<string, unknown>
  const summary = typeof obj?.summary === 'string' ? obj.summary.trim() : ''
  const message = typeof obj?.message === 'string' ? obj.message.trim() : ''
  if (!summary || !message) throw new Error('summary/message required')
  return {
    summary,
    message,
    doing_well: strArray(obj?.doing_well),
    frequent_words: strArray(obj?.frequent_words),
    dislikes: strArray(obj?.dislikes),
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  const authHeader = req.headers.get('Authorization') ?? ''
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser()
  if (userErr || !user) return json({ error: 'unauthorized' }, 401)

  let input: InsightInput
  try {
    input = await req.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }
  if (!Array.isArray(input?.goals) || input.goals.length === 0) {
    return json({ error: 'no goals' }, 400)
  }

  // 캐시 키 — 목표별 전체 내용(상태·완료율·세부목표·한줄평)에 결정적으로 의존.
  const goalKey = (input.goals ?? [])
    .map(
      (g) =>
        `${g.name}»${g.state ?? ''}»${g.completion_pct ?? ''}»${(g.sub_goals ?? []).join(',')}»${(g.reviews ?? []).join('|')}`,
    )
    .join('§')
  const inputHash = await sha256Hex(goalKey)

  // 1) 캐시 조회
  const { data: cached } = await supabase
    .from('lumiverse_llm_cache')
    .select('response')
    .eq('trigger', 'self_insight')
    .eq('input_hash', inputHash)
    .maybeSingle()
  if (cached?.response) return json({ ...cached.response, cached: true })

  // 2) rate limit (최근 1시간 self_insight 호출 수)
  const since = new Date(Date.now() - 3600_000).toISOString()
  const { count } = await supabase
    .from('lumiverse_llm_cache')
    .select('id', { count: 'exact', head: true })
    .eq('trigger', 'self_insight')
    .gte('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ error: 'too many requests' }, 429)
  }

  // 3) LLM 호출 + 검증
  let result
  try {
    const parsed = await chatJSON(buildMessages(input))
    result = validate(parsed)
  } catch (e) {
    console.error('self-insight LLM error:', e)
    return json({ error: 'self-insight failed' }, 502)
  }

  // 4) 캐시 저장 (실패해도 응답 반환)
  await supabase
    .from('lumiverse_llm_cache')
    .insert({ user_id: user.id, trigger: 'self_insight', input_hash: inputHash, response: result })

  return json({ ...result, cached: false })
})
