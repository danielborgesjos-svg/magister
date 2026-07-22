import { PrismaClient } from "@prisma/client"
import { calcularForecastEMA, PontoHistorico } from "../lib/forecastEngine"

const prisma = new PrismaClient()

async function main() {
  console.log("Iniciando geração de Histórico Simulado e Cálculo de Forecast (POC V2)...")

  // Pegar o tenant padrao
  const tenant = await prisma.tenant.findFirst()
  if (!tenant) throw new Error("Nenhum tenant encontrado.")

  // Garantir que temos um modelo de forecast
  let modelo = await prisma.modeloForecast.findFirst({ where: { tenantId: tenant.id } })
  if (!modelo) {
    modelo = await prisma.modeloForecast.create({
      data: {
        tenantId: tenant.id,
        nomeAlgoritmo: "EMA_SIMPLIFICADA",
        versao: "1.0",
        parametros: JSON.stringify({ alpha: 0.3 })
      }
    })
  }

  const produtos = await prisma.produto.findMany({ where: { tenantId: tenant.id } })
  if (produtos.length === 0) throw new Error("Nenhum produto cadastrado para simular vendas.")

  // 1. Gerar Histórico Mock (12 a 24 meses) para cada produto
  console.log("Gerando vendas históricas falsas...")
  // Em um caso real isso seria lido da tabela ItemVenda. 
  // Para a POC, vamos criar uma array na memoria e alimentar a funcao matematica
  
  for (const produto of produtos) {
    const historicoMock: PontoHistorico[] = []
    
    // Vendas base mensal: 50 a 300 dependendo do produto
    const baseMensal = 50 + (Math.random() * 250)
    const volatilidade = 0.1 + (Math.random() * 0.4) // 10% a 50% de variação mês a mês

    // Simular 24 meses passados
    const hoje = new Date()
    for (let mes = 24; mes >= 1; mes--) {
      const dataMes = new Date(hoje.getFullYear(), hoje.getMonth() - mes, 1)
      
      // Tendência de crescimento nos ultimos 6 meses
      const fatorTendencia = mes <= 6 ? 1.2 : 1.0;
      
      // Calcular valor com ruido aleatório
      let valorSimulado = baseMensal * (1 + ((Math.random() - 0.5) * volatilidade)) * fatorTendencia;
      
      historicoMock.push({
        periodo: dataMes,
        valor: Math.max(0, Math.round(valorSimulado))
      })
    }

    // 2. Calcular Previsão
    console.log(`Calculando previsão para Produto: ${produto.nome}...`)
    const previsoes = calcularForecastEMA(historicoMock, 3, 0.3) // prever proximos 3 meses

    // 3. Limpar previsoes antigas deste produto
    await prisma.resultadoForecast.deleteMany({
      where: { produtoId: produto.id, modeloId: modelo.id }
    })

    // 4. Salvar novas previsões no banco
    for (const prev of previsoes) {
      await prisma.resultadoForecast.create({
        data: {
          tenantId: tenant.id,
          produtoId: produto.id,
          modeloId: modelo.id,
          periodoAlvo: prev.periodo,
          demandaPrevista: prev.valorPrevisto,
          limiteInferior: prev.limiteInferior,
          limiteSuperior: prev.limiteSuperior,
          confiancaMat: prev.confianca
        }
      })
    }
  }

  console.log("Motor Preditivo executado com sucesso e Salvo no Banco de Dados!")
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
