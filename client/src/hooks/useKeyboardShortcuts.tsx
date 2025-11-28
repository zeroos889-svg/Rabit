import { useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "@/lib/toast";

// Types
interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description: string;
  descriptionAr: string;
  action: () => void;
  category: "navigation" | "actions" | "general";
}

interface UseKeyboardShortcutsOptions {
  enabled?: boolean;
  shortcuts?: KeyboardShortcut[];
}

// Default Shortcuts Configuration
const getDefaultShortcuts = (
  navigate: (path: string) => void,
  actions: {
    openSearch: () => void;
    openNotifications: () => void;
    toggleTheme: () => void;
    openHelp: () => void;
  }
): KeyboardShortcut[] => [
  // Navigation
  {
    key: "h",
    ctrl: true,
    description: "Go to Home",
    descriptionAr: "الذهاب للرئيسية",
    action: () => navigate("/dashboard"),
    category: "navigation",
  },
  {
    key: "e",
    ctrl: true,
    description: "Go to Employees",
    descriptionAr: "الذهاب للموظفين",
    action: () => navigate("/employees"),
    category: "navigation",
  },
  {
    key: "l",
    ctrl: true,
    description: "Go to Leave Management",
    descriptionAr: "الذهاب لإدارة الإجازات",
    action: () => navigate("/leave"),
    category: "navigation",
  },
  {
    key: "p",
    ctrl: true,
    description: "Go to Payroll",
    descriptionAr: "الذهاب للرواتب",
    action: () => navigate("/payroll"),
    category: "navigation",
  },
  {
    key: "r",
    ctrl: true,
    description: "Go to Reports",
    descriptionAr: "الذهاب للتقارير",
    action: () => navigate("/reports"),
    category: "navigation",
  },
  {
    key: "s",
    ctrl: true,
    description: "Go to Settings",
    descriptionAr: "الذهاب للإعدادات",
    action: () => navigate("/settings"),
    category: "navigation",
  },

  // Actions
  {
    key: "k",
    ctrl: true,
    description: "Open Search",
    descriptionAr: "فتح البحث",
    action: actions.openSearch,
    category: "actions",
  },
  {
    key: "/",
    description: "Focus Search",
    descriptionAr: "التركيز على البحث",
    action: actions.openSearch,
    category: "actions",
  },
  {
    key: "n",
    ctrl: true,
    description: "Open Notifications",
    descriptionAr: "فتح الإشعارات",
    action: actions.openNotifications,
    category: "actions",
  },
  {
    key: "d",
    ctrl: true,
    shift: true,
    description: "Toggle Dark Mode",
    descriptionAr: "تبديل الوضع الداكن",
    action: actions.toggleTheme,
    category: "actions",
  },

  // General
  {
    key: "?",
    shift: true,
    description: "Show Keyboard Shortcuts",
    descriptionAr: "إظهار اختصارات لوحة المفاتيح",
    action: actions.openHelp,
    category: "general",
  },
  {
    key: "Escape",
    description: "Close Modal/Dialog",
    descriptionAr: "إغلاق النافذة",
    action: () => {
      // Dispatch escape event for modals
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    },
    category: "general",
  },
];

// Hook
export function useKeyboardShortcuts(
  navigate: (path: string) => void,
  actions: {
    openSearch: () => void;
    openNotifications: () => void;
    toggleTheme: () => void;
    openHelp: () => void;
  },
  options: UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, shortcuts: customShortcuts } = options;
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const shortcuts = customShortcuts || getDefaultShortcuts(navigate, actions);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Don't trigger shortcuts when typing in inputs
      const target = event.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs (like Escape)
        if (event.key !== "Escape") return;
      }

      // Find matching shortcut
      const matchedShortcut = shortcuts.find((shortcut) => {
        const keyMatch =
          event.key.toLowerCase() === shortcut.key.toLowerCase() ||
          event.code === `Key${shortcut.key.toUpperCase()}`;
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;

        return keyMatch && ctrlMatch && altMatch && shiftMatch;
      });

      if (matchedShortcut) {
        event.preventDefault();
        event.stopPropagation();
        matchedShortcut.action();
      }
    },
    [enabled, shortcuts]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Format shortcut key for display
  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const parts: string[] = [];
    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;

    if (shortcut.ctrl) parts.push(isMac ? "⌘" : "Ctrl");
    if (shortcut.alt) parts.push(isMac ? "⌥" : "Alt");
    if (shortcut.shift) parts.push("⇧");
    parts.push(shortcut.key.toUpperCase());

    return parts.join(isMac ? "" : "+");
  };

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return {
    shortcuts,
    groupedShortcuts,
    formatShortcut,
    getDescription: (shortcut: KeyboardShortcut) =>
      isArabic ? shortcut.descriptionAr : shortcut.description,
  };
}

// Keyboard Shortcuts Display Component
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: ReturnType<typeof useKeyboardShortcuts>;
}

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
  shortcuts,
}: KeyboardShortcutsDialogProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const categoryLabels = {
    navigation: isArabic ? "التنقل" : "Navigation",
    actions: isArabic ? "الإجراءات" : "Actions",
    general: isArabic ? "عام" : "General",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            {isArabic ? "اختصارات لوحة المفاتيح" : "Keyboard Shortcuts"}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? "استخدم هذه الاختصارات للتنقل بسرعة"
              : "Use these shortcuts to navigate quickly"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {Object.entries(shortcuts.groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h4>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-accent"
                  >
                    <span className="text-sm">
                      {shortcuts.getDescription(shortcut)}
                    </span>
                    <Badge variant="outline" className="font-mono">
                      {shortcuts.formatShortcut(shortcut)}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default useKeyboardShortcuts;
