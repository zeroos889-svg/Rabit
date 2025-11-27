import React, { HTMLAttributes } from "react";
import clsx from "clsx";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "success" | "destructive" | "secondary";
}

export function Badge({
  className,
  variant = "default",
  ...props
}: BadgeProps) {
  const styles = {
    default:
      "bg-brand-100 text-brand-800 border border-brand-200 shadow-sm",
    outline:
      "border border-brand-200 text-brand-700",
    success:
      "bg-green-600 text-white border border-green-600 dark:bg-green-500 dark:border-green-500",
    destructive:
      "bg-red-600 text-white border border-red-600 dark:bg-red-500 dark:border-red-500",
    secondary:
      "bg-brand-50 text-brand-700 border border-brand-100 dark:bg-brand-900/40 dark:text-brand-50 dark:border-brand-800",
  }[variant];
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium select-none",
        styles,
        className
      )}
      {...props}
    />
  );
}

export default Badge;
