import prisma from "@/lib/prisma"

export async function buildContextoFinanceiro(): Promise<string> {
  const lancamentos = await prisma.lancamentoFinanceiro.findMany({
    orderBy: { createdAt: "desc" },
  })

  const receitas    = lancamentos.filter(l => l.tipo === "receita")
  const despesas    = lancamentos.filter(l => l.tipo === "despesa")
  const pagas       = receitas.filter(l => l.status === "pago")
  const pendentes   = lancamentos.filter(l => l.status === "pendente")
  const vencidos    = lancamentos.filter(l => l.status === "vencido")

  const totalReceita  = pagas.reduce((a, l) => a + l.valor, 0)
  const totalDespesa  = despesas.filter(l => l.status === "pago").reduce((a, l) => a + l.valor, 0)
  const totalPendente = pendentes.reduce((a, l) => a + l.valor, 0)
  const totalVencido  = vencidos.reduce((a, l) => a + l.valor, 0)
  const resultado     = totalReceita - totalDespesa

  // Vendas do PDV (via tabela Venda)
  const vendas = await prisma.venda.findMany({ where: { status: "fechado" } })
  const totalPdv = vendas.reduce((a, v) => a + v.total, 0)

  return `
=== CONTEXTO FINANCEIRO MAGIS IA ===
Data: ${new Date().toLocaleDateString("pt-BR")}

--- RESUMO DO CAIXA (dados reais do banco) ---
Receitas recebidas: R$ ${totalReceita.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Despesas pagas: R$ ${totalDespesa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Resultado atual: R$ ${resultado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}${resultado >= 0 ? " ✅" : " ⚠️ NEGATIVO"}

Faturamento via PDV: R$ ${totalPdv.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${vendas.length} vendas)

--- ALERTAS FINANCEIROS ---
Contas pendentes: ${pendentes.length} lançamentos | R$ ${totalPendente.toLocaleString("pt-BR")}
Contas VENCIDAS: ${vencidos.length} lançamentos | R$ ${totalVencido.toLocaleString("pt-BR")}${vencidos.length > 0 ? " ⚠️ AÇÃO URGENTE" : ""}

${vencidos.length > 0 ? `Vencidos detalhados:\n${vencidos.slice(0, 5).map(l => `- ${l.descricao}: R$ ${l.valor.toLocaleString("pt-BR")}`).join("\n")}` : "Nenhuma conta vencida 🎉"}

--- DISTRIBUIÇÃO ---
Total de lançamentos: ${lancamentos.length}
Receitas: ${receitas.length} | Despesas: ${despesas.length}
Pagos: ${lancamentos.filter(l => l.status === "pago").length} | Pendentes: ${pendentes.length} | Vencidos: ${vencidos.length}

=== FIM DO CONTEXTO ===
`.trim()
}
