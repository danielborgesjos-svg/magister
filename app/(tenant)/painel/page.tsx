import { getDashboardKpis } from "@/app/actions/dashboard"
import PainelGeralClient from "./PainelGeralClient"

export const metadata = {
  title: "Painel Geral | JARMIS ERP",
  description: "Dashboard unificado com todos os KPIs da operação em tempo real",
}

export default async function PainelGeralPage() {
  const kpis = await getDashboardKpis()
  return <PainelGeralClient kpis={kpis} />
}
