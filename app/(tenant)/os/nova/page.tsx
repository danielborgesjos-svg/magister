"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { criarOS } from "@/app/actions/os"
import { toast } from "sonner"
// Dummy imports to get clients/tecnicos/etc
// We will use standard select with hardcoded/mocked data for now, but in real app we fetch them.

export default function NovaOSPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    titulo: "",
    clienteId: "cli_123", // mock
    enderecoId: "end_123", // mock
    tecnicoId: "tec_123", // mock
    tipoAtendimento: "Manutenção Corretiva",
    dataAgendada: new Date().toISOString().slice(0, 16),
    observacoesInternas: ""
  })

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await criarOS(form)
    if (res.success) {
      toast.success("Ordem de Serviço criada!")
      router.push("/os")
    } else {
      toast.error(res.error || "Erro ao criar OS")
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-2">
        <Link href="/os" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="text-slate-500" size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nova Ordem de Serviço</h1>
      </div>

      <form onSubmit={handleSave} className="bg-white border rounded-2xl p-6 md:p-8 flex flex-col gap-6 shadow-sm">
        
        <div className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Título / Resumo do Problema *</label>
            <input 
              required
              value={form.titulo}
              onChange={e => setForm({...form, titulo: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
              placeholder="Ex: Troca de filtro do purificador"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Cliente * (Mock)</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black">
                <option value="cli_123">João Silva (Mock)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Endereço * (Mock)</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black">
                <option value="end_123">Rua Principal, 100 - Centro</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Tipo de Atendimento *</label>
              <select 
                value={form.tipoAtendimento}
                onChange={e => setForm({...form, tipoAtendimento: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              >
                <option value="Manutenção Corretiva">Manutenção Corretiva</option>
                <option value="Manutenção Preventiva">Manutenção Preventiva</option>
                <option value="Instalação">Instalação</option>
                <option value="Avaliação">Avaliação Técnica</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Técnico * (Mock)</label>
              <select className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black">
                <option value="tec_123">Carlos Técnico</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">Data e Hora *</label>
              <input 
                required
                type="datetime-local"
                value={form.dataAgendada}
                onChange={e => setForm({...form, dataAgendada: e.target.value})}
                className="w-full bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700">Observações Internas</label>
            <textarea 
              value={form.observacoesInternas}
              onChange={e => setForm({...form, observacoesInternas: e.target.value})}
              className="w-full h-28 bg-white border border-slate-200 rounded-xl py-3 px-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black resize-none"
              placeholder="Anotações para o técnico..."
            />
          </div>
        </div>

        <div className="flex justify-end pt-6 mt-2 border-t border-slate-100">
          <button 
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-8 py-3 bg-black hover:bg-slate-800 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? "Salvando..." : "Criar Ordem de Serviço"}
          </button>
        </div>

      </form>
    </div>
  )
}
