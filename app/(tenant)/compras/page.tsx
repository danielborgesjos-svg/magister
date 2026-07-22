"use client"

import { useState } from "react"
import {
  ShoppingCart, Package, DollarSign, TrendingDown,
  LayoutDashboard, FileText, CheckCircle2, Clock, 
  AlertTriangle, Factory, Users, Download, ArrowRight,
  Filter, Search, RefreshCw, Eye, Truck, Receipt
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const PEDIDOS = [
  { id: "OC-4891", fornecedor: "Metalúrgica Gerdau", valor: 45000, emissao: "2026-07-15", entrega: "2026-07-20", status: "em_transito", prioridade: "alta", comprador: "Ana Costa" },
  { id: "OC-4890", fornecedor: "Tech Distribuidora", valor: 12500, emissao: "2026-07-14", entrega: "2026-07-18", status: "entregue", prioridade: "normal", comprador: "Pedro Lima" },
  { id: "OC-4889", fornecedor: "Química Sul", valor: 8900, emissao: "2026-07-14", entrega: "2026-07-25", status: "aguardando_aprovacao", prioridade: "normal", comprador: "Ana Costa" },
  { id: "OC-4888", fornecedor: "Embalagens Brasil", valor: 3200, emissao: "2026-07-12", entrega: "2026-07-15", status: "atrasado", prioridade: "critica", comprador: "Pedro Lima" },
  { id: "OC-4887", fornecedor: "Siemens Componentes", valor: 85000, emissao: "2026-07-10", entrega: "2026-07-30", status: "em_producao", prioridade: "alta", comprador: "Carlos Mendes" },
]

const COTACOES = [
  { id: "COT-102", item: "Aço Inox 316L (500kg)", solicitante: "Produção", status: "analise", menorPreco: 18500, fornecedores: 3, prazo: "2 dias" },
  { id: "COT-101", item: "Óleo Lubrificante Industrial (200L)", solicitante: "Manutenção", status: "fechada", menorPreco: 4200, fornecedores: 4, prazo: "Fechado" },
  { id: "COT-100", item: "Licenças AutoCAD (10 un)", solicitante: "Engenharia", status: "aguardando_retorno", menorPreco: 0, fornecedores: 2, prazo: "4 dias" },
]

const FORNECEDORES = [
  { nome: "Metalúrgica Gerdau", categoria: "Aços e Metais", score: 95, pedidos: 42, volume: 1540000, onTime: "98%" },
  { nome: "Tech Distribuidora", categoria: "T.I.", score: 88, pedidos: 15, volume: 125000, onTime: "92%" },
  { nome: "Química Sul", categoria: "Insumos Químicos", score: 72, pedidos: 8, volume: 45000, onTime: "75%" },
  { nome: "Siemens Componentes", categoria: "Eletrônica", score: 98, pedidos: 24, volume: 850000, onTime: "99%" },
]

// ─── Componentes ───────────────────────────────────────────────────────────────
function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">Volume de Compras (Mês)</p>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><DollarSign className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black">R$ 452.890</p>
          <p className="text-xs text-emerald-600 font-semibold mt-1">↓ 12% vs. mês anterior</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">Saving Negociado</p>
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg"><TrendingDown className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black text-emerald-600">R$ 28.450</p>
          <p className="text-xs text-muted-foreground mt-1">6.2% de economia média nas cotações</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">Pedidos Abertos</p>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg"><ShoppingCart className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black">42</p>
          <p className="text-xs text-muted-foreground mt-1">1 atrasado (atenção)</p>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between items-start mb-2">
            <p className="text-sm font-medium text-muted-foreground">On-Time Delivery (Fornecedores)</p>
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><Truck className="w-4 h-4" /></div>
          </div>
          <p className="text-3xl font-black">94.5%</p>
          <p className="text-xs text-red-500 font-semibold mt-1">Abaixo da meta (95%)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><ShoppingCart className="w-4 h-4 text-primary" /> Pedidos Recentes</h3>
          <div className="space-y-3">
            {PEDIDOS.slice(0, 4).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border">
                <div>
                  <p className="font-semibold text-sm">{p.fornecedor}</p>
                  <p className="text-xs text-muted-foreground">{p.id} · Previsão: {new Date(p.entrega).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">R$ {p.valor.toLocaleString('pt-BR')}</p>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase", 
                    p.status === 'em_transito' ? "bg-blue-100 text-blue-700" :
                    p.status === 'atrasado' ? "bg-red-100 text-red-700" :
                    p.status === 'entregue' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  )}>{p.status.replace('_', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-5 flex flex-col">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><TrendingDown className="w-4 h-4 text-primary" /> Top Saving por Categoria</h3>
          <div className="flex-1 flex flex-col justify-center space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-muted-foreground">Aços e Metais</span><span className="font-bold text-emerald-600">8.5% saving</span></div>
              <div className="h-2.5 bg-muted rounded-full"><div className="h-2.5 bg-emerald-500 rounded-full" style={{width: '85%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-muted-foreground">Eletrônicos</span><span className="font-bold text-emerald-600">5.2% saving</span></div>
              <div className="h-2.5 bg-muted rounded-full"><div className="h-2.5 bg-emerald-500 rounded-full" style={{width: '52%'}}></div></div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-semibold text-muted-foreground">Serviços / T.I.</span><span className="font-bold text-emerald-600">3.1% saving</span></div>
              <div className="h-2.5 bg-muted rounded-full"><div className="h-2.5 bg-emerald-500 rounded-full" style={{width: '31%'}}></div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
        <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5"><span className="text-blue-600">✦</span> JARMIS Procurement IA</p>
        <p className="text-sm text-blue-900 leading-relaxed">
          Há um pedido em atraso (OC-4888) da Embalagens Brasil, que pode impactar a OP-2026-0383 da produção amanhã. 
          Sugiro acionar fornecedor alternativo (Embalagens Sul) ou enviar notificação de quebra de SLA.
        </p>
        <button className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Acionar Fornecedor Alternativo</button>
      </div>
    </div>
  )
}

function CotacoesTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar cotações..." className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm" />
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90">Nova Cotação</button>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Item / Serviço</th>
              <th className="px-4 py-3">Solicitante</th>
              <th className="px-4 py-3">Fornecedores</th>
              <th className="px-4 py-3">Menor Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {COTACOES.map(c => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{c.id}</td>
                <td className="px-4 py-3 font-medium">{c.item}</td>
                <td className="px-4 py-3 text-muted-foreground">{c.solicitante}</td>
                <td className="px-4 py-3">{c.fornecedores} propostas</td>
                <td className="px-4 py-3 font-bold">{c.menorPreco > 0 ? `R$ ${c.menorPreco.toLocaleString()}` : '-'}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 text-[10px] font-bold rounded-full uppercase", 
                    c.status === 'analise' ? "bg-amber-100 text-amber-700" :
                    c.status === 'fechada' ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  )}>{c.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="p-1.5 text-primary hover:bg-primary/10 rounded-lg"><Eye className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function FornecedoresTab() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Fornecedores Ativos</p>
          <p className="text-2xl font-black mt-1">124</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Score Médio</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">87.5 / 100</p>
        </div>
        <div className="bg-card border rounded-2xl p-4">
          <p className="text-xs text-muted-foreground font-medium">Fornecedores Críticos (Risco)</p>
          <p className="text-2xl font-black text-red-600 mt-1">3</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3">Fornecedor</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Volume (YTD)</th>
              <th className="px-4 py-3">Pedidos</th>
              <th className="px-4 py-3">On-Time</th>
              <th className="px-4 py-3">Score (Avaliação)</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {FORNECEDORES.map((f, i) => (
              <tr key={i} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-semibold">{f.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.categoria}</td>
                <td className="px-4 py-3 font-medium">R$ {f.volume.toLocaleString('pt-BR')}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.pedidos}</td>
                <td className="px-4 py-3 text-muted-foreground">{f.onTime}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-muted rounded-full">
                      <div className={cn("h-2 rounded-full", f.score >= 90 ? "bg-emerald-500" : f.score >= 80 ? "bg-amber-500" : "bg-red-500")} style={{width: `${f.score}%`}}></div>
                    </div>
                    <span className="font-bold text-xs">{f.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function ComprasPage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <ShoppingCart className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Suprimentos & Compras</h1>
            <p className="text-sm text-muted-foreground">Cotações, Pedidos e Gestão de Fornecedores</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> Dashboard</button>
        <button onClick={() => setTab("cotacoes")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "cotacoes" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><FileText className="w-4 h-4"/> Cotações</button>
        <button onClick={() => setTab("pedidos")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "pedidos" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Receipt className="w-4 h-4"/> Pedidos de Compra</button>
        <button onClick={() => setTab("fornecedores")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "fornecedores" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Factory className="w-4 h-4"/> Fornecedores</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "cotacoes" && <CotacoesTab />}
        {tab === "fornecedores" && <FornecedoresTab />}
        {tab === "pedidos" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Receipt className="w-12 h-12 opacity-20 mb-4" />
            <p>Aba de pedidos em construção...</p>
          </div>
        )}
      </div>
    </div>
  )
}
