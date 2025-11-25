import React, { HTMLAttributes } from "react";
import clsx from "clsx";

interface CardProps extends HTMLAttributes<HTMLDivElement> {}
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        "rounded-lg border bg-white/70 backdrop-blur shadow-sm dark:bg-neutral-900 dark:border-neutral-700",
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
        "flex flex-col space-y-1.5 p-4 border-b dark:border-neutral-700",
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
      className={clsx(
        "text-sm text-neutral-600 dark:text-neutral-400",
        className
      )}
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
        "p-4 border-t dark:border-neutral-700 flex items-center justify-end gap-2",
        className
      )}
      {...props}
    />
  );
}

export default Card;
