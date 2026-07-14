"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Plus, X, Search, RefreshCw, Download, Eye,
  ChevronDown, Upload, AlertTriangle, BadgeCheck, Clock,
  Building2, Tag, CalendarDays, DollarSign, ShieldCheck,
  Users, Wrench, Handshake, FileBox, Trash2, MoreVertical,
  CheckCircle2, PauseCircle, XCircle, RotateCcw, FilePlus,
  Info, StickyNote, Phone, CreditCard, Paperclip, FolderOpen,
  TrendingUp, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  buscarContratos, buscarKPIsContratos,
  criarContrato, atualizarStatusContrato, deletarContrato, atualizarContratoArquivo
} from "@/app/actions/contratos"

// ─── Constantes ───────────────────────────────────────────────────────────────
const TIPOS = [
  { id: "cliente",    label: "Cliente",    icon: Users,     color: "text-blue-600",    bg: "bg-blue-500/15" },
  { id: "fornecedor", label: "Fornecedor", icon: Building2, color: "text-violet-600",  bg: "bg-violet-500/15" },
  { id: "servico",    label: "Serviço",    icon: Wrench,    color: "text-amber-600",   bg: "bg-amber-500/15" },
  { id: "parceria",   label: "Parceria",   icon: Handshake, color: "text-teal-600",    bg: "bg-teal-500/15" },
  { id: "outro",      label: "Outro",      icon: FileBox,   color: "text-slate-600",   bg: "bg-slate-500/15" },
]
const STATUS_MAP: Record<string, { label: string; cls: string; dot: string; icon: any }> = {
  ativo:         { label: "Ativo",         cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/25", dot: "bg-emerald-500", icon: CheckCircle2 },
  encerrado:     { label: "Encerrado",     cls: "bg-slate-500/15 text-slate-500 border-slate-500/25",       dot: "bg-slate-500",   icon: XCircle },
  suspenso:      { label: "Suspenso",      cls: "bg-rose-500/15 text-rose-500 border-rose-500/25",          dot: "bg-rose-500",    icon: PauseCircle },
  em_renovacao:  { label: "Em Renovação",  cls: "bg-amber-500/15 text-amber-600 border-amber-500/25",       dot: "bg-amber-500",   icon: RotateCcw },
  rascunho:      { label: "Rascunho",      cls: "bg-muted text-muted-foreground border-border",             dot: "bg-muted-foreground", icon: FileText },
}
const PERIODICIDADES = ["mensal","trimestral","semestral","anual","unico"]
const CATEGORIAS = ["Manutenção","Limpeza","Segurança","TI / Software","Aluguel","Logística","Consultoria","Serviços Gerais","Fornecimento","Outro"]

function fmt(v: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)
}
function diasParaVencer(dataFim?: string | null): number | null {
  if (!dataFim) return null
  return Math.ceil((new Date(dataFim).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}
function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`
  return `${(b / 1024 / 1024).toFixed(2)} MB`
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, color, bg, urgent }: any) {
  return (
    <div className={cn("bg-card border rounded-2xl p-5 flex flex-col gap-3 transition-all hover:shadow-md", urgent ? "border-red-500/40 bg-red-500/5" : "border-border hover:border-primary/20")}>
      <div className="flex items-center justify-between">
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", bg)}><Icon className={cn("w-4 h-4", color)} /></div>
        {urgent && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
      </div>
      <div>
        <span className="text-[26px] font-black tracking-tight text-foreground leading-none">{value}</span>
        <p className="text-[12px] font-semibold text-muted-foreground mt-1.5">{label}</p>
        {sub && <p className="text-[11px] text-muted-foreground/60 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ─── Tipo Badge ───────────────────────────────────────────────────────────────
function TipoBadge({ tipo }: { tipo: string }) {
  const t = TIPOS.find(t => t.id === tipo) ?? TIPOS[4]
  const Icon = t.icon
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border", t.bg, t.color, "border-current/20")}>
      <Icon className="w-3 h-3" /> {t.label}
    </span>
  )
}

// ─── Upload de PDF ────────────────────────────────────────────────────────────
function UploadPDF({ onUploaded, contratoId }: { onUploaded: (path: string, nome: string, size: number) => void; contratoId?: string }) {
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<{ nome: string; size: number } | null>(null)
  const [erro, setErro] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  async function processFile(file: File) {
    if (file.type !== "application/pdf") { setErro("Apenas arquivos PDF são aceitos."); return }
    if (file.size > 10 * 1024 * 1024) { setErro("Arquivo muito grande. Máximo 10MB."); return }
    setErro(""); setUploading(true)
    const fd = new FormData()
    fd.append("file", file)
    if (contratoId) fd.append("contratoId", contratoId)
    try {
      const res = await fetch("/api/upload-contrato", { method: "POST", body: fd })
      const json = await res.json()
      if (json.success) {
        setPreview({ nome: file.name, size: file.size })
        onUploaded(json.path, json.nome, json.size)
      } else setErro(json.error ?? "Erro no upload.")
    } catch { setErro("Falha na conexão.") }
    setUploading(false)
  }

  return (
    <div className="space-y-2">
      {preview ? (
        <div className="flex items-center gap-3 p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-foreground truncate">{preview.nome}</p>
            <p className="text-[11px] text-muted-foreground">{fmtBytes(preview.size)} · PDF</p>
          </div>
          <BadgeCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <button onClick={() => setPreview(null)} className="p-1 rounded-lg hover:bg-muted transition-colors">
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f) }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "relative flex flex-col items-center justify-center gap-2 p-6 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200",
            dragging ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/40 hover:bg-muted/30",
            uploading && "pointer-events-none opacity-60"
          )}
        >
          <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) processFile(f) }} />
          {uploading ? (
            <><RefreshCw className="w-8 h-8 text-primary animate-spin" /><p className="text-[13px] font-semibold text-muted-foreground">Enviando...</p></>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center">
                <Upload className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-[13px] font-bold text-foreground">Arraste o PDF aqui ou clique para selecionar</p>
              <p className="text-[11.5px] text-muted-foreground">Somente PDF · Máximo 10 MB</p>
            </>
          )}
        </div>
      )}
      {erro && <p className="text-[12px] text-red-500 font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{erro}</p>}
    </div>
  )
}

// ─── Modal Novo Contrato ──────────────────────────────────────────────────────
const FORM_VAZIO = {
  titulo: "", tipo: "cliente", numero: "", categoria: "",
  parteNome: "", parteDoc: "", valor: "", periodicidade: "mensal",
  status: "ativo", dataInicio: "", dataFim: "", alertaRenovacao: "30",
  responsavel: "", observacoes: "",
  arquivoPath: "", arquivoNome: "", arquivoSize: 0,
}

function ModalNovoContrato({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ ...FORM_VAZIO })
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [saving, setSaving] = useState(false)

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const tipoObj = TIPOS.find(t => t.id === form.tipo) ?? TIPOS[0]
  const TipoIcon = tipoObj.icon

  const valid1 = form.titulo && form.tipo && form.dataInicio
  const valid2 = form.valor

  async function salvar() {
    setSaving(true)
    await criarContrato({
      titulo: form.titulo, tipo: form.tipo, numero: form.numero || undefined,
      categoria: form.categoria || undefined, parteNome: form.parteNome || undefined,
      parteDoc: form.parteDoc || undefined, valor: parseFloat(form.valor || "0"),
      periodicidade: form.periodicidade, status: form.status,
      dataInicio: form.dataInicio, dataFim: form.dataFim || undefined,
      alertaRenovacao: form.alertaRenovacao ? parseInt(form.alertaRenovacao) : undefined,
      responsavel: form.responsavel || undefined, observacoes: form.observacoes || undefined,
      arquivoPath: form.arquivoPath || undefined, arquivoNome: form.arquivoNome || undefined,
      arquivoSize: form.arquivoSize || undefined,
    })
    setSaving(false)
    onSaved()
  }

  const inputCls = "w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"
  const selectCls = inputCls + " cursor-pointer appearance-none"

  const Field = ({ label, req, children }: any) => (
    <div className="space-y-1.5">
      <label className="text-[12px] font-semibold text-foreground/70">{label}{req && <span className="text-red-500 ml-0.5">*</span>}</label>
      {children}
    </div>
  )

  return (
    <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/20 shrink-0">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", tipoObj.bg)}>
              <TipoIcon className={cn("w-5 h-5", tipoObj.color)} />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-foreground">Novo Contrato</h2>
              <p className="text-[11.5px] text-muted-foreground">Passo {step} de 3</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all"><X className="w-4 h-4" /></button>
        </div>

        {/* Progresso */}
        <div className="px-6 py-3 flex gap-2 shrink-0 bg-muted/10 border-b border-border/50">
          {[
            { n: 1, label: "Identificação" },
            { n: 2, label: "Financeiro" },
            { n: 3, label: "Documento" },
          ].map(s => (
            <button key={s.n} onClick={() => { if (s.n < step || (s.n === 2 && valid1) || (s.n === 3 && valid1 && valid2)) setStep(s.n as any) }}
              className="flex-1 flex flex-col items-center gap-1">
              <div className={cn("w-full h-1.5 rounded-full transition-all duration-300", step >= s.n ? "bg-primary" : "bg-muted")} />
              <span className={cn("text-[10px] font-bold uppercase tracking-wide", step >= s.n ? "text-primary" : "text-muted-foreground")}>{s.label}</span>
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">

            {/* ── Passo 1: Identificação ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <Field label="Título / Objeto do Contrato" req>
                  <input value={form.titulo} onChange={e => set("titulo", e.target.value)}
                    placeholder="Ex: Contrato de Prestação de Serviços — Higienização Mensal" className={inputCls} />
                </Field>

                <Field label="Tipo de Contrato" req>
                  <div className="grid grid-cols-5 gap-2">
                    {TIPOS.map(t => {
                      const Icon = t.icon
                      return (
                        <button key={t.id} onClick={() => set("tipo", t.id)}
                          className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border text-[11px] font-bold transition-all",
                            form.tipo === t.id ? cn(t.bg, t.color, "border-current/30 shadow-sm") : "border-border text-muted-foreground hover:border-muted-foreground/40")}>
                          <Icon className="w-4 h-4" /> {t.label}
                        </button>
                      )
                    })}
                  </div>
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Número / Código do Contrato">
                    <input value={form.numero} onChange={e => set("numero", e.target.value)}
                      placeholder="Ex: CONT-2025-001" className={inputCls} />
                  </Field>
                  <Field label="Categoria / Serviço">
                    <div className="relative">
                      <select value={form.categoria} onChange={e => set("categoria", e.target.value)} className={selectCls}>
                        <option value="">Selecionar...</option>
                        {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label={form.tipo === "cliente" ? "Nome do Cliente" : "Nome da Empresa / Parte"} req>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input value={form.parteNome} onChange={e => set("parteNome", e.target.value)}
                        placeholder="Razão social ou nome" className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                  <Field label="CNPJ / CPF da Parte">
                    <input value={form.parteDoc} onChange={e => set("parteDoc", e.target.value)}
                      placeholder="00.000.000/0001-00" className={inputCls} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Data de Início" req>
                    <div className="relative">
                      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input type="date" value={form.dataInicio} onChange={e => set("dataInicio", e.target.value)} className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                  <Field label="Data de Encerramento">
                    <div className="relative">
                      <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                      <input type="date" value={form.dataFim} onChange={e => set("dataFim", e.target.value)} className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Responsável Interno">
                    <input value={form.responsavel} onChange={e => set("responsavel", e.target.value)}
                      placeholder="Nome do gestor responsável" className={inputCls} />
                  </Field>
                  <Field label="Status">
                    <div className="relative">
                      <select value={form.status} onChange={e => set("status", e.target.value)} className={selectCls}>
                        {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>
              </motion.div>
            )}

            {/* ── Passo 2: Financeiro ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Valor do Contrato" req>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] font-bold text-muted-foreground">R$</span>
                      <input type="number" step="0.01" min="0" value={form.valor} onChange={e => set("valor", e.target.value)}
                        placeholder="0,00" className={cn(inputCls, "pl-9")} />
                    </div>
                  </Field>
                  <Field label="Periodicidade">
                    <div className="relative">
                      <select value={form.periodicidade} onChange={e => set("periodicidade", e.target.value)} className={selectCls}>
                        {PERIODICIDADES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </Field>
                </div>

                <Field label="Alertar renovação com antecedência (dias)">
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <select value={form.alertaRenovacao} onChange={e => set("alertaRenovacao", e.target.value)} className={cn(selectCls, "pl-9")}>
                      {[15, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} dias antes do vencimento</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  </div>
                </Field>

                <Field label="Observações / Cláusulas importantes">
                  <textarea value={form.observacoes} onChange={e => set("observacoes", e.target.value)}
                    rows={5} placeholder="Notas relevantes, condições especiais, cláusulas de rescisão..."
                    className={cn(inputCls, "resize-none")} />
                </Field>

                {/* Resumo financeiro */}
                {form.valor && (
                  <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                    <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-3">Resumo Financeiro</p>
                    <div className="flex justify-between text-[13px]">
                      <span className="text-muted-foreground font-medium">Valor por período</span>
                      <span className="font-black text-foreground">{fmt(parseFloat(form.valor))}</span>
                    </div>
                    {form.periodicidade === "mensal" && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-muted-foreground font-medium">Valor anual estimado</span>
                        <span className="font-black text-primary">{fmt(parseFloat(form.valor) * 12)}</span>
                      </div>
                    )}
                    {form.dataInicio && form.dataFim && (
                      <div className="flex justify-between text-[13px]">
                        <span className="text-muted-foreground font-medium">Duração total</span>
                        <span className="font-bold text-foreground">
                          {Math.ceil((new Date(form.dataFim).getTime() - new Date(form.dataInicio).getTime()) / (1000 * 60 * 60 * 24))} dias
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* ── Passo 3: Documento PDF ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <div className="text-center mb-2">
                  <p className="text-[14px] font-bold text-foreground">Anexar o PDF do Contrato</p>
                  <p className="text-[12px] text-muted-foreground mt-1">O documento ficará vinculado ao contrato e poderá ser acessado a qualquer momento.</p>
                </div>
                <UploadPDF
                  onUploaded={(path, nome, size) => { set("arquivoPath", path); set("arquivoNome", nome); set("arquivoSize", size) }}
                />
                <p className="text-[12px] text-muted-foreground/70 text-center font-medium">
                  O anexo é opcional — você pode adicionar o documento depois.
                </p>

                {/* Resumo final */}
                <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-2.5">
                  <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-2">Resumo do Contrato</p>
                  {[
                    { label: "Título", val: form.titulo },
                    { label: "Tipo", val: TIPOS.find(t => t.id === form.tipo)?.label },
                    { label: "Parte", val: form.parteNome || "—" },
                    { label: "Valor", val: form.valor ? fmt(parseFloat(form.valor)) : "—" },
                    { label: "Periodicidade", val: form.periodicidade },
                    { label: "Início", val: form.dataInicio ? new Date(form.dataInicio + "T12:00").toLocaleDateString("pt-BR") : "—" },
                    { label: "Fim", val: form.dataFim ? new Date(form.dataFim + "T12:00").toLocaleDateString("pt-BR") : "Indeterminado" },
                    { label: "Arquivo", val: form.arquivoNome || "Sem anexo" },
                  ].map(r => (
                    <div key={r.label} className="flex justify-between text-[12.5px]">
                      <span className="text-muted-foreground font-medium">{r.label}</span>
                      <span className="font-bold text-foreground text-right max-w-[60%] truncate">{r.val}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-border bg-muted/10 shrink-0">
          {step > 1 && (
            <button onClick={() => setStep(s => (s - 1) as any)} className="px-4 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-all">
              ← Voltar
            </button>
          )}
          <button onClick={onClose} className={cn("py-2.5 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-all", step === 1 ? "flex-1" : "px-4")}>
            Cancelar
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(s => (s + 1) as any)}
              disabled={(step === 1 && !valid1) || (step === 2 && !valid2)}
              className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Continuar →
            </button>
          ) : (
            <button
              onClick={salvar}
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-black hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-md"
            >
              {saving ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" />Salvando...</> : <><ShieldCheck className="w-3.5 h-3.5" />Salvar Contrato</>}
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Card de Contrato ─────────────────────────────────────────────────────────
function ContratoCard({ contrato, onStatusChange, onDelete }: { contrato: any; onStatusChange: (id: string, s: string) => void; onDelete: (id: string) => void }) {
  const [menu, setMenu] = useState(false)
  const sc = STATUS_MAP[contrato.status] ?? STATUS_MAP.ativo
  const dias = diasParaVencer(contrato.dataFim)
  const StatusIcon = sc.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className={cn("bg-card border rounded-2xl p-5 flex flex-col gap-4 transition-all hover:shadow-md group relative",
        dias !== null && dias <= 30 && dias >= 0 ? "border-amber-500/30" :
        dias !== null && dias < 0 ? "border-red-500/30" : "border-border hover:border-primary/20"
      )}
    >
      {/* Alertas */}
      {dias !== null && dias <= 30 && dias >= 0 && (
        <div className="absolute top-3 right-10 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-black border border-amber-500/20">
          ⚠ Vence em {dias}d
        </div>
      )}
      {dias !== null && dias < 0 && (
        <div className="absolute top-3 right-10 px-2 py-0.5 rounded-full bg-red-500/15 text-red-500 text-[10px] font-black border border-red-500/20 animate-pulse">
          Vencido
        </div>
      )}

      {/* Menu de ações */}
      <div className="absolute top-3 right-3">
        <button onClick={() => setMenu(m => !m)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all opacity-0 group-hover:opacity-100">
          <MoreVertical className="w-4 h-4" />
        </button>
        <AnimatePresence>
          {menu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -5 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-8 right-0 z-50 bg-card border border-border rounded-xl shadow-xl min-w-[160px] py-1 overflow-hidden"
            >
              {Object.entries(STATUS_MAP).filter(([k]) => k !== contrato.status).map(([k, v]) => {
                const Icon = v.icon
                return (
                  <button key={k} onClick={() => { onStatusChange(contrato.id, k); setMenu(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                    <Icon className="w-3.5 h-3.5" /> {v.label}
                  </button>
                )
              })}
              <div className="h-px bg-border my-1" />
              {contrato.arquivoPath && (
                <a href={contrato.arquivoPath} target="_blank" rel="noopener noreferrer"
                  className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] font-semibold text-blue-600 hover:bg-blue-500/10 transition-colors">
                  <Eye className="w-3.5 h-3.5" /> Ver PDF
                </a>
              )}
              <button onClick={() => { onDelete(contrato.id); setMenu(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[12.5px] font-semibold text-red-500 hover:bg-red-500/10 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Header */}
      <div className="flex items-start gap-3 pr-8">
        <TipoBadge tipo={contrato.tipo} />
        {contrato.numero && <span className="text-[11px] font-mono text-muted-foreground/60 mt-0.5">#{contrato.numero}</span>}
      </div>

      <div>
        <h3 className="text-[14px] font-black text-foreground leading-tight line-clamp-2">{contrato.titulo}</h3>
        {contrato.parteNome && <p className="text-[12.5px] font-semibold text-muted-foreground mt-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" />{contrato.parteNome}</p>}
        {contrato.categoria && <p className="text-[11.5px] text-muted-foreground/60 mt-0.5 flex items-center gap-1"><Tag className="w-3 h-3" />{contrato.categoria}</p>}
      </div>

      {/* Datas e valor */}
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <div className="bg-muted/30 rounded-xl p-2.5">
          <p className="text-muted-foreground font-medium text-[10.5px] uppercase tracking-wide mb-0.5">Valor</p>
          <p className="font-black text-foreground text-[14px]">{fmt(contrato.valor)}</p>
          <p className="text-muted-foreground/60 text-[10.5px]">{contrato.periodicidade}</p>
        </div>
        <div className="bg-muted/30 rounded-xl p-2.5">
          <p className="text-muted-foreground font-medium text-[10.5px] uppercase tracking-wide mb-0.5">Vigência</p>
          <p className="font-bold text-foreground">{new Date(contrato.dataInicio).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}</p>
          {contrato.dataFim
            ? <p className="text-muted-foreground/60 text-[10.5px]">até {new Date(contrato.dataFim).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "2-digit" })}</p>
            : <p className="text-muted-foreground/60 text-[10.5px]">Indeterminado</p>}
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40">
        <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border", sc.cls)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
          {sc.label}
        </span>
        <div className="flex items-center gap-2">
          {contrato.arquivoPath ? (
            <a href={contrato.arquivoPath} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-red-500/10 text-red-600 text-[11px] font-bold border border-red-500/20 hover:bg-red-500/20 transition-all">
              <FileText className="w-3 h-3" /> PDF
            </a>
          ) : (
            <span className="text-[11px] text-muted-foreground/50 font-medium flex items-center gap-1">
              <Paperclip className="w-3 h-3" /> Sem PDF
            </span>
          )}
          {contrato.responsavel && (
            <span className="text-[11px] text-muted-foreground/60 font-medium">{contrato.responsavel}</span>
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────
export default function ContratosPage() {
  const [contratos, setContratos] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [filtroTipo, setFiltroTipo] = useState("todos")
  const [view, setView] = useState<"cards" | "lista">("cards")

  async function carregar() {
    setLoading(true)
    const [c, k] = await Promise.all([buscarContratos(), buscarKPIsContratos()])
    setContratos(c); setKpis(k)
    setLoading(false)
  }
  useEffect(() => { carregar() }, [])

  async function onStatusChange(id: string, status: string) {
    await atualizarStatusContrato(id, status)
    setContratos(p => p.map(c => c.id === id ? { ...c, status } : c))
  }
  async function onDelete(id: string) {
    await deletarContrato(id)
    setContratos(p => p.filter(c => c.id !== id))
  }

  const filtrados = contratos.filter(c => {
    const okBusca = !busca || c.titulo?.toLowerCase().includes(busca.toLowerCase()) || c.parteNome?.toLowerCase().includes(busca.toLowerCase()) || c.numero?.toLowerCase().includes(busca.toLowerCase())
    const okStatus = filtroStatus === "todos" || c.status === filtroStatus
    const okTipo = filtroTipo === "todos" || c.tipo === filtroTipo
    return okBusca && okStatus && okTipo
  })

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-16 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between pt-2 gap-4">
        <div>
          <h1 className="text-[22px] font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/10 border border-violet-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            Contratos
          </h1>
          <p className="text-[13px] text-muted-foreground font-medium mt-1 ml-[52px]">
            Clientes · Fornecedores · Serviços · Parcerias — com anexo de PDF
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={carregar} className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-border text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all shadow-md shadow-primary/20">
            <Plus className="w-4 h-4" /> Novo Contrato
          </button>
        </div>
      </div>

      {/* ── KPIs ── */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <KpiCard label="Total de Contratos" value={kpis.total} sub="Todos os tipos" icon={FileText} color="text-violet-600" bg="bg-violet-500/15" />
          <KpiCard label="Ativos" value={kpis.ativos} sub="Em vigência" icon={BadgeCheck} color="text-emerald-600" bg="bg-emerald-500/15" />
          <KpiCard label="Encerrados" value={kpis.encerrados} sub="Finalizados" icon={XCircle} color="text-slate-500" bg="bg-slate-500/15" />
          <KpiCard label="Vencem em 30d" value={kpis.aVencer30} sub="Requerem atenção" icon={Clock} color="text-amber-600" bg="bg-amber-500/15" urgent={kpis.aVencer30 > 0} />
          <KpiCard label="Vencem em 60d" value={kpis.aVencer60} sub="Monitorar" icon={AlertTriangle} color="text-orange-600" bg="bg-orange-500/15" />
          <KpiCard label="Valor Contratado" value={fmt(kpis.valorTotal)} sub="Contratos ativos" icon={DollarSign} color="text-blue-600" bg="bg-blue-500/15" />
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="flex items-center gap-3 flex-wrap bg-card border border-border rounded-2xl p-3">
        <div className="flex items-center gap-2 flex-1 min-w-[180px]">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar por título, parte ou número..."
            className="bg-transparent text-[13px] flex-1 outline-none text-foreground placeholder:text-muted-foreground/50" />
        </div>
        <div className="h-5 w-px bg-border hidden sm:block" />
        <div className="relative">
          <select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)} className="bg-transparent text-[13px] font-medium text-foreground outline-none cursor-pointer pr-5 appearance-none">
            <option value="todos">Todos os tipos</option>
            {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="bg-transparent text-[13px] font-medium text-foreground outline-none cursor-pointer pr-5 appearance-none">
            <option value="todos">Todos os status</option>
            {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
          <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
        </div>
        <span className="text-[12px] text-muted-foreground font-medium ml-auto">{filtrados.length} contratos</span>
      </div>

      {/* ── Lista ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-[13px] font-medium">Carregando contratos...</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3 border border-dashed border-border rounded-2xl text-muted-foreground">
          <FileText className="w-12 h-12 opacity-20" />
          <p className="text-[15px] font-bold">Nenhum contrato encontrado</p>
          <p className="text-[13px] opacity-60">Crie o primeiro contrato clicando em "Novo Contrato"</p>
          <button onClick={() => setModalOpen(true)} className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-[13px] font-bold border border-primary/20 hover:bg-primary/20 transition-all">
            <Plus className="w-4 h-4" /> Criar Contrato
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtrados.map(c => (
            <ContratoCard key={c.id} contrato={c} onStatusChange={onStatusChange} onDelete={onDelete} />
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <ModalNovoContrato onClose={() => setModalOpen(false)} onSaved={async () => { setModalOpen(false); await carregar() }} />
        )}
      </AnimatePresence>
    </div>
  )
}
