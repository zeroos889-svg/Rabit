import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Ticket,
  CheckSquare,
  BarChart3,
  Settings,
  FileText,
  ShieldCheck,
  Clock,
  Bell,
  Wrench,
  Menu,
  X,
  Brain,
  Calculator,
  BookOpen,
  GraduationCap,
  UserCheck,
  Target,
  MessageSquare,
  FileOutput,
} from "lucide-react";

interface DashboardLayoutProps {
  readonly children: ReactNode;
  readonly userType?: string;
  readonly title?: string;
}

function getUserTypeTitle(userType: string): string {
  switch (userType) {
    case "employee":
      return "لوحة الموظف";
    case "consultant":
      return "لوحة المستشار";
    default:
      return "لوحة الشركة";
  }
}

export default function DashboardLayout({ children, userType = "company", title }: Readonly<DashboardLayoutProps>) {
  const [location] = useLocation();
  const { t } = useTranslation();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location]);

  const navLabel = t("dashboard.nav", { defaultValue: "التنقل داخل لوحة التحكم" });
  const skipContentLabel = t("dashboard.skipContent", { defaultValue: "تخطي إلى المحتوى" });
  const mobileToggleLabel = isMobileNavOpen
    ? t("dashboard.closeNav", { defaultValue: "إغلاق القائمة" })
    : t("dashboard.openNav", { defaultValue: "فتح القائمة" });
  const mainLabel = t("dashboard.main", { defaultValue: "المحتوى الرئيسي للوحة التحكم" });
  const navId = "dashboard-primary-nav";
  const menuItems = [
    {
      label: "لوحة التحكم",
      labelEn: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "إدارة الموظفين",
      labelEn: "Employees",
      icon: Users,
      href: "/dashboard/employees",
    },
    {
      label: "نظام التوظيف",
      labelEn: "ATS",
      icon: Briefcase,
      href: "/dashboard/ats",
    },
    {
      label: "المقابلات",
      labelEn: "Interviews",
      icon: UserCheck,
      href: "/dashboard/interviews",
    },
    {
      label: "تقييم الأداء",
      labelEn: "Performance",
      icon: Target,
      href: "/dashboard/performance",
    },
    {
      label: "التدريب",
      labelEn: "Training",
      icon: GraduationCap,
      href: "/dashboard/training",
    },
    {
      label: "التحليلات",
      labelEn: "Analytics",
      icon: BarChart3,
      href: "/dashboard/analytics",
    },
    {
      label: "الرسائل",
      labelEn: "Messaging",
      icon: MessageSquare,
      href: "/dashboard/messaging",
    },
    {
      label: "أدوات الذكاء الاصطناعي",
      labelEn: "AI Tools",
      icon: Brain,
      href: "/ai",
    },
    {
      label: "الآلات الحاسبة",
      labelEn: "Calculators",
      icon: Calculator,
      href: "/calculators",
    },
    {
      label: "الأنظمة السعودية",
      labelEn: "Saudi Regulations",
      icon: BookOpen,
      href: "/regulations",
    },
    {
      label: "التذاكر",
      labelEn: "Tickets",
      icon: Ticket,
      href: "/dashboard/tickets",
    },
    {
      label: "المهام",
      labelEn: "Tasks",
      icon: CheckSquare,
      href: "/dashboard/tasks",
    },
    {
      label: "التقارير",
      labelEn: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
    },
    {
      label: "تصدير التقارير",
      labelEn: "Export Reports",
      icon: FileOutput,
      href: "/dashboard/reports-export",
    },
    {
      label: "الشهادات",
      labelEn: "Certificates",
      icon: FileText,
      href: "/dashboard/certificates",
    },
    {
      label: "المراجعة القانونية",
      labelEn: "Legal Check",
      icon: ShieldCheck,
      href: "/dashboard/legal-check",
    },
    {
      label: "التذكيرات",
      labelEn: "Reminders",
      icon: Clock,
      href: "/dashboard/reminders",
    },
    {
      label: "الإشعارات",
      labelEn: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
    },
    {
      label: "الأدوات",
      labelEn: "Tools",
      icon: Wrench,
      href: "/dashboard/tools",
    },
    {
      label: "الإعدادات",
      labelEn: "Settings",
      icon: Settings,
      href: "/dashboard/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <a
        href="#dashboard-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
      >
        {skipContentLabel}
      </a>

      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">رابِط HR</p>
          {(title || userType) && (
            <span className="text-xs text-muted-foreground/80">
              {title || getUserTypeTitle(userType)}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(prev => !prev)}
          aria-expanded={isMobileNavOpen ? "true" : "false"}
          aria-controls={navId}
          aria-label={mobileToggleLabel}
          className="inline-flex items-center justify-center rounded-full border border-border p-2 text-sm font-medium"
        >
          {isMobileNavOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </header>

      <div className="flex flex-col md:flex-row">
        <aside
          id={navId}
          aria-label={navLabel}
          className={cn(
            "bg-gradient-to-b from-blue-600 via-purple-600 to-purple-700 text-white p-4 space-y-4 md:w-64 md:min-h-screen",
            isMobileNavOpen ? "block" : "hidden",
            "md:block"
          )}
        >
          <div className="mb-6">
            <h2 className="font-bold text-xl">رابِط HR</h2>
            <p className="text-xs opacity-75 mt-1">نظام الموارد البشرية</p>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  <item.icon className="w-5 h-5 opacity-75 group-hover:opacity-100" aria-hidden="true" />
                  <span className="text-sm font-medium opacity-90 group-hover:opacity-100">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        <main
          id="dashboard-content"
          tabIndex={-1}
          aria-label={mainLabel}
          className="flex-1 p-6 focus-visible:outline-none"
        >
          {title && (
            <div className="mb-6">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                {title}
              </h1>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}