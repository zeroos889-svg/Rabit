import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import {
  Calculator,
  ClipboardCheck,
  FileText,
  ListChecks,
  PenSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
  ArrowRight,
  ArrowLeft,
  Star,
  Zap,
  Target,
  Clock,
  Award,
  ChevronRight,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { APP_LOGO } from "@/const";

// =====================================================
// INTERFACES
// =====================================================

interface Tool {
  key: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  scenario: string;
  scenarioEn: string;
  icon: any;
  color: string;
  gradient: string;
  href: string;
  badge?: string;
  badgeEn?: string;
  isNew?: boolean;
  isFree?: boolean;
}

const TOOL_FEATURES = [
  { icon: Sparkles, titleAr: "ذكاء اصطناعي", titleEn: "AI Powered", descAr: "أدوات مدعومة بالذكاء الاصطناعي", descEn: "AI-powered tools", color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30", key: "ai-powered" },
  { icon: ClipboardCheck, titleAr: "متوافق مع النظام", titleEn: "Compliant", descAr: "متوافق مع نظام العمل السعودي", descEn: "Saudi Labor Law compliant", color: "text-green-600 bg-green-100 dark:bg-green-900/30", key: "compliant" },
  { icon: Workflow, titleAr: "سهل الاستخدام", titleEn: "Easy to Use", descAr: "واجهة بسيطة وسهلة", descEn: "Simple and intuitive", color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30", key: "easy-use" },
  { icon: Clock, titleAr: "توفير الوقت", titleEn: "Time Saving", descAr: "نتائج فورية ودقيقة", descEn: "Instant accurate results", color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30", key: "time-saving" },
];

const TOOL_LIST: Tool[] = [
  {
    key: "end_of_service",
    title: "حاسبة نهاية الخدمة",
    titleEn: "End of Service Calculator",
    description: "احسب مستحقات نهاية الخدمة بدقة وفق نظام العمل السعودي",
    descriptionEn: "Calculate end of service benefits accurately according to Saudi Labor Law",
    scenario: "مثالي للموظفين والشركات لحساب مكافأة نهاية الخدمة",
    scenarioEn: "Ideal for employees and companies to calculate termination benefits",
    icon: Calculator,
    color: "orange",
    gradient: "from-orange-500 to-amber-500",
    href: "/tools/end-of-service",
    isFree: true,
  },
  {
    key: "vacation",
    title: "حاسبة الإجازات",
    titleEn: "Leave Calculator",
    description: "احسب رصيد إجازاتك ومستحقاتها المالية",
    descriptionEn: "Calculate your leave balance and monetary entitlements",
    scenario: "تتبع إجازاتك السنوية والمرضية والاستثنائية",
    scenarioEn: "Track your annual, sick, and exceptional leaves",
    icon: ListChecks,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
    href: "/tools/leave-calculator",
    isFree: true,
  },
  {
    key: "letter_generator",
    title: "مولد الخطابات الذكي",
    titleEn: "AI Letter Generator",
    description: "أنشئ خطابات HR احترافية بالذكاء الاصطناعي",
    descriptionEn: "Generate professional HR letters with AI",
    scenario: "خطابات تعريف، شهادات خبرة، إنذارات، والمزيد",
    scenarioEn: "Introduction letters, experience certificates, warnings, and more",
    icon: PenSquare,
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
    href: "/tools/letter-generator",
    isNew: true,
  },
  {
    key: "smart_form",
    title: "مولد النماذج الذكي",
    titleEn: "Smart Form Generator",
    description: "أنشئ نماذج HR متقدمة بسهولة",
    descriptionEn: "Create advanced HR forms easily",
    scenario: "نماذج توظيف، تقييم أداء، استبيانات",
    scenarioEn: "Hiring forms, performance reviews, surveys",
    icon: FileText,
    color: "emerald",
    gradient: "from-emerald-500 to-green-500",
    href: "/dashboard/smart-form-generator",
  },
  {
    key: "certificates",
    title: "إدارة الشهادات",
    titleEn: "Certificate Management",
    description: "أصدر وأدر شهادات الموظفين",
    descriptionEn: "Issue and manage employee certificates",
    scenario: "شهادات خبرة، تدريب، إنجازات",
    scenarioEn: "Experience, training, achievement certificates",
    icon: ShieldCheck,
    color: "slate",
    gradient: "from-slate-500 to-gray-600",
    href: "/dashboard/certificates",
  },
  {
    key: "reports",
    title: "التقارير المتقدمة",
    titleEn: "Advanced Reports",
    description: "تقارير وإحصائيات شاملة للموارد البشرية",
    descriptionEn: "Comprehensive HR reports and statistics",
    scenario: "تقارير الحضور، الرواتب، الأداء",
    scenarioEn: "Attendance, payroll, performance reports",
    icon: TrendingUp,
    color: "indigo",
    gradient: "from-indigo-500 to-blue-600",
    href: "/dashboard/reports",
  },
];

const WORKFLOW_STEPS = [
  {
    titleAr: "اختر الأداة المناسبة",
    titleEn: "Choose the Right Tool",
    descAr: "حدد الأداة التي تحتاجها من مجموعة أدواتنا المتخصصة",
    descEn: "Select the tool you need from our specialized collection",
  },
  {
    titleAr: "أدخل البيانات",
    titleEn: "Enter Your Data",
    descAr: "املأ المعلومات المطلوبة بسهولة",
    descEn: "Fill in the required information easily",
  },
  {
    titleAr: "احصل على النتائج",
    titleEn: "Get Results",
    descAr: "احصل على نتائج دقيقة فورياً",
    descEn: "Get accurate results instantly",
  },
  {
    titleAr: "صدّر وشارك",
    titleEn: "Export & Share",
    descAr: "صدّر النتائج بصيغ متعددة أو شاركها",
    descEn: "Export results in multiple formats or share them",
  },
];

// =====================================================
// REUSABLE COMPONENTS  
// =====================================================

// Animated Background
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/10" />
    
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
  hover = true,
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
}) => (
  <div 
    className={cn(
      "relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
      "border border-white/30 dark:border-gray-700/30",
      "rounded-2xl shadow-lg",
      hover && "transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
      className
    )}
  >
    {children}
  </div>
);

// Header Component
const Header = ({ isArabic }: { isArabic: boolean }) => {
  const Arrow = isArabic ? ArrowRight : ArrowLeft;

  return (
    <header className="relative z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer">
              <img 
                src={APP_LOGO} 
                alt="رابِط | Rabit" 
                className="h-10 w-auto transition-transform group-hover:scale-105" 
              />
            </div>
          </Link>
          
          <div className="flex items-center gap-4">
            <Link href="/pricing">
              <Button variant="ghost" className="text-gray-600 hover:text-brand-primary hidden sm:flex">
                {isArabic ? "الأسعار" : "Pricing"}
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

// Tool Card Component
const ToolCard = ({
  tool,
  isArabic,
  index,
}: {
  tool: Tool;
  isArabic: boolean;
  index: number;
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100 * index);
    return () => clearTimeout(timer);
  }, [index]);

  const Icon = tool.icon;
  let badgeLabel: string | null = null;
  if (tool.isNew) {
    badgeLabel = isArabic ? "جديد" : "New";
  } else if (tool.isFree) {
    badgeLabel = isArabic ? "مجاني" : "Free";
  }

  return (
    <div
      className={cn(
        "transform transition-all duration-700",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
    >
      <GlassCard className="h-full overflow-hidden group">
        {/* Header with icon */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className={cn(
              "p-3 rounded-xl transition-transform duration-300 group-hover:scale-110",
              "bg-gradient-to-br shadow-md",
              tool.gradient
            )}>
              <Icon className="w-6 h-6 text-white" />
            </div>
            {badgeLabel && (
              <Badge className={cn(
                "px-2 py-1 text-xs font-medium",
                tool.isNew 
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
              )}>
                {badgeLabel}
              </Badge>
            )}
          </div>

          {/* Title & Description */}
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-primary transition-colors">
            {isArabic ? tool.title : tool.titleEn}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-3">
            {isArabic ? tool.description : tool.descriptionEn}
          </p>
          
          {/* Use Case */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-start gap-2">
              <Target className="w-4 h-4 flex-shrink-0 mt-0.5 text-brand-primary" />
              <span>{isArabic ? tool.scenario : tool.scenarioEn}</span>
            </p>
          </div>
        </div>

        {/* Footer with CTA */}
        <div className="px-6 pb-6">
          <Button
            className={cn(
              "w-full h-11 rounded-xl font-medium",
              "bg-gradient-to-r text-white shadow-md",
              "transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
              tool.gradient
            )}
            onClick={() => setLocation(tool.href)}
          >
            {isArabic ? "جرب الآن" : "Try Now"}
            <ChevronRight className={cn(
              "w-4 h-4 transition-transform",
              isArabic ? "ms-2 rotate-180" : "ms-2"
            )} />
          </Button>
        </div>
      </GlassCard>
    </div>
  );
};

// Stat Card
const StatCard = ({
  value,
  label,
  icon: Icon,
  color,
}: {
  value: string;
  label: string;
  icon: any;
  color: string;
}) => (
  <div className="text-center group">
    <div className={cn(
      "inline-flex items-center justify-center w-12 h-12 rounded-xl mb-3",
      "transition-transform duration-300 group-hover:scale-110",
      color
    )}>
      <Icon className="w-6 h-6" />
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
  </div>
);

// Workflow Step
const WorkflowStep = ({
  number,
  title,
  description,
  isLast,
}: {
  number: number;
  title: string;
  description: string;
  isLast: boolean;
}) => (
  <div className="relative flex gap-4">
    {/* Connector Line */}
    {!isLast && (
      <div className="absolute top-12 start-5 w-0.5 h-[calc(100%-2rem)] bg-gradient-to-b from-brand-primary to-brand-secondary" />
    )}
    
    {/* Number */}
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold z-10">
      {number}
    </div>
    
    {/* Content */}
    <div className="pb-8">
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  </div>
);

const HeroSection = ({ isArabic, isVisible }: { isArabic: boolean; isVisible: boolean }) => (
  <section className="py-12 lg:py-20">
    <div className="grid lg:grid-cols-2 gap-12 items-center">
      <div 
        className={cn(
          "space-y-6 transition-all duration-700",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"
        )}
      >
        <Badge className="bg-brand-primary/10 text-brand-primary border-0 text-sm px-4 py-1.5">
          <Sparkles className="w-4 h-4 me-1" />
          {isArabic ? "أدوات HR الذكية" : "Smart HR Tools"}
        </Badge>

        <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
          <span className="text-gray-900 dark:text-white">
            {isArabic ? "أدوات احترافية " : "Professional Tools "}
          </span>
          <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
            {isArabic ? "لإدارة الموارد البشرية" : "for HR Management"}
          </span>
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg">
          {isArabic
            ? "مجموعة متكاملة من الأدوات الذكية المصممة لتبسيط عمليات الموارد البشرية وتوفير الوقت"
            : "A comprehensive set of smart tools designed to simplify HR operations and save time"}
        </p>

        <div className="grid grid-cols-2 gap-4 py-4">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <p className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">70%</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isArabic ? "توفير في الوقت" : "Time Saved"}
            </p>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
            <p className="text-3xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">3x</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isArabic ? "دقة أعلى" : "More Accurate"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <Link href="/pricing">
            <Button
              className={cn(
                "h-12 px-6 rounded-xl font-semibold",
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
              className="h-12 px-6 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isArabic ? "تواصل معنا" : "Contact Us"}
            </Button>
          </Link>
        </div>
      </div>

      <div 
        className={cn(
          "transition-all duration-700 delay-200",
          isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
        )}
      >
        <GlassCard className="p-6 lg:p-8" hover={false}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            {isArabic ? "مميزات الأدوات" : "Tool Features"}
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {TOOL_FEATURES.map((item) => (
              <div key={item.key} className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center mb-3", item.color)}>
                  <item.icon className="w-5 h-5" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white mb-1">
                  {isArabic ? item.titleAr : item.titleEn}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? item.descAr : item.descEn}
                </p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  </section>
);

const ToolsGridSection = ({ isArabic }: { isArabic: boolean }) => (
  <section className="py-12">
    <div className="text-center mb-10">
      <p className="text-sm uppercase tracking-wide text-brand-primary mb-2">
        {isArabic ? "أدواتنا" : "Our Tools"}
      </p>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
        {isArabic ? "استكشف الأدوات المتاحة" : "Explore Available Tools"}
      </h2>
    </div>
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {TOOL_LIST.map((tool, index) => (
        <ToolCard 
          key={tool.key}
          tool={tool}
          isArabic={isArabic}
          index={index}
        />
      ))}
    </div>
  </section>
);

const WorkflowSection = ({ isArabic }: { isArabic: boolean }) => (
  <section className="py-12">
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div>
        <Badge className="bg-brand-secondary/10 text-brand-secondary border-0 text-sm px-4 py-1.5 mb-4">
          <Workflow className="w-4 h-4 me-1" />
          {isArabic ? "طريقة العمل" : "How It Works"}
        </Badge>
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isArabic ? "خطوات بسيطة للبدء" : "Simple Steps to Start"}
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {isArabic
            ? "ابدأ باستخدام أدواتنا في دقائق معدودة"
            : "Start using our tools in just minutes"}
        </p>

        <div className="space-y-2">
          {WORKFLOW_STEPS.map((step, index) => (
            <WorkflowStep
              key={step.titleEn}
              number={index + 1}
              title={isArabic ? step.titleAr : step.titleEn}
              description={isArabic ? step.descAr : step.descEn}
              isLast={index === WORKFLOW_STEPS.length - 1}
            />
          ))}
        </div>
      </div>

      <GlassCard className="p-6 lg:p-8" hover={false}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
          {isArabic ? "إحصائيات المنصة" : "Platform Stats"}
        </h3>
        <div className="grid grid-cols-2 gap-6 mb-6">
          <StatCard 
            value="15+" 
            label={isArabic ? "قالب جاهز" : "Ready Templates"} 
            icon={FileText}
            color="bg-blue-100 text-blue-600 dark:bg-blue-900/30"
          />
          <StatCard 
            value="24/7" 
            label={isArabic ? "دعم متواصل" : "Support"} 
            icon={Clock}
            color="bg-green-100 text-green-600 dark:bg-green-900/30"
          />
        </div>
        <div className="grid grid-cols-2 gap-6">
          <StatCard 
            value="+40" 
            label={isArabic ? "تكامل" : "Integrations"} 
            icon={Zap}
            color="bg-purple-100 text-purple-600 dark:bg-purple-900/30"
          />
          <StatCard 
            value="99.9%" 
            label={isArabic ? "وقت التشغيل" : "Uptime"} 
            icon={Award}
            color="bg-orange-100 text-orange-600 dark:bg-orange-900/30"
          />
        </div>
      </GlassCard>
    </div>
  </section>
);

const CtaSection = ({ isArabic }: { isArabic: boolean }) => (
  <section className="py-12">
    <GlassCard className="p-8 lg:p-12 text-center" hover={false}>
      <Badge className="bg-brand-primary/10 text-brand-primary border-0 text-sm px-4 py-1.5 mb-4">
        <Star className="w-4 h-4 me-1" />
        {isArabic ? "ابدأ اليوم" : "Start Today"}
      </Badge>
      <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 max-w-2xl mx-auto">
        {isArabic 
          ? "جرب أدواتنا الذكية واكتشف الفرق" 
          : "Try Our Smart Tools and Discover the Difference"}
      </h2>
      <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto mb-8">
        {isArabic
          ? "سجل الآن واحصل على تجربة مجانية لجميع الأدوات"
          : "Sign up now and get a free trial for all tools"}
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
            {isArabic ? "سجل مجاناً" : "Sign Up Free"}
            <ChevronRight className={cn("w-5 h-5", isArabic ? "ms-2 rotate-180" : "ms-2")} />
          </Button>
        </Link>
        <Link href="/pricing">
          <Button
            variant="outline"
            className="h-12 px-8 rounded-xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isArabic ? "عرض الأسعار" : "View Pricing"}
          </Button>
        </Link>
      </div>
    </GlassCard>
  </section>
);

const SharedAnimations = () => (
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
);

// =====================================================
// MAIN COMPONENT
// =====================================================

const usePageReveal = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return isVisible;
};

export default function ToolsRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const isVisible = usePageReveal();

  return (
    <div className="min-h-screen relative overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
      <AnimatedBackground />
      
      <Header isArabic={isArabic} />
      <QuickActionsBar isArabic={isArabic} className="border-0" />

      <main className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HeroSection isArabic={isArabic} isVisible={isVisible} />
          <ToolsGridSection isArabic={isArabic} />
          <WorkflowSection isArabic={isArabic} />
          <ConnectedPagesSection
            isArabic={isArabic}
            highlight={{
              ar: "روابط سريعة",
              en: "Quick Shortcuts",
            }}
            title={{
              ar: "انتقل بين الأدوات، الباقات، والاستشارات بسهولة",
              en: "Hop between tools, pricing, and consulting effortlessly",
            }}
            subtitle={{
              ar: "حافظ على تدفق العمل: جرّب أداة، راجع الأسعار، أو احجز استشارة بدون مغادرة المسار.",
              en: "Keep momentum: try a tool, review pricing, or book a consultation without breaking the flow.",
            }}
          />
          <CtaSection isArabic={isArabic} />
        </div>
      </main>
      <SharedAnimations />
    </div>
  );
}
