import { UserCheck, PhoneCall, Coffee, ArrowRight } from "lucide-react"

interface ComercialSupportType {
  cliente: string
  prob: number
  indicador: string
  acaoSugerida: string
  tipoContato: "phone" | "coffee" | "meeting"
}

interface CommercialPredictiveSupportProps {
  recomendacoes: ComercialSupportType[]
}

export function CommercialPredictiveSupport({ recomendacoes }: CommercialPredictiveSupportProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm h-full flex flex-col">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col bg-slate-50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        <div className="relative z-10">
          <h3 className="text-[15px] font-black text-slate-900 tracking-tight">Apoio Preditivo ao Comercial</h3>
          <p className="text-[11.5px] text-slate-500 mt-1 font-medium leading-snug">
            A IA analisou comportamentos de recompra e sugere estas ações de <strong>relacionamento</strong> preventivo.
          </p>
        </div>
      </div>
      
      <div className="p-4 space-y-4 flex-1 bg-white">
        {recomendacoes.map((rec, i) => (
          <div key={i} className="p-4 rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-md transition-all group relative overflow-hidden">
            {/* Soft highlight bar */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="text-[14px] font-bold text-slate-900 leading-tight">{rec.cliente}</h4>
              <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                {rec.prob}% Conv.
              </span>
            </div>
            
            <div className="mb-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Padrão Histórico</span>
              <p className="text-[12.5px] font-medium text-slate-600 leading-snug mt-0.5">{rec.indicador}</p>
            </div>
            
            <div className="bg-blue-50/50 p-3 rounded-lg border border-blue-100 mt-2">
              <div className="flex items-center gap-1.5 mb-1.5">
                {rec.tipoContato === "phone" && <PhoneCall className="w-3.5 h-3.5 text-blue-600" />}
                {rec.tipoContato === "coffee" && <Coffee className="w-3.5 h-3.5 text-blue-600" />}
                {rec.tipoContato === "meeting" && <UserCheck className="w-3.5 h-3.5 text-blue-600" />}
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Ação Recomendada</span>
              </div>
              <p className="text-[12.5px] font-semibold text-slate-800 leading-relaxed">
                {rec.acaoSugerida}
              </p>
              
              <div className="mt-3 text-right">
                <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1 bg-white px-3 py-1.5 rounded-md border border-blue-200 shadow-sm transition-all hover:bg-blue-50">
                  Agendar Ação <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
