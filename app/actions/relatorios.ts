"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"

export async function buscarDadosRelatorios() {
  const tenantId = getTenantId()

  try {
    const [clientes, produtos, campanhas, conversas] = await Promise.all([
      prisma.cliente.findMany({ where: { tenantId }, select: { segmento: true } }),
      prisma.produto.findMany({ where: { tenantId }, select: { risco: true } }),
      prisma.campanha.findMany({ where: { tenantId } }),
      prisma.conversaWA.findMany({ where: { tenantId } })
    ])

    return {
      clientes,
      produtos,
      campanhas,
      conversas
    }
  } catch (error) {
    console.error("Erro ao buscar dados dos relatórios:", error)
    return { clientes: [], produtos: [], campanhas: [], conversas: [] }
  }
}
