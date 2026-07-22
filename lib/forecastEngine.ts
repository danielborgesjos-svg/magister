/**
 * Motor Estatístico de Previsão de Demanda (Forecast)
 * NÃO utiliza IA Generativa para gerar números. Baseia-se puramente em matemática.
 */

export interface PontoHistorico {
  periodo: Date; // ex: 2024-01-01
  valor: number; // ex: 150 unidades vendidas
}

export interface Previsao {
  periodo: Date;
  valorPrevisto: number;
  limiteInferior: number;
  limiteSuperior: number;
  confianca: number; // 0.0 a 1.0
  tendencia: 'ALTA' | 'BAIXA' | 'ESTAVEL';
}

/**
 * Calcula Média Móvel Exponencial Simples (EMA)
 * Ideal para a Etapa 1 da POC.
 * @param historico Array de dados passados ordenados cronologicamente
 * @param periodosAPrever Quantos meses à frente prever
 * @param alpha Fator de suavização (0 a 1). Ex: 0.3 dá mais peso ao passado distante, 0.7 ao recente.
 */
export function calcularForecastEMA(
  historico: PontoHistorico[],
  periodosAPrever: number = 3,
  alpha: number = 0.3
): Previsao[] {
  if (historico.length < 3) {
    throw new Error("Histórico insuficiente para previsão confiável (Mínimo 3 pontos).");
  }

  // 1. Extrair array de valores
  const valores = historico.map(h => h.valor);
  
  // 2. Calcular Média e Desvio Padrão Histórico (para limites de confiança)
  const mediaHistorica = valores.reduce((a, b) => a + b, 0) / valores.length;
  const variancia = valores.reduce((acc, val) => acc + Math.pow(val - mediaHistorica, 2), 0) / valores.length;
  const desvioPadrao = Math.sqrt(variancia);
  
  // 3. O quão estável é esse produto? Coeficiente de Variação (CV)
  const cv = mediaHistorica === 0 ? 0 : desvioPadrao / mediaHistorica;
  
  // 4. Transformar CV em uma métrica de Confiança de 0 a 1 (0 a 100%)
  // Se CV > 1 (desvio é maior que a média), confianca é quase 0.
  // Se CV = 0.1 (desvio é 10% da média), confianca é alta (0.9).
  let confianca = 1 - cv;
  if (confianca < 0) confianca = 0.1; // mínimo 10% de confianca estatística para não zerar
  if (confianca > 0.98) confianca = 0.98;

  // 5. Calcular a EMA (Exponential Moving Average)
  let prevEMA = valores[0];
  for (let i = 1; i < valores.length; i++) {
    prevEMA = alpha * valores[i] + (1 - alpha) * prevEMA;
  }
  
  // 6. Calcular Tendência Linear Simples dos últimos 3 períodos para rotular
  const ultimos3 = valores.slice(-3);
  let tendenciaRotulo: 'ALTA' | 'BAIXA' | 'ESTAVEL' = 'ESTAVEL';
  if (ultimos3.length === 3) {
    if (ultimos3[2] > ultimos3[0] * 1.1) tendenciaRotulo = 'ALTA';
    else if (ultimos3[2] < ultimos3[0] * 0.9) tendenciaRotulo = 'BAIXA';
  }

  // 7. Gerar Previsões Futuras (Flat forecast com ajuste de tendência leve)
  const previsoes: Previsao[] = [];
  const ultimaData = new Date(historico[historico.length - 1].periodo);
  
  let ultimaPrevisao = prevEMA;
  
  for (let p = 1; p <= periodosAPrever; p++) {
    // Avança 1 mês
    const dataFutura = new Date(ultimaData);
    dataFutura.setMonth(dataFutura.getMonth() + p);
    
    // Na EMA simples, a previsão futura tende a se estabilizar no último valor EMA.
    // Aplicamos uma penalidade de degradação da confiança para cada mês projetado a frente
    const degradacao = (p - 1) * 0.05;
    const confiancaAjustada = Math.max(0, confianca - degradacao);
    
    // Z-Score 1.96 (95% CI de uma distribuição normal)
    const margemErro = 1.96 * desvioPadrao;

    previsoes.push({
      periodo: dataFutura,
      valorPrevisto: Math.max(0, Math.round(ultimaPrevisao)), // Não permitir vendas negativas
      limiteInferior: Math.max(0, Math.round(ultimaPrevisao - margemErro)),
      limiteSuperior: Math.round(ultimaPrevisao + margemErro),
      confianca: Number(confiancaAjustada.toFixed(2)),
      tendencia: tendenciaRotulo
    });
  }

  return previsoes;
}
