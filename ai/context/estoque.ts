import prisma from "@/lib/prisma"

export async function buildContextoEstoque(): Promise<string> {
  const produtos = await prisma.produto.findMany({
    orderBy: { mediaVendaMensal: "desc" },
  })

  const ativos = produtos.filter(p => p.status === "ativo")
  const parados = produtos.filter(p => p.status === "parado" || (p.status === "ativo" && p.diasParado > 60))
  const ruptura = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo || p.risco === "ruptura")

  const valorTotalEstoque = produtos.reduce((acc, p) => acc + (p.estoqueAtual * p.custo), 0)
  const valorParado = parados.reduce((acc, p) => acc + (p.estoqueAtual * p.custo), 0)
  
  const giroAlto = ativos.filter(p => p.mediaVendaMensal > 10).sort((a, b) => b.mediaVendaMensal - a.mediaVendaMensal).slice(0, 5)
  const melhorMargem = ativos.sort((a, b) => b.margem - a.margem).slice(0, 5)

  return `
=== CONTEXTO DE ESTOQUE E PRODUTOS ===
Data: ${new Date().toLocaleDateString("pt-BR")}

--- RESUMO DO INVENTÁRIO ---
Total de SKUs: ${produtos.length} | Ativos: ${ativos.length}
Valor total imobilizado: R$ ${valorTotalEstoque.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
Capital parado (>60 dias): R$ ${valorParado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} (${parados.length} itens)

--- RISCOS OPERACIONAIS ---
Produtos em RUPTURA ou risco crítico (${ruptura.length} itens):
${ruptura.length > 0 ? ruptura.map(p => `- ${p.nome}: Estoque ${p.estoqueAtual} (Min: ${p.estoqueMinimo}) | Risco: ${p.risco}`).join("\n") : "Nenhum risco de ruptura imediato."}

Produtos PARADOS (capital imobilizado):
${parados.length > 0 ? parados.slice(0, 5).map(p => `- ${p.nome}: ${p.estoqueAtual} un. | ${p.diasParado} dias parado | R$ ${(p.estoqueAtual * p.custo).toLocaleString("pt-BR")}`).join("\n") : "Nenhum produto parado crítico."}

--- OPORTUNIDADES ---
Top 5 itens de ALTO GIRO (garantir estoque):
${giroAlto.map(p => `- ${p.nome}: ${p.mediaVendaMensal} un/mês | Estoque: ${p.estoqueAtual}`).join("\n")}

Top 5 itens de ALTA MARGEM (potencializar vendas):
${melhorMargem.map(p => `- ${p.nome}: ${p.margem}% margem | Venda mensal: ${p.mediaVendaMensal}`).join("\n")}

=== FIM DO CONTEXTO ===
`.trim()
}
