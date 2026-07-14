"use client";

import { MessageSquare, ArrowRight, TrendingUp, Sparkles, PieChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
}

export function BottomCards({ data }: { data: any }) {
  const { financeiro, previsaoChart } = data;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">
      
      {/* Previsão de Vendas */}
      <Card className="flex flex-col border-border rounded-2xl shadow-sm h-[260px]">
        <CardHeader className="pb-0 pt-5 px-5">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-[15px] font-bold text-foreground">Previsão de Vendas</CardTitle>
              <CardDescription className="text-[12px] mt-1 font-semibold text-muted-foreground flex items-center">
                Previsão final: <span className="text-primary ml-1 flex items-center"><TrendingUp className="w-3.5 h-3.5 mr-1" /> R$ 1,92M</span>
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 pt-4 pb-4 px-2">
          <div className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={previsaoChart} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} dy={10} />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }} 
                  tickFormatter={(value) => `R$${value/1000}k`}
                />
                <Tooltip 
                  formatter={(value: any) => formatCurrency(Number(value))}
                  contentStyle={{ borderRadius: '12px', fontSize: '13px', border: '1px solid #E2E8F0', fontWeight: 600, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px', fontWeight: 500 }} />
                <Line type="monotone" dataKey="realizado" name="Realizado" stroke="#2563EB" strokeWidth={3} dot={{ r: 4, fill: "#2563EB", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="previsao" name="Previsão IA" stroke="#A855F7" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Sugestão de campanha */}
      <Card className="flex flex-col border border-primary/20 rounded-2xl shadow-sm h-[260px] relative overflow-hidden bg-background">
        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none">
          <MessageSquare className="w-32 h-32 text-primary" />
        </div>
        <CardHeader className="pb-3 pt-5 px-5 relative z-10 border-b border-border/50">
          <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
            Campanha WhatsApp IA
            <Sparkles className="w-4 h-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pt-4 px-5 pb-5 relative z-10 justify-between">
          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-[13px] flex-1 font-medium text-foreground leading-relaxed shadow-inner overflow-hidden relative">
            Olá, <span className="text-primary font-bold">{"{nome}"}</span>! 👋<br/><br/>
            Temos condições especiais para você hoje no Produto X, um dos mais vendidos por aqui. Garanta o seu!
            
            {/* Balão hook visual */}
            <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary/5 rotate-45 border-t border-r border-primary/10"></div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button className="flex-1 text-[13px] h-9 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-sm shadow-primary/20">
              Usar texto
            </Button>
            <Button variant="outline" className="flex-1 text-[13px] h-9 rounded-xl font-bold border-border bg-card hover:bg-muted text-foreground">
              Editar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resumo Financeiro */}
      <Card className="flex flex-col border-border rounded-2xl shadow-sm h-[260px]">
        <CardHeader className="pb-3 pt-5 px-5 border-b border-border/50 flex flex-row items-center justify-between">
          <CardTitle className="text-[15px] font-bold text-foreground flex items-center gap-2">
            <PieChart className="w-4 h-4 text-muted-foreground" />
            Resumo Financeiro
          </CardTitle>
          <Badge variant="outline" className="font-bold text-[10px] bg-muted/50 border-border text-muted-foreground px-2 py-0.5 rounded-md">Este mês</Badge>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col pt-4 px-5 pb-5 justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-medium text-muted-foreground">Faturamento</span>
              <span className="font-bold text-[14px] text-foreground">{formatCurrency(financeiro.faturamento)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-medium text-muted-foreground">Recebimentos</span>
              <span className="font-bold text-[14px] text-green-positive">{formatCurrency(financeiro.recebimentos)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[13px] font-medium text-muted-foreground">Despesas</span>
              <span className="font-bold text-[14px] text-red-alert">{formatCurrency(financeiro.despesas)}</span>
            </div>
          </div>
          <div className="mt-2 pt-3 border-t border-border flex justify-between items-center">
            <span className="text-[13px] font-bold text-muted-foreground">Resultado Líquido</span>
            <span className="font-black text-[16px] text-primary">{formatCurrency(financeiro.resultado)}</span>
          </div>
          <Button variant="ghost" className="w-full mt-3 text-[13px] text-primary hover:text-primary hover:bg-primary/5 font-semibold gap-1.5 h-9 rounded-xl">
            Ver fluxo completo <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}
