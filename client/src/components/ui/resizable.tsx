import * as React from "react";
import {
  PanelGroup,
  Panel,
  PanelResizeHandle,
  type PanelGroupProps,
  type PanelResizeHandleProps,
} from "react-resizable-panels";

import { cn } from "@/lib/utils";

const ResizablePanelGroup = ({ className, ...props }: PanelGroupProps) => (
  <PanelGroup
    className={cn(
      "flex w-full data-[panel-group-direction=vertical]:flex-col",
      className
    )}
    {...props}
  />
);
ResizablePanelGroup.displayName = "ResizablePanelGroup";

const ResizablePanel = Panel;
ResizablePanel.displayName = "ResizablePanel";

const ResizableHandle = ({ className, ...props }: PanelResizeHandleProps) => (
  <PanelResizeHandle
    className={cn(
      "relative flex w-px items-center justify-center bg-border",
      "data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full",
      "data-[resize-handle-active=true]:bg-primary/40",
      "after:absolute after:h-4 after:w-1 after:rounded-sm after:bg-border",
      "data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-4",
      className
    )}
    {...props}
  />
);
ResizableHandle.displayName = "ResizableHandle";

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };
