"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function listarTecnicos(busca?: string) {
  const tenantId = getTenantId()
  try {
    const where: any = { tenantId }
    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { email: { contains: busca } }
      ]
    }
    
    return await prisma.tecnico.findMany({
      where,
      include: {
        equipe: { select: { nome: true } },
        _count: { select: { ordensServico: true } }
      },
      orderBy: { nome: 'asc' },
    })
  } catch (error) {
    console.error("[listarTecnicos]", error)
    return []
  }
}

export async function criarTecnico(data: { nome: string, email: string, telefone?: string }) {
  const tenantId = getTenantId()
  try {
    const tecnico = await prisma.tecnico.create({
      data: {
        tenantId,
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        status: "ativo"
      }
    })

    revalidatePath("/os")
    return { success: true, tecnico }
  } catch (error: any) {
    console.error("[criarTecnico]", error)
    return { success: false, error: "Erro ao cadastrar técnico." }
  }
}

export async function atualizarStatusTecnico(id: string, status: string) {
  const tenantId = getTenantId()
  try {
    await prisma.tecnico.update({
      where: { id, tenantId },
      data: { status }
    })
    
    revalidatePath("/os")
    return { success: true }
  } catch (error: any) {
    console.error("[atualizarStatusTecnico]", error)
    return { success: false, error: "Erro ao atualizar status." }
  }
}
