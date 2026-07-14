"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"

export interface MagisAction {
  label: string
  type: "campanha" | "tarefa" | "relatorio" | "link" | "ia" | "venda" | "executar"
  href?: string
  payload?: Record<string, any>
}

export interface MagisResponse {
  agente: string
  agenteIcon: string
  agenteColor?: string
  diagnostico: string
  motivo: string
  recomendacao: string
  proximoPasso: string
  acoes: MagisAction[]
  dados?: { label: string; valor: string; cor?: string }[]
  tipo?: "info" | "alerta" | "sucesso" | "acao"
}

// Detecção simples de intenção via regex (pode ser expandida no futuro para NLP real)
type Intencao =
  | "os_resumo"
  | "os_atrasadas"
  | "financeiro_caixa"
  | "clientes_resumo"
  | "desconhecido"

function detectarIntencao(mensagem: string): Intencao {
  const m = mensagem.toLowerCase()
  
  if (m.match(/os|ordem de serviço|ordens|atendimento/)) {
    if (m.match(/atrasada|vencida|risco|sla/)) return "os_atrasadas"
    return "os_resumo"
  }
  
  if (m.match(/financeiro|caixa|faturamento|dinheiro|pagamento|receita/)) {
    return "financeiro_caixa"
  }
  
  if (m.match(/cliente|empresa|contato|base/)) {
    return "clientes_resumo"
  }
  
  return "desconhecido"
}

export async function processarMensagemIA(mensagem: string): Promise<MagisResponse> {
  const tenantId = getTenantId()
  const intencao = detectarIntencao(mensagem)
  
  try {
    switch (intencao) {
      case "os_resumo":
        return await resumoOS(tenantId)
      case "os_atrasadas":
        return await osAtrasadas(tenantId)
      case "financeiro_caixa":
        return await resumoFinanceiro(tenantId)
      case "clientes_resumo":
        return await resumoClientes(tenantId)
      case "desconhecido":
      default:
        return respostaDesconhecida()
    }
  } catch (error) {
    console.error("[processarMensagemIA]", error)
    return respostaDesconhecida()
  }
}

// ==========================================
// FUNÇÕES DE CADA INTENÇÃO (CONSULTANDO DB)
// ==========================================

async function resumoOS(tenantId: string): Promise<MagisResponse> {
  const total = await prisma.ordemServico.count({ where: { tenantId } })
  const pendentes = await prisma.ordemServico.count({ where: { tenantId, status: "aguardando_agendamento" } })
  const agendadas = await prisma.ordemServico.count({ where: { tenantId, status: "agendada" } })
  const concluidas = await prisma.ordemServico.count({ where: { tenantId, status: "concluida" } })

  return {
    agente: "JARMIS Field Service",
    agenteIcon: "ClipboardList",
    agenteColor: "#D97706",
    diagnostico: `Existem ${total} OS no sistema. Dessas, ${pendentes} estão aguardando agendamento e ${agendadas} estão agendadas para técnicos.`,
    motivo: "Você tem um gargalo moderado de OS pendentes sem técnico.",
    recomendacao: "Despache as OS pendentes para a equipe de campo imediatamente.",
    proximoPasso: "Acesse a tela de Rotas (Despacho) para alocar os técnicos.",
    tipo: "info",
    acoes: [
      { label: "Ir para Despacho / Rotas", type: "link", href: "/os?tab=rotas" },
      { label: "Ver todas as OS", type: "link", href: "/os?tab=todas" },
    ],
    dados: [
      { label: "Pendentes", valor: pendentes.toString(), cor: "#EF4444" },
      { label: "Agendadas", valor: agendadas.toString(), cor: "#F59E0B" },
      { label: "Concluídas", valor: concluidas.toString(), cor: "#22C55E" },
    ]
  }
}

async function osAtrasadas(tenantId: string): Promise<MagisResponse> {
  const agora = new Date()
  const atrasadas = await prisma.ordemServico.findMany({
    where: {
      tenantId,
      status: { notIn: ["concluida", "cancelada"] },
      prazoSLA: { lt: agora }
    },
    take: 5,
    include: { cliente: true }
  })

  if (atrasadas.length === 0) {
    return {
      agente: "JARMIS Field Service",
      agenteIcon: "CheckCircle2",
      agenteColor: "#22C55E",
      diagnostico: "Nenhuma Ordem de Serviço com SLA vencido no momento. Sua operação está 100% no prazo.",
      motivo: "A equipe técnica está operando dentro da margem de segurança do SLA estabelecido.",
      recomendacao: "Mantenha o ritmo atual.",
      proximoPasso: "Se desejar, avalie criar métricas preditivas para amanhã.",
      tipo: "sucesso",
      acoes: [{ label: "Ver Dashboard de Relatórios", type: "link", href: "/os?tab=relatorios" }]
    }
  }

  return {
    agente: "JARMIS Field Service",
    agenteIcon: "AlertTriangle",
    agenteColor: "#EF4444",
    diagnostico: `Alerta: Encontrei ${atrasadas.length} OS(s) com o SLA de atendimento estourado!`,
    motivo: "Essas ordens já ultrapassaram o tempo limite de resolução acordado.",
    recomendacao: "Priorize o envio imediato da equipe técnica para essas ordens ou renegocie o prazo com o cliente.",
    proximoPasso: "Acesse a aba 'Todas as OS', filtre pelas críticas e aloque-as.",
    tipo: "alerta",
    acoes: [
      { label: "Ver OS Críticas no Kanban", type: "link", href: "/os?tab=kanban" }
    ],
    dados: atrasadas.map(os => ({
      label: `OS #${os.numeroOS}`,
      valor: `${os.cliente.nome} (Atrasada)`,
      cor: "#EF4444"
    }))
  }
}

async function resumoFinanceiro(tenantId: string): Promise<MagisResponse> {
  const ordens = await prisma.ordemServico.findMany({
    where: { tenantId },
    select: { valorPrevisto: true, valorFinal: true, statusFaturamento: true }
  })

  let faturado = 0
  let pendente = 0

  ordens.forEach(o => {
    const val = o.valorFinal || o.valorPrevisto || 0
    if (o.statusFaturamento === "faturada" || o.statusFaturamento === "paga") {
      faturado += val
    } else {
      pendente += val
    }
  })

  const formataMoeda = (n: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n)

  return {
    agente: "JARMIS Financeiro",
    agenteIcon: "DollarSign",
    agenteColor: "#22C55E",
    diagnostico: `Resumo do faturamento de OS: Faturado total de ${formataMoeda(faturado)} e um valor pendente (não faturado) de ${formataMoeda(pendente)}.`,
    motivo: "Isso reflete apenas o fluxo proveniente da execução de Serviços de Campo.",
    recomendacao: "Gere as faturas pendentes para converter o valor retido em contas a receber.",
    proximoPasso: "Acesse o módulo de Cobranças para gerar os Boletos.",
    tipo: "info",
    acoes: [
      { label: "Ir para Cobranças", type: "link", href: "/financeiro/contas" }
    ],
    dados: [
      { label: "Faturado", valor: formataMoeda(faturado), cor: "#22C55E" },
      { label: "Pendente (Risco)", valor: formataMoeda(pendente), cor: "#F59E0B" }
    ]
  }
}

async function resumoClientes(tenantId: string): Promise<MagisResponse> {
  const ativos = await prisma.cliente.count({ where: { tenantId, status: "ativo" } })
  const inativos = await prisma.cliente.count({ where: { tenantId, status: "inativo" } })

  return {
    agente: "JARMIS CRM",
    agenteIcon: "Users",
    agenteColor: "#3B82F6",
    diagnostico: `Você possui um total de ${ativos + inativos} clientes cadastrados na base.`,
    motivo: `${ativos} estão classificados como ativos e ${inativos} como inativos.`,
    recomendacao: "Uma base ativa saudável gira em torno de 80%. Considere campanhas de reativação para os inativos.",
    proximoPasso: "Use a IA Preditiva para identificar os melhores inativos para reativar.",
    tipo: "info",
    acoes: [
      { label: "Ver lista de Clientes", type: "link", href: "/clientes" }
    ],
    dados: [
      { label: "Ativos", valor: ativos.toString(), cor: "#3B82F6" },
      { label: "Inativos", valor: inativos.toString(), cor: "#94A3B8" }
    ]
  }
}

function respostaDesconhecida(): MagisResponse {
  return {
    agente: "JARMIS Core",
    agenteIcon: "Zap",
    agenteColor: "#6D4AFF",
    diagnostico: "Desculpe, ainda estou mapeando e sincronizando esses dados operacionais do banco.",
    motivo: "Minha capacidade atual de busca no banco foca em: Resumo de OS, OS Atrasadas, Financeiro, Faturamento e Clientes.",
    recomendacao: "Tente perguntar algo como: 'Quais as OS atrasadas?' ou 'Como está o financeiro e faturamento?'.",
    proximoPasso: "Refine a sua solicitação.",
    tipo: "info",
    acoes: []
  }
}
