import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando Seed DISAFE (IA Preditiva)...')

  // Como estamos num multi-tenant, podemos usar um tenant principal ou criar um novo
  let tenant = await prisma.tenant.findFirst({
    where: { nome: 'DISAFE' }
  })
  
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        nome: 'DISAFE',
        documento: '12345678901234',
        status: 'ativo'
      }
    })
  }

  // Limpar tabelas afetadas para o tenant DISAFE
  await prisma.alertaPreditivo.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.itemVenda.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.venda.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.produto.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.cliente.deleteMany({ where: { tenantId: tenant.id } })

  // Produtos (Fechaduras com perfis diferentes)
  const produtos = [
    { nome: 'Fechadura Eletrônica Biométrica Master', categoria: 'Premium', preco: 1200, custo: 600, margem: 50, estoqueAtual: 15, estoqueMinimo: 30, mediaVendaMensal: 60, demandaPrevista30d: 75, dataRupturaEstoque: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), sugestaoReposicao: 100, risco: 'alto' },
    { nome: 'Fechadura Digital Teclado Simples', categoria: 'Standard', preco: 450, custo: 200, margem: 55, estoqueAtual: 120, estoqueMinimo: 50, mediaVendaMensal: 100, demandaPrevista30d: 110, dataRupturaEstoque: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000), sugestaoReposicao: 0, risco: 'baixo' },
    { nome: 'Fechadura Inteligente Wi-Fi', categoria: 'Premium', preco: 950, custo: 450, margem: 52, estoqueAtual: 8, estoqueMinimo: 20, mediaVendaMensal: 40, demandaPrevista30d: 45, dataRupturaEstoque: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), sugestaoReposicao: 50, risco: 'critico' },
    { nome: 'Cadeado Smart Bluetooth', categoria: 'Acessórios', preco: 250, custo: 100, margem: 60, estoqueAtual: 200, estoqueMinimo: 80, mediaVendaMensal: 150, demandaPrevista30d: 130, dataRupturaEstoque: new Date(Date.now() + 46 * 24 * 60 * 60 * 1000), sugestaoReposicao: 0, risco: 'baixo' },
    { nome: 'Módulo Relé Zigbee', categoria: 'Acessórios', preco: 150, custo: 50, margem: 66, estoqueAtual: 45, estoqueMinimo: 100, mediaVendaMensal: 120, demandaPrevista30d: 140, dataRupturaEstoque: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), sugestaoReposicao: 200, risco: 'alto' }
  ]

  const dbProdutos = []
  for (const p of produtos) {
    const prod = await prisma.produto.create({
      data: {
        ...p,
        tenantId: tenant.id
      }
    })
    dbProdutos.push(prod)
  }

  // Clientes (Espalhados pelo Brasil, 90% fora do RS)
  const cidadesForaRS = ['São Paulo', 'Belo Horizonte', 'Curitiba', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza', 'Recife', 'Goiânia']
  
  const clientes = []
  for (let i = 1; i <= 20; i++) {
    const isRS = i <= 2 // 10% RS
    const cidade = isRS ? 'Porto Alegre' : cidadesForaRS[i % cidadesForaRS.length]
    
    // Simulação de predição de churn
    const probChurn = isRS ? 10 : Math.floor(Math.random() * 80)
    
    clientes.push({
      tenantId: tenant.id,
      nome: `Cliente Distribuidor ${i} - ${cidade}`,
      cidade: cidade,
      score: 100 - probChurn,
      status: probChurn > 60 ? 'risco' : 'ativo',
      totalComprado: Math.floor(Math.random() * 50000) + 5000,
      probabilidadeChurn: probChurn,
      perfilComportamental: probChurn > 60 ? 'Queda nas compras (3 meses)' : 'Compra recorrente',
    })
  }

  const dbClientes = []
  for (const c of clientes) {
    const cli = await prisma.cliente.create({ data: c })
    dbClientes.push(cli)
  }

  // Alertas Preditivos (Simulando a saída da IA)
  await prisma.alertaPreditivo.createMany({
    data: [
      {
        tenantId: tenant.id,
        tipo: 'estoque',
        titulo: 'Risco de Ruptura: Fechadura Inteligente Wi-Fi',
        descricao: 'Demanda prevista para região Nordeste aumentou 20%. Estoque atual esgotará em 5 dias.',
        severidade: 'critica',
        dadoReferenciaId: dbProdutos[2].id
      },
      {
        tenantId: tenant.id,
        tipo: 'estoque',
        titulo: 'Alerta Reposição: Fechadura Eletrônica Biométrica',
        descricao: 'Sugerimos compra de 100 unidades devido à sazonalidade e histórico do mês passado.',
        severidade: 'alta',
        dadoReferenciaId: dbProdutos[0].id
      },
      {
        tenantId: tenant.id,
        tipo: 'cliente',
        titulo: 'Alta Probabilidade de Churn em SP',
        descricao: `O Distribuidor em São Paulo reduziu pedidos em 40% nos últimos 60 dias.`,
        severidade: 'alta',
        dadoReferenciaId: dbClientes[3].id
      },
      {
        tenantId: tenant.id,
        tipo: 'vendas',
        titulo: 'Oportunidade de Upsell no Centro-Oeste',
        descricao: 'Clientes de Brasília e Goiânia têm alto interesse em Módulo Relé Zigbee casado com fechaduras Wi-Fi.',
        severidade: 'media'
      }
    ]
  })

  // Simular Histórico de Vendas (Para gráficos)
  console.log('Gerando histórico de vendas...')
  for (let i = 0; i < 50; i++) {
    const dataVenda = new Date()
    dataVenda.setDate(dataVenda.getDate() - Math.floor(Math.random() * 90)) // Últimos 90 dias
    
    const cliente = dbClientes[Math.floor(Math.random() * dbClientes.length)]
    const produto = dbProdutos[Math.floor(Math.random() * dbProdutos.length)]
    const quantidade = Math.floor(Math.random() * 20) + 1
    
    await prisma.venda.create({
      data: {
        tenantId: tenant.id,
        clienteId: cliente.id,
        total: produto.preco * quantidade,
        createdAt: dataVenda,
        itens: {
          create: {
            tenantId: tenant.id,
            produtoId: produto.id,
            quantidade: quantidade,
            preco: produto.preco
          }
        }
      }
    })
  }

  console.log('✅ Seed finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
