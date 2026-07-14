/**
 * ai/orchestrator/index.ts
 * Orquestrador principal do sistema multiagente Magis.
 *
 * Fluxo:
 * 1. Receber mensagem + sessionId
 * 2. Classificar intenção → agentes[] + entidades
 * 3. Para ações destrutivas → retornar pedido de confirmação
 * 4. Executar tool call(s) nos agentes da cadeia
 * 5. Sintetizar resposta via Groq com contexto de execução
 * 6. Registrar auditoria (AgentLog)
 * 7. Retornar OrchestratorResponse
 */

import { classificarIntencao, ClassificationResult, ActionType } from "./classifier"
import { executarTool, ToolResult } from "./tools"
import { getSession, addMensagem, registrarEntidades, resolverEntidades, formatarHistorico, isConfirmacao, isNegacao, consumePendingAction, setContexto } from "./memory"
import { getAgent, AGENTS } from "@/ai/agents/registry"
import prisma from "@/lib/prisma"

// ─── Tool padrão por agente para operações READ/REPORT/SEARCH ──────────────

const DEFAULT_READ_TOOL: Record<string, string> = {
  crm:        "listarClientes",
  marketing:  "listarCampanhas",
  projetos:   "listarTarefas",
  financeiro: "resumoFinanceiro",
  estoque:    "listarProdutos",
  os:         "listarOS",
  bi:         "kpisDashboard",
  whatsapp:   "listarConversas",
}

const DEFAULT_CREATE_TOOL: Record<string, string> = {
  crm:       "criarCliente",
  marketing: "criarCampanha",
  projetos:  "criarTarefa",
  financeiro: "criarLancamento",
}

// ─── Tipos de Resposta ────────────────────────────────────────────────────────

export interface AgentStep {
  agenteId: string
  agenteName: string
  agenteIcon: string
  tool: string
  resultado: ToolResult
}

export interface OrchestratorResponse {
  // Identificação
  agente: string
  agenteIcon: string
  agenteColor: string
  agenteId: string
  agentesEnvolvidos: string[]  // nomes dos agentes que participaram

  // Conteúdo
  diagnostico: string
  recomendacao: string
  proximoPasso: string
  dados: Array<{ label: string; valor: string; cor: string }>
  acoes: Array<{ label: string; type?: string; href?: string }>
  tipo: "info" | "sucesso" | "alerta" | "acao"

  // Confirmação (ações destrutivas)
  requerConfirmacao?: boolean
  confirmacaoPayload?: {
    acao: string
    agente: string
    entidades: Record<string, any>
  }

  // Campos Rich UI
  actionPlan?: {
    oQueFazer: string
    comoFazer: string
    quandoExecutar: string
    responsavel: string
    retornoEsperado?: string
    impacto?: string
  }
  clientProfile?: {
    nome: string
    status: string
    score: number
    totalComprado: string
    ultimaCompra: string
    probabilidadeRecompra: string
  }
  reportData?: {
    titulo: string
    linhas: Array<Record<string, string>>
    colunas: string[]
    totais?: Record<string, string>
  }

  // Meta
  _source: string
  _model: string
  _agentes: string[]
  _steps: AgentStep[]
}

// ─── Sintetizador de Resposta Final ──────────────────────────────────────────

async function sintetizarResposta(
  agenteDef: { systemPrompt: string; nome: string },
  mensagem: string,
  stepsResultados: AgentStep[],
  historicoStr: string,
  classificacao: ClassificationResult
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  const dadosExecucao = stepsResultados
    .map(s => `[${s.agenteName}/${s.tool}]: ${JSON.stringify(s.resultado.dados || s.resultado.mensagem)}`)
    .join("\n")

  const promptSintese = `${agenteDef.systemPrompt}

${historicoStr ? `=== HISTÓRICO ===\n${historicoStr}\n` : ""}
=== DADOS REAIS CONSULTADOS ===
${dadosExecucao}

=== SOLICITAÇÃO DO USUÁRIO ===
"${mensagem}"

Responda com base EXCLUSIVAMENTE nos dados reais acima.
Sua resposta deve ser um JSON válido com esta estrutura EXATA (sem markdown, sem texto fora do JSON):
{
  "diagnostico": "Seja fluido, consultivo e humano. Inicie como um parceiro estratégico (ex: 'Analisando os dados, notei que...'). Evite ser robótico.",
  "recomendacao": "Sugestão estratégica do que fazer em seguida, escrita com tom humano e proativo.",
  "proximoPasso": "instrução clara do que fazer agora",
  "dados": [
    { "label": "nome do indicador", "valor": "valor formatado", "cor": "green|blue|red|orange|purple|gray" }
  ],
  "acoes": [
    { "label": "Texto do botão de ação" }
  ],
  "tipo": "info|sucesso|alerta|acao",
  "actionPlan": {
    "oQueFazer": "Criar Tarefa de Contato / Pausar Campanha",
    "comoFazer": "Passo a passo",
    "quandoExecutar": "Hoje / Amanhã",
    "responsavel": "Vendedor",
    "retornoEsperado": "R$ 5.000 / Reversão",
    "impacto": "Alto"
  },
  "clientProfile": {
    "nome": "Nome do Cliente",
    "status": "ativo|inativo|lead",
    "score": 80,
    "totalComprado": "R$ 15.000,00",
    "ultimaCompra": "12/05/2025",
    "probabilidadeRecompra": "Alta"
  },
  "reportData": {
    "titulo": "Relatório de Vendas por Produto",
    "colunas": ["Produto", "Qtd Vendida", "Receita", "Margem"],
    "linhas": [
      { "Produto": "Nome", "Qtd Vendida": "100", "Receita": "R$ 10.000", "Margem": "45%" }
    ],
    "totais": { "Receita": "R$ 50.000" }
  }
}
NOTA: Inclua "actionPlan" APENAS se houver recomendação operacional clara. Inclua "clientProfile" APENAS se for análise de cliente específico. Inclua "reportData" APENAS se o usuário solicitar um relatório/listagem com dados tabulares. Omita as chaves que não se aplicam.`

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [{ role: "user", content: promptSintese }],
        temperature: agenteDef.systemPrompt.includes("BI") ? 0.1 : 0.2,
        max_tokens: 2000,
      }),
      signal: AbortSignal.timeout(12000),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error("[Orchestrator] Groq síntese error:", res.status, err)
      return null
    }

    const data = await res.json()
    return data.choices?.[0]?.message?.content?.trim() || null
  } catch (e) {
    console.error("[Orchestrator] Groq síntese exception:", e)
    return null
  }
}

// ─── Determinar Tool a executar com base na classificação ────────────────────

function resolverTool(agenteId: string, acao: ActionType, entidades: Record<string, any>): string {
  if (acao === "READ" || acao === "SEARCH") {
    // Tool especializadas por palavras-chave nas entidades
    if (agenteId === "crm" && entidades.negociacao) return "listarNegociacoes"
    if (agenteId === "bi" && entidades.vendedor) return "rankingVendedores"
    if (agenteId === "financeiro" && entidades.lista) return "listarLancamentos"
    if (agenteId === "estoque" && (entidades.risco || entidades.ruptura)) return "produtosEmRisco"
    return DEFAULT_READ_TOOL[agenteId] || DEFAULT_READ_TOOL.bi
  }
  if (acao === "CREATE") {
    return DEFAULT_CREATE_TOOL[agenteId] || DEFAULT_READ_TOOL[agenteId]
  }
  if (acao === "REPORT") {
    if (agenteId === "bi") return "rankingVendedores"
    if (agenteId === "financeiro") return "resumoFinanceiro"
    return DEFAULT_READ_TOOL[agenteId]
  }
  return DEFAULT_READ_TOOL[agenteId] || DEFAULT_READ_TOOL.bi
}

// ─── Gravar Auditoria ────────────────────────────────────────────────────────

import { getTenantId } from "@/lib/tenant-context"

async function gravarAuditoria(params: {
  sessionId: string
  mensagem: string
  agentes: string[]
  acao: string
  entidades: Record<string, any>
  resultado: any
  sucesso: boolean
}) {
  try {
    await prisma.agentLog.create({
      data: {
        tenantId: getTenantId(),
        sessionId: params.sessionId,
        mensagem: params.mensagem.slice(0, 500),
        agente: params.agentes.join(","),
        acao: params.acao,
        entidades: JSON.stringify(params.entidades),
        resultado: JSON.stringify(params.resultado).slice(0, 1000),
        sucesso: params.sucesso,
      },
    })
  } catch (e) {
    console.warn("[Orchestrator] Falha ao gravar auditoria:", e)
  }
}

// ─── ORQUESTRADOR PRINCIPAL ──────────────────────────────────────────────────

export async function orquestrar(params: {
  sessionId: string
  mensagem: string
  historico?: Array<{ tipo: string; conteudo: string; agente?: string }>
  confirmacaoPayload?: Record<string, any>  // payload de confirmação de ação destrutiva
}): Promise<OrchestratorResponse> {

  const { sessionId, mensagem, historico = [], confirmacaoPayload } = params
  const session = getSession(sessionId)

  // ── Registrar mensagem do usuário na memória ──
  addMensagem(sessionId, "entrada", mensagem)

  // ── Passo 0: Verificar se é confirmação de ação pendente ──────────────────
  if (isConfirmacao(mensagem)) {
    const pendingAction = consumePendingAction(sessionId)
    if (pendingAction) {
      // Executar diretamente sem reclassificar
      const agenteDef = getAgent(pendingAction.agenteId) || AGENTS[6]
      const resultado = await executarTool({
        agenteId: pendingAction.agenteId,
        tool: pendingAction.tool,
        params: pendingAction.params,
      })
      addMensagem(sessionId, "saida", `Ação executada: ${pendingAction.descricao}`, agenteDef.nome)
      return {
        agente: agenteDef.nome,
        agenteIcon: agenteDef.icone,
        agenteColor: agenteDef.cor,
        agenteId: agenteDef.id,
        agentesEnvolvidos: [agenteDef.nome],
        diagnostico: resultado.sucesso
          ? `✅ Feito! **${pendingAction.descricao}** foi executado com sucesso.${resultado.mensagem ? `\n\n${resultado.mensagem}` : ""}`
          : `⚠️ Não foi possível executar a ação: ${resultado.mensagem}`,
        recomendacao: resultado.sucesso ? "Ação concluída. O que mais posso fazer por você?" : "Tente novamente ou me forneça mais informações.",
        proximoPasso: "",
        dados: [],
        acoes: [],
        tipo: resultado.sucesso ? "sucesso" : "alerta",
        _source: "orchestrator_pending",
        _model: "n/a",
        _agentes: [pendingAction.agenteId],
        _steps: [],
      }
    }
  }

  if (isNegacao(mensagem)) {
    const pendingAction = consumePendingAction(sessionId)
    if (pendingAction) {
      addMensagem(sessionId, "saida", "Ação cancelada pelo usuário.", "Magis")
      const agenteDef = getAgent(pendingAction.agenteId) || AGENTS[6]
      return {
        agente: agenteDef.nome,
        agenteIcon: "✅",
        agenteColor: "green",
        agenteId: agenteDef.id,
        agentesEnvolvidos: [agenteDef.nome],
        diagnostico: "Entendido. Ação **cancelada** com sucesso. Nenhuma alteração foi realizada no sistema.",
        recomendacao: "Me diga como posso ajudar de outra forma.",
        proximoPasso: "",
        dados: [],
        acoes: [],
        tipo: "info",
        _source: "orchestrator_cancelled",
        _model: "n/a",
        _agentes: [],
        _steps: [],
      }
    }
  }

  // ── Passo 1: Classificar Intenção ──────────────────────────────────────────
  const classificacao = await classificarIntencao(mensagem, historico)
  console.log("[Orchestrator] Classificação:", JSON.stringify(classificacao))

  // ── Passo 2: Resolver entidades com contexto da sessão ────────────────────
  const entidades = resolverEntidades(sessionId, classificacao.entidades, mensagem)

  // ── Passo 3: Se ação destrutiva E sem confirmação → pedir confirmação ──────
  if (classificacao.requerConfirmacao && !confirmacaoPayload) {
    const agenteDef = getAgent(classificacao.agentes[0]) || AGENTS[6]
    return {
      agente: agenteDef.nome,
      agenteIcon: agenteDef.icone,
      agenteColor: agenteDef.cor,
      agenteId: agenteDef.id,
      agentesEnvolvidos: [agenteDef.nome],
      diagnostico: `Esta ação é **irreversível**. Deseja confirmar?`,
      recomendacao: `Confirme a operação: **${classificacao.intencao}**`,
      proximoPasso: "Clique em **Confirmar** para prosseguir ou **Cancelar** para abortar.",
      dados: [],
      acoes: [],
      tipo: "alerta",
      requerConfirmacao: true,
      confirmacaoPayload: {
        acao: classificacao.acao,
        agente: classificacao.agentes[0],
        entidades,
      },
      _source: "orchestrator",
      _model: "llama-3.3-70b-versatile",
      _agentes: classificacao.agentes,
      _steps: [],
    }
  }

  // ── Passo 4: Executar Tool Calls na cadeia de agentes ─────────────────────
  const steps: AgentStep[] = []

  for (const agenteId of classificacao.agentes) {
    const agenteDef = getAgent(agenteId)
    if (!agenteDef) continue

    const tool = resolverTool(agenteId, classificacao.acao, entidades)

    // Montar params do tool
    let toolParams: Record<string, any> = {}
    if (classificacao.acao === "CREATE") {
      toolParams = entidades
    } else if (classificacao.acao === "READ" || classificacao.acao === "SEARCH") {
      toolParams = {
        busca: entidades.busca || entidades.nome,
        status: entidades.status,
        limit: 10,
      }
    } else if (confirmacaoPayload) {
      toolParams = confirmacaoPayload
    }

    const resultado = await executarTool({ agenteId, tool, params: toolParams })
    steps.push({
      agenteId,
      agenteName: agenteDef.nome,
      agenteIcon: agenteDef.icone,
      tool,
      resultado,
    })

    // Registrar entidades retornadas na memória da sessão
    if (resultado.sucesso && resultado.dados) {
      registrarEntidades(sessionId, agenteId, resultado.dados)
    }
  }

  // ── Passo 5: Sintetizar resposta via Groq ────────────────────────────────
  const agenteIdPrincipal = classificacao.agentes[0] || "bi"
  const agentePrincipal = getAgent(agenteIdPrincipal) || AGENTS[6]
  const historicoStr = formatarHistorico(sessionId)

  const rawResposta = await sintetizarResposta(
    agentePrincipal,
    mensagem,
    steps,
    historicoStr,
    classificacao
  )

  // ── Passo 6: Parsear resposta ─────────────────────────────────────────────
  let parsed: any = null
  if (rawResposta) {
    try {
      const jsonMatch = rawResposta.match(/\{[\s\S]*\}/)
      if (jsonMatch) parsed = JSON.parse(jsonMatch[0])
    } catch {
      console.warn("[Orchestrator] Falha ao parsear resposta Groq")
    }
  }

  // Fallback se Groq falhou
  if (!parsed) {
    const stepResult = steps[0]?.resultado
    parsed = {
      diagnostico: stepResult?.mensagem || "Operação executada.",
      recomendacao: "",
      proximoPasso: "",
      dados: [],
      tipo: stepResult?.sucesso ? "sucesso" : "alerta",
    }
  }

  // ── Construir dados da resposta a partir dos steps ────────────────────────
  const dadosKV: Array<{ label: string; valor: string; cor: string }> = parsed.dados || []

  // Enriquecer com metadados dos steps se não vieram no parsed
  if (dadosKV.length === 0 && steps.length > 0) {
    const primeiroStep = steps[0].resultado
    if (primeiroStep.dados?.total !== undefined) {
      dadosKV.push({
        label: "Total encontrado",
        valor: String(primeiroStep.dados.total),
        cor: "blue",
      })
    }
  }

  // ── Passo 7: Registrar auditoria ──────────────────────────────────────────
  await gravarAuditoria({
    sessionId,
    mensagem,
    agentes: classificacao.agentes,
    acao: classificacao.acao,
    entidades,
    resultado: parsed,
    sucesso: steps.every(s => s.resultado.sucesso),
  })

  // ── Registrar resposta na memória ─────────────────────────────────────────
  addMensagem(sessionId, "saida", parsed.diagnostico, agentePrincipal.nome)

  // ── Montar resposta final ─────────────────────────────────────────────────
  return {
    agente: agentePrincipal.nome,
    agenteIcon: agentePrincipal.icone,
    agenteColor: agentePrincipal.cor,
    agenteId: agentePrincipal.id,
    agentesEnvolvidos: classificacao.agentes.map(id => getAgent(id)?.nome || id),
    diagnostico: parsed.diagnostico || "Processado com sucesso.",
    recomendacao: parsed.recomendacao || "",
    proximoPasso: parsed.proximoPasso || "",
    dados: dadosKV,
    acoes: parsed.acoes || [],
    tipo: parsed.tipo || "info",
    actionPlan: parsed.actionPlan,
    clientProfile: parsed.clientProfile,
    reportData: parsed.reportData,
    _source: "orchestrator_groq",
    _model: "llama-3.3-70b-versatile",
    _agentes: classificacao.agentes,
    _steps: steps,
  }
}
