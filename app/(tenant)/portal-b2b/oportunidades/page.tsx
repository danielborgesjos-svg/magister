"use client"

import { useState } from "react"
import {
  FileSearch, CheckCircle2, XCircle, Clock, AlertTriangle,
  ChevronRight, Plus, Eye, Download, Send, Printer,
  Building2, User, Package, Calendar, DollarSign,
  ArrowRight, Zap, X, Check, MoreHorizontal, Filter, Search
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ─────────────────────────────────────────────────────────────────────
type StatusCotacao = "aguardando" | "em_analise" | "aprovada" | "rejeitada" | "expirada" | "boleto_emitido"

interface ItemCotacao {
  produto: string
  quantidade: number
  precoUnit: number
  desconto?: number
}

interface Cotacao {
  id: string
  numero: string
  empresa: string
  contato: string
  cidade: string
  dataEmissao: string
  dataValidade: string
  status: StatusCotacao
  itens: ItemCotacao[]
  observacoes?: string
  vendedor: string
  prioridade: "alta" | "media" | "baixa"
  historico: { data: string; acao: string; usuario: string }[]
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const COTACOES_MOCK: Cotacao[] = [
  {
    id: "q1", numero: "COT-2026-0047",
    empresa: "Indústria Metalúrgica Sul", contato: "Roberto Souza", cidade: "Porto Alegre",
    dataEmissao: "2026-07-10", dataValidade: "2026-07-24", status: "em_analise",
    prioridade: "alta", vendedor: "Tiago Alves",
    itens: [
      { produto: "Servidor Dell PowerEdge R740", quantidade: 2, precoUnit: 28500 },
      { produto: "Rack 42U 19\" Padrão", quantidade: 2, precoUnit: 3900 },
      { produto: "Nobreak APC Smart-UPS 3000VA", quantidade: 2, precoUnit: 9400, desconto: 5 },
    ],
    observacoes: "Necessidade de entrega em até 15 dias úteis. Prazo crítico para expansão do datacenter.",
    historico: [
      { data: "2026-07-10 09:32", acao: "Cotação criada pelo portal", usuario: "Sistema" },
      { data: "2026-07-11 14:15", acao: "Encaminhada para análise comercial", usuario: "Tiago Alves" },
      { data: "2026-07-12 10:00", acao: "Contato com cliente realizado — confirmando especificações", usuario: "Tiago Alves" },
    ]
  },
  {
    id: "q2", numero: "COT-2026-0046",
    empresa: "Grupo Delta Engenharia", contato: "Ana Costa", cidade: "Brasília",
    dataEmissao: "2026-07-09", dataValidade: "2026-07-23", status: "aguardando",
    prioridade: "alta", vendedor: "Carla Dias",
    itens: [
      { produto: "Workstation HP Z4 G4", quantidade: 5, precoUnit: 14200, desconto: 8 },
      { produto: "Monitor LG UltraSharp 34\" Curvo", quantidade: 5, precoUnit: 3100 },
    ],
    observacoes: "Licitação interna — necessário aprovação do comitê de TI.",
    historico: [
      { data: "2026-07-09 11:00", acao: "Cotação criada pelo portal", usuario: "Sistema" },
    ]
  },
  {
    id: "q3", numero: "COT-2026-0045",
    empresa: "Tech Solutions", contato: "Lucas Oliveira", cidade: "Florianópolis",
    dataEmissao: "2026-07-08", dataValidade: "2026-07-22", status: "aprovada",
    prioridade: "media", vendedor: "Rafael Souza",
    itens: [
      { produto: "Firewall Fortinet FortiGate 60F", quantidade: 1, precoUnit: 7800 },
      { produto: "Access Point Ubiquiti UniFi U6 Pro", quantidade: 6, precoUnit: 1290 },
      { produto: "Switch Cisco Catalyst 2960", quantidade: 2, precoUnit: 4200, desconto: 3 },
    ],
    observacoes: "Aprovação realizada pelo diretor de TI via e-mail.",
    historico: [
      { data: "2026-07-08 15:30", acao: "Cotação criada pelo portal", usuario: "Sistema" },
      { data: "2026-07-09 09:00", acao: "Encaminhada para análise", usuario: "Rafael Souza" },
      { data: "2026-07-10 11:20", acao: "Aprovada pelo cliente", usuario: "Lucas Oliveira" },
      { data: "2026-07-11 08:00", acao: "Pedido de compra gerado #ORD-2026-003", usuario: "Rafael Souza" },
    ]
  },
  {
    id: "q4", numero: "COT-2026-0044",
    empresa: "Logística Nacional", contato: "Carlos Mendes", cidade: "São Paulo",
    dataEmissao: "2026-07-07", dataValidade: "2026-07-21", status: "boleto_emitido",
    prioridade: "media", vendedor: "Tiago Alves",
    itens: [
      { produto: "Storage NAS Synology DS920+", quantidade: 3, precoUnit: 5600 },
      { produto: "Licença Veeam Backup Enterprise", quantidade: 3, precoUnit: 3500 },
    ],
    historico: [
      { data: "2026-07-07 10:00", acao: "Cotação criada", usuario: "Sistema" },
      { data: "2026-07-08 14:00", acao: "Aprovada", usuario: "Carlos Mendes" },
      { data: "2026-07-09 09:15", acao: "Boleto BAR-2024-00139 emitido", usuario: "Tiago Alves" },
    ]
  },
  {
    id: "q5", numero: "COT-2026-0043",
    empresa: "Varejista Central", contato: "Mariana Silva", cidade: "Curitiba",
    dataEmissao: "2026-07-05", dataValidade: "2026-07-19", status: "rejeitada",
    prioridade: "baixa", vendedor: "Carla Dias",
    itens: [
      { produto: "Impressora HP LaserJet Pro MFP", quantidade: 10, precoUnit: 2800, desconto: 10 },
    ],
    observacoes: "Cliente optou por fornecedor local com prazo menor.",
    historico: [
      { data: "2026-07-05 08:00", acao: "Cotação criada", usuario: "Sistema" },
      { data: "2026-07-06 16:00", acao: "Rejeitada pelo cliente — optou por outra proposta", usuario: "Mariana Silva" },
    ]
  },
  {
    id: "q6", numero: "COT-2026-0042",
    empresa: "Construtora Horizonte", contato: "Fernanda Lima", cidade: "Belo Horizonte",
    dataEmissao: "2026-07-03", dataValidade: "2026-07-17", status: "expirada",
    prioridade: "baixa", vendedor: "Rafael Souza",
    itens: [
      { produto: "Licença Microsoft 365 Business", quantidade: 50, precoUnit: 890 },
    ],
    historico: [
      { data: "2026-07-03 10:00", acao: "Cotação criada", usuario: "Sistema" },
      { data: "2026-07-17 23:59", acao: "Cotação expirada automaticamente", usuario: "Sistema" },
    ]
  },
  {
    id: "q7", numero: "COT-2026-0041",
    empresa: "Supermercados Líder", contato: "Paulo Ramos", cidade: "Salvador",
    dataEmissao: "2026-07-12", dataValidade: "2026-07-26", status: "aguardando",
    prioridade: "media", vendedor: "Carla Dias",
    itens: [
      { produto: "Switch Cisco Catalyst 2960", quantidade: 5, precoUnit: 4200 },
      { produto: "Access Point Ubiquiti UniFi U6 Pro", quantidade: 12, precoUnit: 1290, desconto: 5 },
    ],
    historico: [
      { data: "2026-07-12 14:00", acao: "Cotação criada pelo portal", usuario: "Sistema" },
    ]
  },
  {
    id: "q8", numero: "COT-2026-0040",
    empresa: "Rede de Franquias XYZ", contato: "João Pedro", cidade: "Rio de Janeiro",
    dataEmissao: "2026-07-11", dataValidade: "2026-07-25", status: "em_analise",
    prioridade: "alta", vendedor: "Tiago Alves",
    itens: [
      { produto: "Licença Microsoft 365 Business", quantidade: 120, precoUnit: 890, desconto: 12 },
      { produto: "Firewall Fortinet FortiGate 60F", quantidade: 3, precoUnit: 7800, desconto: 5 },
    ],
    observacoes: "Projeto de expansão de 40 novas franquias. Entrega faseada.",
    historico: [
      { data: "2026-07-11 09:00", acao: "Cotação criada pelo portal", usuario: "Sistema" },
      { data: "2026-07-13 10:30", acao: "Em análise com equipe de pricing", usuario: "Tiago Alves" },
    ]
  },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtDate = (d: string) => new Date(d.split(" ")[0]).toLocaleDateString("pt-BR")
const calcTotal = (itens: ItemCotacao[]) =>
  itens.reduce((acc, i) => acc + i.precoUnit * i.quantidade * (1 - (i.desconto || 0) / 100), 0)

const diasRestantes = (validade: string) => {
  const diff = new Date(validade).getTime() - new Date().getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

const STATUS_CFG: Record<StatusCotacao, { label: string; bg: string; text: string; icon: React.ReactNode; borderColor: string }> = {
  aguardando:     { label: "Aguardando",      bg: "bg-slate-100",   text: "text-slate-600",   icon: <Clock className="w-3.5 h-3.5" />,        borderColor: "border-slate-200" },
  em_analise:     { label: "Em Análise",      bg: "bg-amber-100",   text: "text-amber-700",   icon: <FileSearch className="w-3.5 h-3.5" />,    borderColor: "border-amber-200" },
  aprovada:       { label: "Aprovada",        bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 className="w-3.5 h-3.5" />,  borderColor: "border-emerald-200" },
  rejeitada:      { label: "Rejeitada",       bg: "bg-red-100",     text: "text-red-700",     icon: <XCircle className="w-3.5 h-3.5" />,       borderColor: "border-red-200" },
  expirada:       { label: "Expirada",        bg: "bg-zinc-100",    text: "text-zinc-500",    icon: <AlertTriangle className="w-3.5 h-3.5" />, borderColor: "border-zinc-200" },
  boleto_emitido: { label: "Boleto Emitido",  bg: "bg-blue-100",    text: "text-blue-700",    icon: <DollarSign className="w-3.5 h-3.5" />,    borderColor: "border-blue-200" },
}

const PRIORIDADE_CFG = {
  alta:  { label: "Alta",  dot: "bg-red-500" },
  media: { label: "Média", dot: "bg-amber-400" },
  baixa: { label: "Baixa", dot: "bg-slate-300" },
}

// ─── Modal Detalhes ────────────────────────────────────────────────────────────
function ModalCotacao({ cotacao, onClose, onAprovar, onRejeitar, onEmitirBoleto }: {
  cotacao: Cotacao
  onClose: () => void
  onAprovar: (id: string) => void
  onRejeitar: (id: string) => void
  onEmitirBoleto: (id: string) => void
}) {
  const total = calcTotal(cotacao.itens)
  const cfg = STATUS_CFG[cotacao.status]
  const dias = diasRestantes(cotacao.dataValidade)

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-2xl w-full max-w-4xl shadow-2xl max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-black text-lg tracking-tight">{cotacao.numero}</h2>
              <p className="text-sm text-muted-foreground">{cotacao.empresa} · {cotacao.vendedor}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold", cfg.bg, cfg.text)}>
              {cfg.icon} {cfg.label}
            </span>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-xl transition-colors"><X className="w-5 h-5" /></button>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal */}
          <div className="lg:col-span-2 space-y-5">
            {/* Alerta de validade */}
            {cotacao.status === "aguardando" || cotacao.status === "em_analise" ? (
              <div className={cn("flex items-center gap-3 p-3 rounded-xl border text-sm font-semibold",
                dias <= 3 ? "bg-red-50 border-red-200 text-red-700" :
                dias <= 7 ? "bg-amber-50 border-amber-200 text-amber-700" :
                "bg-emerald-50 border-emerald-200 text-emerald-700"
              )}>
                <Calendar className="w-4 h-4 flex-shrink-0" />
                {dias <= 0 ? "Cotação expirou!" : `Válida por mais ${dias} dia(s) — expira em ${fmtDate(cotacao.dataValidade)}`}
              </div>
            ) : null}

            {/* Itens da Cotação */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-muted/30 border-b border-border">
                <h3 className="font-bold text-sm flex items-center gap-2"><Package className="w-4 h-4 text-primary" /> Itens da Cotação</h3>
              </div>
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    {["Produto / Serviço", "Qtd", "Preço Unit.", "Desc.", "Subtotal"].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cotacao.itens.map((item, i) => {
                    const sub = item.precoUnit * item.quantidade * (1 - (item.desconto || 0) / 100)
                    return (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="px-4 py-3 text-sm font-medium">{item.produto}</td>
                        <td className="px-4 py-3 text-sm">{item.quantidade}x</td>
                        <td className="px-4 py-3 text-sm text-muted-foreground">{fmt(item.precoUnit)}</td>
                        <td className="px-4 py-3 text-sm">
                          {item.desconto ? <span className="text-emerald-600 font-semibold">{item.desconto}%</span> : <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="px-4 py-3 text-sm font-bold text-foreground">{fmt(sub)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div className="border-t border-border px-4 py-3 flex justify-end">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Total da Cotação</p>
                  <p className="text-2xl font-black text-primary">{fmt(total)}</p>
                </div>
              </div>
            </div>

            {/* Observações */}
            {cotacao.observacoes && (
              <div className="bg-muted/30 border border-border rounded-2xl p-4">
                <h3 className="font-bold text-sm mb-2">Observações do Cliente</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{cotacao.observacoes}</p>
              </div>
            )}

            {/* Timeline Histórico */}
            <div className="bg-card border border-border rounded-2xl p-4">
              <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Timeline da Cotação</h3>
              <div className="space-y-0">
                {cotacao.historico.map((h, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={cn("w-3 h-3 rounded-full mt-1 flex-shrink-0", i === 0 ? "bg-primary" : "bg-slate-300")} />
                      {i < cotacao.historico.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                    </div>
                    <div className={cn("pb-4", i === cotacao.historico.length - 1 ? "" : "")}>
                      <p className="text-sm font-semibold text-foreground">{h.acao}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{h.data} · {h.usuario}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Direita */}
          <div className="space-y-4">
            {/* Info Empresa */}
            <div className="bg-muted/30 border border-border rounded-2xl p-4 space-y-3">
              <h3 className="font-bold text-sm border-b border-border pb-2">Dados da Empresa</h3>
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">{cotacao.empresa}</p>
                  <p className="text-xs text-muted-foreground">{cotacao.cidade}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold">{cotacao.contato}</p>
                  <p className="text-xs text-muted-foreground">Responsável</p>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm pt-1 border-t border-border/50">
                <span className="text-muted-foreground">Vendedor</span>
                <span className="font-semibold">{cotacao.vendedor}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Emissão</span>
                <span className="font-semibold">{fmtDate(cotacao.dataEmissao)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Validade</span>
                <span className={cn("font-semibold", diasRestantes(cotacao.dataValidade) <= 3 ? "text-red-600" : "text-foreground")}>
                  {fmtDate(cotacao.dataValidade)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Prioridade</span>
                <span className="flex items-center gap-1.5 font-semibold">
                  <span className={cn("w-2 h-2 rounded-full", PRIORIDADE_CFG[cotacao.prioridade].dot)} />
                  {PRIORIDADE_CFG[cotacao.prioridade].label}
                </span>
              </div>
            </div>

            {/* JARMIS IA */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-600">✦</span>
                <p className="text-xs font-bold text-purple-700">JARMIS Sugere</p>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {cotacao.status === "aguardando"
                  ? `Cotação ${diasRestantes(cotacao.dataValidade) <= 5 ? "expira em breve! Priorize o contato com" : "aguardando. Recomendo ligar para"} ${cotacao.contato} para acelerar a decisão.`
                  : cotacao.status === "em_analise"
                  ? `Cliente ${cotacao.empresa} tem histórico de aprovação em 3-5 dias. Ticket médio acima do usual — pode qualificar desconto de fidelidade.`
                  : cotacao.status === "aprovada"
                  ? `Pedido aprovado! Emita o boleto imediatamente para garantir o fluxo de caixa desta semana.`
                  : `Esta cotação foi ${cotacao.status === "rejeitada" ? "rejeitada" : "expirada"}. Considere criar uma nova proposta com condições revisadas.`
                }
              </p>
            </div>

            {/* Ações */}
            <div className="space-y-2">
              {(cotacao.status === "aguardando" || cotacao.status === "em_analise") && (
                <>
                  <button
                    onClick={() => onAprovar(cotacao.id)}
                    className="w-full py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" /> Aprovar Cotação
                  </button>
                  <button
                    onClick={() => onRejeitar(cotacao.id)}
                    className="w-full py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <X className="w-4 h-4" /> Rejeitar
                  </button>
                </>
              )}
              {cotacao.status === "aprovada" && (
                <button
                  onClick={() => onEmitirBoleto(cotacao.id)}
                  className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Emitir Boleto
                </button>
              )}
              <button className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2 text-muted-foreground">
                <Printer className="w-4 h-4" /> Imprimir PDF
              </button>
              <button className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-2 text-muted-foreground">
                <Send className="w-4 h-4" /> Reenviar ao Cliente
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function CentralCotacoesPage() {
  const [cotacoes, setCotacoes] = useState<Cotacao[]>(COTACOES_MOCK)
  const [cotacaoSelecionada, setCotacaoSelecionada] = useState<Cotacao | null>(null)
  const [filtroStatus, setFiltroStatus] = useState<StatusCotacao | "todos">("todos")
  const [busca, setBusca] = useState("")
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null)

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const updateStatus = (id: string, status: StatusCotacao) => {
    setCotacoes(prev => prev.map(c => c.id === id ? { ...c, status } : c))
    setCotacaoSelecionada(prev => prev?.id === id ? { ...prev, status } : prev)
  }

  const handleAprovar = (id: string) => {
    updateStatus(id, "aprovada")
    showToast("Cotação aprovada! Emita o boleto para prosseguir.")
  }
  const handleRejeitar = (id: string) => {
    updateStatus(id, "rejeitada")
    showToast("Cotação rejeitada e arquivada.", "error")
    setCotacaoSelecionada(null)
  }
  const handleEmitirBoleto = (id: string) => {
    updateStatus(id, "boleto_emitido")
    showToast("Boleto gerado e enviado ao cliente por e-mail!")
    setCotacaoSelecionada(null)
  }

  const filtradas = cotacoes.filter(c =>
    (filtroStatus === "todos" || c.status === filtroStatus) &&
    (c.empresa.toLowerCase().includes(busca.toLowerCase()) || c.numero.toLowerCase().includes(busca.toLowerCase()))
  )

  const totais = {
    total: cotacoes.length,
    abertas: cotacoes.filter(c => c.status === "aguardando" || c.status === "em_analise").length,
    aprovadas: cotacoes.filter(c => c.status === "aprovada").length,
    valor_aberto: cotacoes.filter(c => ["aguardando", "em_analise", "aprovada"].includes(c.status)).reduce((a, c) => a + calcTotal(c.itens), 0),
  }

  const FILTROS: { key: StatusCotacao | "todos"; label: string }[] = [
    { key: "todos", label: "Todas" },
    { key: "aguardando", label: "Aguardando" },
    { key: "em_analise", label: "Em Análise" },
    { key: "aprovada", label: "Aprovadas" },
    { key: "boleto_emitido", label: "Boleto Emitido" },
    { key: "rejeitada", label: "Rejeitadas" },
    { key: "expirada", label: "Expiradas" },
  ]

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <FileSearch className="w-5 h-5" />
            </div>
            Central de Cotações
          </h1>
          <p className="text-sm text-muted-foreground mt-1 ml-14">Gerencie todo o ciclo de vida das cotações B2B — do pedido ao boleto.</p>
        </div>
        <button className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> Nova Cotação
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Total de Cotações</p>
          <p className="text-3xl font-black text-foreground mt-1">{totais.total}</p>
          <p className="text-xs text-muted-foreground mt-1">no período atual</p>
        </div>
        <div className="bg-card border border-amber-200 rounded-2xl p-4">
          <p className="text-xs text-amber-600 font-medium">Em Aberto</p>
          <p className="text-3xl font-black text-amber-700 mt-1">{totais.abertas}</p>
          <p className="text-xs text-muted-foreground mt-1">aguardando ou em análise</p>
        </div>
        <div className="bg-card border border-emerald-200 rounded-2xl p-4">
          <p className="text-xs text-emerald-600 font-medium">Aprovadas</p>
          <p className="text-3xl font-black text-emerald-700 mt-1">{totais.aprovadas}</p>
          <p className="text-xs text-muted-foreground mt-1">aguardando emissão</p>
        </div>
        <div className="bg-card border border-primary/30 rounded-2xl p-4">
          <p className="text-xs text-primary font-medium">Valor em Aberto</p>
          <p className="text-3xl font-black text-primary mt-1">{fmt(totais.valor_aberto).replace("R$", "R$\n")}</p>
          <p className="text-xs text-muted-foreground mt-1">potencial de receita</p>
        </div>
      </div>

      {/* Filtros + Busca */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por empresa ou número..."
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap bg-muted/50 p-1 rounded-xl">
          {FILTROS.map(f => (
            <button
              key={f.key}
              onClick={() => setFiltroStatus(f.key)}
              className={cn("px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors",
                filtroStatus === f.key ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Lista de Cotações */}
      <div className="space-y-3">
        {filtradas.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FileSearch className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Nenhuma cotação encontrada com os filtros selecionados.</p>
          </div>
        )}
        {filtradas.map(c => {
          const cfg = STATUS_CFG[c.status]
          const total = calcTotal(c.itens)
          const dias = diasRestantes(c.dataValidade)
          const isAtivo = c.status === "aguardando" || c.status === "em_analise"

          return (
            <div
              key={c.id}
              onClick={() => setCotacaoSelecionada(c)}
              className={cn(
                "bg-card border rounded-2xl p-4 sm:p-5 cursor-pointer hover:shadow-md transition-all group",
                cfg.borderColor,
                isAtivo && dias <= 3 ? "ring-1 ring-red-400" : ""
              )}
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Status icon */}
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0", cfg.bg, cfg.text)}>
                  {cfg.icon}
                </div>

                {/* Info principal */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{c.numero}</span>
                    <span className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold", cfg.bg, cfg.text)}>
                      {cfg.icon} {cfg.label}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span className={cn("w-1.5 h-1.5 rounded-full", PRIORIDADE_CFG[c.prioridade].dot)} />
                      {PRIORIDADE_CFG[c.prioridade].label}
                    </span>
                    {isAtivo && dias <= 5 && (
                      <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", dias <= 3 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700")}>
                        ⚠ {dias <= 0 ? "Expirou!" : `${dias}d restante(s)`}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-base mt-0.5">{c.empresa}</p>
                  <p className="text-sm text-muted-foreground">{c.contato} · {c.cidade} · Vendedor: {c.vendedor}</p>
                </div>

                {/* Itens e valor */}
                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Itens</p>
                    <p className="font-bold text-sm">{c.itens.length}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Emissão</p>
                    <p className="font-bold text-sm">{fmtDate(c.dataEmissao)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-black text-lg text-primary">{fmt(total)}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>

              {/* Ações rápidas inline para cotações ativas */}
              {isAtivo && (
                <div className="mt-3 pt-3 border-t border-border/50 flex gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleAprovar(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors"
                  >
                    <Check className="w-3 h-3" /> Aprovar
                  </button>
                  <button
                    onClick={() => handleRejeitar(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    <X className="w-3 h-3" /> Rejeitar
                  </button>
                  <button
                    onClick={() => setCotacaoSelecionada(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-semibold hover:bg-muted/70 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Ver Detalhes
                  </button>
                </div>
              )}
              {c.status === "aprovada" && (
                <div className="mt-3 pt-3 border-t border-border/50 flex gap-2" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleEmitirBoleto(c.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-colors"
                  >
                    <DollarSign className="w-3 h-3" /> Emitir Boleto
                  </button>
                  <button
                    onClick={() => setCotacaoSelecionada(c)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-muted text-muted-foreground rounded-lg text-xs font-semibold hover:bg-muted/70 transition-colors"
                  >
                    <Eye className="w-3 h-3" /> Ver Detalhes
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Modal Detalhes */}
      {cotacaoSelecionada && (
        <ModalCotacao
          cotacao={cotacaoSelecionada}
          onClose={() => setCotacaoSelecionada(null)}
          onAprovar={handleAprovar}
          onRejeitar={handleRejeitar}
          onEmitirBoleto={handleEmitirBoleto}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-6 right-6 z-[100] px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300",
          toast.type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
        )}>
          {toast.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
          <p className="font-semibold text-sm">{toast.msg}</p>
        </div>
      )}
    </div>
  )
}
