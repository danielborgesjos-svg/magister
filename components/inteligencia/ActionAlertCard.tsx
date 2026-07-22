"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock, TrendingDown, ArrowRight, Activity, BrainCircuit } from "lucide-react"

export interface ActionAlertProps {
  priority: 'ALTA' | 'MEDIA' | 'BAIXA'
  area: string
  problem: string
  cause: string
  impactValue: number
  deadline: string
  responsible: string
  recommendation: string
  confidence: number
}

export function ActionAlertCard({ alert }: { alert: ActionAlertProps }) {
  const isHigh = alert.priority === 'ALTA'

  return (
    <Card className={`overflow-hidden border-l-4 ${isHigh ? 'border-l-red-500' : 'border-l-amber-500'} glass-panel hover:shadow-lg transition-all`}>
      <CardContent className="p-0">
        <div className="flex flex-col md:flex-row">
          
          {/* Lado Esquerdo - Problema */}
          <div className="p-5 flex-1 border-r border-border/50">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant={isHigh ? 'destructive' : 'secondary'} className="text-[10px] uppercase tracking-wider font-bold">
                {alert.priority} Prioridade
              </Badge>
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{alert.area}</span>
            </div>
            
            <h3 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
              <AlertTriangle className={isHigh ? 'text-red-500 w-5 h-5' : 'text-amber-500 w-5 h-5'} />
              {alert.problem}
            </h3>
            
            <p className="text-sm text-muted-foreground mb-4">
              <span className="font-semibold text-foreground/80">Causa Raiz:</span> {alert.cause}
            </p>
            
            <div className="flex items-center gap-6 mt-auto">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-red-500" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Risco Financeiro</p>
                  <p className="text-sm font-bold text-red-500">
                    {alert.impactValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Prazo Limite</p>
                  <p className="text-sm font-bold text-foreground">{alert.deadline}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Lado Direito - Inteligência & Ação */}
          <div className="p-5 md:w-[350px] bg-muted/20 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5" /> IA Recomenda
                </span>
                <Badge variant="outline" className="text-[10px] bg-background border-primary/20 text-primary">
                  {alert.confidence}% Confiança
                </Badge>
              </div>
              
              <p className="text-sm font-medium text-foreground/90 bg-primary/5 p-3 rounded-md border border-primary/10">
                {alert.recommendation}
              </p>
            </div>
            
            <div className="mt-4 space-y-2">
              <Button className="w-full justify-between group shadow-sm">
                Criar OP Agora
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 text-xs">Simular Cenário</Button>
                <Button variant="outline" className="flex-1 text-xs">Ignorar Alerta</Button>
              </div>
            </div>
          </div>
          
        </div>
      </CardContent>
    </Card>
  )
}
