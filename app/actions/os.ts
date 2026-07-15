"use server"

import prisma from "@/lib/prisma"
import { getTenantId } from "@/lib/tenant-context"
import { revalidatePath } from "next/cache"
import { validarTransicao, REQUER_MOTIVO } from "@/lib/os-config"

// ─── KPIs para Visão Geral ────────────────────────────────────────────────────
export async function buscarKPIsOS() {
  const tenantId = getTenantId()
  try {
    const [
      abertas, aguardandoAgendamento, emExecucao,
      aguardandoRevisao, concluidas, atrasadas,
      naoConformidades, retornos, naoFaturadas
    ] = await Promise.all([
      prisma.ordemServico.count({ where: { tenantId, status: { notIn: ["concluida", "cancelada"] } } }),
      prisma.ordemServico.count({ where: { tenantId, status: "aguardando_agendamento" } }),
      prisma.ordemServico.count({ where: { tenantId, status: "em_execucao" } }),
      prisma.ordemServico.count({ where: { tenantId, status: "aguardando_revisao" } }),
      prisma.ordemServico.count({ where: { tenantId, status: "concluida" } }),
      // Atrasadas = SLA vencido e não concluída
      prisma.ordemServico.count({
        where: {
          tenantId,
          status: { notIn: ["concluida", "cancelada"] },
          prazoSLA: { lt: new Date() }
        }
      }),
      prisma.osNaoConformidade.count({ where: { tenantId, status: "aberta" } }),
      prisma.osRetorno.count({ where: { tenantId } }),
      prisma.ordemServico.count({
        where: { tenantId, status: "concluida", statusFaturamento: "nao_faturada" }
      }),
    ])

    // SLA em risco: prazoSLA nas próximas 4h e não concluída
    const slaEmRisco = await prisma.ordemServico.count({
      where: {
        tenantId,
        status: { notIn: ["concluida", "cancelada"] },
        prazoSLA: {
          gt: new Date(),
          lt: new Date(Date.now() + 4 * 60 * 60 * 1000)
        }
      }
    })

    return {
      abertas, aguardandoAgendamento, emExecucao,
      slaEmRisco, atrasadas, aguardandoRevisao,
      concluidas, naoFaturadas, retornos, naoConformidades
    }
  } catch (error) {
    console.error("[buscarKPIsOS]", error)
    return null
  }
}

// ─── Listagem com filtros e paginação ─────────────────────────────────────────
export async function buscarOSCompleto(filtros?: {
  status?: string
  prioridade?: string
  tecnicoId?: string
  clienteId?: string
  statusFaturamento?: string
  busca?: string
  pagina?: number
  porPagina?: number
}) {
  const tenantId = getTenantId()
  const pagina = filtros?.pagina ?? 1
  const porPagina = filtros?.porPagina ?? 30
  const skip = (pagina - 1) * porPagina

  try {
    const where: any = { tenantId }
    if (filtros?.status && filtros.status !== "todas")
      where.status = filtros.status
    if (filtros?.prioridade && filtros.prioridade !== "todas")
      where.prioridade = filtros.prioridade
    if (filtros?.tecnicoId) where.tecnicoId = filtros.tecnicoId
    if (filtros?.clienteId) where.clienteId = filtros.clienteId
    if (filtros?.statusFaturamento) where.statusFaturamento = filtros.statusFaturamento
    if (filtros?.busca) {
      where.OR = [
        { titulo: { contains: filtros.busca } },
        { tipoAtendimento: { contains: filtros.busca } },
        { cliente: { nome: { contains: filtros.busca } } },
        { tecnico: { nome: { contains: filtros.busca } } },
      ]
    }

    const [total, itens] = await Promise.all([
      prisma.ordemServico.count({ where }),
      prisma.ordemServico.findMany({
        where,
        skip,
        take: porPagina,
        include: {
          cliente: { select: { id: true, nome: true } },
          unidade: { select: { id: true, nome: true } },
          endereco: { select: { cidade: true, uf: true, bairro: true } },
          tecnico: { select: { id: true, nome: true, equipeId: true } },
          veiculo: { select: { id: true, placa: true, modelo: true } },
          contrato: { select: { id: true, titulo: true, valor: true } },
          ativo: { select: { id: true, nome: true, modelo: true } },
          execucao: { select: { checklistPct: true, dataInicio: true, dataFim: true } },
          cobranca: { select: { id: true, status: true, valorFaturado: true } },
          _count: { select: { naoConformidades: true, fotos: true, itensMateriaisOS: true } }
        },
        orderBy: [
          { prazoSLA: { sort: "asc", nulls: "last" } },
          { dataAgendada: { sort: "asc", nulls: "last" } }
        ]
      })
    ])

    return { total, paginas: Math.ceil(total / porPagina), pagina, itens }
  } catch (error) {
    console.error("[buscarOSCompleto]", error)
    return { total: 0, paginas: 0, pagina: 1, itens: [] }
  }
}

// ─── Detalhe completo de uma OS (para o Drawer) ───────────────────────────────
export async function buscarOSDetalhe(osId: string) {
  const tenantId = getTenantId()
  try {
    return await prisma.ordemServico.findFirst({
      where: { id: osId, tenantId },
      include: {
        cliente: true,
        unidade: true,
        endereco: true,
        tecnico: { include: { equipe: true } },
        veiculo: true,
        contrato: true,
        ativo: true,
        execucao: true,
        transicoes: { orderBy: { criadoEm: "desc" } },
        naoConformidades: { orderBy: { createdAt: "desc" } },
        itensMateriaisOS: { include: { produto: { select: { nome: true, estoqueAtual: true } } } },
        fotos: { orderBy: { capturadoEm: "desc" } },
        cobranca: { include: { lancamento: true } },
        retornoOrigem: { include: { osOrigem: { select: { numeroOS: true, titulo: true } } } },
        retornos: { include: { osRetorno: { select: { id: true, numeroOS: true, status: true } } } },
      }
    })
  } catch (error) {
    console.error("[buscarOSDetalhe]", error)
    return null
  }
}

// ─── Criar OS ─────────────────────────────────────────────────────────────────
export async function criarOS(data: {
  clienteId: string
  unidadeId: string
  enderecoId: string
  tecnicoId: string
  veiculoId?: string
  contratoId?: string
  ativoId?: string
  modeloOsId?: string
  titulo: string
  tipoAtendimento: string
  prioridade?: string
  dataAgendada?: string
  prazoSLAHoras?: number
  valorPrevisto?: number
  observacoesInternas?: string
}) {
  const tenantId = getTenantId()
  try {
    const maxOS = await prisma.ordemServico.aggregate({
      where: { tenantId },
      _max: { numeroOS: true }
    })
    const numeroOS = (maxOS._max.numeroOS || 1000) + 1

    const prazoSLA = data.prazoSLAHoras && data.dataAgendada
      ? new Date(new Date(data.dataAgendada).getTime() + data.prazoSLAHoras * 3600000)
      : undefined

    const os = await prisma.ordemServico.create({
      data: {
        tenantId,
        numeroOS,
        clienteId: data.clienteId,
        unidadeId: data.unidadeId,
        enderecoId: data.enderecoId,
        tecnicoId: data.tecnicoId,
        veiculoId: data.veiculoId,
        contratoId: data.contratoId,
        ativoId: data.ativoId,
        modeloOsId: data.modeloOsId,
        titulo: data.titulo,
        tipoAtendimento: data.tipoAtendimento,
        prioridade: data.prioridade ?? "media",
        status: data.dataAgendada ? "agendada" : "aguardando_agendamento",
        dataAgendada: data.dataAgendada ? new Date(data.dataAgendada) : undefined,
        prazoSLA,
        valorPrevisto: data.valorPrevisto ?? 0,
        observacoesInternas: data.observacoesInternas,
      }
    })

    await prisma.osExecucao.create({
      data: { tenantId, ordemServicoId: os.id }
    })

    await prisma.osTransicao.create({
      data: {
        tenantId,
        ordemServicoId: os.id,
        statusDe: "rascunho",
        statusPara: os.status,
        motivo: "OS criada",
      }
    })

    revalidatePath("/os")
    return { success: true, os }
  } catch (error) {
    console.error("[criarOS]", error)
    return { success: false, error: "Erro ao criar OS." }
  }
}

// ─── Transição de status (máquina de estados) ─────────────────────────────────
export async function transicionarOS(osId: string, novoStatus: string, motivo?: string) {
  const tenantId = getTenantId()
  try {
    const os = await prisma.ordemServico.findFirst({ where: { id: osId, tenantId } })
    if (!os) throw new Error("OS não encontrada")

    validarTransicao(os.status, novoStatus)

    if (REQUER_MOTIVO.has(novoStatus) && !motivo) {
      throw new Error(`Transição para '${novoStatus}' requer motivo.`)
    }

    const updateData: any = { status: novoStatus }
    if (novoStatus === "cancelada") updateData.motivoCancelamento = motivo

    await prisma.ordemServico.update({ where: { id: osId }, data: updateData })

    await prisma.osTransicao.create({
      data: {
        tenantId,
        ordemServicoId: osId,
        statusDe: os.status,
        statusPara: novoStatus,
        motivo,
      }
    })

    // Efeitos colaterais
    if (novoStatus === "em_execucao") {
      await prisma.osExecucao.update({
        where: { ordemServicoId: osId },
        data: { dataInicio: new Date() }
      })
    }
    if (novoStatus === "concluida") {
      await prisma.osExecucao.update({
        where: { ordemServicoId: osId },
        data: { dataFim: new Date() }
      })
    }

    revalidatePath("/os")
    return { success: true }
  } catch (error: any) {
    console.error("[transicionarOS]", error)
    return { success: false, error: error.message ?? "Erro ao transicionar OS." }
  }
}

// ─── Aprovar OS (aguardando_revisao → concluida) ──────────────────────────────
export async function aprovarOS(osId: string, valorFinal?: number) {
  const tenantId = getTenantId()
  try {
    const os = await prisma.ordemServico.findFirst({ where: { id: osId, tenantId } })
    if (!os) throw new Error("OS não encontrada")
    validarTransicao(os.status, "concluida")

    await prisma.ordemServico.update({
      where: { id: osId },
      data: { status: "concluida", valorFinal: valorFinal ?? os.valorPrevisto }
    })

    await prisma.osTransicao.create({
      data: {
        tenantId, ordemServicoId: osId,
        statusDe: os.status, statusPara: "concluida", motivo: "Aprovada pelo gestor"
      }
    })
    await prisma.osExecucao.update({ where: { ordemServicoId: osId }, data: { dataFim: new Date() } })

    revalidatePath("/os")
    revalidatePath("/os/aprovacoes")
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ─── Gerar cobrança a partir de OS concluída ─────────────────────────────────
export async function gerarCobrancaOS(osId: string) {
  const tenantId = getTenantId()
  try {
    const os = await prisma.ordemServico.findFirst({
      where: { id: osId, tenantId, status: "concluida", statusFaturamento: "nao_faturada" },
      include: { cliente: true }
    })
    if (!os) throw new Error("OS não encontrada ou já faturada")

    const valor = os.valorFinal ?? os.valorPrevisto

    const lancamento = await prisma.lancamentoFinanceiro.create({
      data: {
        tenantId,
        descricao: `OS #${os.numeroOS} — ${os.titulo}`,
        valor,
        tipo: "receita",
        status: "pendente",
        dataVenc: new Date(Date.now() + 30 * 24 * 3600000), // 30 dias
      }
    })

    const cobranca = await prisma.osCobranca.create({
      data: {
        tenantId,
        ordemServicoId: osId,
        lancamentoId: lancamento.id,
        valorFaturado: valor,
      }
    })

    await prisma.ordemServico.update({
      where: { id: osId },
      data: { statusFaturamento: "faturada" }
    })

    revalidatePath("/os")
    revalidatePath("/financeiro")
    return { success: true, cobranca, lancamento }
  } catch (error: any) {
    console.error("[gerarCobrancaOS]", error)
    return { success: false, error: error.message }
  }
}

// ─── Registrar Não Conformidade ───────────────────────────────────────────────
export async function registrarNC(osId: string, data: {
  descricao: string
  categoria: string
  gravidade: string
  acaoCorretiva?: string
}) {
  const tenantId = getTenantId()
  try {
    const nc = await prisma.osNaoConformidade.create({
      data: {
        tenantId,
        ordemServicoId: osId,
        descricao: data.descricao,
        categoria: data.categoria,
        gravidade: data.gravidade,
        acaoCorretiva: data.acaoCorretiva,
      }
    })

    await prisma.ordemServico.update({
      where: { id: osId },
      data: { status: "nao_conformidade" }
    })

    revalidatePath("/os")
    return { success: true, nc }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ─── Buscar OS para Despacho ──────────────────────────────────────────────────
export async function buscarOSParaDespacho() {
  const tenantId = getTenantId()
  try {
    const [osSemTecnico, tecnicos, veiculos] = await Promise.all([
      prisma.ordemServico.findMany({
        where: { tenantId, status: "aguardando_agendamento" },
        include: {
          cliente: { select: { nome: true } },
          unidade: { select: { nome: true } },
          endereco: { select: { cidade: true, bairro: true } },
        },
        orderBy: { prioridade: "asc" }
      }),
      prisma.tecnico.findMany({
        where: { tenantId, status: "ativo" },
        include: {
          equipe: true,
          ordensServico: {
            where: { status: { in: ["agendada", "em_deslocamento", "em_execucao"] } },
            select: { id: true, dataAgendada: true, status: true }
          }
        }
      }),
      prisma.veiculo.findMany({
        where: { tenantId, status: "ativo" },
        include: {
          ordensServico: {
            where: { status: { in: ["agendada", "em_deslocamento", "em_execucao"] } },
            select: { id: true }
          }
        }
      })
    ])
    return { osSemTecnico, tecnicos, veiculos }
  } catch (error) {
    console.error("[buscarOSParaDespacho]", error)
    return { osSemTecnico: [], tecnicos: [], veiculos: [] }
  }
}

// ─── Fila de Aprovações ───────────────────────────────────────────────────────
export async function buscarFilaAprovacoes() {
  const tenantId = getTenantId()
  try {
    return await prisma.ordemServico.findMany({
      where: { tenantId, status: "aguardando_revisao" },
      include: {
        cliente: { select: { nome: true } },
        tecnico: { select: { nome: true } },
        execucao: { select: { dataFim: true, checklistPct: true, observacoesTecnicas: true } },
        fotos: { select: { url: true, tipo: true }, take: 3 },
        itensMateriaisOS: { select: { descricao: true, quantidade: true, valorUnitario: true } },
      },
      orderBy: { updatedAt: "asc" }
    })
  } catch (error) {
    console.error("[buscarFilaAprovacoes]", error)
    return []
  }
}

// ─── Buscar NCs ───────────────────────────────────────────────────────────────
export async function buscarNaoConformidades(filtros?: { status?: string }) {
  const tenantId = getTenantId()
  try {
    const where: any = { tenantId }
    if (filtros?.status) where.status = filtros.status
    return await prisma.osNaoConformidade.findMany({
      where,
      include: {
        ordemServico: {
          select: { numeroOS: true, titulo: true, cliente: { select: { nome: true } } }
        }
      },
      orderBy: [{ gravidade: "asc" }, { createdAt: "desc" }]
    })
  } catch (error) {
    console.error("[buscarNaoConformidades]", error)
    return []
  }
}

// ─── Buscar Retornos ──────────────────────────────────────────────────────────
export async function buscarRetornos() {
  const tenantId = getTenantId()
  try {
    return await prisma.osRetorno.findMany({
      where: { tenantId },
      include: {
        osOrigem: { select: { numeroOS: true, titulo: true, cliente: { select: { nome: true } } } },
        osRetorno: { select: { id: true, numeroOS: true, status: true, dataAgendada: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  } catch (error) {
    console.error("[buscarRetornos]", error)
    return []
  }
}

// ─── Modelos de OS ────────────────────────────────────────────────────────────
export async function buscarModelosOS() {
  const tenantId = getTenantId()
  try {
    return await prisma.osModelo.findMany({
      where: { tenantId, ativo: true },
      orderBy: { nome: "asc" }
    })
  } catch (error) {
    console.error("[buscarModelosOS]", error)
    return []
  }
}

// ─── Filtros Salvos ───────────────────────────────────────────────────────────
export async function buscarFiltrosSalvos(usuarioId: string, modulo = "os") {
  const tenantId = getTenantId()
  try {
    return await prisma.filtroSalvo.findMany({
      where: { tenantId, usuarioId, modulo },
      orderBy: [{ padrao: "desc" }, { createdAt: "desc" }]
    })
  } catch (error) {
    return []
  }
}

export async function salvarFiltro(usuarioId: string, nome: string, filtroJson: string, modulo = "os") {
  const tenantId = getTenantId()
  try {
    const filtro = await prisma.filtroSalvo.create({
      data: { tenantId, usuarioId, modulo, nome, filtroJson }
    })
    return { success: true, filtro }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// ─── Dados para Relatórios ────────────────────────────────────────────────────
export async function buscarDadosRelatorioOS(periodo = 30) {
  const tenantId = getTenantId()
  const desde = new Date(Date.now() - periodo * 24 * 3600000)
  try {
    const [por_status, por_tecnico, por_tipo, sla_stats] = await Promise.all([
      prisma.ordemServico.groupBy({
        by: ["status"],
        where: { tenantId, createdAt: { gte: desde } },
        _count: { id: true }
      }),
      prisma.ordemServico.groupBy({
        by: ["tecnicoId"],
        where: { tenantId, createdAt: { gte: desde } },
        _count: { id: true },
        _sum: { valorFinal: true }
      }),
      prisma.ordemServico.groupBy({
        by: ["tipoAtendimento"],
        where: { tenantId, createdAt: { gte: desde } },
        _count: { id: true }
      }),
      prisma.ordemServico.aggregate({
        where: { tenantId, status: "concluida", createdAt: { gte: desde } },
        _sum: { valorFinal: true, valorPrevisto: true, custoMaoObra: true, custoMaterial: true },
        _count: { id: true }
      })
    ])
    return { por_status, por_tecnico, por_tipo, sla_stats }
  } catch (error) {
    console.error("[buscarDadosRelatorioOS]", error)
    return null
  }
}

export async function atualizarStatusOS(id: string, status: string) {
  const tenantId = getTenantId()
  try {
    const os = await prisma.ordemServico.update({
      where: { id, tenantId },
      data: { status }
    })
    
    // Opcional: registrar transição no histórico
    await prisma.osTransicao.create({
      data: {
        ordemServicoId: id,
        tenantId,
        statusAntigo: "N/A", // Poderíamos ler o antigo antes do update
        statusNovo: status,
        observacao: "Movido pelo Kanban"
      }
    })

    revalidatePath("/os")
    return { success: true, os }
  } catch (error: any) {
    console.error("[atualizarStatusOS]", error)
    return { success: false, error: "Erro ao atualizar status da OS." }
  }
}

export async function atribuirTecnicoOS(osId: string, tecnicoId: string | null) {
  const tenantId = getTenantId()
  try {
    const data: any = { tecnicoId }
    // Se for atribuído a um técnico, movemos o status para 'agendada'
    if (tecnicoId) {
      data.status = "agendada"
    } else {
      data.status = "aguardando_agendamento"
    }

    const os = await prisma.ordemServico.update({
      where: { id: osId, tenantId },
      data
    })
    revalidatePath("/os")
    return { success: true, os }
  } catch (error) {
    console.error("[atribuirTecnicoOS]", error)
    return { success: false, error: "Erro ao atribuir rota." }
  }
}

export async function iniciarAtendimento(osId: string) {
  try {
    const tenantId = getTenantId()
    const os = await prisma.ordemServico.update({
      where: { id: osId, tenantId },
      data: { status: "em_andamento", updatedAt: new Date() }
    })
    revalidatePath("/os")
    revalidatePath("/app-tecnico")
    return { success: true, data: os }
  } catch (error) {
    console.error("[iniciarAtendimento]", error)
    return { success: false, error: "Erro ao iniciar atendimento" }
  }
}

export async function finalizarAtendimento(osId: string, observacoes?: string) {
  try {
    const tenantId = getTenantId()
    const os = await prisma.ordemServico.update({
      where: { id: osId, tenantId },
      data: {
        status: "aguardando_aprovacao",
        ...(observacoes ? { observacoesInternas: observacoes } : {}),
        updatedAt: new Date()
      }
    })
    revalidatePath("/os")
    revalidatePath("/app-tecnico")
    return { success: true, data: os }
  } catch (error) {
    console.error("[finalizarAtendimento]", error)
    return { success: false, error: "Erro ao finalizar atendimento" }
  }
}
