"use client"

import { useState, useEffect } from "react"
import { 
  Bot, AlertTriangle, TrendingUp, Zap, ArrowUpRight,
  BrainCircuit, LayoutDashboard, Search, BellRing, Activity
} from "lucide-react"
import { useLayout } from "@/components/layout/LayoutProvider"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { gerarInsightsIA } from "@/app/actions/inteligencia"

// Mapeamento de cores
const colorMap: Record<string, { bg: string, border: string, text: string, shadow: string, iconBg: string }> = {
  red:     { bg: "bg-red-50",     border: "border-red-200",     text: "text-red-700",     shadow: "shadow-red-500/10",    iconBg: "bg-red-100" },
  amber:   { bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-700",   shadow: "shadow-amber-500/10",  iconBg: "bg-amber-100" },
  emerald: { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", shadow: "shadow-emerald-500/10",iconBg: "bg-emerald-100" },
  indigo:  { bg: "bg-indigo-50",  border: "border-indigo-200",  text: "text-indigo-700",  shadow: "shadow-indigo-500/10", iconBg: "bg-indigo-100" },
}

export default function InteligenciaPage() {
  const { openIAPanel } = useLayout()
  const [insights, setInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    gerarInsightsIA().then(res => {
      setInsights(res)
      setLoading(false)
    })
  }, [])

  return (
    <div className="flex flex-col gap-6 w-full max-w-5xl pb-10">
      {/* ── HEADER MAGIS / JARMIS ── */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 shadow-2xl border border-slate-800">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <BrainCircuit className="w-64 h-64 text-blue-400" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-500/20 border border-blue-500/30">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
              </span>
              <span className="text-[11px] font-black uppercase tracking-widest text-blue-400">Motor de Inferência Ativo</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight leading-tight mb-2">
              JARMIS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Insights IA</span>
            </h1>
            <p className="text-slate-400 font-medium text-[15px] leading-relaxed">
              O modelo escaneou toda a sua operação em tempo real cruzando dados de OS, Financeiro e Estoque. 
              Aqui estão os principais gargalos e oportunidades preditivas identificados.
            </p>
          </div>

          <div className="flex flex-col gap-3 shrink-0">
            <button onClick={() => openIAPanel("global")}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 text-[14px] font-black rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all">
              <Bot className="w-4 h-4" /> Abrir Copiloto IA
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500">
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Última varredura: Agora
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTEÚDO (INSIGHTS PREDITIVOS) ── */}
      <div>
        <div className="flex items-center gap-2 mb-4 px-1">
          <BellRing className="w-4 h-4 text-slate-400" />
          <h2 className="text-lg font-black text-slate-800">Descobertas do Modelo</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="animate-pulse bg-slate-100 rounded-2xl h-[180px] border border-slate-200" />
            ))}
          </div>
        ) : insights.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center">
            <Search className="w-10 h-10 text-slate-300 mb-4" />
            <h3 className="text-lg font-black text-slate-700">Nenhum insight gerado no momento.</h3>
            <p className="text-slate-500 text-sm mt-1">O volume de dados atual não apontou anomalias. A IA continuará monitorando.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {insights.map((insight: any) => {
              const corTema = colorMap[insight.cor] || colorMap.indigo
              
              return (
                <div key={insight.id} 
                  className={cn(
                    "relative overflow-hidden bg-white border rounded-2xl p-6 transition-all hover:shadow-lg group",
                    corTema.border, corTema.shadow
                  )}>
                  
                  {/* Etiqueta de impacto no topo direito */}
                  <div className={cn("absolute top-4 right-4 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider", corTema.bg, corTema.text)}>
                    {insight.tipo}
                  </div>

                  <div className="flex flex-col h-full justify-between gap-6">
                    <div>
                      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", corTema.iconBg)}>
                        {insight.tipo === "critico" || insight.tipo === "alerta" ? (
                          <AlertTriangle className={cn("w-6 h-6", corTema.text)} />
                        ) : insight.tipo === "oportunidade" ? (
                          <TrendingUp className={cn("w-6 h-6", corTema.text)} />
                        ) : (
                          <LayoutDashboard className={cn("w-6 h-6", corTema.text)} />
                        )}
                      </div>
                      <h3 className="text-[17px] font-black text-slate-900 mb-2 leading-tight pr-12">
                        {insight.titulo}
                      </h3>
                      <p className="text-[13px] font-medium text-slate-500 leading-relaxed">
                        {insight.descricao}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <div className="flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase">{insight.impacto}</span>
                      </div>
                      
                      <Link href={insight.link} 
                        className={cn(
                          "flex items-center gap-1.5 text-[12px] font-black px-4 py-2 rounded-xl transition-all",
                          corTema.bg, corTema.text, `hover:brightness-95`
                        )}>
                        {insight.acao} <ArrowUpRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
