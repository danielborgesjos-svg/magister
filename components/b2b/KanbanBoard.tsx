'use client'

import { useState, useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { moverOportunidade } from '@/app/actions/b2b'
import { Building2, DollarSign, GripVertical, AlertCircle } from 'lucide-react'

// Usando ANY temporariamente para pular tipagem complexa do Prisma no Client
type Oportunidade = any 

interface KanbanBoardProps {
  initialData: Oportunidade[]
}

const COLUNAS = [
  { id: 'qualificacao', titulo: 'Qualificação', cor: 'border-t-slate-500' },
  { id: 'proposta', titulo: 'Em Proposta', cor: 'border-t-blue-500' },
  { id: 'negociacao', titulo: 'Negociação', cor: 'border-t-amber-500' },
  { id: 'ganho', titulo: 'Ganho (Pedido)', cor: 'border-t-emerald-500' },
  { id: 'perdido', titulo: 'Perdido', cor: 'border-t-red-500' },
]

export default function KanbanBoard({ initialData }: KanbanBoardProps) {
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>(initialData)
  const [isPending, startTransition] = useTransition()
  
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id)
    e.dataTransfer.setData('text/plain', id)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, colunaId: string) => {
    e.preventDefault()
    const oppId = e.dataTransfer.getData('text/plain')
    if (!oppId || !colunaId) return

    // Atualiza UI Otimista
    setOportunidades(prev => prev.map(op => 
      op.id === oppId ? { ...op, status: colunaId } : op
    ))
    setDraggedItemId(null)

    // Atualiza Backend
    startTransition(async () => {
      await moverOportunidade(oppId, colunaId)
    })
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-4 h-[calc(100vh-200px)] items-start">
      {COLUNAS.map(coluna => {
        const opsNaColuna = oportunidades.filter(op => op.status === coluna.id)
        const valorTotal = opsNaColuna.reduce((acc, curr) => acc + (curr.valorEstimado || 0), 0)

        return (
          <div 
            key={coluna.id}
            className="flex-shrink-0 w-80 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl p-3 border shadow-inner flex flex-col h-full"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, coluna.id)}
          >
            <div className={`border-t-4 ${coluna.cor} rounded-t-lg -mt-3 -mx-3 mb-3`}></div>
            <div className="flex justify-between items-center mb-3 px-1">
              <h3 className="font-semibold text-sm uppercase tracking-wider text-slate-700 dark:text-slate-300">
                {coluna.titulo} <span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-0.5 px-2 rounded-full text-xs ml-1">{opsNaColuna.length}</span>
              </h3>
            </div>
            
            <div className="text-xs text-muted-foreground mb-4 px-1 font-medium flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {valorTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {opsNaColuna.map(op => (
                <Card 
                  key={op.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, op.id)}
                  onDragEnd={() => setDraggedItemId(null)}
                  className={`cursor-grab active:cursor-grabbing border-slate-200 shadow-sm hover:shadow-md transition-all ${draggedItemId === op.id ? 'opacity-50 ring-2 ring-blue-400' : ''}`}
                >
                  <CardHeader className="p-3 pb-2 flex flex-row items-start justify-between space-y-0">
                    <CardTitle className="text-sm font-semibold leading-tight pr-2">
                      {op.titulo}
                    </CardTitle>
                    <GripVertical className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2 mt-1">
                      <Building2 className="w-3 h-3" />
                      <span className="truncate">{op.cliente?.nome || 'Cliente Desconhecido'}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-2 border-t">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        R$ {op.valorEstimado?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                      {op.probabilidade > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          op.probabilidade >= 70 ? 'bg-emerald-100 text-emerald-700' : 
                          op.probabilidade >= 40 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {op.probabilidade}%
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {opsNaColuna.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Arraste para cá
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
