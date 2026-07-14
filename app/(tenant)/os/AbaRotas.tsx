"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, User, Clock, AlertTriangle, MapPin, Truck } from "lucide-react"
import { buscarOSCompleto, atribuirTecnicoOS } from "@/app/actions/os"
import { listarTecnicos } from "@/app/actions/tecnicos"
import { cn } from "@/lib/utils"

export default function AbaRotas() {
  const [ordens, setOrdens] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)
  
  const carregar = useCallback(async () => {
    const [resOS, resTecnicos] = await Promise.all([
      buscarOSCompleto({}),
      listarTecnicos()
    ])
    setOrdens(resOS.itens.filter((o: any) => o.status !== "concluida" && o.status !== "cancelada"))
    setTecnicos(resTecnicos)
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("osId", id)
    e.currentTarget.classList.add("opacity-50")
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50")
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, tecnicoId: string | null) => {
    e.preventDefault()
    const osId = e.dataTransfer.getData("osId")
    if (!osId) return

    const os = ordens.find(o => o.id === osId)
    if (os && os.tecnicoId !== tecnicoId) {
      // Optimistic update
      setOrdens(prev => prev.map(o => o.id === osId ? { ...o, tecnicoId } : o))
      setUpdating(osId)
      
      const res = await atribuirTecnicoOS(osId, tecnicoId)
      setUpdating(null)
      
      if (!res.success) {
        setOrdens(prev => prev.map(o => o.id === osId ? { ...o, tecnicoId: os.tecnicoId } : o))
        alert(res.error)
      }
    }
  }

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
  }

  const pendentes = ordens.filter(o => !o.tecnicoId)

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-280px)] min-h-[500px]">
      
      {/* Coluna de Pendentes (Backlog) */}
      <div 
        className="w-full md:w-80 flex flex-col bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shrink-0"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
      >
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="font-black text-slate-900 text-[14px] uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            Sem Rota / Pendentes
          </h3>
          <p className="text-[11px] font-bold text-slate-400 mt-1">{pendentes.length} OS aguardando técnico</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-50">
          {pendentes.map(os => (
            <div
              key={os.id}
              draggable
              onDragStart={(e) => handleDragStart(e, os.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                "bg-white border border-slate-200 rounded-xl p-3 shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all relative",
                updating === os.id ? "opacity-50 pointer-events-none" : ""
              )}
            >
              {updating === os.id && (
                <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl z-10">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                </div>
              )}
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">#{os.codigo}</span>
                {os.prioridade === "critica" && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
              </div>
              <h4 className="font-bold text-[12px] text-slate-800 leading-tight mb-2">{os.titulo}</h4>
              <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" /> {os.endereco?.cidade || "Endereço não informado"}
              </p>
            </div>
          ))}
          {pendentes.length === 0 && (
            <div className="h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center text-slate-400">
              <span className="text-[11px] font-bold uppercase">Nenhuma OS pendente</span>
            </div>
          )}
        </div>
      </div>

      {/* Raias dos Técnicos (Rotas) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
        {tecnicos.map(tecnico => {
          const rota = ordens.filter(o => o.tecnicoId === tecnico.id)
          
          return (
            <div 
              key={tecnico.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, tecnico.id)}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                    {tecnico.nome.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-[14px]">{tecnico.nome}</h3>
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                      <Truck className="w-3 h-3" /> Rota com {rota.length} paradas
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-2 min-h-[120px]">
                {rota.map((os, index) => (
                  <div
                    key={os.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, os.id)}
                    onDragEnd={handleDragEnd}
                    className={cn(
                      "w-60 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-all relative",
                      updating === os.id ? "opacity-50 pointer-events-none" : ""
                    )}
                  >
                    {updating === os.id && (
                      <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl z-10">
                        <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black text-slate-500 bg-slate-200 px-2 py-0.5 rounded-md">
                        Parada {index + 1}
                      </span>
                      <span className="text-[10px] font-black text-indigo-600">#{os.codigo}</span>
                    </div>
                    <h4 className="font-bold text-[12px] text-slate-800 leading-tight mb-2 truncate">{os.titulo}</h4>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-medium text-slate-500 flex items-center gap-1 truncate w-32">
                        <MapPin className="w-3 h-3" /> {os.endereco?.bairro || "Sem bairro"}
                      </p>
                      {os.dataAgendada && (
                        <span className="text-[10px] font-bold text-slate-600 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(os.dataAgendada).getHours()}h
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                
                {rota.length === 0 && (
                  <div className="w-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 bg-slate-50/50">
                    <span className="text-[11px] font-bold uppercase">Arraste OS para cá para montar a rota</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

    </div>
  )
}
