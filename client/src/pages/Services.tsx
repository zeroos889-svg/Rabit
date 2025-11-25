import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, PlayCircle, Shield, Sparkles, Star, Users } from "lucide-react";
import { Link } from "wouter";

const services = [
  {
    title: "الاستشارات القانونية",
    description: "ردود موثوقة خلال 24 ساعة مع ملخص تنفيذي وخطوات تنفيذ واضحة.",
    badge: "قانون العمل السعودي",
    price: "ابتداءً من 99 ريال",
  },
  {
    title: "مراجعة العقود",
    description: "تدقيق عقود العمل واللوائح الداخلية وضمان التوافق مع لوائح الوزارة.",
    badge: "توافق وتشريعات",
    price: "ابتداءً من 249 ريال",
  },
  {
    title: "تدقيق قرارات الفصل",
    description: "تحليل المخاطر القانونية قبل الفصل مع توصيات بديلة وسيناريوهات تعويض.",
    badge: "مؤشر قانوني",
    price: "تسليم خلال 48 ساعة",
  },
  {
    title: "التوظيف الذكي (ATS)",
    description: "إدارة الرحلة الكاملة للمرشح من التقديم حتى العرض مع توصيات AI.",
    badge: "ذكاء اصطناعي",
    price: "مدمج في الباقة",
  },
  {
    title: "الأدوات الذكية HR",
    description: "حاسبات نهاية الخدمة والإجازات والرواتب مع حفظ السجلات والتقارير.",
    badge: "أتمتة",
    price: "مدمج في الباقة",
  },
  {
    title: "التدريب والدورات",
    description: "مسارات تعليمية لنظام العمل، التوظيف، الامتثال، والتحقيقات الداخلية.",
    badge: "مسارات جاهزة",
    price: "مسارات قصيرة ومكثفة",
  },
];

const steps = [
  "اختر الخدمة المناسبة",
  "حدّد الموعد أو أرسل المستندات",
  "استلم التحليل والتوصيات",
  "طبّق الخطوات بمتابعة المستشار",
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
                <Link href="/consulting/book">
                  <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600">
                    احجز استشارة الآن
                  </Button>
                </Link>
                <Link href="/consulting/how-to-book">
                  <Button size="lg" variant="outline">
                    كيف يعمل رابِط؟
                  </Button>
                </Link>
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
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <Button variant="ghost" asChild>
                  <Link href="/consulting/book">اطلب الخدمة</Link>
                </Button>
                <Button size="icon" variant="outline">
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
