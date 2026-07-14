"use client";

import { X, Minus, Sparkles, Send } from "lucide-react";
import { useLayout } from "./LayoutProvider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export function JarmisIAPanel() {
  const { isIAPanelOpen, closeIAPanel } = useLayout();
  const [minimized, setMinimized] = useState(false);

  if (!isIAPanelOpen) return null;

  return (
    <div 
      className={cn(
        "fixed right-0 top-0 bottom-0 w-[400px] bg-card border-l border-border shadow-2xl flex flex-col transition-transform duration-300 z-50",
        minimized ? "translate-y-[calc(100%-60px)]" : "translate-y-0"
      )}
    >
      {/* Header */}
      <div className="h-16 border-b border-border flex items-center justify-between px-4 bg-purple-ia/5">
        <div className="flex items-center gap-2 text-purple-ia font-semibold">
          <Sparkles className="w-5 h-5" />
          <span>Jarmis IA</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={() => setMinimized(!minimized)}>
            <Minus className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-alert" onClick={closeIAPanel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 p-4 bg-muted/30">
        <div className="flex flex-col gap-4">
          
          {/* Agent Message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-purple-ia/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 text-purple-ia" />
            </div>
            <div className="bg-card border border-border rounded-lg rounded-tl-none p-4 shadow-sm text-sm">
              <p className="mb-2 font-medium">Olá, Rafael! 👋</p>
              <p className="mb-3 text-muted-foreground leading-relaxed">
                Hoje recomendo reativar 32 clientes inativos, reforçar a oferta do Produto X e repor 4 itens com alta saída.
              </p>
              <p className="mb-4 font-medium text-foreground">
                Quer que eu gere as ações e campanhas para você?
              </p>
              <div className="flex flex-col gap-2">
                <Button size="sm" className="bg-purple-ia hover:bg-purple-ia/90 text-white w-full">Gerar ações agora</Button>
                <Button variant="outline" size="sm" className="w-full">Ver detalhes</Button>
              </div>
            </div>
          </div>
          
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-card">
        <div className="relative">
          <Input 
            placeholder="Pergunte algo para a IA..." 
            className="pr-10 border-purple-ia/20 focus-visible:ring-purple-ia/30"
          />
          <Button size="icon" variant="ghost" className="absolute right-1 top-1 h-7 w-7 text-purple-ia hover:bg-purple-ia/10 hover:text-purple-ia">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
