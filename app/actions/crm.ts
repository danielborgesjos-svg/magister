"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

// ─── CLIENTES ─────────────────────────────────────────────────────────────────

export async function buscarClientes(query: string = "") {
  const tenantId = getTenantId()
  try {
    return await prisma.cliente.findMany({
      where: {
        tenantId,
        ...(query ? {
          OR: [
            { nome: { contains: query } },
            { razaoSocial: { contains: query } },
            { nomeFantasia: { contains: query } },
            { cnpjCpf: { contains: query } },
            { empresa: { contains: query } },
            { cidade: { contains: query } },
          ]
        } : {}),
      },
      include: { contatos: true, unidades: { include: { enderecos: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) { console.error(e); return [] }
}

export async function criarCliente(data: {
  nome: string; empresa?: string; segmento?: string; cidade?: string; status?: string;
  contatos?: any[]; unidades?: any[]
}) {
  const tenantId = getTenantId()
  try {
    const { contatos, unidades, ...clienteData } = data
    const cliente = await prisma.cliente.create({ 
      data: { 
        tenantId, 
        ...clienteData,
        contatos: contatos ? { create: contatos } : undefined,
        unidades: unidades ? { 
          create: unidades.map((u: any) => ({
            nome: u.nome,
            enderecos: u.enderecos ? {
              create: u.enderecos.map((e: any) => ({
                tipo: e.tipo, logradouro: e.logradouro, numero: e.numero,
                bairro: e.bairro, cidade: e.cidade, uf: e.uf,
                tenantId
              }))
            } : undefined
          }))
        } : undefined
      } 
    })
    revalidatePath("/clientes")
    return { success: true, cliente }
  } catch (e) { console.error(e); return { success: false, error: "Erro ao criar cliente." } }
}

export async function atualizarCliente(id: string, data: Partial<{
  nome: string; empresa: string; segmento: string; cidade: string; score: number; status: string;
  razaoSocial: string; cnpjCpf: string; observacoes: string
}>) {
  const tenantId = getTenantId()
  try {
    const cliente = await prisma.cliente.update({ where: { id, tenantId }, data })
    revalidatePath("/clientes")
    return { success: true, cliente }
  } catch (e) { console.error(e); return { success: false, error: "Erro ao atualizar cliente." } }
}

export async function deletarCliente(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.cliente.delete({ where: { id, tenantId } })
    revalidatePath("/clientes")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

// ─── NEGOCIAÇÕES (PIPELINE) ───────────────────────────────────────────────────

export async function buscarNegociacoes() {
  const tenantId = getTenantId()
  try {
    return await prisma.negociacao.findMany({
      where: { tenantId },
      include: { cliente: { select: { nome: true, empresa: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) { console.error(e); return [] }
}

export async function criarNegociacao(data: {
  clienteId: string; vendedor: string; valor: number; status?: string;
  probabilidade?: number; previsaoFechamento?: string; tags?: string
}) {
  const tenantId = getTenantId()
  try {
    const neg = await prisma.negociacao.create({
      data: {
        tenantId,
        ...data,
        previsaoFechamento: data.previsaoFechamento ? new Date(data.previsaoFechamento) : null,
      }
    })
    revalidatePath("/vendas")
    return { success: true, neg }
  } catch (e) { console.error(e); return { success: false, error: "Erro ao criar negociação." } }
}

export async function moverNegociacao(id: string, novoStatus: string) {
  const tenantId = getTenantId()
  try {
    await prisma.negociacao.update({ where: { id, tenantId }, data: { status: novoStatus } })
    revalidatePath("/vendas")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

export async function deletarNegociacao(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.negociacao.delete({ where: { id, tenantId } })
    revalidatePath("/vendas")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

// ─── TAREFAS ──────────────────────────────────────────────────────────────────

export async function buscarTarefas() {
  const tenantId = getTenantId()
  try {
    return await prisma.tarefa.findMany({
      where: { tenantId },
      include: { cliente: { select: { nome: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) { console.error(e); return [] }
}

export async function criarTarefa(data: {
  titulo: string; descricao?: string; responsavel: string;
  prioridade?: string; prazo?: string; clienteId?: string; origem?: string
}) {
  const tenantId = getTenantId()
  try {
    const tarefa = await prisma.tarefa.create({
      data: {
        tenantId,
        ...data,
        prazo: data.prazo ? new Date(data.prazo) : null,
      }
    })
    revalidatePath("/tarefas")
    return { success: true, tarefa }
  } catch (e) { console.error(e); return { success: false } }
}

export async function moverTarefa(id: string, novoStatus: string) {
  const tenantId = getTenantId()
  try {
    await prisma.tarefa.update({ where: { id, tenantId }, data: { status: novoStatus } })
    revalidatePath("/tarefas")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

export async function deletarTarefa(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.tarefa.delete({ where: { id, tenantId } })
    revalidatePath("/tarefas")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}
