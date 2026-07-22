// Páginas esqueleto profissionais para módulos sem implementação completa
// Padrão enterprise dark — para apresentação à diretoria

import Link from "next/link"
import { ArrowLeft, Construction, Clock } from "lucide-react"

interface ComingSoonProps {
  modulo: string
  descricao: string
  subtelas: string[]
  eta?: string
}

export function ComingSoonPage({ modulo, descricao, subtelas, eta = "Sprint 2" }: ComingSoonProps) {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-6">
      <div className="max-w-xl w-full space-y-8">
        
        <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <Construction className="w-8 h-8 text-blue-400" />
        </div>

        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs font-bold text-amber-400">{eta} — Em desenvolvimento</span>
          </div>
          <h1 className="text-3xl font-black text-slate-100">{modulo}</h1>
          <p className="text-slate-500 mt-3 text-sm leading-relaxed">{descricao}</p>
        </div>

        <div className="rounded-xl border border-white/5 bg-[#111318] p-6 text-left">
          <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-4">Subtelas previstas neste módulo</p>
          <div className="grid grid-cols-2 gap-2">
            {subtelas.map((s, i) => (
              <div key={i} className="flex items-center gap-2 py-1.5">
                <div className="w-1 h-1 rounded-full bg-blue-500/50" />
                <span className="text-[12px] text-slate-500">{s}</span>
              </div>
            ))}
          </div>
        </div>

        <Link
          href="/visao-executiva"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para Visão Executiva
        </Link>
      </div>
    </div>
  )
}
