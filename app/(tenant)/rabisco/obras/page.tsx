"use client";
import { useState, useEffect } from "react";
import { Building2, Plus, Search, ChevronRight, Clock, AlertTriangle, TrendingUp } from "lucide-react";
import { getObrasArq } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ObrasPage() {
  const [obras, setObras] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getObrasArq().then(r => { if (r.success && r.data) setObras(r.data); setLoading(false); });
  }, []);

  const filtered = obras.filter(o => o.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Obras</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Acompanhamento de Obras</h1>
          <p className="text-slate-500 text-sm mt-0.5">{obras.filter(o => o.status === "em_execucao").length} obras em execução ativa</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-[#D4A853]"
          placeholder="Buscar obra por nome ou endereço..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200 rounded-2xl">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 font-bold">Nenhuma obra cadastrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(o => (
            <Link key={o.id} href={`/rabisco/obras/${o.id}`}
              className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between gap-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-base text-slate-900 group-hover:text-emerald-700 transition-colors">{o.nome}</h3>
                    {o.diasAtraso > 0 && <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded border border-rose-200">Atraso +{o.diasAtraso}d</span>}
                  </div>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">{o.etapaAtual || "Em execução"}</p>
                </div>
                <span className="text-sm font-black text-emerald-600">{o.percentualFisico}% Físico</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                <div>
                  <p className="font-black text-slate-900">R$ {((o.orcamentoPrevisto || 0)/1000).toFixed(0)}k</p>
                  <p className="text-[9px] font-bold text-slate-400">Orçado</p>
                </div>
                <div>
                  <p className="font-black text-emerald-600">R$ {((o.valorRealizado || 0)/1000).toFixed(0)}k</p>
                  <p className="text-[9px] font-bold text-slate-400">Realizado</p>
                </div>
                <div>
                  <p className="font-black text-blue-600">{o.percentualFinanceiro}%</p>
                  <p className="text-[9px] font-bold text-slate-400">Financeiro</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
