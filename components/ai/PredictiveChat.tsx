"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, Sparkles, AlertTriangle, Paperclip, Mic } from "lucide-react"
import { alertasPorSetor, recomendacoesIA } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

type Message = { role: "user" | "assistant" | "system", content: string, id: string }

interface PredictiveChatProps {
  externalTrigger?: string;
}

export function PredictiveChat({ externalTrigger }: PredictiveChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Começa com uma saudação simples, sem dados mockados.
    // O sistema agora registrará informações reais do DB futuramente.
    const initialMsg = `Olá, Gestor! Aqui é o **JARMIS** (IA Orquestradora).\n\nEstou pronto para analisar registros reais de vendas, estoque e concorrência da DISAFE. Como posso ajudar agora?`
    
    setMessages([{ id: "1", role: "assistant", content: initialMsg }])
  }, [])

  // Auto-send when externalTrigger changes
  useEffect(() => {
    if (externalTrigger) {
      setInput(externalTrigger)
      // Dispara a submissão com um leve delay para UX
      setTimeout(() => {
        handleSend(undefined, externalTrigger)
      }, 500)
    }
  }, [externalTrigger])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading])

  const handleSend = async (e?: React.FormEvent, overrideInput?: string) => {
    e?.preventDefault()
    
    const messageToSend = overrideInput || input.trim()
    if (!messageToSend || isLoading) return

    setInput("")
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: messageToSend }])
    setIsLoading(true)

    try {
      const res = await fetch("/api/jarmis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: messageToSend, modulo: "visao-executiva" })
      })
      
      const data = await res.json()
      
      if (data.diagnostico) {
        let text = data.diagnostico;
        if (data.recomendacao) text += "\n\n**Recomendação:** " + data.recomendacao;
        if (data.proximoPasso) text += "\n\n**Próximo Passo:** " + data.proximoPasso;
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: text }])
      } else if (data.reply) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.reply }])
      } else {
        throw new Error("Erro na resposta da IA")
      }
    } catch (error) {
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Desculpe, ocorreu um erro de comunicação com o Motor JARMIS. Tente novamente." }])
    } finally {
      setIsLoading(false)
    }
  }

  // Função simples para renderizar negrito e quebras de linha
  const formatText = (text: string) => {
    const paragraphs = text.split('\n')
    return paragraphs.map((p, i) => {
      // Separa pelos asteriscos duplos
      const parts = p.split(/(\*\*.*?\*\*)/g)
      return (
        <span key={i}>
          {parts.map((part, j) => {
            if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={j} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>
            }
            return <span key={j}>{part}</span>
          })}
          {i < paragraphs.length - 1 && <br />}
        </span>
      )
    })
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
      {/* HEADER DO CHAT */}
      <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center relative">
            <Bot className="w-5 h-5" />
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
          </div>
          <div>
            <h3 className="text-[14px] font-black text-slate-900 tracking-tight flex items-center gap-2">
              JARMIS Copilot <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            </h3>
            <p className="text-[12px] font-medium text-slate-500">Orquestrador de Inteligência (Online)</p>
          </div>
        </div>
      </div>

      {/* MENSAGENS */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 custom-scrollbar">
        {messages.map(msg => (
          <div key={msg.id} className={cn("flex w-full", msg.role === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1",
                msg.role === "user" ? "bg-slate-900 text-white" : "bg-indigo-100 text-indigo-600"
              )}>
                {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-4 rounded-2xl shadow-sm border",
                msg.role === "user" 
                  ? "bg-slate-900 text-white border-slate-800 rounded-tr-sm" 
                  : "bg-white border-slate-100 rounded-tl-sm"
              )}>
                <p className={cn(
                  "text-[14px] leading-relaxed",
                  msg.role === "user" ? "text-slate-100 font-medium" : "text-slate-700"
                )}>
                  {formatText(msg.content)}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 max-w-[85%]">
            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-1">
              <Sparkles size={16} className="animate-spin-slow" />
            </div>
            <div className="px-5 py-4 rounded-2xl text-[14px] bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75" />
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-150" />
              </div>
              <span className="text-slate-500 font-medium ml-2">Processando dados da plataforma...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 bg-white border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-end gap-2 bg-slate-50 border border-slate-200 rounded-2xl p-2 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-400 transition-all">
          <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
            <Paperclip size={20} />
          </button>
          
          <textarea
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            placeholder="Pergunte ao JARMIS sobre vendas, estoque, finanças ou peça uma simulação..."
            className="flex-1 max-h-32 bg-transparent resize-none outline-none py-3 text-[14px] text-slate-800 placeholder:text-slate-400 custom-scrollbar"
            disabled={isLoading}
          />

          <div className="flex items-center gap-1">
            <button type="button" className="p-3 text-slate-400 hover:text-slate-600 transition-colors">
              <Mic size={20} />
            </button>
            <button 
              type="submit" 
              disabled={!input.trim() || isLoading} 
              className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center"
            >
              <Send size={18} strokeWidth={2.5} className={input.trim() ? "translate-x-0.5" : ""} />
            </button>
          </div>
        </form>
        <p className="text-center text-[10px] font-medium text-slate-400 mt-3">
          A IA pode cometer erros. Considere verificar informações críticas.
        </p>
      </div>
    </div>
  )
}
