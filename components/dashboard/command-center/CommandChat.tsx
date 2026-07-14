"use client";

import { useState } from "react";
import { Sparkles, ArrowUp, Zap } from "lucide-react";
import { useLayout } from "@/components/layout/LayoutProvider";

export function CommandChat() {
  const [prompt, setPrompt] = useState("");
  const { openIAPanel } = useLayout();

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    // Abre o painel e envia a mensagem
    openIAPanel();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("magis:send", { detail: prompt }));
    }, 300);
    setPrompt("");
  };

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-border p-4 mb-8 overflow-hidden relative group transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:border-primary/30">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
      
      <form onSubmit={handleSend} className="relative flex items-center bg-muted/30 rounded-2xl p-2 border border-border/50 focus-within:border-primary/50 focus-within:bg-background transition-all shadow-inner">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 ml-1">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Peça à IA para analisar métricas, gerar relatórios ou tomar uma ação..."
          className="flex-1 bg-transparent border-none outline-none px-4 text-[15px] font-medium placeholder:text-muted-foreground/60 text-foreground h-12"
        />

        <button
          type="submit"
          disabled={!prompt.trim()}
          className="w-12 h-12 flex items-center justify-center bg-primary text-white rounded-xl font-bold shadow-md hover:bg-primary/90 disabled:opacity-50 disabled:hover:bg-primary transition-all active:scale-95 shrink-0 mr-1"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </form>

      <div className="flex flex-wrap gap-2 mt-4 px-2">
        <span className="text-[10px] font-black uppercase text-muted-foreground/60 flex items-center gap-1 mt-1 mr-2">
          <Zap className="w-3 h-3" /> Exemplos
        </span>
        {[
          "Como foram as vendas na última semana?",
          "Quais clientes VIP estão inativos?",
          "Gere um plano de contato para leads frios",
          "Mostre um relatório de produtos em risco"
        ].map((ex, i) => (
          <button
            key={i}
            onClick={() => setPrompt(ex)}
            className="text-[11px] font-bold text-muted-foreground bg-muted hover:bg-primary/10 hover:text-primary px-3 py-1.5 rounded-lg border border-transparent hover:border-primary/20 transition-all"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
