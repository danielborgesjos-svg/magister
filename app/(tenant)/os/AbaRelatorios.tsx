"use client"

import { useState, useEffect } from "react"
import { BarChart2, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle2, Loader2, Bot } from "lucide-react"
import { buscarKPIsOS } from "@/app/actions/os"
import { useLayout } from "@/components/layout/LayoutProvider"
import { cn } from "@/lib/utils"

export default function AbaRelatorios() {
  const { openIAPanel } = useLayout()
  const [kpis, setKpis] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    buscarKPIsOS().then(res => {
      setKpis(res)
      setLoading(false)
    })
  }, [])

  if (loading || !kpis) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
  }

  const taxaConclusao = kpis.total > 0 ? Math.round((kpis.concluidas / kpis.total) * 100) : 0

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Desempenho & Relatórios</h2>
          <p className="text-sm text-slate-500 font-medium">Métricas operacionais e inteligência de Field Service.</p>
        </div>
        <button onClick={() => openIAPanel("os")} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-black rounded-xl shadow-md shadow-indigo-600/20 transition-all">
          <Bot className="w-4 h-4" /> Relatório IA
        </button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-bold text-slate-400">Total / Concluídas</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{kpis.concluidas} <span className="text-lg text-slate-400 font-bold">/ {kpis.total}</span></h3>
          <div className="mt-3 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="bg-blue-500 h-full rounded-full transition-all" style={{ width: `${taxaConclusao}%` }} />
          </div>
          <p className="text-[11px] font-bold text-slate-500 mt-2">{taxaConclusao}% de conclusão geral</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-bold text-slate-400">SLA Vencido</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{kpis.atrasadas}</h3>
          <p className="text-[11px] font-bold text-red-500 mt-3 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Atenção requerida
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-bold text-slate-400">Em Execução</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{kpis.emExecucao}</h3>
          <p className="text-[11px] font-bold text-slate-500 mt-3">OS ativas neste momento</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
            <span className="text-[12px] font-bold text-slate-400">Não Faturadas</span>
          </div>
          <h3 className="text-3xl font-black text-slate-900">{kpis.naoFaturadas}</h3>
          <p className="text-[11px] font-bold text-emerald-600 mt-3">Receita parada no sistema</p>
        </div>
      </div>

      {/* Gráficos / Dashboards visuais mockados para UI premium */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-[14px] font-black text-slate-800 mb-6 uppercase tracking-wider flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-slate-400" /> Volume Semanal
          </h3>
          <div className="flex items-end justify-between gap-2 h-48 mt-4">
            {[30, 45, 25, 60, 40, 80, 50].map((v, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-full bg-slate-100 rounded-t-lg flex items-end overflow-hidden relative">
                  <div className="w-full bg-indigo-500 transition-all duration-500 rounded-t-lg group-hover:bg-indigo-400" style={{ height: `${v}%` }} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Bot className="w-32 h-32 text-indigo-400" />
          </div>
          <div>
            <span className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-wider rounded-lg">
              Insight IA
            </span>
            <h3 className="text-xl font-black mt-4 leading-tight">Gargalo de Produtividade Detectado</h3>
            <p className="text-slate-400 text-sm mt-3 font-medium leading-relaxed">
              As manutenções corretivas estão ultrapassando o SLA em 30% das vezes às sextas-feiras. O JARMIS recomenda aumentar a frota de despacho neste dia.
            </p>
          </div>
          <button onClick={() => openIAPanel("os")} className="mt-6 w-full py-3 bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[13px] rounded-xl transition-all shadow-md">
            Ver Relatório Completo
          </button>
        </div>
      </div>
    </div>
  )
}
