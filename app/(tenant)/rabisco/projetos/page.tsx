"use client";
import { useState, useEffect } from "react";
import { ClipboardList, Plus, Search, ChevronRight, Building2, CheckCircle2, Clock, AlertTriangle, ArrowUpRight } from "lucide-react";
import { getProjetosArq } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  briefing:      { label: "Briefing",       color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  layout:        { label: "Layout",         color: "text-blue-400",   bg: "bg-blue-500/10",   border: "border-blue-500/20" },
  projeto3D:     { label: "Projeto 3D",     color: "text-cyan-400",   bg: "bg-cyan-500/10",   border: "border-cyan-500/20" },
  detalhamento:  { label: "Detalhamento",   color: "text-indigo-400", bg: "bg-indigo-500/10", border: "border-indigo-500/20" },
  orcamento:     { label: "Orçamento",      color: "text-yellow-400", bg: "bg-yellow-500/10", border: "border-yellow-500/20" },
  execucao:      { label: "Em Execução",    color: "text-emerald-400",bg: "bg-emerald-500/10",border: "border-emerald-500/20" },
  entrega:       { label: "Entrega",        color: "text-green-400",  bg: "bg-green-500/10",  border: "border-green-500/20" },
  garantia:      { label: "Garantia",       color: "text-teal-400",   bg: "bg-teal-500/10",   border: "border-teal-500/20" },
};

const ETAPAS_FUNIL = ["briefing","layout","projeto3D","detalhamento","orcamento","execucao","entrega","garantia"];

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjetosArq().then(r => { if (r.success && r.data) setProjetos(r.data); setLoading(false); });
  }, []);

  const filtered = projetos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="min-h-screen bg-[#0C0D10] text-white p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/rabisco" className="hover:text-white transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Projetos</span>
          </div>
          <h1 className="text-2xl font-black">Projetos de Arquitetura</h1>
          <p className="text-zinc-400 text-sm mt-1">{projetos.length} projetos cadastrados</p>
        </div>
        <Link href="/rabisco/projetos/novo" className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#D4A853]/90 text-black text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Projeto
        </Link>
      </div>

      {/* Pipeline visual */}
      <div className="grid grid-cols-8 gap-2 mb-8">
        {ETAPAS_FUNIL.map(s => {
          const cfg = STATUS_CONFIG[s];
          const count = projetos.filter(p => p.status === s).length;
          return (
            <button key={s} onClick={() => setFiltroStatus(s === filtroStatus ? "todos" : s)}
              className={cn("p-3 rounded-xl border text-center transition-all", filtroStatus === s ? cn(cfg.bg, cfg.border) : "bg-white/[0.02] border-white/10 hover:bg-white/5")}>
              <p className={cn("text-xl font-black", filtroStatus === s ? cfg.color : "text-white")}>{count}</p>
              <p className="text-[10px] text-zinc-400 mt-0.5">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A853]/50"
          placeholder="Buscar projeto..." />
      </div>

      {/* Projetos Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <ClipboardList className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">Nenhum projeto encontrado</p>
          <p className="text-zinc-600 text-sm mt-1">Crie seu primeiro projeto de arquitetura</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => {
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.briefing;
            const etapasTotal = p.etapas?.length || 0;
            const etapasConc = p.etapas?.filter((e: any) => e.status === "concluida").length || 0;
            const aprovPend = p.aprovacoes?.length || 0;
            const obraAtrasada = p.obra?.diasAtraso > 0;
            return (
              <Link key={p.id} href={`/rabisco/projetos/${p.id}`}
                className="bg-white/[0.03] border border-white/10 hover:border-[#D4A853]/40 rounded-2xl p-5 group transition-all hover:bg-white/[0.05] flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-base leading-snug truncate">{p.nome}</p>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{p.etapaAtual || "—"}</p>
                  </div>
                  <span className={cn("text-[10px] font-bold uppercase px-2 py-1 rounded-lg border shrink-0", cfg.bg, cfg.border, cfg.color)}>
                    {cfg.label}
                  </span>
                </div>
                
                <div>
                  <div className="flex justify-between text-[10px] text-zinc-500 mb-1">
                    <span>Avanço geral</span>
                    <span className={cn("font-bold", cfg.color)}>{p.percentualAvanco}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-1.5">
                    <div className={cn("h-1.5 rounded-full transition-all", cfg.bg.replace("/10","/60"))} style={{ width: `${p.percentualAvanco}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-white/5 rounded-lg py-2">
                    <p className="text-sm font-bold">{etapasConc}/{etapasTotal}</p>
                    <p className="text-[9px] text-zinc-500">Etapas</p>
                  </div>
                  <div className={cn("rounded-lg py-2", aprovPend > 0 ? "bg-amber-500/10" : "bg-white/5")}>
                    <p className={cn("text-sm font-bold", aprovPend > 0 ? "text-amber-400" : "text-white")}>{aprovPend}</p>
                    <p className="text-[9px] text-zinc-500">Aprovações</p>
                  </div>
                  <div className={cn("rounded-lg py-2", obraAtrasada ? "bg-red-500/10" : "bg-white/5")}>
                    <p className={cn("text-sm font-bold", obraAtrasada ? "text-red-400" : "text-white")}>{p.obra ? (obraAtrasada ? `+${p.obra.diasAtraso}d` : "Ok") : "—"}</p>
                    <p className="text-[9px] text-zinc-500">Obra</p>
                  </div>
                </div>

                {p.prazoEstimado && (
                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 border-t border-white/5 pt-3">
                    <Clock className="w-3 h-3" />
                    Prazo: {new Date(p.prazoEstimado).toLocaleDateString("pt-BR")}
                    <ArrowUpRight className="w-3 h-3 ml-auto text-zinc-700 group-hover:text-[#D4A853] transition-colors" />
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
