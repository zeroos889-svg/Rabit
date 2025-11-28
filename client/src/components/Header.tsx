import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Settings,
  LogOut,
  LayoutDashboard,
  Menu,
  X,
  Globe,
  Search,
} from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { GlobalSearch } from "@/components/GlobalSearch";
import { EnhancedThemeToggle } from "@/components/theme/EnhancedThemeToggle";
import { AdvancedNotificationCenter } from "@/components/AdvancedNotificationCenter";

const NAV_LINKS = [
  { href: "/", labelKey: "nav.home", fallback: "الرئيسية" },
  { href: "/services", labelKey: "nav.services", fallback: "الخدمات" },
  { href: "/consulting", labelKey: "nav.consulting", fallback: "الاستشارات" },
  { href: "/pricing", labelKey: "nav.pricing", fallback: "الأسعار" },
  { href: "/contact", labelKey: "nav.contact", fallback: "تواصل معنا" },
];

const EXPERIENCE_SIGNALS = [
  { label: "رضا العملاء", value: "4.9/5" },
  { label: "متوسط التفعيل", value: "3 أيام" },
  { label: "دعم مباشر", value: "24/7" },
];

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mobileMenuId = "primary-nav-panel";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name[0];
  };

  const primaryNavLabel = t("nav.primary", { defaultValue: "التنقل الرئيسي" });
  const localeToggleLabel =
    i18n.language === "ar"
      ? "English"
      : "العربية";
  const localeToggleAria = t("nav.localeToggle", {
    defaultValue: "تبديل اللغة",
  });
  const mobileToggleLabel = isMobileMenuOpen
    ? t("nav.closeMenu", { defaultValue: "إغلاق القائمة" })
    : t("nav.openMenu", { defaultValue: "فتح القائمة" });

  const handleLocaleToggle = () => {
    const nextLang = i18n.language === "ar" ? "en" : "ar";
    i18n.changeLanguage(nextLang);
    if (typeof document !== "undefined") {
      document.documentElement.lang = nextLang;
      document.documentElement.dir = nextLang === "ar" ? "rtl" : "ltr";
    }
  };

  const renderNavLink = (link: (typeof NAV_LINKS)[number], isMobile = false) => {
    const label = t(link.labelKey, { defaultValue: link.fallback });
    const isActive = location === link.href;
    const baseClasses = isMobile
      ? "block w-full rounded-lg px-4 py-2 text-right text-base font-medium"
      : "inline-flex items-center rounded-full px-3 py-2 text-sm font-medium";
    const stateClasses = isActive
      ? "bg-primary/10 text-primary"
      : "text-muted-foreground hover:text-foreground";

    return (
      <Link
        key={link.href}
        href={link.href}
        aria-current={isActive ? "page" : undefined}
        className={`${baseClasses} ${stateClasses}`}
      >
        {label}
      </Link>
    );
  };

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container flex flex-col gap-2 py-2">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-3" aria-label="العودة للرئيسية">
            <BrandMark size="md" showTagline tagline="تجربة عملاء موحدة" />
          </Link>

          <nav className="flex w-auto items-center gap-4" aria-label={primaryNavLabel}>
          {/* Global Search */}
          <div className="hidden md:block">
            <GlobalSearch />
          </div>
          
          <div className="hidden md:flex items-center gap-2">
            {NAV_LINKS.map(link => renderNavLink(link))}
          </div>
          
          {/* Theme Toggle & Notifications */}
          <div className="hidden md:flex items-center gap-2">
            <EnhancedThemeToggle />
            {isAuthenticated && <AdvancedNotificationCenter />}
          </div>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.profilePicture || undefined} />
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {getInitials(user?.name || null)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.name || "مستخدم"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email || ""}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="ml-2 h-4 w-4" />
                    <span>الملف الشخصي</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="ml-2 h-4 w-4" />
                    <span>لوحة التحكم</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="cursor-pointer">
                    <Settings className="ml-2 h-4 w-4" />
                    <span>الإعدادات</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600"
                  onClick={() => logout()}
                >
                  <LogOut className="ml-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">تسجيل الدخول</Link>
              </Button>
              <Button asChild className="gradient-primary text-white">
                <Link href="/signup">إنشاء حساب</Link>
              </Button>
            </div>
          )}
          <div className="flex items-center gap-2">
            {/* Mobile Search Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="بحث"
              onClick={() => {
                // Trigger global search on mobile
                const searchInput = document.querySelector('[data-global-search]') as HTMLInputElement;
                if (searchInput) searchInput.focus();
              }}
            >
              <Search className="h-5 w-5" aria-hidden="true" />
            </Button>
            
            {/* Mobile Theme Toggle */}
            <div className="md:hidden">
              <EnhancedThemeToggle />
            </div>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleLocaleToggle}
              aria-label={localeToggleAria}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline-block text-sm font-medium">
                {localeToggleLabel}
              </span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-expanded={isMobileMenuOpen}
              aria-controls={mobileMenuId}
              aria-label={mobileToggleLabel}
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
          </div>
        </nav>
        </div>

        <div className="hidden md:flex items-center justify-between rounded-2xl border border-border/60 bg-muted/30 px-4 py-2 text-sm">
          <div className="flex items-center gap-6">
            {EXPERIENCE_SIGNALS.map(signal => (
              <div key={signal.label} className="flex items-center gap-2 text-muted-foreground">
                <span className="text-xs text-foreground/80">{signal.label}</span>
                <span className="rounded-full bg-background px-3 py-1 text-xs font-semibold text-primary shadow-sm">
                  {signal.value}
                </span>
              </div>
            ))}
          </div>
          <Button asChild size="sm" className="gradient-primary text-white">
            <Link href="/consulting/book" aria-label="احجز تجربة موجهة">
              احجز تجربة موجهة
            </Link>
          </Button>
        </div>
      </div>
      {isMobileMenuOpen && (
        <div
          id={mobileMenuId}
          className="md:hidden border-b border-border bg-background shadow-lg"
          aria-label={primaryNavLabel}
        >
          <div className="container space-y-4 py-4">
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map(link => renderNavLink(link, true))}
            </div>
            {isAuthenticated ? (
              <div className="flex flex-col gap-2">
                <Link
                  href="/profile"
                  className="w-full rounded-lg border px-4 py-2 text-right text-sm"
                >
                  الملف الشخصي
                </Link>
                <Link
                  href="/dashboard"
                  className="w-full rounded-lg border px-4 py-2 text-right text-sm"
                >
                  لوحة التحكم
                </Link>
                <Button
                  variant="destructive"
                  className="justify-center"
                  onClick={() => logout()}
                >
                  تسجيل الخروج
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="ghost" asChild className="justify-center">
                  <Link href="/login">تسجيل الدخول</Link>
                </Button>
                <Button asChild className="gradient-primary text-white justify-center">
                  <Link href="/signup">إنشاء حساب</Link>
                </Button>
                <Button variant="outline" asChild className="justify-center">
                  <Link href="/trial-accounts">الوضع التجريبي</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
