/**
 * الصفحة الرئيسية المُعاد تصميمها - رابِط
 * Modern Landing Page with Best Practices
 * 
 * Features:
 * - Hero section with animated gradient
 * - Smooth scroll animations
 * - Modern glassmorphism effects
 * - Optimized performance with lazy loading
 * - Fully responsive design
 * - Accessibility compliant (WCAG 2.1)
 */

import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getLoginUrl, APP_LOGO } from "@/const";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { AnnouncementBar } from "@/components/AnnouncementBar";
import { 
  useEffect, 
  useState, 
  useCallback,
  memo,
  useRef,
} from "react";
import {
  Building2,
  UserCheck,
  Users,
  Calculator,
  Calendar,
  FileText,
  CheckCircle2,
  Brain,
  Smartphone,
  BarChart3,
  Shield,
  Headphones,
  ArrowRight,
  ArrowLeft,
  Play,
  Menu,
  X,
  Sparkles,
  Zap,
  Clock,
  Award,
  TrendingUp,
  Star,
  ChevronDown,
  MousePointerClick,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types & Interfaces
// ============================================================================

interface FeatureItem {
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  color: string;
}

interface CategoryItem {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  gradient: string;
  features: string[];
  price?: string;
  badge?: string;
  popular?: boolean;
}

interface StepItem {
  number: string;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
}

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  company: string;
  quote: string;
  avatar: string;
  rating: number;
}

// ============================================================================
// Constants
// ============================================================================

const FEATURES: FeatureItem[] = [
  {
    titleKey: "features.saudi_compliant",
    descKey: "features.saudi_compliant.desc",
    icon: Shield,
    color: "from-emerald-500 to-teal-600",
  },
  {
    titleKey: "features.ai_powered",
    descKey: "features.ai_powered.desc",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
  },
  {
    titleKey: "features.easy_to_use",
    descKey: "features.easy_to_use.desc",
    icon: Smartphone,
    color: "from-blue-500 to-cyan-600",
  },
  {
    titleKey: "features.reports",
    descKey: "features.reports.desc",
    icon: BarChart3,
    color: "from-orange-500 to-amber-600",
  },
  {
    titleKey: "features.security",
    descKey: "features.security.desc",
    icon: Shield,
    color: "from-rose-500 to-pink-600",
  },
  {
    titleKey: "features.support",
    descKey: "features.support.desc",
    icon: Headphones,
    color: "from-indigo-500 to-blue-600",
  },
];

const CATEGORIES: CategoryItem[] = [
  {
    id: "companies",
    titleKey: "category.companies",
    descKey: "category.companies.desc",
    icon: Building2,
    gradient: "from-blue-600 via-blue-500 to-cyan-500",
    features: [
      "category.companies.feature1",
      "category.companies.feature2",
      "category.companies.feature3",
      "category.companies.feature4",
    ],
  },
  {
    id: "individual",
    titleKey: "category.individual",
    descKey: "category.individual.desc",
    icon: UserCheck,
    gradient: "from-violet-600 via-purple-500 to-fuchsia-500",
    features: [
      "category.individual.feature1",
      "category.individual.feature2",
      "category.individual.feature3",
      "category.individual.feature4",
    ],
    price: "category.individual.price",
    badge: "الأكثر شعبية",
    popular: true,
  },
  {
    id: "employee",
    titleKey: "category.employee",
    descKey: "category.employee.desc",
    icon: Users,
    gradient: "from-emerald-600 via-green-500 to-teal-500",
    features: [
      "category.employee.feature1",
      "category.employee.feature2",
      "category.employee.feature3",
      "category.employee.feature4",
    ],
    price: "category.employee.price",
  },
];

const HOW_STEPS: StepItem[] = [
  { number: "1", titleKey: "how.step1.title", descKey: "how.step1.desc", icon: MousePointerClick },
  { number: "2", titleKey: "how.step2.title", descKey: "how.step2.desc", icon: FileText },
  { number: "3", titleKey: "how.step3.title", descKey: "how.step3.desc", icon: Zap },
  { number: "4", titleKey: "how.step4.title", descKey: "how.step4.desc", icon: TrendingUp },
];

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    name: "أحمد الشمري",
    role: "مدير الموارد البشرية",
    company: "شركة النخيل للتطوير",
    quote: "رابِط غيّر طريقة إدارتنا للموارد البشرية بالكامل. وفّرنا 60% من الوقت والجهد.",
    avatar: "أ",
    rating: 5,
  },
  {
    id: 2,
    name: "سارة القحطاني",
    role: "مديرة العمليات",
    company: "مجموعة الريادة",
    quote: "الدعم الفني ممتاز والنظام متوافق تماماً مع أنظمة العمل السعودية.",
    avatar: "س",
    rating: 5,
  },
  {
    id: 3,
    name: "محمد العتيبي",
    role: "مؤسس ورائد أعمال",
    company: "شركة الأفق الرقمي",
    quote: "أفضل استثمار قمنا به هذا العام. النظام سهل ومرن ويتطور باستمرار.",
    avatar: "م",
    rating: 5,
  },
];

const STATS = [
  { value: "500+", label: "شركة تثق بنا", icon: Building2 },
  { value: "10,000+", label: "مستخدم نشط", icon: Users },
  { value: "99%", label: "نسبة الرضا", icon: Star },
  { value: "24/7", label: "دعم فني", icon: Clock },
];

// ============================================================================
// Custom Hooks
// ============================================================================

/**
 * Hook لاكتشاف العناصر في viewport
 */
const DEFAULT_INTERSECTION_OPTIONS: IntersectionObserverInit = { threshold: 0.1 };

function useIntersectionObserver(
  options: IntersectionObserverInit = DEFAULT_INTERSECTION_OPTIONS
) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

/**
 * Hook للتحكم في القائمة المتنقلة
 */
function useMobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return { isOpen, toggle, close };
}

// ============================================================================
// Animated Components
// ============================================================================

const delayClassMap: Record<number, string> = {
  0: "animate-delay-0",
  50: "animate-delay-50",
  100: "animate-delay-100",
  150: "animate-delay-150",
  200: "animate-delay-200",
  250: "animate-delay-250",
  300: "animate-delay-300",
  350: "animate-delay-350",
  400: "animate-delay-400",
  450: "animate-delay-450",
  500: "animate-delay-500",
  550: "animate-delay-550",
  600: "animate-delay-600",
  650: "animate-delay-650",
  700: "animate-delay-700",
};

const getDelayClass = (value: number | undefined) =>
  (value !== undefined && delayClassMap[value]) || delayClassMap[0];

/**
 * مكون الحركة عند الظهور
 */
const AnimateOnScroll = memo(function AnimateOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useIntersectionObserver();
  const delayClass = getDelayClass(delay);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8",
        delayClass,
        className
      )}
    >
      {children}
    </div>
  );
});

/**
 * بطاقة متحركة مع تأثير الزجاج
 */
const GlassCard = memo(function GlassCard({
  children,
  className,
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl border border-white/20 bg-white/80 dark:bg-slate-900/80",
        "backdrop-blur-xl shadow-xl",
        hover && "transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
        className
      )}
    >
      {children}
    </div>
  );
});

/**
 * زر متدرج محسّن
 */
const GradientButton = memo(function GradientButton({
  children,
  className,
  size = "default",
  onClick,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "lg" | "sm";
  onClick?: () => void;
}) {
  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    default: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative group inline-flex items-center justify-center font-semibold text-white",
        "rounded-xl overflow-hidden transition-all duration-300",
        "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-[length:200%_100%]",
        "hover:bg-[position:100%_0] hover:shadow-xl hover:shadow-purple-500/25",
        "active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );
});

// ============================================================================
// Section Components
// ============================================================================

/**
 * شريط العرض الترويجي
 */
const PromoBanner = memo(function PromoBanner() {
  const { t } = useTranslation();

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4yIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIyIi8+PC9nPjwvZz48L3N2Zz4=')] animate-[slide_20s_linear_infinite]" />
      </div>
      
      <div className="container relative py-3">
        <div className="flex items-center justify-center gap-4 flex-wrap text-white">
          <div className="flex items-center gap-2">
            <span className="text-2xl animate-bounce">🎁</span>
            <span className="font-bold">{t("offer.special", "عرض خاص!")}</span>
          </div>
          <p className="text-sm md:text-base font-medium">
            {t("offer.description", "احصل على شهر مجاني عند الاشتراك الآن")}
          </p>
          <Button
            size="sm"
            className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-lg"
          >
            {t("offer.button", "ابدأ الآن")}
          </Button>
        </div>
      </div>
    </div>
  );
});

/**
 * رأس الصفحة المحسّن
 */
const Header = memo(function Header() {
  const { t } = useTranslation();
  const { isOpen, toggle, close } = useMobileMenu();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const redirectToLogin = useCallback(() => {
    const loginUrl = getLoginUrl();
    globalThis.location.href = loginUrl;
  }, []);

  const navItems = [
    { href: "#home", label: t("nav.home", "الرئيسية") },
    { href: "/consulting", label: t("nav.consulting", "الاستشارات"), isLink: true },
    { href: "/courses", label: t("nav.courses", "الدورات"), isLink: true },
    { href: "/knowledge-base", label: t("nav.knowledge_base", "قاعدة المعرفة"), isLink: true },
    { href: "#tools", label: t("nav.tools", "الأدوات") },
    { href: "#pricing", label: t("nav.pricing", "الأسعار") },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-lg border-b border-white/20"
          : "bg-transparent"
      )}
    >
      <div className="container">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-50" />
              <img
                src={APP_LOGO}
                alt="Rabit"
                className="relative h-10 w-10"
                width={40}
                height={40}
              />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              رابِط
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) =>
              item.isLink ? (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                >
                  {item.label}
                </a>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              className="hidden md:inline-flex"
              onClick={redirectToLogin}
            >
              {t("btn.login", "تسجيل الدخول")}
            </Button>
            <GradientButton
              size="sm"
              className="hidden md:inline-flex"
              onClick={redirectToLogin}
            >
              {t("btn.start_free", "ابدأ مجاناً")}
            </GradientButton>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={toggle}
              aria-label={isOpen ? "إغلاق القائمة" : "فتح القائمة"}
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "lg:hidden fixed inset-x-0 top-16 bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
          "transition-all duration-300 ease-in-out z-50",
          isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        <nav className="container py-6 space-y-2">
          {navItems.map((item) =>
            item.isLink ? (
              <Link
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                onClick={close}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.href}
                href={item.href}
                className="block px-4 py-3 text-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
                onClick={close}
              >
                {item.label}
              </a>
            )
          )}
          <div className="pt-6 space-y-3 border-t">
            <Button variant="outline" className="w-full" onClick={redirectToLogin}>
              {t("btn.login", "تسجيل الدخول")}
            </Button>
            <GradientButton className="w-full" onClick={redirectToLogin}>
              {t("btn.start_free", "ابدأ مجاناً")}
            </GradientButton>
          </div>
        </nav>
      </div>
    </header>
  );
});

/**
 * قسم البطل (Hero Section)
 */
const HeroSection = memo(function HeroSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const redirectToLogin = useCallback(() => {
    globalThis.location.href = getLoginUrl();
  }, []);

  return (
    <section
      id="home"
      className="relative min-h-[90vh] flex items-center overflow-hidden"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[100px] animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] bg-pink-500/20 rounded-full blur-[80px] animate-pulse delay-500" />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiM5Mzk0YTUiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      </div>

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="space-y-8">
            <AnimateOnScroll>
              <Badge className="px-4 py-2 text-sm font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
                <Sparkles className="w-4 h-4 me-2" />
                {t("hero.badge", "منصة متوافقة مع نظام العمل السعودي")}
              </Badge>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
                  {t("hero.title.part1", "مستقبل إدارة")}
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {t("hero.title.part2", "الموارد البشرية")}
                </span>
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
                {t(
                  "hero.description",
                  "منصة ذكية شاملة لإدارة الموارد البشرية، متوافقة 100% مع أنظمة العمل السعودية، مدعومة بالذكاء الاصطناعي"
                )}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300}>
              <div className="flex flex-col sm:flex-row gap-4">
                <GradientButton size="lg" onClick={redirectToLogin}>
                  {t("btn.start_free", "ابدأ مجاناً")}
                  {isRTL ? (
                    <ArrowLeft className="w-5 h-5" />
                  ) : (
                    <ArrowRight className="w-5 h-5" />
                  )}
                </GradientButton>
                <Button
                  size="lg"
                  variant="outline"
                  className="group border-2"
                >
                  <Play className="w-5 h-5 me-2 group-hover:scale-110 transition-transform" />
                  {t("hero.watch_demo", "شاهد العرض")}
                </Button>
              </div>
            </AnimateOnScroll>

            {/* Stats */}
            <AnimateOnScroll delay={400}>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 border-t border-slate-200 dark:border-slate-800">
                {STATS.map((stat) => (
                  <div key={stat.label} className="text-center sm:text-start">
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      {stat.value}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>

          {/* Hero Illustration */}
          <AnimateOnScroll delay={200} className="relative hidden lg:block">
            <div className="relative">
              {/* Main Card */}
              <GlassCard className="p-8">
                <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 flex items-center justify-center">
                  <img
                    src={APP_LOGO}
                    alt="Rabit Platform"
                    className="w-48 h-48 opacity-30"
                    width={192}
                    height={192}
                    loading="lazy"
                  />
                </div>
              </GlassCard>

              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 animate-float">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">ذكاء اصطناعي</div>
                      <div className="font-semibold">متطور</div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="absolute -bottom-6 -left-6 animate-float delay-500">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">متوافق مع</div>
                      <div className="font-semibold">نظام العمل</div>
                    </div>
                  </div>
                </GlassCard>
              </div>

              <div className="absolute top-1/2 -right-12 animate-float delay-300">
                <GlassCard className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">أداء</div>
                      <div className="font-semibold">فائق السرعة</div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce hidden lg:block">
          <a
            href="#categories"
            className="flex flex-col items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors"
          >
            <span className="text-sm">اكتشف المزيد</span>
            <ChevronDown className="w-5 h-5" />
          </a>
        </div>
      </div>
    </section>
  );
});

/**
 * قسم الفئات
 */
const CategoriesSection = memo(function CategoriesSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  return (
    <section id="categories" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-0">
            <Users className="w-4 h-4 me-2" />
            {t("categories.badge", "حلول لكل احتياج")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("categories.title", "اختر ما يناسبك")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t(
              "categories.subtitle",
              "نقدم حلولاً مخصصة للشركات والأفراد والموظفين"
            )}
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          {CATEGORIES.map((category, index) => {
            const Icon = category.icon;
            return (
              <AnimateOnScroll key={category.id} delay={index * 100}>
                <GlassCard
                  className={cn(
                    "relative p-8 h-full",
                    category.popular && "ring-2 ring-purple-500"
                  )}
                >
                  {category.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-4 py-1">
                        <Star className="w-3 h-3 me-1" />
                        {category.badge}
                      </Badge>
                    </div>
                  )}

                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                      category.gradient
                    )}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <h3 className="text-2xl font-bold mb-3">
                    {t(category.titleKey)}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {t(category.descKey)}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {category.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <span className="text-sm">{t(feature)}</span>
                      </li>
                    ))}
                  </ul>

                  {category.price && (
                    <div className="text-center mb-6">
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {t(category.price)}
                      </span>
                    </div>
                  )}

                  <Button
                    className={cn(
                      "w-full bg-gradient-to-r text-white",
                      category.gradient
                    )}
                  >
                    {t(category.id === "companies" ? "category.companies.btn" : "category.individual.btn", "ابدأ الآن")}
                    {isRTL ? (
                      <ArrowLeft className="w-4 h-4 ms-2" />
                    ) : (
                      <ArrowRight className="w-4 h-4 ms-2" />
                    )}
                  </Button>
                </GlassCard>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
});

/**
 * قسم كيف يعمل
 */
const HowItWorksSection = memo(function HowItWorksSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="container">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-0">
            <Zap className="w-4 h-4 me-2" />
            {t("how.badge", "سهولة الاستخدام")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("how.title", "كيف يعمل رابِط؟")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t("how.subtitle", "أربع خطوات بسيطة للبدء")}
          </p>
        </AnimateOnScroll>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hidden lg:block -translate-y-1/2 mx-24" />

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {HOW_STEPS.map((step, index) => {
              const Icon = step.icon;
              const gradients = [
                "from-blue-500 to-cyan-500",
                "from-purple-500 to-pink-500",
                "from-orange-500 to-red-500",
                "from-emerald-500 to-teal-500",
              ];

              return (
                <AnimateOnScroll key={step.number} delay={index * 100}>
                  <div className="relative text-center">
                    <div
                      className={cn(
                        "relative z-10 mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6 shadow-xl",
                        gradients[index]
                      )}
                    >
                      <Icon className="w-10 h-10 text-white" />
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-lg flex items-center justify-center text-sm font-bold">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-3">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t(step.descKey)}
                    </p>
                  </div>
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>

        <AnimateOnScroll delay={400} className="text-center mt-12">
          <GradientButton size="lg">
            {t("btn.start_free", "ابدأ مجاناً")}
            <ArrowLeft className="w-5 h-5" />
          </GradientButton>
        </AnimateOnScroll>
      </div>
    </section>
  );
});

/**
 * قسم الأدوات
 */
const ToolsSection = memo(function ToolsSection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const tools = [
    {
      href: "/tools/end-of-service",
      icon: Calculator,
      title: t("tools.end_of_service", "حاسبة نهاية الخدمة"),
      desc: t("tools.end_of_service.desc", "احسب مكافأة نهاية الخدمة وفق المادة 84"),
      color: "from-blue-500 to-cyan-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      href: "/tools/leave-calculator",
      icon: Calendar,
      title: t("tools.vacation", "حاسبة الإجازات"),
      desc: t("tools.vacation.desc", "احسب رصيدك من الإجازات السنوية"),
      color: "from-purple-500 to-pink-500",
      bg: "bg-purple-50 dark:bg-purple-950/30",
    },
    {
      href: "/tools/letter-generator",
      icon: FileText,
      title: t("tools.letter_generator", "مولد الخطابات"),
      desc: t("tools.letter_generator.desc", "أنشئ خطابات رسمية احترافية"),
      color: "from-emerald-500 to-teal-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      href: "/dashboard/smart-form-generator",
      icon: FileText,
      title: t("tools.smart_form_generator.title", "مولد النماذج الذكي"),
      desc: t("tools.smart_form_generator.desc", "أنشئ نماذج ومستندات HR مخصصة"),
      color: "from-orange-500 to-amber-500",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      href: "/dashboard/certificates",
      icon: Award,
      title: t("tools.certificates.title", "مولد الشهادات"),
      desc: t("tools.certificates.desc", "أصدر شهادات عمل وخبرة احترافية"),
      color: "from-indigo-500 to-violet-500",
      bg: "bg-indigo-50 dark:bg-indigo-950/30",
    },
    {
      href: "/dashboard/reports",
      icon: BarChart3,
      title: t("tools.reports.title", "التقارير الذكية"),
      desc: t("tools.reports.desc", "تقارير تحليلية متقدمة"),
      color: "from-rose-500 to-pink-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
  ];

  return (
    <section id="tools" className="py-24 bg-slate-50 dark:bg-slate-900/50">
      <div className="container">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-0">
            <Zap className="w-4 h-4 me-2" />
            {t("tools.badge", "أدوات مجانية")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("tools.title", "أدوات الموارد البشرية الذكية")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t("tools.subtitle", "أدوات مجانية تساعدك في مهامك اليومية")}
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <AnimateOnScroll key={tool.href} delay={index * 50}>
                <Link href={tool.href}>
                  <GlassCard className="p-6 h-full group cursor-pointer">
                    <div
                      className={cn(
                        "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center mb-4",
                        "group-hover:scale-110 transition-transform duration-300",
                        tool.color
                      )}
                    >
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                      {tool.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-4">
                      {tool.desc}
                    </p>
                    <div className="flex items-center text-blue-600 font-medium">
                      {t("tools.try_now", "جرّب الآن")}
                      {isRTL ? (
                        <ArrowLeft className="w-4 h-4 ms-2 group-hover:-translate-x-1 transition-transform" />
                      ) : (
                        <ArrowRight className="w-4 h-4 ms-2 group-hover:translate-x-1 transition-transform" />
                      )}
                    </div>
                  </GlassCard>
                </Link>
              </AnimateOnScroll>
            );
          })}
        </div>

        <AnimateOnScroll delay={300} className="text-center mt-12">
          <Link href="/tools">
            <Button size="lg" variant="outline" className="group">
              {t("tools.all_tools", "عرض جميع الأدوات")}
              {isRTL ? (
                <ArrowLeft className="w-5 h-5 ms-2 group-hover:-translate-x-1 transition-transform" />
              ) : (
                <ArrowRight className="w-5 h-5 ms-2 group-hover:translate-x-1 transition-transform" />
              )}
            </Button>
          </Link>
        </AnimateOnScroll>
      </div>
    </section>
  );
});

/**
 * قسم الميزات
 */
const FeaturesSection = memo(function FeaturesSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24">
      <div className="container">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-0">
            <Sparkles className="w-4 h-4 me-2" />
            {t("features.badge", "لماذا رابِط؟")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("features.title", "ميزات تميزنا")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t(
              "features.subtitle",
              "ميزات متقدمة تجعل إدارة الموارد البشرية أسهل وأكثر فعالية"
            )}
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <AnimateOnScroll key={feature.titleKey} delay={index * 50}>
                <div className="flex gap-4">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                      feature.color
                    )}
                  >
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">
                      {t(feature.titleKey)}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {t(feature.descKey, "متوافق 100% مع نظام العمل السعودي والمادة 84")}
                    </p>
                  </div>
                </div>
              </AnimateOnScroll>
            );
          })}
        </div>
      </div>
    </section>
  );
});

/**
 * قسم آراء العملاء
 */
const TestimonialsSection = memo(function TestimonialsSection() {
  const { t } = useTranslation();

  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-900">
      <div className="container">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-0">
            <Star className="w-4 h-4 me-2" />
            {t("testimonials.badge", "آراء عملائنا")}
          </Badge>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
            {t("testimonials.title", "ماذا يقول عملاؤنا؟")}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {t("testimonials.subtitle", "تجارب حقيقية من شركات سعودية")}
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => {
            const gradients = [
              "from-blue-500 to-purple-600",
              "from-emerald-500 to-teal-600",
              "from-orange-500 to-red-600",
            ];

            return (
              <AnimateOnScroll key={testimonial.id} delay={index * 100}>
                <GlassCard className="p-8 h-full">
                  {/* Rating */}
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }, (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <p className="text-lg text-slate-700 dark:text-slate-300 mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </p>

                  {/* Author */}
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg",
                        gradients[index]
                      )}
                    >
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="font-bold">{testimonial.name}</div>
                      <div className="text-sm text-slate-500 dark:text-slate-400">
                        {testimonial.role}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        {testimonial.company}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </AnimateOnScroll>
            );
          })}
        </div>

        <AnimateOnScroll delay={300} className="text-center mt-12">
          <Link href="/case-studies">
            <Button size="lg" variant="outline" className="group">
              {t("testimonials.cta", "اقرأ المزيد من قصص النجاح")}
              <ArrowLeft className="w-5 h-5 ms-2 group-hover:-translate-x-1 transition-transform" />
            </Button>
          </Link>
        </AnimateOnScroll>
      </div>
    </section>
  );
});

const JourneyCard = memo(function JourneyCard({
  title,
  description,
  href,
  icon: Icon,
  accent,
  isRTL,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ElementType;
  accent: string;
  isRTL: boolean;
  cta: string;
}) {
  return (
    <AnimateOnScroll className="h-full">
      <Link href={href}>
        <GlassCard className="p-6 h-full group cursor-pointer hover:border-primary/30">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center text-white shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description}
          </p>
          <div className="text-primary font-semibold flex items-center">
            {cta}
            {isRTL ? (
              <ArrowLeft className="w-4 h-4 ms-2 group-hover:-translate-x-1 transition-transform" />
            ) : (
              <ArrowRight className="w-4 h-4 ms-2 group-hover:translate-x-1 transition-transform" />
            )}
          </div>
        </GlassCard>
      </Link>
    </AnimateOnScroll>
  );
});

const UnifiedJourneySection = memo(function UnifiedJourneySection() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const steps = [
    {
      title: isRTL ? "ابدأ بالاستشارات" : "Start with Consulting",
      description: isRTL
        ? "احجز جلسة فورية أو مجدولة مع خبرائنا لضبط الخطة بسرعة."
        : "Book an instant or scheduled session with experts to shape your plan fast.",
      href: "/consulting",
      icon: Sparkles,
      accent: "from-indigo-500 to-purple-600",
      cta: isRTL ? "ابدأ الآن" : "Start now",
    },
    {
      title: isRTL ? "فعّل الأدوات الذكية" : "Activate Smart Tools",
      description: isRTL
        ? "حوّل القرارات إلى تدفقات عمل جاهزة: الحاسبات، الخطابات، والتقارير."
        : "Turn decisions into ready workflows: calculators, letters, and reports.",
      href: "/tools",
      icon: MousePointerClick,
      accent: "from-emerald-500 to-teal-600",
      cta: isRTL ? "جرب الأدوات" : "Try the tools",
    },
    {
      title: isRTL ? "اختر الباقة المناسبة" : "Pick the right plan",
      description: isRTL
        ? "خطط مرنة للموظفين، المستشارين، أو الشركات مع تجربة مجانية."
        : "Flexible plans for employees, consultants, or companies with free trials.",
      href: "/pricing",
      icon: Shield,
      accent: "from-amber-500 to-orange-600",
      cta: isRTL ? "اطلع على الباقات" : "View plans",
    },
    {
      title: isRTL ? "انتقل للوحة الشركة" : "Move to company dashboard",
      description: isRTL
        ? "راقب الموظفين، التوظيف، والتذاكر من لوحة تنفيذية جاهزة."
        : "Track employees, hiring, and tickets from a ready executive dashboard.",
      href: "/company/dashboard-enhanced",
      icon: BarChart3,
      accent: "from-blue-500 to-cyan-500",
      cta: isRTL ? "افتح اللوحة" : "Open dashboard",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-white to-slate-50 dark:from-slate-950 dark:to-gray-900">
      <div className="container">
        <AnimateOnScroll className="text-center max-w-3xl mx-auto mb-14">
          <Badge className="mb-3 bg-primary/10 text-primary border-0 px-4 py-1.5">
            <Sparkles className="w-4 h-4 me-2" />
            {isRTL ? "رحلة متصلة" : "Connected Journey"}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {isRTL ? "اربط الاستشارات بالأدوات والباقات" : "Connect consulting with tools and plans"}
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            {isRTL
              ? "ابدأ بالاستشارة، طبّق عبر الأدوات، واختر الباقة المناسبة ثم انتقل للوحة الشركة دون فقدان السياق."
              : "Start with consulting, execute via tools, pick the right plan, and jump into the company dashboard without losing context."}
          </p>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <JourneyCard key={step.title} {...step} isRTL={isRTL} />
          ))}
        </div>
      </div>
    </section>
  );
});

/**
 * قسم CTA النهائي
 */
const CTASection = memo(function CTASection() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ar";

  const redirectToLogin = useCallback(() => {
    globalThis.location.href = getLoginUrl();
  }, []);

  return (
    <section className="py-24">
      <div className="container">
        <AnimateOnScroll>
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-12 md:p-16">
            {/* Background Effects */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 text-center text-white">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
                {t("cta.final.title", "ابدأ رحلتك مع رابِط اليوم")}
              </h2>
              <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                {t(
                  "cta.final.subtitle",
                  "انضم إلى آلاف الشركات السعودية التي تثق بنا في إدارة مواردها البشرية"
                )}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-white/90 font-bold shadow-xl"
                  onClick={redirectToLogin}
                >
                  {t("cta.final.start", "ابدأ مجاناً")}
                  {isRTL ? (
                    <ArrowLeft className="w-5 h-5 ms-2" />
                  ) : (
                    <ArrowRight className="w-5 h-5 ms-2" />
                  )}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/contact">
                    {t("cta.final.contact", "تواصل معنا")}
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export default function HomeRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  // Prefetch important routes
  useEffect(() => {
    const routesToPrefetch = [
      "/consulting/book-new",
      "/consulting/experts",
      "/pricing",
      "/signup",
      "/tools",
      "/company/dashboard-enhanced",
    ];
    
    const links = routesToPrefetch.map((href) => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });

    return () => {
      for (const link of links) {
        link.remove();
      }
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-white dark:bg-slate-950"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Promo Banner */}
      <PromoBanner />

      {/* Announcement */}
      <AnnouncementBar isArabic={isArabic} />

      {/* Header */}
      <Header />

      {/* Quick Actions */}
      <QuickActionsBar />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Categories Section */}
        <CategoriesSection />

        {/* How It Works */}
        <HowItWorksSection />

        {/* Unified Journey */}
        <UnifiedJourneySection />

        {/* Tools Section */}
        <ToolsSection />

        {/* Features Section */}
        <FeaturesSection />

        {/* Connected Pages */}
        <ConnectedPagesSection
          isArabic={isArabic}
          highlight={{ ar: "روابط سريعة", en: "Quick Links" }}
          title={{
            ar: "اكمل رحلتك بين الأدوات والباقات والاستشارات",
            en: "Continue your journey across tools, plans, and consulting",
          }}
          subtitle={{
            ar: "انتقل بنقرة واحدة إلى حجز الاستشارة، تجربة الأدوات، أو اختيار الباقة المناسبة لشركتك.",
            en: "Jump with one click to book consulting, try the tools, or choose the right plan for your team.",
          }}
        />

        {/* Testimonials */}
        <TestimonialsSection />

        {/* FAQ Section */}
        <FAQSection />

        {/* CTA Section */}
        <CTASection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Global Styles for Animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes slide {
          0% { transform: translateX(0); }
          100% { transform: translateX(60px); }
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .delay-300 {
          animation-delay: 300ms;
        }
        
        .delay-500 {
          animation-delay: 500ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
      `}</style>
    </div>
  );
}
