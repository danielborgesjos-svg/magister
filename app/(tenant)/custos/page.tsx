"use client"

import { useState } from "react"
import {
  Calculator, LayoutDashboard, PieChart, TrendingDown, 
  Target, BarChart3, Search, DollarSign, ArrowUpRight, 
  ArrowDownRight, CheckCircle2, AlertTriangle, Coins, Factory
} from "lucide-react"
import { cn } from "@/lib/utils"

const PRODUTOS_CUSTO = [
  { id: "PRD-001", nome: "Válvula Hidráulica V500", precoVenda: 1250, cpv: 820, margemValor: 430, margemPerc: 34.4, status: "bom" },
  { id: "PRD-005", nome: "Motor Elétrico 5CV", precoVenda: 3500, cpv: 2800, margemValor: 700, margemPerc: 20.0, status: "alerta" },
  { id: "PRD-012", nome: "Bomba D'água Centrifuga", precoVenda: 890, cpv: 780, margemValor: 110, margemPerc: 12.3, status: "critico" },
  { id: "PRD-024", nome: "Cilindro Pneumático C10", precoVenda: 450, cpv: 210, margemValor: 240, margemPerc: 53.3, status: "excelente" },
]

const CENTROS_CUSTO = [
  { cc: "CC-101", nome: "Usinagem", orcado: 150000, realizado: 154200, variacao: -2.8, status: "estourou" },
  { cc: "CC-102", nome: "Montagem", orcado: 120000, realizado: 115000, variacao: 4.1, status: "ok" },
  { cc: "CC-201", nome: "Administrativo", orcado: 85000, realizado: 82500, variacao: 2.9, status: "ok" },
  { cc: "CC-301", nome: "Comercial / Vendas", orcado: 95000, realizado: 112000, variacao: -17.8, status: "estourou" },
]

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Margem de Contribuição Média</p>
          <p className="text-3xl font-black text-blue-600">32.4%</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +1.2% no mês
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ponto de Equilíbrio (PE)</p>
          <p className="text-3xl font-black">R$ 1.25M</p>
          <p className="text-xs text-muted-foreground mt-2">Atingido dia 18/mês</p>
        </div>
        <div className="bg-card border-red-200 bg-red-50/30 rounded-2xl p-5">
          <p className="text-sm font-medium text-red-600 mb-2">CPV (Custo Produto Vendido)</p>
          <p className="text-3xl font-black text-red-700">R$ 5.94M</p>
          <p className="text-xs text-red-600 mt-2 font-semibold flex items-center gap-1"><TrendingDown className="w-3 h-3"/> +5% vs orçado</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Itens c/ Margem Negativa</p>
          <p className="text-3xl font-black text-amber-600">0</p>
          <p className="text-xs text-emerald-600 mt-2 font-semibold"><CheckCircle2 className="w-3 h-3 inline"/> Nenhum produto dando prejuízo</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Target className="w-4 h-4 text-primary" /> Margem por Produto (Top/Bottom)</h3>
          <div className="space-y-4">
            {PRODUTOS_CUSTO.map(p => (
              <div key={p.id} className="flex flex-col gap-1">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{p.nome}</span>
                  <span className={cn("font-bold", 
                    p.status === 'excelente' ? "text-blue-600" :
                    p.status === 'bom' ? "text-emerald-600" :
                    p.status === 'alerta' ? "text-amber-600" : "text-red-600"
                  )}>{p.margemPerc}% (R$ {p.margemValor})</span>
                </div>
                <div className="h-2 bg-muted rounded-full">
                  <div className={cn("h-2 rounded-full", 
                    p.status === 'excelente' ? "bg-blue-500" :
                    p.status === 'bom' ? "bg-emerald-500" :
                    p.status === 'alerta' ? "bg-amber-500" : "bg-red-500"
                  )} style={{width: `${p.margemPerc}%`}}></div>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Preço: R$ {p.precoVenda}</span>
                  <span>Custo: R$ {p.cpv}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border rounded-2xl p-5 flex-1">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Factory className="w-4 h-4 text-primary" /> Orçado vs Realizado (Centros de Custo)</h3>
            <div className="space-y-3">
              {CENTROS_CUSTO.map((cc, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-sm">{cc.nome}</p>
                    <p className="text-xs text-muted-foreground">{cc.cc}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <p className="text-sm font-bold">R$ {cc.realizado.toLocaleString('pt-BR')}</p>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mt-1", 
                      cc.status === 'ok' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    )}>
                      {cc.variacao > 0 ? `Economia: +${cc.variacao}%` : `Estouro: ${cc.variacao}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5"><span className="text-blue-600">✦</span> JARMIS Cost IA</p>
            <p className="text-sm text-blue-900 leading-relaxed">
              O produto "Bomba D'água Centrifuga" reduziu sua margem de 18% para 12.3% neste trimestre. A causa raiz foi o aumento de 15% no custo do "Aço SAE 1045".
              Sugiro repassar 6% de aumento no preço final ou acionar Compras para renegociação urgente de aço.
            </p>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Simular Novo Preço</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FormacaoPrecoTab() {
  return (
    <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
      <Calculator className="w-12 h-12 opacity-20 mb-4" />
      <h3 className="font-bold text-lg mb-2 text-foreground">Formação de Preço de Venda</h3>
      <p>Simulador de Markup e Margem de Contribuição com despesas variáveis e impostos.</p>
    </div>
  )
}

export default function CustosPage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Custos & Formação de Preço</h1>
            <p className="text-sm text-muted-foreground">Margem de Contribuição, Rateios e Centros de Custo</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> Painel de Custos</button>
        <button onClick={() => setTab("preco")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "preco" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><DollarSign className="w-4 h-4"/> Formação de Preço</button>
        <button onClick={() => setTab("rateio")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "rateio" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><PieChart className="w-4 h-4"/> Mapa de Rateio (Custeio)</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "preco" && <FormacaoPrecoTab />}
        {tab === "rateio" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <PieChart className="w-12 h-12 opacity-20 mb-4" />
            <p>Configuração de critérios de rateio de despesas indiretas por CC (Custeio por Absorção).</p>
          </div>
        )}
      </div>
    </div>
  )
}
