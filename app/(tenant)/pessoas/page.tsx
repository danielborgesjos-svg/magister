"use client"

import { useState } from "react"
import {
  Users, LayoutDashboard, FileText, Target, 
  UserCheck, Briefcase, DollarSign, Clock, Calendar, 
  Award, TrendingUp, AlertTriangle, ArrowUpRight, Search, 
  BrainCircuit, Users2, ShieldCheck, HeartPulse
} from "lucide-react"
import { cn } from "@/lib/utils"

const COLABORADORES = [
  { id: "MAT-1042", nome: "Ana Paula Silva", cargo: "Gerente de Produção", depto: "Operações", admissao: "2020-03-15", status: "ativo", risco: "baixo" },
  { id: "MAT-1089", nome: "Carlos Eduardo Mendes", cargo: "Inspetor de Qualidade", depto: "Qualidade", admissao: "2022-08-01", status: "ativo", risco: "alto" },
  { id: "MAT-1120", nome: "Roberto Freitas", cargo: "Operador de CNC", depto: "Usinagem", admissao: "2024-01-10", status: "ferias", risco: "medio" },
  { id: "MAT-0984", nome: "Fernanda Costa", cargo: "Analista Contábil", depto: "Controladoria", admissao: "2019-11-20", status: "ativo", risco: "baixo" },
]

const AVALIACOES = [
  { nome: "Ana Paula Silva", cargo: "Gerente de Produção", score: 92, status: "Alta Performance", nineBox: "Talento", meta: "98%" },
  { nome: "Carlos Eduardo Mendes", cargo: "Inspetor de Qualidade", score: 68, status: "Abaixo do Esperado", nineBox: "Enigma", meta: "75%" },
  { nome: "Roberto Freitas", cargo: "Operador de CNC", score: 85, status: "Bom Desempenho", nineBox: "Forte Desempenho", meta: "90%" },
]

const FOLHA = [
  { depto: "Operações", qtd: 45, proventos: 245000, encargos: 154000, total: 399000 },
  { depto: "Comercial", qtd: 12, proventos: 85000, encargos: 48000, total: 133000 },
  { depto: "Administrativo", qtd: 8, proventos: 62000, encargos: 39000, total: 101000 },
]

function DashboardRH() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Headcount (Ativos)</p>
          <p className="text-3xl font-black text-blue-600">84</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +3 contratações no mês
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Turnover Mensal</p>
          <p className="text-3xl font-black text-emerald-600">1.2%</p>
          <p className="text-xs text-muted-foreground mt-2">Abaixo da média do setor (2.5%)</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Absenteísmo</p>
          <p className="text-3xl font-black text-amber-600">4.5%</p>
          <p className="text-xs text-amber-600 mt-2 font-semibold">Leve aumento em Operações</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Custo Total da Folha</p>
          <p className="text-3xl font-black">R$ 633k</p>
          <p className="text-xs text-muted-foreground mt-2">Com encargos e benefícios</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2"><Users2 className="w-4 h-4 text-primary" /> Colaboradores Recentes</h3>
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input type="text" placeholder="Buscar..." className="w-full pl-8 pr-3 py-1.5 bg-muted/50 border-none rounded-lg text-xs" />
            </div>
          </div>
          <div className="space-y-3">
            {COLABORADORES.map(c => (
              <div key={c.id} className="flex items-center justify-between p-3 border border-border/50 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs uppercase">
                    {c.nome.substring(0,2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{c.nome}</p>
                    <p className="text-xs text-muted-foreground">{c.cargo} · {c.depto}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full uppercase", 
                    c.status === 'ativo' ? "bg-emerald-100 text-emerald-700" :
                    c.status === 'ferias' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                  )}>{c.status}</span>
                  <p className="text-[10px] text-muted-foreground">Adm: {new Date(c.admissao).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border rounded-2xl p-5 flex-1">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><HeartPulse className="w-4 h-4 text-primary" /> Análise de Clima e Risco de Fuga</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-emerald-600">Risco Baixo (Engajados)</span><span className="font-bold">75%</span></div>
                <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-emerald-500 rounded-full" style={{width: '75%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-amber-600">Risco Médio (Atenção)</span><span className="font-bold">18%</span></div>
                <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-amber-500 rounded-full" style={{width: '18%'}}></div></div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-red-600">Risco Alto (Possível Turnover)</span><span className="font-bold">7%</span></div>
                <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-red-500 rounded-full" style={{width: '7%'}}></div></div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-pink-800 mb-2 flex items-center gap-1.5"><span className="text-pink-600">✦</span> JARMIS People Analytics</p>
            <p className="text-sm text-pink-900 leading-relaxed">
              O colaborador "Carlos Eduardo Mendes" (Qualidade) apresenta risco de saída ALTO. 
              Padrão detectado: Aumento de 30% em horas extras nos últimos 2 meses + queda de 24% na avaliação de desempenho (Cansaço extremo). 
              Sugiro agendar One-on-One e realocação de turnos.
            </p>
            <button className="mt-3 px-4 py-2 bg-pink-600 text-white text-xs font-bold rounded-lg hover:bg-pink-700">Agendar One-on-One Automático</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesempenhoTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg">Matriz Nine Box & Avaliação 360°</h3>
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">Nova Avaliação</button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card border rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
           <div className="text-center text-muted-foreground">
             <Target className="w-12 h-12 opacity-20 mb-4 mx-auto" />
             <p className="font-medium">Matriz Nine Box Interativa</p>
             <p className="text-sm">Grid gráfico de Potencial vs. Desempenho em desenvolvimento.</p>
           </div>
        </div>
        
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4">Top Avaliações Recentes</h3>
          <div className="space-y-4">
            {AVALIACOES.map((av, i) => (
              <div key={i} className="border-b pb-4 last:border-0 last:pb-0">
                <p className="font-semibold text-sm">{av.nome}</p>
                <p className="text-xs text-muted-foreground mb-2">{av.cargo}</p>
                <div className="flex justify-between items-center text-xs">
                  <span className={cn("px-2 py-1 font-bold rounded-lg", 
                    av.score >= 90 ? "bg-emerald-100 text-emerald-700" :
                    av.score >= 80 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  )}>Score: {av.score}</span>
                  <span className="font-semibold">OKRs: {av.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const FOLHA_DETALHADA = [
  { 
    setor: "Operações", 
    gerencia: { qtd: 2, custo: 35000, desempenho: "92%" },
    lideranca: { qtd: 5, custo: 42000, desempenho: "88%" },
    operacao: { qtd: 38, custo: 168000, desempenho: "85%" },
    encargos: 154000, 
    total: 399000 
  },
  { 
    setor: "Comercial", 
    gerencia: { qtd: 1, custo: 18000, desempenho: "95%" },
    lideranca: { qtd: 3, custo: 25000, desempenho: "82%" },
    operacao: { qtd: 8, custo: 42000, desempenho: "90%" },
    encargos: 48000, 
    total: 133000 
  },
  { 
    setor: "Administrativo", 
    gerencia: { qtd: 1, custo: 22000, desempenho: "89%" },
    lideranca: { qtd: 2, custo: 18000, desempenho: "85%" },
    operacao: { qtd: 5, custo: 22000, desempenho: "92%" },
    encargos: 39000, 
    total: 101000 
  },
]

function FolhaTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Proventos</p>
          <p className="text-2xl font-black text-emerald-600">R$ 392.000</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Encargos (INSS/FGTS)</p>
          <p className="text-2xl font-black text-red-600">R$ 241.000</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Horas Extras Mês</p>
          <p className="text-2xl font-black text-amber-600">142h</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">ROI do Capital Humano</p>
          <p className="text-2xl font-black text-blue-600">R$ 3.82</p>
          <p className="text-xs text-muted-foreground mt-1">Retorno por R$1 investido em folha</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="p-4 border-b bg-muted/10">
          <h3 className="font-bold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-primary" /> Análise de Custos e Desempenho por Nível Hierárquico</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/40 text-[10px] uppercase text-muted-foreground border-b">
              <tr>
                <th className="px-4 py-3" rowSpan={2}>Setor</th>
                <th className="px-4 py-2 text-center border-l border-b border-border/50" colSpan={3}>Gerência (Alta Gestão)</th>
                <th className="px-4 py-2 text-center border-l border-b border-border/50" colSpan={3}>Liderança (Coord./Superv.)</th>
                <th className="px-4 py-2 text-center border-l border-b border-border/50" colSpan={3}>Operação (Analistas/Téc.)</th>
                <th className="px-4 py-3 text-right border-l" rowSpan={2}>Encargos</th>
                <th className="px-4 py-3 text-right" rowSpan={2}>Custo Total</th>
              </tr>
              <tr>
                {/* Gerência */}
                <th className="px-2 py-1 text-center border-l border-border/50">Qtd</th>
                <th className="px-2 py-1 text-right">Custo</th>
                <th className="px-2 py-1 text-center">Desemp.</th>
                {/* Liderança */}
                <th className="px-2 py-1 text-center border-l border-border/50">Qtd</th>
                <th className="px-2 py-1 text-right">Custo</th>
                <th className="px-2 py-1 text-center">Desemp.</th>
                {/* Operação */}
                <th className="px-2 py-1 text-center border-l border-border/50">Qtd</th>
                <th className="px-2 py-1 text-right">Custo</th>
                <th className="px-2 py-1 text-center">Desemp.</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {FOLHA_DETALHADA.map((f, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-semibold">{f.setor}</td>
                  
                  {/* Gerência */}
                  <td className="px-2 py-3 text-center border-l border-border/50">{f.gerencia.qtd}</td>
                  <td className="px-2 py-3 text-right text-muted-foreground">R$ {f.gerencia.custo.toLocaleString('pt-BR')}</td>
                  <td className="px-2 py-3 text-center font-bold text-emerald-600">{f.gerencia.desempenho}</td>
                  
                  {/* Liderança */}
                  <td className="px-2 py-3 text-center border-l border-border/50">{f.lideranca.qtd}</td>
                  <td className="px-2 py-3 text-right text-muted-foreground">R$ {f.lideranca.custo.toLocaleString('pt-BR')}</td>
                  <td className="px-2 py-3 text-center font-bold text-emerald-600">{f.lideranca.desempenho}</td>
                  
                  {/* Operação */}
                  <td className="px-2 py-3 text-center border-l border-border/50">{f.operacao.qtd}</td>
                  <td className="px-2 py-3 text-right text-muted-foreground">R$ {f.operacao.custo.toLocaleString('pt-BR')}</td>
                  <td className="px-2 py-3 text-center font-bold text-emerald-600">{f.operacao.desempenho}</td>

                  <td className="px-4 py-3 text-right text-red-500 font-medium border-l border-border/50">R$ {f.encargos.toLocaleString('pt-BR')}</td>
                  <td className="px-4 py-3 text-right font-black text-blue-900">R$ {f.total.toLocaleString('pt-BR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5"><span className="text-blue-600">✦</span> JARMIS People & Finance IA</p>
        <p className="text-sm text-blue-900 leading-relaxed">
          O setor Comercial apresenta o maior desempenho na Gerência (95%), mas uma queda acentuada na Liderança (82%). 
          Esta dissonância está custando R$ 25.000/mês com retorno sub-otimizado. Sugere-se treinamento focado para a camada de coordenação comercial.
        </p>
      </div>
    </div>
  )
}


export default function PessoasPage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Pessoas & Performance (RH)</h1>
            <p className="text-sm text-muted-foreground">Gestão de Talentos, Folha de Pagamento e Desempenho</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> Core RH</button>
        <button onClick={() => setTab("folha")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "folha" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><DollarSign className="w-4 h-4"/> Folha de Pagamento</button>
        <button onClick={() => setTab("desempenho")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "desempenho" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Target className="w-4 h-4"/> Desempenho & Metas</button>
        <button onClick={() => setTab("ponto")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "ponto" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Clock className="w-4 h-4"/> Controle de Ponto</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardRH />}
        {tab === "desempenho" && <DesempenhoTab />}
        {tab === "folha" && <FolhaTab />}
        {tab === "ponto" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Clock className="w-12 h-12 opacity-20 mb-4" />
            <p>Integração com relógios de ponto digitais em desenvolvimento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
