/**
 * RAG Engine — implementação própria sem dependência do @langchain/community.
 * - Vector Store em memória com similaridade de cossenos (puro TypeScript).
 * - Embeddings via Ollama API (nomic-embed-text).
 * - Inferência via Ollama API (llama3) com prompt restrito ao contexto.
 * - Fallback heurístico se o Ollama estiver offline.
 */

import prisma from "@/lib/prisma";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const CHAT_MODEL     = process.env.OLLAMA_CHAT_MODEL     || "llama3";
const EMBED_MODEL    = process.env.OLLAMA_EMBED_MODEL    || "nomic-embed-text";

// ── Tipos ──────────────────────────────────────────────────────────────────────

interface VectorDoc {
  id: string;
  content: string;
  type: string;
  embedding: number[];
}

// ── Singleton em memória ───────────────────────────────────────────────────────

declare global {
  var __ragDocs: VectorDoc[] | null;
}
if (!global.__ragDocs) global.__ragDocs = null;

// ── Helpers matemáticos ────────────────────────────────────────────────────────

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// ── Ollama API calls ───────────────────────────────────────────────────────────

async function ollamaHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      signal: AbortSignal.timeout(2500),
    });
    return r.ok;
  } catch {
    return false;
  }
}

async function ollamaEmbed(text: string): Promise<number[]> {
  const r = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: EMBED_MODEL, input: text }),
    signal: AbortSignal.timeout(15000),
  });
  if (!r.ok) throw new Error(`Ollama embed error: ${r.status}`);
  const json = await r.json();
  // Ollama /api/embed retorna { embeddings: [[...]] }
  return json.embeddings?.[0] ?? json.embedding ?? [];
}

async function ollamaChat(system: string, userMsg: string): Promise<string> {
  const r = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: CHAT_MODEL,
      stream: false,
      options: { temperature: 0.2 },
      messages: [
        { role: "system", content: system },
        { role: "user",   content: userMsg },
      ],
    }),
    signal: AbortSignal.timeout(60000),
  });
  if (!r.ok) throw new Error(`Ollama chat error: ${r.status}`);
  const json = await r.json();
  return json.message?.content ?? "";
}

// ── Vetorização do banco ───────────────────────────────────────────────────────

export async function vectorizeSystemData(): Promise<boolean> {
  const online = await ollamaHealth();
  if (!online) return false;

  const [clientes, produtos, negociacoes, lancamentos] = await Promise.all([
    prisma.cliente.findMany({
      select: { id: true, nome: true, empresa: true, segmento: true, score: true, status: true },
      take: 200,
    }),
    prisma.produto.findMany({
      select: { id: true, nome: true, categoria: true, risco: true, estoqueAtual: true, preco: true },
      take: 100,
    }),
    prisma.negociacao.findMany({
      select: { id: true, valor: true, status: true, vendedor: true, probabilidade: true },
      take: 150,
    }),
    prisma.lancamentoFinanceiro.findMany({
      select: { id: true, descricao: true, valor: true, tipo: true, status: true },
      take: 100,
    }).catch(() => []),
  ]);

  const rawDocs: Omit<VectorDoc, "embedding">[] = [
    // Sumário geral
    {
      id: "sistema",
      content: `Resumo geral: ${clientes.length} clientes, ${produtos.length} produtos, ${negociacoes.length} negócios no CRM, ${lancamentos.length} lançamentos financeiros.`,
      type: "sistema",
    },
    // Clientes
    ...clientes.map(c => ({
      id: `c-${c.id}`,
      content: `Cliente: ${c.nome}. Empresa: ${c.empresa || "N/A"}. Segmento: ${c.segmento}. Status: ${c.status}. Score: ${c.score}/100.`,
      type: "cliente",
    })),
    // Estoque
    ...produtos.map(p => ({
      id: `p-${p.id}`,
      content: `Produto: ${p.nome}. Categoria: ${p.categoria}. Preço: R$${p.preco}. Estoque atual: ${p.estoqueAtual} unidades. Risco de ruptura: ${p.risco}.`,
      type: "estoque",
    })),
    // Vendas/CRM
    ...negociacoes.map((n: any) => ({
      id: `n-${n.id}`,
      content: `Negociação no CRM. Valor: R$${n.valor}. Fase: ${n.status}. Vendedor: ${n.vendedor}. Probabilidade de fechar: ${n.probabilidade}%.`,
      type: "venda",
    })),
    // Financeiro
    ...lancamentos.map((l: any) => ({
      id: `l-${l.id}`,
      content: `Lançamento: ${l.descricao}. Valor: R$${l.valor}. Tipo: ${l.tipo}. Status: ${l.status}.`,
      type: "financeiro",
    })),
  ];

  // Gerar embeddings em paralelo (batches de 10)
  const docs: VectorDoc[] = [];
  const BATCH = 10;
  for (let i = 0; i < rawDocs.length; i += BATCH) {
    const batch = rawDocs.slice(i, i + BATCH);
    const embeddings = await Promise.all(batch.map(d => ollamaEmbed(d.content)));
    batch.forEach((d, j) => docs.push({ ...d, embedding: embeddings[j] }));
  }

  global.__ragDocs = docs;
  console.log(`✅ RAG: ${docs.length} nós vetorizados.`);
  return true;
}

// ── Busca semântica ────────────────────────────────────────────────────────────

async function semanticSearch(query: string, k = 5): Promise<VectorDoc[]> {
  if (!global.__ragDocs || global.__ragDocs.length === 0) return [];
  const queryVec = await ollamaEmbed(query);
  return [...global.__ragDocs]
    .map(doc => ({ doc, score: cosineSimilarity(queryVec, doc.embedding) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map(x => x.doc);
}

// ── Query principal ────────────────────────────────────────────────────────────

export async function predictiveChatQuery(userQuery: string) {
  const online = await ollamaHealth();
  if (!online) return _fallback(userQuery);

  // Vetoriza na primeira chamada
  if (!global.__ragDocs) {
    await vectorizeSystemData();
  }

  const results = await semanticSearch(userQuery, 5);
  const context = results.map(r => r.content).join("\n---\n") || "Sem contexto relevante encontrado.";
  const nodes   = Array.from(new Set(results.map(r => r.type.toUpperCase())));

  const systemPrompt = `Você é a Magis IA, assistente preditivo do sistema Magister ERP.
Responda em português, de forma direta e analítica, focada em lucro e ação executiva.
Use APENAS o contexto abaixo para formular sua resposta.
Se o contexto não contiver a informação, diga que não há dados suficientes.

CONTEXTO VETORIZADO DA EMPRESA:
${context}`;

  const text = await ollamaChat(systemPrompt, userQuery);
  return { text, nodes, isRAG: true };
}

// ── Fallback heurístico ────────────────────────────────────────────────────────

function _fallback(query: string) {
  const q = query.toLowerCase();
  let text = "O Ollama (IA local) está offline. Resposta heurística baseada em palavras-chave:\n\n";

  if (q.includes("ruptura") || q.includes("estoque")) {
    text += "Verifique os produtos em risco crítico de ruptura na aba de Estoque. Itens com quantidade abaixo do mínimo precisam de reposição urgente.";
  } else if (q.includes("inativo") || q.includes("reativar") || q.includes("cliente")) {
    text += "Clientes inativos há mais de 60 dias representam uma oportunidade imediata. Crie uma campanha de reativação com desconto ou lembrete personalizado.";
  } else if (q.includes("venda") || q.includes("fechar") || q.includes("pipeline")) {
    text += "Priorize as negociações na fase 'Negociação' e 'Em Atendimento' — são as com maior probabilidade de fechamento imediato.";
  } else if (q.includes("financeiro") || q.includes("meta") || q.includes("receita")) {
    text += "Verifique o painel Financeiro para acompanhar o progresso da meta mensal e os lançamentos em aberto.";
  } else {
    text += "Para análise preditiva completa, inicie o Ollama localmente: `ollama serve` e `ollama pull llama3`.";
  }

  return { text, nodes: ["FALLBACK_HEURISTICO"], isRAG: false };
}
