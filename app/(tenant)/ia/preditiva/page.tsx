"use client"
import React, { useState } from "react"
import { TrendingUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { MOCK_DADOS_SETORES } from "@/lib/mock-preditiva"
import PredicaoDashboardTemplate from "@/components/ai/PredicaoDashboardTemplate"

const setoresLista = [
  "Visão Executiva", "Comercial", "Estoque", "RH", "Compras", 
  "Produção", "Custos", "Contabilidade", "Vendas", "Clientes", "Fornecedores"
];

// ─── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────

export default function InteligenciaPreditivaPage() {
  const [setorSelecionado, setSetorSelecionado] = useState("Visão Executiva");

  // Busca os dados configurados (com fallback caso não exista)
  const dadosSetor = MOCK_DADOS_SETORES[setorSelecionado] || MOCK_DADOS_SETORES["Visão Executiva"];

  return (
    <div className="flex flex-col h-full w-full min-h-full space-y-6 pb-12 text-[#0f172a]">
      
      {/* ── 6. CABEÇALHO DA PÁGINA ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-[28px] font-black tracking-tight text-slate-900 leading-none mb-1">
              Inteligência Preditiva {setorSelecionado !== "Visão Executiva" ? `- ${setorSelecionado}` : ""}
            </h1>
            <p className="text-[14px] font-medium text-slate-500">Projeções e cenários de risco calculados em tempo real pelo Motor JARMIS.</p>
          </div>
        </div>
        
        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-2">
          {["Este Mês", "Disafe Indústria", "Todas Unidades", "Categoria", "Linha", "C. Custo"].map((filtro, i) => (
            <button key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[12px] font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              {filtro} <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
          ))}
        </div>
      </div>

      {/* ── TABS DE SETORES ── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 custom-scrollbar shrink-0 border-b border-slate-200">
        {setoresLista.map(setor => (
          <button
            key={setor}
            onClick={() => setSetorSelecionado(setor)}
            className={cn(
              "px-4 py-2.5 text-[13px] font-bold whitespace-nowrap transition-colors border-b-2",
              setorSelecionado === setor 
                ? "text-indigo-600 border-indigo-600 bg-indigo-50/50 rounded-t-lg" 
                : "text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 rounded-t-lg"
            )}
          >
            {setor}
          </button>
        ))}
      </div>

      {/* ── TEMPLATE DO DASHBOARD PREDITIVO ── */}
      {dadosSetor && <PredicaoDashboardTemplate data={dadosSetor} />}

    </div>
  )
}
