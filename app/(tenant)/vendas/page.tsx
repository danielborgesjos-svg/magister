"use client"

import { useState, useEffect } from "react"
import { Plus, X, Save, DollarSign, TrendingUp, User, Briefcase, Calendar, Percent, Sparkles, AlertCircle } from "lucide-react"
import { buscarNegociacoes, criarNegociacao, moverNegociacao, buscarClientes } from "@/app/actions/crm"
import { formatCurrency } from "@/lib/utils"
import { cn } from "@/lib/utils"

type Negociacao = {
  id: string
  clienteId: string
  vendedor: string
  valor: number
  status: string
  probabilidade: number
  previsaoFechamento: Date | null
  tags: string | null
  cliente?: { nome: string; empresa: string | null }
}

const COLUNAS = [
  { id: "novo_lead",       label: "Novo Lead",       color: "text-slate-500 dark:text-slate-400", bg: "bg-slate-500/5",          headerBg: "bg-slate-500/10 border-slate-500/20" },
  { id: "em_atendimento",  label: "Em Atendimento",  color: "text-blue-500",          bg: "bg-blue-500/5",          headerBg: "bg-blue-500/10 border-blue-500/20" },
  { id: "orcamento",       label: "Orçamento",       color: "text-orange-alert",      bg: "bg-orange-alert/5",      headerBg: "bg-orange-alert/10 border-orange-alert/20" },
  { id: "negociacao",      label: "Negociação",      color: "text-primary",           bg: "bg-primary/5",           headerBg: "bg-primary/10 border-primary/20" },
  { id: "fechado",         label: "Fechado",         color: "text-green-positive",    bg: "bg-green-positive/5",    headerBg: "bg-green-positive/10 border-green-positive/20" },
  { id: "perdido",         label: "Perdido",         color: "text-red-alert",         bg: "bg-red-alert/5",         headerBg: "bg-red-alert/10 border-red-alert/20" },
]

export default function VendasPage() {
  const [negs, setNegs] = useState<Negociacao[]>([])
  const [clientes, setClientes] = useState<{ id: string; nome: string; empresa: string | null }[]>([])
  const [modalNova, setModalNova] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nova, setNova] = useState({ clienteId: "", vendedor: "", valor: "", status: "novo_lead", probabilidade: "50", previsaoFechamento: "" })

  const load = async () => {
    const data = await buscarNegociacoes()
    setNegs(data)
  }

  useEffect(() => {
    load()
    buscarClientes().then(setClientes)
  }, [])

  const handleMover = async (id: string, novoStatus: string) => {
    await moverNegociacao(id, novoStatus)
    load()
  }

  const handleCriar = async () => {
    if (!nova.clienteId || !nova.vendedor || !nova.valor) return
    setIsLoading(true)
    await criarNegociacao({
      clienteId: nova.clienteId,
      vendedor: nova.vendedor,
      valor: parseFloat(nova.valor),
      status: nova.status,
      probabilidade: parseInt(nova.probabilidade),
      previsaoFechamento: nova.previsaoFechamento || undefined,
    })
    setModalNova(false)
    setNova({ clienteId: "", vendedor: "", valor: "", status: "novo_lead", probabilidade: "50", previsaoFechamento: "" })
    setIsLoading(false)
    load()
  }

  const totalPipeline = negs.filter(n => !["fechado","perdido"].includes(n.status)).reduce((acc, n) => acc + n.valor, 0)
  const totalFechado = negs.filter(n => n.status === "fechado").reduce((acc, n) => acc + n.valor, 0)

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pipeline de Vendas</h1>
          <p className="text-sm text-muted-foreground">{negs.length} negociações · Pipeline: {formatCurrency(totalPipeline)}</p>
        </div>
        <button
          onClick={() => setModalNova(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95"
        >
          <Plus className="w-4 h-4" /> Nova Negociação
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Pipeline Ativo", value: formatCurrency(totalPipeline), icon: TrendingUp, color: "text-primary", bg: "bg-primary/10" },
          { label: "Fechado no Período", value: formatCurrency(totalFechado), icon: DollarSign, color: "text-green-positive", bg: "bg-green-positive/10" },
          { label: "Taxa de Conversão", value: negs.length > 0 ? `${Math.round((negs.filter(n=>n.status==="fechado").length / negs.length) * 100)}%` : "0%", icon: Percent, color: "text-orange-alert", bg: "bg-orange-alert/10" },
        ].map(k => (
          <div key={k.label} className="bg-card border border-border rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 group">
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105", k.bg, k.color)}>
              <k.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{k.label}</p>
              <p className={cn("text-2xl font-black mt-0.5", k.color)}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 custom-scrollbar">
        {COLUNAS.map(col => {
          const cards = negs.filter(n => n.status === col.id)
          const total = cards.reduce((acc, n) => acc + n.valor, 0)
          return (
            <div key={col.id} className="flex-shrink-0 w-72 flex flex-col gap-3">
              {/* Coluna Header */}
              <div className={cn("rounded-xl p-3 flex items-center justify-between border shadow-sm backdrop-blur-sm", col.headerBg)}>
                <div>
                  <p className={cn("text-xs font-bold uppercase tracking-wider", col.color)}>{col.label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5 uppercase">{formatCurrency(total)}</p>
                </div>
                <span className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold bg-background shadow-sm border border-border/50", col.color)}>{cards.length}</span>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar pr-1 pb-1">
                {cards.map(n => (
                  <div key={n.id} className={cn("bg-card border border-border/60 rounded-xl p-4 shadow-sm hover:shadow-md transition-all group relative overflow-hidden", col.bg)}>
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1 opacity-50 group-hover:opacity-100 transition-opacity", col.headerBg.split(" ")[0])} />
                    
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-bold text-sm text-foreground truncate">{n.cliente?.nome || "Cliente"}</p>
                      {n.probabilidade >= 80 && col.id !== "fechado" && (
                        <span title="Alta probabilidade" className="shrink-0"><Sparkles className="w-3.5 h-3.5 text-orange-alert" /></span>
                      )}
                    </div>
                    
                    {n.cliente?.empresa && <p className="text-[11px] font-medium text-muted-foreground flex items-center gap-1"><Briefcase className="w-3 h-3" /> {n.cliente.empresa}</p>}
                    
                    <div className="my-3 p-2 rounded-lg bg-background/50 border border-border/50">
                      <p className={cn("text-base font-black text-center", col.color)}>{formatCurrency(n.valor)}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase flex items-center gap-1"><User className="w-3 h-3" /> {n.vendedor}</span>
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold border", n.probabilidade >= 70 ? "bg-green-positive/10 text-green-positive border-green-positive/20" : n.probabilidade <= 30 ? "bg-red-alert/10 text-red-alert border-red-alert/20" : "bg-muted text-muted-foreground border-border")}>
                        {n.probabilidade}%
                      </span>
                    </div>
                    
                    {/* Ações rápidas (Hidden by default, shown on hover) */}
                    {col.id !== "fechado" && col.id !== "perdido" && (
                      <div className="mt-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {COLUNAS.filter(c => c.id !== col.id && c.id !== "perdido" && c.id !== "novo_lead").slice(0,2).map(prox => (
                          <button
                            key={prox.id}
                            onClick={() => handleMover(n.id, prox.id)}
                            className="flex-1 py-1.5 text-[10px] font-bold uppercase bg-background border border-border rounded-lg hover:bg-muted transition-colors truncate shadow-sm"
                          >→ {prox.label.split(" ")[0]}</button>
                        ))}
                        <button
                          onClick={() => handleMover(n.id, "perdido")}
                          className="py-1.5 px-2.5 text-[10px] font-bold uppercase bg-background border border-red-alert/20 text-red-alert rounded-lg hover:bg-red-alert/10 transition-colors shadow-sm"
                        >✗</button>
                      </div>
                    )}
                  </div>
                ))}
                {cards.length === 0 && (
                  <div className="border-2 border-dashed border-border/40 rounded-xl p-8 flex flex-col items-center justify-center text-muted-foreground/50 gap-2">
                    <AlertCircle className="w-6 h-6 opacity-50" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Vazio</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Nova Negociação (Premium Redesign) */}
      {modalNova && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-card border border-border/50 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground leading-tight">Nova Negociação</h2>
                  <p className="text-xs text-muted-foreground font-medium">Adicione uma nova oportunidade ao pipeline</p>
                </div>
              </div>
              <button onClick={() => setModalNova(false)} className="p-2 hover:bg-muted text-muted-foreground hover:text-foreground rounded-full transition-colors"><X className="w-5 h-5" /></button>
            </div>
            
            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Section 1: Informações Básicas */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2">Informações Iniciais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Cliente *</label>
                    <select 
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" 
                      value={nova.clienteId} 
                      onChange={e => setNova({...nova, clienteId: e.target.value})}
                    >
                      <option value="">-- Selecione um cliente cadastrado --</option>
                      {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}{c.empresa ? ` (${c.empresa})` : ""}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5"/> Vendedor Responsável *</label>
                    <input 
                      type="text" 
                      placeholder="Nome do vendedor" 
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" 
                      value={nova.vendedor} 
                      onChange={e => setNova({...nova, vendedor: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5"/> Valor da Negociação (R$) *</label>
                    <input 
                      type="number" 
                      placeholder="Ex: 5000.00" 
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm font-semibold text-primary" 
                      value={nova.valor} 
                      onChange={e => setNova({...nova, valor: e.target.value})} 
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Previsão e Status */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-border/50 pb-2">Previsão e Probabilidade</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Percent className="w-3.5 h-3.5"/> Chance de Fechar (%)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="0" max="100" step="10" 
                        className="w-full accent-primary" 
                        value={nova.probabilidade} 
                        onChange={e => setNova({...nova, probabilidade: e.target.value})} 
                      />
                      <span className="text-sm font-bold w-12 text-center bg-muted py-1 rounded-md border border-border">{nova.probabilidade}%</span>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5"/> Previsão de Fechamento</label>
                    <input 
                      type="date" 
                      className="w-full px-4 py-2.5 bg-background border border-input rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm" 
                      value={nova.previsaoFechamento} 
                      onChange={e => setNova({...nova, previsaoFechamento: e.target.value})} 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex gap-3 justify-end items-center">
              <button 
                onClick={() => setModalNova(false)} 
                className="px-5 py-2.5 border border-input bg-background hover:bg-muted text-foreground rounded-xl text-sm font-bold transition-all shadow-sm"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCriar} 
                disabled={!nova.clienteId || !nova.vendedor || !nova.valor || isLoading} 
                className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <span className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full" /> : <Save className="w-4 h-4" />}
                {isLoading ? "Salvando..." : "Criar Negociação"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
