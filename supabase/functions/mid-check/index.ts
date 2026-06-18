// mid-check — 중간점검. 클라이언트가 §5-3 상태 레이블로 낸 판정(state/verdict)에 맞춰
// 개인화된 사유(reason) + 항해사 메시지(message)를 생성한다. 판정은 LLM 이 바꾸지 않는다.
// 보완 계열(정체기/이탈위험)에는 기존 행성과 다른 "보완 추천 행성" 1개도 함께 생성한다.
// 별 한줄평(review)+투두 제목을 주입해 "무엇을 하기로 했고 어떻게 느꼈는지"를 반영.
//
// 호출: supabase.functions.invoke('mid-check', { body: {...} }) — JWT 자동 첨부.
// 캐시: 동일 입력(input_hash, trigger='mid_check')은 LLM 호출 없이 반환.

import { createClient } from 'jsr:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { chatJSON } from '../_shared/llm.ts'

const RATE_LIMIT_PER_HOUR = 30
// 프롬프트 변경 시 올린다 — input_hash에 포함돼 옛 캐시를 자동 무효화한다.
const PROMPT_VERSION = 'v2'

type Verdict = 'encourage' | 'go' | 'supplement' | 'finish'
type State = 'early' | 'steady' | 'plateau' | 'at_risk'

interface Sample {
  title: string
  review: string
  done: boolean
}

interface MidCheckInput {
  goal_name: string
  intensity?: 'easy' | 'normal' | 'spartan'
  state: State
  verdict: Verdict
  stats?: {
    completionPct?: number
    overallPct?: number
    daysTracked?: number
    streak?: number
    failStreak?: number
  }
  samples?: Sample[]
  existing_planets?: string[]
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

const STATE_GUIDE: Record<State, string> = {
  early: '초반 진입(기록 3일 미만) — 아직 판단하기 이르다. 시작을 인정하고 가볍게 격려한다.',
  steady: '꾸준함 유지(완료율 높고 연속 유지) — 잘 가고 있으니 다음 단계로 강도를 조금 올려도 좋다는 톤.',
  plateau: '정체기(흐름이 느슨함) — 다그치지 말고, 이 목표에 지금 맞는 방식으로 다시 잡도록 돕는 톤. 목표 성격과 안 맞는 일반적 조언은 피한다.',
  at_risk: '이탈 위험(연속 실패 또는 완료율 낮음) — 질책 금지. 이 목표에 맞게 보완하거나 잠시 마무리해도 괜찮다는 톤.',
}

const needsRecommendation = (state: State) => state === 'plateau' || state === 'at_risk'

function buildMessages(input: MidCheckInput) {
  const s = input.stats ?? {}
  const recBlock = needsRecommendation(input.state)
    ? `
- ALSO include "recommendation": one NEW sub-goal (planet) that better fits the current situation, clearly DIFFERENT from existing_planets. Shape: { "name": string(구체적·실행가능), "symbol": string(emoji 1개), "todo_pattern": [ { "title": string } ] (하루 안에 끝낼 대표 투두 1-2개) }.`
    : `
- Do NOT include "recommendation".`

  const system = `You are "항해사", a calm daily coach for Lumiverse, a goal app where a goal = "galaxy", sub-goals = "planets", each day's todo = a "star".
The STATE and VERDICT are already decided by the app's rules. Do NOT change them. Write only the wording that fits.

Return ONLY JSON of this exact shape:
{ "reason": string, "message": string${needsRecommendation(input.state) ? ', "recommendation": { "name": string, "symbol": string, "todo_pattern": [ { "title": string } ] }' : ''} }

- reason: ONE honest Korean sentence on why this state/verdict fits (natural language, no number dump).
- message: 1-2 Korean sentences in 항해사's voice. Calm and warm — NO excessive cheer, NO emoji.
- GROUND the message in THIS specific goal ("${input.goal_name}"): first infer what the goal is really about from its name + planets, then tailor the coaching frame to that nature. Advice that fits one goal can be wrong for another (성취·달성형, 습관·지속형, 양보다 질이 중요한 형 등 성격이 다르면 조언도 달라진다) — never apply a one-size-fits-all template.
- Tie the wording to the user's REAL context — the planets (sub-goals) and samples (todo titles + one-line reviews). Reference at least one concrete detail when samples are non-empty. Never invent facts not present.
- Avoid generic self-help boilerplate (예: "작은 단위로 접근", "숨을 고르며", "한 걸음씩" 등 어떤 목표에도 붙는 상투어). Speak concretely about THIS goal.
- Consider overall_progress_percent (how much of the whole goal is done).
- All text MUST be in Korean.${recBlock}

GOAL NATURE FIRST:
상태 가이드(STATE)는 방향일 뿐이다. 먼저 이 목표의 성격을 파악하고, 그 성격에 맞게 STATE 톤을 적용한다. 상태 가이드 표현이 목표 성격과 충돌하면 목표 쪽을 우선한다(특정 목표 유형에 맞춘 규칙이 아니라, 모든 목표에 동일하게 적용되는 원칙).

CURRENT STATE:
${STATE_GUIDE[input.state] ?? STATE_GUIDE.plateau}`

  const user = JSON.stringify({
    state: input.state,
    verdict: input.verdict,
    goal_name: input.goal_name,
    intensity: input.intensity ?? 'normal',
    overall_progress_percent: s.overallPct ?? null,
    stats: {
      completion_percent: s.completionPct ?? null,
      days_tracked: s.daysTracked ?? null,
      done_streak_days: s.streak ?? null,
      fail_streak_days: s.failStreak ?? null,
    },
    existing_planets: input.existing_planets ?? [],
    samples: (input.samples ?? []).map((x) => ({ todo: x.title, review: x.review, done: x.done })),
  })

  return [
    { role: 'system' as const, content: system },
    { role: 'user' as const, content: user },
  ]
}

function validate(parsed: unknown, withRec: boolean): {
  reason: string
  message: string
  recommendation?: { name: string; symbol: string; todo_pattern: { title: string }[] }
} {
  const obj = parsed as Record<string, unknown>
  const reason = typeof obj?.reason === 'string' ? obj.reason.trim() : ''
  const message = typeof obj?.message === 'string' ? obj.message.trim() : ''
  if (!reason || !message) throw new Error('reason/message required')

  let recommendation
  if (withRec) {
    const r = obj?.recommendation as Record<string, unknown> | undefined
    const name = typeof r?.name === 'string' ? r.name.trim() : ''
    const pattern = Array.isArray(r?.todo_pattern) ? r!.todo_pattern : []
    if (name && pattern.length) {
      recommendation = {
        name,
        symbol: typeof r?.symbol === 'string' ? r.symbol : '✦',
        todo_pattern: (pattern as Record<string, unknown>[])
          .filter((p) => typeof p?.title === 'string' && p.title.trim())
          .map((p) => ({ title: (p.title as string).trim() })),
      }
    }
  }
  return { reason, message, recommendation }
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

  let input: MidCheckInput
  try {
    input = await req.json()
  } catch {
    return json({ error: 'invalid json body' }, 400)
  }

  const validVerdicts: Verdict[] = ['encourage', 'go', 'supplement', 'finish']
  const verdict: Verdict = validVerdicts.includes(input?.verdict) ? input.verdict : 'supplement'
  input.verdict = verdict
  const validStates: State[] = ['early', 'steady', 'plateau', 'at_risk']
  const state: State = validStates.includes(input?.state) ? input.state : 'plateau'
  input.state = state
  if (!input?.goal_name || !String(input.goal_name).trim()) {
    return json({ error: 'goal_name is required' }, 400)
  }

  const s = input.stats ?? {}
  const sampleKey = (input.samples ?? [])
    .map((x) => `${x.title}»${x.review}»${x.done ? 1 : 0}`)
    .join('§')
  const inputHash = await sha256Hex(
    `${PROMPT_VERSION}|${input.goal_name.trim()}|${input.intensity ?? 'normal'}|${state}|${verdict}|${s.completionPct ?? ''}|${s.overallPct ?? ''}|${s.daysTracked ?? ''}|${s.streak ?? ''}|${s.failStreak ?? ''}|${(input.existing_planets ?? []).join('¶')}|${sampleKey}`,
  )

  // 1) 캐시 조회
  const { data: cached } = await supabase
    .from('lumiverse_llm_cache')
    .select('response')
    .eq('trigger', 'mid_check')
    .eq('input_hash', inputHash)
    .maybeSingle()
  if (cached?.response) return json({ verdict, ...cached.response, cached: true })

  // 2) rate limit (최근 1시간 mid_check 호출 수)
  const since = new Date(Date.now() - 3600_000).toISOString()
  const { count } = await supabase
    .from('lumiverse_llm_cache')
    .select('id', { count: 'exact', head: true })
    .eq('trigger', 'mid_check')
    .gte('created_at', since)
  if ((count ?? 0) >= RATE_LIMIT_PER_HOUR) {
    return json({ error: 'too many requests' }, 429)
  }

  // 3) LLM 호출 + 검증
  let result: { reason: string; message: string; recommendation?: unknown }
  try {
    const parsed = await chatJSON(buildMessages(input))
    result = validate(parsed, needsRecommendation(state))
  } catch (e) {
    console.error('mid-check LLM error:', e)
    return json({ error: 'mid-check failed' }, 502)
  }

  // 4) 캐시 저장 (실패해도 응답 반환)
  await supabase
    .from('lumiverse_llm_cache')
    .insert({ user_id: user.id, trigger: 'mid_check', input_hash: inputHash, response: result })

  return json({ verdict, ...result, cached: false })
})
