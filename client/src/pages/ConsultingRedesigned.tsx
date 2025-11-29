import { useCallback, useState, memo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Footer } from "@/components/Footer";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Activity,
  ArrowRight,
  BadgeCheck,
  Brain,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  MessageSquare,
  Phone,
  Rocket,
  Shield,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Timer,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface PackageData {
  name: string;
  nameEn: string;
  badge: string;
  badgeEn: string;
  price: string;
  priceEn: string;
  sla: string;
  slaEn: string;
  description: string;
  descriptionEn: string;
  features: { ar: string; en: string }[];
  href: string;
  popular?: boolean;
  gradient: string;
}

interface ValueStack {
  title: string;
  titleEn: string;
  accent: string;
  icon: LucideIcon;
  items: { ar: string; en: string }[];
}

interface WorkflowStep {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  meta: string;
  metaEn: string;
  icon: LucideIcon;
}

interface FAQ {
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
}

interface SectionProps {
  readonly isArabic: boolean;
}

// ============================================================================
// Animation Component
// ============================================================================

interface AnimateOnScrollProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

const DELAY_CLASS_MAP: Record<number, string> = {
  0: "delay-0",
  100: "delay-100",
  200: "delay-200",
  300: "delay-300",
  400: "delay-[400ms]",
};

function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
}: AnimateOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
  }, []);

  const delayClass = DELAY_CLASS_MAP[delay] ?? "delay-0";

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ${delayClass} ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

// Stat Badge Component
const StatBadge = memo(function StatBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
      <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-white/70">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
});

// Package Card Component
const PackageCard = memo(function PackageCard({
  pkg,
  isArabic,
}: {
  pkg: PackageData;
  isArabic: boolean;
}) {
  return (
    <Card
      className={`relative h-full transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 overflow-hidden ${
        pkg.popular
          ? "ring-2 ring-primary shadow-lg shadow-primary/20"
          : "shadow-md"
      }`}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 opacity-5 ${pkg.gradient}`} />

      {/* Popular badge */}
      {pkg.popular && (
        <div className="absolute -top-1 -end-1 z-10">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold px-4 py-1 rounded-bl-xl rounded-tr-xl shadow-lg">
            <Star className="h-3 w-3 inline me-1" />
            {isArabic ? "الأكثر طلباً" : "Most Popular"}
          </div>
        </div>
      )}

      <CardHeader className="space-y-4 relative">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">
            {isArabic ? pkg.name : pkg.nameEn}
          </CardTitle>
          <Badge variant="secondary" className="font-normal">
            {isArabic ? pkg.badge : pkg.badgeEn}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              {isArabic ? pkg.price : pkg.priceEn}
            </span>
          </div>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">
              {isArabic ? pkg.sla : pkg.slaEn}
            </span>
          </div>
        </div>

        <CardDescription className="text-base">
          {isArabic ? pkg.description : pkg.descriptionEn}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 relative">
        <ul className="space-y-3">
          {pkg.features.map((feature) => (
            <li key={feature.en} className="flex items-start gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-muted-foreground">
                {isArabic ? feature.ar : feature.en}
              </span>
            </li>
          ))}
        </ul>

        <Button
          className={`w-full group ${
            pkg.popular
              ? "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-white"
              : ""
          }`}
          variant={pkg.popular ? "default" : "outline"}
          asChild
        >
          <Link href={pkg.href}>
            {isArabic ? "ابدأ هذه الباقة" : "Get Started"}
            <ArrowRight className="h-4 w-4 ms-2 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
});

// Value Stack Card Component
const ValueStackCard = memo(function ValueStackCard({
  stack,
  isArabic,
}: {
  stack: ValueStack;
  isArabic: boolean;
}) {
  const Icon = stack.icon;
  return (
    <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
      <CardHeader>
        <div
          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stack.accent} text-white flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <CardTitle className="text-xl">
          {isArabic ? stack.title : stack.titleEn}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {stack.items.map((item) => (
            <li key={item.en} className="flex gap-3">
              <div className="h-5 w-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle2 className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm text-muted-foreground leading-relaxed">
                {isArabic ? item.ar : item.en}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
});

// Workflow Step Component
const WorkflowStepCard = memo(function WorkflowStepCard({
  step,
  index,
  isArabic,
}: {
  step: WorkflowStep;
  index: number;
  isArabic: boolean;
}) {
  const Icon = step.icon;
  return (
    <div className="relative flex gap-4">
      {/* Line connector */}
      <div className="absolute top-14 bottom-0 start-6 w-px bg-gradient-to-b from-primary/50 to-transparent" />

      {/* Step number */}
      <div className="relative z-10 h-12 w-12 rounded-full bg-gradient-to-br from-primary to-purple-600 text-white flex items-center justify-center font-bold text-lg shadow-lg shadow-primary/30 flex-shrink-0">
        {index + 1}
      </div>

      <Card className="flex-1 border-0 shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {isArabic ? step.title : step.titleEn}
            </CardTitle>
            <Badge variant="outline" className="font-normal">
              {isArabic ? step.meta : step.metaEn}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isArabic ? step.description : step.descriptionEn}
          </p>
        </CardContent>
      </Card>
    </div>
  );
});

// ============================================================================
// Data Constants
// ============================================================================

const HERO_STATS = [
  {
    icon: Timer,
    label: { ar: "سرعة الاستجابة", en: "Response Time" },
    value: { ar: "رد خلال 90 دقيقة", en: "90 min response" },
  },
  {
    icon: Star,
    label: { ar: "ثقة العملاء", en: "Client Trust" },
    value: { ar: "4.8/5 من 1200+ حالة", en: "4.8/5 from 1200+ cases" },
  },
  {
    icon: Users,
    label: { ar: "شبكة الخبراء", en: "Expert Network" },
    value: { ar: "50+ مستشار معتمد", en: "50+ certified consultants" },
  },
  {
    icon: ShieldCheck,
    label: { ar: "ضمان الجودة", en: "Quality Guarantee" },
    value: { ar: "استرداد كامل عند عدم الرضا", en: "Full refund if unsatisfied" },
  },
];

const PACKAGES: PackageData[] = [
  {
    name: "مسار فوري",
    nameEn: "Instant Path",
    badge: "أسرع اختيار",
    badgeEn: "Fastest Choice",
    price: "99 ريال",
    priceEn: "99 SAR",
    sla: "رد أولي خلال 90 دقيقة",
    slaEn: "Initial response within 90 minutes",
    description: "مناسب للقرارات السريعة والأسئلة القصيرة",
    descriptionEn: "Suitable for quick decisions and short questions",
    features: [
      { ar: "دردشة فورية أو مكالمة قصيرة مع مستشار متخصص", en: "Instant chat or short call with a specialized consultant" },
      { ar: "تحليل سريع وخطوات تنفيذية مختصرة", en: "Quick analysis and brief action steps" },
      { ar: "ملخص مكتوب ومرفقات مؤمنة", en: "Written summary and secure attachments" },
    ],
    href: "/consulting/book-new?mode=instant",
    gradient: "from-cyan-500 to-blue-600",
  },
  {
    name: "جلسة تنفيذية",
    nameEn: "Executive Session",
    badge: "الأكثر توازناً",
    badgeEn: "Most Balanced",
    price: "199 ريال",
    priceEn: "199 SAR",
    sla: "جلسة 30-45 دقيقة",
    slaEn: "30-45 minute session",
    description: "أفضل خيار لمراجعة عقود أو قرارات HR مع تطبيق مباشر",
    descriptionEn: "Best option for reviewing contracts or HR decisions with direct application",
    features: [
      { ar: "اختيار المستشار والموعد مع تذكيرات ذكية", en: "Choose consultant and time with smart reminders" },
      { ar: "مشاركة شاشة، تسجيل الجلسة، وخطة تصحيحية", en: "Screen sharing, session recording, and corrective plan" },
      { ar: "دعم متابعة لمدة 48 ساعة بعد الجلسة", en: "Follow-up support for 48 hours after the session" },
    ],
    href: "/consulting/book-new",
    popular: true,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    name: "اشتراك أعمال",
    nameEn: "Business Subscription",
    badge: "قيمة للشركات",
    badgeEn: "Value for Companies",
    price: "يبدأ من 899 ريال/شهر",
    priceEn: "Starting 899 SAR/month",
    sla: "مدير حساب + SLA 12 ساعة",
    slaEn: "Account manager + 12 hour SLA",
    description: "اشتراك شهري يغطي الفريق بمخصص ساعات واستشارات غير محدودة نصياً",
    descriptionEn: "Monthly subscription covering the team with allocated hours and unlimited text consultations",
    features: [
      { ar: "تسعير شفاف بعدد المقاعد وساعات الجلسات", en: "Transparent pricing by seats and session hours" },
      { ar: "لوحة تحكم للموافقات والفوترة الموحدة", en: "Dashboard for approvals and unified billing" },
      { ar: "أولوية مطابقة مع نخبة المستشارين", en: "Priority matching with elite consultants" },
    ],
    href: "/consulting/services",
    gradient: "from-amber-500 to-orange-600",
  },
];

const VALUE_STACKS: ValueStack[] = [
  {
    title: "لطالب الخدمة",
    titleEn: "For Service Seekers",
    accent: "from-cyan-500 to-blue-600",
    icon: Sparkles,
    items: [
      { ar: "مسارات فورية أو مجدولة مع أسعار واضحة وتأكيد فوري", en: "Instant or scheduled paths with clear pricing and instant confirmation" },
      { ar: "ضمان رضا + ملخص تنفيذي وملفات مؤمنة لكل جلسة", en: "Satisfaction guarantee + executive summary and secure files for each session" },
      { ar: "تواصل متعدد القنوات: نصي، صوتي، فيديو مع تسجيلات عند الطلب", en: "Multi-channel communication: text, voice, video with recordings on demand" },
    ],
  },
  {
    title: "للمستشار",
    titleEn: "For Consultants",
    accent: "from-amber-500 to-orange-600",
    icon: Rocket,
    items: [
      { ar: "طلبات جاهزة مع بيانات مكتملة ونماذج مسبقة للحالات الشائعة", en: "Ready requests with complete data and pre-built templates for common cases" },
      { ar: "تسعير ديناميكي وحملات ترويجية تلقائية للمستشارين النشطين", en: "Dynamic pricing and automatic promotional campaigns for active consultants" },
      { ar: "لوحة أرباح فورية، جدولة ذكية، وتقييمات شفافة تبني سمعتك", en: "Real-time earnings dashboard, smart scheduling, and transparent ratings that build your reputation" },
    ],
  },
  {
    title: "لرابط",
    titleEn: "For Rabit Platform",
    accent: "from-emerald-500 to-teal-600",
    icon: Shield,
    items: [
      { ar: "حوكمة تسعير وسقوف للخصومات تضمن هامش ربحي صحي", en: "Pricing governance and discount caps that ensure a healthy profit margin" },
      { ar: "مراقبة SLA والالتزام القانوني مع تنبيهات للطلبات المتعثرة", en: "SLA monitoring and legal compliance with alerts for stalled requests" },
      { ar: "تقارير إيرادات واستبقاء العملاء وربحية المستشارين في الوقت الفعلي", en: "Real-time revenue, customer retention, and consultant profitability reports" },
    ],
  },
];

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    title: "طلب الخدمة",
    titleEn: "Service Request",
    description: "اختر نوع الاستشارة والمسار (فوري، جلسة، اشتراك) وحدد التحدي بدقيقة واحدة.",
    descriptionEn: "Choose consultation type and path (instant, session, subscription) and define your challenge in one minute.",
    meta: "60 ثانية",
    metaEn: "60 seconds",
    icon: Activity,
  },
  {
    title: "مطابقة ذكية",
    titleEn: "Smart Matching",
    description: "نرشح المستشار الأنسب حسب الخبرة، الصناعة، وSLA المطلوب مع إمكانية الاختيار اليدوي.",
    descriptionEn: "We recommend the best consultant based on expertise, industry, and required SLA with manual selection option.",
    meta: "تلقائي",
    metaEn: "Automatic",
    icon: Target,
  },
  {
    title: "تأكيد السعر والخطة",
    titleEn: "Price & Plan Confirmation",
    description: "باقات واضحة وإضافات مدفوعة (صياغة عقود، مراجعة ملفات) مع سقوف خصم مضبوطة.",
    descriptionEn: "Clear packages and paid add-ons (contract drafting, file review) with controlled discount caps.",
    meta: "5 دقائق",
    metaEn: "5 minutes",
    icon: CircleDollarSign,
  },
  {
    title: "التنفيذ والتسليم",
    titleEn: "Execution & Delivery",
    description: "جلسة نص/صوت/فيديو مع تسجيل وملخص تنفيذي ومرفقات مؤمنة.",
    descriptionEn: "Text/voice/video session with recording, executive summary, and secure attachments.",
    meta: "حسب الباقة",
    metaEn: "Per package",
    icon: CalendarClock,
  },
  {
    title: "التقييم والتحسين",
    titleEn: "Review & Improve",
    description: "تقييم المستشار، NPS، وتوصيات متابعة تلقائية لضمان استمرارية العميل.",
    descriptionEn: "Consultant rating, NPS, and automatic follow-up recommendations to ensure client continuity.",
    meta: "فوري",
    metaEn: "Instant",
    icon: BadgeCheck,
  },
];

const COMMUNICATION_CHANNELS = [
  {
    title: { ar: "نصي فوري", en: "Instant Text" },
    description: { ar: "ردود موثقة خلال 90 دقيقة، مناسب للقرارات اليومية السريعة.", en: "Documented responses within 90 minutes, suitable for quick daily decisions." },
    tag: { ar: "أقل تكلفة", en: "Lowest Cost" },
    icon: MessageSquare,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: { ar: "جلسة صوتية", en: "Voice Session" },
    description: { ar: "30 دقيقة لمناقشة تفصيلية مع تسجيل اختياري وملخص بعد المكالمة.", en: "30 minutes for detailed discussion with optional recording and post-call summary." },
    tag: { ar: "تفاعل مباشر", en: "Direct Interaction" },
    icon: Phone,
    color: "from-emerald-500 to-teal-500",
  },
  {
    title: { ar: "جلسة فيديو", en: "Video Session" },
    description: { ar: "45 دقيقة مع مشاركة شاشة لاستعراض مستندات أو خطط عمل.", en: "45 minutes with screen sharing for reviewing documents or work plans." },
    tag: { ar: "للاجتماعات", en: "For Meetings" },
    icon: Video,
    color: "from-purple-500 to-indigo-500",
  },
];

const AI_FEATURES = [
  {
    title: { ar: "ملخصات جاهزة للمستشار", en: "Ready Summaries for Consultants" },
    description: { ar: "DeepSeek يلخص وصف الطلب ويقترح نقاط نقاش وأسئلة استيضاح قبل الجلسة.", en: "DeepSeek summarizes the request description and suggests discussion points and clarification questions before the session." },
    icon: Sparkles,
  },
  {
    title: { ar: "اقتراح ردود أثناء المحادثة", en: "Response Suggestions During Chat" },
    description: { ar: "زر \"مساعدة AI\" داخل غرفة الاستشارة يقترح ردوداً آمنة استناداً لآخر 10 رسائل.", en: "\"AI Help\" button inside the consultation room suggests safe responses based on the last 10 messages." },
    icon: MessageSquare,
  },
  {
    title: { ar: "تحقق تشغيلي", en: "Operational Verification" },
    description: { ar: "المساعد يذكّر بـ SLA والمتطلبات المرفوعة لضمان تسليم كامل دون تأخير.", en: "The assistant reminds of SLA and uploaded requirements to ensure complete delivery without delay." },
    icon: ShieldCheck,
  },
];

const FAQS: FAQ[] = [
  {
    question: "كيف يمكنني حجز استشارة؟",
    questionEn: "How can I book a consultation?",
    answer: "يمكنك حجز استشارة بسهولة من خلال صفحة الحجز. اختر نوع الاستشارة (فوري، جلسة، أو اشتراك)، حدد المجال المطلوب، واختر المستشار المناسب. ستتلقى تأكيداً فورياً بالموعد.",
    answerEn: "You can easily book a consultation through the booking page. Choose the consultation type (instant, session, or subscription), select the required field, and choose the appropriate consultant. You will receive instant confirmation of the appointment.",
  },
  {
    question: "ما هي ضمانات الجودة المقدمة؟",
    questionEn: "What quality guarantees are offered?",
    answer: "نقدم ضمان رضا كامل - إذا لم تكن راضياً عن الاستشارة، يمكنك استرداد المبلغ بالكامل أو الحصول على استشارة بديلة مجاناً. كما نلتزم بـ SLA واضح لأوقات الاستجابة.",
    answerEn: "We offer a full satisfaction guarantee - if you are not satisfied with the consultation, you can get a full refund or a free alternative consultation. We also commit to a clear SLA for response times.",
  },
  {
    question: "كيف تتم مطابقتي مع المستشار المناسب؟",
    questionEn: "How am I matched with the right consultant?",
    answer: "نستخدم نظام مطابقة ذكي يعتمد على خبرة المستشار، مجال التخصص، الصناعة، وتقييمات العملاء السابقين. يمكنك أيضاً اختيار مستشار محدد من قائمة المستشارين المتاحين.",
    answerEn: "We use a smart matching system based on consultant expertise, specialization area, industry, and previous client ratings. You can also choose a specific consultant from the list of available consultants.",
  },
  {
    question: "هل يمكنني الحصول على تسجيل للجلسة؟",
    questionEn: "Can I get a recording of the session?",
    answer: "نعم، جميع الجلسات الصوتية والفيديو يمكن تسجيلها عند الطلب. ستحصل أيضاً على ملخص تنفيذي مكتوب وأي مرفقات تمت مشاركتها خلال الجلسة في مساحة آمنة.",
    answerEn: "Yes, all voice and video sessions can be recorded upon request. You will also receive a written executive summary and any attachments shared during the session in a secure space.",
  },
  {
    question: "ما هي طرق الدفع المتاحة؟",
    questionEn: "What payment methods are available?",
    answer: "نقبل جميع طرق الدفع الرئيسية: بطاقات الائتمان (Visa, Mastercard)، مدى، Apple Pay، STC Pay، وتحويل بنكي للاشتراكات الشهرية.",
    answerEn: "We accept all major payment methods: credit cards (Visa, Mastercard), Mada, Apple Pay, STC Pay, and bank transfer for monthly subscriptions.",
  },
];

function HeroSection({ isArabic }: SectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      {/* Background decorations */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(99,102,241,0.15)_0%,_transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(168,85,247,0.15)_0%,_transparent_50%)]" />
      <div className="absolute top-1/4 -start-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-1/4 -end-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 start-[10%] h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
        <div className="absolute top-40 end-[15%] h-3 w-3 rounded-full bg-purple-400 animate-pulse delay-75" />
        <div className="absolute bottom-32 start-[20%] h-2 w-2 rounded-full bg-indigo-400 animate-pulse delay-150" />
      </div>

      <div className="container relative py-24 lg:py-32">
        <div className="grid gap-12 lg:grid-cols-2 items-center">
          {/* Content */}
          <AnimateOnScroll>
            <div className="space-y-8">
              <Badge className="bg-white/10 text-white border border-white/20 backdrop-blur-sm px-4 py-2">
                <Sparkles className="h-4 w-4 me-2" />
                {isArabic ? "منصة الاستشارات المتخصصة" : "Specialized Consulting Platform"}
              </Badge>

              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                  {isArabic
                    ? "استشارات تنافسية تقدم سرعة، دقة، وهوامش ربح واضحة"
                    : "Competitive consulting with speed, accuracy, and clear profit margins"}
                </span>
              </h1>

              <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl">
                {isArabic
                  ? "تجارب مصممة لطالب الخدمة، أدوات إنتاجية للمستشار، وحوكمة تسعير وضمانات تشغيلية لرابط لضمان أعلى ربحية واستبقاء."
                  : "Experiences designed for service seekers, productivity tools for consultants, and pricing governance and operational guarantees for Rabit to ensure the highest profitability and retention."}
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-gray-100 shadow-xl shadow-black/20"
                  asChild
                >
                  <Link href="/consulting/book-new">
                    {isArabic ? "ابدأ حجز استشارة الآن" : "Book Consultation Now"}
                    <ArrowRight className="h-5 w-5 ms-2" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <Link href="/signup/consultant">
                    {isArabic ? "انضم كمستشار" : "Join as Consultant"}
                  </Link>
                </Button>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Stats Grid */}
          <AnimateOnScroll delay={200}>
            <div className="grid grid-cols-2 gap-4">
              {HERO_STATS.map((stat) => (
                <StatBadge
                  key={stat.label.en}
                  icon={stat.icon}
                  label={isArabic ? stat.label.ar : stat.label.en}
                  value={isArabic ? stat.value.ar : stat.value.en}
                />
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </section>
  );
}

function QuickActionsSection({ isArabic }: SectionProps) {
  return (
    <section className="sticky top-0 z-40 py-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="container">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button size="sm" asChild>
            <Link href="/consulting/book-new">
              {isArabic ? "حجز استشارة فورية" : "Book Instant Consultation"}
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/consulting/experts">
              {isArabic ? "تصفح المستشارين" : "Browse Consultants"}
            </Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/consulting/services">
              {isArabic ? "استعراض الباقات" : "View Packages"}
            </Link>
          </Button>
          <Button size="sm" variant="ghost" asChild>
            <Link href="/consulting/how-to-book">
              {isArabic ? "كيفية الحجز" : "How to Book"}
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function ValueStacksSection({ isArabic }: SectionProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimateOnScroll>
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="px-4 py-1">
              {isArabic ? "مسارات قيمة لكل طرف" : "Value Paths for Everyone"}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              {isArabic
                ? "مصممة للمستفيد والمستشار ورابط"
                : "Designed for Clients, Consultants, and Rabit"}
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
              {isArabic
                ? "تجربة متكاملة من الطلب حتى التقييم مع ضمان جودة وتوثيق كامل للبيانات والتعاملات المالية."
                : "A complete experience from request to evaluation with quality assurance and full documentation of data and financial transactions."}
            </p>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-8 md:grid-cols-3">
          {VALUE_STACKS.map((stack, index) => (
            <AnimateOnScroll key={stack.title} delay={index * 100}>
              <ValueStackCard stack={stack} isArabic={isArabic} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function PackagesSection({ isArabic }: SectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="container">
        <AnimateOnScroll>
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
            <div className="space-y-4">
              <Badge className="px-4 py-1">
                {isArabic ? "عروض وأسعار تنافسية" : "Competitive Offers & Pricing"}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                {isArabic
                  ? "باقات استشارية واضحة وهوامش محسوبة"
                  : "Clear Consulting Packages with Calculated Margins"}
              </h2>
              <p className="text-muted-foreground max-w-2xl text-lg">
                {isArabic
                  ? "صممنا المسارات لتغطي الحاجة الفورية والجلسات التنفيذية والاشتراكات الشهرية مع تحكم كامل في الأسعار والخصومات."
                  : "We designed the paths to cover instant needs, executive sessions, and monthly subscriptions with full control over prices and discounts."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" asChild>
                <Link href="/consulting/services">
                  {isArabic ? "تصفح كل الباقات" : "Browse All Packages"}
                </Link>
              </Button>
              <Button asChild>
                <Link href="/consulting/book-new">
                  {isArabic ? "احجز الآن" : "Book Now"}
                </Link>
              </Button>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-8 md:grid-cols-3">
          {PACKAGES.map((pkg, index) => (
            <AnimateOnScroll key={pkg.name} delay={index * 100}>
              <PackageCard pkg={pkg} isArabic={isArabic} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function CommunicationChannelsSection({ isArabic }: SectionProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimateOnScroll>
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="px-4 py-1">
              {isArabic ? "قنوات التواصل" : "Communication Channels"}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              {isArabic
                ? "اختر الطريقة الأنسب لاستشارتك"
                : "Choose the Best Way for Your Consultation"}
            </h2>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-3">
          {COMMUNICATION_CHANNELS.map((channel, index) => (
            <AnimateOnScroll key={channel.title.ar} delay={index * 100}>
              <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${channel.color}`} />
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${channel.color} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                      <channel.icon className="h-7 w-7" />
                    </div>
                    <Badge variant="secondary">
                      {isArabic ? channel.tag.ar : channel.tag.en}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {isArabic ? channel.title.ar : channel.title.en}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isArabic ? channel.description.ar : channel.description.en}
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function WorkflowSection({ isArabic }: SectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
      <div className="container">
        <AnimateOnScroll>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-16">
            <div className="space-y-4">
              <Badge className="bg-white/10 text-white border border-white/20">
                {isArabic ? "رحلة محكومة زمنياً" : "Time-Governed Journey"}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                {isArabic
                  ? "تجربة محكومة من الطلب حتى التسليم"
                  : "A Governed Experience from Request to Delivery"}
              </h2>
              <p className="text-white/80 max-w-2xl text-lg">
                {isArabic
                  ? "نربط كل خطوة بوقت متوقع وتوثيق كامل، مع قنوات تناسب سرعة القرار وحجم الفريق."
                  : "We link each step with expected time and full documentation, with channels that suit decision speed and team size."}
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <Link href="/consulting/how-to-book">
                  {isArabic ? "كيفية الحجز" : "How to Book"}
                </Link>
              </Button>
              <Button className="bg-white text-slate-900 hover:bg-gray-100" asChild>
                <Link href="/consulting/book-new">
                  {isArabic ? "ابدأ الآن" : "Start Now"}
                </Link>
              </Button>
            </div>
          </div>
        </AnimateOnScroll>

        <div className="max-w-3xl space-y-6">
          {WORKFLOW_STEPS.map((step, index) => (
            <AnimateOnScroll key={step.title} delay={index * 100}>
              <WorkflowStepCard step={step} index={index} isArabic={isArabic} />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function AiFeaturesSection({ isArabic }: SectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900">
      <div className="container">
        <AnimateOnScroll>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-16">
            <div className="space-y-4">
              <Badge className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-0 px-4 py-1">
                <Brain className="h-4 w-4 me-2" />
                {isArabic ? "مدعوم بـ DeepSeek AI" : "Powered by DeepSeek AI"}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                {isArabic
                  ? "مساعد ذكاء اصطناعي مدمج في رحلة الاستشارة"
                  : "AI Assistant Integrated in the Consultation Journey"}
              </h2>
              <p className="text-muted-foreground max-w-2xl text-lg">
                {isArabic
                  ? "نعتمد على DeepSeek لتسريع إعداد المستشار، اقتراح الردود، وضبط الجودة أثناء الخدمة دون المساس بالخصوصية أو الامتثال."
                  : "We rely on DeepSeek to accelerate consultant preparation, suggest responses, and control quality during service without compromising privacy or compliance."}
              </p>
            </div>
            <Button asChild>
              <Link href="/consulting/book-new">
                {isArabic ? "ابدأ استشارة مدعومة بالذكاء" : "Start AI-Powered Consultation"}
              </Link>
            </Button>
          </div>
        </AnimateOnScroll>

        <div className="grid gap-6 md:grid-cols-3">
          {AI_FEATURES.map((feature, index) => (
            <AnimateOnScroll key={feature.title.ar} delay={index * 100}>
              <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 group">
                <CardHeader className="space-y-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">
                    {isArabic ? feature.title.ar : feature.title.en}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isArabic ? feature.description.ar : feature.description.en}
                  </CardDescription>
                </CardHeader>
              </Card>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection({ isArabic }: SectionProps) {
  return (
    <section className="py-20 lg:py-28">
      <div className="container">
        <AnimateOnScroll>
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary" className="px-4 py-1">
              {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">
              {isArabic ? "هل لديك استفسارات؟" : "Have Questions?"}
            </h2>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="w-full">
              {FAQS.map((faq) => (
                <AccordionItem key={faq.question} value={`item-${faq.questionEn}`} className="border-b border-gray-200 dark:border-gray-800">
                  <AccordionTrigger className="text-start hover:no-underline py-6">
                    <span className="text-lg font-medium">
                      {isArabic ? faq.question : faq.questionEn}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-base pb-6">
                    {isArabic ? faq.answer : faq.answerEn}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

function CtaSection({ isArabic }: SectionProps) {
  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 text-white">
      <div className="container">
        <AnimateOnScroll>
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge className="bg-white/10 text-white border border-white/20 px-4 py-2">
              {isArabic ? "جاهز لإطلاق منصة استشاراتك" : "Ready to Launch Your Consulting Platform"}
            </Badge>

            <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
              {isArabic
                ? "اجعل الاستشارات مصدر دخلك الرئيسي مع تجربة عالمية"
                : "Make Consulting Your Main Income Source with a World-Class Experience"}
            </h2>

            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              {isArabic
                ? "حجز فوري، أسعار واضحة، ضمان رضا، وأدوات تشغيلية تحافظ على ربحية رابط وتبني ولاء العملاء والمستشارين."
                : "Instant booking, clear prices, satisfaction guarantee, and operational tools that maintain Rabit's profitability and build customer and consultant loyalty."}
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Button
                size="lg"
                className="bg-white text-slate-900 hover:bg-gray-100 shadow-xl shadow-black/20"
                asChild
              >
                <Link href="/consulting/book-new">
                  {isArabic ? "ابدأ حجز استشارة" : "Book a Consultation"}
                  <ArrowRight className="h-5 w-5 ms-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10"
                asChild
              >
                <Link href="/signup/consultant">
                  {isArabic ? "سجل كمستشار" : "Register as Consultant"}
                </Link>
              </Button>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </section>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function ConsultingRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 ${
        isArabic ? "rtl" : "ltr"
      }`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      <HeroSection isArabic={isArabic} />
      <QuickActionsSection isArabic={isArabic} />
      <ValueStacksSection isArabic={isArabic} />
      <PackagesSection isArabic={isArabic} />
      <CommunicationChannelsSection isArabic={isArabic} />
      <WorkflowSection isArabic={isArabic} />
      <AiFeaturesSection isArabic={isArabic} />
      <ConnectedPagesSection
        isArabic={isArabic}
        highlight={{
          ar: "رحلة متصلة",
          en: "Connected Journey",
        }}
        title={{
          ar: "انتقل للأدوات أو الباقات بدون مغادرة تجربة الاستشارة",
          en: "Jump to tools or pricing without leaving the consulting flow",
        }}
        subtitle={{
          ar: "اختبر الأدوات، راجع الأسعار، أو استعرض لوحة التحكم لإكمال عملية التوظيف.",
          en: "Test the tools, review pricing, or open the dashboard to finish the hiring workflow.",
        }}
      />
      <FaqSection isArabic={isArabic} />
      <CtaSection isArabic={isArabic} />
      <Footer />
    </div>
  );
}
