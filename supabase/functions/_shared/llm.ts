// LLM 공급자 추상화 — OpenAI 호환 chat/completions 인터페이스.
// env 만 바꾸면 Solar(이달) ↔ Groq(7월~ 메인) 전환 (아키텍처 v4 §5).
//   LLM_BASE_URL  기본 https://api.upstage.ai/v1   (Groq: https://api.groq.com/openai/v1)
//   LLM_MODEL     기본 solar-pro2                  (Groq: llama-3.3-70b-versatile)
//   LLM_API_KEY   공급자 API 키 (Edge Function secrets — 클라이언트 노출 금지)
//
// ⚠️ Upstage Solar: response_format(json_object/json_schema)는 solar-pro2 에서만 지원된다.
//    (참고: https://console.upstage.ai/api/chat) 기본 모델을 solar-pro2 로 두는 이유.
//    OpenAI 호환 경로는 {BASE_URL}/chat/completions (= /v1/chat/completions). Bearer 인증.

const BASE_URL = Deno.env.get('LLM_BASE_URL') ?? 'https://api.upstage.ai/v1'
const MODEL = Deno.env.get('LLM_MODEL') ?? 'solar-pro2'
const API_KEY = Deno.env.get('LLM_API_KEY') ?? ''

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// JSON 응답을 강제로 받아 파싱한다. 실패 시 throw (호출부에서 5xx 매핑).
export async function chatJSON(messages: ChatMessage[]): Promise<unknown> {
  if (!API_KEY) throw new Error('LLM_API_KEY is not configured')

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`LLM ${res.status}: ${detail.slice(0, 200)}`)
  }

  const data = await res.json()
  const content = data?.choices?.[0]?.message?.content
  if (!content) throw new Error('LLM returned empty content')

  try {
    return JSON.parse(content)
  } catch {
    throw new Error('LLM returned non-JSON content')
  }
}
