import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, PlayCircle, Shield, Sparkles, Star, Users, CalendarClock, MessageSquare, BookOpen, Calculator, FileText, Building2, UserCheck } from "lucide-react";
import CTAButton from "@/components/CTAButton";

const services = [
  {
    title: "الاستشارات القانونية",
    description: "ردود موثوقة خلال 24 ساعة مع ملخص تنفيذي وخطوات تنفيذ واضحة.",
    badge: "قانون العمل السعودي",
    price: "ابتداءً من 99 ريال",
    scenario: "مثال: استفسار سريع حول مادة 77 أو إنهاء عقد",
  },
  {
    title: "مراجعة العقود",
    description: "تدقيق عقود العمل واللوائح الداخلية وضمان التوافق مع لوائح الوزارة.",
    badge: "توافق وتشريعات",
    price: "ابتداءً من 249 ريال",
    scenario: "مثال: مراجعة عقد موظف أجنبي قبل التوقيع",
  },
  {
    title: "تدقيق قرارات الفصل",
    description: "تحليل المخاطر القانونية قبل الفصل مع توصيات بديلة وسيناريوهات تعويض.",
    badge: "مؤشر قانوني",
    price: "تسليم خلال 48 ساعة",
    scenario: "مثال: تقييم قرار فصل أثناء فترة التجربة",
  },
  {
    title: "التوظيف الذكي (ATS)",
    description: "إدارة الرحلة الكاملة للمرشح من التقديم حتى العرض مع توصيات AI.",
    badge: "ذكاء اصطناعي",
    price: "مدمج في الباقة",
    scenario: "مثال: تشغيل حملات توظيف لعدة فروع في وقت واحد",
  },
  {
    title: "الأدوات الذكية HR",
    description: "حاسبات نهاية الخدمة والإجازات والرواتب مع حفظ السجلات والتقارير.",
    badge: "أتمتة",
    price: "مدمج في الباقة",
    scenario: "مثال: استخراج كشوف إجازات لشهر كامل بضغطة",
  },
  {
    title: "التدريب والدورات",
    description: "مسارات تعليمية لنظام العمل، التوظيف، الامتثال، والتحقيقات الداخلية.",
    badge: "مسارات جاهزة",
    price: "مسارات قصيرة ومكثفة",
    scenario: "مثال: تدريب الفريق القانوني على تحديثات 2024",
  },
];

const steps = [
  "اختر الخدمة المناسبة",
  "حدّد الموعد أو أرسل المستندات",
  "استلم التحليل والتوصيات",
  "طبّق الخطوات بمتابعة المستشار",
];

const consultingRoutes = [
  {
    title: "حجز سريع",
    description: "جلسة صوتية/فيديو خلال 24 ساعة مع مستشار معتمد.",
    badge: "مسار فوري",
    href: "/consulting/book",
    icon: CalendarClock,
  },
  {
    title: "دليل الخبراء",
    description: "تصفية المستشارين حسب التخصص والتقييم واللغة.",
    badge: "اختيار المستشار",
    href: "/consultants",
    icon: Users,
  },
  {
    title: "الخدمات الجاهزة",
    description: "مراجعة عقود، تدقيق قرارات فصل، ولوائح داخلية.",
    badge: "جاهز للتنفيذ",
    href: "/consulting/services",
    icon: MessageSquare,
  },
  {
    title: "تعلم الرحلة",
    description: "شاهد خطوات الحجز والتسليم وروابط الأدوات المساندة.",
    badge: "دليل سريع",
    href: "/consulting/how-to-book",
    icon: BookOpen,
  },
];

const toolShortcuts = [
  {
    title: "حاسبة نهاية الخدمة",
    description: "حساب فوري مع سجل محفوظ وإصدار PDF.",
    href: "/tools/end-of-service",
    icon: Calculator,
  },
  {
    title: "حاسبة الإجازات",
    description: "إدارة الأرصدة والتواريخ مع احتساب تلقائي.",
    href: "/tools/leave-calculator",
    icon: CalendarClock,
  },
  {
    title: "مولد الخطابات",
    description: "خطابات موارد بشرية جاهزة بالعربية والإنجليزية.",
    href: "/tools/letter-generator",
    icon: FileText,
  },
  {
    title: "مستنداتك",
    description: "أرشفة ومشاركة الملفات والتقارير بأمان.",
    href: "/my-documents",
    icon: Shield,
  },
];

const planBridges = [
  {
    title: "باقة الشركات",
    description: "لوحة تنفيذية، إدارة موظفين، تكامل التذاكر والمهام مع التوظيف.",
    badge: "الأكثر شمولاً",
    href: "/pricing",
  },
  {
    title: "باقة المستشارين",
    description: "جدولة، مدفوعات، وملف خبير مع إشعارات وتقارير.",
    badge: "مخصصة للخبراء",
    href: "/pricing",
  },
  {
    title: "تجربة مجانية",
    description: "جرّب الحاسبات والأدوات مع وصول محدود قبل الاشتراك.",
    badge: "ابدأ الآن",
    href: "/trial-accounts",
  },
];

const deliveryTimeline = [
  {
    title: "يوم العمل 0-1",
    description: "استلام الطلب/المستندات + ملخص مبدئي وخطوات أولية.",
    badge: "استجابة أولية",
  },
  {
    title: "يوم العمل 1-2",
    description: "جلسة استشارية + تحليل قانوني/تشغيلي مبدئي.",
    badge: "جلسة وتنقيح",
  },
  {
    title: "يوم العمل 2-3",
    description: "تقرير مفصل + قوالب/خطابات جاهزة + توصيات تنفيذ.",
    badge: "تسليم نهائي",
  },
];

const supportCards = [
  {
    title: "دعم فوري",
    description: "قناة محادثة آمنة داخل المنصة مع تنبيهات بريد و SMS.",
    badge: "24/7",
  },
  {
    title: "مشرف حساب",
    description: "متابعة مستمرة وتوجيه لتسريع القرارات.",
    badge: "مخصص",
  },
  {
    title: "لوحة تقارير",
    description: "مؤشرات أداء، زمن استجابة، وتسليمات قابلة للمشاركة.",
    badge: "جاهزة للمدير",
  },
];

const personas = [
  {
    title: "الشركات",
    description: "لوحات، تقارير، وأتمتة التذاكر والمهام مع الامتثال.",
    href: "/pricing",
    cta: "اطلع على الباقات",
    icon: Building2,
  },
  {
    title: "المستشارون",
    description: "جدولة، مدفوعات، ودليل خبراء مع إشعارات تلقائية.",
    href: "/signup/consultant",
    cta: "سجّل كمستشار",
    icon: UserCheck,
  },
  {
    title: "الأفراد",
    description: "استشارات سريعة، خطابات جاهزة، وحاسبات مباشرة.",
    href: "/consulting/book",
    cta: "احجز الآن",
    icon: Users,
  },
];

export default function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100/70 via-blue-50/60 to-white" />
        <div className="container mx-auto px-4 py-14 relative">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                خدمات احترافية بسرعة استجابة
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
                خدمات متكاملة للموارد البشرية
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                  قانونية، تشغيلية، وتعليمية
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                استشارات موثوقة، مراجعات قانونية، ودورات تطبيقية تساعدك على الامتثال،
                رفع الكفاءة، وتقليل المخاطر في بيئة العمل.
              </p>
              <div className="flex flex-wrap gap-3">
                <CTAButton label="احجز استشارة الآن" href="/consulting/book" />
                <CTAButton
                  label="كيف يعمل رابِط؟"
                  href="/consulting/how-to-book"
                  tone="secondary"
                  showIcon={false}
                />
              </div>
              <div className="flex items-center gap-5 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>سياسة سرية صارمة</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span>تقييم 4.9/5 من العملاء</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>فريق مستشارين معتمدين</span>
                </div>
              </div>
            </div>
            <Card className="w-full max-w-md shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  باقات الاستشارات السريعة
                </CardTitle>
                <CardDescription>ثلاث خيارات حسب السرعة والتفصيل</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: "رد خلال 24 ساعة", price: "99 ريال", features: "استشارة نصية + ملخص" },
                  { label: "جلسة صوتية/فيديو 30 دقيقة", price: "149 ريال", features: "توصيات فورية" },
                  { label: "مراجعة مستندات + تقرير", price: "249 ريال", features: "تسليم خلال 48 ساعة" },
                ].map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl border p-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.features}</p>
                    </div>
                    <Badge variant="secondary" className="text-purple-700 bg-purple-50">
                      {item.price}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Consulting routes */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">مسارات منصة الاستشارات</h2>
            <p className="text-muted-foreground">انتقل مباشرة للمسار الأنسب دون فقدان السياق.</p>
          </div>
          <Badge variant="secondary" className="bg-purple-50 text-purple-700">
            محاذاة مع الأدوات والباقات
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {consultingRoutes.map((route) => (
            <Card key={route.title} className="h-full border shadow-sm hover:border-purple-200 transition-colors">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 text-white flex items-center justify-center">
                    <route.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline">{route.badge}</Badge>
                </div>
                <CardTitle className="text-lg">{route.title}</CardTitle>
                <CardDescription>{route.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="px-0 text-purple-700 hover:text-purple-800">
                  <Link href={route.href}>افتح المسار</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tool shortcuts */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">أدوات سريعة للنتائج</h2>
            <p className="text-muted-foreground">حاسبات ومولدات تدعم الخدمات وتغلق الحلقة التنفيذية.</p>
          </div>
          <Badge variant="outline" className="border-dashed">
            مدمجة مع سجل الاستشارات
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {toolShortcuts.map((tool) => (
            <Card key={tool.title} className="border shadow-sm hover:border-purple-200 transition-colors h-full">
              <CardHeader className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                  <tool.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <CTAButton label="ابدأ الآن" href={tool.href} className="w-full" showIcon={false} />
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container mx-auto px-4 pb-10">
        <div className="overflow-hidden rounded-2xl border bg-gradient-to-r from-indigo-50 via-purple-50 to-white shadow-sm">
          <div className="grid md:grid-cols-2">
            <div className="p-8 space-y-3">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-800">
                رحلتك المتصلة
              </Badge>
              <h3 className="text-2xl font-bold text-slate-900">
                ابدأ بالاستشارة، جرّب الأدوات، ثم اختر الباقة المناسبة
              </h3>
              <p className="text-muted-foreground">
                كل خطوة تقودك للتي تليها بدون تعقيد: حجز فوري، أدوات تنفيذ، وباقات مرنة.
              </p>
              <div className="flex flex-wrap gap-3">
                <CTAButton label="احجز استشارة الآن" href="/consulting/book" />
                <CTAButton label="جرب الأدوات" href="/tools" tone="secondary" showIcon={false} />
              </div>
            </div>
            <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center">
              <div className="space-y-3 text-center max-w-xs">
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Shield className="h-4 w-4" />
                  دعم مستشارين معتمدين
                </div>
                <div className="text-3xl font-semibold leading-tight">
                  استشارة + أدوات = تنفيذ أسرع
                </div>
                <p className="text-white/80 text-sm">
                  سجّل قراراتك، حمل الملفات، وتابع التوصيات من مكان واحد.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plan bridges */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">الباقات والتجربة</h2>
            <p className="text-muted-foreground">اختر الباقة أو جرّب الأدوات قبل الاشتراك.</p>
          </div>
          <Badge variant="outline" className="border-dashed">مرنة وقابلة للتوسع</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {planBridges.map((plan) => (
            <Card key={plan.title} className="h-full border shadow-sm hover:border-purple-200 transition-colors">
              <CardHeader className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{plan.badge}</Badge>
                </div>
                <CardTitle className="text-lg">{plan.title}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="px-0 text-purple-700 hover:text-purple-800">
                  <Link href={plan.href}>اطلع على التفاصيل</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Delivery timeline */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">جدول التسليم</h2>
            <p className="text-muted-foreground">مسار واضح من الطلب إلى التسليم النهائي.</p>
          </div>
          <Badge variant="secondary" className="bg-green-50 text-green-700">خلال 3 أيام عمل</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {deliveryTimeline.map((item) => (
            <Card key={item.title} className="border shadow-sm h-full">
              <CardHeader className="space-y-2">
                <Badge variant="outline">{item.badge}</Badge>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Support & reporting */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">دعم وتواصل</h2>
            <p className="text-muted-foreground">تواصل مستمر، مشرف حساب، ولوحة تقارير للمديرين.</p>
          </div>
          <Badge variant="outline" className="border-dashed">جاهز للإدارة</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {supportCards.map((item) => (
            <Card key={item.title} className="border shadow-sm h-full">
              <CardHeader className="space-y-2">
                <Badge variant="secondary">{item.badge}</Badge>
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Personas */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">حلول موجهة حسب الفئة</h2>
            <p className="text-muted-foreground">اختر المسار الأنسب لشركتك أو لفريق الاستشارات أو للاستخدام الفردي.</p>
          </div>
          <Badge variant="outline" className="border-dashed">روابط مباشرة</Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {personas.map((persona) => (
            <Card key={persona.title} className="border shadow-sm h-full hover:border-purple-200 transition-colors">
              <CardHeader className="space-y-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center">
                  <persona.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-lg">{persona.title}</CardTitle>
                <CardDescription>{persona.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="ghost" className="px-0 text-purple-700 hover:text-purple-800">
                  <Link href={persona.href}>{persona.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">مجالات الخدمة</h2>
            <p className="text-muted-foreground">حلول شاملة تغطي الامتثال والتشغيل والتدريب</p>
          </div>
          <Badge variant="outline" className="border-dashed">
            دعم مستمر + تحديثات تشريعية
          </Badge>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "قانون العمل والامتثال", points: ["مراجعة اللوائح", "سياسات داخلية", "تدقيق قرارات الفصل"] },
            { title: "تشغيل الموارد البشرية", points: ["التوظيف والـ ATS", "التذاكر والمهام", "الحاسبات والأدوات"] },
            { title: "التعلم والتطوير", points: ["دورات قصيرة", "اختبارات وتقييم", "شهادات مشاركة"] },
          ].map(item => (
            <Card key={item.title} className="border shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {item.points.map(point => (
                  <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span>{point}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Services grid */}
      <section className="container mx-auto px-4 pb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-900">خدمات جاهزة للتنفيذ</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span>مدعومة بالأدوات الذكية</span>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {services.map(service => (
            <Card key={service.title} className="h-full border shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{service.badge}</Badge>
                  <span className="text-sm text-purple-600 font-semibold">{service.price}</span>
                </div>
                <CardTitle className="text-xl mt-2">{service.title}</CardTitle>
                <CardDescription>{service.description}</CardDescription>
                <p className="text-xs text-muted-foreground bg-slate-50 border border-dashed rounded-xl px-3 py-2 mt-3">
                  {service.scenario}
                </p>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <CTAButton
                  label="اطلب الخدمة"
                  href="/consulting/book"
                  className="flex-1"
                  showIcon={false}
                />
                <Button size="icon" variant="outline" aria-label="استعراض الخدمة">
                  <PlayCircle className="h-5 w-5 text-purple-600" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Steps */}
      <section className="container mx-auto px-4 pb-16">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xl">كيف يعمل رابِط؟</CardTitle>
            <CardDescription>خطوات واضحة من الطلب حتى التسليم</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            {steps.map((step, idx) => (
              <div key={step} className="p-4 rounded-xl bg-slate-50 border">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline">الخطوة {idx + 1}</Badge>
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </div>
                <p className="font-semibold text-slate-900">{step}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
