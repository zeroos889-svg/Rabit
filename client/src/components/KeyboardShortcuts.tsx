import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { useTheme } from "@/contexts/ThemeContext";
import type { LucideIcon } from "lucide-react";
import {
  AccessibilityIcon,
  BookOpenCheck,
  CommandIcon,
  HelpCircle,
  Languages,
  LayoutDashboard,
  Rocket,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { useLocation } from "wouter";

type ActionGroup = "navigation" | "productivity" | "preferences" | "help";

interface CommandAction {
  id: string;
  label: string;
  description: string;
  shortcut?: string;
  keywords?: string;
  icon: LucideIcon;
  group: ActionGroup;
  perform: () => void;
}

const editableTagNames = new Set(["INPUT", "TEXTAREA", "SELECT"]);

function shouldIgnoreShortcut(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    editableTagNames.has(target.tagName) ||
    target.isContentEditable ||
    target.closest("[contenteditable=true]") !== null
  );
}

function ShortcutRow({
  description,
  keys,
}: {
  description: string;
  keys: string[];
}) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-wrap items-center gap-1">
        {keys.map(key => (
          <kbd
            key={key}
            className="border-border bg-muted text-muted-foreground inline-flex min-w-8 items-center justify-center rounded-md border px-2 py-1 text-xs font-semibold"
          >
            {key}
          </kbd>
        ))}
      </div>
    </div>
  );
}

export function KeyboardShortcuts() {
  const [commandOpen, setCommandOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [, navigate] = useLocation();
  const { i18n } = useTranslation();
  const { reducedMotion, toggleReducedMotion } = useAccessibility();
  const { theme, toggleTheme, switchable } = useTheme();
  const actionsRef = useRef(new Map<string, CommandAction>());

  const isArabic = i18n.language === "ar";
  const t = useCallback(
    (arabic: string, english: string) => (isArabic ? arabic : english),
    [isArabic]
  );

  const runAction = useCallback((id: string) => {
    const action = actionsRef.current.get(id);
    action?.perform();
  }, []);

  const navigationHelper = useCallback((path: string) => () => {
    setCommandOpen(false);
    navigate(path);
  }, [navigate]);

  const preferenceToast = (message: string) => {
    toast.success(message, { duration: 1600 });
  };

  const actions = useMemo<CommandAction[]>(() => {
    const items: CommandAction[] = [
      {
        id: "go-dashboard",
        label: t("لوحة التحكم", "Dashboard"),
        description: t(
          "الانتقال سريعًا إلى لوحة تحكم الشركة",
          "Jump to the company dashboard"
        ),
        shortcut: "⌘G / Ctrl+G",
        icon: LayoutDashboard,
        group: "navigation",
        perform: navigationHelper("/dashboard"),
      },
      {
        id: "open-tools",
        label: t("أدوات الموارد البشرية", "HR tools"),
        description: t(
          "الوصول إلى الحاسبات والمولدات",
          "Open calculators and generators"
        ),
        shortcut: "⌘T / Ctrl+T",
        icon: Sparkles,
        group: "navigation",
        perform: navigationHelper("/tools"),
      },
      {
        id: "open-consulting",
        label: t("حجز استشارة", "Book consulting"),
        description: t(
          "افتح صفحة حجز الاستشارات",
          "Open the consulting booking flow"
        ),
        icon: BookOpenCheck,
        group: "navigation",
        perform: navigationHelper("/consulting/book"),
      },
      {
        id: "open-pricing",
        label: t("خطط الاشتراك", "Pricing"),
        description: t(
          "مقارنة الباقات والاشتراك",
          "Review pricing plans"
        ),
        icon: Rocket,
        group: "navigation",
        perform: navigationHelper("/pricing"),
      },
      {
        id: "open-help",
        label: t("مركز المساعدة", "Help center"),
        description: t(
          "الانتقال إلى قاعدة المعرفة",
          "Go to the knowledge base"
        ),
        icon: HelpCircle,
        group: "help",
        perform: navigationHelper("/knowledge-base"),
      },
      {
        id: "open-shortcuts",
        label: t("إظهار الاختصارات", "Show shortcuts"),
        description: t(
          "عرض قائمة بجميع اختصارات لوحة المفاتيح",
          "Display the keyboard shortcuts guide"
        ),
        shortcut: "Shift + /",
        icon: CommandIcon,
        group: "help",
        perform: () => setGuideOpen(true),
      },
      {
        id: "focus-main",
        label: t("الانتقال للمحتوى", "Skip to content"),
        description: t(
          "انقل التركيز إلى المحتوى الرئيسي",
          "Move focus to the main content region"
        ),
        icon: AccessibilityIcon,
        group: "productivity",
        perform: () => {
          const main = document.getElementById("main-content");
          main?.focus();
        },
      },
      {
        id: "toggle-motion",
        label: reducedMotion
          ? t("تفعيل الحركات", "Enable motion")
          : t("تقليل الحركات", "Reduce motion"),
        description: t(
          "تحكم في تأثيرات الحركة للمستخدمين الحساسين",
          "Control animations for motion-sensitive users"
        ),
        shortcut: "⌘⌥M / Ctrl+Alt+M",
        icon: AccessibilityIcon,
        group: "preferences",
        perform: () => {
          toggleReducedMotion();
          preferenceToast(
            reducedMotion
              ? t("تم تفعيل الحركات.", "Motion effects enabled.")
              : t("تم تقليل الحركات.", "Reduced motion enabled.")
          );
        },
      },
      {
        id: "change-language",
        label: t("تبديل اللغة", "Switch language"),
        description: t(
          "التبديل بين العربية والإنجليزية",
          "Toggle between Arabic and English"
        ),
        shortcut: "⌘L / Ctrl+L",
        icon: Languages,
        group: "preferences",
        perform: () => {
          const next = isArabic ? "en" : "ar";
          i18n.changeLanguage(next);
          document.documentElement.dir = next === "ar" ? "rtl" : "ltr";
          document.documentElement.lang = next;
          preferenceToast(
            next === "ar" ? "تم اختيار العربية" : "English selected"
          );
        },
      },
    ];

    if (switchable && toggleTheme) {
      items.push({
        id: "toggle-theme",
        label: theme === "dark" ? t("وضع النهار", "Light mode") : t("الوضع الداكن", "Dark mode"),
        description: t(
          "تبديل وضع واجهة المستخدم",
          "Toggle between light and dark themes"
        ),
        shortcut: "⌘. / Ctrl+.",
        icon: theme === "dark" ? Sun : Moon,
        group: "preferences",
        perform: () => {
          toggleTheme();
          preferenceToast(
            theme === "dark"
              ? t("تم تفعيل الوضع الفاتح.", "Light theme enabled.")
              : t("تم تفعيل الوضع الداكن.", "Dark theme enabled.")
          );
        },
      });
    }

    return items;
  }, [
    i18n,
    isArabic,
    navigationHelper,
    reducedMotion,
    switchable,
    theme,
    toggleReducedMotion,
    toggleTheme,
    t,
  ]);

  useEffect(() => {
    const map = new Map<string, CommandAction>();
    actions.forEach(action => map.set(action.id, action));
    actionsRef.current = map;
  }, [actions]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (shouldIgnoreShortcut(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        setCommandOpen(prev => !prev);
        return;
      }

      if (event.shiftKey && event.key === "?") {
        event.preventDefault();
        setGuideOpen(prev => !prev);
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === "g") {
        event.preventDefault();
        runAction("go-dashboard");
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === "t") {
        event.preventDefault();
        runAction("open-tools");
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === "l") {
        event.preventDefault();
        runAction("change-language");
        return;
      }

      if ((event.metaKey || event.ctrlKey) && key === ".") {
        event.preventDefault();
        runAction("toggle-theme");
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.altKey && key === "m") {
        event.preventDefault();
        runAction("toggle-motion");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [runAction]);

  const sections: { id: ActionGroup; label: string }[] = [
    { id: "navigation", label: t("التنقل السريع", "Quick navigation") },
    { id: "productivity", label: t("إجراءات سريعة", "Quick actions") },
    { id: "preferences", label: t("التفضيلات", "Preferences") },
    { id: "help", label: t("مساعدة", "Help") },
  ];

  const shortcutsGuide = useMemo(
    () => [
      {
        description: t("فتح لوحة الأوامر", "Open the command palette"),
        keys: ["⌘/Ctrl", "K"],
      },
      {
        description: t(
          "إظهار قائمة الاختصارات",
          "Show the shortcuts reference"
        ),
        keys: ["Shift", "/"],
      },
      {
        description: t(
          "الانتقال إلى لوحة التحكم",
          "Go to the dashboard"
        ),
        keys: ["⌘/Ctrl", "G"],
      },
      {
        description: t("فتح الأدوات الذكية", "Open HR tools"),
        keys: ["⌘/Ctrl", "T"],
      },
      {
        description: t("تبديل اللغة", "Switch language"),
        keys: ["⌘/Ctrl", "L"],
      },
      switchable && toggleTheme
        ? {
            description: t(
              "تبديل الوضع اللوني",
              "Toggle the color theme"
            ),
            keys: ["⌘/Ctrl", "."],
          }
        : null,
      {
        description: t(
          "تقليل أو تفعيل الحركات",
          "Toggle reduced motion"
        ),
        keys: ["⌘/Ctrl", "Alt", "M"],
      },
    ].filter(Boolean) as { description: string; keys: string[] }[],
    [switchable, t, toggleTheme]
  );

  return (
    <>
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title={t("لوحة الأوامر", "Command palette")}
        description={t(
          "ابحث عن أمر أو انتقل بسرعة",
          "Search for a command or jump anywhere"
        )}
        showCloseButton
      >
        <CommandInput
          placeholder={t("اكتب أمرًا أو وجهة", "Type a command or destination")}
        />
        <CommandList>
          <CommandEmpty>
            {t("لا توجد نتائج", "No results found")}
          </CommandEmpty>
          {sections.map(section => {
            const sectionActions = actions.filter(
              action => action.group === section.id
            );
            if (sectionActions.length === 0) {
              return null;
            }
            return (
              <CommandGroup key={section.id} heading={section.label}>
                {sectionActions.map(action => (
                  <CommandItem
                    key={action.id}
                    value={`${action.label} ${action.keywords ?? ""}`}
                    onSelect={() => {
                      action.perform();
                      setCommandOpen(false);
                    }}
                  >
                    <action.icon className="text-muted-foreground size-4" />
                    <div className="flex flex-col text-start">
                      <span>{action.label}</span>
                      <span className="text-muted-foreground text-xs">
                        {action.description}
                      </span>
                    </div>
                    {action.shortcut ? (
                      <CommandShortcut>{action.shortcut}</CommandShortcut>
                    ) : null}
                  </CommandItem>
                ))}
              </CommandGroup>
            );
          })}
        </CommandList>
      </CommandDialog>

      <Dialog open={guideOpen} onOpenChange={setGuideOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{t("اختصارات لوحة المفاتيح", "Keyboard shortcuts")}</DialogTitle>
            <DialogDescription>
              {t(
                "استخدم هذه الاختصارات للتنقل وتنفيذ الأوامر بسرعة",
                "Use these shortcuts to move faster across the product"
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {shortcutsGuide.map(shortcut => (
              <ShortcutRow
                key={shortcut.description}
                description={shortcut.description}
                keys={shortcut.keys}
              />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
