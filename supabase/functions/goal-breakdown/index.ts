// goal-breakdown — 목표+디데이+강도 → 세부목표(행성) 3~5개 + 대표 투두 패턴.
// 아키텍처 v4 §5-2. 별(날짜별 투두)은 LLM이 다 만들지 않고 todo_pattern 만 반환,
// 앱이 due_date 별로 인스턴스화한다(토큰 절약).
//
// 호출: supabase.functions.invoke('goal-breakdown', { body: {...} }) — JWT 자동 첨부.
// 캐시: 동일 입력(input_hash)은 LLM 호출 없이 llm_cache 에서 반환.
// rate limit: 사용자당 최근 1시간 분해 호출 수 상한(최소 가드).

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { chatJSON } from '../_shared/llm.ts'

const RATE_LIMIT_PER_HOUR = 30

interface BreakdownInput {
  goal: string
  galaxy_name?: string
  dday_days?: number
  intensity?: 'easy' | 'normal' | 'spartan'
  exclude?: string[] // 이미 본 행성 이름들 — 이것과 다른 분해를 요청(리프레시)
  count?: number     // 요청 행성 개수(리프레시 시 현재 개수 유지). 미지정이면 3~5 자유
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

function buildMessages(input: BreakdownInput) {
  const countRule = input.count
    ? `- planets: exactly ${input.count} items (this exact count is required)`
    : `- planets: exactly 3 to 5 items`
  const system = `You are a goal decomposition assistant AND daily coach for Lumiverse, a goal-management app where each action expands the user's own universe.
Universe metaphor: a goal = "galaxy", sub-goals = "planets", each day's todo = a "star".

Return ONLY JSON of this exact shape:
{
  "planets": [
    { "name": string, "symbol": string, "todo_pattern": [ { "title": string } ] }
  ],
  "galaxy_message": string
}

INTERPRETATION (read the goal first):
- Interpret the goal by its most natural, common-sense meaning, and keep the sub-goals within that same domain and tone.
- Planets/todos must be "actually doing the goal". Unless the goal's wording explicitly requires it, do NOT change its nature — e.g. do not turn a leisure/hobby into academic study/exam prep, or a simple habit into a rigorous training regimen.

FALLBACK (uninterpretable goal):
- If the goal has no discernible meaning or intent (random characters, keyboard-mashing, or pure test input such as "ddd", "ㅁㄴㅇㄹ"), do NOT invent an unrelated plan.
- Instead, decompose the PROCESS of discovering and defining a goal — e.g. 하고 싶은 것 떠올려 적어보기 / 후보 중에서 고르기 / 목표를 한 문장으로 구체화하기 — still in the normal 3-5 planet shape, in Korean.
- In that case, galaxy_message should gently note the goal isn't clear yet and that this will help set one.

DECOMPOSITION PRINCIPLE (most important):
- Every goal has a natural progression of stages. Do NOT summarize the whole goal into broad, vague themes.
- Focus the decomposition on the FIRST 1-2 stages, broken into concrete, near-term sub-goals the user can actually start right now.
- Allocate planets by total count: 3 planets -> 2 for the first stage(s) + 1 for the next stage; 4 -> 3 + 1; 5 -> 3 + 2.
- Order planets from the earliest stage to the next stage (no labels). Earlier planets must be the most immediate, concrete first steps.

PLANET / TODO RULES:
${countRule}
- name: a specific, actionable sub-goal — NOT a vague theme (avoid names like "공부하기", "운동하기")
- symbol: a single emoji representing the planet
- todo_pattern: representative DAILY todos, each completable within a single day. They repeat across the period.

INTENSITY (make the difference clear and concrete):
- 'easy' (살살): low volume, low difficulty, leaves slack. todo_pattern = 1 item, with small or no numeric targets. A light single step per day.
- 'normal': balanced default.
- 'spartan' (스파르타): dense and challenging, every day. todo_pattern = 2-3 items, and EACH todo MUST include a concrete numeric target (minutes, pages, reps, or counts) — e.g. "30분 정독", "20페이지 풀기", "단어 30개 암기".

OTHER:
- If 'exclude_planet_names' is non-empty, propose a clearly DIFFERENT decomposition: avoid those planet names and take a different angle/structure than them
- All text MUST be in Korean
- galaxy_message: one calm encouraging sentence (no excessive cheerfulness, no emoji)`

  const user = JSON.stringify({
    goal: input.goal,
    galaxy_name: input.galaxy_name ?? input.goal,
    dday_days: input.dday_days ?? null,
    intensity: input.intensity ?? 'normal',
    exclude_planet_names: input.exclude ?? [],
    requested_planet_count: input.count ?? null,
  })

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ]
}

// 응답 검증 — planets 3~5, 각 planet name + todo_pattern 보장.
function validate(parsed: unknown): { planets: unknown[]; galaxy_message: string } {
  const obj = parsed as Record<string, unknown>
  const planets = Array.isArray(obj?.planets) ? obj.planets : []
  if (planets.length < 3 || planets.length > 5) {
    throw new Error(`planets must be 3~5, got ${planets.length}`)
  }
  for (const p of planets as Record<string, unknown>[]) {
    if (!p?.name || !Array.isArray(p?.todo_pattern) || p.todo_pattern.length === 0) {
      throw new Error('each planet needs name and non-empty todo_pattern')
    }
  }
  return {
    planets,
    galaxy_message: typeof obj?.galaxy_message === 'string' ? obj.galaxy_message : '',
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method not allowed' }, 405)

  // 사용자 JWT 로 클라이언트 생성 — RLS 가 llm_cache 를 본인 것으로 제한.
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

  let input: BreakdownInput
  try {
    input = await req.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }
  if (!input?.goal || !input.goal.trim()) return json({ error: 'goal is required' }, 400)

  const intensity = input.intensity ?? 'normal'
  // exclude 정규화 — 트림·빈값 제거 후 정렬해 해시·프롬프트에 일관 반영(순서 무관 캐시 키).
  const exclude = (Array.isArray(input.exclude) ? input.exclude : [])
    .filter((s): s is string => typeof s === 'string' && s.trim().length > 0)
    .map((s) => s.trim())
    .sort()
  input.exclude = exclude
  // count 정규화 — 3~5 범위만 인정, 그 외/미지정은 자유(3~5).
  const planetCount =
    typeof input.count === 'number' && input.count >= 3 && input.count <= 5
      ? Math.round(input.count)
      : undefined
  input.count = planetCount
  const inputHash = await sha256Hex(
    `${input.goal.trim()}|${input.dday_days ?? ''}|${intensity}|${exclude.join('§')}|${planetCount ?? ''}`,
  )

  // 1) 캐시 조회
  const { data: cached } = await supabase
    .from('lumiverse_llm_cache')
    .select('response')
    .eq('trigger', 'goal_breakdown')
    .eq('input_hash', inputHash)
    .maybeSingle()
  if (cached?.response) return json({ ...cached.response, cached: true })

  // 2) rate limit (최근 1시간 호출 수)
  const since = new Date(Date.now() - 3600_000).toISOString()
  const { count } = await supabase
    .from('lumiverse_llm_cache')
    .select('id', { count: 'exact', head: true })
    .eq('trigger', 'goal_breakdown')
    .gte('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ error: 'too many requests' }, 429)
  }

  // 3) LLM 호출 + 검증
  let result: { planets: unknown[]; galaxy_message: string }
  try {
    const parsed = await chatJSON(buildMessages(input))
    result = validate(parsed)
  } catch (e) {
    console.error('goal-breakdown LLM error:', e)
    return json({ error: 'breakdown failed' }, 502)
  }

  // 4) 캐시 저장 (실패해도 응답은 반환)
  await supabase
    .from('lumiverse_llm_cache')
    .insert({ user_id: user.id, trigger: 'goal_breakdown', input_hash: inputHash, response: result })

  return json({ ...result, cached: false })
})
