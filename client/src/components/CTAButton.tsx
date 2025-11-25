import { ReactNode } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CTAButtonProps
  extends Omit<ButtonProps, "children" | "variant" | "size"> {
  label: string;
  href?: string;
  icon?: ReactNode;
  iconPosition?: "start" | "end";
  showIcon?: boolean;
  fullWidth?: boolean;
  tone?: "primary" | "secondary";
}

export function CTAButton({
  label,
  href,
  icon,
  iconPosition = "end",
  showIcon = true,
  fullWidth = false,
  tone = "primary",
  className,
  ...props
}: CTAButtonProps) {
  const resolvedIcon = icon ?? <ArrowRight className="h-4 w-4" />;

  const baseClasses = cn(
    fullWidth ? "w-full" : "w-full sm:w-auto",
    "justify-center",
    tone === "secondary"
      ? "bg-white text-purple-700 border border-purple-200 hover:bg-purple-50 shadow-sm"
      : "",
    className
  );

  const content = (
    <span className="flex items-center justify-center gap-2">
      {iconPosition === "start" && showIcon ? resolvedIcon : null}
      <span>{label}</span>
      {iconPosition === "end" && showIcon ? resolvedIcon : null}
    </span>
  );

  if (href) {
    return (
      <Button
        asChild
        variant="cta"
        size="cta"
        className={baseClasses}
        aria-label={props["aria-label"] ?? label}
        {...props}
      >
        <Link href={href}>{content}</Link>
      </Button>
    );
  }

  return (
    <Button
      variant="cta"
      size="cta"
      className={baseClasses}
      aria-label={props["aria-label"] ?? label}
      {...props}
    >
      {content}
    </Button>
  );
}

export default CTAButton;
