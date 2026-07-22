"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Bell, Search, Settings, Building, ChevronDown, Menu,
  User, LogOut, KeyRound, HelpCircle, Moon, Sun, X,
  ClipboardList, DollarSign, Users, Zap, CheckCircle2,
  AlertTriangle, Clock, Headphones, Monitor, LayoutGrid,
  Calendar
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useLayout } from "./LayoutProvider"
import { motion, AnimatePresence } from "framer-motion"
import { cn, isColorDark } from "@/lib/utils"

// ─── Mock de notificações (substituir por dados reais) ────────────────────────
const NOTIFICACOES_MOCK = [
  { id: "1", tipo: "os",        titulo: "OS #1028 concluída",            sub: "Técnico finalizou a ordem.",         tempo: "2 min",   lida: false, icon: ClipboardList, color: "text-blue-600",  bg: "bg-blue-500/15" },
  { id: "2", tipo: "financeiro", titulo: "Conta vencendo amanhã",        sub: "R$ 3.200 — Fornecedor XYZ.",         tempo: "1h",      lida: false, icon: DollarSign,    color: "text-amber-600", bg: "bg-amber-500/15" },
  { id: "3", tipo: "contrato",  titulo: "Contrato vence em 15 dias",     sub: "Renovar: Serviços de Limpeza.",      tempo: "3h",      lida: false, icon: AlertTriangle, color: "text-rose-500",  bg: "bg-rose-500/15" },
  { id: "4", tipo: "chamado",   titulo: "Chamado #002 respondido",       sub: "Suporte enviou uma atualização.",    tempo: "5h",      lida: true,  icon: Headphones,    color: "text-violet-600", bg: "bg-violet-500/15" },
  { id: "5", tipo: "equipe",    titulo: "João Silva adicionado à equipe", sub: "Novo técnico cadastrado.",           tempo: "1d",      lida: true,  icon: Users,         color: "text-teal-600",  bg: "bg-teal-500/15" },
]

// ─── Busca Global ─────────────────────────────────────────────────────────────
const SEARCH_LINKS = [
  { label: "Ordens de Serviço",   href: "/os",                 icon: ClipboardList },
  { label: "Financeiro",           href: "/financeiro",          icon: DollarSign },
  { label: "Contratos",            href: "/financeiro/contratos",icon: ClipboardList },
  { label: "Clientes (CRM)",       href: "/crm",                icon: Users },
  { label: "Equipe",               href: "/equipe",              icon: Users },
  { label: "Painel Geral",         href: "/painel",              icon: Zap },
  { label: "Central de Ajuda",     href: "/ajuda",               icon: HelpCircle },
  { label: "Configurações",        href: "/configuracoes",       icon: Settings },
]

function BuscaGlobal({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  const filtrados = SEARCH_LINKS.filter(s => !query || s.label.toLowerCase().includes(query.toLowerCase()))

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center pt-24 p-4 bg-black/50 backdrop-blur-sm"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="bg-card border border-border rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden"
        initial={{ scale: 0.95, y: -20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Escape") onClose()
              if (e.key === "Enter" && filtrados[0]) { router.push(filtrados[0].href); onClose() }
            }}
            placeholder="Buscar módulos, páginas, ações..."
            className="flex-1 text-[14px] bg-transparent text-foreground outline-none placeholder:text-muted-foreground/50"
          />
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="py-2 max-h-[60vh] overflow-y-auto">
          {filtrados.length === 0 ? (
            <p className="text-center py-8 text-[13px] text-muted-foreground">Nenhum resultado para "{query}"</p>
          ) : filtrados.map(item => {
            const Icon = item.icon
            return (
              <button key={item.href} onClick={() => { router.push(item.href); onClose() }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left group">
                <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground group-hover:text-primary transition-colors">{item.label}</p>
                  <p className="text-[11px] text-muted-foreground/60">{item.href}</p>
                </div>
              </button>
            )
          })}
        </div>
        <div className="px-4 py-2.5 border-t border-border bg-muted/20 flex items-center gap-3 text-[11px] text-muted-foreground/60 font-medium">
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded-md font-mono">↑↓</kbd> navegar</span>
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded-md font-mono">Enter</kbd> abrir</span>
          <span><kbd className="px-1.5 py-0.5 bg-card border border-border rounded-md font-mono">Esc</kbd> fechar</span>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ─── Painel de Notificações ───────────────────────────────────────────────────
function PainelNotificacoes({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState(NOTIFICACOES_MOCK)
  const naoLidas = notifs.filter(n => !n.lida).length

  function marcarTodasLidas() { setNotifs(n => n.map(i => ({ ...i, lida: true }))) }
  function marcarLida(id: string) { setNotifs(n => n.map(i => i.id === id ? { ...i, lida: true } : i)) }

  return (
    <motion.div
      className="absolute top-full right-0 mt-2 z-50 w-[380px]"
      initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.18 }}
      style={{
        "--foreground": "#111111",
        "--muted-foreground": "#71717A",
        "--border": "#E4E4E7"
      } as React.CSSProperties}
    >
      <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-black text-foreground">Notificações</h3>
            {naoLidas > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-primary text-white text-[10px] font-black">{naoLidas}</span>
            )}
          </div>
          {naoLidas > 0 && (
            <button onClick={marcarTodasLidas} className="text-[11.5px] font-semibold text-primary hover:underline">
              Marcar todas como lidas
            </button>
          )}
        </div>
        <div className="max-h-[420px] overflow-y-auto divide-y divide-border/50">
          {notifs.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-[13px] font-medium">Sem notificações</p>
            </div>
          ) : notifs.map(n => {
            const Icon = n.icon
            return (
              <button key={n.id} onClick={() => marcarLida(n.id)}
                className={cn("w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors hover:bg-muted/40", !n.lida && "bg-primary/3")}>
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", n.bg)}>
                  <Icon className={cn("w-4 h-4", n.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn("text-[13px] font-bold text-foreground line-clamp-1", !n.lida && "text-foreground")}>{n.titulo}</p>
                    {!n.lida && <span className="w-2 h-2 rounded-full bg-primary shrink-0" />}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-1">{n.sub}</p>
                  <p className="text-[11px] text-muted-foreground/50 mt-1 font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {n.tempo} atrás
                  </p>
                </div>
              </button>
            )
          })}
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/20">
          <Link href="/ajuda" className="text-[12.5px] font-bold text-primary hover:underline flex items-center gap-1">
            Ver todos os chamados <ChevronDown className="w-3 h-3 rotate-[-90deg]" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Topbar Principal ─────────────────────────────────────────────────────────
export function Topbar() {
  const { toggleMobileMenu, topbarColor, setTopbarColor, sidebarColor, setSidebarColor } = useLayout()
  const [buscaOpen, setBuscaOpen] = useState(false)
  const [notifsOpen, setNotifsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const notifsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const naoLidas = NOTIFICACOES_MOCK.filter(n => !n.lida).length

  // Fecha dropdowns ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (notifsRef.current && !notifsRef.current.contains(e.target as Node)) setNotifsOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Atalho ⌘K / Ctrl+K
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setBuscaOpen(true) }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  return (
    <>
      <header 
        className="h-[60px] border-b border-border bg-card/95 backdrop-blur-sm flex items-center justify-between px-4 md:px-6 shrink-0 z-10 relative transition-colors"
        style={topbarColor ? { 
          backgroundColor: topbarColor,
          ...(isColorDark(topbarColor) ? {
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

        {/* Hamburger mobile */}
        <div className="flex lg:hidden items-center mr-3">
          <button onClick={toggleMobileMenu} className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* ── Busca ── */}
        <div className="flex-1 flex items-center max-w-[500px]">
          <button
            onClick={() => setBuscaOpen(true)}
            className="relative w-full flex items-center gap-3 pl-4 pr-3 py-2 text-[13px] bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl outline-none transition-all text-slate-400 hover:text-slate-500 cursor-text shadow-sm"
          >
            <Search className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="flex-1 text-left text-slate-500 font-medium">Buscar módulos, ações ou relatórios...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-md">
              ⌘ K
            </kbd>
          </button>
        </div>

        {/* ── Centro: Informações de atualização ── */}
        <div className="hidden lg:flex items-center justify-center flex-1 mx-4">
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 px-4 py-1.5 rounded-full">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
              <span className="text-[12px] font-semibold text-slate-600">Última atualização: há 12 segundos</span>
            </div>
            <div className="w-px h-3 bg-slate-300"></div>
            <div className="flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-[12px] font-bold text-indigo-700">IA monitorando 18 indicadores</span>
            </div>
          </div>
        </div>

        {/* ── Ações direita ── */}
        <div className="flex items-center gap-1 ml-auto lg:ml-0">
          {/* Calendário */}
          <button className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all">
            <Calendar className="w-4.5 h-4.5" />
          </button>

          {/* Notificações */}
          <div className="relative" ref={notifsRef}>
            <button
              onClick={() => { setNotifsOpen(o => !o); setProfileOpen(false) }}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            >
              <Bell className="w-4.5 h-4.5" />
              {naoLidas > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
              )}
            </button>
            <AnimatePresence>
              {notifsOpen && <PainelNotificacoes onClose={() => setNotifsOpen(false)} />}
            </AnimatePresence>
          </div>

          {/* Ajuda */}
          <Link href="/ajuda"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            title="Central de Ajuda"
          >
            <HelpCircle className="w-4.5 h-4.5" />
          </Link>

          {/* Configurações */}
          <Link href="/configuracoes"
            className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-all"
            title="Configurações"
          >
            <Settings className="w-4.5 h-4.5" />
          </Link>

          <div className="hidden sm:block w-px h-6 bg-slate-200 mx-2" />

          {/* ── Perfil da Empresa ── */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(o => !o); setNotifsOpen(false) }}
              className="flex items-center gap-3 px-2 py-1.5 rounded-xl hover:bg-slate-50 transition-colors outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center shrink-0">
                <span className="text-red-600 font-black text-[14px]">D</span>
              </div>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-[13px] font-black text-slate-900 leading-none">Disafe</span>
                <span className="text-[11px] font-semibold text-slate-500 leading-none mt-1">Matriz - 01</span>
              </div>
              <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 hidden md:block transition-transform duration-200 ml-1", profileOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  className="absolute top-full right-0 mt-2 z-50 w-[240px]"
                  initial={{ opacity: 0, y: -8, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.96 }} transition={{ duration: 0.18 }}
                  style={{
                    "--foreground": "#111111",
                    "--muted-foreground": "#71717A",
                    "--border": "#E4E4E7"
                  } as React.CSSProperties}
                >
                  <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center gap-3 px-4 py-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                      <Avatar className="h-10 w-10 border-2 border-primary/20">
                        <AvatarImage src="https://i.pravatar.cc/150?u=rafael" alt="Rafael" />
                        <AvatarFallback className="bg-primary/10 text-primary text-[13px] font-black">RO</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[13px] font-black text-foreground">Rafael Oliveira</p>
                        <p className="text-[11px] text-muted-foreground">rafael@magister.com</p>
                        <span className="inline-flex mt-0.5 px-1.5 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-black">Administrador</span>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="py-1.5">
                      {[
                        { label: "Meu Perfil", href: "/perfil", icon: User },
                        { label: "Segurança", href: "/perfil", icon: KeyRound },
                        { label: "Central de Ajuda", href: "/ajuda", icon: HelpCircle },
                        { label: "Configurações", href: "/configuracoes", icon: Settings },
                      ].map(item => {
                        const Icon = item.icon
                        return (
                          <Link key={item.label} href={item.href} onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors">
                            <Icon className="w-4 h-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </div>
                    
                    {/* Theme Customization */}
                    <div className="px-4 py-3 border-t border-border bg-muted/10">
                      <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-3">Aparência do Layout</p>
                      
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-foreground font-medium flex items-center gap-1.5"><Monitor className="w-3.5 h-3.5 text-muted-foreground"/> Cor do Topo</span>
                          <label className="cursor-pointer hover:opacity-80 transition-opacity">
                            <input 
                              type="color" 
                              value={topbarColor || "#ffffff"} 
                              onChange={e => setTopbarColor(e.target.value)} 
                              onClick={e => e.stopPropagation()}
                              className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer" 
                              title="Alterar cor do Topo"
                            />
                          </label>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[12px] text-foreground font-medium flex items-center gap-1.5"><LayoutGrid className="w-3.5 h-3.5 text-muted-foreground"/> Cor do Menu Lateral</span>
                          <label className="cursor-pointer hover:opacity-80 transition-opacity">
                            <input 
                              type="color" 
                              value={sidebarColor || "#ffffff"} 
                              onChange={e => setSidebarColor(e.target.value)} 
                              onClick={e => e.stopPropagation()}
                              className="w-8 h-8 p-0 border-0 bg-transparent cursor-pointer" 
                              title="Alterar cor do Menu Lateral"
                            />
                          </label>
                        </div>
                        
                        {(topbarColor || sidebarColor) && (
                          <button 
                            onClick={() => { setTopbarColor(""); setSidebarColor(""); }} 
                            className="w-full mt-2 py-1.5 bg-background border border-border rounded-lg text-[10px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors shadow-sm"
                          >
                            Restaurar Cores Padrões
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="border-t border-border py-1.5">
                      <Link href="/login"
                        className="flex items-center gap-3 px-4 py-2.5 text-[13px] font-bold text-rose-500 hover:bg-rose-500/10 transition-colors">
                        <LogOut className="w-4 h-4" />
                        Sair da Conta
                      </Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Busca Global */}
      <AnimatePresence>
        {buscaOpen && <BuscaGlobal onClose={() => setBuscaOpen(false)} />}
      </AnimatePresence>
    </>
  )
}
