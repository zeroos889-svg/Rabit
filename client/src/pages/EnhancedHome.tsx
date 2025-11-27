import { useEffect, useState } from "react";
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
  AnimatedCard
} from "@/components/ui/animated-card";
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
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";

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
    ctaHref: "/trial-accounts",
    ctaLabel: "شاهد السيرة العملية",
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
    ctaHref: "/signup",
    ctaLabel: "منح صلاحيات الموظفين",
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
    ctaHref: "/contact",
    ctaLabel: "اطلب مراجعة امتثال",
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
  const { t } = useTranslation();
  const [heroImageError, setHeroImageError] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState(() => demoScenarios[0]?.id ?? "automation");
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  useEffect(() => {
    setActiveStepIndex(0);
  }, [activeDemoId]);

  const activeDemo = demoScenarios.find(demo => demo.id === activeDemoId) ?? demoScenarios[0];
  const activeStep = activeDemo.steps[activeStepIndex] ?? activeDemo.steps[0];

  return (
    <main
      id="main-content"
      role="main"
      aria-labelledby="enhanced-home-hero-title"
      className="min-h-screen bg-gradient-to-br from-background via-background to-muted"
    >
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Hero Content */}
            <FadeIn direction="left">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Zap className="mr-2 h-4 w-4" />
                    منصة الموارد البشرية المخصصة للشركات السعودية والخليجية
                  </Badge>
                </motion.div>

                <motion.h1
                  id="enhanced-home-hero-title"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold leading-tight tracking-tight lg:text-7xl"
                >
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    رابط
                  </span>
                  <br />
                  <span className="text-foreground">
                    يوحد عمليات الموارد البشرية ويكشف الفوضى المخفية
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-muted-foreground lg:text-2xl"
                >
                  ربط هو مساعد الموارد البشرية الذي يجمع حضور الموظفين، المستندات، والتقارير التنفيذية في منصة عربية جاهزة للامتثال.
                  مصمم لفرق HR في الشركات الصغيرة والمتوسطة بالسعودية والخليج ليعالج العمل اليدوي، البيانات المتفرقة، وغياب الرؤى.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="rounded-2xl border border-primary/10 bg-background/80 p-6 shadow-lg"
                >
                  <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
                    لماذا نختلف عن الأنظمة الكلاسيكية؟
                  </p>
                  <ul className="space-y-3 text-base text-muted-foreground">
                    {heroValueBullets.map(point => (
                      <li key={point.title} className="flex gap-3">
                        <CheckCircle2 className="mt-1 h-5 w-5 text-primary" />
                        <span>
                          <span className="font-semibold text-foreground">{point.title}:</span> {point.description}
                        </span>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="flex flex-wrap gap-4"
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    asChild
                  >
                    <Link href="/signup">
                      ابدأ مجاناً
                      <ArrowRight className="mr-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 text-lg transition-all hover:scale-105"
                  >
                    <Play className="ml-2 h-5 w-5" />
                    شاهد الفيديو التوضيحي
                  </Button>
                </motion.div>

                {/* Hero Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-4 pt-8 md:grid-cols-4"
                >
                  {heroStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="mb-2 flex justify-center">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </FadeIn>

            {/* Hero Image/Illustration */}
            <FadeIn direction="right" delay={0.3}>
              <div className="relative">
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-2xl"
                >
                  <div className="rounded-xl bg-background p-8">
                    {!heroImageError ? (
                      <img
                        src="/hero-illustration.svg"
                        alt="Rabit HR System overview"
                        className="h-auto w-full"
                        width={960}
                        height={720}
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        onError={() => setHeroImageError(true)}
                      />
                    ) : (
                      <div className="flex h-96 flex-col items-center justify-center gap-4 text-center text-primary/80">
                        <Globe className="h-24 w-24" />
                        <div className="space-y-1">
                          <p className="text-lg font-semibold">منصة رابط للموارد البشرية</p>
                          <p className="text-sm text-muted-foreground">
                            يتعذر تحميل الرسم التوضيحي حالياً.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>

                {/* Floating Cards */}
                <motion.div
                  animate={{
                    y: [0, 15, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-8 top-20 hidden lg:block"
                >
                  <Card className="shadow-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-500/10 p-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">إنتاجية أعلى</div>
                          <div className="text-2xl font-bold text-green-500">
                            +45%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-8 bottom-20 hidden lg:block"
                >
                  <Card className="shadow-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-500/10 p-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">توفير الوقت</div>
                          <div className="text-2xl font-bold text-blue-500">
                            70%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </FadeIn>
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
            <div
              role="tablist"
              aria-label="سيناريوهات العرض التفاعلي"
              className="flex flex-col gap-3"
            >
              {demoScenarios.map((scenario) => {
                const isActive = scenario.id === activeDemoId;
                return (
                  <button
                    key={scenario.id}
                    type="button"
                    role="tab"
                    id={`demo-tab-${scenario.id}`}
                    aria-selected={isActive ? "true" : undefined}
                    aria-controls={`demo-panel-${scenario.id}`}
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

            <div
              id={`demo-panel-${activeDemo.id}`}
              role="tabpanel"
              aria-labelledby={`demo-tab-${activeDemo.id}`}
              className="rounded-3xl border border-white/10 bg-white text-slate-900 shadow-2xl"
            >
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
                  <div className="space-y-3" role="listbox" aria-label="خطوات السيناريو">
                    {activeDemo.steps.map((step, stepIndex) => {
                      const isStepActive = stepIndex === activeStepIndex;
                      return (
                        <button
                          key={`${activeDemo.id}-step-${stepIndex}`}
                          type="button"
                          role="option"
                          aria-selected={isStepActive ? "true" : undefined}
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
                        const baseStyles =
                          checkpoint.status === "done"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                            : checkpoint.status === "active"
                              ? "border-blue-200 bg-blue-50 text-blue-900"
                              : "border-slate-200 bg-white text-slate-600";
                        const Icon = checkpoint.status === "done" ? CheckCircle2 : checkpoint.status === "active" ? Zap : Clock;
                        return (
                          <div
                            key={`${activeStep.title}-${checkpoint.label}`}
                            className={cn("flex items-start gap-3 rounded-2xl border px-3 py-3", baseStyles)}
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

                <div role="status" aria-live="polite" className="sr-only">
                  {`${activeDemo.title} – ${activeStep.title}`}
                </div>
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
        <FAQSection />
      </AnimatedSection>

      {/* Footer */}
      <Footer />
    </main>
  );
}
