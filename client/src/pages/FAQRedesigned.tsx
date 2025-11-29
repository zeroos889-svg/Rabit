import { memo, useCallback, useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Footer } from "@/components/Footer";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  HelpCircle,
  Search,
  Users,
  CreditCard,
  Settings,
  Shield,
  MessageCircle,
  BookOpen,
  Sparkles,
  ArrowRight,
  Phone,
  Mail,
  ChevronLeft,
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
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/70 dark:bg-gray-900/70
        backdrop-blur-xl border border-white/20 dark:border-gray-700/30
        shadow-xl shadow-black/5 dark:shadow-black/20
        ${hover ? "hover:shadow-2xl hover:border-primary/30" : ""}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
});

// Category Card Component
const CategoryCard = memo(function CategoryCard({
  id,
  name,
  icon: Icon,
  color,
  isSelected,
  onClick,
  count,
}: {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  isSelected: boolean;
  onClick: () => void;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 p-4 rounded-2xl
        transition-all duration-300 min-w-[100px]
        ${isSelected
          ? `bg-gradient-to-br ${color} text-white shadow-lg scale-105`
          : "bg-white/50 dark:bg-gray-800/50 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        }
      `}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{name}</span>
      <Badge variant={isSelected ? "secondary" : "outline"} className="text-xs">
        {count}
      </Badge>
    </button>
  );
});

export default function FAQRedesigned() {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // FAQ Categories
  const faqCategories = [
    {
      id: "general",
      name: isArabic ? "عام" : "General",
      icon: HelpCircle,
      color: "from-blue-500 to-indigo-600",
      questions: [
        {
          q: isArabic ? "ما هو رابِط؟" : "What is Rabt?",
          a: isArabic
            ? "رابِط هو مساعد ذكي متخصص في الموارد البشرية للشركات السعودية. يوفر أدوات ذكية لإدارة الموظفين، حساب نهاية الخدمة، الإجازات، مولد الخطابات، نظام ATS، والتذاكر - كل ذلك بتقنية الذكاء الاصطناعي ومتوافق 100% مع نظام العمل السعودي."
            : "Rabt is a smart HR assistant specialized for Saudi companies. It provides intelligent tools for employee management, end-of-service calculation, leave management, letter generator, ATS system, and tickets - all powered by AI and 100% compliant with Saudi Labor Law.",
        },
        {
          q: isArabic ? "من يمكنه استخدام رابِط؟" : "Who can use Rabt?",
          a: isArabic
            ? "رابِط مصمم لثلاث فئات: الموظفين الأفراد (باقة مجانية)، مستقلي الموارد البشرية الذين يخدمون عدة عملاء، والشركات بجميع أحجامها من الناشئة إلى المؤسسات الكبرى."
            : "Rabt is designed for three categories: individual employees (free plan), HR freelancers serving multiple clients, and companies of all sizes from startups to large enterprises.",
        },
        {
          q: isArabic ? "هل رابِط متوافق مع نظام العمل السعودي؟" : "Is Rabt compliant with Saudi Labor Law?",
          a: isArabic
            ? "نعم، 100%! جميع الحسابات والخطابات والإجراءات مبنية على نظام العمل السعودي واللوائح التنفيذية. نقوم بتحديث النظام فوراً عند صدور أي تعديلات قانونية."
            : "Yes, 100%! All calculations, letters, and procedures are based on Saudi Labor Law and executive regulations. We update the system immediately when any legal amendments are issued.",
        },
        {
          q: isArabic ? "هل يدعم رابِط اللغة الإنجليزية؟" : "Does Rabt support English?",
          a: isArabic
            ? "نعم، رابِط يدعم اللغتين العربية والإنجليزية بالكامل. يمكنك التبديل بين اللغتين في أي وقت، وجميع الخطابات والتقارير يمكن إصدارها بالعربية أو الإنجليزية أو ثنائية اللغة."
            : "Yes, Rabt fully supports both Arabic and English. You can switch between languages at any time, and all letters and reports can be issued in Arabic, English, or bilingual.",
        },
        {
          q: isArabic ? "هل يمكنني تجربة رابِط قبل الاشتراك؟" : "Can I try Rabt before subscribing?",
          a: isArabic
            ? "بالتأكيد! نوفر باقة مجانية للموظفين الأفراد تشمل الأدوات الأساسية. كما نوفر فترة تجريبية 14 يوم للباقات المدفوعة دون الحاجة لبطاقة ائتمان."
            : "Absolutely! We offer a free plan for individual employees that includes basic tools. We also provide a 14-day trial for paid plans without requiring a credit card.",
        },
      ],
    },
    {
      id: "account",
      name: isArabic ? "الحساب" : "Account",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      questions: [
        {
          q: isArabic ? "كيف أنشئ حساب في رابِط؟" : "How do I create an account in Rabt?",
          a: isArabic
            ? 'انقر على "ابدأ الآن" واختر نوع حسابك (موظف، مستقل HR، أو شركة). أكمل البيانات المطلوبة وستتمكن من الوصول فوراً. للباقات المدفوعة، ستحتاج لإدخال معلومات الدفع.'
            : 'Click "Start Now" and choose your account type (employee, HR freelancer, or company). Complete the required information and you\'ll have immediate access. For paid plans, you\'ll need to enter payment information.',
        },
        {
          q: isArabic ? "هل يمكنني تغيير نوع حسابي لاحقاً؟" : "Can I change my account type later?",
          a: isArabic
            ? "نعم، يمكنك الترقية من باقة الموظف إلى مستقل HR أو الشركات في أي وقت. يمكنك أيضاً التخفيض بين الباقات، وسيتم احتساب الرصيد المتبقي."
            : "Yes, you can upgrade from the employee plan to HR freelancer or company plans at any time. You can also downgrade between plans, and the remaining balance will be calculated.",
        },
        {
          q: isArabic ? "كيف أغير كلمة المرور؟" : "How do I change my password?",
          a: isArabic
            ? "من لوحة التحكم، اذهب إلى الإعدادات > الحساب > تغيير كلمة المرور. أدخل كلمة المرور الحالية والجديدة وسيتم التحديث فوراً."
            : "From the dashboard, go to Settings > Account > Change Password. Enter your current and new password and it will be updated immediately.",
        },
        {
          q: isArabic ? "هل يدعم رابِط المصادقة الثنائية؟" : "Does Rabt support two-factor authentication?",
          a: isArabic
            ? "نعم، نوفر المصادقة الثنائية (2FA) لحماية حسابك. يمكنك تفعيلها من الإعدادات > الأمان > المصادقة الثنائية."
            : "Yes, we provide two-factor authentication (2FA) to protect your account. You can enable it from Settings > Security > Two-Factor Authentication.",
        },
      ],
    },
    {
      id: "billing",
      name: isArabic ? "الفواتير" : "Billing",
      icon: CreditCard,
      color: "from-green-500 to-emerald-600",
      questions: [
        {
          q: isArabic ? "ما هي طرق الدفع المتاحة؟" : "What payment methods are available?",
          a: isArabic
            ? "نقبل بطاقات الائتمان (Visa, Mastercard, Mada)، Apple Pay، والتحويل البنكي للشركات. جميع المعاملات آمنة ومشفرة بأعلى معايير الأمان."
            : "We accept credit cards (Visa, Mastercard, Mada), Apple Pay, and bank transfer for companies. All transactions are secure and encrypted with the highest security standards.",
        },
        {
          q: isArabic ? "هل الأسعار شاملة ضريبة القيمة المضافة؟" : "Are prices inclusive of VAT?",
          a: isArabic
            ? "الأسعار المعروضة غير شاملة لضريبة القيمة المضافة (15%). سيتم إضافة الضريبة تلقائياً عند الدفع وفقاً للأنظمة السعودية."
            : "Displayed prices are exclusive of VAT (15%). Tax will be automatically added at checkout according to Saudi regulations.",
        },
        {
          q: isArabic ? "متى يتم تجديد الاشتراك؟" : "When is the subscription renewed?",
          a: isArabic
            ? "يتم تجديد الاشتراك تلقائياً في نفس تاريخ الاشتراك كل شهر. سنرسل لك إشعار قبل 7 أيام من التجديد. يمكنك إلغاء التجديد التلقائي في أي وقت."
            : "The subscription is automatically renewed on the same subscription date each month. We'll send you a notification 7 days before renewal. You can cancel auto-renewal at any time.",
        },
        {
          q: isArabic ? "هل تقدمون خصومات للدفع السنوي؟" : "Do you offer discounts for annual payment?",
          a: isArabic
            ? "نعم! نوفر خصم 20% عند الدفع السنوي مقدماً. مثلاً، باقة مستقل HR بـ 299 ريال شهرياً تصبح 2,870 ريال سنوياً (بدلاً من 3,588 ريال)."
            : "Yes! We offer a 20% discount for annual prepayment. For example, the HR Freelancer plan at 299 SAR/month becomes 2,870 SAR/year (instead of 3,588 SAR).",
        },
      ],
    },
    {
      id: "features",
      name: isArabic ? "الميزات" : "Features",
      icon: Settings,
      color: "from-orange-500 to-red-600",
      questions: [
        {
          q: isArabic ? "كيف أستخدم حاسبة نهاية الخدمة؟" : "How do I use the end-of-service calculator?",
          a: isArabic
            ? 'من الأدوات الذكية، اختر "حاسبة نهاية الخدمة". أدخل تاريخ المباشرة، آخر يوم عمل، الراتب الإجمالي، نوع العقد، وسبب الإنهاء. سيتم حساب المستحقات فوراً وفق المادة 84 من نظام العمل.'
            : 'From Smart Tools, select "End of Service Calculator". Enter the start date, last working day, total salary, contract type, and termination reason. Benefits will be calculated immediately according to Article 84 of the Labor Law.',
        },
        {
          q: isArabic ? "كيف يعمل مولد الخطابات بالذكاء الاصطناعي؟" : "How does the AI letter generator work?",
          a: isArabic
            ? "اختر نوع الخطاب من 55+ نموذج جاهز، أو استخدم المولد المخصص. أدخل التفاصيل المطلوبة واختر اللغة والأسلوب. سيقوم الذكاء الاصطناعي بصياغة خطاب احترافي متوافق مع نظام العمل."
            : "Choose the letter type from 55+ ready templates, or use the custom generator. Enter the required details and select language and style. The AI will draft a professional letter compliant with Labor Law.",
        },
        {
          q: isArabic ? "ما هو نظام ATS وكيف يساعدني؟" : "What is ATS and how does it help me?",
          a: isArabic
            ? "ATS (Applicant Tracking System) هو نظام تتبع المتقدمين. يساعدك في نشر الوظائف، استقبال السير الذاتية، فرزها بالذكاء الاصطناعي، تقييم المرشحين، جدولة المقابلات، ومتابعة مراحل التوظيف."
            : "ATS (Applicant Tracking System) is an applicant tracking system. It helps you post jobs, receive resumes, sort them with AI, evaluate candidates, schedule interviews, and track hiring stages.",
        },
      ],
    },
    {
      id: "security",
      name: isArabic ? "الأمان" : "Security",
      icon: Shield,
      color: "from-red-500 to-pink-600",
      questions: [
        {
          q: isArabic ? "كيف تحمون بياناتي؟" : "How do you protect my data?",
          a: isArabic
            ? "نستخدم تشفير SSL 256-bit لجميع البيانات. الخوادم موجودة في السعودية ومتوافقة مع قوانين حماية البيانات. نقوم بنسخ احتياطي يومي ولا نشارك بياناتك مع أي طرف ثالث."
            : "We use SSL 256-bit encryption for all data. Servers are located in Saudi Arabia and comply with data protection laws. We perform daily backups and don't share your data with any third party.",
        },
        {
          q: isArabic ? "من يمكنه الوصول لبيانات شركتي؟" : "Who can access my company's data?",
          a: isArabic
            ? "فقط المستخدمين المصرح لهم في حسابك. يمكنك تحديد الصلاحيات لكل مستخدم (مشاهدة، تعديل، حذف). جميع الإجراءات مسجلة في سجل النشاطات."
            : "Only authorized users in your account. You can set permissions for each user (view, edit, delete). All actions are logged in the activity log.",
        },
        {
          q: isArabic ? "هل يمكنني حذف بياناتي نهائياً؟" : "Can I permanently delete my data?",
          a: isArabic
            ? "نعم، يمكنك طلب حذف حسابك وجميع بياناتك من الإعدادات > الأمان > حذف الحساب. سيتم حذف جميع البيانات نهائياً خلال 30 يوم وفقاً لسياسة الخصوصية."
            : "Yes, you can request deletion of your account and all data from Settings > Security > Delete Account. All data will be permanently deleted within 30 days according to the privacy policy.",
        },
      ],
    },
    {
      id: "support",
      name: isArabic ? "الدعم" : "Support",
      icon: MessageCircle,
      color: "from-teal-500 to-cyan-600",
      questions: [
        {
          q: isArabic ? "كيف أتواصل مع الدعم الفني؟" : "How do I contact technical support?",
          a: isArabic
            ? "يمكنك التواصل عبر: البريد الإلكتروني info@rbithr.com، الواتساب 0570700355، أو نظام التذاكر داخل لوحة التحكم. أوقات الدعم: الأحد-الخميس 9ص-6م."
            : "You can contact us via: email info@rbithr.com, WhatsApp 0570700355, or the ticket system inside the dashboard. Support hours: Sunday-Thursday 9am-6pm.",
        },
        {
          q: isArabic ? "ما هو وقت الاستجابة للدعم؟" : "What is the support response time?",
          a: isArabic
            ? "للباقة المجانية: خلال 48 ساعة. مستقل HR: خلال 24 ساعة (دعم أولوية). الشركات: خلال 4 ساعات مع دعم مخصص 24/7 للباقات الكبيرة."
            : "For free plan: within 48 hours. HR Freelancer: within 24 hours (priority support). Companies: within 4 hours with dedicated 24/7 support for large plans.",
        },
        {
          q: isArabic ? "هل تقدمون تدريب على استخدام النظام؟" : "Do you offer training on using the system?",
          a: isArabic
            ? "نعم! نوفر فيديوهات تعليمية، دليل مستخدم شامل، وجولة تعريفية للمستخدمين الجدد. للشركات، نوفر جلسات تدريب مباشرة مجانية عند الاشتراك."
            : "Yes! We provide tutorial videos, comprehensive user guide, and onboarding tour for new users. For companies, we offer free live training sessions upon subscription.",
        },
      ],
    },
  ];

  // Filter questions based on search and category
  const filteredCategories = faqCategories
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (q) =>
          (selectedCategory === null || selectedCategory === category.id) &&
          (searchQuery === "" ||
            q.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.a.toLowerCase().includes(searchQuery.toLowerCase()))
      ),
    }))
    .filter((category) => category.questions.length > 0);

  const totalQuestions = faqCategories.reduce((sum, cat) => sum + cat.questions.length, 0);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-8 transition-colors">
            <ChevronLeft className={`w-5 h-5 ${isArabic ? "rotate-180" : ""}`} />
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </Link>

          <AnimatedSection className="text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-6 shadow-lg">
              <BookOpen className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-4 max-w-2xl mx-auto">
              {isArabic
                ? "إجابات شاملة على جميع أسئلتك حول رابِط"
                : "Comprehensive answers to all your questions about Rabt"}
            </p>
            
            <Badge variant="secondary" className="text-sm px-4 py-2">
              {totalQuestions} {isArabic ? "سؤال وجواب" : "Q&A"}
            </Badge>
          </AnimatedSection>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <AnimatedSection delay={100}>
            <GlassCard className="p-6 mb-8 max-w-3xl mx-auto">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${isArabic ? "right-4" : "left-4"}`} />
                <Input
                  placeholder={isArabic ? "ابحث في الأسئلة الشائعة..." : "Search FAQ..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isArabic ? "pr-12 text-right" : "pl-12"} h-12 text-lg bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50`}
                />
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Category Filters */}
          <AnimatedSection delay={200} className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-full
                  transition-all duration-300
                  ${selectedCategory === null
                    ? "bg-gradient-to-r from-primary to-purple-600 text-white shadow-lg"
                    : "bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }
                `}
              >
                <Sparkles className="w-5 h-5" />
                <span className="font-medium">{isArabic ? "الكل" : "All"}</span>
              </button>
              {faqCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`
                    flex items-center gap-2 px-6 py-3 rounded-full
                    transition-all duration-300
                    ${selectedCategory === category.id
                      ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                      : "bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                    }
                  `}
                >
                  <category.icon className="w-5 h-5" />
                  <span className="font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* FAQ Content Section */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {filteredCategories.length === 0 ? (
            <AnimatedSection>
              <GlassCard className="p-12 text-center">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {isArabic ? "لم نجد نتائج" : "No Results Found"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic
                    ? "جرب البحث بكلمات مختلفة أو تصفح الفئات"
                    : "Try searching with different words or browse categories"}
                </p>
              </GlassCard>
            </AnimatedSection>
          ) : (
            <div className="space-y-8">
              {filteredCategories.map((category, catIndex) => (
                <AnimatedSection key={category.id} delay={catIndex * 100}>
                  <GlassCard className="overflow-hidden">
                    {/* Category Header */}
                    <div className={`bg-gradient-to-r ${category.color} p-6`}>
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                          <category.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white">{category.name}</h2>
                          <p className="text-white/80 text-sm">
                            {category.questions.length} {isArabic ? "سؤال" : "questions"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Questions */}
                    <div className="p-6">
                      <Accordion type="single" collapsible className="w-full">
                        {category.questions.map((question, qIndex) => (
                          <AccordionItem
                            key={qIndex}
                            value={`item-${qIndex}`}
                            className="border-b border-gray-200/50 dark:border-gray-700/50 last:border-0"
                          >
                            <AccordionTrigger className={`text-${isArabic ? "right" : "left"} hover:no-underline py-5`}>
                              <span className="font-semibold text-gray-900 dark:text-white">
                                {question.q}
                              </span>
                            </AccordionTrigger>
                            <AccordionContent className={`text-${isArabic ? "right" : "left"} text-gray-600 dark:text-gray-400 leading-relaxed pb-5`}>
                              {question.a}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </div>
                  </GlassCard>
                </AnimatedSection>
              ))}
            </div>
          )}
        </div>
      </section>
      <QuickActionsBar isArabic={isArabic} />

      <ConnectedPagesSection
        isArabic={isArabic}
        highlight={{ ar: "روابط سريعة", en: "Quick Links" }}
        title={{
          ar: "تابع رحلتك بعد الإجابة",
          en: "Continue after finding your answer",
        }}
        subtitle={{
          ar: "انتقل مباشرة إلى الاتصال، الباقات، أو تجربة الأدوات لإكمال ما بدأت.",
          en: "Jump straight to contact, plans, or tools to finish what you started.",
        }}
        className="pt-4"
      />

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-primary via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center text-white">
            <MessageCircle className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? "لم تجد إجابة لسؤالك؟" : "Didn't Find Your Answer?"}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {isArabic
                ? "فريق الدعم جاهز لمساعدتك في أي وقت"
                : "Our support team is ready to help you anytime"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button
                  size="lg"
                  className="bg-white text-primary hover:bg-gray-100 px-8"
                >
                  <Mail className="w-5 h-5 me-2" />
                  {isArabic ? "تواصل معنا" : "Contact Us"}
                </Button>
              </Link>
              <a href="https://wa.me/966570700355" target="_blank" rel="noopener noreferrer">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 px-8"
                >
                  <Phone className="w-5 h-5 me-2" />
                  {isArabic ? "واتساب مباشر" : "Direct WhatsApp"}
                </Button>
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
