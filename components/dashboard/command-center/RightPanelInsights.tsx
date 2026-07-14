"use client";

import { motion } from "framer-motion";
import { ArrowRight, Circle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const items = [
  { text: "Receita acima da meta em 8%",      color: "bg-emerald-500", label: "Positivo" },
  { text: "Produto Alpha com 0 giro em 14d",  color: "bg-red-500",     label: "Crítico"  },
  { text: "Cliente VIP sem contato há 7 dias", color: "bg-orange-500", label: "Atenção"  },
  { text: "Nova oportunidade no funil B2B",   color: "bg-blue-500",    label: "Novo"     },
  { text: "Meta mensal atingida antes do prazo", color: "bg-emerald-500", label: "Positivo" },
];

export function RightPanelInsights() {
  return (
    <div className="flex flex-col h-full gap-0">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-foreground">Sinais em tempo real</h3>
        <span className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          ao vivo
        </span>
      </div>

      <div className="flex-1 flex flex-col divide-y divide-border/30 overflow-y-auto custom-scrollbar">
        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.09 }}
            className="flex items-start gap-3 py-3 first:pt-0 group hover:bg-muted/20 rounded-lg px-1 transition-colors cursor-pointer"
          >
            <div className={cn("w-1.5 h-1.5 rounded-full mt-1.5 shrink-0", item.color)} />
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground leading-snug transition-colors">{item.text}</p>
              <span className="text-[10px] text-muted-foreground/50 font-medium">{item.label}</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-4 mt-auto border-t border-border/30">
        <Link href="/inteligencia" className="flex items-center justify-between w-full py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors group">
          <span>Ver todos os insights</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
