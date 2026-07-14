"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays, ArrowLeft, Zap, Sparkles, ArrowUpRight,
  AlertTriangle, Clock, UserX, Package, Megaphone, CheckCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLayout } from "@/components/layout/LayoutProvider";
import type { OportunidadeExecutiva } from "@/ai/orchestrator/executive";
import { cn } from "@/lib/utils";

interface Props { oportunidades: OportunidadeExecutiva[] }

const TIPO_CONFIG: Record<OportunidadeExecutiva["tipo"], { icon: any; color: string; bg: string; label: string }> = {
  lead_esquecido:        { icon: UserX,        color: "text-purple-500",  bg: "bg-purple-500/10 border-purple-500/20",  label: "Lead Esquecido" },
  follow_up_atrasado:    { icon: Clock,         color: "text-orange-500",  bg: "bg-orange-500/10 border-orange-500/20",  label: "Follow-up Atrasado" },
  tarefa_critica:        { icon: AlertTriangle, color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20",         label: "Tarefa Crítica" },
  contrato_vencendo:     { icon: CalendarDays,  color: "text-yellow-500",  bg: "bg-yellow-500/10 border-yellow-500/20",  label: "Contrato Vencendo" },
  campanha_urgente:      { icon: Megaphone,     color: "text-blue-500",    bg: "bg-blue-500/10 border-blue-500/20",       label: "Campanha Urgente" },
  cliente_inativo_vip:   { icon: UserX,         color: "text-red-500",     bg: "bg-red-500/10 border-red-500/20",         label: "VIP Inativo" },
};

const PRIORIDADE_CONFIG = {
  CRITICA: { bg: "bg-red-500",     text: "text-white",    label: "CRÍTICA" },
  ALTA:    { bg: "bg-orange-500",  text: "text-white",    label: "ALTA" },
  MEDIA:   { bg: "bg-blue-500",    text: "text-white",    label: "MÉDIA" },
};

export function OportunidadesIntelView({ oportunidades }: Props) {
  const router = useRouter();
  const { openIAPanel } = useLayout();
  const [executadas, setExecutadas] = useState<Set<number>>(new Set());
  const [filtro, setFiltro] = useState<"todas" | "CRITICA" | "ALTA" | "MEDIA">("todas");

  const oportunidadesFiltradas = oportunidades.filter(o =>
    filtro === "todas" || o.prioridade === filtro
  );

  const kpis = {
    criticas: oportunidades.filter(o => o.prioridade === "CRITICA").length,
    altas: oportunidades.filter(o => o.prioridade === "ALTA").length,
    total: oportunidades.length,
    executadas: executadas.size,
  };

  const handleMagisAction = (prompt: string) => {
    openIAPanel();
    setTimeout(() => window.dispatchEvent(new CustomEvent("magis:send", { detail: prompt })), 300);
  };

  const handleExecutar = (idx: number, oportunidade: OportunidadeExecutiva) => {
    handleMagisAction(oportunidade.acao);
    setExecutadas(prev => new Set([...prev, idx]));
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Quando Agir</h1>
            <p className="text-sm text-muted-foreground">Central de oportunidades e ações prioritárias em tempo real</p>
          </div>
        </div>
        <Button
          onClick={() => handleMagisAction("Analise todas as oportunidades críticas do dia e me dê um plano de ação priorizado")}
          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-600/20 hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Plano do Dia com IA
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Ações Críticas", value: kpis.criticas, icon: AlertTriangle, bg: "bg-red-500/10 border-red-500/20", color: "text-red-500" },
          { label: "Prioridade Alta", value: kpis.altas, icon: Clock, bg: "bg-orange-500/10 border-orange-500/20", color: "text-orange-500" },
          { label: "Total de Oportunidades", value: kpis.total, icon: Zap, bg: "bg-blue-500/10 border-blue-500/20", color: "text-blue-500" },
          { label: "Executadas", value: kpis.executadas, icon: CheckCheck, bg: "bg-emerald-500/10 border-emerald-500/20", color: "text-emerald-500" },
        ].map((k, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className={cn("bg-card rounded-2xl border p-4 flex items-center gap-3", k.bg)}>
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", k.bg)}>
              <k.icon className={cn("w-5 h-5", k.color)} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">{k.label}</p>
              <p className="text-xl font-black text-foreground">{k.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        {(["todas", "CRITICA", "ALTA", "MEDIA"] as const).map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={cn("px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
              filtro === f ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40")}>
            {f === "todas" ? "Todas" : f}
          </button>
        ))}
      </div>

      {/* Lista de Oportunidades */}
      <div className="flex flex-col gap-3">
        {oportunidadesFiltradas.length === 0 && (
          <div className="py-20 text-center">
            <CheckCheck className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
            <p className="text-lg font-black text-foreground">Tudo em dia!</p>
            <p className="text-sm text-muted-foreground">Nenhuma oportunidade crítica identificada.</p>
          </div>
        )}
        {oportunidadesFiltradas.map((o, i) => {
          const tc = TIPO_CONFIG[o.tipo];
          const pc = PRIORIDADE_CONFIG[o.prioridade];
          const TcIcon = tc.icon;
          const isExecutada = executadas.has(i);

          return (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              className={cn(
                "bg-card rounded-2xl border p-4 flex items-start gap-4 transition-all",
                isExecutada ? "opacity-50 border-emerald-500/20 bg-emerald-500/5" : "hover:shadow-md",
                o.prioridade === "CRITICA" && !isExecutada ? "border-red-500/30" : "border-border"
              )}>
              
              {/* Ícone */}
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border", tc.bg)}>
                {isExecutada ? <CheckCheck className="w-5 h-5 text-emerald-500" /> : <TcIcon className={cn("w-5 h-5", tc.color)} />}
              </div>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className={cn("text-[10px] font-black px-2 py-0.5 rounded-full", pc.bg, pc.text)}>
                    {pc.label}
                  </span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", tc.bg, tc.color)}>
                    {tc.label}
                  </span>
                  {o.prazoHoras !== undefined && (
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {o.prazoHoras === 0 ? "Vencido" : `Agir em ${o.prazoHoras}h`}
                    </span>
                  )}
                </div>
                <p className="font-black text-sm text-foreground">{o.titulo}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{o.descricao}</p>

                {!isExecutada && (
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleExecutar(i, o)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary/90 transition-all shadow-sm active:scale-95"
                    >
                      <Zap className="w-3 h-3" /> Executar com IA
                    </button>
                    <button
                      onClick={() => handleMagisAction(`Me explique melhor esta oportunidade: "${o.titulo}". ${o.descricao}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold border border-border transition-all"
                    >
                      Analisar
                    </button>
                  </div>
                )}
                {isExecutada && (
                  <p className="text-xs text-emerald-500 font-bold mt-2 flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" /> Encaminhada para a IA
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Ações IA */}
      <div className="bg-gradient-to-br from-purple-500/5 to-background border border-purple-500/20 rounded-2xl p-5">
        <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-500" /> Comandos de Ação Rápida
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { prompt: "Quais tarefas estão atrasadas e quem é o responsável por cada uma?", label: "Tarefas Atrasadas" },
            { prompt: "Liste todos os leads que não foram contatados nos últimos 7 dias", label: "Leads Esquecidos" },
            { prompt: "Criar tarefas de follow-up para os 3 clientes VIP mais inativos", label: "Follow-up VIPs" },
            { prompt: "Quais campanhas de marketing precisam ser iniciadas urgentemente?", label: "Campanhas Urgentes" },
            { prompt: "Mostre os contratos que vencem nos próximos 30 dias", label: "Contratos Vencendo" },
            { prompt: "Gere um plano de ação priorizado para as próximas 48 horas", label: "Plano 48h" },
          ].map((a, i) => (
            <button key={i} onClick={() => handleMagisAction(a.prompt)}
              className="flex items-center justify-between p-3 bg-card hover:bg-muted border border-border rounded-xl text-left text-xs font-bold text-foreground transition-all hover:border-purple-500/30 group">
              <span>{a.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-purple-500 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
