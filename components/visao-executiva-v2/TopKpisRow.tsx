"use client"

import React, { useState, useEffect } from "react"

function Sparkline({ color, data }: { color: "blue" | "green", data: number[] }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const stroke = color === "blue" ? "#3b82f6" : "#10b981"
  const fill = color === "blue" ? "url(#blueGrad)" : "url(#greenGrad)"

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100
    const y = 100 - ((d - min) / range) * 100
    return `${x},${y}`
  }).join(" ")

  return (
    <svg viewBox="0 -10 100 120" preserveAspectRatio="none" className="w-full h-10 mt-auto opacity-70 transition-all duration-700 ease-in-out">
      <defs>
        <linearGradient id="blueGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="greenGrad" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline fill={fill} stroke="none" points={`0,100 ${points} 100,100`} className="transition-all duration-700 ease-in-out" />
      <polyline fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} className="transition-all duration-700 ease-in-out" />
    </svg>
  )
}

function GaugeChart({ value }: { value: number }) {
  const radius = 36;
  const circumference = Math.PI * radius; // Half circle
  const strokeDashoffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-full flex flex-col items-center justify-center mt-4 mb-2">
      <svg viewBox="0 0 100 55" className="w-32 h-16 overflow-visible">
        {/* Background Arc */}
        <path d="M 14 50 A 36 36 0 0 1 86 50" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeLinecap="round" />
        {/* Foreground Arc */}
        <path d="M 14 50 A 36 36 0 0 1 86 50" fill="none" stroke="#10b981" strokeWidth="12" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} className="transition-all duration-1000 ease-out" />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-center items-baseline gap-0.5 transition-all duration-700">
        <span className="text-[26px] font-black text-slate-900 leading-none">{value.toFixed(0)}</span>
        <span className="text-[12px] font-bold text-slate-400">/100</span>
      </div>
    </div>
  )
}

export function TopKpisRow() {
  const [saude, setSaude] = useState(92)
  const [receita, setReceita] = useState(1523000)
  const [receitaData, setReceitaData] = useState([30, 45, 40, 60, 55, 75, 80])
  
  const [lucro, setLucro] = useState(312430)
  const [lucroData, setLucroData] = useState([20, 35, 45, 55, 65, 80, 90])
  
  const [caixa, setCaixa] = useState(845230)
  const [caixaData, setCaixaData] = useState([50, 40, 60, 55, 70, 75, 85])
  
  const [liquidez, setLiquidez] = useState(1.82)
  const [liquidezData, setLiquidezData] = useState([1.5, 1.6, 1.5, 1.7, 1.8, 1.75, 1.82])
  
  const [endividamento, setEndividamento] = useState(28)
  const [endivData, setEndivData] = useState([35, 33, 34, 30, 29, 28.5, 28])

  useEffect(() => {
    const interval = setInterval(() => {
      setSaude(prev => Math.min(100, Math.max(80, prev + (Math.random() * 4 - 2))))
      
      setReceita(prev => {
        const newVal = prev + (Math.random() * 10000 - 3000)
        setReceitaData(d => [...d.slice(1), newVal / 20000])
        return newVal
      })
      
      setLucro(prev => {
        const newVal = prev + (Math.random() * 5000 - 1500)
        setLucroData(d => [...d.slice(1), newVal / 4000])
        return newVal
      })
      
      setCaixa(prev => {
        const newVal = prev + (Math.random() * 8000 - 4000)
        setCaixaData(d => [...d.slice(1), newVal / 10000])
        return newVal
      })
      
      setLiquidez(prev => {
        const newVal = prev + (Math.random() * 0.1 - 0.05)
        setLiquidezData(d => [...d.slice(1), newVal])
        return newVal
      })
      
      setEndividamento(prev => {
        const newVal = prev + (Math.random() * 2 - 1)
        setEndivData(d => [...d.slice(1), newVal])
        return Math.max(10, newVal)
      })

    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
      {/* 1. Saúde Geral */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-between col-span-1 xl:col-span-1 transition-all">
        <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest text-center">Saúde Geral da Empresa</h3>
        <GaugeChart value={saude} />
        <span className="text-[12px] font-bold text-emerald-600 mt-2 transition-all">Empresa saudável</span>
      </div>

      {/* 2. Receita Prevista */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden relative group">
        <div>
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Receita Prevista (Mês)</h3>
          <div className="mt-2 flex flex-col">
            <span className="text-[22px] font-black text-slate-900 leading-none transition-all duration-500">
              R$ {receita.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[12px] font-bold text-emerald-600 mt-1 transition-all">↑ 12,4% vs mês anterior</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <Sparkline color="blue" data={receitaData} />
        </div>
      </div>

      {/* 3. Probabilidade Meta */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between">
        <div>
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Prob. de Atingir Meta</h3>
          <div className="mt-2 flex flex-col">
            <span className="text-[22px] font-black text-slate-900 leading-none">91%</span>
            <span className="text-[12px] font-bold text-slate-500 mt-1">Meta: R$ 1.670.000</span>
          </div>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full mt-auto overflow-hidden">
          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '91%' }} />
        </div>
      </div>

      {/* 4. Lucro */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden relative group">
        <div>
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Lucro Operacional</h3>
          <div className="mt-2 flex flex-col">
            <span className="text-[22px] font-black text-slate-900 leading-none transition-all duration-500">
              R$ {lucro.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[12px] font-bold text-emerald-600 mt-1">↑ 18,7% vs mês anterior</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <Sparkline color="blue" data={lucroData} />
        </div>
      </div>

      {/* 5. Caixa */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden relative group">
        <div>
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Caixa Disponível</h3>
          <div className="mt-2 flex flex-col">
            <span className="text-[22px] font-black text-slate-900 leading-none transition-all duration-500">
              R$ {caixa.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
            </span>
            <span className="text-[12px] font-bold text-emerald-600 mt-1">↑ 8,3% vs mês anterior</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <Sparkline color="blue" data={caixaData} />
        </div>
      </div>

      {/* 6. Liquidez */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden relative group">
        <div>
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Índice de Liquidez</h3>
          <div className="mt-2 flex flex-col">
            <span className="text-[22px] font-black text-slate-900 leading-none transition-all duration-500">
              {liquidez.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[12px] font-bold text-emerald-600 mt-1">Boa situação</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <Sparkline color="green" data={liquidezData} />
        </div>
      </div>

      {/* 7. Endividamento */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col justify-between overflow-hidden relative group">
        <div>
          <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Endividamento</h3>
          <div className="mt-2 flex flex-col">
            <span className="text-[22px] font-black text-slate-900 leading-none transition-all duration-500">
              {endividamento.toFixed(0)}%
            </span>
            <span className="text-[12px] font-bold text-emerald-600 mt-1">Baixo</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <Sparkline color="green" data={endivData} />
        </div>
      </div>
    </div>
  )
}

