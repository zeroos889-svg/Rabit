import { APP_LOGO, APP_TITLE } from "@/const";
import { cn } from "@/lib/utils";

const ICON_SIZES = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
} as const;

const TITLE_SIZES = {
  sm: "text-lg",
  md: "text-2xl",
  lg: "text-3xl",
} as const;

type BrandMarkProps = {
  size?: keyof typeof ICON_SIZES;
  orientation?: "horizontal" | "stacked";
  showTagline?: boolean;
  tagline?: string;
  className?: string;
  iconOnly?: boolean;
};

const DEFAULT_TAGLINE = "منصة الموارد البشرية الموثوقة";

export function BrandMark({
  size = "md",
  orientation = "horizontal",
  showTagline = false,
  tagline = DEFAULT_TAGLINE,
  className,
  iconOnly = false,
}: BrandMarkProps) {
  const iconSize = ICON_SIZES[size];
  const titleSize = TITLE_SIZES[size];

  return (
    <div
      className={cn(
        "flex items-center gap-3 text-right",
        orientation === "stacked" && "flex-col items-start text-start",
        className,
      )}
    >
      <div
        className={cn(
          "rounded-2xl bg-white/90 p-2 shadow-brand-glow ring-1 ring-white/40 dark:bg-slate-900/80 dark:ring-slate-800",
          orientation === "stacked" && "mb-1",
        )}
      >
        <img
          src={APP_LOGO}
          alt={APP_TITLE}
          className={cn(iconSize, "object-contain")}
          width={64}
          height={64}
          loading="lazy"
          decoding="async"
        />
      </div>

      {!iconOnly && (
        <div className="space-y-1">
          <p
            className={cn(
              "font-black tracking-tight text-gradient-primary",
              titleSize,
            )}
          >
            {APP_TITLE || "رابِط"}
          </p>
          {showTagline && (
            <p className="text-sm text-muted-foreground leading-snug">
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
