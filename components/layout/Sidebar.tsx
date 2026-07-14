"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, ShoppingCart, Package, Megaphone, CheckSquare,
  DollarSign, BrainCircuit, MessageCircle, BarChart3,
  Settings, HelpCircle, Zap, Calendar, Monitor, Search, Shield,
  ChevronRight, X, ClipboardList, FileText
} from "lucide-react";

import { cn, isColorDark } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "./LayoutProvider";

const navGroups = [
  {
    title: "Principal",
    items: [
      { href: "/painel",       label: "Painel Geral",   icon: Monitor },
      { href: "/inteligencia", label: "Insights IA",    icon: Search },
    ]
  },
  {
    title: "Comercial",
    items: [
      { href: "/clientes",   label: "CRM",        icon: Users },
      { href: "/vendas",     label: "Vendas",      icon: ShoppingCart },
      { href: "/campanhas",  label: "Marketing",   icon: Megaphone },
      { href: "/whatsapp",   label: "WhatsApp",    icon: MessageCircle, badge: "3" },
    ]
  },
  {
    title: "Operação",
    items: [
      { href: "/os",      label: "Ordens de Serviço", icon: ClipboardList, badge: "3" },
      { href: "/estoque", label: "Estoque",            icon: Package },
      { href: "/tarefas", label: "Projetos",           icon: CheckSquare },
      { href: "/agenda",  label: "Agenda",             icon: Calendar },
    ]
  },
  {
    title: "Financeiro",
    items: [
      { href: "/financeiro",          label: "Gestão Financeira", icon: DollarSign },
      { href: "/financeiro/contas",   label: "Cobranças",        icon: BarChart3 },
      { href: "/financeiro/contratos",label: "Contratos",        icon: FileText },
    ]
  },
  {
    title: "Inteligência",
    items: [
      { href: "/ia-preditiva", label: "IA Preditiva",   icon: BrainCircuit },
      { href: "/relatorios",   label: "Relatórios",     icon: BarChart3 },
    ]
  },
  {
    title: "Administração",
    items: [
      { href: "/configuracoes", label: "Configurações", icon: Settings },
      { href: "/permissoes",    label: "Usuários",      icon: Shield },
    ]
  }
];

function NavGroup({ group, pathname }: { group: typeof navGroups[number]; pathname: string }) {
  const [open, setOpen] = useState(true);
  const { closeMobileMenu } = useLayout();

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-1.5 mb-0.5 group"
      >
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-muted-foreground transition-colors select-none">
          {group.title}
        </span>
        <ChevronRight className={cn(
          "w-3 h-3 text-muted-foreground/40 transition-transform duration-200",
          open && "rotate-90"
        )} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pb-2">
              {group.items.map(({ href, label, icon: Icon, badge }) => {
                const active = pathname === href;
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => closeMobileMenu()}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group",
                      active
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      active ? "text-primary" : "text-muted-foreground/60 group-hover:text-muted-foreground"
                    )} />
                    <span className="flex-1 leading-none">{label}</span>
                    {badge && (
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        active ? "bg-primary/20 text-primary" : "bg-green-500/10 text-green-500"
                      )}>
                        {badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const { isMobileMenuOpen, closeMobileMenu, sidebarColor } = useLayout();

  return (
    <aside 
      className={cn(
        "w-[240px] bg-card border-r border-border flex-col h-full shrink-0 transition-transform duration-300",
        isMobileMenuOpen ? "fixed inset-y-0 left-0 z-50 flex translate-x-0" : "hidden lg:flex"
      )}
      style={sidebarColor ? { 
        backgroundColor: sidebarColor,
        ...(isColorDark(sidebarColor) ? {
          "--foreground": "#FFFFFF",
          "--muted-foreground": "#E4E4E7",
          "--border": "rgba(255, 255, 255, 0.15)",
          "--primary": "#FFFFFF",
          "--muted": "rgba(255, 255, 255, 0.15)",
        } : {
          "--foreground": "#111111",
          "--muted-foreground": "#71717A",
          "--border": "rgba(0, 0, 0, 0.15)",
          "--primary": "#000000",
          "--muted": "#F4F4F5",
        })
      } as React.CSSProperties : {}}
    >

      {/* Logo */}
      <div className="py-6 flex items-center justify-center px-5 shrink-0 border-b border-border/50 relative">
        <img 
          src="https://i.imgur.com/LCOh0gC.png" 
          alt="Logo Jarmis" 
          className="w-[120px] h-[120px] rounded-full object-cover shadow-md"
        />
        <button className="lg:hidden text-muted-foreground p-1 absolute right-5 top-5" onClick={closeMobileMenu}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { 
          background: var(--muted); 
          border-radius: 4px; 
        }
      `}</style>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-3 sidebar-scroll">
        {navGroups.map((group, i) => (
          <NavGroup key={i} group={group} pathname={pathname} />
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-border/50 pt-3 shrink-0">
        <Link
          href="/ajuda"
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-muted-foreground font-medium hover:text-foreground hover:bg-muted/50 transition-all"
        >
          <HelpCircle className="w-4 h-4 opacity-70" />
          <span>Central de Ajuda</span>
        </Link>
        <div className="px-3 pt-2 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/60 font-medium">v4.0.0</span>
          <span className="text-[10px] text-green-500 font-semibold flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Online
          </span>
        </div>
      </div>
    </aside>
  );
}
