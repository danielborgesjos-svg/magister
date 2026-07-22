"use client"

import React, { useState, useEffect } from "react"
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from "recharts"

const initialData = [
  { month: "Jan", real: 1100000, meta: 1200000 },
  { month: "Fev", real: 1150000, meta: 1250000 },
  { month: "Mar", real: 1280000, meta: 1300000 },
  { month: "Abr", real: 1350000, meta: 1400000 },
  { month: "Mai", real: 1420000, meta: 1500000 },
  { month: "Jun", real: 1380000, meta: 1550000 },
  { month: "Jul", real: 1450200, previsto: 1523000, meta: 1670000, isCurrent: true },
  { month: "Ago", previsto: 1600000, meta: 1700000 },
  { month: "Set", previsto: 1650000, meta: 1750000 },
  { month: "Out", previsto: 1720000, meta: 1800000 },
  { month: "Nov", previsto: 1850000, meta: 1900000 },
  { month: "Dez", previsto: 2050000, meta: 2100000 },
]

const formatYAxis = (tickItem: number) => {
  if (tickItem === 0) return "0"
  if (tickItem >= 1000000) return `${(tickItem / 1000000).toFixed(1).replace(".0", "")}M`
  if (tickItem >= 1000) return `${tickItem / 1000}K`
  return tickItem.toString()
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 min-w-[200px]">
        <p className="text-[12px] font-black text-slate-800 mb-2 border-b border-slate-100 pb-1">{label} / 2026</p>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 text-[11px] font-bold">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-slate-500">{entry.name}</span>
              </div>
              <span className="text-slate-900">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

export function RevenueChart() {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const newData = [...prev]
        // Criar cópia do objeto
        const novoJulho = { ...newData[6] }
        
        // Update "Jul" realtime
        if (novoJulho.real !== undefined) {
          novoJulho.real += (Math.random() * 5000 - 1500)
        }
        
        newData[6] = novoJulho
        return newData
      })
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Receita | Real vs Previsto</h3>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Ao vivo
        </span>
      </div>
      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} 
              tickFormatter={formatYAxis}
              domain={[0, 2500000]}
              ticks={[0, 500000, 1000000, 1500000, 2000000]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }}
            />
            
            {/* Meta Line */}
            <Line 
              name="Meta" 
              type="monotone" 
              dataKey="meta" 
              stroke="#94a3b8" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
              dot={false}
              activeDot={false}
              isAnimationActive={false}
            />
            
            {/* Realizado Line */}
            <Line 
              name="Realizado" 
              type="monotone" 
              dataKey="real" 
              stroke="#3b82f6" 
              strokeWidth={3} 
              dot={{ r: 3, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={800}
            />

            {/* Previsto Line */}
            <Line 
              name="Previsto (IA)" 
              type="monotone" 
              dataKey="previsto" 
              stroke="#10b981" 
              strokeWidth={3} 
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
