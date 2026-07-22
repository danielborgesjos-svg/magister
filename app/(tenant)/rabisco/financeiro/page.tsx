"use client";
import { useState, useEffect } from "react";
import { DollarSign, Plus, Search, ChevronRight, TrendingUp, TrendingDown, Clock, X } from "lucide-react";
import { getFinanceiroRabisco, criarLancamentoFinanceiro } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function FinanceiroPage() {
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [novoLanc, setNovoLanc] = useState({ descricao: "", valor: 0, tipo: "receita", status: "pago", dataVenc: new Date().toISOString().split("T")[0] });

  function carregar() {
    setLoading(true);
    getFinanceiroRabisco().then(r => {
      if (r.success && r.data) setLancamentos(r.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault();
    if (!novoLanc.descricao || !novoLanc.valor) return;
    const res = await criarLancamentoFinanceiro({ ...novoLanc, valor: Number(novoLanc.valor), dataVenc: new Date(novoLanc.dataVenc) });
    if (res.success) {
      setModalOpen(false);
      setNovoLanc({ descricao: "", valor: 0, tipo: "receita", status: "pago", dataVenc: new Date().toISOString().split("T")[0] });
      carregar();
    }
  }

  const receitas = lancamentos.filter(l => l.tipo === "receita").reduce((a, b) => a + (b.valor || 0), 0);
  const despesas = lancamentos.filter(l => l.tipo === "despesa").reduce((a, b) => a + (b.valor || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Financeiro</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Financeiro por Projeto & Caixa</h1>
          <p className="text-slate-500 text-sm mt-0.5">{lancamentos.length} lançamentos financeiros registrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Lançamento
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Receita Total</p>
          <p className="text-3xl font-black text-emerald-600">R$ {receitas.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Despesas Totais</p>
          <p className="text-3xl font-black text-rose-600">R$ {despesas.toLocaleString("pt-BR")}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Saldo em Caixa</p>
          <p className="text-3xl font-black text-blue-600">R$ {(receitas - despesas).toLocaleString("pt-BR")}</p>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-black text-slate-900 mb-4">Lançamentos Financeiros Ativos</h2>
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
        ) : lancamentos.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">Nenhum lançamento no sistema</p>
        ) : (
          <div className="space-y-3">
            {lancamentos.map(l => (
              <div key={l.id} className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold text-slate-900">{l.descricao}</p>
                  <p className="text-xs text-slate-400">Vencimento: {new Date(l.dataVenc).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm font-black", l.tipo === "receita" ? "text-emerald-600" : "text-rose-600")}>
                    {l.tipo === "receita" ? "+" : "-"} R$ {l.valor ? l.valor.toLocaleString("pt-BR") : "0"}
                  </p>
                  <span className={cn("text-[10px] font-extrabold uppercase px-2 py-0.5 rounded", l.status === "pago" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200")}>
                    {l.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Novo Lançamento Financeiro</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvar} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Descrição *</label>
                <input required value={novoLanc.descricao} onChange={e => setNovoLanc({...novoLanc, descricao: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Honorários Projeto Oliveira - Parcela 2" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Valor (R$) *</label>
                  <input type="number" required value={novoLanc.valor} onChange={e => setNovoLanc({...novoLanc, valor: Number(e.target.value)})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Tipo</label>
                  <select value={novoLanc.tipo} onChange={e => setNovoLanc({...novoLanc, tipo: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900">
                    <option value="receita">Receita (+)</option>
                    <option value="despesa">Despesa (-)</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#D4A853] text-slate-950 font-black rounded-xl text-sm">Salvar Lançamento</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
