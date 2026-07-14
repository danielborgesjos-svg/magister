import { NextResponse } from "next/server"
import { initWhatsApp } from "@/lib/whatsapp"

export async function POST(req: Request) {
  try {
    const { forceStart } = await req.json().catch(() => ({ forceStart: false }))
    await initWhatsApp(forceStart)
    return NextResponse.json({ success: true, message: "Comando enviado para o engine do WhatsApp" })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
