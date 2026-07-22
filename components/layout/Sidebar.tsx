"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users, ShoppingCart, Globe, Star, Megaphone,
  Factory, ShoppingBag, Boxes, Truck, Shield,
  DollarSign, Receipt, Calculator, PiggyBank,
  UserSquare, FileText, Target, LayoutDashboard, TrendingUp, BrainCircuit,
  ChevronRight, X, Settings, Bell
} from "lucide-react";

import { cn, isColorDark } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLayout } from "./LayoutProvider";

const navGroups = [
  {
    title: "Executivo",
    items: [
      { href: "/visao-executiva", label: "Visão Executiva",        icon: LayoutDashboard },
      { href: "/inteligencia",    label: "Assistente de IA",       icon: BrainCircuit, badge: "IA" },
      { href: "/ia/preditiva",    label: "Inteligência Preditiva", icon: TrendingUp, badge: "IA" },
    ]
  },
  {
    title: "CRM & Comercial",
    items: [
      { href: "/clientes",                 label: "Clientes & CRM",    icon: Users },
      { href: "/vendas",                   label: "Vendas & Pedidos",  icon: ShoppingCart },
      { href: "/portal-b2b",               label: "Portal B2B",        icon: Globe, badge: "Novo" },
      { href: "/portal-b2b/oportunidades", label: "Oportunidades",     icon: Star },
      { href: "/campanhas",                label: "Marketing",         icon: Megaphone },
    ]
  },
  {
    title: "Operações",
    items: [
      { href: "/producao",      label: "Produção",             icon: Factory },
      { href: "/compras",       label: "Compras",              icon: ShoppingBag },
      { href: "/estoque",       label: "Estoque & Armazéns",   icon: Boxes },
      { href: "/logistica",     label: "Logística",            icon: Truck },
      { href: "/qualidade",     label: "Qualidade",            icon: Shield },
    ]
  },
  {
    title: "Financeiro",
    items: [
      { href: "/financeiro",    label: "Financeiro",     icon: DollarSign },
      { href: "/fiscal",        label: "Fiscal & NF-e",  icon: Receipt },
      { href: "/contabilidade", label: "Contabilidade",  icon: Calculator },
      { href: "/custos",        label: "Custos",         icon: PiggyBank },
    ]
  },
  {
    title: "RH",
    items: [
      { href: "/pessoas",       label: "Pessoas (RH)",        icon: UserSquare },
    ]
  },
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
                const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => closeMobileMenu()}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 group",
                      active
                        ? "bg-[var(--primary)]/10 text-[var(--primary)] font-semibold"
                        : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                    )}
                  >
                    <Icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      active ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]/60 group-hover:text-[var(--foreground)]"
                    )} />
                    <span className="flex-1 leading-none">{label}</span>
                    {badge && (
                      <span className={cn(
                        "text-[10px] font-bold px-1.5 py-0.5 rounded-md",
                        active ? "bg-blue-100 text-blue-700" : (badge === "IA" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : "bg-green-500/10 text-green-500")
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
        "w-[230px] flex-col h-full shrink-0 transition-transform duration-300",
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
          "--foreground": "#0f172a", // slate-900
          "--muted-foreground": "#64748b", // slate-500
          "--border": "#e2e8f0", // slate-200
          "--primary": "#0f172a",
          "--muted": "#f8fafc", // slate-50
        })
      } as React.CSSProperties : {}}
    >

      {/* Logo */}
      <div className="py-6 flex items-center justify-center px-5 shrink-0 relative">
        <img
          src="/logo-disafe.png"
          alt="Logo DISAFE"
          className="w-[140px] h-auto object-contain transition-transform hover:scale-105 duration-300 drop-shadow-sm"
        />
        <button className="lg:hidden text-[var(--muted-foreground)] p-1 absolute right-5 top-5" onClick={closeMobileMenu}>
          <X className="w-5 h-5" />
        </button>
      </div>

      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { 
          background: #e2e8f0; 
          border-radius: 4px; 
        }
      `}</style>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-3 sidebar-scroll">
        {navGroups.map((group, i) => (
          <NavGroup key={i} group={group} pathname={pathname} />
        ))}
      </nav>

      {/* Footer User Profile */}
      <div className="px-4 py-4 shrink-0">
        <div className="flex items-center gap-3 bg-[var(--muted)]/40 p-2 rounded-2xl transition-colors hover:bg-[var(--muted)]/80">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-slate-200 border-2 border-transparent shadow-sm flex items-center justify-center overflow-hidden shrink-0">
              <img src="https://i.pravatar.cc/150?u=rafael" alt="Rafael Oliveira" className="w-full h-full object-cover" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" title="Online"></div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-[var(--foreground)] truncate">Rafael Oliveira</p>
            <p className="text-[11px] font-medium text-[var(--muted-foreground)] truncate">Diretor Executivo</p>
          </div>
          <div className="flex items-center gap-0.5">
            <button className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
