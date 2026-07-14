import prisma from "@/lib/prisma"

export async function buildContextoComercial(): Promise<string> {
  const hoje = new Date().toLocaleDateString("pt-BR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })

  const [clientes, negociacoes, tarefas, financeiro] = await Promise.all([
    prisma.cliente.findMany({ orderBy: { score: "desc" } }),
    prisma.negociacao.findMany({
      include: { cliente: { select: { nome: true, empresa: true } } },
      orderBy: { valor: "desc" }
    }),
    prisma.tarefa.findMany({
      where: { status: { not: "concluido" } },
      orderBy: { prazo: "asc" }
    }),
    prisma.lancamentoFinanceiro.findMany({ where: { status: "pago", tipo: "receita" } })
  ])

  const ativos        = clientes.filter(c => c.status === "ativo")
  const inativos      = clientes.filter(c => c.status === "inativo")
  const leads         = clientes.filter(c => c.status === "lead")
  const faturamento   = financeiro.reduce((a, l) => a + l.valor, 0)

  const pipeline      = negociacoes.filter(n => !["fechado", "perdido"].includes(n.status))
  const fechados      = negociacoes.filter(n => n.status === "fechado")
  const perdidos      = negociacoes.filter(n => n.status === "perdido")
  const valorPipeline = pipeline.reduce((a, n) => a + n.valor, 0)
  const valorFechado  = fechados.reduce((a, n) => a + n.valor, 0)

  const top5Inativos  = inativos.sort((a, b) => b.totalComprado - a.totalComprado).slice(0, 5)
  const negQuentes    = negociacoes.filter(n => ["orcamento", "negociacao"].includes(n.status))
  const tarefasHoje   = tarefas.filter(t => {
    if (!t.prazo) return false
    const p = new Date(t.prazo)
    const h = new Date()
    return p.toDateString() === h.toDateString()
  })
  const tarefasAtrasadas = tarefas.filter(t => t.prazo && new Date(t.prazo) < new Date())

  const estagioNomes: Record<string, string> = {
    novo_lead: "Novo Lead", em_atendimento: "Em Atendimento",
    orcamento: "Orçamento", negociacao: "Negociação"
  }

  return `
=== CONTEXTO COMERCIAL MAGIS IA ===
Data: ${hoje}

--- CLIENTES ---
Total: ${clientes.length} | Ativos: ${ativos.length} | Inativos: ${inativos.length} | Leads: ${leads.length}
Score médio dos ativos: ${ativos.length > 0 ? Math.round(ativos.reduce((a, c) => a + c.score, 0) / ativos.length) : "N/A"}/100
Faturamento acumulado no banco: R$ ${faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}

Clientes inativos com maior histórico (prioridade para reativação):
${top5Inativos.map((c, i) => `${i + 1}. ${c.nome}${c.empresa ? ` (${c.empresa})` : ""} — R$ ${c.totalComprado.toLocaleString("pt-BR")} histórico`).join("\n") || "Nenhum"}

--- PIPELINE DE VENDAS ---
Total em aberto: ${pipeline.length} negociações | R$ ${valorPipeline.toLocaleString("pt-BR")} em aberto
Fechamentos realizados: ${fechados.length} | R$ ${valorFechado.toLocaleString("pt-BR")}
Perdidos: ${perdidos.length}

Estágios do funil:
${["novo_lead", "em_atendimento", "orcamento", "negociacao"].map(s => {
    const ns = negociacoes.filter(n => n.status === s)
    const v  = ns.reduce((a, n) => a + n.valor, 0)
    return `  ${estagioNomes[s]}: ${ns.length} negs | R$ ${v.toLocaleString("pt-BR")}${
      ns.length > 0 ? ` | Top: ${ns[0].cliente?.nome || "N/A"} (R$ ${ns[0].valor.toLocaleString("pt-BR")})` : ""
    }`
  }).join("\n")}

Negociações QUENTES (orçamento/negociação avançada):
${negQuentes.slice(0, 5).map(n => `- ${n.cliente?.nome || "N/A"} | R$ ${n.valor.toLocaleString("pt-BR")} | ${n.probabilidade}% prob | Vendedor: ${n.vendedor}`).join("\n") || "Nenhuma"}

--- OPERAÇÃO ---
Tarefas pendentes: ${tarefas.length} | Para hoje: ${tarefasHoje.length} | ATRASADAS: ${tarefasAtrasadas.length}
${tarefasAtrasadas.length > 0 ? `ATENÇÃO: tarefas atrasadas: ${tarefasAtrasadas.map(t => t.titulo).slice(0, 3).join(", ")}` : ""}

=== FIM DO CONTEXTO ===
`.trim()
}
