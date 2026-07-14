"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

// ─── KPIs do módulo Cobranças ─────────────────────────────────────────────────
export async function buscarKPIsCobrancas() {
  const tenantId = getTenantId()
  const agora = new Date()

  try {
    const todos = await prisma.lancamentoFinanceiro.findMany({
      where: { tenantId, tipo: "receita" }
    })

    const totalAReceber = todos
      .filter(l => l.status === "pendente")
      .reduce((acc, l) => acc + l.valor, 0)

    const vencidas = todos
      .filter(l => l.status === "pendente" && new Date(l.dataVenc) < agora)
      .reduce((acc, l) => acc + l.valor, 0)

    const vencidasQtd = todos.filter(
      l => l.status === "pendente" && new Date(l.dataVenc) < agora
    ).length

    const aVencer30 = todos
      .filter(l => {
        const d = new Date(l.dataVenc)
        return l.status === "pendente" && d >= agora && d <= new Date(Date.now() + 30 * 86400000)
      })
      .reduce((acc, l) => acc + l.valor, 0)

    const recebidoMes = todos
      .filter(l => {
        const d = new Date(l.dataVenc)
        return l.status === "pago" &&
          d.getMonth() === agora.getMonth() &&
          d.getFullYear() === agora.getFullYear()
      })
      .reduce((acc, l) => acc + l.valor, 0)

    const totalPendente = todos.filter(l => l.status === "pendente").length
    const totalPago     = todos.filter(l => l.status === "pago").length

    // OS concluídas não faturadas
    const osNaoFaturadas = await prisma.ordemServico.count({
      where: { tenantId, status: "concluida", statusFaturamento: "nao_faturada" }
    })

    const valorOsNaoFaturadas = await prisma.ordemServico.aggregate({
      where: { tenantId, status: "concluida", statusFaturamento: "nao_faturada" },
      _sum: { valorFinal: true, valorPrevisto: true }
    })

    return {
      totalAReceber,
      vencidas,
      vencidasQtd,
      aVencer30,
      recebidoMes,
      totalPendente,
      totalPago,
      osNaoFaturadas,
      valorOsNaoFaturadas: valorOsNaoFaturadas._sum.valorFinal ?? valorOsNaoFaturadas._sum.valorPrevisto ?? 0
    }
  } catch (error) {
    console.error("[buscarKPIsCobrancas]", error)
    return null
  }
}

// ─── Listagem de cobranças com filtros e paginação ────────────────────────────
export async function buscarCobrancas(filtros?: {
  status?: string
  tipo?: string
  busca?: string
  vencidas?: boolean
  pagina?: number
  porPagina?: number
}) {
  const tenantId = getTenantId()
  const pagina = filtros?.pagina ?? 1
  const porPagina = filtros?.porPagina ?? 30
  const skip = (pagina - 1) * porPagina
  const agora = new Date()

  try {
    const where: any = { tenantId }
    if (filtros?.tipo && filtros.tipo !== "todas") where.tipo = filtros.tipo
    if (filtros?.status && filtros.status !== "todos") where.status = filtros.status
    if (filtros?.vencidas) {
      where.status = "pendente"
      where.dataVenc = { lt: agora }
    }
    if (filtros?.busca) {
      where.descricao = { contains: filtros.busca }
    }

    const [total, itens] = await Promise.all([
      prisma.lancamentoFinanceiro.count({ where }),
      prisma.lancamentoFinanceiro.findMany({
        where,
        skip,
        take: porPagina,
        orderBy: [{ status: "asc" }, { dataVenc: "asc" }]
      })
    ])

    return { total, paginas: Math.ceil(total / porPagina), pagina, itens }
  } catch (error) {
    console.error("[buscarCobrancas]", error)
    return { total: 0, paginas: 0, pagina: 1, itens: [] }
  }
}

// ─── OS concluídas prontas para faturar ──────────────────────────────────────
export async function buscarOSParaFaturar() {
  const tenantId = getTenantId()
  try {
    return await prisma.ordemServico.findMany({
      where: { tenantId, status: "concluida", statusFaturamento: "nao_faturada" },
      include: {
        cliente: { select: { nome: true } },
        tecnico: { select: { nome: true } },
        cobranca: { select: { id: true, status: true } }
      },
      orderBy: { updatedAt: "desc" }
    })
  } catch (error) {
    console.error("[buscarOSParaFaturar]", error)
    return []
  }
}

// ─── Registrar recebimento (baixa) ───────────────────────────────────────────
export async function registrarRecebimento(id: string, dataPagamento?: string) {
  const tenantId = getTenantId()
  try {
    await prisma.lancamentoFinanceiro.update({
      where: { id, tenantId },
      data: { status: "pago" }
    })

    // Atualiza OsCobranca se houver
    const cobranca = await prisma.osCobranca.findFirst({
      where: { lancamentoId: id, tenantId }
    })
    if (cobranca) {
      await prisma.osCobranca.update({
        where: { id: cobranca.id },
        data: {
          status: "paga",
          dataPagamento: dataPagamento ? new Date(dataPagamento) : new Date()
        }
      })
      await prisma.ordemServico.update({
        where: { id: cobranca.ordemServicoId },
        data: { statusFaturamento: "paga" }
      })
    }

    revalidatePath("/financeiro")
    revalidatePath("/financeiro/contas")
    revalidatePath("/os")
    return { success: true }
  } catch (error: any) {
    console.error("[registrarRecebimento]", error)
    return { success: false, error: error.message }
  }
}

// ─── Criar cobrança manual ────────────────────────────────────────────────────
export async function criarCobrancaManual(data: {
  descricao: string
  valor: number
  dataVenc: string
  tipo?: string
  observacoes?: string
}) {
  const tenantId = getTenantId()
  try {
    const lancamento = await prisma.lancamentoFinanceiro.create({
      data: {
        tenantId,
        descricao: data.descricao,
        valor: data.valor,
        tipo: data.tipo ?? "receita",
        status: "pendente",
        dataVenc: new Date(data.dataVenc),
      }
    })
    revalidatePath("/financeiro/contas")
    return { success: true, lancamento }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ─── Cancelar / estornar cobrança ────────────────────────────────────────────
export async function cancelarCobranca(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.lancamentoFinanceiro.update({
      where: { id, tenantId },
      data: { status: "vencido" }
    })
    revalidatePath("/financeiro/contas")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ─── Aging Report (inadimplência por faixa) ───────────────────────────────────
export async function buscarAgingReport() {
  const tenantId = getTenantId()
  const agora = new Date()
  try {
    const vencidas = await prisma.lancamentoFinanceiro.findMany({
      where: { tenantId, tipo: "receita", status: "pendente", dataVenc: { lt: agora } },
      orderBy: { dataVenc: "asc" }
    })

    const faixas = {
      ate15:   { label: "Até 15 dias",    valor: 0, qtd: 0 },
      de16a30: { label: "16 a 30 dias",   valor: 0, qtd: 0 },
      de31a60: { label: "31 a 60 dias",   valor: 0, qtd: 0 },
      acima60: { label: "Acima de 60 dias", valor: 0, qtd: 0 },
    }

    for (const l of vencidas) {
      const dias = Math.floor((agora.getTime() - new Date(l.dataVenc).getTime()) / 86400000)
      if      (dias <= 15) { faixas.ate15.valor   += l.valor; faixas.ate15.qtd++ }
      else if (dias <= 30) { faixas.de16a30.valor += l.valor; faixas.de16a30.qtd++ }
      else if (dias <= 60) { faixas.de31a60.valor += l.valor; faixas.de31a60.qtd++ }
      else                 { faixas.acima60.valor += l.valor; faixas.acima60.qtd++ }
    }

    return Object.values(faixas)
  } catch (error) {
    console.error("[buscarAgingReport]", error)
    return []
  }
}
