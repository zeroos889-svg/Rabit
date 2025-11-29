import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Sparkles,
  Users,
  Building2,
  Briefcase,
  Crown,
  Zap,
  Shield,
  HeadphonesIcon,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Award,
  Rocket,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { APP_LOGO } from "@/const";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";

// =====================================================
// INTERFACES
// =====================================================

type PlanFeature = {
  nameAr: string;
  nameEn: string;
  included: boolean;
};

type PricingPlan = {
  id: string;
  nameAr: string;
  nameEn: string;
  price: number | string;
  periodAr?: string;
  periodEn?: string;
  icon: LucideIcon;
  gradient: string;
  descAr: string;
  descEn: string;
  features: PlanFeature[];
  ctaAr: string;
  ctaEn: string;
  popular?: boolean;
  badge?: { ar: string; en: string };
};

// =====================================================
// COMPONENTS
// =====================================================

// Animated Background
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/40 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/10" />
    
    <div className="absolute -top-40 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-400/15 to-cyan-400/15 rounded-full blur-3xl animate-blob" />
    <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-3xl animate-blob animation-delay-2000" />
    <div className="absolute bottom-20 right-1/3 w-[450px] h-[450px] bg-gradient-to-br from-indigo-400/15 to-blue-400/15 rounded-full blur-3xl animate-blob animation-delay-4000" />
    
    <div 
      className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03] bg-grid-brand-tight"
    />
  </div>
);

// Glass Card
const GlassCard = ({ 
  children, 
  className = "",
  isPopular = false,
  hover = true,
}: { 
  children: React.ReactNode; 
  className?: string;
  isPopular?: boolean;
  hover?: boolean;
}) => (
  <div 
    className={cn(
      "relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
      "border border-white/30 dark:border-gray-700/30",
      "rounded-3xl shadow-xl",
      "transition-all duration-500",
      hover && "hover:shadow-2xl",
      isPopular && "border-brand-primary/30 shadow-brand-primary/10",
      className
    )}
  >
    {children}
  </div>
);

// Header
const Header = ({ isArabic }: { isArabic: boolean }) => {
  const Arrow = isArabic ? ArrowRight : ArrowLeft;

  return (
    <header className="relative z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img src={APP_LOGO} alt="رابِط | Rabit" className="h-10 w-auto transition-transform group-hover:scale-105" />
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/tools">
              <Button variant="ghost" className="text-gray-600 hover:text-brand-primary hidden sm:flex">
                {isArabic ? "الأدوات" : "Tools"}
              </Button>
            </Link>
            <Link href="/consulting">
              <Button variant="ghost" className="text-gray-600 hover:text-brand-primary hidden sm:flex">
                {isArabic ? "الاستشارات" : "Consulting"}
              </Button>
            </Link>
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
      </div>
    </header>
  );
};

// Pricing Card
const PricingCard = ({
  plan,
  isArabic,
  index,
}: {
  plan: PricingPlan;
  isArabic: boolean;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = plan.icon;

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
        isPopular={plan.popular}
        className={cn(
          "relative overflow-hidden h-full",
          "hover:shadow-2xl hover:-translate-y-2 transition-all duration-300",
          plan.popular && "lg:-mt-4 lg:-mb-4"
        )}
      >
        {/* Top Gradient Bar */}
        <div className={cn("absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r", plan.gradient)} />
        
        {/* Popular Badge */}
        {plan.popular && plan.badge && (
          <div className="absolute top-4 end-4 z-10">
            <Badge className="bg-gradient-to-r from-brand-primary to-brand-secondary text-white border-0 px-3 py-1">
              <Crown className="w-3 h-3 me-1" />
              {isArabic ? plan.badge.ar : plan.badge.en}
            </Badge>
          </div>
        )}

        <div className="p-6 lg:p-8">
          {/* Icon */}
          <div className={cn(
            "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6",
            "bg-gradient-to-br shadow-lg",
            plan.gradient
          )}>
            <Icon className="w-7 h-7 text-white" />
          </div>

          {/* Name & Description */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {isArabic ? plan.nameAr : plan.nameEn}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 min-h-[40px]">
            {isArabic ? plan.descAr : plan.descEn}
          </p>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-2">
              <span className={cn(
                "text-4xl lg:text-5xl font-bold",
                "bg-gradient-to-r bg-clip-text text-transparent",
                plan.gradient
              )}>
                {plan.price}
              </span>
              {typeof plan.price === 'number' && (
                <span className="text-xl text-gray-500">﷼</span>
              )}
            </div>
            {plan.periodAr && (
              <p className="text-sm text-gray-500 mt-1">
                {isArabic ? plan.periodAr : plan.periodEn}
              </p>
            )}
          </div>

          {/* Features */}
          <ul className="space-y-3 mb-8">
            {plan.features.map((feature) => (
              <li key={feature.nameEn} className="flex items-start gap-3">
                {feature.included ? (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <X className="w-3 h-3 text-gray-400" />
                  </div>
                )}
                <span className={cn(
                  "text-sm",
                  feature.included 
                    ? "text-gray-700 dark:text-gray-300"
                    : "text-gray-400 line-through"
                )}>
                  {isArabic ? feature.nameAr : feature.nameEn}
                </span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <Link href="/signup">
            <Button
              className={cn(
                "w-full h-12 rounded-xl font-semibold text-base",
                "transition-all duration-300",
                plan.popular
                  ? cn(
                      "bg-gradient-to-r text-white shadow-lg",
                      "hover:shadow-xl hover:scale-[1.02]",
                      plan.gradient
                    )
                  : cn(
                      "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white",
                      "hover:bg-gray-200 dark:hover:bg-gray-700"
                    )
              )}
            >
              {isArabic ? plan.ctaAr : plan.ctaEn}
              <ChevronRight className={cn(
                "w-5 h-5 transition-transform",
                isArabic ? "ms-2 rotate-180" : "ms-2"
              )} />
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

// Trust Badge
const TrustBadge = ({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  color: string;
}) => (
  <div className="text-center group">
    <div className={cn(
      "inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4",
      "transition-transform duration-300 group-hover:scale-110",
      color
    )}>
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
    <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

export default function PricingRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const plans: PricingPlan[] = [
    {
      id: "employee",
      nameAr: "حساب موظف",
      nameEn: "Employee",
      price: isArabic ? "مجاناً" : "Free",
      icon: Users,
      gradient: "from-green-500 to-emerald-600",
      descAr: "للموظفين الباحثين عن وظائف",
      descEn: "For job seekers",
      features: [
        { nameAr: "حاسبة نهاية الخدمة", nameEn: "End of Service Calculator", included: true },
        { nameAr: "حاسبة الإجازات", nameEn: "Leave Calculator", included: true },
        { nameAr: "15 قالب خطاب", nameEn: "15 Letter Templates", included: true },
        { nameAr: "المساعد الذكي", nameEn: "AI Assistant", included: true },
        { nameAr: "تصدير PDF", nameEn: "PDF Export", included: true },
        { nameAr: "الأدوات المتقدمة", nameEn: "Advanced Tools", included: false },
        { nameAr: "لوحة التحكم", nameEn: "Dashboard", included: false },
        { nameAr: "إدارة الفريق", nameEn: "Team Management", included: false },
      ],
      ctaAr: "ابدأ مجاناً",
      ctaEn: "Start Free",
    },
    {
      id: "freelancer",
      nameAr: "مستشار HR",
      nameEn: "HR Consultant",
      price: 299,
      periodAr: "ريال/شهر",
      periodEn: "SAR/month",
      icon: Briefcase,
      gradient: "from-purple-500 to-pink-600",
      descAr: "للمستشارين ومستقلي HR",
      descEn: "For HR consultants and freelancers",
      features: [
        { nameAr: "جميع مميزات الموظف", nameEn: "All Employee Features", included: true },
        { nameAr: "55+ قالب خطاب", nameEn: "55+ Letter Templates", included: true },
        { nameAr: "الأدوات المتقدمة", nameEn: "Advanced Tools", included: true },
        { nameAr: "التقارير المتقدمة", nameEn: "Advanced Reports", included: true },
        { nameAr: "لوحة تحكم كاملة", nameEn: "Full Dashboard", included: true },
        { nameAr: "تصدير Word", nameEn: "Word Export", included: true },
        { nameAr: "إدارة الفريق", nameEn: "Team Management", included: false },
        { nameAr: "نظام التوظيف ATS", nameEn: "ATS System", included: false },
      ],
      ctaAr: "ابدأ تجربتك",
      ctaEn: "Start Trial",
      popular: true,
      badge: { ar: "الأكثر شيوعاً", en: "Most Popular" },
    },
    {
      id: "company",
      nameAr: "حساب شركة",
      nameEn: "Company",
      price: 799,
      periodAr: "ريال/شهر - يبدأ من",
      periodEn: "SAR/month - Starting",
      icon: Building2,
      gradient: "from-blue-500 to-indigo-600",
      descAr: "للشركات والمؤسسات",
      descEn: "For companies and organizations",
      features: [
        { nameAr: "جميع مميزات المستشار", nameEn: "All Consultant Features", included: true },
        { nameAr: "نظام التوظيف ATS", nameEn: "ATS Recruitment System", included: true },
        { nameAr: "إدارة الموظفين", nameEn: "Employee Management", included: true },
        { nameAr: "نظام التذاكر", nameEn: "Ticket System", included: true },
        { nameAr: "إدارة الفريق والصلاحيات", nameEn: "Team & Roles", included: true },
        { nameAr: "API للتكامل", nameEn: "API Integration", included: true },
        { nameAr: "دعم فني مخصص 24/7", nameEn: "24/7 Dedicated Support", included: true },
        { nameAr: "تدريب الفريق", nameEn: "Team Training", included: true },
      ],
      ctaAr: "تواصل معنا",
      ctaEn: "Contact Us",
    },
  ];

  const trustBadges = [
    {
      icon: Shield,
      titleAr: "أمان عالي",
      titleEn: "High Security",
      descAr: "حماية بياناتك بأحدث معايير الأمان",
      descEn: "Data protection with latest standards",
      color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
    },
    {
      icon: Zap,
      titleAr: "أداء سريع",
      titleEn: "Fast Performance",
      descAr: "تجربة سلسة وسريعة",
      descEn: "Smooth and fast experience",
      color: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30",
    },
    {
      icon: Award,
      titleAr: "متوافق مع النظام",
      titleEn: "Compliant",
      descAr: "متوافق مع نظام العمل السعودي",
      descEn: "Saudi Labor Law compliant",
      color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
    },
    {
      icon: HeadphonesIcon,
      titleAr: "دعم متواصل",
      titleEn: "24/7 Support",
      descAr: "فريق دعم متاح دائماً",
      descEn: "Support team always available",
      color: "bg-green-100 text-green-600 dark:bg-green-900/30",
    },
  ];

  const faqs = [
    {
      qAr: "هل يمكنني تجربة المنصة مجاناً؟",
      qEn: "Can I try the platform for free?",
      aAr: "نعم، يمكنك البدء بحساب موظف مجاني واستخدام الأدوات الأساسية. كما نقدم فترة تجربة للخطط المدفوعة.",
      aEn: "Yes, you can start with a free employee account and use basic tools. We also offer trial periods for paid plans."
    },
    {
      qAr: "ما طرق الدفع المتاحة؟",
      qEn: "What payment methods are available?",
      aAr: "نقبل البطاقات الائتمانية، مدى، Apple Pay، والتحويل البنكي للشركات.",
      aEn: "We accept credit cards, Mada, Apple Pay, and bank transfers for companies."
    },
    {
      qAr: "هل يمكنني الترقية أو التخفيض في أي وقت؟",
      qEn: "Can I upgrade or downgrade anytime?",
      aAr: "نعم، يمكنك تغيير خطتك في أي وقت. سيتم احتساب الفرق أو رده حسب الحالة.",
      aEn: "Yes, you can change your plan anytime. The difference will be calculated or refunded accordingly."
    },
    {
      qAr: "هل توفرون دعماً فنياً؟",
      qEn: "Do you provide technical support?",
      aAr: "نعم، نوفر دعماً فنياً عبر البريد الإلكتروني والدردشة. الشركات تحصل على دعم مخصص 24/7.",
      aEn: "Yes, we provide support via email and chat. Companies get dedicated 24/7 support."
    },
    {
      qAr: "هل بياناتي آمنة؟",
      qEn: "Is my data secure?",
      aAr: "نستخدم أحدث معايير الأمان وتشفير SSL. بياناتك مخزنة بشكل آمن ومحمية.",
      aEn: "We use the latest security standards and SSL encryption. Your data is securely stored and protected."
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
      <AnimatedBackground />
      
      <Header isArabic={isArabic} />
      <QuickActionsBar isArabic={isArabic} className="border-0" />

      <main className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Hero Section */}
          <section className="py-12 lg:py-16 text-center">
            <div 
              className={cn(
                "max-w-3xl mx-auto transition-all duration-700",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
            >
              <Badge className="bg-brand-primary/10 text-brand-primary border-0 text-sm px-4 py-1.5 mb-4">
                <Sparkles className="w-4 h-4 me-1" />
                {isArabic ? "خطط مرنة" : "Flexible Plans"}
              </Badge>
              
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">
                <span className="text-gray-900 dark:text-white">
                  {isArabic ? "اختر الخطة " : "Choose the Plan "}
                </span>
                <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  {isArabic ? "المناسبة لك" : "Right for You"}
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {isArabic
                  ? "ابدأ مجاناً أو اختر خطة تناسب احتياجاتك. جميع الخطط تشمل تجربة مجانية."
                  : "Start free or choose a plan that fits your needs. All plans include a free trial."}
              </p>
            </div>
          </section>

          {/* Pricing Cards */}
          <section className="pb-16">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
              {plans.map((plan, index) => (
                <PricingCard
                  key={plan.id}
                  plan={plan}
                  isArabic={isArabic}
                  index={index}
                />
              ))}
            </div>
          </section>

          <ConnectedPagesSection
            isArabic={isArabic}
            highlight={{
              ar: "رحلة مترابطة",
              en: "Connected Flow",
            }}
            title={{
              ar: "ماذا بعد اختيار الباقة؟",
              en: "Where to go after picking a plan?",
            }}
            subtitle={{
              ar: "انتقل مباشرة لتجربة الأدوات، حجز استشارة، أو تصفح لوحة التحكم الخاصة بالشركات.",
              en: "Jump straight into tools, book a consultation, or explore the company dashboard.",
            }}
            className="pt-0"
          />

          {/* Trust Badges */}
          <section className="py-12">
            <GlassCard className="p-8 lg:p-12" hover={false}>
              <h2 className="text-2xl lg:text-3xl font-bold text-center mb-10 text-gray-900 dark:text-white">
                {isArabic ? "لماذا تختار رابِط؟" : "Why Choose Rabit?"}
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {trustBadges.map((badge) => (
                  <TrustBadge
                    key={badge.titleEn}
                    icon={badge.icon}
                    title={isArabic ? badge.titleAr : badge.titleEn}
                    description={isArabic ? badge.descAr : badge.descEn}
                    color={badge.color}
                  />
                ))}
              </div>
            </GlassCard>
          </section>

          {/* FAQ Section */}
          <section className="py-12">
            <div className="text-center mb-10">
              <Badge className="bg-purple-100 text-purple-600 border-0 text-sm px-4 py-1.5 mb-4">
                <HelpCircle className="w-4 h-4 me-1" />
                {isArabic ? "أسئلة شائعة" : "FAQ"}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
              </h2>
            </div>
            
            <GlassCard className="p-6 lg:p-8 max-w-3xl mx-auto" hover={false}>
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq) => (
                  <AccordionItem key={faq.qEn} value={faq.qEn}>
                    <AccordionTrigger className={cn(
                      "text-start font-semibold text-gray-900 dark:text-white",
                      "hover:text-brand-primary transition-colors"
                    )}>
                      {isArabic ? faq.qAr : faq.qEn}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-600 dark:text-gray-400">
                      {isArabic ? faq.aAr : faq.aEn}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </GlassCard>
          </section>

          {/* CTA Section */}
          <section className="py-12">
            <GlassCard className="overflow-hidden" hover={false}>
              <div className="relative p-8 lg:p-12 text-center bg-gradient-to-r from-brand-primary/5 to-brand-secondary/5">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-primary/10 to-brand-secondary/10 opacity-50" />
                <div className="relative">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-primary to-brand-secondary mb-6">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                    {isArabic ? "مستعد للبدء؟" : "Ready to Get Started?"}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
                    {isArabic
                      ? "انضم إلى آلاف الشركات والمستشارين الذين يستخدمون رابِط"
                      : "Join thousands of companies and consultants using Rabit"}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Link href="/signup">
                      <Button
                        className={cn(
                          "h-12 px-8 rounded-xl font-semibold",
                          "bg-gradient-to-r from-brand-primary to-brand-secondary text-white",
                          "shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        )}
                      >
                        {isArabic ? "ابدأ مجاناً" : "Start Free"}
                        <ChevronRight className={cn("w-5 h-5", isArabic ? "ms-2 rotate-180" : "ms-2")} />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        variant="outline"
                        className="h-12 px-8 rounded-xl font-semibold hover:bg-white dark:hover:bg-gray-800"
                      >
                        {isArabic ? "تواصل معنا" : "Contact Us"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>
        </div>
      </main>

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
