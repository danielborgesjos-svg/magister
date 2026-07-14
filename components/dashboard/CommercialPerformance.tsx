"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

const performanceMock = [
  { label: "Novos Leads", value: "0", trend: "0%", color: "text-blue-500", bars: [0, 0, 0, 0, 0, 0, 0] },
];

export function CommercialPerformance({ delay = 0, data = [] }: { delay?: number, data?: any[] }) {
  const items = data.length > 0 ? data : performanceMock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-slate-800">Performance Comercial</h3>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + (i * 0.1), duration: 0.3 }}
            className="flex flex-col p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-colors group cursor-default"
          >
            <span className="text-[12px] font-bold text-slate-500 mb-3">{item.label}</span>
            
            <div className="flex items-end justify-between mt-auto">
              <span className="text-[24px] font-black text-slate-800 leading-none">
                {item.label === "Receita" && !item.value.includes("R$") 
                  ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(item.value))
                  : item.value}
              </span>
              <div className="flex items-end gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                {item.bars.map((h: number, bi: number) => (
                  <div key={bi} className={cn("w-1.5 rounded-t-sm", item.color.replace('text-', 'bg-'))} style={{ height: `${h * 2}px` }} />
                ))}
              </div>
            </div>
            
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] font-bold text-emerald-600">{item.trend} no mês</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
