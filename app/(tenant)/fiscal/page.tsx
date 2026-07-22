"use client"

import { useState } from "react"
import {
  FileText, LayoutDashboard, Receipt, FileDigit, AlertTriangle, 
  Search, Filter, BookOpen, Download, Upload, ShieldCheck, PieChart
} from "lucide-react"
import { cn } from "@/lib/utils"

const NOTAS_FISCAIS = [
  { numero: "45892", serie: "1", tipo: "saida", valor: 14500.00, emissao: "2026-07-17 08:30", status: "autorizada", cliente: "Tech Solutions S.A." },
  { numero: "45893", serie: "1", tipo: "saida", valor: 8250.00, emissao: "2026-07-17 09:15", status: "rejeitada", cliente: "Indústria Metalúrgica" },
  { numero: "45894", serie: "1", tipo: "saida", valor: 1200.00, emissao: "2026-07-17 10:00", status: "processando", cliente: "Comércio Varejista X" },
  { numero: "1054", serie: "2", tipo: "entrada", valor: 45000.00, emissao: "2026-07-16 14:20", status: "autorizada", cliente: "Metalúrgica Gerdau" },
]

const IMPOSTOS = [
  { imposto: "ICMS", apurado: 145890.50, retido: 12400.00, vencimento: "2026-08-10", status: "a_vencer" },
  { imposto: "IPI", apurado: 28400.00, retido: 0, vencimento: "2026-08-25", status: "a_vencer" },
  { imposto: "PIS/COFINS", apurado: 54200.30, retido: 5400.00, vencimento: "2026-08-20", status: "a_vencer" },
  { imposto: "ISS", apurado: 8450.00, retido: 1200.00, vencimento: "2026-07-10", status: "pago" },
]

function DashboardTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Faturamento (NFe emitidas)</p>
          <p className="text-3xl font-black text-blue-600">R$ 1.84M</p>
          <p className="text-xs text-muted-foreground mt-2">Acumulado do mês</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Impostos Apurados</p>
          <p className="text-3xl font-black text-red-600">R$ 236.9k</p>
          <p className="text-xs text-muted-foreground mt-2">Carga tributária média: 12.8%</p>
        </div>
        <div className="bg-card border-red-200 bg-red-50/30 rounded-2xl p-5">
          <p className="text-sm font-medium text-red-600 mb-2">NFe Rejeitadas (SEFAZ)</p>
          <p className="text-3xl font-black text-red-700">3</p>
          <p className="text-xs text-red-600 mt-2 font-semibold">Corrigir e retransmitir</p>
        </div>
        <div className="bg-card border rounded-2xl p-5">
          <p className="text-sm font-medium text-muted-foreground mb-2">Status do SPED</p>
          <p className="text-3xl font-black text-emerald-600">Pronto</p>
          <p className="text-xs text-emerald-600 mt-2 font-semibold flex items-center gap-1"><ShieldCheck className="w-3 h-3"/> Arquivos validados</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border rounded-2xl p-5 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-sm flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Monitor de NFe (Tempo Real)</h3>
            <button className="text-xs text-primary font-bold hover:underline">Ver todas</button>
          </div>
          <div className="space-y-3 flex-1 overflow-auto">
            {NOTAS_FISCAIS.map((nf, i) => (
              <div key={i} className="flex items-center justify-between p-3 border border-border/50 rounded-xl hover:bg-muted/30">
                <div>
                  <p className="font-semibold text-sm">{nf.cliente}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Nº {nf.numero} - Série {nf.serie} · {nf.tipo === 'saida' ? 'Saída' : 'Entrada'}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn("px-2 py-0.5 text-[10px] font-bold rounded-full uppercase", 
                    nf.status === 'autorizada' ? "bg-emerald-100 text-emerald-700" :
                    nf.status === 'rejeitada' ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>{nf.status}</span>
                  <p className="text-xs font-bold mt-1">R$ {nf.valor.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="bg-card border rounded-2xl p-5 flex-1">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-primary" /> Apuração de Impostos (Prévia)</h3>
            <div className="space-y-3">
              {IMPOSTOS.map((imp, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="font-semibold text-sm">{imp.imposto}</p>
                    <p className="text-xs text-muted-foreground">Venc: {new Date(imp.vencimento).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">R$ {imp.apurado.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</p>
                    <span className={cn("text-[10px] font-bold uppercase", imp.status === 'pago' ? "text-emerald-600" : "text-amber-600")}>{imp.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5">
            <p className="text-xs font-bold text-orange-800 mb-2 flex items-center gap-1.5"><span className="text-orange-600">✦</span> JARMIS Compliance Fiscal</p>
            <p className="text-sm text-orange-900 leading-relaxed">
              A NFe 45893 foi rejeitada (Rejeição 532: NCM Inexistente). O cadastro do produto "Parafuso M10 Especial" foi atualizado incorretamente na OP anterior.
              Sugiro corrigir o NCM para 7318.15.00 e retransmitir automaticamente.
            </p>
            <button className="mt-3 px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-lg hover:bg-orange-700">Corrigir NCM e Retransmitir</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpedTab() {
  return (
    <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
      <FileDigit className="w-12 h-12 opacity-20 mb-4" />
      <h3 className="font-bold text-lg mb-2 text-foreground">Obrigações Acessórias (SPED)</h3>
      <p>Módulo de geração de EFD ICMS/IPI e EFD Contribuições em desenvolvimento. Arquivos magnéticos centralizados.</p>
    </div>
  )
}

export default function FiscalPage() {
  const [tab, setTab] = useState("dashboard")
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Fiscal & Tributário</h1>
            <p className="text-sm text-muted-foreground">Emissão de Notas Fiscais, Apuração de Impostos e SPED</p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 bg-muted/50 p-1 rounded-xl w-fit">
        <button onClick={() => setTab("dashboard")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "dashboard" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><LayoutDashboard className="w-4 h-4"/> Painel Fiscal</button>
        <button onClick={() => setTab("nfe")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "nfe" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><Receipt className="w-4 h-4"/> Monitor NFe/NFS-e</button>
        <button onClick={() => setTab("sped")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "sped" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><FileDigit className="w-4 h-4"/> Arquivos SPED</button>
        <button onClick={() => setTab("livros")} className={cn("px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2", tab === "livros" ? "bg-white shadow-sm" : "text-muted-foreground hover:text-foreground")}><BookOpen className="w-4 h-4"/> Livros Fiscais</button>
      </div>

      <div>
        {tab === "dashboard" && <DashboardTab />}
        {tab === "sped" && <SpedTab />}
        {tab === "nfe" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <Receipt className="w-12 h-12 opacity-20 mb-4" />
            <p>Gerenciador completo de XMLs, DANFE e cancelamentos em desenvolvimento.</p>
          </div>
        )}
        {tab === "livros" && (
          <div className="bg-card border rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center">
            <BookOpen className="w-12 h-12 opacity-20 mb-4" />
            <p>Livros de Entrada, Saída e Apuração de ICMS/IPI digitais.</p>
          </div>
        )}
      </div>
    </div>
  )
}
