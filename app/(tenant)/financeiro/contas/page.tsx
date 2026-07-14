"use client"

import { useState, useEffect, useCallback } from "react"
import {
  DollarSign, TrendingUp, AlertTriangle, CheckCircle2,
  Clock, Search, Filter, Plus, ArrowUpRight, Download,
  ChevronRight, Loader2, ServerCrash, RefreshCw, X,
  FileText, CircleDot, CheckSquare, XCircle, Receipt,
  BarChart2, ClipboardList, Bot, CreditCard, Banknote,
  TrendingDown, ArrowDownLeft, ArrowUpLeft, Send
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLayout } from "@/components/layout/LayoutProvider"
import {
  buscarKPIsCobrancas, buscarCobrancas, buscarOSParaFaturar,
  registrarRecebimento, criarCobrancaManual, cancelarCobranca,
  buscarAgingReport
} from "@/app/actions/cobrancas"
import { gerarCobrancaOS } from "@/app/actions/os"

// ─── Tipos locais ─────────────────────────────────────────────────────────────
type TabId = "resumo" | "areceber" | "apagar" | "os_faturar" | "aging"

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: "resumo",     label: "Resumo",         icon: BarChart2 },
  { id: "areceber",   label: "A Receber",       icon: ArrowDownLeft },
  { id: "apagar",     label: "A Pagar",         icon: ArrowUpLeft },
  { id: "os_faturar", label: "OS → Faturar",    icon: ClipboardList },
  { id: "aging",      label: "Aging Report",    icon: AlertTriangle },
]

const STATUS_CFG: Record<string, { label: string; cor: string; bg: string; dot: string }> = {
  pendente: { label: "Pendente",  cor: "#F59E0B", bg: "bg-amber-50",   dot: "bg-amber-400" },
  pago:     { label: "Pago",     cor: "#22C55E", bg: "bg-emerald-50", dot: "bg-emerald-400" },
  vencido:  { label: "Vencido",  cor: "#EF4444", bg: "bg-red-50",     dot: "bg-red-400" },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
function fmtData(d: any) {
  return new Date(d).toLocaleDateString("pt-BR")
}
function isVencida(d: any, status: string) {
  return status === "pendente" && new Date(d) < new Date()
}
function diasVencido(d: any) {
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000)
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Sk({ className }: { className?: string }) {
  return <div className={cn("animate-pulse bg-slate-200 rounded-lg", className)} />
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KPICard({ label, valor, icon: Icon, cor, sub, alerta, onClick }: {
  label: string; valor: string; icon: any; cor: string
  sub?: string; alerta?: boolean; onClick?: () => void
}) {
  return (
    <button onClick={onClick}
      className={cn(
        "bg-white border rounded-2xl p-4 flex items-center gap-4 text-left w-full transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.99] group",
        alerta ? "border-red-200 shadow-[0_0_0_1px_rgba(239,68,68,0.08)]" : "border-slate-200"
      )}>
      <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
        style={{ backgroundColor: `${cor}15` }}>
        <Icon className="w-5 h-5" style={{ color: cor }} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-[22px] font-black leading-tight mt-0.5" style={{ color: alerta ? "#EF4444" : "#0D0F1A" }}>{valor}</p>
        {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
    </button>
  )
}

// ─── Modal: Baixa de recebimento ──────────────────────────────────────────────
function ModalBaixa({ lancamento, onClose, onConfirm }: {
  lancamento: any; onClose: () => void; onConfirm: (id: string, data?: string) => void
}) {
  const [data, setData] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 text-base">Registrar Recebimento</h3>
              <p className="text-[11px] text-slate-500">{lancamento.descricao}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        <div className="space-y-4">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <span className="text-[13px] font-semibold text-slate-600">Valor a receber</span>
            <span className="text-xl font-black text-emerald-600">{fmt(lancamento.valor)}</span>
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-2">Data do recebimento</label>
            <input type="date" value={data} onChange={e => setData(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancelar
          </button>
          <button
            onClick={async () => { setLoading(true); await onConfirm(lancamento.id, data); setLoading(false); onClose() }}
            disabled={loading}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Confirmar Baixa
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Modal: Nova Cobrança ─────────────────────────────────────────────────────
function ModalNovaCobranca({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ descricao: "", valor: "", dataVenc: "", tipo: "receita" })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const handleSubmit = async () => {
    if (!form.descricao || !form.valor || !form.dataVenc) { setErro("Preencha todos os campos."); return }
    setLoading(true)
    const res = await criarCobrancaManual({
      descricao: form.descricao,
      valor: parseFloat(form.valor.replace(",", ".")),
      dataVenc: form.dataVenc,
      tipo: form.tipo,
    })
    setLoading(false)
    if (res.success) { onSuccess(); onClose() }
    else setErro(res.error ?? "Erro ao criar cobrança")
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Nova Cobrança</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Tipo</label>
            <div className="flex gap-2">
              {["receita", "despesa"].map(t => (
                <button key={t} onClick={() => setForm(f => ({ ...f, tipo: t }))}
                  className={cn("flex-1 py-2 rounded-xl text-[12px] font-black border transition-all",
                    form.tipo === t
                      ? t === "receita" ? "bg-emerald-50 border-emerald-400 text-emerald-700" : "bg-red-50 border-red-400 text-red-700"
                      : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100"
                  )}>
                  {t === "receita" ? "↓ Receita" : "↑ Despesa"}
                </button>
              ))}
            </div>
          </div>
          {[
            { label: "Descrição", key: "descricao", type: "text", placeholder: "Ex: Mensalidade contrato JAMPER" },
            { label: "Valor (R$)", key: "valor", type: "number", placeholder: "0,00" },
            { label: "Vencimento", key: "dataVenc", type: "date", placeholder: "" },
          ].map(f => (
            <div key={f.key}>
              <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder}
                value={(form as any)[f.key]}
                onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 placeholder:text-slate-400" />
            </div>
          ))}
          {erro && <p className="text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{erro}</p>}
        </div>

        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[13px] font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── ABA: RESUMO ──────────────────────────────────────────────────────────────
function AbaResumo({ kpis, onTabChange }: { kpis: any; onTabChange: (t: TabId) => void }) {
  const [aging, setAging] = useState<any[]>([])

  useEffect(() => { buscarAgingReport().then(setAging) }, [])

  if (!kpis) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <KPICard label="Total a Receber"  valor={fmt(kpis.totalAReceber)} icon={DollarSign}    cor="#059669" onClick={() => onTabChange("areceber")} />
        <KPICard label="Vencidas"         valor={fmt(kpis.vencidas)}      icon={AlertTriangle}  cor="#EF4444" alerta={kpis.vencidasQtd > 0} sub={`${kpis.vencidasQtd} cobranças`} onClick={() => onTabChange("aging")} />
        <KPICard label="A Vencer 30 dias" valor={fmt(kpis.aVencer30)}     icon={Clock}          cor="#F59E0B" onClick={() => onTabChange("areceber")} />
        <KPICard label="Recebido no Mês"  valor={fmt(kpis.recebidoMes)}   icon={CheckCircle2}   cor="#22C55E" onClick={() => onTabChange("areceber")} />
        <KPICard label="OS não Faturadas" valor={`${kpis.osNaoFaturadas}`} icon={ClipboardList} cor="#F97316" alerta={kpis.osNaoFaturadas > 0} sub={fmt(kpis.valorOsNaoFaturadas)} onClick={() => onTabChange("os_faturar")} />
      </div>

      {/* Alertas */}
      <div className="space-y-2.5">
        {kpis.vencidasQtd > 0 && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <p className="text-[13px] font-black text-red-700 flex-1">
              {kpis.vencidasQtd} cobrança{kpis.vencidasQtd > 1 ? "s" : ""} vencida{kpis.vencidasQtd > 1 ? "s" : ""} — {fmt(kpis.vencidas)} em atraso
            </p>
            <button onClick={() => onTabChange("aging")}
              className="text-[11.5px] font-black text-red-700 bg-red-100 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1.5 shrink-0">
              Ver Aging <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
        {kpis.osNaoFaturadas > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
            <ClipboardList className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[13px] font-black text-amber-700 flex-1">
              {kpis.osNaoFaturadas} OS concluída{kpis.osNaoFaturadas > 1 ? "s" : ""} aguardando faturamento — {fmt(kpis.valorOsNaoFaturadas)}
            </p>
            <button onClick={() => onTabChange("os_faturar")}
              className="text-[11.5px] font-black text-amber-700 bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-200 transition-colors flex items-center gap-1.5 shrink-0">
              Faturar Agora <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Aging resumido */}
      {aging.length > 0 && (
        <div>
          <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" /> Inadimplência por Faixa
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {aging.map((f: any, i: number) => {
              const cors = ["#F59E0B", "#F97316", "#EF4444", "#DC2626"]
              const cor = cors[i] ?? "#EF4444"
              return (
                <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-all">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{f.label}</p>
                  <p className="text-[20px] font-black mt-1" style={{ color: cor }}>{fmt(f.valor)}</p>
                  <p className="text-[11px] text-slate-500 font-medium">{f.qtd} cobrança{f.qtd !== 1 ? "s" : ""}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ABA: LISTAGEM (A RECEBER / A PAGAR) ──────────────────────────────────────
function AbaListagem({ tipo }: { tipo: "receita" | "despesa" }) {
  const [dados, setDados] = useState<any>({ total: 0, paginas: 0, pagina: 1, itens: [] })
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [pagina, setPagina] = useState(1)
  const [modalBaixa, setModalBaixa] = useState<any>(null)
  const [reload, setReload] = useState(0)

  const carregar = useCallback(async () => {
    setLoading(true)
    const res = await buscarCobrancas({ tipo, busca: busca || undefined, status: filtroStatus !== "todos" ? filtroStatus : undefined, pagina })
    setDados(res)
    setLoading(false)
  }, [tipo, busca, filtroStatus, pagina, reload])

  useEffect(() => { carregar() }, [carregar])

  const handleBaixa = async (id: string, data?: string) => {
    await registrarRecebimento(id, data)
    setReload(r => r + 1)
  }

  const cor = tipo === "receita" ? "#059669" : "#EF4444"

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" value={busca} onChange={e => { setBusca(e.target.value); setPagina(1) }}
            placeholder="Buscar descrição..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-emerald-400 transition-all" />
        </div>
        <select value={filtroStatus} onChange={e => { setFiltroStatus(e.target.value); setPagina(1) }}
          className="text-[12px] font-bold bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 outline-none cursor-pointer text-slate-600">
          <option value="todos">Todos os status</option>
          <option value="pendente">Pendente</option>
          <option value="pago">Pago</option>
          <option value="vencido">Vencido</option>
        </select>
        <span className="ml-auto text-[12px] font-bold text-slate-500">{dados.total} registros</span>
      </div>

      {/* Tabela */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>
        ) : dados.itens.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center">
              <Receipt className="w-7 h-7 text-slate-400" />
            </div>
            <p className="font-black text-slate-700">Nenhuma cobrança encontrada</p>
            <p className="text-sm text-slate-400">Ajuste os filtros ou crie uma nova.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/80 border-b border-slate-200 sticky top-0">
                <tr>
                  {["Descrição", "Vencimento", "Valor", "Status", "Ações"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-black uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dados.itens.map((l: any) => {
                  const st = STATUS_CFG[l.status] ?? STATUS_CFG.pendente
                  const venc = isVencida(l.dataVenc, l.status)
                  const dias = venc ? diasVencido(l.dataVenc) : 0
                  return (
                    <tr key={l.id} className={cn("group hover:bg-slate-50 transition-colors", venc && "bg-red-50/30")}>
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-bold text-slate-900 line-clamp-1">{l.descricao}</p>
                        {venc && <p className="text-[10.5px] font-black text-red-600 mt-0.5">{dias} dia{dias !== 1 ? "s" : ""} em atraso</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className={cn("text-[12.5px] font-semibold", venc ? "text-red-600 font-black" : "text-slate-600")}>
                          {fmtData(l.dataVenc)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-[14px] font-black" style={{ color: cor }}>{fmt(l.valor)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-full", st.bg)}
                          style={{ color: st.cor }}>
                          <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {l.status === "pendente" && tipo === "receita" && (
                            <button onClick={() => setModalBaixa(l)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-black rounded-lg transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Baixa
                            </button>
                          )}
                          {l.status === "pendente" && (
                            <button onClick={async () => { await cancelarCobranca(l.id); setReload(r => r + 1) }}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[11px] font-black rounded-lg transition-colors">
                              <XCircle className="w-3.5 h-3.5" /> Cancelar
                            </button>
                          )}
                        </div>
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

      {modalBaixa && (
        <ModalBaixa lancamento={modalBaixa} onClose={() => setModalBaixa(null)} onConfirm={handleBaixa} />
      )}
    </div>
  )
}

// ─── ABA: OS PARA FATURAR ────────────────────────────────────────────────────
function AbaOSFaturar() {
  const [itens, setItens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [gerando, setGerando] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    buscarOSParaFaturar().then(res => { setItens(res as any[]); setLoading(false) })
  }, [reload])

  const handleGerar = async (osId: string) => {
    setGerando(osId)
    await gerarCobrancaOS(osId)
    setGerando(null)
    setReload(r => r + 1)
  }

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>

  if (itens.length === 0) return (
    <div className="flex flex-col items-center py-20 gap-4">
      <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      <p className="font-black text-slate-700 text-base">Nenhuma OS pendente de faturamento</p>
      <p className="text-sm text-slate-500">Todas as OS concluídas já foram faturadas.</p>
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-sm font-bold text-slate-600">{itens.length} OS aguardando faturamento</p>
        <button className="flex items-center gap-1.5 text-[12px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors">
          <Send className="w-3.5 h-3.5" /> Faturar Todas
        </button>
      </div>

      {itens.map((os: any) => (
        <div key={os.id} className="bg-white border border-slate-200 hover:border-emerald-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono text-[11.5px] font-bold text-slate-400">#{os.numeroOS}</span>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Não faturada</span>
              </div>
              <p className="font-black text-slate-900 text-[14px]">{os.titulo}</p>
              <p className="text-[12px] text-slate-500 mt-0.5">{os.cliente?.nome} · Técnico: {os.tecnico?.nome}</p>
            </div>
            <div className="flex flex-col items-end gap-3 shrink-0">
              <p className="text-[18px] font-black text-emerald-700">{fmt(os.valorFinal ?? os.valorPrevisto ?? 0)}</p>
              <button
                onClick={() => handleGerar(os.id)}
                disabled={gerando === os.id}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[12px] font-black rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60">
                {gerando === os.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5" />}
                Gerar Cobrança
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── ABA: AGING REPORT ────────────────────────────────────────────────────────
function AbaAging() {
  const [aging, setAging] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [detalhes, setDetalhes] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      buscarAgingReport().then(setAging),
      buscarCobrancas({ status: "pendente", tipo: "receita", vencidas: true, porPagina: 50 }).then(r => setDetalhes(r.itens))
    ]).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-emerald-500" /></div>

  const cors = ["#F59E0B", "#F97316", "#EF4444", "#DC2626"]
  const totalVencido = aging.reduce((acc, f) => acc + f.valor, 0)

  return (
    <div className="space-y-6">
      {/* Resumo por faixa */}
      <div>
        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
          <BarChart2 className="w-3.5 h-3.5" /> Inadimplência por Faixa de Vencimento
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {aging.map((f: any, i: number) => {
            const cor = cors[i] ?? "#EF4444"
            const pct = totalVencido > 0 ? (f.valor / totalVencido) * 100 : 0
            return (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider leading-tight">{f.label}</p>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cor}15`, color: cor }}>
                    {pct.toFixed(0)}%
                  </span>
                </div>
                <p className="text-[22px] font-black" style={{ color: cor }}>{fmt(f.valor)}</p>
                <p className="text-[11px] text-slate-500 font-medium mt-0.5">{f.qtd} cobrança{f.qtd !== 1 ? "s" : ""}</p>
                {/* Mini barra */}
                <div className="h-1.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: cor }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detalhamento */}
      {detalhes.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">Cobranças vencidas — {detalhes.length} registros</p>
            <p className="text-[13px] font-black text-red-600">{fmt(totalVencido)} em atraso</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/60 border-b border-slate-100">
                <tr>
                  {["Descrição", "Vencimento", "Atraso", "Valor", "Ação"].map(h => (
                    <th key={h} className="px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-wider text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {detalhes.map((l: any) => {
                  const dias = diasVencido(l.dataVenc)
                  const cor = dias <= 15 ? "#F59E0B" : dias <= 30 ? "#F97316" : dias <= 60 ? "#EF4444" : "#DC2626"
                  return (
                    <tr key={l.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-4 py-3 text-[12.5px] font-semibold text-slate-900 max-w-[200px] truncate">{l.descricao}</td>
                      <td className="px-4 py-3 text-[12px] font-semibold text-red-600">{fmtData(l.dataVenc)}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-full" style={{ backgroundColor: `${cor}15`, color: cor }}>
                          {dias}d
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[14px] font-black text-red-600">{fmt(l.valor)}</td>
                      <td className="px-4 py-3">
                        <button className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-black rounded-lg transition-all">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Cobrar
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ─────────────────────────────────────────────────────────
export default function ContasPage() {
  const [tab, setTab] = useState<TabId>("resumo")
  const [kpis, setKpis] = useState<any>(null)
  const [modalNova, setModalNova] = useState(false)
  const [reload, setReload] = useState(0)
  const { openIAPanel } = useLayout()

  useEffect(() => {
    buscarKPIsCobrancas().then(setKpis)
  }, [reload])

  return (
    <div className="flex flex-col gap-5 w-full max-w-full pb-10">

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg,#059669,#047857)", boxShadow: "0 4px 14px #05966930" }}>
            <Receipt className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">Cobranças</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Link href="/financeiro" className="text-[11px] text-slate-400 hover:text-slate-600 font-semibold transition-colors">Financeiro</Link>
              <span className="text-slate-300 text-[10px]">›</span>
              <span className="text-[11px] text-slate-600 font-semibold">Contas</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => openIAPanel("financeiro")}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[13px] font-black rounded-xl transition-all">
            <Bot className="w-4 h-4" /> JARMIS
          </button>
          <button onClick={() => setModalNova(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-black rounded-xl shadow-sm transition-all text-[13px]">
            <Plus className="w-4 h-4" /> Nova Cobrança
          </button>
        </div>
      </div>

      {/* ── TABS ── */}
      <div className="overflow-x-auto pb-0.5 -mx-1 px-1">
        <div className="flex items-center gap-1 bg-slate-100/80 border border-slate-200 rounded-xl p-1 min-w-max">
          {TABS.map(t => {
            const Icon = t.icon
            const isActive = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap",
                  isActive ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                )}>
                <Icon className="w-3.5 h-3.5" style={isActive ? { color: "#059669" } : {}} />
                {t.label}
                {t.id === "aging" && kpis?.vencidasQtd > 0 && (
                  <span className="text-[9px] font-black bg-red-500 text-white px-1.5 py-0.5 rounded-full ml-0.5">{kpis.vencidasQtd}</span>
                )}
                {t.id === "os_faturar" && kpis?.osNaoFaturadas > 0 && (
                  <span className="text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.5 rounded-full ml-0.5">{kpis.osNaoFaturadas}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      {tab === "resumo"     && <AbaResumo kpis={kpis} onTabChange={setTab} />}
      {tab === "areceber"   && <AbaListagem tipo="receita" />}
      {tab === "apagar"     && <AbaListagem tipo="despesa" />}
      {tab === "os_faturar" && <AbaOSFaturar />}
      {tab === "aging"      && <AbaAging />}

      {/* Modais */}
      {modalNova && (
        <ModalNovaCobranca
          onClose={() => setModalNova(false)}
          onSuccess={() => setReload(r => r + 1)}
        />
      )}
    </div>
  )
}
