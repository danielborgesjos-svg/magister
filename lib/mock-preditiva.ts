import { LucideIcon } from "lucide-react";

export interface KPIData {
  id: string;
  titulo: string;
  valor: string;
  icone: string; // nome do icone Lucide
  iconeCor: string; // ex: text-indigo-500
  indicadorTexto?: string;
  indicadorIcone?: string;
  indicadorCorBg?: string; // ex: bg-emerald-50
  indicadorCorText?: string; // ex: text-emerald-600
  progressoValor?: number;
  progressoCorBg?: string;
  badgeValor?: string;
  badgeCorBg?: string;
  badgeCorText?: string;
  subtexto?: string;
}

export interface CenarioMiniCard {
  titulo: string;
  valor: string;
  subtexto: string;
  corBg: string;
  corBorder: string;
  corTitulo: string;
  corSubtexto: string;
}

export interface TabelaRiscoItem {
  id: string;
  col1: string; // ex: SKU ou Nome
  col2: string; // ex: Dias ou Valor
  col3Valor: number; // Porcentagem de risco
}

export interface AcaoRecomendada {
  id: string;
  titulo: string;
  desc: string;
  kpi1: string; // ex: Economia: R$ 12.500
  kpi1Cor?: string;
  kpi2: string; // ex: +8% nos próximos dias
  kpi2Cor?: string;
  botaoPrimario: string;
  botaoSecundario: string;
  badge?: string;
  badgeCorBg?: string;
  badgeCorText?: string;
}

export interface BlocoMistoItem {
  id: string;
  texto: string;
  subtexto: string;
  progressoValor?: number;
  progressoCorBg?: string;
  badge?: string;
  badgeCorBg?: string;
  badgeCorText?: string;
  acoes?: string[]; // icones
}

export interface BlocoDirData {
  titulo: string;
  icone: string;
  kpi1Titulo: string;
  kpi1Valor: string;
  kpi1Sub: string;
  kpi1Cor: string;
  kpi2Titulo: string;
  kpi2Valor: string;
  kpi2Cor: string;
  kpi3Titulo: string;
  kpi3Valor: string;
  kpi3Cor: string;
  graficoTitulo: string;
  graficoDados: { name: string; valor: number }[];
}

export interface DemandaItem {
  col1: string;
  col2: string;
  variacao: number; // ex: 18.6
}

export interface AlertaItem {
  id: string;
  texto: string;
  severidade: string;
  cor: "red" | "orange" | "amber" | "emerald" | "indigo" | "blue";
}

export interface PredicaoDashboardData {
  titulo: string;
  kpis: KPIData[];
  cenarios: {
    titulo: string;
    graficoDados: any[];
    miniCards: CenarioMiniCard[];
  };
  tabelaRisco: {
    titulo: string;
    icone: string;
    iconeCor: string;
    col1Nome: string;
    col2Nome: string;
    col3Nome: string;
    itens: TabelaRiscoItem[];
  };
  acao1: {
    titulo: string;
    icone: string;
    iconeCor: string;
    itens: AcaoRecomendada[];
  };
  acao2: {
    titulo: string;
    icone: string;
    iconeCor: string;
    itens: AcaoRecomendada[];
  };
  blocoEsq: {
    titulo: string;
    icone: string;
    iconeCor: string;
    itens: BlocoMistoItem[];
  };
  blocoDir: BlocoDirData;
  demanda: {
    titulo: string;
    col1Nome: string;
    col2Nome: string;
    itens: DemandaItem[];
  };
  alertas: {
    titulo: string;
    itens: AlertaItem[];
  };
  explicacao: {
    tags: string[];
    confianca: number;
    registros: string;
  };
}

// ─── DADOS DO SETOR VISÃO EXECUTIVA ──────────────────────────

const DATA_VISAO_EXECUTIVA: PredicaoDashboardData = {
  titulo: "Inteligência Preditiva",
  kpis: [
    {
      id: "kpi1", titulo: "Faturamento Projetado (30D)", valor: "R$ 980.000,00",
      icone: "DollarSign", iconeCor: "text-slate-500", indicadorTexto: "+15,9% vs período anterior",
      indicadorIcone: "TrendingUp", indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi2", titulo: "Prob. de Atingir Meta", valor: "87%", subtexto: "Meta: R$ 900.000",
      icone: "CheckCircle2", iconeCor: "text-slate-500", progressoValor: 87, progressoCorBg: "bg-blue-500"
    },
    {
      id: "kpi3", titulo: "Risco de Ruptura", valor: "R$ 183.000", subtexto: "Valor em risco de perda",
      icone: "AlertTriangle", iconeCor: "text-red-500", badgeValor: "3", badgeCorBg: "bg-red-100", badgeCorText: "text-red-600"
    },
    {
      id: "kpi4", titulo: "Oportunidades IA", valor: "R$ 16.700", subtexto: "Economia potencial",
      icone: "Zap", iconeCor: "text-indigo-500", badgeValor: "2", badgeCorBg: "bg-indigo-100", badgeCorText: "text-indigo-600"
    },
    {
      id: "kpi5", titulo: "Margem Projetada", valor: "21,4%",
      icone: "BarChart2", iconeCor: "text-slate-500", indicadorTexto: "+2,3 p.p. vs período anterior",
      indicadorIcone: "TrendingUp", indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi6", titulo: "Caixa Projetado (15D)", valor: "R$ 412.000",
      icone: "Activity", iconeCor: "text-slate-500", indicadorTexto: "Atenção: queda prevista",
      indicadorCorBg: "bg-orange-50", indicadorCorText: "text-orange-600"
    }
  ],
  cenarios: {
    titulo: "Cenários Preditivos",
    graficoDados: [
      { name: 'Jul', realizado: 10, realista: 10, otimista: 10, pessimista: 10, meta: 11 },
      { name: 'Ago', realizado: 11.2, realista: 11.2, otimista: 11.2, pessimista: 11.2, meta: 11.5 },
      { name: 'Set', realizado: 12.5, realista: 12.5, otimista: 12.5, pessimista: 12.5, meta: 12 },
      { name: 'Out', realista: 13.8, otimista: 14.5, pessimista: 12.0, meta: 12.5 },
      { name: 'Nov', realista: 14.5, otimista: 16.2, pessimista: 11.8, meta: 13 },
      { name: 'Dez', realista: 15.2, otimista: 18.7, pessimista: 12.4, meta: 13.5 },
    ],
    miniCards: [
      { titulo: "Pessimista", valor: "R$ 12,4M", subtexto: "-8% vs meta", corBg: "bg-red-50/50", corBorder: "border-red-100", corTitulo: "text-red-600", corSubtexto: "text-red-500" },
      { titulo: "Realista", valor: "R$ 15,2M", subtexto: "Dentro da meta", corBg: "bg-emerald-50/50", corBorder: "border-emerald-100", corTitulo: "text-emerald-600", corSubtexto: "text-emerald-500" },
      { titulo: "Otimista", valor: "R$ 18,7M", subtexto: "+12% vs meta", corBg: "bg-emerald-100/50", corBorder: "border-emerald-200", corTitulo: "text-emerald-700", corSubtexto: "text-emerald-600" }
    ]
  },
  tabelaRisco: {
    titulo: "Estoque em Risco", icone: "PackageSearch", iconeCor: "text-orange-500",
    col1Nome: "SKU", col2Nome: "Ruptura em", col3Nome: "Risco",
    itens: [
      { id: "1", col1: "Mola Hidráulica Aérea", col2: "4 dias", col3Valor: 98 },
      { id: "2", col1: "Barra Antipânico Touch", col2: "12 dias", col3Valor: 75 },
      { id: "3", col1: "Cilindro Multiponto", col2: "18 dias", col3Valor: 62 },
      { id: "4", col1: "Fechadura Eletrônica", col2: "22 dias", col3Valor: 58 },
    ]
  },
  acao1: {
    titulo: "Ações de Suprimentos", icone: "Zap", iconeCor: "text-indigo-500",
    itens: [
      { id: "1", titulo: "AçoMax (Matéria-prima)", desc: "Antecipar compra de 5 toneladas", kpi1: "Economia: R$ 12.500", kpi1Cor: "text-indigo-600", kpi2: "+8% nos próximos 15 dias", kpi2Cor: "text-red-500", botaoPrimario: "Gerar Pedido", botaoSecundario: "Simular impacto" },
      { id: "2", titulo: "Embalagens Sul", desc: "Fechar contrato semestral agora", kpi1: "Economia: R$ 4.200", kpi1Cor: "text-indigo-600", kpi2: "+4% no próximo mês", kpi2Cor: "text-red-500", botaoPrimario: "Gerar Pedido", botaoSecundario: "Simular impacto" }
    ]
  },
  acao2: {
    titulo: "Previsões de Vendas & Marketing", icone: "TrendingUp", iconeCor: "text-emerald-500",
    itens: [
      { id: "1", titulo: "Campanha Black Friday B2B", desc: "Custo: R$ 5.000", kpi1: "Retorno: R$ 85.000", kpi1Cor: "text-emerald-600", kpi2: "ROI: 1600%", kpi2Cor: "text-indigo-600", badge: "ALTA PROB.", badgeCorBg: "bg-emerald-100", badgeCorText: "text-emerald-700", botaoPrimario: "Criar campanha", botaoSecundario: "Simular / Público" },
      { id: "2", titulo: "Email Marketing Base Inativa", desc: "Custo: R$ 200", kpi1: "Retorno: R$ 12.000", kpi1Cor: "text-emerald-600", kpi2: "ROI: 5900%", kpi2Cor: "text-indigo-600", badge: "MÉDIA PROB.", badgeCorBg: "bg-amber-100", badgeCorText: "text-amber-700", botaoPrimario: "Criar campanha", botaoSecundario: "Simular / Público" }
    ]
  },
  blocoEsq: {
    titulo: "Produção Preditiva", icone: "Database", iconeCor: "text-blue-500",
    itens: [
      { id: "1", texto: "Linha 2 com 93% de ocupação", subtexto: "Capacidade próxima do limite", progressoValor: 93, progressoCorBg: "bg-blue-500" },
      { id: "2", texto: "OP 4521 com 78% de chance de atraso", subtexto: "Entrega prevista: 28/05", progressoValor: 78, progressoCorBg: "bg-orange-500" },
      { id: "3", texto: "Falta de insumo X compromete 6 ordens", subtexto: "Impacto previsto: R$ 42.000", badge: "Alto", badgeCorBg: "bg-red-100", badgeCorText: "text-red-700", acoes: ["Activity", "BarChart2", "ChevronRight"] }
    ]
  },
  blocoDir: {
    titulo: "Financeiro Preditivo", icone: "DollarSign",
    kpi1Titulo: "Fluxo de Caixa", kpi1Valor: "R$ 412.000", kpi1Sub: "15 dias", kpi1Cor: "text-indigo-600",
    kpi2Titulo: "Inadimplência", kpi2Valor: "2,8%", kpi2Cor: "text-orange-500",
    kpi3Titulo: "Rec. em Risco", kpi3Valor: "R$ 83.400", kpi3Cor: "text-red-500",
    graficoTitulo: "Fluxo de caixa (R$)",
    graficoDados: [
      { name: 'Hoje', valor: 412 }, { name: '+5d', valor: 450 }, { name: '+10d', valor: 380 }, { name: '+15d', valor: 290 },
    ]
  },
  demanda: {
    titulo: "Demanda Prevista por Produto", col1Nome: "Produto / Família", col2Nome: "Demanda 30d",
    itens: [
      { col1: "Barra Antipânico", col2: "2.450 un", variacao: 18.6 },
      { col1: "Mola Aérea", col2: "1.980 un", variacao: 12.3 },
      { col1: "Fechadura", col2: "1.420 un", variacao: -3.1 },
      { col1: "Trinco Automático", col2: "980 un", variacao: 7.8 },
    ]
  },
  alertas: {
    titulo: "Alertas Prioritários da IA",
    itens: [
      { id: "1", texto: "3 OS atrasadas — SLA em risco", severidade: "Crítico", cor: "red" },
      { id: "2", texto: "5 produtos com ruptura prevista", severidade: "Alto", cor: "orange" },
      { id: "3", texto: "2 clientes sem retorno há 15 dias", severidade: "Médio", cor: "amber" },
      { id: "4", texto: "Receita 8% acima da meta mensal", severidade: "Oportunidade", cor: "emerald" },
    ]
  },
  explicacao: {
    tags: ["Sazonalidade do mercado", "Histórico de vendas", "Pedidos em carteira", "Funil de oportunidades", "Atraso de fornecedores", "Lead time", "Comportamento de clientes", "Campanhas ativas"],
    confianca: 96,
    registros: "18 milhões"
  }
};

// ─── DADOS DO SETOR RH ──────────────────────────

const DATA_RH: PredicaoDashboardData = {
  titulo: "Inteligência Preditiva - RH",
  kpis: [
    {
      id: "kpi1", titulo: "Turnover Projetado (30D)", valor: "4,2%",
      icone: "Users", iconeCor: "text-slate-500", indicadorTexto: "-1,1 p.p vs anterior",
      indicadorIcone: "TrendingUp", indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi2", titulo: "Risco Trabalhista", valor: "R$ 45.000", subtexto: "2 potenciais passivos",
      icone: "AlertTriangle", iconeCor: "text-red-500", badgeValor: "2", badgeCorBg: "bg-red-100", badgeCorText: "text-red-600"
    },
    {
      id: "kpi3", titulo: "Tempo Médio Contratação", valor: "18 dias", subtexto: "Meta: 15 dias",
      icone: "Clock", iconeCor: "text-slate-500", progressoValor: 80, progressoCorBg: "bg-amber-500"
    },
    {
      id: "kpi4", titulo: "Folha / Faturamento", valor: "12,8%", subtexto: "Dentro do limite seguro",
      icone: "DollarSign", iconeCor: "text-indigo-500", indicadorTexto: "Estável", indicadorCorBg: "bg-blue-50", indicadorCorText: "text-blue-600"
    },
    {
      id: "kpi5", titulo: "Clima Organizacional (IA)", valor: "82/100",
      icone: "Activity", iconeCor: "text-slate-500", indicadorTexto: "Muito Bom",
      indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi6", titulo: "Custos Extras (HE)", valor: "R$ 12.400",
      icone: "BarChart2", iconeCor: "text-slate-500", indicadorTexto: "Alerta: +15% na Produção",
      indicadorCorBg: "bg-orange-50", indicadorCorText: "text-orange-600"
    }
  ],
  cenarios: {
    titulo: "Cenários Preditivos - Custos de Folha",
    graficoDados: [
      { name: 'Jul', realizado: 210, realista: 210, otimista: 210, pessimista: 210, meta: 200 },
      { name: 'Ago', realizado: 215, realista: 215, otimista: 215, pessimista: 215, meta: 200 },
      { name: 'Set', realizado: 205, realista: 205, otimista: 205, pessimista: 205, meta: 200 },
      { name: 'Out', realista: 208, otimista: 195, pessimista: 230, meta: 205 },
      { name: 'Nov', realista: 210, otimista: 198, pessimista: 245, meta: 205 },
      { name: 'Dez', realista: 235, otimista: 215, pessimista: 280, meta: 220 },
    ],
    miniCards: [
      { titulo: "Pessimista", valor: "R$ 280k", subtexto: "Com rescisões em massa", corBg: "bg-red-50/50", corBorder: "border-red-100", corTitulo: "text-red-600", corSubtexto: "text-red-500" },
      { titulo: "Realista", valor: "R$ 235k", subtexto: "Com 13º provisionado", corBg: "bg-emerald-50/50", corBorder: "border-emerald-100", corTitulo: "text-emerald-600", corSubtexto: "text-emerald-500" },
      { titulo: "Otimista (Meta)", valor: "R$ 215k", subtexto: "Sem rotatividade", corBg: "bg-emerald-100/50", corBorder: "border-emerald-200", corTitulo: "text-emerald-700", corSubtexto: "text-emerald-600" }
    ]
  },
  tabelaRisco: {
    titulo: "Colaboradores em Risco de Churn", icone: "Users", iconeCor: "text-orange-500",
    col1Nome: "Nome / Cargo", col2Nome: "Motivo (IA)", col3Nome: "Risco",
    itens: [
      { id: "1", col1: "Lucas M. (Sênior)", col2: "Salário defasado", col3Valor: 92 },
      { id: "2", col1: "Amanda S. (Líder)", col2: "Carga horária", col3Valor: 78 },
      { id: "3", col1: "Carlos V. (Técnico)", col2: "Conflito direto", col3Valor: 65 },
      { id: "4", col1: "Mariana T. (Dev)", col2: "Falta feedback", col3Valor: 54 },
    ]
  },
  acao1: {
    titulo: "Ações de Retenção", icone: "ShieldAlert", iconeCor: "text-indigo-500",
    itens: [
      { id: "1", titulo: "Reajuste Time Técnico", desc: "Equiparar salário mercado", kpi1: "Impacto Folha: +R$ 3.500/mês", kpi1Cor: "text-indigo-600", kpi2: "Custo Rescisão evitado: R$ 85.000", kpi2Cor: "text-emerald-500", botaoPrimario: "Simular", botaoSecundario: "Ver Detalhes" },
      { id: "2", titulo: "Campanha Saúde Mental", desc: "Reduzir estresse lideranças", kpi1: "Custo Estimado: R$ 1.200", kpi1Cor: "text-indigo-600", kpi2: "Impacto no Clima: +12p", kpi2Cor: "text-emerald-500", botaoPrimario: "Agendar", botaoSecundario: "Ver Parceiros" }
    ]
  },
  acao2: {
    titulo: "Previsões de Contratação", icone: "Users", iconeCor: "text-emerald-500",
    itens: [
      { id: "1", titulo: "Vaga: Líder de Produção", desc: "Mercado aquecido", kpi1: "Tempo Médio Previsão: 45 dias", kpi1Cor: "text-orange-600", kpi2: "Salário Mínimo: R$ 6.000", kpi2Cor: "text-indigo-600", badge: "CRÍTICA", badgeCorBg: "bg-red-100", badgeCorText: "text-red-700", botaoPrimario: "Impulsionar Vaga", botaoSecundario: "Market Analytics" },
      { id: "2", titulo: "Vaga: Auxiliar Admin", desc: "Mercado favorável", kpi1: "Tempo Médio Previsão: 8 dias", kpi1Cor: "text-emerald-600", kpi2: "Salário Mínimo: R$ 2.200", kpi2Cor: "text-indigo-600", badge: "BAIXA", badgeCorBg: "bg-slate-100", badgeCorText: "text-slate-700", botaoPrimario: "Iniciar Triagem", botaoSecundario: "Ver Filtros" }
    ]
  },
  blocoEsq: {
    titulo: "Performance & Avaliações", icone: "Activity", iconeCor: "text-blue-500",
    itens: [
      { id: "1", texto: "Engajamento Setor Produtivo", subtexto: "Queda leve detectada nos relatórios", progressoValor: 68, progressoCorBg: "bg-orange-500" },
      { id: "2", texto: "Treinamentos Concluídos (NR-12)", subtexto: "Meta legal em dia", progressoValor: 95, progressoCorBg: "bg-emerald-500" },
      { id: "3", texto: "Feedback 360 atrasado em 3 gestores", subtexto: "Risco de desmotivação das equipes", badge: "Médio", badgeCorBg: "bg-amber-100", badgeCorText: "text-amber-700" }
    ]
  },
  blocoDir: {
    titulo: "Absenteísmo & Horas Extras", icone: "Clock",
    kpi1Titulo: "Taxa Absenteísmo", kpi1Valor: "3,1%", kpi1Sub: "Meta < 3,5%", kpi1Cor: "text-emerald-600",
    kpi2Titulo: "Custo Horas Extras", kpi2Valor: "R$ 12,4k", kpi2Cor: "text-orange-500",
    kpi3Titulo: "Férias Acumuladas", kpi3Valor: "18 profis.", kpi3Cor: "text-red-500",
    graficoTitulo: "Horas Extras projetadas por semana",
    graficoDados: [
      { name: 'Sem 1', valor: 25 }, { name: 'Sem 2', valor: 30 }, { name: 'Sem 3', valor: 85 }, { name: 'Sem 4', valor: 15 },
    ]
  },
  demanda: {
    titulo: "Necessidade Projetada de Mão de Obra", col1Nome: "Setor / Cargo", col2Nome: "Demanda 90d",
    itens: [
      { col1: "Produção - Operador CNC", col2: "+3 vagas", variacao: 100 },
      { col1: "Expedição - Conferente", col2: "+1 vaga", variacao: 25 },
      { col1: "Vendas - BDR", col2: "-1 vaga (remanej.)", variacao: -10 },
      { col1: "Técnico de Manutenção", col2: "+2 vagas", variacao: 50 },
    ]
  },
  alertas: {
    titulo: "Alertas Prioritários de RH",
    itens: [
      { id: "1", texto: "Risco de passivo: João Paulo M. sem férias há 20 meses", severidade: "Crítico", cor: "red" },
      { id: "2", texto: "Aumento de 40% em atestados no setor de Produção", severidade: "Alto", cor: "orange" },
      { id: "3", texto: "Abaixo da cota de PCD em 2 colaboradores", severidade: "Médio", cor: "amber" },
      { id: "4", texto: "Treinamento CIPA vence em 10 dias", severidade: "Alerta", cor: "blue" },
    ]
  },
  explicacao: {
    tags: ["Ponto eletrônico", "Análise de Sentimento em pesquisas", "Histórico de Atestados", "Market Salary Data", "Avaliação de Desempenho", "Gatilhos de saída passados"],
    confianca: 89,
    registros: "1.2 milhões"
  }
};

// ─── DADOS DO SETOR COMERCIAL ──────────────────────────

const DATA_COMERCIAL: PredicaoDashboardData = {
  titulo: "Inteligência Preditiva - Comercial",
  kpis: [
    {
      id: "kpi1", titulo: "Vendas Fechadas (30D)", valor: "R$ 650.000,00",
      icone: "DollarSign", iconeCor: "text-slate-500", indicadorTexto: "+8,2% vs mês anterior",
      indicadorIcone: "TrendingUp", indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi2", titulo: "Pipeline Aberto", valor: "R$ 1.8M", subtexto: "Em negociação",
      icone: "Database", iconeCor: "text-slate-500", progressoValor: 60, progressoCorBg: "bg-blue-500"
    },
    {
      id: "kpi3", titulo: "Oportunidades em Risco", valor: "R$ 320.000", subtexto: "15 negócios parados",
      icone: "AlertTriangle", iconeCor: "text-red-500", badgeValor: "15", badgeCorBg: "bg-red-100", badgeCorText: "text-red-600"
    },
    {
      id: "kpi4", titulo: "Ticket Médio", valor: "R$ 4.250", subtexto: "Meta: R$ 4.500",
      icone: "Zap", iconeCor: "text-indigo-500", indicadorTexto: "-5,5%", indicadorCorBg: "bg-orange-50", indicadorCorText: "text-orange-600"
    },
    {
      id: "kpi5", titulo: "Taxa Conversão Preditiva", valor: "18,4%",
      icone: "BarChart2", iconeCor: "text-slate-500", indicadorTexto: "+1,2 p.p.",
      indicadorIcone: "TrendingUp", indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi6", titulo: "Ciclo de Vendas", valor: "22 dias",
      icone: "Clock", iconeCor: "text-slate-500", indicadorTexto: "Ideal",
      indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    }
  ],
  cenarios: {
    titulo: "Projeção de Vendas Mensais (Fechamentos)",
    graficoDados: [
      { name: 'Jul', realizado: 500, realista: 500, otimista: 500, pessimista: 500, meta: 550 },
      { name: 'Ago', realizado: 580, realista: 580, otimista: 580, pessimista: 580, meta: 600 },
      { name: 'Set', realizado: 650, realista: 650, otimista: 650, pessimista: 650, meta: 600 },
      { name: 'Out', realista: 680, otimista: 750, pessimista: 550, meta: 650 },
      { name: 'Nov', realista: 750, otimista: 950, pessimista: 600, meta: 700 },
      { name: 'Dez', realista: 820, otimista: 1100, pessimista: 650, meta: 750 },
    ],
    miniCards: [
      { titulo: "Pessimista", valor: "R$ 550k", subtexto: "-15% vs meta (Out)", corBg: "bg-red-50/50", corBorder: "border-red-100", corTitulo: "text-red-600", corSubtexto: "text-red-500" },
      { titulo: "Realista", valor: "R$ 680k", subtexto: "+5% vs meta (Out)", corBg: "bg-emerald-50/50", corBorder: "border-emerald-100", corTitulo: "text-emerald-600", corSubtexto: "text-emerald-500" },
      { titulo: "Otimista", valor: "R$ 750k", subtexto: "+15% vs meta (Out)", corBg: "bg-emerald-100/50", corBorder: "border-emerald-200", corTitulo: "text-emerald-700", corSubtexto: "text-emerald-600" }
    ]
  },
  tabelaRisco: {
    titulo: "Contratos/Negociações Frias", icone: "Users", iconeCor: "text-orange-500",
    col1Nome: "Cliente", col2Nome: "Dias parado", col3Nome: "Risco Perda",
    itens: [
      { id: "1", col1: "Construtora Alfa", col2: "14 dias", col3Valor: 90 },
      { id: "2", col1: "Rede Supermercados Z", col2: "9 dias", col3Valor: 82 },
      { id: "3", col1: "Engenharia Forte", col2: "5 dias", col3Valor: 60 },
      { id: "4", col1: "Lojas Beta", col2: "3 dias", col3Valor: 45 },
    ]
  },
  acao1: {
    titulo: "Recomendações de Fechamento", icone: "Zap", iconeCor: "text-indigo-500",
    itens: [
      { id: "1", titulo: "Construtora Alfa", desc: "Oferecer frete grátis para destravar o lead", kpi1: "Impacto no Custo: R$ 850", kpi1Cor: "text-orange-600", kpi2: "Venda Destravada: R$ 45.000", kpi2Cor: "text-emerald-500", botaoPrimario: "Gerar Proposta", botaoSecundario: "Detalhes do Lead" },
      { id: "2", titulo: "Rede Supermercados Z", desc: "Fazer follow-up via ligação com o diretor", kpi1: "Status Atual: Aguard. Diretoria", kpi1Cor: "text-slate-600", kpi2: "Prob. Fechamento: 82%", kpi2Cor: "text-emerald-500", botaoPrimario: "Agendar Ligação", botaoSecundario: "Ver Histórico" }
    ]
  },
  acao2: {
    titulo: "Campanhas Sugeridas", icone: "TrendingUp", iconeCor: "text-emerald-500",
    itens: [
      { id: "1", titulo: "Upsell em Clientes Inativos", desc: "Oferecer nova linha de Fechaduras Eletrônicas", kpi1: "Custo Campanha: R$ 350", kpi1Cor: "text-indigo-600", kpi2: "Pipeline Gerado: ~R$ 120k", kpi2Cor: "text-emerald-600", badge: "BAIXO ESFORÇO", badgeCorBg: "bg-emerald-100", badgeCorText: "text-emerald-700", botaoPrimario: "Criar Campanha", botaoSecundario: "Ver Base" },
      { id: "2", titulo: "Desconto Volume Fim de Mês", desc: "Gatilho para bater meta trimestral", kpi1: "Perda Margem: -2%", kpi1Cor: "text-orange-600", kpi2: "Aceleração Vendas: R$ 80k", kpi2Cor: "text-indigo-600", badge: "URGENTE", badgeCorBg: "bg-red-100", badgeCorText: "text-red-700", botaoPrimario: "Lançar Desconto", botaoSecundario: "Simular" }
    ]
  },
  blocoEsq: {
    titulo: "Performance de Vendedores", icone: "Users", iconeCor: "text-blue-500",
    itens: [
      { id: "1", texto: "Marcos (Vendedor Sênior)", subtexto: "Meta mensal atingida em 85%", progressoValor: 85, progressoCorBg: "bg-blue-500" },
      { id: "2", texto: "Fernanda (Vendedora Pleno)", subtexto: "Meta mensal atingida em 110%", progressoValor: 100, progressoCorBg: "bg-emerald-500" },
      { id: "3", texto: "Pedro (Novo Vendedor)", subtexto: "Abaixo da cota de leads prospectados", badge: "Alerta", badgeCorBg: "bg-orange-100", badgeCorText: "text-orange-700" }
    ]
  },
  blocoDir: {
    titulo: "Funil Preditivo", icone: "DollarSign",
    kpi1Titulo: "Leads Gerados", kpi1Valor: "450", kpi1Sub: "30 dias", kpi1Cor: "text-indigo-600",
    kpi2Titulo: "SQLs (Qualificados)", kpi2Valor: "125", kpi2Cor: "text-emerald-500",
    kpi3Titulo: "Propostas Abertas", kpi3Valor: "35", kpi3Cor: "text-orange-500",
    graficoTitulo: "Fechamentos por semana (R$)",
    graficoDados: [
      { name: 'Sem 1', valor: 120 }, { name: 'Sem 2', valor: 85 }, { name: 'Sem 3', valor: 210 }, { name: 'Sem 4', valor: 150 },
    ]
  },
  demanda: {
    titulo: "Top Produtos no Pipeline Atual", col1Nome: "Produto / Linha", col2Nome: "Oportunidades (R$)",
    itens: [
      { col1: "Fechadura Biométrica Pro", col2: "R$ 450.000", variacao: 25.4 },
      { col1: "Barra Antipânico Inox", col2: "R$ 320.000", variacao: 14.2 },
      { col1: "Mola Hidráulica Média", col2: "R$ 180.000", variacao: -5.1 },
      { col1: "Linha de Acesso Condominial", col2: "R$ 150.000", variacao: 42.0 },
    ]
  },
  alertas: {
    titulo: "Alertas Prioritários de Vendas",
    itens: [
      { id: "1", texto: "Oportunidade Alfa (R$ 85k) corre alto risco de churn", severidade: "Crítico", cor: "red" },
      { id: "2", texto: "Conversão de leads MQL despencou 12% nos últimos 5 dias", severidade: "Alto", cor: "orange" },
      { id: "3", texto: "3 vendedores não atualizaram o CRM hoje", severidade: "Médio", cor: "amber" },
      { id: "4", texto: "Taxa de abertura de propostas bateu recorde (65%)", severidade: "Oportunidade", cor: "emerald" },
    ]
  },
  explicacao: {
    tags: ["Engajamento de E-mail (HubSpot)", "Tempo de estágio no CRM", "Histórico de compras do lead", "Análise de objeções via NLP", "Velocidade de fechamento"],
    confianca: 92,
    registros: "5.4 milhões de interações"
  }
};

// ─── DADOS DO SETOR CLIENTES (CRM) ──────────────────────────

const DATA_CLIENTES: PredicaoDashboardData = {
  titulo: "Inteligência Preditiva - Clientes & CRM",
  kpis: [
    {
      id: "kpi1", titulo: "LTV Preditivo Médio", valor: "R$ 45.200",
      icone: "TrendingUp", iconeCor: "text-slate-500", indicadorTexto: "+12,4% vs ano anterior",
      indicadorIcone: "TrendingUp", indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi2", titulo: "Risco de Churn (Geral)", valor: "3,8%", subtexto: "Meta: < 5%",
      icone: "AlertTriangle", iconeCor: "text-red-500", indicadorTexto: "Estável", indicadorCorBg: "bg-blue-50", indicadorCorText: "text-blue-600"
    },
    {
      id: "kpi3", titulo: "Receita em Risco (MRR)", valor: "R$ 18.500", subtexto: "Baseado no engajamento",
      icone: "DollarSign", iconeCor: "text-slate-500", badgeValor: "6", badgeCorBg: "bg-orange-100", badgeCorText: "text-orange-600"
    },
    {
      id: "kpi4", titulo: "NPS Projetado (Q3)", valor: "74", subtexto: "Zona de Excelência",
      icone: "Activity", iconeCor: "text-indigo-500", progressoValor: 74, progressoCorBg: "bg-emerald-500"
    },
    {
      id: "kpi5", titulo: "Clientes Ativos", valor: "1.248",
      icone: "Users", iconeCor: "text-slate-500", indicadorTexto: "+45 novos",
      indicadorIcone: "TrendingUp", indicadorCorBg: "bg-emerald-50", indicadorCorText: "text-emerald-600"
    },
    {
      id: "kpi6", titulo: "Tickets Suporte (15D)", valor: "142",
      icone: "Database", iconeCor: "text-slate-500", indicadorTexto: "Alerta: +18% na semana",
      indicadorCorBg: "bg-orange-50", indicadorCorText: "text-orange-600"
    }
  ],
  cenarios: {
    titulo: "Projeção de Churn Rate Mensal",
    graficoDados: [
      { name: 'Jul', realizado: 4.1, realista: 4.1, otimista: 4.1, pessimista: 4.1, meta: 5.0 },
      { name: 'Ago', realizado: 3.9, realista: 3.9, otimista: 3.9, pessimista: 3.9, meta: 5.0 },
      { name: 'Set', realizado: 3.8, realista: 3.8, otimista: 3.8, pessimista: 3.8, meta: 5.0 },
      { name: 'Out', realista: 3.7, otimista: 3.2, pessimista: 4.5, meta: 5.0 },
      { name: 'Nov', realista: 3.8, otimista: 3.1, pessimista: 5.2, meta: 5.0 },
      { name: 'Dez', realista: 3.5, otimista: 2.8, pessimista: 6.1, meta: 5.0 },
    ],
    miniCards: [
      { titulo: "Pessimista", valor: "6,1%", subtexto: "Risco de +R$40k perdidos", corBg: "bg-red-50/50", corBorder: "border-red-100", corTitulo: "text-red-600", corSubtexto: "text-red-500" },
      { titulo: "Realista", valor: "3,5%", subtexto: "Abaixo da meta", corBg: "bg-emerald-50/50", corBorder: "border-emerald-100", corTitulo: "text-emerald-600", corSubtexto: "text-emerald-500" },
      { titulo: "Otimista", valor: "2,8%", subtexto: "Cenário de Excelência", corBg: "bg-emerald-100/50", corBorder: "border-emerald-200", corTitulo: "text-emerald-700", corSubtexto: "text-emerald-600" }
    ]
  },
  tabelaRisco: {
    titulo: "Clientes Key Account em Risco", icone: "Users", iconeCor: "text-orange-500",
    col1Nome: "Cliente VIP", col2Nome: "MRR", col3Nome: "Risco Churn",
    itens: [
      { id: "1", col1: "Indústria Metalúrgica Sul", col2: "R$ 14.000/m", col3Valor: 88 },
      { id: "2", col1: "Logística Nacional", col2: "R$ 8.500/m", col3Valor: 72 },
      { id: "3", col1: "Construtora Horizonte", col2: "R$ 6.200/m", col3Valor: 55 },
      { id: "4", col1: "Varejista Central", col2: "R$ 11.000/m", col3Valor: 48 },
    ]
  },
  acao1: {
    titulo: "Recomendações de Retenção", icone: "ShieldAlert", iconeCor: "text-indigo-500",
    itens: [
      { id: "1", titulo: "Indústria Metalúrgica Sul", desc: "Redução de 40% no uso do sistema. Oferecer consultoria CS gratuita.", kpi1: "MRR Salvo: R$ 14.000", kpi1Cor: "text-emerald-600", kpi2: "Custo Ação: R$ 250", kpi2Cor: "text-indigo-500", botaoPrimario: "Acionar CS", botaoSecundario: "Ver Log" },
      { id: "2", titulo: "Logística Nacional", desc: "Abertura de 5 chamados críticos esta semana. Agendar call emergencial.", kpi1: "Status: Insatisfeito", kpi1Cor: "text-red-500", kpi2: "Tempo Médio Resp: 12h", kpi2Cor: "text-orange-500", botaoPrimario: "Agendar Call", botaoSecundario: "Ver Chamados" }
    ]
  },
  acao2: {
    titulo: "Oportunidades de Upsell", icone: "Zap", iconeCor: "text-emerald-500",
    itens: [
      { id: "1", titulo: "Rede de Franquias XYZ", desc: "Atingiu limite de usuários no plano atual.", kpi1: "Upsell Previsto: +R$ 2.400/m", kpi1Cor: "text-emerald-600", kpi2: "Probabilidade: 92%", kpi2Cor: "text-indigo-600", badge: "HOT ALERTA", badgeCorBg: "bg-red-100", badgeCorText: "text-red-700", botaoPrimario: "Enviar Proposta", botaoSecundario: "Dashboard de Uso" },
      { id: "2", titulo: "Tech Solutions", desc: "Buscou por módulo de Integração API repetidas vezes.", kpi1: "Ticket Módulo: R$ 800/m", kpi1Cor: "text-emerald-600", kpi2: "Probabilidade: 75%", kpi2Cor: "text-indigo-600", badge: "OPORTUNIDADE", badgeCorBg: "bg-emerald-100", badgeCorText: "text-emerald-700", botaoPrimario: "Campanha API", botaoSecundario: "Ver Rastro" }
    ]
  },
  blocoEsq: {
    titulo: "Engajamento e Satisfação", icone: "Activity", iconeCor: "text-blue-500",
    itens: [
      { id: "1", texto: "Taxa de Adoção de Novas Features", subtexto: "Módulo Financeiro V2", progressoValor: 62, progressoCorBg: "bg-blue-500" },
      { id: "2", texto: "Índice de Saúde (Health Score)", subtexto: "Média da Base", progressoValor: 85, progressoCorBg: "bg-emerald-500" },
      { id: "3", texto: "SLA de Suporte B2B estourado", subtexto: "Impactando clientes da curva A", badge: "Atenção", badgeCorBg: "bg-orange-100", badgeCorText: "text-orange-700" }
    ]
  },
  blocoDir: {
    titulo: "Cohorts de Receita", icone: "DollarSign",
    kpi1Titulo: "MRR Total", kpi1Valor: "R$ 485k", kpi1Sub: "Recorrente", kpi1Cor: "text-emerald-600",
    kpi2Titulo: "Expansão MRR", kpi2Valor: "+R$ 12k", kpi2Cor: "text-indigo-500",
    kpi3Titulo: "Contração MRR", kpi3Valor: "-R$ 4k", kpi3Cor: "text-orange-500",
    graficoTitulo: "Crescimento Líquido MRR",
    graficoDados: [
      { name: 'Sem 1', valor: 2500 }, { name: 'Sem 2', valor: 3100 }, { name: 'Sem 3', valor: -1200 }, { name: 'Sem 4', valor: 4500 },
    ]
  },
  demanda: {
    titulo: "Top Segmentos de Clientes", col1Nome: "Segmento / Ramo", col2Nome: "LTV Médio",
    itens: [
      { col1: "Indústria Pesada", col2: "R$ 120.000", variacao: 15.2 },
      { col1: "Logística e Frota", col2: "R$ 85.000", variacao: 8.4 },
      { col1: "Varejo B2B", col2: "R$ 42.000", variacao: -2.1 },
      { col1: "Engenharia Civil", col2: "R$ 68.000", variacao: 5.6 },
    ]
  },
  alertas: {
    titulo: "Alertas da Inteligência de CRM",
    itens: [
      { id: "1", texto: "Detetada anomalia de login: 15 contas Inativas nos últimos 30 dias", severidade: "Alto", cor: "orange" },
      { id: "2", texto: "Campanha de Onboarding gerou 40% a mais de engajamento", severidade: "Oportunidade", cor: "emerald" },
      { id: "3", texto: "Ticket de reclamação repetitivo sobre lentidão no app móvel", severidade: "Crítico", cor: "red" },
      { id: "4", texto: "Renovações anuais massivas em Dezembro (Atenção redobrada)", severidade: "Médio", cor: "amber" },
    ]
  },
  explicacao: {
    tags: ["Telemetria de Produto", "Zendesk Tickets", "Frequência de Login", "NPS Surveys", "Billing History", "Modelagem de Risco"],
    confianca: 94,
    registros: "8.2 milhões"
  }
};

// Gerador simplificado (fallback) para outros setores (Estoque, Compras, Produção, Custos, Contabilidade, Clientes, Fornecedores)
// Aqui criaremos uma função que clona a Visão Executiva e muda alguns textos só para preencher os outros 8 setores rapidamente de forma plausível.
const buildFallbackData = (setorName: string): PredicaoDashboardData => {
  const base = JSON.parse(JSON.stringify(DATA_VISAO_EXECUTIVA)) as PredicaoDashboardData;
  base.titulo = `Inteligência Preditiva - ${setorName}`;
  base.explicacao.tags = [`Dados do módulo de ${setorName}`, "Histórico transacional ERP", "Modelos estatísticos JARMIS"];
  base.alertas.titulo = `Alertas Prioritários - ${setorName}`;
  base.acao1.titulo = `Ações Sugeridas para ${setorName}`;
  return base;
};

export const MOCK_DADOS_SETORES: Record<string, PredicaoDashboardData> = {
  "Visão Executiva": DATA_VISAO_EXECUTIVA,
  "RH": DATA_RH,
  "Comercial": DATA_COMERCIAL,
  "Clientes": DATA_CLIENTES,
  "Estoque": buildFallbackData("Estoque"),
  "Compras": buildFallbackData("Compras"),
  "Produção": buildFallbackData("Produção"),
  "Custos": buildFallbackData("Custos"),
  "Contabilidade": buildFallbackData("Contabilidade"),
  "Vendas": buildFallbackData("Vendas"),
  "Fornecedores": buildFallbackData("Fornecedores"),
};
