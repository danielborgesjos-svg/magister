import { makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, ConnectionState, WASocket } from '@whiskeysockets/baileys'
import QRCode from 'qrcode'
import pino from 'pino'
import fs from 'fs'
import path from 'path'
import prisma from '@/lib/prisma'

// Singleton para não criar múltiplas conexões no hot-reload do Next.js
declare global {
  var __whatsapp: WASocket | null
  var __whatsappStatus: {
    status: 'conectando' | 'conectado' | 'desconectado' | 'qr_code_pronto'
    qrCodeBase64: string | null
    user: any | null
  }
}

if (!global.__whatsappStatus) {
  global.__whatsappStatus = {
    status: 'desconectado',
    qrCodeBase64: null,
    user: null
  }
}

export const getWhatsAppStatus = () => global.__whatsappStatus

export const initWhatsApp = async (forceStart = false) => {
  if (global.__whatsapp && !forceStart) {
    return global.__whatsapp
  }

  const authFolder = path.join(process.cwd(), 'whatsapp-auth')
  if (!fs.existsSync(authFolder)) {
    fs.mkdirSync(authFolder, { recursive: true })
  }

  const { state, saveCreds } = await useMultiFileAuthState(authFolder)

  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    logger: pino({ level: 'silent' }) as any,
    browser: Browsers.macOS('Desktop'),
    syncFullHistory: false
  })

  global.__whatsapp = sock
  global.__whatsappStatus.status = 'conectando'

  sock.ev.on('creds.update', saveCreds)

  sock.ev.on('connection.update', async (update: Partial<ConnectionState>) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      // Gera QR Code em Base64
      try {
        const qrBase64 = await QRCode.toDataURL(qr)
        global.__whatsappStatus.qrCodeBase64 = qrBase64
        global.__whatsappStatus.status = 'qr_code_pronto'
      } catch (err) {
        console.error("Erro gerando QR Code:", err)
      }
    }

    if (connection === 'close') {
      global.__whatsappStatus.status = 'desconectado'
      global.__whatsappStatus.qrCodeBase64 = null
      global.__whatsappStatus.user = null
      const shouldReconnect = (lastDisconnect?.error as any)?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) {
        setTimeout(initWhatsApp, 5000)
      } else {
        // Usuário deslogou, limpar pasta auth
        fs.rmSync(authFolder, { recursive: true, force: true })
        global.__whatsapp = null
      }
    }

    if (connection === 'open') {
      global.__whatsappStatus.status = 'conectado'
      global.__whatsappStatus.qrCodeBase64 = null
      global.__whatsappStatus.user = sock.user
      console.log('✅ WhatsApp Conectado com sucesso!', sock.user?.id)
    }
  })

  sock.ev.on('messages.upsert', async (m) => {
    // Processamento de novas mensagens para salvar no Prisma
    if (m.type !== 'notify') return
    for (const msg of m.messages) {
      if (!msg.message) continue
      
      const remoteJid = msg.key.remoteJid
      if (!remoteJid || remoteJid.includes('@g.us') || remoteJid === 'status@broadcast') continue

      const telefone = remoteJid.split('@')[0]
      const isFromMe = msg.key.fromMe
      const texto = msg.message.conversation || msg.message.extendedTextMessage?.text || "[Mídia não suportada]"

      try {
        // Buscar ou criar conversa
        let conversa = await prisma.conversaWA.findFirst({
          where: { telefone }
        })

        if (!conversa) {
          conversa = await prisma.conversaWA.create({
            data: {
              telefone,
              nome: msg.pushName || telefone,
              status: "novo",
              tenantId: "tenant_default_001" // Using default tenant for webhook since it doesn't have request context yet
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
            conversaId: conversa.id,
            tipo: isFromMe ? "saida" : "entrada",
            conteudo: texto,
            statusEnvio: isFromMe ? "enviado" : "recebido"
          }
        })
      } catch (err) {
        console.error("Erro salvando mensagem do WA:", err)
      }
    }
  })

  return sock
}
