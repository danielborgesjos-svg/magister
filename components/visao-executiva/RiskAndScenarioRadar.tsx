import { Target, AlertTriangle, ShieldAlert, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface ScenarioType {
  title: string
  condition: string
  impact: string
  severity: "high" | "medium"
  suggestion: string
}

interface RiskAndScenarioRadarProps {
  scenarios: ScenarioType[]
}

export function RiskAndScenarioRadar({ scenarios }: RiskAndScenarioRadarProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50" />
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-black text-slate-900 tracking-tight">Radar de Cenários (What-If)</h3>
            <p className="text-[11.5px] text-slate-500 mt-1 font-medium leading-snug">Visibilidade antecipada de desafios e potenciais problemas</p>
          </div>
          <Target className="w-5 h-5 text-slate-300" />
        </div>
      </div>

      <div className="p-5 space-y-5 flex-1 bg-white">
        {scenarios.map((cenario, i) => (
          <div key={i} className="relative pl-5 before:absolute before:left-0 before:top-1.5 before:bottom-[-20px] before:w-[2px] before:bg-slate-100 last:before:hidden">
            <div className={`absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full ${cenario.severity === 'high' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' : 'bg-amber-500'}`} />
            
            <h4 className="text-[13.5px] font-bold text-slate-900 leading-tight mb-1">{cenario.title}</h4>
            
            <div className="mt-2 space-y-2.5">
              <div className="flex gap-2 items-start">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">Se...</span>
                <p className="text-[12.5px] font-medium text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-100 flex-1">{cenario.condition}</p>
              </div>
              <div className="flex gap-2 items-start">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0 mt-0.5">Então</span>
                <p className={`text-[12.5px] font-bold px-2 py-1 rounded-md border flex-1 ${cenario.severity === 'high' ? 'text-red-700 bg-red-50 border-red-100' : 'text-amber-700 bg-amber-50 border-amber-100'}`}>
                  {cenario.impact}
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2">
              <ShieldAlert className={`w-4 h-4 shrink-0 mt-0.5 ${cenario.severity === 'high' ? 'text-red-500' : 'text-amber-500'}`} />
              <div>
                <p className="text-[12px] font-semibold text-slate-800 leading-relaxed">{cenario.suggestion}</p>
                <Button variant="link" className="px-0 h-auto text-[11px] font-bold text-blue-600 mt-1 hover:text-blue-800 p-0">
                  Simular Ação <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
