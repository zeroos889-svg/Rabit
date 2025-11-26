import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { cn } from "@/lib/utils";
import { getDashboardPath } from "@/lib/navigation";
import { useAuth } from "@/_core/hooks/useAuth";
import { useEffect, useState } from "react";

interface NavItem {
  href: string;
  labelAr: string;
  labelEn: string;
}

const nav: NavItem[] = [
  { href: "/", labelAr: "الرئيسية", labelEn: "Home" },
  { href: "/services", labelAr: "الخدمات", labelEn: "Services" },
  { href: "/consulting", labelAr: "الاستشارات", labelEn: "Consulting" },
  { href: "/tools", labelAr: "الأدوات", labelEn: "Tools" },
  { href: "/pricing", labelAr: "الأسعار", labelEn: "Pricing" },
  { href: "/knowledge-base", labelAr: "المعرفة", labelEn: "Knowledge" },
];

export function BrandHeader() {
  const [isArabic, setIsArabic] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    setIsArabic(document.documentElement.lang === "ar");
  }, []);

  const dashboardPath = user ? getDashboardPath(user) : "/login";

  return (
    <header
      className={cn(
        "brand-header relative z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-900/80",
        "border-b border-white/40 dark:border-slate-800/60"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label="Rabit home">
          <img
            src={APP_LOGO}
            alt="Rabit Logo"
            className="h-10 w-10 rounded-2xl shadow-brand-glow group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-500">Rabit</span>
            <span className="font-bold text-lg text-gradient-primary">
              رابط للموارد البشرية
            </span>
          </div>
        </Link>
        <nav
          aria-label={isArabic ? "التنقل الرئيسي" : "Main navigation"}
          className="hidden md:flex items-center gap-6 font-medium"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative text-sm text-slate-700 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-300 transition-colors"
            >
              {isArabic ? item.labelAr : item.labelEn}
              <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-primary transition-all duration-200 group-hover:w-full" />
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/consulting/book"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold bg-white/80 text-brand-700 shadow-brand-soft hover:shadow-brand-glow transition-all dark:bg-brand-600/90 dark:text-white"
          >
            {isArabic ? "اطلب خدمة" : "Book service"}
          </Link>

          {user ? (
            <Link
              href={dashboardPath}
              className="px-4 py-2 rounded-full text-sm font-semibold bg-white text-brand-700 shadow-brand-soft hover:shadow-brand-glow transition-shadow dark:bg-brand-600 dark:text-white"
            >
              {isArabic ? "لوحة التحكم" : "Dashboard"}
            </Link>
          ) : (
            <Link
              href="/login"
              className="px-3 py-1.5 rounded-full text-sm font-semibold bg-white text-brand-700 shadow-brand-soft hover:shadow-brand-glow transition-shadow dark:bg-brand-600 dark:text-white"
            >
              {isArabic ? "تسجيل الدخول" : "Login"}
            </Link>
          )}

          {!user && !loading && (
            <Link
              href="/signup"
              className="px-4 py-2 rounded-full text-sm font-semibold gradient-primary shadow-brand-glow hover:opacity-90 transition-opacity"
            >
              {isArabic ? "إنشاء حساب" : "Sign Up"}
            </Link>
          )}

          {user && (
            <Link
              href="/services"
              className="px-4 py-2 rounded-full text-sm font-semibold gradient-primary shadow-brand-glow hover:opacity-90 transition-opacity"
            >
              {isArabic ? "الخدمات" : "Services"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default BrandHeader;
