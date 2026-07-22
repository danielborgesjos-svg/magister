"use client";
import { useState, useEffect } from "react";
import { ClipboardList, Plus, Search, ChevronRight, Building2, CheckCircle2, Clock, AlertTriangle, ArrowUpRight, X } from "lucide-react";
import { getProjetosArq, getClientesRabisco, criarProjetoArq } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  briefing:      { label: "Briefing",       color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200" },
  layout:        { label: "Layout",         color: "text-blue-700",   bg: "bg-blue-50",   border: "border-blue-200" },
  projeto3D:     { label: "Projeto 3D",     color: "text-cyan-700",   bg: "bg-cyan-50",   border: "border-cyan-200" },
  detalhamento:  { label: "Detalhamento",   color: "text-indigo-700", bg: "bg-indigo-50", border: "border-indigo-200" },
  orcamento:     { label: "Orçamento",      color: "text-amber-700",  bg: "bg-amber-50",  border: "border-amber-200" },
  execucao:      { label: "Em Execução",    color: "text-emerald-700",bg: "bg-emerald-50",border: "border-emerald-200" },
  entrega:       { label: "Entrega",        color: "text-green-700",  bg: "bg-green-50",  border: "border-green-200" },
  garantia:      { label: "Garantia",       color: "text-teal-700",   bg: "bg-teal-50",   border: "border-teal-200" },
};

const ETAPAS_FUNIL = ["briefing","layout","projeto3D","detalhamento","orcamento","execucao","entrega","garantia"];

export default function ProjetosPage() {
  const [projetos, setProjetos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [novoProj, setNovoProj] = useState({ clienteId: "", nome: "", tipo: "residencial", orcamentoPrevisto: 0, metragem: 0 });

  function carregar() {
    setLoading(true);
    Promise.all([getProjetosArq(), getClientesRabisco()]).then(([rProj, rCli]) => {
      if (rProj.success && rProj.data) setProjetos(rProj.data);
      if (rCli.success && rCli.data) setClientes(rCli.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvarProjeto(e: React.FormEvent) {
    e.preventDefault();
    if (!novoProj.clienteId || !novoProj.nome) return;
    const res = await criarProjetoArq({
      ...novoProj,
      orcamentoPrevisto: Number(novoProj.orcamentoPrevisto),
      metragem: Number(novoProj.metragem),
    });
    if (res.success) {
      setModalOpen(false);
      setNovoProj({ clienteId: "", nome: "", tipo: "residencial", orcamentoPrevisto: 0, metragem: 0 });
      carregar();
    }
  }

  const filtered = projetos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "todos" || p.status === filtroStatus;
    return matchBusca && matchStatus;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Projetos</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Projetos de Arquitetura</h1>
          <p className="text-slate-500 text-sm mt-0.5">{projetos.length} projetos de arquitetura ativos</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Projeto
        </button>
      </div>

      {/* Pipeline visual */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mb-8">
        {ETAPAS_FUNIL.map(s => {
          const cfg = STATUS_CONFIG[s];
          const count = projetos.filter(p => p.status === s).length;
          return (
            <button key={s} onClick={() => setFiltroStatus(s === filtroStatus ? "todos" : s)}
              className={cn("p-3 rounded-xl border text-center transition-all shadow-sm",
                filtroStatus === s ? cn(cfg.bg, cfg.border, "ring-2 ring-slate-400/20") : "bg-white border-slate-200 hover:bg-slate-100")}>
              <p className={cn("text-xl font-black", filtroStatus === s ? cfg.color : "text-slate-900")}>{count}</p>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">{cfg.label}</p>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-[#D4A853]"
          placeholder="Buscar projeto por nome..." />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Nenhum projeto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(p => {
            const cfg = STATUS_CONFIG[p.status] || STATUS_CONFIG.briefing;
            const etapasTotal = p.etapas?.length || 0;
            const etapasConc = p.etapas?.filter((e: any) => e.status === "concluida").length || 0;
            const aprovPend = p.aprovacoes?.length || 0;
            const obraAtrasada = p.obra?.diasAtraso > 0;
            return (
              <Link key={p.id} href={`/rabisco/projetos/${p.id}`}
                className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4 group">
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors truncate">{p.nome}</p>
                      <p className="text-xs text-slate-500 font-semibold truncate">{p.etapaAtual || "—"}</p>
                    </div>
                    <span className={cn("text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md border shrink-0", cfg.bg, cfg.border, cfg.color)}>
                      {cfg.label}
                    </span>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Avanço geral</span>
                      <span className={cn("font-black", cfg.color)}>{p.percentualAvanco}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#D4A853] h-2 rounded-full transition-all" style={{ width: `${p.percentualAvanco}%` }} />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-slate-100 pt-3">
                  <div className="bg-slate-50 rounded-xl p-2">
                    <p className="font-black text-slate-900">{etapasConc}/{etapasTotal}</p>
                    <p className="text-[9px] text-slate-500 font-bold">Etapas</p>
                  </div>
                  <div className={cn("rounded-xl p-2", aprovPend > 0 ? "bg-amber-50" : "bg-slate-50")}>
                    <p className={cn("font-black", aprovPend > 0 ? "text-amber-700" : "text-slate-900")}>{aprovPend}</p>
                    <p className="text-[9px] text-slate-500 font-bold">Aprovações</p>
                  </div>
                  <div className={cn("rounded-xl p-2", obraAtrasada ? "bg-rose-50" : "bg-slate-50")}>
                    <p className={cn("font-black", obraAtrasada ? "text-rose-700" : "text-slate-900")}>{p.obra ? (obraAtrasada ? `+${p.obra.diasAtraso}d` : "Ok") : "—"}</p>
                    <p className="text-[9px] text-slate-500 font-bold">Obra</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Modal Criar Projeto */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Novo Projeto de Arquitetura</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarProjeto} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Cliente *</label>
                <select required value={novoProj.clienteId} onChange={e => setNovoProj({...novoProj, clienteId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
                  <option value="">Selecione um cliente...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome} {c.empresa ? `(${c.empresa})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Nome do Projeto *</label>
                <input required value={novoProj.nome} onChange={e => setNovoProj({...novoProj, nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Reforma Apartamento Jardins" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Metragem (m²)</label>
                  <input type="number" value={novoProj.metragem} onChange={e => setNovoProj({...novoProj, metragem: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Orçamento Est. (R$)</label>
                  <input type="number" value={novoProj.orcamentoPrevisto} onChange={e => setNovoProj({...novoProj, orcamentoPrevisto: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#D4A853] text-slate-950 font-black rounded-xl text-sm">Salvar Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
