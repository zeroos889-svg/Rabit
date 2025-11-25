import * as React from "react";
import clsx from "clsx";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  size?: "sm" | "md" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, size = "md", type = "text", ...props }, ref) => {
    const sizes = {
      sm: "h-8 text-sm",
      md: "h-10 text-sm",
      lg: "h-12 text-base",
    }[size];
    return (
      <input
        ref={ref}
        type={type}
        className={clsx(
          "flex w-full rounded-md border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-900 px-3 py-2 ring-offset-background placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          sizes,
          className
        )}
        aria-label={props["aria-label"] || "Input field"}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";
