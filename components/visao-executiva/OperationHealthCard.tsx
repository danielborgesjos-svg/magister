import { CheckCircle2, AlertTriangle, AlertCircle } from "lucide-react"

export interface HealthItem {
  label: string
  status: "ok" | "warn" | "error"
  detalhe: string
}

interface OperationHealthCardProps {
  items: HealthItem[]
}

export function OperationHealthCard({ items }: OperationHealthCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
        <h3 className="text-[14px] font-bold text-slate-900">Saúde da Operação</h3>
        <p className="text-[11px] text-slate-500 mt-0.5">Status dos principais fluxos sistêmicos</p>
      </div>
      <div className="p-4 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 py-1">
            {item.status === "ok" && <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />}
            {item.status === "warn" && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
            {item.status === "error" && <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />}
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-slate-800 leading-tight">{item.label}</p>
              <p className="text-[11px] font-medium text-slate-500 mt-0.5">{item.detalhe}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
