import prisma from "@/lib/prisma"

export async function buildContextoWhatsApp(): Promise<string> {
  // Dados reais: clientes ativos para sugestão de contato
  const clientes = await prisma.cliente.findMany({
    where: { status: { in: ["ativo", "lead"] } },
    orderBy: { score: "desc" },
    take: 20,
  })

  // Conversas reais do banco de dados
  const conversas = await prisma.conversaWA.findMany({
    orderBy: { updatedAt: "desc" },
    take: 50,
  })

  const novos        = conversas.filter(c => c.status === "novo")
  const atendimento  = conversas.filter(c => c.status === "em_atendimento")
  const aguardando   = conversas.filter(c => c.status === "aguardando")
  const resolvidos   = conversas.filter(c => c.status === "resolvido")

  const leadsCrm     = clientes.filter(c => c.status === "lead")
  const topAtivos    = clientes.filter(c => c.status === "ativo").slice(0, 5)

  return `
=== CONTEXTO WHATSAPP + ATENDIMENTO ===
Data: ${new Date().toLocaleDateString("pt-BR")}

--- INBOX ATUAL (SIMULADO) ---
Conversas novas (não lidas): ${novos.length}
Em atendimento: ${atendimento.length}
Aguardando resposta: ${aguardando.length}
Resolvidos hoje: ${resolvidos.length}

Conversas novas aguardando ação:
${novos.slice(0, 5).map((c: any) => `- ${c.nome} (${c.empresa || "sem empresa"}): "${c.ultimaMensagem}"`).join("\n") || "Nenhuma"}

Aguardando há mais tempo:
${aguardando.slice(0, 3).map((c: any) => `- ${c.nome}: "${c.ultimaMensagem}"`).join("\n") || "Nenhuma"}

--- LEADS NO CRM (banco real) ---
Total de leads para qualificar: ${leadsCrm.length}
${leadsCrm.slice(0, 5).map(l => `- ${l.nome}${l.empresa ? ` (${l.empresa})` : ""} | Score: ${l.score}`).join("\n") || "Nenhum"}

--- CLIENTES ATIVOS PARA CONTATO ---
${topAtivos.map(c => `- ${c.nome} | Score: ${c.score} | Total comprado: R$ ${c.totalComprado.toLocaleString("pt-BR")}`).join("\n") || "Nenhum"}

--- SUGESTÕES DE ABORDAGEM ---
- Leads sem contato: use abordagem de qualificação (perguntar necessidade)
- Clientes aguardando: priorize resposta imediata para evitar perda
- Clientes ativos de alto score: propor upsell ou nova negociação

=== FIM DO CONTEXTO ===
`.trim()
}
