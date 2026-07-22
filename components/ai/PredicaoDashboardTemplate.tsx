import React from "react";
import { 
  TrendingUp, AlertTriangle, Zap, DollarSign, PackageSearch, 
  ArrowRight, ShieldAlert, Activity, ChevronDown, CheckCircle2,
  AlertOctagon, Database, ChevronRight, BarChart2, Users, Clock
} from "lucide-react";
import { 
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { cn } from "@/lib/utils";
import { PredicaoDashboardData } from "@/lib/mock-preditiva";

// Helper function to resolve string icon names to Lucide components
const resolveIcon = (name: string) => {
  const icons: any = { TrendingUp, AlertTriangle, Zap, DollarSign, PackageSearch, ArrowRight, ShieldAlert, Activity, ChevronDown, CheckCircle2, AlertOctagon, Database, ChevronRight, BarChart2, Users, Clock };
  const Icon = icons[name] || Activity;
  return Icon;
};

interface TemplateProps {
  data: PredicaoDashboardData;
}

export default function PredicaoDashboardTemplate({ data }: TemplateProps) {
  // Safe default for empty data scenario
  if (!data) return null;

  const MainIconCenarios = resolveIcon(data.acao1?.icone || 'Activity');
  const IconTabelaRisco = resolveIcon(data.tabelaRisco.icone);
  const IconAcao1 = resolveIcon(data.acao1.icone);
  const IconAcao2 = resolveIcon(data.acao2.icone);
  const IconBlocoEsq = resolveIcon(data.blocoEsq.icone);
  const IconBlocoDir = resolveIcon(data.blocoDir.icone);

  return (
    <>
      {/* ── PRIMEIRA LINHA DE KPIs ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {data.kpis.map((kpi, idx) => {
          const KPIIcon = resolveIcon(kpi.icone);
          const IndIcon = kpi.indicadorIcone ? resolveIcon(kpi.indicadorIcone) : null;
          
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <KPIIcon className={cn("w-3.5 h-3.5", kpi.iconeCor)} /> {kpi.titulo}
                </h3>
                <div className="flex items-end justify-between mb-1">
                  <p className={cn("text-[22px] font-black leading-none", kpi.iconeCor === "text-red-500" ? "text-red-600" : "text-slate-900")}>
                    {kpi.valor}
                  </p>
                  {kpi.badgeValor && (
                    <div className={cn("w-6 h-6 rounded-md flex items-center justify-center text-[12px] font-black", kpi.badgeCorBg, kpi.badgeCorText)}>
                      {kpi.badgeValor}
                    </div>
                  )}
                  {kpi.subtexto && !kpi.badgeValor && !kpi.progressoValor && (
                    <p className="text-[11px] font-semibold text-slate-400">{kpi.subtexto}</p>
                  )}
                </div>
              </div>
              
              {/* Variações Visuais do Rodapé do KPI */}
              {kpi.progressoValor !== undefined && (
                <div className="mt-2 w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={cn("h-full rounded-full", kpi.progressoCorBg)} style={{ width: `${kpi.progressoValor}%` }} />
                </div>
              )}
              {kpi.indicadorTexto && (
                <div className={cn("mt-4 flex items-center gap-1 text-[12px] font-bold w-fit px-2 py-0.5 rounded-md", kpi.indicadorCorBg, kpi.indicadorCorText)}>
                  {IndIcon && <IndIcon className="w-3 h-3" />} {kpi.indicadorTexto}
                </div>
              )}
              {kpi.subtexto && (kpi.badgeValor || kpi.progressoValor) && (
                <p className="text-[11px] font-semibold text-slate-400 mt-4">{kpi.subtexto}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* ── CENÁRIOS E TABELA DE RISCO (LINHA 2) ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Gráfico Cenários */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> {data.cenarios.titulo}
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-slate-100 text-[11px] font-bold text-slate-600 rounded-md">6 meses</span>
              <span className="px-3 py-1 bg-slate-100 text-[11px] font-bold text-slate-600 rounded-md">Histórico + Projeção</span>
            </div>
          </div>
          <div className="p-5 flex-1 flex flex-col md:flex-row gap-6">
            <div className="flex flex-col justify-between gap-3 min-w-[160px]">
              {data.cenarios.miniCards.map((card, idx) => (
                <div key={idx} className={cn("p-3 rounded-lg border", card.corBg, card.corBorder)}>
                  <p className={cn("text-[11px] font-black uppercase tracking-wider mb-1", card.corTitulo)}>{card.titulo}</p>
                  <p className="text-[20px] font-black text-slate-900 leading-none mb-1">{card.valor}</p>
                  <p className={cn("text-[11px] font-bold", card.corSubtexto)}>{card.subtexto}</p>
                </div>
              ))}
            </div>
            <div className="flex-1 h-[240px] min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.cenarios.graficoDados} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontSize: '13px', fontWeight: 600 }} />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} iconType="circle" />
                  <Line type="monotone" name="Realizado" dataKey="realizado" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" name="Realista" dataKey="realista" stroke="#10b981" strokeWidth={3} dot={false} />
                  <Line type="monotone" name="Otimista" dataKey="otimista" stroke="#34d399" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  <Line type="monotone" name="Pessimista" dataKey="pessimista" stroke="#ef4444" strokeDasharray="5 5" strokeWidth={2} dot={false} />
                  <Line type="monotone" name="Meta" dataKey="meta" stroke="#94a3b8" strokeDasharray="3 3" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tabela de Risco / Secundaria */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
              <IconTabelaRisco className={cn("w-4 h-4", data.tabelaRisco.iconeCor)} /> {data.tabelaRisco.titulo}
            </h2>
            <button className="text-[12px] font-bold text-indigo-600 hover:underline">Ver todos</button>
          </div>
          <div className="p-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100">{data.tabelaRisco.col1Nome}</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 text-center">{data.tabelaRisco.col2Nome}</th>
                  <th className="px-4 py-3 text-[10px] font-black text-slate-400 uppercase tracking-wider border-b border-slate-100 text-right">{data.tabelaRisco.col3Nome}</th>
                </tr>
              </thead>
              <tbody>
                {data.tabelaRisco.itens.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 cursor-pointer transition-colors group">
                    <td className="px-4 py-3 text-[12px] font-bold text-slate-800 border-b border-slate-50 group-last:border-0">{item.col1}</td>
                    <td className="px-4 py-3 text-[12px] font-medium text-slate-600 text-center border-b border-slate-50 group-last:border-0">{item.col2}</td>
                    <td className="px-4 py-3 border-b border-slate-50 group-last:border-0">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[12px] font-black text-slate-900">{item.col3Valor}%</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn("h-full rounded-full", item.col3Valor >= 90 ? "bg-red-500" : item.col3Valor >= 70 ? "bg-orange-500" : "bg-amber-400")} 
                            style={{ width: `${item.col3Valor}%` }} 
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── AÇÕES SUGERIDAS (LINHA 3) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[data.acao1, data.acao2].map((acaoBloco, idx) => {
          const IconBloco = resolveIcon(acaoBloco.icone);
          return (
            <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
                  <IconBloco className={cn("w-4 h-4", acaoBloco.iconeCor)} /> {acaoBloco.titulo}
                </h2>
                <button className="text-[12px] font-bold text-indigo-600 hover:underline">Ver todas</button>
              </div>
              <div className="p-5 flex flex-col gap-4">
                {acaoBloco.itens.map(item => (
                  <div key={item.id} className={cn("p-4 rounded-xl border flex flex-col sm:flex-row gap-4 justify-between sm:items-center hover:shadow-sm transition-all", idx === 0 ? "border-indigo-100 bg-indigo-50/30" : "border-slate-100 bg-slate-50")}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-[13px] font-bold text-slate-900">{item.titulo}</p>
                        {item.badge && (
                          <span className={cn("px-1.5 py-0.5 rounded text-[9px] font-black", item.badgeCorBg, item.badgeCorText)}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[12px] font-medium text-slate-600 mb-2">{item.desc}</p>
                      <div className="flex items-center gap-4 text-[11.5px] font-bold">
                        <span className={item.kpi1Cor || "text-slate-600"}>{item.kpi1}</span>
                        {item.kpi2 && <span className={item.kpi2Cor || "text-slate-600"}>{item.kpi2}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2 shrink-0">
                      <button className={cn("px-4 py-2 text-white text-[12px] font-bold rounded-lg transition-colors", idx === 0 ? "bg-indigo-600 hover:bg-indigo-700" : "bg-slate-900 hover:bg-slate-800")}>
                        {item.botaoPrimario}
                      </button>
                      <button className="text-[11px] font-bold text-slate-500 hover:text-slate-800 transition-colors">
                        {item.botaoSecundario}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── BLOCOS MISTOS (LINHA 4) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Bloco Esquerdo */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
              <IconBlocoEsq className={cn("w-4 h-4", data.blocoEsq.iconeCor)} /> {data.blocoEsq.titulo}
            </h2>
            <button className="text-[12px] font-bold text-indigo-600 hover:underline">Ver detalhes</button>
          </div>
          <div className="p-5 space-y-5">
            {data.blocoEsq.itens.map(item => (
              <div key={item.id} className={cn(item.badge ? "p-3 bg-red-50/50 border border-red-100 rounded-lg flex items-center justify-between" : "")}>
                <div>
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-[13px] font-bold text-slate-900 mb-0.5">{item.texto}</p>
                    {!item.badge && <p className="text-[11px] font-medium text-slate-500">{item.subtexto}</p>}
                  </div>
                  {item.progressoValor !== undefined && (
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div className={cn("h-full", item.progressoCorBg)} style={{ width: `${item.progressoValor}%` }} />
                    </div>
                  )}
                  {item.badge && (
                    <div className="flex items-center gap-2 text-[11px] font-bold mt-1">
                      <span className={item.badgeCorText?.includes("red") ? "text-red-500" : "text-amber-600"}>{item.subtexto}</span>
                      <span className={cn("px-1.5 py-0.5 rounded uppercase text-[9px]", item.badgeCorBg, item.badgeCorText)}>{item.badge}</span>
                    </div>
                  )}
                </div>
                {item.acoes && (
                  <div className="flex items-center gap-1">
                    {item.acoes.map((acao, i) => {
                      const AIcon = resolveIcon(acao);
                      return (
                        <button key={i} className="w-7 h-7 rounded bg-white border border-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors">
                          <AIcon className="w-3.5 h-3.5" />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bloco Direito (Gráfico Barras) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[15px] font-black text-slate-900 flex items-center gap-2">
              <IconBlocoDir className="w-4 h-4 text-emerald-500" /> {data.blocoDir.titulo}
            </h2>
            <button className="text-[12px] font-bold text-indigo-600 hover:underline">Ver mais</button>
          </div>
          <div className="p-5 flex flex-col sm:flex-row gap-6 h-full">
            <div className="flex flex-col justify-between gap-4 sm:w-1/3 shrink-0">
              {[1, 2, 3].map(num => {
                const titulo = (data.blocoDir as any)[`kpi${num}Titulo`];
                const valor = (data.blocoDir as any)[`kpi${num}Valor`];
                const sub = (data.blocoDir as any)[`kpi${num}Sub`];
                const cor = (data.blocoDir as any)[`kpi${num}Cor`];
                return (
                  <div key={num}>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">{titulo}</p>
                    <p className={cn("text-[18px] font-black leading-none", cor, sub ? "mb-1" : "")}>{valor}</p>
                    {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
                  </div>
                )
              })}
            </div>
            <div className="flex-1 h-full min-h-[150px]">
              <p className="text-[11px] font-bold text-slate-400 mb-2">{data.blocoDir.graficoTitulo}</p>
              <ResponsiveContainer width="100%" height="90%">
                <BarChart data={data.blocoDir.graficoDados} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
                  <Bar dataKey="valor" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

      </div>

      {/* ── INFERIOR (LINHA 5) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        
        {/* Demanda Prevista */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[14px] font-black text-slate-900">{data.demanda.titulo}</h2>
            <button className="text-[12px] font-bold text-indigo-600 hover:underline">Ver relatório</button>
          </div>
          <div className="p-1 flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100">{data.demanda.col1Nome}</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 text-right">{data.demanda.col2Nome}</th>
                  <th className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase border-b border-slate-100 text-right">Variação</th>
                </tr>
              </thead>
              <tbody>
                {data.demanda.itens.map((item, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-2 text-[12px] font-bold text-slate-800">{item.col1}</td>
                    <td className="px-4 py-2 text-[12px] font-medium text-slate-600 text-right">{item.col2}</td>
                    <td className={cn("px-4 py-2 text-[12px] font-black text-right", item.variacao > 0 ? "text-emerald-600" : "text-red-500")}>
                      {item.variacao > 0 ? "+" : ""}{item.variacao}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl text-center">
            <button className="text-[12px] font-bold text-slate-500 hover:text-slate-900">Ver mais 12 linhas</button>
          </div>
        </div>

        {/* Alertas Prioritários */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-[14px] font-black text-slate-900">{data.alertas.titulo}</h2>
            <button className="text-[12px] font-bold text-indigo-600 hover:underline">Ver todos</button>
          </div>
          <div className="p-4 flex flex-col gap-2 flex-1">
            {data.alertas.itens.map(a => (
              <div key={a.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-sm transition-all">
                <span className="text-[12px] font-bold text-slate-800">{a.texto}</span>
                <span className={cn(
                  "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                  a.cor === 'red' ? "bg-red-100 text-red-700" :
                  a.cor === 'orange' ? "bg-orange-100 text-orange-700" :
                  a.cor === 'amber' ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                )}>
                  {a.severidade}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Explicação da IA */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col md:col-span-2 xl:col-span-1">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <h2 className="text-[14px] font-black text-slate-900">Por que a IA prevê isso?</h2>
          </div>
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex flex-wrap gap-2 mb-4">
              {data.explicacao.tags.map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-semibold rounded-md">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="flex justify-between items-end mb-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confiança da previsão</p>
                <p className="text-[16px] font-black text-emerald-600">{data.explicacao.confianca}%</p>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                <div className="h-full bg-emerald-500" style={{ width: `${data.explicacao.confianca}%` }} />
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-slate-500">
                  <Database className="w-4 h-4" />
                  <span className="text-[11px] font-bold">{data.explicacao.registros} de registros analisados</span>
                </div>
                <button className="text-[11px] font-bold text-indigo-600 hover:underline">Ver detalhes</button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
