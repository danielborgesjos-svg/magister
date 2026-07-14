"use client"

import { useState, useEffect, useCallback } from "react"
import { LayoutGrid, Loader2, Clock, AlertTriangle, User, MoreVertical } from "lucide-react"
import { buscarOSCompleto, atualizarStatusOS } from "@/app/actions/os"
import { cn } from "@/lib/utils"

const COLUNAS = [
  { id: "aguardando_agendamento", label: "Aguardando",      cor: "#64748B", bg: "bg-slate-100",   border: "border-slate-200" },
  { id: "agendada",               label: "Agendada",        cor: "#3B82F6", bg: "bg-blue-50",     border: "border-blue-200" },
  { id: "em_deslocamento",        label: "Em Desloc.",      cor: "#8B5CF6", bg: "bg-violet-50",   border: "border-violet-200" },
  { id: "em_execucao",            label: "Execução",        cor: "#F59E0B", bg: "bg-amber-50",    border: "border-amber-200" },
  { id: "aguardando_revisao",     label: "Em Revisão",      cor: "#EF4444", bg: "bg-red-50",      border: "border-red-200" },
]

export default function AbaKanban() {
  const [ordens, setOrdens] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)
  
  const carregar = useCallback(async () => {
    const res = await buscarOSCompleto({})
    // Filtramos apenas as que devem aparecer no Kanban (excluir cancelada, concluida, rascunho)
    const validas = res.itens.filter((o: any) => COLUNAS.map(c => c.id).includes(o.status))
    setOrdens(validas)
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.setData("text/plain", id)
    e.currentTarget.classList.add("opacity-50")
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("opacity-50")
    setDraggedItem(null)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault() // Necessário para permitir o drop
  }

  const handleDrop = async (e: React.DragEvent, statusId: string) => {
    e.preventDefault()
    const osId = e.dataTransfer.getData("text/plain")
    if (!osId) return

    const os = ordens.find(o => o.id === osId)
    if (os && os.status !== statusId) {
      // Optimistic update
      setOrdens(prev => prev.map(o => o.id === osId ? { ...o, status: statusId } : o))
      setUpdating(osId)
      
      const res = await atualizarStatusOS(osId, statusId)
      setUpdating(null)
      
      if (!res.success) {
        // Rollback
        setOrdens(prev => prev.map(o => o.id === osId ? { ...o, status: os.status } : o))
        alert(res.error)
      }
    }
  }

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-280px)] min-h-[500px]">
      {COLUNAS.map(coluna => {
        const itens = ordens.filter(o => o.status === coluna.id)
        const valorTotal = itens.reduce((acc, o) => acc + (o.valorPrevisto || 0), 0)

        return (
          <div 
            key={coluna.id}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, coluna.id)}
            className={cn(
              "flex flex-col w-[320px] shrink-0 rounded-2xl border transition-colors",
              coluna.bg, coluna.border
            )}
          >
            {/* Header da Coluna */}
            <div className="px-4 py-3 border-b border-white/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: coluna.cor }} />
                <h3 className="font-black text-slate-800 text-[13px] uppercase tracking-wider">{coluna.label}</h3>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 bg-white/60 px-2 py-0.5 rounded-full">{itens.length}</span>
              </div>
            </div>

            {/* Cards */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {itens.map(os => (
                <div
                  key={os.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, os.id)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "bg-white border border-slate-200 rounded-xl p-3.5 shadow-sm cursor-grab active:cursor-grabbing transition-all hover:shadow-md relative",
                    updating === os.id ? "opacity-50 pointer-events-none" : ""
                  )}
                >
                  {updating === os.id && (
                    <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-xl z-10">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                    </div>
                  )}
                  
                  <div className="flex justify-between items-start mb-2.5">
                    <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                      #{os.codigo}
                    </span>
                    {os.prioridade === "critica" && (
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                    )}
                  </div>

                  <h4 className="font-bold text-[13px] text-slate-900 leading-tight mb-3 line-clamp-2">
                    {os.titulo}
                  </h4>

                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11.5px] font-medium text-slate-600 truncate">
                      {os.tecnico?.nome || "Não Alocado"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold uppercase tracking-wider">
                        {new Date(os.createdAt).toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                    {os.valorPrevisto > 0 && (
                      <span className="text-[12px] font-black text-slate-700">
                        R$ {os.valorPrevisto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {itens.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-300/50 rounded-xl flex items-center justify-center">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Arraste para cá</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
