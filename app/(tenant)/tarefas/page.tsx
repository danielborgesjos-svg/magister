"use client"

import { useState, useEffect } from "react"
import { Plus, X, Save, CheckSquare, Flag } from "lucide-react"
import { buscarTarefas, criarTarefa, moverTarefa } from "@/app/actions/crm"
import { cn } from "@/lib/utils"

type Tarefa = {
  id: string
  titulo: string
  descricao: string | null
  responsavel: string
  prioridade: string
  status: string
  prazo: Date | null
  origem: string
}

const COLUNAS = [
  { id: "a_fazer",      label: "A Fazer",       icon: "○", color: "text-muted-foreground", headerBg: "bg-muted/50" },
  { id: "em_andamento", label: "Em Andamento",  icon: "◐", color: "text-blue-500",          headerBg: "bg-blue-500/10" },
  { id: "aguardando",   label: "Aguardando",    icon: "◑", color: "text-orange-alert",      headerBg: "bg-orange-alert/10" },
  { id: "concluido",    label: "Concluído",     icon: "●", color: "text-green-positive",    headerBg: "bg-green-positive/10" },
]

const PRIORIDADE: Record<string, { label: string; color: string }> = {
  alta:  { label: "Alta",  color: "bg-red-alert/15 text-red-alert" },
  media: { label: "Média", color: "bg-orange-alert/15 text-orange-alert" },
  baixa: { label: "Baixa", color: "bg-muted text-muted-foreground" },
}

function formatPrazo(prazo: Date | null): { text: string; color: string } {
  if (!prazo) return { text: "Sem prazo", color: "text-muted-foreground" }
  const d = new Date(prazo)
  const hoje = new Date()
  const diffDias = Math.floor((d.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDias < 0) return { text: "Atrasado!", color: "text-red-alert font-bold" }
  if (diffDias === 0) return { text: "Hoje", color: "text-orange-alert font-bold" }
  if (diffDias === 1) return { text: "Amanhã", color: "text-orange-alert" }
  return { text: d.toLocaleDateString("pt-BR"), color: "text-muted-foreground" }
}

export default function TarefasPage() {
  const [tarefas, setTarefas] = useState<Tarefa[]>([])
  const [modalNova, setModalNova] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [nova, setNova] = useState({ titulo: "", descricao: "", responsavel: "", prioridade: "media", prazo: "" })

  const load = async () => {
    const data = await buscarTarefas()
    setTarefas(data)
  }

  useEffect(() => { load() }, [])

  const handleMover = async (id: string, novoStatus: string) => {
    await moverTarefa(id, novoStatus)
    load()
  }

  const handleCriar = async () => {
    if (!nova.titulo.trim() || !nova.responsavel.trim()) return
    setIsLoading(true)
    await criarTarefa({ titulo: nova.titulo, descricao: nova.descricao, responsavel: nova.responsavel, prioridade: nova.prioridade, prazo: nova.prazo || undefined })
    setModalNova(false)
    setNova({ titulo: "", descricao: "", responsavel: "", prioridade: "media", prazo: "" })
    setIsLoading(false)
    load()
  }

  const stats = {
    total: tarefas.length,
    hoje: tarefas.filter(t => { if (!t.prazo) return false; const d = new Date(t.prazo); const h = new Date(); return d.toDateString() === h.toDateString() }).length,
    atrasadas: tarefas.filter(t => { if (!t.prazo || t.status === "concluido") return false; return new Date(t.prazo) < new Date() }).length,
    concluidas: tarefas.filter(t => t.status === "concluido").length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tarefas</h1>
          <p className="text-sm text-muted-foreground">Organize sua operação com o time</p>
        </div>
        <button onClick={() => setModalNova(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4" /> Nova Tarefa
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Para Hoje", value: stats.hoje, color: "text-orange-alert" },
          { label: "Atrasadas", value: stats.atrasadas, color: "text-red-alert" },
          { label: "Concluídas", value: stats.concluidas, color: "text-green-positive" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUNAS.map(col => {
          const cards = tarefas.filter(t => t.status === col.id)
          return (
            <div key={col.id} className="flex flex-col gap-2">
              <div className={cn("rounded-xl p-3 flex items-center justify-between", col.headerBg)}>
                <span className={cn("text-sm font-bold flex items-center gap-2", col.color)}>
                  <span>{col.icon}</span>{col.label}
                </span>
                <span className="text-xs bg-card border border-border rounded-full px-2 py-0.5 font-bold">{cards.length}</span>
              </div>
              <div className="flex flex-col gap-2 min-h-[200px]">
                {cards.map(t => {
                  const prio = PRIORIDADE[t.prioridade] || PRIORIDADE.media
                  const prazo = formatPrazo(t.prazo)
                  const nextStatus = COLUNAS[COLUNAS.findIndex(c=>c.id===col.id)+1]?.id
                  return (
                    <div key={t.id} className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-semibold", prio.color)}>{prio.label}</span>
                        {t.origem === "ia" && <span className="text-xs bg-purple-ia/10 text-purple-ia px-2 py-0.5 rounded-full">✦ IA</span>}
                      </div>
                      <p className="font-bold text-sm text-foreground leading-snug">{t.titulo}</p>
                      {t.descricao && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.descricao}</p>}
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">{t.responsavel}</span>
                        <span className={cn("text-xs", prazo.color)}>{prazo.text}</span>
                      </div>
                      {nextStatus && col.id !== "concluido" && (
                        <button onClick={() => handleMover(t.id, nextStatus)} className="mt-3 w-full py-1.5 text-xs border border-border rounded-lg hover:bg-muted transition-colors font-medium">
                          Mover →
                        </button>
                      )}
                    </div>
                  )
                })}
                {cards.length === 0 && (
                  <div className="border-2 border-dashed border-border/40 rounded-xl p-6 text-center text-xs text-muted-foreground/40">Vazio</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {modalNova && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Nova Tarefa</h2>
              <button onClick={() => setModalNova(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Título *</label>
                <input type="text" placeholder="O que precisa ser feito?" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" value={nova.titulo} onChange={e => setNova({...nova, titulo: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Descrição</label>
                <textarea rows={2} placeholder="Detalhes..." className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none" value={nova.descricao} onChange={e => setNova({...nova, descricao: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Responsável *</label>
                <input type="text" placeholder="Nome do responsável" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none" value={nova.responsavel} onChange={e => setNova({...nova, responsavel: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Prioridade</label>
                  <select className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none" value={nova.prioridade} onChange={e => setNova({...nova, prioridade: e.target.value})}>
                    <option value="alta">Alta</option>
                    <option value="media">Média</option>
                    <option value="baixa">Baixa</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Prazo</label>
                  <input type="date" className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none" value={nova.prazo} onChange={e => setNova({...nova, prazo: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalNova(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={handleCriar} disabled={!nova.titulo.trim() || !nova.responsavel.trim() || isLoading} className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" />{isLoading ? "Salvando..." : "Criar Tarefa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
