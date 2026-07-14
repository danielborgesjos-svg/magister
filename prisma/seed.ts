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

  // 1. Limpar dados existentes do tenant (ordem importa por FK)
  await prisma.agentLog.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.acaoPendenteIA.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.itemVenda.deleteMany({ where: { venda: { tenantId: TENANT_ID } } })
  await prisma.osExecucao.deleteMany({ where: { ordemServico: { tenantId: TENANT_ID } } })
  await prisma.ordemServico.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.lancamentoFinanceiro.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.venda.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.negociacao.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.tarefa.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.agendamento.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.integracao.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.conversaWA.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.campanha.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.fluxoIA.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.contato.deleteMany({ where: { cliente: { tenantId: TENANT_ID } } })
  await prisma.endereco.deleteMany({ where: { cliente: { tenantId: TENANT_ID } } })
  await prisma.equipamento.deleteMany({ where: { cliente: { tenantId: TENANT_ID } } })
  await prisma.contrato.deleteMany({ where: { cliente: { tenantId: TENANT_ID } } })
  await prisma.tecnico.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.produto.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.cliente.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.user.deleteMany({ where: { tenantId: TENANT_ID } })
  await prisma.tenant.deleteMany({ where: { id: TENANT_ID } })

  // 2. Criar Tenant
  const tenant = await prisma.tenant.create({
    data: {
      id: TENANT_ID,
      nome: "Magister Distribuidora Ltda",
      documento: "12.345.678/0001-99",
      plano: "pro",
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
    prisma.tecnico.create({ data: { tenantId: TENANT_ID, nome: "Roberto Lima", email: "roberto@magister.com", telefone: "(11) 98881-3344", status: "ativo" } }),
  ])
  console.log(`✅ ${tecnicos.length} técnicos criados`)

  // 5. Produtos
  const produtosData = [
    { nome: "Nobreak APC 1500VA", categoria: "Eletrônicos", preco: 899.90, custo: 550.00, margem: 38.9, estoqueAtual: 12, estoqueMinimo: 5, mediaVendaMensal: 8, scorePotencial: 85, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "Switch 24 Portas Cisco", categoria: "Redes", preco: 1450.00, custo: 890.00, margem: 38.6, estoqueAtual: 3, estoqueMinimo: 5, mediaVendaMensal: 4, scorePotencial: 70, risco: "baixo", status: "ativo", diasParado: 0 },
    { nome: "Cabo Cat6 (Rolo 305m)", categoria: "Redes", preco: 289.90, custo: 160.00, margem: 44.8, estoqueAtual: 25, estoqueMinimo: 10, mediaVendaMensal: 15, scorePotencial: 92, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "Câmera IP Hikvision 4MP", categoria: "Segurança", preco: 349.00, custo: 195.00, margem: 44.1, estoqueAtual: 0, estoqueMinimo: 8, mediaVendaMensal: 10, scorePotencial: 78, risco: "ruptura", status: "ativo", diasParado: 0 },
    { nome: "Roteador WiFi 6 TP-Link", categoria: "Redes", preco: 599.00, custo: 320.00, margem: 46.6, estoqueAtual: 18, estoqueMinimo: 6, mediaVendaMensal: 9, scorePotencial: 88, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "Patch Panel 24 Portas", categoria: "Infraestrutura", preco: 189.90, custo: 95.00, margem: 50.0, estoqueAtual: 40, estoqueMinimo: 5, mediaVendaMensal: 3, scorePotencial: 55, risco: "excesso", status: "ativo", diasParado: 0 },
    { nome: "Servidor Dell PowerEdge T140", categoria: "Servidores", preco: 8900.00, custo: 6200.00, margem: 30.3, estoqueAtual: 2, estoqueMinimo: 2, mediaVendaMensal: 1, scorePotencial: 65, risco: "baixo", status: "ativo", diasParado: 0 },
    { nome: "Monitor LG 27\" 4K IPS", categoria: "Periféricos", preco: 1890.00, custo: 1100.00, margem: 41.8, estoqueAtual: 6, estoqueMinimo: 3, mediaVendaMensal: 4, scorePotencial: 75, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "Teclado Mecânico Redragon", categoria: "Periféricos", preco: 299.90, custo: 150.00, margem: 50.0, estoqueAtual: 22, estoqueMinimo: 8, mediaVendaMensal: 6, scorePotencial: 60, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "SSD Kingston 480GB SATA", categoria: "Armazenamento", preco: 219.90, custo: 120.00, margem: 45.4, estoqueAtual: 30, estoqueMinimo: 10, mediaVendaMensal: 18, scorePotencial: 95, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "Memória RAM DDR4 16GB Kingston", categoria: "Componentes", preco: 379.90, custo: 210.00, margem: 44.7, estoqueAtual: 1, estoqueMinimo: 5, mediaVendaMensal: 12, scorePotencial: 90, risco: "ruptura", status: "ativo", diasParado: 0 },
    { nome: "Headset Logitech H390", categoria: "Periféricos", preco: 189.00, custo: 98.00, margem: 48.1, estoqueAtual: 50, estoqueMinimo: 10, mediaVendaMensal: 2, scorePotencial: 35, risco: "excesso", status: "parado", diasParado: 112 },
    { nome: "Impressora HP LaserJet M404", categoria: "Impressão", preco: 1299.00, custo: 820.00, margem: 36.9, estoqueAtual: 4, estoqueMinimo: 2, mediaVendaMensal: 3, scorePotencial: 68, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "Gabinete Corsair iCUE 4000X", categoria: "Componentes", preco: 799.00, custo: 480.00, margem: 39.9, estoqueAtual: 8, estoqueMinimo: 3, mediaVendaMensal: 2, scorePotencial: 50, risco: "ok", status: "ativo", diasParado: 0 },
    { nome: "Cabo HDMI 4K 2m (kit 10un)", categoria: "Acessórios", preco: 79.90, custo: 35.00, margem: 56.2, estoqueAtual: 0, estoqueMinimo: 20, mediaVendaMensal: 25, scorePotencial: 80, risco: "ruptura", status: "ativo", diasParado: 0 },
  ]

  const produtos = await Promise.all(
    produtosData.map(p => prisma.produto.create({ data: { tenantId: TENANT_ID, ...p } }))
  )
  console.log(`✅ ${produtos.length} produtos criados`)

  // 6. Clientes
  const clientesData = [
    { nome: "Tech Solutions SP", empresa: "Tech Solutions SP Ltda", segmento: "tecnologia", cidade: "São Paulo", score: 92, status: "ativo", totalComprado: 48500, razaoSocial: "Tech Solutions SP Ltda", cnpjCpf: "12.345.678/0001-90" },
    { nome: "Construtora Horizonte", empresa: "Construtora Horizonte S.A.", segmento: "construção", cidade: "Campinas", score: 78, status: "ativo", totalComprado: 32100, razaoSocial: "Construtora Horizonte SA" },
    { nome: "Supermercado Central", empresa: "Supermercado Central Ltda", segmento: "varejo", cidade: "Guarulhos", score: 65, status: "ativo", totalComprado: 19800, cnpjCpf: "98.765.432/0001-11" },
    { nome: "Clínica Saúde Total", empresa: "Clínica Saúde Total", segmento: "saúde", cidade: "São Paulo", score: 88, status: "ativo", totalComprado: 27400 },
    { nome: "Escritório Advocacia Silva", empresa: "Silva & Associados OAB", segmento: "serviços", cidade: "São Paulo", score: 55, status: "lead", totalComprado: 0 },
    { nome: "Rodrigo Ferreira", empresa: null, segmento: "varejo", cidade: "Santo André", score: 45, status: "inativo", totalComprado: 4200 },
    { nome: "Indústria Metal Brasil", empresa: "Metal Brasil Fundição", segmento: "indústria", cidade: "São Bernardo", score: 82, status: "ativo", totalComprado: 61000, cnpjCpf: "11.222.333/0001-44" },
    { nome: "Colégio Futuro", empresa: "Colégio Futuro Educação", segmento: "educação", cidade: "Osasco", score: 70, status: "ativo", totalComprado: 15600 },
    { nome: "Farmácia Bem Estar", empresa: "Bem Estar Farmácia Ltda", segmento: "saúde", cidade: "Diadema", score: 60, status: "lead", totalComprado: 0 },
    { nome: "Transportadora JR", empresa: "JR Transportes e Logística", segmento: "logística", cidade: "São Paulo", score: 75, status: "ativo", totalComprado: 22300 },
    { nome: "Marina Oliveira", empresa: null, segmento: "varejo", cidade: "São Paulo", score: 40, status: "inativo", totalComprado: 1800 },
    { nome: "Academia Força Total", empresa: "Força Total Academia", segmento: "esporte", cidade: "São Paulo", score: 66, status: "ativo", totalComprado: 8900 },
  ]

  const clientes = await Promise.all(
    clientesData.map(c => prisma.cliente.create({ data: { tenantId: TENANT_ID, ...c } }))
  )
  console.log(`✅ ${clientes.length} clientes criados`)

  // 7. Contatos para clientes ativos
  await prisma.contato.create({ data: { clienteId: clientes[0].id, nome: "Fernando Costa", setor: "TI", telefone: "(11) 3001-5500", email: "f.costa@techsp.com" } })
  await prisma.contato.create({ data: { clienteId: clientes[0].id, nome: "Patricia Lima", setor: "Compras", telefone: "(11) 3001-5501", email: "p.lima@techsp.com" } })
  await prisma.contato.create({ data: { clienteId: clientes[3].id, nome: "Dr. Marco Antônio", setor: "Diretoria", telefone: "(11) 98765-4321", email: "marco@saudetotal.com" } })
  await prisma.contato.create({ data: { clienteId: clientes[6].id, nome: "José Carlos", setor: "Compras", telefone: "(11) 4401-2200", whatsapp: "11944012200" } })

  // 8. Endereços para clientes
  const end1 = await prisma.endereco.create({ data: { clienteId: clientes[0].id, tipo: "comercial", cep: "01310-100", logradouro: "Av. Paulista", numero: "1500", bairro: "Bela Vista", cidade: "São Paulo", uf: "SP" } })
  const end6 = await prisma.endereco.create({ data: { clienteId: clientes[6].id, tipo: "comercial", cep: "09730-000", logradouro: "Rua das Indústrias", numero: "300", bairro: "Centro", cidade: "São Bernardo", uf: "SP" } })

  // 9. Equipamentos
  const equip1 = await prisma.equipamento.create({ data: { clienteId: clientes[0].id, nome: "Servidor Dell PowerEdge", marca: "Dell", modelo: "T140", numeroSerie: "SV001234", dataInstalacao: new Date("2023-03-15") } })

  // 10. Contratos
  const contrato1 = await prisma.contrato.create({ data: { clienteId: clientes[0].id, titulo: "Contrato de Manutenção Anual", valor: 1200, periodicidade: "mensal", status: "ativo", dataInicio: new Date("2024-01-01"), dataFim: new Date("2024-12-31") } })

  // 11. Ordens de Serviço
  await Promise.all([
    prisma.ordemServico.create({ data: { tenantId: TENANT_ID, numeroOS: 1001, clienteId: clientes[0].id, enderecoId: end1.id, tecnicoId: tecnicos[0].id, contratoId: contrato1.id, equipamentoId: equip1.id, titulo: "Manutenção preventiva servidor", tipoAtendimento: "preventiva", status: "agendada", dataAgendada: new Date(Date.now() + 86400000 * 2) } }),
    prisma.ordemServico.create({ data: { tenantId: TENANT_ID, numeroOS: 1002, clienteId: clientes[6].id, enderecoId: end6.id, tecnicoId: tecnicos[1].id, titulo: "Instalação rede cabeada", tipoAtendimento: "instalação", status: "em_andamento", dataAgendada: new Date() } }),
    prisma.ordemServico.create({ data: { tenantId: TENANT_ID, numeroOS: 1003, clienteId: clientes[3].id, enderecoId: await prisma.endereco.create({ data: { clienteId: clientes[3].id, tipo: "comercial", cep: "01420-000", logradouro: "Al. Santos", numero: "500", bairro: "Cerqueira César", cidade: "São Paulo", uf: "SP" } }).then(e => e.id), tecnicoId: tecnicos[2].id, titulo: "Substituição de câmeras IP", tipoAtendimento: "corretiva", status: "finalizada", dataAgendada: new Date(Date.now() - 86400000 * 3) } }),
  ])
  console.log("✅ 3 Ordens de Serviço criadas")

  // 12. Vendas (últimos 3 meses)
  const agora = new Date()
  const vendas = []
  const vendaClientePairs = [
    [clientes[0].id, produtos[0].id, produtos[4].id],
    [clientes[6].id, produtos[6].id],
    [clientes[3].id, produtos[3].id, produtos[9].id],
    [clientes[2].id, produtos[8].id],
    [clientes[7].id, produtos[2].id],
    [clientes[9].id, produtos[1].id],
    [clientes[0].id, produtos[10].id, produtos[9].id],
    [clientes[3].id, produtos[4].id],
    [clientes[6].id, produtos[0].id, produtos[2].id],
  ]

  for (let i = 0; i < vendaClientePairs.length; i++) {
    const [clienteId, ...produtoIds] = vendaClientePairs[i]
    const diasAtras = Math.floor(Math.random() * 90)
    const dataVenda = new Date(agora.getTime() - diasAtras * 86400000)
    
    const itensVenda = produtoIds.map(pid => {
      const prod = produtos.find(p => p.id === pid)!
      return { produtoId: pid, quantidade: Math.ceil(Math.random() * 3), preco: prod.preco }
    })
    const total = itensVenda.reduce((acc, item) => acc + item.preco * item.quantidade, 0)

    const venda = await prisma.venda.create({
      data: {
        tenantId: TENANT_ID,
        clienteId: clienteId as string,
        vendedor: ["Carlos Mendez", "Ana Paula", "Roberto Lima"][i % 3],
        total,
        status: "fechado",
        metodoPagamento: ["pix", "cartao_credito", "boleto"][i % 3],
        createdAt: dataVenda,
        itens: { create: itensVenda }
      }
    })
    vendas.push(venda)
  }
  console.log(`✅ ${vendas.length} vendas criadas`)

  // 13. Lançamentos Financeiros (6 meses)
  const lancamentos = [
    // Receitas
    { descricao: "Contrato Mensal - Tech Solutions SP", valor: 1200, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 5) },
    { descricao: "Venda Equipamentos - Indústria Metal Brasil", valor: 8900, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 8) },
    { descricao: "Serviço de TI - Clínica Saúde Total", valor: 3400, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 12) },
    { descricao: "Venda Nobreak e Roteadores - Colégio Futuro", valor: 5600, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 15) },
    { descricao: "Manutenção Preventiva - Transportadora JR", valor: 2300, tipo: "receita", status: "pendente", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 20) },
    { descricao: "Venda SSD e Memórias - Supermercado Central", valor: 1980, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 18) },
    { descricao: "Projeto Rede Estruturada - Metal Brasil", valor: 14500, tipo: "receita", status: "pendente", dataVenc: new Date(agora.getFullYear(), agora.getMonth() + 1, 5) },
    // Mês anterior - receitas
    { descricao: "Contrato Mensal - Tech Solutions SP", valor: 1200, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 5) },
    { descricao: "Venda Câmeras - Academia Força Total", valor: 4200, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 14) },
    { descricao: "Suporte Técnico - Farmácia Bem Estar", valor: 980, tipo: "receita", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 22) },
    // Despesas
    { descricao: "Aluguel Escritório", valor: 3800, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 1) },
    { descricao: "Folha de Pagamento - Jun", valor: 12500, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 5) },
    { descricao: "Compra de Estoque - Fornecedor TechDist", valor: 18900, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 10) },
    { descricao: "Internet e Telefonia", valor: 650, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 15) },
    { descricao: "Software ERP (Licença Anual)", valor: 1890, tipo: "despesa", status: "pendente", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 25) },
    { descricao: "Marketing Digital - Agência", valor: 2200, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth(), 12) },
    // Mês anterior - despesas
    { descricao: "Aluguel Escritório", valor: 3800, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 1) },
    { descricao: "Folha de Pagamento - Mai", valor: 12500, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 5) },
    { descricao: "Compra Estoque - Distribuidora XTech", valor: 9800, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 8) },
    { descricao: "Imposto DAS Simples Nacional", valor: 4320, tipo: "despesa", status: "pago", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 20) },
    // Vencidos
    { descricao: "NF Serviços - Escritório Advocacia Silva", valor: 2500, tipo: "receita", status: "vencido", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 10) },
    { descricao: "Manutenção AC - Construtora Horizonte", valor: 1800, tipo: "receita", status: "vencido", dataVenc: new Date(agora.getFullYear(), agora.getMonth() - 1, 15) },
  ]

  await Promise.all(
    lancamentos.map(l => prisma.lancamentoFinanceiro.create({ data: { tenantId: TENANT_ID, ...l } }))
  )
  console.log(`✅ ${lancamentos.length} lançamentos financeiros criados`)

  // 14. Negociações (Pipeline de Vendas)
  const negociacoes = [
    { clienteId: clientes[4].id, vendedor: "Carlos Mendez", valor: 8500, status: "proposta", probabilidade: 60, tags: "urgente,ti", previsaoFechamento: new Date(agora.getTime() + 86400000 * 15) },
    { clienteId: clientes[8].id, vendedor: "Ana Paula Souza", valor: 3200, status: "negociacao", probabilidade: 45, tags: "farmácia,câmeras", previsaoFechamento: new Date(agora.getTime() + 86400000 * 30) },
    { clienteId: clientes[2].id, vendedor: "Carlos Mendez", valor: 12000, status: "apresentacao", probabilidade: 70, previsaoFechamento: new Date(agora.getTime() + 86400000 * 7) },
    { clienteId: clientes[1].id, vendedor: "Roberto Lima", valor: 45000, status: "novo_lead", probabilidade: 25, tags: "grande_conta", previsaoFechamento: new Date(agora.getTime() + 86400000 * 60) },
    { clienteId: clientes[11].id, vendedor: "Ana Paula Souza", valor: 6800, status: "proposta", probabilidade: 55, previsaoFechamento: new Date(agora.getTime() + 86400000 * 20) },
  ]

  await Promise.all(
    negociacoes.map(n => prisma.negociacao.create({ data: { tenantId: TENANT_ID, ...n } }))
  )
  console.log(`✅ ${negociacoes.length} negociações criadas`)

  // 15. Tarefas
  const tarefas = [
    { titulo: "Ligar para Tech Solutions SP", descricao: "Renovar contrato de manutenção anual", responsavel: "Carlos Mendez", prioridade: "alta", status: "a_fazer", prazo: new Date(agora.getTime() + 86400000 * 3), clienteId: clientes[0].id, origem: "ia" },
    { titulo: "Enviar proposta rede estruturada", descricao: "Proposta completa para Construtora Horizonte", responsavel: "Roberto Lima", prioridade: "alta", status: "a_fazer", prazo: new Date(agora.getTime() + 86400000 * 5), clienteId: clientes[1].id },
    { titulo: "Follow-up Clínica Saúde Total", descricao: "Verificar aprovação orçamento câmeras adicionais", responsavel: "Ana Paula Souza", prioridade: "media", status: "em_progresso", prazo: new Date(agora.getTime() + 86400000 * 1), clienteId: clientes[3].id },
    { titulo: "Repor estoque Câmera IP Hikvision", descricao: "Ruptura detectada. Contatar fornecedor Hikvision Brasil", responsavel: "Carlos Mendez", prioridade: "urgente", status: "a_fazer", prazo: new Date(agora.getTime() + 86400000 * 1), origem: "ia" },
    { titulo: "Cobrar NF vencida - Advocacia Silva", descricao: "Fatura de R$ 2.500 vencida há 20 dias", responsavel: "Ana Paula Souza", prioridade: "alta", status: "a_fazer", prazo: new Date(agora.getTime() - 86400000 * 2), clienteId: clientes[4].id, origem: "ia" },
    { titulo: "Atualizar catálogo de produtos no site", responsavel: "Roberto Lima", prioridade: "baixa", status: "a_fazer" },
    { titulo: "Reunião de planejamento trimestral", responsavel: "Carlos Mendez", prioridade: "media", status: "concluida", prazo: new Date(agora.getTime() - 86400000 * 5) },
  ]

  await Promise.all(
    tarefas.map(t => prisma.tarefa.create({ data: { tenantId: TENANT_ID, ...t } }))
  )
  console.log(`✅ ${tarefas.length} tarefas criadas`)

  // 16. Agendamentos
  const agendamentos = [
    { titulo: "Reunião - Renovação Contrato Tech Solutions", descricao: "Revisão de escopo e negociação de valores", data: new Date(agora.getTime() + 86400000 * 2), duracao: 90, tipo: "reuniao", status: "agendado", responsavel: "Carlos Mendez", clienteId: clientes[0].id, tenantId: TENANT_ID },
    { titulo: "Apresentação Proposta Construtora Horizonte", descricao: "Apresentação técnica e comercial", data: new Date(agora.getTime() + 86400000 * 5), duracao: 120, tipo: "apresentacao", status: "agendado", responsavel: "Roberto Lima", clienteId: clientes[1].id, tenantId: TENANT_ID },
    { titulo: "Treinamento interno - NR-35", descricao: "Treinamento de segurança para técnicos", data: new Date(agora.getTime() + 86400000 * 7), duracao: 240, tipo: "interno", status: "agendado", responsavel: "Ana Paula Souza", tenantId: TENANT_ID },
    { titulo: "Call de onboarding - Farmácia Bem Estar", data: new Date(agora.getTime() + 86400000 * 1), duracao: 30, tipo: "call", status: "agendado", responsavel: "Ana Paula Souza", clienteId: clientes[8].id, tenantId: TENANT_ID },
    { titulo: "Visita técnica - Academia Força Total", data: new Date(agora.getTime() - 86400000 * 1), duracao: 60, tipo: "visita", status: "realizado", responsavel: "Carlos Mendez", clienteId: clientes[11].id, tenantId: TENANT_ID },
  ]

  await Promise.all(
    agendamentos.map(a => prisma.agendamento.create({ data: a }))
  )
  console.log(`✅ ${agendamentos.length} agendamentos criados`)

  // 17. Campanhas
  await Promise.all([
    prisma.campanha.create({ data: { tenantId: TENANT_ID, nome: "Reativação Clientes Inativos Jun/2025", descricao: "Campanha de recuperação com desconto de 15%", status: "pronta", canal: "whatsapp", contatos: 2, criadaPorIA: true, receitaEsperada: 6000 } }),
    prisma.campanha.create({ data: { tenantId: TENANT_ID, nome: "Black Friday Antecipada - Nobreaks e Roteadores", descricao: "Oferta especial dos produtos mais vendidos", status: "rascunho", canal: "whatsapp", contatos: 0, criadaPorIA: false, receitaEsperada: 25000 } }),
    prisma.campanha.create({ data: { tenantId: TENANT_ID, nome: "Promoção Liquidação - Headsets", descricao: "Liquidar os 50 headsets parados em estoque", status: "enviada", canal: "whatsapp", contatos: 12, criadaPorIA: true, receitaGerada: 2850, receitaEsperada: 9450 } }),
  ])
  console.log("✅ Campanhas criadas")

  // 18. Fluxos IA
  await prisma.fluxoIA.create({
    data: {
      tenantId: TENANT_ID,
      nome: "Qualificação Lead Novo",
      descricao: "Quando novo lead entra, a IA qualifica e manda mensagem de boas-vindas",
      ativo: true,
      gatilho: "novo_lead",
      disparos: 34,
      resolucoes: 28,
      nodesJson: JSON.stringify([{ id: "1", tipo: "gatilho", label: "Novo Lead" }, { id: "2", tipo: "ia_mensagem", label: "Boas-vindas IA" }])
    }
  })
  await prisma.fluxoIA.create({
    data: {
      tenantId: TENANT_ID,
      nome: "Alerta Ruptura de Estoque",
      descricao: "Monitora estoque e cria tarefa de reposição automaticamente",
      ativo: true,
      gatilho: "estoque_ruptura",
      disparos: 8,
      resolucoes: 7,
      nodesJson: JSON.stringify([{ id: "1", tipo: "gatilho", label: "Estoque Baixo" }, { id: "2", tipo: "criar_tarefa", label: "Tarefa Reposição" }])
    }
  })
  console.log("✅ Fluxos IA criados")

  // 19. Ações Pendentes IA (Centro de Aprovação)
  await Promise.all([
    prisma.acaoPendenteIA.create({
      data: {
        tenantId: TENANT_ID,
        agente: "Agente Comercial",
        intencao: "campanha_criar",
        descricao: "Criar campanha de WhatsApp para os 2 clientes inativos (Rodrigo Ferreira e Marina Oliveira) com 15% de desconto em SSD e Memória RAM.",
        payloadJson: JSON.stringify({ tipo: "campanha", clienteIds: ["rodrigo", "marina"], desconto: 15, produtos: ["SSD Kingston", "RAM DDR4"] }),
        status: "pendente"
      }
    }),
    prisma.acaoPendenteIA.create({
      data: {
        tenantId: TENANT_ID,
        agente: "Agente de Estoque",
        intencao: "produto_faltar",
        descricao: "Emitir pedido de compra para Câmera IP Hikvision (0 un) e Cabo HDMI (0 un) e Memória RAM DDR4 (1 un) junto ao fornecedor TechDist.",
        payloadJson: JSON.stringify({ tipo: "pedido_compra", fornecedor: "TechDist", itens: [{ produto: "Câmera IP Hikvision", qtd: 20 }, { produto: "Cabo HDMI 4K", qtd: 50 }, { produto: "Memória RAM DDR4", qtd: 10 }] }),
        status: "pendente"
      }
    }),
    prisma.acaoPendenteIA.create({
      data: {
        tenantId: TENANT_ID,
        agente: "Agente Financeiro",
        intencao: "financeiro_resultado",
        descricao: "Enviar lembrete automático de cobrança via WhatsApp para Escritório Advocacia Silva (R$ 2.500 vencido) e Construtora Horizonte (R$ 1.800 vencido).",
        payloadJson: JSON.stringify({ tipo: "cobranca_automatica", clientes: ["Advocacia Silva", "Construtora Horizonte"], totalVencido: 4300 }),
        status: "pendente"
      }
    }),
  ])
  console.log("✅ 3 Ações Pendentes IA criadas (Centro de Aprovação)")

  // 20. Agent Logs (Histórico de ações IA)
  await Promise.all([
    prisma.agentLog.create({ data: { tenantId: TENANT_ID, sessionId: "sess_001", mensagem: "Analisar estoque crítico", agente: "Agente de Estoque", acao: "consultar_estoque", entidades: JSON.stringify(["Câmera IP Hikvision"]), resultado: JSON.stringify({ rupturas: 3 }), sucesso: true } }),
    prisma.agentLog.create({ data: { tenantId: TENANT_ID, sessionId: "sess_001", mensagem: "Venda PDV finalizada com sucesso", agente: "Agente Comercial", acao: "registrar_venda", entidades: JSON.stringify(["Nobreak APC", "Roteador WiFi 6"]), resultado: JSON.stringify({ total: 1499.80, vendaId: "vnd_001" }), sucesso: true } }),
    prisma.agentLog.create({ data: { tenantId: TENANT_ID, sessionId: "sess_002", mensagem: "Gerar relatório financeiro do mês", agente: "Agente Financeiro", acao: "gerar_relatorio", entidades: JSON.stringify(["junho/2025"]), resultado: JSON.stringify({ receitas: 37380, despesas: 39040 }), sucesso: true } }),
  ])
  console.log("✅ Logs de IA criados")

  console.log("\n🎉 Seed concluído com sucesso!")
  console.log(`   Tenant: ${tenant.nome} (ID: ${TENANT_ID})`)
  console.log(`   Produtos: ${produtos.length} | Clientes: ${clientes.length} | Vendas: ${vendas.length}`)
}

main()
  .catch(e => { console.error("❌ Erro no seed:", e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
