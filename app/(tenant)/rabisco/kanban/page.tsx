"use client";
import { useState } from "react";
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, Package, FileCheck, Hammer } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const KANBANS = {
  escritorio: {
    label: "Kanban do Escritório",
    colunas: ["Backlog", "Planejado", "Em andamento", "Revisão interna", "Aguardando cliente", "Ajustes", "Concluído"],
  },
  aprovacoes: {
    label: "Aprovações do Cliente",
    colunas: ["Aguardando envio", "Enviado", "Visualizado", "Aguardando decisão", "Alteração solicitada", "Aprovado"],
  },
  obra: {
    label: "Kanban de Obra",
    colunas: ["Não iniciado", "Material pendente", "Liberado", "Em execução", "Inspeção", "Correção", "Aprovado"],
  },
  fornecedores: {
    label: "Fornecedores",
    colunas: ["Cotação solicitada", "Cotação recebida", "Em análise", "Aprovado", "Pedido emitido", "Produção", "Entrega", "Conferência", "Pagamento"],
  },
};

export default function KanbanPage() {
  const [tab, setTab] = useState<keyof typeof KANBANS>("escritorio");
  const kb = KANBANS[tab];

  return (
    <div className="min-h-screen bg-[#0C0D10] text-white p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/rabisco" className="hover:text-white transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Kanban</span>
          </div>
          <h1 className="text-2xl font-black">Kanban da Equipe</h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {(Object.keys(KANBANS) as Array<keyof typeof KANBANS>).map(k => (
          <button key={k} onClick={() => setTab(k)}
            className={cn("px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all",
              tab === k ? "bg-[#D4A853] text-black" : "bg-white/5 border border-white/10 text-zinc-400 hover:bg-white/10")}>
            {KANBANS[k].label}
          </button>
        ))}
      </div>

      {/* Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {kb.colunas.map((col, i) => (
          <div key={col} className="min-w-[240px] bg-white/[0.02] border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-zinc-400">{col}</p>
              <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-zinc-500 font-bold">0</span>
            </div>
            {/* Drop area placeholder */}
            <div className="border-2 border-dashed border-white/5 rounded-xl py-8 flex items-center justify-center">
              <p className="text-[10px] text-zinc-700">Arraste tarefas aqui</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-[#D4A853]/5 border border-[#D4A853]/20 rounded-xl p-4 text-center">
        <p className="text-sm text-zinc-400">Tarefas serão vinculadas a projetos e obras em breve.</p>
        <p className="text-xs text-zinc-600 mt-1">Esta tela já está operacional — as colunas refletem o fluxo real da Rabisco.</p>
      </div>
    </div>
  );
}
