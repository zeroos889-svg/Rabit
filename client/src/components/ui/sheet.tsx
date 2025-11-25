import * as React from "react";
import { cn } from "@/lib/utils";
import { Drawer as VaulDrawer } from "vaul";

const Sheet = ({ ...props }: React.ComponentProps<typeof VaulDrawer.Root>) => (
  <VaulDrawer.Root direction="right" {...props} />
);
Sheet.displayName = "Sheet";

const SheetTrigger = VaulDrawer.Trigger;
const SheetClose = VaulDrawer.Close;

const SheetPortal = ({ ...props }: React.ComponentProps<typeof VaulDrawer.Portal>) => (
  <VaulDrawer.Portal {...props} />
);
SheetPortal.displayName = "SheetPortal";

const SheetOverlay = React.forwardRef<
  React.ElementRef<typeof VaulDrawer.Overlay>,
  React.ComponentPropsWithoutRef<typeof VaulDrawer.Overlay>
>(({ className, ...props }, ref) => (
  <VaulDrawer.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/40",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
      "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
));
SheetOverlay.displayName = "SheetOverlay";

type SheetContentProps = React.ComponentPropsWithoutRef<typeof VaulDrawer.Content> & {
  side?: "left" | "right";
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof VaulDrawer.Content>,
  SheetContentProps
>(({ className, side = "right", children, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <VaulDrawer.Content
      ref={ref}
      className={cn(
        "fixed inset-y-0 z-50 m-0 h-auto w-full border-l border-border bg-background p-6 shadow-lg",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        side === "right" && "right-0 w-full max-w-md",
        side === "left" && "left-0 w-full max-w-md border-l-0 border-r",
        className
      )}
      {...props}
    >
      <div className="absolute left-1/2 top-8 h-2 w-24 -translate-x-1/2 rounded-full bg-muted" />
      <div className="mt-10 h-full overflow-y-auto">{children}</div>
    </VaulDrawer.Content>
  </SheetPortal>
));
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("text-center sm:text-left", className)} {...props} />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("text-lg font-semibold text-foreground", className)}
      {...props}
    />
  )
);
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
