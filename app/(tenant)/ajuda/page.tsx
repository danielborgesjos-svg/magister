"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  HelpCircle, Plus, X, Search, RefreshCw, MessageSquare,
  CheckCircle2, Clock, AlertTriangle, ChevronDown, Send,
  BookOpen, Video, FileText, Zap, Headphones, ShieldCheck,
  Circle, CheckCheck, PlayCircle, ExternalLink, BadgeCheck,
  LifeBuoy, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { criarChamado, buscarChamados, atualizarStatusChamado } from "@/app/actions/chamados"

// ─── Constantes ───────────────────────────────────────────────────────────────
const PRIORIDADES = [
  { id: "baixa",   label: "Baixa",   cls: "bg-slate-500/10 text-slate-600 border-slate-500/20"  },
  { id: "media",   label: "Média",   cls: "bg-amber-500/10 text-amber-600 border-amber-500/20"  },
  { id: "alta",    label: "Alta",    cls: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { id: "critica", label: "Crítica", cls: "bg-red-500/10 text-red-600 border-red-500/20"        },
]
const STATUS_MAP: Record<string, { label: string; cls: string; icon: any }> = {
  aberto:        { label: "Aberto",        cls: "bg-blue-500/10 text-blue-600 border-blue-500/20",       icon: Circle },
  em_andamento:  { label: "Em Andamento",  cls: "bg-amber-500/10 text-amber-600 border-amber-500/20",    icon: Clock },
  resolvido:     { label: "Resolvido",     cls: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20", icon: CheckCheck },
}
const CATEGORIAS = [
  "Dúvida de uso", "Erro no sistema", "Solicitação de recurso",
  "Financeiro / Cobrança", "Integração", "Acesso / Permissão", "Outro"
]
const ARTIGOS = [
  { titulo: "Como criar uma Ordem de Serviço?", categoria: "OS", tempo: "3 min" },
  { titulo: "Configurar fluxo financeiro e lançamentos", categoria: "Financeiro", tempo: "5 min" },
  { titulo: "Gestão de equipes e técnicos", categoria: "Equipe", tempo: "4 min" },
  { titulo: "Módulo CRM — pipeline de vendas", categoria: "CRM", tempo: "6 min" },
  { titulo: "Contratos: como anexar PDFs", categoria: "Contratos", tempo: "2 min" },
  { titulo: "Configurar notificações do WhatsApp", categoria: "Integração", tempo: "7 min" },
]

// ─── Novo Chamado Modal ───────────────────────────────────────────────────────
function ModalNovoChamado({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ assunto: "", descricao: "", prioridade: "media", categoria: "Dúvida de uso" })
  const [saving, setSaving] = useState(false)

  async function salvar() {
    if (!form.assunto || !form.descricao) return
    setSaving(true)
    await criarChamado(form)
    setSaving(false)
    onSaved()
  }

  const inputCls = "w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50"

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
        initial={{ scale: 0.93, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-gradient-to-r from-primary/5 to-violet-500/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Headphones className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-[15px] font-black text-foreground">Abrir Chamado</h2>
              <p className="text-[11.5px] text-muted-foreground">Nossa equipe responde em até 24h</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-foreground/70">Categoria <span className="text-red-500">*</span></label>
            <div className="relative">
              <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))} className={inputCls + " appearance-none cursor-pointer"}>
                {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-foreground/70">Assunto <span className="text-red-500">*</span></label>
            <input
              value={form.assunto}
              onChange={e => setForm(f => ({ ...f, assunto: e.target.value }))}
              placeholder="Resuma o problema em uma frase..."
              className={inputCls}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-foreground/70">Descrição detalhada <span className="text-red-500">*</span></label>
            <textarea
              value={form.descricao}
              onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))}
              rows={4}
              placeholder="Descreva o problema com detalhes — passo a passo, o que esperava e o que aconteceu..."
              className={inputCls + " resize-none"}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[12px] font-semibold text-foreground/70">Prioridade</label>
            <div className="flex gap-2 flex-wrap">
              {PRIORIDADES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setForm(f => ({ ...f, prioridade: p.id }))}
                  className={cn(
                    "px-3 py-1.5 rounded-xl text-[12px] font-bold border transition-all",
                    form.prioridade === p.id ? p.cls : "border-border text-muted-foreground hover:border-muted-foreground/40"
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-all">
            Cancelar
          </button>
          <button
            onClick={salvar}
            disabled={saving || !form.assunto || !form.descricao}
            className="flex-1 py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 disabled:opacity-40 transition-all flex items-center justify-center gap-2 shadow-md shadow-primary/20"
          >
            {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            {saving ? "Enviando..." : "Abrir Chamado"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Página ───────────────────────────────────────────────────────────────────
export default function AjudaPage() {
  const [chamados, setChamados] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [filtroStatus, setFiltroStatus] = useState("todos")

  async function carregar() {
    setLoading(true)
    const c = await buscarChamados()
    setChamados(c)
    setLoading(false)
  }
  useEffect(() => { carregar() }, [])

  async function onStatusChange(id: string, status: string) {
    await atualizarStatusChamado(id, status)
    setChamados(p => p.map(c => c.id === id ? { ...c, status } : c))
  }

  const filtrados = chamados.filter(c => filtroStatus === "todos" || c.status === filtroStatus)

  const kpis = [
    { label: "Total de Chamados", val: chamados.length, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-500/15" },
    { label: "Abertos", val: chamados.filter(c => c.status === "aberto").length, icon: Circle, color: "text-amber-600", bg: "bg-amber-500/15", urgent: chamados.some(c => c.status === "aberto") },
    { label: "Em Andamento", val: chamados.filter(c => c.status === "em_andamento").length, icon: Clock, color: "text-orange-600", bg: "bg-orange-500/15" },
    { label: "Resolvidos", val: chamados.filter(c => c.status === "resolvido").length, icon: CheckCheck, color: "text-emerald-600", bg: "bg-emerald-500/15" },
  ]

  return (
    <div className="w-full max-w-[1400px] mx-auto pb-16 space-y-6">

      {/* ── Header ── */}
      <div className="flex items-start justify-between pt-2 gap-4">
        <div>
          <h1 className="text-[22px] font-black text-foreground tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-violet-500/10 border border-primary/20 flex items-center justify-center">
              <LifeBuoy className="w-5 h-5 text-primary" />
            </div>
            Central de Ajuda
          </h1>
          <p className="text-[13px] text-muted-foreground font-medium mt-1 ml-[52px]">
            Chamados de suporte · Base de conhecimento · Tutoriais
          </p>
        </div>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all shadow-md shadow-primary/20 shrink-0">
          <Plus className="w-4 h-4" /> Abrir Chamado
        </button>
      </div>

      {/* ── Hero banner ── */}
      <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-r from-primary/10 via-violet-500/5 to-transparent p-8">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        <div className="relative z-10 flex items-center justify-between gap-8">
          <div>
            <h2 className="text-[20px] font-black text-foreground">Precisando de ajuda?</h2>
            <p className="text-[13.5px] text-muted-foreground mt-1.5 max-w-lg">
              Abra um chamado e nossa equipe retorna em até <strong className="text-foreground">24 horas</strong>.
              Para emergências, use a prioridade <strong className="text-red-600">Crítica</strong>.
            </p>
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all shadow-sm">
                <Headphones className="w-4 h-4" /> Falar com Suporte
              </button>
              <div className="flex items-center gap-2 text-[12px] font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Suporte online agora
              </div>
            </div>
          </div>
          <div className="hidden lg:flex flex-col items-center gap-2 shrink-0">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Headphones className="w-10 h-10 text-primary/60" />
            </div>
            <p className="text-[11px] font-bold text-muted-foreground text-center">SLA 24h</p>
          </div>
        </div>
      </div>

      {/* ── KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className={cn("bg-card border rounded-2xl p-5 flex flex-col gap-2.5 transition-all hover:shadow-md", k.urgent ? "border-amber-500/30 bg-amber-500/5" : "border-border")}>
            <div className="flex items-center justify-between">
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", k.bg)}>
                <k.icon className={cn("w-4 h-4", k.color)} />
              </div>
              {k.urgent && <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </div>
            <span className="text-[28px] font-black text-foreground leading-none">{k.val}</span>
            <p className="text-[12px] font-semibold text-muted-foreground">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Chamados ── */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[15px] font-black text-foreground">Meus Chamados</h3>
            <div className="flex items-center gap-2">
              <div className="relative">
                <select value={filtroStatus} onChange={e => setFiltroStatus(e.target.value)} className="bg-card border border-border rounded-xl px-3 py-1.5 text-[12px] font-medium text-foreground outline-none appearance-none cursor-pointer pr-7">
                  <option value="todos">Todos</option>
                  {Object.entries(STATUS_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
              </div>
              <button onClick={carregar} className="p-1.5 rounded-xl border border-border text-muted-foreground hover:text-foreground transition-all">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" /> Carregando chamados...
            </div>
          ) : filtrados.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 border border-dashed border-border rounded-2xl text-muted-foreground">
              <MessageSquare className="w-12 h-12 opacity-20" />
              <p className="font-bold">Nenhum chamado encontrado</p>
              <button onClick={() => setModalOpen(true)} className="text-[13px] text-primary font-bold flex items-center gap-1 hover:underline">
                <Plus className="w-3.5 h-3.5" /> Abrir primeiro chamado
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filtrados.map(c => {
                const sc = STATUS_MAP[c.status] ?? STATUS_MAP.aberto
                const pr = PRIORIDADES.find(p => p.id === c.prioridade) ?? PRIORIDADES[1]
                const StatusIcon = sc.icon
                return (
                  <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm transition-all group">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border", sc.cls)}>
                            <StatusIcon className="w-3 h-3" />{sc.label}
                          </span>
                          <span className={cn("px-2 py-0.5 rounded-lg text-[11px] font-bold border", pr.cls)}>{pr.label}</span>
                          <span className="text-[10.5px] text-muted-foreground/60 font-mono">#{c.id.slice(-6).toUpperCase()}</span>
                        </div>
                        <p className="text-[14px] font-bold text-foreground">{c.assunto}</p>
                        <p className="text-[12px] text-muted-foreground mt-1 line-clamp-2">{c.descricao}</p>
                        <p className="text-[11px] text-muted-foreground/60 mt-2 font-medium">
                          Aberto em {new Date(c.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                      {/* Quick actions */}
                      <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {c.status !== "em_andamento" && (
                          <button onClick={() => onStatusChange(c.id, "em_andamento")} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20 hover:bg-amber-500/20 transition-all whitespace-nowrap">
                            Em andamento
                          </button>
                        )}
                        {c.status !== "resolvido" && (
                          <button onClick={() => onStatusChange(c.id, "resolvido")} className="px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all">
                            Resolver
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Base de Conhecimento ── */}
        <div className="space-y-4">
          <h3 className="text-[15px] font-black text-foreground">Base de Conhecimento</h3>
          <div className="space-y-2">
            {ARTIGOS.map((art, i) => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4 hover:border-primary/20 hover:shadow-sm transition-all cursor-pointer group flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{art.titulo}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{art.categoria} · {art.tempo} de leitura</p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
              </div>
            ))}
          </div>

          {/* Links rápidos */}
          <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
            <p className="text-[12px] font-black text-foreground uppercase tracking-widest">Recursos Rápidos</p>
            {[
              { label: "Tutoriais em vídeo", icon: PlayCircle, color: "text-red-500" },
              { label: "Documentação técnica", icon: FileText, color: "text-blue-600" },
              { label: "Changelog / Novidades", icon: Zap, color: "text-amber-600" },
            ].map(r => (
              <div key={r.label} className="flex items-center gap-2.5 py-1.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                <r.icon className={cn("w-4 h-4 shrink-0", r.color)} />
                {r.label}
                <ExternalLink className="w-3 h-3 ml-auto opacity-40" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ModalNovoChamado onClose={() => setModalOpen(false)} onSaved={async () => { setModalOpen(false); await carregar() }} />
        )}
      </AnimatePresence>
    </div>
  )
}
