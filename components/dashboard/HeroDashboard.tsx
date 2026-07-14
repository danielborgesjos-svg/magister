"use client";

import { motion } from "framer-motion";
import { TrendingUp, Plus, ArrowRight, Activity, Target } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

function fmt(valor: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valor);
}

export function HeroDashboard({ kpis }: { kpis: any }) {
  const k = kpis;
  const metaAlcancada = k?.metaPercentual || 0;
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? "Bom dia" : hora < 18 ? "Boa tarde" : "Boa noite";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full min-h-[160px] rounded-[16px] relative overflow-hidden flex flex-col lg:flex-row shadow-[0_4px_24px_rgba(0,100,255,0.15)] border-0 bg-[#0A2540]" 
    >
      {/* Background decoration - Tema Água/Fluidez Jamper */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#003B73] via-[#005B9F] to-[#00A3FF]" />
      
      {/* Linhas fluidas de água usando SVGs curvos de background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0,100 C300,300 600,0 1200,200 L1200,400 L0,400 Z' fill='%23FFFFFF' opacity='0.2'/%3E%3Cpath d='M0,200 C400,0 800,400 1200,100 L1200,400 L0,400 Z' fill='%23FFFFFF' opacity='0.1'/%3E%3C/svg%3E")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }} />
      <div className="absolute right-0 top-0 w-1/2 h-full opacity-30 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-300 via-transparent to-transparent blur-3xl" />

      {/* ── Lado Esquerdo: Mensagem e Ações ── */}
      <div className="relative z-10 flex-1 p-6 flex flex-col justify-center">
        <div>
          <div className="flex items-center gap-2 mb-2 text-cyan-200 text-[10px] uppercase font-bold tracking-widest">
            <span>Magister Tech</span>
            <span className="w-1 h-1 rounded-full bg-cyan-400" />
            <span>Jamper</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
            {saudacao}, {k?.usuarioNome?.split(' ')[0] || "Usuário"}! 👋
          </h1>
          <p className="text-blue-100 text-[13px] max-w-lg font-medium mt-1.5 leading-relaxed">
            Sua operação está rodando lisa. Você tem <strong className="text-white">{k?.osAbertas || 0} ordens</strong> pendentes e <strong className="text-cyan-300">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(k?.receitaPendente || 0)}</strong> em recebíveis para hoje.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-5">
          <Link href="/vendas">
            <button className="h-[40px] px-5 rounded-[12px] bg-white text-[#005B9F] text-[13px] font-bold hover:bg-cyan-50 hover:shadow-lg transition-all flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nova Venda
            </button>
          </Link>
          <Link href="/os/nova">
            <button className="h-[40px] px-5 rounded-[12px] bg-white/10 border border-white/20 text-white text-[13px] font-bold hover:bg-white/20 transition-all flex items-center gap-2 backdrop-blur-sm">
              <Plus className="w-4 h-4" /> Nova OS
            </button>
          </Link>
        </div>
      </div>

      {/* ── Lado Direito: Card Premium Embutido ── */}
      <div className="relative z-10 w-full lg:w-[380px] p-6 lg:border-l border-white/10 flex flex-col justify-center bg-black/10 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[14px] font-bold text-white uppercase tracking-wider">Meta do Mês</h3>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300">
            <TrendingUp className="w-3 h-3" />
            <span className="text-[11px] font-bold">+ {metaAlcancada}%</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-end gap-2 mb-1.5">
            <span className="text-[28px] font-black text-white leading-none tracking-tight">R$ 342.000</span>
            <span className="text-[13px] text-white/60 font-medium mb-1">/ R$ 500k</span>
          </div>
          
          {/* Barra de Progresso Customizada (Premium) */}
          <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden relative backdrop-blur-md">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${metaAlcancada}%` }}
              transition={{ delay: 0.5, duration: 1.5, ease: "easeOut" }}
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-[0_0_10px_rgba(52,211,153,0.5)] rounded-full"
            >
              <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.2)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px] animate-[shimmer_1s_linear_infinite]" />
            </motion.div>
          </div>
        </div>

        <button className="flex items-center justify-between w-full p-2.5 rounded-xl hover:bg-white/10 transition-colors group">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Activity className="w-3.5 h-3.5 text-cyan-300" />
            </div>
            <span className="text-[13px] font-bold text-white">Ver projeção detalhada</span>
          </div>
          <ArrowRight className="w-4 h-4 text-white/40 group-hover:text-white transition-colors group-hover:translate-x-1" />
        </button>
      </div>

    </motion.div>
  );
}
