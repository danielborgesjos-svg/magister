import prisma from '../lib/prisma'

async function main() {
  console.log('Seeding Rabisco tenant...')

  // 1. Create tenant
  const tenant = await prisma.tenant.upsert({
    where: { id: 'tenant_rabisco_001' },
    update: {},
    create: {
      id: 'tenant_rabisco_001',
      nome: 'Rabisco Arquitetura',
      documento: '00.000.000/0001-00',
      status: 'ativo',
    }
  })

  // 2. Create admin user
  await prisma.user.upsert({
    where: { email: 'admin@rabisco.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Admin Rabisco',
      email: 'admin@rabisco.com.br',
      senha: 'rabisco2025',
      role: 'admin',
    }
  })

  // 3. Seed demo client
  const cliente = await prisma.cliente.upsert({
    where: { id: 'cliente_rabisco_demo_01' },
    update: {},
    create: {
      id: 'cliente_rabisco_demo_01',
      tenantId: tenant.id,
      nome: 'Mariana Oliveira',
      empresa: 'Família Oliveira',
      cidade: 'São Paulo',
      segmento: 'residencial',
      status: 'ativo',
    }
  })

  // 4. Seed demo project
  const projeto = await prisma.projetoArq.upsert({
    where: { id: 'projeto_rabisco_demo_01' },
    update: {},
    create: {
      id: 'projeto_rabisco_demo_01',
      tenantId: tenant.id,
      clienteId: cliente.id,
      nome: 'Apartamento Oliveira — Reforma Completa',
      tipo: 'residencial',
      imovelNovo: false,
      metragem: 120,
      status: 'execucao',
      etapaAtual: 'Acompanhamento de Obra',
      percentualAvanco: 62,
      orcamentoPrevisto: 380000,
      orcamentoRealizado: 218000,
      responsavelId: null,
      dataInicio: new Date('2025-03-01'),
      prazoEstimado: new Date('2025-10-15'),
    }
  })

  // 5. Seed demo obra
  await prisma.obraArq.upsert({
    where: { id: 'obra_rabisco_demo_01' },
    update: {},
    create: {
      id: 'obra_rabisco_demo_01',
      tenantId: tenant.id,
      projetoId: projeto.id,
      clienteId: cliente.id,
      nome: 'Obra Apartamento Oliveira',
      endereco: 'Rua das Flores, 123 — Jardins, São Paulo/SP',
      metragem: 120,
      status: 'em_execucao',
      percentualFisico: 62,
      percentualFinanceiro: 57,
      orcamentoPrevisto: 280000,
      valorComprometido: 195000,
      valorRealizado: 159600,
      etapaAtual: 'Instalação Elétrica + Preparação Pintura',
      diasAtraso: 2,
      dataInicio: new Date('2025-05-01'),
      prazoEstimado: new Date('2025-10-15'),
    }
  })

  // 6. Seed etapas do projeto
  const etapas = [
    { nome: 'Medição e Levantamento', ordem: 1, status: 'concluida', percentualAvanco: 100 },
    { nome: 'Briefing', ordem: 2, status: 'concluida', percentualAvanco: 100 },
    { nome: 'Layout e Referências', ordem: 3, status: 'concluida', percentualAvanco: 100 },
    { nome: 'Projeto 3D', ordem: 4, status: 'concluida', percentualAvanco: 100 },
    { nome: 'Aprovação do Conceito', ordem: 5, status: 'concluida', percentualAvanco: 100 },
    { nome: 'Detalhamento Técnico', ordem: 6, status: 'concluida', percentualAvanco: 100 },
    { nome: 'Lista de Compras e Orçamento', ordem: 7, status: 'concluida', percentualAvanco: 100 },
    { nome: 'Acompanhamento de Obra', ordem: 8, status: 'em_andamento', percentualAvanco: 62 },
    { nome: 'Entrega Final', ordem: 9, status: 'pendente', percentualAvanco: 0 },
  ]

  for (const etapa of etapas) {
    await prisma.etapaProjetoArq.upsert({
      where: { id: `etapa_${projeto.id}_${etapa.ordem}` },
      update: {},
      create: {
        id: `etapa_${projeto.id}_${etapa.ordem}`,
        tenantId: tenant.id,
        projetoId: projeto.id,
        ...etapa,
      }
    })
  }

  console.log('Rabisco tenant seeded successfully!')
  console.log('Login: admin@rabisco.com.br / rabisco2025')
}

main().catch(console.error).finally(() => prisma.$disconnect())
