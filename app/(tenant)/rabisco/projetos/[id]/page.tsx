"use client";
import { useState, useEffect, use } from "react";
import { ClipboardList, ChevronRight, Clock, CheckCircle2, Plus, ArrowLeft, FileText, Check, X } from "lucide-react";
import { getProjetoArqById } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ProjetoDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [projeto, setProjeto] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProjetoArqById(id).then(r => {
      if (r.success && r.data) setProjeto(r.data);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!projeto) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 text-center py-20">
        <p className="text-slate-500 font-bold">Projeto não encontrado</p>
        <Link href="/rabisco/projetos" className="text-xs text-[#B38734] font-black underline mt-2 inline-block">Voltar para Projetos</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/rabisco/projetos" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-0.5">
            <span>Rabisco</span> <ChevronRight className="w-3 h-3" /> <span>Projetos</span> <ChevronRight className="w-3 h-3" /> <span className="text-slate-900">{projeto.nome}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">{projeto.nome}</h1>
          <p className="text-xs text-slate-500 font-semibold">{projeto.etapaAtual || "Em andamento"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-900 mb-4">Etapas do Projeto de Arquitetura</h2>
          <div className="space-y-3">
            {projeto.etapas.map((e: any) => (
              <div key={e.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm text-slate-900">{e.ordem}. {e.nome}</p>
                  <p className="text-xs text-slate-400">Avanço: {e.percentualAvanco}%</p>
                </div>
                <span className={cn("text-[10px] font-extrabold uppercase px-2.5 py-1 rounded border", e.status === "concluida" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-700 border-slate-200")}>
                  {e.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-base font-black text-slate-900 mb-4">Resumo do Projeto</h2>
          <div className="space-y-3 text-xs font-semibold text-slate-700">
            <p>Avanço Geral: <span className="font-bold text-emerald-600">{projeto.percentualAvanco}%</span></p>
            <p>Orçamento Previsto: <span className="font-bold text-slate-900">R$ {projeto.orcamentoPrevisto ? projeto.orcamentoPrevisto.toLocaleString("pt-BR") : "0"}</span></p>
            {projeto.obra && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl mt-4">
                <p className="font-bold text-emerald-900">Obra Vinculada</p>
                <p className="text-emerald-700 text-xs mt-1">{projeto.obra.nome}</p>
                <Link href={`/rabisco/obras/${projeto.obra.id}`} className="text-[11px] font-bold text-emerald-800 underline mt-2 block">
                  Acessar Painel da Obra →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
