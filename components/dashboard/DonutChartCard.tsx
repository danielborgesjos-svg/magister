"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { cn } from "@/lib/utils";

const dataMock = [
  { name: "Nenhuma OS", value: 1, color: "#94A3B8" }
];

export function DonutChartCard({
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
  const total = data.length > 0 ? data.reduce((acc, curr) => acc + curr.value, 0) : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "bg-slate-50/50 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col",
        className
      )}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-bold text-foreground">{title}</h3>
          {subtitle && <p className="text-[13px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 mt-2 relative">
        <div className="w-[170px] h-[170px] shrink-0 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={65}
                outerRadius={85}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                isAnimationActive={true}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: "#FFFFFF", borderColor: "#F1F5F9", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.08)" }}
                itemStyle={{ fontWeight: "bold", color: "#1E293B" }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Valor Central no Donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[32px] font-black text-slate-800 leading-none">{total}</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Total</span>
          </div>
        </div>

        <div className="w-full flex flex-col justify-center gap-3">
          {chartData.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors cursor-default">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-md shrink-0 shadow-sm" style={{ backgroundColor: item.color }} />
                <span className="text-[13px] font-bold text-slate-700 truncate">{item.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[13px] shrink-0">
                <span className="font-bold text-slate-900">{item.value}</span>
                <span className="text-slate-500 font-semibold w-10 text-right bg-slate-100 px-1.5 py-0.5 rounded-md">
                  {total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
