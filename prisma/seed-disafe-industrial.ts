import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🏭 Iniciando Seed Industrial DISAFE...')

  let tenant = await prisma.tenant.findFirst({
    where: { nome: 'DISAFE' }
  })
  
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        nome: 'DISAFE',
        documento: '12.345.678/0001-99',
        status: 'ativo'
      }
    })
  }

  // Limpeza
  console.log('Limpando dados antigos...')
  await prisma.ordemProducao.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.bomItem.deleteMany({ where: { bom: { tenantId: tenant.id } } })
  await prisma.bOM.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.materiaPrima.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.ordemCompra.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.fornecedor.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.lote.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.lead.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.itemVenda.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.venda.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.produto.deleteMany({ where: { tenantId: tenant.id } })
  await prisma.cliente.deleteMany({ where: { tenantId: tenant.id } })

  console.log('🏭 Criando Fornecedores...')
  const fornecedores = [
    { nome: 'Aço Nacional S.A.', cnpj: '00.111.222/0001-33', prazoMedioDias: 15, notaQualidade: 95 },
    { nome: 'Componentes Eletrônicos Globais', cnpj: '33.444.555/0001-66', prazoMedioDias: 30, notaQualidade: 88 },
    { nome: 'Plásticos e Borrachas BR', cnpj: '77.888.999/0001-00', prazoMedioDias: 10, notaQualidade: 98 }
  ]
  const dbFornecedores = await Promise.all(fornecedores.map(f => prisma.fornecedor.create({ data: { ...f, tenantId: tenant.id } })))

  console.log('🏭 Criando Matérias-Primas...')
  const materias = [
    { nome: 'Tubo de Aço Carbono', unidadeMedida: 'kg', custoUnitario: 12.5, estoqueAtual: 5000, estoqueMinimo: 1000 },
    { nome: 'Placa Lógica Wi-Fi', unidadeMedida: 'un', custoUnitario: 85.0, estoqueAtual: 200, estoqueMinimo: 500 },
    { nome: 'Parafusos Industriais M8', unidadeMedida: 'un', custoUnitario: 0.5, estoqueAtual: 15000, estoqueMinimo: 5000 },
    { nome: 'Mecanismo Mola Aérea', unidadeMedida: 'un', custoUnitario: 45.0, estoqueAtual: 300, estoqueMinimo: 100 }
  ]
  const dbMaterias = await Promise.all(materias.map(m => prisma.materiaPrima.create({ data: { ...m, tenantId: tenant.id } })))

  console.log('🏭 Criando Produtos (Barras, Fechaduras, Molas)...')
  const produtos = [
    { nome: 'Barra Antipânico Push', categoria: 'Porta Corta-Fogo', preco: 850, custo: 350, margem: 58, estoqueAtual: 120, estoqueMinimo: 50, mediaVendaMensal: 300, demandaPrevista30d: 350, risco: 'baixo' },
    { nome: 'Barra Antipânico Touch', categoria: 'Porta Corta-Fogo', preco: 1100, custo: 450, margem: 59, estoqueAtual: 45, estoqueMinimo: 80, mediaVendaMensal: 150, demandaPrevista30d: 180, risco: 'alto' },
    { nome: 'Mola Hidráulica Aérea', categoria: 'Acessórios', preco: 250, custo: 90, margem: 64, estoqueAtual: 500, estoqueMinimo: 200, mediaVendaMensal: 800, demandaPrevista30d: 750, risco: 'baixo' },
    { nome: 'Fechadura Eletromagnética 150kg', categoria: 'Sistemas de Segurança', preco: 600, custo: 250, margem: 58, estoqueAtual: 30, estoqueMinimo: 100, mediaVendaMensal: 250, demandaPrevista30d: 280, risco: 'critico' }
  ]
  const dbProdutos = await Promise.all(produtos.map(p => prisma.produto.create({ data: { ...p, tenantId: tenant.id } })))

  console.log('🏭 Criando BOM (Listas de Materiais)...')
  // Para a Barra Antipânico Push (index 0)
  const bomBarraPush = await prisma.bOM.create({
    data: {
      tenantId: tenant.id,
      produtoId: dbProdutos[0].id,
      versao: '1.0',
      itens: {
        create: [
          { materiaPrimaId: dbMaterias[0].id, quantidade: 3.5 }, // 3.5kg aço
          { materiaPrimaId: dbMaterias[2].id, quantidade: 12 }   // 12 parafusos
        ]
      }
    }
  })

  console.log('🏭 Criando Ordens de Produção (PCP)...')
  await prisma.ordemProducao.createMany({
    data: [
      { tenantId: tenant.id, numero: 'OP-001', produtoId: dbProdutos[1].id, quantidade: 200, status: 'em_andamento', prioridade: 'alta' },
      { tenantId: tenant.id, numero: 'OP-002', produtoId: dbProdutos[3].id, quantidade: 150, status: 'planejada', prioridade: 'critica' }
    ]
  })

  console.log('🏭 Criando Ordens de Compra...')
  await prisma.ordemCompra.create({
    data: {
      tenantId: tenant.id,
      fornecedorId: dbFornecedores[1].id,
      numero: 'OC-2026-001',
      valorTotal: 42500, // 500 placas wifi
      status: 'pendente',
      dataPrevisao: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
    }
  })

  console.log('🏭 Criando Clientes CRM (B2B)...')
  const clientes = [
    { nome: 'Construtora Alpha S.A.', cidade: 'São Paulo', score: 95, status: 'ativo', totalComprado: 450000 },
    { nome: 'Hospital São Lucas', cidade: 'Rio de Janeiro', score: 88, status: 'ativo', totalComprado: 120000 },
    { nome: 'Grupo Prime Engenharia', cidade: 'Belo Horizonte', score: 92, status: 'ativo', totalComprado: 380000 },
    { nome: 'Condomínio Platinum', cidade: 'Curitiba', score: 65, status: 'risco', totalComprado: 45000 },
    { nome: 'Universidade Metropolitana', cidade: 'Brasília', score: 75, status: 'ativo', totalComprado: 210000 }
  ]
  const dbClientes = await Promise.all(clientes.map(c => prisma.cliente.create({ data: { ...c, tenantId: tenant.id } })))

  console.log('🏭 Criando Leads (CRM)...')
  await prisma.lead.createMany({
    data: [
      { tenantId: tenant.id, nome: 'Comprador Tech Construtora', empresa: 'Tech Construções', origem: 'LinkedIn', status: 'novo', temperatura: 'quente' },
      { tenantId: tenant.id, nome: 'Sindico Edifício Torre', empresa: 'Edifício Torre', origem: 'Site B2B', status: 'qualificado', temperatura: 'morna' }
    ]
  })

  console.log('✅ Seed Industrial finalizado com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
