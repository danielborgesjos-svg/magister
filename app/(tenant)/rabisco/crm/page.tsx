"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Search, ChevronRight, Phone, MessageSquare, ArrowUpRight, DollarSign, Clock, Check, X, ShieldAlert } from "lucide-react";
import { getCRMLeadsIntegrados, criarClienteRabisco, atualizarStatusCliente } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

const FUNIL = [
  { key: "lead",         label: "Novo Lead",     color: "bg-purple-50 border-purple-200 text-purple-700" },
  { key: "contato",      label: "Contato",       color: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "reuniao",      label: "Reunião Agendada", color: "bg-cyan-50 border-cyan-200 text-cyan-700" },
  { key: "briefing",     label: "Briefing",      color: "bg-indigo-50 border-indigo-200 text-indigo-700" },
  { key: "proposta",     label: "Proposta Enviada", color: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "negociacao",   label: "Negociação",    color: "bg-orange-50 border-orange-200 text-orange-700" },
  { key: "ativo",        label: "Contrato Assinado", color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

export default function CRMPage() {
  const [data, setData] = useState<{ clientes: any[]; conversasWA: any[] }>({ clientes: [], conversasWA: [] });
  const [busca, setBusca] = useState("");
  const [filtro, setFiltro] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [novoLead, setNovoLead] = useState({ nome: "", empresa: "", cidade: "", segmento: "residencial", observacoes: "" });

  function carregar() {
    setLoading(true);
    getCRMLeadsIntegrados().then(r => {
      if (r.success && r.data) setData(r.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvarLead(e: React.FormEvent) {
    e.preventDefault();
    if (!novoLead.nome) return;
    const res = await criarClienteRabisco(novoLead);
    if (res.success) {
      setModalOpen(false);
      setNovoLead({ nome: "", empresa: "", cidade: "", segmento: "residencial", observacoes: "" });
      carregar();
    }
  }

  async function handleMudarStatus(id: string, novoStatus: string) {
    await atualizarStatusCliente(id, novoStatus);
    carregar();
  }

  const clientes = data.clientes || [];
  const conversasWA = data.conversasWA || [];

  const filtered = clientes.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || (c.empresa && c.empresa.toLowerCase().includes(busca.toLowerCase()));
    const matchFiltro = filtro === "todos" || c.status === filtro;
    return matchBusca && matchFiltro;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">CRM Comercial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Funil Comercial & Leads WhatsApp</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clientes.length} leads em acompanhamento ({conversasWA.length} conversas WhatsApp ativas)</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Lead
        </button>
      </div>

      {/* Leads do WhatsApp em destaque */}
      {conversasWA.length > 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-600" /> Conversas Recentes do WhatsApp (Leads em Tempo Real)
            </h2>
            <Link href="/whatsapp" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              Abrir WhatsApp WA Web <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {conversasWA.slice(0, 6).map(wa => (
              <div key={wa.id} className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-sm flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-900 truncate">{wa.nome || wa.telefone}</p>
                  <p className="text-[11px] text-slate-500 truncate">{wa.ultimaMensagem || "Conversa iniciada..."}</p>
                  <p className="text-[9px] font-semibold text-slate-400 mt-1">{new Date(wa.updatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <Link href="/whatsapp" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shrink-0">
                  Chat
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Funil Filter Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setFiltro("todos")}
          className={cn("px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all shadow-sm",
            filtro === "todos" ? "bg-[#D4A853] text-slate-950 border-[#D4A853]" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100")}>
          Todos os Leads ({clientes.length})
        </button>
        {FUNIL.map(f => {
          const count = clientes.filter(c => c.status === f.key).length;
          return (
            <button key={f.key} onClick={() => setFiltro(f.key === filtro ? "todos" : f.key)}
              className={cn("px-3.5 py-2 rounded-xl border text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 shadow-sm",
                filtro === f.key ? cn(f.color, "ring-2 ring-slate-400/20") : "bg-white border-slate-200 text-slate-600 hover:bg-slate-100")}>
              {f.label}
              <span className="font-black text-xs px-1.5 py-0.5 rounded bg-slate-100">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-[#D4A853]"
          placeholder="Buscar lead por nome ou empresa..." />
      </div>

      {/* Leads Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Nenhum lead encontrado neste estágio</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map(c => {
            const fStatus = FUNIL.find(f => f.key === c.status) || FUNIL[0];
            return (
              <div key={c.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="w-10 h-10 bg-[#D4A853]/15 border border-[#D4A853]/30 rounded-xl flex items-center justify-center shrink-0">
                      <span className="text-[#B38734] font-black text-sm">{c.nome[0]}</span>
                    </div>
                    <select value={c.status} onChange={e => handleMudarStatus(c.id, e.target.value)}
                      className={cn("text-[10px] font-extrabold uppercase px-2 py-1 rounded-md border focus:outline-none cursor-pointer", fStatus.color)}>
                      {FUNIL.map(f => <option key={f.key} value={f.key}>{f.label}</option>)}
                    </select>
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900">{c.nome}</h3>
                  {c.empresa && <p className="text-xs text-slate-500 font-semibold">{c.empresa}</p>}
                  {c.cidade && <p className="text-xs text-slate-400 mt-0.5">{c.cidade}</p>}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">{c.segmento || "Residencial"}</span>
                  <Link href="/whatsapp" className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm">
                    <MessageSquare className="w-3.5 h-3.5" /> Mensagem WhatsApp
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Criar Lead */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900">Novo Lead Comercial</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarLead} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Nome do Lead *</label>
                <input required value={novoLead.nome} onChange={e => setNovoLead({...novoLead, nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="Ex: Lucas Ferreira" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Empresa / Imóvel</label>
                <input value={novoLead.empresa} onChange={e => setNovoLead({...novoLead, empresa: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="Ex: Casa Alphaville" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Cidade / Estado</label>
                <input value={novoLead.cidade} onChange={e => setNovoLead({...novoLead, cidade: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="São Paulo / SP" />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 font-black rounded-xl text-sm shadow-md transition-all">Adicionar Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
