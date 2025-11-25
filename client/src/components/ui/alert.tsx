import * as React from "react";
import { cn } from "@/lib/utils";

const alertVariants = {
  default:
    "text-foreground border border-border bg-background [&>[data-slot=alert-title]]:text-foreground",
  destructive:
    "text-destructive border border-destructive/50 bg-destructive/10 [&>[data-slot=alert-title]]:text-destructive",
};

type AlertVariant = keyof typeof alertVariants;

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        data-slot="alert"
        className={cn(
          "relative w-full rounded-lg px-4 py-3 text-sm transition-colors",
          alertVariants[variant],
          className
        )}
        {...props}
      />
    );
  }
);
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      data-slot="alert-title"
      className={cn("mb-1 font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    data-slot="alert-description"
    className={cn("text-sm leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
