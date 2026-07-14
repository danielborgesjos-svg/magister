"use client";

import { motion } from "framer-motion";
import { TrendingUp, UserCheck, AlertOctagon, Megaphone, Clock, ChevronRight } from "lucide-react";
import { useLayout } from "@/components/layout/LayoutProvider";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  category: string;
  icon: any;
  title: string;
  description: string;
  priority: "Alta" | "Média" | "Baixa";
  time: string;
  action: string;
  prompt: string;
  color: string;
  bg: string;
}

const insights: Insight[] = [
  {
    id: "sell",
    category: "Vendas",
    icon: TrendingUp,
    title: "18 produtos com alta chance de venda",
    description: "A curva A apresentou um pico de intenção de compra nas últimas horas.",
    priority: "Alta",
    time: "10 min",
    action: "Ver análise",
    prompt: "Quais produtos da Curva A têm maior probabilidade de venda hoje?",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    id: "clients",
    category: "CRM",
    icon: UserCheck,
    title: "24 clientes aguardando contato",
    description: "Clientes com alta propensão de recompra inativos há mais de 15 dias.",
    priority: "Alta",
    time: "45 min",
    action: "Iniciar contatos",
    prompt: "Gere um plano de contato para os 24 clientes com maior propensão de recompra.",
    color: "text-green-500",
    bg: "bg-green-500/10",
  },
  {
    id: "stock",
    category: "Estoque",
    icon: AlertOctagon,
    title: "3 produtos próximos da ruptura",
    description: "Os itens mais vendidos da última semana correm risco de falta.",
    priority: "Alta",
    time: "2h",
    action: "Comprar agora",
    prompt: "Crie tarefas de reposição de estoque urgente para os produtos críticos da Curva A.",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    id: "marketing",
    category: "Marketing",
    icon: Megaphone,
    title: "2 campanhas com custo elevado",
    description: "CPA 15% acima da meta estabelecida para o mês atual.",
    priority: "Média",
    time: "4h",
    action: "Otimizar",
    prompt: "Analise o desempenho das campanhas atuais e sugira otimizações para redução de custo.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  }
];

const priorityStyle = {
  Alta:  "text-destructive bg-destructive/10",
  Média: "text-amber-500 bg-amber-500/10",
  Baixa: "text-muted-foreground bg-muted",
};

export function SuggestionCards() {
  const { openIAPanel } = useLayout();

  const handleAction = (prompt: string) => {
    openIAPanel();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("magis:send", { detail: prompt }));
    }, 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.22, duration: 0.4 }}
      className="bg-card rounded-[20px] p-6 lg:p-7 border border-border shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-none h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[18px] font-bold text-foreground mb-1">Feed Inteligente</h2>
          <p className="text-[13px] text-muted-foreground">Insights ordenados por prioridade pela IA</p>
        </div>
      </div>

      <div className="relative border-l-2 border-muted ml-4 space-y-6 pb-2">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + index * 0.07 }}
              className="relative pl-6 group"
            >
              {/* Timeline Dot */}
              <div className={cn("absolute -left-[18px] top-1 w-8 h-8 rounded-full border-4 border-card flex items-center justify-center bg-card")}>
                <div className={cn("w-full h-full rounded-full flex items-center justify-center", insight.bg)}>
                  <Icon className={cn("w-3.5 h-3.5", insight.color)} />
                </div>
              </div>

              <div className="bg-card group-hover:bg-muted/30 border border-transparent group-hover:border-border rounded-[16px] p-4 transition-all duration-200">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">{insight.category}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />{insight.time}
                    </span>
                  </div>
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-md", priorityStyle[insight.priority])}>
                    {insight.priority}
                  </span>
                </div>
                
                <h3 className="text-[14px] font-bold text-foreground mb-1">{insight.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed mb-3 pr-4">{insight.description}</p>
                
                <button
                  onClick={() => handleAction(insight.prompt)}
                  className="inline-flex items-center gap-1.5 text-[12px] font-bold text-primary hover:text-primary/80 bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  {insight.action}
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
