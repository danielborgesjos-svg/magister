"use client"

import { Settings, Plus } from "lucide-react"
import { toast } from "sonner"

export function Header() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-[20px] font-black text-slate-900 tracking-tight uppercase">Central de Inteligência Executiva</h1>
        <p className="text-[14px] font-medium text-slate-500 mt-1">Panorama completo da operação em tempo real</p>
      </div>
      <div className="flex items-center gap-3">
        <button 
          onClick={() => toast.info("Modo de edição do dashboard ativado.")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-[13px] font-bold text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all"
        >
          <Settings className="w-4 h-4" />
          Personalizar Dashboard
        </button>
        <button 
          onClick={() => toast.success("Criando novo relatório customizado...")}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-bold shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          Novo Relatório
        </button>
      </div>
    </div>
  )
}
