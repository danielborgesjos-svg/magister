import { getIntelProdutos } from "@/app/actions/intelligence";
import { ProdutosIntelView } from "@/components/inteligencia/ProdutosIntelView";

export const metadata = {
  title: "O que Vender — Inteligência Comercial | Magister Tech",
  description: "Análise profunda de produtos por curva ABC, margem, giro e potencial de venda.",
};

export default async function ProdutosIntelPage() {
  const produtos = await getIntelProdutos();
  return <ProdutosIntelView produtos={produtos} />;
}
