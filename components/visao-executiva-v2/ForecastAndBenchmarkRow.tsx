"use client"

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"

const forecastData = [
  { month: "Jul", real: 14.5, meta: 14.5 },
  { month: "Ago", real: 15.0, meta: 15.0 },
  { month: "Set", real: 15.2, meta: 15.2 },
  { month: "Out", realista: 16.0, otimista: 16.8, pessimista: 14.8, meta: 16.0 },
  { month: "Nov", realista: 17.5, otimista: 18.5, pessimista: 15.5, meta: 17.5 },
  { month: "Dez", realista: 19.2, otimista: 21.0, pessimista: 16.0, meta: 19.0 },
]

const formatYAxis = (val: number) => `${val}M`

export function ForecastAndBenchmarkRow() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 mt-4">
      
      {/* Forecast IA */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm xl:col-span-2 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Forecast IA – Próximos 6 Meses</h3>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Ver previsão completa</button>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6 flex-1">
          {/* Cenários */}
          <div className="flex flex-col gap-3 md:w-1/3">
            <div className="bg-red-50/50 border border-red-100 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Pessimista</span>
              <span className="text-[20px] font-black text-red-900 leading-none">R$ 12,4M</span>
              <span className="text-[11px] font-bold text-red-600 mt-1">-8% vs meta</span>
            </div>
            
            <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-4 flex flex-col justify-center shadow-sm relative overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l-lg" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1 pl-1">Realista</span>
              <span className="text-[20px] font-black text-blue-900 leading-none pl-1">R$ 15,2M</span>
              <span className="text-[11px] font-bold text-slate-500 mt-1 pl-1">Dentro da meta</span>
            </div>
            
            <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Otimista</span>
              <span className="text-[20px] font-black text-emerald-900 leading-none">R$ 18,7M</span>
              <span className="text-[11px] font-bold text-emerald-600 mt-1">+12% vs meta</span>
            </div>
          </div>

          {/* Gráfico */}
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={forecastData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }} tickFormatter={formatYAxis} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '11px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 700, paddingTop: '15px' }} />
                
                <Line name="Realizado" type="monotone" dataKey="real" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Realista (IA)" type="monotone" dataKey="realista" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                <Line name="Otimista (IA)" type="monotone" dataKey="otimista" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line name="Pessimista (IA)" type="monotone" dataKey="pessimista" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                <Line name="Meta" type="monotone" dataKey="meta" stroke="#94a3b8" strokeWidth={2} strokeDasharray="3 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Benchmark */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Benchmark de Mercado</h3>
          <button className="text-[11px] font-bold text-blue-600 hover:text-blue-800">Ver completo</button>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Indicador</th>
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Sua Emp.</th>
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Setor</th>
                <th className="pb-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Top 10%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-4 text-[12px] font-bold text-slate-800">Margem Líquida</td>
                <td className="py-4 text-[13px] font-black text-emerald-600">19%</td>
                <td className="py-4 text-[12px] font-semibold text-slate-600">15%</td>
                <td className="py-4 text-[12px] font-bold text-slate-400 text-right">23%</td>
              </tr>
              <tr>
                <td className="py-4 text-[12px] font-bold text-slate-800">Giro de Estoque</td>
                <td className="py-4 text-[13px] font-black text-emerald-600">6,2</td>
                <td className="py-4 text-[12px] font-semibold text-slate-600">4,8</td>
                <td className="py-4 text-[12px] font-bold text-slate-400 text-right">7,1</td>
              </tr>
              <tr>
                <td className="py-4 text-[12px] font-bold text-slate-800">Retorno sobre Ativos</td>
                <td className="py-4 text-[13px] font-black text-emerald-600">14%</td>
                <td className="py-4 text-[12px] font-semibold text-slate-600">11%</td>
                <td className="py-4 text-[12px] font-bold text-slate-400 text-right">18%</td>
              </tr>
              <tr>
                <td className="py-4 text-[12px] font-bold text-slate-800">Liquidez Corrente</td>
                <td className="py-4 text-[13px] font-black text-emerald-600">1,82</td>
                <td className="py-4 text-[12px] font-semibold text-slate-600">1,35</td>
                <td className="py-4 text-[12px] font-bold text-slate-400 text-right">2,45</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
