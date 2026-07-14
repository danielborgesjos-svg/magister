"use client";

import { useLayout } from "./LayoutProvider";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { MagisIAPanel } from "./MagisIAPanel";
import { Bot, Sparkles } from "lucide-react";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isIAPanelOpen, openIAPanel, isMobileMenuOpen, closeMobileMenu } = useLayout();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative">
      
      {/* Overlay Mobile */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Coluna 1: Sidebar Fixa */}
      <Sidebar />

      {/* Coluna 2: Conteúdo Principal e Topbar */}
      <div className="flex flex-col flex-1 min-w-0 bg-background relative z-10">
        <Topbar />
        <main className="flex-1 overflow-y-auto px-4 py-6 md:px-12 md:py-12 custom-scrollbar">
          {children}
        </main>
      </div>

      {/* Coluna 3: Copiloto IA Fixo */}
      <MagisIAPanel />

      {/* Botão Flutuante JARMIS (Aparece quando painel está fechado) */}
      {!isIAPanelOpen && (
        <button
          onClick={() => openIAPanel()}
          className="fixed bottom-6 right-6 z-50 group flex items-center justify-center animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-500"
        >
          <div className="absolute inset-0 bg-indigo-500 rounded-full blur-xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse" />
          <div className="relative w-16 h-16 bg-gradient-to-br from-indigo-600 to-indigo-900 border-2 border-indigo-400/50 shadow-2xl rounded-full flex flex-col items-center justify-center transform group-hover:scale-110 transition-transform">
            <Bot className="w-7 h-7 text-white drop-shadow-md mb-0.5" />
            <span className="text-[9px] font-black uppercase tracking-wider text-indigo-100">JARMIS</span>
            <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
        </button>
      )}
    </div>
  );
}
