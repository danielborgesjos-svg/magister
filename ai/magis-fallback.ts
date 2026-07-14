// ============================================================
// MAGIS FALLBACK ENGINE — Prisma puro
// Executado apenas quando Ollama e Groq estão offline
// Substitui o antigo magis-engine.ts que usava data/mock
// ============================================================

import prisma from "@/lib/prisma"

export interface MagisAction {
  label: string
  type: 'campanha' | 'tarefa' | 'relatorio' | 'link' | 'ia' | 'venda' | 'executar'
  href?: string
  payload?: Record<string, any>
}

export interface MagisResponse {
  agente: string
  agenteIcon: string
  agenteColor?: string
  diagnostico: string
  motivo: string
  recomendacao: string
  proximoPasso: string
  acoes: MagisAction[]
  dados?: { label: string; valor: string; cor?: string }[]
  tipo?: 'info' | 'alerta' | 'sucesso' | 'acao'
  _source?: string
  _reason?: string
  _model?: string
  _intencao?: string
  _contexto?: string
}

function formatCurrency(val: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
}

// ============================================================
// INTENTS — detecção heurística (pode ser chamada pelo endpoint principal)
// ============================================================
export type Intencao =
  | 'clientes_chamar' | 'clientes_inativos' | 'clientes_recompra'
  | 'produto_faltar' | 'produto_parado' | 'produto_margem'
  | 'meta_faturamento' | 'campanha_criar' | 'resumo_dia'
  | 'vendas_funil' | 'financeiro_resultado' | 'risco_operacional'
  | 'melhor_vendedor' | 'melhor_produto' | 'total_vendido'
  | 'anos_vendas' | 'horarios_pico' | 'agenda_compromissos'
  | 'criar_tarefa' | 'adicionar_venda' | 'ideias_dia'
  | 'gerar_relatorio' | 'analisar_despesas' | 'projetar_caixa'
  | 'ideias_vendas' | 'desconhecido'

export function detectarIntencao(mensagem: string): Intencao {
  const m = mensagem.toLowerCase()

  if (m.match(/cria.*tarefa|adiciona.*tarefa|nova tarefa|agendar tarefa/)) return 'criar_tarefa'
  if (m.match(/adiciona.*venda|registra.*venda|nova venda|lança.*venda/)) return 'adicionar_venda'
  if (m.match(/ideias.*vend|ideia.*semana|como vender mais|sugest.*vend|oportunidade.*vend/)) return 'ideias_vendas'
  if (m.match(/gerar? relat|relat.*financ|relat.*mês|gera.*resumo|relat.*mensal/)) return 'gerar_relatorio'
  if (m.match(/analis.*despesa|despesas.*altas|maiores despesas|onde.*gastando/)) return 'analisar_despesas'
  if (m.match(/projetar? caixa|fluxo.*caixa|previsão.*caixa|forecast/)) return 'projetar_caixa'
  if (m.match(/ideias.*dia|o que.*hoje|sugere.*hoje|painel.*ideias|melhoria/)) return 'ideias_dia'

  if (m.match(/chamar|ligar|contatar|abordar|falar|quem.*(hoje|prioridade)/)) return 'clientes_chamar'
  if (m.match(/inativ|sem compra|parado.*(cliente)|reativar|recuperar/)) return 'clientes_inativos'
  if (m.match(/recompra|chance.*compra|maior.*probabilidade|score|comprar.*novamente/)) return 'clientes_recompra'

  if (m.match(/faltar|ruptura|acabar|estoque.*baixo|repor|reposição|falta/)) return 'produto_faltar'
  if (m.match(/parado|encalhado|sem saída|excesso.*estoque|muito.*estoque/)) return 'produto_parado'
  if (m.match(/margem|rentável|lucro.*produto|melhor.*margem/)) return 'produto_margem'

  if (m.match(/meta|faturamento|quanto.*falta|resultado.*mes|bater.*meta/)) return 'meta_faturamento'
  if (m.match(/financeiro|despesa|receita|caixa|resultado|saldo/)) return 'financeiro_resultado'

  if (m.match(/campanha|criar.*campanha|mensagem.*whatsapp|enviar.*clientes|promoção/)) return 'campanha_criar'
  if (m.match(/resumo|plano.*dia|o que.*fazer|prioridade.*hoje|comecar|inicio/)) return 'resumo_dia'
  if (m.match(/funil|negociação|venda.*aberta|pipeline|oportunidade/)) return 'vendas_funil'
  if (m.match(/risco|problema|alerta|atenção|crítico|urgente/)) return 'risco_operacional'
  if (m.match(/melhor.*vendedor|quem.*vendeu.*mais|ranking.*vendedor|top.*vendedor/)) return 'melhor_vendedor'
  if (m.match(/melhor.*produto|produto.*mais.*vendido|top.*produto|mais.*saida/)) return 'melhor_produto'
  if (m.match(/total.*vendido|quantos.*produtos|volume.*vendas|total.*produtos/)) return 'total_vendido'
  if (m.match(/ano.*vendas|melhor.*ano|2024|2025|historico.*ano|qual.*ano/)) return 'anos_vendas'
  if (m.match(/horario|pico|movimento|dia.*semana|quando.*vende|mais.*vende.*dia/)) return 'horarios_pico'
  if (m.match(/agenda|compromisso|reunião|reuniao|hoje.*agenda/)) return 'agenda_compromissos'

  return 'desconhecido'
}

// ============================================================
// RESPOSTAS DINÂMICAS COM PRISMA
// ============================================================

async function responderClientesChamar(): Promise<MagisResponse> {
  const top = await prisma.cliente.findMany({
    where: { status: 'ativo' },
    orderBy: { score: 'desc' },
    take: 5
  })

  return {
    agente: 'Agente Comercial', agenteIcon: '👥', agenteColor: 'blue',
    diagnostico: `Identifiquei **${top.length} clientes prioritários** para contato baseado no score no banco de dados.`,
    motivo: `Score leva em conta interação, compras passadas e perfil no sistema.`,
    recomendacao: `Inicie o contato pela ordem da lista.`,
    proximoPasso: `Acesse Clientes para visualizar os dados de contato de cada um.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver clientes', type: 'link', href: '/clientes' },
    ],
    dados: top.map(c => ({
      label: c.nome, valor: `Score ${c.score}`, cor: c.score >= 80 ? 'green' : 'blue'
    }))
  }
}

async function responderClientesInativos(): Promise<MagisResponse> {
  const inativos = await prisma.cliente.findMany({
    where: { status: 'inativo' },
    orderBy: { totalComprado: 'desc' },
    take: 5
  })
  const count = await prisma.cliente.count({ where: { status: 'inativo' }})

  return {
    agente: 'Agente Comercial', agenteIcon: '👥', agenteColor: 'red',
    diagnostico: `Existem **${count} clientes inativos** na base.`,
    motivo: `Estes clientes não compram ou interagem há um tempo configurado pelo sistema.`,
    recomendacao: `Campanha de reativação via WhatsApp com oferta exclusiva focado no top 5 inativos de maior ticket.`,
    proximoPasso: `Gere uma campanha com mensagem personalizada.`,
    tipo: 'alerta',
    acoes: [
      { label: 'Ver inativos', type: 'link', href: '/clientes' },
    ],
    dados: inativos.map(c => ({
      label: c.nome, valor: `Histórico: ${formatCurrency(c.totalComprado)}`, cor: 'red'
    }))
  }
}

async function responderProdutoFaltar(): Promise<MagisResponse> {
  const ruptura = await prisma.produto.findMany({
    where: { OR: [{ risco: 'ruptura' }, { estoqueAtual: 0 }] },
    take: 5
  })
  const count = await prisma.produto.count({ where: { OR: [{ risco: 'ruptura' }, { estoqueAtual: 0 }] }})

  return {
    agente: 'Agente de Estoque', agenteIcon: '📦', agenteColor: 'red',
    diagnostico: `**${count} produtos** com risco de ruptura ou zerados.`,
    motivo: `A demanda superou o estoque mínimo configurado para estes SKUs.`,
    recomendacao: `Emita pedidos de compra imediatos para reposição.`,
    proximoPasso: `Acesse Estoque e verifique os fornecedores.`,
    tipo: 'alerta',
    acoes: [
      { label: 'Ver estoque crítico', type: 'link', href: '/estoque' },
    ],
    dados: ruptura.map(p => ({
      label: p.nome, valor: `Estoque: ${p.estoqueAtual} | Mín: ${p.estoqueMinimo}`, cor: 'red'
    }))
  }
}

async function responderFinanceiro(): Promise<MagisResponse> {
  const hoje = new Date()
  const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  
  const lancamentosMes = await prisma.lancamentoFinanceiro.findMany({
    where: { createdAt: { gte: inicioMes } }
  })
  
  const receitas = lancamentosMes.filter(l => l.tipo === 'receita' && l.status === 'pago').reduce((a, l) => a + l.valor, 0)
  const despesas = lancamentosMes.filter(l => l.tipo === 'despesa' && l.status === 'pago').reduce((a, l) => a + l.valor, 0)
  const vencidos = lancamentosMes.filter(l => l.status === 'vencido').reduce((a, l) => a + l.valor, 0)
  
  return {
    agente: 'Agente Financeiro', agenteIcon: '💰', agenteColor: 'blue',
    diagnostico: `Resultado do mês (pago): Receitas **${formatCurrency(receitas)}** vs Despesas **${formatCurrency(despesas)}**.`,
    motivo: `Saldo líquido recebido/pago no mês: ${formatCurrency(receitas - despesas)}.`,
    recomendacao: vencidos > 0 ? `Atenção: existem ${formatCurrency(vencidos)} em contas vencidas.` : `O fluxo está saudável sem atrasos críticos no mês atual.`,
    proximoPasso: `Acesse o painel financeiro para conciliação bancária completa.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver painel financeiro', type: 'link', href: '/financeiro' },
    ],
    dados: [
      { label: 'Receitas Mês', valor: formatCurrency(receitas), cor: 'green' },
      { label: 'Despesas Mês', valor: formatCurrency(despesas), cor: 'red' },
      { label: 'Contas Vencidas', valor: formatCurrency(vencidos), cor: vencidos > 0 ? 'orange' : 'green' }
    ]
  }
}

async function responderDesconhecido(mensagem: string): Promise<MagisResponse> {
  return {
    agente: 'Magis IA', agenteIcon: '✨', agenteColor: 'blue',
    diagnostico: `Compreendido: "${mensagem}".`,
    motivo: `Estou no modo fallback pois as IAs (Ollama/Groq) estão offline.`,
    recomendacao: `Posso responder comandos objetivos do banco de dados (ex: 'produtos em falta', 'clientes inativos', 'financeiro do mês').`,
    proximoPasso: `Ligue a IA local (Ollama) ou configure a API Key do Groq para análises complexas e preditivas.`,
    tipo: 'info',
    acoes: [
      { label: 'Produtos em Ruptura', type: 'ia' },
      { label: 'Situação Financeira', type: 'ia' },
    ],
  }
}

// ============================================================
// EXPORT PRINCIPAL (Fallback offline/Prisma)
// ============================================================
export async function processarMensagem(mensagem: string): Promise<MagisResponse> {
  const intencao = detectarIntencao(mensagem)
  switch (intencao) {
    case 'clientes_chamar':       return await responderClientesChamar()
    case 'clientes_inativos':     return await responderClientesInativos()
    case 'clientes_recompra':     return await responderClientesChamar()
    case 'produto_faltar':        return await responderProdutoFaltar()
    case 'financeiro_resultado':  return await responderFinanceiro()
    case 'gerar_relatorio':       return await responderFinanceiro()
    default:                      return await responderDesconhecido(mensagem)
  }
}
