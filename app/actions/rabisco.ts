"use server"
import prisma from "@/lib/prisma"

const TENANT_ID = "tenant_rabisco_001"

export async function getProjetosArq() {
  try {
    const projetos = await prisma.projetoArq.findMany({
      where: { tenantId: TENANT_ID },
      include: {
        etapas: { orderBy: { ordem: "asc" } },
        obra: { select: { id: true, percentualFisico: true, diasAtraso: true, status: true } },
        aprovacoes: { where: { status: "aguardando_decisao" }, select: { id: true } },
      },
      orderBy: { updatedAt: "desc" },
    })
    return { success: true, data: projetos }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function getProjetoArqById(id: string) {
  try {
    const p = await prisma.projetoArq.findFirst({
      where: { id, tenantId: TENANT_ID },
      include: {
        etapas: { orderBy: { ordem: "asc" } },
        briefing: true,
        obra: true,
        aprovacoes: { orderBy: { createdAt: "desc" } },
        alteracoes: { orderBy: { createdAt: "desc" } },
        documentos: { orderBy: { createdAt: "desc" } },
        versoes: { orderBy: { createdAt: "desc" } },
        cotacoes: { orderBy: { createdAt: "desc" } },
        itensCompra: { orderBy: { createdAt: "desc" } },
      },
    })
    return { success: true, data: p }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarProjetoArq(data: {
  clienteId: string; nome: string; tipo?: string; imovelNovo?: boolean
  metragem?: number; orcamentoPrevisto?: number; responsavelId?: string
  dataInicio?: Date; prazoEstimado?: Date; observacoes?: string
}) {
  try {
    const ETAPAS_PADRAO = [
      "Medição e Levantamento", "Briefing", "Layout e Referências", "Projeto 3D",
      "Aprovação do Conceito", "Detalhamento Técnico", "Lista de Compras e Orçamento",
      "Acompanhamento de Obra", "Entrega Final",
    ]
    const projeto = await prisma.projetoArq.create({
      data: { tenantId: TENANT_ID, ...data, status: "briefing", etapaAtual: "Medição e Levantamento" },
    })
    await prisma.etapaProjetoArq.createMany({
      data: ETAPAS_PADRAO.map((nome, i) => ({
        tenantId: TENANT_ID, projetoId: projeto.id, nome, ordem: i + 1, status: i === 0 ? "em_andamento" : "pendente",
      })),
    })
    return { success: true, data: projeto }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function getObrasArq() {
  try {
    const obras = await prisma.obraArq.findMany({
      where: { tenantId: TENANT_ID },
      include: {
        atividades: { orderBy: { ordem: "asc" } },
        visitas: { orderBy: { dataAgendada: "asc" }, take: 5 },
        naoConfs: { where: { status: { not: "aprovada" } }, select: { id: true, gravidade: true } },
        projeto: { select: { nome: true, orcamentoPrevisto: true } },
      },
      orderBy: { updatedAt: "desc" },
    })
    return { success: true, data: obras }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function getDashboardRabisco() {
  try {
    const [projetos, obras, aprovacoesPendentes, diasDestaQueVisitas] = await Promise.all([
      prisma.projetoArq.findMany({
        where: { tenantId: TENANT_ID, status: { not: "entrega" } },
        select: { id: true, nome: true, status: true, etapaAtual: true, percentualAvanco: true, prazoEstimado: true, prazoRevisto: true },
      }),
      prisma.obraArq.findMany({
        where: { tenantId: TENANT_ID, status: { in: ["em_execucao", "nao_iniciada"] } },
        select: { id: true, nome: true, percentualFisico: true, percentualFinanceiro: true, diasAtraso: true, orcamentoPrevisto: true, valorRealizado: true, etapaAtual: true, prazoEstimado: true },
      }),
      prisma.aprovacaoClienteArq.findMany({
        where: { tenantId: TENANT_ID, status: "aguardando_decisao" },
        select: { id: true, tipo: true, item: true, clienteNome: true, createdAt: true },
      }),
      prisma.visitaTecnicaArq.findMany({
        where: { tenantId: TENANT_ID, dataAgendada: { gte: new Date(), lte: new Date(Date.now() + 7 * 86400000) } },
        orderBy: { dataAgendada: "asc" },
        select: { id: true, dataAgendada: true, responsavelNome: true, tipo: true, obraId: true },
      }),
    ])
    return { success: true, data: { projetos, obras, aprovacoesPendentes, visitasSemana: diasDestaQueVisitas } }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function getClientesRabisco() {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { tenantId: TENANT_ID },
      orderBy: { updatedAt: "desc" },
    })
    return { success: true, data: clientes }
  } catch (e: any) { return { success: false, error: e.message } }
}
