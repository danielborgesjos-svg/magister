"use client";

import { motion } from "framer-motion";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";
import { useLayout } from "../layout/LayoutProvider";
import { isColorDark } from "@/lib/utils";

const dataMock = [
  { name: "Jan", receita: 4000, despesa: 2400 },
  { name: "Fev", receita: 3000, despesa: 1398 },
  { name: "Mar", receita: 2000, despesa: 9800 },
  { name: "Abr", receita: 2780, despesa: 3908 },
  { name: "Mai", receita: 1890, despesa: 4800 },
  { name: "Jun", receita: 2390, despesa: 3800 },
  { name: "Jul", receita: 3490, despesa: 4300 },
];

export function ChartCard({
  title,
  subtitle,
  delay = 0,
  className
}: {
  title: string;
  subtitle?: string;
  delay?: number;
  className?: string;
}) {
  const { sidebarColor } = useLayout();
  const isDark = isColorDark(sidebarColor || "#FAFAFA"); // Just a rough proxy for theme

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={cn(
        "bg-card border border-border rounded-[20px] p-6 shadow-sm flex flex-col",
        className
      )}
    >
      <div className="mb-6">
        <h3 className="text-[16px] font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-[13px] text-muted-foreground mt-1">{subtitle}</p>}
      </div>

      <div className="flex-1 min-h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dataMock} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} />
            <Tooltip 
              contentStyle={{ backgroundColor: "var(--card)", borderColor: "var(--border)", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
              itemStyle={{ fontWeight: "bold" }}
            />
            <Area type="monotone" dataKey="receita" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#colorReceita)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
