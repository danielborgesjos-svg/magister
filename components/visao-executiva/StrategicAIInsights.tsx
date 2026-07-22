import { BrainCircuit, Lightbulb, TrendingUp } from "lucide-react"

export function StrategicAIInsights() {
  return (
    <div className="relative rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-white to-blue-50 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* Decorative BG element */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 px-6 py-5 border-b border-indigo-100 flex items-center justify-between bg-white/40 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center">
            <BrainCircuit className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h2 className="text-[16px] font-black text-indigo-950 tracking-tight">Síntese Estratégica do Negócio</h2>
            <p className="text-[12px] font-medium text-indigo-600/80 mt-0.5">Visão analítica profunda gerada pelo JARMIS AI</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-full border border-indigo-100">
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">IA Ativa</span>
        </div>
      </div>

      <div className="relative z-10 p-6 md:p-8">
        <div className="max-w-4xl space-y-5 text-slate-700">
          <p className="text-[15px] md:text-[16px] leading-relaxed font-medium">
            <strong className="text-indigo-900">Bom dia.</strong> O cenário preditivo aponta uma probabilidade de <strong className="text-emerald-600">82% de atingimento da meta global</strong> deste mês, fortemente impulsionado pelas vendas B2B na região Sudeste. 
          </p>
          <p className="text-[15px] md:text-[16px] leading-relaxed font-medium">
            No entanto, identificamos um <strong className="text-amber-600">risco silencioso na cadeia de suprimentos</strong>: o cruzamento de dados de comportamento de compra sugere que a demanda pelas <strong className="text-slate-900">Fechaduras Eletromagnéticas e Linha Touch</strong> ultrapassará sua capacidade atual de estoque em aproximadamente <strong className="text-red-600">45 dias</strong> se a tendência de obras corporativas se mantiver.
          </p>
          
          <div className="pt-4 mt-2 border-t border-indigo-100/60 flex flex-col sm:flex-row sm:items-start gap-4">
            <div className="flex items-center gap-2 shrink-0 pt-0.5">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span className="text-[12px] font-bold text-slate-900 uppercase tracking-widest">Recomendação:</span>
            </div>
            <p className="text-[14px] leading-relaxed font-medium text-slate-600">
              Autorize <strong>compras antecipadas</strong> de matéria-prima para a Linha Touch hoje. Estrategicamente, <strong>direcione o foco do time comercial</strong> nas próximas duas semanas para os clientes da região Sul, visando fechar o gap de 18% da meta sem sobrecarregar o estoque dos itens críticos de SP.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
