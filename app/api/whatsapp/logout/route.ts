import { NextResponse } from 'next/server'
import { logoutEvolutionInstance } from '@/lib/whatsapp'

export async function POST() {
  try {
    await logoutEvolutionInstance('magisterERP')
    return NextResponse.json({ success: true, message: 'Desconectado com sucesso' })
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}
