// ============================================================
// MAGIS LLM LAYER — Ollama (local) com fallback gracioso
// Offline-first: se Ollama cair, o engine v2 assume
// ============================================================

export interface OllamaResponse {
  model: string
  response: string
  done: boolean
}

/**
 * Tenta chamar o Ollama local. Retorna null se offline/timeout.
 */
export async function callOllama(
  systemPrompt: string,
  userMessage: string,
  model: string = "llama3.2:3b"
): Promise<string | null> {
  try {
    const fullPrompt = `${systemPrompt}

---
PERGUNTA DO EMPRESÁRIO: "${userMessage}"

Responda em português do Brasil, de forma concisa e prática.
Sua resposta deve ser um JSON válido com esta estrutura EXATA:
{
  "diagnostico": "análise direta do que você encontrou nos dados",
  "recomendacao": "ação específica e prioritária recomendada",
  "proximoPasso": "instrução clara do que o empresário deve fazer agora",
  "dados": [
    { "label": "nome do dado", "valor": "valor formatado", "cor": "green|blue|red|orange|purple|gray" }
  ]
}

Responda SOMENTE com o JSON, sem markdown, sem explicações fora do JSON.`

    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 600,
          top_p: 0.9,
        },
      }),
      signal: AbortSignal.timeout(12000), // 12s timeout
    })

    if (!res.ok) return null

    const data: OllamaResponse = await res.json()
    return data.response?.trim() || null
  } catch {
    // Ollama offline, timeout ou erro — fallback ativado
    return null
  }
}

/**
 * Tenta chamar a API do Groq na nuvem (Nível 2). Retorna null se falhar ou sem chave.
 */
export async function callGroq(
  systemPrompt: string,
  userMessage: string,
  model: string = "llama-3.3-70b-versatile"
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  try {
    const fullPrompt = `${systemPrompt}

---
PERGUNTA DO EMPRESÁRIO: "${userMessage}"

Responda em português do Brasil, de forma concisa e prática.
Sua resposta deve ser um JSON válido com esta estrutura EXATA:
{
  "diagnostico": "análise direta do que você encontrou nos dados",
  "recomendacao": "ação específica e prioritária recomendada",
  "proximoPasso": "instrução clara do que o empresário deve fazer agora",
  "dados": [
    { "label": "nome do dado", "valor": "valor formatado", "cor": "green|blue|red|orange|purple|gray" }
  ]
}

Responda SOMENTE com o JSON, sem markdown, sem explicações fora do JSON.`

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.2,
      }),
      signal: AbortSignal.timeout(10000), // 10s timeout
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[Groq] HTTP Error:", res.status, err)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch (e) {
    console.error("[Groq] Exception:", e)
    return null
  }
}

/**
 * Verifica se o Ollama está online. Retorna o modelo disponível ou null.
 */
export async function checkOllamaStatus(): Promise<{ online: boolean; model: string | null }> {
  try {
    const res = await fetch("http://localhost:11434/api/tags", {
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return { online: false, model: null }
    const data = await res.json()
    const models: string[] = (data.models || []).map((m: any) => m.name)
    // Prefere modelos menores/mais rápidos
    const preferred = ["llama3.2:3b", "phi3:mini", "mistral:7b", "llama3:8b", "gemma2:2b"]
    const found = preferred.find(p => models.some(m => m.startsWith(p.split(":")[0])))
    return { online: true, model: found || models[0] || null }
  } catch {
    return { online: false, model: null }
  }
}

/**
 * Tenta extrair JSON da resposta do LLM mesmo se vier com lixo ao redor.
 */
export function extractJSON(text: string): Record<string, any> | null {
  try {
    // Tenta parse direto
    return JSON.parse(text)
  } catch {
    // Tenta extrair JSON de dentro do texto
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0])
      } catch {
        return null
      }
    }
    return null
  }
}
