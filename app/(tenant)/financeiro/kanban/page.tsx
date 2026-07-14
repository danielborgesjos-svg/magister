"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Calendar, DollarSign, ArrowUpRight, ArrowDownRight, MoreVertical, Sparkles, GripVertical } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { buscarLancamentos, atualizarLancamento } from "@/app/actions/financeiro"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"

const COLUMNS = [
  { id: "pendente", title: "A Receber / Pagar", color: "text-amber-600", bg: "bg-amber-50" },
  { id: "em_acordo", title: "Renegociação", color: "text-blue-600", bg: "bg-blue-50" },
  { id: "pago", title: "Concluídos", color: "text-emerald-600", bg: "bg-emerald-50" },
  { id: "vencido", title: "Atrasados", color: "text-rose-600", bg: "bg-rose-50" },
]

export default function KanbanFinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<any[]>([])
  
  useEffect(() => {
    async function load() {
      const data = await buscarLancamentos()
      setLancamentos(data)
    }
    load()
  }, [])

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId

    // Optimistic Update
    setLancamentos(prev => prev.map(l => {
      if (l.id === draggableId) {
        return { ...l, status: newStatus }
      }
      return l
    }))

    // DB Update
    try {
      await atualizarLancamento(draggableId, { status: newStatus })
    } catch (e) {
      console.error("Failed to update status", e)
    }
  }

  // IA MOCK LOGIC - Randomly assigning an AI insight to some cards based on their ID length or something to make it look dynamic
  const getAIInsight = (lanc: any) => {
    if (lanc.status === "vencido" && lanc.valor > 500) {
      return "Alta probabilidade de inadimplência. Sugerimos acionar cobrança via WhatsApp."
    }
    if (lanc.status === "pendente" && lanc.tipo === "despesa" && new Date(lanc.dataVenc) < new Date(new Date().setDate(new Date().getDate() + 2))) {
      return "Vencimento próximo. Evite juros antecipando o pagamento."
    }
    if (lanc.status === "pago" && lanc.tipo === "receita" && lanc.valor > 2000) {
      return "Cliente com excelente histórico. Sugestão: Ofertar upgrade de serviço."
    }
    return null
  }

  return (
    <div className="flex flex-col h-full space-y-6 max-w-[1600px] mx-auto w-full">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Kanban Financeiro Avançado</h1>
          <p className="text-slate-500 text-sm mt-1">Gerencie seus recebimentos e pagamentos através das fases. Arraste para alterar o status.</p>
        </div>
        
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2.5 rounded-xl border border-purple-100">
          <Sparkles size={18} className="text-purple-500" />
          <span className="text-sm font-semibold">Os Insights da IA estão ativos</span>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 overflow-x-auto pb-6 custom-scrollbar items-start min-h-[600px]">
          {COLUMNS.map((coluna) => {
            const lancamentosColuna = lancamentos.filter(l => l.status === coluna.id)
            const valorTotal = lancamentosColuna.reduce((acc, l) => acc + (l.tipo === 'receita' ? l.valor : -l.valor), 0)

            return (
              <Droppable key={coluna.id} droppableId={coluna.id}>
                {(provided, snapshot) => (
                  <div 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={cn(
                      "min-w-[340px] max-w-[340px] flex flex-col bg-slate-50/50 border rounded-2xl transition-colors h-full max-h-[calc(100vh-220px)]",
                      snapshot.isDraggingOver ? "bg-slate-100 border-slate-300 border-dashed" : "border-slate-200 shadow-sm"
                    )}
                  >
                    {/* Header da Coluna */}
                    <div className="p-4 border-b border-slate-200/60 bg-white rounded-t-2xl">
                      <div className="flex justify-between items-center mb-1">
                        <h3 className={cn("font-bold text-sm tracking-wide", coluna.color)}>
                          {coluna.title}
                        </h3>
                        <span className="bg-slate-100 text-slate-600 text-xs font-bold px-2 py-0.5 rounded-full">
                          {lancamentosColuna.length}
                        </span>
                      </div>
                      <p className={cn("text-lg font-black tracking-tight", valorTotal >= 0 ? "text-emerald-600" : "text-rose-600")}>
                        {formatCurrency(valorTotal)}
                      </p>
                    </div>

                    {/* Cards */}
                    <div className="flex-1 p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                      {lancamentosColuna.map((lancamento, index) => {
                        const insight = getAIInsight(lancamento)
                        return (
                          <Draggable key={lancamento.id} draggableId={lancamento.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className={cn(
                                  "bg-white p-4 rounded-xl border group transition-all relative overflow-hidden",
                                  snapshot.isDragging ? "shadow-2xl border-black ring-4 ring-black/5 rotate-2 scale-105 z-50" : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md"
                                )}
                                style={provided.draggableProps.style}
                              >
                                {/* Drag Handle */}
                                <div 
                                  {...provided.dragHandleProps} 
                                  className="absolute top-4 right-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing transition-opacity"
                                >
                                  <GripVertical size={16} />
                                </div>

                                <div className="flex justify-between items-start mb-3 pr-6">
                                  <span className={cn(
                                    "text-[10px] font-black uppercase flex items-center gap-1 px-2 py-0.5 rounded-md",
                                    lancamento.tipo === 'receita' ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                                  )}>
                                    {lancamento.tipo === 'receita' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                                    {lancamento.tipo}
                                  </span>
                                  
                                  <span className="text-[10px] font-bold text-slate-400">
                                    {format(new Date(lancamento.dataVenc), "dd/MM/yy")}
                                  </span>
                                </div>
                                
                                <p className="font-bold text-sm leading-snug mb-4 text-slate-900">
                                  {lancamento.descricao}
                                </p>
                                
                                <div className="flex items-center justify-between mt-auto">
                                  <p className="font-black text-lg text-slate-900 tracking-tight">
                                    {formatCurrency(lancamento.valor)}
                                  </p>
                                </div>

                                {/* AI Insight Injetado */}
                                {insight && (
                                  <div className="mt-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100/50 p-3 rounded-lg flex gap-2">
                                    <Sparkles className="text-purple-500 shrink-0 mt-0.5" size={14} />
                                    <p className="text-[11px] font-medium text-purple-900 leading-relaxed">
                                      {insight}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        )
                      })}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            )
          })}
        </div>
      </DragDropContext>
    </div>
  )
}
