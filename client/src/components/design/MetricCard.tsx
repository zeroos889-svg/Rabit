import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string;
  delta?: string;
  icon?: ReactNode;
  emphasis?: "primary" | "secondary" | "neutral";
}

export function MetricCard({ label, value, delta, icon, emphasis = "neutral" }: MetricCardProps) {
  const emphasisStyles: Record<typeof emphasis, string> = {
    primary: "bg-white/90 shadow-xl shadow-blue-600/10 border border-white/40",
    secondary: "bg-gradient-to-br from-[#0F172A] to-[#1F53FF] text-white",
    neutral: "bg-white/70 dark:bg-slate-900/40 border border-slate-100/70 dark:border-slate-800/60",
  } as const;

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-2xl p-4 transition shadow-[0_20px_60px_rgba(20,35,138,0.08)] hover:-translate-y-1",
        emphasisStyles[emphasis]
      )}
    >
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-300">
        {icon}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {delta ? <p className="text-xs text-slate-500 dark:text-slate-200">{delta}</p> : null}
    </div>
  );
}
