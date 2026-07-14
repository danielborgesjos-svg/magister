"use client";

import { createContext, useContext, useState, useCallback, useEffect } from "react";

// ─── Tipos de contexto de agente ──────────────────────────────────────────────
export type AgentContexto =
  | "global"
  | "os"
  | "financeiro"
  | "clientes"
  | "estoque"
  | "agenda"
  | "despacho"
  | "configuracoes"
  | "inteligencia";

export interface AgentConfig {
  id: AgentContexto;
  titulo: string;
  subtitulo: string;
  gradiente: string;        // CSS gradient para o header
  corPrimaria: string;      // hex
  corSecundaria: string;    // hex para o bot avatar
  placeholder: string;
  boasVindas: string;
  sugestoes: string[];
  comandos: { label: string; desc: string; cor: string; icon: string }[];
}

export const AGENT_CONFIGS: Record<AgentContexto, AgentConfig> = {
  global: {
    id: "global",
    titulo: "JARMIS",
    subtitulo: "Copiloto Operacional · Online",
    gradiente: "linear-gradient(135deg, #6D4AFF 0%, #8B5CF6 100%)",
    corPrimaria: "#6D4AFF",
    corSecundaria: "#6D4AFF",
    placeholder: "Pergunte sobre OS, financeiro, equipe...",
    boasVindas: "Olá! Sou o JARMIS, seu copiloto operacional. Analiso OS, financeiro, clientes e equipe em tempo real.",
    sugestoes: [
      "Resumo do dia operacional",
      "OS atrasadas e risco de SLA",
      "Caixa projetado para amanhã",
      "Ações recomendadas agora",
    ],
    comandos: [
      { label: "Nova OS", desc: "Criar ordem de serviço", cor: "#6D4AFF", icon: "ClipboardList" },
      { label: "Gerar Cobrança", desc: "A partir de OS aprovada", cor: "#22C55E", icon: "DollarSign" },
      { label: "Novo Cliente", desc: "Cadastrar no CRM", cor: "#3B82F6", icon: "Users" },
      { label: "Aprovar OS", desc: "OS aguardando revisão", cor: "#F59E0B", icon: "CheckCircle2" },
      { label: "Relatório IA", desc: "Análise financeira", cor: "#EF4444", icon: "TrendingUp" },
      { label: "Sync Agenda", desc: "Atualizar agendamentos", cor: "#8B5CF6", icon: "RefreshCw" },
    ],
  },

  os: {
    id: "os",
    titulo: "JARMIS · Field Service",
    subtitulo: "Agente de Ordens de Serviço · Online",
    gradiente: "linear-gradient(135deg, #D97706 0%, #B45309 50%, #92400E 100%)",
    corPrimaria: "#D97706",
    corSecundaria: "#F59E0B",
    placeholder: "Pergunte sobre OS, SLA, despacho, técnicos...",
    boasVindas: "Agente Field Service ativo. Monitoro OS em tempo real: SLA, despacho, aprovações, margem e não conformidades. O que você precisa?",
    sugestoes: [
      "Quais OS estão com SLA vencido?",
      "Técnico com mais OS em aberto",
      "OS concluídas não faturadas",
      "Sugerir despacho de equipe",
      "Analisar não conformidades",
      "Mostrar OS atrasadas por prioridade",
    ],
    comandos: [
      { label: "Nova OS", desc: "Abrir formulário", cor: "#D97706", icon: "ClipboardList" },
      { label: "Despacho", desc: "Alocar técnico/veículo", cor: "#F59E0B", icon: "Radio" },
      { label: "Aprovar OS", desc: "Fila de revisão", cor: "#22C55E", icon: "CheckSquare" },
      { label: "Gerar Cobrança", desc: "OS concluídas", cor: "#3B82F6", icon: "DollarSign" },
      { label: "Registrar NC", desc: "Não conformidade", cor: "#EF4444", icon: "AlertOctagon" },
      { label: "Ver Kanban", desc: "Visão geral de status", cor: "#8B5CF6", icon: "LayoutGrid" },
    ],
  },

  financeiro: {
    id: "financeiro",
    titulo: "JARMIS · Financeiro",
    subtitulo: "Agente Financeiro · Online",
    gradiente: "linear-gradient(135deg, #059669 0%, #047857 100%)",
    corPrimaria: "#059669",
    corSecundaria: "#10B981",
    placeholder: "Pergunte sobre fluxo de caixa, cobranças...",
    boasVindas: "Agente Financeiro ativo. Analiso fluxo de caixa, inadimplência, OS não faturadas e margem operacional.",
    sugestoes: [
      "Projetar fluxo de caixa (30 dias)",
      "Clientes inadimplentes",
      "OS concluídas não faturadas",
      "Comparar receita vs meta",
    ],
    comandos: [
      { label: "Nova Cobrança", desc: "Gerar lançamento", cor: "#059669", icon: "DollarSign" },
      { label: "Conciliação", desc: "Revisar pagamentos", cor: "#10B981", icon: "CheckCircle2" },
      { label: "DRE Rápido", desc: "Resultado do período", cor: "#F59E0B", icon: "TrendingUp" },
      { label: "Inadimplentes", desc: "Lista de devedores", cor: "#EF4444", icon: "AlertTriangle" },
    ],
  },

  clientes: {
    id: "clientes",
    titulo: "JARMIS · CRM",
    subtitulo: "Agente de Clientes · Online",
    gradiente: "linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)",
    corPrimaria: "#2563EB",
    corSecundaria: "#3B82F6",
    placeholder: "Pergunte sobre clientes, contratos, negociações...",
    boasVindas: "Agente CRM ativo. Monitoro clientes, contratos vencendo, oportunidades e retenção.",
    sugestoes: [
      "Clientes sem contato há 30 dias",
      "Top 5 por receita",
      "Contratos próximos do vencimento",
      "Propor ação de retenção",
    ],
    comandos: [
      { label: "Novo Cliente", desc: "Cadastrar no CRM", cor: "#2563EB", icon: "Users" },
      { label: "Novo Contrato", desc: "Proposta comercial", cor: "#3B82F6", icon: "FileText" },
      { label: "Negociação", desc: "Adicionar oportunidade", cor: "#F59E0B", icon: "TrendingUp" },
      { label: "Campanha", desc: "Disparar via WhatsApp", cor: "#22C55E", icon: "MessageSquare" },
    ],
  },

  estoque: {
    id: "estoque",
    titulo: "JARMIS · Estoque",
    subtitulo: "Agente de Materiais · Online",
    gradiente: "linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)",
    corPrimaria: "#7C3AED",
    corSecundaria: "#8B5CF6",
    placeholder: "Pergunte sobre materiais, ruptura, reposição...",
    boasVindas: "Agente de Estoque ativo. Monitoro níveis, ruptura, consumo em OS e sugestões de reposição.",
    sugestoes: [
      "Produtos abaixo do mínimo",
      "Previsão de ruptura em 7 dias",
      "Materiais mais usados nas OS",
      "Sugerir pedido de reposição",
    ],
    comandos: [
      { label: "Nova Entrada", desc: "Registrar recebimento", cor: "#7C3AED", icon: "Package" },
      { label: "Ajuste", desc: "Corrigir estoque", cor: "#F59E0B", icon: "Edit" },
      { label: "Inventário", desc: "Iniciar contagem", cor: "#3B82F6", icon: "ClipboardList" },
      { label: "Reposição IA", desc: "Sugestão automática", cor: "#22C55E", icon: "RefreshCw" },
    ],
  },

  agenda: {
    id: "agenda",
    titulo: "JARMIS · Agenda",
    subtitulo: "Agente de Agendamentos · Online",
    gradiente: "linear-gradient(135deg, #0891B2 0%, #0E7490 100%)",
    corPrimaria: "#0891B2",
    corSecundaria: "#06B6D4",
    placeholder: "Pergunte sobre agendamentos, conflitos...",
    boasVindas: "Agente de Agenda ativo. Verifico conflitos, sugiro horários e sincronizo com as OS.",
    sugestoes: [
      "Conflitos de agenda hoje",
      "Próximas visitas da semana",
      "Técnicos disponíveis amanhã",
      "Reagendar OS atrasada",
    ],
    comandos: [
      { label: "Novo Evento", desc: "Criar agendamento", cor: "#0891B2", icon: "Calendar" },
      { label: "Verificar Conflito", desc: "Analisar disponibilidade", cor: "#F59E0B", icon: "AlertTriangle" },
    ],
  },

  despacho: {
    id: "despacho",
    titulo: "JARMIS · Despacho",
    subtitulo: "Agente de Despacho · Online",
    gradiente: "linear-gradient(135deg, #B45309 0%, #92400E 100%)",
    corPrimaria: "#B45309",
    corSecundaria: "#D97706",
    placeholder: "Pergunte sobre alocação, rota, disponibilidade...",
    boasVindas: "Agente de Despacho ativo. Sugiro alocação otimizada de técnicos e veículos com base em localização, carga e SLA.",
    sugestoes: [
      "Técnico mais próximo da OS #1023",
      "Veículos disponíveis agora",
      "Otimizar rota dos técnicos",
      "OS sem alocação com SLA crítico",
    ],
    comandos: [
      { label: "Despachar", desc: "Alocar técnico/veículo", cor: "#B45309", icon: "Radio" },
      { label: "Ver Frota", desc: "Status dos veículos", cor: "#D97706", icon: "Truck" },
    ],
  },

  configuracoes: {
    id: "configuracoes",
    titulo: "JARMIS · Admin",
    subtitulo: "Agente de Configurações · Online",
    gradiente: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
    corPrimaria: "#1E293B",
    corSecundaria: "#334155",
    placeholder: "Pergunte sobre usuários, permissões, integrações...",
    boasVindas: "Modo Administrativo. Posso ajudar com auditoria de usuários, reset de senhas e configurações sistêmicas.",
    sugestoes: [
      "Quantos usuários estão ativos?",
      "Auditar permissões de Admin",
      "Quem acessou fora do horário?"
    ],
    comandos: [
      { label: "Novo Usuário", desc: "Criar acesso", cor: "#3B82F6", icon: "Users" },
      { label: "Logs de Acesso", desc: "Auditoria", cor: "#8B5CF6", icon: "Shield" },
    ],
  },

  inteligencia: {
    id: "inteligencia",
    titulo: "JARMIS · Preditivo",
    subtitulo: "Motor Analítico · Online",
    gradiente: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)",
    corPrimaria: "#3B82F6",
    corSecundaria: "#60A5FA",
    placeholder: "Pergunte sobre tendências, gargalos e projeções...",
    boasVindas: "Motor analítico 100% ativo. Vasculhei a operação e já calculei possíveis gargalos para os próximos 7 dias.",
    sugestoes: [
      "Quais os maiores gargalos atuais?",
      "Previsão de inadimplência",
      "Otimização de equipe",
      "Gerar relatório preditivo"
    ],
    comandos: [
      { label: "Gerar PDF", desc: "Exportar insights", cor: "#EF4444", icon: "FileText" },
      { label: "Auto-Fix", desc: "Resolver anomalias", cor: "#10B981", icon: "Zap" },
    ],
  }
};

// ─── Layout Context ────────────────────────────────────────────────────────────
interface LayoutContextType {
  isIAPanelOpen: boolean;
  toggleIAPanel: () => void;
  openIAPanel: (contexto?: AgentContexto) => void;
  closeIAPanel: () => void;
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;
  agentContexto: AgentContexto;
  setAgentContexto: (ctx: AgentContexto) => void;
  sidebarColor: string;
  setSidebarColor: (color: string) => void;
  topbarColor: string;
  setTopbarColor: (color: string) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutProvider({ children }: { children: React.ReactNode }) {
  const [isIAPanelOpen, setIsIAPanelOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [agentContexto, setAgentContexto] = useState<AgentContexto>("global");
  
  const [sidebarColor, setSidebarColor] = useState("");
  const [topbarColor, setTopbarColor] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const savedSidebar = localStorage.getItem("jarmis_sidebar_color");
    const savedTopbar = localStorage.getItem("jarmis_topbar_color");
    if (savedSidebar) setSidebarColor(savedSidebar);
    if (savedTopbar) setTopbarColor(savedTopbar);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (sidebarColor) localStorage.setItem("jarmis_sidebar_color", sidebarColor);
    else localStorage.removeItem("jarmis_sidebar_color");
  }, [sidebarColor, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (topbarColor) localStorage.setItem("jarmis_topbar_color", topbarColor);
    else localStorage.removeItem("jarmis_topbar_color");
  }, [topbarColor, isLoaded]);

  const toggleIAPanel = () => setIsIAPanelOpen((prev) => !prev);
  const openIAPanel = useCallback((contexto?: AgentContexto) => {
    if (contexto) setAgentContexto(contexto);
    setIsIAPanelOpen(true);
  }, []);
  const closeIAPanel = () => setIsIAPanelOpen(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <LayoutContext.Provider value={{
      isIAPanelOpen, toggleIAPanel, openIAPanel, closeIAPanel,
      isMobileMenuOpen, toggleMobileMenu, closeMobileMenu,
      agentContexto, setAgentContexto,
      sidebarColor, setSidebarColor,
      topbarColor, setTopbarColor,
    }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error("useLayout must be used within a LayoutProvider");
  }
  return context;
}
