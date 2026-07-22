"use client"

import React, { useState, useEffect } from "react"
import { DollarSign, LineChart, Factory, Boxes, ShoppingBag, Truck, Users, Receipt, ArrowRight } from "lucide-react"

function MiniSparkline({ color, points }: { color: string, points: number[] }) {
  const max = Math.max(...points)
  const min = Math.min(...points)
  const range = max - min || 1
  const path = points.map((p, i) => `${(i / (points.length - 1)) * 30},${10 - ((p - min) / range) * 10}`).join(" ")
  return (
    <svg viewBox="-2 -2 34 14" className="w-8 h-4 overflow-visible">
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={path} className="transition-all duration-700 ease-in-out" />
    </svg>
  )
}

const initialDepts = [
  { name: "Financeiro", nota: 94, status: "Saudável", color: "text-emerald-500", bg: "bg-emerald-50", icon: DollarSign, sColor: "#10b981", iconColor: "text-blue-500", spark: [5,6,5,7,8] },
  { name: "Comercial",  nota: 90, status: "Bom",      color: "text-emerald-500", bg: "bg-emerald-50", icon: LineChart, sColor: "#f59e0b", iconColor: "text-slate-600", spark: [6,5,4,6,7] },
  { name: "Produção",   nota: 87, status: "Atenção",  color: "text-amber-500",   bg: "bg-amber-50",   icon: Factory,   sColor: "#f59e0b", iconColor: "text-red-500", spark: [4,5,4,3,4] },
  { name: "Estoque",    nota: 91, status: "Bom",      color: "text-emerald-500", bg: "bg-emerald-50", icon: Boxes,     sColor: "#10b981", iconColor: "text-slate-600", spark: [7,8,7,8,9] },
  { name: "Compras",    nota: 95, status: "Excelente",color: "text-emerald-500", bg: "bg-emerald-50", icon: ShoppingBag,sColor: "#10b981", iconColor: "text-slate-600", spark: [8,9,9,8,9] },
  { name: "Logística",  nota: 93, status: "Bom",      color: "text-emerald-500", bg: "bg-emerald-50", icon: Truck,     sColor: "#10b981", iconColor: "text-purple-500", spark: [6,7,8,7,8] },
  { name: "RH",         nota: 89, status: "Atenção",  color: "text-amber-500",   bg: "bg-amber-50",   icon: Users,     sColor: "#f59e0b", iconColor: "text-fuchsia-500", spark: [5,4,5,6,5] },
  { name: "Fiscal",     nota: 99, status: "Excelente",color: "text-emerald-500", bg: "bg-emerald-50", icon: Receipt,   sColor: "#10b981", iconColor: "text-slate-600", spark: [9,9,9,9,10] },
]

export function DepartmentPerformanceRow() {
  const [depts, setDepts] = useState(initialDepts)

  useEffect(() => {
    const interval = setInterval(() => {
      setDepts(prev => prev.map(d => {
        const novaNota = Math.min(100, Math.max(70, Math.floor(d.nota + (Math.random() * 4 - 2))))
        const newSpark = [...d.spark.slice(1), Math.random() * 10]
        
        // Atualiza status e cores baseado na nota
        let status = "Bom"
        let color = "text-emerald-500"
        let bg = "bg-emerald-50"
        let sColor = "#10b981"
        
        if (novaNota >= 95) {
          status = "Excelente"
        } else if (novaNota < 90) {
          status = "Atenção"
          color = "text-amber-500"
          bg = "bg-amber-50"
          sColor = "#f59e0b"
        }

        return { ...d, nota: novaNota, status, color, bg, sColor, spark: newSpark }
      }))
    }, 2800)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {depts.map((d, i) => {
        const Icon = d.icon
        return (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm flex flex-col group hover:border-slate-300 transition-colors cursor-pointer relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <Icon className={`w-3.5 h-3.5 ${d.iconColor}`} />
              </div>
              <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest truncate">{d.name}</span>
            </div>
            
            <div className="flex items-baseline gap-0.5 mb-1 transition-all">
              <span className="text-[20px] font-black text-slate-900 leading-none">{d.nota}</span>
              <span className="text-[10px] font-bold text-slate-400">/100</span>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-2">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors ${d.bg} ${d.color}`}>
                {d.status}
              </span>
              <MiniSparkline color={d.sColor} points={d.spark} />
            </div>
            
            <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] font-black text-blue-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
              <span>Detalhes</span>
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
