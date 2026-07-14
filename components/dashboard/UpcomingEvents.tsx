"use client";

import { motion } from "framer-motion";
import { Calendar, Clock, ChevronRight, User } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const eventsMock = [
  { id: "e1", time: "--:--", duration: "-", title: "Nenhum compromisso hoje", subtitle: "Sua agenda está livre", priority: "low", color: "bg-slate-300" }
];

export function UpcomingEvents({ delay = 0, data = [] }: { delay?: number, data?: any[] }) {
  const items = data.length > 0 ? data : eventsMock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-bold text-slate-800">Próximos Compromissos</h3>
        <Link href="/agenda" className="text-[13px] font-bold text-cyan-600 hover:text-cyan-700 transition-colors flex items-center gap-1">
          Agenda <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-1 space-y-4">
        {items.map((event, i) => (
          <motion.div 
            key={event.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + (i * 0.1), duration: 0.3 }}
            className="flex items-start gap-3 group p-2 -mx-2 rounded-xl hover:bg-slate-50 transition-colors"
          >
            {/* Timeline Line & Dot */}
            <div className="flex flex-col items-center pt-1.5 shrink-0">
              <div className={cn("w-2.5 h-2.5 rounded-full shadow-sm", event.color || "bg-slate-400")} />
              {i !== items.length - 1 && (
                <div className="w-px h-10 bg-slate-200 my-1" />
              )}
            </div>

            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-bold text-slate-800 truncate pr-2">{event.title}</span>
                <span className="text-[12px] font-bold text-slate-900 shrink-0 bg-slate-100 px-2 py-0.5 rounded-md">{event.time}</span>
              </div>
              <div className="flex items-center gap-3 mt-1.5">
                <div className="flex items-center gap-1 text-slate-500">
                  <User className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold truncate max-w-[120px]">{event.subtitle}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-semibold">{event.duration}</span>
                </div>
              </div>
            </div>

            {/* Hover Action */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center h-full pt-1.5 pr-1 shrink-0">
              <Link href={`/agenda`}>
                <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-cyan-600 hover:border-cyan-200 shadow-sm transition-all">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
