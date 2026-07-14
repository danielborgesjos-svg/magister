"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarContratos(filtros?: { status?: string; tipo?: string; busca?: string }) {
  const tenantId = getTenantId()
  try {
    const where: any = { tenantId }
    if (filtros?.status && filtros.status !== "todos") where.status = filtros.status
    if (filtros?.tipo && filtros.tipo !== "todos") where.tipo = filtros.tipo
    if (filtros?.busca) {
      where.OR = [
        { titulo: { contains: filtros.busca } },
        { parteNome: { contains: filtros.busca } },
        { numero: { contains: filtros.busca } },
        { categoria: { contains: filtros.busca } },
      ]
    }
    return await prisma.contrato.findMany({
      where,
      include: { cliente: { select: { id: true, nome: true } } },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) { console.error(e); return [] }
}

export async function buscarKPIsContratos() {
  const tenantId = getTenantId()
  const agora = new Date()
  const em30dias = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  const em60dias = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
  try {
    const [total, ativos, encerrados, aVencer30, aVencer60, valorTotal] = await Promise.all([
      prisma.contrato.count({ where: { tenantId } }),
      prisma.contrato.count({ where: { tenantId, status: "ativo" } }),
      prisma.contrato.count({ where: { tenantId, status: "encerrado" } }),
      prisma.contrato.count({ where: { tenantId, status: "ativo", dataFim: { gte: agora, lte: em30dias } } }),
      prisma.contrato.count({ where: { tenantId, status: "ativo", dataFim: { gte: agora, lte: em60dias } } }),
      prisma.contrato.aggregate({ where: { tenantId, status: "ativo" }, _sum: { valor: true } }),
    ])
    return { total, ativos, encerrados, aVencer30, aVencer60, valorTotal: valorTotal._sum.valor ?? 0 }
  } catch (e) { console.error(e); return null }
}

export async function criarContrato(data: {
  titulo: string; tipo: string; numero?: string; categoria?: string
  parteNome?: string; parteDoc?: string; clienteId?: string
  valor: number; periodicidade: string; status: string
  dataInicio: string; dataFim?: string; alertaRenovacao?: number
  responsavel?: string; observacoes?: string
  arquivoPath?: string; arquivoNome?: string; arquivoSize?: number
}) {
  const tenantId = getTenantId()
  try {
    const contrato = await prisma.contrato.create({
      data: {
        tenantId,
        titulo: data.titulo,
        tipo: data.tipo,
        numero: data.numero,
        categoria: data.categoria,
        parteNome: data.parteNome,
        parteDoc: data.parteDoc,
        clienteId: data.clienteId || null,
        valor: data.valor,
        periodicidade: data.periodicidade,
        status: data.status,
        dataInicio: new Date(data.dataInicio),
        dataFim: data.dataFim ? new Date(data.dataFim) : null,
        alertaRenovacao: data.alertaRenovacao ?? null,
        responsavel: data.responsavel,
        observacoes: data.observacoes,
        arquivoPath: data.arquivoPath,
        arquivoNome: data.arquivoNome,
        arquivoSize: data.arquivoSize,
      }
    })
    revalidatePath("/financeiro/contratos")
    return { success: true, contrato }
  } catch (e) { console.error(e); return { success: false } }
}

export async function atualizarContratoArquivo(id: string, arquivoPath: string, arquivoNome: string, arquivoSize: number) {
  const tenantId = getTenantId()
  try {
    await prisma.contrato.update({ where: { id, tenantId }, data: { arquivoPath, arquivoNome, arquivoSize } })
    revalidatePath("/financeiro/contratos")
    return { success: true }
  } catch (e) { return { success: false } }
}

export async function atualizarStatusContrato(id: string, status: string) {
  const tenantId = getTenantId()
  try {
    await prisma.contrato.update({ where: { id, tenantId }, data: { status } })
    revalidatePath("/financeiro/contratos")
    return { success: true }
  } catch (e) { return { success: false } }
}

export async function deletarContrato(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.contrato.delete({ where: { id, tenantId } })
    revalidatePath("/financeiro/contratos")
    return { success: true }
  } catch (e) { return { success: false } }
}
