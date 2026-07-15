/**
 * SEED — Magister ERP IA (MVP 1.0)
 * Popula o banco com dados reais de demonstração para o Tenant padrão.
 * Execute: npx tsx prisma/seed.ts
 */

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const TENANT_ID = "tenant_default_001"

async function main() {
  console.log("🌱 Iniciando seed do banco de dados...")

  // 1. Limpar dados existentes do tenant (Cascade fará o resto)
  await prisma.tenant.deleteMany({ where: { id: TENANT_ID } })

  // 2. Criar Tenant
  const tenant = await prisma.tenant.create({
    data: {
      id: TENANT_ID,
      nome: "Magister Distribuidora Ltda",
      documento: "12.345.678/0001-99",
      planoId: "mvp",
      status: "ativo",
    },
  })
  console.log(`✅ Tenant criado: ${tenant.nome}`)

  // 3. Criar Usuário Admin
  await prisma.user.create({
    data: {
      tenantId: TENANT_ID,
      nome: "Administrador",
      email: "admin@magister.com",
      role: "admin",
    },
  })

  // 4. Técnicos
  const tecnicos = await Promise.all([
    prisma.tecnico.create({ data: { tenantId: TENANT_ID, nome: "Carlos Mendez", email: "carlos@magister.com", telefone: "(11) 99001-2233", status: "ativo" } }),
    prisma.tecnico.create({ data: { tenantId: TENANT_ID, nome: "Ana Paula Souza", email: "ana@magister.com", telefone: "(11) 99445-6677", status: "ativo" } }),
  ])
  console.log(`✅ ${tecnicos.length} técnicos criados`)

  // 5. Produtos
  const produtos = await Promise.all([
    prisma.produto.create({ data: { tenantId: TENANT_ID, nome: "Nobreak APC 1500VA", categoria: "Eletrônicos", preco: 899.90, custo: 550.00, margem: 38.9, estoqueAtual: 12, estoqueMinimo: 5, status: "ativo" } }),
    prisma.produto.create({ data: { tenantId: TENANT_ID, nome: "Switch 24 Portas", categoria: "Redes", preco: 1450.00, custo: 890.00, margem: 38.6, estoqueAtual: 3, estoqueMinimo: 5, status: "ativo" } }),
  ])
  console.log(`✅ ${produtos.length} produtos criados`)

  // 6. Clientes, Unidades, Endereços, Área Técnica, Ativos e Contatos
  const cli1 = await prisma.cliente.create({ data: { tenantId: TENANT_ID, nome: "Tech Solutions SP", razaoSocial: "Tech Solutions SP Ltda", cnpjCpf: "12.345.678/0001-90", segmento: "tecnologia", status: "ativo" } })
  const cli2 = await prisma.cliente.create({ data: { tenantId: TENANT_ID, nome: "Construtora Horizonte", razaoSocial: "Construtora Horizonte S.A.", segmento: "construção", status: "ativo" } })
  
  // Unidades
  const uni1 = await prisma.unidade.create({ data: { tenantId: TENANT_ID, clienteId: cli1.id, nome: "Matriz", cnpj: "12.345.678/0001-90" } })
  const uni2 = await prisma.unidade.create({ data: { tenantId: TENANT_ID, clienteId: cli2.id, nome: "Filial 1" } })

  // Endereços
  const end1 = await prisma.endereco.create({ data: { tenantId: TENANT_ID, unidadeId: uni1.id, tipo: "comercial", logradouro: "Av. Paulista", numero: "1500", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" } })
  const end2 = await prisma.endereco.create({ data: { tenantId: TENANT_ID, unidadeId: uni2.id, tipo: "comercial", logradouro: "Rua do Ouro", numero: "100", bairro: "Centro", cidade: "Campinas", uf: "SP" } })

  // Contatos
  await prisma.contato.create({ data: { tenantId: TENANT_ID, clienteId: cli1.id, nome: "Fernando Costa", telefone: "11999999999" } })
  await prisma.contato.create({ data: { tenantId: TENANT_ID, clienteId: cli2.id, nome: "Marcos", telefone: "11888888888" } })

  // Area Tecnica e Ativo
  const area1 = await prisma.areaTecnica.create({ data: { tenantId: TENANT_ID, enderecoId: end1.id, nome: "Sala Servidores" } })
  const ativo1 = await prisma.ativo.create({ data: { tenantId: TENANT_ID, areaTecnicaId: area1.id, nome: "Servidor Dell T140", marca: "Dell", modelo: "T140" } })

  // Contrato
  const contrato1 = await prisma.contrato.create({ data: { tenantId: TENANT_ID, clienteId: cli1.id, titulo: "SLA Anual", valor: 1200, status: "ativo", periodicidade: "mensal", dataInicio: new Date(), dataFim: new Date() } })

  console.log(`✅ 2 clientes com unidades e infraestrutura criados`)

  // 7. Ordens de Serviço
  await prisma.ordemServico.create({
    data: {
      tenantId: TENANT_ID,
      numeroOS: 1001,
      clienteId: cli1.id,
      unidadeId: uni1.id,
      enderecoId: end1.id,
      tecnicoId: tecnicos[0].id,
      contratoId: contrato1.id,
      ativoId: ativo1.id,
      titulo: "Manutenção preventiva servidor",
      tipoAtendimento: "preventiva",
      status: "agendada",
      dataAgendada: new Date()
    }
  })
  console.log("✅ Ordem de Serviço criada")

  // 8. Vendas
  await prisma.venda.create({
    data: {
      tenantId: TENANT_ID,
      clienteId: cli1.id,
      vendedor: "Carlos",
      total: produtos[0].preco,
      status: "fechado",
      metodoPagamento: "pix",
      itens: {
        create: [{ tenantId: TENANT_ID, produtoId: produtos[0].id, quantidade: 1, preco: produtos[0].preco }]
      }
    }
  })
  console.log(`✅ Venda criada`)

  console.log("🎉 Seed concluído com sucesso!")
}

main()
  .catch((e) => {
    console.error("❌ Erro durante o seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
