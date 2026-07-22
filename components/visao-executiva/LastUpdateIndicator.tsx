import { RefreshCcw } from "lucide-react"

interface LastUpdateIndicatorProps {
  dateStr: string
}

export function LastUpdateIndicator({ dateStr }: LastUpdateIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 pt-4 pb-8 text-slate-400">
      <RefreshCcw className="w-3 h-3" />
      <span className="text-[11px] font-medium" title="Dados sincronizados em tempo real via Motor Preditivo JARMIS e ERP base.">
        Dados atualizados em {dateStr}
      </span>
      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full ml-1" title="Sincronização Ativa" />
    </div>
  )
}
