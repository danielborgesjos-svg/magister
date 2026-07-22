"use client"

import { useState, useCallback, useEffect } from "react"
import {
  LayoutDashboard, Package, FileText, DollarSign, Users,
  ShoppingCart, Plus, Minus, Trash2, X, Check, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Eye, Download, Send, ArrowRight,
  Building2, Star, ChevronDown, Filter, Search, Badge
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────
interface Produto {
  id: string
  nome: string
  descricao: string
  preco: number
  estoque: number
  categoria: string
  unidade: string
}

interface ItemCarrinho extends Produto {
  quantidade: number
}

interface Boleto {
  id: string
  empresa: string
  valor: number
  vencimento: string
  status: "pago" | "pendente" | "atrasado"
  emissao: string
  numero: string
}

interface PedidoB2B {
  id: string
  empresa: string
  data: string
  total: number
  status: "aguardando" | "aprovado" | "cancelado" | "entregue"
  itens: number
  vendedor: string
}

interface ClienteB2B {
  id: string
  nome: string
  empresa: string
  cidade: string
  totalComprado: number
  ultimaCompra: string
  pedidos: number
  status: string
  score: number
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const PRODUTOS_MOCK: Produto[] = [
  { id: "p1", nome: "Servidor Dell PowerEdge R740", descricao: "Servidor rack 2U, 2x Xeon, 128GB RAM, 4TB SSD", preco: 28500, estoque: 8, categoria: "Servidores", unidade: "un" },
  { id: "p2", nome: "Switch Cisco Catalyst 2960", descricao: "Switch gerenciável 24 portas Gigabit", preco: 4200, estoque: 15, categoria: "Rede", unidade: "un" },
  { id: "p3", nome: "Licença Microsoft 365 Business", descricao: "Licença anual por usuário – Teams, Office, Exchange", preco: 890, estoque: 999, categoria: "Software", unidade: "lic/ano" },
  { id: "p4", nome: "Firewall Fortinet FortiGate 60F", descricao: "NGFW para até 200 usuários – VPN, IPS, SD-WAN", preco: 7800, estoque: 6, categoria: "Segurança", unidade: "un" },
  { id: "p5", nome: "Workstation HP Z4 G4", descricao: "Xeon W-2145, 64GB ECC, Quadro RTX 4000", preco: 14200, estoque: 12, categoria: "Hardware", unidade: "un" },
  { id: "p6", nome: "Storage NAS Synology DS920+", descricao: "NAS 4 baias, 8GB RAM, SSD cache compatível", preco: 5600, estoque: 20, categoria: "Armazenamento", unidade: "un" },
  { id: "p7", nome: "Monitor LG UltraSharp 34\" Curvo", descricao: "WQHD 3440x1440, IPS, USB-C, 60Hz", preco: 3100, estoque: 30, categoria: "Monitores", unidade: "un" },
  { id: "p8", nome: "Nobreak APC Smart-UPS 3000VA", descricao: "Rack 2U, 2700W, gerenciamento SNMP", preco: 9400, estoque: 10, categoria: "Infraestrutura", unidade: "un" },
  { id: "p9", nome: "Access Point Ubiquiti UniFi U6 Pro", descricao: "Wi-Fi 6, 4x4 MU-MIMO, PoE+, dual-band", preco: 1290, estoque: 50, categoria: "Rede", unidade: "un" },
  { id: "p10", nome: "Licença Veeam Backup Enterprise", descricao: "Backup e replicação de VMs – 12 meses", preco: 3500, estoque: 999, categoria: "Software", unidade: "lic/ano" },
  { id: "p11", nome: "Impressora HP LaserJet Pro MFP", descricao: "A4, Duplex automático, Ethernet, rede 50 ppm", preco: 2800, estoque: 25, categoria: "Hardware", unidade: "un" },
  { id: "p12", nome: "Rack 42U 19\" Padrão", descricao: "Rack de piso fechado, 600x800mm, passagem de cabos", preco: 3900, estoque: 5, categoria: "Infraestrutura", unidade: "un" },
]

const BOLETOS_MOCK: Boleto[] = [
  { id: "b1", empresa: "Indústria Metalúrgica Sul", valor: 28500, vencimento: "2026-07-20", status: "pendente", emissao: "2026-07-05", numero: "BAR-2024-00147" },
  { id: "b2", empresa: "Logística Nacional", valor: 14200, vencimento: "2026-07-05", status: "atrasado", emissao: "2026-06-20", numero: "BAR-2024-00139" },
  { id: "b3", empresa: "Rede de Franquias XYZ", valor: 7800, vencimento: "2026-06-30", status: "pago", emissao: "2026-06-15", numero: "BAR-2024-00131" },
  { id: "b4", empresa: "Tech Solutions", valor: 3600, vencimento: "2026-08-01", status: "pendente", emissao: "2026-07-15", numero: "BAR-2024-00155" },
  { id: "b5", empresa: "Construtora Horizonte", valor: 22000, vencimento: "2026-07-10", status: "pago", emissao: "2026-06-25", numero: "BAR-2024-00143" },
  { id: "b6", empresa: "Varejista Central", valor: 9400, vencimento: "2026-06-15", status: "atrasado", emissao: "2026-06-01", numero: "BAR-2024-00125" },
  { id: "b7", empresa: "Grupo Delta Engenharia", valor: 56000, vencimento: "2026-07-25", status: "pendente", emissao: "2026-07-10", numero: "BAR-2024-00160" },
  { id: "b8", empresa: "Supermercados Líder", valor: 5600, vencimento: "2026-07-12", status: "pago", emissao: "2026-06-28", numero: "BAR-2024-00148" },
  { id: "b9", empresa: "Comércio Nacional Alfa", valor: 3100, vencimento: "2026-07-15", status: "pago", emissao: "2026-07-01", numero: "BAR-2024-00151" },
  { id: "b10", empresa: "Logística Brasil 7", valor: 1290, vencimento: "2026-05-30", status: "atrasado", emissao: "2026-05-15", numero: "BAR-2024-00110" },
]

const PEDIDOS_MOCK: PedidoB2B[] = [
  { id: "ord1", empresa: "Indústria Metalúrgica Sul", data: "2026-07-16", total: 57000, status: "aprovado", itens: 3, vendedor: "Tiago Alves" },
  { id: "ord2", empresa: "Logística Nacional", data: "2026-07-15", total: 14200, status: "aguardando", itens: 1, vendedor: "Carla Dias" },
  { id: "ord3", empresa: "Tech Solutions", data: "2026-07-14", total: 8700, status: "entregue", itens: 5, vendedor: "Rafael Souza" },
  { id: "ord4", empresa: "Construtora Horizonte", data: "2026-07-13", total: 22000, status: "aprovado", itens: 2, vendedor: "Tiago Alves" },
  { id: "ord5", empresa: "Rede de Franquias XYZ", data: "2026-07-12", total: 4500, status: "cancelado", itens: 4, vendedor: "Carla Dias" },
  { id: "ord6", empresa: "Varejista Central", data: "2026-07-11", total: 31000, status: "entregue", itens: 7, vendedor: "Rafael Souza" },
  { id: "ord7", empresa: "Grupo Delta Engenharia", data: "2026-07-09", total: 56000, status: "aguardando", itens: 2, vendedor: "Tiago Alves" },
  { id: "ord8", empresa: "Supermercados Líder", data: "2026-07-08", total: 18900, status: "aprovado", itens: 6, vendedor: "Carla Dias" },
]

const CLIENTES_B2B_MOCK: ClienteB2B[] = [
  { id: "c1", nome: "Roberto Souza", empresa: "Indústria Metalúrgica Sul", cidade: "Porto Alegre", totalComprado: 142000, ultimaCompra: "2026-07-16", pedidos: 12, status: "ativo", score: 88 },
  { id: "c2", nome: "Carlos Mendes", empresa: "Logística Nacional", cidade: "São Paulo", totalComprado: 87500, ultimaCompra: "2026-07-15", pedidos: 8, status: "ativo", score: 72 },
  { id: "c3", nome: "João Pedro", empresa: "Rede de Franquias XYZ", cidade: "Rio de Janeiro", totalComprado: 62000, ultimaCompra: "2026-07-12", pedidos: 9, status: "ativo", score: 92 },
  { id: "c4", nome: "Fernanda Lima", empresa: "Construtora Horizonte", cidade: "Belo Horizonte", totalComprado: 45200, ultimaCompra: "2026-07-13", pedidos: 5, status: "inativo", score: 55 },
  { id: "c5", nome: "Mariana Silva", empresa: "Varejista Central", cidade: "Curitiba", totalComprado: 110000, ultimaCompra: "2026-07-11", pedidos: 14, status: "lead", score: 48 },
  { id: "c6", nome: "Lucas Oliveira", empresa: "Tech Solutions", cidade: "Florianópolis", totalComprado: 8400, ultimaCompra: "2026-07-14", pedidos: 3, status: "lead", score: 75 },
  { id: "c7", nome: "Ana Costa", empresa: "Grupo Delta Engenharia", cidade: "Brasília", totalComprado: 210000, ultimaCompra: "2026-07-09", pedidos: 18, status: "ativo", score: 96 },
  { id: "c8", nome: "Paulo Ramos", empresa: "Supermercados Líder", cidade: "Salvador", totalComprado: 54000, ultimaCompra: "2026-07-08", pedidos: 7, status: "ativo", score: 68 },
  { id: "c9", nome: "Bianca Ferreira", empresa: "Comércio Nacional Alfa", cidade: "Recife", totalComprado: 29000, ultimaCompra: "2026-07-01", pedidos: 4, status: "ativo", score: 61 },
  { id: "c10", nome: "Diego Rocha", empresa: "Logística Brasil 7", cidade: "Fortaleza", totalComprado: 7200, ultimaCompra: "2026-06-20", pedidos: 2, status: "lead", score: 40 },
]

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
const fmtDate = (d: string) => new Date(d).toLocaleDateString("pt-BR")
const STATUS_PEDIDO = {
  aguardando: { label: "Aguardando", bg: "bg-yellow-100", text: "text-yellow-700" },
  aprovado: { label: "Aprovado", bg: "bg-blue-100", text: "text-blue-700" },
  entregue: { label: "Entregue", bg: "bg-green-100", text: "text-green-700" },
  cancelado: { label: "Cancelado", bg: "bg-red-100", text: "text-red-700" },
}
const STATUS_BOLETO = {
  pago: { label: "Pago", bg: "bg-green-100", text: "text-green-700", icon: <Check className="w-3 h-3" /> },
  pendente: { label: "Pendente", bg: "bg-yellow-100", text: "text-yellow-700", icon: <Clock className="w-3 h-3" /> },
  atrasado: { label: "Atrasado", bg: "bg-red-100", text: "text-red-700", icon: <AlertTriangle className="w-3 h-3" /> },
}

const TABS = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "catalogo", label: "Catálogo & Carrinho", icon: Package },
  { id: "pedidos", label: "Orçamentos & Pedidos", icon: FileText },
  { id: "financeiro", label: "Financeiro (Boletos)", icon: DollarSign },
  { id: "clientes", label: "Clientes B2B", icon: Users },
]

// ─── Sub-Components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, icon: Icon, trend }: { label: string; value: string | number; sub?: string; color: string; icon: any; trend?: string }) {
  return (
    <div className={cn("rounded-2xl p-5 border bg-card flex flex-col gap-2", `border-${color}-200`)}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", `bg-${color}-100`)}>
          <Icon className={cn("w-4 h-4", `text-${color}-600`)} />
        </div>
      </div>
      <p className={cn("text-3xl font-black tracking-tight", `text-${color}-700`)}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      {trend && <p className="text-xs font-semibold text-emerald-600">↑ {trend}</p>}
    </div>
  )
}

function DashboardTab() {
  const totalBoletos = BOLETOS_MOCK.reduce((a, b) => a + b.valor, 0)
  const pagos = BOLETOS_MOCK.filter(b => b.status === "pago").reduce((a, b) => a + b.valor, 0)
  const atrasados = BOLETOS_MOCK.filter(b => b.status === "atrasado").reduce((a, b) => a + b.valor, 0)
  const pedidosAbertos = PEDIDOS_MOCK.filter(p => p.status === "aguardando").length
  const ticketMedio = PEDIDOS_MOCK.reduce((a, b) => a + b.total, 0) / PEDIDOS_MOCK.length

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Faturamento Emitido" value={fmt(totalBoletos)} sub="Total de boletos em circulação" color="blue" icon={DollarSign} trend="18% vs. mês passado" />
        <KpiCard label="Boletos Pagos" value={fmt(pagos)} sub={`${BOLETOS_MOCK.filter(b=>b.status==="pago").length} boletos`} color="emerald" icon={Check} />
        <KpiCard label="Inadimplência" value={fmt(atrasados)} sub={`${BOLETOS_MOCK.filter(b=>b.status==="atrasado").length} boleto(s) vencido(s)`} color="red" icon={AlertTriangle} />
        <KpiCard label="Pedidos em Aberto" value={pedidosAbertos} sub={`Ticket médio: ${fmt(ticketMedio)}`} color="amber" icon={FileText} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4">Últimos Pedidos</h3>
          <div className="space-y-3">
            {PEDIDOS_MOCK.slice(0, 5).map(p => {
              const cfg = STATUS_PEDIDO[p.status]
              return (
                <div key={p.id} className="flex items-center justify-between gap-2 py-2 border-b border-border/50 last:border-0">
                  <div>
                    <p className="font-semibold text-sm">{p.empresa}</p>
                    <p className="text-xs text-muted-foreground">{fmtDate(p.data)} · {p.itens} item(s)</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{fmt(p.total)}</span>
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", cfg.bg, cfg.text)}>{cfg.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4">Top Clientes por Volume</h3>
          <div className="space-y-3">
            {CLIENTES_B2B_MOCK.sort((a, b) => b.totalComprado - a.totalComprado).slice(0, 5).map((c, i) => (
              <div key={c.id} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-black flex items-center justify-center">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{c.empresa}</p>
                  <div className="w-full h-1.5 bg-muted rounded-full mt-1">
                    <div className="h-1.5 bg-primary rounded-full" style={{ width: `${(c.totalComprado / 210000) * 100}%` }} />
                  </div>
                </div>
                <span className="font-bold text-sm text-right">{fmt(c.totalComprado)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-primary to-blue-600 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-xl">JARMIS B2B IA</h3>
            <p className="text-white/80 text-sm mt-1">Motor preditivo detectou {CLIENTES_B2B_MOCK.filter(c => c.score < 60).length} clientes com risco de churn e {PEDIDOS_MOCK.filter(p => p.status === "aguardando").length} pedidos aguardando aprovação.</p>
          </div>
          <div className="text-5xl font-black opacity-20">✦</div>
        </div>
      </div>
    </div>
  )
}

function CatalogoTab() {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([])
  const [busca, setBusca] = useState("")
  const [categoriaSel, setCategoriaSel] = useState("Todos")
  const [modalCarrinho, setModalCarrinho] = useState(false)
  const [modalSucesso, setModalSucesso] = useState(false)

  const categorias = ["Todos", ...Array.from(new Set(PRODUTOS_MOCK.map(p => p.categoria)))]
  const filtrados = PRODUTOS_MOCK.filter(p =>
    (categoriaSel === "Todos" || p.categoria === categoriaSel) &&
    (p.nome.toLowerCase().includes(busca.toLowerCase()) || p.descricao.toLowerCase().includes(busca.toLowerCase()))
  )

  const addCarrinho = (p: Produto) => {
    setCarrinho(prev => {
      const ex = prev.find(i => i.id === p.id)
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantidade: i.quantidade + 1 } : i)
      return [...prev, { ...p, quantidade: 1 }]
    })
  }
  const remCarrinho = (id: string) => setCarrinho(prev => prev.map(i => i.id === id ? { ...i, quantidade: Math.max(0, i.quantidade - 1) } : i).filter(i => i.quantidade > 0))
  const delCarrinho = (id: string) => setCarrinho(prev => prev.filter(i => i.id !== id))

  const totalCarrinho = carrinho.reduce((a, i) => a + i.preco * i.quantidade, 0)
  const totalItens = carrinho.reduce((a, i) => a + i.quantidade, 0)

  const handleFinalizarPedido = () => {
    setModalCarrinho(false)
    setCarrinho([])
    setModalSucesso(true)
    setTimeout(() => setModalSucesso(false), 4000)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar produto..."
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categorias.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoriaSel(cat)}
              className={cn("px-3 py-2 text-xs font-semibold rounded-xl transition-colors", categoriaSel === cat ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70")}
            >{cat}</button>
          ))}
        </div>
        <button
          onClick={() => setModalCarrinho(true)}
          className="relative flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors shadow-sm"
        >
          <ShoppingCart className="w-4 h-4" />
          Carrinho
          {totalItens > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-xs font-black rounded-full flex items-center justify-center">{totalItens}</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtrados.map(p => {
          const qtd = carrinho.find(i => i.id === p.id)?.quantidade || 0
          return (
            <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-28 bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center">
                <Package className="w-12 h-12 text-primary/30" />
              </div>
              <div className="p-4 flex flex-col flex-1 gap-2">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit">{p.categoria}</span>
                <p className="font-bold text-sm leading-tight">{p.nome}</p>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed">{p.descricao}</p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <p className="font-black text-lg text-primary">{fmt(p.preco)}</p>
                    <p className="text-xs text-muted-foreground">/{p.unidade} · {p.estoque} em estoque</p>
                  </div>
                </div>
                {qtd === 0 ? (
                  <button
                    onClick={() => addCarrinho(p)}
                    className="w-full mt-1 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Adicionar
                  </button>
                ) : (
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => remCarrinho(p.id)} className="flex-1 py-2 bg-muted text-foreground rounded-xl text-sm font-bold hover:bg-muted/70 transition-colors flex items-center justify-center">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-10 text-center font-black text-lg">{qtd}</span>
                    <button onClick={() => addCarrinho(p)} className="flex-1 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center justify-center">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal Carrinho */}
      {modalCarrinho && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-primary" /> Carrinho de Compras</h2>
              <button onClick={() => setModalCarrinho(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            {carrinho.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground text-sm">Carrinho vazio. Adicione produtos do catálogo.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {carrinho.map(item => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-primary/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{item.nome}</p>
                      <p className="text-xs text-muted-foreground">{fmt(item.preco)} / {item.unidade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => remCarrinho(item.id)} className="w-7 h-7 bg-muted rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted/70"><Minus className="w-3 h-3" /></button>
                      <span className="w-8 text-center font-bold">{item.quantidade}</span>
                      <button onClick={() => addCarrinho(item)} className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white hover:bg-primary/90"><Plus className="w-3 h-3" /></button>
                    </div>
                    <p className="font-bold text-sm w-24 text-right">{fmt(item.preco * item.quantidade)}</p>
                    <button onClick={() => delCarrinho(item.id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}

                <div className="border-t border-border pt-4 mt-4 space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Subtotal ({totalItens} itens)</span><span>{fmt(totalCarrinho)}</span></div>
                  <div className="flex justify-between text-sm text-muted-foreground"><span>Impostos estimados (15%)</span><span>{fmt(totalCarrinho * 0.15)}</span></div>
                  <div className="flex justify-between font-black text-lg border-t border-border pt-2 mt-2"><span>Total do Pedido</span><span className="text-primary">{fmt(totalCarrinho * 1.15)}</span></div>
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <button
                    onClick={handleFinalizarPedido}
                    className="w-full py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Gerar Orçamento / Finalizar Pedido
                  </button>
                  <button
                    onClick={() => setModalCarrinho(false)}
                    className="w-full py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors"
                  >Continuar Comprando</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Sucesso */}
      {modalSucesso && (
        <div className="fixed bottom-6 right-6 z-[100] bg-emerald-600 text-white px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300">
          <Check className="w-5 h-5" />
          <div>
            <p className="font-bold text-sm">Pedido enviado com sucesso!</p>
            <p className="text-xs text-white/80">Aguardando aprovação do time comercial.</p>
          </div>
        </div>
      )}
    </div>
  )
}

function PedidosTab() {
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const filtrados = PEDIDOS_MOCK.filter(p =>
    (filtroStatus === "todos" || p.status === filtroStatus) &&
    p.empresa.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar empresa..."
            className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {["todos", "aguardando", "aprovado", "entregue", "cancelado"].map(s => (
            <button key={s} onClick={() => setFiltroStatus(s)} className={cn("px-3 py-2 text-xs font-semibold rounded-xl transition-colors capitalize", filtroStatus === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70")}>{s === "todos" ? "Todos" : STATUS_PEDIDO[s as keyof typeof STATUS_PEDIDO]?.label}</button>
          ))}
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {["Pedido", "Empresa", "Data", "Vendedor", "Itens", "Total", "Status", "Ações"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(p => {
              const cfg = STATUS_PEDIDO[p.status]
              return (
                <tr key={p.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">#{p.id}</td>
                  <td className="px-4 py-3 font-semibold text-sm">{p.empresa}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{fmtDate(p.data)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{p.vendedor}</td>
                  <td className="px-4 py-3 text-sm">{p.itens} item(s)</td>
                  <td className="px-4 py-3 font-bold text-sm">{fmt(p.total)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", cfg.bg, cfg.text)}>{cfg.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors" title="Baixar"><Download className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtrados.length === 0 && (
          <div className="text-center py-12 text-muted-foreground text-sm">Nenhum pedido encontrado.</div>
        )}
      </div>
    </div>
  )
}

function FinanceiroTab() {
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const filtrados = BOLETOS_MOCK.filter(b => filtroStatus === "todos" || b.status === filtroStatus)

  const totPago = BOLETOS_MOCK.filter(b => b.status === "pago").reduce((a, b) => a + b.valor, 0)
  const totPendente = BOLETOS_MOCK.filter(b => b.status === "pendente").reduce((a, b) => a + b.valor, 0)
  const totAtrasado = BOLETOS_MOCK.filter(b => b.status === "atrasado").reduce((a, b) => a + b.valor, 0)
  const totalGeral = BOLETOS_MOCK.reduce((a, b) => a + b.valor, 0)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium mb-1">Total Emitido</p>
          <p className="text-2xl font-black text-foreground">{fmt(totalGeral)}</p>
          <p className="text-xs text-muted-foreground mt-1">{BOLETOS_MOCK.length} boletos</p>
        </div>
        <div className="bg-card border border-emerald-200 rounded-2xl p-4">
          <p className="text-xs text-emerald-600 font-medium mb-1">✓ Pagos</p>
          <p className="text-2xl font-black text-emerald-700">{fmt(totPago)}</p>
          <div className="h-1.5 bg-muted rounded-full mt-2">
            <div className="h-1.5 bg-emerald-500 rounded-full" style={{ width: `${(totPago / totalGeral) * 100}%` }} />
          </div>
        </div>
        <div className="bg-card border border-yellow-200 rounded-2xl p-4">
          <p className="text-xs text-yellow-600 font-medium mb-1">⏳ Pendentes</p>
          <p className="text-2xl font-black text-yellow-700">{fmt(totPendente)}</p>
          <div className="h-1.5 bg-muted rounded-full mt-2">
            <div className="h-1.5 bg-yellow-400 rounded-full" style={{ width: `${(totPendente / totalGeral) * 100}%` }} />
          </div>
        </div>
        <div className="bg-card border border-red-200 rounded-2xl p-4">
          <p className="text-xs text-red-600 font-medium mb-1">⚠ Atrasados</p>
          <p className="text-2xl font-black text-red-700">{fmt(totAtrasado)}</p>
          <div className="h-1.5 bg-muted rounded-full mt-2">
            <div className="h-1.5 bg-red-500 rounded-full" style={{ width: `${(totAtrasado / totalGeral) * 100}%` }} />
          </div>
        </div>
      </div>

      {totAtrasado > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm text-red-700">Atenção: {BOLETOS_MOCK.filter(b => b.status === "atrasado").length} boletos vencidos</p>
            <p className="text-xs text-red-600 mt-0.5">Inadimplência total de {fmt(totAtrasado)}. Considere acionar a cobrança automática via JARMIS.</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(["todos", "pago", "pendente", "atrasado"] as const).map(s => (
          <button key={s} onClick={() => setFiltroStatus(s)} className={cn("px-3 py-2 text-xs font-semibold rounded-xl transition-colors capitalize", filtroStatus === s ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
            {s === "todos" ? "Todos" : STATUS_BOLETO[s]?.label}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/40 border-b border-border">
            <tr>
              {["Número", "Empresa", "Emissão", "Vencimento", "Valor", "Status", "Ações"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtrados.map(b => {
              const cfg = STATUS_BOLETO[b.status]
              return (
                <tr key={b.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{b.numero}</td>
                  <td className="px-4 py-3 font-semibold text-sm">{b.empresa}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{fmtDate(b.emissao)}</td>
                  <td className={cn("px-4 py-3 text-sm font-semibold", b.status === "atrasado" ? "text-red-600" : "text-foreground")}>{fmtDate(b.vencimento)}</td>
                  <td className="px-4 py-3 font-bold text-sm">{fmt(b.valor)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit", cfg.bg, cfg.text)}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 text-muted-foreground hover:bg-muted rounded-lg transition-colors" title="Baixar"><Download className="w-4 h-4" /></button>
                    </div>
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

function ClientesB2BTab() {
  const [busca, setBusca] = useState("")
  const filtrados = CLIENTES_B2B_MOCK.filter(c =>
    c.empresa.toLowerCase().includes(busca.toLowerCase()) || c.nome.toLowerCase().includes(busca.toLowerCase())
  )
  const getInitials = (n: string) => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase()
  const scoreColor = (s: number) => s >= 80 ? "bg-emerald-500 text-white" : s >= 60 ? "bg-primary text-white" : "bg-muted text-muted-foreground"

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar cliente ou empresa..."
          className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtrados.map(c => (
          <div key={c.id} className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm flex-shrink-0">
                {getInitials(c.nome)}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{c.empresa}</p>
                <p className="text-xs text-muted-foreground truncate">{c.nome} · {c.cidade}</p>
              </div>
              <span className={cn("ml-auto w-10 h-6 text-xs font-black rounded-full flex items-center justify-center flex-shrink-0", scoreColor(c.score))}>{c.score}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">LTV Total</p>
                <p className="font-bold text-sm mt-0.5">{fmt(c.totalComprado)}</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3">
                <p className="text-xs text-muted-foreground">Pedidos</p>
                <p className="font-bold text-sm mt-0.5">{c.pedidos} pedidos</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/50">
              <span>Última compra: {fmtDate(c.ultimaCompra)}</span>
              <span className={cn("px-2 py-0.5 rounded-full font-semibold", c.status === "ativo" ? "bg-green-100 text-green-700" : c.status === "inativo" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700")}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function PortalB2BPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <div className="p-6 max-w-screen-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground">Portal B2B Corporativo</h1>
            <p className="text-sm text-muted-foreground">Orçamentos · Pedidos · Faturamento · Clientes</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-semibold text-emerald-700">Portal Ativo</span>
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
              activeTab === tab.id
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div>
        {activeTab === "dashboard" && <DashboardTab />}
        {activeTab === "catalogo" && <CatalogoTab />}
        {activeTab === "pedidos" && <PedidosTab />}
        {activeTab === "financeiro" && <FinanceiroTab />}
        {activeTab === "clientes" && <ClientesB2BTab />}
      </div>
    </div>
  )
}
