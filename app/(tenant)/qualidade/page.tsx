"use client"

import { useState } from "react"
import {
  ShieldCheck, LayoutDashboard, ClipboardCheck, AlertTriangle, 
  Search, Filter, Activity, FileText, CheckCircle2, XCircle, 
  Settings2, FlaskConical, Target
} from "lucide-react"
import { cn } from "@/lib/utils"

const INSPECOES = [
  { id: "INSP-0842", lote: "L-202607-A", produto: "Válvula Hidráulica V500", status: "aprovado", data: "2026-07-17 08:30", inspetor: "Carlos Mendes", amostra: "10 un" },
  { id: "INSP-0841", lote: "L-202607-B", produto: "Aço SAE 1045", status: "reprovado", data: "2026-07-16 14:20", inspetor: "Ana Paula", amostra: "50 kg" },
  { id: "INSP-0840", lote: "L-202607-C", produto: "Motor Elétrico 5CV", status: "aprovado_condicional", data: "2026-07-16 10:15", inspetor: "Roberto F.", amostra: "5 un" },
  { id: "INSP-0839", lote: "L-202607-D", produto: "Parafuso M10x30", status: "aprovado", data: "2026-07-15 16:45", inspetor: "Carlos Mendes", amostra: "100 un" },
]

const NC_LIST = [
  { id: "NC-105", titulo: "Dureza fora da especificação", origem: "Inspeção Recebimento", gravidade: "alta", status: "em_analise", resp: "Engenharia" },
  { id: "NC-104", titulo: "Falha de estanqueidade", origem: "Linha de Montagem A", gravidade: "critica", status: "aberta", resp: "Produção" },
  { id: "NC-103", titulo: "Etiqueta ilegível", origem: "Expedição", gravidade: "baixa", status: "fechada", resp: "Logística" },
]

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Índice de Qualidade (FPY)</p>
          <p className="text-3xl font-black text-emerald-600">98.5%</p>
          <p className="text-xs text-muted-foreground mt-2">First Pass Yield Global</p>
        </div>
        <div className="bg-card border border-red-200 bg-red-50/30 rounded-2xl p-5">
          <p className="text-sm font-medium text-red-600 mb-2">Não Conformidades (Abertas)</p>
          <p className="text-3xl font-black text-red-700">12</p>
          <p className="text-xs text-red-600 mt-2 font-semibold">2 Críticas (Atenção)</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Custo da Não Qualidade</p>
          <p className="text-3xl font-black text-amber-600">R$ 14.2k</p>
          <p className="text-xs text-muted-foreground mt-2">Sucata e Retrabalho (Mês)</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Inspeções Realizadas</p>
          <p className="text-3xl font-black text-blue-600">1.450</p>
          <p className="text-xs text-muted-foreground mt-2">Nos últimos 30 dias</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-5">
          <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-primary" /> Últimas Inspeções de Lote</h3>
          <div className="space-y-3">
            {INSPECOES.map(i => (
              <div key={i.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/30 transition-colors">
                <div>
                  <p className="font-semibold text-sm">{i.produto} <span className="text-xs font-normal text-muted-foreground">({i.lote})</span></p>
                  <p className="text-xs text-muted-foreground mt-0.5">{i.id} · Inspetor: {i.inspetor}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full uppercase flex items-center gap-1", 
                    i.status === 'aprovado' ? "bg-emerald-100 text-emerald-700" :
                    i.status === 'reprovado' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {i.status === 'aprovado' ? <CheckCircle2 className="w-3 h-3"/> : 
                     i.status === 'reprovado' ? <XCircle className="w-3 h-3"/> : <AlertTriangle className="w-3 h-3"/>}
                    {i.status.replace('_', ' ')}
                  </span>
                  <p className="text-[10px] text-muted-foreground">{i.data}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border rounded-2xl p-5 flex-1">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-primary" /> Painel de Não Conformidades (NC)</h3>
            <div className="space-y-3">
              {NC_LIST.map(nc => (
                <div key={nc.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{nc.titulo}</p>
                    <p className="text-xs text-muted-foreground">{nc.id} · Origem: {nc.origem}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase mb-1", 
                      nc.gravidade === 'critica' ? "bg-red-100 text-red-700" :
                      nc.gravidade === 'alta' ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-700"
                    )}>{nc.gravidade}</span>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">{nc.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 border border-violet-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-violet-800 mb-2 flex items-center gap-1.5"><span className="text-violet-600">✦</span> JARMIS Qualidade IA</p>
            <p className="text-sm text-violet-900 leading-relaxed">
              Detectei um padrão de 3 reprovações de "Aço SAE 1045" do fornecedor "Metalúrgica Gerdau" nos últimos 15 dias, todas por desvio de dureza.
              Sugiro emitir Ação Corretiva (CAPA) para o fornecedor e alterar status para "Inspeção 100% (Severa)".
            </p>
            <button className="mt-3 px-4 py-2 bg-violet-600 text-white text-xs font-bold rounded-lg hover:bg-violet-700">Abrir CAPA para Fornecedor</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function NCOnlineTab() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar Relatório de NC..." className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm" />
        </div>
        <button className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold">Abrir Nova NC</button>
      </div>
      <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
        <AlertTriangle className="w-12 h-12 opacity-20 mb-4" />
        <h3 className="font-bold text-lg mb-2 text-foreground">Gestão de Não Conformidades</h3>
        <p>Tabela de investigação (Diagrama de Ishikawa, 5 Porquês) em desenvolvimento.</p>
      </div>
    </div>
  )
}

export default function QualidadePage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Gestão da Qualidade (SGQ)</h1>
            <p className="text-sm text-muted-foreground">Inspeções, Laudos, Não Conformidades (NC) e CAPA</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> Dashboard SGQ</button>
        <button onClick={() => setTab("inspecoes")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "inspecoes" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><ClipboardCheck className="w-4 h-4"/> Inspeção de Lotes</button>
        <button onClick={() => setTab("ncs")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "ncs" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><AlertTriangle className="w-4 h-4"/> RNC (Não Conformidades)</button>
        <button onClick={() => setTab("calibracao")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "calibracao" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Settings2 className="w-4 h-4"/> Calibração de Equip.</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "ncs" && <NCOnlineTab />}
        {tab === "inspecoes" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <ClipboardCheck className="w-12 h-12 opacity-20 mb-4" />
            <p>Formulários dinâmicos de inspeção de recebimento/processo em desenvolvimento.</p>
          </div>
        )}
        {tab === "calibracao" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Settings2 className="w-12 h-12 opacity-20 mb-4" />
            <p>Controle de plano de calibração de instrumentos em desenvolvimento.</p>
          </div>
        )}
      </div>
    </div>
  )
}
