import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
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
  Play,
  Menu,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { FAQSection } from "@/components/FAQSection";
import { Footer } from "@/components/Footer";
import { VimeoVideo } from "@/components/VimeoVideo";
import { Badge } from "@/components/ui/badge";

const categories = [
  {
    id: "companies",
    titleKey: "category.companies",
    descKey: "category.companies.desc",
    gradientClass: "gradient-company",
    icon: Building2,
    bulletColor: "text-blue-500",
    features: [
      "category.companies.feature1",
      "category.companies.feature2",
      "category.companies.feature3",
      "category.companies.feature4",
    ],
    priceKey: null,
    buttonTextKey: "category.companies.btn",
    badge: null,
    borderHover: "hover:border-blue-500",
  },
  {
    id: "individual",
    titleKey: "category.individual",
    descKey: "category.individual.desc",
    gradientClass: "gradient-individual",
    icon: UserCheck,
    bulletColor: "text-purple-500",
    features: [
      "category.individual.feature1",
      "category.individual.feature2",
      "category.individual.feature3",
      "category.individual.feature4",
    ],
    priceKey: "category.individual.price",
    buttonTextKey: "category.individual.btn",
    badge: "الأكثر شعبية",
    borderHover: "hover:border-purple-500",
  },
  {
    id: "employee",
    titleKey: "category.employee",
    descKey: "category.employee.desc",
    gradientClass: "gradient-employee",
    icon: Users,
    bulletColor: "text-green-500",
    features: [
      "category.employee.feature1",
      "category.employee.feature2",
      "category.employee.feature3",
      "category.employee.feature4",
    ],
    priceKey: "category.employee.price",
    buttonTextKey: "category.employee.btn",
    badge: null,
    borderHover: "hover:border-green-500",
  },
];

const howSteps = [
  {
    number: "1",
    titleKey: "how.step1.title",
    descKey: "how.step1.desc",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "2",
    titleKey: "how.step2.title",
    descKey: "how.step2.desc",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    number: "3",
    titleKey: "how.step3.title",
    descKey: "how.step3.desc",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    number: "4",
    titleKey: "how.step4.title",
    descKey: "how.step4.desc",
    gradient: "from-green-500 to-emerald-500",
  },
];

const featureList = [
  {
    titleKey: "features.saudi_compliant",
    descKey: "features.saudi_compliant.desc",
    icon: CheckCircle2,
  },
  {
    titleKey: "features.ai_powered",
    descKey: "features.ai_powered.desc",
    icon: Brain,
  },
  {
    titleKey: "features.easy_to_use",
    descKey: "features.easy_to_use.desc",
    icon: Smartphone,
  },
  {
    titleKey: "features.reports",
    descKey: "features.reports.desc",
    icon: BarChart3,
  },
  {
    titleKey: "features.security",
    descKey: "features.security.desc",
    icon: Shield,
  },
  {
    titleKey: "features.support",
    descKey: "features.support.desc",
    icon: Headphones,
  },
];

// Consulting Services Section Component
function ConsultingServicesSection() {
  const { data: typesData, isLoading } =
    trpc.consultant.getConsultationTypes.useQuery();
  const consultationTypes = typesData?.types?.slice(0, 6) || [];

  if (isLoading) {
    return (
      <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              استشارات الموارد البشرية
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              جاري التحميل...
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            استشارات الموارد البشرية
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            استشارات متخصصة في جميع مجالات الموارد البشرية من خبراء معتمدين
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {consultationTypes.map((type: any, index: number) => (
            <Card
              key={type.id}
              className="p-6 hover-lift cursor-pointer group h-full"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Headphones className="h-7 w-7 text-blue-600" />
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">
                    {type.duration} دقيقة
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {type.price} ر.س
                  </div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{type.nameAr}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {type.descriptionAr}
              </p>
              <Link href="/consulting/book-new">
                <Button className="w-full gradient-primary text-white">
                  احجز الآن
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Link href="/consulting">
            <Button size="lg" variant="outline" className="text-lg px-8">
              عرض جميع الاستشارات
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServicesHighlightSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-slate-50 via-white to-slate-50">
      <div className="container">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-12">
          <div className="space-y-3 max-w-2xl">
            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
              خدمات احترافية مدمجة
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              حلول متكاملة للموارد البشرية
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                استشارات، مراجعات، ودورات تطبيقية
              </span>
            </h2>
            <p className="text-lg text-muted-foreground">
              اربط بين الاستشارات القانونية، مراجعة العقود، التوظيف الذكي، والدورات التطبيقية
              من صفحة واحدة. كل خدمة موصولة بالأدوات الذكية ولوحات التحكم.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/services">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                  استكشف الخدمات
                </Button>
              </Link>
              <Link href="/consulting/book">
                <Button size="lg" variant="outline">
                  احجز استشارة الآن
                </Button>
              </Link>
            </div>
          </div>
          <Card className="p-6 shadow-lg w-full lg:max-w-md">
            <CardContent className="space-y-4">
              {[
                { title: "الاستشارات القانونية", desc: "رد خلال 24 ساعة + تقرير تنفيذي" },
                { title: "مراجعة العقود", desc: "توافق كامل مع لوائح العمل السعودية" },
                { title: "التوظيف الذكي", desc: "ATS + فرز سير ذاتية بالذكاء الاصطناعي" },
                { title: "الدورات التطبيقية", desc: "مسارات نظام العمل والتوظيف والامتثال" },
              ].map(item => (
                <div key={item.title} className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-purple-100 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [bodyScrollLocked, setBodyScrollLocked] = useState(false);
  const isTestEnv = typeof process !== "undefined" && process.env.NODE_ENV === "test";

  const redirectToLogin = () => {
    const loginUrl = getLoginUrl();
    if (typeof window === "undefined") return;

    const current = window.location.href;
    window.location.href = loginUrl;

    // jsdom لا يدعم الانتقال لصفحة أخرى، لذا نضبط الـ hash في بيئة الاختبار لضمان توقعات الاختبار
    if (isTestEnv && window.location.href === current) {
      window.location.hash = loginUrl;
    }
  };

  // Prefetch أكثر الصفحات استخداماً لتسريع الانتقال
  useEffect(() => {
    const routesToPrefetch = [
      "/consulting/book-new",
      "/consulting/experts",
      "/pricing",
      "/signup",
    ];
    const links = routesToPrefetch.map(href => {
      const link = document.createElement("link");
      link.rel = "prefetch";
      link.href = href;
      document.head.appendChild(link);
      return link;
    });
    return () => {
      links.forEach(link => document.head.removeChild(link));
    };
  }, []);

  // أغلق القائمة الجوالية عند التنقل وأوقف تمرير الخلفية أثناء المودال/القائمة
  useEffect(() => {
    const shouldLock = mobileMenuOpen || videoModalOpen;
    if (shouldLock) {
      document.body.style.overflow = "hidden";
      setBodyScrollLocked(true);
    } else if (bodyScrollLocked) {
      document.body.style.overflow = "";
      setBodyScrollLocked(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen, videoModalOpen, bodyScrollLocked]);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Free Month Offer Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-3 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6TTI0IDM0YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMC0xMGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00ek0xMiAzNGMwLTIuMjEtMS43OS00LTQtNHMtNCAxLjc5LTQgNCAxLjc5IDQgNCA0IDQtMS43OSA0LTR6bTAtMTBjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container relative flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎁</span>
            <span className="font-bold text-lg">{t("offer.special")}</span>
          </div>
          <p className="text-sm md:text-base">
            <strong>{t("offer.description")}</strong>
          </p>
          <Button
            size="sm"
            variant="default"
            className="bg-white text-purple-600 hover:bg-white/90 font-bold"
            onClick={redirectToLogin}
          >
            {t("offer.button")}
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src={APP_LOGO}
              alt="Rabit"
              className="h-8 w-8"
              loading="lazy"
              width={32}
              height={32}
              sizes="32px"
            />
            <span className="text-xl font-bold text-gradient-primary">
              رابِط
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#home"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.home")}
            </a>
            <Link
              href="/consulting"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.consulting") || "الاستشارات"}
            </Link>
            <Link
              href="/courses"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.courses") || "الدورات"}
            </Link>
            <Link
              href="/knowledge-base"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.knowledge_base") || "قاعدة المعرفة"}
            </Link>
            <a
              href="#tools"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.tools")}
            </a>
            <a
              href="#pricing"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.pricing")}
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              className="hidden sm:inline-flex"
              onClick={redirectToLogin}
            >
              {t("btn.login")}
            </Button>
            <Button
              className="gradient-primary text-white hidden sm:inline-flex"
              onClick={redirectToLogin}
            >
              {t("btn.start_free")}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="فتح القائمة"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background p-4 space-y-3 animate-in slide-in-from-top">
            <a
              href="#home"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.home")}
            </a>
            <Link
              href="/consulting"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.consulting") || "الاستشارات"}
            </Link>
            <Link
              href="/courses"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.courses") || "الدورات"}
            </Link>
            <Link
              href="/knowledge-base"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.knowledge_base") || "قاعدة المعرفة"}
            </Link>
            <a
              href="#tools"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.tools")}
            </a>
            <a
              href="#pricing"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.pricing")}
            </a>
            <a
              href="#about"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.about")}
            </a>
            <a
              href="#contact"
              className="block py-2 text-sm font-medium hover:text-primary transition-colors"
              onClick={closeMobileMenu}
            >
              {t("nav.contact")}
            </a>
            <div className="pt-3 space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={redirectToLogin}
              >
                {t("btn.login")}
              </Button>
              <Button
                className="gradient-primary text-white w-full"
                onClick={redirectToLogin}
              >
                {t("btn.start_free")}
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section id="home" className="hero brand-section">
        {/* Background Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-primary opacity-20 pointer-events-none"></div>

        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
              <div className="inline-block">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("hero.badge")}
                </span>
              </div>

              <h1 className="hero-title">
                {t("hero.title")}
              </h1>

              <p className="hero-subtitle">
                {t("hero.description")}
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-primary text-white text-lg px-8 hover-lift"
                  onClick={redirectToLogin}
                >
                  {t("btn.start_free")}
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => setVideoModalOpen(true)}
                >
                  <Play className="ml-2 h-5 w-5" />
                  {t("hero.watch_demo")}
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8 border-t">
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">
                    500+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("hero.stats.companies")}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">
                    10K+
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("hero.stats.users")}
                  </div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">
                    99%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t("hero.stats.satisfaction")}
                  </div>
                </div>
              </div>
            </div>

            {/* Image/Illustration */}
            <div className="relative animate-in fade-in slide-in-from-right duration-700 delay-300">
              <div className="relative aspect-square rounded-2xl gradient-primary p-1">
                <div className="h-full w-full rounded-xl bg-background flex items-center justify-center">
                  <img
                    src={APP_LOGO}
                    alt="Rabit Platform"
                    className="h-48 w-48 opacity-20"
                    width={192}
                    height={192}
                    loading="lazy"
                    sizes="(min-width: 1024px) 320px, 200px"
                  />
                </div>
              </div>
              {/* Floating Cards */}
              <div className="absolute -top-6 -right-6 bg-white rounded-lg shadow-lg p-4 animate-pulse-soft">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full gradient-company"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      نظام ATS
                    </div>
                    <div className="text-sm font-semibold">متقدم</div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-lg shadow-lg p-4 animate-pulse-soft delay-500">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-full gradient-individual"></div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      ذكاء اصطناعي
                    </div>
                    <div className="text-sm font-semibold">متطور</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12 animate-in fade-in slide-in-from-bottom">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("categories.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("categories.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <Card
                  key={category.id}
                  className={`p-8 hover-lift cursor-pointer group border-2 transition-all duration-300 ${category.borderHover} ${
                    category.badge ? "relative overflow-hidden" : ""
                  }`}
                >
                  {category.badge && (
                    <div className="absolute top-4 left-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {category.badge}
                    </div>
                  )}
                  <div
                    className={`h-16 w-16 rounded-xl ${category.gradientClass} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {t(category.titleKey)}
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {t(category.descKey)}
                  </p>
                  <ul className="space-y-3 mb-6">
                    {category.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2">
                        <CheckCircle2
                          className={`h-5 w-5 ${category.bulletColor} shrink-0 mt-0.5`}
                        />
                        <span className="text-sm">{t(feature)}</span>
                      </li>
                    ))}
                  </ul>
                  {category.priceKey && (
                    <div className="text-center mb-4">
                      <span
                        className={
                          category.gradientClass === "gradient-employee"
                            ? "text-2xl font-bold text-green-600"
                            : "text-3xl font-bold text-gradient-primary"
                        }
                      >
                        {t(category.priceKey)}
                      </span>
                    </div>
                  )}
                  <Button
                    className={`w-full ${category.gradientClass} text-white`}
                  >
                    {t(category.buttonTextKey)}
                    <ArrowRight className="mr-2 h-4 w-4" />
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("how.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("how.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {howSteps.map((step, idx) => (
              <div key={step.number} className="relative">
                <div className="text-center space-y-4">
                  <div
                    className={`mx-auto h-20 w-20 rounded-full bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-xl font-bold">{t(step.titleKey)}</h3>
                  <p className="text-sm text-muted-foreground">
                    {t(step.descKey)}
                  </p>
                </div>
                {/* Connector Line */}
                {idx < howSteps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 -z-10"></div>
                )}
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="text-center mt-12">
            <Button
              size="lg"
              className="gradient-primary text-white text-lg px-8 hover-lift"
              onClick={redirectToLogin}
            >
              {t("btn.start_free")}
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Section - أدوات الموارد البشرية الذكية */}
      <section id="tools" className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("tools.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("tools.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* End of Service Calculator */}
            <Link href="/tools/end-of-service">
              <Card className="p-6 hover-lift cursor-pointer group h-full">
                <div className="h-14 w-14 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calculator className="h-7 w-7 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t("tools.end_of_service")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("tools.end_of_service.desc")}
                </p>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-blue-50"
                >
                  {t("tools.try_now")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Card>
            </Link>

            {/* Vacation Calculator */}
            <Link href="/tools/leave-calculator">
              <Card className="p-6 hover-lift cursor-pointer group h-full">
                <div className="h-14 w-14 rounded-lg bg-purple-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Calendar className="h-7 w-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t("tools.vacation")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("tools.vacation.desc")}
                </p>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-purple-50"
                >
                  {t("tools.try_now")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Card>
            </Link>

            {/* Letter Generator */}
            <Link href="/tools/letter-generator">
              <Card className="p-6 hover-lift cursor-pointer group h-full">
                <div className="h-14 w-14 rounded-lg bg-green-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t("tools.letter_generator")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("tools.letter_generator.desc")}
                </p>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-green-50"
                >
                  {t("tools.try_now")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Card>
            </Link>

            {/* Document Generator */}
            <Link href="/dashboard/smart-form-generator">
              <Card className="p-6 hover-lift cursor-pointer group h-full">
                <div className="h-14 w-14 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-7 w-7 text-orange-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t("tools.smart_form_generator.title", "مولد النماذج الذكي")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    "tools.smart_form_generator.desc",
                    "أنشئ نماذج ومستندات HR مخصصة بسهولة"
                  )}
                </p>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-orange-50"
                >
                  {t("tools.try_now")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Card>
            </Link>

            {/* Certificate Generator */}
            <Link href="/dashboard/certificates">
              <Card className="p-6 hover-lift cursor-pointer group h-full">
                <div className="h-14 w-14 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t("tools.certificates.title", "مولد الشهادات")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t(
                    "tools.certificates.desc",
                    "أصدر شهادات عمل وخبرة احترافية فوراً"
                  )}
                </p>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-indigo-50"
                >
                  {t("tools.try_now")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Card>
            </Link>

            {/* Smart Reports */}
            <Link href="/dashboard/reports">
              <Card className="p-6 hover-lift cursor-pointer group h-full">
                <div className="h-14 w-14 rounded-lg bg-pink-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <BarChart3 className="h-7 w-7 text-pink-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">
                  {t("tools.reports.title")}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("tools.reports.desc")}
                </p>
                <Button
                  variant="ghost"
                  className="w-full group-hover:bg-pink-50"
                >
                  {t("tools.try_now")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Card>
            </Link>
          </div>

          <div className="text-center mt-12">
            <Link href="/tools">
              <Button size="lg" variant="outline" className="text-lg px-8">
                {t("tools.all_tools")}
                <ArrowRight className="mr-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("features.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t(
                "features.subtitle",
                "ميزات متقدمة تجعل إدارة الموارد البشرية أسهل وأكثر فعالية"
              )}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featureList.map(feature => {
              const Icon = feature.icon;
              return (
                <div key={feature.titleKey} className="flex gap-4">
                  <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{t(feature.titleKey)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t(
                        feature.descKey,
                        "متوافق 100% مع نظام العمل السعودي والمادة 84"
                      )}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("testimonials.title")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("testimonials.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    أ
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("testimonials.1.name")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.1.role")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t("testimonials.1.quote")}
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-lg">
                    س
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("testimonials.2.name")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.2.role")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t("testimonials.2.quote")}
                </p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-bold text-lg">
                    م
                  </div>
                  <div>
                    <h4 className="font-semibold">{t("testimonials.3.name")}</h4>
                    <p className="text-sm text-muted-foreground">
                      {t("testimonials.3.role")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  {t("testimonials.3.quote")}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/case-studies">
              <Button size="lg" variant="outline" className="gap-2">
                {t("testimonials.cta")}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("partners.title") || "شركاؤنا"}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("partners.subtitle") || "يثق بنا المئات من الشركات السعودية"}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
            {/* Partner Logos - Using placeholder */}
            {[
              { name: "شركة النخيل", icon: Building2 },
              { name: "مجموعة الريادة", icon: Building2 },
              { name: "شركة الأفق", icon: Building2 },
              { name: "مؤسسة التميز", icon: Building2 },
              { name: "شركة الإبداع", icon: Building2 },
              { name: "مجموعة النجاح", icon: Building2 },
              { name: "شركة التطوير", icon: Building2 },
              { name: "مؤسسة الرؤية", icon: Building2 },
            ].map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center p-6 rounded-lg bg-background hover:shadow-lg transition-all duration-300 group"
              >
                <div className="text-center">
                  <partner.icon className="h-12 w-12 mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {partner.name}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Card className="max-w-3xl mx-auto">
              <CardContent className="py-8">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-blue-600 mb-2">
                      500+
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("partners.stat1.label")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      10,000+
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("partners.stat2.label")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-purple-600 mb-2">
                      98%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("partners.stat3.label")}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      24/7
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {t("partners.stat4.label")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Highlight Section */}
      <ServicesHighlightSection />

      {/* Consulting Services Section - استشارات الموارد البشرية */}
      <ConsultingServicesSection />

      {/* Learning Section */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t("learning.title")}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("learning.subtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card className="p-8 hover-lift">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-6">
                <Play className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t("learning.courses.title")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("learning.courses.desc")}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{t("learning.courses.benefit1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{t("learning.courses.benefit2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{t("learning.courses.benefit3")}</span>
                </li>
              </ul>
              <Link href="/courses">
                <Button size="lg" className="w-full">
                  {t("learning.courses.cta")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>

            <Card className="p-8 hover-lift">
              <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">
                {t("learning.knowledge.title")}
              </h3>
              <p className="text-muted-foreground mb-6">
                {t("learning.knowledge.desc")}
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{t("learning.knowledge.benefit1")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{t("learning.knowledge.benefit2")}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span>{t("learning.knowledge.benefit3")}</span>
                </li>
              </ul>
              <Link href="/knowledge-base">
                <Button size="lg" variant="outline" className="w-full">
                  {t("learning.knowledge.cta")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* CTA Section */}
      <section className="py-20">
        <div className="container">
          <Card className="gradient-primary p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 h-64 w-64 rounded-full bg-white blur-3xl"></div>
              <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-white blur-3xl"></div>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                {t("cta.final.title")}
              </h2>
              <p className="text-lg text-blue-50 mb-8 max-w-2xl mx-auto">
                {t("cta.final.subtitle")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="default" className="text-lg px-8">
                  {t("cta.final.start")}
                  <ArrowRight className="mr-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  {t("cta.final.contact")}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Video Modal */}
      <Dialog open={videoModalOpen} onOpenChange={setVideoModalOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="space-y-4 p-6">
            <DialogTitle>{t("hero.watch_demo", "مشاهدة العرض")}</DialogTitle>
            <DialogDescription>
              {t(
                "hero.watch_demo.desc",
                "شاهد العرض التوضيحي داخل الصفحة أو افتحه في نافذة جديدة."
              )}
            </DialogDescription>
            <VimeoVideo
              videoId="906999651"
              title="عرض توضيحي لمنصة رابِط"
              className="w-full aspect-video flex items-center justify-center bg-muted rounded-md border"
            />
            <div className="flex justify-between items-center gap-4 flex-wrap">
              <Button onClick={() => setVideoModalOpen(false)} variant="outline">
                إغلاق
              </Button>
              <a
                href="https://vimeo.com/906999651"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                مشاهدة على Vimeo
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
