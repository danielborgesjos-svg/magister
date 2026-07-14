"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Users, Search, Plus, Shield, ShieldAlert, ShieldCheck, 
  MoreVertical, Edit2, Trash2, X, Check, Loader2, Bot
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useLayout } from "@/components/layout/LayoutProvider"
import { 
  listarUsuarios, criarUsuario, atualizarRoleUsuario, removerUsuario 
} from "@/app/actions/usuarios"
import Link from "next/link"

const ROLES = [
  { id: "admin", label: "Administrador", icon: ShieldAlert, cor: "#EF4444", bg: "bg-red-50", text: "text-red-700" },
  { id: "user",  label: "Usuário",       icon: ShieldCheck, cor: "#3B82F6", bg: "bg-blue-50", text: "text-blue-700" },
  { id: "viewer",label: "Visualizador",  icon: Shield,      cor: "#64748B", bg: "bg-slate-100", text: "text-slate-700" },
]

function getRole(id: string) {
  return ROLES.find(r => r.id === id) ?? ROLES[2]
}

// ─── MODAL NOVO USUÁRIO ────────────────────────────────────────────────────────
function ModalNovoUsuario({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ nome: "", email: "", role: "user", senha: "" })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState("")

  const handleSubmit = async () => {
    if (!form.nome || !form.email) {
      setErro("Nome e e-mail são obrigatórios.")
      return
    }
    setLoading(true)
    const res = await criarUsuario(form)
    setLoading(false)

    if (res.success) {
      onSuccess()
      onClose()
    } else {
      setErro(res.error ?? "Erro ao criar usuário.")
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="font-black text-slate-900 text-base">Novo Usuário</h3>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg"><X className="w-4 h-4 text-slate-500" /></button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Nome Completo</label>
            <input type="text" placeholder="Ex: João Silva" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">E-mail</label>
            <input type="email" placeholder="joao@empresa.com.br" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-indigo-400" />
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Nível de Acesso (Role)</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map(r => {
                const Icon = r.icon
                const active = form.role === r.id
                return (
                  <button key={r.id} onClick={() => setForm(f => ({ ...f, role: r.id }))}
                    className={cn("flex flex-col items-center justify-center gap-1.5 py-2.5 rounded-xl border transition-all",
                      active ? `border-[${r.cor}] ${r.bg} shadow-sm` : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-400"
                    )}>
                    <Icon className="w-4 h-4" style={{ color: active ? r.cor : undefined }} />
                    <span className={cn("text-[10px] font-black uppercase tracking-wider", active ? r.text : "text-slate-500")}>
                      {r.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Senha (opcional)</label>
            <input type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-indigo-400" />
            <p className="text-[10px] text-slate-400 mt-1">Se em branco, a senha padrão "123456" será usada.</p>
          </div>

          {erro && <p className="text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{erro}</p>}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-black rounded-xl shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Criar Usuário
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── PÁGINA PRINCIPAL ────────────────────────────────────────────────────────
export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [modalNovo, setModalNovo] = useState(false)
  const [reload, setReload] = useState(0)
  
  const { openIAPanel } = useLayout()

  const carregar = useCallback(async () => {
    setLoading(true)
    const res = await listarUsuarios(busca || undefined)
    setUsuarios(res)
    setLoading(false)
  }, [busca, reload])

  useEffect(() => { carregar() }, [carregar])

  const handleMudarRole = async (id: string, novaRole: string) => {
    await atualizarRoleUsuario(id, novaRole)
    setReload(r => r + 1)
  }

  const handleExcluir = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este usuário? O acesso será revogado imediatamente.")) return
    const res = await removerUsuario(id)
    if (res.success) setReload(r => r + 1)
    else alert(res.error)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl pb-10">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 4px 14px #6366F140" }}>
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight leading-none">Usuários & Acessos</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[12px] text-slate-500 font-medium">Gestão de permissões do sistema</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={() => openIAPanel("global")}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[13px] font-black rounded-xl transition-all">
            <Bot className="w-4 h-4" /> JARMIS
          </button>
          <button onClick={() => setModalNovo(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-700 text-white font-black rounded-xl shadow-sm transition-all text-[13px]">
            <Plus className="w-4 h-4" /> Novo Usuário
          </button>
        </div>
      </div>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input type="text" value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por nome ou e-mail..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-[13px] font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:border-indigo-400 transition-all" />
        </div>
        <span className="ml-auto text-[12px] font-bold text-slate-500">{usuarios.length} usuários</span>
      </div>

      {/* ── LISTAGEM ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-16 flex justify-center"><Loader2 className="w-7 h-7 animate-spin text-indigo-500" /></div>
        ) : usuarios.length === 0 ? (
          <div className="flex flex-col items-center py-20 gap-3">
            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center">
              <Users className="w-8 h-8 text-slate-300" />
            </div>
            <p className="font-black text-slate-600 text-base">Nenhum usuário encontrado</p>
            <p className="text-sm text-slate-400">Verifique a busca ou crie um novo acesso.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {["Usuário", "E-mail", "Permissão", "Data de Criação", "Ações"].map(h => (
                    <th key={h} className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map(u => {
                  const roleData = getRole(u.role)
                  const RoleIcon = roleData.icon
                  
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-black text-[12px]">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-[14px] text-slate-900">{u.nome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[13px] text-slate-500 font-medium">{u.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-black", roleData.bg, roleData.text)}>
                            <RoleIcon className="w-3.5 h-3.5" />
                            {roleData.label}
                          </span>
                          
                          {/* Botões rápidos de trocar role no hover (opcional) */}
                          <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                            {ROLES.map(r => r.id !== u.role && (
                              <button key={r.id} onClick={() => handleMudarRole(u.id, r.id)} title={`Mudar para ${r.label}`}
                                className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors">
                                <r.icon className="w-3.5 h-3.5" />
                              </button>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-slate-400 font-medium">
                        {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => handleExcluir(u.id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded-lg transition-all" title="Remover Usuário">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modalNovo && (
        <ModalNovoUsuario onClose={() => setModalNovo(false)} onSuccess={() => setReload(r => r + 1)} />
      )}
    </div>
  )
}
