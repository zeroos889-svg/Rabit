import { memo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  MousePointerClick,
  Shield,
  UserCheck,
} from "lucide-react";

interface QuickActionsBarProps {
  readonly isArabic?: boolean;
  readonly className?: string;
}

export const QuickActionsBar = memo(function QuickActionsBar({
  isArabic,
  className = "",
}: QuickActionsBarProps) {
  const { i18n } = useTranslation();
  const isAr = typeof isArabic === "boolean" ? isArabic : i18n.language === "ar";

  const actions = [
    {
      label: isAr ? "حجز استشارة" : "Book Consultation",
      href: "/consulting/book-new",
      icon: Sparkles,
    },
    {
      label: isAr ? "جرب الأدوات" : "Try Tools",
      href: "/tools",
      icon: MousePointerClick,
    },
    {
      label: isAr ? "الأسعار والباقات" : "Pricing & Plans",
      href: "/pricing",
      icon: Shield,
    },
    {
      label: isAr ? "تسجيل الدخول" : "Login",
      href: "/login",
      icon: UserCheck,
    },
  ];

  return (
    <section
      className={`sticky top-0 z-30 border-b border-slate-200/70 dark:border-slate-800/70 bg-white/85 dark:bg-slate-950/85 backdrop-blur-lg py-3 ${className}`}
    >
      <div className="container">
        <div className="flex flex-wrap justify-center gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button key={action.href} variant="outline" size="sm" className="gap-2" asChild>
                <Link href={action.href}>
                  <Icon className="w-4 h-4" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </div>
    </section>
  );
});
