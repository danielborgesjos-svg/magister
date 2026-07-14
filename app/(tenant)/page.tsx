import { ExecutiveHeader } from "@/components/dashboard/command-center/ExecutiveHeader";
import { KPIGrid } from "@/components/dashboard/command-center/KPIGrid";
import { SuggestionCards } from "@/components/dashboard/command-center/SuggestionCards";
import { AgendaTimeline } from "@/components/dashboard/command-center/AgendaTimeline";

export const metadata = {
  title: 'Command Center | Magister IA',
}

export default function DashboardPage() {
  return (
    <div className="w-full max-w-[1440px] mx-auto pb-12">

      {/* ─── HERO: IA Protagonist ─────────────────────────────── */}
      <ExecutiveHeader />

      {/* ─── PRIMEIRA LINHA: KPIs ─────────────────────────────── */}
      <KPIGrid />

      {/* ─── SEGUNDA LINHA: Feed e Agenda ─────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

        {/* Feed Inteligente (Ocupa 2/3 do espaço restante) */}
        <div className="xl:col-span-8 flex flex-col min-w-0 h-full">
          <SuggestionCards />
        </div>

        {/* Agenda (Ocupa 1/3 do espaço restante) */}
        <div className="xl:col-span-4 flex flex-col min-w-0 h-full">
          <AgendaTimeline />
        </div>

      </div>

    </div>
  );
}
