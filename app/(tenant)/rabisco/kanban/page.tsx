"use client";
import { useState, useEffect } from "react";
import { CheckCircle2, Clock, AlertTriangle, ChevronRight, Plus, X, MessageSquare, User, Calendar, Tag, ArrowRight } from "lucide-react";
import { getKanbanTarefas, criarTarefaRabisco, atualizarStatusTarefa } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

const COLUNAS = [
  { key: "a_fazer",      label: "A Fazer",      color: "bg-slate-100 border-slate-200 text-slate-700" },
  { key: "em_andamento", label: "Em Andamento", color: "bg-blue-50 border-blue-200 text-blue-700" },
  { key: "revisao",      label: "Revisão",      color: "bg-amber-50 border-amber-200 text-amber-700" },
  { key: "concluido",    label: "Concluído",    color: "bg-emerald-50 border-emerald-200 text-emerald-700" },
];

export default function KanbanPage() {
  const [tarefas, setTarefas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [cardDetalhe, setCardDetalhe] = useState<any | null>(null);

  const [novaTarefa, setNovaTarefa] = useState({
    titulo: "", descricao: "", responsavel: "", prioridade: "media", status: "a_fazer"
  });

  function carregar() {
    setLoading(true);
    getKanbanTarefas().then(r => {
      if (r.success && r.data) setTarefas(r.data);
      setLoading(false);
    });
  }

  useEffect(() => { carregar(); }, []);

  async function handleSalvarTarefa(e: React.FormEvent) {
    e.preventDefault();
    if (!novaTarefa.titulo || !novaTarefa.responsavel) return;
    const res = await criarTarefaRabisco(novaTarefa);
    if (res.success) {
      setModalOpen(false);
      setNovaTarefa({ titulo: "", descricao: "", responsavel: "", prioridade: "media", status: "a_fazer" });
      carregar();
    }
  }

  async function handleMudarStatus(id: string, novoStatus: string) {
    await atualizarStatusTarefa(id, novoStatus);
    carregar();
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <Link href="/rabisco" className="hover:text-slate-900 transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-900">Kanban</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">Kanban da Equipe & Tarefas</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tarefas.length} cartões de tarefas cadastrados</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Adicionar Cartão
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
          {COLUNAS.map(col => {
            const colTarefas = tarefas.filter(t => t.status === col.key);
            return (
              <div key={col.key} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col gap-3 min-h-[500px]">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-xs font-black uppercase px-2.5 py-1 rounded-md border", col.color)}>
                      {col.label}
                    </span>
                    <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {colTarefas.length}
                    </span>
                  </div>
                  <button onClick={() => { setNovaTarefa({...novaTarefa, status: col.key}); setModalOpen(true); }}
                    className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-all">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Cards List */}
                {colTarefas.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                    <p className="text-xs font-medium">Nenhuma tarefa</p>
                  </div>
                ) : (
                  colTarefas.map(t => (
                    <div key={t.id} onClick={() => setCardDetalhe(t)}
                      className="bg-slate-50 border border-slate-200 hover:border-[#D4A853] rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col gap-3 group">
                      
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">{t.titulo}</h4>
                        <span className={cn("text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded border shrink-0",
                          t.prioridade === "alta" ? "bg-rose-50 text-rose-700 border-rose-200" :
                          t.prioridade === "baixa" ? "bg-slate-100 text-slate-600 border-slate-200" :
                          "bg-amber-50 text-amber-700 border-amber-200")}>
                          {t.prioridade}
                        </span>
                      </div>

                      {t.descricao && <p className="text-xs text-slate-500 line-clamp-2">{t.descricao}</p>}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200/60 text-slate-500">
                        <span className="flex items-center gap-1 font-semibold text-slate-700">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {t.responsavel}
                        </span>
                        <Link href="/whatsapp" onClick={e => e.stopPropagation()} className="p-1.5 bg-emerald-100 text-emerald-800 hover:bg-emerald-200 rounded-lg transition-all" title="Mensagem rápida WhatsApp">
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>
                      </div>

                      {/* Quick Move Selector */}
                      <select value={t.status} onClick={e => e.stopPropagation()} onChange={e => handleMudarStatus(t.id, e.target.value)}
                        className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-700 focus:outline-none cursor-pointer">
                        {COLUNAS.map(c => <option key={c.key} value={c.key}>Mover para: {c.label}</option>)}
                      </select>
                    </div>
                  ))
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Add Card */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-black text-slate-900">Novo Cartão de Tarefa</h2>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSalvarTarefa} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Título da Tarefa *</label>
                <input required value={novaTarefa.titulo} onChange={e => setNovaTarefa({...novaTarefa, titulo: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="Ex: Detalhar Marcenaria Cozinha" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Descrição</label>
                <textarea rows={3} value={novaTarefa.descricao} onChange={e => setNovaTarefa({...novaTarefa, descricao: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="Insira detalhes técnicos..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Responsável *</label>
                  <input required value={novaTarefa.responsavel} onChange={e => setNovaTarefa({...novaTarefa, responsavel: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]" placeholder="Nome da arquiteta/técnico" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">Prioridade</label>
                  <select value={novaTarefa.prioridade} onChange={e => setNovaTarefa({...novaTarefa, prioridade: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-[#D4A853]">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta / Crítica</option>
                  </select>
                </div>
              </div>
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-sm transition-all">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 font-black rounded-xl text-sm shadow-md transition-all">Salvar Cartão</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes do Card */}
      {cardDetalhe && (
        <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">{cardDetalhe.status.replace("_", " ")}</span>
                <h3 className="text-lg font-black text-slate-900 mt-2">{cardDetalhe.titulo}</h3>
              </div>
              <button onClick={() => setCardDetalhe(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {cardDetalhe.descricao && <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">{cardDetalhe.descricao}</p>}
            <div className="space-y-2 text-xs font-semibold text-slate-700">
              <p>Responsável: <span className="font-bold text-slate-900">{cardDetalhe.responsavel}</span></p>
              <p>Prioridade: <span className="font-bold capitalize text-slate-900">{cardDetalhe.prioridade}</span></p>
              <p>Criado em: <span className="text-slate-500">{new Date(cardDetalhe.createdAt).toLocaleDateString("pt-BR")}</span></p>
            </div>
            <div className="pt-3 flex gap-3">
              <Link href="/whatsapp" className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm">
                <MessageSquare className="w-4 h-4" /> Enviar Atualização pelo WhatsApp
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
