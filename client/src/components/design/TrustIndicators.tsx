import { cn } from "@/lib/utils";

interface TrustBadge {
  logo?: string;
  label: string;
  description?: string;
}

interface TrustIndicatorsProps {
  badges: TrustBadge[];
  variant?: "row" | "grid";
  subtle?: boolean;
}

export function TrustIndicators({ badges, variant = "row", subtle = false }: TrustIndicatorsProps) {
  const Wrapper = variant === "grid" ? "div" : "div";
  const layoutClass = variant === "grid" ? "grid gap-4 md:grid-cols-3" : "flex flex-wrap items-center gap-3";

  return (
    <Wrapper className={cn("rounded-2xl border border-slate-200/70 p-4 md:p-6", layoutClass, subtle && "bg-white/50 shadow-[0_1px_12px_rgba(15,23,42,0.04)]")}
    >
      {badges.map((badge) => (
        <div
          key={badge.label}
          className={cn(
            "flex flex-col gap-1 rounded-xl border border-slate-100/60 bg-white/80 px-4 py-3 text-right shadow-sm dark:border-slate-800/60 dark:bg-slate-900/40",
            variant === "row" && "min-w-[210px]"
          )}
        >
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">{badge.label}</p>
          {badge.description ? (
            <span className="text-xs text-slate-500 dark:text-slate-300">{badge.description}</span>
          ) : null}
        </div>
      ))}
    </Wrapper>
  );
}
