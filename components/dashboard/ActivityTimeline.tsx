"use client";

import { motion } from "framer-motion";
import { CheckCircle2, DollarSign, Settings, UserPlus, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

const timelineMock = [
  { id: "m1", time: "09:15", title: "Bem Vindo", desc: "Nenhum histórico encontrado", type: "system" },
];

export function ActivityTimeline({ delay = 0, data = [] }: { delay?: number, data?: any[] }) {
  const items = data.length > 0 ? data : timelineMock;

  const getStyle = (type: string) => {
    switch(type) {
      case "venda": return { icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-100" };
      case "os": return { icon: Settings, color: "text-purple-500", bg: "bg-purple-100" };
      case "cliente": return { icon: UserPlus, color: "text-cyan-500", bg: "bg-cyan-100" };
      default: return { icon: FileText, color: "text-slate-500", bg: "bg-slate-100" };
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col h-full"
    >
      <div className="mb-6 shrink-0">
        <h3 className="text-[16px] font-bold text-slate-800">Atividade Recente</h3>
        <p className="text-[13px] text-slate-500 mt-1">Últimas movimentações no sistema</p>
      </div>

      <div className="flex-1 relative">
        {/* Linha mestra da timeline */}
        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200" />
        
        <div className="space-y-6 relative">
          {items.map((item, i) => {
            const style = getStyle(item.type);
            const Icon = style.icon;
            
            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + (i * 0.1), duration: 0.3 }}
                className="flex items-start gap-4"
              >
                <div className="relative z-10 shrink-0 mt-0.5">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm", style.bg)}>
                    <Icon className={cn("w-4 h-4", style.color)} />
                  </div>
                </div>
                
                <div className="flex flex-col pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-slate-800">{item.title}</span>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{item.time}</span>
                  </div>
                  <span className="text-[13px] font-medium text-slate-500 mt-0.5">{item.desc}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </motion.div>
  );
}
