"use client"

import { useState } from "react"
import {
  Truck, LayoutDashboard, MapPin, Search, Filter, 
  Map, Route, Navigation, ShieldCheck, AlertTriangle, 
  Clock, CheckCircle2, ChevronRight, PackageCheck, Thermometer
} from "lucide-react"
import { cn } from "@/lib/utils"

const FROTAS = [
  { placa: "ABC-1234", veiculo: "Volvo FH 540", motorista: "João Silva", status: "em_rota", destino: "São Paulo/SP", temp: "-18°C", chegada: "14:30" },
  { placa: "XYZ-9876", veiculo: "Scania R450", motorista: "Carlos Souza", status: "parado", destino: "Pátio Matriz", temp: "-", chegada: "-" },
  { placa: "DEF-5678", veiculo: "Iveco Stralis", motorista: "Marcos Lima", status: "manutencao", destino: "Oficina Externa", temp: "-", chegada: "-" },
  { placa: "GHI-9012", veiculo: "Volvo FH 460", motorista: "Roberto Alves", status: "em_rota", destino: "Curitiba/PR", temp: "Ambiente", chegada: "18:00 (Atrasado)" },
]

const ENTREGAS = [
  { nf: "NFe-45892", cliente: "Tech Solutions S.A.", cidade: "São Paulo/SP", peso: "1.2t", volume: "4.5m³", previsao: "Hoje, 14:30", status: "em_transito", rota: "RT-0042" },
  { nf: "NFe-45893", cliente: "Indústria Metalúrgica", cidade: "Campinas/SP", peso: "3.5t", volume: "12m³", previsao: "Amanhã, 09:00", status: "aguardando_embarque", rota: "-" },
  { nf: "NFe-45891", cliente: "Comércio Varejista X", cidade: "Osasco/SP", peso: "0.5t", volume: "2m³", previsao: "Hoje, 10:00", status: "entregue", rota: "RT-0041" },
]

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Entregas no Prazo (OTIF)</p>
          <p className="text-3xl font-black">94.2%</p>
          <div className="flex items-center gap-1 text-xs text-red-500 mt-2 font-semibold">
            <AlertTriangle className="w-3 h-3" /> Abaixo da meta (96%)
          </div>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Custo de Frete (Mês)</p>
          <p className="text-3xl font-black text-blue-600">R$ 184k</p>
          <p className="text-xs text-muted-foreground mt-2">12% da receita faturada</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Veículos em Rota</p>
          <p className="text-3xl font-black text-emerald-600">14</p>
          <p className="text-xs text-muted-foreground mt-2">2 parados no pátio</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ocorrências / Avarias</p>
          <p className="text-3xl font-black text-amber-600">3</p>
          <p className="text-xs text-amber-700 mt-2 font-semibold">Analisar com Qualidade</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary" /> Rastreio de Frota em Tempo Real</h3>
          <div className="space-y-3">
            {FROTAS.map((f, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 bg-muted/40 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Truck className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-bold text-sm">{f.placa} <span className="font-normal text-muted-foreground text-xs">({f.veiculo})</span></p>
                      <p className="text-xs text-muted-foreground">{f.motorista}</p>
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full uppercase", 
                    f.status === 'em_rota' ? "bg-blue-100 text-blue-700" :
                    f.status === 'manutencao' ? "bg-red-100 text-red-700" : "bg-slate-200 text-slate-700"
                  )}>{f.status.replace('_', ' ')}</span>
                </div>
                {f.status === 'em_rota' && (
                  <div className="pt-2 mt-2 border-t border-border flex justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Map className="w-3 h-3"/> {f.destino}</span>
                    {f.temp !== '-' && <span className="flex items-center gap-1"><Thermometer className="w-3 h-3"/> {f.temp}</span>}
                    <span className={cn("flex items-center gap-1", f.chegada.includes('Atrasado') ? "text-red-500 font-bold" : "")}><Clock className="w-3 h-3"/> ETA: {f.chegada}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border rounded-2xl p-5 flex-1">
             <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><Route className="w-4 h-4 text-primary" /> Próximas Entregas</h3>
             <div className="space-y-3">
              {ENTREGAS.slice(0, 3).map((e, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-sm">{e.cliente}</p>
                    <p className="text-xs text-muted-foreground">{e.nf} · {e.cidade}</p>
                  </div>
                  <div className="text-right">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase inline-block mb-1", 
                      e.status === 'em_transito' ? "bg-blue-100 text-blue-700" :
                      e.status === 'entregue' ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>{e.status.replace('_', ' ')}</span>
                    <p className="text-xs font-medium">{e.previsao}</p>
                  </div>
                </div>
              ))}
             </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-blue-800 mb-2 flex items-center gap-1.5"><span className="text-blue-600">✦</span> JARMIS Roteirização IA</p>
            <p className="text-sm text-blue-900 leading-relaxed">
              Alerta: Congestionamento grave detectado na BR-116. A rota RT-0042 (Motorista João Silva) terá um atraso de 45 mins. 
              Sugiro recalcular a rota via desvio secundário (economia estimada de 30 mins) e notificar o cliente automaticamente.
            </p>
            <div className="flex gap-2 mt-3">
              <button className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">Recalcular Rota e Notificar</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RoteirizacaoTab() {
  return (
    <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
      <Navigation className="w-12 h-12 opacity-20 mb-4" />
      <h3 className="font-bold text-lg mb-2 text-foreground">Mapa de Roteirização</h3>
      <p>Integração com Google Maps API em desenvolvimento.</p>
    </div>
  )
}

export default function LogisticaPage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Logística & TMS</h1>
            <p className="text-sm text-muted-foreground">Gestão de Frota, Roteirização e Controle de Fretes</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> Controle de Tráfego</button>
        <button onClick={() => setTab("roteirizacao")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "roteirizacao" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Route className="w-4 h-4"/> Roteirização IA</button>
        <button onClick={() => setTab("fretes")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "fretes" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><ShieldCheck className="w-4 h-4"/> Auditoria de Fretes</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "roteirizacao" && <RoteirizacaoTab />}
        {tab === "fretes" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <ShieldCheck className="w-12 h-12 opacity-20 mb-4" />
            <p>Auditoria de faturas CTe/NFe em desenvolvimento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
