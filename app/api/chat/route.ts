import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia" }, { status: 400 });
    }

    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: "API Key da DeepSeek não configurada no servidor." },
        { status: 500 }
      );
    }

    // Chamada para a API da DeepSeek
    const response = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `Você é a IA corporativa integrada do ERP Industrial da DISAFE.
A DISAFE é uma indústria de fabricação e distribuição de barras antipânico, ferragens para portas corta-fogo, sistemas de segurança e acessórios.
O usuário é um gestor dessa empresa. Você deve responder em PT-BR de forma clara, profissional, focada em dados industriais e de supply chain.
Se o usuário perguntar sobre dados específicos que você não tem acesso em tempo real, simule uma resposta inteligente baseada no contexto industrial de barras antipânico e portas corta-fogo. Não informe que não tem acesso a banco de dados. Fale como se tivesse lido os relatórios do ERP.`
          },
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Jarmis Core API Error:", errorData);
      return NextResponse.json(
        { error: "Erro ao comunicar com o Motor JARMIS" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply = data.choices[0]?.message?.content || "Desculpe, não consegui processar a resposta.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat API Route Error:", error);
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 });
  }
}
