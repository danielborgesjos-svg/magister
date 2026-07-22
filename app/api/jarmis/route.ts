import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { mensagem, historico, modulo } = await request.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;

    // Se a chave não existir ou for a padrão, retornar fallback.
    if (!apiKey || apiKey === 'sua_chave_aqui') {
      return NextResponse.json({
        agente: "JARMIS (Fallback)",
        diagnostico: "Não foi possível conectar ao DeepSeek. A chave de API (DEEPSEEK_API_KEY) não está configurada corretamente no arquivo .env.local.",
        recomendacao: "Edite o arquivo .env.local na raiz do projeto e insira sua chave válida.",
        proximoPasso: "Configurar API Key",
        dados: [{ label: "Status", valor: "API Key Ausente", cor: "red" }],
        acoes: []
      });
    }

    const systemPrompt = `Você é o JARMIS (Joint Artificial Relational & Management Intelligence System), um Copiloto Operacional e Analítico de ERP altamente avançado.
Seu objetivo é atuar como um assistente executivo e operacional para o usuário do sistema Magister ERP.

Módulo atual em uso: ${modulo || 'geral'}

O usuário lhe fará perguntas baseadas em dados do ERP. Como você não tem os dados reais do banco neste momento, você deve agir como se tivesse e inventar cenários extremamente realistas, profissionais e assertivos de acordo com a pergunta do usuário e o módulo.

## REGRA DE SAÍDA OBRIGATÓRIA
Sua saída DEVE OBRIGATORIAMENTE ser APENAS um JSON válido, e nada mais. Não use crases (\`\`\`) de markdown, apenas devolva o JSON puro com a exata estrutura abaixo:

{
  "agente": "JARMIS (Nome do Agente/Especialista)",
  "diagnostico": "Seu texto de resposta detalhado, educado e direto ao ponto.",
  "recomendacao": "Uma sugestão de recomendação ou dica estratégica baseada no cenário (opcional).",
  "proximoPasso": "Uma ação de curto prazo a ser tomada (opcional).",
  "dados": [
    { "label": "Nome da Métrica", "valor": "R$ 1.000 ou 10%", "cor": "green | red | blue | orange | purple | gray" }
  ],
  "acoes": [
    { "label": "Nome do Botão", "acao": "comando", "type": "navigate | action | webhook" }
  ]
}

- Os 'dados' e 'acoes' são opcionais, mas enriquecem a interface. Forneça de 1 a 3 dados fictícios realistas sempre que possível.
- NÃO ENVOLVA O JSON EM BLOCOS MARKDOWN! RETORNE APENAS O RAW JSON.`;

    // Montar as mensagens para a API
    const messages = [
      { role: "system", content: systemPrompt }
    ];

    // Adicionar o histórico recente, se houver
    if (historico && Array.isArray(historico)) {
      historico.forEach((msg: any) => {
        messages.push({
          role: msg.tipo === 'entrada' ? 'user' : 'assistant',
          content: msg.conteudo
        });
      });
    }

    // Adicionar a mensagem atual
    messages.push({ role: "user", content: mensagem });

    // Fazer a chamada à API do DeepSeek
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek-chat", // DeepSeek-V3
        messages: messages,
        temperature: 0.2, // Baixa temperatura para garantir o JSON e assertividade
        response_format: { type: "json_object" } // Tentar forçar o formato JSON, suportado por alguns modelos.
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("DeepSeek API Error:", res.status, errorText);
      return NextResponse.json({
        agente: "JARMIS (Erro)",
        diagnostico: `Ocorreu um erro ao comunicar com a DeepSeek API. Status: ${res.status}.`,
        dados: [{ label: "Erro", valor: res.status, cor: "red" }]
      });
    }

    const json = await res.json();
    let content = json.choices[0].message.content.trim();
    
    // Limpar possíveis crases markdown
    if (content.startsWith("\`\`\`json")) {
      content = content.replace(/^\`\`\`json\n/, "").replace(/\n\`\`\`$/, "");
    } else if (content.startsWith("\`\`\`")) {
      content = content.replace(/^\`\`\`\n/, "").replace(/\n\`\`\`$/, "");
    }

    try {
      const parsedData = JSON.parse(content);
      return NextResponse.json(parsedData);
    } catch (parseError) {
      console.error("Failed to parse JSON from DeepSeek:", content);
      return NextResponse.json({
        agente: "JARMIS",
        diagnostico: content,
        recomendacao: "A IA respondeu fora do formato estruturado esperado."
      });
    }

  } catch (error: any) {
    console.error("Erro interno no backend do JARMIS:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
