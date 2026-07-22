import { Header } from "@/components/visao-executiva-v2/Header"
import { TopKpisRow } from "@/components/visao-executiva-v2/TopKpisRow"
import { PerformanceRadar } from "@/components/visao-executiva-v2/PerformanceRadar"
import { RevenueChart } from "@/components/visao-executiva-v2/RevenueChart"
import { ExecutiveAISidebar } from "@/components/visao-executiva-v2/ExecutiveAISidebar"
import { AIRecommendations } from "@/components/visao-executiva-v2/AIRecommendations"
import { DepartmentPerformanceRow } from "@/components/visao-executiva-v2/DepartmentPerformanceRow"
import { AnalyticalCardsRow } from "@/components/visao-executiva-v2/AnalyticalCardsRow"
import { ForecastAndBenchmarkRow } from "@/components/visao-executiva-v2/ForecastAndBenchmarkRow"

export default function VisaoExecutivaPage() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-6 space-y-6">
        
        {/* Cabeçalho */}
        <Header />

        {/* Linha 1: Top KPIs */}
        <TopKpisRow />

        {/* Linha 2 e resto da página: Grid de Conteúdo Principal */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          
          {/* Coluna Principal Esquerda (Ocupa 3 colunas no Desktop) */}
          <div className="xl:col-span-3 space-y-6 flex flex-col">
            
            {/* Gráficos Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <PerformanceRadar />
              </div>
              <div className="lg:col-span-2">
                <RevenueChart />
              </div>
            </div>

            {/* Departamentos */}
            <DepartmentPerformanceRow />

            {/* Cards Analíticos (Bottom) */}
            <AnalyticalCardsRow />

            {/* Forecast e Benchmark */}
            <ForecastAndBenchmarkRow />

          </div>

          {/* Coluna Direita (IA Executiva) (Ocupa 1 coluna) */}
          <div className="xl:col-span-1 flex flex-col">
            <div className="sticky top-6">
              <ExecutiveAISidebar />
              <AIRecommendations />
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
