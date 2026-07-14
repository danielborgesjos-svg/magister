"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarProdutos(query: string = "") {
  const tenantId = getTenantId()
  try {
    return await prisma.produto.findMany({
      where: { tenantId, status: "ativo", ...(query ? { nome: { contains: query } } : {}) },
      take: 20
    })
  } catch (error) { console.error(error); return [] }
}

export async function finalizarVenda(
  itens: { id: string; quantidade: number; preco: number }[],
  metodoPagamento: string,
  total: number,
  clienteId?: string
) {
  const tenantId = getTenantId()
  try {
    const venda = await prisma.$transaction(async tx => {
      const novaVenda = await tx.venda.create({
        data: {
          tenantId,
          clienteId: clienteId || null,
          total,
          status: "fechado",
          metodoPagamento,
          itens: { create: itens.map(item => ({ produtoId: item.id, quantidade: item.quantidade, preco: item.preco })) }
        }
      })

      for (const item of itens) {
        const produto = await tx.produto.findUnique({ where: { id: item.id, tenantId } })
        if (produto) {
          const novoEstoque = Math.max(0, produto.estoqueAtual - item.quantidade)
          let risco = "ok"
          if (novoEstoque <= 0) risco = "ruptura"
          else if (novoEstoque <= produto.estoqueMinimo) risco = "baixo"
          else if (novoEstoque > produto.estoqueMinimo * 3) risco = "excesso"
          await tx.produto.update({ where: { id: item.id }, data: { estoqueAtual: novoEstoque, risco } })
        }
      }

      await tx.lancamentoFinanceiro.create({
        data: {
          tenantId,
          descricao: `Venda PDV #${novaVenda.id.slice(-5).toUpperCase()}`,
          valor: total,
          tipo: "receita",
          status: "pago",
          dataVenc: new Date()
        }
      })

      return novaVenda
    })

    revalidatePath("/estoque")
    revalidatePath("/pdv")
    revalidatePath("/financeiro")
    return { success: true, vendaId: venda.id }
  } catch (error) { console.error(error); return { success: false, error: "Falha ao processar venda." } }
}

export async function buscarVendasRecentes() {
  const tenantId = getTenantId()
  try {
    return await prisma.venda.findMany({
      where: { tenantId },
      include: {
        cliente: { select: { nome: true } },
        itens: { include: { produto: { select: { nome: true } } } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  } catch (error) { console.error(error); return [] }
}
