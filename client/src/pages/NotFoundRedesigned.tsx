import { memo, useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Home,
  Search,
  ArrowRight,
  Sparkles,
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  BookOpen,
  Calculator,
  FileText,
  Users,
} from "lucide-react";

// Animation Hook
function useAnimateOnScroll(options: IntersectionObserverInit = { threshold: 0.1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

// Animated Section Component
const AnimatedSection = memo(function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useAnimateOnScroll();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
});

// Glass Card Component
const GlassCard = memo(function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/70 dark:bg-gray-900/70
        backdrop-blur-xl border border-white/20 dark:border-gray-700/30
        shadow-xl shadow-black/5 dark:shadow-black/20
        hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
});

// Quick Link Card Component
const QuickLinkCard = memo(function QuickLinkCard({
  href,
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <Link href={href}>
        <GlassCard className="p-6 h-full group cursor-pointer">
          <div
            className={`
              w-14 h-14 rounded-2xl mb-4
              bg-gradient-to-br ${color}
              flex items-center justify-center
              group-hover:scale-110 transition-transform duration-300
              shadow-lg
            `}
          >
            <Icon className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        </GlassCard>
      </Link>
    </AnimatedSection>
  );
});

export default function NotFoundRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const quickLinks = [
    {
      href: "/",
      icon: Home,
      title: isArabic ? "الصفحة الرئيسية" : "Home Page",
      description: isArabic
        ? "العودة إلى الصفحة الرئيسية"
        : "Return to the home page",
      color: "from-blue-500 to-cyan-600",
    },
    {
      href: "/tools",
      icon: Calculator,
      title: isArabic ? "الأدوات الذكية" : "Smart Tools",
      description: isArabic
        ? "حاسبات نهاية الخدمة والإجازات"
        : "End of service and leave calculators",
      color: "from-emerald-500 to-green-600",
    },
    {
      href: "/consulting",
      icon: Users,
      title: isArabic ? "الاستشارات" : "Consulting",
      description: isArabic
        ? "احجز استشارة مع خبرائنا"
        : "Book a consultation with our experts",
      color: "from-purple-500 to-pink-600",
    },
    {
      href: "/blog",
      icon: BookOpen,
      title: isArabic ? "المدونة" : "Blog",
      description: isArabic
        ? "مقالات ونصائح في الموارد البشرية"
        : "HR articles and tips",
      color: "from-amber-500 to-orange-600",
    },
    {
      href: "/faq",
      icon: HelpCircle,
      title: isArabic ? "الأسئلة الشائعة" : "FAQ",
      description: isArabic
        ? "إجابات على الأسئلة المتكررة"
        : "Answers to frequently asked questions",
      color: "from-red-500 to-rose-600",
    },
    {
      href: "/contact",
      icon: MessageCircle,
      title: isArabic ? "تواصل معنا" : "Contact Us",
      description: isArabic
        ? "نحن هنا لمساعدتك"
        : "We're here to help you",
      color: "from-indigo-500 to-violet-600",
    },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 flex flex-col"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-20">
        <div className="container mx-auto px-4">
          {/* 404 Hero */}
          <AnimatedSection className="text-center mb-16">
            {/* 404 Number with Gradient */}
            <div className="relative mb-8">
              <h1 className="text-[150px] md:text-[200px] font-black leading-none bg-gradient-to-br from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent select-none">
                404
              </h1>
              
              {/* Floating Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none">
                <Sparkles className="absolute top-10 left-10 w-8 h-8 text-primary/40 animate-pulse" />
                <Search className="absolute top-20 right-20 w-10 h-10 text-purple-500/40 animate-bounce" />
                <HelpCircle className="absolute bottom-10 left-20 w-6 h-6 text-pink-500/40 animate-pulse delay-500" />
                <FileText className="absolute bottom-20 right-10 w-8 h-8 text-blue-500/40 animate-bounce delay-300" />
              </div>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? "عذراً! الصفحة غير موجودة" : "Oops! Page Not Found"}
            </h2>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {isArabic
                ? "يبدو أن الصفحة التي تبحث عنها قد تم نقلها أو حذفها أو لم تكن موجودة من الأصل."
                : "The page you're looking for seems to have been moved, deleted, or never existed."}
            </p>

            {/* Primary Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white px-8">
                  <Home className="w-5 h-5 me-2" />
                  {isArabic ? "العودة للرئيسية" : "Back to Home"}
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="px-8">
                  <MessageCircle className="w-5 h-5 me-2" />
                  {isArabic ? "تواصل معنا" : "Contact Us"}
                </Button>
              </Link>
            </div>
          </AnimatedSection>

          {/* Quick Links */}
          <AnimatedSection delay={200} className="mb-16">
            <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-8">
              {isArabic ? "ربما تبحث عن:" : "You might be looking for:"}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {quickLinks.map((link, index) => (
                <QuickLinkCard key={link.href} {...link} delay={index * 100} />
              ))}
            </div>
          </AnimatedSection>

          {/* Help Section */}
          <AnimatedSection delay={400}>
            <GlassCard className="max-w-3xl mx-auto p-8 text-center bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-950/30 dark:to-purple-950/30">
              <HelpCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {isArabic ? "لم تجد ما تبحث عنه؟" : "Still can't find what you need?"}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isArabic
                  ? "فريق الدعم لدينا جاهز لمساعدتك في أي وقت"
                  : "Our support team is ready to help you anytime"}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:info@rbithr.com"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-primary transition-colors shadow-md"
                >
                  <Mail className="w-5 h-5" />
                  <span>info@rbithr.com</span>
                </a>
                <a
                  href="https://wa.me/966570700355"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-emerald-500 text-white hover:bg-emerald-600 transition-colors shadow-md"
                >
                  <Phone className="w-5 h-5" />
                  <span>0570700355</span>
                </a>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-8 text-center text-gray-600 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} {isArabic ? "رابِط. جميع الحقوق محفوظة." : "Rabt. All rights reserved."}
        </p>
      </footer>
    </div>
  );
}
