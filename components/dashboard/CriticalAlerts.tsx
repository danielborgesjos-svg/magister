"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertCircle, Clock, PackageX, UserMinus } from "lucide-react";

interface CriticalAlertsProps {
  data: {
    tarefasAtrasadas: any[];
    estoqueCritico: any[];
    clientesSemContato: any[];
  }
}

export function CriticalAlerts({ data }: CriticalAlertsProps) {
  const totalAlerts = data.tarefasAtrasadas.length + data.estoqueCritico.length + data.clientesSemContato.length;

  if (totalAlerts === 0) return null;

  return (
    <Card className="border-red-500/20 bg-red-500/5 shadow-sm">
      <CardHeader className="pb-3 pt-4 px-6 border-b border-red-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-red-500" />
          </div>
          <CardTitle className="text-base font-bold text-red-500">Atenção Crítica</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {data.tarefasAtrasadas.length > 0 && (
            <div className="bg-background/80 rounded-xl p-3 border border-red-500/10">
              <div className="flex items-center gap-2 mb-2 text-red-500 font-semibold text-xs uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" /> Tarefas Atrasadas
              </div>
              <ul className="space-y-2">
                {data.tarefasAtrasadas.map(t => (
                  <li key={t.id} className="text-xs flex justify-between items-center text-muted-foreground">
                    <span className="truncate max-w-[150px]">{t.titulo}</span>
                    <span className="text-red-500 font-medium">
                      {t.prazo ? new Date(t.prazo).toLocaleDateString() : 'Sem prazo'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.estoqueCritico.length > 0 && (
            <div className="bg-background/80 rounded-xl p-3 border border-red-500/10">
              <div className="flex items-center gap-2 mb-2 text-red-500 font-semibold text-xs uppercase tracking-wider">
                <PackageX className="w-3.5 h-3.5" /> Ruptura de Estoque
              </div>
              <ul className="space-y-2">
                {data.estoqueCritico.map(p => (
                  <li key={p.id} className="text-xs flex justify-between items-center text-muted-foreground">
                    <span className="truncate max-w-[150px]">{p.nome}</span>
                    <span className="text-red-500 font-medium">{p.estoqueAtual} und</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {data.clientesSemContato.length > 0 && (
            <div className="bg-background/80 rounded-xl p-3 border border-red-500/10">
              <div className="flex items-center gap-2 mb-2 text-red-500 font-semibold text-xs uppercase tracking-wider">
                <UserMinus className="w-3.5 h-3.5" /> Clientes em Risco
              </div>
              <ul className="space-y-2">
                {data.clientesSemContato.map(c => (
                  <li key={c.id} className="text-xs flex justify-between items-center text-muted-foreground">
                    <span className="truncate max-w-[150px]">{c.nome}</span>
                    <span className="text-red-500 font-medium">
                      {new Date(c.updatedAt).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  )
}
