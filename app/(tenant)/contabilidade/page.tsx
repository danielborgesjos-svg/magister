"use client"

import { useState } from "react"
import {
  Building2, LayoutDashboard, FileSpreadsheet, Scale, 
  TrendingUp, Activity, Search, Filter, ArrowUpRight, ArrowDownRight,
  Download, PiggyBank, Briefcase
} from "lucide-react"
import { cn } from "@/lib/utils"

const BALANCO_ATIVO = [
  { conta: "1.0.0.00", desc: "Ativo Total", valor: 12500000, tipo: "sintetica", saldo: "devedor" },
  { conta: "1.1.0.00", desc: "Ativo Circulante", valor: 4500000, tipo: "sintetica", saldo: "devedor" },
  { conta: "1.1.1.00", desc: "Caixa e Equivalentes", valor: 1200000, tipo: "sintetica", saldo: "devedor" },
  { conta: "1.1.1.01", desc: "Banco Itaú S.A.", valor: 850000, tipo: "analitica", saldo: "devedor" },
  { conta: "1.1.1.02", desc: "Banco Bradesco S.A.", valor: 350000, tipo: "analitica", saldo: "devedor" },
  { conta: "1.1.2.00", desc: "Contas a Receber (Clientes)", valor: 2100000, tipo: "sintetica", saldo: "devedor" },
  { conta: "1.2.0.00", desc: "Ativo Não Circulante", valor: 8000000, tipo: "sintetica", saldo: "devedor" },
  { conta: "1.2.3.00", desc: "Imobilizado (Máquinas/Equip)", valor: 7500000, tipo: "sintetica", saldo: "devedor" },
]

const BALANCO_PASSIVO = [
  { conta: "2.0.0.00", desc: "Passivo Total + PL", valor: 12500000, tipo: "sintetica", saldo: "credor" },
  { conta: "2.1.0.00", desc: "Passivo Circulante", valor: 3200000, tipo: "sintetica", saldo: "credor" },
  { conta: "2.1.1.00", desc: "Fornecedores Nacionais", valor: 1800000, tipo: "sintetica", saldo: "credor" },
  { conta: "2.1.2.00", desc: "Obrigações Fiscais", valor: 850000, tipo: "sintetica", saldo: "credor" },
  { conta: "2.2.0.00", desc: "Passivo Não Circulante", valor: 4300000, tipo: "sintetica", saldo: "credor" },
  { conta: "2.3.0.00", desc: "Patrimônio Líquido", valor: 5000000, tipo: "sintetica", saldo: "credor" },
]

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Liquidez Corrente</p>
          <p className="text-3xl font-black text-blue-600">1.41</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> Saudável (Ideal &gt; 1)
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Grau de Endividamento</p>
          <p className="text-3xl font-black text-amber-600">60%</p>
          <p className="text-xs text-muted-foreground mt-2">Passivos / Ativos</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Capital de Giro Líquido</p>
          <p className="text-3xl font-black text-emerald-600">R$ 1.3M</p>
          <p className="text-xs text-muted-foreground mt-2">Ativo Circ. - Passivo Circ.</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Lucro Líquido (Exercício)</p>
          <p className="text-3xl font-black text-emerald-600">R$ 845k</p>
          <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1"><TrendingUp className="w-3 h-3"/> +12% vs ano anterior</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-5 flex flex-col">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Scale className="w-4 h-4 text-primary" /> Balanço Patrimonial (Sintético)</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-bold text-xs text-muted-foreground uppercase border-b pb-2 mb-3">Ativo</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold"><span className="text-blue-700">Ativo Circulante</span> <span>R$ 4.5M</span></div>
                <div className="flex justify-between text-muted-foreground pl-2 text-xs"><span>Caixa e Bancos</span> <span>R$ 1.2M</span></div>
                <div className="flex justify-between text-muted-foreground pl-2 text-xs"><span>Contas a Receber</span> <span>R$ 2.1M</span></div>
                <div className="flex justify-between text-muted-foreground pl-2 text-xs"><span>Estoques</span> <span>R$ 1.2M</span></div>
                <div className="flex justify-between font-semibold mt-4"><span className="text-blue-700">Ativo Não Circ.</span> <span>R$ 8.0M</span></div>
                <div className="flex justify-between text-muted-foreground pl-2 text-xs"><span>Imobilizado</span> <span>R$ 7.5M</span></div>
                <div className="flex justify-between font-black mt-4 pt-2 border-t text-base"><span className="text-blue-900">Total Ativo</span> <span>R$ 12.5M</span></div>
              </div>
            </div>
            
            <div>
              <p className="font-bold text-xs text-muted-foreground uppercase border-b pb-2 mb-3">Passivo + PL</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between font-semibold"><span className="text-red-700">Passivo Circulante</span> <span>R$ 3.2M</span></div>
                <div className="flex justify-between text-muted-foreground pl-2 text-xs"><span>Fornecedores</span> <span>R$ 1.8M</span></div>
                <div className="flex justify-between text-muted-foreground pl-2 text-xs"><span>Impostos a Recolher</span> <span>R$ 0.8M</span></div>
                <div className="flex justify-between font-semibold mt-4"><span className="text-red-700">Passivo Não Circ.</span> <span>R$ 4.3M</span></div>
                <div className="flex justify-between text-muted-foreground pl-2 text-xs"><span>Financiamentos LP</span> <span>R$ 4.3M</span></div>
                <div className="flex justify-between font-semibold mt-4"><span className="text-emerald-700">Patrimônio Líquido</span> <span>R$ 5.0M</span></div>
                <div className="flex justify-between font-black mt-4 pt-2 border-t text-base"><span className="text-red-900">Total Passivo+PL</span> <span>R$ 12.5M</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border rounded-2xl p-5 flex-1">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Demonstração do Resultado (DRE) - YTD</h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between font-bold text-emerald-700 border-b pb-2"><span>(+) Receita Bruta Vendas</span> <span>R$ 14.500.000</span></div>
              <div className="flex justify-between text-red-600 border-b pb-2"><span>(-) Deduções / Impostos</span> <span>R$ 2.610.000</span></div>
              <div className="flex justify-between font-bold text-emerald-800 border-b pb-2"><span>(=) Receita Líquida</span> <span>R$ 11.890.000</span></div>
              <div className="flex justify-between text-red-600 border-b pb-2"><span>(-) CPV/CMV</span> <span>R$ 5.945.000</span></div>
              <div className="flex justify-between font-bold text-blue-700 border-b pb-2"><span>(=) Lucro Bruto</span> <span>R$ 5.945.000</span></div>
              <div className="flex justify-between text-red-600"><span>(-) Despesas Operacionais</span> <span>R$ 3.800.000</span></div>
              <div className="flex justify-between text-red-600 border-b pb-2"><span>(-) Despesas Financeiras</span> <span>R$ 450.000</span></div>
              <div className="flex justify-between font-black text-emerald-600 pt-2 text-base"><span>(=) Lucro Líquido</span> <span>R$ 1.695.000</span></div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5"><span className="text-emerald-600">✦</span> JARMIS Auditoria Contábil IA</p>
            <p className="text-sm text-emerald-900 leading-relaxed">
              Detectada uma discrepância de conciliação bancária: Lançamento de R$ 15.400 no extrato do Bradesco (14/07) sem contrapartida no ERP. 
              Pela inteligência de padronagem, sugere-se que seja um pagamento não registrado da "Tech Distribuidora".
            </p>
            <button className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">Revisar Conciliação</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PlanoContasTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar Conta Contábil..." className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm" />
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold flex items-center gap-2"><Download className="w-4 h-4"/> Exportar SPED ECD</button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3">Código Conta</th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">Tipo</th>
              <th className="px-4 py-3">Natureza</th>
              <th className="px-4 py-3 text-right">Saldo (R$)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {BALANCO_ATIVO.map((c, i) => (
              <tr key={i} className={cn("hover:bg-muted/30", c.tipo === 'sintetica' ? "bg-muted/10" : "")}>
                <td className={cn("px-4 py-3 font-mono text-xs", c.tipo === 'sintetica' ? "font-bold" : "pl-8")}>{c.conta}</td>
                <td className={cn("px-4 py-3", c.tipo === 'sintetica' ? "font-bold text-primary" : "text-muted-foreground")}>{c.desc}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full uppercase", 
                    c.tipo === 'sintetica' ? "bg-slate-200 text-slate-800" : "bg-blue-100 text-blue-700"
                  )}>{c.tipo}</span>
                </td>
                <td className="px-4 py-3 text-xs uppercase font-semibold text-muted-foreground">{c.saldo}</td>
                <td className={cn("px-4 py-3 text-right font-mono", c.tipo === 'sintetica' ? "font-bold text-base" : "text-sm")}>{c.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ContabilidadePage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Contabilidade & Controladoria</h1>
            <p className="text-sm text-muted-foreground">Balanço Patrimonial, DRE e Plano de Contas</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> Dashboard Contábil</button>
        <button onClick={() => setTab("contas")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "contas" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><FileSpreadsheet className="w-4 h-4"/> Plano de Contas</button>
        <button onClick={() => setTab("conciliacao")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "conciliacao" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Scale className="w-4 h-4"/> Conciliação</button>
        <button onClick={() => setTab("patrimonio")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "patrimonio" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Briefcase className="w-4 h-4"/> Ativo Imobilizado</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "contas" && <PlanoContasTab />}
        {tab === "conciliacao" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Scale className="w-12 h-12 opacity-20 mb-4" />
            <p>Módulo de conciliação bancária OFX automática em desenvolvimento.</p>
          </div>
        )}
        {tab === "patrimonio" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Briefcase className="w-12 h-12 opacity-20 mb-4" />
            <p>Controle de depreciação e amortização (CIAP) em desenvolvimento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
