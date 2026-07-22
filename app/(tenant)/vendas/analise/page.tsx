import { PrismaClient } from "@prisma/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, MapPin, Lightbulb } from "lucide-react"

const prisma = new PrismaClient()

export default async function VendasAnalisePage() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { probabilidadeChurn: 'desc' },
    take: 10
  })

  const alertas = await prisma.alertaPreditivo.findMany({
    where: { tipo: { in: ['vendas', 'cliente'] }, status: 'ativo' },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Inteligência Comercial & Vendas (DISAFE IA)
        </h1>
        <p className="text-muted-foreground mt-2">Visão antecipada de desafios e priorização estratégica baseada no histórico.</p>
      </div>

      {/* Insights / Oportunidades */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {alertas.map(alerta => (
          <Card key={alerta.id} className="border-t-4 border-t-emerald-500 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-background to-emerald-50/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-md flex items-start gap-2">
                <Lightbulb className="text-emerald-500 mt-1 shrink-0" size={18} />
                <span className="leading-tight">{alerta.titulo}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{alerta.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priorização de Clientes (Anti-Churn e Upsell) */}
      <Card className="shadow-lg border-0 ring-1 ring-border">
        <CardHeader className="bg-muted/30 border-b">
          <CardTitle className="flex items-center gap-2">
            <Users className="text-teal-600" /> Priorização de Ação Comercial (Risco de Churn)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/10 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-6 py-4 font-semibold">Distribuidor</th>
                  <th className="px-6 py-4 font-semibold">Localidade</th>
                  <th className="px-6 py-4 font-semibold">Perfil Comportamental (IA)</th>
                  <th className="px-6 py-4 font-semibold text-right">Risco Churn</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {clientes.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{c.nome}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin size={14} /> {c.cidade}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground italic">
                      "{c.perfilComportamental}"
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-24 bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full ${c.probabilidadeChurn! > 60 ? 'bg-red-500' : c.probabilidadeChurn! > 30 ? 'bg-orange-500' : 'bg-green-500'}`} 
                            style={{ width: `${c.probabilidadeChurn}%` }} 
                          />
                        </div>
                        <span className="font-semibold text-xs">{c.probabilidadeChurn}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
