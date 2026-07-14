"use client";

import { motion } from "framer-motion";
import { Bot, TrendingUp, AlertTriangle, MessageSquare, Info, Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function AIInsightPanel({ delay = 0, kpis }: { delay?: number, kpis?: any }) {
  const k = kpis || {};
  
  // Gerador dinâmico de insights com base nos dados reais
  const insights = [];

  if (k.osSlaEmRisco > 0) {
    insights.push({
      id: "i1",
      text: `${k.osSlaEmRisco} OS em risco`,
      subtext: "Estas OS podem vencer nas próximas 4h.",
      color: "text-red-500", bg: "bg-red-50", icon: AlertTriangle, action: "Ver OS", link: "/os"
    });
  }

  if (k.crescimentoReceita > 10) {
    insights.push({
      id: "i2",
      text: `Receita ${k.crescimentoReceita.toFixed(0)}% acima`,
      subtext: "Excelente! Crescimento comparado ao mês anterior.",
      color: "text-emerald-500", bg: "bg-emerald-50", icon: TrendingUp, action: "Ver relatório", link: "/relatorios"
    });
  }

  if (k.produtosAbaixoMinimo > 0) {
    insights.push({
      id: "i3",
      text: `${k.produtosAbaixoMinimo} produtos no limite`,
      subtext: "Estoque atingiu a margem mínima.",
      color: "text-orange-500", bg: "bg-orange-50", icon: Info, action: "Repor", link: "/estoque"
    });
  }

  if (insights.length === 0) {
    insights.push({
      id: "i0",
      text: "Tudo sob controle!",
      subtext: "Sua operação está saudável e sem riscos imediatos.",
      color: "text-cyan-500", bg: "bg-cyan-50", icon: Sparkles, action: null, link: ""
    });
  }

  // Pegar no máximo 3 insights
  const displayInsights = insights.slice(0, 3);

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col h-full overflow-hidden relative group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#00A3FF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex items-center gap-4 mb-6">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl blur opacity-30 group-hover:opacity-60 transition duration-500" />
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-[#0A2540] to-[#005B9F] flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-cyan-300" />
            <Sparkles className="w-3 h-3 text-white absolute top-1 right-1 opacity-70" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
        </div>
        <div>
          <h3 className="text-[16px] font-black text-slate-800 flex items-center gap-1.5">
            JARVIS <span className="text-[10px] bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest">IA</span>
          </h3>
          <p className="text-[12px] font-semibold text-emerald-500">Online e monitorando</p>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {displayInsights.map((insight, i) => (
          <motion.div 
            key={insight.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + (i * 0.1), duration: 0.3 }}
            className="flex flex-col gap-2 p-3.5 rounded-[12px] bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-100/50 cursor-default"
          >
            <div className="flex items-start gap-3">
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 shadow-sm", insight.bg)}>
                <insight.icon className={cn("w-4 h-4", insight.color)} />
              </div>
              <div className="flex flex-col flex-1">
                <p className="text-[14px] font-bold text-slate-800 leading-snug">
                  {insight.text}
                </p>
                <p className="text-[12px] font-medium text-slate-500 mt-0.5 leading-snug">
                  {insight.subtext}
                </p>
              </div>
            </div>
            
            {insight.action && (
              <div className="flex justify-end mt-1">
                <Link href={insight.link}>
                  <button className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 transition-colors">
                    {insight.action}
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link href="/inteligencia">
          <button className="w-full h-[46px] rounded-xl bg-gradient-to-r from-[#0A2540] to-[#005B9F] text-white text-[14px] font-bold hover:shadow-lg hover:shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
            <MessageCircle className="w-4 h-4 text-cyan-300" />
            Conversar com Jarvis
          </button>
        </Link>
      </div>
    </motion.div>
  );
}
