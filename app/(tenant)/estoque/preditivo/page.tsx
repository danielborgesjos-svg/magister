import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, TrendingUp, PackageSearch, BatteryWarning } from "lucide-react"

const prisma = new PrismaClient()

export default async function EstoquePreditivoPage() {
  const produtos = await prisma.produto.findMany({
    orderBy: { dataRupturaEstoque: 'asc' },
    where: { dataRupturaEstoque: { not: null } }
  })
  
  const alertas = await prisma.alertaPreditivo.findMany({
    where: { tipo: 'estoque', status: 'ativo' },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Previsibilidade de Estoque (DISAFE IA)
        </h1>
        <p className="text-muted-foreground mt-2">Visão analítica e alertas preditivos para reposição estratégica.</p>
      </div>

      {/* Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alertas.map(alerta => (
          <Card key={alerta.id} className={`border-l-4 ${alerta.severidade === 'critica' ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20'}`}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className={alerta.severidade === 'critica' ? 'text-red-500' : 'text-orange-500'} size={20} />
                {alerta.titulo}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela de Produtos Críticos */}
      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BatteryWarning className="text-indigo-500" /> Produtos em Risco de Ruptura
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 rounded-t-lg">
                <tr>
                  <th className="px-4 py-3">Produto</th>
                  <th className="px-4 py-3">Estoque Atual</th>
                  <th className="px-4 py-3">Demanda 30d (IA)</th>
                  <th className="px-4 py-3">Data Prevista P/ Zera</th>
                  <th className="px-4 py-3 text-right">Sugestão de Compra</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => {
                  const diasParaZerar = p.dataRupturaEstoque ? Math.ceil((new Date(p.dataRupturaEstoque).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : 0
                  return (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.nome}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.estoqueAtual <= p.estoqueMinimo ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                          {p.estoqueAtual} un
                        </span>
                      </td>
                      <td className="px-4 py-3 flex items-center gap-1">
                        <TrendingUp size={14} className="text-blue-500" />
                        {p.demandaPrevista30d} un
                      </td>
                      <td className="px-4 py-3">
                        <span className={diasParaZerar <= 15 ? 'text-red-500 font-bold' : 'text-orange-500'}>
                          Em {diasParaZerar} dias
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-indigo-600 dark:text-indigo-400">
                        + {p.sugestaoReposicao} un
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
