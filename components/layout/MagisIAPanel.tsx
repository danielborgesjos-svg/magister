"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  Sparkles, AlertTriangle, Zap, TrendingUp, Users,
  MessageSquare, X, Send, LayoutDashboard, Terminal,
  ClipboardList, DollarSign, CheckCircle2, Clock,
  ArrowRight, Loader2, RefreshCw, Bot, Radio, Package,
  CheckSquare, AlertOctagon, LayoutGrid, Calendar, Truck,
  FileText, Edit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayout, AGENT_CONFIGS, AgentConfig } from "./LayoutProvider";
import { processarMensagemIA } from "@/app/actions/ia";

// ─── Mapa rota → contexto ─────────────────────────────────────────────────────
const ROTA_PARA_CONTEXTO: { pattern: RegExp; contexto: import("./LayoutProvider").AgentContexto }[] = [
  { pattern: /\/os/,         contexto: "os" },
  { pattern: /\/financeiro/, contexto: "financeiro" },
  { pattern: /\/clientes/,  contexto: "clientes" },
  { pattern: /\/estoque/,   contexto: "estoque" },
  { pattern: /\/agenda/,    contexto: "agenda" },
  { pattern: /\/permissoes/, contexto: "configuracoes" },
  { pattern: /\/inteligencia/, contexto: "inteligencia" },
];

function contextoParaRota(pathname: string): import("./LayoutProvider").AgentContexto {
  for (const { pattern, contexto } of ROTA_PARA_CONTEXTO) {
    if (pattern.test(pathname)) return contexto;
  }
  return "global";
}

// ─── Mapa de ícones pelo nome (string → componente) ───────────────────────────
const ICON_MAP: Record<string, any> = {
  ClipboardList, DollarSign, Users, CheckCircle2, TrendingUp, RefreshCw,
  Radio, CheckSquare, AlertOctagon, LayoutGrid, Calendar, Truck,
  FileText, Package, Edit, MessageSquare, AlertTriangle, Zap,
};

// ─── Alertas do briefing por contexto ────────────────────────────────────────
const BRIEFING_POR_CONTEXTO: Record<string, { icon: string; cor: string; texto: string; urgente?: boolean }[]> = {
  global: [
    { icon: "AlertTriangle", cor: "#EF4444", texto: "3 OS atrasadas — SLA em risco",       urgente: true },
    { icon: "DollarSign",    cor: "#F59E0B", texto: "R$ 8.400 em OS não faturadas" },
    { icon: "ClipboardList", cor: "#6D4AFF", texto: "5 OS aguardando despacho" },
    { icon: "TrendingUp",    cor: "#22C55E", texto: "Receita 8% acima da meta mensal" },
    { icon: "Users",         cor: "#3B82F6", texto: "2 clientes sem retorno há 15 dias" },
  ],
  os: [
    { icon: "AlertTriangle", cor: "#EF4444", texto: "3 OS com SLA vencido — ação imediata", urgente: true },
    { icon: "ClipboardList", cor: "#D97706", texto: "5 OS aguardando alocação de técnico",  urgente: true },
    { icon: "CheckSquare",   cor: "#F59E0B", texto: "2 OS aguardando aprovação do gestor" },
    { icon: "DollarSign",    cor: "#22C55E", texto: "R$ 12.800 em OS concluídas não faturadas" },
    { icon: "AlertOctagon",  cor: "#EF4444", texto: "1 não conformidade crítica em aberto" },
  ],
  financeiro: [
    { icon: "AlertTriangle", cor: "#EF4444", texto: "4 faturas vencidas este mês",          urgente: true },
    { icon: "DollarSign",    cor: "#059669", texto: "Receita de OS: R$ 28.400 este mês" },
    { icon: "TrendingUp",    cor: "#F59E0B", texto: "Despesas 12% acima do previsto" },
    { icon: "CheckCircle2",  cor: "#22C55E", texto: "3 pagamentos confirmados hoje" },
  ],
  clientes: [
    { icon: "Users",         cor: "#EF4444", texto: "2 contratos vencem em 15 dias",        urgente: true },
    { icon: "AlertTriangle", cor: "#F59E0B", texto: "5 clientes sem contato há 30 dias" },
    { icon: "TrendingUp",    cor: "#22C55E", texto: "3 novas negociações este mês" },
  ],
  estoque: [
    { icon: "AlertTriangle", cor: "#EF4444", texto: "4 produtos abaixo do estoque mínimo",  urgente: true },
    { icon: "Package",       cor: "#F59E0B", texto: "2 itens com ruptura prevista em 7 dias" },
    { icon: "CheckCircle2",  cor: "#22C55E", texto: "Recebimento de 3 pedidos confirmado" },
  ],
  agenda: [
    { icon: "AlertTriangle", cor: "#EF4444", texto: "2 conflitos de agenda detectados",     urgente: true },
    { icon: "Calendar",      cor: "#0891B2", texto: "6 visitas agendadas para amanhã" },
  ],
  despacho: [
    { icon: "Radio",         cor: "#EF4444", texto: "5 OS aguardando alocação urgente",     urgente: true },
    { icon: "Truck",         cor: "#D97706", texto: "2 veículos em manutenção hoje" },
    { icon: "Users",         cor: "#22C55E", texto: "4 técnicos disponíveis agora" },
  ],
};

// ─── Componente de mensagem ───────────────────────────────────────────────────
function ChatMsg({ msg, corPrimaria }: { msg: any; corPrimaria: string }) {
  const isUser = msg.tipo === "entrada";
  return (
    <div className={cn("flex gap-2.5 items-end", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mb-0.5"
          style={{ backgroundColor: `${corPrimaria}20` }}
        >
          <Bot className="w-3.5 h-3.5" style={{ color: corPrimaria }} />
        </div>
      )}
      <div className={cn(
        "max-w-[85%] px-3.5 py-2.5 rounded-2xl text-[13px] leading-relaxed font-medium",
        isUser
          ? "text-white rounded-br-sm"
          : "bg-white border border-[#E9ECF3] text-[#0D0F1A] rounded-bl-sm shadow-sm"
      )}
        style={isUser ? { backgroundColor: corPrimaria } : {}}
      >
        <p className="whitespace-pre-wrap">{msg.conteudo}</p>
        {msg.acoes && msg.acoes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-[#E9ECF3]">
            {msg.acoes.map((a: any, i: number) => (
              <button key={i}
                className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors border"
                style={{ color: corPrimaria, backgroundColor: `${corPrimaria}10`, borderColor: `${corPrimaria}30` }}
              >
                <ArrowRight className="w-3 h-3" /> {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Panel principal ──────────────────────────────────────────────────────────
export function MagisIAPanel() {
  const { isIAPanelOpen, closeIAPanel, agentContexto, setAgentContexto } = useLayout();
  const pathname = usePathname();
  const [tab, setTab] = useState<"briefing" | "copiloto" | "comandos">("briefing");
  const [mensagens, setMensagens] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Auto-switch: cada rota tem seu próprio agente ──
  useEffect(() => {
    const novoContexto = contextoParaRota(pathname);
    setAgentContexto(novoContexto);
  }, [pathname, setAgentContexto]);

  const cfg: AgentConfig = AGENT_CONFIGS[agentContexto] ?? AGENT_CONFIGS.global;
  const briefingItems = BRIEFING_POR_CONTEXTO[agentContexto] ?? BRIEFING_POR_CONTEXTO.global;

  // Resetar chat e boasvindas ao trocar de agente
  useEffect(() => {
    setMensagens([{
      id: "init-" + agentContexto,
      tipo: "saida",
      conteudo: cfg.boasVindas,
    }]);
    setInput("");
    setTab("briefing");
  }, [agentContexto, cfg.boasVindas]);

  useEffect(() => {
    if (tab === "copiloto" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [mensagens, isTyping, tab]);

  const enviar = useCallback(async (texto?: string) => {
    const msg = texto || input;
    if (!msg.trim() || isTyping) return;
    setInput("");
    setTab("copiloto");
    setMensagens(prev => [...prev, { id: Date.now().toString(), tipo: "entrada", conteudo: msg }]);
    setIsTyping(true);
    try {
      const res = await processarMensagemIA(msg);
      setMensagens(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        tipo: "saida",
        conteudo: res.diagnostico || res.recomendacao || "Análise concluída. Verifique os dados do sistema.",
        acoes: res.acoes,
      }]);
    } catch {
      setMensagens(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        tipo: "saida",
        conteudo: "Não consegui processar. Verifique a conexão com o modelo IA.",
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [input, isTyping]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); enviar(); }
  };

  if (!isIAPanelOpen) return null;

  return (
    <aside className="w-[360px] flex-shrink-0 flex flex-col h-full relative z-20 bg-card border-l border-border transition-all duration-300">

      {/* ── HEADER — cor dinâmica ── */}
      <div
        className="shrink-0 px-5 pt-5 pb-0 transition-all duration-500"
        style={{ background: cfg.gradiente }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-inner">
              <Sparkles className="w-4.5 h-4.5 text-white" />
            </div>
            <div>
              <h2 className="text-[14px] font-black text-white leading-tight tracking-tight">{cfg.titulo}</h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 bg-[#22C55E] rounded-full animate-pulse" />
                <p className="text-[10px] text-white/75 font-semibold">{cfg.subtitulo}</p>
              </div>
            </div>
          </div>
          <button
            onClick={closeIAPanel}
            className="p-1.5 hover:bg-white/10 text-white/60 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Badge do contexto (se não for global) */}
        {agentContexto !== "global" && (
          <div className="mb-3 inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-white/80" />
            <span className="text-[10.5px] font-black text-white/90 uppercase tracking-widest">
              Agente Especializado
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1">
          {([
            { id: "briefing", label: "Briefing",  icon: LayoutDashboard },
            { id: "copiloto", label: "Copiloto",  icon: MessageSquare },
            { id: "comandos", label: "Comandos",  icon: Terminal },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => {
                setTab(id);
                if (id === "copiloto") setTimeout(() => inputRef.current?.focus(), 100);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-t-lg text-[12px] font-bold transition-all",
                tab === id
                  ? "bg-[#F6F7FB] text-[#0D0F1A]"
                  : "text-white/60 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className={cn("w-3.5 h-3.5", tab === id && "")}
                style={tab === id ? { color: cfg.corPrimaria } : {}}
              />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── CONTEÚDO ── */}
      <div className="flex-1 flex flex-col min-h-0">

        {/* ── ABA: BRIEFING ── */}
        {tab === "briefing" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">

            {/* Alertas */}
            <div>
              <p className="text-[10px] font-black text-[#7C8399] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Alertas do Dia
              </p>
              <div className="space-y-2">
                {briefingItems.map((item, i) => {
                  const Icon = ICON_MAP[item.icon] ?? AlertTriangle;
                  return (
                    <div key={i} className={cn(
                      "flex items-center gap-3 bg-white p-3 rounded-xl border transition-all hover:shadow-sm cursor-pointer",
                      item.urgente ? "border-[#EF4444]/30 shadow-[0_0_0_1px_rgba(239,68,68,0.07)]" : "border-[#E9ECF3]"
                    )}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.cor}15` }}>
                        <Icon className="w-4 h-4" style={{ color: item.cor }} />
                      </div>
                      <span className="text-[12.5px] font-semibold text-[#0D0F1A] leading-snug flex-1">{item.texto}</span>
                      {item.urgente && <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse shrink-0" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* KPIs rápidos */}
            <div>
              <p className="text-[10px] font-black text-[#7C8399] uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Zap className="w-3 h-3" /> Resumo Rápido
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "OS Abertas",  valor: "12", cor: cfg.corPrimaria },
                  { label: "Em Execução", valor: "4",  cor: "#3B82F6" },
                  { label: "Atrasadas",   valor: "3",  cor: "#EF4444" },
                  { label: "A Faturar",   valor: "R$ 8,4k", cor: "#F59E0B" },
                ].map((k, i) => (
                  <div key={i} className="bg-white border border-[#E9ECF3] rounded-xl p-3 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
                    <p className="text-[10px] font-bold text-[#B0B8D1] uppercase tracking-wider">{k.label}</p>
                    <p className="text-[20px] font-black mt-0.5" style={{ color: k.cor }}>{k.valor}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA para copiloto */}
            <button
              onClick={() => { setTab("copiloto"); setTimeout(() => inputRef.current?.focus(), 100); }}
              className="w-full text-white font-bold py-3 rounded-xl text-[13px] flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg"
              style={{ background: cfg.gradiente, boxShadow: `0 8px 20px ${cfg.corPrimaria}30` }}
            >
              <MessageSquare className="w-4 h-4" /> Perguntar ao Agente
            </button>
          </div>
        )}

        {/* ── ABA: COPILOTO ── */}
        {tab === "copiloto" && (
          <>
            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
              {mensagens.map(msg => (
                <ChatMsg key={msg.id} msg={msg} corPrimaria={cfg.corPrimaria} />
              ))}

              {isTyping && (
                <div className="flex gap-2.5 items-end">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${cfg.corPrimaria}20` }}>
                    <Bot className="w-3.5 h-3.5" style={{ color: cfg.corPrimaria }} />
                  </div>
                  <div className="bg-white border border-[#E9ECF3] px-3.5 py-3 rounded-2xl rounded-bl-sm shadow-sm flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" style={{ color: cfg.corPrimaria }} />
                    <span className="text-[12px] text-[#7C8399] font-semibold">Analisando dados...</span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Sugestões contextuais */}
            {mensagens.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-1.5 shrink-0">
                {cfg.sugestoes.slice(0, 4).map((s, i) => (
                  <button
                    key={i}
                    onClick={() => enviar(s)}
                    className="text-[11px] font-semibold bg-white border border-[#E9ECF3] text-[#5B6B7C] px-3 py-1.5 rounded-full transition-colors shadow-sm hover:border-opacity-60 hover:shadow-md"
                    style={{ ["--hover-border" as any]: cfg.corPrimaria }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = `${cfg.corPrimaria}60`;
                      (e.currentTarget as HTMLButtonElement).style.color = cfg.corPrimaria;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLButtonElement).style.borderColor = "";
                      (e.currentTarget as HTMLButtonElement).style.color = "";
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div className="shrink-0 p-3 bg-white border-t border-[#E9ECF3]">
              <div className="flex items-center gap-2 bg-[#F6F7FB] border border-[#E0E4F0] rounded-xl px-3 py-2 focus-within:bg-white transition-all"
                style={{ ["--focus-border" as any]: cfg.corPrimaria }}
                onFocusCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = `${cfg.corPrimaria}50`}
                onBlurCapture={e => (e.currentTarget as HTMLDivElement).style.borderColor = ""}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder={cfg.placeholder}
                  className="flex-1 bg-transparent text-[13px] font-medium text-[#0D0F1A] placeholder:text-[#B0B8D1] outline-none"
                />
                <button
                  onClick={() => enviar()}
                  disabled={!input.trim() || isTyping}
                  className="w-8 h-8 hover:opacity-85 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all active:scale-95 shrink-0"
                  style={{ backgroundColor: cfg.corPrimaria }}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── ABA: COMANDOS ── */}
        {tab === "comandos" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            <p className="text-[10px] font-black text-[#7C8399] uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Terminal className="w-3 h-3" /> Ações Rápidas — {cfg.titulo}
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              {cfg.comandos.map((cmd, i) => {
                const Icon = ICON_MAP[cmd.icon] ?? Zap;
                return (
                  <button
                    key={i}
                    className="bg-white border border-[#E9ECF3] rounded-xl p-4 text-left hover:shadow-md transition-all active:scale-[0.97] group"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3 transition-colors"
                      style={{ backgroundColor: `${cmd.cor}15` }}>
                      <Icon className="w-4.5 h-4.5" style={{ color: cmd.cor }} />
                    </div>
                    <p className="text-[12.5px] font-black text-[#0D0F1A] leading-tight">{cmd.label}</p>
                    <p className="text-[11px] text-[#B0B8D1] mt-0.5 font-medium">{cmd.desc}</p>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-xl p-4 border"
              style={{ background: `${cfg.corPrimaria}08`, borderColor: `${cfg.corPrimaria}25` }}>
              <p className="text-[12px] font-black mb-1 flex items-center gap-1.5"
                style={{ color: cfg.corPrimaria }}>
                <Sparkles className="w-3.5 h-3.5" /> Dica do Agente
              </p>
              <p className="text-[11.5px] text-[#5B6B7C] leading-relaxed font-medium">
                Fale no chat: "criar OS para cliente JAMPER" e processo automaticamente.
              </p>
              <button
                onClick={() => { setTab("copiloto"); setTimeout(() => inputRef.current?.focus(), 100); }}
                className="mt-3 text-[11px] font-bold flex items-center gap-1 hover:gap-2 transition-all"
                style={{ color: cfg.corPrimaria }}
              >
                Abrir Copiloto <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
