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
      "bg-purple-600 text-white border border-purple-600 dark:bg-purple-500 dark:border-purple-500",
    outline:
      "border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200",
    success:
      "bg-green-600 text-white border border-green-600 dark:bg-green-500 dark:border-green-500",
    destructive:
      "bg-red-600 text-white border border-red-600 dark:bg-red-500 dark:border-red-500",
    secondary:
      "bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/40 dark:text-purple-200 dark:border-purple-800",
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
