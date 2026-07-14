"use client";

import { motion } from "framer-motion";
import { TrendingUp, Package, Users, CheckSquare, ArrowUpRight, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const secondaryKpis = [
  { id: "stock",  label: "Produtos críticos", value: "3",  icon: Package,     color: "text-amber-500", bg: "bg-amber-500/10", href: "/estoque" },
  { id: "leads",  label: "Leads quentes",     value: "18", icon: Users,       color: "text-blue-500", bg: "bg-blue-500/10", href: "/clientes" },
  { id: "tasks",  label: "Tarefas vencidas",  value: "5",  icon: CheckSquare, color: "text-destructive", bg: "bg-destructive/10", href: "/tarefas" },
];

const sparkData = [30, 45, 25, 60, 40, 75, 50, 85, 65, 95, 80, 100];

export function KPIGrid() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.12, duration: 0.4 }}
      className="mb-12"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* KPI Hero — Receita */}
        <Link href="/financeiro" className="lg:col-span-2 group block h-full">
          <div className="bg-card rounded-[20px] p-6 lg:p-7 border border-border hover:border-primary/30 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(109,74,255,0.08)] dark:shadow-none relative flex flex-col justify-between h-full overflow-hidden">
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowUpRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-[10px] bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-[14px] font-semibold text-muted-foreground">Receita mensal prevista</span>
              </div>

              <div className="flex items-end gap-4 mb-2">
                <span className="text-[44px] lg:text-[52px] font-bold tracking-tight text-foreground leading-none">
                  R$&nbsp;84.500
                </span>
                <span className="flex items-center gap-1 text-[13px] font-bold text-green-500 bg-green-500/10 px-2.5 py-1 rounded-md mb-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />+8%
                </span>
              </div>
              <p className="text-[13px] text-muted-foreground/80 font-medium flex items-center gap-1.5 mb-6">
                Comparado com o mês anterior (R$ 78.200)
              </p>
            </div>

            <div className="mt-auto">
              <div className="flex items-center justify-between text-[13px] font-semibold text-muted-foreground mb-2">
                <span className="flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-muted-foreground/60" />
                  R$ 15.500 restantes para a meta de R$ 100.000
                </span>
                <span className="text-foreground">84%</span>
              </div>
              
              <div className="h-2 bg-muted rounded-full overflow-hidden mb-6">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  transition={{ delay: 0.4, duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
                />
              </div>

              {/* Mini sparkline */}
              <div className="flex items-end gap-1.5 h-12">
                {sparkData.map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-green-500/15 group-hover:bg-green-500/30 transition-colors rounded-t-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </Link>

        {/* Secondary KPIs */}
        <div className="flex flex-col gap-6 h-full">
          {secondaryKpis.map((kpi, i) => {
            const Icon = kpi.icon;
            return (
              <Link key={kpi.id} href={kpi.href} className="group flex-1">
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.06 }}
                  className="bg-card rounded-[20px] p-5 lg:p-6 border border-border hover:border-muted-foreground/40 transition-all duration-300 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)] dark:shadow-none h-full flex items-center justify-between"
                >
                  <div className="flex flex-col justify-center h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", kpi.bg)}>
                        <Icon className={cn("w-3.5 h-3.5", kpi.color)} />
                      </div>
                      <p className="text-[13px] font-semibold text-muted-foreground">{kpi.label}</p>
                    </div>
                    <span className="text-[32px] font-bold tracking-tight text-foreground leading-none">
                      {kpi.value}
                    </span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-muted-foreground transition-colors self-start" />
                </motion.div>
              </Link>
            );
          })}
        </div>

      </div>
    </motion.div>
  );
}
