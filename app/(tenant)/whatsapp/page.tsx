"use client";

import { useState, useEffect } from "react";
import { Search, Send, Paperclip, MoreVertical, CheckCircle2, User, Sparkles, MessageCircle, Clock, Zap, Plus, Forward, ArrowRight, Check, X, ShieldAlert, Smartphone, UserPlus, AlignLeft, Bot } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  getConversas, 
  getMensagens, 
  enviarMensagem, 
  updateConversaStatus, 
  getFluxosIA, 
  createFluxoIA,
  markAsRead 
} from "@/app/actions/whatsapp";

type ConversaWA = {
  id: string;
  telefone: string;
  nome: string;
  empresa: string | null;
  status: string;
  atendenteId: string | null;
  clienteId: string | null;
  ultimaMensagem: string | null;
  unreadCount: number;
  createdAt: Date;
  updatedAt: Date;
};

type MensagemWA = {
  id: string;
  conversaId: string;
  tipo: string;
  conteudo: string;
  statusEnvio: string | null;
  createdAt: Date;
};

type FluxoIA = {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  gatilho: string;
  disparos: number;
  resolucoes: number;
  nodesJson: string;
  createdAt: Date;
  updatedAt: Date;
};

const AGENTES = [
  { id: "1", nome: "Ana Comercial", perfil: "Vendas" },
  { id: "2", nome: "Carlos Suporte", perfil: "Técnico" },
];

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState<'inbox' | 'pipeline' | 'fluxos' | 'config'>('inbox');
  const [busca, setBusca] = useState("");
  const [conversaAtiva, setConversaAtiva] = useState<ConversaWA | null>(null);
  const [msgInput, setMsgInput] = useState("");
  const [conversasState, setConversasState] = useState<ConversaWA[]>([]);
  const [mensagensAtivas, setMensagensAtivas] = useState<MensagemWA[]>([]);
  const [fluxosState, setFluxosState] = useState<FluxoIA[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States para WhatsApp API (Baileys)
  const [qrStatus, setQrStatus] = useState<'conectando' | 'conectado' | 'desconectado' | 'qr_code_pronto'>('desconectado');
  const [qrImage, setQrImage] = useState<string | null>(null);

  // Sugestao de IA para o chat ativo (mockada visualmente)
  const [sugestaoIA, setSugestaoIA] = useState<string | null>(null);

  // States para Encaminhamento
  const [isEncaminharOpen, setIsEncaminharOpen] = useState(false);
  const [agenteSelecionadoId, setAgenteSelecionadoId] = useState("");
  const [msgEncaminhar, setMsgEncaminhar] = useState("");

  // States para Criador de Fluxo IA
  const [fluxoIAChatInput, setFluxoIAChatInput] = useState("");
  const [fluxoIAChatHistory, setFluxoIAChatHistory] = useState<{ role: 'user' | 'assistant'; text: string }[]>([
    { role: 'assistant', text: "Olá! Descreva o fluxo de atendimento que você deseja que eu desenhe e implemente no WhatsApp." }
  ]);
  const [isGerandoFluxo, setIsGerandoFluxo] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [convRes, fluxosRes] = await Promise.all([
        getConversas(),
        getFluxosIA()
      ]);
      if (convRes.success && convRes.data) {
        setConversasState(convRes.data);
      }
      if (fluxosRes.success && fluxosRes.data) {
        setFluxosState(fluxosRes.data);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  // Polling de Status do QR Code
  useEffect(() => {
    if (activeTab !== 'config') return;
    
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/whatsapp/status');
        const data = await res.json();
        setQrStatus(data.status);
        setQrImage(data.qrCodeBase64);
      } catch (e) { }
    }, 3000);
    
    // Request imediato ao abrir a aba
    fetch('/api/whatsapp/status')
      .then(r => r.json())
      .then(d => { setQrStatus(d.status); setQrImage(d.qrCodeBase64); })
      .catch(console.error);

    return () => clearInterval(interval);
  }, [activeTab]);

  const forcarReconexao = async () => {
    setQrStatus('conectando');
    await fetch('/api/whatsapp/connect', { method: 'POST', body: JSON.stringify({ forceStart: true }) });
  };

  // Filtrar conversas na Inbox
  const conversasFiltradas = conversasState.filter(c => {
    const matchBusca = c.nome.toLowerCase().includes(busca.toLowerCase()) || 
                       (c.empresa && c.empresa.toLowerCase().includes(busca.toLowerCase())) ||
                       c.telefone.includes(busca);
    return matchBusca;
  });

  function getStatusDot(status: string) {
    switch (status) {
      case 'novo': return 'bg-red-alert animate-pulse';
      case 'em_atendimento': return 'bg-blue-500';
      case 'aguardando': return 'bg-orange-alert';
      case 'resolvido': return 'bg-muted-foreground';
      default: return 'bg-muted-foreground';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'novo': return 'Novo';
      case 'em_atendimento': return 'Em Atendimento';
      case 'aguardando': return 'Aguardando';
      case 'resolvido': return 'Resolvido';
      default: return status;
    }
  }

  function getAvatarInitials(name: string) {
    if (!name) return "WA";
    return name.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase();
  }

  function formatTime(d: Date | string) {
    try {
      const date = new Date(d);
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  }

  async function handleSelectConversa(c: ConversaWA) {
    setConversaAtiva(c);
    setSugestaoIA(null);
    if (c.unreadCount > 0) {
      await markAsRead(c.id);
      setConversasState(prev => prev.map(conv => conv.id === c.id ? { ...conv, unreadCount: 0 } : conv));
    }
    const res = await getMensagens(c.id);
    if (res.success && res.data) {
      setMensagensAtivas(res.data);
    } else {
      setMensagensAtivas([]);
    }
  }

  // Enviar mensagem no chat ativo
  async function handleSendMessage() {
    if (!msgInput.trim() || !conversaAtiva) return;
    
    const conteudo = msgInput;
    setMsgInput("");
    setSugestaoIA(null);

    // Optimistic UI
    const tempId = Date.now().toString();
    const novaMsg: MensagemWA = {
      id: tempId,
      conversaId: conversaAtiva.id,
      tipo: "saida",
      conteudo,
      statusEnvio: "enviando",
      createdAt: new Date(),
    };
    
    setMensagensAtivas(prev => [...prev, novaMsg]);
    setConversasState(prev => prev.map(c => 
      c.id === conversaAtiva.id ? { ...c, ultimaMensagem: conteudo, updatedAt: new Date(), status: c.status === 'novo' ? 'em_atendimento' : c.status } : c
    ));

    const res = await enviarMensagem(conversaAtiva.id, conteudo);
    if (res.success && res.data) {
      setMensagensAtivas(prev => prev.map(m => m.id === tempId ? res.data as MensagemWA : m));
      // Se era novo, já altera pra em_atendimento no backend (mock behavior, or done manually)
      if (conversaAtiva.status === "novo") {
        await updateConversaStatus(conversaAtiva.id, "em_atendimento");
      }
    }

    // Simular IA respondendo se fosse uma pergunta (Apenas visual mock)
    if (conteudo.toLowerCase().includes("ajuda") || conteudo.toLowerCase().includes("ola")) {
      setTimeout(() => {
        setSugestaoIA("Olá! Aqui é a Magis IA. Que tal enviar o catálogo atualizado para este cliente?");
      }, 2000);
    }
  }

  // Encaminhar conversa para outro agente
  async function handleEncaminhar() {
    if (!agenteSelecionadoId || !conversaAtiva) return;
    const agente = AGENTES.find(u => u.id === agenteSelecionadoId);
    if (!agente) return;

    // Atualiza status e atendenteId
    await updateConversaStatus(conversaAtiva.id, "em_atendimento");
    
    // Atualiza UI local
    setConversasState(prev => prev.map(c => {
      if (c.id === conversaAtiva.id) {
        return {
          ...c,
          atendenteId: agente.id,
          status: 'em_atendimento'
        };
      }
      return c;
    }));

    setConversaAtiva(prev => prev ? { ...prev, atendenteId: agente.id, status: 'em_atendimento' } : null);
    setIsEncaminharOpen(false);
    setMsgEncaminhar("");
    setAgenteSelecionadoId("");
  }

  // Interação da IA de Fluxos
  async function handleGerarFluxoIA() {
    if (!fluxoIAChatInput.trim()) return;
    const prompt = fluxoIAChatInput;
    setFluxoIAChatHistory(prev => [...prev, { role: 'user', text: prompt }]);
    setFluxoIAChatInput("");
    setIsGerandoFluxo(true);

    setTimeout(async () => {
      const nome = prompt.length > 25 ? prompt.slice(0, 25) + "..." : prompt;
      
      const res = await createFluxoIA({
        nome,
        descricao: `Automação inteligente gerada por IA baseada no prompt: "${prompt}"`,
        gatilho: "mensagem_recebida",
        nodesJson: JSON.stringify([
          { id: "1", tipo: "gatilho", titulo: "Gatilho: Mensagem Recebida" },
          { id: "2", tipo: "condicao", titulo: "Condição: Análise IA" },
          { id: "3", tipo: "acao", titulo: "Ação: Responder" }
        ])
      });

      if (res.success && res.data) {
        setFluxosState(prev => [res.data as FluxoIA, ...prev]);
        setFluxoIAChatHistory(prev => [
          ...prev, 
          { role: 'assistant', text: `Entendido! Desenhei o fluxo "${nome}" com sucesso e ele já está ativo.` }
        ]);
      } else {
        setFluxoIAChatHistory(prev => [
          ...prev, 
          { role: 'assistant', text: "Ocorreu um erro ao salvar o fluxo no banco de dados." }
        ]);
      }
      setIsGerandoFluxo(false);
    }, 1800);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] min-h-0 bg-background/50 -m-6 p-6">
      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-border mb-6 shrink-0 justify-between">
        <div className="flex gap-4">
          {[
            { id: 'inbox', label: 'Caixa de Entrada', icon: MessageCircle },
            { id: 'pipeline', label: 'Pipeline de Atendimento', icon: Zap },
            { id: 'fluxos', label: 'Fluxos Inteligentes IA', icon: Sparkles },
            { id: 'config', label: 'Configurações WA', icon: Smartphone },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "flex items-center gap-2 pb-3 px-1 text-sm font-semibold border-b-2 transition-colors",
                activeTab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="w-4 h-4" /> {t.label}
            </button>
          ))}
        </div>
        <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5 bg-muted/50 px-2.5 py-1 rounded-full border border-border">
          <span className="w-2 h-2 rounded-full bg-green-positive" /> WhatsApp conectado e operacional
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* ── TAB 1: INBOX ────────────────────────────────────────── */}
          {activeTab === 'inbox' && (
            <div className="flex gap-4 flex-1 min-h-0 relative">
              {/* COLUMN 1: CONVERSATIONS */}
              <div className="w-80 flex flex-col bg-card border border-border rounded-xl shadow-sm shrink-0 overflow-hidden">
                <div className="p-3 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input 
                      placeholder="Buscar conversas..." 
                      className="pl-8 bg-muted/50 h-9 border-transparent focus:bg-background" 
                      value={busca} 
                      onChange={e => setBusca(e.target.value)} 
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/40">
                  {conversasFiltradas.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => handleSelectConversa(c)}
                      className={cn(
                        "p-3.5 cursor-pointer hover:bg-muted/40 transition-all relative flex items-start gap-3",
                        conversaAtiva?.id === c.id ? "bg-muted/50" : ""
                      )}
                    >
                      {conversaAtiva?.id === c.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                      
                      <div className="relative shrink-0 mt-0.5">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {getAvatarInitials(c.nome)}
                        </div>
                        <div className={cn("absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-card", getStatusDot(c.status))} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-sm font-semibold truncate text-foreground leading-tight">{c.nome}</p>
                          <span className="text-[10px] text-muted-foreground shrink-0 ml-1">{formatTime(c.updatedAt)}</span>
                        </div>
                        <p className={cn("text-xs truncate leading-normal", c.unreadCount > 0 ? "text-foreground font-bold" : "text-muted-foreground")}>
                          {c.ultimaMensagem || "Nenhuma mensagem"}
                        </p>
                        {c.unreadCount > 0 && (
                          <span className="absolute top-1/2 -translate-y-1/2 right-4 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                  {conversasFiltradas.length === 0 && (
                    <div className="p-6 text-center text-xs text-muted-foreground">Nenhuma conversa encontrada</div>
                  )}
                </div>
              </div>

              {/* COLUMN 2: ACTIVE CHAT */}
              <div className="flex-1 flex flex-col bg-card border border-border rounded-xl shadow-sm min-w-0">
                {conversaAtiva ? (
                  <>
                    <div className="h-16 border-b border-border flex items-center justify-between px-5 shrink-0 bg-muted/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                          {getAvatarInitials(conversaAtiva.nome)}
                        </div>
                        <div>
                          <h3 className="font-bold text-foreground leading-none">{conversaAtiva.nome}</h3>
                          <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5 font-medium">
                            <span className={cn("inline-flex w-1.5 h-1.5 rounded-full", getStatusDot(conversaAtiva.status))} /> 
                            {conversaAtiva.empresa || "Sem Empresa"} • {conversaAtiva.telefone}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => setIsEncaminharOpen(true)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-border bg-card hover:bg-muted text-foreground rounded-lg transition-colors"
                        >
                          <Forward className="w-3.5 h-3.5" /> Encaminhar
                        </button>
                        <button className="p-2 text-muted-foreground hover:bg-muted rounded-full">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Messages Panel */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50/40 dark:bg-slate-900/10">
                      <div className="flex flex-col gap-3">
                        {mensagensAtivas.map(m => (
                          <div key={m.id} className={cn("flex max-w-[70%] flex-col", m.tipo === 'saida' ? "self-end items-end" : "self-start items-start")}>
                            <div className={cn(
                              "px-4 py-2.5 rounded-2xl text-sm shadow-sm relative leading-relaxed",
                              m.tipo === 'saida' ? "bg-primary text-white rounded-tr-none" : "bg-muted border border-border/80 rounded-tl-none text-foreground"
                            )}>
                              {m.conteudo}
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-muted-foreground mt-1 px-1">
                                {formatTime(m.createdAt)}
                              </span>
                              {m.tipo === "saida" && (
                                <CheckCircle2 className={cn("w-3 h-3 mt-1", m.statusEnvio === "lido" ? "text-blue-500" : "text-muted-foreground")} />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* IA Suggested Reply Box */}
                    {sugestaoIA && (
                      <div className="p-4 mx-4 mt-2 bg-purple-ia/5 border border-purple-ia/30 border-dashed rounded-xl shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5 text-purple-ia">
                            <Sparkles className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-wider">Magis IA Sugere</span>
                          </div>
                          <span className="text-[10px] text-purple-ia/80 font-bold bg-purple-ia/10 px-2 py-0.5 rounded-full border border-purple-ia/20">Alta Confiança</span>
                        </div>
                        <p className="text-sm text-foreground italic leading-relaxed pl-3 border-l-2 border-purple-ia/30">
                          "{sugestaoIA}"
                        </p>
                        <div className="flex gap-2 mt-3 justify-end">
                          <button 
                            onClick={() => {
                              setMsgInput(sugestaoIA || "");
                              setSugestaoIA(null);
                            }}
                            className="text-xs px-3 py-1.5 bg-purple-ia hover:bg-purple-ia/90 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" /> Usar Resposta
                          </button>
                          <button 
                            onClick={() => setSugestaoIA(null)}
                            className="text-xs px-3 py-1.5 bg-muted text-muted-foreground hover:text-foreground rounded-lg font-medium hover:bg-muted/80 transition-colors border border-border"
                          >
                            Ignorar
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Reply Input Area */}
                    <div className="p-4 border-t border-border shrink-0 bg-card">
                      <div className="flex items-end gap-2 bg-muted/30 border border-border rounded-xl p-1 pr-2 shadow-inner">
                        <button className="p-3 text-muted-foreground hover:text-foreground shrink-0 transition-colors"><Paperclip className="w-5 h-5" /></button>
                        <textarea 
                          className="flex-1 bg-transparent border-none focus:ring-0 resize-none py-3 text-sm min-h-[44px] max-h-32 custom-scrollbar outline-none"
                          placeholder="Digite uma mensagem..."
                          value={msgInput}
                          onChange={e => setMsgInput(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                          rows={1}
                        />
                        <div className="flex gap-1 pb-1 shrink-0">
                          <button 
                            onClick={() => {
                              setMsgInput("Olá! Analisei seu histórico e verifiquei o produto. Segue link da cotação.")
                            }}
                            className="p-2.5 text-purple-ia hover:bg-purple-ia/10 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-bold border border-transparent hover:border-purple-ia/20"
                            title="Escrever com IA"
                          >
                            <Sparkles className="w-4 h-4" /> <span className="hidden xl:inline">Escrever com IA</span>
                          </button>
                          <button 
                            onClick={handleSendMessage}
                            disabled={!msgInput.trim()}
                            className="p-2.5 bg-primary text-white rounded-lg transition-all shadow-sm hover:bg-primary/90 disabled:opacity-40"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
                    <MessageCircle className="w-12 h-12 stroke-1" />
                    <p className="text-sm font-medium">Selecione uma conversa para iniciar o atendimento</p>
                  </div>
                )}
              </div>

              {/* COLUMN 3: CONTACT INFO */}
              {conversaAtiva && (
                <div className="w-72 flex flex-col bg-card border border-border rounded-xl shadow-sm shrink-0 overflow-y-auto custom-scrollbar p-5 space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl mx-auto mb-3 border border-primary/20">
                      {getAvatarInitials(conversaAtiva.nome)}
                    </div>
                    <h2 className="font-bold text-lg leading-tight text-foreground">{conversaAtiva.nome}</h2>
                    <p className="text-sm text-muted-foreground mt-0.5">{conversaAtiva.empresa || "Sem Empresa vinculada"}</p>
                    
                    <div className="flex flex-wrap justify-center gap-1.5 mt-4">
                      <span className="px-2.5 py-0.5 bg-muted text-muted-foreground rounded text-[10px] font-bold uppercase border border-border/80">Lead</span>
                      <button className="px-2 py-0.5 border border-dashed border-border text-muted-foreground hover:bg-muted rounded text-[10px] font-bold uppercase transition-colors">
                        + Add
                      </button>
                    </div>
                  </div>

                  {conversaAtiva.clienteId && (
                    <div className="bg-green-positive/5 border border-green-positive/20 rounded-xl p-3.5 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-positive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-green-positive uppercase tracking-wider">Cliente Base</p>
                        <p className="text-[10px] text-muted-foreground mt-1">Integração comercial ativa no CRM.</p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 pt-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Informações da Fila</p>
                    <div className="bg-muted/30 border border-border rounded-xl p-3.5 space-y-3 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5"><User className="w-4 h-4 opacity-75"/> Agente</span>
                        <span className="font-semibold">{AGENTES.find(a => a.id === conversaAtiva.atendenteId)?.nome || 'Fila Geral'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground flex items-center gap-1.5"><Zap className="w-4 h-4 opacity-75"/> Status</span>
                        <span className="font-semibold uppercase text-xs">{getStatusLabel(conversaAtiva.status)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <button className="w-full flex items-center justify-center gap-2 bg-purple-ia/10 hover:bg-purple-ia/20 text-purple-ia text-xs font-bold py-2.5 rounded-lg transition-colors border border-purple-ia/20">
                      <Sparkles className="w-4 h-4" /> Criar Tarefa com IA
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold py-2.5 rounded-lg transition-colors border border-border">
                      Ver Vendas e Propostas
                    </button>
                  </div>
                </div>
              )}

              {/* MODAL ENCAMINHAR */}
              {isEncaminharOpen && conversaAtiva && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                  <div className="w-full max-w-md bg-card border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                    <div className="px-6 py-4 border-b border-border bg-muted/30 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          <UserPlus className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg leading-tight">Encaminhar Atendimento</h3>
                          <p className="text-xs text-muted-foreground font-medium">Transferir conversa de <span className="font-bold text-foreground">{conversaAtiva.nome}</span></p>
                        </div>
                      </div>
                      <button onClick={() => setIsEncaminharOpen(false)} className="p-2 text-muted-foreground hover:bg-muted hover:text-foreground rounded-full transition-colors">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="p-6 space-y-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5"><User className="w-3.5 h-3.5"/> Selecionar Agente Comercial *</label>
                        <select 
                          className="w-full bg-background border border-input rounded-xl text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                          value={agenteSelecionadoId}
                          onChange={e => setAgenteSelecionadoId(e.target.value)}
                        >
                          <option value="">-- Escolha um atendente --</option>
                          {AGENTES.map(u => (
                            <option key={u.id} value={u.id}>{u.nome} ({u.perfil})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5"><AlignLeft className="w-3.5 h-3.5"/> Nota interna (Opcional)</label>
                        <textarea 
                          className="w-full bg-background border border-input rounded-xl text-sm px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm min-h-[100px] resize-y"
                          placeholder="Alguma instrução para o colega?"
                          value={msgEncaminhar}
                          onChange={e => setMsgEncaminhar(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 border-t border-border bg-muted/30 flex gap-3 justify-end items-center">
                      <button 
                        onClick={() => setIsEncaminharOpen(false)}
                        className="px-5 py-2.5 border border-input bg-background hover:bg-muted text-foreground rounded-xl text-sm font-bold transition-all shadow-sm"
                      >
                        Cancelar
                      </button>
                      <button 
                        onClick={handleEncaminhar}
                        disabled={!agenteSelecionadoId}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Forward className="w-4 h-4" /> Transferir
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── TAB 2: PIPELINE ─────────────────────────────────────── */}
          {activeTab === 'pipeline' && (
            <div className="flex-1 flex gap-4 overflow-x-auto pb-4 items-start min-h-0 custom-scrollbar">
              {['novo', 'em_atendimento', 'aguardando', 'resolvido'].map(status => {
                const list = conversasState.filter(c => c.status === status);
                
                return (
                  <div key={status} className="flex flex-col w-[300px] shrink-0 h-full max-h-full bg-muted/30 rounded-xl border border-border/50">
                    <div className="p-3.5 border-b border-border/50 flex flex-col gap-1.5 shrink-0">
                      <div className="flex items-center justify-between">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border",
                          status === 'novo' ? 'bg-red-alert/10 text-red-alert border-red-alert/20' :
                          status === 'em_atendimento' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          status === 'aguardando' ? 'bg-orange-alert/10 text-orange-alert border-orange-alert/20' :
                          'bg-muted text-muted-foreground border-border'
                        )}>
                          {getStatusLabel(status)}
                        </span>
                        <span className="text-xs text-muted-foreground font-bold bg-muted px-2 py-0.5 rounded-full">
                          {list.length}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                      {list.map(c => (
                        <Card key={c.id} className="border border-border/60 shadow-sm hover:shadow-md transition-all bg-card">
                          <CardContent className="p-3.5 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-bold text-sm truncate">{c.nome}</p>
                                <p className="text-xs text-muted-foreground truncate">{c.empresa}</p>
                              </div>
                            </div>

                            <div className="bg-muted/40 p-2 rounded border border-border/50 text-xs text-muted-foreground line-clamp-2">
                              {c.ultimaMensagem || "Sem mensagens."}
                            </div>

                            <button 
                              onClick={() => {
                                handleSelectConversa(c);
                                setActiveTab('inbox');
                              }}
                              className="w-full mt-1 bg-primary/10 hover:bg-primary text-primary hover:text-white border border-primary/20 text-xs font-bold py-1.5 rounded-lg transition-colors"
                            >
                              Abrir Atendimento
                            </button>
                          </CardContent>
                        </Card>
                      ))}
                      {list.length === 0 && (
                        <div className="py-12 text-center text-xs text-muted-foreground">Nenhum atendimento na fila</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── TAB 3: FLUXOS INTELIGENTES ──────────────────────────── */}
          {activeTab === 'fluxos' && (
            <div className="flex gap-6 flex-1 min-h-0">
              
              {/* LEFT: FLOW LIST & NODE VIEW */}
              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold tracking-tight">Fluxos de Operação Activa</h2>
                    <p className="text-sm text-muted-foreground">Regras e gatilhos de IA para respostas automáticas</p>
                  </div>
                  <button 
                    onClick={() => {
                      setFluxoIAChatHistory(prev => [...prev, { role: 'assistant', text: "Ok, qual tipo de fluxo quer criar? Pode dizer 'Criar fluxo de lead inativo' ou 'Gatilho de preço de cimento'." }])
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Novo Fluxo
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fluxosState.map(f => (
                    <div key={f.id} className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between gap-4 group hover:border-purple-ia/30 transition-colors">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-ia" />
                            <h3 className="font-bold text-base text-foreground">{f.nome}</h3>
                          </div>
                          <button 
                            className={cn("w-10 h-5 rounded-full relative flex items-center px-1 transition-colors cursor-default", f.ativo ? "bg-green-positive" : "bg-muted")}
                          >
                            <div className={cn("w-3.5 h-3.5 rounded-full bg-white transition-all shadow-sm", f.ativo ? "ml-auto" : "mr-auto")} />
                          </button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{f.descricao}</p>
                        
                        <div className="mt-4 p-3 bg-muted/40 border border-border/60 rounded-lg space-y-2">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Visualização dos Nós</p>
                          <div className="flex items-center flex-wrap gap-1 text-xs">
                            <span className="px-2 py-1 bg-background border rounded font-medium text-foreground">Gatilho</span>
                            <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
                            <span className="px-2 py-1 bg-background border rounded font-medium text-foreground">Ação</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-4 border-t border-border/50 pt-4 text-xs">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Disparos</p>
                          <p className="font-bold text-sm mt-0.5">{f.disparos}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold">Resoluções IA</p>
                          <p className="font-bold text-sm text-purple-ia mt-0.5">{f.resolucoes}</p>
                        </div>
                        <div className="ml-auto">
                          <span className="text-xs text-muted-foreground">{formatTime(f.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Explainer */}
                <div className="bg-purple-ia/5 border border-purple-ia/20 rounded-xl p-5 mt-6">
                  <h3 className="font-bold text-purple-ia text-sm flex items-center gap-1.5 mb-2">
                    <ShieldAlert className="w-4 h-4" /> Autonomia Supervisionada
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Nossos fluxos inteligentes cruzam as interações no WhatsApp com a base de dados em tempo real (ERP + CRM). Quando um cliente pergunta sobre disponibilidade de estoque ou preço, a Magis IA formula a resposta ideal baseada no estoque e margem comercial cadastrados e apresenta na Inbox, ou responde automaticamente conforme configurado.
                  </p>
                </div>
              </div>

              {/* RIGHT: CHAT COM IA PARA MONTAR FLUXOS */}
              <div className="w-[380px] bg-card border border-purple-ia/30 rounded-xl shadow-xl flex flex-col overflow-hidden shrink-0 h-full">
                <div className="h-16 border-b border-border bg-gradient-to-b from-purple-ia/10 to-transparent flex items-center px-4 gap-2.5 shrink-0">
                  <Sparkles className="w-5 h-5 text-purple-ia" />
                  <div>
                    <h3 className="font-bold text-sm">Criador de Fluxo por IA</h3>
                    <p className="text-[10px] text-purple-ia flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 bg-green-positive rounded-full animate-pulse" /> Magis IA Online
                    </p>
                  </div>
                </div>

                {/* Chat Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar text-xs">
                  {fluxoIAChatHistory.map((m, i) => (
                    <div key={i} className={cn("flex flex-col max-w-[85%]", m.role === 'user' ? "self-end items-end ml-auto" : "self-start items-start mr-auto")}>
                      <div className={cn(
                        "px-3.5 py-2 rounded-xl shadow-sm leading-relaxed",
                        m.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-muted border border-border rounded-tl-none text-foreground"
                      )}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {isGerandoFluxo && (
                    <div className="flex gap-1 items-center bg-muted border p-3 rounded-lg w-20">
                      <span className="w-1.5 h-1.5 bg-purple-ia rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-ia rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-purple-ia rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                </div>

                {/* Input Area */}
                <div className="p-3 border-t border-border bg-card shrink-0">
                  <div className="flex gap-1.5 relative">
                    <Input 
                      placeholder="Ex: Crie um fluxo para fora de hora..."
                      className="bg-muted/40 text-xs pr-10 border-border"
                      value={fluxoIAChatInput}
                      onChange={e => setFluxoIAChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleGerarFluxoIA()}
                    />
                    <button 
                      onClick={handleGerarFluxoIA}
                      disabled={isGerandoFluxo}
                      className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 text-purple-ia hover:bg-purple-ia/10 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: CONFIGURAÇÕES WA (QR CODE) ──────────────────────────── */}
          {activeTab === 'config' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-card border border-border rounded-xl shadow-sm">
              <div className="max-w-md w-full space-y-6 text-center">
                <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
                  <Smartphone className="w-8 h-8" />
                </div>
                
                <h2 className="text-2xl font-bold tracking-tight">Conexão do Aparelho</h2>
                <p className="text-sm text-muted-foreground">
                  Escaneie o QR Code abaixo usando o seu WhatsApp para vincular o Magister como um aparelho conectado.
                </p>

                <div className="bg-muted/30 p-8 rounded-2xl border border-border flex flex-col items-center justify-center min-h-[300px]">
                  {qrStatus === 'conectando' && (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="font-medium">Gerando conexão segura...</p>
                    </div>
                  )}
                  {qrStatus === 'qr_code_pronto' && qrImage && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <img src={qrImage} alt="WhatsApp QR Code" className="w-64 h-64 object-contain" />
                      </div>
                      <p className="text-xs font-bold text-orange-500 bg-orange-500/10 py-1.5 px-3 rounded-lg border border-orange-500/20 inline-block">
                        Aguardando scan...
                      </p>
                    </div>
                  )}
                  {qrStatus === 'conectado' && (
                    <div className="flex flex-col items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center border border-green-500/20 mb-2 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
                        <CheckCircle2 className="w-10 h-10" />
                      </div>
                      <p className="text-lg font-bold text-green-500">Aparelho Conectado!</p>
                      <p className="text-sm text-muted-foreground">O Magister agora está recebendo as mensagens do seu WhatsApp em tempo real.</p>
                    </div>
                  )}
                  {qrStatus === 'desconectado' && (
                    <div className="flex flex-col items-center gap-4 text-muted-foreground">
                      <ShieldAlert className="w-12 h-12 opacity-50" />
                      <p className="font-medium">Desconectado</p>
                      <Button onClick={() => forcarReconexao()} className="mt-2">
                        Gerar novo QR Code
                      </Button>
                    </div>
                  )}
                </div>

                <div className="bg-blue-500/5 p-4 rounded-xl text-left border border-blue-500/10">
                  <h4 className="text-sm font-bold text-blue-600 mb-1 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Como conectar
                  </h4>
                  <ol className="text-xs text-muted-foreground list-decimal list-inside space-y-1 mt-2">
                    <li>Abra o WhatsApp no seu celular</li>
                    <li>Toque em Mais opções (Android) ou Configurações (iPhone)</li>
                    <li>Toque em Aparelhos conectados e em Conectar um aparelho</li>
                    <li>Aponte a câmera do seu celular para esta tela</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

        </>
      )}
    </div>
  );
}
