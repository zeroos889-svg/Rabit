import { ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-purple-600 text-white hover:bg-purple-700",
        outline:
          "border border-gray-300 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800",
        ghost: "hover:bg-gray-100 dark:hover:bg-gray-800",
        destructive: "bg-red-600 text-white hover:bg-red-700",
        secondary:
          "bg-white text-purple-600 border border-purple-600 hover:bg-purple-50 dark:bg-transparent dark:text-purple-300 dark:border-purple-400 dark:hover:bg-purple-500/10",
        link: "text-purple-600 underline-offset-4 hover:underline focus-visible:underline bg-transparent shadow-none px-0",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  asChild?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading,
      disabled,
      children,
      asChild,
      ...props
    },
    ref
  ) => {
    const Comp: any = asChild ? "span" : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-label={props["aria-label"] || (size === "icon" ? "Button" : undefined)}
        {...props}
      >
        {isLoading ? <span className="animate-pulse">...</span> : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
export default Button;
