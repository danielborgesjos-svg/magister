import { getIntelOportunidades } from "@/app/actions/intelligence";
import { OportunidadesIntelView } from "@/components/inteligencia/OportunidadesIntelView";

export const metadata = {
  title: "Quando Agir — Inteligência Comercial | Magister Tech",
  description: "Central de oportunidades urgentes: follow-ups críticos, leads esquecidos e ações prioritárias.",
};

export default async function OportunidadesIntelPage() {
  const oportunidades = await getIntelOportunidades();
  return <OportunidadesIntelView oportunidades={oportunidades} />;
}
