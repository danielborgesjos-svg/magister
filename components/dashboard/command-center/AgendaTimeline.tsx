"use client";

import { motion } from "framer-motion";
import { Clock, Users, Star, Megaphone, BarChart2 } from "lucide-react";
import { cn } from "@/lib/utils";

const events = [
  {
    time: "09:00",
    title: "Reunião Comercial",
    icon: Users,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    active: false,
  },
  {
    time: "11:00",
    title: "Cliente VIP",
    icon: Star,
    color: "text-primary",
    bg: "bg-primary/10",
    active: true, // ongoing or next
  },
  {
    time: "14:00",
    title: "Campanhas",
    icon: Megaphone,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    active: false,
  },
  {
    time: "16:00",
    title: "Resultados",
    icon: BarChart2,
    color: "text-green-500",
    bg: "bg-green-500/10",
    active: false,
  }
];

export function AgendaTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.28, duration: 0.4 }}
      className="bg-card rounded-[20px] p-6 lg:p-7 border border-border shadow-[0_2px_12px_rgba(0,0,0,0.02)] dark:shadow-none h-full"
    >
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-[18px] font-bold text-foreground mb-1">Agenda de Hoje</h2>
          <p className="text-[13px] text-muted-foreground">Próximos compromissos</p>
        </div>
      </div>

      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = event.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
              className="flex items-start gap-4"
            >
              <div className="flex flex-col items-center mt-0.5">
                <span className={cn("text-[12px] font-bold w-10 text-right", event.active ? "text-foreground" : "text-muted-foreground/60")}>
                  {event.time}
                </span>
              </div>
              
              <div className="relative flex flex-col items-center">
                <div className={cn(
                  "w-8 h-8 rounded-[10px] flex items-center justify-center relative z-10 border-2 border-card",
                  event.bg
                )}>
                  <Icon className={cn("w-3.5 h-3.5", event.color)} />
                </div>
                {index !== events.length - 1 && (
                  <div className="absolute top-8 bottom-[-24px] w-px bg-border z-0" />
                )}
              </div>

              <div className={cn(
                "flex-1 pt-1.5 pb-2 transition-all",
                event.active ? "opacity-100" : "opacity-70"
              )}>
                <h3 className={cn("text-[14px] font-bold leading-none mb-1", event.active ? "text-foreground" : "text-muted-foreground")}>
                  {event.title}
                </h3>
                {event.active && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-md uppercase tracking-wider mt-1">
                    <Clock className="w-3 h-3" /> Em breve
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
