"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function criarChamado(data: {
  assunto: string
  descricao: string
  prioridade: string
  categoria: string
}) {
  const tenantId = getTenantId()
  try {
    const chamado = await prisma.chamadoSuporte.create({
      data: {
        tenantId,
        assunto: data.assunto,
        descricao: `[${data.categoria}] ${data.descricao}`,
        prioridade: data.prioridade,
        status: "aberto",
      },
    })
    revalidatePath("/ajuda")
    return { success: true, chamado }
  } catch (e) {
    console.error(e)
    return { success: false }
  }
}

export async function buscarChamados() {
  const tenantId = getTenantId()
  try {
    return await prisma.chamadoSuporte.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    })
  } catch (e) {
    console.error(e)
    return []
  }
}

export async function atualizarStatusChamado(id: string, status: string) {
  const tenantId = getTenantId()
  try {
    await prisma.chamadoSuporte.update({ where: { id, tenantId }, data: { status } })
    revalidatePath("/ajuda")
    return { success: true }
  } catch (e) {
    return { success: false }
  }
}
