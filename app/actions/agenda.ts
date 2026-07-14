"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"

export async function buscarAgendamentos(filtros?: { responsavel?: string }) {
  const tenantId = getTenantId()
  try {
    const where: any = { tenantId }
    if (filtros?.responsavel && filtros.responsavel !== "Todos") {
      where.responsavel = filtros.responsavel
    }
    return await prisma.agendamento.findMany({
      where,
      orderBy: { data: "asc" }
    })
  } catch (e) { console.error(e); return [] }
}

export async function criarAgendamento(data: {
  titulo: string; descricao?: string; data: string; duracao?: number;
  tipo?: string; status?: string; responsavel?: string; clienteId?: string; recorrencia?: string
}) {
  const tenantId = getTenantId()
  try {
    const qtdeMeses = data.recorrencia === 'mensal' ? 12 : data.recorrencia === 'trimestral' ? 4 : data.recorrencia === 'semestral' ? 2 : data.recorrencia === 'anual' ? 2 : 1;
    const stepMeses = data.recorrencia === 'mensal' ? 1 : data.recorrencia === 'trimestral' ? 3 : data.recorrencia === 'semestral' ? 6 : data.recorrencia === 'anual' ? 12 : 0;
    
    const baseDate = new Date(data.data)
    
    for (let i = 0; i < qtdeMeses; i++) {
      const d = new Date(baseDate)
      if (stepMeses > 0) d.setMonth(d.getMonth() + (i * stepMeses))
        
      await prisma.agendamento.create({
        data: {
          tenantId,
          titulo: data.titulo,
          descricao: data.descricao,
          data: d,
          duracao: data.duracao || 60,
          tipo: data.tipo || "reuniao",
          status: data.status || "agendado",
          responsavel: data.responsavel || "Sistema",
          clienteId: data.clienteId,
        }
      })
    }
    revalidatePath("/agenda")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}

export async function atualizarAgendamento(id: string, data: {
  titulo?: string; descricao?: string; data?: string; duracao?: number;
  tipo?: string; status?: string; responsavel?: string
}) {
  const tenantId = getTenantId()
  try {
    const ag = await prisma.agendamento.update({
      where: { id, tenantId },
      data: { ...data, data: data.data ? new Date(data.data) : undefined }
    })
    revalidatePath("/agenda")
    return { success: true, ag }
  } catch (e) { console.error(e); return { success: false } }
}

export async function deletarAgendamento(id: string) {
  const tenantId = getTenantId()
  try {
    await prisma.agendamento.delete({ where: { id, tenantId } })
    revalidatePath("/agenda")
    return { success: true }
  } catch (e) { console.error(e); return { success: false } }
}
