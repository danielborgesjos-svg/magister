"use client";
import { useState, useEffect } from "react";
import { ShoppingBag, Plus, Search, ChevronRight, FileText, CheckCircle2, Clock, X } from "lucide-react";
import { getComprasECotacoes, criarItemCompra, criarCotacao } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ComprasPage() {
  const [data, setData] = useState<{ itens: any[]; cotacoes: any[]; projetos: any[] }>({ itens: [], cotacoes: [], projetos: [] });
  const [loading, setLoading] = useState(true);
  const [modalItemOpen, setModalItemOpen] = useState(false);
  const [modalCotacaoOpen, setModalCotacaoOpen] = useState(false);

  const [novoItem, setNovoItem] = useState({ projetoId: "", produto: "", ambiente: "", marca: "", quantidade: 1, preco: 0, fornecedorNome: "" });
  const [novaCotacao, setNovaCotacao] = useState({ projetoId: "", descricao: "", fornecedorNome: "", fornecedorContato: "", valor: 0, prazo: "" });

  function carregar() {
    setLoading(true);
    getComprasECotacoes().then(r => {
      if (r.success && r.data) setData(r.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvarItem(e: React.FormEvent) {
    e.preventDefault();
    if (!novoItem.projetoId || !novoItem.produto) return;
    const res = await criarItemCompra({ ...novoItem, quantidade: Number(novoItem.quantidade), preco: Number(novoItem.preco) });
    if (res.success) {
      setModalItemOpen(false);
      setNovoItem({ projetoId: "", produto: "", ambiente: "", marca: "", quantidade: 1, preco: 0, fornecedorNome: "" });
      carregar();
    }
  }

  async function handleSalvarCotacao(e: React.FormEvent) {
    e.preventDefault();
    if (!novaCotacao.projetoId || !novaCotacao.descricao) return;
    const res = await criarCotacao({ ...novaCotacao, valor: Number(novaCotacao.valor) });
    if (res.success) {
      setModalCotacaoOpen(false);
      setNovaCotacao({ projetoId: "", descricao: "", fornecedorNome: "", fornecedorContato: "", valor: 0, prazo: "" });
      carregar();
    }
  }

  const itens = data.itens || [];
  const cotacoes = data.cotacoes || [];
  const projetos = data.projetos || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Compras & Cotações</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Lista de Compras & Cotações</h1>
          <p className="text-slate-500 text-sm mt-0.5">{itens.length} itens de especificação — {cotacoes.length} cotações registradas</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setModalCotacaoOpen(true)} className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nova Cotação
          </button>
          <button onClick={() => setModalItemOpen(true)} className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Adicionar Item de Compra
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tabela de Itens de Compras */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-600" /> Lista de Compras Especificadas
            </h2>
            {itens.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Nenhum item na lista de compras</p>
            ) : (
              <div className="space-y-3">
                {itens.map(item => (
                  <div key={item.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.produto}</p>
                      <p className="text-xs text-slate-500">{item.ambiente || "Ambiente geral"} • {item.marca || "Marca a definir"}</p>
                      {item.fornecedorNome && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Fornecedor: {item.fornecedorNome}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-slate-900">R$ {item.preco ? item.preco.toLocaleString("pt-BR") : "0"}</p>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">{item.status || "Especificado"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabela de Cotações */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" /> Cotações de Fornecedores
            </h2>
            {cotacoes.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">Nenhuma cotação registrada</p>
            ) : (
              <div className="space-y-3">
                {cotacoes.map(c => (
                  <div key={c.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{c.descricao}</p>
                      <p className="text-xs text-slate-500">Fornecedor: {c.fornecedorNome || "—"}</p>
                      {c.prazo && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Prazo: {c.prazo}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600">R$ {c.valor ? c.valor.toLocaleString("pt-BR") : "0"}</p>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">{c.status || "Solicitada"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Item */}
      {modalItemOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Novo Item de Compra</h2>
              <button onClick={() => setModalItemOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarItem} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Projeto *</label>
                <select required value={novoItem.projetoId} onChange={e => setNovoItem({...novoItem, projetoId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
                  <option value="">Selecione um projeto...</option>
                  {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Produto / Item *</label>
                <input required value={novoItem.produto} onChange={e => setNovoItem({...novoItem, produto: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Revestimento Porcelanato 90x90" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Ambiente</label>
                  <input value={novoItem.ambiente} onChange={e => setNovoItem({...novoItem, ambiente: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Banheiro Suíte" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Preço Est. (R$)</label>
                  <input type="number" value={novoItem.preco} onChange={e => setNovoItem({...novoItem, preco: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalItemOpen(false)} className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#D4A853] text-slate-950 font-black rounded-xl text-sm">Salvar Item</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cotação */}
      {modalCotacaoOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Nova Cotação</h2>
              <button onClick={() => setModalCotacaoOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarCotacao} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Projeto *</label>
                <select required value={novaCotacao.projetoId} onChange={e => setNovaCotacao({...novaCotacao, projetoId: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
                  <option value="">Selecione um projeto...</option>
                  {projetos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Descrição do Serviço / Material *</label>
                <input required value={novaCotacao.descricao} onChange={e => setNovaCotacao({...novaCotacao, descricao: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Marcenaria completa da cozinha" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Fornecedor</label>
                  <input value={novaCotacao.fornecedorNome} onChange={e => setNovaCotacao({...novaCotacao, fornecedorNome: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Marcenaria Arte" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Valor Cotado (R$)</label>
                  <input type="number" value={novaCotacao.valor} onChange={e => setNovaCotacao({...novaCotacao, valor: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" />
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalCotacaoOpen(false)} className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#D4A853] text-slate-950 font-black rounded-xl text-sm">Salvar Cotação</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
