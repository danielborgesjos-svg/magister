"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { MagisResponse } from "@/ai/magis-engine"

export interface MensagemChat {
  id:       string
  tipo:     "entrada" | "saida"
  conteudo: string
  agente?:  string
  response?: MagisResponse & { _source?: string; _model?: string }
  timestamp: Date
}

interface UseMagisOptions {
  modulo?: "geral" | "comercial" | "financeiro" | "whatsapp" | "os"
  onResposta?: (r: MagisResponse) => void
}

export function useMagis(options: UseMagisOptions = {}) {
  const { modulo = "geral", onResposta } = options

  const [mensagens, setMensagens]   = useState<MensagemChat[]>([])
  const [isTyping, setIsTyping]     = useState(false)
  const [engineInfo, setEngineInfo] = useState<{ online: boolean; model: string | null }>({ online: false, model: null })
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Verifica status do engine na montagem
  useEffect(() => {
    // Como estamos usando DeepSeek via cloud, definimos como online
    setEngineInfo({ online: true, model: "DeepSeek-V3" })
  }, [])

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensagens, isTyping])

  const enviarMensagem = useCallback(async (texto: string) => {
    if (!texto.trim() || isTyping) return

    const msgEntrada: MensagemChat = {
      id:        `msg-${Date.now()}-in`,
      tipo:      "entrada",
      conteudo:  texto.trim(),
      timestamp: new Date(),
    }

    setMensagens(prev => [...prev, msgEntrada])
    setIsTyping(true)

    try {
      const res = await fetch("/api/jarmis", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mensagem:  texto.trim(),
          historico: mensagens.slice(-8).map(m => ({ tipo: m.tipo, conteudo: m.conteudo })),
          modulo,
        }),
      })

      if (!res.ok) throw new Error("API error")
      const data: MagisResponse & { _source?: string; _model?: string } = await res.json()

      const msgSaida: MensagemChat = {
        id:        `msg-${Date.now()}-out`,
        tipo:      "saida",
        conteudo:  data.diagnostico,
        agente:    data.agente,
        response:  data,
        timestamp: new Date(),
      }

      setMensagens(prev => [...prev, msgSaida])
      onResposta?.(data)

    } catch (err) {
      console.error("[useMagis] Erro:", err)
      setMensagens(prev => [...prev, {
        id:        `msg-${Date.now()}-err`,
        tipo:      "saida",
        conteudo:  "Desculpe, houve um erro ao processar sua mensagem. Tente novamente.",
        agente:    "Magis IA",
        timestamp: new Date(),
      }])
    } finally {
      setIsTyping(false)
    }
  }, [mensagens, isTyping, modulo, onResposta])

  const limparChat = useCallback(() => setMensagens([]), [])

  return {
    mensagens,
    isTyping,
    engineInfo,
    chatEndRef,
    enviarMensagem,
    limparChat,
  }
}
