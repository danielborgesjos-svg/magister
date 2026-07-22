"use client"

import { useState } from "react"
import {
  Package, LayoutDashboard, Search, Filter, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Map, Box, History, RefreshCw,
  Barcode, ArrowRightLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

const PRODUTOS = [
  { id: "PRD-001", nome: "Válvula Hidráulica V500", categoria: "Produto Acabado", qtd: 143, min: 50, custo: 450, local: "A-12-01", abc: "A", status: "ok" },
  { id: "PRD-002", nome: "Aço SAE 1045", categoria: "Materia Prima", qtd: 210, min: 300, custo: 12, local: "B-05-02", abc: "A", status: "ruptura" },
  { id: "PRD-003", nome: "O-Ring Neoprene", categoria: "Componente", qtd: 380, min: 500, custo: 0.5, local: "C-01-04", abc: "C", status: "alerta" },
  { id: "PRD-004", nome: "Parafuso M10x30", categoria: "Insumo", qtd: 1200, min: 1000, custo: 0.1, local: "C-02-01", abc: "C", status: "ok" },
  { id: "PRD-005", nome: "Motor Elétrico 5CV", categoria: "Componente", qtd: 12, min: 10, custo: 1200, local: "A-01-01", abc: "B", status: "alerta" },
]

const MOVIMENTACOES = [
  { id: "MOV-105", tipo: "saida", prod: "Aço SAE 1045", qtd: 50, data: "2026-07-17 08:30", resp: "Produção (OP-0381)", user: "Carlos F." },
  { id: "MOV-104", tipo: "entrada", prod: "Motor Elétrico 5CV", qtd: 10, data: "2026-07-16 14:20", resp: "NFe 45892", user: "Recepção" },
  { id: "MOV-103", tipo: "saida", prod: "Válvula Hidráulica V500", qtd: 20, data: "2026-07-16 10:15", resp: "Venda (PED-992)", user: "Expedição" },
]

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Valor em Estoque</p>
          <p className="text-3xl font-black">R$ 2.45M</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-semibold">
            <ArrowUpRight className="w-3 h-3" /> +2.4% no mês
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Giro de Estoque</p>
          <p className="text-3xl font-black text-blue-600">4.2x</p>
          <p className="text-xs text-muted-foreground mt-2">Média saudável (Meta: 4.5x)</p>
        </div>
        <div className="bg-card border-red-200 bg-red-50/30 rounded-2xl p-5">
          <p className="text-sm font-medium text-red-600 mb-2">Itens em Ruptura</p>
          <p className="text-3xl font-black text-red-700">12</p>
          <p className="text-xs text-red-600 mt-2 font-semibold">Urgente: Reposição Necessária</p>
        </div>
        <div className="bg-card border-amber-200 bg-amber-50/30 rounded-2xl p-5">
          <p className="text-sm font-medium text-amber-700 mb-2">Abaixo do Mínimo</p>
          <p className="text-3xl font-black text-amber-800">45</p>
          <p className="text-xs text-amber-700 mt-2 font-semibold">Gerar ordens de compra</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-primary" /> Últimas Movimentações (Kardex)</h3>
          <div className="space-y-3">
            {MOVIMENTACOES.map(m => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                <div>
                  <p className="font-semibold text-sm flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", m.tipo === 'entrada' ? "bg-emerald-500" : "bg-red-500")} />
                    {m.prod}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.resp} · {m.user}</p>
                </div>
                <div className="text-right">
                  <p className={cn("font-bold text-sm", m.tipo === 'entrada' ? "text-emerald-600" : "text-red-600")}>
                    {m.tipo === 'entrada' ? '+' : '-'}{m.qtd}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{m.data}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-primary" /> Curva ABC (Valores)</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-primary">Curva A (80% do valor)</span><span className="font-bold">R$ 1.96M</span></div>
              <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-primary rounded-full" style={{width: '80%'}}></div></div>
              <p className="text-[10px] text-muted-foreground mt-1">20% dos itens (142 SKUs)</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-blue-600">Curva B (15% do valor)</span><span className="font-bold">R$ 367k</span></div>
              <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-blue-500 rounded-full" style={{width: '15%'}}></div></div>
              <p className="text-[10px] text-muted-foreground mt-1">30% dos itens (214 SKUs)</p>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1"><span className="font-bold text-slate-500">Curva C (5% do valor)</span><span className="font-bold">R$ 122k</span></div>
              <div className="h-2 bg-muted rounded-full"><div className="h-2 bg-slate-400 rounded-full" style={{width: '5%'}}></div></div>
              <p className="text-[10px] text-muted-foreground mt-1">50% dos itens (356 SKUs)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-5">
        <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5"><span className="text-emerald-600">✦</span> JARMIS WMS IA</p>
        <p className="text-sm text-emerald-900 leading-relaxed">
          Detectado aumento no giro de "Motor Elétrico 5CV". Sugiro aumentar o estoque mínimo de 10 para 15 unidades para evitar futuras rupturas, 
          baseado no lead time de 14 dias do fornecedor atual.
        </p>
        <button className="mt-3 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-lg hover:bg-emerald-700">Ajustar Estoque Mínimo para 15</button>
      </div>
    </div>
  )
}

function InventarioTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar SKU ou Nome..." className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm" />
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-border bg-background rounded-xl text-sm font-bold flex items-center gap-2"><Barcode className="w-4 h-4" /> Bipar Código</button>
          <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">Novo Item</button>
        </div>
      </div>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground border-b">
            <tr>
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Endereço (Rua-Prat-Niv)</th>
              <th className="px-4 py-3">Curva</th>
              <th className="px-4 py-3 text-right">Qtd Disp.</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {PRODUTOS.map(p => (
              <tr key={p.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td className="px-4 py-3 font-medium">{p.nome}</td>
                <td className="px-4 py-3 text-muted-foreground">{p.categoria}</td>
                <td className="px-4 py-3 font-mono text-xs">{p.local}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full", p.abc === 'A' ? "bg-primary text-white" : p.abc === 'B' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700")}>{p.abc}</span>
                </td>
                <td className="px-4 py-3 text-right font-bold">{p.qtd}</td>
                <td className="px-4 py-3">
                  <span className={cn("px-2 py-1 text-[10px] font-bold rounded-full uppercase", 
                    p.status === 'ok' ? "bg-emerald-100 text-emerald-700" :
                    p.status === 'ruptura' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function EstoquePage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Estoque & Armazém (WMS)</h1>
            <p className="text-sm text-muted-foreground">Inventário, Curva ABC, Kardex e Endereçamento</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> WMS Overview</button>
        <button onClick={() => setTab("inventario")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "inventario" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Box className="w-4 h-4"/> Grade de Inventário</button>
        <button onClick={() => setTab("mapa")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "mapa" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Map className="w-4 h-4"/> Mapa 3D do Galpão</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "inventario" && <InventarioTab />}
        {tab === "mapa" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Map className="w-12 h-12 opacity-20 mb-4" />
            <p>Visualização 3D do endereçamento em desenvolvimento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
