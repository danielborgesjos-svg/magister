"use client";

import { motion } from "framer-motion";
import { DollarSign, Wallet, ClipboardList, Users } from "lucide-react";
import { HeroDashboard } from "@/components/dashboard/HeroDashboard";
import { SmartKPICard } from "@/components/dashboard/SmartKPICard";
import { ComboChartCard } from "@/components/dashboard/ComboChartCard";
import { DonutChartCard } from "@/components/dashboard/DonutChartCard";
import { AIInsightPanel } from "@/components/dashboard/AIInsightPanel";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { UpcomingEvents } from "@/components/dashboard/UpcomingEvents";
import { CommercialPerformance } from "@/components/dashboard/CommercialPerformance";

function fmtCurrency(val: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(val);
}

export default function PainelGeralClient({ kpis }: { kpis: any }) {
  const k = kpis ?? {};

  return (
    <div className="w-full max-w-[1600px] mx-auto pb-16 space-y-6">
      
      {/* 1. Hero Banner Inteligente */}
      <HeroDashboard kpis={k} />

      {/* 2. KPIs Principais (4 colunas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SmartKPICard
          title="Receita do Mês"
          value={fmtCurrency(k.receitaMes || 0)}
          trend={k.crescimentoReceita >= 0 ? "up" : "down"}
          trendValue={`${k.crescimentoReceita > 0 ? '+' : ''}${Number(k.crescimentoReceita || 0).toFixed(1)}%`}
          icon={DollarSign}
          colorClass="text-emerald-600"
          bgClass="bg-emerald-500/10"
          sparklineData={k.chartReceitas?.map((c: any) => c.realizado) || [0, 0, 0, 0, 0, 0]}
          delay={0.1}
        />
        <SmartKPICard
          title="Lucro Bruto"
          value={fmtCurrency(k.lucroBrutoMes || 0)}
          trend="up"
          trendValue="Automático"
          icon={Wallet}
          colorClass="text-blue-600"
          bgClass="bg-blue-500/10"
          sparklineData={k.chartReceitas?.map((c: any) => c.realizado - c.despesas) || [0, 0, 0, 0, 0, 0]}
          delay={0.2}
        />
        <SmartKPICard
          title="OS em Andamento"
          value={(k.osEmExecucao + k.osAbertas || 0).toString()}
          trend="neutral"
          trendValue={`${k.osCriadasMes || 0} no mês`}
          icon={ClipboardList}
          colorClass="text-purple-600"
          bgClass="bg-purple-500/10"
          sparklineData={[10, 15, 12, 18, 20, 24, k.osEmExecucao + k.osAbertas || 0]}
          delay={0.3}
        />
        <SmartKPICard
          title="Clientes Ativos"
          value={(k.clientesAtivos || 0).toString()}
          trend="up"
          trendValue={`+ ${k.clientesNovos || 0} novos`}
          icon={Users}
          colorClass="text-orange-600"
          bgClass="bg-orange-500/10"
          sparklineData={[50, 55, 58, 62, 70, 75, k.clientesAtivos || 0]}
          delay={0.4}
        />
      </div>

      {/* 3. Visão Central (Gráficos e IA) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 h-full">
          <ComboChartCard 
            title="Receitas x Despesas" 
            subtitle="Acompanhamento mensal do fluxo de caixa (últimos 6 meses)"
            delay={0.5} 
            className="h-full"
            data={k.chartReceitas || []}
          />
        </div>
        <div className="lg:col-span-2 h-full">
          <DonutChartCard 
            title="OS por Status" 
            subtitle={`Total: ${k.osAbertas + k.osAguardandoAgendamento + k.osEmExecucao + k.osConcluidas || 0}`}
            delay={0.6} 
            className="h-full"
            data={k.chartOS || []}
          />
        </div>
        <div className="lg:col-span-3 h-full">
          <AIInsightPanel delay={0.7} kpis={k} />
        </div>
      </div>

      {/* 4. Operação e Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 h-full">
          <ActivityTimeline delay={0.8} data={k.timelineFormatada || []} />
        </div>
        <div className="lg:col-span-3 h-full">
          <UpcomingEvents delay={0.9} data={k.agendaFormatada || []} />
        </div>
        <div className="lg:col-span-4 h-full">
          <CommercialPerformance delay={1.0} data={k.perfCommercial || []} />
        </div>
      </div>

    </div>
  );
}
