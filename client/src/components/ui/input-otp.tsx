import * as React from "react";
import { OTPInput, OTPInputContext } from "input-otp";
import { cn } from "@/lib/utils";

type InputOTPElement = React.ElementRef<typeof OTPInput>;
type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput> & {
  containerClassName?: string;
};

const InputOTP = React.forwardRef<InputOTPElement, InputOTPProps>(
  ({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    data-slot="input-otp"
    containerClassName={cn(
      "flex items-center gap-2",
      containerClassName
    )}
    className={cn("appearance-none", className)}
    {...props}
  />
  )
);
InputOTP.displayName = "InputOTP";

const InputOTPGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<"div">>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-2", className)} {...props} />
  )
);
InputOTPGroup.displayName = "InputOTPGroup";

type InputOTPSlotProps = React.ComponentPropsWithoutRef<"div"> & {
  index: number;
};

const InputOTPSlot = React.forwardRef<HTMLDivElement, InputOTPSlotProps>(
  ({ index, className, ...props }, ref) => {
    const inputOTPContext = React.useContext(OTPInputContext);
    const char = inputOTPContext?.slots[index]?.char;
    const hasChar = Boolean(char);

    return (
      <div
        ref={ref}
        className={cn(
          "flex h-12 w-10 items-center justify-center rounded-md border border-input text-lg font-semibold",
          "bg-background shadow-sm transition-all",
          "data-[active=true]:border-ring data-[active=true]:ring-2 data-[active=true]:ring-ring/20",
          "data-[has-char=true]:border-primary",
          className
        )}
        data-active={inputOTPContext?.slots[index]?.hasFakeCaret}
        data-has-char={hasChar}
        {...props}
      >
        {hasChar ? char : <span className="text-muted-foreground">•</span>}
      </div>
    );
  }
);
InputOTPSlot.displayName = "InputOTPSlot";

export { InputOTP, InputOTPGroup, InputOTPSlot };
