/**
 * app/api/magis/route.ts
 * Endpoint único do Orquestrador Multiagente Magis.
 * Toda a lógica de seleção de agentes e execução está em ai/orchestrator/index.ts
 */

import { NextRequest, NextResponse } from "next/server"
import { orquestrar } from "@/ai/orchestrator"
import { checkOllamaStatus } from "@/ai/llm"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const mensagem: string           = body.mensagem || ""
    const sessionId: string          = body.sessionId || `anon-${Date.now()}`
    const historico: any[]           = body.historico || []
    const confirmacaoPayload: any    = body.confirmacaoPayload || undefined
    const modulo: string             = body.modulo || "geral"

    if (!mensagem.trim()) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 })
    }

    // Modo RAG (IA Preditiva) — mantido para compatibilidade
    if (modulo === "rag") {
      const { predictiveChatQuery } = await import("@/lib/rag-engine")
      const ragResult = await predictiveChatQuery(mensagem)
      return NextResponse.json({ success: true, data: ragResult })
    }

    // ─── Orquestrador Multiagente ──────────────────────────────────────────
    const response = await orquestrar({
      sessionId,
      mensagem,
      historico,
      confirmacaoPayload,
    })

    return NextResponse.json(response)

  } catch (err) {
    console.error("[Magis API] Erro crítico:", err)
    return NextResponse.json(
      { error: "Erro interno do servidor", detalhes: String(err) },
      { status: 500 }
    )
  }
}

// ─── GET: Status do engine ────────────────────────────────────────────────────
export async function GET() {
  const ollamaStatus = await checkOllamaStatus()
  const hasGroq = !!process.env.GROQ_API_KEY

  return NextResponse.json({
    engine:      "magis-orchestrator-v1",
    versao:      "1.0.0",
    ollama:      ollamaStatus.online,
    groq:        hasGroq,
    model:       ollamaStatus.model || (hasGroq ? "llama-3.3-70b-versatile" : null),
    fallback:    "prisma_engine",
    status:      ollamaStatus.online ? "online (local)" : (hasGroq ? "online (cloud)" : "fallback_mode"),
    agentes:     ["crm", "marketing", "projetos", "financeiro", "estoque", "os", "bi", "whatsapp"],
    capacidades: ["classificação_semantica", "multiagente", "memoria_sessao", "auditoria", "confirmacao_destrutiva"],
  })
}
