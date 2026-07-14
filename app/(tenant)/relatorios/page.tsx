"use client"

import { useState, useEffect } from "react"
import { FileText, Download, TrendingUp, TrendingDown, Filter, Calendar, Sparkles, PieChart, BarChart2, Users, Package, DollarSign, MessageSquare, Plus, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, PieChart as ReChartsPieChart, Pie, Cell } from "recharts"
import { cn } from "@/lib/utils"
import { buscarDadosFinanceirosChart } from "@/app/actions/financeiro"
import { buscarDadosRelatorios } from "@/app/actions/relatorios"

export default function RelatoriosPage() {
  const [activeTab, setActiveTab] = useState<'vendas' | 'clientes' | 'estoque' | 'financeiro' | 'whatsapp' | 'ia'>('vendas')
  const [periodo, setPeriodo] = useState("Ultimos 30 dias")
  const [resumoIA, setResumoIA] = useState<string | null>(null)
  const [isGerandoResumo, setIsGerandoResumo] = useState(false)
  const [showNovoRelatorio, setShowNovoRelatorio] = useState(false)
  const [relatoriosPersonalizados, setRelatoriosPersonalizados] = useState([
    { id: 'rp-01', titulo: 'Clientes VIP por Segmento', modulo: 'clientes', tipo: 'pizza', filtro: 'score > 80', criadoEm: '01/05/2025', dados: 12 },
    { id: 'rp-02', titulo: 'Top Produtos por Margem', modulo: 'estoque', tipo: 'barra', filtro: 'margem > 58%', criadoEm: '28/04/2025', dados: 8 },
  ])
  const [novoRelTitulo, setNovoRelTitulo] = useState('')
  const [novoRelModulo, setNovoRelModulo] = useState('vendas')
  const [novoRelTipo, setNovoRelTipo] = useState('barra')
  const [novoRelFiltro, setNovoRelFiltro] = useState('')
  
  const [chartData, setChartData] = useState<any[]>([])
  const [dadosRelatorios, setDadosRelatorios] = useState<{ clientes: any[], produtos: any[], campanhas: any[], conversas: any[] }>({
    clientes: [], produtos: [], campanhas: [], conversas: []
  })

  useEffect(() => {
    buscarDadosFinanceirosChart().then(setChartData)
    buscarDadosRelatorios().then(setDadosRelatorios)
  }, [])

  // Dados Auxiliares
  // 1. Clientes por segmento
  const segmentosCount = dadosRelatorios.clientes.reduce((acc, c) => {
    const seg = c.segmento || "Outros"
    acc[seg] = (acc[seg] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  
  const clientesPieData: { name: string; value: number }[] = Object.entries(segmentosCount).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value: value as number
  }))

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#6b7280']

  // 2. Estoque risco
  const estoqueRiscoCount = dadosRelatorios.produtos.reduce((acc, p) => {
    const risco = p.risco || "ok"
    acc[risco] = (acc[risco] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const estoqueBarData = Object.entries(estoqueRiscoCount).map(([name, value]) => ({
    status: name.toUpperCase(),
    quantidade: value
  }))

  // 3. Conversas por status
  const whatsappStatusCount = dadosRelatorios.conversas.reduce((acc, c) => {
    const status = c.status || "novo"
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const whatsappBarData = Object.entries(whatsappStatusCount).map(([name, value]) => ({
    status: name.replace("_", " ").toUpperCase(),
    conversas: value
  }))

  // Função para simular Resumo IA
  function handleGerarResumoIA() {
    setIsGerandoResumo(true)
    setTimeout(() => {
      let texto = ""
      if (activeTab === 'vendas') {
        texto = "Análise de Vendas Magis IA: O faturamento demonstrou um crescimento consistente de 18% nos últimos 3 meses, impulsionado pela Linha Premium A. Entretanto, o segmento de varejo apresentou uma leve queda de conversão de 4.2% devido à demora no tempo de resposta inicial dos leads do Instagram. Ação corretiva recomendada: Direcionar os novos leads automaticamente para o fluxo de resposta rápida IA."
      } else if (activeTab === 'clientes') {
        texto = "Análise de Clientes Magis IA: O segmento de construção representa 45% do faturamento ativo da empresa. Nota-se que 14 clientes deste segmento estão inativos há mais de 45 dias, somando R$ 120.000 em potencial de compra reprimido. Sugerimos campanha promocional direcionada via WhatsApp para reativação."
      } else if (activeTab === 'estoque') {
        texto = "Análise de Estoque Magis IA: Há risco real de perda de R$ 42.000 em vendas devido à ruptura de estoque do 'Item Giro Alto'. Em contrapartida, temos R$ 180.000 em capital imobilizado com produtos sem nenhuma saída há mais de 120 dias, com destaque para a categoria Sazonal. Recomendamos um pacote promocional casando produtos de giro alto com parados."
      } else if (activeTab === 'financeiro') {
        texto = "Análise Financeira Magis IA: O caixa operacional está saudável, com margem líquida consolidada de 53%. Contudo, há R$ 34.000 em contas a pagar vencendo esta semana sem o desconto contratual que expira amanhã. Sugerimos antecipar o pagamento com a sobra de caixa atual para obter 3% de desconto financeiro."
      } else if (activeTab === 'whatsapp') {
        texto = "Análise de Canais WhatsApp Magis IA: O WhatsApp gerou 65% de todos os novos contatos de maio. O tempo médio de espera está em 25 minutos, o que gera uma taxa de desistência de orçamento de 12.5%. Fluxos de resposta automatizados fora do horário comercial conseguiram salvar 22 negócios na última semana."
      } else {
        texto = "Análise Geral da Operação Magis IA: Cruzando todos os dados da Magister ERP, identificamos que a proatividade comercial com clientes de score de recompra superior a 80 é o principal vetor de lucratividade rápida. O tempo médio de resposta nas primeiras 2 horas é o indicador crítico que determina se a probabilidade de fechamento salta de 40% para 82%."
      }
      setResumoIA(texto)
      setIsGerandoResumo(false)
    }, 1500)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-xl text-xs">
          <p className="font-bold mb-1.5">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="text-muted-foreground">{entry.name}</span>
              <span className="font-bold">{typeof entry.value === 'number' && (entry.name.toLowerCase().includes('valor') || entry.name.toLowerCase().includes('resultado')) ? formatCurrency(entry.value) : entry.value}</span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Relatórios Inteligentes</h1>
          <p className="text-sm text-muted-foreground">Monitore o desempenho operacional, financeiro e comercial</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select 
            className="bg-card border border-border text-foreground rounded-lg text-xs font-semibold px-3 py-2 outline-none focus:border-primary"
            value={periodo}
            onChange={e => setPeriodo(e.target.value)}
          >
            <option>Últimos 7 dias</option>
            <option value="Ultimos 30 dias">Últimos 30 dias</option>
            <option>Últimos 90 dias</option>
            <option>Ano corrente</option>
          </select>
          
          <button className="flex items-center gap-2 px-3 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> PDF
          </button>
          <button className="flex items-center gap-2 px-3 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-lg text-sm font-medium transition-colors">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button 
            onClick={() => setShowNovoRelatorio(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium shadow-lg shadow-primary/20 transition-colors"
          >
            <Plus className="w-4 h-4" /> Novo Relatório
          </button>
        </div>
      </div>

      {/* SUB-TABS */}
      <div className="flex items-center gap-2 border-b border-border pb-px overflow-x-auto shrink-0 custom-scrollbar">
        {[
          { id: 'vendas', label: 'Vendas e ROI', icon: BarChart2 },
          { id: 'clientes', label: 'Clientes e Nicho', icon: Users },
          { id: 'estoque', label: 'Estoque e Giro', icon: Package },
          { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
          { id: 'whatsapp', label: 'WhatsApp e Chat', icon: MessageSquare },
          { id: 'ia', label: 'Magis IA Diagnóstico', icon: Sparkles },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any)
              setResumoIA(null)
            }}
            className={cn(
              "flex items-center gap-2 pb-3 px-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap",
              activeTab === tab.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
          </button>
        ))}
      </div>

      {/* RELATÓRIOS PERSONALIZADOS */}
      {relatoriosPersonalizados.length > 0 && (
        <div className="shrink-0 space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold">Relatórios Personalizados</h2>
            <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">{relatoriosPersonalizados.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatoriosPersonalizados.map(rel => {
              const moduloColors: Record<string, string> = {
                vendas: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                clientes: 'bg-green-500/10 text-green-400 border-green-500/20',
                estoque: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
                financeiro: 'bg-primary/10 text-primary border-primary/20',
                whatsapp: 'bg-green-500/10 text-green-400 border-green-500/20',
              }
              const tipoIcon: Record<string, string> = { barra: '📊', linha: '📈', pizza: '🥧', area: '🌊', tabela: '📋' }
              return (
               <div key={rel.id} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 shadow-sm hover:border-primary/30 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm leading-tight">{rel.titulo}</p>
                    <button 
                      onClick={() => setRelatoriosPersonalizados(prev => prev.filter(r => r.id !== rel.id))}
                      className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold uppercase border", moduloColors[rel.modulo] || 'bg-muted text-muted-foreground border-border')}>
                      {rel.modulo}
                    </span>
                    <span className="text-xs text-muted-foreground">{tipoIcon[rel.tipo]} {rel.tipo}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">Filtro: <span className="font-semibold text-foreground/80">{rel.filtro}</span></p>
                  <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/60">
                    <span className="text-[10px] text-muted-foreground">{rel.dados} registros · {rel.criadoEm}</span>
                    <button className="px-2.5 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[10px] font-bold transition-colors">Ver</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ACTIVE TAB VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-[400px]">
        {/* CHART DISPLAY */}
        <Card className="shadow-sm border-border bg-card lg:col-span-2 flex flex-col min-h-[350px]">
          <CardHeader className="pb-1">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Painel de Desempenho - {activeTab.toUpperCase()}</span>
              <span className="text-xs font-normal text-muted-foreground">{periodo}</span>
            </CardTitle>
            <CardDescription className="text-xs">Indicadores compilados a partir de dados reais do ERP.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[280px] pt-4 relative">
            
            {activeTab === 'vendas' && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData.slice(-6)} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={val => `R$ ${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="receita" name="Valor Faturado" stroke="hsl(var(--primary))" strokeWidth={2.5} fillOpacity={1} fill="url(#colorFaturamento)" />
                </AreaChart>
              </ResponsiveContainer>
            )}

            {/* CLIENTES TAB CHART */}
            {activeTab === 'clientes' && (
              <div className="flex flex-col md:flex-row items-center justify-around h-full gap-6">
                <div className="w-full max-w-[240px] h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ReChartsPieChart>
                      <Pie
                        data={clientesPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {clientesPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </ReChartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 text-xs flex flex-col justify-center">
                  <p className="font-bold text-sm mb-2">Segmentação Comercial</p>
                  {clientesPieData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-6 justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-muted-foreground font-medium">{entry.name}</span>
                      </div>
                      <span className="font-bold">{entry.value} clientes</span>
                    </div>
                  ))}
                  {clientesPieData.length === 0 && (
                    <p className="text-muted-foreground">Sem dados de clientes.</p>
                  )}
                </div>
              </div>
            )}

            {/* ESTOQUE TAB CHART */}
            {activeTab === 'estoque' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estoqueBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="quantidade" name="Produtos" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={35}>
                    {estoqueBarData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={
                          entry.status === 'RUPTURA' ? 'hsl(var(--destructive))' :
                          entry.status === 'BAIXO' ? '#f59e0b' :
                          entry.status === 'EXCESSO' ? '#3b82f6' : '#10b981'
                        } 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeTab === 'financeiro' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.slice(-6)} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={val => `R$ ${val/1000}k`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="receita" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} barSize={16} />
                  <Bar dataKey="despesa" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* WHATSAPP TAB CHART */}
            {activeTab === 'whatsapp' && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={whatsappBarData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="conversas" name="Fila de Conversas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}

            {/* IA DIAGNOSTICS TIMELINE */}
            {activeTab === 'ia' && (
              <div className="space-y-4 max-w-xl mx-auto flex flex-col justify-center h-full">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">Relatório de Decisões Tomadas pela IA</p>
                <div className="space-y-3">
                  {[
                    { text: "Automação de ruptura de estoque no Produto Z evitou perda projetada de R$ 8.900.", active: true },
                    { text: "Campanha automática Q2 para reativação obteve 24% de conversão (R$ 48.000 faturados).", active: true },
                    { text: "Sugestão de reatribuição de chat inativo para o agente Carlos evitou perda de lead (VIP).", active: true },
                    { text: "Detecção de inadimplência preventiva no cliente prime evitou emissão de novo lote de faturamento.", active: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted/30 border border-border/80 rounded-lg text-xs">
                      <div className={cn("w-2 h-2 rounded-full shrink-0", item.active ? "bg-green-positive" : "bg-orange-alert")} />
                      <span className="font-semibold text-foreground/90">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* SIDE COLUMN: IA INSIGHTS */}
        <div className="flex flex-col gap-6">
          <Card className="shadow-md border-purple-ia/30 bg-gradient-to-br from-purple-ia/10 via-purple-ia/5 to-card relative overflow-hidden flex flex-col justify-between p-6 min-h-[350px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-ia/20 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
            
            <div className="space-y-4">
              <h3 className="text-lg font-bold flex items-center gap-2 text-purple-ia">
                <Sparkles className="w-5 h-5 animate-pulse" /> IA Magis Insight
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Clique no botão abaixo para gerar uma análise profunda dos dados correspondentes a este gráfico por meio da Magis IA, compilando pontos fracos e planos comerciais proativos.
              </p>

              {resumoIA && (
                <div className="bg-background/90 border border-purple-ia/20 p-4 rounded-xl shadow-inner text-xs leading-relaxed text-foreground animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {resumoIA}
                </div>
              )}
            </div>

            <div className="pt-6">
              <button 
                onClick={handleGerarResumoIA}
                disabled={isGerandoResumo}
                className="w-full bg-purple-ia hover:bg-purple-ia/90 text-white font-bold py-2.5 rounded-lg text-xs transition-all shadow-sm flex items-center justify-center gap-2"
              >
                {isGerandoResumo ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Analisando Dados...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" /> ✨ Resumo com IA
                  </>
                )}
              </button>
            </div>
          </Card>
        </div>
      </div>

      {/* MODAL NOVO RELATÓRIO */}
      {showNovoRelatorio && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Novo Relatório Personalizado</h2>
              <button onClick={() => setShowNovoRelatorio(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Título do Relatório</label>
                <input
                  className="w-full bg-muted/30 border border-border rounded-lg text-sm px-3 py-2.5 outline-none focus:border-primary transition-colors"
                  placeholder="Ex: Vendas por região no Q2"
                  value={novoRelTitulo}
                  onChange={e => setNovoRelTitulo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Módulo Origem</label>
                  <select
                    className="w-full bg-muted/30 border border-border rounded-lg text-xs px-3 py-2.5 outline-none"
                    value={novoRelModulo}
                    onChange={e => setNovoRelModulo(e.target.value)}
                  >
                    <option value="vendas">Vendas</option>
                    <option value="clientes">Clientes</option>
                    <option value="estoque">Estoque</option>
                    <option value="financeiro">Financeiro</option>
                    <option value="whatsapp">WhatsApp</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase text-muted-foreground">Tipo de Gráfico</label>
                  <select
                    className="w-full bg-muted/30 border border-border rounded-lg text-xs px-3 py-2.5 outline-none"
                    value={novoRelTipo}
                    onChange={e => setNovoRelTipo(e.target.value)}
                  >
                    <option value="barra">Barra</option>
                    <option value="linha">Linha</option>
                    <option value="pizza">Pizza</option>
                    <option value="area">Área</option>
                    <option value="tabela">Tabela</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase text-muted-foreground">Filtro / Condição</label>
                <input
                  className="w-full bg-muted/30 border border-border rounded-lg text-sm px-3 py-2.5 outline-none focus:border-primary transition-colors"
                  placeholder="Ex: score > 70, segmento = construção"
                  value={novoRelFiltro}
                  onChange={e => setNovoRelFiltro(e.target.value)}
                />
              </div>

              <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  A Magis IA vai gerar automaticamente os dados e a estrutura do gráfico com base no módulo e filtros selecionados.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNovoRelatorio(false)}
                className="flex-1 px-4 py-2.5 border border-border text-foreground bg-card hover:bg-muted rounded-lg text-sm font-medium"
              >Cancelar</button>
              <button
                onClick={() => {
                  if (!novoRelTitulo.trim()) return
                  const novo = {
                    id: `rp-${Date.now()}`,
                    titulo: novoRelTitulo,
                    modulo: novoRelModulo,
                    tipo: novoRelTipo,
                    filtro: novoRelFiltro || 'Todos os registros',
                    criadoEm: new Date().toLocaleDateString('pt-BR'),
                    dados: Math.floor(Math.random() * 50) + 5
                  }
                  setRelatoriosPersonalizados(prev => [novo, ...prev])
                  setShowNovoRelatorio(false)
                  setNovoRelTitulo('')
                  setNovoRelFiltro('')
                }}
                className="flex-1 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold"
              ><Sparkles className="w-4 h-4 inline mr-1" />Gerar Relatório</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
