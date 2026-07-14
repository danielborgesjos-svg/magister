import { ShoppingCart, Users, Package, UserMinus, Target, ArrowUp, TrendingUp } from "lucide-react";

import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export function KpiCards({ data }: { data: any }) {
  const cards = [
    {
      title: "Vendas do Mês",
      value: formatCurrency(data.vendasDoMes),
      trend: "+5% vs mês anterior",
      icon: ShoppingCart,
      color: "text-green-positive",
      bg: "bg-green-positive/10",
      trendColor: "text-green-positive"
    },
    {
      title: "Leads Quentes",
      value: data.leadsQuentes.toString(),
      trend: "+12% vs mês anterior",
      icon: Users,
      color: "text-primary",
      bg: "bg-primary/10",
      trendColor: "text-green-positive"
    },
    {
      title: "Estoque em Atenção",
      value: data.estoqueAtencao.toString(),
      trend: "-2% vs mês anterior",
      icon: Package,
      color: "text-orange-alert",
      bg: "bg-orange-alert/10",
      trendColor: "text-orange-alert"
    },
    {
      title: "Clientes Inativos",
      value: data.clientesInativos.toString(),
      trend: "-8% vs mês anterior",
      icon: UserMinus,
      color: "text-red-alert",
      bg: "bg-red-alert/10",
      trendColor: "text-red-alert"
    },
    {
      title: "Meta do Mês",
      value: `${Math.round((data.vendasDoMes / data.metaMensal) * 100)}%`,
      trend: formatCurrency(data.metaMensal),
      icon: Target,
      color: "text-purple-ia",
      bg: "bg-purple-ia/10",
      trendColor: "text-muted-foreground",
      isProgress: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-5 gap-5">
      {cards.map((card, idx) => (
        <div key={idx} className="bg-card border border-border rounded-2xl shadow-sm p-5 flex flex-col justify-between min-h-[120px] transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold text-muted-foreground tracking-tight">{card.title}</h3>
            <div className={cn("w-10 h-10 rounded-full flex items-center justify-center", card.bg)}>
              <card.icon className={cn("w-5 h-5", card.color)} />
            </div>
          </div>
          
          <div>
            <div className="text-[24px] font-bold text-foreground leading-none">{card.value}</div>
            
            {card.isProgress ? (
              <div className="mt-3">
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-purple-ia rounded-full" style={{ width: `${Math.round((data.vendasDoMes / data.metaMensal) * 100)}%` }} />
                </div>
                <p className="text-[13px] text-muted-foreground font-medium mt-2 flex items-center">
                  Meta: {card.trend}
                </p>
              </div>
            ) : (
              <p className={cn("text-[13px] font-semibold mt-2 flex items-center gap-1", card.trendColor)}>
                {card.trendColor === "text-green-positive" ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : card.trendColor === "text-orange-alert" ? (
                  <ArrowUp className="w-3.5 h-3.5 rotate-45" />
                ) : (
                  <ArrowUp className="w-3.5 h-3.5" />
                )}
                {card.trend}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
