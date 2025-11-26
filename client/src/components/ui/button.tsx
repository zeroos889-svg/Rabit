import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-brand-600 shadow-brand-soft",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-secondary hover:text-secondary-foreground",
        ghost: "text-foreground hover:bg-secondary/60",
        destructive: "bg-destructive text-destructive-foreground hover:bg-red-600/90",
        secondary:
          "bg-secondary text-secondary-foreground border border-transparent hover:border-brand-200",
        link: "text-brand-600 underline-offset-4 hover:underline focus-visible:underline bg-transparent shadow-none px-0",
        cta: "rounded-full gradient-primary text-white font-semibold shadow-brand-glow hover:translate-y-0.5 hover:shadow-brand-soft",
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
