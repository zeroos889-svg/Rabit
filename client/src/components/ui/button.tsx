import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-white shadow-brand-glow bg-gradient-to-r from-brand-500 via-brand-600 to-brand-700 hover:brightness-95",
        outline:
          "border border-brand-100/70 bg-white/80 text-foreground hover:bg-brand-50/80 hover:text-brand-700 dark:border-slate-700/80 dark:bg-transparent",
        ghost: "text-foreground hover:bg-brand-50/60 dark:hover:bg-slate-900",
        destructive: "bg-destructive text-destructive-foreground hover:bg-red-600/90",
        secondary:
          "bg-brand-50 text-brand-700 border border-brand-100 hover:bg-brand-100/70",
        link:
          "text-brand-600 underline-offset-4 hover:underline focus-visible:underline bg-transparent shadow-none px-0",
        cta:
          "rounded-full gradient-primary text-white font-semibold shadow-brand-glow hover:translate-y-0.5 hover:shadow-brand-soft",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10 p-0 flex items-center justify-center",
        cta: "h-12 sm:h-14 px-6 sm:px-8 text-base sm:text-lg gap-2",
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
    const Comp: any = asChild ? Slot : "button";
    const { type, ...rest } = props;
    const buttonProps = asChild
      ? {}
      : {
          type: type ?? "button",
          disabled: disabled || isLoading,
        };

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...rest}
        {...buttonProps}
        aria-label={props["aria-label"] || (size === "icon" ? "Button" : undefined)}
      >
        {isLoading ? <span className="animate-pulse">...</span> : children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { buttonVariants };
export default Button;
