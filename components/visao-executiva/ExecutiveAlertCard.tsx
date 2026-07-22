import { BrainCircuit, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface AlertaType {
  id: number
  priority: string
  area: string
  titulo: string
  causa: string
  impacto: number
  prazo: string
  responsavel: string
  recomendacao: string
  confianca: number
  cor: string
}

interface ExecutiveAlertCardProps {
  alerta: AlertaType
}

export function ExecutiveAlertCard({ alerta }: ExecutiveAlertCardProps) {
  const colorMap = {
    red: { 
      border: "border-red-200 border-l-4 border-l-red-500", 
      bgTop: "bg-red-50", 
      text: "text-red-700", 
      dot: "bg-red-500",
      btn: "bg-red-600 hover:bg-red-700 text-white",
      confBg: "bg-red-100",
      confText: "text-red-700"
    },
    amber: { 
      border: "border-amber-200 border-l-4 border-l-amber-500", 
      bgTop: "bg-amber-50", 
      text: "text-amber-700", 
      dot: "bg-amber-500",
      btn: "bg-amber-600 hover:bg-amber-700 text-white",
      confBg: "bg-amber-100",
      confText: "text-amber-700"
    },
    blue: { 
      border: "border-blue-200 border-l-4 border-l-blue-500", 
      bgTop: "bg-blue-50", 
      text: "text-blue-700", 
      dot: "bg-blue-500",
      btn: "bg-blue-600 hover:bg-blue-700 text-white",
      confBg: "bg-blue-100",
      confText: "text-blue-700"
    },
  }

  // Fallback map
  const c = colorMap[alerta.cor as keyof typeof colorMap] || colorMap.blue

  return (
    <div className={`rounded-xl bg-white border ${c.border} shadow-sm overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group`}>
      {/* Topo colorido */}
      <div className={`px-5 pt-4 pb-3 ${c.bgTop} border-b border-slate-100 relative`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/40" />
        <div className="relative z-10 flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${c.dot} animate-pulse`} />
            <span className={`text-[10px] font-black uppercase tracking-[0.12em] ${c.text}`}>
              {alerta.priority}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">·</span>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{alerta.area}</span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[10px] font-medium text-slate-500">{alerta.prazo}</span>
          </div>
        </div>
        <h3 className="text-[15px] font-bold text-slate-900 mt-2.5 leading-tight">{alerta.titulo}</h3>
      </div>

      {/* Corpo */}
      <div className="px-5 py-4 grid md:grid-cols-2 gap-5">
        <div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1.5">Causa Raiz</p>
          <p className="text-[13px] text-slate-600 leading-relaxed font-medium">{alerta.causa}</p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <BrainCircuit className="w-4 h-4 text-purple-600" />
            <p className="text-[10px] text-purple-600 uppercase tracking-widest font-bold">IA Recomenda</p>
            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.confBg} ${c.confText} font-bold`}>
              {alerta.confianca}% conf.
            </span>
          </div>
          <p className="text-[13px] text-slate-700 font-medium leading-relaxed">{alerta.recomendacao}</p>
        </div>
      </div>

      {/* Rodapé — Ações */}
      <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500">Responsável:</span>
          <span className={`text-[11px] font-bold ${c.text}`}>{alerta.responsavel}</span>
          <span className="text-[11px] text-slate-300 mx-1">|</span>
          <span className="text-[11px] text-slate-500">Impacto:</span>
          <span className="text-[11px] font-bold text-red-600">
            {alerta.impacto.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-4 text-[12px] font-semibold text-slate-600 bg-white border-slate-200 hover:bg-slate-100"
          >
            Ignorar
          </Button>
          <Button
            size="sm"
            className={`h-8 px-4 text-[12px] font-bold ${c.btn} shadow-sm`}
          >
            {alerta.cor === "blue" ? "Contatar" : "Criar OP"} <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
