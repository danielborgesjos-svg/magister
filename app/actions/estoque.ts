"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarEstoque() {
  const tenantId = getTenantId()
  try {
    return await prisma.produto.findMany({
      where: { tenantId },
      orderBy: { nome: "asc" }
    })
  } catch (error) { console.error(error); return [] }
}

export async function criarProduto(data: {
  nome: string; categoria: string; preco: number; custo: number;
  estoqueAtual?: number; estoqueMinimo?: number; margem?: number
}) {
  const tenantId = getTenantId()
  try {
    const margem = data.margem ?? ((data.preco - data.custo) / data.preco * 100)
    const produto = await prisma.produto.create({
      data: { tenantId, ...data, margem }
    })
    revalidatePath("/estoque")
    return { success: true, produto }
  } catch (error) { console.error(error); return { success: false, error: "Erro ao criar produto." } }
}

export async function atualizarProduto(id: string, data: Partial<{
  nome: string; categoria: string; preco: number; custo: number;
  estoqueAtual: number; estoqueMinimo: number; status: string; margem: number
}>) {
  const tenantId = getTenantId()
  try {
    const produto = await prisma.produto.update({ where: { id, tenantId }, data })
    revalidatePath("/estoque")
    return { success: true, produto }
  } catch (error) { console.error(error); return { success: false, error: "Erro ao atualizar produto." } }
}

export async function reporEstoque(id: string, quantidade: number) {
  const tenantId = getTenantId()
  try {
    const produto = await prisma.produto.findUnique({ where: { id, tenantId } })
    if (!produto) return { success: false, error: "Produto não encontrado." }

    const novoEstoque = produto.estoqueAtual + quantidade
    let risco = "ok"
    if (novoEstoque <= 0) risco = "ruptura"
    else if (novoEstoque <= produto.estoqueMinimo) risco = "baixo"
    else if (novoEstoque > produto.estoqueMinimo * 3) risco = "excesso"

    await prisma.produto.update({ where: { id, tenantId }, data: { estoqueAtual: novoEstoque, risco } })
    revalidatePath("/estoque")
    return { success: true }
  } catch (error) { console.error(error); return { success: false, error: "Erro ao repor estoque." } }
}

export async function buscarResumoEstoque() {
  const tenantId = getTenantId()
  try {
    const produtos = await prisma.produto.findMany({ where: { tenantId } })
    const ruptura = produtos.filter(p => p.risco === "ruptura").length
    const baixo = produtos.filter(p => p.risco === "baixo").length
    const ok = produtos.filter(p => p.risco === "ok").length
    const excesso = produtos.filter(p => p.risco === "excesso").length
    const parados = produtos.filter(p => p.status === "parado").length
    const capitalParado = produtos.filter(p => p.status === "parado").reduce((a, p) => a + (p.estoqueAtual * p.custo), 0)
    const valorTotal = produtos.reduce((a, p) => a + (p.estoqueAtual * p.custo), 0)
    return { total: produtos.length, ruptura, baixo, ok, excesso, parados, capitalParado, valorTotal }
  } catch (error) { console.error(error); return { total: 0, ruptura: 0, baixo: 0, ok: 0, excesso: 0, parados: 0, capitalParado: 0, valorTotal: 0 } }
}
