"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronLeft, ChevronRight, Loader2, User, Clock, AlertTriangle, Plus } from "lucide-react"
import Link from "next/link"
import { buscarOSCompleto } from "@/app/actions/os"
import { listarTecnicos } from "@/app/actions/tecnicos"
import { cn } from "@/lib/utils"

const HORARIOS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

export default function AbaAgenda() {
  const [ordens, setOrdens] = useState<any[]>([])
  const [tecnicos, setTecnicos] = useState<any[]>([])
  const [tecnicoSelecionado, setTecnicoSelecionado] = useState<string>("todos")
  const [loading, setLoading] = useState(true)
  const [dataAtual, setDataAtual] = useState(new Date())

  useEffect(() => {
    Promise.all([
      buscarOSCompleto({}),
      listarTecnicos()
    ]).then(([resOS, resTecnicos]) => {
      // Filtrar apenas OS com agendamento
      const agendadas = resOS.itens.filter((o: any) => o.dataAgendada)
      setOrdens(agendadas)
      setTecnicos(resTecnicos)
      setLoading(false)
    })
  }, [])

  const retrocederSemana = () => setDataAtual(new Date(dataAtual.setDate(dataAtual.getDate() - 7)))
  const avancarSemana = () => setDataAtual(new Date(dataAtual.setDate(dataAtual.getDate() + 7)))

  // Pega a Segunda-feira da semana atual
  const inicioSemana = new Date(dataAtual)
  const diaSemana = inicioSemana.getDay()
  const dist = diaSemana === 0 ? -6 : 1 - diaSemana
  inicioSemana.setDate(inicioSemana.getDate() + dist)

  // Array de Seg a Sex
  const diasUteis = Array.from({ length: 5 }).map((_, i) => {
    const d = new Date(inicioSemana)
    d.setDate(inicioSemana.getDate() + i)
    return d
  })

  const formataDia = (d: Date) => d.toISOString().split("T")[0]
  const agora = new Date()

  // Filtra as OS baseadas no técnico selecionado
  const ordensFiltradas = tecnicoSelecionado === "todos" 
    ? ordens 
    : ordens.filter(o => o.tecnicoId === tecnicoSelecionado)

  if (loading) {
    return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm h-[calc(100vh-280px)] min-h-[600px] flex flex-col">
      
      {/* HEADER AGENDA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 backdrop-blur-md sticky top-0 z-20 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 text-white rounded-xl flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-[15px]">Time-Blocking Operacional</h3>
            <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wider">
              {inicioSemana.toLocaleDateString("pt-BR", { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* SELETOR DE TÉCNICO */}
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <select
              value={tecnicoSelecionado}
              onChange={(e) => setTecnicoSelecionado(e.target.value)}
              className="pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer appearance-none min-w-[200px]"
            >
              <option value="todos">Todos os Técnicos</option>
              {tecnicos.map(t => (
                <option key={t.id} value={t.id}>{t.nome}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
            <button onClick={retrocederSemana} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setDataAtual(new Date())} className="px-3 py-1.5 hover:bg-slate-50 rounded-lg text-[11px] font-black text-slate-700 transition-colors uppercase tracking-wider">
              Hoje
            </button>
            <button onClick={avancarSemana} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-600">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* BODY DA AGENDA (GRID EIXO Y HORARIOS, EIXO X DIAS) */}
      <div className="flex-1 overflow-auto bg-slate-50 relative flex custom-scrollbar">
        
        {/* COLUNA DE HORÁRIOS */}
        <div className="w-16 flex-shrink-0 bg-white border-r border-slate-200 sticky left-0 z-10 flex flex-col">
          <div className="h-12 border-b border-slate-200" /> {/* Espaçador header dias */}
          {HORARIOS.map(hora => (
            <div key={hora} className="h-28 border-b border-slate-100 relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black text-slate-400 bg-white px-1">
                {hora.toString().padStart(2, '0')}:00
              </span>
            </div>
          ))}
        </div>

        {/* DIAS ÚTEIS */}
        <div className="flex-1 flex min-w-[800px]">
          {diasUteis.map((dia, idx) => {
            const isHoje = formataDia(dia) === formataDia(agora)
            
            return (
              <div key={idx} className="flex-1 flex flex-col border-r border-slate-200 last:border-r-0 min-w-[150px]">
                
                {/* Header do Dia */}
                <div className={cn(
                  "h-12 border-b flex flex-col items-center justify-center sticky top-0 z-10 backdrop-blur-md",
                  isHoje ? "bg-indigo-50/90 border-indigo-200" : "bg-white/90 border-slate-200"
                )}>
                  <span className={cn("text-[10px] font-black uppercase tracking-wider", isHoje ? "text-indigo-600" : "text-slate-400")}>
                    {dia.toLocaleDateString("pt-BR", { weekday: 'short' })}
                  </span>
                  <span className={cn("text-[15px] font-black", isHoje ? "text-indigo-700" : "text-slate-800")}>
                    {dia.getDate()}
                  </span>
                </div>

                {/* Slots de Horário */}
                <div className="relative flex-1">
                  {HORARIOS.map(hora => {
                    // Busca OS agendadas para este dia e hora
                    const osNestaHora = ordensFiltradas.filter(o => {
                      const d = new Date(o.dataAgendada)
                      return formataDia(d) === formataDia(dia) && d.getHours() === hora
                    })

                    // Se for hoje e a hora for a atual, desenha a linha vermelha
                    const isCurrentHour = isHoje && agora.getHours() === hora

                    return (
                      <div key={hora} className="h-28 border-b border-slate-100/50 bg-white relative group transition-colors hover:bg-slate-50/50">
                        
                        {/* Linha de hora atual */}
                        {isCurrentHour && (
                          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-red-500 z-10 opacity-70">
                            <div className="w-2 h-2 rounded-full bg-red-500 absolute -left-1 -top-[3px] shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                          </div>
                        )}

                        {/* Botão de Encaixe */}
                        <Link href="/os/nova" className="absolute inset-x-2 top-2 bottom-2 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-0 hover:bg-indigo-100/50 cursor-pointer">
                          <span className="text-[10px] font-black uppercase tracking-wider text-indigo-500 flex items-center gap-1">
                            <Plus className="w-3 h-3" /> Encaixe
                          </span>
                        </Link>

                        {/* RENDERIZAR OS CARDS (sobrepondo o botão de encaixe) */}
                        <div className="absolute inset-0 p-1 flex gap-1 z-20 pointer-events-none">
                          {osNestaHora.map(os => {
                            const isCritica = os.prioridade === "critica"
                            
                            return (
                              <div key={os.id} className={cn(
                                "flex-1 rounded-lg p-2 flex flex-col pointer-events-auto cursor-pointer shadow-sm border overflow-hidden hover:shadow-md transition-shadow relative",
                                isCritica ? "bg-red-50 border-red-200" : "bg-white border-slate-200"
                              )}>
                                {isCritica && <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />}
                                <div className="flex items-center justify-between mb-1 opacity-80">
                                  <span className="text-[9px] font-black uppercase text-slate-500">
                                    {new Date(os.dataAgendada).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-1 rounded">#{os.codigo}</span>
                                </div>
                                <h4 className="text-[11px] font-bold text-slate-800 leading-tight line-clamp-2">{os.titulo}</h4>
                                {os.tecnico && tecnicoSelecionado === "todos" && (
                                  <div className="mt-auto pt-1 flex items-center gap-1 text-slate-500">
                                    <User className="w-2.5 h-2.5 shrink-0" />
                                    <span className="text-[9px] font-bold truncate">{os.tecnico.nome}</span>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>

                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
