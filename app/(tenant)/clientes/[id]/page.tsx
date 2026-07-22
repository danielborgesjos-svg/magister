import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Building2, MapPin, Phone, Mail, FileText, 
  ShoppingCart, Package, DollarSign, BrainCircuit, 
  Clock, CheckCircle, AlertCircle, TrendingUp, History
} from "lucide-react"

const prisma = new PrismaClient()

interface Cliente360Props {
  params: { id: string }
}

export default async function Cliente360Page({ params }: Cliente360Props) {
  // Busca o cliente (Mock id caso venha de um link de demonstração)
  let cliente = await prisma.cliente.findUnique({
    where: { id: params.id },
    include: {
      contatos: true,
      vendas: { orderBy: { createdAt: 'desc' }, take: 5 },
      negociacoes: { orderBy: { createdAt: 'desc' }, take: 5 }
    }
  })

  // Se não encontrar por ID real, tenta pegar o primeiro para fim de demonstração da POC
  if (!cliente) {
    cliente = await prisma.cliente.findFirst({
      include: {
        contatos: true,
        vendas: { orderBy: { createdAt: 'desc' }, take: 5 },
        negociacoes: { orderBy: { createdAt: 'desc' }, take: 5 }
      }
    })
  }
  
  if (!cliente) return notFound()

  // IA MOCK para a POC
  const inteligencia = {
    cicloRecompra: "45 dias",
    riscoAbandono: "Baixo (12%)",
    proximaCompra: "Prevista para daqui a 8 dias",
    produtosSugeridos: ["Barra Antipânico Touch", "Mola Hidráulica Mista"],
    melhorAcao: "Enviar portfólio atualizado com nova linha de molas áreas."
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* Cabeçalho Cliente 360 */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-card p-6 rounded-xl border border-border/50 shadow-sm">
        <div className="flex gap-6">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-3xl font-bold text-primary shrink-0">
            {cliente.nomeFantasia?.[0] || cliente.nome[0]}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">{cliente.nomeFantasia || cliente.nome}</h1>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{cliente.status.toUpperCase()}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{cliente.razaoSocial} • CNPJ: {cliente.cnpjCpf}</p>
            
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {cliente.cidade || "Cidade não inf."}</span>
              <span className="flex items-center gap-1.5"><Building2 className="w-4 h-4" /> {cliente.segmento || "Segmento Padrão"}</span>
              <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> Limite: R$ 50.000</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 min-w-[200px]">
          <Button className="w-full gap-2"><ShoppingCart className="w-4 h-4"/> Novo Pedido</Button>
          <Button variant="outline" className="w-full gap-2"><FileText className="w-4 h-4"/> Nova Oportunidade</Button>
        </div>
      </div>

      <Tabs defaultValue="inteligencia" className="w-full">
        {/* Usando flex-wrap para o TabList suportar 13 abas */}
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-transparent p-0 mb-6 border-b border-border/50 rounded-none pb-2 justify-start">
          <TabsTrigger value="resumo" className="data-[state=active]:bg-muted">Resumo</TabsTrigger>
          <TabsTrigger value="inteligencia" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary font-medium text-primary"><BrainCircuit className="w-3.5 h-3.5 mr-1.5"/> Inteligência</TabsTrigger>
          <TabsTrigger value="contatos" className="data-[state=active]:bg-muted">Contatos</TabsTrigger>
          <TabsTrigger value="compras" className="data-[state=active]:bg-muted">Compras</TabsTrigger>
          <TabsTrigger value="produtos" className="data-[state=active]:bg-muted">Produtos</TabsTrigger>
          <TabsTrigger value="oportunidades" className="data-[state=active]:bg-muted">Oportunidades</TabsTrigger>
          <TabsTrigger value="financeiro" className="data-[state=active]:bg-muted">Financeiro</TabsTrigger>
          <TabsTrigger value="entregas" className="data-[state=active]:bg-muted">Entregas</TabsTrigger>
          <TabsTrigger value="timeline" className="data-[state=active]:bg-muted">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="inteligencia" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 space-y-6">
              <Card className="glass-panel border-l-4 border-l-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary uppercase tracking-wider flex items-center gap-2">
                    <BrainCircuit className="w-4 h-4"/> Análise Comportamental Preditiva
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Com base no histórico de compras desde jan/2024, a frequência de compra deste cliente está estável. 
                    No entanto, ele parou de comprar "Molas Hidráulicas" há 3 meses.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Ciclo de Recompra</p>
                      <p className="text-lg font-bold">{inteligencia.cicloRecompra}</p>
                    </div>
                    <div className="bg-muted/30 p-3 rounded-lg border border-border/50">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Risco de Inatividade</p>
                      <p className="text-lg font-bold text-emerald-500">{inteligencia.riscoAbandono}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader>
                  <CardTitle className="text-base">Recomendação de Próxima Ação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-primary/5 border border-primary/10 p-4 rounded-lg flex items-start gap-4">
                    <div className="mt-1">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                        <CheckCircle className="w-4 h-4"/>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground mb-1">Contato Proativo Sugerido</p>
                      <p className="text-sm text-muted-foreground mb-3">{inteligencia.melhorAcao}</p>
                      <Button size="sm">Registrar Atividade de Contato</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Produtos Sugeridos (Cross-sell)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {inteligencia.produtosSugeridos.map(p => (
                      <li key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Package className="w-4 h-4 text-primary"/> {p}
                      </li>
                    ))}
                  </ul>
                  <Button variant="outline" size="sm" className="w-full mt-4">Criar Orçamento IA</Button>
                </CardContent>
              </Card>

              <Card className="glass-panel">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Próxima Compra</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-amber-500"/>
                    <p className="text-sm font-medium">{inteligencia.proximaCompra}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="resumo">
           <div className="flex items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
             <p className="text-muted-foreground">Dashboard Resumo do Cliente (Pedidos em aberto, Dívidas, Ticket Médio)</p>
           </div>
        </TabsContent>

        <TabsContent value="compras">
           <div className="flex items-center justify-center h-[300px] border-2 border-dashed rounded-lg">
             <p className="text-muted-foreground">Histórico Completo de Notas e Pedidos Fechados</p>
           </div>
        </TabsContent>
        
        {/* Demais abas seguirão esse padrão (omitidas para não alongar excessivamente a POC) */}

      </Tabs>

    </div>
  )
}
