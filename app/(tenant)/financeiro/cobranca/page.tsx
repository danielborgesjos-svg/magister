import { CreditCard, PlusCircle, Search, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react"
import Link from "next/link"

// TODO: Integrate with Prisma `Contrato` model in the future for real data.
const MOCK_CONTRATOS = [
  { id: "1", cliente: "Tech Solutions Inc.", plano: "Manutenção Preventiva", valor: 1500, periodicidade: "Mensal", status: "ativo", proximoVencimento: "2023-10-15" },
  { id: "2", cliente: "Padaria do João", plano: "Limpeza de Filtros", valor: 250, periodicidade: "Mensal", status: "ativo", proximoVencimento: "2023-10-12" },
  { id: "3", cliente: "Condomínio Flores", plano: "Gestão de Bombas d'Água", valor: 4500, periodicidade: "Semestral", status: "inadimplente", proximoVencimento: "2023-09-01" },
  { id: "4", cliente: "Escola Aprender", plano: "Manutenção Preventiva", valor: 1200, periodicidade: "Mensal", status: "pausado", proximoVencimento: "2023-11-05" },
]

export default function CobrancaRecorrenciaPage() {
  return (
    <div className="flex flex-col gap-6 w-full max-w-7xl mx-auto">
      
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Cobrança & Recorrência</h1>
          <p className="text-slate-500 mt-1">Gestão de assinaturas, contratos e cobranças recorrentes automáticas.</p>
        </div>
        <Link 
          href="/financeiro/cobranca/novo" 
          className="flex items-center gap-2 px-5 py-2.5 bg-black hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle size={18} />
          <span>Novo Contrato</span>
        </Link>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard title="Receita Recorrente (MRR)" value="R$ 7.450,00" sub="+12% que mês anterior" icon={<RefreshCw className="text-blue-500" size={20} />} />
        <MetricCard title="Contratos Ativos" value="3" sub="De 4 totais" icon={<CheckCircle2 className="text-emerald-500" size={20} />} />
        <MetricCard title="Inadimplência" value="R$ 4.500,00" sub="1 contrato atrasado" icon={<AlertTriangle className="text-rose-500" size={20} />} />
        <MetricCard title="Taxa de Retenção" value="98.5%" sub="Excelente" icon={<CreditCard className="text-purple-500" size={20} />} />
      </div>

      {/* FILTROS E BUSCA */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar contrato, cliente..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/5"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 flex-1 md:flex-none cursor-pointer">
            <option>Todos os Status</option>
            <option>Ativos</option>
            <option>Inadimplentes</option>
            <option>Pausados</option>
          </select>
          <select className="bg-white border border-slate-200 rounded-lg py-2.5 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-black/5 flex-1 md:flex-none cursor-pointer">
            <option>Todas as Periodicidades</option>
            <option>Mensal</option>
            <option>Trimestral</option>
            <option>Semestral</option>
            <option>Anual</option>
          </select>
        </div>
      </div>

      {/* LISTA DE CONTRATOS */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Cliente</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano/Serviço</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Valor (R$)</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Ciclo</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Próx. Vencimento</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_CONTRATOS.map(contrato => (
                <tr key={contrato.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="font-bold text-sm text-slate-900">{contrato.cliente}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-600">{contrato.plano}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-900">
                      R$ {contrato.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
                      {contrato.periodicidade}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-slate-500">
                      {new Date(contrato.proximoVencimento).toLocaleDateString('pt-BR')}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                      contrato.status === 'ativo' ? 'bg-emerald-50 text-emerald-600' :
                      contrato.status === 'inadimplente' ? 'bg-rose-50 text-rose-600' :
                      'bg-amber-50 text-amber-600'
                    }`}>
                      {contrato.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-black transition-colors p-2 rounded-lg hover:bg-slate-100">
                      <ArrowRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}

function MetricCard({ title, value, sub, icon }: { title: string, value: string, sub: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-slate-500">{title}</span>
        <div className="p-2 bg-slate-50 rounded-lg">{icon}</div>
      </div>
      <div>
        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h3>
        <p className="text-xs font-medium text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  )
}
