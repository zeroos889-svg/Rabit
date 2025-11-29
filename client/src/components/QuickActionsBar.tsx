import { memo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  MousePointerClick,
  Shield,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type QuickAction = {
  href: string;
  icon: LucideIcon;
  labelAr: string;
  labelEn: string;
};

interface QuickActionsBarProps {
  readonly isArabic?: boolean;
  readonly className?: string;
  readonly actions?: QuickAction[];
  readonly sticky?: boolean;
}

const DEFAULT_ACTIONS: QuickAction[] = [
  {
    labelAr: "حجز استشارة",
    labelEn: "Book Consultation",
    href: "/consulting/book-new",
    icon: Sparkles,
  },
  {
    labelAr: "جرب الأدوات",
    labelEn: "Try Tools",
    href: "/tools",
    icon: MousePointerClick,
  },
  {
    labelAr: "الأسعار والباقات",
    labelEn: "Pricing & Plans",
    href: "/pricing",
    icon: Shield,
  },
  {
    labelAr: "تسجيل الدخول",
    labelEn: "Login",
    href: "/login",
    icon: UserCheck,
  },
];

export const QuickActionsBar = memo(function QuickActionsBar({
  isArabic,
  className = "",
  actions = DEFAULT_ACTIONS,
  sticky = true,
}: QuickActionsBarProps) {
  const { i18n } = useTranslation();
  const isAr = typeof isArabic === "boolean" ? isArabic : i18n.language === "ar";

  const positionClass = sticky
    ? "sticky top-0 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/85 dark:bg-slate-950/85 backdrop-blur-lg"
    : "relative bg-transparent";

  return (
    <nav
      aria-label={isAr ? "روابط سريعة" : "Quick actions"}
      className={cn("z-30 py-3", positionClass, className)}
    >
      <div className="container">
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            const label = isAr ? action.labelAr : action.labelEn;
            return (
              <Button
                key={`${action.href}-${label}`}
                variant="outline"
                size="sm"
                className="gap-2"
                asChild
              >
                <Link href={action.href} aria-label={label}>
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
});
