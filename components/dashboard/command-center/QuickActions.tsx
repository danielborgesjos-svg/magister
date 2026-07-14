"use client";

import { motion } from "framer-motion";
import { CheckSquare, UserPlus, ShoppingCart, Megaphone, PackagePlus, FileText } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const actions = [
  { label: "Criar proposta",    icon: FileText,    href: "/vendas/nova",       color: "text-purple-600", bg: "bg-purple-500/8" },
  { label: "Novo cliente",      icon: UserPlus,    href: "/clientes/novo",     color: "text-blue-600",   bg: "bg-blue-500/8" },
  { label: "Nova venda",        icon: ShoppingCart,href: "/vendas/nova",       color: "text-emerald-600",bg: "bg-emerald-500/8" },
  { label: "Nova campanha",     icon: Megaphone,   href: "/campanhas/nova",    color: "text-orange-600", bg: "bg-orange-500/8" },
  { label: "Atualizar estoque", icon: PackagePlus, href: "/estoque/atualizar", color: "text-red-600",    bg: "bg-red-500/8" },
  { label: "Nova tarefa",       icon: CheckSquare, href: "/tarefas/nova",      color: "text-slate-600",  bg: "bg-slate-500/8" },
];

export function QuickActions() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.32, duration: 0.4 }}
    >
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-[15px] font-semibold text-foreground">Ações Rápidas</h2>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <Link key={i} href={action.href}>
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.34 + i * 0.04 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-[14px] border border-border/40 hover:border-border/80 hover:bg-muted/30 transition-all duration-150 group cursor-pointer active:scale-[0.98]"
              >
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", action.bg)}>
                  <Icon className={cn("w-4 h-4", action.color)} />
                </div>
                <span className="text-[13px] font-medium text-foreground/80 group-hover:text-foreground leading-tight transition-colors">
                  {action.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
