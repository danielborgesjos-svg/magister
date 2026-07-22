import { Clock, User, Package, FileText, CheckCircle2 } from "lucide-react"

export interface AcaoType {
  id: number
  user: string
  action: string
  target: string
  time: string
  type: "system" | "user" | "order" | "inventory"
}

interface RecentActionsWidgetProps {
  acoes: AcaoType[]
}

export function RecentActionsWidget({ acoes }: RecentActionsWidgetProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden relative">
      {/* Detalhe gráfico sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 opacity-80" />
      
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div>
          <h3 className="text-[14px] font-bold text-slate-900">Últimas Ações</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Atividade recente no sistema</p>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          {acoes.map((acao, index) => (
            <div key={acao.id} className="relative flex gap-3">
              {/* Linha vertical conectando os itens */}
              {index !== acoes.length - 1 && (
                <div className="absolute left-[11px] top-6 bottom-[-16px] w-[2px] bg-slate-100 rounded-full" />
              )}
              
              <div className="relative z-10 shrink-0 mt-0.5">
                {acao.type === "user" && <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center"><User className="w-3 h-3 text-blue-600" /></div>}
                {acao.type === "order" && <div className="w-6 h-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center"><FileText className="w-3 h-3 text-emerald-600" /></div>}
                {acao.type === "inventory" && <div className="w-6 h-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center"><Package className="w-3 h-3 text-amber-600" /></div>}
                {acao.type === "system" && <div className="w-6 h-6 rounded-full bg-purple-50 border border-purple-200 flex items-center justify-center"><CheckCircle2 className="w-3 h-3 text-purple-600" /></div>}
              </div>
              
              <div className="flex-1 pb-1">
                <p className="text-[12.5px] text-slate-700 leading-snug">
                  <span className="font-semibold text-slate-900">{acao.user}</span> {acao.action} <span className="font-medium text-slate-800">{acao.target}</span>
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[10px] font-medium text-slate-500">{acao.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
