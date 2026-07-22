"use client"

import { useState } from "react"
import { 
  Bot, AlertTriangle, TrendingUp, Zap, ArrowRight, BrainCircuit, 
  Activity, ShieldAlert, Globe, MapPin, Search, ThumbsUp, ThumbsDown,
  Briefcase, PackageSearch, ServerCrash, Send
} from "lucide-react"
import { PredictiveChat } from "@/components/ai/PredictiveChat"
import { alertasPorSetor, recomendacoesIA, avisosBons, avisosRuins, pesquisaMercado, swarmAgents } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const getAgentIcon = (iconName: string) => {
  switch (iconName) {
    case 'Briefcase': return <Briefcase className="w-5 h-5" />
    case 'PackageSearch': return <PackageSearch className="w-5 h-5" />
    case 'Globe': return <Globe className="w-5 h-5" />
    default: return <Bot className="w-5 h-5" />
  }
}

export default function InteligenciaPage() {
  const [activeTab, setActiveTab] = useState<"operacao" | "mercado">("operacao")
  
  // Market Research States
  const [temaPesquisa, setTemaPesquisa] = useState("")
  const [temaConfirmado, setTemaConfirmado] = useState(false)
  const [raioAtivo, setRaioAtivo] = useState<keyof typeof pesquisaMercado>("raio5km")
  
  // Chat Trigger
  const [chatTrigger, setChatTrigger] = useState<string | undefined>(undefined)

  const raioLabels = {
    raio5km: "Local (5km)",
    raio15km: "Territorial (15km)",
    cidade: "Sua Cidade",
    estado: "Nível Estadual",
    nacional: "Nível Nacional"
  }

  const handlePesquisar = (e: React.FormEvent) => {
    e.preventDefault()
    if (temaPesquisa.trim().length > 2) {
      setTemaConfirmado(true)
      // Dispara o chat automaticamente para trazer insights reais da API
      const prompt = `JARMIS, pesquise no mercado sobre o tema "${temaPesquisa}" considerando o endereço e a região da DISAFE. Traga 3 insights rápidos e profissionais em texto.`
      setChatTrigger(prompt)
      toast.success("O Agente de Mercado iniciou a varredura no Motor JARMIS!")
    }
  }

  const handleSolicitarDossie = () => {
    const prompt = `JARMIS, com base no tema de pesquisa "${temaPesquisa}" e no raio ${raioLabels[raioAtivo]}, me forneça um Dossiê Competitivo detalhando as oportunidades e ameaças para a DISAFE.`
    setChatTrigger(prompt)
    toast.info("Solicitação enviada para o Motor JARMIS!")
  }

  const handleOrquestrarRecomendacao = (titulo: string) => {
    const prompt = `JARMIS, inicie o fluxo de simulação e orquestração da seguinte recomendação estratégica: ${titulo}`
    setChatTrigger(prompt)
    toast.info("Comando enviado ao Orquestrador.")
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] w-full max-w-[1600px] mx-auto">
      
      {/* HEADER E SALA DE COMANDO SWARM */}
      <div className="flex flex-col gap-4 mb-6 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <BrainCircuit className="w-7 h-7 text-indigo-600" />
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Sala de Comando IA</h1>
            </div>
            <p className="text-[14px] font-medium text-slate-500">Orquestração pelo Motor JARMIS em tempo real para o mercado da DISAFE.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-slate-900 text-white px-4 py-2 rounded-xl border border-slate-700 shadow-lg shadow-indigo-900/20">
            <div className="flex gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-75" />
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse delay-150" />
            </div>
            <span className="text-[12px] font-bold uppercase tracking-widest text-emerald-400">JARMIS Orquestrador Online</span>
          </div>
        </div>

        {/* SWARM AGENTS PANEL */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {swarmAgents.map(agent => (
            <div key={agent.id} className={cn(
              "flex items-center gap-4 p-4 rounded-2xl border transition-all",
              `bg-${agent.cor}-50/50 border-${agent.cor}-100 hover:shadow-md`
            )}>
              <div className="relative">
                <div className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center shadow-inner",
                  `bg-${agent.cor}-200 text-${agent.cor}-700`
                )}>
                  {getAgentIcon(agent.icone)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-[14px] font-black text-slate-900 truncate">{agent.nome}</h3>
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                    `bg-${agent.cor}-100 text-${agent.cor}-800`
                  )}>{agent.ia}</span>
                </div>
                <p className={cn("text-[11px] font-bold uppercase tracking-wider truncate", `text-${agent.cor}-600`)}>
                  {agent.status}...
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SPLIT LAYOUT */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        
        {/* PAINEL ESQUERDO: CONTEXTO TABULADO */}
        <div className="w-full lg:w-[500px] xl:w-[600px] shrink-0 flex flex-col min-h-0">
          
          {/* TABS DE NAVEGAÇÃO */}
          <div className="flex p-1 bg-slate-100/80 rounded-xl mb-4 shrink-0 shadow-inner">
            <button 
              onClick={() => setActiveTab("operacao")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-bold transition-all",
                activeTab === "operacao" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <ShieldAlert className="w-4 h-4" /> Operação Interna
            </button>
            <button 
              onClick={() => setActiveTab("mercado")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-[13px] font-bold transition-all",
                activeTab === "mercado" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Globe className="w-4 h-4" /> Pesquisa de Mercado
            </button>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6 flex flex-col gap-6">
            {activeTab === "operacao" ? (
              <>
                {/* AVISOS BONS E RUINS */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <ThumbsUp className="w-4 h-4" />
                      </div>
                      <h4 className="text-[13px] font-black text-emerald-950 uppercase tracking-tight">O que está bom</h4>
                    </div>
                    {avisosBons.map(aviso => (
                      <div key={aviso.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-emerald-50 hover:border-emerald-200 transition-colors">
                        <p className="text-[13px] font-bold text-slate-800">{aviso.titulo}</p>
                        <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">{aviso.desc}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-gradient-to-br from-red-50 to-white border border-red-100 rounded-2xl p-5 flex flex-col gap-4 shadow-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                        <ServerCrash className="w-4 h-4" />
                      </div>
                      <h4 className="text-[13px] font-black text-red-950 uppercase tracking-tight">Onde focar</h4>
                    </div>
                    {avisosRuins.map(aviso => (
                      <div key={aviso.id} className="bg-white p-3.5 rounded-xl shadow-sm border border-red-50 hover:border-red-200 transition-colors">
                        <p className="text-[13px] font-bold text-slate-800">{aviso.titulo}</p>
                        <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">{aviso.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RISCOS E ALERTAS SETORIAIS */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-black text-slate-900 tracking-tight">Alertas Sistêmicos</h3>
                        <p className="text-[12px] font-medium text-slate-500">Mapeamento de riscos identificados nas últimas 24h.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-6 bg-white">
                    {alertasPorSetor.map((setor, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-2">
                          <div className="h-px flex-1 bg-slate-100" />
                          <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{setor.setor}</h4>
                          <div className="h-px flex-1 bg-slate-100" />
                        </div>
                        <div className="space-y-3">
                          {setor.riscos.map(risco => (
                            <div key={risco.id} className="flex items-start gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors group">
                              <div className={cn(
                                "w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 transition-transform group-hover:scale-125",
                                risco.nivel === 'Crítico' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" :
                                risco.nivel === 'Alto' ? "bg-orange-500" :
                                risco.nivel === 'Médio' ? "bg-amber-400" :
                                risco.nivel === 'Oportunidade' ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-blue-400"
                              )} />
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-bold text-slate-800 leading-snug">{risco.titulo}</p>
                                <p className="text-[12px] font-medium text-slate-500 mt-1">{risco.impacto}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RECOMENDAÇÕES DA IA */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-[14px] font-black text-slate-900 tracking-tight">Recomendações Estratégicas</h3>
                        <p className="text-[12px] font-medium text-slate-500">Ações orquestradas pelo Jarmis Core.</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col gap-4">
                    {recomendacoesIA.map(rec => (
                      <div key={rec.id} className={cn("p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:shadow-md", `bg-${rec.color}-50/30 border-${rec.color}-100`)}>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <h4 className="text-[14px] font-bold text-slate-900 leading-snug">{rec.titulo}</h4>
                          <span className={cn("px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-widest shrink-0", `bg-${rec.color}-100 text-${rec.color}-700`)}>
                            {rec.confianca}
                          </span>
                        </div>
                        <p className="text-[13px] font-medium text-slate-600 mb-4 leading-relaxed">{rec.descricao}</p>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200/50">
                          <span className={cn("text-[12px] font-black", `text-${rec.color}-600`)}>{rec.valor}</span>
                          <button 
                            onClick={() => handleOrquestrarRecomendacao(rec.titulo)}
                            className="text-[12px] font-black text-slate-900 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                          >
                            Orquestrar Ação <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* PESQUISA DE MERCADO VISUAL (DISAFE CONTEXT) */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                  
                  {/* Etapa 1: Formulário de Busca */}
                  {!temaConfirmado ? (
                    <div className="flex-1 p-8 flex flex-col justify-center items-center text-center">
                      <div className="w-20 h-20 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-6 shadow-inner">
                        <Search className="w-10 h-10" />
                      </div>
                      <h2 className="text-2xl font-black text-slate-900 mb-2">Radar de Mercado</h2>
                      <p className="text-slate-500 font-medium max-w-sm mb-8">
                        O que você deseja que o Agente de Mercado pesquise hoje? Produtos, estoque, contratações da concorrência?
                      </p>

                      <form onSubmit={handlePesquisar} className="w-full max-w-md relative">
                        <input 
                          type="text" 
                          value={temaPesquisa}
                          onChange={e => setTemaPesquisa(e.target.value)}
                          placeholder="Ex: Barras Antipânico, Mão de Obra, Preços..."
                          className="w-full py-4 pl-5 pr-14 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none text-[15px] font-medium text-slate-800 transition-all shadow-sm"
                        />
                        <button 
                          type="submit"
                          disabled={temaPesquisa.trim().length < 3}
                          className="absolute right-2 top-2 bottom-2 w-10 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white rounded-xl flex items-center justify-center transition-colors"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </form>
                    </div>
                  ) : (
                    /* Etapa 2: Resultados e Raios */
                    <div className="p-4 flex flex-col gap-3">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200">
                            <Globe className="w-4 h-4" />
                          </div>
                          <div>
                            <h3 className="text-[15px] font-black text-slate-900 tracking-tight">Radar Competitivo DISAFE</h3>
                            <p className="text-[11px] font-medium text-slate-500">Tema: <strong className="text-purple-600">"{temaPesquisa}"</strong></p>
                          </div>
                        </div>
                        <button 
                          onClick={() => { setTemaConfirmado(false); setTemaPesquisa(""); }}
                          className="text-[11px] font-bold text-slate-400 hover:text-slate-600 underline"
                        >
                          Nova Busca
                        </button>
                      </div>

                      {/* Seleção de Raio (Pills Visuais) */}
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(raioLabels) as Array<keyof typeof pesquisaMercado>).map((k) => (
                          <button
                            key={k}
                            onClick={() => setRaioAtivo(k)}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[12px] font-bold border-2 transition-all flex items-center gap-1.5",
                              raioAtivo === k 
                                ? "bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20" 
                                : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300"
                            )}
                          >
                            <MapPin className={cn("w-3.5 h-3.5", raioAtivo === k ? "text-purple-200" : "text-slate-400")} /> 
                            {raioLabels[k]}
                          </button>
                        ))}
                      </div>

                      {/* Resultados do Raio - Card Visual Rico */}
                      <div className="bg-slate-900 rounded-2xl p-5 mt-1 relative overflow-hidden group shadow-xl">
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                          <Globe className="w-40 h-40" />
                        </div>

                        <div className="relative z-10 flex items-center gap-3 mb-3">
                          <div className="flex-1">
                            <h4 className="text-[18px] font-black text-white leading-tight">{raioLabels[raioAtivo]}</h4>
                            <p className="text-[11px] font-medium text-slate-400">Análise sintética.</p>
                          </div>
                          
                          {/* Score Circular */}
                          <div className="w-14 h-14 rounded-full border-4 border-slate-700 flex flex-col items-center justify-center shrink-0 relative">
                            <span className="text-[16px] font-black text-white leading-none">{pesquisaMercado[raioAtivo].score}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase">Score</span>
                            <svg className="absolute inset-0 w-full h-full -rotate-90">
                              <circle cx="24" cy="24" r="24" className="fill-none stroke-purple-500" strokeWidth="4" strokeDasharray="150" strokeDashoffset={150 - (150 * pesquisaMercado[raioAtivo].score) / 100} strokeLinecap="round" />
                            </svg>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <div className="mb-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700">
                          <div className={cn(
                            "w-2 h-2 rounded-full animate-pulse",
                            pesquisaMercado[raioAtivo].nivel.includes("Conflito") ? "bg-red-400" :
                            pesquisaMercado[raioAtivo].nivel.includes("Expansão") ? "bg-emerald-400" : "bg-blue-400"
                          )} />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-200">
                            {pesquisaMercado[raioAtivo].nivel}
                          </span>
                        </div>

                        {/* Insights List */}
                        <div className="space-y-2.5 relative z-10">
                          {pesquisaMercado[raioAtivo].insights.map((insight, idx) => (
                            <div key={idx} className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors">
                              <div className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 shadow-inner",
                                insight.impacto === "positivo" ? "bg-emerald-500/20 text-emerald-400" :
                                insight.impacto === "negativo" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"
                              )}>
                                {insight.impacto === "positivo" ? <TrendingUp className="w-4 h-4" /> : 
                                insight.impacto === "negativo" ? <AlertTriangle className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-[13px] font-medium text-slate-200 leading-snug">{insight.texto}</p>
                                {/* Visual Weight Bar */}
                                <div className="flex items-center gap-2 mt-2">
                                  <div className="flex-1 h-1 bg-slate-700 rounded-full overflow-hidden">
                                    <div className={cn(
                                      "h-full rounded-full transition-all duration-1000",
                                      insight.impacto === "positivo" ? "bg-emerald-400" :
                                      insight.impacto === "negativo" ? "bg-red-400" : "bg-blue-400"
                                    )} style={{ width: `${insight.peso * 10}%` }} />
                                  </div>
                                  <span className="text-[9px] font-bold text-slate-500 uppercase">Impacto: {insight.peso}/10</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <button 
                          onClick={handleSolicitarDossie}
                          className="mt-4 w-full py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[12px] font-black transition-all shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 group"
                        >
                          Solicitar Dossiê ao Motor JARMIS <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* PAINEL DIREITO: CHAT DA IA (JARMIS ORQUESTRADOR) */}
        <div className="flex-1 min-w-0 flex flex-col min-h-[600px]">
          <PredictiveChat externalTrigger={chatTrigger} />
        </div>

      </div>
    </div>
  )
}
