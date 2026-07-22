"use server"
import prisma from "@/lib/prisma"

const TENANT_ID = "tenant_rabisco_001"

// ─── PROJETOS ──────────────────────────────────────────────────────────────────

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

// ─── OBRAS ─────────────────────────────────────────────────────────────────────

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

export async function getObraArqById(id: string) {
  try {
    const obra = await prisma.obraArq.findFirst({
      where: { id, tenantId: TENANT_ID },
      include: {
        projeto: true,
        atividades: { orderBy: { ordem: "asc" } },
        diarios: { orderBy: { data: "desc" } },
        visitas: { orderBy: { dataAgendada: "desc" } },
        naoConfs: { orderBy: { createdAt: "desc" } },
        relatorios: { orderBy: { createdAt: "desc" } },
      },
    })
    return { success: true, data: obra }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarAtividadeObra(data: {
  obraId: string; nome: string; categoria?: string; responsavelId?: string
  fornecedorNome?: string; dataInicioPrev?: Date; dataFimPrev?: Date
}) {
  try {
    const atv = await prisma.atividadeObra.create({
      data: { tenantId: TENANT_ID, ...data, status: "nao_iniciado" },
    })
    return { success: true, data: atv }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarDiarioObra(data: {
  obraId: string; atividadesExecutadas: string; materiaisEntregues?: string
  problemasIdentificados?: string; decisoesTomadas?: string; condicoes?: string
  responsavelNome?: string
}) {
  try {
    const diario = await prisma.diarioObra.create({
      data: { tenantId: TENANT_ID, ...data },
    })
    return { success: true, data: diario }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ─── CLIENTES & CRM & WHATSAPP LEADS ──────────────────────────────────────────

export async function getClientesRabisco() {
  try {
    const clientes = await prisma.cliente.findMany({
      where: { tenantId: TENANT_ID },
      orderBy: { updatedAt: "desc" },
    })
    return { success: true, data: clientes }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarClienteRabisco(data: {
  nome: string; empresa?: string; cnpjCpf?: string; cidade?: string
  segmento?: string; observacoes?: string; status?: string
}) {
  try {
    const cliente = await prisma.cliente.create({
      data: { tenantId: TENANT_ID, status: "lead", ...data },
    })
    return { success: true, data: cliente }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function getCRMLeadsIntegrados() {
  try {
    const [clientes, conversasWA] = await Promise.all([
      prisma.cliente.findMany({
        where: { tenantId: TENANT_ID },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.conversaWA.findMany({
        where: { tenantId: TENANT_ID },
        include: { mensagens: { orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { updatedAt: "desc" },
      }),
    ])
    return { success: true, data: { clientes, conversasWA } }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function atualizarStatusCliente(id: string, status: string) {
  try {
    const c = await prisma.cliente.update({
      where: { id },
      data: { status },
    })
    return { success: true, data: c }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ─── KANBAN TAREFAS ───────────────────────────────────────────────────────────

export async function getKanbanTarefas() {
  try {
    const tarefas = await prisma.tarefa.findMany({
      where: { tenantId: TENANT_ID },
      include: { cliente: { select: { nome: true } } },
      orderBy: { updatedAt: "desc" },
    })
    return { success: true, data: tarefas }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarTarefaRabisco(data: {
  titulo: string; descricao?: string; responsavel: string; prioridade?: string; status?: string; prazo?: Date; clienteId?: string
}) {
  try {
    const t = await prisma.tarefa.create({
      data: { tenantId: TENANT_ID, status: "a_fazer", prioridade: "media", ...data },
    })
    return { success: true, data: t }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function atualizarStatusTarefa(id: string, status: string) {
  try {
    const t = await prisma.tarefa.update({
      where: { id },
      data: { status },
    })
    return { success: true, data: t }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ─── COMPRAS & COTAÇÕES ────────────────────────────────────────────────────────

export async function getComprasECotacoes() {
  try {
    const [itens, cotacoes, projetos] = await Promise.all([
      prisma.itemListaCompraArq.findMany({
        where: { tenantId: TENANT_ID },
        orderBy: { createdAt: "desc" },
      }),
      prisma.cotacaoArq.findMany({
        where: { tenantId: TENANT_ID },
        orderBy: { createdAt: "desc" },
      }),
      prisma.projetoArq.findMany({
        where: { tenantId: TENANT_ID },
        select: { id: true, nome: true },
      }),
    ])
    return { success: true, data: { itens, cotacoes, projetos } }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarItemCompra(data: {
  projetoId: string; produto: string; ambiente?: string; marca?: string
  quantidade?: number; preco?: number; fornecedorNome?: string; status?: string
}) {
  try {
    const item = await prisma.itemListaCompraArq.create({
      data: { tenantId: TENANT_ID, ...data },
    })
    return { success: true, data: item }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarCotacao(data: {
  projetoId: string; descricao: string; fornecedorNome?: string; fornecedorContato?: string; valor?: number; prazo?: string
}) {
  try {
    const c = await prisma.cotacaoArq.create({
      data: { tenantId: TENANT_ID, ...data },
    })
    return { success: true, data: c }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ─── FORNECEDORES ─────────────────────────────────────────────────────────────

export async function getFornecedoresRabisco() {
  try {
    const fornecedores = await prisma.fornecedor.findMany({
      where: { tenantId: TENANT_ID },
      orderBy: { updatedAt: "desc" },
    })
    return { success: true, data: fornecedores }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarFornecedorRabisco(data: {
  nome: string; cnpjCpf?: string; categoria?: string; telefone?: string; email?: string; cidade?: string; segmento?: string; observacoes?: string
}) {
  try {
    const f = await prisma.fornecedor.create({
      data: { tenantId: TENANT_ID, ...data },
    })
    return { success: true, data: f }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ─── FINANCEIRO ───────────────────────────────────────────────────────────────

export async function getFinanceiroRabisco() {
  try {
    const lancamentos = await prisma.lancamentoFinanceiro.findMany({
      where: { tenantId: TENANT_ID },
      orderBy: { dataVenc: "desc" },
    })
    return { success: true, data: lancamentos }
  } catch (e: any) { return { success: false, error: e.message } }
}

export async function criarLancamentoFinanceiro(data: {
  descricao: string; valor: number; tipo: string; status: string; dataVenc: Date
}) {
  try {
    const l = await prisma.lancamentoFinanceiro.create({
      data: { tenantId: TENANT_ID, ...data },
    })
    return { success: true, data: l }
  } catch (e: any) { return { success: false, error: e.message } }
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────

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
