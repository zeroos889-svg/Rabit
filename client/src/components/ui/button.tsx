import { ButtonHTMLAttributes, forwardRef } from "react";
import { Slot } from "@radix-ui/react-slot";
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
        cta: "rounded-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-amber-400 text-white font-semibold shadow-lg hover:shadow-xl hover:brightness-105 active:translate-y-px",
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
