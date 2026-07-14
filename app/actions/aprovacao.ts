"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarAcoesPendentes() {
  const tenantId = getTenantId()
  try {
    return await prisma.acaoPendenteIA.findMany({
      where: { tenantId, status: "pendente" },
      orderBy: { createdAt: "desc" }
    })
  } catch (e) { console.error(e); return [] }
}

export async function buscarHistoricoAcoes() {
  const tenantId = getTenantId()
  try {
    return await prisma.acaoPendenteIA.findMany({
      where: { tenantId, status: { not: "pendente" } },
      orderBy: { updatedAt: "desc" },
      take: 20
    })
  } catch (e) { console.error(e); return [] }
}

export async function aprovarAcao(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.acaoPendenteIA.update({ where: { id, tenantId }, data: { status: "aprovado" } })
    // Aqui seria injetada a execução real da ação (ex: criar campanha, emitir pedido)
    revalidatePath("/centro-aprovacao")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

export async function rejeitarAcao(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.acaoPendenteIA.update({ where: { id, tenantId }, data: { status: "rejeitado" } })
    revalidatePath("/centro-aprovacao")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

export async function buscarAgentLogs(limit = 20) {
  const tenantId = getTenantId()
  try {
    return await prisma.agentLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
      take: limit
    })
  } catch (e) { console.error(e); return [] }
}
