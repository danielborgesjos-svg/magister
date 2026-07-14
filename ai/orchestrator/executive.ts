/**
 * ai/orchestrator/executive.ts
 * Motor de Inteligência Executiva da Magister Tech.
 * Fornece análises profundas de Produtos, Clientes e Oportunidades usando dados reais do ERP.
 */

import prisma from "@/lib/prisma";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface ProdutoExecutivo {
  id: string;
  nome: string;
  categoria?: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  precoVenda: number;
  custo: number;
  margem: number;       // %
  giro: number;         // vendas nos últimos 90 dias
  faturamento90d: number;
  statusEstoque: "ruptura" | "critico" | "ok" | "excesso";
  curva: "A" | "B" | "C";
  tendencia: "crescimento" | "estavel" | "queda";
  receitaEstimadaMes: number;
  diasParado: number;
}

export interface ClienteExecutivo {
  id: string;
  nome: string;
  email?: string;
  telefone?: string;
  status: string;
  score: number;
  totalComprado: number;    // R$ histórico
  ultimaCompra?: Date;
  frequenciaCompra: number; // compras por mês (média)
  ticketMedio: number;
  probabilidadeRecompra: "Muito Alta" | "Alta" | "Média" | "Baixa";
  diasSemContato: number;
  risco: "Churn" | "Ativo" | "Novo" | "VIP";
  produtosRecomendados: string[];
  responsavel?: string;
  melhorHorario: string;
  melhorCanal: string;
  segmento?: string;
}

export interface OportunidadeExecutiva {
  tipo: "lead_esquecido" | "follow_up_atrasado" | "tarefa_critica" | "contrato_vencendo" | "campanha_urgente" | "cliente_inativo_vip";
  prioridade: "CRITICA" | "ALTA" | "MEDIA";
  titulo: string;
  descricao: string;
  entidadeId?: string;
  entidadeNome?: string;
  prazoHoras?: number;
  acao: string;
}

// ─── Análise de Produtos ──────────────────────────────────────────────────────

export async function getProdutosExecutivo(): Promise<ProdutoExecutivo[]> {
  const noventaDiasAtras = new Date();
  noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

  const produtos = await prisma.produto.findMany({
    where: { status: "ativo" },
    include: {
      itensVenda: {
        where: { venda: { createdAt: { gte: noventaDiasAtras } } },
        select: { quantidade: true, preco: true, venda: { select: { createdAt: true } } }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return produtos.map((p) => {
    const giro = p.itensVenda.reduce((acc, i) => acc + (i.quantidade || 0), 0);
    const faturamento90d = p.itensVenda.reduce((acc, i) => acc + ((i.quantidade || 0) * (i.preco || 0)), 0);
    const custo = p.custo || 0;
    const preco = p.preco || 0;
    const margem = preco > 0 ? ((preco - custo) / preco) * 100 : 0;
    const receitaEstimadaMes = (faturamento90d / 90) * 30;

    let statusEstoque: ProdutoExecutivo["statusEstoque"] = "ok";
    if (p.estoqueAtual <= 0) statusEstoque = "ruptura";
    else if (p.estoqueAtual <= p.estoqueMinimo) statusEstoque = "critico";
    else if (p.estoqueAtual > p.estoqueMinimo * 5 && giro < 5) statusEstoque = "excesso";

    // Curva ABC por faturamento
    let curva: "A" | "B" | "C" = "C";
    if (faturamento90d > 10000) curva = "A";
    else if (faturamento90d > 2000) curva = "B";

    // Tendência por comparação últimos 30 vs 60 dias
    const hoje = new Date();
    const trintaDiasAtras = new Date(hoje);
    trintaDiasAtras.setDate(hoje.getDate() - 30);
    const sessentaDiasAtras = new Date(hoje);
    sessentaDiasAtras.setDate(hoje.getDate() - 60);

    const vendas30 = p.itensVenda.filter(i => i.venda && i.venda.createdAt >= trintaDiasAtras).reduce((a, i) => a + (i.quantidade || 0), 0);
    const vendas30_60 = p.itensVenda.filter(i => i.venda && i.venda.createdAt >= sessentaDiasAtras && i.venda.createdAt < trintaDiasAtras).reduce((a, i) => a + (i.quantidade || 0), 0);
    
    let tendencia: ProdutoExecutivo["tendencia"] = "estavel";
    if (vendas30 > vendas30_60 * 1.2) tendencia = "crescimento";
    else if (vendas30 < vendas30_60 * 0.8) tendencia = "queda";

    return {
      id: p.id,
      nome: p.nome,
      categoria: p.categoria || undefined,
      estoqueAtual: p.estoqueAtual,
      estoqueMinimo: p.estoqueMinimo,
      precoVenda: preco,
      custo,
      margem: Math.round(margem),
      giro,
      faturamento90d: Math.round(faturamento90d),
      statusEstoque,
      curva,
      tendencia,
      receitaEstimadaMes: Math.round(receitaEstimadaMes),
      diasParado: p.diasParado || 0,
    };
  });
}

// ─── Análise de Clientes ──────────────────────────────────────────────────────

export async function getClientesExecutivo(): Promise<ClienteExecutivo[]> {
  const noventaDiasAtras = new Date();
  noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

  let clientes: any[] = [];
  try {
    clientes = await prisma.cliente.findMany({
      where: { status: { in: ["ativo", "inativo", "lead"] } },
      include: {
        vendas: {
          orderBy: { createdAt: "desc" },
          include: { itens: { include: { produto: { select: { nome: true } } } } }
        }
      },
      orderBy: { score: "desc" }
    });
  } catch (error) {
    console.error(error);
  }

  return clientes.map((c: any) => {
    const vendas: any[] = c.vendas || [];
    const totalComprado = vendas.reduce((acc: number, v: any) => acc + (v.total || 0), 0);
    const ultimaCompra = vendas[0]?.createdAt;
    const diasSemContato = ultimaCompra
      ? Math.floor((Date.now() - ultimaCompra.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    const vendasRecentes = vendas.filter((v: any) => v.createdAt >= noventaDiasAtras);
    const frequenciaCompra = vendasRecentes.length > 0 ? vendasRecentes.length / 3 : 0; // por mês
    const ticketMedio = vendas.length > 0 ? totalComprado / vendas.length : 0;

    // Produtos mais comprados para cross-sell
    const produtosMap: Record<string, number> = {};
    vendas.forEach((v: any) => v.itens?.forEach((i: any) => {
      const nome = i.produto?.nome;
      if (nome) produtosMap[nome] = (produtosMap[nome] || 0) + 1;
    }));
    const produtosRecomendados = Object.entries(produtosMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([nome]) => nome);

    let probabilidadeRecompra: ClienteExecutivo["probabilidadeRecompra"] = "Baixa";
    if (frequenciaCompra >= 2) probabilidadeRecompra = "Muito Alta";
    else if (frequenciaCompra >= 1) probabilidadeRecompra = "Alta";
    else if (diasSemContato < 60) probabilidadeRecompra = "Média";

    let risco: ClienteExecutivo["risco"] = "Ativo";
    if (c.status === "lead") risco = "Novo";
    else if (c.score >= 80 && diasSemContato < 30) risco = "VIP";
    else if (diasSemContato > 30 && c.score >= 50) risco = "Churn";

    return {
      id: c.id,
      nome: c.nome,
      email: c.email || undefined,
      telefone: c.telefone || undefined,
      status: c.status,
      score: c.score || 0,
      totalComprado: Math.round(totalComprado),
      ultimaCompra,
      frequenciaCompra: Math.round(frequenciaCompra * 10) / 10,
      ticketMedio: Math.round(ticketMedio),
      probabilidadeRecompra,
      diasSemContato,
      risco,
      produtosRecomendados,
      responsavel: undefined,
      melhorHorario: "14h - 17h", // heurística padrão por enquanto
      melhorCanal: c.telefone ? "WhatsApp" : "E-mail",
      segmento: c.segmento || undefined,
    };
  });
}

// ─── Análise de Oportunidades ─────────────────────────────────────────────────

export async function getOportunidadesExecutivo(): Promise<OportunidadeExecutiva[]> {
  const hoje = new Date();
  const setentaDiasAtras = new Date(hoje);
  setentaDiasAtras.setDate(hoje.getDate() - 70);
  const trintaDiasAtras = new Date(hoje);
  trintaDiasAtras.setDate(hoje.getDate() - 30);
  const seteDias = new Date(hoje);
  seteDias.setDate(hoje.getDate() + 7);

  const oportunidades: OportunidadeExecutiva[] = [];

  // 1. Tarefas atrasadas críticas
  const tarefasAtrasadas = await prisma.tarefa.findMany({
    where: { status: { not: "concluida" }, prazo: { lt: hoje } },
    take: 5,
    orderBy: { prazo: "asc" },
    select: { id: true, titulo: true, prazo: true, responsavel: true }
  }).catch(() => []);

  tarefasAtrasadas.forEach(t => {
    const diasAtraso = Math.floor((hoje.getTime() - (t.prazo?.getTime() || 0)) / (1000 * 60 * 60 * 24));
    oportunidades.push({
      tipo: "follow_up_atrasado",
      prioridade: diasAtraso > 3 ? "CRITICA" : "ALTA",
      titulo: `Tarefa atrasada: ${t.titulo}`,
      descricao: `${diasAtraso} dia(s) de atraso. Responsável: ${t.responsavel || "Não atribuído"}`,
      entidadeId: t.id,
      entidadeNome: t.titulo,
      prazoHoras: 0,
      acao: `Resolver tarefa "${t.titulo}" imediatamente`
    });
  });

  // 2. Clientes VIP sem contato há 30+ dias
  const clientesVipInativos = await prisma.cliente.findMany({
    where: { status: "ativo", score: { gte: 60 }, updatedAt: { lte: trintaDiasAtras } },
    take: 5,
    orderBy: { score: "desc" },
    select: { id: true, nome: true, score: true, updatedAt: true }
  }).catch(() => []);

  clientesVipInativos.forEach(c => {
    const dias = Math.floor((hoje.getTime() - c.updatedAt.getTime()) / (1000 * 60 * 60 * 24));
    oportunidades.push({
      tipo: "cliente_inativo_vip",
      prioridade: c.score >= 80 ? "CRITICA" : "ALTA",
      titulo: `Cliente VIP sem contato: ${c.nome}`,
      descricao: `${dias} dias sem interação. Score: ${c.score}. Risco de churn alto.`,
      entidadeId: c.id,
      entidadeNome: c.nome,
      prazoHoras: 24,
      acao: `Agendar follow-up urgente com ${c.nome}`
    });
  });

  // 3. Leads esquecidos (leads sem interação há 7+ dias)
  const leadsEsquecidos = await prisma.cliente.findMany({
    where: { status: "lead", updatedAt: { lte: setentaDiasAtras } },
    take: 5,
    orderBy: { updatedAt: "asc" },
    select: { id: true, nome: true, updatedAt: true }
  }).catch(() => []);

  leadsEsquecidos.forEach(l => {
    oportunidades.push({
      tipo: "lead_esquecido",
      prioridade: "ALTA",
      titulo: `Lead esquecido: ${l.nome}`,
      descricao: `Sem interação há muito tempo. Prospecção pode estar esfriando.`,
      entidadeId: l.id,
      entidadeNome: l.nome,
      prazoHoras: 48,
      acao: `Reativar lead ${l.nome} com abordagem consultiva`
    });
  });

  // 4. Produtos em ruptura que precisam de reposição
  const produtosRuptura = await prisma.produto.findMany({
    where: { status: "ativo" },
    select: { id: true, nome: true, estoqueAtual: true, estoqueMinimo: true }
  }).then(ps => ps.filter(p => p.estoqueAtual <= p.estoqueMinimo).slice(0, 4));

  produtosRuptura.forEach(p => {
    oportunidades.push({
      tipo: "campanha_urgente",
      prioridade: p.estoqueAtual <= 0 ? "CRITICA" : "ALTA",
      titulo: `Ruptura de estoque: ${p.nome}`,
      descricao: `Estoque atual: ${p.estoqueAtual} / Mínimo: ${p.estoqueMinimo}. Reposição urgente.`,
      entidadeId: p.id,
      entidadeNome: p.nome,
      prazoHoras: p.estoqueAtual <= 0 ? 4 : 24,
      acao: `Criar ordem de compra para ${p.nome}`
    });
  });

  // Ordenar por prioridade
  const ordem = { CRITICA: 0, ALTA: 1, MEDIA: 2 };
  return oportunidades.sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade]);
}
