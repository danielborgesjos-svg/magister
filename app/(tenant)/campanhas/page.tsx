"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Sparkles, Megaphone, Filter, Edit, Copy, Trash2, Send, Users, Activity, MessageCircle, DollarSign, Target, AlignLeft, ArrowRight, X } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { buscarCampanhas, criarCampanha } from "@/app/actions/campanhas"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

export default function CampanhasPage() {
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<string>("Todos")

  const [campanhas, setCampanhas] = useState<any[]>([])
  const [modalNovo, setModalNovo] = useState(false)
  const [novaCampanha, setNovaCampanha] = useState({ nome: '', descricao: '', canal: 'whatsapp', mensagemPadrao: '', contatos: 0, receitaEsperada: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    carregarCampanhas()
  }, [])

  async function carregarCampanhas() {
    const data = await buscarCampanhas()
    setCampanhas(data)
  }

  const campanhasFiltradas = campanhas.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       (c.descricao || "").toLowerCase().includes(busca.toLowerCase())
    const matchStatus = filtroStatus === "Todos" || c.status.toLowerCase() === filtroStatus.toLowerCase()
    return matchBusca && matchStatus
  })

  const campanhasSugeridas = campanhas.filter(c => c.criadaPorIA && ['rascunho', 'pronta'].includes(c.status))

  function getStatusStyle(status: string) {
    switch (status) {
      case "pronta": return "bg-blue-500/10 text-blue-500 border-blue-500/20"
      case "enviada": return "bg-purple-ia/10 text-purple-ia border-purple-ia/20"
      case "concluida": return "bg-green-positive/10 text-green-positive border-green-positive/20"
      default: return "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20"
    }
  }

  function getAvatarInitials(name: string) {
    if (!name) return "S"
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
  }

  async function handleCriarCampanha(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    await criarCampanha(novaCampanha)
    setModalNovo(false)
    setNovaCampanha({ nome: '', descricao: '', canal: 'whatsapp', mensagemPadrao: '', contatos: 0, receitaEsperada: 0 })
    setIsSubmitting(false)
    carregarCampanhas()
  }

  return (
    <div className="space-y-8 flex flex-col h-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing & Campanhas</h1>
          <p className="text-sm text-muted-foreground">Gerencie comunicações em massa e automações</p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-purple-ia/30 bg-purple-ia/10 hover:bg-purple-ia/20 text-purple-ia rounded-xl text-sm font-bold transition-all shadow-sm">
            <Sparkles className="w-4 h-4" /> Gerar com IA
          </button>
          <button onClick={() => setModalNovo(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all whitespace-nowrap">
            <Plus className="w-4 h-4" /> Nova Campanha
          </button>
        </div>
      </div>

      {/* SECTION 1: IA SUGGESTIONS */}
      {campanhasSugeridas.length > 0 && (
        <div className="space-y-4 shrink-0">
          <div className="flex items-center gap-2 text-purple-ia px-1">
            <Sparkles className="w-5 h-5" />
            <h2 className="text-lg font-bold">Sugeridas pela Magis IA</h2>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-ia/10 border border-purple-ia/20 px-2 py-0.5 rounded-md ml-2">Análise em Tempo Real</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campanhasSugeridas.map(c => (
              <Card key={c.id} className="border border-purple-ia/20 bg-purple-ia/[0.02] shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-ia to-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                <CardContent className="p-5 flex flex-col h-full relative z-10">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <h3 className="font-bold text-foreground leading-tight">{c.nome}</h3>
                    <div className="shrink-0 bg-background/80 backdrop-blur px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1 border border-border/50 shadow-sm">
                      <MessageCircle className="w-3 h-3" /> {c.canal}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground font-medium mb-4 line-clamp-2" title={c.publico}>
                    <Users className="w-3.5 h-3.5 inline mr-1 text-primary/70" /> {c.publico}
                  </p>
                  
                  <div className="bg-background/60 backdrop-blur-sm rounded-xl p-3.5 mb-4 flex-1 border border-border/50 shadow-inner">
                    <p className="text-[11px] text-foreground/80 italic line-clamp-3 relative pl-3 border-l-2 border-purple-ia/40 leading-relaxed">
                      "{c.mensagemPadrao || c.descricao}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
                    <div>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Potencial</p>
                      <p className="text-sm font-black text-green-positive mt-0.5">{formatCurrency(c.receitaEsperada)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Alcance</p>
                      <p className="text-sm font-black text-foreground mt-0.5">{c.contatos}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <button className="bg-background hover:bg-muted text-foreground text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm border border-border/80">
                      Revisar
                    </button>
                    <button className="bg-purple-ia hover:bg-purple-ia/90 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md shadow-purple-ia/20 hover:shadow-purple-ia/40 flex items-center justify-center gap-1.5 active:scale-95">
                      <Send className="w-3.5 h-3.5" /> Ativar IA
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: ALL CAMPAIGNS */}
      <div className="space-y-4 flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 px-1">
          <Megaphone className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold text-foreground">Minhas Campanhas</h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border shadow-sm shrink-0">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar campanha ou público..." 
              className="pl-9 bg-muted/50 border-transparent focus:bg-background h-10 rounded-lg"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 border border-border overflow-x-auto custom-scrollbar">
              {["Todos", "Rascunho", "Pronta", "Enviada", "Concluida"].map(s => (
                <button
                  key={s}
                  onClick={() => setFiltroStatus(s)}
                  className={cn(
                    "px-4 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap",
                    filtroStatus === s ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="flex-1 bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Nome & Público</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Status / Canal</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Desempenho</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Responsável</th>
                  <th className="px-6 py-4 font-bold tracking-wider">Criação</th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {campanhasFiltradas.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/40 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {c.criadaPorIA && <span title="Criada por IA" className="shrink-0"><Sparkles className="w-3.5 h-3.5 text-purple-ia" /></span>}
                        <p className="font-bold text-foreground truncate max-w-[250px]" title={c.nome}>{c.nome}</p>
                      </div>
                      <p className="text-[11px] font-medium text-muted-foreground truncate max-w-[250px] mt-1" title={c.descricao}>
                        <Users className="w-3 h-3 inline mr-1 opacity-70" /> {c.descricao || 'Público Geral'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase border tracking-wider", getStatusStyle(c.status))}>
                        {c.status}
                      </span>
                      <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center gap-1 font-semibold uppercase tracking-wider">
                        <MessageCircle className="w-3 h-3" /> {c.canal}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {['enviada', 'concluida'].includes(c.status) ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-4 text-[11px] font-bold text-muted-foreground">
                            <span title="Envios" className="flex items-center gap-1"><Send className="w-3 h-3"/> {c.contatos}</span>
                          </div>
                          {c.receitaGerada > 0 && (
                            <p className="font-black text-green-positive text-xs mt-1 bg-green-positive/10 inline-block px-1.5 py-0.5 rounded-md border border-green-positive/20">
                              + {formatCurrency(c.receitaGerada)}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="text-xs">
                          <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-0.5">Potencial:</p>
                          <p className="font-bold text-foreground">{formatCurrency(c.receitaEsperada)}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5 text-muted-foreground">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] border border-primary/20">
                          {getAvatarInitials('Sistema')}
                        </div>
                        <span className="text-xs font-semibold">Sistema</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-[11px] font-medium">
                      {new Date(c.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border shadow-sm" title="Editar">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors border border-transparent hover:border-border shadow-sm" title="Duplicar">
                          <Copy className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-muted-foreground hover:bg-red-alert/10 hover:text-red-alert rounded-lg transition-colors border border-transparent hover:border-red-alert/20 shadow-sm" title="Excluir">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {campanhasFiltradas.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Megaphone className="w-8 h-8 opacity-20" />
                        Nenhuma campanha encontrada com os filtros atuais.
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nova Campanha (Premium Redesign) */}
      {modalNovo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleCriarCampanha} className="bg-card w-full max-w-2xl border border-border/50 shadow-2xl rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold leading-tight">Nova Campanha</h3>
                  <p className="text-xs text-muted-foreground font-medium">Crie e configure sua automação de marketing</p>
                </div>
              </div>
              <button type="button" onClick={() => setModalNovo(false)} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Seção 1: Configuração Básica */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2">Informações da Campanha</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Target className="w-3.5 h-3.5"/> Nome da Campanha *</label>
                    <Input 
                      required 
                      placeholder="Ex: Promoção de Inverno VIP"
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm"
                      value={novaCampanha.nome} 
                      onChange={e => setNovaCampanha({...novaCampanha, nome: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Users className="w-3.5 h-3.5"/> Descrição / Público Alvo</label>
                    <Input 
                      placeholder="Ex: Clientes inativos há mais de 3 meses"
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm"
                      value={novaCampanha.descricao} 
                      onChange={e => setNovaCampanha({...novaCampanha, descricao: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Seção 2: Estimativas */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2">Estimativas (Opcional)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Activity className="w-3.5 h-3.5"/> Tamanho do Público (Contatos)</label>
                    <Input 
                      type="number" 
                      required 
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm"
                      value={novaCampanha.contatos} 
                      onChange={e => setNovaCampanha({...novaCampanha, contatos: Number(e.target.value)})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5"/> Receita Esperada (R$)</label>
                    <Input 
                      type="number" 
                      className="h-11 rounded-xl bg-background border-input focus:ring-primary/20 shadow-sm font-semibold text-green-positive"
                      value={novaCampanha.receitaEsperada} 
                      onChange={e => setNovaCampanha({...novaCampanha, receitaEsperada: Number(e.target.value)})} 
                    />
                  </div>
                </div>
              </div>

              {/* Seção 3: Mensagem */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2">Conteúdo Base</h4>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5"/> Mensagem Padrão</span>
                    <button type="button" className="text-purple-ia hover:underline flex items-center gap-1 normal-case"><Sparkles className="w-3 h-3"/> Gerar com IA</button>
                  </label>
                  <textarea 
                    placeholder="Digite a mensagem que será disparada..."
                    className="w-full flex min-h-[120px] rounded-xl border border-input bg-background px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-y custom-scrollbar"
                    value={novaCampanha.mensagemPadrao} 
                    onChange={e => setNovaCampanha({...novaCampanha, mensagemPadrao: e.target.value})} 
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3 items-center">
              <button type="button" onClick={() => setModalNovo(false)} className="px-5 py-2.5 font-bold text-sm bg-background border border-input hover:bg-muted rounded-xl transition-all shadow-sm">Cancelar</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 font-bold text-sm bg-primary text-white rounded-xl shadow-lg shadow-primary/20 transition-all hover:shadow-primary/40 hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2">
                {isSubmitting ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <ArrowRight className="w-4 h-4" />}
                {isSubmitting ? "Criando..." : "Criar Campanha"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
