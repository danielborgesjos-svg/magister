"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  User, Mail, Phone, Building2, Shield, Camera, Save, KeyRound,
  Bell, Palette, Globe, ChevronDown, CheckCircle2, Eye, EyeOff,
  Smartphone, Clock, BadgeCheck, AlertTriangle, Pencil
} from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Dados mock do usuário (substituir por session real) ──────────────────────
const USUARIO_MOCK = {
  nome: "Rafael Oliveira",
  email: "rafael@magister.com",
  telefone: "(11) 99999-0000",
  cargo: "Administrador",
  departamento: "Gestão",
  empresa: "Magister Tecnologia",
  avatar: "https://i.pravatar.cc/150?u=rafael",
  role: "admin",
  createdAt: "2024-01-15",
  ultimoAcesso: new Date().toISOString(),
}

const TABS_PERFIL = [
  { id: "dados",         label: "Dados Pessoais",    icon: User },
  { id: "seguranca",     label: "Segurança",          icon: KeyRound },
  { id: "notificacoes",  label: "Notificações",       icon: Bell },
  { id: "aparencia",     label: "Preferências",       icon: Palette },
]

function Avatar({ nome, src, size = 100 }: { nome: string; src?: string; size?: number }) {
  const initials = nome.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
  return (
    <div
      className="relative rounded-full border-4 border-primary/20 shadow-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary/20 to-violet-500/20 shrink-0"
      style={{ width: size, height: size }}
    >
      {src ? (
        <img src={src} alt={nome} className="w-full h-full object-cover" />
      ) : (
        <span className="font-black text-primary" style={{ fontSize: size * 0.32 }}>{initials}</span>
      )}
    </div>
  )
}

const inputCls = "w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-[13px] text-foreground outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 placeholder:text-muted-foreground/50 disabled:opacity-50 disabled:cursor-not-allowed"

export default function PerfilPage() {
  const [tab, setTab] = useState("dados")
  const [editando, setEditando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [showSenha, setShowSenha] = useState(false)
  const [user, setUser] = useState({ ...USUARIO_MOCK })

  const [notifs, setNotifs] = useState({
    email_os: true, email_financeiro: true, email_chamados: true,
    push_os: true, push_financeiro: false, push_vencimento: true,
    resumo_diario: false,
  })

  async function salvar() {
    setSalvo(true)
    setTimeout(() => { setSalvo(false); setEditando(false) }, 2000)
  }

  return (
    <div className="w-full max-w-[1100px] mx-auto pb-16 space-y-6">

      {/* ── Header Card ── */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card">
        {/* Fundo gradiente */}
        <div className="h-28 bg-gradient-to-r from-primary/20 via-violet-500/15 to-transparent relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
        </div>
        {/* Info do usuário */}
        <div className="px-8 pb-6 relative -mt-12">
          <div className="flex items-end gap-5 flex-wrap">
            <div className="relative">
              <Avatar nome={user.nome} src={user.avatar} size={96} />
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:opacity-90 transition-all border-2 border-card">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 pt-4">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-[22px] font-black text-foreground">{user.nome}</h1>
                <span className={cn("px-2.5 py-1 rounded-lg text-[11px] font-black border",
                  user.role === "admin" ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground border-border"
                )}>
                  {user.role === "admin" ? "Administrador" : user.role}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1 flex-wrap text-[12.5px] text-muted-foreground font-medium">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{user.email}</span>
                <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{user.empresa}</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />Desde {new Date(user.createdAt).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-1">
              {editando ? (
                <button onClick={salvar} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all shadow-sm">
                  {salvo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                  {salvo ? "Salvo!" : "Salvar"}
                </button>
              ) : (
                <button onClick={() => setEditando(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all">
                  <Pencil className="w-3.5 h-3.5" /> Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 bg-muted/30 p-1 rounded-2xl border border-border overflow-x-auto no-scrollbar">
        {TABS_PERFIL.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[13px] font-bold whitespace-nowrap transition-all flex-shrink-0",
              tab === id ? "bg-card text-primary shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
            )}>
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* ── Conteúdo ── */}
      <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>

        {/* ══ DADOS PESSOAIS ══ */}
        {tab === "dados" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/20">
                  <h3 className="text-[14px] font-black text-foreground">Informações do Perfil</h3>
                </div>
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { label: "Nome completo", key: "nome", placeholder: "Seu nome completo" },
                      { label: "E-mail profissional", key: "email", placeholder: "email@empresa.com", type: "email" },
                      { label: "Telefone / WhatsApp", key: "telefone", placeholder: "(11) 99999-0000" },
                      { label: "Cargo", key: "cargo", placeholder: "Ex: Gerente Financeiro" },
                    ].map(f => (
                      <div key={f.key} className="space-y-1.5">
                        <label className="text-[12px] font-semibold text-foreground/70">{f.label}</label>
                        <input
                          type={f.type ?? "text"}
                          value={(user as any)[f.key] ?? ""}
                          onChange={e => setUser(u => ({ ...u, [f.key]: e.target.value }))}
                          disabled={!editando}
                          placeholder={f.placeholder}
                          className={inputCls}
                        />
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-foreground/70">Departamento</label>
                      <input value={user.departamento} onChange={e => setUser(u => ({ ...u, departamento: e.target.value }))} disabled={!editando} className={inputCls} placeholder="Ex: Operações" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[12px] font-semibold text-foreground/70">Empresa</label>
                      <input value={user.empresa} disabled className={inputCls} />
                    </div>
                  </div>
                  {editando && (
                    <div className="flex gap-3 pt-2">
                      <button onClick={() => setEditando(false)} className="px-4 py-2 rounded-xl border border-border text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-all">Cancelar</button>
                      <button onClick={salvar} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all">
                        {salvo ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
                        {salvo ? "Salvo!" : "Salvar Alterações"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
                <p className="text-[12px] font-black uppercase tracking-widest text-muted-foreground">Status da Conta</p>
                {[
                  { label: "Nível de acesso", val: user.role === "admin" ? "Administrador" : "Usuário", icon: Shield, color: "text-primary" },
                  { label: "Status", val: "Ativo", icon: BadgeCheck, color: "text-emerald-600" },
                  { label: "Último acesso", val: new Date(user.ultimoAcesso).toLocaleString("pt-BR"), icon: Clock, color: "text-blue-600" },
                  { label: "Membro desde", val: new Date(user.createdAt).toLocaleDateString("pt-BR"), icon: User, color: "text-violet-600" },
                ].map(r => (
                  <div key={r.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <r.icon className={cn("w-3.5 h-3.5", r.color)} />
                    </div>
                    <div>
                      <p className="text-[11px] text-muted-foreground font-medium">{r.label}</p>
                      <p className="text-[13px] font-bold text-foreground">{r.val}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-violet-500/5 border border-primary/20 rounded-2xl p-5">
                <p className="text-[13px] font-black text-foreground mb-1">Plano Ativo</p>
                <p className="text-[22px] font-black text-primary">Enterprise</p>
                <p className="text-[11.5px] text-muted-foreground mt-1">Todos os módulos habilitados</p>
              </div>
            </div>
          </div>
        )}

        {/* ══ SEGURANÇA ══ */}
        {tab === "seguranca" && (
          <div className="max-w-xl space-y-5">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <h3 className="text-[14px] font-black text-foreground">Alterar Senha</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Use uma senha forte com no mínimo 8 caracteres.</p>
              </div>
              <div className="p-6 space-y-4">
                {["Senha atual", "Nova senha", "Confirmar nova senha"].map((label, i) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-foreground/70">{label}</label>
                    <div className="relative">
                      <input type={showSenha ? "text" : "password"} className={inputCls} placeholder="••••••••" />
                      {i === 0 && (
                        <button onClick={() => setShowSenha(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          {showSenha ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                <button className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm">
                  <KeyRound className="w-3.5 h-3.5" /> Atualizar Senha
                </button>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <h3 className="text-[14px] font-black text-foreground">Autenticação em 2 Fatores</h3>
              </div>
              <div className="p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-foreground">2FA por Aplicativo</p>
                    <p className="text-[11.5px] text-muted-foreground">Google Authenticator / Authy</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  Não ativado
                </span>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <p className="text-[12px] font-black uppercase tracking-widest text-muted-foreground mb-3">Sessões Ativas</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-foreground">Windows · Chrome</p>
                  <p className="text-[11.5px] text-muted-foreground">São Paulo, BR · Sessão atual</p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Ativa
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ══ NOTIFICAÇÕES ══ */}
        {tab === "notificacoes" && (
          <div className="max-w-xl space-y-4">
            {[
              {
                titulo: "E-mail",
                items: [
                  { key: "email_os", label: "Ordens de Serviço", sub: "Criação, alteração e conclusão de OS" },
                  { key: "email_financeiro", label: "Alertas Financeiros", sub: "Contas a vencer, pagamentos confirmados" },
                  { key: "email_chamados", label: "Chamados de Suporte", sub: "Respostas e atualizações de chamados" },
                ]
              },
              {
                titulo: "Notificações Push",
                items: [
                  { key: "push_os", label: "OS urgentes", sub: "Ordens com prioridade alta" },
                  { key: "push_financeiro", label: "Pagamentos", sub: "Confirmação de recebimentos" },
                  { key: "push_vencimento", label: "Contratos a vencer", sub: "Alerta 30 dias antes" },
                ]
              },
              {
                titulo: "Resumos",
                items: [
                  { key: "resumo_diario", label: "Resumo diário", sub: "Receba um resumo do dia toda manhã" },
                ]
              }
            ].map(grupo => (
              <div key={grupo.titulo} className="bg-card border border-border rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-border bg-muted/20">
                  <h3 className="text-[13px] font-black text-foreground">{grupo.titulo}</h3>
                </div>
                <div className="divide-y divide-border/50">
                  {grupo.items.map(item => (
                    <div key={item.key} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="text-[13px] font-semibold text-foreground">{item.label}</p>
                        <p className="text-[11.5px] text-muted-foreground">{item.sub}</p>
                      </div>
                      <button
                        onClick={() => setNotifs(n => ({ ...n, [item.key]: !(n as any)[item.key] }))}
                        className={cn(
                          "relative w-11 h-6 rounded-full transition-all duration-300 shrink-0",
                          (notifs as any)[item.key] ? "bg-primary" : "bg-muted"
                        )}
                      >
                        <span className={cn(
                          "absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300",
                          (notifs as any)[item.key] ? "left-[22px]" : "left-0.5"
                        )} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Save className="w-3.5 h-3.5" /> Salvar Preferências
            </button>
          </div>
        )}

        {/* ══ APARÊNCIA ══ */}
        {tab === "aparencia" && (
          <div className="max-w-xl space-y-4">
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-border bg-muted/20">
                <h3 className="text-[14px] font-black text-foreground">Idioma e Região</h3>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { label: "Idioma", options: ["Português (Brasil)", "English", "Español"], selected: 0 },
                  { label: "Fuso horário", options: ["America/Sao_Paulo (UTC-3)", "America/Manaus (UTC-4)"], selected: 0 },
                  { label: "Formato de data", options: ["DD/MM/AAAA", "MM/DD/AAAA", "AAAA-MM-DD"], selected: 0 },
                  { label: "Formato de moeda", options: ["BRL — R$", "USD — $", "EUR — €"], selected: 0 },
                ].map(f => (
                  <div key={f.label} className="space-y-1.5">
                    <label className="text-[12px] font-semibold text-foreground/70">{f.label}</label>
                    <div className="relative">
                      <select className={inputCls + " appearance-none cursor-pointer"} defaultValue={f.options[f.selected]}>
                        {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <button className="w-full py-2.5 rounded-xl bg-primary text-white text-[13px] font-black hover:opacity-90 transition-all flex items-center justify-center gap-2">
              <Save className="w-3.5 h-3.5" /> Salvar Preferências
            </button>
          </div>
        )}

      </motion.div>
    </div>
  )
}
