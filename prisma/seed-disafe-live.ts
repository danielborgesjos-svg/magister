import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed de B2B, Engenharia e Qualidade (DISAFE LIVE)...')

  // Pega o tenant da DISAFE
  const tenant = await prisma.tenant.findFirst({
    where: { nome: 'DISAFE' }
  })

  if (!tenant) {
    console.error('Tenant DISAFE não encontrado! Rode o seed inicial primeiro.')
    return
  }

  // Criar Produtos Reais (Engenharia)
  const produtosReais = [
    {
      nome: 'Barra Antipânico Push 1 Ponto',
      sku: 'BAP-001',
      precoBase: 350.00,
      custoMedio: 180.00,
      estoque: 120,
      categoria: 'Ferragens Corta-Fogo'
    },
    {
      nome: 'Fechadura de Embutir com Chave',
      sku: 'FEC-022',
      precoBase: 125.00,
      custoMedio: 65.00,
      estoque: 300,
      categoria: 'Fechaduras'
    },
    {
      nome: 'Mola Hidráulica Aérea Mista',
      sku: 'MHA-005',
      precoBase: 210.00,
      custoMedio: 110.00,
      estoque: 80,
      categoria: 'Acessórios'
    },
    {
      nome: 'Barra Antipânico Touch 2 Pontos Travamento',
      sku: 'BAT-002',
      precoBase: 580.00,
      custoMedio: 290.00,
      estoque: 45,
      categoria: 'Ferragens Corta-Fogo'
    }
  ]

  const produtosCriados = []
  for (const p of produtosReais) {
    const prod = await prisma.produto.create({
      data: {
        tenantId: tenant.id,
        nome: p.nome,
        preco: p.precoBase,
        custo: p.custoMedio,
        margem: ((p.precoBase - p.custoMedio) / p.precoBase) * 100,
        estoqueAtual: p.estoque,
        categoria: p.categoria,
      }
    })
    produtosCriados.push(prod)
    console.log(`Produto criado: ${p.nome}`)
  }

  // Criar Empresas/Clientes B2B
  const clientesReais = [
    { nome: 'Construtora MRV Engenharia', email: 'compras@mrv.com.br', telefone: '11999990001', tipo: 'pj' },
    { nome: 'Gafisa Incorporadora', email: 'suprimentos@gafisa.com.br', telefone: '11999990002', tipo: 'pj' },
    { nome: 'Hospital Sírio-Libanês (Manutenção)', email: 'infra@hsl.org.br', telefone: '11999990003', tipo: 'pj' },
    { nome: 'Shopping Iguatemi', email: 'obras@iguatemi.com.br', telefone: '11999990004', tipo: 'pj' }
  ]

  const clientesDb = []
  for (const c of clientesReais) {
    const cli = await prisma.cliente.create({
      data: {
        tenantId: tenant.id,
        nome: c.nome,
        razaoSocial: c.nome,
        segmento: 'Construção Civil'
      }
    })
    clientesDb.push(cli)
    console.log(`Cliente B2B criado: ${c.nome}`)
  }

  // Criar Oportunidades no B2B
  const ops = [
    { cli: clientesDb[0], titulo: 'Cotação para 10 Torres Residenciais', valor: 45000, status: 'proposta' },
    { cli: clientesDb[1], titulo: 'Substituição de Ferragens Antigas', valor: 12000, status: 'qualificacao' },
    { cli: clientesDb[2], titulo: 'Adequação Ala Nova (Bombeiros)', valor: 8500, status: 'negociacao' },
    { cli: clientesDb[3], titulo: 'Expansão Praça de Alimentação', valor: 32000, status: 'ganho' }
  ]

  for (const op of ops) {
    const oportunidade = await prisma.b2BOportunidade.create({
      data: {
        tenantId: tenant.id,
        clienteId: op.cli.id,
        titulo: op.titulo,
        valorEstimado: op.valor,
        status: op.status,
      }
    })
    
    // Criar atividade para dar vida ao Kanban
    await prisma.b2BAtividade.create({
      data: {
        tenantId: tenant.id,
        oportunidadeId: oportunidade.id,
        tipo: 'reuniao',
        descricao: 'Alinhamento de cronograma de entrega',
        dataHora: new Date()
      }
    })
    
    console.log(`Oportunidade B2B criada: ${op.titulo}`)
  }

  // Criar lotes para Qualidade
  await prisma.lote.create({
    data: {
      tenantId: tenant.id,
      numeroLote: 'LOTE-QC-001',
      quantidade: 50,
      status: 'quarentena',
      produtoId: produtosCriados[0].id
    }
  })

  await prisma.lote.create({
    data: {
      tenantId: tenant.id,
      numeroLote: 'LOTE-QC-002',
      quantidade: 120,
      status: 'rejeitado',
      produtoId: produtosCriados[1].id
    }
  })
  
  await prisma.lote.create({
    data: {
      tenantId: tenant.id,
      numeroLote: 'LOTE-QC-003',
      quantidade: 80,
      status: 'aprovado',
      produtoId: produtosCriados[2].id
    }
  })

  console.log('Seed DISAFE LIVE finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
