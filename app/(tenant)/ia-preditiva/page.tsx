"use client";

import { useState, useRef, useEffect } from "react";
import {
  Sparkles, BrainCircuit, Database, Network, Send, FileUp,
  CheckCircle2, FileText, FileSpreadsheet, Loader2, BarChart3,
  Users, Package, TrendingUp, File, Trash2, X, ChevronRight
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "magis";
  text: string;
  nodes?: string[];
  isRAG?: boolean;
  timestamp?: Date;
};

type KnowledgeFile = {
  id: string;
  name: string;
  type: "pdf" | "excel" | "csv" | "other";
  size: string;
  status: "processing" | "vectorized";
  chunks?: number;
  progress?: number;
};

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Clientes com alta probabilidade de recompra", color: "text-green-500" },
  { icon: Package, label: "Produtos em risco crítico de ruptura", color: "text-red-500" },
  { icon: Users, label: "Leads inativos há mais de 60 dias para reativar", color: "text-blue-500" },
  { icon: BarChart3, label: "Resumo de performance financeira do mês", color: "text-purple-500" },
  { icon: TrendingUp, label: "Negociações com maior probabilidade de fechar", color: "text-orange-500" },
  { icon: Package, label: "Capital imobilizado em estoque parado", color: "text-yellow-500" },
];

const DB_SOURCES = [
  { label: "Clientes", count: "847 registros", icon: Users, color: "bg-blue-500/10 text-blue-600 border-blue-200" },
  { label: "Estoque", count: "50 produtos", icon: Package, color: "bg-orange-500/10 text-orange-600 border-orange-200" },
  { label: "Pipeline", count: "120 negócios", icon: TrendingUp, color: "bg-green-500/10 text-green-600 border-green-200" },
  { label: "Financeiro", count: "12 meses", icon: BarChart3, color: "bg-purple-500/10 text-purple-600 border-purple-200" },
];

export default function IAPreditivaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "magis",
      text: "Olá. Sou o motor preditivo do Magister ERP.\n\nFui carregado com os dados do seu banco relacional (Clientes, Estoque, Pipeline, Financeiro) e qualquer documento que você adicionar à base de conhecimento à esquerda.\n\nUse as sugestões rápidas abaixo ou escreva sua análise diretamente.",
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [vectorizingPhase, setVectorizingPhase] = useState<string | null>(null);
  const [files, setFiles] = useState<KnowledgeFile[]>([
    { id: "f1", name: "Relatorio_Anual_2025.pdf", type: "pdf", size: "2.1 MB", status: "vectorized", chunks: 134 },
    { id: "f2", name: "Base_Clientes_Regiao.xlsx", type: "excel", size: "840 KB", status: "vectorized", chunks: 67 },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  async function handleSend(text?: string) {
    const msg = text ?? input;
    if (!msg.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    const phases = [
      "Convertendo pergunta em vetor de alta dimensão...",
      "Buscando similaridade de cossenos no Vector DB...",
      "Injetando contexto no prompt do LLM...",
      "Aguardando inferência do Ollama...",
    ];

    for (const phase of phases) {
      setVectorizingPhase(phase);
      await new Promise(r => setTimeout(r, 500));
    }

    try {
      const res = await fetch("/api/jarmis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem: msg, modulo: "rag" }),
      });
      const json = await res.json();
      setVectorizingPhase(null);

      if (json.diagnostico) {
        let text = json.diagnostico;
        if (json.recomendacao) text += "\n\n" + json.recomendacao;
        if (json.proximoPasso) text += "\n\n" + json.proximoPasso;
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: "magis",
          text: text,
          nodes: [],
          isRAG: true,
          timestamp: new Date(),
        }]);
      } else throw new Error(json.error || "Erro na resposta");
    } catch (err: any) {
      setVectorizingPhase(null);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: "magis",
        text: `Erro ao consultar o motor de RAG.\n\n${err.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }

  function processFile(file: File) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
    const type: KnowledgeFile["type"] =
      ext === "pdf" ? "pdf" :
      ["xlsx", "xls"].includes(ext) ? "excel" :
      ext === "csv" ? "csv" : "other";

    const sizeKB = file.size / 1024;
    const sizeLabel = sizeKB > 1024 ? `${(sizeKB / 1024).toFixed(1)} MB` : `${Math.round(sizeKB)} KB`;

    const newFile: KnowledgeFile = {
      id: Date.now().toString(),
      name: file.name,
      type,
      size: sizeLabel,
      status: "processing",
      progress: 0,
    };

    setFiles(prev => [newFile, ...prev]);

    // Animar progresso de vetorização
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 18) + 8;
      if (progress >= 100) {
        clearInterval(interval);
        setFiles(prev => prev.map(f =>
          f.id === newFile.id
            ? { ...f, status: "vectorized", progress: 100, chunks: Math.floor(Math.random() * 200) + 30 }
            : f
        ));
      } else {
        setFiles(prev => prev.map(f => f.id === newFile.id ? { ...f, progress } : f));
      }
    }, 250);
  }

  const getFileIcon = (type: KnowledgeFile["type"]) => {
    if (type === "pdf") return <FileText className="w-4 h-4 text-red-500" />;
    if (type === "excel") return <FileSpreadsheet className="w-4 h-4 text-green-600" />;
    if (type === "csv") return <FileSpreadsheet className="w-4 h-4 text-teal-500" />;
    return <File className="w-4 h-4 text-blue-500" />;
  };

  const formatTime = (d?: Date) => d ? d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "";

  const totalChunks = files.filter(f => f.status === "vectorized").reduce((a, f) => a + (f.chunks ?? 0), 0);

  return (
    <div className="flex h-[calc(100vh-8rem)] min-h-0 bg-muted/20 -m-6 p-6 gap-5">

      {/* ─── COLUNA ESQUERDA ─────────────────────────────── */}
      <div className="w-[340px] shrink-0 flex flex-col gap-4 h-full min-h-0">

        {/* Motor Vetorial */}
        <Card className="border-border/60 shadow-sm shrink-0">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
              <BrainCircuit className="w-4 h-4 text-primary" />
              Motor Vetorial (RAG)
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            {/* Status Ollama */}
            <div className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2 border border-border/40">
              <span className="text-xs text-muted-foreground font-medium">Ollama Local</span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> ONLINE
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                <div className="text-muted-foreground mb-0.5">LLM</div>
                <div className="font-mono font-semibold">llama3</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                <div className="text-muted-foreground mb-0.5">Embeddings</div>
                <div className="font-mono font-semibold">nomic-embed</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                <div className="text-muted-foreground mb-0.5">Vector Store</div>
                <div className="font-mono font-semibold">Memory</div>
              </div>
              <div className="bg-muted/30 rounded-lg p-2 border border-border/30">
                <div className="text-muted-foreground mb-0.5">Nós Ativos</div>
                <div className="font-mono font-semibold text-primary">{1200 + totalChunks}</div>
              </div>
            </div>

            {/* Fontes do ERP */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
                Fontes de Dados ERP
              </div>
              {DB_SOURCES.map(s => (
                <div key={s.label} className={cn("flex items-center justify-between px-2.5 py-1.5 rounded-md border text-xs", s.color)}>
                  <span className="flex items-center gap-1.5 font-medium">
                    <s.icon className="w-3.5 h-3.5" /> {s.label}
                  </span>
                  <span className="font-mono text-[10px] opacity-70">{s.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Base de Conhecimento */}
        <Card className="border-border/60 shadow-sm flex-1 min-h-0 flex flex-col">
          <CardHeader className="pb-2 pt-4 px-4 shrink-0">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
              <Database className="w-4 h-4 text-blue-500" />
              Base de Conhecimento
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 flex-1 flex flex-col gap-3 min-h-0">

            {/* Drop Zone */}
            <div
              className={cn(
                "relative border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-2 py-5 text-center transition-all cursor-pointer shrink-0",
                isDragging
                  ? "border-primary bg-primary/5 scale-[1.01]"
                  : "border-border/50 hover:border-primary/40 hover:bg-muted/30"
              )}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={e => {
                e.preventDefault();
                setIsDragging(false);
                Array.from(e.dataTransfer.files).forEach(processFile);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                accept=".pdf,.xlsx,.xls,.csv,.doc,.docx,.txt"
                onChange={e => Array.from(e.target.files ?? []).forEach(processFile)}
              />
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center border border-border/50">
                <FileUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {isDragging ? "Solte para adicionar" : "Arraste ou clique para enviar"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">PDF, Excel, CSV, Word • Máx 10MB</p>
              </div>
            </div>

            {/* Lista de Arquivos */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
              {files.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4 opacity-60">
                  Nenhum documento adicionado ainda.
                </p>
              )}
              {files.map(f => (
                <div
                  key={f.id}
                  className="p-2.5 bg-muted/20 border border-border/40 rounded-xl overflow-hidden relative group hover:border-border/80 transition-colors"
                >
                  {/* Barra de progresso */}
                  {f.status === "processing" && (
                    <div className="absolute bottom-0 left-0 h-0.5 bg-primary transition-all" style={{ width: `${f.progress ?? 0}%` }} />
                  )}

                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-background border border-border/50 flex items-center justify-center shrink-0">
                      {getFileIcon(f.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate leading-tight" title={f.name}>{f.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                        {f.status === "processing" ? (
                          <>
                            <Loader2 className="w-3 h-3 animate-spin text-primary" />
                            <span className="text-primary font-medium">Vetorizando... {f.progress ?? 0}%</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-green-600 font-medium">{f.chunks} nós</span>
                            <span className="opacity-50">• {f.size}</span>
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))}
                      className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── COLUNA DIREITA: CHAT ────────────────────────── */}
      <Card className="flex-1 border-border/60 shadow-sm flex flex-col overflow-hidden">

        {/* Header */}
        <div className="h-14 border-b border-border/40 flex items-center px-5 gap-2 shrink-0 bg-muted/10">
          <Sparkles className="w-4 h-4 text-primary" />
          <div>
            <h3 className="font-semibold text-sm leading-tight">Magis IA — Terminal de Inferência</h3>
            <p className="text-[10px] text-muted-foreground font-mono">RAG • {1200 + totalChunks} nós • {files.length} documentos externos</p>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 custom-scrollbar">
          {messages.map(m => (
            <div key={m.id} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn(
                "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm space-y-1",
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-muted/40 border border-border/50 rounded-bl-sm"
              )}>
                <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{m.text}</p>
                {m.nodes && m.nodes.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-2 border-t border-border/20 mt-2">
                    {m.nodes.map((n, i) => (
                      <span key={i} className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-background border border-border/50 rounded text-muted-foreground">
                        <Network className="w-2.5 h-2.5" />{n}
                      </span>
                    ))}
                  </div>
                )}
                <p suppressHydrationWarning className="text-[10px] opacity-40 text-right">{formatTime(m.timestamp)}</p>
              </div>
            </div>
          ))}

          {/* Loader RAG */}
          {isLoading && vectorizingPhase && (
            <div className="flex justify-start">
              <div className="bg-muted/20 border border-border/40 rounded-2xl rounded-bl-sm px-4 py-3 text-xs text-muted-foreground flex items-center gap-2 max-w-sm">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                <span>{vectorizingPhase}</span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Sugestões Rápidas */}
        {messages.length <= 2 && !isLoading && (
          <div className="px-5 pb-3 shrink-0">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Análises rápidas sugeridas</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_PROMPTS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q.label)}
                  className="text-left text-xs flex items-start gap-2 p-3 bg-muted/20 hover:bg-muted/40 border border-border/40 hover:border-border rounded-xl transition-all group"
                >
                  <q.icon className={cn("w-3.5 h-3.5 mt-0.5 shrink-0", q.color)} />
                  <span className="text-muted-foreground group-hover:text-foreground transition-colors leading-snug">{q.label}</span>
                  <ChevronRight className="w-3 h-3 text-muted-foreground/40 shrink-0 ml-auto mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-5 pb-5 pt-3 border-t border-border/40 shrink-0 bg-background/50">
          <div className="flex gap-2">
            <input
              className="flex-1 h-11 rounded-xl bg-muted/30 border border-border/60 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all placeholder:text-muted-foreground"
              placeholder="Pergunte sobre dados do ERP ou documentos adicionados..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              disabled={isLoading}
            />
            <Button
              className="h-11 w-11 rounded-xl shrink-0 p-0 bg-primary hover:bg-primary/90"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
