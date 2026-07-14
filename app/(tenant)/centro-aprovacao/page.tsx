"use client"

import { useState, useEffect, useCallback } from "react"
import { CheckCircle, XCircle, Clock, Bot, Zap, AlertTriangle, BarChart2, RefreshCw, ChevronDown, ChevronUp, History } from "lucide-react"
import { buscarAcoesPendentes, buscarHistoricoAcoes, aprovarAcao, rejeitarAcao, buscarAgentLogs } from "@/app/actions/aprovacao"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const AGENTE_CONFIG: Record<string, { icon: string; color: string; bg: string }> = {
  "Agente Comercial":    { icon: "👥", color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20" },
  "Agente de Estoque":  { icon: "📦", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  "Agente Financeiro":  { icon: "💰", color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20" },
  "Magis IA":           { icon: "✨", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
}

function formatRelative(date: Date | string) {
  const d = new Date(date)
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "agora mesmo"
  if (mins < 60) return `há ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `há ${hrs}h`
  return `há ${Math.floor(hrs / 24)} dias`
}

export default function CentroAprovacaoPage() {
  const [pendentes, setPendentes] = useState<any[]>([])
  const [historico, setHistorico] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"pendentes" | "historico" | "logs">("pendentes")
  const [processing, setProcessing] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [p, h, l] = await Promise.all([
      buscarAcoesPendentes(),
      buscarHistoricoAcoes(),
      buscarAgentLogs(15)
    ])
    setPendentes(p)
    setHistorico(h)
    setLogs(l)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleAprovar = async (id: string) => {
    setProcessing(id)
    const res = await aprovarAcao(id)
    if (res.success) {
      toast.success("Ação aprovada! A IA executará em breve.")
      await load()
    } else toast.error("Erro ao aprovar ação.")
    setProcessing(null)
  }

  const handleRejeitar = async (id: string) => {
    setProcessing(id)
    const res = await rejeitarAcao(id)
    if (res.success) {
      toast.info("Ação rejeitada e arquivada.")
      await load()
    } else toast.error("Erro ao rejeitar ação.")
    setProcessing(null)
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
              <Bot className="w-5 h-5" />
            </div>
            Centro de Aprovação IA
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Ações geradas pelos agentes que requerem autorização humana antes de serem executadas.
          </p>
        </div>
        <button onClick={load} className="flex items-center gap-2 px-4 py-2 border border-border bg-card rounded-xl text-sm font-medium hover:bg-muted transition-colors">
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} /> Atualizar
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Pendentes", value: pendentes.length, icon: Clock, color: "text-yellow-400", bg: "bg-yellow-500/10" },
          { label: "Aprovadas", value: historico.filter(h => h.status === "aprovado").length, icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10" },
          { label: "Rejeitadas", value: historico.filter(h => h.status === "rejeitado").length, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Logs de IA", value: logs.length, icon: BarChart2, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map(kpi => (
          <div key={kpi.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", kpi.bg)}>
              <kpi.icon className={cn("w-5 h-5", kpi.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{kpi.label}</p>
              <p className={cn("text-2xl font-bold", kpi.color)}>{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl border border-border w-fit">
        {[
          { key: "pendentes", label: `Pendentes (${pendentes.length})` },
          { key: "historico", label: `Histórico` },
          { key: "logs", label: "Logs IA" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              activeTab === tab.key ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "pendentes" && (
        <div className="space-y-4">
          {loading && <div className="text-center py-20 text-muted-foreground">Carregando ações...</div>}
          {!loading && pendentes.length === 0 && (
            <div className="bg-card border border-border rounded-2xl p-16 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4 opacity-60" />
              <p className="text-lg font-bold text-muted-foreground">Nenhuma ação pendente</p>
              <p className="text-sm text-muted-foreground/60 mt-1">Os agentes de IA estão operando dentro dos limites de autonomia configurados.</p>
            </div>
          )}
          {pendentes.map(acao => {
            const cfg = AGENTE_CONFIG[acao.agente] || AGENTE_CONFIG["Magis IA"]
            const isExpanded = expandedId === acao.id
            const isProcessing = processing === acao.id
            let payload: any = {}
            try { payload = JSON.parse(acao.payloadJson) } catch {}

            return (
              <div key={acao.id} className={cn("bg-card border rounded-2xl overflow-hidden transition-all", cfg.bg)}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="text-2xl mt-0.5 flex-shrink-0">{cfg.icon}</div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn("text-xs font-black uppercase tracking-wider", cfg.color)}>{acao.agente}</span>
                          <span className="px-2 py-0.5 bg-yellow-500/15 text-yellow-400 border border-yellow-500/20 rounded-full text-[10px] font-bold uppercase">Nível 4 — Aprovação Manual</span>
                          <span className="text-xs text-muted-foreground">{formatRelative(acao.createdAt)}</span>
                        </div>
                        <p className="font-semibold text-foreground text-sm leading-relaxed">{acao.descricao}</p>
                        
                        {isExpanded && (
                          <div className="mt-3 p-3 bg-muted/40 rounded-xl border border-border/50">
                            <p className="text-xs font-bold text-muted-foreground uppercase mb-2">Payload da Ação</p>
                            <pre className="text-xs text-foreground/80 overflow-auto font-mono">{JSON.stringify(payload, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : acao.id)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors flex-shrink-0"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button
                      onClick={() => handleAprovar(acao.id)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-500/10 hover:bg-green-500 text-green-400 hover:text-white border border-green-500/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      <CheckCircle className="w-4 h-4" />
                      {isProcessing ? "Processando..." : "Aprovar e Executar"}
                    </button>
                    <button
                      onClick={() => handleRejeitar(acao.id)}
                      disabled={isProcessing}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeitar
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {activeTab === "historico" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          {historico.length === 0 && !loading && (
            <div className="p-16 text-center text-muted-foreground">
              <History className="w-10 h-10 mx-auto mb-3 opacity-30" />
              Nenhuma ação no histórico ainda.
            </div>
          )}
          <div className="divide-y divide-border/50">
            {historico.map(acao => {
              const cfg = AGENTE_CONFIG[acao.agente] || AGENTE_CONFIG["Magis IA"]
              const isAprovado = acao.status === "aprovado"
              return (
                <div key={acao.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                  <span className="text-xl mt-0.5">{cfg.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{acao.descricao}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{acao.agente} · {formatRelative(acao.updatedAt)}</p>
                  </div>
                  <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold uppercase border flex-shrink-0",
                    isAprovado ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                  )}>
                    {acao.status}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="p-4 border-b border-border bg-muted/20">
            <p className="text-sm font-bold flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" /> Log de Ações dos Agentes IA (Tempo Real)
            </p>
          </div>
          <div className="divide-y divide-border/50 font-mono text-xs">
            {logs.map(log => (
              <div key={log.id} className="p-3 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                <span className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", log.sucesso ? "bg-green-400" : "bg-red-400")} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-purple-400 font-bold">[{log.agente}]</span>
                    <span className="text-blue-400">{log.acao}</span>
                    <span className="text-muted-foreground">→ {log.mensagem}</span>
                  </div>
                  <p className="text-muted-foreground/60 mt-0.5">{formatRelative(log.createdAt)} · sess: {log.sessionId}</p>
                </div>
              </div>
            ))}
            {logs.length === 0 && !loading && (
              <div className="p-10 text-center text-muted-foreground">Nenhum log registrado ainda.</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
