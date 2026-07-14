"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"

export async function getDashboardKpis() {
  const tenantId = getTenantId()
  const agora = new Date()
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1)
  const inicioMesAnterior = new Date(agora.getFullYear(), agora.getMonth() - 1, 1)
  const fimMesAnterior = new Date(agora.getFullYear(), agora.getMonth(), 0)
  const em4h = new Date(Date.now() + 4 * 60 * 60 * 1000)

  // Para o gráfico de 6 meses
  const seisMesesAtras = new Date(agora.getFullYear(), agora.getMonth() - 5, 1)

  try {
    const [
      osAbertas, osAguardandoAgendamento, osEmExecucao, osAguardandoRevisao,
      osConcluidas, osAtrasadas, osSlaEmRisco, osNaoFaturadas,
      osNaoConformidades, osCriadasMes, osConcluidasMes,
      receitaMes, receitaMesAnterior, despesasMes, contasVencidas, contasPendentes,
      totalClientes, clientesAtivos, clientesNovos,
      negociacoesAbertas, negociacoesFechadas, vendasMes,
      tarefasVencidas, tarefasPendentes,
      tecnicosAtivos, veiculosAtivos,
      produtos, contratosAtivos,
      lancamentos6Meses,
      osPorStatusRaw,
      agendamentosFuturos,
      ultimasVendas,
      ultimasOS,
      usuarioLogado
    ] = await Promise.all([
      prisma.ordemServico.count({ where: { tenantId, status: { notIn: ["concluida", "cancelada"] } } }),
      prisma.ordemServico.count({ where: { tenantId, status: "aguardando_agendamento" } }),
      prisma.ordemServico.count({ where: { tenantId, status: "em_execucao" } }),
      prisma.ordemServico.count({ where: { tenantId, status: "aguardando_revisao" } }),
      prisma.ordemServico.count({ where: { tenantId, status: "concluida" } }),
      prisma.ordemServico.count({ where: { tenantId, status: { notIn: ["concluida", "cancelada"] }, prazoSLA: { lt: agora } } }),
      prisma.ordemServico.count({ where: { tenantId, status: { notIn: ["concluida", "cancelada"] }, prazoSLA: { gt: agora, lt: em4h } } }),
      prisma.ordemServico.count({ where: { tenantId, status: "concluida", statusFaturamento: "nao_faturada" } }),
      prisma.osNaoConformidade.count({ where: { tenantId, status: "aberta" } }),
      prisma.ordemServico.count({ where: { tenantId, createdAt: { gte: inicioMes } } }),
      prisma.ordemServico.count({ where: { tenantId, status: "concluida", updatedAt: { gte: inicioMes } } }),
      prisma.lancamentoFinanceiro.aggregate({ where: { tenantId, tipo: "receita", status: "pago", dataVenc: { gte: inicioMes, lte: agora } }, _sum: { valor: true } }),
      prisma.lancamentoFinanceiro.aggregate({ where: { tenantId, tipo: "receita", status: "pago", dataVenc: { gte: inicioMesAnterior, lte: fimMesAnterior } }, _sum: { valor: true } }),
      prisma.lancamentoFinanceiro.aggregate({ where: { tenantId, tipo: "despesa", status: "pago", dataVenc: { gte: inicioMes, lte: agora } }, _sum: { valor: true } }),
      prisma.lancamentoFinanceiro.count({ where: { tenantId, status: "vencido" } }),
      prisma.lancamentoFinanceiro.findMany({ where: { tenantId, status: "pendente", tipo: "receita" }, select: { valor: true } }),
      prisma.cliente.count({ where: { tenantId } }),
      prisma.cliente.count({ where: { tenantId, status: "ativo" } }),
      prisma.cliente.count({ where: { tenantId, createdAt: { gte: inicioMes } } }),
      prisma.negociacao.count({ where: { tenantId, status: { notIn: ["fechado_ganho", "fechado_perdido"] } } }),
      prisma.negociacao.count({ where: { tenantId, status: "fechado_ganho", updatedAt: { gte: inicioMes } } }),
      prisma.venda.aggregate({ where: { tenantId, createdAt: { gte: inicioMes } }, _sum: { total: true } }),
      prisma.tarefa.count({ where: { tenantId, status: { notIn: ["concluida"] }, prazo: { lt: agora } } }),
      prisma.tarefa.count({ where: { tenantId, status: { in: ["a_fazer", "em_andamento"] } } }),
      prisma.tecnico.count({ where: { tenantId, status: "ativo" } }),
      prisma.veiculo.count({ where: { tenantId, status: "ativo" } }),
      prisma.produto.findMany({ where: { tenantId, status: "ativo" }, select: { estoqueAtual: true, estoqueMinimo: true } }),
      prisma.contrato.count({ where: { tenantId, status: "ativo" } }),
      
      // Novos: Lançamentos dos últimos 6 meses para o Gráfico de Área
      prisma.lancamentoFinanceiro.findMany({
        where: { tenantId, status: "pago", dataVenc: { gte: seisMesesAtras } },
        select: { valor: true, tipo: true, dataVenc: true }
      }),

      // Novos: OS agrupadas por status para o Gráfico Donut
      prisma.ordemServico.groupBy({
        by: ['status'],
        where: { tenantId },
        _count: { status: true }
      }),

      // Novos: Agendamentos Futuros (Agenda)
      prisma.agendamento.findMany({
        where: { tenantId, data: { gte: agora } },
        orderBy: { data: 'asc' },
        take: 3
      }),

      // Novos: Últimas vendas (Timeline)
      prisma.venda.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 2,
        include: { cliente: { select: { nome: true } } }
      }),

      // Novos: Últimas OS (Timeline)
      prisma.ordemServico.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { cliente: { select: { nome: true } } }
      }),

      // Mock Usuário Logado (como não temos getSession real aqui no contexto simplificado, pegamos o primeiro admin)
      prisma.user.findFirst({
        where: { tenantId, role: "admin" },
        select: { nome: true }
      })
    ])

    const receitaMesVal = receitaMes._sum.valor ?? 0
    const receitaMesAnteriorVal = receitaMesAnterior._sum.valor ?? 0
    const despesasMesVal = despesasMes._sum.valor ?? 0
    const receitaPendente = contasPendentes.reduce((acc, c) => acc + c.valor, 0)
    const crescimentoReceita = receitaMesAnteriorVal > 0
      ? ((receitaMesVal - receitaMesAnteriorVal) / receitaMesAnteriorVal) * 100
      : 0
    const produtosAbaixoMinimo = produtos.filter(p => p.estoqueAtual <= p.estoqueMinimo).length
    const totalProdutos = produtos.length

    // Processar gráfico de área (últimos 6 meses)
    const mesesNomes = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
    const chartReceitas = []
    for (let i = 5; i >= 0; i--) {
      const targetDate = new Date(agora.getFullYear(), agora.getMonth() - i, 1)
      const label = mesesNomes[targetDate.getMonth()]
      
      const lancamentosDoMes = lancamentos6Meses.filter(l => 
        l.dataVenc.getMonth() === targetDate.getMonth() && 
        l.dataVenc.getFullYear() === targetDate.getFullYear()
      )
      
      const rec = lancamentosDoMes.filter(l => l.tipo === "receita").reduce((acc, l) => acc + l.valor, 0)
      const des = lancamentosDoMes.filter(l => l.tipo === "despesa").reduce((acc, l) => acc + l.valor, 0)
      
      chartReceitas.push({
        name: label,
        realizado: rec,
        despesas: des,
        previsto: rec * 1.1 // Apenas simulação de meta baseada no histórico
      })
    }

    // Processar gráfico de donut (OS)
    let andamento = 0, aguardando = 0, concluidas = 0, canceladas = 0;
    osPorStatusRaw.forEach(item => {
      if (item.status === 'concluida') concluidas += item._count.status;
      else if (item.status === 'cancelada') canceladas += item._count.status;
      else if (item.status === 'aguardando_agendamento' || item.status === 'aguardando_revisao') aguardando += item._count.status;
      else andamento += item._count.status;
    })

    const chartOS = [
      { name: "Em andamento", value: andamento, color: "#00A3FF" },
      { name: "Aguardando", value: aguardando, color: "#F59E0B" },
      { name: "Concluídas", value: concluidas, color: "#22C55E" },
      { name: "Canceladas", value: canceladas, color: "#EF4444" },
    ].filter(i => i.value > 0)

    // Agendamentos mapeados
    const agendaFormatada = agendamentosFuturos.map(ag => {
      const horas = ag.data.getHours().toString().padStart(2, '0')
      const mins = ag.data.getMinutes().toString().padStart(2, '0')
      return {
        id: ag.id,
        time: `${horas}:${mins}`,
        duration: `${ag.duracao}m`,
        title: ag.titulo,
        subtitle: ag.clienteId ? `Cliente ID: ${ag.clienteId.slice(0, 5)}` : "Evento Interno",
        priority: ag.tipo === "reuniao" ? "high" : "medium",
        color: ag.tipo === "reuniao" ? "bg-red-500" : "bg-orange-500"
      }
    })

    // Timeline formatada unindo Vendas e OS (últimas 5)
    const rawTimeline = [
      ...ultimasVendas.map(v => ({
        id: `v-${v.id}`,
        dataRaw: v.createdAt,
        title: "Venda Finalizada",
        desc: `${v.cliente?.nome || "Cliente avulso"} - R$ ${v.total}`,
        type: "venda"
      })),
      ...ultimasOS.map(os => ({
        id: `os-${os.id}`,
        dataRaw: os.createdAt,
        title: "Nova OS Criada",
        desc: `OS #${os.numeroOS} - ${os.cliente?.nome || ""}`,
        type: "os"
      }))
    ].sort((a, b) => b.dataRaw.getTime() - a.dataRaw.getTime()).slice(0, 4)

    const timelineFormatada = rawTimeline.map(item => {
      const horas = item.dataRaw.getHours().toString().padStart(2, '0')
      const mins = item.dataRaw.getMinutes().toString().padStart(2, '0')
      return {
        id: item.id,
        time: `${horas}:${mins}`,
        title: item.title,
        desc: item.desc,
        type: item.type
      }
    })

    // Mockar algumas métricas de conversão pro Commercial Performance se tiver zero
    const perfCommercial = [
      { label: "Novos Leads", value: totalClientes.toString(), trend: "+ 15%", color: "text-blue-500", bars: [4, 6, 5, 8, 7, 10, 12] },
      { label: "Propostas Abertas", value: negociacoesAbertas.toString(), trend: "+ 8%", color: "text-emerald-500", bars: [2, 3, 3, 5, 4, 6, 8] },
      { label: "Vendas Fechadas", value: negociacoesFechadas.toString(), trend: "+ 20%", color: "text-purple-500", bars: [1, 1, 2, 2, 3, 4, 5] },
      { label: "Receita", value: (vendasMes._sum.total ?? 0).toString(), trend: "+ 3%", color: "text-orange-500", bars: [10, 12, 11, 14, 13, 15, 14] },
    ]

    return {
      usuarioNome: usuarioLogado?.nome || "Usuário",
      // Operacional
      osAbertas, osAguardandoAgendamento, osEmExecucao, osAguardandoRevisao,
      osConcluidas, osAtrasadas, osSlaEmRisco, osNaoFaturadas,
      osNaoConformidades, osCriadasMes, osConcluidasMes,
      // Financeiro
      receitaMes: receitaMesVal,
      receitaMesAnterior: receitaMesAnteriorVal,
      despesasMes: despesasMesVal,
      lucroBrutoMes: receitaMesVal - despesasMesVal,
      receitaPendente,
      contasVencidas,
      crescimentoReceita,
      // Clientes
      totalClientes, clientesAtivos, clientesNovos,
      // Comercial
      negociacoesAbertas, negociacoesFechadas,
      vendasMes: vendasMes._sum.total ?? 0,
      // Tarefas
      tarefasVencidas, tarefasPendentes,
      // Equipe
      tecnicosAtivos, veiculosAtivos,
      // Estoque
      produtosAbaixoMinimo, totalProdutos,
      // Contratos
      contratosAtivos,

      // Arrays formatados para UI
      chartReceitas,
      chartOS,
      agendaFormatada,
      timelineFormatada,
      perfCommercial
    }
  } catch (error) {
    console.error("[getDashboardKpis]", error)
    return null
  }
}
