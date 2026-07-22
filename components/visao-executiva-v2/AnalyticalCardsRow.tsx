"use client"

import React, { useState, useEffect } from "react"
import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts"
import { AlertTriangle, AlertCircle, Info, Star, ShieldAlert, Activity } from "lucide-react"

import { topProdutos, topClientes, initialFluxoCaixa, alertasVisaoExecutiva as alertas } from "@/lib/mock-data"

const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

export function AnalyticalCardsRow() {
  const [fluxo, setFluxo] = useState(initialFluxoCaixa)

  useEffect(() => {
    const interval = setInterval(() => {
      setFluxo(prev => {
        const newData = [...prev]
        // Criamos uma cópia do objeto na posição 6 para não mutar o estado original
        const novoDia = { ...newData[6] }
        
        // Atualiza a barra de "in" no último dia (hoje)
        novoDia.in += Math.floor(Math.random() * 5)
        // Atualiza a barra de "out" no último dia
        novoDia.out -= Math.floor(Math.random() * 3)
        // Atualiza o saldo
        novoDia.saldo = novoDia.in + novoDia.out + 340 // 340 é o saldo do dia anterior
        
        newData[6] = novoDia
        return newData
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-4">
      
      {/* Top Produtos */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Top Produtos (Lucro)</h3>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Ver todos</button>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {topProdutos.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-slate-800 truncate">{p.nome}</span>
                  <span className="text-[12px] font-semibold text-slate-600 shrink-0">{formatCurrency(p.valor)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${p.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Clientes */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Top Clientes (Receita)</h3>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Ver todos</button>
        </div>
        <div className="flex-1 flex flex-col gap-3">
          {topClientes.map((c, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] font-bold text-slate-800 truncate">{c.nome}</span>
                  <span className="text-[12px] font-semibold text-slate-600 shrink-0">{formatCurrency(c.valor)}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${c.pct}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fluxo de Caixa */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Fluxo de Caixa</h3>
            <span className="flex items-center gap-1.5 text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
              <Activity className="w-3 h-3 animate-pulse" /> Live
            </span>
          </div>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Ver detalhes</button>
        </div>
        <div className="flex-1 min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={fluxo} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={5} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px' }}
                itemStyle={{ fontWeight: 'bold' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700, paddingTop: '5px' }} />
              <Bar name="Entradas" dataKey="in" fill="#10b981" radius={[2, 2, 0, 0]} maxBarSize={15} isAnimationActive={false} />
              <Bar name="Saídas" dataKey="out" fill="#ef4444" radius={[0, 0, 2, 2]} maxBarSize={15} isAnimationActive={false} />
              <Line name="Saldo" type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Riscos e Alertas */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Riscos e Alertas</h3>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Ver todos</button>
        </div>
        <div className="flex-1 flex flex-col gap-3 justify-center">
          {alertas.map((a, i) => {
            const Icon = a.icon
            return (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${a.color} bg-opacity-20 flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-slate-900" />
                  </div>
                  <span className="text-[13px] font-bold text-slate-800">{a.label}</span>
                </div>
                <div className={`px-2.5 py-0.5 rounded-full ${a.color} text-white text-[12px] font-black min-w-[30px] text-center`}>
                  {a.count}
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
