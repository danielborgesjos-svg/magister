"use client"

import { useState, useEffect } from "react"
import { Search, Plus, AlertTriangle, TrendingDown, PackageOpen, Filter, Edit, ArrowRightLeft, Package, DollarSign, Activity, Tag, Save, X, ArrowRight } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { buscarEstoque, criarProduto } from "@/app/actions/estoque"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ProdutoType = {
  id: string
  nome: string
  categoria: string
  preco: number
  custo: number
  margem: number
  estoqueAtual: number
  estoqueMinimo: number
  mediaVendaMensal: number
  scorePotencial: number
  risco: string
  status: string
  diasParado: number
}

export default function EstoquePage() {
  const [busca, setBusca] = useState("")
  const [filtroRisco, setFiltroRisco] = useState<string>("todos")
  const [produtosDB, setProdutosDB] = useState<ProdutoType[]>([])
  
  // Modal State
  const [modalNovo, setModalNovo] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [novoProduto, setNovoProduto] = useState({
    nome: '', categoria: '', preco: 0, custo: 0, estoqueAtual: 0, estoqueMinimo: 0
  })

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const data = await buscarEstoque()
    setProdutosDB(data)
  }

  const produtosFiltrados = produtosDB.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       p.categoria.toLowerCase().includes(busca.toLowerCase())
    const matchRisco = filtroRisco === "todos" || p.risco === filtroRisco
    return matchBusca && matchRisco
  })

  const rupturaCount = produtosDB.filter(p => p.risco === 'ruptura').length
  const paradosCount = produtosDB.filter(p => p.status === 'parado').length
  const capitalParado = produtosDB.filter(p => p.status === 'parado').reduce((a, p) => a + (p.estoqueAtual * p.custo), 0)

  function getRiskColor(risco: string) {
    switch (risco) {
      case 'ruptura': return { bg: 'bg-red-alert', border: 'border-red-alert/20', text: 'text-red-alert', soft: 'bg-red-alert/10' }
      case 'baixo': return { bg: 'bg-orange-alert', border: 'border-orange-alert/20', text: 'text-orange-alert', soft: 'bg-orange-alert/10' }
      case 'excesso': return { bg: 'bg-blue-500', border: 'border-blue-500/20', text: 'text-blue-500', soft: 'bg-blue-500/10' }
      case 'ok': return { bg: 'bg-green-positive', border: 'border-green-positive/20', text: 'text-green-positive', soft: 'bg-green-positive/10' }
      default: return { bg: 'bg-muted', border: 'border-border', text: 'text-muted-foreground', soft: 'bg-muted' }
    }
  }

  function getStockProgressColor(atual: number, min: number) {
    if (atual <= 0) return 'bg-red-alert'
    const ratio = atual / min
    if (ratio <= 1.2) return 'bg-red-alert'
    if (ratio <= 2) return 'bg-orange-alert'
    return 'bg-green-positive'
  }

  async function handleCriarProduto(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    await criarProduto({
      nome: novoProduto.nome,
      categoria: novoProduto.categoria,
      preco: Number(novoProduto.preco),
      custo: Number(novoProduto.custo),
      estoqueAtual: Number(novoProduto.estoqueAtual),
      estoqueMinimo: Number(novoProduto.estoqueMinimo)
    })
    setModalNovo(false)
    setNovoProduto({ nome: '', categoria: '', preco: 0, custo: 0, estoqueAtual: 0, estoqueMinimo: 0 })
    setIsSubmitting(false)
    load()
  }

  return (
    <div className="space-y-6 flex flex-col h-full relative">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Estoque</h1>
          <p className="text-sm text-muted-foreground">{produtosDB.length} itens cadastrados no inventário</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-border bg-card hover:bg-muted text-foreground rounded-xl text-sm font-bold shadow-sm transition-all active:scale-95">
            <AlertTriangle className="w-4 h-4 text-orange-alert" /> Alertas
          </button>
          <button onClick={() => setModalNovo(true)} className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" /> Novo Produto
          </button>
        </div>
      </div>

      {/* ALERT BANNERS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 shrink-0">
        {rupturaCount > 0 && (
          <div className="bg-red-alert/5 border border-red-alert/20 rounded-xl p-4 flex items-start gap-4 shadow-sm relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-alert opacity-80" />
            <div className="w-10 h-10 rounded-full bg-red-alert/10 text-red-alert flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-red-alert text-sm">{rupturaCount} produtos com risco de ruptura</h3>
              <p className="text-xs text-red-alert/80 mt-1 font-medium leading-relaxed">Estoque abaixo do mínimo. Reposição urgente recomendada para não impactar vendas.</p>
              <button 
                onClick={() => setFiltroRisco('ruptura')}
                className="mt-2 text-xs font-bold text-red-alert hover:underline flex items-center gap-1.5"
              >
                Ver produtos <ArrowRightLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
        {paradosCount > 0 && (
          <div className="bg-orange-alert/5 border border-orange-alert/20 rounded-xl p-4 flex items-start gap-4 shadow-sm relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-alert opacity-80" />
            <div className="w-10 h-10 rounded-full bg-orange-alert/10 text-orange-alert flex items-center justify-center shrink-0">
              <PackageOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-orange-alert text-sm">{paradosCount} produtos parados há &gt;90 dias</h3>
              <p className="text-xs text-orange-alert/80 mt-1 font-medium leading-relaxed">{formatCurrency(capitalParado)} imobilizados. A Magis IA sugere campanha de liquidação.</p>
              <button className="mt-2 text-xs font-bold text-orange-alert hover:underline flex items-center gap-1.5">
                Gerar campanha Inteligente <ArrowRightLeft className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm shrink-0">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por código ou nome do produto..." 
            className="pl-9 bg-muted/50 border-transparent focus:bg-background h-10 rounded-lg"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border overflow-x-auto custom-scrollbar">
            {["Todos", "Ruptura", "Baixo", "Ok", "Excesso"].map(r => (
              <button
                key={r}
                onClick={() => setFiltroRisco(r.toLowerCase())}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
                  filtroRisco === r.toLowerCase() ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-border bg-card hover:bg-muted rounded-xl text-sm font-bold shadow-sm transition-all text-muted-foreground">
            <Filter className="w-4 h-4" /> Filtros
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-x-auto flex-1 custom-scrollbar">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 font-bold tracking-wider">Produto</th>
                <th className="px-6 py-4 font-bold tracking-wider min-w-[200px]">Estoque Atual vs Mínimo</th>
                <th className="px-6 py-4 font-bold tracking-wider">Giro Mensal</th>
                <th className="px-6 py-4 font-bold tracking-wider">Situação / Risco</th>
                <th className="px-6 py-4 font-bold tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {produtosFiltrados.map((p) => {
                const riskColors = getRiskColor(p.risco)
                const isRuptura = p.risco === 'ruptura'
                const isParado = p.status === 'parado'

                return (
                  <tr 
                    key={p.id} 
                    className={cn(
                      "hover:bg-muted/40 transition-colors group",
                      isRuptura ? "bg-red-alert/[0.03] hover:bg-red-alert/5" : "",
                      isParado ? "bg-orange-alert/[0.03] hover:bg-orange-alert/5" : ""
                    )}
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground truncate max-w-[250px]" title={p.nome}>{p.nome}</p>
                      <p className="text-[11px] font-medium text-muted-foreground mt-1 flex items-center gap-1">
                        <Tag className="w-3 h-3 opacity-70"/> {p.categoria}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span className={cn("text-sm", p.estoqueAtual <= p.estoqueMinimo ? "text-red-alert font-black" : "text-foreground")}>
                            {p.estoqueAtual} <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider ml-0.5">un</span>
                          </span>
                          <span className="text-muted-foreground uppercase text-[10px] tracking-wider">Mínimo: {p.estoqueMinimo}</span>
                        </div>
                        <div className="h-2 w-full bg-muted/60 rounded-full overflow-hidden border border-border/40">
                          <div 
                            className={cn("h-full rounded-full transition-all duration-500", getStockProgressColor(p.estoqueAtual, p.estoqueMinimo))}
                            style={{ width: `${Math.min(100, Math.max(2, (p.estoqueAtual / (p.estoqueMinimo * 3)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{p.mediaVendaMensal} <span className="text-[10px] text-muted-foreground font-semibold uppercase">un/mês</span></p>
                      {isParado && <p className="text-[10px] text-orange-alert mt-1 font-bold uppercase tracking-wider">{p.diasParado} dias parado</p>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold uppercase border tracking-wider", riskColors.soft, riskColors.text, riskColors.border)}>
                        {p.risco}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors border border-transparent hover:border-primary/20 shadow-sm" title="Repor Estoque">
                          <Plus className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border shadow-sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {produtosFiltrados.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-10 h-10 opacity-20" />
                      <p className="font-medium">Nenhum produto encontrado com os filtros atuais.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL NOVO PRODUTO (PREMIUM) */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleCriarProduto} className="bg-card w-full max-w-2xl border border-border/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">Novo Produto</h3>
                  <p className="text-xs text-muted-foreground font-medium">Cadastre um item no estoque para acompanhamento</p>
                </div>
              </div>
              <button type="button" onClick={() => setModalNovo(false)} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Info Básica */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2 flex items-center gap-2"><Tag className="w-4 h-4"/> Informações Básicas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Nome do Produto *</label>
                    <Input 
                      required 
                      placeholder="Ex: Tênis Esportivo Pro X"
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm"
                      value={novoProduto.nome} 
                      onChange={e => setNovoProduto({...novoProduto, nome: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Categoria *</label>
                    <Input 
                      required
                      placeholder="Ex: Calçados, Eletrônicos..."
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm"
                      value={novoProduto.categoria} 
                      onChange={e => setNovoProduto({...novoProduto, categoria: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Financeiro */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2 flex items-center gap-2"><DollarSign className="w-4 h-4"/> Precificação</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Preço de Venda (R$) *</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      required 
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm font-bold text-foreground"
                      value={novoProduto.preco} 
                      onChange={e => setNovoProduto({...novoProduto, preco: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Custo Unitário (R$) *</label>
                    <Input 
                      type="number" 
                      step="0.01"
                      required
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm font-medium"
                      value={novoProduto.custo} 
                      onChange={e => setNovoProduto({...novoProduto, custo: Number(e.target.value)})} 
                    />
                  </div>
                </div>
              </div>

              {/* Quantidades */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2 flex items-center gap-2"><Activity className="w-4 h-4"/> Quantidades (Estoque)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Estoque Atual *</label>
                    <Input 
                      type="number" 
                      required 
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm font-bold"
                      value={novoProduto.estoqueAtual} 
                      onChange={e => setNovoProduto({...novoProduto, estoqueAtual: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Estoque Mínimo (Alerta)</label>
                    <Input 
                      type="number" 
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm font-medium text-orange-alert"
                      value={novoProduto.estoqueMinimo} 
                      onChange={e => setNovoProduto({...novoProduto, estoqueMinimo: Number(e.target.value)})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 items-center">
              <button type="button" onClick={() => setModalNovo(false)} className="px-5 py-2.5 font-bold text-sm bg-background border border-input hover:bg-muted rounded-xl transition-all shadow-sm">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save className="w-4 h-4" />}
                {isSubmitting ? "Salvando..." : "Salvar Produto"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
