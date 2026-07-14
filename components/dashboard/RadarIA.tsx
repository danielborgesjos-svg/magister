"use client"

import { Tag, Users, Clock, AlertTriangle, Zap, RefreshCw, ArrowRight, Activity, TrendingUp, PackageSearch, UserCheck, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLayout } from "@/components/layout/LayoutProvider";

interface RadarIAProps {
  data?: {
    altaDemanda: number;
    oportunidades: number;
    ruptura: number;
    acoes: number;
  };
}

export function RadarIA({ data }: RadarIAProps) {
  const [mounted, setMounted] = useState(false);
  const [activeConsole, setActiveConsole] = useState<number | null>(null);
  const { openIAPanel } = useLayout();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Valores padrão como fallback caso data não venha (ex: delay de servidor)
  const stats = data || {
    altaDemanda: 14,
    oportunidades: 32,
    ruptura: 5,
    acoes: 12
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 350, damping: 25 } }
  };

  const glowTransition = {
    duration: 3,
    repeat: Infinity,
    ease: "easeInOut" as const,
  };

  const handleAction = (prompt: string) => {
    openIAPanel();
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('magis:send', { detail: prompt }));
    }, 300);
    setActiveConsole(null);
  };

  const MiniConsole = ({ title, options, onClose }: { title: string, options: string[], onClose: () => void }) => (
    <motion.div 
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="absolute bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-primary/20 p-3 z-50 rounded-b-[20px] shadow-2xl"
    >
      <div className="flex justify-between items-center mb-2">
        <span className="text-[10px] font-mono text-emerald-500 flex items-center gap-1.5"><Zap className="w-3 h-3"/> {title}</span>
        <button onClick={onClose} className="text-muted-foreground hover:text-white"><Tag className="w-3 h-3" /></button>
      </div>
      <div className="space-y-1.5">
        {options.map((opt, i) => (
          <button 
            key={i}
            onClick={() => handleAction(opt)}
            className="w-full text-left font-mono text-[10px] text-white hover:text-emerald-400 bg-white/5 hover:bg-white/10 p-1.5 rounded transition-colors break-words leading-tight"
          >
            <span className="text-primary/50 mr-1.5">&gt;</span>{opt}
          </button>
        ))}
      </div>
    </motion.div>
  );

  return (
    <Card className="border border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden relative rounded-[20px] min-h-[160px] bg-background/80 backdrop-blur-xl">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-background to-purple-ia/[0.04] pointer-events-none z-0" />
      
      {/* Radar Scan Line */}
      <motion.div 
        animate={{ x: ["-100%", "300%"] }}
        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        className="absolute top-0 bottom-0 w-[120px] bg-gradient-to-r from-transparent via-primary/10 to-transparent pointer-events-none z-0 skew-x-[-20deg]"
      />
      
      <CardHeader className="relative z-10 flex flex-row items-center justify-between pb-3 pt-4 px-6 border-b border-white/5 bg-background/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex items-center justify-center">
            {/* Outer rings */}
            <motion.div 
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 bg-primary/20 rounded-full"
            />
            <motion.div 
              animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, delay: 0.2 }}
              className="absolute inset-0 bg-primary/30 rounded-full"
            />
            {/* Core */}
            <div className="relative w-8 h-8 bg-gradient-to-tr from-primary to-primary/80 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(var(--primary),0.5)] border border-white/20">
              <Activity className="w-4 h-4 text-white animate-pulse" />
            </div>
          </div>
          <div>
            <CardTitle className="text-lg font-black tracking-tight text-foreground flex items-center gap-2">
              Radar Comercial IA
              <div className="relative flex h-2 w-2 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </div>
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium mt-0.5">Mapeamento em tempo real de oportunidades e gargalos</p>
          </div>
        </div>
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full gap-1.5 shadow-inner"
        >
          <RefreshCw className="w-3 h-3 text-primary animate-spin-slow" style={{ animationDuration: '3s' }} />
          Sincronizado agora
        </motion.div>
      </CardHeader>

      <CardContent className="p-0 relative z-10">
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-white/5"
        >
          
          {/* Card 1: O que Vender */}
          <motion.div variants={item} className="group relative p-5 flex flex-col justify-between h-full bg-background/50 hover:bg-background/80 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Link href="/inteligencia/produtos" className="relative z-10 block group/link">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:scale-110 group-hover/link:bg-blue-500/20 transition-all duration-300">
                  <PackageSearch className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="font-bold text-[13px] text-foreground group-hover/link:text-blue-500 transition-colors">O que vender</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-black tracking-tight text-foreground block">{stats.altaDemanda}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5">Alta Demanda</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Produtos com maior probabilidade de conversão.</p>
            </Link>
            <Button 
              onClick={() => setActiveConsole(activeConsole === 1 ? null : 1)}
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 text-xs rounded-xl font-bold border border-transparent group-hover:border-blue-500/20 hover:bg-blue-500/10 hover:text-blue-500 transition-all h-8 flex items-center gap-1.5 justify-center"
            >
              <Zap className="w-3.5 h-3.5" /> Ações IA
            </Button>
            {activeConsole === 1 && (
              <MiniConsole 
                title="root@magis:~/demanda" 
                options={["Quais produtos da Curva A estão com estoque baixo?", "Criar campanha de marketing para produtos de Alta Demanda"]} 
                onClose={() => setActiveConsole(null)} 
              />
            )}
          </motion.div>

          {/* Card 2: Para quem Vender */}
          <motion.div variants={item} className="group relative p-5 flex flex-col justify-between h-full bg-background/50 hover:bg-background/80 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Link href="/inteligencia/clientes" className="relative z-10 block group/link">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-emerald-500/10 rounded-lg flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 group-hover/link:bg-emerald-500/20 transition-all duration-300">
                  <UserCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="font-bold text-[13px] text-foreground group-hover/link:text-emerald-500 transition-colors">Para quem vender</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-black tracking-tight text-foreground block">{stats.oportunidades}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5">Oportunidades</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Clientes propensos a fechar negócio/recompra.</p>
            </Link>
            <Button 
              onClick={() => setActiveConsole(activeConsole === 2 ? null : 2)}
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 text-xs rounded-xl font-bold border border-transparent group-hover:border-emerald-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 transition-all h-8 flex items-center gap-1.5 justify-center"
            >
              <Zap className="w-3.5 h-3.5" /> Ações IA
            </Button>
            {activeConsole === 2 && (
              <MiniConsole 
                title="root@magis:~/crm" 
                options={["Listar clientes com alta probabilidade de recompra", "Agendar follow-up com clientes inativos VIP"]} 
                onClose={() => setActiveConsole(null)} 
              />
            )}
          </motion.div>

          {/* Card 3: Quando Agir */}
          <motion.div variants={item} className="group relative p-5 flex flex-col justify-between h-full bg-background/50 hover:bg-background/80 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Link href="/inteligencia/oportunidades" className="relative z-10 block group/link">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20 group-hover:scale-110 group-hover/link:bg-purple-500/20 transition-all duration-300">
                  <CalendarDays className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="font-bold text-[13px] text-foreground group-hover/link:text-purple-500 transition-colors">Quando agir</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-black tracking-tight text-foreground block">Hoje</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-500 bg-purple-500/10 px-2 py-0.5 rounded-full inline-block mt-0.5">14h às 16h</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Picos históricos de conversão para o nicho.</p>
            </Link>
            <Button 
              onClick={() => setActiveConsole(activeConsole === 3 ? null : 3)}
              variant="ghost" 
              size="sm" 
              className="w-full mt-4 text-xs rounded-xl font-bold border border-transparent group-hover:border-purple-500/20 hover:bg-purple-500/10 hover:text-purple-500 transition-all h-8 flex items-center gap-1.5 justify-center"
            >
              <Zap className="w-3.5 h-3.5" /> Ações IA
            </Button>
            {activeConsole === 3 && (
              <MiniConsole 
                title="root@magis:~/agenda" 
                options={["Gerar tarefas para o pico de conversão", "Quais negociações devo atacar agora?"]} 
                onClose={() => setActiveConsole(null)} 
              />
            )}
          </motion.div>

          {/* Card 4: Risco de Estoque (Alerta) */}
          <motion.div variants={item} className="group relative p-5 flex flex-col justify-between h-full bg-background/50 hover:bg-orange-500/[0.02] transition-all duration-300 overflow-hidden">
            <motion.div animate={{ opacity: [0, 0.1, 0] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-0 bg-orange-500 pointer-events-none" />
            <div className="absolute top-0 right-0 w-20 h-20 bg-orange-500/10 blur-[25px] rounded-full group-hover:bg-orange-500/20 transition-colors" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-orange-500/15 rounded-lg flex items-center justify-center border border-orange-500/30 group-hover:scale-110 transition-all duration-300 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                  <AlertTriangle className="w-4 h-4 text-orange-500" />
                </div>
                <h3 className="font-bold text-[13px] text-foreground">Atenção Crítica</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-black tracking-tight text-orange-500 block">{stats.ruptura}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600 bg-orange-500/20 px-2 py-0.5 rounded-full inline-block mt-0.5">Itens em ruptura</span>
              </div>
              <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Produtos esgotarão em menos de 48 horas.</p>
            </div>
            <Button 
              onClick={() => setActiveConsole(activeConsole === 4 ? null : 4)}
              variant="outline" 
              size="sm" 
              className="w-full mt-4 text-xs rounded-xl font-bold border-orange-500/30 bg-orange-500/5 hover:bg-orange-500 hover:text-white transition-all shadow-sm h-8"
            >
              Tratar Urgências
            </Button>
            {activeConsole === 4 && (
              <MiniConsole 
                title="root@magis:~/ruptura" 
                options={["Mostrar produtos prestes a esgotar", "Gerar plano de ação para evitar ruptura"]} 
                onClose={() => setActiveConsole(null)} 
              />
            )}
          </motion.div>

          {/* Card 5: Ação da IA (Destaque Principal) */}
          <motion.div variants={item} className="group relative p-5 flex flex-col justify-between h-full bg-gradient-to-b from-primary/10 to-primary/5 border-l border-primary/20 overflow-hidden">
            {/* Glow effect superior */}
            <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={glowTransition} className="absolute -top-8 -right-8 w-24 h-24 bg-primary/30 blur-[30px] rounded-full pointer-events-none" />
            
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] mix-blend-overlay pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_4px_20px_rgba(var(--primary),0.5)] group-hover:scale-110 transition-all duration-300">
                  <Zap className="w-4 h-4 text-white fill-white/80" />
                </div>
                <h3 className="font-black text-[13px] text-primary drop-shadow-[0_0_10px_rgba(var(--primary),0.4)]">Ação Inteligente</h3>
              </div>
              <div className="mb-3">
                <span className="text-2xl font-black tracking-tight text-foreground block">{stats.acoes}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-primary px-2 py-0.5 rounded-full inline-block mt-0.5 shadow-md shadow-primary/30">Tarefas Geradas</span>
              </div>
              <p className="text-[11px] text-foreground/80 font-medium leading-relaxed">IA formulou um plano priorizado para agir hoje.</p>
            </div>
            
            <Button 
              onClick={() => setActiveConsole(activeConsole === 5 ? null : 5)}
              size="sm" 
              className="w-full mt-4 text-xs rounded-xl font-black bg-primary hover:bg-primary/90 text-white shadow-[0_8px_25px_-5px_rgba(var(--primary),0.5)] hover:shadow-[0_8px_30px_-5px_rgba(var(--primary),0.7)] flex items-center justify-center gap-2 relative overflow-hidden group/btn h-9 transition-all hover:-translate-y-0.5"
            >
              <motion.div 
                animate={{ x: ["-100%", "200%"] }}
                transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
              />
              <span className="relative z-10">Executar Plano de IA</span>
              <ArrowRight className="w-3.5 h-3.5 relative z-10 group-hover/btn:translate-x-1 transition-transform" />
            </Button>
            {activeConsole === 5 && (
              <MiniConsole 
                title="root@magis:~/exec" 
                options={["Resumo financeiro e comercial de hoje", "Me dê um plano de ação completo para as urgências"]} 
                onClose={() => setActiveConsole(null)} 
              />
            )}
          </motion.div>

        </motion.div>
      </CardContent>
    </Card>
  );
}
