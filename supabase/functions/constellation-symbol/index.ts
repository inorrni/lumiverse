// constellation-symbol — 별자리 상징 추천. 목표 키워드로 어울리는 이모지 후보 몇 개를 제안한다.
// 사용자가 그중 하나를 골라 별자리의 엠블럼으로 쓴다.
//
// 호출: supabase.functions.invoke('constellation-symbol', { body: { goal, intensity } }) — JWT 자동 첨부.
// 캐시: 동일 입력(input_hash, trigger='symbol')은 LLM 호출 없이 반환.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { chatJSON } from '../_shared/llm.ts'

const RATE_LIMIT_PER_HOUR = 30

interface SymbolInput {
  goal: string
  intensity?: 'easy' | 'normal' | 'spartan'
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

function buildMessages(input: SymbolInput) {
  const system = `You suggest constellation emblems for Lumiverse, a goal app (goal=galaxy). When a user keeps a goal long enough, they form a "별자리"(constellation) and pick a single emoji emblem for it.

Return ONLY JSON of this exact shape:
{ "symbols": [ { "symbol": string, "label": string } ] }

- Propose 4-5 candidates that fit the goal's meaning/domain. Variety, not near-duplicates.
- "symbol": EXACTLY ONE emoji.
- "label": a short Korean word/phrase naming the emblem's vibe (예: "꾸준한 불꽃").
- Korean labels. No explanations outside JSON.`

  const user = JSON.stringify({ goal: input.goal, intensity: input.intensity ?? 'normal' })

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ]
}

function validate(parsed: unknown): { symbols: { symbol: string; label: string }[] } {
  const obj = parsed as Record<string, unknown>
  const raw = Array.isArray(obj?.symbols) ? obj.symbols : []
  const symbols = (raw as Record<string, unknown>[])
    .filter((s) => typeof s?.symbol === 'string' && s.symbol.trim())
    .map((s) => ({
      symbol: (s.symbol as string).trim(),
      label: typeof s?.label === 'string' ? (s.label as string).trim() : '',
    }))
    .slice(0, 6)
  if (symbols.length === 0) throw new Error('no symbols')
  return { symbols }
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

  let input: SymbolInput
  try {
    input = await req.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }
  if (!input?.goal || !String(input.goal).trim()) return json({ error: 'goal is required' }, 400)

  const intensity = input.intensity ?? 'normal'
  const inputHash = await sha256Hex(`${input.goal.trim()}|${intensity}`)

  // 1) 캐시 조회
  const { data: cached } = await supabase
    .from('lumiverse_llm_cache')
    .select('response')
    .eq('trigger', 'symbol')
    .eq('input_hash', inputHash)
    .maybeSingle()
  if (cached?.response) return json({ ...cached.response, cached: true })

  // 2) rate limit
  const since = new Date(Date.now() - 3600_000).toISOString()
  const { count } = await supabase
    .from('lumiverse_llm_cache')
    .select('id', { count: 'exact', head: true })
    .eq('trigger', 'symbol')
    .gte('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ error: 'too many requests' }, 429)
  }

  // 3) LLM 호출 + 검증
  let result: { symbols: { symbol: string; label: string }[] }
  try {
    const parsed = await chatJSON(buildMessages(input))
    result = validate(parsed)
  } catch (e) {
    console.error('constellation-symbol LLM error:', e)
    return json({ error: 'symbol suggestion failed' }, 502)
  }

  // 4) 캐시 저장
  await supabase
    .from('lumiverse_llm_cache')
    .insert({ user_id: user.id, trigger: 'symbol', input_hash: inputHash, response: result })

  return json({ ...result, cached: false })
})
