import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, checked, onCheckedChange, ...props }, ref) => {
    return (
      <label className={cn("inline-flex items-center gap-2 cursor-pointer", className)}>
        <input
          ref={ref}
          type="checkbox"
          className="h-4 w-4 rounded border border-gray-300 text-purple-600 focus:ring-purple-500"
          checked={!!checked}
          onChange={(e) => onCheckedChange?.(e.target.checked)}
          {...props}
        />
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export default Checkbox;