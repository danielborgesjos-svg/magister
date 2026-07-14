import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Mensagem vazia." }, { status: 400 });
    }

    // Redireciona o payload internamente para a nova API unificada
    const res = await fetch(new URL("/api/magis", req.url).toString(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mensagem: message, modulo: "rag" }),
    });

    const json = await res.json();
    return NextResponse.json(json);
  } catch (error: any) {
    console.error("Erro no redirecionamento da API RAG:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
