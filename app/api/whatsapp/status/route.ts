import { NextResponse } from "next/server"
import { getEvolutionInstanceStatus, connectEvolutionInstance } from "@/lib/whatsapp"

export async function GET() {
  try {
    const instanceName = "magisterERP"
    let status = 'desconectado'
    let qrCodeBase64 = null
    
    const stateData = await getEvolutionInstanceStatus(instanceName)
    
    if (stateData && stateData.instance) {
      const state = stateData.instance.state
      if (state === "open") {
          status = "conectado"
      } else if (state === "connecting" || state === "close") {
         const connectData = await connectEvolutionInstance(instanceName)
         if (connectData && connectData.base64) {
             qrCodeBase64 = connectData.base64
             status = "qr_code_pronto"
         } else {
             status = "conectando"
         }
      }
    }
    
    return NextResponse.json({ status, qrCodeBase64 })
  } catch(e) {
    return NextResponse.json({ status: 'desconectado', qrCodeBase64: null })
  }
}
