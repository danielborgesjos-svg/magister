import { Button } from "@/components/ui/button"
import { BarChart3, RefreshCw } from "lucide-react"

interface ExecutiveHeaderProps {
  alertsCount: number
  dateStr: string
}

export function ExecutiveHeader({ alertsCount, dateStr }: ExecutiveHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Ao Vivo</span>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {dateStr}
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Central de Inteligência Executiva
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          DISAFE — Motor preditivo JARMIS v4.1 · {alertsCount} anomalias detectadas
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="sm"
          className="text-slate-600 bg-white border-slate-200 hover:bg-slate-50 gap-2 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Atualizar
        </Button>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm"
        >
          <BarChart3 className="w-4 h-4" /> Relatório Executivo
        </Button>
      </div>
    </div>
  )
}
