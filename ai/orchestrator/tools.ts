/**
 * ai/orchestrator/tools.ts
 * Ferramentas (tool calls) disponíveis para cada agente.
 * Cada função executa operações reais no banco via Prisma.
 */

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"

export type ToolResult = {
  sucesso: boolean
  dados?: any
  mensagem?: string
  erro?: string
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE CRM
// ══════════════════════════════════════════════════════════════════════════════

export async function listarClientes(filtros: {
  status?: string
  busca?: string
  limit?: number
} = {}): Promise<ToolResult> {
  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.busca && {
          OR: [
            { nome: { contains: filtros.busca } },
            { empresa: { contains: filtros.busca } },
            { cnpjCpf: { contains: filtros.busca } },
          ],
        }),
      },
      orderBy: { updatedAt: "desc" },
      take: filtros.limit || 20,
    })
    return {
      sucesso: true,
      dados: { total: clientes.length, clientes },
      mensagem: `${clientes.length} cliente(s) encontrado(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function criarCliente(dados: {
  nome: string
  empresa?: string
  status?: string
  segmento?: string
  cidade?: string
  observacoes?: string
}): Promise<ToolResult> {
  try {
    const cliente = await prisma.cliente.create({ data: { ...dados, tenantId: getTenantId() } })
    return {
      sucesso: true,
      dados: cliente,
      mensagem: `Cliente "${dados.nome}" criado com sucesso!`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function editarCliente(id: string, dados: Record<string, any>): Promise<ToolResult> {
  try {
    const cliente = await prisma.cliente.update({ where: { id }, data: dados })
    return { sucesso: true, dados: cliente, mensagem: `Cliente atualizado com sucesso!` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function excluirCliente(id: string): Promise<ToolResult> {
  try {
    await prisma.cliente.delete({ where: { id } })
    return { sucesso: true, mensagem: `Cliente removido com sucesso.` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function marcarClienteComoRisco(clienteId: string, motivo: string): Promise<ToolResult> {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: clienteId },
      data: {
        score: { decrement: 20 },
        observacoes: `[RISCO] ${motivo}`
      }
    });
    return { sucesso: true, dados: cliente, mensagem: `Cliente "${cliente.nome}" sinalizado com risco de churn.` };
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function listarNegociacoes(filtros: {
  status?: string
  vendedor?: string
  limit?: number
} = {}): Promise<ToolResult> {
  try {
    const negociacoes = await prisma.negociacao.findMany({
      where: {
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.vendedor && { vendedor: { contains: filtros.vendedor } }),
      },
      include: { cliente: { select: { nome: true } } },
      orderBy: { updatedAt: "desc" },
      take: filtros.limit || 20,
    })
    return {
      sucesso: true,
      dados: { total: negociacoes.length, negociacoes },
      mensagem: `${negociacoes.length} negociação(ões) encontrada(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function criarNegociacao(dados: {
  clienteId: string
  vendedor: string
  valor: number
  status?: string
  probabilidade?: number
}): Promise<ToolResult> {
  try {
    const neg = await prisma.negociacao.create({ data: { ...dados, tenantId: getTenantId() } })
    return { sucesso: true, dados: neg, mensagem: `Negociação criada com sucesso!` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE MARKETING
// ══════════════════════════════════════════════════════════════════════════════

export async function listarCampanhas(filtros: { status?: string } = {}): Promise<ToolResult> {
  try {
    const campanhas = await prisma.campanha.findMany({
      where: filtros.status ? { status: filtros.status } : undefined,
      orderBy: { updatedAt: "desc" },
    })
    return {
      sucesso: true,
      dados: { total: campanhas.length, campanhas },
      mensagem: `${campanhas.length} campanha(s) encontrada(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function criarCampanha(dados: {
  nome: string
  descricao?: string
  canal?: string
  mensagemPadrao?: string
  criadaPorIA?: boolean
}): Promise<ToolResult> {
  try {
    const campanha = await prisma.campanha.create({
      data: { ...dados, criadaPorIA: dados.criadaPorIA ?? true, tenantId: getTenantId() },
    })
    return { sucesso: true, dados: campanha, mensagem: `Campanha "${dados.nome}" criada com sucesso!` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function atualizarCampanha(id: string, dados: Record<string, any>): Promise<ToolResult> {
  try {
    const campanha = await prisma.campanha.update({ where: { id }, data: dados })
    return { sucesso: true, dados: campanha, mensagem: `Campanha atualizada!` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function excluirCampanha(id: string): Promise<ToolResult> {
  try {
    await prisma.campanha.delete({ where: { id } })
    return { sucesso: true, mensagem: `Campanha removida com sucesso.` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE PROJETOS
// ══════════════════════════════════════════════════════════════════════════════

export async function listarTarefas(filtros: {
  status?: string
  responsavel?: string
  prioridade?: string
  limit?: number
} = {}): Promise<ToolResult> {
  try {
    const tarefas = await prisma.tarefa.findMany({
      where: {
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.responsavel && { responsavel: { contains: filtros.responsavel } }),
        ...(filtros.prioridade && { prioridade: filtros.prioridade }),
      },
      include: { cliente: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
      take: filtros.limit || 20,
    })
    return {
      sucesso: true,
      dados: { total: tarefas.length, tarefas },
      mensagem: `${tarefas.length} tarefa(s) encontrada(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function criarTarefa(dados: {
  titulo: string
  descricao?: string
  responsavel: string
  prioridade?: string
  prazo?: string
  clienteId?: string
}): Promise<ToolResult> {
  try {
    const tarefa = await prisma.tarefa.create({
      data: {
        ...dados,
        prazo: dados.prazo ? new Date(dados.prazo) : undefined,
        origem: "magis_ia",
        tenantId: getTenantId(),
      },
    })
    return { sucesso: true, dados: tarefa, mensagem: `Tarefa "${dados.titulo}" criada com sucesso!` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function editarTarefa(id: string, dados: Record<string, any>): Promise<ToolResult> {
  try {
    const tarefa = await prisma.tarefa.update({ where: { id }, data: dados })
    return { sucesso: true, dados: tarefa, mensagem: `Tarefa atualizada com sucesso!` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function excluirTarefa(id: string): Promise<ToolResult> {
  try {
    await prisma.tarefa.delete({ where: { id } })
    return { sucesso: true, mensagem: `Tarefa removida com sucesso.` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function agendarFollowUp(dados: {
  clienteId: string,
  data: string,
  responsavel: string,
  titulo?: string
}): Promise<ToolResult> {
  try {
    const cliente = await prisma.cliente.findUnique({ where: { id: dados.clienteId } });
    const nomeCliente = cliente ? cliente.nome : 'Cliente Desconhecido';

    const agendamento = await prisma.agendamento.create({
      data: {
        titulo: dados.titulo || `Follow-up com ${nomeCliente}`,
        data: new Date(dados.data),
        clienteId: dados.clienteId,
        responsavel: dados.responsavel,
        tipo: 'follow-up',
        tenantId: getTenantId(),
      }
    });

    await prisma.tarefa.create({
      data: {
        titulo: `Realizar follow-up com ${nomeCliente}`,
        clienteId: dados.clienteId,
        responsavel: dados.responsavel,
        prazo: new Date(dados.data),
        prioridade: 'alta',
        origem: 'ia_preditiva',
        tenantId: getTenantId(),
      }
    });

    return { sucesso: true, dados: agendamento, mensagem: `Follow-up agendado e tarefa criada com sucesso para ${nomeCliente}.` };
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE FINANCEIRO
// ══════════════════════════════════════════════════════════════════════════════

export async function resumoFinanceiro(): Promise<ToolResult> {
  try {
    const [receitas, despesas] = await Promise.all([
      prisma.lancamentoFinanceiro.aggregate({
        where: { tipo: "receita" },
        _sum: { valor: true },
        _count: true,
      }),
      prisma.lancamentoFinanceiro.aggregate({
        where: { tipo: "despesa" },
        _sum: { valor: true },
        _count: true,
      }),
    ])
    const totalReceitas = receitas._sum.valor || 0
    const totalDespesas = despesas._sum.valor || 0
    const saldo = totalReceitas - totalDespesas
    return {
      sucesso: true,
      dados: {
        totalReceitas,
        totalDespesas,
        saldo,
        countReceitas: receitas._count,
        countDespesas: despesas._count,
      },
      mensagem: `Saldo atual: R$ ${saldo.toFixed(2)}`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function listarLancamentos(filtros: {
  tipo?: string
  status?: string
  limit?: number
} = {}): Promise<ToolResult> {
  try {
    const lancamentos = await prisma.lancamentoFinanceiro.findMany({
      where: {
        ...(filtros.tipo && { tipo: filtros.tipo }),
        ...(filtros.status && { status: filtros.status }),
      },
      orderBy: { dataVenc: "asc" },
      take: filtros.limit || 20,
    })
    return {
      sucesso: true,
      dados: { total: lancamentos.length, lancamentos },
      mensagem: `${lancamentos.length} lançamento(s) encontrado(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function criarLancamento(dados: {
  descricao: string
  valor: number
  tipo: string
  status: string
  dataVenc: string
}): Promise<ToolResult> {
  try {
    const lancamento = await prisma.lancamentoFinanceiro.create({
      data: { ...dados, dataVenc: new Date(dados.dataVenc), tenantId: getTenantId() },
    })
    return { sucesso: true, dados: lancamento, mensagem: `Lançamento "${dados.descricao}" registrado!` }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE ESTOQUE
// ══════════════════════════════════════════════════════════════════════════════

export async function listarProdutos(filtros: {
  risco?: string
  categoria?: string
  status?: string
  busca?: string
  limit?: number
} = {}): Promise<ToolResult> {
  try {
    const produtos = await prisma.produto.findMany({
      where: {
        ...(filtros.risco && { risco: filtros.risco }),
        ...(filtros.categoria && { categoria: { contains: filtros.categoria } }),
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.busca && { nome: { contains: filtros.busca } }),
      },
      orderBy: { updatedAt: "desc" },
      take: filtros.limit || 20,
    })
    return {
      sucesso: true,
      dados: { total: produtos.length, produtos },
      mensagem: `${produtos.length} produto(s) encontrado(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function produtosEmRisco(): Promise<ToolResult> {
  try {
    const produtos = await prisma.produto.findMany({
      where: { OR: [{ risco: "ruptura" }, { risco: "baixo" }] },
      orderBy: { estoqueAtual: "asc" },
      take: 10,
    })
    return {
      sucesso: true,
      dados: { total: produtos.length, produtos },
      mensagem: `${produtos.length} produto(s) em risco de ruptura`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE OS
// ══════════════════════════════════════════════════════════════════════════════

export async function listarOS(filtros: {
  status?: string
  tecnicoId?: string
  limit?: number
} = {}): Promise<ToolResult> {
  try {
    const ordens = await prisma.ordemServico.findMany({
      where: {
        ...(filtros.status && { status: filtros.status }),
        ...(filtros.tecnicoId && { tecnicoId: filtros.tecnicoId }),
      },
      include: {
        cliente: { select: { nome: true } },
        tecnico: { select: { nome: true } },
      },
      orderBy: { dataAgendada: "asc" },
      take: filtros.limit || 20,
    })
    return {
      sucesso: true,
      dados: { total: ordens.length, ordens },
      mensagem: `${ordens.length} OS encontrada(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE BI — Dados Consolidados
// ══════════════════════════════════════════════════════════════════════════════

export async function kpisDashboard(): Promise<ToolResult> {
  try {
    const [clientes, vendas, tarefas, campanhas, produtos] = await Promise.all([
      prisma.cliente.count(),
      prisma.venda.aggregate({ _sum: { total: true }, _count: true }),
      prisma.tarefa.count({ where: { status: "a_fazer" } }),
      prisma.campanha.count({ where: { status: "pronta" } }),
      prisma.produto.count({ where: { risco: "ruptura" } }),
    ])
    return {
      sucesso: true,
      dados: {
        totalClientes: clientes,
        totalVendas: vendas._count,
        faturamento: vendas._sum.total || 0,
        tarefasPendentes: tarefas,
        campanhasAtivas: campanhas,
        produtosEmRisco: produtos,
      },
      mensagem: `KPIs consolidados do sistema`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

export async function rankingVendedores(): Promise<ToolResult> {
  try {
    const vendas = await prisma.venda.groupBy({
      by: ["vendedor"],
      _sum: { total: true },
      _count: true,
      where: { status: "fechado", vendedor: { not: null } },
      orderBy: { _sum: { total: "desc" } },
    })
    return {
      sucesso: true,
      dados: { vendedores: vendas },
      mensagem: `Ranking de ${vendas.length} vendedor(es)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// AGENTE WHATSAPP
// ══════════════════════════════════════════════════════════════════════════════

export async function listarConversas(filtros: { status?: string } = {}): Promise<ToolResult> {
  try {
    const conversas = await prisma.conversaWA.findMany({
      where: filtros.status ? { status: filtros.status } : undefined,
      orderBy: { updatedAt: "desc" },
      take: 20,
    })
    return {
      sucesso: true,
      dados: { total: conversas.length, conversas },
      mensagem: `${conversas.length} conversa(s) encontrada(s)`,
    }
  } catch (e: any) {
    return { sucesso: false, erro: e.message }
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// DISPATCHER — Executa tool pelo nome do agente e ação
// ══════════════════════════════════════════════════════════════════════════════

export type ToolCallRequest = {
  agenteId: string
  tool: string
  params: Record<string, any>
}

export async function executarTool(request: ToolCallRequest): Promise<ToolResult> {
  const { agenteId, tool, params } = request

  const toolMap: Record<string, Record<string, (p: any) => Promise<ToolResult>>> = {
    crm: {
      listarClientes:    (p) => listarClientes(p),
      criarCliente:      (p) => criarCliente(p),
      editarCliente:     (p) => editarCliente(p.id, p.dados),
      excluirCliente:    (p) => excluirCliente(p.id),
      listarNegociacoes: (p) => listarNegociacoes(p),
      criarNegociacao:   (p) => criarNegociacao(p),
      marcarClienteComoRisco: (p) => marcarClienteComoRisco(p.clienteId, p.motivo),
    },
    marketing: {
      listarCampanhas:   (p) => listarCampanhas(p),
      criarCampanha:     (p) => criarCampanha(p),
      atualizarCampanha: (p) => atualizarCampanha(p.id, p.dados),
      excluirCampanha:   (p) => excluirCampanha(p.id),
      ativarCampanha:    (p) => atualizarCampanha(p.id, { status: "pronta" }),
      pausarCampanha:    (p) => atualizarCampanha(p.id, { status: "rascunho" }),
    },
    projetos: {
      listarTarefas:        (p) => listarTarefas(p),
      criarTarefa:          (p) => criarTarefa(p),
      editarTarefa:         (p) => editarTarefa(p.id, p.dados),
      excluirTarefa:        (p) => excluirTarefa(p.id),
      alterarStatusTarefa:  (p) => editarTarefa(p.id, { status: p.status }),
      alterarResponsavel:   (p) => editarTarefa(p.id, { responsavel: p.responsavel }),
      agendarFollowUp:      (p) => agendarFollowUp(p),
    },
    financeiro: {
      resumoFinanceiro:  () => resumoFinanceiro(),
      listarLancamentos: (p) => listarLancamentos(p),
      criarLancamento:   (p) => criarLancamento(p),
    },
    estoque: {
      listarProdutos:  (p) => listarProdutos(p),
      produtosEmRisco: () => produtosEmRisco(),
    },
    os: {
      listarOS: (p) => listarOS(p),
    },
    bi: {
      kpisDashboard:     () => kpisDashboard(),
      rankingVendedores: () => rankingVendedores(),
      resumoFinanceiro:  () => resumoFinanceiro(),
    },
    whatsapp: {
      listarConversas: (p) => listarConversas(p),
    },
  }

  const agentTools = toolMap[agenteId]
  if (!agentTools) return { sucesso: false, erro: `Agente "${agenteId}" não encontrado` }

  const fn = agentTools[tool]
  if (!fn) return { sucesso: false, erro: `Tool "${tool}" não encontrada no agente "${agenteId}"` }

  return fn(params)
}
