/**
 * ai/orchestrator/memory.ts
 * Memória compartilhada de sessão entre agentes.
 * Resolve referências anafóricas ("ela", "o cliente", "esse projeto").
 * Implementação em memória Node.js com TTL de 30 minutos.
 */

export interface PendingAction {
  tool: string
  agenteId: string
  params: Record<string, any>
  descricao: string  // mensagem humana que gerou esta ação pendente
  expiraEm: number   // timestamp
}

export interface SessionContext {
  sessionId: string
  entidadesAtivas: Record<string, any>   // { cliente: {...}, campanha: {...} }
  ultimosAgentes: string[]               // IDs dos últimos agentes usados
  historicoMensagens: Array<{
    tipo: "entrada" | "saida"
    conteudo: string
    agente?: string
    timestamp: number
  }>
  pendingAction?: PendingAction          // Ação aguardando confirmação do usuário
  ultimoContexto?: string                // Último assunto/módulo discutido
  createdAt: number
  updatedAt: number
}

const SESSION_TTL_MS = 30 * 60 * 1000  // 30 minutos

// Store em memória (Node.js singleton)
const sessions = new Map<string, SessionContext>()

// ─── Limpeza periódica de sessões expiradas ──────────────────────────────────
setInterval(() => {
  const agora = Date.now()
  for (const [id, ctx] of sessions.entries()) {
    if (agora - ctx.updatedAt > SESSION_TTL_MS) {
      sessions.delete(id)
    }
  }
}, 5 * 60 * 1000) // a cada 5 minutos

// ─── API Pública ──────────────────────────────────────────────────────────────

export function getSession(sessionId: string): SessionContext {
  const existing = sessions.get(sessionId)
  if (existing) {
    existing.updatedAt = Date.now()
    return existing
  }

  const ctx: SessionContext = {
    sessionId,
    entidadesAtivas: {},
    ultimosAgentes: [],
    historicoMensagens: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  sessions.set(sessionId, ctx)
  return ctx
}

export function updateSession(
  sessionId: string,
  updates: Partial<Pick<SessionContext, "entidadesAtivas" | "ultimosAgentes" | "historicoMensagens">>
): void {
  const ctx = getSession(sessionId)

  if (updates.entidadesAtivas) {
    ctx.entidadesAtivas = { ...ctx.entidadesAtivas, ...updates.entidadesAtivas }
  }

  if (updates.ultimosAgentes) {
    ctx.ultimosAgentes = updates.ultimosAgentes
  }

  if (updates.historicoMensagens) {
    ctx.historicoMensagens = [
      ...ctx.historicoMensagens,
      ...updates.historicoMensagens,
    ].slice(-20) // manter apenas últimas 20 mensagens
  }

  ctx.updatedAt = Date.now()
  sessions.set(sessionId, ctx)
}

export function addMensagem(
  sessionId: string,
  tipo: "entrada" | "saida",
  conteudo: string,
  agente?: string
): void {
  updateSession(sessionId, {
    historicoMensagens: [{ tipo, conteudo, agente, timestamp: Date.now() }],
  })
}

/**
 * Enriquecer entidades classificadas com dados salvos na sessão.
 * Resolve pronomes e referências anafóricas.
 */
export function resolverEntidades(
  sessionId: string,
  entidades: Record<string, any>,
  mensagem: string
): Record<string, any> {
  const ctx = getSession(sessionId)
  const resultado = { ...entidades }
  const lower = mensagem.toLowerCase()

  // Se a mensagem usa pronomes de referência, injetar entidades ativas
  const usaReferencia = /\b(ela|ele|isso|esse|essa|aquela|aquele|o mesmo|a mesma|dele|dela)\b/i.test(lower)

  if (usaReferencia || Object.keys(resultado).length === 0) {
    // Injetar todas as entidades ativas da sessão como contexto
    for (const [key, val] of Object.entries(ctx.entidadesAtivas)) {
      if (!resultado[key]) resultado[key] = val
    }
  }

  return resultado
}

/**
 * Registrar entidades retornadas por um agente para uso futuro na conversa.
 */
export function registrarEntidades(sessionId: string, agenteId: string, dados: any): void {
  if (!dados) return
  const ctx = getSession(sessionId)
  const updates: Record<string, any> = {}

  // Mapear por tipo de agente
  if (agenteId === "crm") {
    if (dados.clientes?.[0]) updates.cliente = dados.clientes[0]
    if (dados.negociacoes?.[0]) updates.negociacao = dados.negociacoes[0]
  } else if (agenteId === "marketing") {
    if (dados.campanhas?.[0]) updates.campanha = dados.campanhas[0]
  } else if (agenteId === "projetos") {
    if (dados.tarefas?.[0]) updates.tarefa = dados.tarefas[0]
  } else if (agenteId === "os") {
    if (dados.ordens?.[0]) updates.ordemServico = dados.ordens[0]
  } else if (agenteId === "estoque") {
    if (dados.produtos?.[0]) updates.produto = dados.produtos[0]
  }

  if (Object.keys(updates).length > 0) {
    updateSession(sessionId, { entidadesAtivas: updates })
  }
}

/**
 * Retornar histórico formatado para injetar no prompt do LLM.
 */
export function formatarHistorico(sessionId: string, limit = 6): string {
  const ctx = getSession(sessionId)
  return ctx.historicoMensagens
    .slice(-limit)
    .map(m => `${m.tipo === "entrada" ? "Usuário" : m.agente || "Magis"}: ${m.conteudo}`)
    .join("\n")
}

/**
 * Salvar ação pendente (aguardando confirmação do usuário).
 */
export function setPendingAction(sessionId: string, action: Omit<PendingAction, "expiraEm">): void {
  const ctx = getSession(sessionId)
  ctx.pendingAction = {
    ...action,
    expiraEm: Date.now() + 5 * 60 * 1000 // expira em 5 minutos
  }
  ctx.updatedAt = Date.now()
  sessions.set(sessionId, ctx)
}

/**
 * Consumir e remover ação pendente se ainda válida.
 */
export function consumePendingAction(sessionId: string): PendingAction | null {
  const ctx = getSession(sessionId)
  const pending = ctx.pendingAction
  if (!pending) return null
  if (Date.now() > pending.expiraEm) {
    delete ctx.pendingAction
    sessions.set(sessionId, ctx)
    return null
  }
  delete ctx.pendingAction
  ctx.updatedAt = Date.now()
  sessions.set(sessionId, ctx)
  return pending
}

/**
 * Atualizar contexto atual do assunto da conversa.
 */
export function setContexto(sessionId: string, contexto: string): void {
  const ctx = getSession(sessionId)
  ctx.ultimoContexto = contexto
  ctx.updatedAt = Date.now()
  sessions.set(sessionId, ctx)
}

/**
 * Verificar se uma mensagem é confirmação do usuário.
 */
export function isConfirmacao(mensagem: string): boolean {
  const confirmacoes = /^\s*(sim|s|yes|y|ok|pode|confirmar|confirmado|prosseguir|claro|vamos|vai|bora|certo|pode ser|quero|quero sim|pode proceder)\s*[.!]?\s*$/i
  return confirmacoes.test(mensagem.trim())
}

/**
 * Verificar se uma mensagem é negação do usuário.
 */
export function isNegacao(mensagem: string): boolean {
  const negacoes = /^\s*(não|nao|n|no|cancelar|cancelado|abortar|para|pare|desistir|deixa)\s*[.!]?\s*$/i
  return negacoes.test(mensagem.trim())
}
