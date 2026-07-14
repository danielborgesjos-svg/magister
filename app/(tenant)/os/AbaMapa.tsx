"use client"

import { useState, useEffect } from "react"
import { Crosshair, Search, MapPin, Navigation, Loader2 } from "lucide-react"
import dynamic from "next/dynamic"
import { buscarOSCompleto } from "@/app/actions/os"
import { listarTecnicos } from "@/app/actions/tecnicos"
import { cn } from "@/lib/utils"

// Importação dinâmica essencial para o react-leaflet não quebrar no SSR do Next.js
const MapaReal = dynamic(() => import("./MapaReal"), { 
  ssr: false, 
  loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div> 
})

export default function AbaMapa() {
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [ordens, setOrdens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      listarTecnicos(),
      buscarOSCompleto({})
    ]).then(([resTec, resOS]) => {
      setTecnicos(resTec)
      setOrdens(resOS.itens || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="bg-slate-100 rounded-2xl h-[calc(100vh-280px)] min-h-[500px] flex items-center justify-center animate-pulse border border-slate-200">
        <Loader2 className="w-10 h-10 animate-spin text-slate-300" />
      </div>
    )
  }

  return (
    <div className="relative h-[calc(100vh-280px)] min-h-[500px] bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm">
      
      {/* AREA DO MAPA REAL */}
      <div className="flex-1 relative z-0">
        <MapaReal tecnicos={tecnicos} ordens={ordens} />
      </div>

      {/* CONTROLES FLUTUANTES (Barra Lateral Direita) */}
      <div className="relative z-10 w-full md:w-80 bg-white/95 backdrop-blur-md border-l border-slate-200 flex flex-col h-full shadow-2xl">
        <div className="p-5 border-b border-slate-200/50 bg-white">
          <h3 className="font-black text-slate-900 text-lg flex items-center gap-2 mb-4">
            <Crosshair className="w-5 h-5 text-indigo-600" />
            Radar de Equipes
          </h3>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" placeholder="Buscar Técnico..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-3 text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Técnicos em Campo ({tecnicos.length})</h4>
          
          {tecnicos.map(t => {
            const osAtribuidas = ordens.filter(o => o.tecnicoId === t.id)
            const ativa = osAtribuidas.length > 0

            return (
              <div key={t.id} className={cn(
                "p-3 rounded-xl cursor-pointer hover:shadow-md transition-all border",
                ativa ? "bg-white border-slate-200" : "bg-slate-50 border-slate-100 opacity-70"
              )}>
                <div className="flex items-center justify-between mb-1">
                  <span className={cn(
                    "text-[11px] font-black px-2 py-0.5 rounded-md",
                    ativa ? "text-indigo-600 bg-indigo-50" : "text-slate-500 bg-slate-200"
                  )}>
                    {t.nome}
                  </span>
                  <span className={cn("w-2 h-2 rounded-full", ativa ? "bg-emerald-500 animate-pulse" : "bg-slate-300")} />
                </div>
                <p className="text-[12px] font-bold text-slate-700 flex items-center gap-1.5 mt-2">
                  <Navigation className="w-3.5 h-3.5 text-slate-400" /> 
                  {ativa ? `${osAtribuidas.length} OS Atribuídas` : "Disponível"}
                </p>
              </div>
            )
          })}

          {tecnicos.length === 0 && (
            <p className="text-[12px] text-slate-400 font-medium text-center mt-4">Nenhum técnico cadastrado.</p>
          )}
        </div>
      </div>
    </div>
  )
}
