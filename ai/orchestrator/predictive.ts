import prisma from "@/lib/prisma";

export type PredictiveInsights = {
  churnRisk: any[];
  altaRecompra: any[];
  curvaA: any[];
  produtosRisco: any[];
};

export async function getPredictiveInsights(): Promise<PredictiveInsights> {
  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

  const noventaDiasAtras = new Date();
  noventaDiasAtras.setDate(noventaDiasAtras.getDate() - 90);

  // 1. Churn Risk: Clientes ativos sem compras/movimento nos últimos 30 dias com score alto
  const clientesEmRisco = await prisma.cliente.findMany({
    where: { status: 'ativo' },
    include: {
      vendas: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  const churnCalculado = clientesEmRisco
    .filter(c => c.vendas.length > 0 && c.vendas[0].createdAt < trintaDiasAtras && c.score >= 50)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(c => ({ id: c.id, nome: c.nome, score: c.score, ultimaVenda: c.vendas[0].createdAt, risco: 'Alto' }));

  // 2. Alta Recompra: Clientes com mais de 3 compras nos últimos 90 dias
  const altaRecompra = await prisma.cliente.findMany({
    where: { status: 'ativo' },
    include: {
      _count: {
        select: { vendas: { where: { createdAt: { gte: noventaDiasAtras } } } }
      }
    }
  });

  const topRecompra = altaRecompra
    .filter(c => c._count.vendas >= 3)
    .sort((a, b) => b._count.vendas - a._count.vendas)
    .slice(0, 5)
    .map(c => ({ id: c.id, nome: c.nome, score: c.score, comprasRecentes: c._count.vendas, probabilidade: 'Muito Alta' }));

  // 3. Curva A de Produtos: Produtos mais vendidos (Receita)
  const produtosVendidos = await prisma.itemVenda.groupBy({
    by: ['produtoId'],
    _sum: {
      quantidade: true,
      preco: true
    },
    orderBy: {
      _sum: {
        quantidade: 'desc'
      }
    },
    take: 5
  });

  const curvaA = await Promise.all(produtosVendidos.map(async (item) => {
    const p = await prisma.produto.findUnique({ where: { id: item.produtoId } });
    return {
      id: p?.id,
      nome: p?.nome,
      vendidos: item._sum.quantidade,
      faturamentoEstimado: (item._sum.quantidade || 0) * (item._sum.preco || 0),
      tendencia: 'Crescimento'
    }
  }));

  // 4. Produtos Risco: Produtos em estoque há muitos dias (baixo giro) ou próximos de ruptura
  const produtosRisco = await prisma.produto.findMany({
    where: {
      OR: [
        { estoqueAtual: { lte: 5 } }, // Ruptura
        { diasParado: { gte: 60 } }   // Parado
      ],
      status: 'ativo'
    },
    take: 5,
    select: { id: true, nome: true, estoqueAtual: true, diasParado: true, estoqueMinimo: true }
  });

  const riscoFormatado = produtosRisco.map(p => ({
    id: p.id,
    nome: p.nome,
    estoque: p.estoqueAtual,
    motivo: p.estoqueAtual <= p.estoqueMinimo ? 'Ruptura Iminente' : 'Excesso/Parado',
    diasParado: p.diasParado
  }));

  return {
    churnRisk: churnCalculado,
    altaRecompra: topRecompra,
    curvaA,
    produtosRisco: riscoFormatado
  };
}
