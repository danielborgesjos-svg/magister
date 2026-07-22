"use client";
import { useState, useEffect } from "react";
import { Users, Plus, Search, ChevronRight, Phone, Mail, MapPin, Building, MessageSquare, X, Check } from "lucide-react";
import { getClientesRabisco, criarClienteRabisco } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ClientesPage() {
  const [clientes, setClientes] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [novoCliente, setNovoCliente] = useState({ nome: "", empresa: "", cidade: "", segmento: "residencial", observacoes: "" });

  function carregar() {
    setLoading(true);
    getClientesRabisco().then(r => {
      if (r.success && r.data) setClientes(r.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoCliente.nome) return;
    const res = await criarClienteRabisco(novoCliente);
    if (res.success) {
      setModalOpen(false);
      setNovoCliente({ nome: "", empresa: "", cidade: "", segmento: "residencial", observacoes: "" });
      carregar();
    }
  }

  const filtered = clientes.filter(c =>
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    (c.empresa && c.empresa.toLowerCase().includes(busca.toLowerCase())) ||
    (c.cidade && c.cidade.toLowerCase().includes(busca.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Clientes</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Gestão de Clientes</h1>
          <p className="text-slate-500 text-sm mt-0.5">{clientes.length} clientes ativos e cadastrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Cliente
        </button>
      </div>

      {/* Busca */}
      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-[#D4A853] focus:ring-1 focus:ring-[#D4A853]"
          placeholder="Buscar por nome, empresa ou cidade..." />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Nenhum cliente encontrado</p>
          <p className="text-slate-400 text-xs mt-1">Cadastre o primeiro cliente da Rabisco</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(c => (
            <div key={c.id} className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="w-11 h-11 bg-[#D4A853]/15 border border-[#D4A853]/30 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-[#B38734] font-black text-base">{c.nome[0]}</span>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {c.status || "Ativo"}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900 leading-snug">{c.nome}</h3>
                {c.empresa && <p className="text-xs font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5"><Building className="w-3.5 h-3.5 text-slate-400" />{c.empresa}</p>}
                {c.cidade && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{c.cidade}</p>}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{c.segmento || "Residencial"}</span>
                <Link href="/whatsapp" className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Criar Cliente */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900">Novo Cliente</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Nome Completo *</label>
                <input required value={novoCliente.nome} onChange={e => setNovoCliente({...novoCliente, nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="Ex: Mariana Oliveira" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Empresa / Família</label>
                <input value={novoCliente.empresa} onChange={e => setNovoCliente({...novoCliente, empresa: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="Ex: Residência Família Silva" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Cidade / UF</label>
                  <input value={novoCliente.cidade} onChange={e => setNovoCliente({...novoCliente, cidade: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="São Paulo / SP" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Tipo</label>
                  <select value={novoCliente.segmento} onChange={e => setNovoCliente({...novoCliente, segmento: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]">
                    <option value="residencial">Residencial</option>
                    <option value="corporativo">Corporativo</option>
                    <option value="comercial">Comercial</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 font-black rounded-xl text-sm shadow-md transition-all">Cadastrar Cliente</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
