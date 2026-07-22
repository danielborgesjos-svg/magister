import Link from "next/link"
import { ArrowRight, Settings2 } from "lucide-react"

export interface PrevisaoType {
  produto: string
  estoque: number
  p30: number
  p60: number
  p90: number
  cobertura: string
  conf: number
  status: "RUPTURA" | "ATENÇÃO" | "OK"
  acao: string
}

interface PredictiveTableProps {
  dados: PrevisaoType[]
}

export function PredictiveTable({ dados }: PredictiveTableProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        <div className="relative z-10">
          <h3 className="text-[15px] font-black text-slate-900 tracking-tight">Previsibilidade de Estoque — Decisões de Reposição</h3>
          <p className="text-[11.5px] font-medium text-slate-500 mt-1">Modelo de Machine Learning orientando planejamento e gestão de estoque</p>
        </div>
        <Link href="/inteligencia" className="relative z-10 flex items-center gap-1 text-[12px] font-bold text-blue-600 hover:text-blue-700 bg-white border border-blue-100 px-3 py-1.5 rounded-md shadow-sm transition-all hover:bg-blue-50">
          <Settings2 className="w-3.5 h-3.5" /> Ajustar Parâmetros da IA
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              {["Produto", "Estoque Atual", "Demanda Prevista 30d", "Cobertura", "Confiança", "Status Preditivo", "Direcionamento da IA"].map((h) => (
                <th key={h} className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap bg-slate-50 border-r border-slate-100 last:border-0">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dados.map((row, i) => (
              <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-5 py-4">
                  <span className="text-[13px] font-bold text-slate-900">{row.produto}</span>
                </td>
                <td className="px-5 py-4 text-[13px] text-slate-600 font-mono font-medium">{row.estoque} un</td>
                <td className="px-5 py-4 text-[13px] text-blue-700 font-mono font-bold bg-blue-50/30">{row.p30} un</td>
                <td className="px-5 py-4 text-[13px] font-bold text-slate-700">{row.cobertura}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${row.conf}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono font-bold">{row.conf}%</span>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border tracking-wider ${
                    row.status === "RUPTURA" ? "bg-red-50 text-red-700 border-red-200" :
                    row.status === "ATENÇÃO" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                               "bg-emerald-50 text-emerald-700 border-emerald-200"
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-5 py-4 min-w-[200px]">
                  <p className="text-[12px] font-semibold text-slate-700 leading-snug">{row.acao}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
