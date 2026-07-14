import { getIntelClientes } from "@/app/actions/intelligence";
import { ClientesIntelView } from "@/components/inteligencia/ClientesIntelView";

export const metadata = {
  title: "Para quem Vender — Inteligência Comercial | Magister Tech",
  description: "Análise de clientes por probabilidade de recompra, risco de churn e oportunidade de cross-sell.",
};

export default async function ClientesIntelPage() {
  const clientes = await getIntelClientes();
  return <ClientesIntelView clientes={clientes} />;
}
