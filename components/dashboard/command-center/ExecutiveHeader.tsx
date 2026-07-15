"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Brain } from "lucide-react";
import { useLayout } from "@/components/layout/LayoutProvider";

export function ExecutiveHeader() {
  const { openIAPanel } = useLayout();

  return (
    <div className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="bg-card rounded-[22px] border border-border shadow-[0_2px_16px_rgba(0,0,0,0.04)] dark:shadow-none p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 overflow-hidden relative"
      >
        {/* Subtle radial glow top-right */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Left — Greeting */}
        <div className="flex flex-col gap-5 max-w-xl relative z-10">
          {/* AI badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-primary bg-primary/10 border border-primary/15 px-3 py-1.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              Magis IA analisou sua empresa há 3 min
            </div>
          </div>

          <div>
            <h1 className="text-[38px] font-semibold text-foreground leading-tight tracking-tight">
              Bom dia, Rafael.
            </h1>
            <p className="text-[16px] text-muted-foreground leading-relaxed mt-2 font-normal">
              Enquanto você estava fora, encontrei{" "}
              <strong className="text-green-500 font-semibold">12 oportunidades</strong>, detectei{" "}
              <strong className="text-destructive font-semibold">3 riscos</strong> e preparei um plano de ação.
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex items-center gap-3 flex-wrap">
            {[
              { value: "12", label: "oportunidades", colorClass: "text-green-500", bgClass: "bg-green-500/10", borderClass: "border-green-500/20" },
              { value: "3",  label: "riscos",         colorClass: "text-destructive", bgClass: "bg-destructive/10", borderClass: "border-destructive/20" },
              { value: "5",  label: "ações prontas",  colorClass: "text-blue-500", bgClass: "bg-blue-500/10", borderClass: "border-blue-500/20" },
            ].map((s) => (
              <div
                key={s.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${s.bgClass} ${s.borderClass} ${s.colorClass}`}
              >
                <span className="text-[22px] font-bold leading-none">{s.value}</span>
                <span className="text-[12px] font-medium opacity-80">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Action Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, duration: 0.4 }}
          className="flex-shrink-0 bg-primary rounded-[18px] p-6 text-primary-foreground relative overflow-hidden shadow-[0_8px_32px_rgba(109,74,255,0.3)] min-w-[260px] max-w-[300px] w-full lg:w-auto"
        >
          {/* inner glow */}
          <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-black/10 rounded-full blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <span className="text-[12px] font-semibold text-primary-foreground/80 uppercase tracking-wide">Plano de ação</span>
            </div>

            <p className="text-[15px] font-semibold text-primary-foreground leading-snug mb-1">
              Preparado pela Magis IA
            </p>
            <p className="text-[12px] text-primary-foreground/60 mb-5">
              5 ações identificadas e priorizadas para hoje.
            </p>

            <button
              onClick={() => openIAPanel()}
              className="w-full flex items-center justify-center gap-2 bg-card text-primary font-semibold text-[13px] px-5 py-3 rounded-xl hover:bg-card/90 transition-all shadow-sm active:scale-[0.98]"
            >
              <Sparkles className="w-4 h-4" />
              Executar plano automaticamente
              <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
