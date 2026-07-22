import { ShieldAlert, AlertTriangle, AlertCircle, Info, Star } from "lucide-react"

export const topProdutos = [
  { nome: "Barra Antipânico Touch", valor: 245430, pct: 100 },
  { nome: "Mola Hidráulica Aérea", valor: 183220, pct: 75 },
  { nome: "Fechadura Eletrônica", valor: 142310, pct: 58 },
  { nome: "Dobradiça Reforçada", valor: 98770, pct: 40 },
  { nome: "Trinco Automático", valor: 76540, pct: 31 },
]

export const topClientes = [
  { nome: "Construtora Tenda", valor: 215000, pct: 100 },
  { nome: "MRV Engenharia", valor: 125000, pct: 58 },
  { nome: "Odebrecht Realizações", valor: 89400, pct: 41 },
  { nome: "Construtora ABC", valor: 74600, pct: 34 },
  { nome: "Engemil Engenharia", valor: 56230, pct: 26 },
]

export const initialFluxoCaixa = [
  { dia: "Jul 11", in: 120, out: -80, saldo: 40 },
  { dia: "Jul 12", in: 150, out: -90, saldo: 100 },
  { dia: "Jul 13", in: 90,  out: -110, saldo: 80 },
  { dia: "Jul 14", in: 200, out: -70, saldo: 210 },
  { dia: "Jul 15", in: 180, out: -120, saldo: 270 },
  { dia: "Jul 16", in: 220, out: -150, saldo: 340 },
  { dia: "Jul 17", in: 140, out: -50, saldo: 430 },
]

export const alertasVisaoExecutiva = [
  { label: "Crítico", count: 3, color: "bg-red-500", text: "text-red-600", icon: ShieldAlert },
  { label: "Alto", count: 7, color: "bg-orange-500", text: "text-orange-600", icon: AlertTriangle },
  { label: "Médio", count: 12, color: "bg-amber-400", text: "text-amber-600", icon: AlertCircle },
  { label: "Informativo", count: 8, color: "bg-blue-400", text: "text-blue-600", icon: Info },
  { label: "Oportunidades", count: 7, color: "bg-emerald-500", text: "text-emerald-600", icon: Star },
]

export const alertasPorSetor = [
  {
    setor: "Estoque",
    riscos: [
      { id: 1, nivel: "Crítico", titulo: "Ruptura iminente SKU 521 (Mola Hidráulica)", impacto: "R$ 45.000 em vendas perdidas" },
      { id: 2, nivel: "Alto", titulo: "Matéria-prima X (Aço) abaixo do mínimo", impacto: "Parada de produção em 3 dias" },
    ]
  },
  {
    setor: "Vendas",
    riscos: [
      { id: 3, nivel: "Médio", titulo: "Queda de 12% na conversão B2B", impacto: "R$ 80.000 a menos previstos" },
      { id: 4, nivel: "Informativo", titulo: "Odebrecht atrasou o pagamento da NF", impacto: "Acompanhar recebíveis" },
    ]
  },
  {
    setor: "Financeiro",
    riscos: [
      { id: 5, nivel: "Crítico", titulo: "Fluxo de caixa negativo previsto", impacto: "R$ 15.000 negativo dia 22" },
      { id: 6, nivel: "Oportunidade", titulo: "Antecipação de recebíveis disponível", impacto: "Liquidez imediata a 1.2%" },
    ]
  }
]

export const recomendacoesIA = [
  {
    id: 1,
    tipo: "economia",
    titulo: "Antecipe a compra da matéria-prima X",
    descricao: "O modelo prevê aumento de 14% no preço do aço na próxima semana devido a flutuações de mercado.",
    valor: "Economia prevista: R$ 41.000",
    confianca: "97%",
    color: "indigo"
  },
  {
    id: 2,
    tipo: "risco",
    titulo: "Produzir SKU 521",
    descricao: "Demanda B2B disparou nas últimas 48h. Estoque atual não cobre os próximos pedidos projetados.",
    valor: "Probabilidade de ruptura: 96%",
    confianca: "92%",
    color: "red"
  },
  {
    id: 3,
    tipo: "estrategia",
    titulo: "Aumentar preço em 3,4%",
    descricao: "Elasticidade de preço permite reajuste da Barra Antipânico sem perda significativa de conversão no canal online.",
    valor: "Ganho líquido: R$ 145.000",
    confianca: "88%",
    color: "amber"
  }
]

export const avisosBons = [
  { id: 1, titulo: "Meta B2B superada em 18%", desc: "Parabéns! A meta trimestral foi atingida 15 dias antes do prazo." },
  { id: 2, titulo: "Redução no custo logístico", desc: "A otimização de rotas gerou economia de 4% nos fretes da semana." },
  { id: 3, titulo: "Baixa taxa de devolução", desc: "O setor de qualidade manteve o índice de devoluções abaixo de 0.5%." }
]

export const avisosRuins = [
  { id: 1, titulo: "Queda na retenção de clientes", desc: "3 clientes Vips não compram há mais de 45 dias. Risco de churn alto." },
  { id: 2, titulo: "Gargalo na Produção", desc: "A máquina de usinagem 02 está operando com 40% de ociosidade por falta de insumo." },
]

export const pesquisaMercado = {
  raio5km: {
    nivel: "Alto Conflito",
    score: 82,
    insights: [
      { texto: "2 novos distribuidores de ferragens abriram na região leste.", impacto: "negativo", peso: 7 },
      { texto: "Concorrente A reduziu o preço da Fechadura Eletrônica em 5%.", impacto: "negativo", peso: 8 },
      { texto: "Aumento de 15% na circulação de pedestres em centros comerciais locais.", impacto: "positivo", peso: 4 }
    ]
  },
  raio15km: {
    nivel: "Oportunidade de Expansão",
    score: 65,
    insights: [
      { texto: "Falta de fornecimento de Dobradiças Reforçadas em 4 lojistas mapeados.", impacto: "positivo", peso: 9 },
      { texto: "Demanda de construtoras por Barras Antipânico cresceu 12% no trimestre.", impacto: "positivo", peso: 8 },
      { texto: "Atraso logístico médio da concorrência subiu para 4 dias.", impacto: "positivo", peso: 6 }
    ]
  },
  cidade: {
    nivel: "Estável",
    score: 50,
    insights: [
      { texto: "Share de mercado atual da DISAFE: 22%. Liderança no segmento corporativo.", impacto: "positivo", peso: 5 },
      { texto: "Tendência forte para automação residencial (smart locks).", impacto: "neutro", peso: 6 },
      { texto: "Prefeitura iniciou fiscalização rigorosa de rotas de fuga em galpões.", impacto: "positivo", peso: 9 }
    ]
  },
  estado: {
    nivel: "Aquecido",
    score: 74,
    insights: [
      { texto: "Investimentos públicos em hospitais aumentando a demanda por molas aéreas.", impacto: "positivo", peso: 8 },
      { texto: "Custo logístico médio do estado subiu 2.5% devido ao pedágio.", impacto: "negativo", peso: 7 }
    ]
  },
  nacional: {
    nivel: "Estratégico",
    score: 88,
    insights: [
      { texto: "Nova revisão da NBR 9050 (Acessibilidade) aprovada. Impacto direto na linha PCD.", impacto: "positivo", peso: 10 },
      { texto: "Taxa Selic impactando crédito para pequenos varejistas.", impacto: "negativo", peso: 6 },
      { texto: "Aço importado da China sofreu nova taxação, favorecendo a produção nacional DISAFE.", impacto: "positivo", peso: 8 }
    ]
  }
}

export const swarmAgents = [
  { id: "comercial", nome: "Agente Comercial", ia: "Motor JARMIS", status: "Analisando Churn", icone: "Briefcase", cor: "emerald" },
  { id: "operacional", nome: "Agente PCP & Estoque", ia: "Motor JARMIS", status: "Calculando SKUs", icone: "PackageSearch", cor: "blue" },
  { id: "mercado", nome: "Agente de Mercado", ia: "Motor JARMIS", status: "Mapeando Concorrentes", icone: "Globe", cor: "purple" }
]

export const predicaoFaturamento = {
  atual: 845000,
  projetado30dias: 980000,
  crescimento: 15.9,
  confianca: 94
}

export const riscosEstoquePreditivo = [
  { id: 1, produto: "Mola Hidráulica Aérea", diasRestantes: 4, probabilidadeRuptura: 98, impactoVendas: 45000 },
  { id: 2, produto: "Barra Antipânico Touch", diasRestantes: 12, probabilidadeRuptura: 75, impactoVendas: 120000 },
  { id: 3, produto: "Cilindro Multiponto", diasRestantes: 18, probabilidadeRuptura: 62, impactoVendas: 18000 },
]

export const predicaoVendasMarketing = [
  { id: 1, acao: "Campanha Black Friday B2B", custoEstimado: 5000, retornoVendas: 85000, roi: "1600%", probabilidade: "Alta" },
  { id: 2, acao: "Email Marketing Base Inativa", custoEstimado: 200, retornoVendas: 12000, roi: "5900%", probabilidade: "Média" },
]

export const oportunidadesCompra = [
  { id: 1, fornecedor: "AçoMax (Matéria-prima)", tendenciaPreco: "+8% (Próx. 15 dias)", acaoIA: "Antecipar compra de 5 ton.", economia: 12500, urgencia: "Crítica" },
  { id: 2, fornecedor: "Embalagens Sul", tendenciaPreco: "+4% (Mês que vem)", acaoIA: "Fechar contrato semestral agora", economia: 4200, urgencia: "Média" },
]
