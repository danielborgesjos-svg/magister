import { NextResponse } from "next/server"
import { createEvolutionInstance, connectEvolutionInstance } from "@/lib/whatsapp"

export async function POST(req: Request) {
  try {
    const instanceName = "magisterERP"
    
    try {
        await connectEvolutionInstance(instanceName)
    } catch(e) {
        await createEvolutionInstance(instanceName)
        await connectEvolutionInstance(instanceName)
    }

    return NextResponse.json({ success: true, message: "Comando enviado para Evolution API" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
