/**
 * ai/agents/registry.ts
 * Registro central de todos os agentes especializados do Orquestrador Magis.
 * Cada agente define: identidade, tags de roteamento, system prompt e capacidades.
 */

export type AgentAction =
  | "READ" | "CREATE" | "UPDATE" | "DELETE"
  | "REPORT" | "SEARCH" | "ACTIVATE" | "DEACTIVATE"

export interface AgentTool {
  name: string
  description: string
  actions: AgentAction[]
}

export interface AgentDefinition {
  id: string
  nome: string
  descricao: string
  icone: string
  cor: string           // para badge na UI
  tags: string[]        // palavras-chave que ativam este agente
  systemPrompt: string
  tools: AgentTool[]
  temperatura: number
  modelo: string
}

// ─── Agentes Hard-coded (Fase 1) ───────────────────────────────────────────

export const AGENTS: AgentDefinition[] = [
  {
    id: "crm",
    nome: "Agente CRM",
    descricao: "Especialista em clientes, leads, negociações e pipeline comercial.",
    icone: "👥",
    cor: "blue",
    tags: [
      "cliente", "clientes", "lead", "leads", "negociação", "negociações",
      "pipeline", "card", "startup", "empresa", "contato", "cnpj",
      "prospect", "reativar", "inativo", "inativos", "chamar", "base",
      "crm", "funil", "oportunidade"
    ],
    systemPrompt: `Você é o Agente CRM da Magis, especialista em gestão de relacionamento com clientes.
Você gerencia: Clientes, Leads, Startups, Negociações, Pipeline e Cards.
Ao responder, sempre use os dados reais fornecidos no contexto.
Para ações de criação/edição, confirme os dados antes de executar.
Para exclusões, SEMPRE peça confirmação explícita.
Responda em português do Brasil, de forma direta e comercial.`,
    tools: [
      { name: "listarClientes", description: "Lista clientes com filtros", actions: ["READ", "SEARCH"] },
      { name: "criarCliente", description: "Cadastra novo cliente/lead", actions: ["CREATE"] },
      { name: "editarCliente", description: "Atualiza dados de cliente", actions: ["UPDATE"] },
      { name: "excluirCliente", description: "Remove cliente do sistema", actions: ["DELETE"] },
      { name: "listarNegociacoes", description: "Lista negociações/pipeline", actions: ["READ", "SEARCH"] },
      { name: "criarNegociacao", description: "Abre nova negociação", actions: ["CREATE"] },
      { name: "atualizarNegociacao", description: "Atualiza status/valor de negociação", actions: ["UPDATE"] },
      { name: "relatorioClientes", description: "Gera relatório de clientes", actions: ["REPORT"] },
    ],
    temperatura: 0.2,
    modelo: "llama-3.3-70b-versatile",
  },

  {
    id: "marketing",
    nome: "Agente Marketing",
    descricao: "Especialista em campanhas, automações e estratégias de marketing.",
    icone: "📣",
    cor: "purple",
    tags: [
      "campanha", "campanhas", "marketing", "email", "automação", "automacoes",
      "segmentação", "landing", "disparo", "newsletter", "lead magnet",
      "black friday", "promoção", "promocao", "remarketing", "ativar campanha",
      "pausar campanha", "criar campanha", "anuncio", "anúncio"
    ],
    systemPrompt: `Você é o Agente de Marketing da Magis, especialista em campanhas e automações.
Você gerencia: Campanhas, Fluxos de IA, Segmentações e Disparos.
Ao criar campanhas, confirme nome, canal e público antes de salvar.
Para pausar ou excluir campanhas ativas, peça confirmação.
Responda em português do Brasil com foco em resultados e ROI.`,
    tools: [
      { name: "listarCampanhas", description: "Lista campanhas com filtros de status", actions: ["READ", "SEARCH"] },
      { name: "criarCampanha", description: "Cria nova campanha", actions: ["CREATE"] },
      { name: "atualizarCampanha", description: "Edita dados da campanha", actions: ["UPDATE"] },
      { name: "ativarCampanha", description: "Ativa uma campanha", actions: ["ACTIVATE"] },
      { name: "pausarCampanha", description: "Pausa uma campanha ativa", actions: ["DEACTIVATE"] },
      { name: "excluirCampanha", description: "Remove campanha", actions: ["DELETE"] },
      { name: "relatorioCampanhas", description: "Gera relatório de performance", actions: ["REPORT"] },
    ],
    temperatura: 0.3,
    modelo: "llama-3.3-70b-versatile",
  },

  {
    id: "projetos",
    nome: "Agente Projetos",
    descricao: "Especialista em tarefas, projetos, sprints e gestão de equipe.",
    icone: "📋",
    cor: "orange",
    tags: [
      "tarefa", "tarefas", "projeto", "projetos", "sprint", "kanban",
      "prazo", "responsável", "responsavel", "prioridade", "to-do",
      "pendente", "concluir", "criar tarefa", "checklist", "backlog",
      "cronograma", "entrega", "milestone", "board"
    ],
    systemPrompt: `Você é o Agente de Projetos da Magis, especialista em gestão de tarefas e projetos.
Você gerencia: Tarefas, Projetos, Sprints, Kanban e Cronogramas.
Ao criar tarefas, pergunte: título, responsável, prazo e prioridade (se não informados).
Para excluir projetos, SEMPRE peça confirmação explícita.
Responda em português do Brasil com foco em clareza e execução.`,
    tools: [
      { name: "listarTarefas", description: "Lista tarefas com filtros", actions: ["READ", "SEARCH"] },
      { name: "criarTarefa", description: "Cria nova tarefa", actions: ["CREATE"] },
      { name: "editarTarefa", description: "Edita dados da tarefa", actions: ["UPDATE"] },
      { name: "excluirTarefa", description: "Remove tarefa", actions: ["DELETE"] },
      { name: "alterarStatusTarefa", description: "Muda status da tarefa", actions: ["UPDATE"] },
      { name: "alterarResponsavel", description: "Troca responsável da tarefa", actions: ["UPDATE"] },
      { name: "relatorioTarefas", description: "Gera relatório de tarefas e produtividade", actions: ["REPORT"] },
    ],
    temperatura: 0.2,
    modelo: "llama-3.3-70b-versatile",
  },

  {
    id: "financeiro",
    nome: "Agente Financeiro",
    descricao: "Especialista em fluxo de caixa, receitas, despesas e relatórios financeiros.",
    icone: "💰",
    cor: "green",
    tags: [
      "financeiro", "financeira", "receita", "despesa", "despesas", "receitas",
      "fluxo de caixa", "caixa", "pagamento", "pagamentos", "cobrança",
      "inadimplente", "vencido", "pendente", "fatura", "boleto",
      "resultado", "lucro", "prejuizo", "margem", "custo", "dre",
      "relatório financeiro", "relatorio financeiro", "balanço"
    ],
    systemPrompt: `Você é o Agente Financeiro da Magis, especialista em gestão financeira empresarial.
Você gerencia: Lançamentos, Fluxo de Caixa, Receitas, Despesas e Relatórios.
Sempre apresente valores em Real (R$) com duas casas decimais.
Para exclusão de lançamentos, peça confirmação obrigatória.
Responda em português do Brasil com análises precisas e indicadores claros.`,
    tools: [
      { name: "resumoFinanceiro", description: "Resumo consolidado do período", actions: ["READ", "REPORT"] },
      { name: "listarLancamentos", description: "Lista lançamentos com filtros", actions: ["READ", "SEARCH"] },
      { name: "criarLancamento", description: "Registra novo lançamento", actions: ["CREATE"] },
      { name: "editarLancamento", description: "Edita lançamento", actions: ["UPDATE"] },
      { name: "excluirLancamento", description: "Remove lançamento", actions: ["DELETE"] },
      { name: "relatorioFinanceiro", description: "Gera DRE e relatórios", actions: ["REPORT"] },
    ],
    temperatura: 0.1,
    modelo: "llama-3.3-70b-versatile",
  },

  {
    id: "estoque",
    nome: "Agente Estoque",
    descricao: "Especialista em produtos, inventário, rupturas e giro de estoque.",
    icone: "📦",
    cor: "orange",
    tags: [
      "estoque", "produto", "produtos", "inventário", "inventario", "ruptura",
      "falta", "faltar", "parado", "giro", "margem", "custo do produto",
      "entrada", "saída", "saida", "reposição", "reposicao", "skus",
      "categoria", "almoxarifado", "prateleira"
    ],
    systemPrompt: `Você é o Agente de Estoque da Magis, especialista em gestão de inventário e produtos.
Você gerencia: Produtos, Estoque, Movimentações e Análises de Ruptura.
Sempre indique: nível atual, nível mínimo e risco de ruptura.
Para ajustes de estoque, confirme quantidade e motivo antes de salvar.
Responda em português do Brasil com foco em eficiência operacional.`,
    tools: [
      { name: "listarProdutos", description: "Lista produtos com filtros de risco/categoria", actions: ["READ", "SEARCH"] },
      { name: "buscarProduto", description: "Busca produto específico", actions: ["READ", "SEARCH"] },
      { name: "atualizarEstoque", description: "Ajusta quantidade em estoque", actions: ["UPDATE"] },
      { name: "produtosEmRisco", description: "Lista produtos com risco de ruptura", actions: ["READ", "REPORT"] },
      { name: "relatorioEstoque", description: "Relatório de giro e performance", actions: ["REPORT"] },
    ],
    temperatura: 0.1,
    modelo: "llama-3.3-70b-versatile",
  },

  {
    id: "os",
    nome: "Agente OS",
    descricao: "Especialista em Ordens de Serviço, técnicos e manutenções.",
    icone: "🔧",
    cor: "red",
    tags: [
      "ordem de serviço", "os", "ordens", "técnico", "tecnico", "técnicos", "tecnicos",
      "manutenção", "manutencao", "preventiva", "corretiva", "instalação",
      "instalacao", "campo", "visita", "agendamento", "agenda", "atendimento técnico",
      "contrato de manutenção", "equipamento", "checklist"
    ],
    systemPrompt: `Você é o Agente de Ordens de Serviço da Magis, especialista em field service e manutenção.
Você gerencia: Ordens de Serviço, Técnicos, Equipamentos, Contratos e Agendamentos.
Ao criar OS, confirme: cliente, tipo de atendimento, técnico e data agendada.
Para cancelar OS em execução, peça confirmação obrigatória.
Responda em português do Brasil com linguagem técnica e operacional.`,
    tools: [
      { name: "listarOS", description: "Lista ordens de serviço com filtros", actions: ["READ", "SEARCH"] },
      { name: "criarOS", description: "Abre nova OS", actions: ["CREATE"] },
      { name: "atualizarStatusOS", description: "Muda status da OS", actions: ["UPDATE"] },
      { name: "atribuirTecnico", description: "Atribui técnico à OS", actions: ["UPDATE"] },
      { name: "relatorioOS", description: "Relatório de OS por período/técnico", actions: ["REPORT"] },
    ],
    temperatura: 0.2,
    modelo: "llama-3.3-70b-versatile",
  },

  {
    id: "bi",
    nome: "Agente BI",
    descricao: "Especialista em análises de dados, indicadores e relatórios gerenciais.",
    icone: "📊",
    cor: "blue",
    tags: [
      "dashboard", "indicadores", "kpi", "kpis", "relatório", "relatorio",
      "gráfico", "grafico", "análise", "analise", "meta", "metas",
      "performance", "ranking", "top", "melhor", "pior", "comparativo",
      "crescimento", "tendência", "tendencia", "projeção", "projecao",
      "bi", "business intelligence", "dados", "métricas", "metricas"
    ],
    systemPrompt: `Você é o Agente de BI (Business Intelligence) da Magis, especialista em análises gerenciais.
Você consolida dados de todos os módulos para gerar insights estratégicos.
Apresente dados com comparativos de período, variações percentuais e tendências.
Use linguagem executiva, focada em decisões de negócio.
Responda em português do Brasil com análises precisas e recomendações estratégicas.`,
    tools: [
      { name: "kpisDashboard", description: "KPIs consolidados do período", actions: ["READ", "REPORT"] },
      { name: "rankingVendedores", description: "Ranking de vendedores por performance", actions: ["READ", "REPORT"] },
      { name: "analiseFinanceira", description: "Análise financeira consolidada", actions: ["READ", "REPORT"] },
      { name: "tendenciasVendas", description: "Análise de tendências de vendas", actions: ["READ", "REPORT"] },
      { name: "relatorioGeral", description: "Relatório executivo completo", actions: ["REPORT"] },
    ],
    temperatura: 0.2,
    modelo: "llama-3.3-70b-versatile",
  },

  {
    id: "whatsapp",
    nome: "Agente WhatsApp",
    descricao: "Especialista em atendimento, automações e comunicação via WhatsApp.",
    icone: "💬",
    cor: "green",
    tags: [
      "whatsapp", "mensagem", "mensagens", "atendimento", "conversa",
      "conversar", "chat", "inbox", "responder", "qualificar",
      "fluxo", "automação whatsapp", "bot", "disparo", "enviar mensagem",
      "contato", "abrir conversa"
    ],
    systemPrompt: `Você é o Agente de WhatsApp da Magis, especialista em atendimento e automações.
Você gerencia: Conversas, Mensagens, Fluxos de IA e Qualificação de Leads.
Ao sugerir respostas, adapte o tom ao histórico da conversa.
Para criar fluxos de automação, confirme o gatilho e as condições.
Responda em português do Brasil com foco em atendimento humanizado.`,
    tools: [
      { name: "listarConversas", description: "Lista conversas com filtros de status", actions: ["READ", "SEARCH"] },
      { name: "buscarConversa", description: "Busca conversa específica", actions: ["READ", "SEARCH"] },
      { name: "listarFluxos", description: "Lista fluxos de automação", actions: ["READ"] },
      { name: "relatorioAtendimento", description: "Relatório de atendimento e tempo de resposta", actions: ["REPORT"] },
    ],
    temperatura: 0.4,
    modelo: "llama-3.3-70b-versatile",
  },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

export function getAgent(id: string): AgentDefinition | undefined {
  return AGENTS.find(a => a.id === id)
}

export function getAgentsByTags(mensagem: string): AgentDefinition[] {
  const lower = mensagem.toLowerCase()
  const scores = AGENTS.map(agent => {
    const score = agent.tags.filter(tag => lower.includes(tag)).length
    return { agent, score }
  })
  return scores
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(s => s.agent)
}
