import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    console.log("=== EVOLUTION WEBHOOK RECEBIDO ===", JSON.stringify(payload, null, 2))

    // Validar tipo de evento
    if (payload.event === 'messages.upsert') {
      const msg = payload.data.message
      if (!msg || msg.key.fromMe) return NextResponse.json({ success: true, fromMe: true })

      const remoteJid = msg.key.remoteJid
      if (!remoteJid || remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') {
        return NextResponse.json({ success: true, ignored: true })
      }

      const telefone = remoteJid.split('@')[0]
      const isFromMe = msg.key.fromMe
      const texto = msg.message?.conversation || msg.message?.extendedTextMessage?.text || "[Mídia/Mensagem não suportada]"
      const pushName = payload.data.pushName || telefone

      try {
        // Buscar ou criar conversa
        let conversa = await prisma.conversaWA.findFirst({
          where: { telefone }
        })

        if (!conversa) {
          conversa = await prisma.conversaWA.create({
            data: {
              telefone,
              nome: pushName,
              status: "novo",
              tenantId: "tenant_default_001" 
            }
          })
        } else {
          // Atualiza ultima mensagem
          await prisma.conversaWA.update({
            where: { id: conversa.id },
            data: { 
              ultimaMensagem: texto, 
              unreadCount: isFromMe ? 0 : conversa.unreadCount + 1,
              status: isFromMe ? conversa.status : "em_atendimento" 
            }
          })
        }

        // Salva a mensagem
        await prisma.mensagemWA.create({
          data: {
            tenantId: conversa.tenantId || "tenant_default_001",
            conversaId: conversa.id,
            tipo: isFromMe ? "saida" : "entrada",
            conteudo: texto,
            statusEnvio: isFromMe ? "enviado" : "recebido"
          }
        })
      } catch (dbErr) {
        console.error("Erro salvando mensagem webhook:", dbErr)
      }
    } else if (payload.event === 'connection.update') {
        const state = payload.data.state
        console.log(`Connection state changed to: ${state}`)
        // Pode salvar estado no DB se desejar
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error("Webhook Error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
