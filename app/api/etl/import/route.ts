import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { z } from "zod"

const prisma = new PrismaClient()

// Schema de validação Zod para os dados do CSV (Exemplo: Vendas Históricas)
const vendaCSVSchema = z.object({
  produtoSku: z.string(),
  quantidade: z.coerce.number().positive(),
  dataVenda: z.coerce.date(),
  clienteDocumento: z.string().optional(),
  valorUnitario: z.coerce.number().positive()
})

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const file = formData.get("file") as File | null
    const tenantId = formData.get("tenantId") as string

    if (!file || !tenantId) {
      return NextResponse.json({ error: "Arquivo CSV e tenantId são obrigatórios." }, { status: 400 })
    }

    const text = await file.text()
    
    // Parse básico de CSV (para produção recomenda-se bibliotecas como papaparse ou fast-csv)
    const lines = text.split("\n").filter(l => l.trim() !== "")
    if (lines.length < 2) {
       return NextResponse.json({ error: "O arquivo CSV parece estar vazio ou sem cabeçalhos." }, { status: 400 })
    }

    const headers = lines[0].split(",").map(h => h.trim().toLowerCase())
    
    const errors: any[] = []
    let successCount = 0

    // Processa a partir da linha 1
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim())
      
      const rowObject: any = {}
      headers.forEach((header, index) => {
        rowObject[header] = values[index]
      })

      // Validação Zod linha a linha
      const validation = vendaCSVSchema.safeParse(rowObject)

      if (!validation.success) {
        errors.push({ linha: i + 1, erro: validation.error.flatten().fieldErrors })
        continue
      }

      // IMPORTANTE: Aqui ocorreria a inserção no banco de dados (ex: tabela Vendas)
      // Como a importação real depende das SKUs já cadastradas, apenas registramos sucesso para a POC
      successCount++
    }

    // Registrar o log da importação na nova tabela ImportacaoLog
    await prisma.importacaoLog.create({
      data: {
        tenantId,
        loteId: `LOTE-${Date.now()}`,
        tabelaAlvo: "VendasHistoricas",
        status: errors.length === 0 ? "SUCESSO" : (successCount > 0 ? "FALHA_PARCIAL" : "FALHA"),
        erros: errors.length > 0 ? JSON.stringify(errors.slice(0, 50)) : null // limita tamanho no BD
      }
    })

    return NextResponse.json({ 
      mensagem: "Processamento concluído", 
      linhasProcessadas: lines.length - 1, 
      sucesso: successCount, 
      erros: errors.length,
      amostraErros: errors.slice(0, 5)
    })

  } catch (error: any) {
    console.error("Erro no ETL Import:", error)
    return NextResponse.json({ error: "Erro interno no processamento do arquivo." }, { status: 500 })
  }
}
