"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Sparkles, Loader2, Zap, ChevronRight, Bot, CornerDownLeft } from "lucide-react"
import { useMagis } from "@/hooks/useMagis"
import { MagisResponse } from "@/ai/magis-engine"
import { cn } from "@/lib/utils"

// MagisChat modulo type atualizado
interface MagisChatProps {
  modulo?: "geral" | "comercial" | "financeiro" | "whatsapp" | "os"
  sugestoes?: string[]
  placeholder?: string
  mensagemBoasVindas?: string
  className?: string
  compact?: boolean
}

const COR_BADGE: Record<string, string> = {
  green:  "bg-emerald-500/12 text-emerald-600 border-emerald-500/20",
  red:    "bg-red-500/12 text-red-500 border-red-500/20",
  blue:   "bg-blue-500/12 text-blue-600 border-blue-500/20",
  orange: "bg-amber-500/12 text-amber-600 border-amber-500/20",
  purple: "bg-violet-500/12 text-violet-600 border-violet-500/20",
  gray:   "bg-muted text-muted-foreground border-border",
}

function MagisMessage({ msg, compact }: { msg: any; compact?: boolean }) {
  const r: MagisResponse = msg.response

  return (
    <div className="flex gap-2.5 items-end">
      {/* Avatar */}
      <div className="w-7 h-7 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 mb-0.5 shadow-md shadow-violet-600/20">
        <Bot className="w-3.5 h-3.5 text-white" />
      </div>

      <div className="flex-1 space-y-1.5 min-w-0">
        {/* Nome do agente */}
        <div className="flex items-center gap-2 ml-0.5">
          <span className="text-[11px] font-black text-violet-600 uppercase tracking-wide">
            {r?.agente || "JARMIS"}
          </span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold flex items-center gap-1">
            <Zap className="w-2.5 h-2.5" /> IA
          </span>
        </div>

        {/* Bolha principal */}
        <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm p-3.5 space-y-2.5 shadow-sm">
          <p className={cn("text-foreground leading-relaxed", compact ? "text-[12.5px]" : "text-sm")}>
            {r?.diagnostico || msg.conteudo}
          </p>

          {/* Recomendação */}
          {r?.recomendacao && (
            <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-2.5">
              <p className="text-[10px] font-black text-violet-600 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Recomendação
              </p>
              <p className="text-[12px] text-foreground/80 leading-relaxed">{r.recomendacao}</p>
            </div>
          )}

          {/* Badges de dados */}
          {r?.dados && r.dados.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {r.dados.map((d: any, i: number) => (
                <span
                  key={i}
                  className={cn("text-[11px] px-2.5 py-1 rounded-full border font-bold", COR_BADGE[d.cor] || COR_BADGE.gray)}
                >
                  {d.label}: {d.valor}
                </span>
              ))}
            </div>
          )}

          {/* Próximo passo */}
          {r?.proximoPasso && (
            <div className="flex items-start gap-2 text-[11.5px] text-muted-foreground border-t border-border/50 pt-2.5">
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-violet-500" />
              <span>{r.proximoPasso}</span>
            </div>
          )}

          {/* Ações clicáveis */}
          {r?.acoes && r.acoes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {r.acoes.map((a: any, i: number) => (
                <button
                  key={i}
                  className="text-[11.5px] px-3 py-1.5 bg-violet-500/8 text-violet-600 border border-violet-500/20 rounded-lg hover:bg-violet-500/15 transition-colors font-bold flex items-center gap-1"
                >
                  <ChevronRight className="w-3 h-3" /> {a.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function MagisChat({
  modulo = "geral",
  sugestoes = [],
  placeholder = "Pergunte ao JARMIS...",
  mensagemBoasVindas,
  className,
  compact = false,
}: MagisChatProps) {
  const [input, setInput] = useState("")
  const { mensagens, isTyping, engineInfo, chatEndRef, enviarMensagem } = useMagis({ modulo })

  const handleSend = () => {
    if (!input.trim()) return
    enviarMensagem(input)
    setInput("")
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  return (
    <div className={cn("flex flex-col h-full rounded-2xl overflow-hidden border border-border bg-card shadow-lg", className)}>

      {/* ── Header premium ── */}
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-violet-600/8 to-transparent flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-600/25">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="font-black text-sm tracking-tight">JARMIS Copiloto</p>
            <p className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1">
              <span className={cn("w-1.5 h-1.5 rounded-full", engineInfo.online ? "bg-emerald-500 animate-pulse" : "bg-muted-foreground")} />
              {engineInfo.online ? `Ollama · ${engineInfo.model}` : "Modo fallback"}
            </p>
          </div>
        </div>
        <span className="text-[10px] bg-violet-500/10 text-violet-600 border border-violet-500/20 px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
          {modulo}
        </span>
      </div>

      {/* ── Área de mensagens ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">

        {/* Boas-vindas */}
        {mensagens.length === 0 && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-600/20">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex-1 bg-card border border-border/60 rounded-2xl rounded-bl-sm p-3.5 shadow-sm">
              <p className={cn("text-foreground leading-relaxed", compact ? "text-[12.5px]" : "text-sm")}>
                {mensagemBoasVindas || "Olá! Sou o JARMIS, seu copiloto operacional. Posso analisar OS, clientes, pipeline e financeiro com dados reais. O que você quer saber?"}
              </p>
            </div>
          </div>
        )}

        {/* Histórico */}
        {mensagens.map(msg => (
          <div key={msg.id}>
            {msg.tipo === "entrada" ? (
              <div className="flex justify-end">
                <div className="max-w-[80%] bg-violet-600 text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm font-medium shadow-md shadow-violet-600/15">
                  {msg.conteudo}
                </div>
              </div>
            ) : (
              <MagisMessage msg={msg} compact={compact} />
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2.5 items-end">
            <div className="w-7 h-7 rounded-xl bg-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="bg-card border border-border/60 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[11px] text-muted-foreground font-semibold">Analisando dados reais...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* ── Sugestões rápidas ── */}
      {sugestoes.length > 0 && mensagens.length === 0 && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5 flex-shrink-0">
          {sugestoes.slice(0, 4).map((s, i) => (
            <button
              key={i}
              onClick={() => enviarMensagem(s)}
              className="text-[11.5px] px-3 py-1.5 bg-muted/60 hover:bg-violet-500/10 hover:text-violet-600 border border-border hover:border-violet-500/30 rounded-full transition-all font-semibold"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ── */}
      <div className="px-4 py-3 border-t border-border flex-shrink-0 bg-muted/20">
        <div className="flex items-center gap-2 bg-background border border-border rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-violet-500/25 focus-within:border-violet-500/40 transition-all">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder={placeholder}
            className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/60"
          />
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-muted-foreground/50 font-medium hidden sm:block">
              <CornerDownLeft className="w-3 h-3" />
            </span>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center transition-all active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
