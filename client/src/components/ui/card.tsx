import React, { HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-2xl border border-border bg-card/90 backdrop-blur shadow-brand-soft dark:bg-slate-900/80 dark:border-slate-800",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "flex flex-col space-y-1.5 p-4 border-b border-border/80 dark:border-slate-800",
        className
      )}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={clsx(
        "text-lg font-semibold leading-none tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: CardProps) {
  return (
    <p
      className={clsx("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return (
    <div className={clsx("p-4 space-y-2", className)} {...props} />
  );
}

export function CardFooter({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "p-4 border-t border-border/80 dark:border-slate-800 flex items-center justify-end gap-2",
        className
      )}
      {...props}
    />
  );
}

export default Card;
