"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { ResponsiveContainer, AreaChart, Area } from "recharts";

export function SmartKPICard({
  title,
  value,
  trend,
  trendValue,
  icon: Icon,
  colorClass,
  bgClass,
  sparklineData,
  delay = 0,
}: {
  title: string;
  value: string;
  trend: "up" | "down" | "neutral";
  trendValue: string;
  icon: React.ElementType;
  colorClass: string;
  bgClass: string;
  sparklineData: number[];
  delay?: number;
}) {
  const chartData = sparklineData.map((val, i) => ({ name: i, value: val }));

  // Cores dinâmicas para o sparkline baseadas na cor predominante do card
  const chartColor = colorClass.includes("emerald") || colorClass.includes("green") 
    ? "#10B981" 
    : colorClass.includes("blue") 
    ? "#3B82F6" 
    : colorClass.includes("purple") 
    ? "#8B5CF6" 
    : colorClass.includes("orange")
    ? "#F97316"
    : "#64748B";

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all duration-300 relative overflow-hidden group flex flex-col min-h-[140px]"
    >
      <div className="p-6 pb-4 flex items-start justify-between z-10">
        <div className="flex flex-col gap-1.5">
          <h3 className="text-[14px] font-semibold text-muted-foreground">{title}</h3>
          <span className="text-[34px] font-black text-foreground leading-none tracking-tight">
            {value}
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            {trend === "up" && <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />}
            {trend === "down" && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
            {trend === "neutral" && <Minus className="w-3.5 h-3.5 text-muted-foreground" />}
            <span className={cn(
              "text-[12px] font-bold",
              trend === "up" ? "text-emerald-500" : trend === "down" ? "text-red-500" : "text-muted-foreground"
            )}>
              {trendValue}
            </span>
          </div>
        </div>
        
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm", bgClass)}>
          <Icon className={cn("w-6 h-6", colorClass)} />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40 group-hover:opacity-60 transition-opacity duration-300 pointer-events-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={`color-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.8}/>
                <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke={chartColor} 
              strokeWidth={2}
              fillOpacity={1} 
              fill={`url(#color-${title.replace(/\s+/g, '')})`} 
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
