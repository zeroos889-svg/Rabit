import CTAButton from "@/components/CTAButton";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  BadgeCheck,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Gauge,
  Handshake,
  Headphones,
  Layers,
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
  Wand2,
  ArrowRight,
} from "lucide-react";
import { Link } from "wouter";

const heroHighlights = [
  {
    label: "سرعة الاستجابة",
    value: "رد أولي خلال 90 دقيقة",
    icon: Timer,
  },
  {
    label: "ضمان الجودة",
    value: "استرداد كامل عند عدم الرضا",
    icon: ShieldCheck,
  },
  {
    label: "ثقة العملاء",
    value: "4.8/5 من 1200+ حالة",
    icon: Star,
  },
  {
    label: "شبكة الخبراء",
    value: "50+ مستشار معتمد",
    icon: Users,
  },
];

const valueStacks = [
  {
    title: "لطالب الخدمة",
    accent: "from-cyan-500 to-blue-500",
    icon: Sparkles,
    items: [
      "مسارات فورية أو مجدولة مع أسعار واضحة وتأكيد فوري",
      "ضمان رضا + ملخص تنفيذي وملفات مؤمنة لكل جلسة",
      "تواصل متعدد القنوات: نصي، صوتي، فيديو مع تسجيلات عند الطلب",
    ],
  },
  {
    title: "للمستشار",
    accent: "from-amber-500 to-orange-500",
    icon: Rocket,
    items: [
      "طلبات جاهزة مع بيانات مكتملة ونماذج مسبقة للحالات الشائعة",
      "تسعير ديناميكي وحملات ترويجية تلقائية للمستشارين النشطين",
      "لوحة أرباح فورية، جدولة ذكية، وتقييمات شفافة تبني سمعتك",
    ],
  },
  {
    title: "لرابط",
    accent: "from-emerald-500 to-teal-500",
    icon: Shield,
    items: [
      "حوكمة تسعير وسقوف للخصومات تضمن هامش ربحي صحي",
      "مراقبة SLA والالتزام القانوني مع تنبيهات للطلبات المتعثرة",
      "تقارير إيرادات واستبقاء العملاء وربحية المستشارين في الوقت الفعلي",
    ],
  },
];

const packages = [
  {
    name: "مسار فوري",
    badge: "أسرع اختيار",
    price: "99 ريال",
    sla: "رد أولي خلال 90 دقيقة",
    description: "مناسب للقرارات السريعة والأسئلة القصيرة",
    features: [
      "دردشة فورية أو مكالمة قصيرة مع مستشار متخصص",
      "تحليل سريع وخطوات تنفيذية مختصرة",
      "ملخص مكتوب ومرفقات مؤمنة",
    ],
    href: "/consulting/book-new?mode=instant",
  },
  {
    name: "جلسة تنفيذية",
    badge: "الأكثر توازناً",
    price: "199 ريال",
    sla: "جلسة 30-45 دقيقة",
    description: "أفضل خيار لمراجعة عقود أو قرارات HR مع تطبيق مباشر",
    features: [
      "اختيار المستشار والموعد مع تذكيرات ذكية",
      "مشاركة شاشة، تسجيل الجلسة، وخطة تصحيحية",
      "دعم متابعة لمدة 48 ساعة بعد الجلسة",
    ],
    href: "/consulting/book-new",
  },
  {
    name: "اشتراك أعمال",
    badge: "قيمة للشركات",
    price: "يبدأ من 899 ريال/شهر",
    sla: "مدير حساب + SLA 12 ساعة",
    description: "اشتراك شهري يغطي الفريق بمخصص ساعات واستشارات غير محدودة نصياً",
    features: [
      "تسعير شفاف بعدد المقاعد وساعات الجلسات",
      "لوحة تحكم للموافقات والفوترة الموحدة",
      "أولوية مطابقة مع نخبة المستشارين",
    ],
    href: "/consulting/services",
  },
];

const workflow = [
  {
    title: "طلب الخدمة",
    description: "اختر نوع الاستشارة والمسار (فوري، جلسة، اشتراك) وحدد التحدي بدقيقة واحدة.",
    meta: "60 ثانية",
    icon: Activity,
  },
  {
    title: "مطابقة ذكية",
    description: "نرشح المستشار الأنسب حسب الخبرة، الصناعة، وSLA المطلوب مع إمكانية الاختيار اليدوي.",
    meta: "تلقائي",
    icon: Target,
  },
  {
    title: "تأكيد السعر والخطة",
    description: "باقات واضحة وإضافات مدفوعة (صياغة عقود، مراجعة ملفات) مع سقوف خصم مضبوطة.",
    meta: "5 دقائق",
    icon: CircleDollarSign,
  },
  {
    title: "التنفيذ والتسليم",
    description: "جلسة نص/صوت/فيديو مع تسجيل وملخص تنفيذي ومرفقات مؤمنة.",
    meta: "حسب الباقة",
    icon: CalendarClock,
  },
  {
    title: "التقييم والتحسين",
    description: "تقييم المستشار، NPS، وتوصيات متابعة تلقائية لضمان استمرارية العميل.",
    meta: "فوري",
    icon: BadgeCheck,
  },
];

const channels = [
  {
    title: "نصي فوري",
    description: "ردود موثقة خلال 90 دقيقة، مناسب للقرارات اليومية السريعة.",
    tag: "أقل تكلفة",
    icon: MessageSquare,
  },
  {
    title: "جلسة صوتية",
    description: "30 دقيقة لمناقشة تفصيلية مع تسجيل اختياري وملخص بعد المكالمة.",
    tag: "تفاعل مباشر",
    icon: Phone,
  },
  {
    title: "جلسة فيديو",
    description: "45 دقيقة مع مشاركة شاشة لاستعراض مستندات أو خطط عمل.",
    tag: "للاجتماعات",
    icon: Video,
  },
];

const consultantWins = [
  {
    title: "لوحة أرباح مباشرة",
    description: "تسعير ديناميكي، أكواد ترويجية، وتتبّع صافٍ لكل استشارة.",
    icon: CircleDollarSign,
  },
  {
    title: "جدولة ذكية",
    description: "تزامن مع التقويم، حجب أوقاتك، وإشعارات واتساب للبدايات المتأخرة.",
    icon: CalendarClock,
  },
  {
    title: "مساعد ذكي",
    description: "اقتراح ردود، تلخيص محادثات، وصياغة مذكرات عمل آمنة.",
    icon: Wand2,
  },
  {
    title: "سمعة موثقة",
    description: "شارات اعتماد، تقييمات شفافة، ومسار ترقية لخبراء النخبة.",
    icon: BadgeCheck,
  },
];

const platformOps = [
  {
    title: "حوكمة الأسعار",
    description: "سقوف للخصومات، هوامش دنيا، وحملات تلقائية للمواسم.",
    icon: Layers,
  },
  {
    title: "جودة وتسليم",
    description: "مراقبة SLA والتنبيهات للحالات المتأخرة مع تصعيد لمشرفي رابط.",
    icon: Shield,
  },
  {
    title: "فوترة ذكية",
    description: "فواتير رقمية، ضريبة، تحصيل مسبق، وتسوية آلية للمستشارين.",
    icon: Handshake,
  },
  {
    title: "أداء في الوقت الفعلي",
    description: "لوحات إيراد الاستشارات، الربحية لكل مستشار، وقوة استبقاء العملاء.",
    icon: BarChart3,
  },
];

const aiAssistHighlights = [
  {
    title: "ملخصات جاهزة للمستشار",
    description:
      "DeepSeek يلخص وصف الطلب ويقترح نقاط نقاش وأسئلة استيضاح قبل الجلسة.",
    icon: Sparkles,
  },
  {
    title: "اقتراح ردود أثناء المحادثة",
    description:
      "زر \"مساعدة AI\" داخل غرفة الاستشارة يقترح ردوداً آمنة استناداً لآخر 10 رسائل.",
    icon: MessageSquare,
  },
  {
    title: "تحقق تشغيلي",
    description:
      "المساعد يذكّر بـ SLA والمتطلبات المرفوعة لضمان تسليم كامل دون تأخير.",
    icon: ShieldCheck,
  },
];

const trustSignals = [
  {
    title: "رد أولي 90 دقيقة",
    note: "للمسار الفوري، مع تنبيهات تصعيد",
    icon: Timer,
  },
  {
    title: "ضمان رضا",
    note: "استرداد كامل أو استشارة بديلة",
    icon: BadgeCheck,
  },
  {
    title: "أمان وتوثيق",
    note: "تشفير مرفقات ونسخ احتياطي للمحادثات",
    icon: ShieldCheck,
  },
];

const trustStats = [
  { label: "حالات منجزة", value: "1,200+", accent: "text-indigo-700" },
  { label: "متوسط التقييم", value: "4.8/5", accent: "text-emerald-700" },
  { label: "توفير زمني", value: "70%", accent: "text-purple-700" },
  { label: "شبكة الخبراء", value: "50+ مستشار", accent: "text-blue-700" },
];

const scenarios = [
  {
    title: "قرارات إنهاء/تأديب",
    detail: "تقييم مخاطر قانونية خلال 24 ساعة مع مذكرات مختصرة وخيارات بديلة.",
    badge: "عاجل",
    icon: ShieldCheck,
  },
  {
    title: "مراجعة عقود ورواتب",
    detail: "مراجعة بنود التعاقد والبدلات وفق نظام العمل السعودي مع ملخص تنفيذي.",
    badge: "دقيق",
    icon: Handshake,
  },
  {
    title: "هيكلة فرق ودوامات",
    detail: "تحليل أثر الدوامات والمناوبات على التكاليف والامتثال مع توصيات جاهزة للتطبيق.",
    badge: "تشغيلي",
    icon: Gauge,
  },
];

const guarantees = [
  {
    title: "SLA واضح",
    description: "رد أولي 90 دقيقة للمسار الفوري، وجلسات في مواعيد مؤكدة.",
    icon: Timer,
  },
  {
    title: "سرية وتشفير",
    description: "تشفير مرفقات وتوثيق محادثات مع نسخ احتياطي مؤمن.",
    icon: Shield,
  },
  {
    title: "ضمان رضا",
    description: "استرداد كامل عند عدم الرضا وبديل مجاني عند تجاوز الـ SLA.",
    icon: BadgeCheck,
  },
];

const completionChecklist = [
  {
    title: "صفحة حجز موحدة",
    detail: "تم ربط خطوات اختيار المستشار، الملفات المطلوبة، والدفعات في واجهة واحدة بدون صفحات مكررة.",
    icon: Layers,
  },
  {
    title: "غرف استشارة محدثة",
    detail: "غرفة الدردشة والصوت والفيديو متصلة بمساعد الذكاء الاصطناعي، مع حفظ تلقائي للمرفقات.",
    icon: MessageSquare,
  },
  {
    title: "لوحات متابعة SLA",
    detail: "المشرف يرى حالات التأخير، التنبيهات، وضمان الرضا مباشرة بعد كل جلسة.",
    icon: Gauge,
  },
];

const trialExperiences = [
  {
    title: "شخصية الشركة",
    body: "اختبر تجربة HR الكاملة، من إرسال الطلب حتى الموافقة على التوصيات داخل لوحة التحكم.",
    href: "/trial-accounts",
  },
  {
    title: "شخصية المستشار",
    body: "عاين تقويم الحجوزات، التسعير الديناميكي، وتقييمات العملاء في بيئة آمنة.",
    href: "/trial-accounts",
  },
  {
    title: "شخصية الموظف",
    body: "تابع حالة الاستشارة من بوابة الموظف مع إشعارات بالعربية والإنجليزية.",
    href: "/trial-accounts",
  },
];

export default function Consulting() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_35%)]" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="container relative py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <Badge className="bg-white/10 text-white border border-white/20">
                منصة الاستشارات المتخصصة
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                منصة استشارات تنافسية تقدم سرعة، دقة، وهوامش ربح واضحة
              </h1>
              <p className="text-lg text-white/80">
                تجارب مصممة لطالب الخدمة، أدوات إنتاجية للمستشار، وحوكمة تسعير وضمانات
                تشغيليـة لرابط لضمان أعلى ربحية واستبقاء.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                  asChild
                >
                  <Link href="/consulting/book-new">ابدأ حجز استشارة الآن</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/signup/consultant">انضم كمستشار</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {heroHighlights.map((item) => (
                <Card
                  key={item.label}
                  className="bg-white/10 border-white/10 text-white backdrop-blur"
                >
                  <CardHeader className="flex flex-row items-center gap-3 pb-2">
                    <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-sm text-white/80">
                      {item.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold">{item.value}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-6 bg-white/70 border-b backdrop-blur">
        <div className="container flex flex-wrap items-center justify-center gap-3">
          <Button size="sm" variant="secondary" asChild>
            <Link href="/consulting/book-new">حجز استشارة فورية</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/consulting/experts">تصفح المستشارين</Link>
          </Button>
          <Button size="sm" variant="outline" asChild>
            <Link href="/consulting/services">استعراض الباقات</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/consulting/how-to-book">كيفية الحجز</Link>
          </Button>
        </div>
      </section>

      <section className="py-16 border-b bg-white">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="px-3">
              مسارات قيمة لكل طرف
            </Badge>
            <h2 className="text-3xl font-bold">مصممة للمستفيد والمستشار ورابط</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              تجربة متكاملة من الطلب حتى التقييم مع ضمان جودة وتوثيق كامل للبيانات
              والتعاملات المالية.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {valueStacks.map((stack) => (
              <Card key={stack.title} className="h-full shadow-sm">
                <CardHeader>
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stack.accent} text-white flex items-center justify-center mb-3`}
                  >
                    <stack.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{stack.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-muted-foreground leading-relaxed">
                    {stack.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-1" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <Badge className="mb-3">عروض وأسعار تنافسية</Badge>
              <h2 className="text-3xl font-bold">باقات استشارية واضحة وهوامش محسوبة</h2>
              <p className="text-muted-foreground max-w-2xl">
                صممنا المسارات لتغطي الحاجة الفورية والجلسات التنفيذية والاشتراكات الشهرية
                مع تحكم كامل في الأسعار والخصومات من لوحة رابط.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/consulting/services">تصفح كل الباقات</Link>
              </Button>
              <Button asChild>
                <Link href="/consulting/book-new">احجز الآن</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {packages.map((pkg) => (
              <Card
                key={pkg.name}
                className="relative h-full border-2 border-transparent hover:border-indigo-200 transition"
              >
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{pkg.name}</CardTitle>
                    <Badge variant="secondary">{pkg.badge}</Badge>
                  </div>
                  <div className="text-3xl font-bold text-indigo-700">{pkg.price}</div>
                  <div className="text-sm text-emerald-600">{pkg.sla}</div>
                  <CardDescription className="text-base">{pkg.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {pkg.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-sm text-muted-foreground">
                        <Sparkles className="h-4 w-4 text-indigo-600 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <CTAButton label="ابدأ هذه الباقة" href={pkg.href} fullWidth />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="container flex flex-col gap-4">
          <div className="flex flex-wrap gap-3 items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">ضمانات موثقة</h3>
              <p className="text-sm text-muted-foreground">
                SLA واضح، استرداد عند عدم الرضا، وبيانات مشفرة لحماية العملاء والمستشارين.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" variant="outline" asChild>
                <Link href="/consulting/services">تفاصيل الباقات</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/consulting/book-new?mode=instant">احجز مسار فوري</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {trustSignals.map((item) => (
              <Card key={item.title} className="h-full border-indigo-50">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div className="h-10 w-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <CardDescription className="text-sm">{item.note}</CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="px-3">
              ماذا يشمل كل مسار؟
            </Badge>
            <h2 className="text-3xl font-bold">مخرجات واضحة لكل نوع استشارة</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              تعرف على ما ستحصل عليه في نهاية كل جلسة لضمان توقعات صحيحة.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                title: "استشارة نصية فورية",
                deliverables: [
                  "رد موثق خلال 90 دقيقة",
                  "ملخص PDF",
                  "إجابة أسئلة متابعة خلال 24 ساعة",
                ],
                icon: MessageSquare,
              },
              {
                title: "جلسة صوتية/فيديو",
                deliverables: [
                  "تسجيل الجلسة (عند الطلب)",
                  "ملخص تنفيذي وخطة عمل مختصرة",
                  "قائمة مرفقات مؤمنة",
                ],
                icon: Video,
              },
              {
                title: "اشتراك أعمال",
                deliverables: [
                  "مدير حساب + SLA 12 ساعة",
                  "تقارير شهرية للأداء والقرارات",
                  "مكتبة حالات ومستندات مخصصة",
                ],
                icon: Layers,
              },
            ].map((item) => (
              <Card key={item.title} className="h-full shadow-sm border-indigo-50">
                <CardHeader className="space-y-2">
                  <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {item.deliverables.map((d) => (
                      <li key={d} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-y">
        <div className="container space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <Badge variant="secondary" className="px-3">
                سيناريوهات استخدام شائعة
              </Badge>
              <h2 className="text-3xl font-bold">نغطي القرارات العاجلة والتشغيلية</h2>
              <p className="text-muted-foreground max-w-3xl">
                اختر السيناريو الأقرب لحاجتك لنحضر المستشار المناسب مع متطلبات جاهزة قبل الجلسة.
              </p>
            </div>
            <Button asChild>
              <Link href="/consulting/book-new">ابدأ بالحجز الآن</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {scenarios.map((item) => (
              <Card key={item.title} className="h-full shadow-sm border-indigo-50">
                <CardHeader className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100">
                      {item.badge}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.detail}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="container space-y-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <Badge className="bg-white/10 text-white border border-white/10">
                رحلة محكومة زمنياً
              </Badge>
              <h2 className="text-3xl font-bold mt-3">تجربة محكومة من الطلب حتى التسليم</h2>
              <p className="text-white/80 max-w-3xl">
                نربط كل خطوة بوقت متوقع وتوثيق كامل، مع قنوات تناسب سرعة القرار وحجم الفريق.
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="border-white/30 text-white" asChild>
                <Link href="/consulting/book-new">ابدأ الآن</Link>
              </Button>
              <Button className="bg-white text-slate-900" asChild>
                <Link href="/consulting/how-to-book">كيفية الحجز</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 grid gap-4">
              {workflow.map((step) => (
                <Card
                  key={step.title}
                  className="bg-white/5 border border-white/10 backdrop-blur"
                >
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                    <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center">
                      <step.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg text-white">{step.title}</CardTitle>
                        <span className="text-xs text-white/70">{step.meta}</span>
                      </div>
                      <CardDescription className="text-white/80">
                        {step.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
            <div className="space-y-4">
              {channels.map((channel) => (
                <Card
                  key={channel.title}
                  className="bg-white/10 border-white/10 text-white backdrop-blur"
                >
                  <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                    <div className="h-10 w-10 rounded-lg bg-white/15 flex items-center justify-center">
                      <channel.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{channel.title}</CardTitle>
                        <Badge className="bg-white/15 text-white border border-white/20">
                          {channel.tag}
                        </Badge>
                      </div>
                      <CardDescription className="text-white/75">
                        {channel.description}
                      </CardDescription>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 border-b">
        <div className="container space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <Badge className="px-3 bg-indigo-600 text-white">مدعوم بـ DeepSeek AI</Badge>
              <h2 className="text-3xl font-bold">
                مساعد ذكاء اصطناعي مدمج في رحلة الاستشارة
              </h2>
              <p className="text-muted-foreground max-w-3xl">
                نعتمد على DeepSeek لتسريع إعداد المستشار، اقتراح الردود، وضبط الجودة
                أثناء الخدمة دون المساس بالخصوصية أو الامتثال.
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href="/consulting/how-to-book">تعرف على كيفية عمل المساعد</Link>
              </Button>
              <Button asChild>
                <Link href="/consulting/book-new">ابدأ استشارة مدعومة بالذكاء</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {aiAssistHighlights.map((item) => (
              <Card key={item.title} className="h-full shadow-sm">
                <CardHeader className="space-y-2">
                  <div className="h-11 w-11 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="px-3">
              ضمانات وثقة
            </Badge>
            <h2 className="text-3xl font-bold">ضمان رضا، سرية، والتزام زمني</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              بنية تشغيلية تحمي بياناتك وتضمن جودة التسليم مع بديل مجاني عند تجاوز الـ SLA.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {guarantees.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader className="space-y-2">
                  <div className="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-indigo-50 via-white to-purple-50 border-b">
        <div className="container space-y-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h3 className="text-2xl font-bold">أرقام موثوقة لبناء الثقة</h3>
              <p className="text-muted-foreground">
                أداء الاستشارات في الوقت الفعلي مع تركيز على الرضا والسرعة.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button size="sm" asChild>
                <Link href="/consulting/book-new">ابدأ الحجز الآن</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href="/consulting/experts">تصفح المستشارين</Link>
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {trustStats.map((stat) => (
              <Card key={stat.label} className="h-full shadow-sm border-indigo-50">
                <CardContent className="py-5">
                  <div className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white border-b">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="px-3">
              تمكين المستشارين
            </Badge>
            <h2 className="text-3xl font-bold">أدوات احترافية لزيادة دخل المستشار</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              تجربة عمل متكاملة: جدولة، فوترة، مساعد ذكي، وشارات ثقة تعزز التحويلات.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {consultantWins.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                  <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{item.title}</CardTitle>
                    <CardDescription className="text-sm mt-1">
                      {item.description}
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
          <div className="flex justify-center">
            <Button size="lg" asChild>
              <Link href="/signup/consultant">انضم لشبكة مستشارينا</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-50">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <Badge className="px-3">تشغيل وربحية رابط</Badge>
            <h2 className="text-3xl font-bold">حوكمة مالية وتشغيلية تحمي الهامش</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              منظومة تسعير، فوترة، وضمان جودة تمنح رابط سيطرة كاملة على الإيراد والتجربة.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {platformOps.map((item) => (
              <Card key={item.title} className="h-full">
                <CardHeader className="space-y-2">
                  <div className="h-10 w-10 rounded-lg bg-slate-100 text-indigo-700 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-base">{item.title}</CardTitle>
                  <CardDescription className="text-sm">{item.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          <Card className="bg-white border-indigo-100 shadow-sm">
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  تجارب موثقة وضمانات خدمة شاملة
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  تسجيل الجلسات، تشفير المرفقات، ونسخ احتياطي تلقائي لضمان سلامة البيانات.
                </CardDescription>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Gauge className="h-4 w-4" /> مراقبة SLA
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Headphones className="h-4 w-4" /> دعم 24/7
                </Badge>
                <Badge variant="secondary" className="flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" /> سرية كاملة
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-white border-y">
        <div className="container space-y-10">
          <div className="text-center space-y-3">
            <Badge className="px-3">استكمال الصفحات</Badge>
            <h2 className="text-3xl font-bold">كل صفحات منصة الاستشارات أصبحت متصلة</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              الحجز الجديد، غرف الاستشارة، ولوحات المتابعة مرتبطة الآن بمسار تسجيل الدخول والتجربة المجانية لتقليل القفز بين الصفحات.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {completionChecklist.map(item => (
              <Card key={item.title} className="h-full border-indigo-50">
                <CardHeader className="space-y-3">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.detail}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 text-white">
        <div className="container space-y-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Badge className="bg-white/10 border-white/20 text-white">
                تجارب الدخول الجديدة
              </Badge>
              <h2 className="text-3xl font-bold mt-3">اختر شخصية واستكمل الرحلة خلال دقائق</h2>
              <p className="text-white/80 max-w-2xl">
                الحسابات التجريبية المضافة حديثاً تجهز البريد، كلمة المرور، ومسار التسجيل الصحيح لكل دور حتى يمكنك اختبار المنصة دون إعداد مسبق.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/trial-accounts">انتقل لصفحة الحسابات التجريبية</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {trialExperiences.map(exp => (
              <Card key={exp.title} className="bg-white/10 border-white/10 h-full">
                <CardHeader>
                  <CardTitle className="text-xl text-white">{exp.title}</CardTitle>
                  <CardDescription className="text-white/70">
                    {exp.body}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="ghost" className="text-white px-0" asChild>
                    <Link href={exp.href}>
                      جرّب الآن
                      <ArrowRight className="ms-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-indigo-950 text-white">
        <div className="container flex flex-col gap-6 items-center text-center">
          <Badge className="bg-white/10 text-white border border-white/15">
            جاهز لإطلاق منصة استشاراتك
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">
            اجعل الاستشارات مصدر دخلك الرئيسي مع تجربة عالمية
          </h2>
          <p className="text-white/80 max-w-2xl">
            حجز فوري، أسعار واضحة، ضمان رضا، وأدوات تشغيلية تحافظ على ربحية رابط وتبني
            ولاء العملاء والمستشارين.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              size="lg"
              className="bg-white text-indigo-950 hover:bg-slate-100"
              asChild
            >
              <Link href="/consulting/book-new">ابدأ حجز استشارة</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10"
              asChild
            >
              <Link href="/signup/consultant">سجل كمستشار</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
