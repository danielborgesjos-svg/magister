"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarConfiguracoes() {
  const tenantId = getTenantId()

  try {
    const [tenant, usuarios, fluxosIA] = await Promise.all([
      prisma.tenant.findUnique({ where: { id: tenantId } }),
      prisma.user.findMany({ where: { tenantId } }),
      prisma.fluxoIA.findMany({ where: { tenantId } })
    ])

    return {
      tenant,
      usuarios,
      fluxosIA
    }
  } catch (error) {
    console.error("Erro ao buscar configurações:", error)
    return { tenant: null, usuarios: [], fluxosIA: [] }
  }
}

export async function atualizarTenant(data: { nome?: string; documento?: string; configJson?: string }) {
  const tenantId = getTenantId()
  try {
    const tenant = await prisma.tenant.update({
      where: { id: tenantId },
      data
    })
    revalidatePath("/configuracoes")
    revalidatePath("/")
    return { success: true, tenant }
  } catch (error) {
    console.error(error)
    return { success: false, error: "Erro ao atualizar empresa." }
  }
}
