import * as React from "react";
import { Slash } from "lucide-react";
import { cn } from "@/lib/utils";

type BreadcrumbProps = React.ComponentProps<"nav"> & {
  separator?: React.ReactNode;
};

const Breadcrumb = ({ className, separator, ...props }: BreadcrumbProps) => (
  <nav
    aria-label="breadcrumb"
    className={cn("flex w-full items-center text-sm", className)}
    {...props}
  >
    <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
      {React.Children.map(props.children, (child, index) => (
        <React.Fragment key={index}>
          {child}
          {index < React.Children.count(props.children) - 1 ? (
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          ) : null}
        </React.Fragment>
      ))}
    </ol>
  </nav>
);

const BreadcrumbList = ({ className, ...props }: React.ComponentProps<"ol">) => (
  <ol
    className={cn("flex flex-wrap items-center gap-1 text-sm", className)}
    {...props}
  />
);

const BreadcrumbItem = ({ className, ...props }: React.ComponentProps<"li">) => (
  <li className={cn("inline-flex items-center gap-1", className)} {...props} />
);

const BreadcrumbLink = ({ className, ...props }: React.ComponentProps<"a">) => (
  <a
    className={cn(
      "transition-colors hover:text-foreground text-muted-foreground",
      className
    )}
    {...props}
  />
);

const BreadcrumbPage = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span className={cn("font-medium text-foreground", className)} {...props} />
);

const BreadcrumbSeparator = ({
  className,
  children,
  ...props
}: React.ComponentProps<"span">) => (
  <span className={cn("text-muted-foreground", className)} {...props}>
    {children ?? <Slash className="h-3 w-3" />}
  </span>
);

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<"span">) => (
  <span className={cn("text-muted-foreground", className)} {...props}>
    …
  </span>
);

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
