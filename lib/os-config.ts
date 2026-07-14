// Regras de máquina de estados — importável tanto em server quanto client

export const TRANSICOES_VALIDAS: Record<string, string[]> = {
  rascunho:                ["aguardando_agendamento", "cancelada"],
  aguardando_agendamento:  ["agendada", "cancelada"],
  agendada:                ["em_deslocamento", "reagendada", "cancelada"],
  reagendada:              ["agendada", "cancelada"],
  em_deslocamento:         ["em_execucao", "agendada"],
  em_execucao:             ["aguardando_revisao", "pausada"],
  pausada:                 ["em_execucao", "cancelada"],
  aguardando_revisao:      ["concluida", "em_execucao", "nao_conformidade"],
  nao_conformidade:        [],
  concluida:               ["retorno"],
  cancelada:               [],
  retorno:                 [],
}

export const TRANSICOES_CRITICAS = new Set([
  "cancelada", "nao_conformidade", "reagendada", "retorno"
])

export const REQUER_MOTIVO = new Set([
  "cancelada", "nao_conformidade", "reagendada"
])

export function validarTransicao(statusAtual: string, novoStatus: string): void {
  const permitidas = TRANSICOES_VALIDAS[statusAtual] ?? []
  if (!permitidas.includes(novoStatus)) {
    throw new Error(
      `Transição inválida: ${statusAtual} → ${novoStatus}. Permitidas: ${permitidas.join(", ") || "nenhuma"}`
    )
  }
}

export const OS_STATUS_CONFIG: Record<string, { label: string; cor: string; bg: string; border: string }> = {
  rascunho:               { label: "Rascunho",         cor: "#94A3B8", bg: "bg-slate-100",   border: "border-slate-200" },
  aguardando_agendamento: { label: "Aguardando",       cor: "#7C8399", bg: "bg-slate-100",   border: "border-slate-200" },
  agendada:               { label: "Agendada",         cor: "#3B82F6", bg: "bg-blue-50",     border: "border-blue-200" },
  reagendada:             { label: "Reagendada",       cor: "#8B5CF6", bg: "bg-violet-50",   border: "border-violet-200" },
  em_deslocamento:        { label: "Deslocamento",     cor: "#8B5CF6", bg: "bg-violet-50",   border: "border-violet-200" },
  em_execucao:            { label: "Em Execução",      cor: "#F59E0B", bg: "bg-amber-50",    border: "border-amber-200" },
  pausada:                { label: "Pausada",          cor: "#F97316", bg: "bg-orange-50",   border: "border-orange-200" },
  aguardando_revisao:     { label: "Em Revisão",       cor: "#6D4AFF", bg: "bg-purple-50",   border: "border-purple-200" },
  concluida:              { label: "Concluída",        cor: "#22C55E", bg: "bg-emerald-50",  border: "border-emerald-200" },
  nao_conformidade:       { label: "Não Conformidade", cor: "#EF4444", bg: "bg-red-50",      border: "border-red-200" },
  cancelada:              { label: "Cancelada",        cor: "#6B7280", bg: "bg-gray-100",    border: "border-gray-200" },
  retorno:                { label: "Retorno",          cor: "#F59E0B", bg: "bg-amber-50",    border: "border-amber-200" },
}

export const OS_PRIORIDADE_CONFIG: Record<string, { label: string; cor: string }> = {
  critica: { label: "Crítica", cor: "#EF4444" },
  alta:    { label: "Alta",    cor: "#F97316" },
  media:   { label: "Média",   cor: "#F59E0B" },
  baixa:   { label: "Baixa",   cor: "#22C55E" },
}
