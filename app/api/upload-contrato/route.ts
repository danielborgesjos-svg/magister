import { NextRequest, NextResponse } from "next/server"
import { writeFile, mkdir } from "fs/promises"
import path from "path"

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File
    const contratoId = formData.get("contratoId") as string

    if (!file) return NextResponse.json({ error: "Nenhum arquivo enviado." }, { status: 400 })

    // Valida tipo
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Apenas arquivos PDF são aceitos." }, { status: 400 })
    }

    // Limita a 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande. Máximo 10MB." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Diretório de upload seguro dentro do projeto
    const uploadDir = path.join(process.cwd(), "public", "uploads", "contratos")
    await mkdir(uploadDir, { recursive: true })

    // Nome único para evitar colisões
    const timestamp = Date.now()
    const nomeSeguro = file.name.replace(/[^a-zA-Z0-9._-]/g, "_")
    const fileName = `${contratoId ?? "tmp"}_${timestamp}_${nomeSeguro}`
    const filePath = path.join(uploadDir, fileName)

    await writeFile(filePath, buffer)

    return NextResponse.json({
      success: true,
      path: `/uploads/contratos/${fileName}`,
      nome: file.name,
      size: file.size,
    })
  } catch (error) {
    console.error("[upload-contrato]", error)
    return NextResponse.json({ error: "Erro interno ao salvar arquivo." }, { status: 500 })
  }
}
