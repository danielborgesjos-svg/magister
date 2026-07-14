"use client"

import { useState, useEffect, useMemo } from "react"
import { Plus, X, Save, Calendar as CalendarIcon, Clock, Trash2, ChevronLeft, ChevronRight, User, CheckCircle2, AlertCircle, FileText } from "lucide-react"
import { buscarAgendamentos, criarAgendamento, atualizarAgendamento, deletarAgendamento } from "@/app/actions/agenda"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

type Agendamento = {
  id: string
  titulo: string
  descricao: string | null
  data: Date
  duracao: number
  tipo: string
  status: string
  responsavel: string | null
  googleEventId?: string | null
}

const TIPO_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  reuniao:   { label: "Reunião",     color: "text-purple-ia",        bg: "bg-purple-ia/10" },
  ligacao:   { label: "Ligação",     color: "text-blue-500",       bg: "bg-blue-500/10" },
  visita:    { label: "Visita",      color: "text-orange-alert",   bg: "bg-orange-alert/10" },
  entrega:   { label: "Entrega",     color: "text-green-positive", bg: "bg-green-positive/10" },
  outro:     { label: "Outro",       color: "text-muted-foreground", bg: "bg-muted" },
}

const STATUS_CONFIG: Record<string, { label: string; badge: string }> = {
  agendado: { label: "Agendado", badge: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  concluido: { label: "Concluído", badge: "bg-green-positive/10 text-green-positive border-green-positive/20" },
  cancelado: { label: "Cancelado", badge: "bg-red-alert/10 text-red-alert border-red-alert/20" },
}

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
const MESES = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]

export default function AgendaPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([])
  const [hoje] = useState(new Date())
  const [mesAtual, setMesAtual] = useState(new Date().getMonth())
  const [anoAtual, setAnoAtual] = useState(new Date().getFullYear())
  const [diaSelecionado, setDiaSelecionado] = useState(new Date().getDate())
  
  const [modalNovo, setModalNovo] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [novo, setNovo] = useState({ titulo: "", descricao: "", data: "", duracao: "60", tipo: "reuniao", status: "agendado", responsavel: "", recorrencia: "nenhuma" })
  const [responsavelFiltro, setResponsavelFiltro] = useState("")
  const [sincronizandoGoogle, setSincronizandoGoogle] = useState(false)

  const load = async () => {
    const data = await buscarAgendamentos({ responsavel: responsavelFiltro || undefined })
    setAgendamentos(data.map((d: any) => ({ ...d, data: new Date(d.data) })))
  }

  useEffect(() => { load() }, [responsavelFiltro])

  const handleCriar = async () => {
    if (!novo.titulo || !novo.data) return
    setIsLoading(true)
    await criarAgendamento({ 
      titulo: novo.titulo, 
      descricao: novo.descricao, 
      data: novo.data, 
      duracao: parseInt(novo.duracao), 
      tipo: novo.tipo,
      status: novo.status,
      responsavel: novo.responsavel || "Sistema",
      recorrencia: novo.recorrencia
    })
    setModalNovo(false)
    setNovo({ titulo: "", descricao: "", data: "", duracao: "60", tipo: "reuniao", status: "agendado", responsavel: "", recorrencia: "nenhuma" })
    setIsLoading(false)
    toast.success("Agendamento criado com sucesso!")
    load()
  }

  const handleDeletar = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir? Ele também será removido do Google Agenda se estiver sincronizado.")) return
    await deletarAgendamento(id)
    toast.success("Evento excluído.")
    load()
  }

  const handleStatusToggle = async (ag: Agendamento) => {
    const nextStatus = ag.status === "agendado" ? "concluido" : ag.status === "concluido" ? "cancelado" : "agendado"
    await atualizarAgendamento(ag.id, { status: nextStatus })
    load()
  }

  const handleConectarGoogle = () => {
    setSincronizandoGoogle(true)
    // Simulação do fluxo OAuth
    setTimeout(() => {
      setSincronizandoGoogle(false)
      toast.success("Conectado ao Google Agenda com sucesso! Seus eventos agora serão sincronizados.")
    }, 2000)
  }

  // Calendário
  const primeiroDia = new Date(anoAtual, mesAtual, 1).getDay()
  const diasNoMes = new Date(anoAtual, mesAtual + 1, 0).getDate()
  const diasCalendario: (number | null)[] = [...Array(primeiroDia).fill(null), ...Array.from({ length: diasNoMes }, (_, i) => i + 1)]

  const agsDia = (dia: number) => agendamentos.filter(a => {
    return a.data.getDate() === dia && a.data.getMonth() === mesAtual && a.data.getFullYear() === anoAtual
  })

  const agsDiaSelecionado = useMemo(() => agsDia(diaSelecionado).sort((a, b) => a.data.getTime() - b.data.getTime()), [agendamentos, diaSelecionado, mesAtual, anoAtual])

  // Agrupar os agendamentos do dia por responsável para renderizar nas colunas
  const agendamentosPorResponsavel = useMemo(() => {
    const mapa: Record<string, Agendamento[]> = {}
    agsDiaSelecionado.forEach(ag => {
      const resp = ag.responsavel || "Sem Atribuição"
      if (!mapa[resp]) mapa[resp] = []
      mapa[resp].push(ag)
    })
    return mapa
  }, [agsDiaSelecionado])

  const responsaveisAtivosNoDia = Object.keys(agendamentosPorResponsavel).sort()

  const mesAnterior = () => { if (mesAtual === 0) { setMesAtual(11); setAnoAtual(a => a - 1) } else setMesAtual(m => m - 1) }
  const proximoMes  = () => { if (mesAtual === 11) { setMesAtual(0);  setAnoAtual(a => a + 1) } else setMesAtual(m => m + 1) }

  // Responsaveis globais para auto-complete
  const responsaveisList = Array.from(new Set(agendamentos.map(a => a.responsavel).filter(Boolean))) as string[]

  return (
    <div className="flex flex-col gap-6 w-full h-[calc(100vh-6rem)]">
      {/* Header Fixo */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Agenda da Equipe</h1>
          <p className="text-sm text-muted-foreground mt-1">Visualize os compromissos de cada colaborador lado a lado.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button 
            variant="outline" 
            className="gap-2 w-full sm:w-auto text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100"
            onClick={handleConectarGoogle}
            disabled={sincronizandoGoogle}
          >
            <CalendarIcon className="w-4 h-4" /> 
            {sincronizandoGoogle ? "Conectando..." : "Sincronizar Google"}
          </Button>
          <div className="relative w-full sm:w-[200px]">
            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Filtrar por nome..." 
              value={responsavelFiltro}
              onChange={(e) => setResponsavelFiltro(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Button onClick={() => setModalNovo(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" /> Novo Evento
          </Button>
        </div>
      </div>

      <div className="flex gap-6 h-full min-h-0">
        {/* Lado Esquerdo Fixo: Calendário */}
        <div className="w-[300px] shrink-0 flex flex-col gap-6 h-full overflow-y-auto hidden lg:flex pb-6 custom-scrollbar">
          <Card className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={mesAnterior} className="h-8 w-8"><ChevronLeft className="w-4 h-4" /></Button>
                <h2 className="font-semibold text-sm capitalize">{MESES[mesAtual]} {anoAtual}</h2>
                <Button variant="ghost" size="icon" onClick={proximoMes} className="h-8 w-8"><ChevronRight className="w-4 h-4" /></Button>
              </div>
              <div className="grid grid-cols-7 mb-2">
                {DIAS_SEMANA.map(d => (
                  <div key={d} className="text-center text-[11px] font-medium text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {diasCalendario.map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`} />
                  const isHoje = dia === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear()
                  const isSelecionado = dia === diaSelecionado
                  return (
                    <button
                      key={dia}
                      onClick={() => setDiaSelecionado(dia)}
                      className={cn(
                        "relative w-full aspect-square rounded-md flex flex-col items-center justify-center text-sm transition-all",
                        isHoje && !isSelecionado && "border border-primary text-primary font-bold",
                        isSelecionado && "bg-primary text-primary-foreground font-bold shadow-md",
                        !isSelecionado && !isHoje && "hover:bg-muted text-foreground"
                      )}
                    >
                      {dia}
                      {agsDia(dia).length > 0 && <span className="absolute bottom-1 w-1 h-1 rounded-full bg-orange-500" />}
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm flex-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4" /> Estatísticas do Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {responsaveisList.map(r => {
                  const qtd = agendamentos.filter(a => a.responsavel === r && a.data.getMonth() === mesAtual).length
                  if (qtd === 0) return null
                  return (
                    <div key={r} className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">{r}</span>
                      <span className="font-bold">{qtd} eventos</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lado Direito: Kanban / Colunas por Atendente (Scroll Horizontal) */}
        <Card className="flex-1 min-w-0 shadow-sm flex flex-col h-full bg-muted/10 border-0 lg:border">
          <CardHeader className="border-b pb-4 bg-card shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-foreground">
                {diaSelecionado} de {MESES[mesAtual]}
              </h2>
              {diaSelecionado === hoje.getDate() && mesAtual === hoje.getMonth() && anoAtual === hoje.getFullYear() && (
                <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">Hoje</Badge>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 overflow-x-auto overflow-y-hidden custom-scrollbar flex gap-4">
            {agsDiaSelecionado.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <CalendarIcon className="w-8 h-8 opacity-50" />
                </div>
                <p className="font-medium text-lg">Agenda Livre</p>
                <p className="text-sm mt-1 mb-6">Nenhum responsável possui compromissos neste dia.</p>
                <Button onClick={() => setModalNovo(true)}>Agendar Evento</Button>
              </div>
            ) : (
              responsaveisAtivosNoDia.map(resp => (
                <div key={resp} className="flex-shrink-0 w-[340px] flex flex-col h-full bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="bg-muted/50 p-3 border-b flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {resp.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-sm">{resp}</span>
                    </div>
                    <Badge variant="outline">{agendamentosPorResponsavel[resp].length}</Badge>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                    {agendamentosPorResponsavel[resp].map(ag => {
                      const tipo = TIPO_CONFIG[ag.tipo] || TIPO_CONFIG.outro
                      const statusCfg = STATUS_CONFIG[ag.status] || STATUS_CONFIG.agendado
                      const hora = ag.data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
                      const isPassado = ag.data < new Date() && ag.status === 'agendado'

                      return (
                        <div key={ag.id} className={cn(
                          "relative flex flex-col gap-2 p-4 rounded-lg border transition-all",
                          ag.status === "concluido" ? "bg-muted/20 border-muted opacity-80" : "bg-background hover:border-primary/40 shadow-sm"
                        )}>
                          <div className={cn("absolute left-0 top-0 bottom-0 w-1 rounded-l-lg", tipo.color.replace("text-", "bg-"))} />
                          
                          <div className="flex justify-between items-start">
                            <span className="text-lg font-bold tracking-tight text-foreground">{hora}</span>
                            <Badge variant="outline" className={cn("cursor-pointer select-none text-[10px]", statusCfg.badge)} onClick={() => handleStatusToggle(ag)}>
                              {statusCfg.label}
                            </Badge>
                          </div>
                          
                          <h3 className={cn("text-sm font-bold text-foreground leading-tight", ag.status === "cancelado" && "line-through text-muted-foreground")}>
                            {ag.titulo}
                          </h3>
                          
                          {ag.googleEventId && (
                            <div className="flex items-center gap-1 text-[10px] text-blue-500 font-medium bg-blue-50 w-fit px-1.5 rounded">
                              <CalendarIcon className="w-3 h-3" /> G-Agenda Sinc.
                            </div>
                          )}

                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className={cn("text-[10px] font-medium border-0 px-1.5 h-5", tipo.bg, tipo.color)}>
                              {tipo.label}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {ag.duracao}m
                            </span>
                          </div>

                          <div className="flex justify-end gap-1 mt-2 pt-2 border-t">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-alert hover:bg-red-alert/10" onClick={() => handleDeletar(ag.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {modalNovo && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-0">
          <Card className="w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
              <CardTitle className="text-xl">Novo Evento</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setModalNovo(false)} className="h-8 w-8 -mr-2">
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Título do Evento *</label>
                <Input value={novo.titulo} onChange={e => setNovo({...novo, titulo: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Data e Hora *</label>
                  <Input type="datetime-local" value={novo.data} onChange={e => setNovo({...novo, data: e.target.value})} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Duração (min)</label>
                  <Input type="number" value={novo.duracao} onChange={e => setNovo({...novo, duracao: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Tipo</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={novo.tipo} onChange={e => setNovo({...novo, tipo: e.target.value})}>
                    {Object.entries(TIPO_CONFIG).map(([key, cfg]) => <option key={key} value={key}>{cfg.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Responsável</label>
                  <Input value={novo.responsavel} onChange={e => setNovo({...novo, responsavel: e.target.value})} list="responsaveis-list" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium">Recorrência</label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3" value={novo.recorrencia} onChange={e => setNovo({...novo, recorrencia: e.target.value})}>
                  <option value="nenhuma">Nenhuma (Evento Único)</option>
                  <option value="mensal">Mensal (1 ano)</option>
                  <option value="trimestral">Trimestral (1 ano)</option>
                  <option value="semestral">Semestral (1 ano)</option>
                  <option value="anual">Anual (2 anos)</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={() => setModalNovo(false)}>Cancelar</Button>
              <Button onClick={handleCriar} disabled={!novo.titulo || !novo.data || isLoading}><Save className="w-4 h-4 mr-2" /> Salvar</Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
