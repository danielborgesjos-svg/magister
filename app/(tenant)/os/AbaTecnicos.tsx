"use client"

import { useState, useEffect, useCallback } from "react"
import { Users, Search, Plus, Trash2, Edit2, ShieldAlert, Loader2, Wrench } from "lucide-react"
import { listarTecnicos, criarTecnico, atualizarStatusTecnico } from "@/app/actions/tecnicos"
import { cn } from "@/lib/utils"

export default function AbaTecnicos() {
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState("")
  const [reload, setReload] = useState(0)

  // Modal de criação
  const [modalNovo, setModalNovo] = useState(false)
  const [form, setForm] = useState({ nome: "", email: "", telefone: "" })
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState("")

  const carregar = useCallback(async () => {
    setLoading(true)
    const res = await listarTecnicos(busca || undefined)
    setTecnicos(res)
    setLoading(false)
  }, [busca, reload])

  useEffect(() => { carregar() }, [carregar])

  const handleSalvar = async () => {
    if (!form.nome || !form.email) {
      setErro("Nome e e-mail são obrigatórios.")
      return
    }
    setSalvando(true)
    const res = await criarTecnico(form)
    setSalvando(false)
    if (res.success) {
      setModalNovo(false)
      setForm({ nome: "", email: "", telefone: "" })
      setReload(r => r + 1)
    } else {
      setErro(res.error || "Erro ao salvar técnico")
    }
  }

  const toggleStatus = async (id: string, current: string) => {
    const novoStatus = current === "ativo" ? "inativo" : "ativo"
    await atualizarStatusTecnico(id, novoStatus)
    setReload(r => r + 1)
  }

  return (
    <div className="space-y-4 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Técnicos & Equipe de Campo</h2>
          <p className="text-sm text-slate-500 font-medium">Gerencie os profissionais que executam as ordens de serviço.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setModalNovo(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold rounded-xl shadow-sm transition-all">
            <Plus className="w-4 h-4" /> Cadastrar Técnico
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm max-w-sm">
        <Search className="w-4 h-4 text-slate-400" />
        <input 
          type="text" placeholder="Buscar por nome ou email..." 
          value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full text-[13px] font-medium border-none focus:outline-none focus:ring-0 placeholder:text-slate-400 py-1"
        />
      </div>

      {loading ? (
        <div className="p-12 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
      ) : tecnicos.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-black text-slate-700">Nenhum técnico cadastrado</h3>
          <p className="text-slate-500 text-sm mt-1">Adicione técnicos para começar a despachar ordens de serviço.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tecnicos.map(t => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-slate-300 hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 font-black text-lg">
                    {t.nome.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-[15px]">{t.nome}</h3>
                    <p className="text-[12px] text-slate-500 font-medium">{t.email}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status</p>
                  <button 
                    onClick={() => toggleStatus(t.id, t.status)}
                    className={cn(
                      "text-[12px] font-black px-2 py-0.5 rounded-md inline-block",
                      t.status === "ativo" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}
                  >
                    {t.status === "ativo" ? "Ativo" : "Inativo"}
                  </button>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Equipe</p>
                  <p className="text-[12px] font-bold text-slate-700">{t.equipe?.nome || "Sem Equipe"}</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase">
                  {t._count.ordensServico} OS Atribuídas
                </span>
                <span className="text-[12px] font-medium text-slate-500">{t.telefone || "Sem telefone"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL CRIAR TÉCNICO */}
      {modalNovo && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4">
            <h3 className="font-black text-slate-900 text-lg mb-5 flex items-center gap-2">
              <Wrench className="w-5 h-5 text-indigo-600" />
              Novo Técnico
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Nome Completo</label>
                <input type="text" placeholder="Ex: Carlos Silva" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">E-mail</label>
                <input type="email" placeholder="carlos@empresa.com.br" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-indigo-400" />
              </div>
              <div>
                <label className="text-[11px] font-black text-slate-500 uppercase tracking-wider block mb-1.5">Telefone</label>
                <input type="text" placeholder="(11) 99999-9999" value={form.telefone} onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-[13px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:border-indigo-400" />
              </div>

              {erro && <p className="text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{erro}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModalNovo(false)} className="flex-1 py-2.5 border border-slate-200 text-slate-600 text-[13px] font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancelar</button>
              <button onClick={handleSalvar} disabled={salvando}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-black rounded-xl shadow-md transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Técnico"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
