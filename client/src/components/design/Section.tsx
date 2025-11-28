import { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

// Define allowed HTML elements for the Section component
type AllowedElements = "section" | "div" | "article" | "aside" | "main" | "header" | "footer" | "nav";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  readonly id?: string;
  readonly as?: AllowedElements;
  readonly background?: "plain" | "muted" | "gradient" | "glow";
  readonly children: ReactNode;
}

const backgroundClassMap: Record<NonNullable<SectionProps["background"]>, string> = {
  plain: "bg-transparent",
  muted: "bg-[rgba(241,245,252,0.65)] dark:bg-[rgba(10,15,32,0.9)]",
  gradient: "bg-gradient-to-b from-white via-[rgba(241,245,252,0.7)] to-white dark:from-[#050816] dark:via-[#0a1024] dark:to-[#050816]",
  glow: "relative overflow-hidden bg-white dark:bg-[#050816]",
};

export function Section({
  id,
  as: Tag = "section",
  background = "plain",
  className,
  children,
  ...rest
}: SectionProps) {
  const backgroundClass = backgroundClassMap[background] ?? backgroundClassMap.plain;

  return (
    <Tag
      id={id}
      className={cn(
        "w-full py-12 md:py-20",
        backgroundClass,
        background === "glow" && "before:absolute before:inset-0 before:bg-[radial-gradient(circle_at_top,_rgba(79,157,255,0.25),_transparent_65%)] before:opacity-80 before:blur-3xl before:content-['']",
        className
      )}
      {...rest}
    >
      <div className="mx-auto w-full max-w-[1344px] px-4 sm:px-6 lg:px-12">
        {children}
      </div>
    </Tag>
  );
}

interface SectionHeaderProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly description?: string;
  readonly align?: "start" | "center";
  readonly actions?: ReactNode;
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "start",
  actions,
}: Readonly<SectionHeaderProps>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        align === "start" && "items-start text-right"
      )}
    >
      {eyebrow ? (
        <span className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-500">
          {eyebrow}
        </span>
      ) : null}
      <div className={cn("space-y-4", align === "center" && "max-w-3xl")}
      >
        <h2 className="text-3xl font-bold leading-tight text-slate-900 dark:text-white md:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-lg text-slate-600 dark:text-slate-300">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
