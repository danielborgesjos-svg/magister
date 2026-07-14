"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  DollarSign, TrendingUp, TrendingDown, BarChart3, FileText,
  Target, ClipboardList, Plus, X, CheckCircle2, AlertTriangle,
  Clock, Wallet, ArrowUpRight, ArrowDownRight, RefreshCw, Search,
  BadgeCheck, Receipt, CircleDollarSign, Landmark, Trash2,
  ChevronDown, CreditCard, Building2, CalendarDays, Tag,
  StickyNote, Repeat, ShieldCheck, Info, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  buscarLancamentos, buscarResumoFinanceiro, buscarDadosFinanceirosChart,
  buscarDRE, buscarMetas, buscarOSNaoFaturadas,
  criarLancamento, darBaixaLancamento, deletarLancamento, faturarOS
} from "@/app/actions/financeiro"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine } from "recharts"

// ─────────────────────────────────────────────────────────────────────────────
//  CONSTANTES
// ─────────────────────────────────────────────────────────────────────────────
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]
const MESES_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"]

const CATEGORIAS_RECEITA = [
  "Serviços de Campo", "Manutenção Preventiva", "Manutenção Corretiva",
  "Contrato Recorrente", "Venda de Produto", "Consultoria", "Projeto", "Outros"
]
const CATEGORIAS_DESPESA = [
  "Folha de Pagamento", "Aluguel / Sede", "Transporte / Combustível",
  "Material / Insumo", "Marketing", "Software / Licença", "Impostos / Taxas",
  "Equipamento", "Fornecedor", "Manutenção Interna", "Outros"
]
const METODOS_PAGAMENTO = [
  "PIX", "Transferência Bancária", "Boleto", "Cartão de Crédito",
  "Cartão de Débito", "Dinheiro", "Cheque", "Não definido"
]
const CENTROS_CUSTO = [
  "Campo / Operações", "Administrativo", "Comercial", "TI", "RH", "Geral"
]

const STATUS_CONFIG: Record<string, { label: string; cls: string; dot: string }> = {
  pago:     { label: "Pago",     cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25", dot: "bg-emerald-500" },
  pendente: { label: "Pendente", cls: "bg-amber-500/15 text-amber-600 border-amber-500/25",       dot: "bg-amber-500" },
  vencido:  { label: "Vencido",  cls: "bg-red-500/15 text-red-500 border-red-500/25",             dot: "bg-red-500" },
}

const TABS = [
  { id: "dashboard",   label: "Dashboard",      icon: BarChart3 },
  { id: "fluxo",       label: "Fluxo de Caixa", icon: DollarSign },
  { id: "receitas",    label: "Recebimentos",   icon: TrendingUp },
  { id: "despesas",    label: "Despesas",       icon: TrendingDown },
  { id: "faturamento", label: "Faturamento OS", icon: Receipt },
  { id: "dre",         label: "DRE",            icon: FileText },
  { id: "metas",       label: "Metas",          icon: Target },
] as const
type Tab = typeof TABS[number]["id"]

// ─────────────────────────────────────────────────────────────────────────────
//  UTILS
// ─────────────────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}
function fmtShort(v: number) {
  if (Math.abs(v) >= 1000000) return `R$ ${(v / 1000000).toFixed(1)}M`
  if (Math.abs(v) >= 1000) return `R$ ${(v / 1000).toFixed(1)}k`
  return fmt(v)
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPONENTES REUTILIZÁVEIS
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }: { label: string; required?: boolean; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-foreground/70 flex items-center gap-1">
        {label} {required && <span className="text-red-500">*</span>}
        {hint && <span title={hint}><Info className="w-3 h-3 text-muted-foreground/50 cursor-help" /></span>}
      </label>
      {children}
    </div>
  )
}

const inputCls = "w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
const selectCls = inputCls + " cursor-pointer appearance-none"

function KpiCard({ label, value, sub, icon: Icon, color, bg, trend, urgent }: any) {
  return (
    <div className={cn(
      "bg-card border rounded-2xl p-5 flex flex-col gap-2.5 transition-all duration-200 hover:shadow-md",
      urgent ? "border-red-500/40 bg-red-500/5" : "border-border hover:border-primary/20"
    )}>
      <div className="flex items-center justify-between">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", bg)}>
          <Icon className={cn("w-4 h-4", color)} />
        </div>
        {urgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <div>
        <div className="flex items-end justify-between gap-2 mt-1">
          <span className="text-[24px] font-black tracking-tight text-foreground leading-none">{value}</span>
          {trend && (
            <span className={cn("text-[11px] font-bold px-2 py-0.5 rounded-md mb-0.5", trend.up ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-500")}>
              {trend.up ? "↑" : "↓"} {trend.val}
            </span>
          )}
        </div>
        <p className="text-[12px] font-semibold text-muted-foreground mt-1.5">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5 font-medium">{sub}</p>}
      </div>
    </div>
  )
}

function MetaBar({ label, realizado, meta, colorFrom, colorTo }: any) {
  const pct = meta > 0 ? Math.min((realizado / meta) * 100, 100) : 0
  const ok = pct >= 80
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-bold text-foreground">{label}</span>
        <div className="text-right">
          <span className={cn("text-[13px] font-black", ok ? "text-emerald-600" : "text-amber-600")}>{pct.toFixed(1)}%</span>
          <span className="text-[11px] text-muted-foreground ml-2">{fmt(realizado)} / {fmt(meta)}</span>
        </div>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: [0.34, 1.56, 0.64, 1] }}
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ background: `linear-gradient(90deg, ${colorFrom}, ${colorTo})` }}
        />
      </div>
      <div className="flex justify-between text-[11px] text-muted-foreground font-medium">
        <span>{ok ? "✅ Meta atingida" : `Faltam ${fmt(Math.max(meta - realizado, 0))}`}</span>
        <span>Meta: {fmt(meta)}</span>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODAL — NOVO LANÇAMENTO (profissional completo)
// ─────────────────────────────────────────────────────────────────────────────
const FORM_VAZIO = {
  tipo: "receita" as "receita" | "despesa",
  descricao: "", valor: "", dataVenc: "", dataCompetencia: "",
  status: "pendente", categoria: "", metodoPagamento: "PIX",
  centroCusto: "", numeroParcelas: "1", observacoes: "",
  fornecedorCliente: "", numeroDocumento: "",
}

function ModalNovoLancamento({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...FORM_VAZIO })
  const [saving, setSaving] = useState(false)
  const [step, setStep] = useState<1 | 2>(1)

  function set(key: string, val: string) { setForm(f => ({ ...f, [key]: val })) }

  const isReceita = form.tipo === "receita"
  const categorias = isReceita ? CATEGORIAS_RECEITA : CATEGORIAS_DESPESA

  async function salvar() {
    if (!form.descricao || !form.valor || !form.dataVenc) return
    setSaving(true)
    const valor = parseFloat(form.valor.replace(",", "."))
    await criarLancamento({ descricao: form.descricao, valor, tipo: form.tipo, status: form.status, dataVenc: form.dataVenc })
    setSaving(false)
    onSaved()
  }

  const valid1 = form.descricao && form.valor && form.dataVenc && form.categoria

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header com tipo switcher */}
        <div className="relative overflow-hidden">
          <div className={cn("absolute inset-0 opacity-10 transition-all duration-500", isReceita ? "bg-emerald-500" : "bg-rose-500")} />
          <div className="relative flex items-center justify-between px-6 py-5 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", isReceita ? "bg-emerald-500/20" : "bg-rose-500/20")}>
                {isReceita ? <TrendingUp className="w-5 h-5 text-emerald-600" /> : <TrendingDown className="w-5 h-5 text-rose-500" />}
              </div>
              <div>
                <h2 className="text-[15px] font-black text-foreground">Novo Lançamento</h2>
                <p className="text-[11.5px] text-muted-foreground font-medium">Passo {step} de 2</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tipo Switcher */}
          <div className="relative px-6 pt-4 pb-2">
            <div className="flex gap-2 p-1 bg-muted/60 rounded-2xl border border-border/50">
              {(["receita", "despesa"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => set("tipo", t)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-2",
                    form.tipo === t
                      ? t === "receita"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "bg-rose-500 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t === "receita" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                  {t === "receita" ? "Receita / Entrada" : "Despesa / Saída"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Progresso */}
        <div className="px-6 py-2 flex gap-2">
          {[1, 2].map(s => (
            <div key={s} className={cn("h-1 flex-1 rounded-full transition-all duration-300", step >= s ? (isReceita ? "bg-emerald-500" : "bg-rose-500") : "bg-muted")} />
          ))}
        </div>

        <div className="px-6 pb-6 pt-2">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Field label="Descrição" required hint="Nome claro e objetivo do lançamento">
                  <input value={form.descricao} onChange={e => set("descricao", e.target.value)}
                    placeholder={isReceita ? "Ex: Pagamento OS-1024 — Cliente Acme" : "Ex: Pagamento fornecedor — Material de higienização"}
                    className={inputCls} />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Valor (R$)" required>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted-foreground">R$</span>
                      <input type="number" step="0.01" min="0" value={form.valor} onChange={e => set("valor", e.target.value)}
                        placeholder="0,00" className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                  <Field label="Status" required>
                    <div className="relative">
                      <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago / Recebido</option>
                        <option value="vencido">Vencido</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Data de Vencimento" required>
                    <input type="date" value={form.dataVenc} onChange={e => set("dataVenc", e.target.value)} className={inputCls} />
                  </Field>
                  <Field label="Competência (mês ref.)" hint="Mês a que este lançamento se refere">
                    <input type="month" value={form.dataCompetencia} onChange={e => set("dataCompetencia", e.target.value)} className={inputCls} />
                  </Field>
                </div>

                <Field label="Categoria" required>
                  <div className="relative">
                    <select value={form.categoria} onChange={e => set("categoria", e.target.value)} className={selectCls}>
                      <option value="">Selecionar categoria...</option>
                      {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>

                <button
                  onClick={() => setStep(2)}
                  disabled={!valid1}
                  className={cn(
                    "w-full py-3 rounded-xl text-[13px] font-black transition-all mt-2 flex items-center justify-center gap-2",
                    valid1 ? (isReceita ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-rose-500 text-white hover:bg-rose-600") : "bg-muted text-muted-foreground cursor-not-allowed"
                  )}
                >
                  Continuar — Detalhes Financeiros →
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <Field label={isReceita ? "Cliente / Pagador" : "Fornecedor / Beneficiário"}>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <input value={form.fornecedorCliente} onChange={e => set("fornecedorCliente", e.target.value)}
                      placeholder={isReceita ? "Nome do cliente..." : "Nome do fornecedor..."}
                      className={cn(inputCls, "pl-9")} />
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Método de Pagamento">
                    <div className="relative">
                      <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <select value={form.metodoPagamento} onChange={e => set("metodoPagamento", e.target.value)} className={cn(selectCls, "pl-9")}>
                        {METODOS_PAGAMENTO.map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                  <Field label="Centro de Custo">
                    <div className="relative">
                      <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <select value={form.centroCusto} onChange={e => set("centroCusto", e.target.value)} className={cn(selectCls, "pl-9")}>
                        <option value="">Selecionar...</option>
                        {CENTROS_CUSTO.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Nº Documento / NF" hint="Número da nota fiscal ou boleto">
                    <div className="relative">
                      <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input value={form.numeroDocumento} onChange={e => set("numeroDocumento", e.target.value)}
                        placeholder="Ex: NF-001234" className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                  <Field label="Parcelas" hint="Para parcelamentos — cada parcela é um lançamento">
                    <div className="relative">
                      <Repeat className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <select value={form.numeroParcelas} onChange={e => set("numeroParcelas", e.target.value)} className={cn(selectCls, "pl-9")}>
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x {n > 1 && `(${fmt(parseFloat(form.valor || "0") / n)}/parcela)`}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <Field label="Observações internas">
                  <div className="relative">
                    <StickyNote className="absolute left-3.5 top-3 w-3.5 h-3.5 text-muted-foreground" />
                    <textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)}
                      rows={2} placeholder="Anotações internas, referências, links..."
                      className={cn(inputCls, "pl-9 resize-none")} />
                  </div>
                </Field>

                {/* Resumo antes de salvar */}
                <div className={cn("rounded-2xl border p-4 space-y-2", isReceita ? "bg-emerald-500/5 border-emerald-500/20" : "bg-rose-500/5 border-rose-500/20")}>
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3">Resumo do Lançamento</p>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground font-medium">Descrição</span>
                    <span className="font-bold text-foreground truncate max-w-[55%] text-right">{form.descricao || "—"}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground font-medium">Valor</span>
                    <span className={cn("font-black text-[15px]", isReceita ? "text-emerald-600" : "text-rose-500")}>
                      {form.valor ? fmt(parseFloat(form.valor)) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground font-medium">Vencimento</span>
                    <span className="font-bold text-foreground">{form.dataVenc ? new Date(form.dataVenc + "T12:00").toLocaleDateString("pt-BR") : "—"}</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-muted-foreground font-medium">Categoria</span>
                    <span className="font-bold text-foreground">{form.categoria || "—"}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <button onClick={() => setStep(1)} className="flex-1 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:border-muted-foreground/30 transition-all">
                    ← Voltar
                  </button>
                  <button
                    onClick={salvar}
                    disabled={saving}
                    className={cn(
                      "flex-2 flex-1 py-2.5 rounded-xl text-[13px] font-black transition-all flex items-center justify-center gap-2 shadow-sm",
                      isReceita ? "bg-emerald-500 hover:bg-emerald-600 text-white" : "bg-rose-500 hover:bg-rose-600 text-white",
                      saving && "opacity-60 cursor-not-allowed"
                    )}
                  >
                    {saving ? (
                      <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Salvando...</>
                    ) : (
                      <><ShieldCheck className="w-3.5 h-3.5" /> Confirmar Lançamento</>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  TABELA DE LANÇAMENTOS
// ─────────────────────────────────────────────────────────────────────────────
function TabelaLancamentos({ items, onBaixar, onRemover }: { items: any[]; onBaixar: (id: string) => void; onRemover: (id: string) => void }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-20 text-center">
        <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-[14px] font-bold text-muted-foreground">Nenhum lançamento encontrado</p>
        <p className="text-[12px] text-muted-foreground/60 mt-1">Use os filtros ou adicione um novo lançamento.</p>
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-muted/40 border-b border-border">
              {["Descrição","Tipo","Vencimento","Valor","Status","Ações"].map((h, i) => (
                <th key={h} className={cn("px-4 py-3 font-black text-[11px] uppercase tracking-wider text-muted-foreground", i === 3 || i === 5 ? "text-right" : i === 4 ? "text-center" : "text-left")}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {items.map(l => {
              const sc = STATUS_CONFIG[l.status] ?? STATUS_CONFIG.pendente
              return (
                <tr key={l.id} className="hover:bg-muted/20 transition-colors group">
                  <td className="px-4 py-3.5 font-medium text-foreground max-w-[220px]">
                    <p className="truncate">{l.descricao}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-bold border", l.tipo === "receita" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20")}>
                      {l.tipo === "receita" ? "Receita" : "Despesa"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-muted-foreground font-medium">
                    {new Date(l.dataVenc).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className={cn("font-black text-[14px]", l.tipo === "receita" ? "text-emerald-600" : "text-rose-500")}>
                      {fmt(l.valor)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-center">
                      <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border", sc.cls)}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                        {sc.label}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {l.status !== "pago" && (
                        <button onClick={() => onBaixar(l.id)} title="Confirmar pagamento" className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => onRemover(l.id)} title="Excluir" className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-500 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="border-t border-border bg-muted/20">
            <tr>
              <td colSpan={3} className="px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                {items.length} registros
              </td>
              <td className="px-4 py-2.5 text-right font-black text-foreground">
                {fmt(items.reduce((a, l) => a + l.valor, 0))}
              </td>
              <td colSpan={2} />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  PÁGINA PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function FinanceiroPage() {
  const [tab, setTab] = useState<Tab>("dashboard")
  const [lancamentos, setLancamentos] = useState<any[]>([])
  const [resumo, setResumo] = useState<any>({})
  const [chartData, setChartData] = useState<any[]>([])
  const [dre, setDre] = useState<any>(null)
  const [metas, setMetas] = useState<any>(null)
  const [osNaoFaturadas, setOsNaoFaturadas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [modalOpen, setModalOpen] = useState(false)
  const [mesSel, setMesSel] = useState(new Date().getMonth())
  const [anoSel, setAnoSel] = useState(new Date().getFullYear())

  async function carregar() {
    setLoading(true)
    const [l, r, c, d, m, os] = await Promise.all([
      buscarLancamentos(), buscarResumoFinanceiro(), buscarDadosFinanceirosChart(),
      buscarDRE(mesSel, anoSel), buscarMetas(), buscarOSNaoFaturadas()
    ])
    setLancamentos(l); setResumo(r); setChartData(c)
    setDre(d); setMetas(m); setOsNaoFaturadas(os)
    setLoading(false)
  }
  useEffect(() => { carregar() }, [mesSel, anoSel])

  const receitas = lancamentos.filter(l => l.tipo === "receita")
  const despesas = lancamentos.filter(l => l.tipo === "despesa")
  const filtrados = lancamentos.filter(l => {
    const okBusca = !busca || l.descricao.toLowerCase().includes(busca.toLowerCase())
    const okStatus = filtroStatus === "todos" || l.status === filtroStatus
    const okTipo = filtroTipo === "todos" || l.tipo === filtroTipo
    return okBusca && okStatus && okTipo
  })

  async function onBaixar(id: string) {
    await darBaixaLancamento(id)
    setLancamentos(p => p.map(l => l.id === id ? { ...l, status: "pago" } : l))
  }
  async function onRemover(id: string) {
    await deletarLancamento(id)
    setLancamentos(p => p.filter(l => l.id !== id))
  }
  async function onFaturar(osId: string) {
    await faturarOS(osId)
    setOsNaoFaturadas(p => p.filter(o => o.id !== osId))
  }

  const crescimento = resumo.faturamento && resumo.recebimentos ? ((resumo.recebimentos - resumo.faturamento) / Math.abs(resumo.faturamento)) * 100 : 0

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-16 space-y-5">

      {/* ── Header ── */}
      <div className="flex items-start justify-between pt-2 gap-4">
        <div>
          <h1 className="text-[22px] font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600" />
            </div>
            Gestão Financeira
          </h1>
          <p className="text-[13px] text-muted-foreground font-medium mt-1 ml-[52px]">
            Fluxo de Caixa · DRE · Recebimentos · Despesas · Faturamento · Metas
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={carregar} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border text-[12px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/20 transition-all">
            <RefreshCw className="w-3.5 h-3.5" /> Atualizar
          </button>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all shadow-md shadow-primary/20"
          >
            <Plus className="w-4 h-4" /> Novo Lançamento
          </button>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-2xl border border-border overflow-x-auto no-scrollbar">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id as Tab)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[12.5px] font-bold whitespace-nowrap transition-all duration-200 flex-shrink-0",
              tab === id ? "bg-card text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-[13px] font-medium">Carregando dados financeiros...</p>
        </div>
      )}

      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>

            {/* ══ DASHBOARD ══ */}
            {tab === "dashboard" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard label="Receita Bruta do Mês" value={fmt(resumo.faturamento ?? 0)} sub="Total faturado (pago + pendente)" icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-500/15" />
                  <KpiCard label="Efetivamente Recebido" value={fmt(resumo.recebimentos ?? 0)} sub="Lançamentos com status Pago" icon={Wallet} color="text-blue-600" bg="bg-blue-500/15" />
                  <KpiCard label="Total de Despesas" value={fmt(resumo.despesas ?? 0)} sub="Saídas pagas no mês" icon={TrendingDown} color="text-rose-500" bg="bg-rose-500/15" />
                  <KpiCard
                    label="Resultado Líquido"
                    value={fmt(resumo.resultado ?? 0)}
                    sub="Recebido − Despesas pagas"
                    icon={CircleDollarSign}
                    color={resumo.resultado >= 0 ? "text-emerald-600" : "text-red-500"}
                    bg={resumo.resultado >= 0 ? "bg-emerald-500/15" : "bg-red-500/15"}
                    trend={resumo.resultado >= 0 ? null : { up: false, val: "Prejuízo" }}
                  />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard label="Contas Vencidas" value={fmt(resumo.vencidos ?? 0)} sub="Risco de inadimplência" icon={AlertTriangle} color="text-red-500" bg="bg-red-500/15" urgent={resumo.vencidos > 0} />
                  <KpiCard label="OS Não Faturadas" value={`${osNaoFaturadas.length} OS`} sub={`Valor: ${fmt(osNaoFaturadas.reduce((a, o) => a + (o.valorFinal ?? o.valorPrevisto ?? 0), 0))}`} icon={ClipboardList} color="text-amber-600" bg="bg-amber-500/15" urgent={osNaoFaturadas.length > 0} />
                  <KpiCard label="Entradas (Mês)" value={receitas.length} sub={`${receitas.filter(r => r.status === "pago").length} recebidas`} icon={ArrowUpRight} color="text-teal-600" bg="bg-teal-500/15" />
                  <KpiCard label="Saídas (Mês)" value={despesas.length} sub={`${despesas.filter(d => d.status === "pago").length} pagas`} icon={ArrowDownRight} color="text-violet-600" bg="bg-violet-500/15" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-[14px] font-black text-foreground">Receita × Despesa</h3>
                        <p className="text-[12px] text-muted-foreground mt-0.5">Evolução dos últimos 6 meses</p>
                      </div>
                    </div>
                    <ResponsiveContainer width="100%" height={230}>
                      <BarChart data={chartData} barGap={3}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                        <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                        <Tooltip formatter={(v: any, n: any) => [fmt(v), n === "receita" ? "Receita" : n === "despesa" ? "Despesa" : "Resultado"]} contentStyle={{ borderRadius: 12, border: "1px solid var(--border)", background: "var(--card)", fontSize: 12 }} />
                        <Legend iconType="square" iconSize={10} formatter={v => v === "receita" ? "Receita" : v === "despesa" ? "Despesa" : "Resultado"} />
                        <Bar dataKey="receita" fill="#22c55e" radius={[5, 5, 0, 0]} maxBarSize={32} />
                        <Bar dataKey="despesa" fill="#f43f5e" radius={[5, 5, 0, 0]} maxBarSize={32} />
                        <ReferenceLine y={0} stroke="rgba(0,0,0,0.15)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Saúde financeira */}
                  <div className="space-y-4">
                    <div className={cn("bg-card border rounded-2xl p-5 h-full", resumo.resultado >= 0 ? "border-emerald-500/20" : "border-red-500/20")}>
                      <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4">Saúde Financeira</p>
                      <div className="space-y-4">
                        {[
                          { label: "Receita Bruta", val: resumo.faturamento ?? 0, color: "text-emerald-600" },
                          { label: "(-) Despesas", val: -(resumo.despesas ?? 0), color: "text-rose-500" },
                          { label: "= Resultado", val: resumo.resultado ?? 0, color: resumo.resultado >= 0 ? "text-emerald-600" : "text-red-500", bold: true },
                        ].map(row => (
                          <div key={row.label} className={cn("flex justify-between items-center py-2", row.bold && "border-t border-border pt-3")}>
                            <span className={cn("text-[13px]", row.bold ? "font-black text-foreground" : "font-medium text-muted-foreground")}>{row.label}</span>
                            <span className={cn("text-[14px] font-black", row.color)}>{fmt(row.val)}</span>
                          </div>
                        ))}
                        <div className={cn("mt-2 p-3 rounded-xl text-center text-[12px] font-bold", resumo.resultado >= 0 ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-600")}>
                          {resumo.resultado >= 0 ? "🟢 Operação superavitária" : "🔴 Operação deficitária"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ══ FLUXO DE CAIXA ══ */}
            {tab === "fluxo" && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 flex-wrap bg-card border border-border rounded-2xl p-3">
                  <div className="flex items-center gap-2 flex-1 min-w-[180px]">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input value={busca} onChange={e => setBusca(e.target.value)}
                      placeholder="Buscar por descrição..." className="bg-transparent text-[13px] flex-1 outline-none text-foreground placeholder:text-muted-foreground/50" />
                  </div>
                  <div className="h-5 w-px bg-border" />
                  <div className="relative">
                    <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="bg-transparent text-[13px] font-medium text-foreground outline-none cursor-pointer pr-5 appearance-none">
                      <option value="todos">Todos os tipos</option>
                      <option value="receita">Receitas</option>
                      <option value="despesa">Despesas</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="bg-transparent text-[13px] font-medium text-foreground outline-none cursor-pointer pr-5 appearance-none">
                      <option value="todos">Todos os status</option>
                      <option value="pago">Pago</option>
                      <option value="pendente">Pendente</option>
                      <option value="vencido">Vencido</option>
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                  <span className="text-[12px] text-muted-foreground font-medium ml-auto">{filtrados.length} registros</span>
                </div>
                <TabelaLancamentos items={filtrados} onBaixar={onBaixar} onRemover={onRemover} />
              </div>
            )}

            {/* ══ RECEBIMENTOS ══ */}
            {tab === "receitas" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard label="Total a Receber" value={fmt(receitas.filter(r => r.status !== "pago").reduce((a: number, c: any) => a + c.valor, 0))} sub="Pendente + Vencido" icon={Clock} color="text-amber-600" bg="bg-amber-500/15" />
                  <KpiCard label="Total Recebido" value={fmt(receitas.filter(r => r.status === "pago").reduce((a: number, c: any) => a + c.valor, 0))} sub="Confirmados" icon={BadgeCheck} color="text-emerald-600" bg="bg-emerald-500/15" />
                  <KpiCard label="Vencidos" value={fmt(receitas.filter(r => r.status === "vencido").reduce((a: number, c: any) => a + c.valor, 0))} sub="Em inadimplência" icon={AlertTriangle} color="text-red-500" bg="bg-red-500/15" urgent={receitas.some(r => r.status === "vencido")} />
                  <KpiCard label="Qtd. Registros" value={receitas.length} sub="Lançamentos de receita" icon={Receipt} color="text-blue-600" bg="bg-blue-500/15" />
                </div>
                <TabelaLancamentos items={receitas} onBaixar={onBaixar} onRemover={onRemover} />
              </div>
            )}

            {/* ══ DESPESAS ══ */}
            {tab === "despesas" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <KpiCard label="Total a Pagar" value={fmt(despesas.filter(d => d.status !== "pago").reduce((a: number, c: any) => a + c.valor, 0))} sub="Em aberto" icon={TrendingDown} color="text-rose-500" bg="bg-rose-500/15" />
                  <KpiCard label="Total Pago" value={fmt(despesas.filter(d => d.status === "pago").reduce((a: number, c: any) => a + c.valor, 0))} sub="Confirmados" icon={CheckCircle2} color="text-emerald-600" bg="bg-emerald-500/15" />
                  <KpiCard label="Vencidos" value={fmt(despesas.filter(d => d.status === "vencido").reduce((a: number, c: any) => a + c.valor, 0))} sub="Pagamentos em atraso" icon={AlertTriangle} color="text-red-500" bg="bg-red-500/15" urgent={despesas.some(d => d.status === "vencido")} />
                  <KpiCard label="Qtd. Registros" value={despesas.length} sub="Lançamentos de despesa" icon={Landmark} color="text-violet-600" bg="bg-violet-500/15" />
                </div>
                <TabelaLancamentos items={despesas} onBaixar={onBaixar} onRemover={onRemover} />
              </div>
            )}

            {/* ══ FATURAMENTO OS ══ */}
            {tab === "faturamento" && (
              <div className="space-y-5">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                  <KpiCard label="OS Aguardando Faturamento" value={osNaoFaturadas.length} sub="Concluídas sem cobrança" icon={ClipboardList} color="text-amber-600" bg="bg-amber-500/15" urgent={osNaoFaturadas.length > 0} />
                  <KpiCard label="Valor Total em Aberto" value={fmt(osNaoFaturadas.reduce((a, o) => a + (o.valorFinal ?? o.valorPrevisto ?? 0), 0))} sub="Aguardando fatura" icon={DollarSign} color="text-rose-500" bg="bg-rose-500/15" urgent={osNaoFaturadas.length > 0} />
                  <KpiCard label="Ticket Médio das OS" value={osNaoFaturadas.length > 0 ? fmt(osNaoFaturadas.reduce((a, o) => a + (o.valorFinal ?? o.valorPrevisto ?? 0), 0) / osNaoFaturadas.length) : "R$ 0"} sub="Por ordem de serviço" icon={BadgeCheck} color="text-blue-600" bg="bg-blue-500/15" />
                </div>
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-[13px]">
                    <thead>
                      <tr className="bg-muted/40 border-b border-border">
                        {["OS #","Cliente","Serviço","Concluída em","Valor Final","Ação"].map((h, i) => (
                          <th key={h} className={cn("px-4 py-3 font-black text-[11px] uppercase tracking-wider text-muted-foreground", i >= 4 ? "text-right" : "text-left")}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {osNaoFaturadas.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">
                          <BadgeCheck className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
                          <p className="font-bold">Todas as OS estão faturadas!</p>
                        </td></tr>
                      ) : osNaoFaturadas.map((os, i) => (
                        <tr key={os.id} className="hover:bg-muted/20 transition-colors group">
                          <td className="px-4 py-3.5 font-mono font-black text-primary">#{os.numeroOS}</td>
                          <td className="px-4 py-3.5 font-semibold text-foreground">{os.cliente?.nome ?? "—"}</td>
                          <td className="px-4 py-3.5 text-muted-foreground max-w-[180px] truncate">{os.titulo}</td>
                          <td className="px-4 py-3.5 text-muted-foreground">{new Date(os.updatedAt).toLocaleDateString("pt-BR")}</td>
                          <td className="px-4 py-3.5 text-right font-black text-emerald-600 text-[14px]">{fmt(os.valorFinal ?? os.valorPrevisto ?? 0)}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button onClick={() => onFaturar(os.id)} className="px-3 py-1.5 rounded-xl bg-emerald-500/15 text-emerald-600 text-[11.5px] font-black border border-emerald-500/25 hover:bg-emerald-500/25 transition-all">
                              ✓ Faturar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ══ DRE ══ */}
            {tab === "dre" && (
              <div className="space-y-5">
                <div className="flex items-center gap-3 flex-wrap bg-card border border-border rounded-2xl p-3">
                  <CalendarDays className="w-4 h-4 text-muted-foreground" />
                  <div className="relative">
                    <select value={mesSel} onChange={e => setMesSel(+e.target.value)} className="bg-transparent text-[13px] font-bold text-foreground outline-none cursor-pointer pr-5 appearance-none">
                      {MESES.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="relative">
                    <select value={anoSel} onChange={e => setAnoSel(+e.target.value)} className="bg-transparent text-[13px] font-bold text-foreground outline-none cursor-pointer pr-5 appearance-none">
                      {[2024, 2025, 2026].map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
                  </div>
                  <div className="h-4 w-px bg-border" />
                  <span className="text-[12px] text-muted-foreground font-medium">Demonstrativo de Resultado — {MESES[mesSel]} / {anoSel}</span>
                </div>

                {dre ? (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2">
                      <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-gradient-to-r from-muted/60 to-muted/20 border-b border-border flex items-center justify-between">
                          <div>
                            <h3 className="text-[14px] font-black text-foreground">DRE — {MESES[dre.mes]} / {dre.ano}</h3>
                            <p className="text-[11.5px] text-muted-foreground mt-0.5">Demonstrativo de Resultado do Exercício</p>
                          </div>
                          <span className={cn("px-3 py-1 rounded-full text-[11px] font-black border", dre.margemLiquida >= 20 ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : dre.margemLiquida >= 0 ? "bg-amber-500/10 text-amber-600 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20")}>
                            Margem: {dre.margemLiquida.toFixed(1)}%
                          </span>
                        </div>
                        <div className="p-6">
                          {[
                            { label: "( + ) Receita Bruta Total",         val: dre.receitaBruta,    indent: 0, color: "text-emerald-600", section: "RECEITA" },
                            { label: "       ↳ Receita de OS",           val: dre.receitaOS,       indent: 1, color: "text-emerald-500/80" },
                            { label: "       ↳ Outras Receitas",         val: dre.receitaOutras,   indent: 1, color: "text-emerald-500/80" },
                            { label: "( − ) Total de Despesas",           val: dre.totalDespesas,   indent: 0, color: "text-rose-500",     section: "DESPESA" },
                            { label: "( = ) LUCRO / RESULTADO LÍQUIDO",  val: dre.lucroLiquido,    indent: 0, color: dre.lucroLiquido >= 0 ? "text-emerald-600" : "text-red-500", bold: true, section: "RESULTADO" },
                            { label: "( $ ) Efetivamente Recebido",       val: dre.receitaRecebida, indent: 0, color: "text-blue-600", section: "CAIXA" },
                            { label: "( ! ) A Receber / Pendente",        val: dre.pendentes,       indent: 0, color: "text-amber-600" },
                            { label: "( ! ) Vencidos / Inadimplência",    val: dre.vencidos,        indent: 0, color: "text-red-500" },
                          ].map((row, i) => (
                            <div key={i}>
                              {row.section && (
                                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mt-4 mb-1 first:mt-0">{row.section}</p>
                              )}
                              <div className={cn("flex items-center justify-between py-2.5 border-b border-border/30 last:border-0 transition-colors rounded-lg px-2 -mx-2", row.bold && "bg-muted/50 border-t border-border/60")}>
                                <span className={cn("text-[13px] font-medium", row.indent === 1 && "pl-4 text-muted-foreground text-[12px]", row.bold && "font-black text-foreground")}>
                                  {row.label}
                                </span>
                                <span className={cn("text-[13px] font-bold tabular-nums", row.color, row.bold && "text-[16px] font-black")}>
                                  {fmt(row.val)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <KpiCard label="Entradas" value={dre.qtdReceitas} sub="Lançamentos de receita" icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-500/15" />
                      <KpiCard label="Saídas" value={dre.qtdDespesas} sub="Lançamentos de despesa" icon={TrendingDown} color="text-rose-500" bg="bg-rose-500/15" />
                      <div className={cn("bg-card border rounded-2xl p-5 text-center", dre.margemLiquida >= 20 ? "border-emerald-500/30 bg-emerald-500/5" : dre.margemLiquida >= 0 ? "border-amber-500/30 bg-amber-500/5" : "border-red-500/30 bg-red-500/5")}>
                        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Margem Líquida</p>
                        <p className={cn("text-[40px] font-black", dre.margemLiquida >= 20 ? "text-emerald-600" : dre.margemLiquida >= 0 ? "text-amber-600" : "text-red-500")}>
                          {dre.margemLiquida.toFixed(1)}%
                        </p>
                        <p className="text-[12px] font-semibold text-muted-foreground mt-1">
                          {dre.margemLiquida >= 20 ? "🟢 Excelente" : dre.margemLiquida >= 10 ? "🟡 Razoável" : dre.margemLiquida >= 0 ? "🟠 Atenção" : "🔴 Resultado Negativo"}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
                    <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">Sem dados no período selecionado</p>
                  </div>
                )}
              </div>
            )}

            {/* ══ METAS ══ */}
            {tab === "metas" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[16px] font-black text-foreground">Metas do Período</h3>
                    <p className="text-[12.5px] text-muted-foreground mt-0.5">Acompanhe em tempo real o progresso das metas financeiras e operacionais</p>
                  </div>
                  <span className="px-3.5 py-1.5 bg-primary/10 text-primary text-[12px] font-black rounded-xl border border-primary/20">
                    {MESES[new Date().getMonth()]} {new Date().getFullYear()}
                  </span>
                </div>

                {metas ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-2xl p-6 space-y-7">
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <h4 className="text-[13px] font-black text-foreground uppercase tracking-wide">Metas Financeiras</h4>
                      </div>
                      <MetaBar label="Receita do Mês" realizado={metas.receitaRealizada} meta={metas.receitaMeta} colorFrom="#22c55e" colorTo="#10b981" />
                      <MetaBar label="Controle de Despesas" realizado={metas.despesaRealizada} meta={metas.despesaMeta} colorFrom="#f43f5e" colorTo="#ef4444" />
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6 space-y-7">
                      <div className="flex items-center gap-2">
                        <ClipboardList className="w-4 h-4 text-blue-600" />
                        <h4 className="text-[13px] font-black text-foreground uppercase tracking-wide">Metas Operacionais</h4>
                      </div>
                      <MetaBar label="OS Concluídas no Mês" realizado={metas.osRealizada} meta={metas.osMeta} colorFrom="#6366f1" colorTo="#8b5cf6" />
                      <div className="pt-2 border-t border-border space-y-3">
                        <p className="text-[11.5px] text-muted-foreground/70 font-medium">
                          ⚙️ As metas padrão são: Receita R$ 50.000 · Despesas R$ 20.000 · OS 50/mês
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Meta Receita", val: fmt(metas.receitaMeta), color: "text-emerald-600" },
                            { label: "Meta Despesa", val: fmt(metas.despesaMeta), color: "text-rose-500" },
                            { label: "Meta OS", val: `${metas.osMeta} OS`, color: "text-violet-600" },
                          ].map(c => (
                            <div key={c.label} className="bg-muted/40 rounded-xl p-3 text-center border border-border/50">
                              <p className={cn("text-[13px] font-black", c.color)}>{c.val}</p>
                              <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{c.label}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-muted-foreground border border-dashed border-border rounded-2xl">
                    <Target className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="font-bold">Carregando metas...</p>
                  </div>
                )}
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <ModalNovoLancamento
            onClose={() => setModalOpen(false)}
            onSaved={async () => { setModalOpen(false); await carregar() }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
