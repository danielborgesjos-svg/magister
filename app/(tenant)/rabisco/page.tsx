"use client";
import { useState, useEffect } from "react";
import { Building2, ClipboardList, AlertTriangle, Clock, TrendingUp, CheckCircle2, Calendar, DollarSign, Users, Zap, ChevronRight, ArrowUpRight, Package, MessageSquare } from "lucide-react";
import { getDashboardRabisco } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    briefing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    layout: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    projeto3D: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
    detalhamento: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    orcamento: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    execucao: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    entrega: "bg-green-500/10 text-green-400 border-green-500/20",
    garantia: "bg-teal-500/10 text-teal-400 border-teal-500/20",
    em_execucao: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    nao_iniciada: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    pausada: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  };
  const labels: Record<string, string> = {
    briefing: "Briefing", layout: "Layout", projeto3D: "Projeto 3D",
    detalhamento: "Detalhamento", orcamento: "Orçamento", execucao: "Em Execução",
    entrega: "Entrega", garantia: "Garantia", em_execucao: "Em Execução",
    nao_iniciada: "Não Iniciada", pausada: "Pausada",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded border", map[status] || "bg-zinc-700 text-zinc-300 border-zinc-600")}>
      {labels[status] || status}
    </span>
  );
}

function ProgressBar({ value, color = "bg-emerald-500" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-white/5 rounded-full h-1.5">
      <div className={cn("h-1.5 rounded-full transition-all", color)} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

export default function RabiscoDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardRabisco().then(r => {
      if (r.success) setData(r.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0C0D10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm font-medium">Carregando Rabisco ERP...</p>
        </div>
      </div>
    );
  }

  const projetos = data?.projetos || [];
  const obras = data?.obras || [];
  const aprovacoes = data?.aprovacoesPendentes || [];
  const visitas = data?.visitasSemana || [];

  const obrasAtrasadas = obras.filter((o: any) => o.diasAtraso > 0);
  const orcTotalPrev = obras.reduce((a: number, o: any) => a + (o.orcamentoPrevisto || 0), 0);
  const orcTotalReal = obras.reduce((a: number, o: any) => a + (o.valorRealizado || 0), 0);

  return (
    <div className="min-h-screen bg-[#0C0D10] text-white p-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 bg-[#D4A853]/10 border border-[#D4A853]/30 rounded-xl flex items-center justify-center">
              <span className="text-[#D4A853] font-black text-sm">R</span>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Rabisco Arquitetura</h1>
              <p className="text-xs text-zinc-500">Central de Gestão — Projetos e Obras</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/rabisco/projetos" className="px-4 py-2 bg-[#D4A853]/10 hover:bg-[#D4A853]/20 border border-[#D4A853]/30 text-[#D4A853] text-sm font-semibold rounded-lg transition-colors flex items-center gap-2">
            <ClipboardList className="w-4 h-4" /> Projetos
          </Link>
          <Link href="/rabisco/obras" className="px-4 py-2 bg-[#D4A853] hover:bg-[#D4A853]/90 text-black text-sm font-bold rounded-lg transition-colors flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Obras
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Projetos Ativos", value: projetos.length, icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { label: "Obras em Andamento", value: obras.length, icon: Building2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Obras com Atraso", value: obrasAtrasadas.length, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
          { label: "Aprovações Pendentes", value: aprovacoes.length, icon: CheckCircle2, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
        ].map(k => (
          <div key={k.label} className={cn("rounded-xl border p-4 flex items-center gap-4", k.bg, k.border)}>
            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", k.bg)}>
              <k.icon className={cn("w-5 h-5", k.color)} />
            </div>
            <div>
              <p className="text-2xl font-black">{k.value}</p>
              <p className="text-xs text-zinc-400">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="col-span-2 bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><DollarSign className="w-4 h-4 text-[#D4A853]" /> Orçamento vs Realizado (Obras Ativas)</h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Orçamento Total</p>
              <p className="text-xl font-black text-white">R$ {(orcTotalPrev / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Realizado</p>
              <p className="text-xl font-black text-emerald-400">R$ {(orcTotalReal / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Saldo</p>
              <p className="text-xl font-black text-blue-400">R$ {((orcTotalPrev - orcTotalReal) / 1000).toFixed(0)}k</p>
            </div>
          </div>
          <ProgressBar value={orcTotalPrev > 0 ? (orcTotalReal / orcTotalPrev) * 100 : 0} color="bg-[#D4A853]" />
          <p className="text-[10px] text-zinc-500 mt-1">{orcTotalPrev > 0 ? ((orcTotalReal / orcTotalPrev) * 100).toFixed(1) : 0}% do orçamento executado</p>
        </div>

        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-4"><Calendar className="w-4 h-4 text-[#D4A853]" /> Visitas desta Semana</h2>
          {visitas.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-4">Nenhuma visita agendada</p>
          ) : (
            <div className="space-y-2">
              {visitas.map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg">
                  <div className="w-8 h-8 bg-[#D4A853]/10 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#D4A853]" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold capitalize">{v.tipo}</p>
                    <p className="text-[10px] text-zinc-400">{new Date(v.dataAgendada).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projetos Ativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><ClipboardList className="w-4 h-4 text-blue-400" /> Projetos Ativos</h2>
            <Link href="/rabisco/projetos" className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">Ver todos <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {projetos.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">Nenhum projeto ativo</p>
          ) : (
            <div className="space-y-3">
              {projetos.slice(0, 5).map((p: any) => (
                <Link key={p.id} href={`/rabisco/projetos/${p.id}`} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{p.nome}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{p.etapaAtual || p.status}</p>
                    <div className="mt-1.5">
                      <ProgressBar value={p.percentualAvanco} color="bg-blue-500" />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-blue-400">{p.percentualAvanco}%</p>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Obras em Andamento */}
        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-emerald-400" /> Obras em Andamento</h2>
            <Link href="/rabisco/obras" className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">Ver todas <ChevronRight className="w-3 h-3" /></Link>
          </div>
          {obras.length === 0 ? (
            <p className="text-xs text-zinc-500 text-center py-6">Nenhuma obra ativa</p>
          ) : (
            <div className="space-y-3">
              {obras.slice(0, 5).map((o: any) => (
                <Link key={o.id} href={`/rabisco/obras/${o.id}`} className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border", o.diasAtraso > 0 ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
                    <Building2 className={cn("w-5 h-5", o.diasAtraso > 0 ? "text-red-400" : "text-emerald-400")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{o.nome}</p>
                      {o.diasAtraso > 0 && <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded border border-red-500/20 shrink-0">+{o.diasAtraso}d</span>}
                    </div>
                    <p className="text-[10px] text-zinc-500 truncate">{o.etapaAtual || "Em execução"}</p>
                    <div className="flex gap-2 mt-1.5">
                      <div className="flex-1">
                        <ProgressBar value={o.percentualFisico} color={o.diasAtraso > 0 ? "bg-red-500" : "bg-emerald-500"} />
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-sm font-bold", o.diasAtraso > 0 ? "text-red-400" : "text-emerald-400")}>{o.percentualFisico}%</p>
                    <p className="text-[10px] text-zinc-500">Físico</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aprovações Pendentes */}
      {aprovacoes.length > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 mb-6">
          <h2 className="font-bold text-sm flex items-center gap-2 mb-4 text-amber-400">
            <AlertTriangle className="w-4 h-4" /> {aprovacoes.length} Aprovação(ões) Aguardando Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aprovacoes.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold capitalize">{a.tipo.replace("_", " ")}: {a.item}</p>
                  <p className="text-[10px] text-zinc-400">{a.clienteNome}</p>
                  <p className="text-[10px] text-zinc-500">{new Date(a.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/rabisco/crm", label: "CRM e Funil", icon: Users, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
          { href: "/rabisco/kanban", label: "Kanban", icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { href: "/whatsapp", label: "WhatsApp IA", icon: MessageSquare, color: "text-green-400", bg: "bg-green-500/10", border: "border-green-500/20" },
          { href: "/rabisco/projetos", label: "Projetos", icon: Package, color: "text-[#D4A853]", bg: "bg-[#D4A853]/10", border: "border-[#D4A853]/30" },
        ].map(n => (
          <Link key={n.href} href={n.href} className={cn("p-4 rounded-xl border flex items-center gap-3 hover:brightness-110 transition-all group", n.bg, n.border)}>
            <n.icon className={cn("w-5 h-5 shrink-0", n.color)} />
            <span className="text-sm font-semibold">{n.label}</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-500 ml-auto group-hover:text-white transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
