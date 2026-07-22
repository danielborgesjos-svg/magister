"use client"

import { BrainCircuit, AlertOctagon, Zap, ArrowDownToLine, ArrowUpFromLine, MessageSquare, ArrowRight } from "lucide-react"
import { useLayout } from "@/components/layout/LayoutProvider"

export function ExecutiveAISidebar() {
  const { openIAPanel } = useLayout()

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Cabeçalho */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-indigo-600" />
        <h2 className="text-[14px] font-black text-slate-900 tracking-tight">JARMIS – IA EXECUTIVA</h2>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {/* Saudação */}
        <div className="mb-5">
          <h3 className="text-[18px] font-black text-slate-900">Bom dia, Rafael!</h3>
          <p className="text-[12px] font-medium text-slate-500 mt-1">Analisei <strong className="text-slate-700">18 milhões de registros</strong> da sua empresa.</p>
        </div>

        {/* Resumo Caixa Acinzentada */}
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 space-y-3 mb-5">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-4 h-4 text-red-500" />
            <span className="text-[13px] font-bold text-slate-800">3 problemas críticos</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-amber-500" />
            <span className="text-[13px] font-bold text-slate-800">7 oportunidades identificadas</span>
          </div>
          <div className="w-full h-px bg-slate-200/60 my-1" />
          <div className="flex items-center gap-2.5">
            <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
            <span className="text-[13px] font-bold text-slate-800">Economia potencial — R$ 438.000</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ArrowUpFromLine className="w-4 h-4 text-emerald-500" />
            <span className="text-[13px] font-bold text-slate-800">Aumento de receita previsto — R$ 820.000</span>
          </div>
          <div className="flex items-center gap-2.5">
            <ArrowDownToLine className="w-4 h-4 text-emerald-500" />
            <span className="text-[13px] font-bold text-slate-800">Redução de custos prevista — R$ 147.000</span>
          </div>
        </div>

        {/* Confiança */}
        <div className="flex gap-3 mb-5 mt-auto">
          <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nível de Risco</p>
            <p className="text-[14px] font-black text-emerald-600">Baixo</p>
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded-lg p-3 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Confiança</p>
            <p className="text-[14px] font-black text-indigo-600">96%</p>
          </div>
        </div>

        {/* Botão */}
        <button 
          onClick={() => openIAPanel()}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-3 flex items-center justify-center gap-2 text-[13px] font-bold shadow-md shadow-indigo-600/20 transition-all"
        >
          Conversar com IA
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
