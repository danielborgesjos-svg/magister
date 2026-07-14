"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarCampanhas() {
  const tenantId = getTenantId()
  try {
    return await prisma.campanha.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } })
  } catch (e) { console.error(e); return [] }
}

export async function criarCampanha(data: {
  nome: string; descricao?: string; canal?: string; mensagemPadrao?: string; contatos?: number
}) {
  const tenantId = getTenantId()
  try {
    const campanha = await prisma.campanha.create({
      data: { tenantId, ...data, status: "rascunho" }
    })
    revalidatePath("/campanhas")
    return { success: true, campanha }
  } catch (e) { console.error(e); return { success: false } }
}

export async function atualizarStatusCampanha(id: string, status: string) {
  const tenantId = getTenantId()
  try {
    await prisma.campanha.update({ where: { id, tenantId }, data: { status } })
    revalidatePath("/campanhas")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

export async function buscarFluxosIA() {
  const tenantId = getTenantId()
  try {
    return await prisma.fluxoIA.findMany({ where: { tenantId }, orderBy: { createdAt: "desc" } })
  } catch (e) { console.error(e); return [] }
}

export async function toggleFluxoIA(id: string, ativo: boolean) {
  const tenantId = getTenantId()
  try {
    await prisma.fluxoIA.update({ where: { id, tenantId }, data: { ativo } })
    revalidatePath("/inteligencia")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}
