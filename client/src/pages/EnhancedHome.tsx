import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import {
  AnimatedSection,
  FadeIn,
  StaggerContainer,
  StaggerItem,
  AnimatedCard,
} from "@/components/ui/animated-card";
import { Section } from "@/components/design/Section";
import { MetricCard } from "@/components/design/MetricCard";
import { TrustIndicators } from "@/components/design/TrustIndicators";
import { metrics as designMetrics } from "@/design/tokens";
import {
  AudienceBenefitCard,
  type AudienceBenefit,
  LogoCloud,
  type Logo,
  PricingPlanCard,
  type PricingPlan,
  TestimonialCard,
  type Testimonial,
  TrustSignalCard,
  type TrustSignal,
} from "@/components/home/MarketingCards";
import { motion } from "framer-motion";
import {
  Building2,
  UserCheck,
  Users,
  CheckCircle2,
  Brain,
  Smartphone,
  BarChart3,
  Shield,
  Headphones,
  ArrowRight,
  Play,
  Star,
  Zap,
  Award,
  TrendingUp,
  Globe,
  Clock,
  Sparkles,
  Layers,
  ArrowUpRight,
  PauseCircle,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
const LazyFooter = lazy(() => import("@/components/Footer").then((module) => ({ default: module.Footer })));
const LazyFAQSection = lazy(() => import("@/components/FAQSection").then((module) => ({ default: module.FAQSection })));

const heroStats = [
  { value: "5000+", label: "عميل راضٍ", icon: Users },
  { value: "99.9%", label: "معدل الرضا", icon: Star },
  { value: "24/7", label: "دعم متواصل", icon: Clock },
  { value: "50+", label: "خبير قانوني", icon: Award },
];

const categories = [
  {
    id: "companies",
    titleKey: "category.companies",
    descKey: "category.companies.desc",
    icon: Building2,
    gradient: "from-blue-600 via-blue-500 to-cyan-400",
    features: [
      "إدارة شاملة للموارد البشرية",
      "تتبع الحضور والانصراف",
      "إدارة الرواتب والمزايا",
      "تقارير وتحليلات متقدمة",
    ],
    buttonText: "ابدأ الآن",
    borderHover: "hover:border-blue-500",
  },
  {
    id: "individual",
    titleKey: "category.individual",
    descKey: "category.individual.desc",
    icon: UserCheck,
    gradient: "from-purple-600 via-purple-500 to-pink-400",
    features: [
      "استشارات قانونية فورية",
      "حماية حقوقك العمالية",
      "حساب المستحقات بدقة",
      "دعم قانوني متخصص",
    ],
    buttonText: "احجز استشارة",
    badge: "الأكثر شعبية",
    borderHover: "hover:border-purple-500",
  },
  {
    id: "employee",
    titleKey: "category.employee",
    descKey: "category.employee.desc",
    icon: Users,
    gradient: "from-green-600 via-green-500 to-emerald-400",
    features: [
      "إدارة الإجازات بسهولة",
      "تتبع المهام والمشاريع",
      "تقييم الأداء الذاتي",
      "الوصول للوثائق",
    ],
    buttonText: "سجل الآن",
    borderHover: "hover:border-green-500",
  },
];

const features = [
  {
    title: "متوافق مع الأنظمة السعودية",
    description: "نظام شامل يتماشى مع قوانين العمل السعودية ومتطلبات وزارة الموارد البشرية",
    icon: CheckCircle2,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    title: "ذكاء اصطناعي متقدم",
    description: "تحليلات ذكية وتوصيات مدعومة بالذكاء الاصطناعي لتحسين إدارة الموارد البشرية",
    icon: Brain,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    title: "سهل الاستخدام",
    description: "واجهة بديهية وسهلة الاستخدام على جميع الأجهزة مع تجربة مستخدم استثنائية",
    icon: Smartphone,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    title: "تقارير شاملة",
    description: "تقارير وتحليلات متقدمة تساعدك في اتخاذ قرارات مبنية على البيانات",
    icon: BarChart3,
    gradient: "from-orange-500 to-red-600",
  },
  {
    title: "أمان عالي",
    description: "حماية متقدمة لبياناتك مع التشفير الكامل والامتثال للمعايير الدولية",
    icon: Shield,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    title: "دعم فني متميز",
    description: "فريق دعم متواجد على مدار الساعة لمساعدتك في أي وقت",
    icon: Headphones,
    gradient: "from-teal-500 to-green-600",
  },
];

const steps = [
  {
    number: "1",
    title: "سجل حسابك",
    description: "إنشاء حساب مجاني في دقائق معدودة",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "2",
    title: "اختر الخطة المناسبة",
    description: "اختر من بين باقاتنا المتنوعة حسب احتياجاتك",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    number: "3",
    title: "ابدأ الاستخدام",
    description: "استمتع بجميع المميزات فوراً بعد التسجيل",
    gradient: "from-green-500 to-emerald-500",
  },
];

const heroValueBullets = [
  {
    title: "منصة واحدة لكل العمليات",
    description: "توحيد الحضور، الملفات، وإدارة الحالات القانونية في لوحة واحدة بدل الأدوات المتفرقة.",
  },
  {
    title: "مصمم للشركات السعودية والخليجية",
    description: "إجراءات، وثائق، وتنبيهات مبنية على نظام العمل المحلي ومتطلبات وزارة الموارد البشرية.",
  },
  {
    title: "قرارات أسرع بدون عمل يدوي",
    description: "ذكاء تشغيلي يحول البيانات إلى رؤى فورية للمديرين ويقلل الروتين بنسبة كبيرة.",
  },
];

const trialTiles = [
  {
    title: "حسابات فورية",
    description: "اختيار شخصية (مشرف، شركة، مستشار، موظف) يملأ الحقول ويأخذك إلى الصفحات المكتملة.",
    icon: Sparkles,
  },
  {
    title: "تجربة الاستشارات",
    description: "ربط مباشر مع صفحات الحجز الجديدة، الدردشة، وجدولة المستشارين حتى في الوضع التجريبي.",
    icon: Layers,
  },
  {
    title: "تسجيل+دخول موحد",
    description: "استمرارية البيانات بين صفحة الحسابات التجريبية وتسجيل الدخول/التسجيل المطور.",
    icon: ArrowUpRight,
  },
];

type ExperienceProfile = {
  id: string;
  label: string;
  description: string;
  kpis: { label: string; value: string; delta: string }[];
  checklist: string[];
  quote: string;
  quoteAuthor: string;
};

const experienceProfiles: ExperienceProfile[] = [
  {
    id: "hr",
    label: "فرق الموارد البشرية",
    description: "يحتاج مسؤولو HR لرؤية لحظية لكل الطلبات والموافقات بدون مطاردة البريد أو ملفات Excel.",
    kpis: [
      { label: "متوسط إغلاق الطلب", value: "2.4 ساعة", delta: "-35%" },
      { label: "الدقة القانونية", value: "99%", delta: "+9 نقاط" },
      { label: "الوقت الموفر", value: "12 ساعة/أسبوع", delta: "-" },
    ],
    checklist: [
      "تنبيهات ذكية قبل التصفية أو انتهاء العقود",
      "مجلدات رقمية للموظفين مع سجلات تدقيق",
      "تحليلات رضا الموظفين مرتبطة بكل طلب",
    ],
    quote: "استطعنا مراقبة كل ما يحدث في لحظة واحدة دون متابعة عبر الرسائل.",
    quoteAuthor: "مديرة الموارد البشرية - شركة برمجيات",
  },
  {
    id: "executive",
    label: "الإدارة التنفيذية",
    description: "تعتمد القيادات على لوحة واحدة ترى الصحة التشغيلية وتكلفة الموظف فوراً مع تنبيهات المخاطر.",
    kpis: [
      { label: "زمن اتخاذ القرار", value: "15 دقيقة", delta: "-60%" },
      { label: "وضوح التكلفة", value: "+28%", delta: "تحسن" },
      { label: "مخاطر متتبعة", value: "0 حرجة", delta: "-5" },
    ],
    checklist: [
      "لوحات تجمع الرواتب، الالتزام، ونبض الموظفين",
      "توقيعات رقمية موحدة لكل العقود",
      "تقارير جاهزة للمجلس خلال ثوانٍ",
    ],
    quote: "الاجتماعات التنفيذية أصبحت أسرع لأن كل الأرقام حاضرة ومترابطة.",
    quoteAuthor: "الرئيس التنفيذي للعمليات - مجموعة خدمات",
  },
  {
    id: "employees",
    label: "تجربة الموظف",
    description: "واجهة عربية مبسطة تشرح الإجراءات وتُظهر حالة الطلب بدون الرجوع للدعم.",
    kpis: [
      { label: "معدل الرضا", value: "4.9 / 5", delta: "+0.6" },
      { label: "طلبات ذاتية", value: "90%", delta: "+35%" },
      { label: "وقت الاستجابة", value: "11 دقيقة", delta: "-72%" },
    ],
    checklist: [
      "نماذج ذكية توضح السياسات قبل الإرسال",
      "إشعارات واتساب وبريد مرتبطة بزمن SLA",
      "لوحة متابعة شخصية للراتب، الإجازات، والمستندات",
    ],
    quote: "أصبحت أعرف أين وصل طلبي ومتى أستلم الرد بدون أي مكالمة.",
    quoteAuthor: "موظفة مالية - منشأة تجزئة",
  },
];

type JourneyMoment = {
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  status: "done" | "active" | "next";
};

const journeyMoments: JourneyMoment[] = [
  {
    title: "التفعيل الأول",
    description: "استيراد الموظفين والقوالب الجاهزة خلال جلسة واحدة مع خبير نجاح عملاء.",
    metricLabel: "المدة",
    metricValue: "90 دقيقة",
    status: "done",
  },
  {
    title: "أسبوع الانطلاقة",
    description: "حملات تواصل تلقائية للموظفين وروابط لتسجيل الدخول التكميلي.",
    metricLabel: "التبنّي",
    metricValue: "82%",
    status: "active",
  },
  {
    title: "شهر التحسين",
    description: "مراقبة نقاط الاحتياج وتعديل السياسات بسلاسة مع فريق الدعم.",
    metricLabel: "طلبات الدعم",
    metricValue: "3 فقط",
    status: "next",
  },
];

const experiencePromises = [
  { label: "وقت التفعيل", value: "أقل من 3 أيام" },
  { label: "الدعم", value: "استجابة خلال 5 دقائق" },
  { label: "الشفافية", value: "لوحة متابعة لكل موظف" },
];

const journeyStatusStyles = {
  done: {
    label: "منجز",
    badge: "bg-emerald-500/10 text-emerald-600",
    dot: "bg-emerald-500",
  },
  active: {
    label: "قيد التنفيذ",
    badge: "bg-blue-500/10 text-blue-600",
    dot: "bg-blue-500",
  },
  next: {
    label: "التالي",
    badge: "bg-slate-500/10 text-slate-600",
    dot: "bg-slate-400",
  },
} as const;

const timelineStatusMap = {
  done: {
    classes: "border-emerald-200 bg-emerald-50 text-emerald-900",
    Icon: CheckCircle2,
  },
  active: {
    classes: "border-blue-200 bg-blue-50 text-blue-900",
    Icon: Zap,
  },
  pending: {
    classes: "border-slate-200 bg-white text-slate-600",
    Icon: Clock,
  },
} as const;

type DemoScenario = {
  id: string;
  title: string;
  summary: string;
  highlight: string;
  ctaHref: string;
  ctaLabel: string;
  steps: {
    title: string;
    description: string;
    previewTitle: string;
    previewHighlights: { label: string; value: string }[];
    timeline: { label: string; status: "done" | "active" | "pending"; note: string }[];
    actionLabel: string;
  }[];
};

const demoScenarios: DemoScenario[] = [
  {
    id: "automation",
    title: "أتمتة الموارد البشرية",
    summary: "حوّل طلبات الإجازات والعقود إلى سير عمل تلقائي مع إشعارات دقيقة.",
    highlight: "توفير 6 ساعات أسبوعياً",
    ctaHref: "/dashboard/employees?experience=automation",
    ctaLabel: "جرّبها داخل لوحة الموظفين",
    steps: [
      {
        title: "ضبط سياسات الموافقات",
        description: "اختر الأقسام وحدد مستويات الاعتماد لضمان شفافية كاملة.",
        previewTitle: "سير العمل",
        previewHighlights: [
          { label: "طلبات نشطة", value: "24" },
          { label: "تأخيرات", value: "0" },
        ],
        timeline: [
          { label: "إجازة قسم التقنية", status: "done", note: "تم الاعتماد من المدير" },
          { label: "تحذير الرواتب", status: "active", note: "بانتظار مراجعة الامتثال" },
          { label: "تذكير تلقائي", status: "pending", note: "سيُرسل بعد 30 دقيقة" },
        ],
        actionLabel: "يستغرق الإعداد أقل من دقيقتين",
      },
      {
        title: "متابعة التنفيذ",
        description: "راقب المؤشرات وتأكد من اكتمال كل خطوة مع تنبيهات تلقائية.",
        previewTitle: "المؤشرات",
        previewHighlights: [
          { label: "معدل الالتزام", value: "98%" },
          { label: "وقت التنفيذ", value: "4 دقائق" },
        ],
        timeline: [
          { label: "مراجعة الموارد البشرية", status: "done", note: "تمت أمس" },
          { label: "توقيع المدير التنفيذي", status: "active", note: "قيد الانتظار" },
          { label: "أرشفة تلقائية", status: "pending", note: "بعد التوقيع" },
        ],
        actionLabel: "شارك التقرير مع فريقك فوراً",
      },
      {
        title: "إغلاق الحلقة",
        description: "أرسل ملخصًا آليًا للأطراف وتتبّع التحسينات المتكررة.",
        previewTitle: "لوحة الأداء",
        previewHighlights: [
          { label: "طلبات مُقفلة", value: "112" },
          { label: "حالات متعثرة", value: "1" },
        ],
        timeline: [
          { label: "ملخص الامتثال", status: "done", note: "تم الإرسال" },
          { label: "استبيان الرضا", status: "active", note: "جارٍ الجمع" },
          { label: "تحسين السياسة", status: "pending", note: "يوصى بمراجعة شهرية" },
        ],
        actionLabel: "أرسل الملخص إلى القيادة بنقرة واحدة",
      },
    ],
  },
  {
    id: "self-service",
    title: "تجربة الموظف الذاتية",
    summary: "اجعل الموظفين ينهون طلباتهم دون الرجوع للدعم مع تعقب فوري.",
    highlight: "90% من الطلبات ذاتية",
    ctaHref: "/dashboard/employees?experience=self-service",
    ctaLabel: "افتح تجربة الخدمة الذاتية",
    steps: [
      {
        title: "واجهة الطلب الذكي",
        description: "نموذج عربي مبسّط يعرض السياسات تلقائياً حسب نوع الطلب.",
        previewTitle: "نموذج الخدمة الذاتية",
        previewHighlights: [
          { label: "ثواني للإرسال", value: "42" },
          { label: "طلبات اليوم", value: "36" },
        ],
        timeline: [
          { label: "طلب بدل سكن", status: "done", note: "تم تحويله للمالية" },
          { label: "طلب إجازة عاجلة", status: "active", note: "قيد التحقق" },
          { label: "إثبات حضور", status: "pending", note: "بانتظار المستند" },
        ],
        actionLabel: "يصل الموظف إلى النتيجة خلال أقل من دقيقة",
      },
      {
        title: "إشعارات فورية",
        description: "إشعارات واتساب وبريد مرتبطة بنظام الموافقات.",
        previewTitle: "قنوات الإشعار",
        previewHighlights: [
          { label: "رسائل فورية", value: "12" },
          { label: "متوسط الاستجابة", value: "8 دقائق" },
        ],
        timeline: [
          { label: "إشعار المدير", status: "done", note: "قُرئ للتو" },
          { label: "تنبيه الموظف", status: "active", note: "بانتظار رد" },
          { label: "سلم التصعيد", status: "pending", note: "يبدأ بعد 2 ساعة" },
        ],
        actionLabel: "تذكير تلقائي قبل انتهاء SLA",
      },
      {
        title: "تحليلات التجربة",
        description: "راقب زمن إغلاق الطلبات ونقاط الاحتياج لتحسين الرحلة.",
        previewTitle: "لوحة CX",
        previewHighlights: [
          { label: "معدل الرضا", value: "4.8/5" },
          { label: "طلبات مكالمات", value: "3" },
        ],
        timeline: [
          { label: "استبيان ما بعد الإغلاق", status: "done", note: "اكتمل" },
          { label: "مقابلة عمق", status: "active", note: "خلال هذا الأسبوع" },
          { label: "خريطة رحلة جديدة", status: "pending", note: "تحت الإعداد" },
        ],
        actionLabel: "صدّر التقرير بالفيديو التوضيحي",
      },
    ],
  },
  {
    id: "compliance",
    title: "متابعة الامتثال",
    summary: "راقب العقود والتنبيهات القانونية مع لوحة زمنية واضحة.",
    highlight: "صفر مخالفات تأخير",
    ctaHref: "/dashboard/reports?experience=compliance",
    ctaLabel: "استعرض لوحة التقارير",
    steps: [
      {
        title: "جدول الالتزامات",
        description: "سجل تلقائي لتواريخ نهاية العقود والتأشيرات.",
        previewTitle: "مؤقت الامتثال",
        previewHighlights: [
          { label: "بنود تحت المراقبة", value: "14" },
          { label: "مخاطر مرتفعة", value: "0" },
        ],
        timeline: [
          { label: "عقد مورد", status: "done", note: "تم التجديد" },
          { label: "تأشيرة استشاري", status: "active", note: "تنتهي خلال 5 أيام" },
          { label: "مراجعة وزارة الموارد", status: "pending", note: "مجدولة" },
        ],
        actionLabel: "ارسل التذكير القانوني بضغطة",
      },
      {
        title: "تنبيهات تلقائية",
        description: "يصلك تنبيه متعدد القنوات لأي حدث حساس.",
        previewTitle: "مسار التنبيه",
        previewHighlights: [
          { label: "تنبيهات اليوم", value: "5" },
          { label: "تم الحل", value: "4" },
        ],
        timeline: [
          { label: "إشعار مدير الفرع", status: "done", note: "استلم التنبيه" },
          { label: "تنسيق جهة قانونية", status: "active", note: "قيد النقاش" },
          { label: "تصعيد مجلس الإدارة", status: "pending", note: "جاهز عند الحاجة" },
        ],
        actionLabel: "تأكد من التوثيق في سجل التدقيق",
      },
      {
        title: "تقارير رقمية",
        description: "قدّم ملف امتثال جاهز للمراجعات الداخلية والخارجية.",
        previewTitle: "ملف الامتثال",
        previewHighlights: [
          { label: "مرفقات", value: "32" },
          { label: "جلسات مراجعة", value: "6" },
        ],
        timeline: [
          { label: "مراجعة داخلية", status: "done", note: "تم اعتمادها" },
          { label: "ملاحظات قانونية", status: "active", note: "تحت التنفيذ" },
          { label: "أرشفة إلكترونية", status: "pending", note: "تُغلق بعد الاعتماد" },
        ],
        actionLabel: "صدّر PDF أو شاركه عبر رابط آمن",
      },
    ],
  },
];

type GuidedDemoChapter = {
  id: string;
  duration: string;
};

type GuidedDemoChapterContent = {
  title: string;
  description: string;
  highlights: { label: string; value: string }[];
  focusPoints: string[];
};

type LocalizedGuidedDemoChapter = GuidedDemoChapter & GuidedDemoChapterContent;

const guidedDemoChapters: GuidedDemoChapter[] = [
  {
    id: "overview",
    duration: "00:12",
  },
  {
    id: "automation-cards",
    duration: "00:24",
  },
  {
    id: "employee-journey",
    duration: "00:42",
  },
  {
    id: "compliance",
    duration: "00:58",
  },
];

type LiveMetricSeed = {
  id: string;
  icon: LucideIcon;
  start: number;
  minIncrement: number;
  maxIncrement: number;
  min?: number;
  max?: number;
  unit?: string;
  decimals?: number;
};

type LiveMetric = LiveMetricSeed & {
  value: number;
};

type LiveMetricCopy = {
  label: string;
  description: string;
  trend: string;
};

const liveMetricSeeds: LiveMetricSeed[] = [
  {
    id: "live-consultations",
    icon: Headphones,
    start: 34,
    minIncrement: 0,
    maxIncrement: 3,
    min: 20,
    max: 60,
  },
  {
    id: "journey-tracking",
    icon: Users,
    start: 1894,
    minIncrement: 25,
    maxIncrement: 70,
    min: 1600,
    max: 3200,
  },
  {
    id: "automation-touches",
    icon: Sparkles,
    start: 312,
    minIncrement: 8,
    maxIncrement: 20,
    min: 200,
    max: 560,
  },
  {
    id: "sla-success",
    icon: Shield,
    start: 98.2,
    minIncrement: -0.25,
    maxIncrement: 0.3,
    min: 96.5,
    max: 99.7,
    unit: "%",
    decimals: 1,
  },
];

const randomBetween = (min: number, max: number) => Math.random() * (max - min) + min;

const formatNumber = (value: number, decimals = 0, locale = "ar-SA") =>
  new Intl.NumberFormat(locale, { maximumFractionDigits: decimals }).format(value);

const getNextGuidedChapterId = (currentId: string) => {
  if (guidedDemoChapters.length === 0) return currentId;
  const currentIndex = guidedDemoChapters.findIndex((chapter) => chapter.id === currentId);
  const nextIndex = (currentIndex + 1) % guidedDemoChapters.length;
  return guidedDemoChapters[nextIndex]?.id ?? currentId;
};

const liveMetricSeedMap = new Map(liveMetricSeeds.map((seed) => [seed.id, seed] as const));

const computeNextLiveMetric = (metric: LiveMetric): LiveMetric => {
  const seed = liveMetricSeedMap.get(metric.id) ?? metric;
  const delta = randomBetween(seed.minIncrement, seed.maxIncrement);
  let nextValue = metric.value + delta;
  if (typeof seed.min === "number") nextValue = Math.max(seed.min, nextValue);
  if (typeof seed.max === "number") nextValue = Math.min(seed.max, nextValue);
  const decimals = seed.decimals ?? 0;
  return {
    ...metric,
    value: Number.parseFloat(nextValue.toFixed(decimals)),
  };
};

const audienceBenefits: AudienceBenefit[] = [
  {
    audienceLabel: "لفرق الموارد البشرية",
    title: "تشغيل الموارد البشرية بدون فوضى",
    summary: "يجمع ربط كل النماذج والمهام اليومية في لوحة عربية سهلة ومتصلة بالقوانين المحلية.",
    details: [
      "أتمتة الحضور، الإجازات، وسلاسل الموافقات بدون ملفات Excel",
      "سياسات جاهزة ومتوافقة مع وزارة الموارد البشرية والتنمية الاجتماعية",
      "مهام يومية مع تنبيهات ذكية تقلل المتابعة اليدوية",
    ],
    icon: Building2,
    accent: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-100",
    ctaLabel: "جرّب لوحة HR",
    ctaHref: "/signup",
  },
  {
    audienceLabel: "للإدارة التنفيذية",
    title: "رؤية مالية وتشغيلية فورية",
    summary: "لوحات تحكم جاهزة توضح التكاليف، المخاطر، وقراءة نبض الموظفين بدون انتظار تقارير منفصلة.",
    details: [
      "مؤشرات رئيسية للالتزام، الدوام، وتكلفة الموظف في الوقت الفعلي",
      "تنبيهات مخاطر فورية لحالات التأخير في التوقيعات أو انتهاء العقود",
      "مقارنات جاهزة بين الفروع أو الأقسام لدعم القرارات السريعة",
    ],
    icon: BarChart3,
    accent: "bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-100",
    ctaLabel: "اطلب عرضاً تنفيذياً",
    ctaHref: "/contact",
  },
  {
    audienceLabel: "للموظفين",
    title: "تجربة واضحة وشفافة",
    summary: "تطبيق ذاتي باللغة العربية يبسط طلبات الموظفين ويزيد الثقة داخل الشركة.",
    details: [
      "متابعة الراتب، الإجازات، والوثائق في مكان واحد",
      "إشعارات فورية بأي تحديث على الطلبات أو العقود",
      "مرونة في التقديم عبر الجوال بدون الحاجة لرسائل بريد",
    ],
    icon: UserCheck,
    accent: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-100",
    ctaLabel: "دع موظفيك يسجلون",
    ctaHref: "/signup",
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter | البداية",
    price: "599 SAR / شهر",
    description: "لشركات تبدأ بتنظيم عمليات الموارد البشرية",
    employeeSize: "حتى 50 موظف",
    features: [
      "حضور وإجازات ذكية",
      "مكتبة مستندات مع قوالب جاهزة",
      "دعم عربي خلال أيام العمل",
    ],
    ctaLabel: "ابدأ الخطة",
    ctaHref: "/signup",
  },
  {
    name: "Growth | التوسع",
    price: "1,299 SAR / شهر",
    description: "لفرق الموارد البشرية التي تحتاج رقابة وتشريعات أعمق",
    employeeSize: "حتى 200 موظف",
    features: [
      "لوحات تحكم تنفيذية",
      "أتمتة تنبيهات الامتثال والتوقيعات",
      "تكامل مع أنظمة الرواتب والبوابات الحكومية",
    ],
    ctaLabel: "جرّب الخطة",
    ctaHref: "/signup",
    badge: "الأكثر طلباً",
    highlighted: true,
  },
  {
    name: "Business | الأعمال",
    price: "حسب الاستخدام",
    description: "للمجموعات والشركات متعددة الفروع",
    employeeSize: "أكثر من 200 موظف",
    features: [
      "استشاري نجاح مخصص",
      "تخصيص الصلاحيات والسياسات",
      "مراقبة أداء وذكاء تنبؤي",
    ],
    ctaLabel: "اطلب عرض سعر",
    ctaHref: "/contact",
  },
];

const trustSignals: TrustSignal[] = [
  {
    title: "متوافق مع الأنظمة المحلية",
    description: "يبنى ربط على تشريعات العمل السعودية والخليجية ويحدث باستمرار مع أي تعديل جديد.",
    icon: Shield,
  },
  {
    title: "موجه للامتثال والشفافية",
    description: "صلاحيات دقيقة، سجلات تدقيق، وتنبيهات تجعل الفرق متأكدة من كل خطوة.",
    icon: CheckCircle2,
  },
  {
    title: "ذكاء اصطناعي يساند القرار",
    description: "اقتراحات تلقائية للرواتب، المخاطر، وتوزيع القوى العاملة تسهل عمل الإدارة.",
    icon: Brain,
  },
  {
    title: "لوحات واضحة للإدارة",
    description: "رؤى مباشرة للتكاليف، الالتزام، والموارد تجعل الاجتماعات أقصر وأكثر تركيزاً.",
    icon: BarChart3,
  },
];

// Placeholder client names to keep the layout ready until real logos are provided.
const customerLogos: Logo[] = [
  { name: "شركة ألفا" },
  { name: "مجموعة المدار" },
  { name: "حلول توازن" },
  { name: "نور القابضة" },
  { name: "أفق الأعمال" },
  { name: "نخبة الموارد" },
];

// Lightweight testimonials are placeholders that can be swapped with verified quotes.
const testimonials: Testimonial[] = [
  {
    quote: "خفضنا الوقت الضائع على المهام اليدوية بنسبة 60٪ لأن كل الإجراءات أصبحت في منصة واحدة.",
    name: "سارة الحربي",
    role: "مديرة الموارد البشرية - شركة تقنية سعودية",
  },
  {
    quote: "لوحات ربط أعطتنا وضوحاً فورياً للتكاليف والالتزام القانوني لكل فرع.",
    name: "راشد القحطاني",
    role: "الرئيس التنفيذي للعمليات - مجموعة خدمات خليجية",
  },
];

export default function EnhancedHome() {
  const { t, i18n } = useTranslation();
  const [heroImageError, setHeroImageError] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState(() => demoScenarios[0]?.id ?? "automation");
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [activeExperienceId, setActiveExperienceId] = useState(() => experienceProfiles[0]?.id ?? "hr");
  const [activeGuidedChapterId, setActiveGuidedChapterId] = useState(() => guidedDemoChapters[0]?.id ?? "overview");
  const [isGuidedDemoPlaying, setIsGuidedDemoPlaying] = useState(false);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetric[]>(() =>
    liveMetricSeeds.map((seed) => ({ ...seed, value: seed.start }))
  );
  const [lastMetricsUpdate, setLastMetricsUpdate] = useState(() => new Date());
  const advanceGuidedChapter = useCallback(() => {
    setActiveGuidedChapterId((currentId) => getNextGuidedChapterId(currentId));
  }, []);
  const advanceLiveMetrics = useCallback(() => {
    setLiveMetrics((currentMetrics) => currentMetrics.map((metric) => computeNextLiveMetric(metric)));
    setLastMetricsUpdate(new Date());
  }, []);

  useEffect(() => {
    setActiveStepIndex(0);
  }, [activeDemoId]);

  useEffect(() => {
    if (!isGuidedDemoPlaying || guidedDemoChapters.length <= 1) {
      return undefined;
    }

    const interval = setInterval(advanceGuidedChapter, 4500);
    return () => clearInterval(interval);
  }, [advanceGuidedChapter, isGuidedDemoPlaying]);

  useEffect(() => {
    const interval = setInterval(advanceLiveMetrics, 6000);
    return () => clearInterval(interval);
  }, [advanceLiveMetrics]);

  const localizedGuidedChapters = useMemo<LocalizedGuidedDemoChapter[]>(() => {
    return guidedDemoChapters.map((chapter) => {
      const content = t(`enhancedHome.guidedDemo.chapters.${chapter.id}`, {
        returnObjects: true,
        defaultValue: {},
      }) as Partial<GuidedDemoChapterContent>;

      return {
        ...chapter,
        title: typeof content.title === "string" ? content.title : "",
        description: typeof content.description === "string" ? content.description : "",
        highlights: Array.isArray(content.highlights) ? content.highlights : [],
        focusPoints: Array.isArray(content.focusPoints) ? content.focusPoints : [],
      };
    });
  }, [t, i18n.language]);

  const activeDemo = demoScenarios.find(demo => demo.id === activeDemoId) ?? demoScenarios[0];
  const activeStep = activeDemo.steps[activeStepIndex] ?? activeDemo.steps[0];
  const activeExperience = experienceProfiles.find(profile => profile.id === activeExperienceId) ?? experienceProfiles[0];
  const activeGuidedChapter = localizedGuidedChapters.find(chapter => chapter.id === activeGuidedChapterId) ?? localizedGuidedChapters[0];
  const activeGuidedChapterIndex = Math.max(
    localizedGuidedChapters.findIndex((chapter) => chapter.id === activeGuidedChapterId),
    0
  );
  const guidedDemoProgress = localizedGuidedChapters.length
    ? ((activeGuidedChapterIndex + 1) / localizedGuidedChapters.length) * 100
    : 0;
  const secondsSinceMetricsUpdate = Math.max(
    1,
    Math.round((Date.now() - lastMetricsUpdate.getTime()) / 1000)
  );
  const resolvedLocale = i18n.language?.startsWith("en") ? "en-US" : "ar-SA";
  const liveMetricsSummary = liveMetrics
    .map((metric) => {
      const metricCopy = t(`enhancedHome.liveMetrics.cards.${metric.id}`, {
        returnObjects: true,
        defaultValue: {},
      }) as Partial<LiveMetricCopy>;
      const label = metricCopy.label ?? metric.id;
      return `${label}: ${formatNumber(metric.value, metric.decimals ?? 0, resolvedLocale)}${metric.unit ?? ""}`;
    })
    .join(" • ");

  return (
    <main
      id="main-content"
      role="main"
      aria-labelledby="enhanced-home-hero-title"
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted"
    >
      {/* Hero Section - Enhanced */}
      <Section id="hero" background="glow" className="relative overflow-hidden">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <FadeIn direction="left">
            <div className="space-y-8">
              <Badge className="inline-flex w-auto items-center gap-2 rounded-full border border-white/40 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                <Zap className="h-4 w-4 text-blue-500" />
                منصة الموارد البشرية الموثوقة للمنشآت السعودية
              </Badge>

              <div className="space-y-4 text-right">
                <h1
                  id="enhanced-home-hero-title"
                  className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white md:text-5xl lg:text-6xl"
                >
                  رابط يوحد كل عمليات الموارد البشرية ويقدم لوحات جاهزة للامتثال المحلي
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-200">
                  منصة عربية مصممة لواقع السوق السعودي؛ تربط حضور الموظفين، العقود، الرواتب، والامتثال في لوحة واحدة مدعومة بالذكاء الاصطناعي والتكاملات الحكومية.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-100/80 bg-white/80 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.08)] dark:border-slate-800/60 dark:bg-slate-900/50">
                <p className="mb-4 text-sm font-semibold tracking-[0.3em] text-sky-500">
                  لماذا تختارنا فرق الموارد البشرية؟
                </p>
                <ul className="space-y-4 text-base text-slate-600 dark:text-slate-200">
                  {heroValueBullets.map((point) => (
                    <li key={point.title} className="flex gap-3 text-right">
                      <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-500" />
                      <span>
                        <span className="font-semibold text-slate-900 dark:text-white">{point.title}:</span> {point.description}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-lg text-white shadow-[0_20px_60px_rgba(31,83,255,0.35)]"
                  asChild
                >
                  <Link href="/signup">
                    جرّب لوحة التحكم الآن
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg">
                  <Play className="ml-2 h-5 w-5" />
                  شاهد الجولة التفاعلية
                </Button>
                <Button size="lg" variant="ghost" className="text-lg text-emerald-600" asChild>
                  <Link href="https://wa.me/966500000000" target="_blank" rel="noreferrer">
                    <MessageCircle className="ml-2 h-5 w-5" />
                    تحدث مع خبير عبر واتساب
                  </Link>
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {designMetrics.heroStats.map((stat, index) => (
                  <MetricCard key={stat.label} label={stat.label} value={stat.value} delta={stat.delta} emphasis={index === 1 ? "secondary" : "neutral"} />
                ))}
              </div>

              <TrustIndicators badges={designMetrics.trustBadges} subtle />
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div className="relative">
              <div className="relative overflow-hidden rounded-[32px] border border-white/30 bg-gradient-to-b from-[#0F172A] via-[#1F2A52] to-[#14238A] p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
                <div className="flex items-center justify-between text-sm text-white/80">
                  <span>لوحة الامتثال المباشر</span>
                  <Badge variant="outline" className="border-white/30 bg-white/10 text-white">
                    تحديث كل 15 ثانية
                  </Badge>
                </div>

                <div className="mt-8 grid gap-4">
                  {heroStats.map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between rounded-2xl border border-white/15 bg-white/5 p-4">
                      <div>
                        <p className="text-sm text-white/70">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                      </div>
                      <div className="rounded-full bg-white/10 p-3">
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-white/10 p-4 text-sm text-white">
                  <p className="mb-2 text-base font-semibold">جاهزية التكاملات الحكومية</p>
                  <ul className="space-y-1 text-white/80">
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> منصة قوى ووزارة الموارد البشرية
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> هيئة الزكاة والضريبة والجمارك (e-Invoice)
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" /> التأمينات الاجتماعية وملفات الأجور
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pointer-events-none absolute -left-10 top-10 hidden max-w-xs rounded-2xl bg-white/90 p-5 text-slate-700 shadow-2xl lg:block">
                <p className="text-sm font-semibold">استجابة فريق الدعم</p>
                <p className="text-2xl font-bold text-emerald-600">5 دقائق</p>
                <p className="text-xs text-slate-500">متوسط وقت الرد على استفسارات العملاء في السعودية</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </Section>

      <section
        className="border-y border-slate-100/80 bg-slate-50/70 py-16 dark:border-slate-800 dark:bg-slate-900/40"
        data-testid="guided-demo-section"
      >
        <div className="container mx-auto grid gap-8 px-4 lg:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-6">
            <Badge className="bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white">
              {t("enhancedHome.guidedDemo.badge")}
            </Badge>
            <div className="space-y-3">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-white">{t("enhancedHome.guidedDemo.heading")}</h2>
              <p className="text-lg text-slate-600 dark:text-slate-300">
                {t("enhancedHome.guidedDemo.description")}
              </p>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
              <div className="flex items-center justify-between text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
                <span>{t("enhancedHome.guidedDemo.modeLabel")}</span>
                <span>{activeGuidedChapter.duration}</span>
              </div>
              <div className="mt-3 h-2 w-full rounded-full bg-slate-200/80 dark:bg-slate-800" aria-hidden="true">
                <motion.div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600"
                  initial={false}
                  animate={{ width: `${guidedDemoProgress}%` }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                />
              </div>

              <div
                className="relative mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-slate-900 p-6 text-white shadow-lg dark:border-slate-800"
                data-testid="guided-demo-stage"
                data-active-chapter-id={activeGuidedChapter?.id}
              >
                <motion.div
                  key={activeGuidedChapter.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35 }}
                  className="space-y-3"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-white/60">{t("enhancedHome.guidedDemo.currentScene")}</p>
                  <h3 className="text-2xl font-bold">{activeGuidedChapter.title}</h3>
                  <p className="text-sm text-white/80">{activeGuidedChapter.description}</p>
                </motion.div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {activeGuidedChapter.highlights.map((highlight) => (
                    <div key={`${activeGuidedChapter.id}-${highlight.label}`} className="rounded-2xl bg-white/10 p-3">
                      <p className="text-xs text-white/70">{highlight.label}</p>
                      <p className="text-2xl font-semibold text-white">{highlight.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {activeGuidedChapter.focusPoints.map((point) => (
                    <span key={`${activeGuidedChapter.id}-${point}`} className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                      {point}
                    </span>
                  ))}
                </div>

                <motion.div
                  aria-hidden="true"
                  animate={{ opacity: [0.4, 0.8, 0.4] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="pointer-events-none absolute inset-0 border border-white/5"
                />
              </div>

              <div className="flex flex-wrap gap-3 pt-6">
                <Button
                  type="button"
                  size="lg"
                  onClick={() => setIsGuidedDemoPlaying((prev) => !prev)}
                  className="flex-1 min-w-[180px] bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  data-testid="guided-demo-toggle"
                >
                  {isGuidedDemoPlaying ? (
                    <>
                      {t("enhancedHome.guidedDemo.pause")}
                      <PauseCircle className="mr-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      {t("enhancedHome.guidedDemo.play")}
                      <Play className="mr-2 h-5 w-5" />
                    </>
                  )}
                </Button>
                <Button size="lg" variant="outline" asChild className="flex-1 min-w-[180px]">
                  <Link href="/guided-tour">{t("enhancedHome.guidedDemo.fullTour")}</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/90">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t("enhancedHome.guidedDemo.chaptersBadge")}
                </p>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {t("enhancedHome.guidedDemo.chaptersHeading")}
                </h3>
              </div>
              <Badge className={cn("text-xs", isGuidedDemoPlaying ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600") }>
                {isGuidedDemoPlaying
                  ? t("enhancedHome.guidedDemo.autoBadge.playing")
                  : t("enhancedHome.guidedDemo.autoBadge.manual")}
              </Badge>
            </div>

            <div className="space-y-3" aria-label={t("enhancedHome.guidedDemo.chaptersAriaLabel")}>
              {localizedGuidedChapters.map((chapter, index) => {
                const isActiveChapter = chapter.id === activeGuidedChapterId;
                return (
                  <button
                    key={chapter.id}
                    type="button"
                    onClick={() => {
                      setActiveGuidedChapterId(chapter.id);
                      setIsGuidedDemoPlaying(false);
                    }}
                    className={cn(
                      "w-full rounded-2xl border px-4 py-4 text-right transition-all",
                      isActiveChapter
                        ? "border-blue-500 bg-blue-50 shadow-lg"
                        : "border-slate-200 bg-white hover:border-blue-200"
                    )}
                    data-testid={`guided-demo-chapter-${chapter.id}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold",
                          isActiveChapter ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                        )}
                        >
                          {index + 1}
                        </span>
                        <div>
                          <p className="text-base font-semibold text-slate-900">{chapter.title}</p>
                          <p className="text-xs text-slate-500">{chapter.description}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{chapter.duration}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {chapter.focusPoints.map((point) => (
                        <span key={`${chapter.id}-${point}-pill`} className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                          {point}
                        </span>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>

            <output aria-live="polite" className="sr-only">
              {t("enhancedHome.guidedDemo.screenReaderSummary", { title: activeGuidedChapter?.title ?? "" })}
            </output>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white" data-testid="live-metrics-section">
        <div className="container mx-auto space-y-8 px-4">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-white/10 text-white">{t("enhancedHome.liveMetrics.badge")}</Badge>
              <h2 className="text-4xl font-bold">{t("enhancedHome.liveMetrics.heading")}</h2>
              <p className="max-w-2xl text-base text-white/80">
                {t("enhancedHome.liveMetrics.description")}
              </p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-4 text-sm text-white/80">
              <p className="font-semibold text-white">
                {t("enhancedHome.liveMetrics.lastUpdated", { seconds: secondsSinceMetricsUpdate })}
              </p>
              <p className="text-xs text-white/70">{t("enhancedHome.liveMetrics.refreshHint")}</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {liveMetrics.map((metric) => {
              const metricCopy = t(`enhancedHome.liveMetrics.cards.${metric.id}`, {
                returnObjects: true,
                defaultValue: {},
              }) as Partial<LiveMetricCopy>;

              return (
                <Card
                  key={metric.id}
                  className="border-white/10 bg-white/5 text-left text-white shadow-2xl"
                  data-testid="live-metric-card"
                >
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10">
                          <metric.icon className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold text-white/80">{metricCopy.label ?? ""}</p>
                          <p className="text-xs text-white/60">{metricCopy.description ?? ""}</p>
                        </div>
                      </div>
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-200">
                        {t("enhancedHome.liveMetrics.status.live")}
                      </span>
                    </div>
                    <div>
                      <p className="text-4xl font-black tracking-tight">
                        {formatNumber(metric.value, metric.decimals ?? 0, resolvedLocale)}
                      </p>
                      {metric.unit && (
                        <span className="ml-2 text-lg font-semibold text-white/70">{metric.unit}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <span>{metricCopy.trend ?? ""}</span>
                      <span className="inline-flex items-center gap-1 text-emerald-200">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" aria-hidden="true" />{" "}
                        {t("enhancedHome.liveMetrics.status.updated")}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <output aria-live="polite" className="sr-only">
            {t("enhancedHome.liveMetrics.screenReaderSummary", { summary: liveMetricsSummary })}
          </output>
        </div>
      </section>

          <section className="bg-gradient-to-br from-brand-50 via-white to-emerald-50 py-16 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950">
            <div className="container mx-auto px-4 space-y-10">
              <div className="mx-auto max-w-3xl text-center space-y-4">
                <Badge className="mx-auto w-fit bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200">
                  تجربة العميل أولاً
                </Badge>
                <h2 className="text-4xl font-bold text-slate-900 dark:text-white">
                  لوحة تحكم واضحة لكل رحلة عميل داخل رابط
                </h2>
                <p className="text-lg text-slate-600 dark:text-slate-300">
                  اختر الشخصية التي تهمك وشاهد مباشرة المقاييس، الوعود الزمنية، والخطوات التي نلتزم بها لنجاح تجربة العملاء من التفعيل وحتى تبني الموظفين.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                {experiencePromises.map(promise => (
                  <div
                    key={promise.label}
                    className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/80 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-slate-900/60 dark:text-emerald-200"
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" aria-hidden="true" />
                    <span>{promise.label}:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{promise.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
                <div className="rounded-3xl border border-white/60 bg-white/90 p-6 shadow-xl backdrop-blur dark:border-slate-800 dark:bg-slate-950/70">
                  <fieldset className="flex flex-wrap gap-3 border-0 p-0" aria-label="شرائح تجربة العميل">
                    <legend className="sr-only">اختر تجربة العميل</legend>
                    {experienceProfiles.map(profile => {
                      const isActiveProfile = profile.id === activeExperienceId;
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          onClick={() => setActiveExperienceId(profile.id)}
                          className={cn(
                            "rounded-full border px-4 py-2 text-sm font-semibold transition-all",
                            isActiveProfile
                              ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                              : "border-slate-200 text-slate-500 hover:border-emerald-200"
                          )}
                        >
                          {profile.label}
                        </button>
                      );
                    })}
                  </fieldset>

                  <div className="mt-6 space-y-6">
                    <p className="text-base text-slate-600 dark:text-slate-200">
                      {activeExperience.description}
                    </p>

                    <div className="grid gap-4 sm:grid-cols-3">
                      {activeExperience.kpis.map(kpi => (
                        <div
                          key={kpi.label}
                          className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-right dark:border-emerald-500/20 dark:bg-slate-900"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                            {kpi.label}
                          </p>
                          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
                          <p className="text-xs text-emerald-500">التغير {kpi.delta}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-900/70">
                      <p className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-100">
                        ما الذي نقدمه لتجربة عميل أفضل؟
                      </p>
                      <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                        {activeExperience.checklist.map(item => (
                          <li key={item} className="flex items-start gap-2">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <blockquote className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-5 text-right shadow-inner dark:border-emerald-500/20 dark:from-slate-900 dark:to-slate-900">
                      <p className="text-lg font-semibold text-slate-900 dark:text-white">“{activeExperience.quote}”</p>
                      <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-300">{activeExperience.quoteAuthor}</p>
                    </blockquote>

                    <Button asChild size="lg" className="gradient-primary text-white">
                      <Link href="/contact">اطلب جلسة تصميم رحلة عميل</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-slate-500">خريطة رحلة العميل</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">من أول يوم حتى التبني الكامل</h3>
                    </div>
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200">
                      تحديث لحظي
                    </Badge>
                  </div>

                  <div className="space-y-5">
                    {journeyMoments.map(moment => {
                      const status = journeyStatusStyles[moment.status];
                      return (
                        <div key={moment.title} className="rounded-2xl border border-slate-100 bg-white/90 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/60">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <span className={cn("h-3 w-3 rounded-full", status.dot)} aria-hidden="true" />
                              <p className="text-lg font-semibold text-slate-900 dark:text-white">{moment.title}</p>
                            </div>
                            <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", status.badge)}>
                              {status.label}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{moment.description}</p>
                          <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 dark:bg-slate-900/70 dark:text-white">
                            {moment.metricLabel}: <span className="text-2xl font-bold text-primary ml-2">{moment.metricValue}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-100">
                    يتم تحديث هذه الخريطة بناءً على بيانات الاستخدام الفعلية وتنبيهات الدعم، ما يسمح لك بالبقاء قريباً من تجربة عملائك طوال الوقت.
                  </div>
                </div>
              </div>
            </div>
          </section>

      <section className="border-y border-slate-100 bg-white/80">
        <div className="container mx-auto px-4 py-12 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-4">
              <Badge className="bg-brand-100 text-brand-800">
                حسابات تجريبية جاهزة
              </Badge>
              <h2 className="text-3xl font-bold">
                انتقل لصفحات مكتملة بثلاث نقرات فقط
              </h2>
              <p className="text-muted-foreground">
                صفحة الحسابات التجريبية الجديدة توفّر شخصيات جاهزة (مشرف، شركة، مستشار، موظف) وتربطك مباشرة بتجربة تسجيل الدخول والتسجيل المطورة بالإضافة لمنصة الاستشارات.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="gradient-primary text-white shadow-lg" asChild>
                  <Link href="/trial-accounts">استعرض الحسابات التجريبية</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/consulting">
                    منصة الاستشارات
                    <ArrowUpRight className="mr-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {trialTiles.map(tile => (
                <Card key={tile.title} className="border-brand-50 bg-brand-surface/30">
                  <CardContent className="space-y-3 p-4">
                    <div className="h-10 w-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center">
                      <tile.icon className="h-5 w-5" />
                    </div>
                    <p className="font-semibold text-sm">{tile.title}</p>
                    <p className="text-xs text-muted-foreground">{tile.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto mb-12 max-w-3xl text-center space-y-4">
            <Badge className="mx-auto w-fit bg-white/10 text-white">
              عرض تفاعلي مباشر
            </Badge>
            <h2 className="text-4xl font-bold lg:text-5xl">
              جرّب لوحات ربط بدون تسجيل
            </h2>
            <p className="text-base text-white/80">
              اختر السيناريو الذي يهم فريقك وشاهد كيف تنتقل الإجراءات من الطلب إلى التقرير النهائي بخطوات واضحة يمكن اختبارها الآن.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
            <div className="flex flex-col gap-3" aria-label="سيناريوهات العرض التفاعلي">
              {demoScenarios.map((scenario) => {
                const isActive = scenario.id === activeDemoId;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    onClick={() => setActiveDemoId(scenario.id)}
                    className={cn(
                      "rounded-2xl border border-white/15 px-4 py-4 text-left transition-all",
                      isActive
                        ? "bg-white text-slate-900 shadow-2xl"
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-lg font-semibold">{scenario.title}</span>
                      {isActive && <Sparkles className="h-5 w-5 text-amber-500" aria-hidden="true" />}
                    </div>
                    <p className={cn("mt-2 text-sm", isActive ? "text-slate-600" : "text-white/70")}>{scenario.summary}</p>
                    <span className={cn("mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold", isActive ? "bg-emerald-100 text-emerald-700" : "bg-white/10 text-white/80")}>{scenario.highlight}</span>
                  </button>
                );
              })}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl">
              <div className="flex flex-col gap-8 p-6 lg:p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{activeDemo.title}</h3>
                    <p className="text-sm text-slate-500">{activeDemo.summary}</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700">
                    {activeDemo.highlight}
                  </span>
                </div>

                <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
                  <div className="space-y-3" aria-label="خطوات السيناريو">
                    {activeDemo.steps.map((step, stepIndex) => {
                      const isStepActive = stepIndex === activeStepIndex;
                      return (
                        <button
                          key={`${activeDemo.id}-step-${stepIndex}`}
                          type="button"
                          onClick={() => setActiveStepIndex(stepIndex)}
                          className={cn(
                            "w-full rounded-2xl border px-4 py-3 text-right transition-colors",
                            isStepActive
                              ? "border-blue-500 bg-blue-50 text-slate-900"
                              : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                          )}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-semibold">{step.title}</span>
                            {isStepActive && <ArrowRight className="h-4 w-4 text-blue-600" aria-hidden="true" />}
                          </div>
                          <p className="mt-1 text-xs text-slate-500">{step.description}</p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-6">
                    <div className="mb-5">
                      <p className="text-xs uppercase tracking-widest text-slate-500">{activeStep.previewTitle}</p>
                      <h4 className="text-2xl font-bold text-slate-900">{activeStep.title}</h4>
                      <p className="text-sm text-slate-600">{activeStep.description}</p>
                    </div>

                    <div className="mb-6 flex flex-wrap gap-3">
                      {activeStep.previewHighlights.map((highlight) => (
                        <div key={`${activeStep.title}-${highlight.label}`} className="rounded-2xl border border-slate-200 bg-white/70 px-4 py-2">
                          <p className="text-xs text-slate-500">{highlight.label}</p>
                          <p className="text-lg font-semibold text-slate-900">{highlight.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      {activeStep.timeline.map((checkpoint) => {
                        const statusConfig = timelineStatusMap[checkpoint.status];
                        const Icon = statusConfig.Icon;
                        return (
                          <div
                            key={`${activeStep.title}-${checkpoint.label}`}
                            className={cn("flex items-start gap-3 rounded-2xl border px-3 py-3", statusConfig.classes)}
                          >
                            <Icon className="mt-1 h-4 w-4" aria-hidden="true" />
                            <div>
                              <p className="text-sm font-semibold">{checkpoint.label}</p>
                              <p className="text-xs opacity-80">{checkpoint.note}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                      <Button size="sm" asChild>
                        <Link href={activeDemo.ctaHref}>{activeDemo.ctaLabel}</Link>
                      </Button>
                      <span className="text-xs text-slate-500">{activeStep.actionLabel}</span>
                    </div>
                  </div>
                </div>

                <output aria-live="polite" className="sr-only">
                  {`${activeDemo.title} – ${activeStep.title}`}
                </output>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Audience Benefits Section */}
      <AnimatedSection className="container mx-auto px-4 py-16 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <FadeIn>
            <Badge className="mb-4">لكل من يعتمد على ربط</Badge>
            <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
              قيمة واضحة لكل فريق داخل الشركة
            </h2>
            <p className="text-lg text-muted-foreground">
              قسم الموارد البشرية، القيادات، والموظفون يحصلون على تجربة مصممة لاحتياجهم باللغة العربية وبأفضل الممارسات المحلية.
            </p>
          </FadeIn>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {audienceBenefits.map(benefit => (
            <AudienceBenefitCard key={benefit.title} {...benefit} />
          ))}
        </div>
      </AnimatedSection>

      {/* Categories Section - Enhanced */}
      <AnimatedSection className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <FadeIn>
            <Badge className="mb-4">خدماتنا</Badge>
            <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
              اختر الحل المناسب لك
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              نقدم حلولاً متنوعة تناسب جميع احتياجاتك في إدارة الموارد البشرية
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <StaggerItem key={category.id}>
              <AnimatedCard
                delay={index * 0.1}
                className={`group relative h-full overflow-hidden border-2 transition-all duration-300 ${category.borderHover}`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-300 group-hover:opacity-10 ${category.gradient}`}
                />

                <CardContent className="relative p-8">
                  {category.badge && (
                    <Badge className="absolute left-4 top-4 bg-gradient-to-r from-purple-600 to-pink-600">
                      {category.badge}
                    </Badge>
                  )}

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br p-4 ${category.gradient}`}
                  >
                    <category.icon className="h-10 w-10 text-white" />
                  </motion.div>

                  <h3 className="mb-3 text-2xl font-bold">
                    {t(category.titleKey)}
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    {t(category.descKey)}
                  </p>

                  {/* Features List */}
                  <div className="mb-8 space-y-3">
                    {category.features.map((feature, idx) => (
                      <motion.div
                        key={`feature-${category.id}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <div className="text-sm">{feature}</div>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${category.gradient} shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
                    asChild
                  >
                    <Link href="/signup">
                      {category.buttonText}
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </AnimatedSection>

      {/* Consulting Promo */}
      <AnimatedSection className="container mx-auto px-4">
        <Card className="border-2 border-purple-100 bg-gradient-to-r from-purple-50 via-white to-blue-50 shadow-sm">
          <CardContent className="flex flex-col gap-4 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                  الاستشارات الذكية
                </Badge>
                <Headphones className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-2">دعم قانوني وتشغيلي سريع</h3>
              <p className="text-muted-foreground max-w-2xl">
                احجز استشارة مدعومة بالذكاء الاصطناعي مع خبراء الموارد البشرية: رد أولي خلال 90 دقيقة، ملخصات جاهزة، وضمان رضا كامل.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button asChild className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
                <Link href="/consulting/book-new">احجز استشارة الآن</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/consulting">استعراض التفاصيل</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </AnimatedSection>

      {/* Features Section - Enhanced */}
      <AnimatedSection className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <FadeIn>
              <Badge className="mb-4">المميزات</Badge>
              <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
                لماذا تختار ربط؟
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                نوفر لك أفضل الأدوات والتقنيات لإدارة موارد بشرية فعالة
              </p>
            </FadeIn>
          </div>

          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="group h-full border-0 shadow-lg transition-all duration-300 hover:shadow-2xl">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 ${feature.gradient}`}
                      >
                        <feature.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <h3 className="mb-3 text-xl font-bold">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      {/* How It Works - Enhanced */}
      <AnimatedSection className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <FadeIn>
            <Badge className="mb-4">كيف تبدأ</Badge>
            <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
              ابدأ في 3 خطوات بسيطة
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              عملية سهلة وسريعة للبدء في استخدام نظام ربط
            </p>
          </FadeIn>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 lg:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <FadeIn key={step.number} delay={index * 0.2}>
                <div
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1">
                    <Card className="group border-2 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <CardContent className="p-8">
                        <h3 className="mb-3 text-2xl font-bold">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} text-3xl font-bold text-white shadow-2xl`}
                  >
                    {step.number}
                  </motion.div>

                  <div className="hidden flex-1 lg:block" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Pricing Section */}
      <AnimatedSection className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <FadeIn>
              <Badge className="mb-4">الأسعار والخطط</Badge>
              <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
                خطط مرنة حسب حجم فريقك
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                القيم التالية إرشادية ويمكن تخصيصها بالكامل، مما يسهل تجربة الخطة المناسبة ثم الترقية عند الحاجة.
              </p>
            </FadeIn>
          </div>

          <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <StaggerItem key={plan.name}>
                <AnimatedCard delay={index * 0.15} className="h-full">
                  <PricingPlanCard {...plan} />
                </AnimatedCard>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      {/* Trust & Credibility Section */}
      <AnimatedSection className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <FadeIn>
            <Badge className="mb-4">لماذا تثق بنا الشركات</Badge>
            <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
              مصمم لسياق الموارد البشرية في السعودية والخليج
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              نقاط الثقة التالية مبنية على حوارات مع فرق الموارد البشرية في المنطقة وستضاف إليها شعارات وشهادات حقيقية لاحقاً.
            </p>
          </FadeIn>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {trustSignals.map(signal => (
                <TrustSignalCard key={signal.title} {...signal} />
              ))}
            </div>
            <div className="rounded-2xl border border-dashed border-primary/30 p-6">
              <p className="mb-4 text-sm font-semibold text-primary">
                شعارات العملاء (قابلة للتحديث)
              </p>
              <LogoCloud logos={customerLogos} />
            </div>
          </div>

          <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="space-y-4 p-6 text-lg text-muted-foreground">
                <p>
                  “نبني قصص نجاح جديدة كل شهر. أضف شهادات مديري الموارد البشرية أو روابط الدراسات هنا لإبراز التأثير الحقيقي.”
                </p>
                <p className="text-sm text-muted-foreground">
                  ملاحظة: يمكن استبدال هذا النص باقتباس موثق من عميل عند توافره.
                </p>
              </CardContent>
            </Card>
            <div className="grid gap-6 md:grid-cols-2">
              {testimonials.map(testimonial => (
                <TestimonialCard key={testimonial.name} {...testimonial} />
              ))}
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section - Enhanced */}
      <AnimatedSection className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-grid-white/10" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="container relative mx-auto px-4">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center text-white">
              <h2 className="mb-6 text-4xl font-bold lg:text-6xl">
                هل أنت مستعد للبدء؟
              </h2>
              <p className="mb-8 text-xl opacity-90">
                انضم إلى آلاف الشركات التي تثق بنظام ربط لإدارة مواردها البشرية
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-lg text-purple-600 transition-all hover:scale-105 hover:bg-white/90"
                  asChild
                >
                  <Link href="/signup">
                    ابدأ الآن مجاناً
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-lg text-white transition-all hover:scale-105 hover:bg-white/10"
                  asChild
                >
                  <Link href="/contact">
                    تواصل معنا
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className="container mx-auto px-4 py-20">
        <Suspense fallback={<div className="py-12 text-center text-sm text-muted-foreground">يتم تحميل قسم الأسئلة الشائعة...</div>}>
          <LazyFAQSection />
        </Suspense>
      </AnimatedSection>

      {/* Footer */}
      <Suspense fallback={<div className="py-8 text-center text-sm text-muted-foreground">...يتم تحميل التذييل</div>}>
        <LazyFooter />
      </Suspense>
    </main>
  );
}
