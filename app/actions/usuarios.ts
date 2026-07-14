"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import { hash } from "bcryptjs"

export async function listarUsuarios(busca?: string) {
  const tenantId = getTenantId()
  try {
    const where: any = { tenantId }
    if (busca) {
      where.OR = [
        { nome: { contains: busca } },
        { email: { contains: busca } }
      ]
    }
    
    return await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        createdAt: true,
      }
    })
  } catch (error) {
    console.error("[listarUsuarios]", error)
    return []
  }
}

export async function criarUsuario(data: { nome: string, email: string, role: string, senha?: string }) {
  const tenantId = getTenantId()
  try {
    const emailExistente = await prisma.user.findUnique({ where: { email: data.email } })
    if (emailExistente) {
      return { success: false, error: "E-mail já está em uso por outro usuário." }
    }

    const senhaHash = data.senha ? await hash(data.senha, 10) : await hash("123456", 10)

    const user = await prisma.user.create({
      data: {
        tenantId,
        nome: data.nome,
        email: data.email,
        role: data.role,
        senha: senhaHash
      }
    })

    revalidatePath("/permissoes")
    return { success: true, user }
  } catch (error: any) {
    console.error("[criarUsuario]", error)
    return { success: false, error: "Erro ao criar usuário." }
  }
}

export async function atualizarRoleUsuario(id: string, role: string) {
  const tenantId = getTenantId()
  try {
    await prisma.user.update({
      where: { id, tenantId },
      data: { role }
    })
    
    revalidatePath("/permissoes")
    return { success: true }
  } catch (error: any) {
    console.error("[atualizarRoleUsuario]", error)
    return { success: false, error: "Erro ao atualizar permissão." }
  }
}

export async function removerUsuario(id: string) {
  const tenantId = getTenantId()
  try {
    // Evita remover o último admin (opcional/boa prática)
    const adminCount = await prisma.user.count({ where: { tenantId, role: "admin" } })
    const userTarget = await prisma.user.findUnique({ where: { id, tenantId } })

    if (userTarget?.role === "admin" && adminCount <= 1) {
      return { success: false, error: "Não é possível remover o único administrador do sistema." }
    }

    await prisma.user.delete({
      where: { id, tenantId }
    })
    
    revalidatePath("/permissoes")
    return { success: true }
  } catch (error: any) {
    console.error("[removerUsuario]", error)
    return { success: false, error: "Erro ao remover usuário." }
  }
}
