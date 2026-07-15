import { buscarOSCompleto } from "@/app/actions/os"
import Link from "next/link"
import { MapPin, Clock, Calendar, CheckCircle, ChevronRight } from "lucide-react"

export default async function AppTecnicoHome() {
  // Mocking the logged-in technician
  const tecnicoId = "tec_123"
  const result = await buscarOSCompleto({ tecnicoId })
  const ordens = result?.itens || []

  // Sort: agendada -> em_andamento -> concluida
  const orderMap: any = { "agendada": 1, "em_andamento": 2, "concluida": 3 }
  ordens.sort((a: any, b: any) => (orderMap[a.status] || 99) - (orderMap[b.status] || 99))

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 md:bg-slate-200">
      <div className="w-full max-w-md mx-auto bg-slate-50 min-h-screen shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header App */}
        <div className="bg-blue-600 text-white p-6 pt-10 rounded-b-3xl shadow-lg shrink-0">
          <h1 className="text-2xl font-bold">Olá, Carlos!</h1>
          <p className="text-blue-100 mt-1">Você tem {ordens.filter(o => o.status !== "concluida").length} serviços pendentes hoje.</p>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 pb-24">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">Suas Ordens de Serviço</h2>
          
          {ordens.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma OS atribuída para você.</p>
            </div>
          ) : (
            ordens.map(os => {
              const statusColor = 
                os.status === 'concluida' ? 'bg-emerald-100 text-emerald-700' : 
                os.status === 'em_andamento' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-blue-100 text-blue-700'
              
              const isBlocked = os.status === 'concluida'

              return (
                <Link 
                  key={os.id} 
                  href={isBlocked ? "#" : `/app-tecnico/${os.id}`}
                  className={`block bg-white p-4 rounded-2xl shadow-sm border border-slate-100 transition-all ${isBlocked ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md active:scale-[0.98]'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-slate-400">#{os.numeroOS}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${statusColor}`}>
                      {os.status.replace("_", " ")}
                    </span>
                  </div>

                  <h3 className="font-semibold text-slate-800 line-clamp-1">{os.cliente?.nome || "Cliente não informado"}</h3>
                  <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{os.titulo}</p>

                  <div className="flex flex-col gap-2 mt-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      {os.dataAgendada ? new Date(os.dataAgendada).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : "Sem data agendada"}
                    </div>
                    <div className="flex items-start gap-2 text-xs font-medium text-slate-500">
                      <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{os.endereco ? `${os.endereco.bairro}, ${os.endereco.cidade} - ${os.endereco.uf}` : "Endereço não informado"}</span>
                    </div>
                  </div>

                  {!isBlocked && (
                    <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-blue-600 font-bold text-sm">
                      {os.status === 'em_andamento' ? 'Continuar Execução' : 'Iniciar Atendimento'}
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  )}
                </Link>
              )
            })
          )}
        </div>

      </div>
    </div>
  )
}
