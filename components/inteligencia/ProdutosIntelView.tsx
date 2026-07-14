"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  PackageSearch, TrendingUp, TrendingDown, Minus,
  AlertTriangle, CheckCircle, ArrowLeft, Zap,
  BarChart3, ShoppingCart, DollarSign, Sparkles,
  ArrowUpRight, Filter, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useLayout } from "@/components/layout/LayoutProvider";
import type { ProdutoExecutivo } from "@/ai/orchestrator/executive";
import { cn } from "@/lib/utils";

interface Props { produtos: ProdutoExecutivo[] }

const CURVA_COLORS = {
  A: { bg: "bg-emerald-500/10", text: "text-emerald-500", border: "border-emerald-500/30", label: "Curva A" },
  B: { bg: "bg-blue-500/10",    text: "text-blue-500",    border: "border-blue-500/30",    label: "Curva B" },
  C: { bg: "bg-gray-500/10",    text: "text-muted-foreground", border: "border-gray-500/20", label: "Curva C" },
};

const STATUS_COLORS = {
  ruptura:  { bg: "bg-red-500/10",    text: "text-red-500",    label: "⛔ Ruptura" },
  critico:  { bg: "bg-orange-500/10", text: "text-orange-500", label: "⚠ Crítico" },
  ok:       { bg: "bg-emerald-500/10",text: "text-emerald-500",label: "✅ OK" },
  excesso:  { bg: "bg-purple-500/10", text: "text-purple-500", label: "📦 Excesso" },
};

function TendenciaIcon({ t }: { t: ProdutoExecutivo["tendencia"] }) {
  if (t === "crescimento") return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
  if (t === "queda") return <TrendingDown className="w-3.5 h-3.5 text-red-500" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

export function ProdutosIntelView({ produtos }: Props) {
  const router = useRouter();
  const { openIAPanel } = useLayout();
  const [filtro, setFiltro] = useState<"todos" | "A" | "B" | "C">("todos");
  const [busca, setBusca] = useState("");
  const [ordenar, setOrdenar] = useState<"faturamento" | "margem" | "giro" | "risco">("faturamento");

  const produtosFiltrados = produtos
    .filter(p => filtro === "todos" || p.curva === filtro)
    .filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()))
    .sort((a, b) => {
      if (ordenar === "faturamento") return b.faturamento90d - a.faturamento90d;
      if (ordenar === "margem") return b.margem - a.margem;
      if (ordenar === "giro") return b.giro - a.giro;
      if (ordenar === "risco") {
        const ord = { ruptura: 0, critico: 1, ok: 2, excesso: 3 };
        return ord[a.statusEstoque] - ord[b.statusEstoque];
      }
      return 0;
    });

  const kpis = {
    receitaTotal: produtos.reduce((a, p) => a + p.receitaEstimadaMes, 0),
    curvaA: produtos.filter(p => p.curva === "A").length,
    emRuptura: produtos.filter(p => p.statusEstoque === "ruptura" || p.statusEstoque === "critico").length,
    margemMedia: produtos.length > 0 ? Math.round(produtos.reduce((a, p) => a + p.margem, 0) / produtos.length) : 0,
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
          <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
            <PackageSearch className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">O que Vender</h1>
            <p className="text-sm text-muted-foreground">Inteligência preditiva de produtos — dados em tempo real</p>
          </div>
        </div>
        <Button
          onClick={() => handleMagisAction("Analise meu portfólio de produtos e me dê um plano de vendas estratégico para este mês")}
          className="gap-2 bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          Analisar com IA
        </Button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Receita Estimada/Mês", value: `R$ ${kpis.receitaTotal.toLocaleString("pt-BR")}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Produtos Curva A", value: kpis.curvaA, icon: BarChart3, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Em Risco de Ruptura", value: kpis.emRuptura, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10 border-orange-500/20" },
          { label: "Margem Média", value: `${kpis.margemMedia}%`, icon: TrendingUp, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
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
          <input
            value={busca} onChange={e => setBusca(e.target.value)}
            placeholder="Buscar produto..."
            className="pl-9 pr-4 py-2 text-sm bg-muted/50 border border-border rounded-xl outline-none focus:ring-2 focus:ring-primary/20 w-full"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {(["todos", "A", "B", "C"] as const).map(f => (
            <button key={f} onClick={() => setFiltro(f)}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
                filtro === f ? "bg-primary text-white border-primary" : "bg-card border-border text-muted-foreground hover:border-primary/40"
              )}>
              {f === "todos" ? "Todos" : `Curva ${f}`}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-muted-foreground self-center" />
          {([
            { key: "faturamento", label: "Faturamento" },
            { key: "margem", label: "Margem" },
            { key: "giro", label: "Giro" },
            { key: "risco", label: "Risco" },
          ] as const).map(o => (
            <button key={o.key} onClick={() => setOrdenar(o.key)}
              className={cn("px-3 py-1.5 text-xs font-bold rounded-xl border transition-all",
                ordenar === o.key ? "bg-foreground text-background border-foreground" : "bg-card border-border text-muted-foreground hover:border-foreground/40"
              )}>
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-0 px-4 py-3 border-b border-border bg-muted/30 text-[10px] font-black text-muted-foreground uppercase tracking-wider">
          <span>Produto</span>
          <span>Curva / Status</span>
          <span>Faturamento 90d</span>
          <span>Margem</span>
          <span>Giro</span>
          <span>Receita Est./Mês</span>
          <span>Ação IA</span>
        </div>
        <div className="divide-y divide-border">
          {produtosFiltrados.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">Nenhum produto encontrado.</div>
          )}
          {produtosFiltrados.map((p, i) => {
            const curvaC = CURVA_COLORS[p.curva];
            const statusC = STATUS_COLORS[p.statusEstoque];
            return (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_1fr_auto] gap-0 px-4 py-3 items-center hover:bg-muted/20 transition-colors group">
                <div>
                  <p className="font-bold text-sm text-foreground">{p.nome}</p>
                  {p.categoria && <p className="text-[10px] text-muted-foreground">{p.categoria}</p>}
                </div>
                <div className="flex flex-col gap-1">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border w-fit", curvaC.bg, curvaC.text, curvaC.border)}>
                    {curvaC.label}
                  </span>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full w-fit", statusC.bg, statusC.text)}>
                    {statusC.label}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <TendenciaIcon t={p.tendencia} />
                  <span className="text-sm font-bold text-foreground">R$ {p.faturamento90d.toLocaleString("pt-BR")}</span>
                </div>
                <span className={cn("text-sm font-bold", p.margem > 30 ? "text-emerald-500" : p.margem > 15 ? "text-blue-500" : "text-orange-500")}>
                  {p.margem}%
                </span>
                <span className="text-sm font-bold text-foreground">{p.giro} un</span>
                <span className="text-sm font-black text-emerald-500">R$ {p.receitaEstimadaMes.toLocaleString("pt-BR")}</span>
                <button
                  onClick={() => handleMagisAction(`Analise o produto "${p.nome}": giro ${p.giro} unidades/90d, margem ${p.margem}%, status ${p.statusEstoque}. Sugira uma estratégia de vendas.`)}
                  className="opacity-0 group-hover:opacity-100 transition-all p-1.5 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white"
                  title="Consultar IA"
                >
                  <Zap className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Ações Rápidas IA */}
      <div className="bg-gradient-to-br from-primary/5 to-background border border-primary/20 rounded-2xl p-5">
        <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" /> Ações Inteligentes Recomendadas
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { prompt: "Quais produtos da Curva A precisam de reposição urgente?", label: "Alerta de Ruptura Curva A" },
            { prompt: "Crie uma campanha de marketing para os produtos mais vendidos este mês", label: "Criar Campanha" },
            { prompt: "Quais produtos parados eu posso usar em promoção para girar o estoque?", label: "Girar Estoque Parado" },
            { prompt: "Mostre produtos com margem acima de 40% e baixo giro — oportunidade escondida", label: "Oportunidades Escondidas" },
            { prompt: "Gere um relatório executivo de produtos por categoria com recomendações estratégicas", label: "Relatório Executivo" },
            { prompt: "Quais produtos devo descontinuar e por quê?", label: "Descontinuar Produtos" },
          ].map((a, i) => (
            <button key={i} onClick={() => handleMagisAction(a.prompt)}
              className="flex items-center justify-between p-3 bg-card hover:bg-muted border border-border rounded-xl text-left text-xs font-bold text-foreground transition-all hover:border-primary/30 group">
              <span>{a.label}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
