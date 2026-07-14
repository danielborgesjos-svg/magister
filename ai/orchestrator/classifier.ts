/**
 * ai/orchestrator/classifier.ts
 * Classifica a intenção do usuário e seleciona os agentes adequados.
 * Usa Groq para classificação semântica com fallback por tags.
 */

import { AGENTS, getAgentsByTags, AgentDefinition } from "@/ai/agents/registry"

export type ActionType = "READ" | "CREATE" | "UPDATE" | "DELETE" | "REPORT" | "SEARCH" | "CONFIRM" | "CANCEL"

export interface ClassificationResult {
  intencao: string
  agentes: string[]           // IDs dos agentes em ordem de execução
  acao: ActionType
  entidades: Record<string, any>   // dados extraídos da mensagem
  requerConfirmacao: boolean
  confianca: number           // 0-1
}

// ─── Prompt do Classificador ─────────────────────────────────────────────────

const CLASSIFIER_SYSTEM = `Você é o Classificador de Intenção do Orquestrador Magis ERP.
Sua função é analisar a mensagem do usuário e retornar um JSON classificando a intenção.

Agentes disponíveis:
- crm: clientes, leads, negociações, pipeline, startups
- marketing: campanhas, email, automação, segmentação
- projetos: tarefas, sprints, projetos, kanban, prazos
- financeiro: receitas, despesas, fluxo de caixa, relatórios financeiros
- estoque: produtos, inventário, ruptura, giro
- os: ordens de serviço, técnicos, manutenção, field service
- bi: dashboard, KPIs, indicadores, relatórios gerenciais, rankings
- whatsapp: mensagens, conversas, automações, atendimento

Ações possíveis: READ, CREATE, UPDATE, DELETE, REPORT, SEARCH, CONFIRM, CANCEL

Retorne APENAS o JSON abaixo, sem markdown:
{
  "intencao": "descrição curta da intenção",
  "agentes": ["id_agente1", "id_agente2"],
  "acao": "READ|CREATE|UPDATE|DELETE|REPORT|SEARCH",
  "entidades": { "campo": "valor extraído da mensagem" },
  "requerConfirmacao": false,
  "confianca": 0.95
}

Regras:
- requerConfirmacao deve ser true para DELETE e ações destrutivas
- Para fluxos que envolvem múltiplos módulos, liste múltiplos agentes em ordem
- entidades deve conter os dados explicitamente mencionados pelo usuário
- Se a mensagem for saudação/conversa geral, use agente "bi" com ação "READ"`

// ─── Classificação via Groq ──────────────────────────────────────────────────

export async function classificarIntencao(
  mensagem: string,
  historico: Array<{ tipo: string; conteudo: string; agente?: string }> = []
): Promise<ClassificationResult> {

  const historicoStr = historico
    .slice(-4)
    .map(h => `${h.tipo === "entrada" ? "Usuário" : `${h.agente || "Magis"}`}: ${h.conteudo}`)
    .join("\n")

  const userPrompt = historico.length > 0
    ? `Histórico recente:\n${historicoStr}\n\nNova mensagem: "${mensagem}"`
    : `Mensagem: "${mensagem}"`

  try {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) throw new Error("Sem GROQ_API_KEY")

    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: CLASSIFIER_SYSTEM },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
        max_tokens: 500,
      }),
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) throw new Error(`Groq classifier error: ${res.status}`)

    const data = await res.json()
    const raw = data.choices?.[0]?.message?.content?.trim() || ""

    // Tentar extrair JSON mesmo que venha com texto ao redor
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]) as ClassificationResult
      // Validar agentes retornados
      parsed.agentes = parsed.agentes.filter(id => AGENTS.some(a => a.id === id))
      if (parsed.agentes.length === 0) parsed.agentes = ["bi"]
      return parsed
    }
    throw new Error("JSON não encontrado na resposta")

  } catch (err) {
    console.warn("[Classifier] Fallback para classificação por tags:", err)
    return classificarPorTags(mensagem)
  }
}

// ─── Fallback: Classificação por Tags ────────────────────────────────────────

function classificarPorTags(mensagem: string): ClassificationResult {
  const lower = mensagem.toLowerCase()
  const agentesEncontrados = getAgentsByTags(mensagem)

  // Detectar ação pelo vocabulário
  let acao: ActionType = "READ"
  if (/criar|cadastrar|adicionar|abrir|registrar|nova|novo/.test(lower)) acao = "CREATE"
  else if (/editar|atualizar|alterar|mudar|trocar|mover|modificar/.test(lower)) acao = "UPDATE"
  else if (/excluir|deletar|apagar|remover|cancelar|arquivar/.test(lower)) acao = "DELETE"
  else if (/relatório|relatorio|exportar|gerar|resumo/.test(lower)) acao = "REPORT"
  else if (/buscar|procurar|encontrar|listar|mostrar|quais|quantos|quanto/.test(lower)) acao = "SEARCH"

  const requerConfirmacao = acao === "DELETE"

  // Extrair entidades simples
  const entidades: Record<string, any> = {}
  const nomeMatch = mensagem.match(/chamad[ao] ["']?([^"',\n]+)["']?/i)
  if (nomeMatch) entidades.nome = nomeMatch[1].trim()

  const responsavelMatch = mensagem.match(/(?:para|ao?|responsável:?) ([A-ZÁÉÍÓÚÂÊÎÔÛ][a-záéíóúâêîôûãõ]+)/i)
  if (responsavelMatch) entidades.responsavel = responsavelMatch[1].trim()

  return {
    intencao: `${acao.toLowerCase()}_${agentesEncontrados[0]?.id || "geral"}`,
    agentes: agentesEncontrados.slice(0, 2).map(a => a.id).length > 0
      ? agentesEncontrados.slice(0, 2).map(a => a.id)
      : ["bi"],
    acao,
    entidades,
    requerConfirmacao,
    confianca: agentesEncontrados.length > 0 ? 0.6 : 0.3,
  }
}
