"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend, ReferenceLine } from "recharts";
import { cn } from "@/lib/utils";

const dataMock = [
  { name: "Jan", realizado: 0, previsto: 0, despesas: 0 },
];

export function ComboChartCard({
  title,
  subtitle,
  delay = 0,
  className,
  data = []
}: {
  title: string;
  subtitle?: string;
  delay?: number;
  className?: string;
  data?: any[];
}) {
  const chartData = data.length > 0 ? data : dataMock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col overflow-hidden",
        className
      )}
    >
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="flex flex-col items-end">
          <select className="px-3 py-1.5 rounded-lg bg-slate-50 text-xs font-semibold outline-none hover:bg-slate-100 transition-colors text-foreground cursor-pointer border-none shadow-sm">
            <option>Últimos 6 meses</option>
          </select>
        </div>
      </div>

      <div className="flex-1 min-h-[260px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRealizado" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00A3FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#00A3FF" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.6} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }} dy={10} />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "#64748B", fontWeight: 600 }} 
              tickFormatter={(value) => `${value / 1000}k`}
              domain={[0, 'auto']}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#F1F5F9", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
              itemStyle={{ fontWeight: "bold", fontSize: "13px" }}
              labelStyle={{ color: "#64748B", marginBottom: "4px", fontSize: "12px" }}
              formatter={(value: any) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
            />
            <Legend 
              verticalAlign="top" 
              align="left"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '20px', fontSize: '12px', fontWeight: 600, color: "#475569" }}
            />
            
            <Area type="monotone" dataKey="realizado" name="Receita Realizada" stroke="#00A3FF" strokeWidth={3} fillOpacity={1} fill="url(#colorRealizado)" isAnimationActive={true} />
            <Line type="monotone" dataKey="previsto" name="Receita Prevista" stroke="#94A3B8" strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={true} />
            <Line type="monotone" dataKey="despesas" name="Despesas" stroke="#EF4444" strokeWidth={3} dot={{ r: 4, fill: "#EF4444", strokeWidth: 2, stroke: "#FFF" }} activeDot={{ r: 6 }} isAnimationActive={true} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
