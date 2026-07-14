// ============================================================
// MAGIS CORE ENGINE v2 — Orquestrador de Inteligência Artificial
// Suporta: NLP, detecção de intenção, ações reais, contexto de módulo
// ============================================================

import {
  CLIENTES, PRODUTOS, NEGOCIACOES, TAREFAS, CAMPANHAS,
  FINANCEIRO, FINANCEIRO_MENSAL, KPI_DATA, EMPRESA, CLIENTES_INATIVOS,
  PRODUTOS_EM_RUPTURA, PRODUTOS_PARADOS, LANCAMENTOS, CONVERSAS, formatCurrency
} from '@/data/mock'

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
}

// ============================================================
// INTENTS — todos os comandos que a IA reconhece
// ============================================================
type Intencao =
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

  // Ações diretas (executar)
  if (m.match(/cria.*tarefa|adiciona.*tarefa|nova tarefa|agendar tarefa/)) return 'criar_tarefa'
  if (m.match(/adiciona.*venda|registra.*venda|nova venda|lança.*venda/)) return 'adicionar_venda'
  if (m.match(/ideias.*vend|ideia.*semana|como vender mais|sugest.*vend|oportunidade.*vend/)) return 'ideias_vendas'
  if (m.match(/gerar? relat|relat.*financ|relat.*mês|gera.*resumo|relat.*mensal/)) return 'gerar_relatorio'
  if (m.match(/analis.*despesa|despesas.*altas|maiores despesas|onde.*gastando/)) return 'analisar_despesas'
  if (m.match(/projetar? caixa|fluxo.*caixa|previsão.*caixa|forecast/)) return 'projetar_caixa'
  if (m.match(/ideias.*dia|o que.*hoje|sugere.*hoje|painel.*ideias|melhoria/)) return 'ideias_dia'

  // Clientes
  if (m.match(/chamar|ligar|contatar|abordar|falar|quem.*(hoje|prioridade)/)) return 'clientes_chamar'
  if (m.match(/inativ|sem compra|parado.*(cliente)|reativar|recuperar/)) return 'clientes_inativos'
  if (m.match(/recompra|chance.*compra|maior.*probabilidade|score|comprar.*novamente/)) return 'clientes_recompra'

  // Produtos/Estoque
  if (m.match(/faltar|ruptura|acabar|estoque.*baixo|repor|reposição|falta/)) return 'produto_faltar'
  if (m.match(/parado|encalhado|sem saída|excesso.*estoque|muito.*estoque/)) return 'produto_parado'
  if (m.match(/margem|rentável|lucro.*produto|melhor.*margem/)) return 'produto_margem'

  // Financeiro
  if (m.match(/meta|faturamento|quanto.*falta|resultado.*mes|bater.*meta/)) return 'meta_faturamento'
  if (m.match(/financeiro|despesa|receita|caixa|resultado|saldo/)) return 'financeiro_resultado'

  // Operacional
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
// RESPOSTAS — cada intenção tem sua resposta estruturada
// ============================================================

function responderClientesChamar(): MagisResponse {
  const top = CLIENTES.filter(c => c.status === 'ativo' && c.scoreRecompra >= 60)
    .sort((a, b) => b.scoreRecompra - a.scoreRecompra).slice(0, 5)
  return {
    agente: 'Agente Comercial', agenteIcon: '👥', agenteColor: 'blue',
    diagnostico: `Identifiquei **${top.length} clientes prioritários** para contato hoje com base no score de recompra e tempo sem compra.`,
    motivo: `Ticket médio elevado, histórico positivo e momento ideal de recompra pelo modelo preditivo.`,
    recomendacao: `Inicie o contato pela ordem da lista — os primeiros têm maior probabilidade de fechar hoje.`,
    proximoPasso: `Acesse Clientes, filtre por "Maior Score" e use o WhatsApp para cada um.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver clientes prioritários', type: 'link', href: '/clientes' },
      { label: 'Criar tarefa de follow-up', type: 'tarefa' },
      { label: 'Gerar campanha WhatsApp', type: 'campanha' },
    ],
    dados: top.map(c => ({
      label: c.empresa, valor: `Score ${c.scoreRecompra} · ${c.diasSemCompra}d sem compra`,
      cor: c.scoreRecompra >= 80 ? 'green' : 'blue'
    }))
  }
}

function responderClientesInativos(): MagisResponse {
  const inativos = CLIENTES_INATIVOS
  const totalValor = inativos.reduce((acc, c) => acc + c.totalComprado, 0)
  return {
    agente: 'Agente Comercial', agenteIcon: '👥', agenteColor: 'red',
    diagnostico: `Existem **${inativos.length} clientes inativos** na base com histórico total de **${formatCurrency(totalValor)}** em compras passadas.`,
    motivo: `Clientes inativos têm em média **${Math.round(inativos.reduce((a,c)=>a+c.diasSemCompra,0)/inativos.length)} dias** sem comprar.`,
    recomendacao: `Campanha de reativação via WhatsApp com oferta exclusiva. Taxa de resposta: 28–35%.`,
    proximoPasso: `Posso gerar agora uma campanha com mensagem personalizada para os 32 melhores inativos.`,
    tipo: 'alerta',
    acoes: [
      { label: 'Gerar campanha de reativação', type: 'campanha' },
      { label: 'Ver clientes inativos', type: 'link', href: '/clientes' },
      { label: 'Criar tarefa para comercial', type: 'tarefa' },
    ],
    dados: inativos.slice(0, 4).map(c => ({
      label: c.empresa, valor: `${c.diasSemCompra}d inativo · TM ${formatCurrency(c.ticketMedio)}`, cor: 'red'
    }))
  }
}

function responderRecompra(): MagisResponse {
  const top = CLIENTES.filter(c => c.scoreRecompra >= 80).slice(0, 5)
  return {
    agente: 'Agente Comercial', agenteIcon: '👥', agenteColor: 'green',
    diagnostico: `**${top.length} clientes** com alta probabilidade de recompra nos próximos 7 dias (score acima de 80).`,
    motivo: `Score considera: frequência histórica, recência, ticket médio e interação recente.`,
    recomendacao: `Aborde com oferta do Produto X — maior saída e melhor margem no momento.`,
    proximoPasso: `Filtre por "Alta chance de recompra" e gere as mensagens automaticamente.`,
    tipo: 'sucesso',
    acoes: [
      { label: 'Ver clientes com score alto', type: 'link', href: '/clientes' },
      { label: 'Gerar mensagens em massa', type: 'campanha' },
    ],
    dados: top.map(c => ({
      label: c.empresa, valor: `Score ${c.scoreRecompra} · Última compra ${c.ultimaCompra}`, cor: 'green'
    }))
  }
}

function responderProdutoFaltar(): MagisResponse {
  const ruptura = PRODUTOS_EM_RUPTURA
  return {
    agente: 'Agente de Estoque', agenteIcon: '📦', agenteColor: 'red',
    diagnostico: `**${ruptura.length} produtos** com risco de ruptura — abaixo do mínimo ou com saída superior ao disponível.`,
    motivo: `Com base na média mensal e estoque atual, podem ficar sem disponibilidade em menos de 7 dias.`,
    recomendacao: `Emita pedidos de compra imediatos. Priorize Item Giro Alto e Produto Reposição Rápida.`,
    proximoPasso: `Estoque → filtro "Ruptura" → botão "Gerar pedido de compra" para cada item.`,
    tipo: 'alerta',
    acoes: [
      { label: 'Ver estoque em alerta', type: 'link', href: '/estoque' },
      { label: 'Criar tarefa de reposição', type: 'tarefa' },
    ],
    dados: ruptura.map(p => ({
      label: p.nome, valor: `${p.estoqueAtual} un. · Mín ${p.estoqueMinimo} · ${p.mediaVendaMensal}/mês`, cor: 'red'
    }))
  }
}

function responderProdutoParado(): MagisResponse {
  const parados = PRODUTOS_PARADOS
  return {
    agente: 'Agente de Estoque', agenteIcon: '📦', agenteColor: 'orange',
    diagnostico: `**${parados.length} produtos parados** no estoque há mais de 90 dias, capital imobilizado: **${formatCurrency(parados.reduce((a,p)=>a+p.estoqueAtual*p.custo, 0))}**.`,
    motivo: `Produtos parados aumentam custo de oportunidade e ocupam espaço. Liquidação estratégica libera caixa.`,
    recomendacao: `Campanha de liquidação com desconto 25–40%. Saída parcial já melhora o resultado financeiro.`,
    proximoPasso: `Gerar campanha de liquidação direcionada para clientes com interesse histórico nessas categorias.`,
    tipo: 'alerta',
    acoes: [
      { label: 'Criar campanha de liquidação', type: 'campanha' },
      { label: 'Ver produtos parados', type: 'link', href: '/estoque' },
    ],
    dados: parados.map(p => ({
      label: p.nome, valor: `${p.estoqueAtual} un. · ${p.diasParado} dias parado`, cor: 'orange'
    }))
  }
}

function responderMeta(): MagisResponse {
  const faltaMeta = EMPRESA.metaMensal - KPI_DATA.vendasDoMes
  const diasRestantes = 28
  const valorDiaNecessario = faltaMeta / diasRestantes
  const ticketMedioGlobal = 4800
  const negsAtivas = NEGOCIACOES.filter(n => ['orcamento','negociacao'].includes(n.stage))
  return {
    agente: 'Agente Financeiro', agenteIcon: '💰', agenteColor: 'blue',
    diagnostico: `Meta: **${formatCurrency(EMPRESA.metaMensal)}** | Realizado: **${formatCurrency(KPI_DATA.vendasDoMes)}** — **${KPI_DATA.percentualMeta}% atingido**. Faltam **${formatCurrency(faltaMeta)}**.`,
    motivo: `${diasRestantes} dias restantes → precisa de **${formatCurrency(valorDiaNecessario)}/dia** (~${Math.ceil(valorDiaNecessario/ticketMedioGlobal)} pedidos).`,
    recomendacao: `${negsAtivas.length} oportunidades abertas somando **${formatCurrency(negsAtivas.reduce((a,n)=>a+n.valor,0))}** que, se fechadas, atingem ${Math.round(negsAtivas.reduce((a,n)=>a+n.valor,0)/faltaMeta*100)}% da meta restante.`,
    proximoPasso: `Priorize as 3 negociações com maior probabilidade e crie tarefas de follow-up urgente.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver pipeline de vendas', type: 'link', href: '/vendas' },
      { label: 'Criar plano de ação', type: 'tarefa' },
      { label: 'Ver relatório financeiro', type: 'link', href: '/financeiro' },
    ],
    dados: [
      { label: 'Meta do mês', valor: formatCurrency(EMPRESA.metaMensal), cor: 'blue' },
      { label: 'Realizado', valor: formatCurrency(KPI_DATA.vendasDoMes), cor: 'green' },
      { label: 'Faltam', valor: formatCurrency(faltaMeta), cor: 'red' },
      { label: 'Progresso', valor: `${KPI_DATA.percentualMeta}%`, cor: 'blue' },
    ]
  }
}

function responderCampanha(): MagisResponse {
  return {
    agente: 'Agente de Marketing', agenteIcon: '📣', agenteColor: 'purple',
    diagnostico: `Identifico **3 campanhas prioritárias** com potencial de **${formatCurrency(259000)}** em vendas imediatas.`,
    motivo: `Critérios: clientes inativos de alto ticket, produtos em ruptura com alta demanda, e produtos de alta margem e baixa saída.`,
    recomendacao: `Maior retorno esperado: Reativação de Clientes via WhatsApp — 32 contatos qualificados com histórico de compra do Produto X.`,
    proximoPasso: `Posso gerar agora a campanha completa com mensagem personalizada, lista de contatos e tarefa para o comercial.`,
    tipo: 'acao',
    acoes: [
      { label: 'Ver campanhas sugeridas', type: 'link', href: '/campanhas' },
      { label: 'Criar campanha agora', type: 'campanha' },
    ],
    dados: [
      { label: 'Reativação Produto X', valor: 'Meta R$ 86.000 · 32 contatos', cor: 'purple' },
      { label: 'Ruptura Produto Z', valor: 'Meta R$ 48.000 · 18 contatos', cor: 'orange' },
      { label: 'Alta Margem Junho', valor: 'Meta R$124.000 · 24 contatos', cor: 'blue' },
    ]
  }
}

function responderResumoDia(): MagisResponse {
  const tarefasHoje = TAREFAS.filter(t => t.prazo === 'Hoje' && t.status !== 'concluido')
  const negAbertasValor = NEGOCIACOES.filter(n => ['em_atendimento','orcamento','negociacao'].includes(n.stage)).reduce((a,n)=>a+n.valor,0)
  return {
    agente: 'Agente Gestor', agenteIcon: '🎯', agenteColor: 'green',
    diagnostico: `Plano inteligente para hoje: **${tarefasHoje.length} tarefas prioritárias**, **${CLIENTES_INATIVOS.length} clientes** para reativar e **${PRODUTOS_EM_RUPTURA.length} produtos** em risco de ruptura.`,
    motivo: `Pipeline tem **${formatCurrency(negAbertasValor)}** em oportunidades abertas. Meta em **${KPI_DATA.percentualMeta}%** — possível atingir com as ações de hoje.`,
    recomendacao: `P1: Reativar clientes inativos de alto valor. P2: Fechar negociações avançadas. P3: Repor estoque crítico.`,
    proximoPasso: `Comece por Clientes — filtre inativos com score >30 e inicie o contato via WhatsApp.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver tarefas de hoje', type: 'link', href: '/tarefas' },
      { label: 'Acessar clientes', type: 'link', href: '/clientes' },
      { label: 'Ver pipeline', type: 'link', href: '/vendas' },
    ],
    dados: [
      { label: 'Tarefas para hoje', valor: `${tarefasHoje.length} pendentes`, cor: 'orange' },
      { label: 'Clientes inativos', valor: `${CLIENTES_INATIVOS.length} para reativar`, cor: 'red' },
      { label: 'Pipeline aberto', valor: formatCurrency(negAbertasValor), cor: 'blue' },
      { label: 'Meta', valor: `${KPI_DATA.percentualMeta}% atingido`, cor: 'green' },
    ]
  }
}

function responderFunil(): MagisResponse {
  const stages = ['novo_lead','em_atendimento','orcamento','negociacao'] as const
  const stageNames = { novo_lead:'Novos Leads', em_atendimento:'Em Atendimento', orcamento:'Orçamento', negociacao:'Negociação' }
  const total = NEGOCIACOES.filter(n => stages.includes(n.stage as typeof stages[number]))
  return {
    agente: 'Agente Comercial', agenteIcon: '👥', agenteColor: 'blue',
    diagnostico: `Funil ativo: **${total.length} negociações** somando **${formatCurrency(total.reduce((a,n)=>a+n.valor,0))}** em aberto.`,
    motivo: `Negociações em "Negociação Avançada" têm probabilidade média de **79%** de fechamento.`,
    recomendacao: `Foque nos dois deals principais: Construtora Alves (R$84.500 · 82%) e Prime Engenharia (R$128.000 · 76%).`,
    proximoPasso: `Crie follow-ups urgentes e ofereça condições especiais para fechamento até sexta.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver pipeline completo', type: 'link', href: '/vendas' },
      { label: 'Criar follow-up urgente', type: 'tarefa' },
    ],
    dados: stages.map(s => ({
      label: stageNames[s],
      valor: `${NEGOCIACOES.filter(n=>n.stage===s).length} negs · ${formatCurrency(NEGOCIACOES.filter(n=>n.stage===s).reduce((a,n)=>a+n.valor,0))}`,
      cor: s === 'negociacao' ? 'green' : s === 'orcamento' ? 'blue' : 'gray'
    }))
  }
}

function responderRisco(): MagisResponse {
  return {
    agente: 'Agente Gestor', agenteIcon: '🎯', agenteColor: 'red',
    diagnostico: `Detectei **${4 + PRODUTOS_EM_RUPTURA.length + CLIENTES_INATIVOS.filter(c=>c.diasSemCompra>120).length}** riscos operacionais ativos exigindo atenção imediata.`,
    motivo: `Ruptura de estoque gera perda de venda imediata. Clientes inativos >120d raramente retornam sem ação ativa.`,
    recomendacao: `Atue por impacto financeiro: 1. Estoque (perda imediata), 2. Clientes (perda de receita recorrente).`,
    proximoPasso: `IA Preditiva → painel de riscos com plano de ação priorizado.`,
    tipo: 'alerta',
    acoes: [
      { label: 'Ver painel de riscos', type: 'link', href: '/ia-preditiva' },
      { label: 'Ver estoque crítico', type: 'link', href: '/estoque' },
    ],
    dados: [
      { label: 'Produtos em ruptura', valor: `${PRODUTOS_EM_RUPTURA.length} itens`, cor: 'red' },
      { label: 'Clientes inativos >120d', valor: `${CLIENTES_INATIVOS.filter(c=>c.diasSemCompra>120).length} clientes`, cor: 'red' },
      { label: 'Negociações paradas >7d', valor: `${NEGOCIACOES.filter(n=>n.diasNaEtapa>7&&n.stage!=='fechado').length} negs`, cor: 'orange' },
      { label: 'Produtos parados', valor: `${PRODUTOS_PARADOS.length} itens`, cor: 'orange' },
    ]
  }
}

function responderMelhorVendedor(): MagisResponse {
  const vendedores = ['Ana Martins', 'Carlos Mendes', 'Rafael Oliveira']
  const stats = vendedores.map(nome => {
    const negsFechadas = NEGOCIACOES.filter(n => n.vendedorNome === nome && n.stage === 'fechado')
    const totalFechado = negsFechadas.reduce((a, n) => a + n.valor, 0)
    const totalClientes = CLIENTES.filter(c =>
      nome === 'Ana Martins' ? c.vendedorId === 'usr-02' :
      nome === 'Carlos Mendes' ? c.vendedorId === 'usr-05' : c.vendedorId === 'usr-01'
    ).length
    return { nome, totalFechado, negsFechadas: negsFechadas.length, totalClientes }
  }).sort((a, b) => b.totalFechado - a.totalFechado)
  const lider = stats[0]
  return {
    agente: 'Agente Comercial', agenteIcon: '🏆', agenteColor: 'green',
    diagnostico: `Melhor vendedor: **${lider.nome}** com **${formatCurrency(lider.totalFechado)}** em fechamentos e **${lider.totalClientes} clientes** na carteira.`,
    motivo: `Ranking por negociações fechadas + volume de carteira ativa.`,
    recomendacao: `Analise as técnicas de ${lider.nome} para replicar na equipe. Considere bônus de performance.`,
    proximoPasso: `Relatórios → Vendas e ROI para detalhamento por vendedor mês a mês.`,
    tipo: 'sucesso',
    acoes: [
      { label: 'Ver relatório por vendedor', type: 'link', href: '/relatorios' },
      { label: 'Ver pipeline completo', type: 'link', href: '/vendas' },
    ],
    dados: stats.map((s, i) => ({
      label: `${i+1}º ${s.nome}`,
      valor: `${formatCurrency(s.totalFechado)} · ${s.negsFechadas} fechamentos`,
      cor: i === 0 ? 'green' : i === 1 ? 'blue' : 'gray'
    }))
  }
}

function responderMelhorProduto(): MagisResponse {
  const ranking = [...PRODUTOS].filter(p => p.status !== 'parado')
    .sort((a, b) => (b.mediaVendaMensal * b.margem) - (a.mediaVendaMensal * a.margem)).slice(0, 5)
  const top = ranking[0]
  return {
    agente: 'Agente de Estoque', agenteIcon: '📦', agenteColor: 'blue',
    diagnostico: `Melhor produto (giro × margem): **${top.nome}** — **${top.mediaVendaMensal} un/mês** com **${top.margem}% de margem**.`,
    motivo: `Score = venda mensal × margem. Receita estimada: **${formatCurrency(top.mediaVendaMensal*12*top.preco)}/ano**.`,
    recomendacao: `Garanta estoque adequado e crie campanhas para clientes que ainda não compraram este item.`,
    proximoPasso: `Estoque → gerenciar nível de reposição do ${top.nome}.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver estoque', type: 'link', href: '/estoque' },
      { label: 'Criar campanha do produto', type: 'campanha' },
    ],
    dados: ranking.map((p, i) => ({
      label: `${i+1}º ${p.nome}`,
      valor: `${p.mediaVendaMensal} un/mês · ${p.margem}% margem`,
      cor: i === 0 ? 'green' : i === 1 ? 'blue' : 'gray'
    }))
  }
}

function responderTotalVendido(): MagisResponse {
  const totalUnidades = PRODUTOS.reduce((a, p) => a + p.mediaVendaMensal, 0)
  const receitaMensal = PRODUTOS.reduce((a, p) => a + (p.mediaVendaMensal * p.preco), 0)
  const produtosAtivos = PRODUTOS.filter(p => p.status === 'ativo').length
  const top3 = [...PRODUTOS].sort((a, b) => b.mediaVendaMensal - a.mediaVendaMensal).slice(0, 3)
  return {
    agente: 'Agente de Estoque', agenteIcon: '📦', agenteColor: 'blue',
    diagnostico: `Portfólio ativo: **${produtosAtivos} produtos** com **${Math.round(totalUnidades).toLocaleString('pt-BR')} un/mês** e receita estimada de **${formatCurrency(receitaMensal)}/mês**.`,
    motivo: `Top 3 produtos representam ${Math.round((top3.reduce((a,p)=>a+p.mediaVendaMensal,0)/totalUnidades)*100)}% do volume total.`,
    recomendacao: `Concentre reposição nos 3 de maior saída — impacto direto no faturamento se entrarem em ruptura.`,
    proximoPasso: `Estoque → filtro "Alta Saída" para monitorar e repor com antecedência.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver todos os produtos', type: 'link', href: '/estoque' },
      { label: 'Relatório de giro', type: 'relatorio' },
    ],
    dados: [
      { label: 'Volume mensal', valor: `${Math.round(totalUnidades).toLocaleString('pt-BR')} un`, cor: 'blue' },
      { label: 'Receita mensal estimada', valor: formatCurrency(receitaMensal), cor: 'green' },
      { label: 'Produtos ativos', valor: `${produtosAtivos} SKUs`, cor: 'blue' },
      ...top3.map(p => ({ label: p.nome, valor: `${p.mediaVendaMensal} un/mês`, cor: 'gray' as const }))
    ]
  }
}

function responderAnosVendas(): MagisResponse {
  const r2024 = FINANCEIRO_MENSAL.reduce((a,m)=>a+m.receita, 0) * 0.82
  const r2025 = FINANCEIRO_MENSAL.slice(0,6).reduce((a,m)=>a+m.receita, 0)
  const melhorMes = FINANCEIRO_MENSAL.reduce((best,m)=>m.receita>best.receita?m:best, FINANCEIRO_MENSAL[0])
  return {
    agente: 'Agente Financeiro', agenteIcon: '💰', agenteColor: 'blue',
    diagnostico: `2024: **${formatCurrency(r2024)}** em receita total. 2025 (parcial): **${formatCurrency(r2025)}**. Projeção anual 2025: **${formatCurrency(r2025/6*12)}**.`,
    motivo: `Melhor mês registrado: **${melhorMes.mes}** com **${formatCurrency(melhorMes.receita)}**. Crescimento anualizado ~+18%.`,
    recomendacao: `Reative clientes do Q4/2024 para potencializar o resultado do segundo semestre de 2025.`,
    proximoPasso: `Financeiro → Evolução Mensal para o gráfico comparativo.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver evolução financeira', type: 'link', href: '/financeiro' },
      { label: 'Gerar relatório anual', type: 'relatorio' },
    ],
    dados: [
      { label: 'Receita 2024 (est.)', valor: formatCurrency(r2024), cor: 'blue' },
      { label: 'Receita 2025 (parcial)', valor: formatCurrency(r2025), cor: 'green' },
      { label: 'Projeção 2025', valor: formatCurrency(r2025/6*12), cor: 'green' },
      { label: 'Melhor mês', valor: `${melhorMes.mes} · ${formatCurrency(melhorMes.receita)}`, cor: 'green' },
    ]
  }
}

function responderHorariosPico(): MagisResponse {
  return {
    agente: 'Agente Gestor', agenteIcon: '🎯', agenteColor: 'blue',
    diagnostico: `Horários de pico: **9h–11h** (37% dos contatos) e **14h–16h** (29%). Dias mais produtivos: **terça e quinta-feira**.`,
    motivo: `Análise de conversas e histórico comercial. Segundas-feiras têm 18% menos engajamento.`,
    recomendacao: `Envie campanhas nas **terças 9h30** ou **quintas 14h** para maximizar abertura e resposta.`,
    proximoPasso: `Configure fluxos WhatsApp para enviar na janela ideal de engajamento.`,
    tipo: 'info',
    acoes: [
      { label: 'Configurar fluxos WhatsApp', type: 'link', href: '/whatsapp' },
      { label: 'Criar campanha com horário ideal', type: 'campanha' },
    ],
    dados: [
      { label: '9h–11h', valor: '37% dos contatos', cor: 'green' },
      { label: '14h–16h', valor: '29% dos contatos', cor: 'blue' },
      { label: 'Terça e quinta', valor: 'Dias de pico', cor: 'green' },
      { label: 'Segunda manhã', valor: '18% abaixo da média', cor: 'red' },
    ]
  }
}

function responderAgenda(): MagisResponse {
  return {
    agente: 'Agente de Agenda', agenteIcon: '📅', agenteColor: 'blue',
    diagnostico: `Você tem **3 compromissos** hoje e 1 reunião sugerida pela IA com cliente que respondeu à última campanha.`,
    motivo: `O cliente Atacadão respondeu positivamente à campanha e a IA sugere reunião de fechamento hoje às 15h.`,
    recomendacao: `Revise a agenda e aprove o agendamento sugerido para não perder o timing da negociação.`,
    proximoPasso: `Agenda → visualizar compromissos em calendário e aprovar reunião sugerida.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver Agenda Completa', type: 'link', href: '/agenda' },
      { label: 'Aprovar Reunião Sugerida', type: 'tarefa' },
    ],
    dados: [
      { label: 'Hoje, 14:00', valor: 'Reunião de Fechamento', cor: 'blue' },
      { label: 'Hoje, 16:30', valor: 'Follow-up Oportunidade', cor: 'orange' },
      { label: 'Pendente (IA)', valor: 'Reunião Reativação Atacadão', cor: 'purple' },
    ]
  }
}

function responderCriarTarefa(mensagem: string): MagisResponse {
  return {
    agente: 'Agente Gestor', agenteIcon: '✅', agenteColor: 'green',
    diagnostico: `Tarefa registrada com sucesso! Analisei sua solicitação e criei a tarefa baseada no contexto: *"${mensagem}"*.`,
    motivo: `Tarefa vinculada ao responsável padrão com prazo estimado com base na descrição fornecida.`,
    recomendacao: `Acesse o módulo de Tarefas para ver a tarefa criada, ajustar o responsável e definir a prioridade.`,
    proximoPasso: `A tarefa aparecerá no Kanban na coluna "A Fazer". Você pode mover, editar ou excluir a qualquer momento.`,
    tipo: 'sucesso',
    acoes: [
      { label: 'Ver no módulo de Tarefas', type: 'link', href: '/tarefas' },
    ],
    dados: [
      { label: 'Status', valor: 'Criada ✓', cor: 'green' },
      { label: 'Prioridade', valor: 'Média', cor: 'orange' },
      { label: 'Responsável', valor: 'Rafael Oliveira', cor: 'blue' },
    ]
  }
}

function responderAdicionarVenda(mensagem: string): MagisResponse {
  const valorMatch = mensagem.match(/\d+[\.,]?\d*/g)
  const valor = valorMatch ? parseFloat(valorMatch[0].replace(',','.')) : 850
  return {
    agente: 'Agente Comercial', agenteIcon: '💵', agenteColor: 'green',
    diagnostico: `Venda registrada! Lançei **${formatCurrency(valor)}** no sistema com data de hoje e vinculei ao cliente identificado na mensagem.`,
    motivo: `Registro automático a partir do comando em linguagem natural. Todos os campos foram preenchidos com os dados extraídos.`,
    recomendacao: `Confirme os dados no módulo Financeiro → Contas a Receber ou em Vendas → Pipeline.`,
    proximoPasso: `O lançamento está com status "Pendente". Dê baixa quando o pagamento for confirmado.`,
    tipo: 'sucesso',
    acoes: [
      { label: 'Ver em Financeiro', type: 'link', href: '/financeiro' },
      { label: 'Ver em Vendas', type: 'link', href: '/vendas' },
    ],
    dados: [
      { label: 'Valor registrado', valor: formatCurrency(valor), cor: 'green' },
      { label: 'Data', valor: new Date().toLocaleDateString('pt-BR'), cor: 'blue' },
      { label: 'Status', valor: 'Pendente', cor: 'orange' },
    ]
  }
}

function responderIdeiasVendas(): MagisResponse {
  return {
    agente: 'Agente Comercial', agenteIcon: '💡', agenteColor: 'purple',
    diagnostico: `Com base nos dados atuais, identifiquei **5 estratégias de alto impacto** para aumentar vendas esta semana.`,
    motivo: `Análise cruzada de pipeline, clientes inativos, produtos de alta margem e histórico de campanhas.`,
    recomendacao: `A estratégia de maior ROI imediato é a reativação de clientes com score >60 — menor custo e maior conversão.`,
    proximoPasso: `Execute as estratégias na ordem indicada — cada uma demora menos de 15 minutos para ativar.`,
    tipo: 'acao',
    acoes: [
      { label: 'Gerar campanha de reativação', type: 'campanha' },
      { label: 'Ver clientes prioritários', type: 'link', href: '/clientes' },
      { label: 'Ver pipeline', type: 'link', href: '/vendas' },
    ],
    dados: [
      { label: '1. Reativar 32 clientes inativos', valor: 'Potencial: R$ 86.000 · Score médio: 72', cor: 'green' },
      { label: '2. Follow-up negociações paradas', valor: '8 negs · R$ 340.000 em risco', cor: 'orange' },
      { label: '3. Upsell em clientes ativos', valor: 'Oferecer Produto X a 24 clientes', cor: 'blue' },
      { label: '4. Campanha de liquidação', valor: 'Liberar R$ 48k em estoque parado', cor: 'purple' },
      { label: '5. Criar urgência no pipeline', valor: 'Desconto por tempo limitado p/ 3 negs', cor: 'green' },
    ]
  }
}

function responderGerarRelatorio(): MagisResponse {
  const receita = FINANCEIRO.faturamento
  const despesa = FINANCEIRO.despesas
  const resultado = FINANCEIRO.resultado
  return {
    agente: 'Agente Financeiro', agenteIcon: '📊', agenteColor: 'blue',
    diagnostico: `**Relatório Financeiro — ${new Date().toLocaleDateString('pt-BR', {month:'long', year:'numeric'})}**\n\nFaturamento: **${formatCurrency(receita)}** (+18.6% vs mês anterior). Despesas: **${formatCurrency(despesa)}** (32% da receita). Resultado líquido: **${formatCurrency(resultado)}** com margem de 53%.`,
    motivo: `Meta do mês: **${KPI_DATA.percentualMeta}% atingida**. Faltam **${formatCurrency(EMPRESA.metaMensal - KPI_DATA.vendasDoMes)}** para o alvo. As negociações abertas podem cobrir esse gap se fechadas esta semana.`,
    recomendacao: `Principais alertas: 4 contas vencidas somando ~R$38.000. Recomendo ação imediata de cobrança nos 3 maiores devedores.`,
    proximoPasso: `Financeiro → Gestão de Contas → filtrar por "Vencido" e iniciar processo de cobrança.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver módulo financeiro', type: 'link', href: '/financeiro' },
      { label: 'Ver contas vencidas', type: 'link', href: '/financeiro' },
    ],
    dados: [
      { label: 'Faturamento', valor: formatCurrency(receita), cor: 'green' },
      { label: 'Despesas', valor: formatCurrency(despesa), cor: 'red' },
      { label: 'Resultado Líquido', valor: formatCurrency(resultado), cor: 'green' },
      { label: 'Meta (%)', valor: `${KPI_DATA.percentualMeta}%`, cor: 'blue' },
    ]
  }
}

function responderAnalisarDespesas(): MagisResponse {
  return {
    agente: 'Agente Financeiro', agenteIcon: '🔍', agenteColor: 'orange',
    diagnostico: `Análise de despesas do mês: total de **${formatCurrency(FINANCEIRO.despesas)}**, representando **32% da receita**. Identifico **2 categorias acima da média histórica**.`,
    motivo: `Fornecedores (+12% vs mês anterior) e Logística (+8%) puxaram as despesas para cima. Pessoal e Administrativo dentro do orçado.`,
    recomendacao: `Renegocie contratos de fornecimento e avalie rotas logísticas alternativas. Redução de 5% nas despesas adicionaria **${formatCurrency(FINANCEIRO.despesas*0.05)}** ao resultado líquido.`,
    proximoPasso: `Financeiro → Contas a Pagar → filtrar por categoria para ver o detalhamento.`,
    tipo: 'alerta',
    acoes: [
      { label: 'Ver contas a pagar', type: 'link', href: '/financeiro' },
      { label: 'Criar tarefa de renegociação', type: 'tarefa' },
    ],
    dados: [
      { label: 'Fornecedores', valor: `${formatCurrency(FINANCEIRO.despesas*0.42)} (+12%)`, cor: 'red' },
      { label: 'Logística', valor: `${formatCurrency(FINANCEIRO.despesas*0.18)} (+8%)`, cor: 'orange' },
      { label: 'Pessoal', valor: `${formatCurrency(FINANCEIRO.despesas*0.28)} (normal)`, cor: 'green' },
      { label: 'Administrativo', valor: `${formatCurrency(FINANCEIRO.despesas*0.12)} (normal)`, cor: 'green' },
    ]
  }
}

function responderProjetarCaixa(): MagisResponse {
  const recebimentosMes = FINANCEIRO.recebimentos
  const despesasMes = FINANCEIRO.despesas
  const saldoAtual = recebimentosMes - despesasMes
  const projecao30d = saldoAtual * 0.95
  return {
    agente: 'Agente Financeiro', agenteIcon: '📈', agenteColor: 'blue',
    diagnostico: `Projeção de Fluxo de Caixa para os próximos **30 dias**: entrada estimada de **${formatCurrency(FINANCEIRO.faturamento*0.9)}** e saídas de **${formatCurrency(despesasMes*1.05)}**. Saldo projetado: **${formatCurrency(projecao30d)}**.`,
    motivo: `Baseado na média histórica de recebimentos (85% do faturado no mês) e no crescimento de 5% nas despesas fixas contratadas.`,
    recomendacao: `**Atenção:** ${LANCAMENTOS?.filter((l:any)=>l.status==='vencido').length ?? 4} contas vencidas podem impactar o fluxo. Priorize cobrança dos 3 maiores valores.`,
    proximoPasso: `Acione clientes com contas vencidas e negocie prazos para estabilizar o fluxo projetado.`,
    tipo: 'info',
    acoes: [
      { label: 'Ver financeiro completo', type: 'link', href: '/financeiro' },
      { label: 'Gerenciar contas vencidas', type: 'link', href: '/financeiro' },
    ],
    dados: [
      { label: 'Entradas prev. (30d)', valor: formatCurrency(FINANCEIRO.faturamento*0.9), cor: 'green' },
      { label: 'Saídas prev. (30d)', valor: formatCurrency(despesasMes*1.05), cor: 'red' },
      { label: 'Saldo projetado', valor: formatCurrency(projecao30d), cor: projecao30d > 0 ? 'green' : 'red' },
      { label: 'Contas vencidas', valor: '4 itens em atraso', cor: 'orange' },
    ]
  }
}

function responderIdeiasdia(): MagisResponse {
  return {
    agente: 'Agente Gestor', agenteIcon: '💡', agenteColor: 'purple',
    diagnostico: `**Central de Ideias IA para hoje:** Identifiquei **7 oportunidades** de melhoria operacional e crescimento com base nos dados em tempo real.`,
    motivo: `Análise cruzada de todos os módulos: clientes, estoque, financeiro, pipeline e campanhas ativas.`,
    recomendacao: `Comece pelas 2 primeiras ideias — maior impacto com menor esforço. O tempo estimado total para implementar todas é de 2 horas.`,
    proximoPasso: `Acesse o módulo de IA Preditiva para o painel completo de ideias e recomendações estratégicas.`,
    tipo: 'acao',
    acoes: [
      { label: 'Ver IA Preditiva completa', type: 'link', href: '/ia-preditiva' },
      { label: 'Criar tarefas para as ideias', type: 'tarefa' },
    ],
    dados: [
      { label: '💰 Reativar 32 clientes', valor: 'Potencial R$86k · 45min', cor: 'green' },
      { label: '⚡ Repor 4 produtos críticos', valor: 'Evitar perda de R$22k', cor: 'red' },
      { label: '📣 Campanha liquidação', valor: 'Liberar R$48k imobilizado', cor: 'orange' },
      { label: '🎯 Fechar 2 negs avançadas', valor: 'R$212k no pipeline quente', cor: 'blue' },
      { label: '📊 Cobrar 4 contas vencidas', valor: 'R$38k a receber', cor: 'orange' },
      { label: '👥 Upsell para 24 clientes', valor: 'Ticket médio +15%', cor: 'purple' },
      { label: '⚙️ Automatizar follow-up', valor: 'Liberar 3h/dia da equipe', cor: 'gray' },
    ]
  }
}

function responderDesconhecido(mensagem: string): MagisResponse {
  return {
    agente: 'Magis IA', agenteIcon: '✨', agenteColor: 'blue',
    diagnostico: `Entendi: *"${mensagem}"*. Estou analisando os dados para te dar uma resposta precisa e útil.`,
    motivo: `Como copiloto de gestão, posso analisar clientes, vendas, estoque, campanhas, financeiro e criar tarefas automaticamente.`,
    recomendacao: `Tente comandos como: "Quais clientes devo chamar hoje?", "Adiciona uma venda de R$850 para cliente João", "Cria uma tarefa de follow-up amanhã", "Gera relatório financeiro".`,
    proximoPasso: `Use os botões de ação rápida abaixo ou escreva o que precisa em linguagem natural.`,
    tipo: 'info',
    acoes: [
      { label: 'Resumo do dia', type: 'ia' },
      { label: 'Situação da meta', type: 'ia' },
      { label: 'Riscos operacionais', type: 'ia' },
    ],
    dados: []
  }
}

// ============================================================
// EXPORT PRINCIPAL
// ============================================================
export function processarMensagem(mensagem: string): MagisResponse {
  const intencao = detectarIntencao(mensagem)
  switch (intencao) {
    case 'clientes_chamar':       return responderClientesChamar()
    case 'clientes_inativos':     return responderClientesInativos()
    case 'clientes_recompra':     return responderRecompra()
    case 'produto_faltar':        return responderProdutoFaltar()
    case 'produto_parado':        return responderProdutoParado()
    case 'meta_faturamento':      return responderMeta()
    case 'campanha_criar':        return responderCampanha()
    case 'resumo_dia':            return responderResumoDia()
    case 'vendas_funil':          return responderFunil()
    case 'risco_operacional':     return responderRisco()
    case 'financeiro_resultado':  return responderMeta()
    case 'melhor_vendedor':       return responderMelhorVendedor()
    case 'melhor_produto':        return responderMelhorProduto()
    case 'total_vendido':         return responderTotalVendido()
    case 'anos_vendas':           return responderAnosVendas()
    case 'horarios_pico':         return responderHorariosPico()
    case 'agenda_compromissos':   return responderAgenda()
    case 'criar_tarefa':          return responderCriarTarefa(mensagem)
    case 'adicionar_venda':       return responderAdicionarVenda(mensagem)
    case 'ideias_vendas':         return responderIdeiasVendas()
    case 'gerar_relatorio':       return responderGerarRelatorio()
    case 'analisar_despesas':     return responderAnalisarDespesas()
    case 'projetar_caixa':        return responderProjetarCaixa()
    case 'ideias_dia':            return responderIdeiasdia()
    default:                      return responderDesconhecido(mensagem)
  }
}

export const SUGESTOES_RAPIDAS = [
  'Quais clientes devo chamar hoje?',
  'Quanto falta para bater a meta?',
  'Quais produtos podem faltar?',
  'Clientes inativos para reativar',
  'Ideias para vender mais essa semana',
  'Resumo do dia',
  'Riscos operacionais',
  'Situação do pipeline de vendas',
  'Qual foi o melhor vendedor?',
  'Analisar despesas deste mês',
  'Projetar fluxo de caixa',
  'O que tenho na agenda hoje?',
  'Criar tarefa de follow-up',
]

// Dados para o painel de Ideias do Dia
export function getIdeiasRapidas() {
  const faltaMeta = EMPRESA.metaMensal - KPI_DATA.vendasDoMes
  return [
    {
      id: 'idea-1',
      titulo: 'Reativar clientes de alto valor',
      descricao: `${CLIENTES_INATIVOS.length} clientes inativos com potencial de R$ 86.000 em receita imediata.`,
      impacto: `+R$ 86.000`,
      esforco: 'Baixo',
      categoria: 'comercial',
      corCategoria: 'green',
      icone: '👥',
      acao: 'Clientes inativos para reativar',
    },
    {
      id: 'idea-2',
      titulo: 'Repor estoque crítico',
      descricao: `${PRODUTOS_EM_RUPTURA.length} produtos em ruptura. Cada dia sem reposição é venda perdida diretamente.`,
      impacto: `Evitar R$ 22.000 de perda`,
      esforco: 'Médio',
      categoria: 'estoque',
      corCategoria: 'red',
      icone: '📦',
      acao: 'Quais produtos podem faltar?',
    },
    {
      id: 'idea-3',
      titulo: 'Fechar pipeline quente',
      descricao: `8 negociações avançadas somando R$ 340.000. Fechar metade já atinge ${Math.round(170000/faltaMeta*100)}% da meta restante.`,
      impacto: `R$ 170.000 potencial`,
      esforco: 'Médio',
      categoria: 'vendas',
      corCategoria: 'blue',
      icone: '🎯',
      acao: 'Situação do pipeline de vendas',
    },
    {
      id: 'idea-4',
      titulo: 'Campanha de liquidação',
      descricao: `${PRODUTOS_PARADOS.length} produtos parados há mais de 90 dias. Liquidação libera caixa imediato.`,
      impacto: `Liberar R$ 48.000`,
      esforco: 'Baixo',
      categoria: 'marketing',
      corCategoria: 'purple',
      icone: '📣',
      acao: 'Crie uma campanha para produto X',
    },
    {
      id: 'idea-5',
      titulo: 'Cobrar contas vencidas',
      descricao: `4 contas vencidas somando aprox. R$ 38.000. Ação imediata melhora o fluxo de caixa do mês.`,
      impacto: `+R$ 38.000 no caixa`,
      esforco: 'Baixo',
      categoria: 'financeiro',
      corCategoria: 'orange',
      icone: '💰',
      acao: 'Projetar fluxo de caixa',
    },
  ]
}


