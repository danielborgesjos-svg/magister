"use client";
import { useState, useEffect, use } from "react";
import { Building2, ChevronRight, Clock, AlertTriangle, Calendar, CheckCircle2, Plus, FileText, Camera, User, ArrowLeft, X } from "lucide-react";
import { getObraArqById, criarAtividadeObra, criarDiarioObra } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ObraDetalhePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [obra, setObra] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"cronograma" | "diario" | "visitas" | "naoconf">("cronograma");
  
  const [modalAtvOpen, setModalAtvOpen] = useState(false);
  const [modalDiarioOpen, setModalDiarioOpen] = useState(false);

  const [novaAtv, setNovaAtv] = useState({ nome: "", categoria: "elétrica", fornecedorNome: "" });
  const [novoDiario, setNovoDiario] = useState({ atividadesExecutadas: "", materiaisEntregues: "", problemasIdentificados: "", decisoesTomadas: "" });

  function carregar() {
    setLoading(true);
    getObraArqById(id).then(r => {
      if (r.success && r.data) setObra(r.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, [id]);

  async function handleSalvarAtividade(e: React.FormEvent) {
    e.preventDefault();
    if (!novaAtv.nome) return;
    const res = await criarAtividadeObra({ obraId: id, ...novaAtv });
    if (res.success) {
      setModalAtvOpen(false);
      setNovaAtv({ nome: "", categoria: "elétrica", fornecedorNome: "" });
      carregar();
    }
  }

  async function handleSalvarDiario(e: React.FormEvent) {
    e.preventDefault();
    if (!novoDiario.atividadesExecutadas) return;
    const res = await criarDiarioObra({ obraId: id, ...novoDiario });
    if (res.success) {
      setModalDiarioOpen(false);
      setNovoDiario({ atividadesExecutadas: "", materiaisEntregues: "", problemasIdentificados: "", decisoesTomadas: "" });
      carregar();
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!obra) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 p-6 text-center py-20">
        <p className="text-slate-500 font-bold">Obra não encontrada</p>
        <Link href="/rabisco/obras" className="text-xs text-[#B38734] font-black underline mt-2 inline-block">Voltar para Obras</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/rabisco/obras" className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 text-slate-600 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-0.5">
            <span>Rabisco</span> <ChevronRight className="w-3 h-3" /> <span>Obras</span> <ChevronRight className="w-3 h-3" /> <span className="text-slate-900">{obra.nome}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            {obra.nome}
            {obra.diasAtraso > 0 && <span className="text-xs font-black bg-rose-100 text-rose-700 px-2.5 py-1 rounded-full border border-rose-200">Atraso +{obra.diasAtraso}d</span>}
          </h1>
          <p className="text-xs text-slate-500 font-semibold">{obra.endereco || "Endereço não cadastrado"}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avanço Físico</p>
          <p className="text-3xl font-black text-emerald-600">{obra.percentualFisico}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avanço Financeiro</p>
          <p className="text-3xl font-black text-blue-600">{obra.percentualFinanceiro}%</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Orçamento Previsto</p>
          <p className="text-3xl font-black text-slate-900">R$ {((obra.orcamentoPrevisto || 0)/1000).toFixed(0)}k</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Realizado</p>
          <p className="text-3xl font-black text-amber-600">R$ {((obra.valorRealizado || 0)/1000).toFixed(0)}k</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 border-b border-slate-200 pb-3">
        {[
          { key: "cronograma", label: "Cronograma Físico-Financeiro (Gantt)" },
          { key: "diario",     label: "Diário de Obra" },
          { key: "visitas",    label: "Visitas Técnicas" },
          { key: "naoconf",    label: "Não Conformidades" },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key as any)}
            className={cn("px-4 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === t.key ? "bg-[#D4A853] text-slate-950 shadow-sm" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100")}>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "cronograma" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-base text-slate-900">Atividades do Cronograma</h3>
            <button onClick={() => setModalAtvOpen(true)} className="px-3.5 py-2 bg-[#D4A853] text-slate-950 text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Adicionar Atividade
            </button>
          </div>
          {obra.atividades.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">Nenhuma atividade no cronograma</p>
          ) : (
            <div className="space-y-3">
              {obra.atividades.map((atv: any) => (
                <div key={atv.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900">{atv.nome}</p>
                    <p className="text-xs text-slate-500 font-semibold">{atv.categoria || "Geral"} • Fornecedor: {atv.fornecedorNome || "Equipe Própria"}</p>
                  </div>
                  <div className="w-32">
                    <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                      <span>Avanço</span>
                      <span>{atv.percentualAvanco}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${atv.percentualAvanco}%` }} />
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700">
                    {atv.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "diario" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-black text-base text-slate-900">Registros do Diário de Obra</h3>
            <button onClick={() => setModalDiarioOpen(true)} className="px-3.5 py-2 bg-[#D4A853] text-slate-950 text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4" /> Novo Registro Diário
            </button>
          </div>
          {obra.diarios.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-10">Nenhum diário registrado nesta obra</p>
          ) : (
            <div className="space-y-4">
              {obra.diarios.map((d: any) => (
                <div key={d.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 border-b border-slate-200 pb-2">
                    <span>Data: {new Date(d.data).toLocaleDateString("pt-BR")}</span>
                    <span>Resp: {d.responsavelNome || "Engenheiro Responsável"}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{d.atividadesExecutadas}</p>
                  {d.materiaisEntregues && <p className="text-xs text-slate-600">Materiais: {d.materiaisEntregues}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {modalAtvOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Nova Atividade de Obra</h2>
              <button onClick={() => setModalAtvOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarAtividade} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Nome da Atividade *</label>
                <input required value={novaAtv.nome} onChange={e => setNovaAtv({...novaAtv, nome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Preparação de paredes para pintura" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Fornecedor / Responsável</label>
                <input value={novaAtv.fornecedorNome} onChange={e => setNovaAtv({...novaAtv, fornecedorNome: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Pintura Silva" />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalAtvOpen(false)} className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#D4A853] text-slate-950 font-black rounded-xl text-sm">Salvar Atividade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modalDiarioOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-black text-slate-900">Novo Diário de Obra</h2>
              <button onClick={() => setModalDiarioOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarDiario} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Atividades Executadas Hoje *</label>
                <textarea rows={3} required value={novoDiario.atividadesExecutadas} onChange={e => setNovoDiario({...novoDiario, atividadesExecutadas: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: Instalação das luminárias da sala concluída..." />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase block mb-1">Materiais Entregues</label>
                <input value={novoDiario.materiaisEntregues} onChange={e => setNovoDiario({...novoDiario, materiaisEntregues: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900" placeholder="Ex: 5 latas de tinta Suvinil" />
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalDiarioOpen(false)} className="flex-1 py-2 bg-slate-100 font-bold rounded-xl text-sm">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-[#D4A853] text-slate-950 font-black rounded-xl text-sm">Salvar Registro</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
