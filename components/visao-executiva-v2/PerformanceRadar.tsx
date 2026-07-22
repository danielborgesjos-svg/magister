"use client"

import React, { useState, useEffect } from "react"
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip } from "recharts"
import { Activity } from "lucide-react"

const initialData = [
  { subject: "Financeiro", A: 94, B: 90 },
  { subject: "Comercial", A: 90, B: 85 },
  { subject: "Produção", A: 87, B: 90 },
  { subject: "Estoque", A: 91, B: 88 },
  { subject: "Compras", A: 95, B: 90 },
  { subject: "Logística", A: 93, B: 92 },
  { subject: "RH", A: 89, B: 90 },
  { subject: "Clientes", A: 94, B: 90 },
]

export function PerformanceRadar() {
  const [data, setData] = useState(initialData)

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(item => ({
        ...item,
        // Altera levemente o valor A (Resultado)
        A: Math.min(100, Math.max(70, item.A + (Math.random() * 4 - 2)))
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-full flex flex-col relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Desempenho por Área</h3>
        <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
          <Activity className="w-3 h-3 animate-pulse" /> Live
        </span>
      </div>
      <div className="flex-1 min-h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }}
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Meta"
              dataKey="B"
              stroke="#10b981"
              strokeWidth={2}
              fill="none"
              isAnimationActive={false}
            />
            <Radar
              name="Resultado"
              dataKey="A"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="#3b82f6"
              fillOpacity={0.15}
              isAnimationActive={true}
              animationDuration={800}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}
            />
            <Legend 
              iconType="circle" 
              wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '10px' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
