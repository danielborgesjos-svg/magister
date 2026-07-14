"use client"

import { useState, useEffect, useCallback } from "react"
import { Plus, Search, Eye, MessageCircle, Trash2, Edit, X, Save, User } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { buscarClientes, criarCliente, atualizarCliente, deletarCliente } from "@/app/actions/crm"
import { cn } from "@/lib/utils"

type Cliente = {
  id: string
  nome: string
  empresa: string | null
  segmento: string | null
  cidade: string | null
  score: number
  status: string
  totalComprado: number
  createdAt: Date
}

const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  ativo:   { bg: "bg-green-positive/15", text: "text-green-positive", label: "Ativo" },
  inativo: { bg: "bg-red-alert/15",      text: "text-red-alert",      label: "Inativo" },
  lead:    { bg: "bg-orange-alert/15",   text: "text-orange-alert",   label: "Lead" },
}

function getInitials(nome: string) {
  return nome.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? "bg-green-positive text-white" : score >= 60 ? "bg-primary text-white" : "bg-muted text-muted-foreground"
  return <span className={cn("inline-flex items-center justify-center w-9 h-6 rounded-full text-xs font-bold", color)}>{score}</span>
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [busca, setBusca] = useState("")
  const [filtroStatus, setFiltroStatus] = useState("todos")
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null)
  const [modalNovo, setModalNovo] = useState(false)
  const [novoCliente, setNovoCliente] = useState({ 
    nome: "", empresa: "", segmento: "", cidade: "", status: "lead",
    contatos: [{ nome: "", telefone: "", email: "", setor: "" }],
    enderecos: [{ logradouro: "", numero: "", bairro: "", cidade: "", uf: "", tipo: "Principal" }]
  })
  const [isLoading, setIsLoading] = useState(false)

  const load = useCallback(async () => {
    const data = await buscarClientes(busca)
    setClientes(data)
  }, [busca])

  useEffect(() => { load() }, [load])

  const filtrados = clientes.filter(c =>
    filtroStatus === "todos" || c.status === filtroStatus
  )

  const handleCriar = async () => {
    if (!novoCliente.nome.trim()) return
    setIsLoading(true)
    const res = await criarCliente(novoCliente)
    if (res.success) {
      setModalNovo(false)
      setNovoCliente({ 
        nome: "", empresa: "", segmento: "", cidade: "", status: "lead",
        contatos: [{ nome: "", telefone: "", email: "", setor: "" }],
        enderecos: [{ logradouro: "", numero: "", bairro: "", cidade: "", uf: "", tipo: "Principal" }]
      })
      load()
    }
    setIsLoading(false)
  }

  const handleDeletar = async (id: string) => {
    if (!confirm("Remover este cliente?")) return
    await deletarCliente(id)
    if (clienteSelecionado?.id === id) setClienteSelecionado(null)
    load()
  }

  const stats = {
    total: clientes.length,
    ativos: clientes.filter(c => c.status === "ativo").length,
    inativos: clientes.filter(c => c.status === "inativo").length,
    leads: clientes.filter(c => c.status === "lead").length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="text-sm text-muted-foreground">{clientes.length} clientes cadastrados</p>
        </div>
        <button
          onClick={() => setModalNovo(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total, color: "text-foreground" },
          { label: "Ativos", value: stats.ativos, color: "text-green-positive" },
          { label: "Inativos", value: stats.inativos, color: "text-red-alert" },
          { label: "Leads", value: stats.leads, color: "text-orange-alert" },
        ].map(s => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-4">
            <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
            <p className={cn("text-2xl font-bold mt-1", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nome, empresa ou cidade..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>
        <select
          className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none"
          value={filtroStatus}
          onChange={e => setFiltroStatus(e.target.value)}
        >
          <option value="todos">Todos Status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
          <option value="lead">Lead</option>
        </select>
      </div>

      {/* Layout: Tabela + Painel Lateral */}
      <div className="flex gap-6 min-h-[400px]">
        {/* Tabela */}
        <div className={cn("flex-1 bg-card border border-border rounded-2xl overflow-hidden flex flex-col", clienteSelecionado ? "hidden lg:flex" : "")}>
          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  {["Cliente", "Segmento", "Score", "Status", "Total", "Ações"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-16 text-muted-foreground">
                    <User className="w-10 h-10 mx-auto mb-3 opacity-20" />
                    {busca ? "Nenhum cliente encontrado." : "Nenhum cliente cadastrado ainda."}
                  </td></tr>
                ) : filtrados.map(c => {
                  const statusCfg = STATUS_CONFIG[c.status] || STATUS_CONFIG.lead
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setClienteSelecionado(c)}
                      className={cn(
                        "border-b border-border/50 hover:bg-muted/40 cursor-pointer transition-colors",
                        clienteSelecionado?.id === c.id && "bg-primary/5"
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary/15 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {getInitials(c.nome)}
                          </div>
                          <div>
                            <p className="font-semibold text-sm text-foreground">{c.nome}</p>
                            {c.empresa && <p className="text-xs text-muted-foreground">{c.empresa}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{c.segmento || "—"}</td>
                      <td className="px-4 py-3"><ScoreBadge score={c.score} /></td>
                      <td className="px-4 py-3">
                        <span className={cn("px-2 py-1 rounded-full text-xs font-semibold", statusCfg.bg, statusCfg.text)}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(c.totalComprado)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          <button className="p-1.5 text-green-positive hover:bg-green-positive/10 rounded-lg transition-colors" title="WhatsApp">
                            <MessageCircle className="w-4 h-4" />
                          </button>
                          <button onClick={() => setClienteSelecionado(c)} className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Ver">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeletar(c.id)} className="p-1.5 text-red-alert/70 hover:bg-red-alert/10 hover:text-red-alert rounded-lg transition-colors" title="Excluir">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Painel Lateral */}
        {clienteSelecionado && (
          <div className="w-full lg:w-80 bg-card border border-border rounded-2xl p-5 flex flex-col gap-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Detalhes do Cliente</h3>
              <button onClick={() => setClienteSelecionado(null)} className="p-1.5 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
            </div>

            {/* Avatar + Nome */}
            <div className="flex flex-col items-center text-center gap-2 pb-4 border-b border-border">
              <div className="w-16 h-16 rounded-full bg-primary/15 text-primary flex items-center justify-center font-black text-xl">
                {getInitials(clienteSelecionado.nome)}
              </div>
              <div>
                <p className="font-bold text-foreground">{clienteSelecionado.nome}</p>
                {clienteSelecionado.empresa && <p className="text-sm text-muted-foreground">{clienteSelecionado.empresa}</p>}
              </div>
              <div className="flex items-center gap-2">
                <ScoreBadge score={clienteSelecionado.score} />
                <span className={cn("px-2 py-0.5 rounded-full text-xs font-semibold",
                  STATUS_CONFIG[clienteSelecionado.status]?.bg,
                  STATUS_CONFIG[clienteSelecionado.status]?.text
                )}>
                  {STATUS_CONFIG[clienteSelecionado.status]?.label}
                </span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Comprado", value: formatCurrency(clienteSelecionado.totalComprado) },
                { label: "Segmento", value: clienteSelecionado.segmento || "—" },
                { label: "Cidade", value: clienteSelecionado.cidade || "—" },
                { label: "Score", value: `${clienteSelecionado.score}/100` },
              ].map(s => (
                <div key={s.label} className="bg-muted/40 rounded-xl p-3">
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                  <p className="font-bold text-sm mt-0.5 text-foreground">{s.value}</p>
                </div>
              ))}
            </div>

            {/* IA Suggestion */}
            <div className="bg-purple-ia/10 border border-purple-ia/20 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-purple-ia text-xs">✦</span>
                <p className="text-xs font-bold text-purple-ia">Magis IA sugere</p>
              </div>
              <p className="text-xs text-foreground/80 leading-relaxed">
                {clienteSelecionado.score >= 70
                  ? `${clienteSelecionado.nome} tem alto potencial. Ideal para uma campanha de upsell.`
                  : `${clienteSelecionado.nome} está inativo há mais de 60 dias. Envie uma mensagem de reativação.`}
              </p>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-2">
              <button className="w-full py-2.5 bg-green-positive/10 text-green-positive border border-green-positive/20 rounded-xl text-sm font-semibold hover:bg-green-positive/20 transition-colors flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" /> Mensagem WhatsApp
              </button>
              <button
                onClick={async () => {
                  const novoStatus = clienteSelecionado.status === "ativo" ? "inativo" : "ativo"
                  await atualizarCliente(clienteSelecionado.id, { status: novoStatus })
                  setClienteSelecionado({ ...clienteSelecionado, status: novoStatus })
                  load()
                }}
                className="w-full py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-xl text-sm font-semibold hover:bg-primary/20 transition-colors flex items-center justify-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {clienteSelecionado.status === "ativo" ? "Marcar Inativo" : "Marcar Ativo"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal Novo Cliente */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-card py-2 z-10 border-b border-border">
              <h2 className="text-lg font-bold">Novo Cliente (Avançado)</h2>
              <button onClick={() => setModalNovo(false)} className="p-2 hover:bg-muted rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              {[
                { label: "Nome *", key: "nome", placeholder: "Nome completo" },
                { label: "Empresa", key: "empresa", placeholder: "Nome da empresa" },
                { label: "Cidade", key: "cidade", placeholder: "Cidade/UF" },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-semibold text-muted-foreground mb-1.5">{f.label}</label>
                  <input
                    type="text"
                    placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                    value={novoCliente[f.key as keyof typeof novoCliente] as string}
                    onChange={e => setNovoCliente({ ...novoCliente, [f.key]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Segmento</label>
                <select
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none"
                  value={novoCliente.segmento}
                  onChange={e => setNovoCliente({ ...novoCliente, segmento: e.target.value })}
                >
                  <option value="">Selecione...</option>
                  {["Varejo","Construção","Indústria","Serviços","Atacado","Tecnologia"].map(s => (
                    <option key={s} value={s.toLowerCase()}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Status</label>
                <select
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none"
                  value={novoCliente.status}
                  onChange={e => setNovoCliente({ ...novoCliente, status: e.target.value })}
                >
                  <option value="lead">Lead</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>

              {/* CONTATOS */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-foreground">Contatos</h3>
                  <button type="button" onClick={() => setNovoCliente({...novoCliente, contatos: [...novoCliente.contatos, { nome: "", telefone: "", email: "", setor: "" }]})} className="text-xs font-bold text-primary hover:underline">+ Add Contato</button>
                </div>
                {novoCliente.contatos.map((contato, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3 mb-3 p-3 bg-muted/20 rounded-xl border border-border relative">
                    {idx > 0 && (
                      <button type="button" onClick={() => {
                        const newContatos = [...novoCliente.contatos]; newContatos.splice(idx, 1);
                        setNovoCliente({...novoCliente, contatos: newContatos})
                      }} className="absolute -top-2 -right-2 bg-red-alert text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                    )}
                    <input type="text" placeholder="Nome" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={contato.nome} onChange={e => { const c = [...novoCliente.contatos]; c[idx].nome = e.target.value; setNovoCliente({...novoCliente, contatos: c}) }} />
                    <input type="text" placeholder="Setor (ex: Financeiro)" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={contato.setor} onChange={e => { const c = [...novoCliente.contatos]; c[idx].setor = e.target.value; setNovoCliente({...novoCliente, contatos: c}) }} />
                    <input type="text" placeholder="Telefone / WhatsApp" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={contato.telefone} onChange={e => { const c = [...novoCliente.contatos]; c[idx].telefone = e.target.value; setNovoCliente({...novoCliente, contatos: c}) }} />
                    <input type="email" placeholder="E-mail" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={contato.email} onChange={e => { const c = [...novoCliente.contatos]; c[idx].email = e.target.value; setNovoCliente({...novoCliente, contatos: c}) }} />
                  </div>
                ))}
              </div>

              {/* ENDEREÇOS */}
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-foreground">Endereços</h3>
                  <button type="button" onClick={() => setNovoCliente({...novoCliente, enderecos: [...novoCliente.enderecos, { logradouro: "", numero: "", bairro: "", cidade: "", uf: "", tipo: "Secundário" }]})} className="text-xs font-bold text-primary hover:underline">+ Add Endereço</button>
                </div>
                {novoCliente.enderecos.map((end, idx) => (
                  <div key={idx} className="grid grid-cols-2 gap-3 mb-3 p-3 bg-muted/20 rounded-xl border border-border relative">
                    {idx > 0 && (
                      <button type="button" onClick={() => {
                        const newEnderecos = [...novoCliente.enderecos]; newEnderecos.splice(idx, 1);
                        setNovoCliente({...novoCliente, enderecos: newEnderecos})
                      }} className="absolute -top-2 -right-2 bg-red-alert text-white rounded-full p-1"><X className="w-3 h-3" /></button>
                    )}
                    <input type="text" placeholder="Tipo (ex: Sede, Filial)" className="col-span-2 w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={end.tipo} onChange={e => { const ed = [...novoCliente.enderecos]; ed[idx].tipo = e.target.value; setNovoCliente({...novoCliente, enderecos: ed}) }} />
                    <input type="text" placeholder="Rua / Avenida" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={end.logradouro} onChange={e => { const ed = [...novoCliente.enderecos]; ed[idx].logradouro = e.target.value; setNovoCliente({...novoCliente, enderecos: ed}) }} />
                    <input type="text" placeholder="Número" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={end.numero} onChange={e => { const ed = [...novoCliente.enderecos]; ed[idx].numero = e.target.value; setNovoCliente({...novoCliente, enderecos: ed}) }} />
                    <input type="text" placeholder="Bairro" className="w-full px-3 py-2 bg-background border border-border rounded-lg text-xs" value={end.bairro} onChange={e => { const ed = [...novoCliente.enderecos]; ed[idx].bairro = e.target.value; setNovoCliente({...novoCliente, enderecos: ed}) }} />
                    <div className="flex gap-2">
                      <input type="text" placeholder="Cidade" className="flex-1 px-3 py-2 bg-background border border-border rounded-lg text-xs" value={end.cidade} onChange={e => { const ed = [...novoCliente.enderecos]; ed[idx].cidade = e.target.value; setNovoCliente({...novoCliente, enderecos: ed}) }} />
                      <input type="text" placeholder="UF" maxLength={2} className="w-12 px-2 py-2 bg-background border border-border rounded-lg text-xs text-center" value={end.uf} onChange={e => { const ed = [...novoCliente.enderecos]; ed[idx].uf = e.target.value; setNovoCliente({...novoCliente, enderecos: ed}) }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalNovo(false)} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold hover:bg-muted transition-colors">Cancelar</button>
              <button
                onClick={handleCriar}
                disabled={!novoCliente.nome.trim() || isLoading}
                className="flex-1 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />{isLoading ? "Salvando..." : "Criar Cliente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
