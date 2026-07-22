import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wrench, FileArchive, Settings } from "lucide-react"

const prisma = new PrismaClient()

export default async function EngenhariaPage() {
  const bomsCount = await prisma.bOM.count()
  const materiasPrimasCount = await prisma.materiaPrima.count()
  const produtosCount = await prisma.produto.count()

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            Engenharia e P&D
          </h1>
          <p className="text-muted-foreground mt-1">Gestão de Bill of Materials (BOM), Fichas Técnicas e Produtos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-panel border-t-4 border-t-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fichas Técnicas (BOM)</CardTitle>
            <FileArchive className="w-4 h-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bomsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Estruturas cadastradas</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-t-4 border-t-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Itens de Fabricação (Produtos)</CardTitle>
            <Settings className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{produtosCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Catálogo de Produtos</p>
          </CardContent>
        </Card>

        <Card className="glass-panel border-t-4 border-t-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Matérias-Primas Homologadas</CardTitle>
            <Wrench className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{materiasPrimasCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Componentes disponíveis</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel mt-6">
        <CardHeader>
          <CardTitle>Engenharia de Produto em Manutenção</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">O módulo completo de versionamento de engenharia está sendo atualizado.</p>
        </CardContent>
      </Card>
    </div>
  )
}
