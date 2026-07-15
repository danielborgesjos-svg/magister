import prisma from '@/lib/prisma'

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://127.0.0.1:8080'
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || 'B4B0B7A6-5B8B-48F8-953D-E4562DBF0E7C'
const ERP_WEBHOOK_URL = process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/evolution` : 'https://erp.magistertech.com.br/api/webhooks/evolution'

export async function evolutionFetch(endpoint: string, options: RequestInit = {}) {
  const url = `${EVOLUTION_API_URL}${endpoint}`
  const headers = {
    'apikey': EVOLUTION_API_KEY,
    'Content-Type': 'application/json',
    ...(options.headers || {})
  }

  const response = await fetch(url, { ...options, headers })
  if (!response.ok) {
    let err = 'Erro na API Evolution'
    try {
      const errorData = await response.json()
      err = errorData.message || err
    } catch (e) {}
    throw new Error(err)
  }
  
  // Some endpoints return 204 or empty string
  const text = await response.text()
  return text ? JSON.parse(text) : {}
}

export async function createEvolutionInstance(instanceName: string) {
  try {
    const data = await evolutionFetch('/instance/create', {
      method: 'POST',
      body: JSON.stringify({
        instanceName,
        qrcode: true,
        integration: 'WHATSAPP-BAILEYS'
      })
    })

    // Set Webhook
    try {
      await evolutionFetch(`/webhook/set/${instanceName}`, {
        method: 'POST',
        body: JSON.stringify({
          webhook: {
            enabled: true,
            url: ERP_WEBHOOK_URL,
            byEvents: false,
            base64: false,
            events: [
              "MESSAGES_UPSERT",
              "CONNECTION_UPDATE"
            ]
          }
        })
      })
    } catch (e) {
      console.error("Erro ao configurar webhook:", e)
    }

    return data
  } catch (error) {
    console.error("Erro ao criar instancia:", error)
    throw error
  }
}

export async function getEvolutionInstanceStatus(instanceName: string) {
  try {
    return await evolutionFetch(`/instance/connectionState/${instanceName}`)
  } catch (error) {
    // If instance doesn't exist, it might throw 404
    return null
  }
}

export async function connectEvolutionInstance(instanceName: string) {
  try {
    return await evolutionFetch(`/instance/connect/${instanceName}`)
  } catch (error) {
    console.error("Erro ao conectar instancia:", error)
    throw error
  }
}

export async function logoutEvolutionInstance(instanceName: string) {
  try {
    return await evolutionFetch(`/instance/logout/${instanceName}`, {
      method: 'DELETE'
    })
  } catch (error) {
    console.error("Erro ao deslogar instancia:", error)
    throw error
  }
}

export async function sendEvolutionMessage(instanceName: string, number: string, text: string) {
  try {
    const data = await evolutionFetch(`/message/sendText/${instanceName}`, {
      method: 'POST',
      body: JSON.stringify({
        number,
        text,
        delay: 1200
      })
    })
    return data
  } catch (error) {
    console.error("Erro ao enviar mensagem via Evolution:", error)
    throw error
  }
}

