"use client"

import { Sparkles, PackageSearch, TrendingUp, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { recomendacoesIA } from "@/lib/mock-data"

const getIcon = (tipo: string, color: string) => {
  if (tipo === "economia") return <Sparkles className={`w-4 h-4 text-${color}-500`} />
  if (tipo === "risco") return <PackageSearch className={`w-4 h-4 text-${color}-500`} />
  return <TrendingUp className={`w-4 h-4 text-${color}-500`} />
}

export function AIRecommendations() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col mt-4">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-[13px] font-black text-slate-900 tracking-tight">RECOMENDAÇÕES DA IA</h3>
        <button 
          onClick={() => toast.info("Exibindo todas as recomendações da IA...")}
          className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
        >
          Ver todas
        </button>
      </div>

      <div className="p-4 flex-1 space-y-3">
        {recomendacoesIA.map((rec) => (
          <div key={rec.id} className={`border border-slate-100 rounded-lg p-3 hover:border-${rec.color}-200 transition-colors group`}>
            <div className="flex gap-3">
              <div className={`w-8 h-8 rounded-full bg-${rec.color}-50 flex items-center justify-center shrink-0`}>
                {getIcon(rec.tipo, rec.color)}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[12px] font-bold text-slate-900">{rec.titulo}</h4>
                <p className="text-[11px] text-slate-500 mt-0.5 font-medium">
                  {rec.valor.split(': ')[0]}: <strong className={`text-${rec.color}-600`}>{rec.valor.split(': ')[1]}</strong>
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-bold">Confiança: {rec.confianca}</p>
              </div>
            </div>
            <button 
              onClick={() => toast.success(`Simulação iniciada para: ${rec.titulo}`)}
              className="w-full mt-3 py-1.5 rounded-md border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Simular
            </button>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-slate-100 bg-slate-50">
        <button 
          onClick={() => toast.info("Carregando histórico completo de recomendações...")}
          className="w-full py-2 flex items-center justify-center gap-1.5 text-[11.5px] font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 rounded-md transition-colors"
        >
          Ver mais recomendações <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
