import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seed() {
  const tenantId = 'tenant_default_001'

  // Ensure Tenant exists
  await prisma.tenant.upsert({
    where: { id: tenantId },
    update: {},
    create: {
      id: tenantId,
      nome: 'Tenant de Teste',
      documento: '00000000000000'
    }
  })

  const prefixes = ["Construtora", "Viação", "Indústria", "Comércio", "Lojas", "Grupo", "Supermercados", "Logística", "Tecnologia", "Sistemas", "Engenharia"]
  const suffixes = ["Nacional", "Sul", "Brasil", "Alfa", "Beta", "Omega", "Central", "Global", "Regional", "Forte", "Líder"]
  const segments = ["Varejo", "Construção", "Indústria", "Serviços", "Atacado", "Tecnologia", "Logística", "Engenharia Civil"]
  const cities = ["São Paulo", "Rio de Janeiro", "Belo Horizonte", "Curitiba", "Porto Alegre", "Florianópolis", "Brasília", "Salvador", "Recife", "Fortaleza"]
  const statuses = ["ativo", "inativo", "lead"]

  const newClients = []

  for (let i = 0; i < 30; i++) {
    const pre = prefixes[Math.floor(Math.random() * prefixes.length)]
    const suf = suffixes[Math.floor(Math.random() * suffixes.length)]
    const nome = `${pre} ${suf} ${i+1}`
    
    newClients.push({
      nome,
      empresa: nome + " S/A",
      segmento: segments[Math.floor(Math.random() * segments.length)],
      cidade: cities[Math.floor(Math.random() * cities.length)],
      score: Math.floor(Math.random() * 60) + 40,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      totalComprado: Math.floor(Math.random() * 50000),
      tenantId,
      contatos: {
        create: [
          { nome: `Contato ${i+1}`, email: `contato${i}@${nome.replace(/\s/g, '').toLowerCase()}.com`, telefone: '99999-9999', setor: 'Compras', tenantId }
        ]
      },
      unidades: {
        create: [
          {
            nome: 'Sede Principal',
            tenantId,
            enderecos: {
              create: [
                { logradouro: 'Rua Principal', numero: `${Math.floor(Math.random() * 1000)}`, bairro: 'Centro', cidade: 'Cidade Teste', uf: 'SP', tipo: 'Matriz', tenantId }
              ]
            }
          }
        ]
      }
    })
  }

  for (const c of newClients) {
    await prisma.cliente.create({ data: c })
  }
  console.log('30 Clientes criados com sucesso!')
}

seed()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
  })
