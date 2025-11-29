import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_LOGO, APP_TITLE } from "@/const";
import { useTranslation } from "react-i18next";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Calendar,
  FileText,
  MessageCircle,
  Settings,
  LogOut,
  Menu,
  Building2,
  ExternalLink,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminLayoutProps {
  children: ReactNode;
}

export function AdminLayout({ children }: Readonly<AdminLayoutProps>) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const { t } = useTranslation();
  const navId = "admin-primary-nav";

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location]);

  // Redirect if not admin
  if (user && user.role !== "admin") {
    globalThis.location.href = "/";
    return null;
  }

  const menuItems = [
    { icon: LayoutDashboard, label: "لوحة التحكم", href: "/admin" },
    { icon: Users, label: "المستخدمون", href: "/admin/users" },
    { icon: CreditCard, label: "الاشتراكات", href: "/admin/subscriptions" },
    { icon: Calendar, label: "الحجوزات", href: "/admin/bookings" },
    { icon: MessageCircle, label: "الدردشة المباشرة", href: "/admin/chat" },
    { icon: FileText, label: "سجل النشاطات", href: "/admin/audit-logs" },
    { 
      icon: Building2, 
      label: "مركز القيادة HQ", 
      href: "http://localhost:3001", 
      external: true 
    },
    { icon: Settings, label: "الإعدادات", href: "/admin/settings" },
  ];

  const navLabel = t("dashboard.nav", { defaultValue: "التنقل داخل لوحة التحكم" });
  const skipLabel = t("dashboard.skipContent", { defaultValue: "تخطي إلى المحتوى" });
  const mobileToggleLabel = isMobileNavOpen
    ? t("dashboard.closeNav", { defaultValue: "إغلاق القائمة" })
    : t("dashboard.openNav", { defaultValue: "فتح القائمة" });
  const mainLabel = t("dashboard.main", { defaultValue: "المحتوى الرئيسي للوحة التحكم" });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <a
        href="#admin-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
      >
        {skipLabel}
      </a>

      <header className="md:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div>
          <p className="text-sm font-semibold text-muted-foreground">لوحة تحكم الإدارة</p>
          <span className="text-xs text-muted-foreground/80">{APP_TITLE}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsMobileNavOpen(prev => !prev)}
          aria-controls={navId}
          aria-expanded={isMobileNavOpen ? "true" : "false"}
          aria-label={mobileToggleLabel}
          className="inline-flex items-center justify-center rounded-full border border-border p-2"
        >
          {isMobileNavOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </header>

      {isMobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          aria-label={t("dashboard.closeOverlay", { defaultValue: "اغلاق قائمة التنقل" })}
          onClick={() => setIsMobileNavOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id={navId}
        aria-label={navLabel}
        className={cn(
          "fixed top-0 right-0 z-40 h-screen transition-transform bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700",
          sidebarOpen ? "w-64" : "w-20",
          isMobileNavOpen ? "translate-x-0" : "translate-x-full",
          "md:translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {sidebarOpen && (
              <Link href="/admin">
                <button type="button" className="flex items-center gap-2">
                  {APP_LOGO && (
                    <img src={APP_LOGO} alt={APP_TITLE} className="h-8" />
                  )}
                  <span className="font-bold text-lg">{APP_TITLE}</span>
                </button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-pressed={sidebarOpen ? "true" : "false"}
              aria-label={sidebarOpen ? t("dashboard.collapseNav", { defaultValue: "تصغير القائمة" }) : t("dashboard.expandNav", { defaultValue: "توسيع القائمة" })}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </Button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 p-4 space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location?.startsWith(item.href);
              const isExternal = item.external;
              
              if (isExternal) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    aria-label={`${item.label} - رابط خارجي`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span>{item.label}</span>
                        <ExternalLink className="h-4 w-4 ml-auto opacity-50" />
                      </>
                    )}
                  </a>
                );
              }
              
              return (
                <Link key={item.href} href={item.href}>
                  <button
                    type="button"
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-gray-100 dark:hover:bg-gray-700"
                    )}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.label}</span>}
                  </button>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            {sidebarOpen && (
              <div className="mb-3">
                <p className="text-sm font-medium">
                  {user?.name || "مدير النظام"}
                </p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            )}
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => logout()}
            >
              <LogOut className="h-5 w-5 me-2" />
              {sidebarOpen && <span>تسجيل الخروج</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        id="admin-content"
        tabIndex={-1}
        aria-label={mainLabel}
        className={cn(
          "transition-all duration-200 bg-gray-50/50 dark:bg-gray-950/50",
          sidebarOpen ? "md:ms-64" : "md:ms-20",
          "pt-16 md:pt-0"
        )}
      >
        {children}
      </main>
    </div>
  );
}
