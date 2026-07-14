"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users, ArrowLeft, Zap, Sparkles, ArrowUpRight,
  Phone, Mail, Clock, Star, AlertCircle, TrendingUp,
  Search, Filter, UserCheck, UserX, UserPlus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLayout } from "@/components/layout/LayoutProvider";
import type { ClienteExecutivo } from "@/ai/orchestrator/executive";
import { cn } from "@/lib/utils";

interface Props { clientes: ClienteExecutivo[] }

const RISCO_CONFIG = {
  VIP:   { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30", icon: Star, label: "VIP" },
  Ativo: { bg: "bg-blue-500/10",    text: "text-blue-500",    border: "border-blue-500/30",    icon: UserCheck, label: "Ativo" },
  Novo:  { bg: "bg-purple-500/10",  text: "text-purple-500",  border: "border-purple-500/30",  icon: UserPlus, label: "Lead" },
  Churn: { bg: "bg-red-500/10",     text: "text-red-500",     border: "border-red-500/30",     icon: UserX, label: "Churn Risk" },
};

const PROB_COLOR = {
  "Muito Alta": "text-emerald-500",
  "Alta": "text-blue-500",
  "Média": "text-orange-500",
  "Baixa": "text-red-500",
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 70 ? "bg-emerald-500" : score >= 40 ? "bg-blue-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${score}%` }} />
      </div>
      <span className="text-xs font-black text-foreground w-8 text-right">{score}</span>
    </div>
  );
}

export function ClientesIntelView({ clientes }: Props) {
  const router = useRouter();
  const { openIAPanel } = useLayout();
  const [filtro, setFiltro] = useState<"todos" | "VIP" | "Churn" | "Novo" | "Ativo">("todos");
  const [busca, setBusca] = useState("");
  const [ordenar, setOrdenar] = useState<"score" | "probabilidade" | "valor" | "dias">("score");

  const clientesFiltrados = clientes
    .filter(c => filtro === "todos" || c.risco === filtro)
    .filter(c => c.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => {
      if (ordenar === "score") return b.score - a.score;
      if (ordenar === "valor") return b.totalComprado - a.totalComprado;
      if (ordenar === "dias") return b.diasSemContato - a.diasSemContato;
      const probOrd: Record<string, number> = { "Muito Alta": 0, "Alta": 1, "Média": 2, "Baixa": 3 };
      return (probOrd[a.probabilidadeRecompra] ?? 3) - (probOrd[b.probabilidadeRecompra] ?? 3);
    });

  const kpis = {
    vip: clientes.filter(c => c.risco === "VIP").length,
    churn: clientes.filter(c => c.risco === "Churn").length,
    leads: clientes.filter(c => c.risco === "Novo").length,
    receita: clientes.filter(c => c.risco === "VIP").reduce((a, c) => a + c.ticketMedio, 0),
  };

  const handleMagisAction = (prompt: string) => {
    openIAPanel();
    setTimeout(() => window.dispatchEvent(new CustomEvent("magis:send", { detail: prompt })), 300);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-10 h-10 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Para quem Vender</h1>
            <p className="text-sm text-muted-foreground">Matriz de clientes por engajamento, risco e oportunidade</p>
          </div>
        </div>
        <Button
          onClick={() => handleMagisAction("Analise minha base de clientes e me diga quem devo priorizar esta semana e por quê")}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Analisar com IA
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Clientes VIP", value: kpis.vip, icon: Star, bg: "bg-emerald-500/10 border-emerald-500/20", color: "text-emerald-500" },
          { label: "Risco de Churn", value: kpis.churn, icon: AlertCircle, bg: "bg-red-500/10 border-red-500/20", color: "text-red-500" },
          { label: "Leads Ativos", value: kpis.leads, icon: UserPlus, bg: "bg-purple-500/10 border-purple-500/20", color: "text-purple-500" },
          { label: "Ticket Médio VIP", value: `R$ ${kpis.receita.toLocaleString("pt-BR")}`, icon: TrendingUp, bg: "bg-blue-500/10 border-blue-500/20", color: "text-blue-500" },
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
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={busca} onChange={e => setBusca(e.target.value)} placeholder="Buscar cliente..."
            className="pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["todos", "VIP", "Ativo", "Churn", "Novo"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
                filtro === f ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40")}>
              {f === "todos" ? "Todos" : f}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          {([{ key: "score", label: "Score" }, { key: "probabilidade", label: "Recompra" }, { key: "valor", label: "Valor" }, { key: "dias", label: "Inativo" }] as const).map(o => (
            <button key={o.key} onClick={() => setOrdenar(o.key)}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
                ordenar === o.key ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:border-foreground/40")}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {clientesFiltrados.length === 0 && (
          <div className="col-span-full py-12 text-center text-muted-foreground text-sm">Nenhum cliente encontrado.</div>
        )}
        {clientesFiltrados.map((c, i) => {
          const rc = RISCO_CONFIG[c.risco];
          const RcIcon = rc.icon;
          return (
            <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className={cn("bg-card rounded-2xl border p-4 flex flex-col gap-3 hover:shadow-md transition-all group", rc.border)}>
              {/* Header do Card */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center border", rc.bg, rc.border)}>
                    <RcIcon className={cn("w-4 h-4", rc.text)} />
                  </div>
                  <div>
                    <p className="font-black text-sm text-foreground leading-tight">{c.nome}</p>
                    {c.segmento && <p className="text-[10px] text-muted-foreground">{c.segmento}</p>}
                  </div>
                </div>
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", rc.bg, rc.text, rc.border)}>
                  {rc.label}
                </span>
              </div>

              {/* Score */}
              <div>
                <p className="text-[10px] text-muted-foreground font-semibold mb-1">Score de Engajamento</p>
                <ScoreBar score={c.score} />
              </div>

              {/* Métricas */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-muted/30 rounded-xl p-2">
                  <p className="text-muted-foreground text-[10px]">Total Comprado</p>
                  <p className="font-black text-foreground">R$ {c.totalComprado.toLocaleString("pt-BR")}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-2">
                  <p className="text-muted-foreground text-[10px]">Ticket Médio</p>
                  <p className="font-black text-foreground">R$ {c.ticketMedio.toLocaleString("pt-BR")}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-2">
                  <p className="text-muted-foreground text-[10px]">Recompra</p>
                  <p className={cn("font-black", PROB_COLOR[c.probabilidadeRecompra])}>{c.probabilidadeRecompra}</p>
                </div>
                <div className="bg-muted/30 rounded-xl p-2">
                  <p className="text-muted-foreground text-[10px]">Sem contato</p>
                  <p className={cn("font-black", c.diasSemContato > 30 ? "text-red-500" : "text-foreground")}>{c.diasSemContato === 999 ? "Nunca" : `${c.diasSemContato}d`}</p>
                </div>
              </div>

              {/* Contato + Ação */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <div className="flex gap-1.5 flex-1">
                  {c.telefone && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{c.melhorCanal}</span>}
                  {c.melhorHorario && <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{c.melhorHorario}</span>}
                </div>
                <button
                  onClick={() => handleMagisAction(`Analise o cliente "${c.nome}" (Score: ${c.score}, ${c.diasSemContato}d sem contato, R$${c.totalComprado} em compras). O que devo fazer com ele agora?`)}
                  className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all"
                  title="Consultar IA">
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </div>

              {c.produtosRecomendados.length > 0 && (
                <div className="text-[10px] text-muted-foreground">
                  <span className="font-bold text-foreground">Cross-sell:</span> {c.produtosRecomendados.join(", ")}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Ações IA */}
      <div className="bg-gradient-to-br from-emerald-500/5 to-background border border-emerald-500/20 rounded-2xl p-5">
        <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-500" /> Ações Recomendadas pela IA
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { prompt: "Listar clientes VIP que não compram há mais de 30 dias e sugerir abordagem", label: "Reativar VIPs Inativos" },
            { prompt: "Quais leads tenho com maior score e que ainda não fecharam negócio?", label: "Leads Quentes Pendentes" },
            { prompt: "Agendar follow-up automático para os 5 clientes com maior risco de churn", label: "Follow-up Anti-Churn" },
            { prompt: "Quais clientes posso fazer up-sell baseado no histórico de compras?", label: "Up-sell Inteligente" },
            { prompt: "Gere uma análise de segmento dos meus principais clientes", label: "Análise de Segmento" },
            { prompt: "Criar tarefa de contato para todos os clientes inativos há mais de 45 dias", label: "Campanha de Reativação" },
          ].map((a, i) => (
            <button key={i} onClick={() => handleMagisAction(a.prompt)}
              className="flex items-center justify-between p-3 bg-card hover:bg-muted border border-border rounded-xl text-left text-xs font-bold text-foreground transition-all hover:border-emerald-500/30 group">
              <span>{a.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-emerald-500 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
