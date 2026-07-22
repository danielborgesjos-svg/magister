"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Search, ChevronRight, Phone, Mail, ArrowUpRight, DollarSign, Clock } from "lucide-react";
import { getClientesRabisco } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FUNIL = [
  { key: "lead",         label: "Novo Lead",     color: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400" },
  { key: "contato",      label: "Contato",       color: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  { key: "reuniao",      label: "Reunião",       color: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  { key: "briefing",     label: "Briefing",      color: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" },
  { key: "proposta",     label: "Proposta",      color: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" },
  { key: "negociacao",   label: "Negociação",    color: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  { key: "ativo",        label: "Cliente Ativo", color: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
];

export default function CRMPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClientesRabisco().then(r => { if (r.success && r.data) setClientes(r.data); setLoading(false); });
  }, []);

  const filtered = clientes.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase());
    const matchFiltro = filtro === "todos" || c.status === filtro;
    return matchBusca && matchFiltro;
  });

  return (
    <div className="min-h-screen bg-[#0C0D10] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/rabisco" className="hover:text-white transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">CRM e Comercial</span>
          </div>
          <h1 className="text-2xl font-black">CRM e Funil Comercial</h1>
          <p className="text-zinc-400 text-sm mt-1">{clientes.length} clientes cadastrados</p>
        </div>
        <button className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#D4A853]/90 text-black text-sm font-bold rounded-xl transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* Funil visual */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button onClick={() => setFiltro("todos")}
          className={cn("px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all", filtro === "todos" ? "bg-[#D4A853]/20 border-[#D4A853]/40 text-[#D4A853]" : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10")}>
          Todos ({clientes.length})
        </button>
        {FUNIL.map(f => {
          const count = clientes.filter(c => c.status === f.key).length;
          return (
            <button key={f.key} onClick={() => setFiltro(f.key === filtro ? "todos" : f.key)}
              className={cn("px-3 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2",
                filtro === f.key ? cn(f.color) : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10")}>
              {f.label}
              <span className={cn("font-black text-sm", filtro === f.key ? "" : "text-white")}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A853]/50"
          placeholder="Buscar cliente ou lead..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Users className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">Nenhum cliente encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(c => {
            const fStatus = FUNIL.find(f => f.key === c.status) || FUNIL[0];
            return (
              <div key={c.id} className="bg-white/[0.03] border border-white/10 hover:border-[#D4A853]/30 rounded-2xl p-4 group transition-all hover:bg-white/[0.05] flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="w-10 h-10 bg-[#D4A853]/10 border border-[#D4A853]/20 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-[#D4A853] font-black text-sm">{c.nome[0]}</span>
                  </div>
                  <span className={cn("text-[9px] font-bold uppercase px-2 py-0.5 rounded-lg border", fStatus.color)}>{fStatus.label}</span>
                </div>
                
                <div>
                  <p className="font-bold text-sm">{c.nome}</p>
                  {c.empresa && <p className="text-[11px] text-zinc-500">{c.empresa}</p>}
                  {c.cidade && <p className="text-[10px] text-zinc-600">{c.cidade}</p>}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center text-xs border-t border-white/5 pt-3">
                  <div>
                    <p className="font-bold text-white">{c.score || 50}</p>
                    <p className="text-[9px] text-zinc-500">Score</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-400">R$ {((c.totalComprado || 0) / 1000).toFixed(0)}k</p>
                    <p className="text-[9px] text-zinc-500">Comprado</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
