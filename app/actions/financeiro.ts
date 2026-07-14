"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarLancamentos(filtros?: { tipo?: string; status?: string; busca?: string }) {
  const tenantId = getTenantId()
  try {
    const where: any = { tenantId }
    if (filtros?.tipo && filtros.tipo !== "todos") where.tipo = filtros.tipo
    if (filtros?.status && filtros.status !== "todos") where.status = filtros.status
    if (filtros?.busca) where.descricao = { contains: filtros.busca }
    return await prisma.lancamentoFinanceiro.findMany({ where, orderBy: { dataVenc: "desc" } })
  } catch (error) { console.error(error); return [] }
}

export async function buscarResumoFinanceiro() {
  const tenantId = getTenantId()
  try {
    const agora = new Date()
    const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
    const lancamentos = await prisma.lancamentoFinanceiro.findMany({ where: { tenantId, dataVenc: { gte: inicioMes } } })
    const receitas = lancamentos.filter(l => l.tipo === "receita" && l.status === "pago").reduce((a, c) => a + c.valor, 0)
    const faturamento = lancamentos.filter(l => l.tipo === "receita").reduce((a, c) => a + c.valor, 0)
    const despesas = lancamentos.filter(l => l.tipo === "despesa" && l.status === "pago").reduce((a, c) => a + c.valor, 0)
    const vencidos = lancamentos.filter(l => l.status === "vencido").reduce((a, c) => a + c.valor, 0)
    return { faturamento, recebimentos: receitas, despesas, resultado: receitas - despesas, vencidos }
  } catch (error) {
    console.error(error)
    return { faturamento: 0, recebimentos: 0, despesas: 0, resultado: 0, vencidos: 0 }
  }
}

export async function buscarDadosFinanceirosChart() {
  const tenantId = getTenantId()
  const agora = new Date()
  const seisAtras = new Date(agora.getFullYear(), agora.getMonth() - 5, 1)
  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    where: { tenantId, dataVenc: { gte: seisAtras }, status: { not: "pendente" } }
  })
  const chartMap = new Map<string, { mes: string; receita: number; despesa: number; resultado: number }>()
  lancamentos.forEach(l => {
    const mes = l.dataVenc.toLocaleString("pt-BR", { month: "short", year: "2-digit" })
    if (!chartMap.has(mes)) chartMap.set(mes, { mes, receita: 0, despesa: 0, resultado: 0 })
    const curr = chartMap.get(mes)!
    if (l.tipo === "receita") curr.receita += l.valor
    else curr.despesa += l.valor
    curr.resultado = curr.receita - curr.despesa
  })
  return Array.from(chartMap.values())
}

// ── DRE (Demonstrativo de Resultado do Exercício) ──────────────────────────────
export async function buscarDRE(mes?: number, ano?: number) {
  const tenantId = getTenantId()
  const agora = new Date()
  const m = mes ?? agora.getMonth()
  const a = ano ?? agora.getFullYear()
  const inicio = new Date(a, m, 1)
  const fim = new Date(a, m + 1, 0, 23, 59, 59)
  try {
    const lancamentos = await prisma.lancamentoFinanceiro.findMany({
      where: { tenantId, dataVenc: { gte: inicio, lte: fim } }
    })
    const receitas = lancamentos.filter(l => l.tipo === "receita")
    const despesas = lancamentos.filter(l => l.tipo === "despesa")
    const receitaBruta = receitas.reduce((a, c) => a + c.valor, 0)
    const totalDespesas = despesas.reduce((a, c) => a + c.valor, 0)
    const receitaRecebida = receitas.filter(l => l.status === "pago").reduce((a, c) => a + c.valor, 0)
    const lucroLiquido = receitaRecebida - totalDespesas
    const margemLiquida = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0
    // Receitas OS vs outras
    const receitasOS = await prisma.ordemServico.aggregate({
      where: { tenantId, statusFaturamento: { in: ["faturada", "paga"] }, updatedAt: { gte: inicio, lte: fim } },
      _sum: { valorFinal: true }
    })
    return {
      receitaBruta, receitaRecebida, totalDespesas, lucroLiquido, margemLiquida,
      receitaOS: receitasOS._sum.valorFinal ?? 0,
      receitaOutras: receitaBruta - (receitasOS._sum.valorFinal ?? 0),
      qtdReceitas: receitas.length, qtdDespesas: despesas.length,
      pendentes: lancamentos.filter(l => l.status === "pendente").reduce((a, c) => a + c.valor, 0),
      vencidos: lancamentos.filter(l => l.status === "vencido").reduce((a, c) => a + c.valor, 0),
      mes: m, ano: a
    }
  } catch (e) { console.error(e); return null }
}

// ── Metas ──────────────────────────────────────────────────────────────────────
export async function buscarMetas() {
  // Por enquanto usamos uma tabela fictícia baseada em lançamentos do mês
  // Futuramente pode ser uma tabela "Meta" no schema
  const tenantId = getTenantId()
  const agora = new Date()
  const inicio = new Date(agora.getFullYear(), agora.getMonth(), 1)
  try {
    const [receitas, despesas, osConcluidas] = await Promise.all([
      prisma.lancamentoFinanceiro.aggregate({ where: { tenantId, tipo: "receita", status: "pago", dataVenc: { gte: inicio } }, _sum: { valor: true } }),
      prisma.lancamentoFinanceiro.aggregate({ where: { tenantId, tipo: "despesa", status: "pago", dataVenc: { gte: inicio } }, _sum: { valor: true } }),
      prisma.ordemServico.count({ where: { tenantId, status: "concluida", updatedAt: { gte: inicio } } }),
    ])
    return {
      receitaMeta: 50000, receitaRealizada: receitas._sum.valor ?? 0,
      despesaMeta: 20000, despesaRealizada: despesas._sum.valor ?? 0,
      osMeta: 50, osRealizada: osConcluidas,
    }
  } catch (e) { console.error(e); return null }
}

// ── OS Não Faturadas ───────────────────────────────────────────────────────────
export async function buscarOSNaoFaturadas() {
  const tenantId = getTenantId()
  try {
    return await prisma.ordemServico.findMany({
      where: { tenantId, status: "concluida", statusFaturamento: "nao_faturada" },
      include: { cliente: { select: { nome: true } } },
      orderBy: { updatedAt: "desc" },
      take: 50
    })
  } catch (e) { console.error(e); return [] }
}

export async function faturarOS(osId: string) {
  const tenantId = getTenantId()
  try {
    await prisma.ordemServico.update({
      where: { id: osId, tenantId },
      data: { statusFaturamento: "faturada" }
    })
    revalidatePath("/financeiro")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

// ── Lançamentos CRUD ──────────────────────────────────────────────────────────
export async function criarLancamento(data: {
  descricao: string; valor: number; tipo: string; status: string; dataVenc: string
}) {
  const tenantId = getTenantId()
  try {
    const lancamento = await prisma.lancamentoFinanceiro.create({
      data: { tenantId, ...data, dataVenc: new Date(data.dataVenc) }
    })
    revalidatePath("/financeiro")
    return { success: true, lancamento }
  } catch (error) { console.error(error); return { success: false, error: "Erro ao criar lançamento." } }
}

export async function darBaixaLancamento(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.lancamentoFinanceiro.update({ where: { id, tenantId }, data: { status: "pago" } })
    revalidatePath("/financeiro")
    return { success: true }
  } catch (error) { console.error(error); return { success: false } }
}

export async function atualizarLancamento(id: string, data: Partial<{
  descricao: string; valor: number; status: string; dataVenc: string
}>) {
  const tenantId = getTenantId()
  try {
    await prisma.lancamentoFinanceiro.update({
      where: { id, tenantId },
      data: { ...data, dataVenc: data.dataVenc ? new Date(data.dataVenc) : undefined }
    })
    revalidatePath("/financeiro")
    return { success: true }
  } catch (error) { console.error(error); return { success: false } }
}

export async function atualizarDataLancamento(id: string, novaDataStr: string) {
  const tenantId = getTenantId()
  try {
    const [year, month, day] = novaDataStr.split('-').map(Number)
    const dataVenc = new Date(year, month - 1, day)
    await prisma.lancamentoFinanceiro.update({ where: { id, tenantId }, data: { dataVenc } })
    revalidatePath("/financeiro")
    return { success: true }
  } catch (error) { console.error(error); return { success: false } }
}

export async function deletarLancamento(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.lancamentoFinanceiro.delete({ where: { id, tenantId } })
    revalidatePath("/financeiro")
    return { success: true }
  } catch (error) { console.error(error); return { success: false } }
}

