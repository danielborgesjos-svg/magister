import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

export interface OportunidadeType {
  nome: string
  produto: string
  valor: number
  prob: number
}

interface OpportunityListProps {
  oportunidades: OportunidadeType[]
}

export function OpportunityList({ oportunidades }: OpportunityListProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
        <div>
          <h3 className="text-[14px] font-bold text-slate-900">Top Oportunidades</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Maior probabilidade de fechamento</p>
        </div>
        <Link href="/portal-b2b/oportunidades" className="text-xs text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1">
          Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="p-4 space-y-3">
        {oportunidades.map((op, i) => (
          <div key={i} className="p-3.5 rounded-lg border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <p className="text-[13px] font-bold text-slate-900 leading-tight group-hover:text-blue-700 transition-colors">{op.nome}</p>
              <span className="text-[12px] font-black text-emerald-600 shrink-0">
                {op.prob}%
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-500 mb-2.5">{op.produto}</p>
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-slate-700">
                {op.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </span>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full"
                  style={{ width: `${op.prob}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
