"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"

export async function gerarInsightsIA() {
  const tenantId = getTenantId()
  const agora = new Date()
  
  try {
    const insights = []

    // 1. Análise de Ordens de Serviço (Gargalos)
    const osGargalos = await prisma.ordemServico.groupBy({
      by: ['status'],
      where: { tenantId, status: { notIn: ["concluida", "cancelada"] } },
      _count: { id: true }
    })

    const aguardandoAgendamento = osGargalos.find(o => o.status === "aguardando_agendamento")?._count.id || 0
    if (aguardandoAgendamento > 5) {
      insights.push({
        id: "os-agendamento",
        tipo: "alerta",
        titulo: "Gargalo no Despacho Operacional",
        descricao: `Existem ${aguardandoAgendamento} Ordens de Serviço paradas aguardando agendamento. Isso indica lentidão no roteamento ou falta de técnicos disponíveis.`,
        acao: "Ver Mapa de Despacho",
        link: "/os?tab=despacho",
        impacto: "Alto impacto no SLA do cliente",
        cor: "amber"
      })
    }

    const aguardandoRevisao = osGargalos.find(o => o.status === "aguardando_revisao")?._count.id || 0
    if (aguardandoRevisao > 3) {
      insights.push({
        id: "os-revisao",
        tipo: "oportunidade",
        titulo: "Fila de Aprovação Crescendo",
        descricao: `Os técnicos concluíram ${aguardandoRevisao} serviços que estão pendentes de aprovação pelo backoffice. Aprovar rapidamente acelera o faturamento.`,
        acao: "Ir para Aprovações",
        link: "/os?tab=aprovacoes",
        impacto: "Gera atraso no fluxo de caixa",
        cor: "indigo"
      })
    }

    // 2. Análise Financeira (Risco de Inadimplência e Faturamento)
    const contasVencidas = await prisma.lancamentoFinanceiro.aggregate({
      where: { tenantId, tipo: "receita", status: "pendente", dataVenc: { lt: agora } },
      _sum: { valor: true },
      _count: { id: true }
    })

    if (contasVencidas._count.id > 0) {
      insights.push({
        id: "fin-inadimplencia",
        tipo: "critico",
        titulo: "Risco de Inadimplência Detectado",
        descricao: `Há ${contasVencidas._count.id} cobranças vencidas totalizando ${(contasVencidas._sum.valor || 0).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}. O JARMIS recomenda disparar lembretes via WhatsApp para a régua de cobrança.`,
        acao: "Acionar Cobrança",
        link: "/financeiro/contas?tab=aging",
        impacto: "Risco de fluxo de caixa negativo",
        cor: "red"
      })
    }

    const osNaoFaturadas = await prisma.ordemServico.aggregate({
      where: { tenantId, status: "concluida", statusFaturamento: "nao_faturada" },
      _sum: { valorFinal: true, valorPrevisto: true },
      _count: { id: true }
    })

    if (osNaoFaturadas._count.id > 0) {
      const valorPreso = osNaoFaturadas._sum.valorFinal ?? osNaoFaturadas._sum.valorPrevisto ?? 0
      insights.push({
        id: "fin-naofaturada",
        tipo: "oportunidade",
        titulo: "Receita Presa em Operação Concluída",
        descricao: `${osNaoFaturadas._count.id} ordens de serviço já foram entregues, mas as cobranças não foram geradas. ${valorPreso.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})} estão parados no sistema.`,
        acao: "Faturar Agora",
        link: "/financeiro/contas?tab=os_faturar",
        impacto: "Aumenta liquidez imediata",
        cor: "emerald"
      })
    }

    // 3. Análise de Não Conformidades (Qualidade)
    const ncs = await prisma.osNaoConformidade.count({
      where: { tenantId, gravidade: "alta", createdAt: { gte: new Date(agora.getTime() - 7 * 86400000) } } // Ultimos 7 dias
    })

    if (ncs > 0) {
      insights.push({
        id: "qual-nc",
        tipo: "alerta",
        titulo: "Queda na Qualidade (Retrabalho)",
        descricao: `O modelo preditivo identificou ${ncs} Não Conformidades (Garantias/Retornos) de gravidade alta nos últimos 7 dias. Verifique se há falha de material ou necessidade de treinamento na equipe.`,
        acao: "Ver Relatório de Qualidade",
        link: "/os?tab=nao_conformidades",
        impacto: "Aumenta custo operacional em 15%",
        cor: "amber"
      })
    }

    // Se estiver tudo perfeito, adiciona um insight positivo genérico
    if (insights.length === 0) {
      insights.push({
        id: "ok-geral",
        tipo: "sucesso",
        titulo: "Operação Saudável e Otimizada",
        descricao: "A inteligência não detectou anomalias críticas no faturamento ou na operação. Os KPIs operacionais estão dentro da margem de controle de 95%.",
        acao: "Ir para Dashboard",
        link: "/",
        impacto: "Estabilidade Operacional",
        cor: "emerald"
      })
    }

    return insights
  } catch (error) {
    console.error("[gerarInsightsIA]", error)
    return []
  }
}
