const GROQ_API_KEY = process.env.GROQ_API_KEY;

export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: Role;
  content: string;
}

const SYSTEM_PROMPT = `Você é a Magis IA, a assistente virtual inteligente de atendimento da Magister ERP. 
Seu objetivo é fazer o primeiro contato e a triagem dos clientes de forma educada, ágil e prestativa.
- Seja sempre simpático, direto e objetivo.
- Nunca invente preços, prazos ou informações técnicas complexas.
- Diga que um atendente humano irá assumir em breve caso a dúvida seja complexa.
- Não use formatações Markdown exageradas, use texto simples e direto adaptado para WhatsApp.
- Suas respostas devem ser curtas e dinâmicas (típicas de WhatsApp).`;

export async function gerarRespostaIA(mensagensAnteriores: ChatMessage[]): Promise<string> {
  const mensagensFormatadas = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...mensagensAnteriores
  ];

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        messages: mensagensFormatadas,
        temperature: 0.7,
        max_tokens: 150
      })
    });

    if (!response.ok) {
      console.error('Groq API Error:', await response.text());
      return "Desculpe, estou com um pequeno problema técnico no momento. Um de nossos atendentes falará com você em breve.";
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "Olá! Um de nossos atendentes irá te responder em instantes.";
  } catch (error) {
    console.error('Groq AI Request Failed:', error);
    return "Desculpe, estou com uma instabilidade. Por favor, aguarde um humano assumir o atendimento.";
  }
}
