"use client";
import { useState, useEffect } from "react";
import { Factory, Plus, Search, ChevronRight, Phone, Mail, MapPin, Star, X } from "lucide-react";
import { getFornecedoresRabisco, criarFornecedorRabisco } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FornecedoresPage() {
  const [fornecedores, setFornecedores] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [novoForn, setNovoForn] = useState({ nome: "", categoria: "marcenaria", telefone: "", email: "", cidade: "", segmento: "" });

  function carregar() {
    setLoading(true);
    getFornecedoresRabisco().then(r => {
      if (r.success && r.data) setFornecedores(r.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoForn.nome) return;
    const res = await criarFornecedorRabisco(novoForn);
    if (res.success) {
      setModalOpen(false);
      setNovoForn({ nome: "", categoria: "marcenaria", telefone: "", email: "", cidade: "", segmento: "" });
      carregar();
    }
  }

  const filtered = fornecedores.filter(f => f.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Fornecedores</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Gestão de Fornecedores & Parceiros</h1>
          <p className="text-slate-500 text-sm mt-0.5">{fornecedores.length} parceiros homologados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Fornecedor
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-[#D4A853]"
          placeholder="Buscar fornecedor por nome..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <Factory className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Nenhum fornecedor cadastrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(f => (
            <div key={f.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-center shrink-0">
                    <Factory className="w-5 h-5 text-amber-700" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    {f.categoria || "Geral"}
                  </span>
                </div>
                <h3 className="font-extrabold text-base text-slate-900">{f.nome}</h3>
                {f.cidade && <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" />{f.cidade}</p>}
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Avaliação: ★ 4.9</span>
                <span className="font-bold text-slate-900">{f.telefone || "Contato pendente"}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Novo Fornecedor</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Razão Social / Nome *</label>
                <input required value={novoForn.nome} onChange={e => setNovoForn({...novoForn, nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Marcenaria Arte & Design" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Categoria</label>
                  <select value={novoForn.categoria} onChange={e => setNovoForn({...novoForn, categoria: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
                    <option value="marcenaria">Marcenaria</option>
                    <option value="eletrica">Elétrica</option>
                    <option value="hidraulica">Hidráulica</option>
                    <option value="iluminacao">Iluminação</option>
                    <option value="gesso">Gesso & Pintura</option>
                    <option value="marmoraria">Marmoraria</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Telefone</label>
                  <input value={novoForn.telefone} onChange={e => setNovoForn({...novoForn, telefone: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="(11) 99999-9999" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#D4A853] text-slate-950 font-black rounded-xl text-sm">Cadastrar Fornecedor</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
