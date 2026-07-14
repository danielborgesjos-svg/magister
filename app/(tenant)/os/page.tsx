"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ClipboardList, LayoutGrid, Calendar, Radio, Map,
  CheckSquare, RefreshCw, AlertOctagon, FileText, BarChart2,
  PlusCircle, AlertTriangle, Zap, CheckCircle2, Clock,
  DollarSign, TrendingUp, Bot, Search, Filter, ChevronRight,
  LayoutList, Loader2, XCircle, ServerCrash, BookOpen,
  Users, Truck, ArrowUpRight, Activity
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLayout } from "@/components/layout/LayoutProvider"
import {
  buscarKPIsOS, buscarOSCompleto,
  buscarFilaAprovacoes, buscarNaoConformidades,
  buscarRetornos, buscarModelosOS, buscarOSParaDespacho
} from "@/app/actions/os"
import AbaTecnicos from "./AbaTecnicos"
import AbaKanban from "./AbaKanban"
import AbaAgenda from "./AbaAgenda"
import AbaRotas from "./AbaRotas"
import AbaMapa from "./AbaMapa"
import AbaRelatorios from "./AbaRelatorios"

// ─── Tipos ─────────────────────────────────────────────────────────────────────
type TabId =
  | "visao_geral" | "todas" | "kanban" | "agenda"
  | "rotas"   | "mapa"  | "aprovacoes" | "retornos"
  | "nao_conformidades" | "modelos" | "relatorios" | "tecnicos"

const TABS: { id: TabId; label: string; icon: any; desc?: string }[] = [
  { id: "visao_geral",         label: "Visão Geral",         icon: Activity },
  { id: "todas",               label: "Todas as OS",         icon: LayoutList },
  { id: "kanban",              label: "Kanban",              icon: LayoutGrid },
  { id: "agenda",              label: "Agenda",              icon: Calendar },
  { id: "rotas",               label: "Rotas (Despacho)",    icon: Truck },
  { id: "tecnicos",            label: "Técnicos",            icon: Users },
  { id: "mapa",                label: "Mapa",                icon: Map },
  { id: "aprovacoes",          label: "Aprovações",          icon: CheckSquare },
  { id: "retornos",            label: "Retornos",            icon: RefreshCw },
  { id: "nao_conformidades",   label: "Não Conformidades",   icon: AlertOctagon },
  { id: "modelos",             label: "Modelos",             icon: BookOpen },
  { id: "relatorios",          label: "Relatórios",          icon: BarChart2 },
]

const STATUS_CONFIG: Record<string, { label: string; cor: string; bg: string; border: string }> = {
  rascunho:                { label: "Rascunho",          cor: "#94A3B8", bg: "bg-slate-100",   border: "border-slate-200" },
  aguardando_agendamento:  { label: "Aguardando",        cor: "#7C8399", bg: "bg-slate-100",   border: "border-slate-200" },
  agendada:                { label: "Agendada",          cor: "#3B82F6", bg: "bg-blue-50",     border: "border-blue-200" },
  reagendada:              { label: "Reagendada",        cor: "#8B5CF6", bg: "bg-violet-50",   border: "border-violet-200" },
  em_deslocamento:         { label: "Deslocamento",      cor: "#8B5CF6", bg: "bg-violet-50",   border: "border-violet-200" },
  em_execucao:             { label: "Em Execução",       cor: "#F59E0B", bg: "bg-amber-50",    border: "border-amber-200" },
  pausada:                 { label: "Pausada",           cor: "#F97316", bg: "bg-orange-50",   border: "border-orange-200" },
  aguardando_revisao:      { label: "Em Revisão",        cor: "#6D4AFF", bg: "bg-purple-50",   border: "border-purple-200" },
  concluida:               { label: "Concluída",         cor: "#22C55E", bg: "bg-emerald-50",  border: "border-emerald-200" },
  nao_conformidade:        { label: "Não Conformidade",  cor: "#EF4444", bg: "bg-red-50",      border: "border-red-200" },
  cancelada:               { label: "Cancelada",         cor: "#6B7280", bg: "bg-gray-100",    border: "border-gray-200" },
  retorno:                 { label: "Retorno",           cor: "#F59E0B", bg: "bg-amber-50",    border: "border-amber-200" },
}

const PRIORIDADE_CONFIG: Record<string, { label: string; cor: string }> = {
  critica: { label: "Crítica", cor: "#EF4444" },
  alta:    { label: "Alta",    cor: "#F97316" },
  media:   { label: "Média",   cor: "#F59E0B" },
  baixa:   { label: "Baixa",   cor: "#22C55E" },
}

// ─── Skeleton / Loading ────────────────────────────────────────────────────────
function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)} />
}

function KPICardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex items-center gap-4">
      <Skeleton className="w-11 h-11 rounded-xl" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-7 w-12" />
      </div>
    </div>
  )
}

// ─── KPI Card clicável ─────────────────────────────────────────────────────────
function KPICard({
  label, valor, icon: Icon, cor, alerta, onClick, sub
}: {
  label: string; valor: number | string; icon: any; cor: string
  alerta?: boolean; onClick?: () => void; sub?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "bg-white border rounded-2xl p-4 flex items-center gap-4 text-left w-full transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.99] group",
        alerta && valor > 0 ? "border-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.1)]" : "border-slate-200"
      )}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${cor}15` }}>
        <Icon className="w-5 h-5" style={{ color: cor }} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-[26px] font-black leading-tight mt-0.5" style={{ color: alerta && Number(valor) > 0 ? "#EF4444" : "#0D0F1A" }}>
          {valor}
        </p>
        {sub && <p className="text-[10px] text-slate-400 font-medium">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 ml-auto shrink-0 transition-colors" />
    </button>
  )
}

// ─── Error State ───────────────────────────────────────────────────────────────
function ErrorState({ mensagem, onRetry }: { mensagem: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center">
        <ServerCrash className="w-7 h-7 text-red-500" />
      </div>
      <div className="text-center">
        <p className="font-black text-slate-800 text-base">Erro ao carregar dados</p>
        <p className="text-sm text-slate-500 mt-1">{mensagem}</p>
      </div>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> Tentar novamente
        </button>
      )}
    </div>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ icone: Icon, titulo, desc, acao }: {
  icone: any; titulo: string; desc?: string; acao?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <div className="text-center">
        <p className="font-black text-slate-700 text-base">{titulo}</p>
        {desc && <p className="text-sm text-slate-500 mt-1 max-w-xs">{desc}</p>}
      </div>
      {acao}
    </div>
  )
}

// ─── ABA: VISÃO GERAL ──────────────────────────────────────────────────────────
function AbaVisaoGeral({ onFiltrarTab }: { onFiltrarTab: (tab: TabId, filtro?: string) => void }) {
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null)
    try {
      const data = await buscarKPIsOS()
      if (!data) throw new Error("Sem dados")
      setKpis(data)
    } catch (e: any) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { carregar() }, [carregar])

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => <KPICardSkeleton key={i} />)}
    </div>
  )
  if (erro) return <ErrorState mensagem={erro} onRetry={carregar} />

  const kpiItems = [
    { label: "OS Abertas",           valor: kpis.abertas,              icon: ClipboardList, cor: "#6D4AFF", tab: "todas" as TabId },
    { label: "Aguard. Agendamento",  valor: kpis.aguardandoAgendamento, icon: Clock,         cor: "#94A3B8", tab: "despacho" as TabId },
    { label: "Em Execução",          valor: kpis.emExecucao,           icon: Zap,           cor: "#F59E0B", tab: "kanban" as TabId },
    { label: "SLA em Risco",         valor: kpis.slaEmRisco,           icon: AlertTriangle, cor: "#F97316", tab: "todas" as TabId,  alerta: true },
    { label: "Atrasadas",            valor: kpis.atrasadas,            icon: XCircle,       cor: "#EF4444", tab: "todas" as TabId,  alerta: true },
    { label: "Aguard. Revisão",      valor: kpis.aguardandoRevisao,    icon: CheckSquare,   cor: "#8B5CF6", tab: "aprovacoes" as TabId },
    { label: "Concluídas",           valor: kpis.concluidas,           icon: CheckCircle2,  cor: "#22C55E", tab: "todas" as TabId },
    { label: "Não Faturadas",        valor: kpis.naoFaturadas,         icon: DollarSign,    cor: "#F59E0B", tab: "todas" as TabId,  alerta: true },
    { label: "Retornos",             valor: kpis.retornos,             icon: RefreshCw,     cor: "#F59E0B", tab: "retornos" as TabId },
    { label: "Não Conformidades",    valor: kpis.naoConformidades,     icon: AlertOctagon,  cor: "#EF4444", tab: "nao_conformidades" as TabId, alerta: true },
  ]

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {kpiItems.map((k, i) => (
          <KPICard
            key={i}
            label={k.label}
            valor={k.valor}
            icon={k.icon}
            cor={k.cor}
            alerta={k.alerta}
            onClick={() => onFiltrarTab(k.tab)}
          />
        ))}
      </div>

      {/* Alert bars */}
      <div className="space-y-2.5">
        {kpis.atrasadas > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-[13px] font-black text-red-700 flex-1">
              {kpis.atrasadas} OS com SLA vencido — ação imediata necessária
            </p>
            <button onClick={() => onFiltrarTab("kanban")} className="text-[11.5px] font-black text-red-700 bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1.5 shrink-0">
              Ver no Kanban <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {kpis.naoFaturadas > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <DollarSign className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[13px] font-black text-amber-700 flex-1">
              {kpis.naoFaturadas} OS concluídas aguardando faturamento
            </p>
            <button onClick={() => onFiltrarTab("todas")} className="text-[11.5px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1.5 shrink-0">
              Faturar <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {kpis.aguardandoAgendamento > 0 && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            <Users className="w-4 h-4 text-slate-500 shrink-0" />
            <p className="text-[13px] font-bold text-slate-600 flex-1">
              {kpis.aguardandoAgendamento} OS aguardando alocação de técnico
            </p>
            <button onClick={() => onFiltrarTab("despacho")} className="text-[11.5px] font-black text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1.5 shrink-0">
              Central de Despacho <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* JARMIS Insights */}
      <div className="bg-gradient-to-br from-violet-600/5 to-violet-500/3 border border-violet-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Bot className="w-3.5 h-3.5 text-white" />
          </div>
          <h3 className="font-black text-violet-700 text-[14px]">JARMIS — Insights Operacionais</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { texto: `Técnico com maior carga: verificar distribuição`, cor: "#F59E0B" },
            { texto: `SLA médio do período: baseado nas OS concluídas`, cor: "#22C55E" },
            { texto: `Margem operacional: calcular custo vs. receita`, cor: "#6D4AFF" },
          ].map((ins, i) => (
            <div key={i} className="bg-white border border-violet-500/15 rounded-xl p-3">
              <div className="w-1.5 h-1.5 rounded-full mb-2" style={{ backgroundColor: ins.cor }} />
              <p className="text-[12px] font-semibold text-slate-700 leading-relaxed">{ins.texto}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── ABA: TODAS AS OS ──────────────────────────────────────────────────────────
function AbaTodasOS() {
  const [dados, setDados] = useState<any>({ total: 0, paginas: 0, pagina: 1, itens: [] })
  const [loading, setLoading] = useState(true)
  const [erro, setErro] = useState<string | null>(null)
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todas")
  const [filtroPrio, setFiltroPrio] = useState("todas")
  const [pagina, setPagina] = useState(1)

  const carregar = useCallback(async () => {
    setLoading(true); setErro(null)
    try {
      const res = await buscarOSCompleto({
        busca: busca || undefined,
        status: filtroStatus !== "todas" ? filtroStatus : undefined,
        prioridade: filtroPrio !== "todas" ? filtroPrio : undefined,
        pagina,
      })
      setDados(res)
    } catch (e: any) { setErro(e.message) }
    finally { setLoading(false) }
  }, [busca, filtroStatus, filtroPrio, pagina])

  useEffect(() => { carregar() }, [carregar])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            value={busca}
            onChange={e => { setBusca(e.target.value); setPagina(1) }}
            placeholder="Buscar OS, cliente, técnico..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400 transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPagina(1) }}
            className="text-[12px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-600">
            <option value="todas">Todos os status</option>
            {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <select value={filtroPrio} onChange={e => { setFiltroPrio(e.target.value); setPagina(1) }}
            className="text-[12px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-600">
            <option value="todas">Todas prioridades</option>
            {Object.entries(PRIORIDADE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <span className="ml-auto text-[12px] font-bold text-slate-500">{dados.total} OS encontradas</span>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
          </div>
        ) : erro ? (
          <ErrorState mensagem={erro} onRetry={carregar} />
        ) : dados.itens.length === 0 ? (
          <EmptyState icone={ClipboardList} titulo="Nenhuma OS encontrada" desc="Ajuste os filtros ou crie uma nova OS." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0 backdrop-blur-sm">
                <tr>
                  {["Nº", "Cliente / Unidade", "Serviço", "Status", "Prioridade", "Técnico", "Agendada", "SLA", "Valor", "Faturamento"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-black uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.itens.map((os: any) => {
                  const st = STATUS_CONFIG[os.status] ?? STATUS_CONFIG.rascunho
                  const prio = PRIORIDADE_CONFIG[os.prioridade] ?? PRIORIDADE_CONFIG.media
                  const isAtrasada = os.prazoSLA && new Date(os.prazoSLA) < new Date() && !["concluida","cancelada"].includes(os.status)
                  return (
                    <tr key={os.id} className={cn("group hover:bg-slate-50 transition-colors cursor-pointer", isAtrasada && "bg-red-50/40")}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-[11.5px] font-bold text-slate-500 group-hover:text-slate-700">#{os.numeroOS}</span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-bold text-slate-900 leading-tight">{os.cliente?.nome}</p>
                        <p className="text-[11px] text-slate-500">{os.unidade?.nome}</p>
                      </td>
                      <td className="px-4 py-3 max-w-[160px]">
                        <p className="text-[12.5px] font-semibold text-slate-700 line-clamp-1">{os.titulo}</p>
                        <p className="text-[11px] text-slate-400">{os.tipoAtendimento}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center text-[11px] font-black px-2.5 py-1 rounded-full border", st.bg, st.border)} style={{ color: st.cor }}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${prio.cor}15`, color: prio.cor }}>
                          {prio.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-violet-100 flex items-center justify-center text-[9px] font-black text-violet-700 shrink-0">
                            {os.tecnico?.nome?.charAt(0) ?? "?"}
                          </div>
                          <span className="text-[12px] font-semibold text-slate-600 max-w-[80px] truncate">{os.tecnico?.nome ?? "—"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-[12px] font-semibold text-slate-600">
                          {os.dataAgendada ? new Date(os.dataAgendada).toLocaleDateString("pt-BR") : "—"}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {os.prazoSLA ? (
                          <span className={cn("text-[11px] font-bold", isAtrasada ? "text-red-600" : "text-slate-500")}>
                            {isAtrasada ? "Vencido" : new Date(os.prazoSLA).toLocaleDateString("pt-BR")}
                          </span>
                        ) : <span className="text-slate-400 text-[11px]">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-black text-slate-800">
                          R$ {(os.valorPrevisto ?? 0).toLocaleString("pt-BR")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn(
                          "text-[11px] font-bold px-2 py-0.5 rounded-full",
                          os.statusFaturamento === "faturada" ? "bg-green-100 text-green-700" :
                          os.statusFaturamento === "paga"     ? "bg-emerald-100 text-emerald-700" :
                          "bg-amber-100 text-amber-700"
                        )}>
                          {os.statusFaturamento === "faturada" ? "Faturada" : os.statusFaturamento === "paga" ? "Paga" : "Não Faturada"}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginação */}
      {dados.paginas > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button disabled={pagina === 1} onClick={() => setPagina(p => p - 1)}
            className="px-3 py-1.5 text-[12px] font-bold border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
            Anterior
          </button>
          <span className="text-[12px] font-bold text-slate-600">Página {pagina} de {dados.paginas}</span>
          <button disabled={pagina === dados.paginas} onClick={() => setPagina(p => p + 1)}
            className="px-3 py-1.5 text-[12px] font-bold border border-slate-200 rounded-lg disabled:opacity-40 hover:bg-slate-50 transition-colors">
            Próxima
          </button>
        </div>
      )}
    </div>
  )
}

// ─── ABA: APROVAÇÕES ───────────────────────────────────────────────────────────
function AbaAprovacoes() {
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarFilaAprovacoes().then(res => { setItens(res); setLoading(false) })
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
  if (itens.length === 0) return <EmptyState icone={CheckSquare} titulo="Nenhuma OS aguardando aprovação" desc="Todas as OS foram revisadas." />

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-bold text-slate-600">{itens.length} OS aguardando sua aprovação</p>
      </div>
      {itens.map((os: any) => (
        <div key={os.id} className="bg-white border border-violet-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[11.5px] font-bold text-slate-400">#{os.numeroOS}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${PRIORIDADE_CONFIG[os.prioridade]?.cor ?? "#94A3B8"}15`, color: PRIORIDADE_CONFIG[os.prioridade]?.cor ?? "#94A3B8" }}>
                  {PRIORIDADE_CONFIG[os.prioridade]?.label ?? os.prioridade}
                </span>
              </div>
              <p className="font-black text-slate-900 text-[14px]">{os.titulo}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">
                {os.cliente?.nome} · Técnico: {os.tecnico?.nome}
              </p>
              {os.execucao?.observacoesTecnicas && (
                <p className="text-[12px] text-slate-600 mt-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-medium line-clamp-2">
                  {os.execucao.observacoesTecnicas}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <p className="text-[13px] font-black text-slate-800">R$ {(os.valorPrevisto ?? 0).toLocaleString("pt-BR")}</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[12px] font-black rounded-xl transition-colors">
                  Recusar
                </button>
                <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-black rounded-xl transition-colors shadow-md shadow-emerald-600/20">
                  Aprovar
                </button>
              </div>
            </div>
          </div>
          {/* Progresso checklist */}
          {os.execucao?.checklistPct !== undefined && (
            <div className="mt-3 pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold text-slate-400">Checklist</span>
                <span className="text-[10px] font-black text-slate-500">{os.execucao.checklistPct}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${os.execucao.checklistPct}%` }}
                />
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── ABA: NÃO CONFORMIDADES ────────────────────────────────────────────────────
function AbaNaoConformidades() {
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarNaoConformidades().then(res => { setItens(res); setLoading(false) })
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
  if (itens.length === 0) return <EmptyState icone={AlertOctagon} titulo="Nenhuma não conformidade registrada" desc="Sistema operando sem NCs abertas." />

  const COR_GRAV: Record<string, string> = { critica: "#EF4444", alta: "#F97316", media: "#F59E0B", baixa: "#22C55E" }

  return (
    <div className="space-y-3">
      {itens.map((nc: any) => (
        <div key={nc.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${COR_GRAV[nc.gravidade] ?? "#94A3B8"}15` }}>
              <AlertOctagon className="w-5 h-5" style={{ color: COR_GRAV[nc.gravidade] ?? "#94A3B8" }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${COR_GRAV[nc.gravidade]}15`, color: COR_GRAV[nc.gravidade] ?? "#94A3B8" }}>
                  {nc.gravidade}
                </span>
                <span className="text-[10px] font-bold text-slate-400">{nc.categoria}</span>
                <span className={cn("ml-auto text-[10px] font-black px-2 py-0.5 rounded-full",
                  nc.status === "aberta" ? "bg-red-100 text-red-700" :
                  nc.status === "em_tratamento" ? "bg-amber-100 text-amber-700" :
                  "bg-emerald-100 text-emerald-700"
                )}>
                  {nc.status.replace("_", " ")}
                </span>
              </div>
              <p className="font-bold text-slate-900 text-[13px]">{nc.descricao}</p>
              <p className="text-[11.5px] text-slate-500 mt-0.5">
                OS #{nc.ordemServico?.numeroOS} — {nc.ordemServico?.cliente?.nome}
              </p>
              {nc.acaoCorretiva && (
                <p className="text-[12px] text-slate-600 mt-1.5 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 font-medium">
                  Ação: {nc.acaoCorretiva}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ABA: RETORNOS ─────────────────────────────────────────────────────────────
function AbaRetornos() {
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarRetornos().then(res => { setItens(res); setLoading(false) })
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
  if (itens.length === 0) return <EmptyState icone={RefreshCw} titulo="Nenhum retorno registrado" desc="Nenhuma OS originou um retorno ainda." />

  return (
    <div className="space-y-3">
      {itens.map((ret: any) => (
        <div key={ret.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-black text-slate-900 text-[13px]">Retorno de OS #{ret.osOrigem?.numeroOS}</p>
              <p className="text-[12px] text-slate-500">{ret.osOrigem?.cliente?.nome} · {ret.osOrigem?.titulo}</p>
              <p className="text-[12px] text-slate-600 mt-1.5 font-medium">Motivo: {ret.motivo}</p>
              <span className="text-[10px] font-bold mt-1 inline-block px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Responsabilidade: {ret.responsabilidade}
              </span>
            </div>
            <Link href={`/os/${ret.osRetorno?.id}`} className="flex items-center gap-1.5 text-[12px] font-black text-violet-700 bg-violet-50 border border-violet-200 px-3 py-1.5 rounded-lg hover:bg-violet-100 transition-colors">
              OS #{ret.osRetorno?.numeroOS} <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ABA: MODELOS ──────────────────────────────────────────────────────────────
function AbaModelos() {
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarModelosOS().then(res => { setItens(res); setLoading(false) })
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>
  if (itens.length === 0) return (
    <EmptyState icone={BookOpen} titulo="Nenhum modelo criado"
      desc="Crie templates de OS para acelerar a criação de ordens recorrentes."
      acao={<button className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-[13px] font-black hover:bg-slate-700 transition-colors"><PlusCircle className="w-4 h-4" /> Criar Modelo</button>}
    />
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {itens.map((mod: any) => (
        <div key={mod.id} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all group cursor-pointer">
          <div className="flex items-start gap-3 mb-3">
            <div className="w-9 h-9 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <BookOpen className="w-4.5 h-4.5 text-violet-700" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-slate-900 text-[13px] leading-tight">{mod.nome}</p>
              <p className="text-[11.5px] text-slate-500 font-medium">{mod.tipoAtendimento}</p>
            </div>
          </div>
          <div className="flex items-center justify-between text-[11.5px] font-bold">
            <span className="text-slate-500">SLA: {mod.prazoSLAHoras}h</span>
            <span className="text-slate-700">R$ {(mod.valorPadrao ?? 0).toLocaleString("pt-BR")}</span>
          </div>
          <button className="w-full mt-3 py-2 bg-slate-50 hover:bg-violet-50 border border-slate-200 hover:border-violet-200 text-slate-600 hover:text-violet-700 text-[12px] font-bold rounded-xl transition-all flex items-center justify-center gap-1.5">
            Usar Modelo <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── ABA: DESPACHO ─────────────────────────────────────────────────────────────
function AbaDespacho() {
  const [dados, setDados] = useState<any>({ osSemTecnico: [], tecnicos: [], veiculos: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarOSParaDespacho().then(res => { setDados(res); setLoading(false) })
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-violet-500" /></div>

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* OS aguardando */}
      <div className="lg:col-span-1 space-y-3">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <ClipboardList className="w-3.5 h-3.5" /> OS aguardando alocação
          <span className="ml-auto bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">{dados.osSemTecnico.length}</span>
        </p>
        {dados.osSemTecnico.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-[13px] font-semibold">Nenhuma OS pendente</div>
        ) : dados.osSemTecnico.map((os: any) => (
          <div key={os.id} className="bg-white border border-slate-200 rounded-xl p-3.5 hover:border-violet-300 hover:shadow-sm transition-all cursor-grab">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-full rounded-full shrink-0" style={{ backgroundColor: PRIORIDADE_CONFIG[os.prioridade]?.cor ?? "#94A3B8" }} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-[12.5px] leading-tight">{os.titulo}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">{os.cliente?.nome}</p>
                <p className="text-[10.5px] text-slate-400 mt-0.5">{os.endereco?.bairro}, {os.endereco?.cidade}</p>
              </div>
              <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full shrink-0" style={{ backgroundColor: `${PRIORIDADE_CONFIG[os.prioridade]?.cor ?? "#94A3B8"}15`, color: PRIORIDADE_CONFIG[os.prioridade]?.cor ?? "#94A3B8" }}>
                {PRIORIDADE_CONFIG[os.prioridade]?.label ?? os.prioridade}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Técnicos */}
      <div className="lg:col-span-1 space-y-3">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" /> Técnicos disponíveis
          <span className="ml-auto bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">{dados.tecnicos.length}</span>
        </p>
        {dados.tecnicos.map((tec: any) => {
          const osAtivas = tec.ordensServico?.length ?? 0
          const livre = osAtivas === 0
          return (
            <div key={tec.id} className={cn(
              "bg-white border rounded-xl p-3.5 transition-all cursor-pointer hover:shadow-sm",
              livre ? "border-emerald-200 hover:border-emerald-300" : "border-slate-200"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black", livre ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600")}>
                  {tec.nome?.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-[12.5px] leading-tight">{tec.nome}</p>
                  <p className="text-[10.5px] text-slate-500">{tec.equipe?.nome ?? "Sem equipe"}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", livre ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                    {livre ? "Livre" : `${osAtivas} OS`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Veículos */}
      <div className="lg:col-span-1 space-y-3">
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5" /> Frota disponível
          <span className="ml-auto bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-black">{dados.veiculos.length}</span>
        </p>
        {dados.veiculos.map((v: any) => {
          const emUso = v.ordensServico?.length > 0
          return (
            <div key={v.id} className={cn(
              "bg-white border rounded-xl p-3.5 transition-all",
              emUso ? "border-slate-200 opacity-60" : "border-emerald-200"
            )}>
              <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", emUso ? "bg-slate-100" : "bg-emerald-100")}>
                  <Truck className={cn("w-4.5 h-4.5", emUso ? "text-slate-500" : "text-emerald-700")} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 text-[12.5px]">{v.placa}</p>
                  <p className="text-[10.5px] text-slate-500">{v.marca} {v.modelo}</p>
                </div>
                <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", emUso ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700")}>
                  {emUso ? "Em uso" : "Livre"}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Placeholder para abas em desenvolvimento ──────────────────────────────────
function AbaEmBreve({ titulo, icone: Icon }: { titulo: string; icone: any }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center">
        <Icon className="w-8 h-8 text-violet-500" />
      </div>
      <div className="text-center">
        <p className="font-black text-slate-800 text-base">{titulo}</p>
        <p className="text-sm text-slate-500 mt-1">Esta aba será entregue na próxima fase.</p>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL — HUB ──────────────────────────────────────────────
function FieldServiceHubInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { openIAPanel, isIAPanelOpen, agentContexto } = useLayout()
  const tabParam = (searchParams.get("tab") ?? "visao_geral") as TabId
  const [tab, setTab] = useState<TabId>(tabParam)

  // Indica se o painel já está no contexto OS
  const jarmisAtivo = isIAPanelOpen && agentContexto === "os"

  const setTabNavegas = (novaTab: TabId) => {
    setTab(novaTab)
    router.push(`?tab=${novaTab}`, { scroll: false })
  }

  const handleFiltrarTab = (novaTab: TabId) => setTabNavegas(novaTab)

  const handleJarmis = () => {
    // Abre o painel global já no contexto Field Service (laranja)
    openIAPanel("os")
  }

  return (
    <div className="flex flex-col gap-5 w-full max-w-full pb-10">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: "linear-gradient(135deg,#D97706,#B45309)", boxShadow: "0 4px 14px #D9770630" }}>
              <ClipboardList className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight leading-none">Ordens de Serviço</h1>
              <p className="text-[11px] text-slate-500 font-semibold mt-0.5">Central Operacional de Field Service</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleJarmis}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-black transition-all border",
              jarmisAtivo
                ? "text-white border-amber-700 shadow-md"
                : "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
            )}
            style={jarmisAtivo ? { background: "linear-gradient(135deg,#D97706,#B45309)", boxShadow: "0 4px 14px #D9770630" } : {}}
          >
            <Bot className="w-4 h-4" />
            {jarmisAtivo ? "Agente Ativo" : "JARMIS"}
            {jarmisAtivo && <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-pulse" />}
          </button>
          <Link href="/os/nova" className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-black rounded-xl shadow-sm transition-all text-[13px]">
            <PlusCircle className="w-4 h-4" /> Nova OS
          </Link>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
        <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-xl p-1 min-w-max">
          {TABS.map(t => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTabNavegas(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap",
                  isActive
                    ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                )}
              >
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: "#D97706" } : {}} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="flex-1 min-w-0">
        <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#D97706" }} /></div>}>
          {tab === "visao_geral"       && <AbaVisaoGeral onFiltrarTab={handleFiltrarTab} />}
          {tab === "todas"             && <AbaTodasOS />}
          {tab === "kanban"            && <AbaKanban />}
          {tab === "agenda"            && <AbaAgenda />}
          {tab === "rotas"             && <AbaRotas />}
          {tab === "tecnicos"          && <AbaTecnicos />}
          {tab === "mapa"              && <AbaMapa />}
          {tab === "aprovacoes"        && <AbaAprovacoes />}
          {tab === "retornos"          && <AbaRetornos />}
          {tab === "nao_conformidades" && <AbaNaoConformidades />}
          {tab === "modelos"           && <AbaModelos />}
          {tab === "relatorios"        && <AbaRelatorios />}
        </Suspense>
      </div>
    </div>
  )
}

export default function FieldServiceHub() {
  return (
    <Suspense fallback={<div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin" style={{ color: "#D97706" }} /></div>}>
      <FieldServiceHubInner />
    </Suspense>
  )
}
