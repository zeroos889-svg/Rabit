import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import {
  Building2,
  UserCircle,
  Briefcase,
  Check,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
  ChevronRight,
  Crown,
  Brain,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { APP_LOGO } from "@/const";

// =====================================================
// INTERFACES
// =====================================================

interface AccountTypeOption {
  type: "company" | "consultant" | "employee";
  icon: LucideIcon;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  priceEn: string;
  pricePeriod?: string;
  pricePeriodEn?: string;
  features: string[];
  featuresEn: string[];
  color: string;
  gradient: string;
  bgGradient: string;
  badge?: string;
  badgeEn?: string;
  badgeColor?: string;
  href: string;
  popular?: boolean;
}

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

// Animated Background
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-purple-50/50 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10" />
    
    {/* Animated Orbs */}
    <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-blob" />
    <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/15 to-pink-400/15 rounded-full blur-3xl animate-blob animation-delay-2000" />
    <div className="absolute bottom-0 left-1/2 w-[450px] h-[450px] bg-gradient-to-br from-indigo-400/20 to-blue-400/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
    
    {/* Grid Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.02] dark:opacity-[0.04] bg-grid-brand"
    />
  </div>
);

// Glass Card Component
const GlassCard = ({ 
  children, 
  className = "",
  isSelected = false,
  isPopular = false,
}: { 
  children: React.ReactNode; 
  className?: string;
  isSelected?: boolean;
  isPopular?: boolean;
}) => (
  <div 
    className={cn(
      "relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
      "border border-white/30 dark:border-gray-700/30",
      "rounded-3xl shadow-xl",
      "transition-all duration-500",
      isSelected && "ring-2 ring-brand-primary shadow-2xl scale-[1.02]",
      isPopular && "border-brand-primary/30",
      className
    )}
  >
    {children}
  </div>
);

// Feature Item
const FeatureItem = ({ 
  text, 
  _color = "green" 
}: { 
  text: string; 
  _color?: string;
}) => (
  <li className="flex items-start gap-3 group">
    <div className={cn(
      "flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5",
      "bg-green-100 dark:bg-green-900/30",
      "group-hover:scale-110 transition-transform duration-300"
    )}>
      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
    </div>
    <span className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
      {text}
    </span>
  </li>
);

// Account Type Card
const AccountTypeCard = ({
  account,
  isSelected,
  onClick,
  isArabic,
  index,
}: {
  account: AccountTypeOption;
  isSelected: boolean;
  onClick: () => void;
  isArabic: boolean;
  index: number;
}) => {
  const Icon = account.icon;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 * index);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={cn(
        "transform transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <GlassCard 
        isSelected={isSelected} 
        isPopular={account.popular}
        className={cn(
          "relative overflow-hidden cursor-pointer h-full",
          "hover:shadow-2xl hover:-translate-y-1",
          account.popular && "lg:-mt-4 lg:-mb-4"
        )}
      >
        {/* Popular Badge */}
        {account.popular && (
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-brand-primary to-brand-secondary" />
        )}

        {/* Badge */}
        {account.badge && (
          <div className="absolute top-4 end-4 z-10">
            <Badge
              className={cn(
                "px-3 py-1 font-medium text-xs",
                account.popular 
                  ? "bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-0"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
              )}
            >
              {account.popular && <Crown className="w-3 h-3 me-1" />}
              {isArabic ? account.badge : account.badgeEn}
            </Badge>
          </div>
        )}

        <button
          type="button"
          onClick={onClick}
          className="block w-full p-6 lg:p-8 text-start"
        >
          {/* Icon */}
          <div
            className={cn(
              "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6",
              "bg-gradient-to-br shadow-lg",
              account.gradient
            )}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Title & Description */}
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isArabic ? account.title : account.titleEn}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
            {isArabic ? account.description : account.descriptionEn}
          </p>

          {/* Price */}
          <div className="mb-6">
            <span
              className={cn(
                "text-3xl lg:text-4xl font-bold",
                "bg-gradient-to-r bg-clip-text text-transparent",
                account.gradient
              )}
            >
              {isArabic ? account.price : account.priceEn}
            </span>
            {account.pricePeriod && (
              <span className="text-gray-500 text-sm ms-1">
                /{isArabic ? account.pricePeriod : account.pricePeriodEn}
              </span>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {(isArabic ? account.features : account.featuresEn).slice(0, 6).map(
              (feature) => (
                <FeatureItem key={feature} text={feature} />
              )
            )}
          </ul>

          {/* CTA Button */}
          <Button
            asChild
            className={cn(
              "w-full h-12 rounded-xl font-semibold text-base group",
              "transition-all duration-300",
              account.popular
                ? cn(
                    "bg-gradient-to-r text-white shadow-lg",
                    "hover:shadow-xl hover:scale-[1.02]",
                    account.gradient
                  )
                : cn(
                    "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
                    "hover:bg-gray-200 dark:hover:bg-gray-700"
                  )
            )}
          >
            <span className="flex items-center justify-center">
              {isArabic ? "ابدأ الآن" : "Get Started"}
              <ChevronRight
                className={cn(
                  "w-5 h-5 transition-transform group-hover:translate-x-1",
                  isArabic ? "ms-2 rotate-180" : "ms-2"
                )}
              />
            </span>
          </Button>
        </button>

        {/* Selected Overlay */}
        {isSelected && (
          <div className="absolute inset-0 bg-brand-primary/5 pointer-events-none rounded-3xl" />
        )}
      </GlassCard>
    </div>
  );
};

// Feature Highlight Card
const FeatureHighlight = ({
  icon: Icon,
  title,
  description,
  color,
  index = 0,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
  index?: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 * index);
    return () => clearTimeout(timer);
  }, [index]);

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-100 dark:bg-blue-900/20 text-blue-600",
    purple: "bg-purple-100 dark:bg-purple-900/20 text-purple-600",
    green: "bg-green-100 dark:bg-green-900/20 text-green-600",
    orange: "bg-orange-100 dark:bg-orange-900/20 text-orange-600",
  };

  return (
    <div
      className={cn(
        "text-center group transform transition-all duration-500",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      )}
    >
      <div className={cn(
        "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
        "transition-transform duration-300 group-hover:scale-110",
        colorClasses[color]
      )}>
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
        {description}
      </p>
    </div>
  );
};

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function AccountTypeRedesigned() {
  const { i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const isArabic = i18n.language === "ar";

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const accountTypes: AccountTypeOption[] = [
    {
      type: "company",
      icon: Building2,
      title: "حساب شركة",
      titleEn: "Company Account",
      description: "للشركات والمؤسسات التي تحتاج نظام HR متكامل",
      descriptionEn: "For companies needing a complete HR system",
      price: "1,500",
      priceEn: "1,500",
      pricePeriod: "ريال/شهر",
      pricePeriodEn: "SAR/mo",
      features: [
        "نظام ATS كامل للتوظيف",
        "إدارة الموظفين والحضور",
        "نظام التذاكر والمهام",
        "التقارير والإحصائيات المتقدمة",
        "إدارة الرواتب والمزايا",
        "دعم فني مخصص 24/7",
      ],
      featuresEn: [
        "Complete ATS recruitment system",
        "Employee & attendance management",
        "Tickets & tasks system",
        "Advanced reports & analytics",
        "Payroll & benefits management",
        "Dedicated 24/7 support",
      ],
      color: "blue",
      gradient: "from-blue-600 to-cyan-600",
      bgGradient: "from-blue-50 to-cyan-50",
      badge: "الأكثر شيوعاً",
      badgeEn: "Most Popular",
      href: "/signup/company",
      popular: true,
    },
    {
      type: "consultant",
      icon: Briefcase,
      title: "مستشار HR",
      titleEn: "HR Consultant",
      description: "للمستشارين ومستقلي الموارد البشرية",
      descriptionEn: "For HR consultants and freelancers",
      price: "299",
      priceEn: "299",
      pricePeriod: "ريال/شهر",
      pricePeriodEn: "SAR/mo",
      features: [
        "الأدوات الذكية الثلاثة",
        "حاسبة نهاية الخدمة",
        "حاسبة الإجازات",
        "مولد الخطابات بالذكاء الاصطناعي",
        "سجل العملاء والمشاريع",
        "دعم فني سريع",
      ],
      featuresEn: [
        "Three smart tools",
        "End of service calculator",
        "Leave calculator",
        "AI-powered letter generator",
        "Clients & projects log",
        "Fast technical support",
      ],
      color: "purple",
      gradient: "from-purple-600 to-pink-600",
      bgGradient: "from-purple-50 to-pink-50",
      badge: "للمستقلين",
      badgeEn: "For Freelancers",
      href: "/signup/consultant",
    },
    {
      type: "employee",
      icon: UserCircle,
      title: "حساب موظف",
      titleEn: "Employee Account",
      description: "للموظفين الباحثين عن وظائف",
      descriptionEn: "For job seekers",
      price: "مجاناً",
      priceEn: "Free",
      features: [
        "البحث عن الوظائف",
        "التقديم على الوظائف",
        "تحديث السيرة الذاتية",
        "متابعة حالة الطلبات",
        "الأدوات الذكية المجانية",
        "إشعارات الوظائف الجديدة",
      ],
      featuresEn: [
        "Job search",
        "Job applications",
        "Resume updates",
        "Application status tracking",
        "Free smart tools",
        "New job notifications",
      ],
      color: "green",
      gradient: "from-green-600 to-emerald-600",
      bgGradient: "from-green-50 to-emerald-50",
      badge: "مجاني",
      badgeEn: "Free",
      href: "/signup/employee",
    },
  ];

  const highlights = [
    {
      icon: Shield,
      titleAr: "أمان عالي",
      titleEn: "High Security",
      descAr: "حماية بياناتك بأحدث معايير الأمان",
      descEn: "Data protection with latest standards",
      color: "blue",
    },
    {
      icon: Zap,
      titleAr: "أداء سريع",
      titleEn: "Fast Performance",
      descAr: "تجربة سلسة وسريعة",
      descEn: "Smooth and fast experience",
      color: "purple",
    },
    {
      icon: MessageSquare,
      titleAr: "دعم فني",
      titleEn: "Support",
      descAr: "فريق دعم متاح لمساعدتك",
      descEn: "Support team available to help",
      color: "green",
    },
    {
      icon: Brain,
      titleAr: "ذكاء اصطناعي",
      titleEn: "AI Powered",
      descAr: "أدوات مدعومة بالذكاء الاصطناعي",
      descEn: "AI-powered smart tools",
      color: "orange",
    },
  ];

  const handleSelectType = (type: string, href: string) => {
    setSelectedType(type);
    setTimeout(() => {
      setLocation(href);
    }, 400);
  };

  const Arrow = isArabic ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen relative overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
      <AnimatedBackground />

      {/* Main Content */}
      <div className="relative z-10 py-8 lg:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <div className="flex items-center gap-3 group cursor-pointer">
                <img src={APP_LOGO} alt="رابِط | Rabit" className="h-10 w-auto transition-transform group-hover:scale-105" />
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="text-gray-600 hover:text-brand-primary">
                  {isArabic ? "تسجيل الدخول" : "Login"}
                </Button>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="gap-2 text-gray-600 hover:text-brand-primary">
                  <Arrow className="w-4 h-4" />
                  {isArabic ? "الرئيسية" : "Home"}
                </Button>
              </Link>
            </div>
          </div>

          {/* Title Section */}
          <div 
            className={cn(
              "text-center mb-12 lg:mb-16 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <Badge className="bg-brand-primary/10 text-brand-primary border-0 text-sm px-4 py-1.5 mb-4">
              <Sparkles className="w-4 h-4 me-1" />
              {isArabic ? "اختر الخطة المناسبة" : "Choose Your Plan"}
            </Badge>
            <h1 className="text-3xl lg:text-5xl font-bold mb-4">
              <span className="text-gray-900 dark:text-white">
                {isArabic ? "اختر نوع " : "Choose Your "}
              </span>
              <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                {isArabic ? "حسابك" : "Account"}
              </span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {isArabic
                ? "اختر الخطة المناسبة لاحتياجاتك واستمتع بميزات منصة رابِط المتكاملة"
                : "Choose the plan that fits your needs and enjoy all Rabit platform features"}
            </p>
          </div>

          {/* Account Type Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 lg:mb-20 items-stretch">
            {accountTypes.map((account, index) => (
              <AccountTypeCard
                key={account.type}
                account={account}
                isSelected={selectedType === account.type}
                onClick={() => handleSelectType(account.type, account.href)}
                isArabic={isArabic}
                index={index}
              />
            ))}
          </div>

          {/* Features Highlight */}
          <GlassCard className="p-8 lg:p-12 mb-12">
            <h2 className="text-2xl lg:text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
              {isArabic ? "جميع الحسابات تشمل" : "All Accounts Include"}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {highlights.map((item) => (
                <FeatureHighlight
                  key={item.titleEn}
                  icon={item.icon}
                  title={isArabic ? item.titleAr : item.titleEn}
                  description={isArabic ? item.descAr : item.descEn}
                  color={item.color}
                />
              ))}
            </div>
          </GlassCard>

          {/* Already Have Account */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
              <Link 
                href="/login"
                className="text-brand-primary hover:text-brand-dark font-semibold transition-colors"
              >
                {isArabic ? "تسجيل الدخول" : "Login"}
              </Link>
            </p>
          </div>

          <div className="pt-10">
            <ConnectedPagesSection
              isArabic={isArabic}
              highlight={{ ar: "روابط متصلة", en: "Stay Connected" }}
              title={{
                ar: "إلى أين تتجه بعد اختيار الحساب؟",
                en: "Where to go after picking your account?",
              }}
              subtitle={{
                ar: "انتقل بسرعة إلى الأدوات، الباقات، أو حجز الاستشارات لتفعيل حسابك الجديد فوراً.",
                en: "Jump quickly to tools, plans, or consulting to activate your new account right away.",
              }}
              className="py-0"
            />
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        
        .animate-blob {
          animation: blob 20s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
