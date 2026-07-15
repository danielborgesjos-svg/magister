"use server";

import prisma from "@/lib/prisma";
import { getTenantId } from "@/lib/tenant-context";
import { revalidatePath } from "next/cache";

export async function getConversas() {
  try {
    const conversas = await prisma.conversaWA.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
    return { success: true, data: conversas };
  } catch (error) {
    console.error("Erro ao buscar conversas:", error);
    return { success: false, error: "Erro ao buscar conversas" };
  }
}

export async function getMensagens(conversaId: string) {
  try {
    const mensagens = await prisma.mensagemWA.findMany({
      where: { conversaId },
      orderBy: { createdAt: "asc" },
    });
    return { success: true, data: mensagens };
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return { success: false, error: "Erro ao buscar mensagens" };
  }
}

export async function enviarMensagem(conversaId: string, conteudo: string) {
  const tenantId = getTenantId();
  try {
    // 1. Criar a mensagem
    const novaMensagem = await prisma.mensagemWA.create({
      data: {
        tenantId,
        conversaId,
        tipo: "saida",
        conteudo,
        statusEnvio: "enviado",
      },
    });

    // 2. Atualizar a conversa
    await prisma.conversaWA.update({
      where: { id: conversaId },
      data: {
        ultimaMensagem: conteudo,
        updatedAt: new Date(),
      },
    });

    revalidatePath("/whatsapp");
    return { success: true, data: novaMensagem };
  } catch (error) {
    console.error("Erro ao enviar mensagem:", error);
    return { success: false, error: "Erro ao enviar mensagem" };
  }
}

export async function updateConversaStatus(id: string, status: string) {
  try {
    const conversa = await prisma.conversaWA.update({
      where: { id },
      data: { status },
    });
    revalidatePath("/whatsapp");
    return { success: true, data: conversa };
  } catch (error) {
    console.error("Erro ao atualizar status:", error);
    return { success: false, error: "Erro ao atualizar status" };
  }
}

export async function markAsRead(id: string) {
  try {
    const conversa = await prisma.conversaWA.update({
      where: { id },
      data: { unreadCount: 0 },
    });
    revalidatePath("/whatsapp");
    return { success: true, data: conversa };
  } catch (error) {
    console.error("Erro ao marcar como lido:", error);
    return { success: false, error: "Erro ao marcar como lido" };
  }
}

export async function createConversa(data: { telefone: string; nome: string; empresa?: string }) {
  try {
    const conversa = await prisma.conversaWA.create({
      data: {
        ...data,
        status: "novo",
        tenantId: getTenantId(),
      },
    });
    revalidatePath("/whatsapp");
    return { success: true, data: conversa };
  } catch (error) {
    console.error("Erro ao criar conversa:", error);
    return { success: false, error: "Erro ao criar conversa" };
  }
}

export async function getFluxosIA() {
  try {
    const fluxos = await prisma.fluxoIA.findMany({
      orderBy: { createdAt: "desc" }
    });
    return { success: true, data: fluxos };
  } catch (error) {
    console.error("Erro ao buscar fluxos:", error);
    return { success: false, error: "Erro ao buscar fluxos" };
  }
}

export async function createFluxoIA(data: { nome: string; descricao: string; gatilho: string; nodesJson: string }) {
  try {
    const fluxo = await prisma.fluxoIA.create({
      data: {
        ...data,
        ativo: true,
        tenantId: getTenantId(),
      }
    });
    revalidatePath("/whatsapp");
    return { success: true, data: fluxo };
  } catch (error) {
    console.error("Erro ao criar fluxo IA:", error);
    return { success: false, error: "Erro ao criar fluxo" };
  }
}
