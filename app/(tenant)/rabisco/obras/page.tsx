"use client";
import { useState, useEffect } from "react";
import { Building2, Plus, Search, ChevronRight, Clock, AlertTriangle, TrendingUp, Camera } from "lucide-react";
import { getObrasArq } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

function ProgressRing({ value, size = 56, color = "#10b981" }: { value: number; size?: number; color?: string }) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill="white" fontSize={10} fontWeight="bold">{value}%</text>
    </svg>
  );
}

export default function ObrasPage() {
  const [obras, setObras] = useState<any[]>([]);
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getObrasArq().then(r => { if (r.success && r.data) setObras(r.data); setLoading(false); });
  }, []);

  const filtered = obras.filter(o => o.nome.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#0C0D10] text-white p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
            <Link href="/rabisco" className="hover:text-white transition-colors">Rabisco</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">Obras</span>
          </div>
          <h1 className="text-2xl font-black">Acompanhamento de Obras</h1>
          <p className="text-zinc-400 text-sm mt-1">{obras.filter(o => o.status === "em_execucao").length} obras em execução</p>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total de Obras", value: obras.length, color: "text-white" },
          { label: "Em Execução", value: obras.filter(o => o.status === "em_execucao").length, color: "text-emerald-400" },
          { label: "Com Atraso", value: obras.filter(o => o.diasAtraso > 0).length, color: "text-red-400" },
          { label: "Não Conf. Abertas", value: obras.reduce((a, o) => a + (o.naoConfs?.length || 0), 0), color: "text-amber-400" },
        ].map(k => (
          <div key={k.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-center">
            <p className={cn("text-2xl font-black", k.color)}>{k.value}</p>
            <p className="text-xs text-zinc-500 mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <input value={busca} onChange={e => setBusca(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4A853]/50"
          placeholder="Buscar obra..." />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <Building2 className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
          <p className="text-zinc-400 font-medium">Nenhuma obra encontrada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map(o => {
            const atrasada = o.diasAtraso > 0;
            const naoConfsAbertas = o.naoConfs?.length || 0;
            const proximaVisita = o.visitas?.find((v: any) => !v.dataRealizada);
            return (
              <Link key={o.id} href={`/rabisco/obras/${o.id}`}
                className={cn("bg-white/[0.03] border rounded-2xl p-5 group transition-all hover:bg-white/[0.05] flex flex-col gap-5",
                  atrasada ? "border-red-500/30 hover:border-red-500/50" : "border-white/10 hover:border-[#D4A853]/40")}>
                
                <div className="flex items-start gap-4">
                  <ProgressRing value={o.percentualFisico} color={atrasada ? "#ef4444" : "#10b981"} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-base">{o.nome}</p>
                      {atrasada && <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">ATRASADA +{o.diasAtraso}d</span>}
                    </div>
                    <p className="text-xs text-zinc-500 mt-0.5 truncate">{o.etapaAtual || "Sem etapa definida"}</p>
                    <p className="text-[10px] text-zinc-600 truncate">{o.projeto?.nome}</p>
                  </div>
                </div>

                {/* Financeiro */}
                <div className="bg-white/5 rounded-xl p-3 grid grid-cols-3 gap-3 text-center text-xs">
                  <div>
                    <p className="font-bold text-white">R$ {((o.orcamentoPrevisto || 0) / 1000).toFixed(0)}k</p>
                    <p className="text-[9px] text-zinc-500">Orçado</p>
                  </div>
                  <div>
                    <p className="font-bold text-emerald-400">R$ {((o.valorRealizado || 0) / 1000).toFixed(0)}k</p>
                    <p className="text-[9px] text-zinc-500">Realizado</p>
                  </div>
                  <div>
                    <p className={cn("font-bold", o.percentualFinanceiro > 90 ? "text-red-400" : "text-blue-400")}>{o.percentualFinanceiro}%</p>
                    <p className="text-[9px] text-zinc-500">Financeiro</p>
                  </div>
                </div>

                {/* Atividades */}
                {o.atividades && o.atividades.length > 0 && (
                  <div className="space-y-1.5">
                    {o.atividades.filter((a: any) => a.status === "em_execucao").slice(0, 3).map((a: any) => (
                      <div key={a.id} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full shrink-0" />
                        <p className="text-[11px] text-zinc-400 truncate">{a.nome}</p>
                        <span className="text-[10px] text-emerald-400 ml-auto shrink-0">{a.percentualAvanco}%</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-4 pt-3 border-t border-white/5 text-[10px] text-zinc-500">
                  {naoConfsAbertas > 0 && <span className="flex items-center gap-1 text-amber-400"><AlertTriangle className="w-3 h-3" />{naoConfsAbertas} NC</span>}
                  {proximaVisita && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Visita: {new Date(proximaVisita.dataAgendada).toLocaleDateString("pt-BR")}</span>}
                  {o.prazoEstimado && <span className="flex items-center gap-1 ml-auto"><TrendingUp className="w-3 h-3" />Prazo: {new Date(o.prazoEstimado).toLocaleDateString("pt-BR")}</span>}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
