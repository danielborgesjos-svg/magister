"use client"

import { useState } from "react"
import {
  Factory, LayoutDashboard, ClipboardList, BarChart3, Package,
  Users, Wrench, AlertTriangle, CheckCircle2, Clock, Zap,
  PlayCircle, PauseCircle, XCircle, Plus, Eye, ChevronRight,
  TrendingUp, TrendingDown, Calendar, ArrowRight, Filter, Search,
  Gauge, Layers, Timer, Target, Activity, X, Check, RefreshCw
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────
type StatusOP = "planejada" | "liberada" | "em_andamento" | "pausada" | "concluida" | "cancelada"
type Prioridade = "critica" | "alta" | "normal" | "baixa"

interface OrdemProducao {
  id: string
  numero: string
  produto: string
  familia: string
  quantidade: number
  produzido: number
  prioridade: Prioridade
  status: StatusOP
  inicio: string
  prevFim: string
  recurso: string
  turno: string
  responsavel: string
  observacoes?: string
  materiais: { nome: string; necessario: number; disponivel: number; unidade: string }[]
  etapas: { nome: string; status: "pendente" | "em_andamento" | "concluida"; duracao: string }[]
}

interface Recurso {
  id: string
  nome: string
  tipo: string
  status: "operando" | "parado" | "manutencao" | "setup"
  eficiencia: number
  turno: string
  opAtual?: string
}

interface Indicador {
  label: string
  valor: string | number
  meta: string | number
  unidade: string
  tendencia: "up" | "down" | "stable"
  cor: string
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const OPS_MOCK: OrdemProducao[] = [
  {
    id: "op1", numero: "OP-2026-0381", produto: "Válvula Hidráulica V500", familia: "Hidráulicos",
    quantidade: 200, produzido: 143, prioridade: "critica", status: "em_andamento",
    inicio: "2026-07-15", prevFim: "2026-07-17", recurso: "Prensa CNC #01", turno: "Manhã", responsavel: "Carlos Ferreira",
    observacoes: "Cliente Metalúrgica Sul aguarda entrega urgente. Não pode atrasar.",
    materiais: [
      { nome: "Aço SAE 1045", necessario: 180, disponivel: 210, unidade: "kg" },
      { nome: "O-Ring Neoprene", necessario: 400, disponivel: 380, unidade: "pc" },
      { nome: "Parafuso M10x30", necessario: 800, disponivel: 1200, unidade: "pc" },
    ],
    etapas: [
      { nome: "Usinagem CNC", status: "concluida", duracao: "4h" },
      { nome: "Tratamento Térmico", status: "concluida", duracao: "2h" },
      { nome: "Montagem", status: "em_andamento", duracao: "3h" },
      { nome: "Inspeção de Qualidade", status: "pendente", duracao: "1h" },
      { nome: "Embalagem", status: "pendente", duracao: "30min" },
    ]
  },
  {
    id: "op2", numero: "OP-2026-0380", produto: "Cilindro Pneumático CP200", familia: "Pneumáticos",
    quantidade: 100, produzido: 0, prioridade: "alta", status: "liberada",
    inicio: "2026-07-17", prevFim: "2026-07-20", recurso: "Torno CNC #02", turno: "Tarde", responsavel: "Ana Oliveira",
    materiais: [
      { nome: "Alumínio 6061", necessario: 95, disponivel: 120, unidade: "kg" },
      { nome: "Vedação Teflon", necessario: 200, disponivel: 200, unidade: "pc" },
    ],
    etapas: [
      { nome: "Torneamento", status: "pendente", duracao: "5h" },
      { nome: "Fresamento", status: "pendente", duracao: "3h" },
      { nome: "Anodização", status: "pendente", duracao: "2h" },
      { nome: "Montagem e Teste", status: "pendente", duracao: "2h" },
    ]
  },
  {
    id: "op3", numero: "OP-2026-0379", produto: "Bloco Manifold BM-08", familia: "Blocos Hidráulicos",
    quantidade: 50, produzido: 50, prioridade: "normal", status: "concluida",
    inicio: "2026-07-12", prevFim: "2026-07-15", recurso: "Centro Usinagem #01", turno: "Noite", responsavel: "Pedro Lima",
    materiais: [
      { nome: "Aço Inox 316L", necessario: 140, disponivel: 0, unidade: "kg" },
    ],
    etapas: [
      { nome: "Usinagem 5 eixos", status: "concluida", duracao: "8h" },
      { nome: "Lavagem industrial", status: "concluida", duracao: "1h" },
      { nome: "Teste de pressão", status: "concluida", duracao: "2h" },
    ]
  },
  {
    id: "op4", numero: "OP-2026-0382", produto: "Bomba Engrenagem BE-12", familia: "Bombas",
    quantidade: 30, produzido: 8, prioridade: "alta", status: "pausada",
    inicio: "2026-07-16", prevFim: "2026-07-19", recurso: "Prensa CNC #02", turno: "Manhã", responsavel: "Roberto Gomes",
    observacoes: "Parado aguardando reposição de rolamento SKF 6205.",
    materiais: [
      { nome: "Engrenagem Hel. Z-24", necessario: 60, disponivel: 60, unidade: "pc" },
      { nome: "Rolamento SKF 6205", necessario: 60, disponivel: 10, unidade: "pc" },
      { nome: "Carcaça Fundida", necessario: 30, disponivel: 30, unidade: "pc" },
    ],
    etapas: [
      { nome: "Usinagem carcaça", status: "concluida", duracao: "3h" },
      { nome: "Montagem engrenagens", status: "em_andamento", duracao: "4h" },
      { nome: "Teste de vazão", status: "pendente", duracao: "2h" },
      { nome: "Pintura e acabamento", status: "pendente", duracao: "1h" },
    ]
  },
  {
    id: "op5", numero: "OP-2026-0383", produto: "Filtro de Linha FL-100", familia: "Filtragem",
    quantidade: 500, produzido: 0, prioridade: "normal", status: "planejada",
    inicio: "2026-07-22", prevFim: "2026-07-28", recurso: "Linha Montagem A", turno: "Manhã", responsavel: "Juliana Costa",
    materiais: [
      { nome: "Carcaça PP Injetada", necessario: 500, disponivel: 650, unidade: "pc" },
      { nome: "Elemento Filtrante", necessario: 500, disponivel: 300, unidade: "pc" },
    ],
    etapas: [
      { nome: "Montagem do filtro", status: "pendente", duracao: "6h" },
      { nome: "Teste de estanqueidade", status: "pendente", duracao: "2h" },
      { nome: "Embalagem a vácuo", status: "pendente", duracao: "2h" },
    ]
  },
  {
    id: "op6", numero: "OP-2026-0384", produto: "Acoplamento Elástico AE-50", familia: "Acoplamentos",
    quantidade: 150, produzido: 60, prioridade: "baixa", status: "em_andamento",
    inicio: "2026-07-14", prevFim: "2026-07-18", recurso: "Torno CNC #01", turno: "Tarde", responsavel: "Marcos Alves",
    materiais: [
      { nome: "Borracha NR 70 Shore", necessario: 30, disponivel: 45, unidade: "kg" },
      { nome: "Flange Aço 1020", necessario: 300, disponivel: 300, unidade: "pc" },
    ],
    etapas: [
      { nome: "Vulcanização", status: "concluida", duracao: "4h" },
      { nome: "Torneamento flanges", status: "em_andamento", duracao: "5h" },
      { nome: "Balanceamento dinâmico", status: "pendente", duracao: "2h" },
    ]
  },
]

const RECURSOS_MOCK: Recurso[] = [
  { id: "r1", nome: "Prensa CNC #01", tipo: "Prensa Hidráulica", status: "operando", eficiencia: 87, turno: "Manhã", opAtual: "OP-2026-0381" },
  { id: "r2", nome: "Prensa CNC #02", tipo: "Prensa Hidráulica", status: "parado", eficiencia: 0, turno: "Manhã", opAtual: "OP-2026-0382" },
  { id: "r3", nome: "Torno CNC #01", tipo: "Torno CNC", status: "operando", eficiencia: 92, turno: "Tarde", opAtual: "OP-2026-0384" },
  { id: "r4", nome: "Torno CNC #02", tipo: "Torno CNC", status: "setup", eficiencia: 0, turno: "Tarde", opAtual: "OP-2026-0380" },
  { id: "r5", nome: "Centro Usinagem #01", tipo: "Centro de Usinagem", status: "manutencao", eficiencia: 0, turno: "—" },
  { id: "r6", nome: "Linha Montagem A", tipo: "Linha de Montagem", status: "operando", eficiencia: 78, turno: "Manhã" },
  { id: "r7", nome: "Linha Montagem B", tipo: "Linha de Montagem", status: "operando", eficiencia: 95, turno: "Tarde" },
  { id: "r8", nome: "Forno Tratamento", tipo: "Forno Industrial", status: "operando", eficiencia: 100, turno: "Contínuo" },
]

const INDICADORES: Indicador[] = [
  { label: "OEE Geral", valor: 74.3, meta: 85, unidade: "%", tendencia: "up", cor: "amber" },
  { label: "Eficiência", valor: 81.2, meta: 90, unidade: "%", tendencia: "up", cor: "blue" },
  { label: "Disponibilidade", valor: 88.5, meta: 95, unidade: "%", tendencia: "down", cor: "purple" },
  { label: "Qualidade (FPY)", valor: 97.1, meta: 99, unidade: "%", tendencia: "stable", cor: "emerald" },
  { label: "Setup Médio", valor: "42 min", meta: "30 min", unidade: "", tendencia: "down", cor: "orange" },
  { label: "OPs no Prazo", valor: 83, meta: 95, unidade: "%", tendencia: "up", cor: "green" },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR")
const progresso = (prod: number, total: number) => Math.round((prod / total) * 100)

const STATUS_OP_CFG: Record<StatusOP, { label: string; bg: string; text: string; icon: React.ReactNode; border: string }> = {
  planejada:    { label: "Planejada",    bg: "bg-slate-100",   text: "text-slate-600",   icon: <Calendar className="w-3.5 h-3.5" />,    border: "border-slate-200" },
  liberada:     { label: "Liberada",     bg: "bg-blue-100",    text: "text-blue-700",    icon: <PlayCircle className="w-3.5 h-3.5" />,   border: "border-blue-200" },
  em_andamento: { label: "Em Andamento", bg: "bg-amber-100",   text: "text-amber-700",   icon: <Zap className="w-3.5 h-3.5" />,          border: "border-amber-200" },
  pausada:      { label: "Pausada",      bg: "bg-orange-100",  text: "text-orange-700",  icon: <PauseCircle className="w-3.5 h-3.5" />, border: "border-orange-200" },
  concluida:    { label: "Concluída",    bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="w-3.5 h-3.5" />, border: "border-emerald-200" },
  cancelada:    { label: "Cancelada",    bg: "bg-red-100",     text: "text-red-700",     icon: <XCircle className="w-3.5 h-3.5" />,      border: "border-red-200" },
}

const PRIORIDADE_CFG: Record<Prioridade, { label: string; bg: string; text: string; dot: string }> = {
  critica: { label: "Crítica", bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
  alta:    { label: "Alta",    bg: "bg-orange-100", text: "text-orange-700", dot: "bg-orange-400" },
  normal:  { label: "Normal",  bg: "bg-blue-100", text: "text-blue-600", dot: "bg-blue-400" },
  baixa:   { label: "Baixa",   bg: "bg-slate-100", text: "text-slate-500", dot: "bg-slate-300" },
}

const RECURSO_STATUS: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  operando:    { label: "Operando",   bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  parado:      { label: "Parado",     bg: "bg-red-100",     text: "text-red-700",     dot: "bg-red-500" },
  manutencao:  { label: "Manutenção", bg: "bg-amber-100",   text: "text-amber-700",   dot: "bg-amber-400" },
  setup:       { label: "Setup",      bg: "bg-blue-100",    text: "text-blue-600",    dot: "bg-blue-400" },
}

const TABS = [
  { id: "dashboard", label: "Dashboard PCP", icon: LayoutDashboard },
  { id: "ops", label: "Ordens de Produção", icon: ClipboardList },
  { id: "chao", label: "Chão de Fábrica", icon: Factory },
  { id: "indicadores", label: "Indicadores OEE", icon: BarChart3 },
  { id: "materiais", label: "Materiais (MRP)", icon: Package },
]

// ─── Dashboard Tab ─────────────────────────────────────────────────────────────
function DashboardTab({ ops }: { ops: OrdemProducao[] }) {
  const criticas = ops.filter(o => o.prioridade === "critica" && o.status !== "concluida")
  const pausadas = ops.filter(o => o.status === "pausada")
  const andamento = ops.filter(o => o.status === "em_andamento")
  const filaHoje = ops.filter(o => o.status === "liberada")

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "OPs em Andamento", val: andamento.length, sub: "Produção ativa agora", color: "amber", icon: Zap },
          { label: "Aguardando Início", val: filaHoje.length, sub: "Fila liberada", color: "blue", icon: PlayCircle },
          { label: "Críticas / Atrasadas", val: criticas.length, sub: "Requer atenção imediata", color: "red", icon: AlertTriangle },
          { label: "Pausadas", val: pausadas.length, sub: "Aguardando resolução", color: "orange", icon: PauseCircle },
        ].map(k => (
          <div key={k.label} className={cn("bg-card border rounded-2xl p-5", `border-${k.color}-200`)}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-muted-foreground font-medium">{k.label}</p>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", `bg-${k.color}-100`)}>
                <k.icon className={cn("w-4 h-4", `text-${k.color}-600`)} />
              </div>
            </div>
            <p className={cn("text-4xl font-black", `text-${k.color}-700`)}>{k.val}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Alertas */}
      {(criticas.length > 0 || pausadas.length > 0) && (
        <div className="space-y-2">
          {criticas.map(op => (
            <div key={op.id} className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm text-red-800">{op.numero} — {op.produto}</p>
                <p className="text-xs text-red-600 mt-0.5">{op.observacoes || `Prioridade Crítica. Previsão: ${fmtDate(op.prevFim)}`}</p>
              </div>
              <span className="text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-lg">{op.recurso}</span>
            </div>
          ))}
          {pausadas.map(op => (
            <div key={op.id} className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
              <PauseCircle className="w-5 h-5 text-orange-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm text-orange-800">{op.numero} — {op.produto}</p>
                <p className="text-xs text-orange-600 mt-0.5">{op.observacoes || "Parada aguardando resolução."}</p>
              </div>
              <span className="text-xs font-semibold text-orange-700 bg-orange-100 px-2 py-1 rounded-lg">{op.recurso}</span>
            </div>
          ))}
        </div>
      )}

      {/* OPs em andamento com progresso */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Produção em Tempo Real</h3>
        <div className="space-y-4">
          {andamento.map(op => {
            const pct = progresso(op.produzido, op.quantidade)
            return (
              <div key={op.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <div>
                    <span className="font-bold text-sm">{op.produto}</span>
                    <span className="text-xs text-muted-foreground ml-2">· {op.numero} · {op.recurso}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{op.produzido}/{op.quantidade} un</span>
                    <span className={cn("text-xs font-bold", pct >= 80 ? "text-emerald-600" : pct >= 40 ? "text-amber-600" : "text-red-600")}>{pct}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn("h-2.5 rounded-full transition-all", pct >= 80 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-red-500")}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{op.responsavel} · Turno: {op.turno}</span>
                  <span className="text-xs text-muted-foreground">Prev. conclusão: {fmtDate(op.prevFim)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Gantt simplificado — Linha do tempo */}
      <div className="bg-card border border-border rounded-2xl p-5">
        <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Cronograma da Semana (Gantt)</h3>
        <div className="overflow-x-auto">
          <div className="min-w-[700px]">
            {/* Header dias */}
            <div className="flex mb-2">
              <div className="w-48 flex-shrink-0" />
              {["Seg 14", "Ter 15", "Qua 16", "Qui 17", "Sex 18", "Sáb 19", "Dom 20"].map(d => (
                <div key={d} className="flex-1 text-center text-xs text-muted-foreground font-semibold border-l border-border py-1">{d}</div>
              ))}
            </div>
            {ops.filter(o => o.status !== "cancelada").map((op, i) => {
              const cfg = STATUS_OP_CFG[op.status]
              const startDay = new Date(op.inicio).getDay() || 7
              const endDay = new Date(op.prevFim).getDay() || 7
              const startOffset = Math.max(0, startDay - 1)
              const span = Math.max(1, endDay - startDay + 1)
              return (
                <div key={op.id} className="flex items-center mb-2">
                  <div className="w-48 flex-shrink-0 pr-3">
                    <p className="text-xs font-semibold truncate">{op.produto}</p>
                    <p className="text-xs text-muted-foreground truncate">{op.numero}</p>
                  </div>
                  <div className="flex flex-1 relative h-8">
                    {[0,1,2,3,4,5,6].map(d => <div key={d} className="flex-1 border-l border-border/50" />)}
                    <div
                      className={cn("absolute top-1 h-6 rounded-lg flex items-center px-2 gap-1 text-xs font-bold", cfg.bg, cfg.text)}
                      style={{ left: `${(startOffset / 7) * 100}%`, width: `${(span / 7) * 100}%` }}
                    >
                      <span className="truncate">{op.produto}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── OPs Tab ───────────────────────────────────────────────────────────────────
function OPsTab({ ops, onVerOP }: { ops: OrdemProducao[]; onVerOP: (op: OrdemProducao) => void }) {
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState<StatusOP | "todos">("todos")
  const [filtroPrioridade, setFiltroPrioridade] = useState<Prioridade | "todos">("todos")

  const filtradas = ops.filter(op =>
    (filtroStatus === "todos" || op.status === filtroStatus) &&
    (filtroPrioridade === "todos" || op.prioridade === filtroPrioridade) &&
    (op.produto.toLowerCase().includes(busca.toLowerCase()) || op.numero.toLowerCase().includes(busca.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar OP ou produto..."
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap bg-muted/50 p-1 rounded-xl">
          {(["todos", "planejada", "liberada", "em_andamento", "pausada", "concluida"] as const).map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)} className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap", filtroStatus === s ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              {s === "todos" ? "Todas" : STATUS_OP_CFG[s]?.label}
            </button>
          ))}
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Nova OP
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {["Nº OP", "Produto / Família", "Quantidade", "Progresso", "Recurso", "Previsão", "Prioridade", "Status", ""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtradas.map(op => {
              const pct = progresso(op.produzido, op.quantidade)
              const sCfg = STATUS_OP_CFG[op.status]
              const pCfg = PRIORIDADE_CFG[op.prioridade]
              return (
                <tr key={op.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer" onClick={() => onVerOP(op)}>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground font-semibold">{op.numero}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm">{op.produto}</p>
                    <p className="text-xs text-muted-foreground">{op.familia}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{op.produzido}/{op.quantidade} un</td>
                  <td className="px-4 py-3 min-w-[120px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-muted rounded-full">
                        <div className={cn("h-2 rounded-full", pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400")} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{op.recurso}</td>
                  <td className="px-4 py-3 text-sm">{fmtDate(op.prevFim)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full w-fit", pCfg.bg, pCfg.text)}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", pCfg.dot)} /> {pCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full w-fit", sCfg.bg, sCfg.text)}>
                      {sCfg.icon} {sCfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtradas.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">
            <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-20" /> Nenhuma OP encontrada.
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Chão de Fábrica Tab ───────────────────────────────────────────────────────
function ChaoFabricaTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Máquinas Operando", val: RECURSOS_MOCK.filter(r => r.status === "operando").length, total: RECURSOS_MOCK.length, color: "emerald" },
          { label: "Em Manutenção", val: RECURSOS_MOCK.filter(r => r.status === "manutencao").length, total: RECURSOS_MOCK.length, color: "amber" },
          { label: "Em Setup", val: RECURSOS_MOCK.filter(r => r.status === "setup").length, total: RECURSOS_MOCK.length, color: "blue" },
          { label: "Paradas", val: RECURSOS_MOCK.filter(r => r.status === "parado").length, total: RECURSOS_MOCK.length, color: "red" },
        ].map(k => (
          <div key={k.label} className={cn("bg-card border rounded-2xl p-4", `border-${k.color}-200`)}>
            <p className={cn("text-xs font-semibold mb-2", `text-${k.color}-600`)}>{k.label}</p>
            <p className={cn("text-3xl font-black", `text-${k.color}-700`)}>{k.val}<span className="text-base text-muted-foreground font-normal">/{k.total}</span></p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {RECURSOS_MOCK.map(r => {
          const cfg = RECURSO_STATUS[r.status]
          return (
            <div key={r.id} className={cn("bg-card border rounded-2xl p-4 flex flex-col gap-3", cfg.text.includes("emerald") ? "border-emerald-200" : cfg.text.includes("red") ? "border-red-200" : cfg.text.includes("amber") ? "border-amber-200" : "border-blue-200")}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-sm">{r.nome}</p>
                  <p className="text-xs text-muted-foreground">{r.tipo}</p>
                </div>
                <span className={cn("flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full", cfg.bg, cfg.text)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", cfg.dot)} />
                  {cfg.label}
                </span>
              </div>

              {/* OEE gauge */}
              {r.status === "operando" && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Eficiência</span>
                    <span className="font-bold text-emerald-600">{r.eficiencia}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full">
                    <div className="h-2 bg-emerald-500 rounded-full transition-all" style={{ width: `${r.eficiencia}%` }} />
                  </div>
                </div>
              )}

              <div className="space-y-1 text-xs">
                {r.turno !== "—" && <div className="flex justify-between"><span className="text-muted-foreground">Turno</span><span className="font-semibold">{r.turno}</span></div>}
                {r.opAtual && <div className="flex justify-between"><span className="text-muted-foreground">OP Atual</span><span className="font-mono font-semibold text-primary">{r.opAtual}</span></div>}
              </div>

              {r.status === "manutencao" && (
                <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2 flex items-center gap-1.5">
                  <Wrench className="w-3 h-3" /> Manutenção preventiva em curso
                </div>
              )}
              {r.status === "parado" && (
                <div className="text-xs text-red-700 bg-red-50 rounded-lg p-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3" /> Parada por falta de material
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Indicadores Tab ───────────────────────────────────────────────────────────
function IndicadoresTab() {
  const turnos = ["Manhã", "Tarde", "Noite"]
  const semanas = ["Semana 26", "Semana 27", "Semana 28", "Semana 29"]
  const mockOEE = [71.2, 74.8, 72.1, 74.3]

  return (
    <div className="space-y-6">
      {/* OEE Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {INDICADORES.map(ind => {
          const isNum = typeof ind.valor === "number"
          const pct = isNum ? (ind.valor as number) : null
          return (
            <div key={ind.label} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-muted-foreground font-medium">{ind.label}</p>
                {ind.tendencia === "up" ? <TrendingUp className="w-4 h-4 text-emerald-500" /> :
                  ind.tendencia === "down" ? <TrendingDown className="w-4 h-4 text-red-500" /> :
                  <Activity className="w-4 h-4 text-amber-500" />}
              </div>
              <p className="text-3xl font-black text-foreground">{ind.valor}{ind.unidade}</p>
              <p className="text-xs text-muted-foreground mt-1">Meta: {ind.meta}{ind.unidade}</p>
              {pct && (
                <div className="mt-3">
                  <div className="h-2 bg-muted rounded-full">
                    <div
                      className={cn("h-2 rounded-full transition-all", pct >= (ind.meta as number) ? "bg-emerald-500" : pct >= (ind.meta as number) * 0.9 ? "bg-amber-400" : "bg-red-400")}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* OEE por turno */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /> OEE por Turno</h3>
          <div className="space-y-4">
            {[
              { turno: "Manhã", oee: 81.4, disponib: 92, efic: 88, qual: 98.5 },
              { turno: "Tarde", oee: 74.3, disponib: 87, efic: 84, qual: 97.1 },
              { turno: "Noite", oee: 68.2, disponib: 79, efic: 80, qual: 96.8 },
            ].map(t => (
              <div key={t.turno}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold">{t.turno}</span>
                  <span className={cn("text-sm font-black", t.oee >= 80 ? "text-emerald-600" : t.oee >= 70 ? "text-amber-600" : "text-red-600")}>{t.oee}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                  <div className="h-3 bg-emerald-500" style={{ width: `${t.disponib * t.efic * t.qual / 10000}%` }} />
                </div>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Disp: {t.disponib}%</span>
                  <span>Efic: {t.efic}%</span>
                  <span>Qual: {t.qual}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /> OEE Semanal (Tendência)</h3>
          <div className="flex items-end gap-4 h-40">
            {semanas.map((s, i) => {
              const h = mockOEE[i]
              return (
                <div key={s} className="flex-1 flex flex-col items-center gap-1">
                  <span className={cn("text-xs font-bold", h >= 80 ? "text-emerald-600" : "text-amber-600")}>{h}%</span>
                  <div className="w-full rounded-t-lg" style={{ height: `${(h / 100) * 120}px`, background: h >= 80 ? "#10b981" : h >= 70 ? "#f59e0b" : "#ef4444" }} />
                  <span className="text-xs text-muted-foreground">{s.split(" ")[1]}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground border-t border-border pt-3">
            <span className="w-3 h-3 rounded bg-emerald-500" /> ≥80% | <span className="w-3 h-3 rounded bg-amber-400" /> ≥70% | <span className="w-3 h-3 rounded bg-red-400" /> &lt;70%
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Materiais Tab ─────────────────────────────────────────────────────────────
function MateriaisTab({ ops }: { ops: OrdemProducao[] }) {
  type AlertaMat = { material: string; op: string; produto: string; necessario: number; disponivel: number; unidade: string; criticidade: "critica" | "baixa" }
  const alertasMateriais: AlertaMat[] = ops.flatMap(op =>
    op.materiais
      .filter(m => m.disponivel < m.necessario)
      .map(m => ({
        material: m.nome,
        op: op.numero,
        produto: op.produto,
        necessario: m.necessario,
        disponivel: m.disponivel,
        unidade: m.unidade,
        criticidade: op.prioridade === "critica" || op.prioridade === "alta" ? "critica" : "baixa" as "critica" | "baixa"
      }))
  )

  const allMateriais = ops.flatMap(op =>
    op.materiais.map(m => ({ ...m, op: op.numero, produto: op.produto }))
  )

  return (
    <div className="space-y-6">
      {alertasMateriais.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-4 h-4" /> Ruptura de Materiais — {alertasMateriais.length} item(s) em falta
          </h3>
          <div className="space-y-2">
            {alertasMateriais.map((a, i) => {
              const faltando = a.necessario - a.disponivel
              return (
                <div key={i} className={cn("flex items-center gap-4 p-3 rounded-xl border", a.criticidade === "critica" ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200")}>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{a.material}</p>
                    <p className="text-xs text-muted-foreground">{a.op} — {a.produto}</p>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-semibold text-red-700">Faltam {faltando} {a.unidade}</p>
                    <p className="text-xs text-muted-foreground">Disp: {a.disponivel} | Nec: {a.necessario}</p>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">
                    <Plus className="w-3 h-3" /> Solicitar Compra
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold text-sm flex items-center gap-2"><Layers className="w-4 h-4 text-primary" /> Necessidades de Materiais (MRP)</h3>
        </div>
        <table className="w-full">
          <thead className="bg-muted/30 border-b border-border">
            <tr>
              {["Material", "OP / Produto", "Necessário", "Disponível", "Saldo", "Status"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allMateriais.map((m, i) => {
              const saldo = m.disponivel - m.necessario
              const ok = saldo >= 0
              return (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-semibold text-sm">{m.nome}</td>
                  <td className="px-4 py-3">
                    <p className="text-xs font-mono text-muted-foreground">{m.op}</p>
                    <p className="text-xs text-foreground">{m.produto}</p>
                  </td>
                  <td className="px-4 py-3 text-sm">{m.necessario} {m.unidade}</td>
                  <td className="px-4 py-3 text-sm">{m.disponivel} {m.unidade}</td>
                  <td className="px-4 py-3">
                    <span className={cn("font-bold text-sm", ok ? "text-emerald-600" : "text-red-600")}>
                      {ok ? "+" : ""}{saldo} {m.unidade}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-xs font-bold px-2 py-1 rounded-full", ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
                      {ok ? "✓ OK" : "⚠ Ruptura"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Modal Detalhes OP ─────────────────────────────────────────────────────────
function ModalOP({ op, onClose }: { op: OrdemProducao; onClose: () => void }) {
  const pct = progresso(op.produzido, op.quantidade)
  const sCfg = STATUS_OP_CFG[op.status]
  const pCfg = PRIORIDADE_CFG[op.prioridade]

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Factory className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-black text-lg">{op.numero}</h2>
              <p className="text-sm text-muted-foreground">{op.produto} · {op.familia}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl", sCfg.bg, sCfg.text)}>{sCfg.icon} {sCfg.label}</span>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl"><X className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Progresso */}
          <div className="bg-muted/30 rounded-2xl p-4">
            <div className="flex justify-between mb-2">
              <span className="text-sm font-bold">Progresso da Ordem</span>
              <span className="font-black text-lg text-primary">{pct}%</span>
            </div>
            <div className="h-4 bg-muted rounded-full overflow-hidden">
              <div className={cn("h-4 rounded-full transition-all", pct >= 100 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-400")} style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
              <span>{op.produzido} produzidos</span>
              <span>{op.quantidade - op.produzido} restantes</span>
              <span>Total: {op.quantidade} un</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Dados */}
            <div className="bg-muted/30 rounded-2xl p-4 space-y-2">
              <h3 className="font-bold text-sm border-b border-border pb-2">Dados da OP</h3>
              {[
                ["Recurso", op.recurso], ["Turno", op.turno], ["Responsável", op.responsavel],
                ["Início", fmtDate(op.inicio)], ["Prev. Fim", fmtDate(op.prevFim)],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-semibold">{v}</span></div>
              ))}
              <div className="flex justify-between text-sm pt-1 border-t border-border">
                <span className="text-muted-foreground">Prioridade</span>
                <span className={cn("flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full", pCfg.bg, pCfg.text)}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", pCfg.dot)} />{pCfg.label}
                </span>
              </div>
            </div>

            {/* Materiais */}
            <div className="bg-muted/30 rounded-2xl p-4">
              <h3 className="font-bold text-sm border-b border-border pb-2 mb-2">Materiais</h3>
              <div className="space-y-2">
                {op.materiais.map((m, i) => {
                  const ok = m.disponivel >= m.necessario
                  return (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-foreground truncate max-w-[130px]">{m.nome}</span>
                      <span className={cn("font-bold", ok ? "text-emerald-600" : "text-red-600")}>
                        {m.disponivel}/{m.necessario} {m.unidade}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Etapas */}
          <div className="bg-card border border-border rounded-2xl p-4">
            <h3 className="font-bold text-sm mb-4">Roteiro de Produção</h3>
            <div className="flex items-center gap-0 overflow-x-auto pb-2">
              {op.etapas.map((etapa, i) => (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-1 min-w-[100px]">
                    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs",
                      etapa.status === "concluida" ? "bg-emerald-500 text-white" :
                      etapa.status === "em_andamento" ? "bg-amber-500 text-white animate-pulse" :
                      "bg-muted text-muted-foreground"
                    )}>
                      {etapa.status === "concluida" ? <Check className="w-4 h-4" /> :
                       etapa.status === "em_andamento" ? <Zap className="w-3 h-3" /> :
                       i + 1}
                    </div>
                    <p className="text-xs font-semibold text-center leading-tight">{etapa.nome}</p>
                    <p className="text-xs text-muted-foreground">{etapa.duracao}</p>
                  </div>
                  {i < op.etapas.length - 1 && (
                    <div className={cn("w-8 h-0.5 flex-shrink-0", etapa.status === "concluida" ? "bg-emerald-500" : "bg-muted")} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {op.observacoes && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3" /> Observações</p>
              <p className="text-sm text-amber-800">{op.observacoes}</p>
            </div>
          )}

          {/* JARMIS */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4">
            <p className="text-xs font-bold text-purple-700 mb-1.5 flex items-center gap-1.5"><span>✦</span> JARMIS PCP Sugere</p>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {op.status === "pausada"
                ? `OP pausada por falta de material. Acione ordem de compra emergencial para ${op.materiais.find(m => m.disponivel < m.necessario)?.nome || "itens críticos"} para retomar hoje.`
                : op.status === "em_andamento" && pct < 50
                ? `Progresso abaixo de 50%. Considere verificar o setup do recurso ${op.recurso} ou realocar operadores para acelerar a entrega.`
                : `OP em bom andamento. Previsão de conclusão: ${fmtDate(op.prevFim)}.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function ProducaoPCPPage() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [opSelecionada, setOpSelecionada] = useState<OrdemProducao | null>(null)

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
            <Factory className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">PCP — Planejamento e Controle de Produção</h1>
            <p className="text-sm text-muted-foreground">Ordens · Chão de Fábrica · OEE · Materiais (MRP)</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">
            <RefreshCw className="w-4 h-4" /> Atualizar
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-700">Linha Ativa</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-muted/50 p-1 rounded-2xl overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap",
              activeTab === tab.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === "dashboard" && <DashboardTab ops={OPS_MOCK} />}
      {activeTab === "ops" && <OPsTab ops={OPS_MOCK} onVerOP={setOpSelecionada} />}
      {activeTab === "chao" && <ChaoFabricaTab />}
      {activeTab === "indicadores" && <IndicadoresTab />}
      {activeTab === "materiais" && <MateriaisTab ops={OPS_MOCK} />}

      {/* Modal OP */}
      {opSelecionada && <ModalOP op={opSelecionada} onClose={() => setOpSelecionada(null)} />}
    </div>
  )
}
