"use client";
import { useState, useEffect } from "react";
import { Building2, ClipboardList, AlertTriangle, Clock, TrendingUp, CheckCircle2, Calendar, DollarSign, Users, Zap, ChevronRight, ArrowUpRight, Package, MessageSquare } from "lucide-react";
import { getDashboardRabisco } from "@/app/actions/rabisco";
import Link from "next/link";
import { cn } from "@/lib/utils";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    briefing: "bg-purple-50 text-purple-700 border-purple-200",
    layout: "bg-blue-50 text-blue-700 border-blue-200",
    projeto3D: "bg-cyan-50 text-cyan-700 border-cyan-200",
    detalhamento: "bg-indigo-50 text-indigo-700 border-indigo-200",
    orcamento: "bg-amber-50 text-amber-700 border-amber-200",
    execucao: "bg-emerald-50 text-emerald-700 border-emerald-200",
    entrega: "bg-green-50 text-green-700 border-green-200",
    garantia: "bg-teal-50 text-teal-700 border-teal-200",
    em_execucao: "bg-emerald-50 text-emerald-700 border-emerald-200",
    nao_iniciada: "bg-slate-100 text-slate-700 border-slate-200",
    pausada: "bg-orange-50 text-orange-700 border-orange-200",
  };
  const labels: Record<string, string> = {
    briefing: "Briefing", layout: "Layout", projeto3D: "Projeto 3D",
    detalhamento: "Detalhamento", orcamento: "Orçamento", execucao: "Em Execução",
    entrega: "Entrega", garantia: "Garantia", em_execucao: "Em Execução",
    nao_iniciada: "Não Iniciada", pausada: "Pausada",
  };
  return (
    <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border", map[status] || "bg-slate-100 text-slate-700 border-slate-200")}>
      {labels[status] || status}
    </span>
  );
}

function ProgressBar({ value, color = "bg-emerald-500" }: { value: number; color?: string }) {
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className={cn("h-2 rounded-full transition-all", color)} style={{ width: `${Math.min(value, 100)}%` }} />
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#D4A853] border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm font-medium">Carregando Rabisco ERP...</p>
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
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-[#D4A853]/15 border border-[#D4A853]/30 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-[#B38734] font-black text-lg">R</span>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Rabisco Arquitetura</h1>
              <p className="text-xs font-medium text-slate-500">Central Executiva de Gestão — Projetos & Obras</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/rabisco/projetos" className="px-4 py-2.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-sm font-bold rounded-xl shadow-sm transition-all flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-slate-600" /> Projetos
          </Link>
          <Link href="/rabisco/obras" className="px-4 py-2.5 bg-[#D4A853] hover:bg-[#c29845] text-slate-950 text-sm font-black rounded-xl shadow-md transition-all flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Obras
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Projetos Ativos", value: projetos.length, icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
          { label: "Obras em Andamento", value: obras.length, icon: Building2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { label: "Obras com Atraso", value: obrasAtrasadas.length, icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
          { label: "Aprovações Pendentes", value: aprovacoes.length, icon: CheckCircle2, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
        ].map(k => (
          <div key={k.label} className={cn("bg-white rounded-2xl border p-5 shadow-sm flex items-center gap-4 transition-all hover:shadow-md", k.border)}>
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0", k.bg)}>
              <k.icon className={cn("w-6 h-6", k.color)} />
            </div>
            <div>
              <p className="text-3xl font-black text-slate-900">{k.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-[#B38734]" /> Orçamento vs Realizado (Obras Ativas)
            </h2>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-5 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Orçamento Total</p>
              <p className="text-2xl font-black text-slate-900">R$ {(orcTotalPrev / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Realizado</p>
              <p className="text-2xl font-black text-emerald-600">R$ {(orcTotalReal / 1000).toFixed(0)}k</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider mb-1">Saldo</p>
              <p className="text-2xl font-black text-blue-600">R$ {((orcTotalPrev - orcTotalReal) / 1000).toFixed(0)}k</p>
            </div>
          </div>
          <ProgressBar value={orcTotalPrev > 0 ? (orcTotalReal / orcTotalPrev) * 100 : 0} color="bg-[#D4A853]" />
          <p className="text-xs font-semibold text-slate-500 mt-2">{orcTotalPrev > 0 ? ((orcTotalReal / orcTotalPrev) * 100).toFixed(1) : 0}% do orçamento executado</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-base text-slate-900 flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5 text-[#B38734]" /> Visitas desta Semana
          </h2>
          {visitas.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Nenhuma visita agendada</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {visitas.map((v: any) => (
                <div key={v.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="w-9 h-9 bg-[#D4A853]/15 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-[#B38734]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 capitalize">{v.tipo}</p>
                    <p className="text-[11px] text-slate-500">{new Date(v.dataAgendada).toLocaleDateString("pt-BR", { weekday: "short", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Projetos & Obras lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Projetos */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600" /> Projetos Ativos
            </h2>
            <Link href="/rabisco/projetos" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
              Ver todos <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {projetos.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Nenhum projeto ativo</p>
          ) : (
            <div className="space-y-3">
              {projetos.slice(0, 5).map((p: any) => (
                <Link key={p.id} href={`/rabisco/projetos/${p.id}`} className="flex items-center gap-4 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 group">
                  <div className="w-10 h-10 bg-blue-100 border border-blue-200 rounded-xl flex items-center justify-center shrink-0">
                    <ClipboardList className="w-5 h-5 text-blue-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{p.nome}</p>
                    <p className="text-xs text-slate-500 truncate">{p.etapaAtual || p.status}</p>
                    <div className="mt-2">
                      <ProgressBar value={p.percentualAvanco} color="bg-blue-600" />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-black text-blue-600">{p.percentualAvanco}%</p>
                    <StatusBadge status={p.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Obras */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" /> Obras em Andamento
            </h2>
            <Link href="/rabisco/obras" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors">
              Ver todas <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          {obras.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-8">Nenhuma obra ativa</p>
          ) : (
            <div className="space-y-3">
              {obras.slice(0, 5).map((o: any) => (
                <Link key={o.id} href={`/rabisco/obras/${o.id}`} className="flex items-center gap-4 p-3.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-100 group">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", o.diasAtraso > 0 ? "bg-rose-100 border-rose-200" : "bg-emerald-100 border-emerald-200")}>
                    <Building2 className={cn("w-5 h-5", o.diasAtraso > 0 ? "text-rose-600" : "text-emerald-600")} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate group-hover:text-emerald-600 transition-colors">{o.nome}</p>
                      {o.diasAtraso > 0 && <span className="text-[9px] font-black bg-rose-100 text-rose-700 px-2 py-0.5 rounded-md border border-rose-200 shrink-0">+{o.diasAtraso}d</span>}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{o.etapaAtual || "Em execução"}</p>
                    <div className="mt-2">
                      <ProgressBar value={o.percentualFisico} color={o.diasAtraso > 0 ? "bg-rose-500" : "bg-emerald-500"} />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={cn("text-sm font-black", o.diasAtraso > 0 ? "text-rose-600" : "text-emerald-600")}>{o.percentualFisico}%</p>
                    <p className="text-[10px] text-slate-400 font-bold">Físico</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Aprovações Pendentes */}
      {aprovacoes.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8 shadow-sm">
          <h2 className="font-bold text-base flex items-center gap-2 mb-4 text-amber-800">
            <AlertTriangle className="w-5 h-5 text-amber-600" /> {aprovacoes.length} Aprovação(ões) Aguardando Cliente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {aprovacoes.map((a: any) => (
              <div key={a.id} className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-amber-200 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-900 capitalize">{a.tipo.replace("_", " ")}: {a.item}</p>
                  <p className="text-[11px] font-semibold text-slate-600">{a.clienteNome}</p>
                  <p className="text-[10px] text-slate-400">{new Date(a.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { href: "/rabisco/crm", label: "CRM & Comercial", icon: Users, color: "text-purple-600", bg: "bg-purple-50", border: "border-purple-200" },
          { href: "/rabisco/kanban", label: "Kanban da Equipe", icon: ClipboardList, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200" },
          { href: "/whatsapp", label: "WhatsApp & IA", icon: MessageSquare, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
          { href: "/rabisco/projetos", label: "Projetos de Arq.", icon: Package, color: "text-[#B38734]", bg: "bg-[#D4A853]/15", border: "border-[#D4A853]/30" },
        ].map(n => (
          <Link key={n.href} href={n.href} className={cn("p-5 rounded-2xl border flex items-center gap-4 bg-white hover:shadow-md transition-all group", n.border)}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", n.bg)}>
              <n.icon className={cn("w-5 h-5", n.color)} />
            </div>
            <span className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{n.label}</span>
            <ArrowUpRight className="w-4 h-4 text-slate-400 ml-auto group-hover:text-slate-900 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}
