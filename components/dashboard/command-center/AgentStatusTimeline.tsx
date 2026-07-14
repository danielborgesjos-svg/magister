"use client";

import { motion } from "framer-motion";
import { Bot, CheckCircle2, Loader2, PlayCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  "Entendendo cenário atual do negócio",
  "Analisando CRM e funil de vendas",
  "Consultando estoque e cadeia de suprimentos",
  "Cruzando dados financeiros",
  "Gerando insights preditivos e prioridades"
];

export function AgentStatusTimeline() {
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed) return;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        if (prev >= STEPS.length - 1) {
          clearInterval(interval);
          setCompleted(true);
          return prev;
        }
        return prev + 1;
      });
    }, 4500); // Avança a cada 4.5s simulando processamento

    return () => clearInterval(interval);
  }, [completed]);

  return (
    <div className="bg-white rounded-[18px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-border mb-8 overflow-hidden relative">
      {/* Decoração bg */}
      <div className="absolute right-0 top-0 w-64 h-full bg-gradient-to-l from-purple-500/5 to-transparent pointer-events-none" />

      <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
        
        {/* Agente Status Card */}
        <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50 shrink-0 min-w-[240px]">
          <div className="w-12 h-12 rounded-full bg-purple-100 border border-purple-200 flex items-center justify-center relative shadow-sm">
            <Bot className="w-6 h-6 text-purple-600" />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">Orquestrador Magis</h3>
            <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
              {completed ? "Análise concluída" : "Monitoramento Ativo..."}
            </p>
          </div>
        </div>

        {/* Timeline Horizontal */}
        <div className="flex-1 w-full overflow-hidden">
          <div className="flex items-center gap-2">
            {STEPS.map((step, index) => {
              const isPast = index < currentStep;
              const isCurrent = index === currentStep && !completed;
              
              return (
                <div key={index} className="flex items-center flex-shrink-0">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border text-[11px] font-bold transition-all duration-500",
                    isPast ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" :
                    isCurrent ? "bg-purple-500/10 border-purple-500/20 text-purple-700 shadow-[0_0_10px_rgba(168,85,247,0.2)]" :
                    "bg-muted/50 border-transparent text-muted-foreground/60"
                  )}>
                    {isPast ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                     isCurrent ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                     <PlayCircle className="w-3.5 h-3.5 opacity-50" />}
                    {step}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={cn(
                      "w-4 md:w-8 h-[1px] mx-1 transition-all duration-500",
                      isPast ? "bg-emerald-500/40" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
      </div>
    </div>
  );
}
