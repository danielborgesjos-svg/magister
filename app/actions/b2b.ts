'use server'

import { PrismaClient } from "@prisma/client"
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

export async function moverOportunidade(oportunidadeId: string, novoStatus: string) {
  try {
    await prisma.b2BOportunidade.update({
      where: { id: oportunidadeId },
      data: { status: novoStatus }
    })
    
    revalidatePath('/portal-b2b/oportunidades')
    revalidatePath('/portal-b2b')
    return { success: true }
  } catch (error) {
    console.error("Erro ao mover oportunidade:", error)
    return { success: false, error: "Falha ao mover oportunidade" }
  }
}
