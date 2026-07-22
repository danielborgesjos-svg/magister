"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"

export interface MagisAction {
  label: string
  type: "campanha" | "tarefa" | "relatorio" | "link" | "ia" | "venda" | "executar"
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
  tipo?: "info" | "alerta" | "sucesso" | "acao"
}

// Detecção simples de intenção via regex (pode ser expandida no futuro para NLP real)
type Intencao =
  | "os_resumo"
  | "os_atrasadas"
  | "financeiro_caixa"
  | "clientes_resumo"
  | "desconhecido"

function detectarIntencao(mensagem: string): Intencao {
  const m = mensagem.toLowerCase()
  
  if (m.match(/os|ordem de serviço|ordens|atendimento/)) {
    if (m.match(/atrasada|vencida|risco|sla/)) return "os_atrasadas"
    return "os_resumo"
  }
  
  if (m.match(/financeiro|caixa|faturamento|dinheiro|pagamento|receita/)) {
    return "financeiro_caixa"
  }
  
  if (m.match(/cliente|empresa|contato|base/)) {
    return "clientes_resumo"
  }
  
  return "desconhecido"
}

export async function processarMensagemIA(mensagem: string): Promise<MagisResponse> {
  const apiKey = process.env.DEEPSEEK_API_KEY;

  if (!apiKey || apiKey === 'sua_chave_aqui') {
    return {
      agente: "JARMIS (Fallback)",
      agenteIcon: "AlertTriangle",
      agenteColor: "#EF4444",
      diagnostico: "Não foi possível conectar ao DeepSeek.",
      motivo: "A chave de API (DEEPSEEK_API_KEY) não está configurada corretamente no arquivo .env.local.",
      recomendacao: "Edite o arquivo .env.local na raiz do projeto e insira sua chave válida.",
      proximoPasso: "Configurar API Key",
      tipo: "alerta",
      acoes: [],
    };
  }

  const systemPrompt = `Você é o JARMIS, um Copiloto Operacional e Analítico de ERP avançado.
Sua saída DEVE OBRIGATORIAMENTE ser APENAS um JSON válido, seguindo estritamente esta interface:

{
  "agente": "JARMIS Especialista (Ex: JARMIS Financeiro)",
  "agenteIcon": "Icone Lucide (Ex: DollarSign, AlertTriangle, Users, Package)",
  "agenteColor": "Hexadecimal (Ex: #22C55E)",
  "diagnostico": "Seu texto de resposta principal",
  "motivo": "Motivo da análise ou contexto",
  "recomendacao": "Sugestão estratégica",
  "proximoPasso": "O que o usuário deve fazer a seguir",
  "tipo": "info | alerta | sucesso | acao",
  "acoes": [
    { "label": "Nome do Botão", "type": "link", "href": "/algum/lugar" }
  ],
  "dados": [
    { "label": "Métrica", "valor": "R$ 1.000", "cor": "#22C55E" }
  ]
}

- Os 'dados' e 'acoes' são opcionais. Forneça dados fictícios realistas e convincentes.
- NUNCA ENVOLVA O JSON EM BLOCOS MARKDOWN! RETORNE APENAS RAW JSON.`;

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: mensagem }
        ],
        temperature: 0.2,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) {
      throw new Error(`DeepSeek API Error: ${res.status}`);
    }

    const json = await res.json();
    let content = json.choices[0].message.content.trim();
    if (content.startsWith("\`\`\`json")) {
      content = content.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    } else if (content.startsWith("\`\`\`")) {
      content = content.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
    }

    return JSON.parse(content) as MagisResponse;
  } catch (error) {
    console.error("DeepSeek Error:", error);
    return {
      agente: "JARMIS Core",
      agenteIcon: "Zap",
      agenteColor: "#6D4AFF",
      diagnostico: "Desculpe, ocorreu um erro na comunicação com a API da DeepSeek.",
      motivo: "Erro de rede ou formato inesperado.",
      recomendacao: "Verifique a chave de API e a conexão.",
      proximoPasso: "Tente novamente mais tarde.",
      tipo: "alerta",
      acoes: []
    };
  }
}

export async function gerarBriefingIA(contexto: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey || apiKey === 'sua_chave_aqui') return [];

  const systemPrompt = `Você é o JARMIS. Gere um briefing com 4 a 5 alertas rápidos (KPIs e avisos) para o módulo ERP atual: ${contexto}.
Sua saída DEVE OBRIGATORIAMENTE ser APENAS um JSON válido contendo um array de objetos, assim:

[
  { "icon": "AlertTriangle", "cor": "#EF4444", "texto": "3 OS atrasadas — SLA em risco", "urgente": true },
  { "icon": "DollarSign", "cor": "#F59E0B", "texto": "R$ 8.400 não faturados" }
]

- Os ícones válidos são (do Lucide): AlertTriangle, DollarSign, ClipboardList, TrendingUp, Users, CheckCircle2, CheckSquare, AlertOctagon, Calendar, Truck, Radio, Package.
- As cores devem ser Hexadecimais válidos.
- 'urgente' é um booleano opcional.
- NUNCA ENVOLVA O JSON EM BLOCOS MARKDOWN! RETORNE APENAS RAW JSON.`;

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: "Gerar briefing" }],
        temperature: 0.3,
        response_format: { type: "json_object" }
      })
    });

    if (!res.ok) throw new Error();
    const json = await res.json();
    let content = json.choices[0].message.content.trim();
    if (content.startsWith("\`\`\`json")) content = content.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    else if (content.startsWith("\`\`\`")) content = content.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
    
    // O deepseek as vezes envelopa num objeto como { "alertas": [...] } ou direto no array
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? parsed : (parsed.alertas || parsed.briefing || []);
  } catch (e) {
    return [];
  }
}
