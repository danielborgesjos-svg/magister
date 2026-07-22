import { ChevronUp, TrendingDown, Activity, LucideIcon } from "lucide-react"

interface ExecutiveKpiCardProps {
  label: string
  value: string
  sub: string
  trend: "up" | "down" | "neutral"
  icon: LucideIcon
  color: "red" | "amber" | "blue" | "green" | "purple"
}

export function ExecutiveKpiCard({ label, value, sub, trend, icon: Icon, color }: ExecutiveKpiCardProps) {
  const colorMap = {
    red:    { bg: "bg-red-50",    text: "text-red-600",    border: "border-red-100" },
    amber:  { bg: "bg-amber-50",  text: "text-amber-600",  border: "border-amber-100" },
    blue:   { bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
    green:  { bg: "bg-emerald-50",text: "text-emerald-600",border: "border-emerald-100" },
    purple: { bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
  }

  const c = colorMap[color] || colorMap.blue

  return (
    <div className="relative rounded-xl p-5 bg-white border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-blue-200 cursor-pointer group overflow-hidden">
      {/* Subtle background gradient and icon watermark */}
      <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full ${c.bg} opacity-50 group-hover:scale-150 transition-transform duration-500 blur-2xl`} />
      <Icon className={`absolute -right-2 -bottom-2 w-16 h-16 ${c.text} opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-300 transform -rotate-12`} />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.border} border flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300`}>
            <Icon className={`w-5 h-5 ${c.text}`} />
          </div>
          <div className="bg-slate-50/80 px-2 py-1 rounded-full flex items-center shadow-sm border border-slate-100">
            {trend === "up"      && <ChevronUp className="w-3.5 h-3.5 text-emerald-500" />}
            {trend === "down"    && <TrendingDown className="w-3.5 h-3.5 text-red-500" />}
            {trend === "neutral" && <Activity className="w-3.5 h-3.5 text-slate-400" />}
          </div>
        </div>
        <p className="text-2xl md:text-3xl font-black text-slate-900 leading-none tracking-tight">{value}</p>
        <p className="text-[13px] text-slate-600 font-semibold mt-2.5 leading-tight">{label}</p>
        <p className="text-[11px] text-slate-400 mt-1 font-medium">{sub}</p>
      </div>
    </div>
  )
}
