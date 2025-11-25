import { Link, useRoute } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Sparkles, ArrowRight } from "lucide-react";

const tours: Record<
  string,
  {
    title: string;
    description: string;
    cta: { label: string; href: string };
    steps: { title: string; detail: string }[];
    tags: string[];
  }
> = {
  company: {
    title: "جولة الشركة السريعة",
    description: "ابدأ بـ ATS، الموظفين، والسياسات مع تنبيهات الامتثال.",
    cta: { label: "ابدأ من لوحة الشركة", href: "/dashboard" },
    steps: [
      { title: "1) إنشاء وظيفة سريعة", detail: "نشر وظيفة، دعوة مرشحين، وجدولة مقابلة تلقائياً." },
      { title: "2) إعداد السياسات", detail: "حمّل سياساتك أو استخدم النماذج الجاهزة المتوافقة مع نظام العمل." },
      { title: "3) التذكيرات والتنبيهات", detail: "فعّل التذكير بمواعيد العقود والإجازات والأجور." },
    ],
    tags: ["ATS", "سياسات", "تنبيهات الامتثال"],
  },
  employee: {
    title: "جولة الموظف",
    description: "الوصول السريع للحاسبات، الخطابات، والإشعارات.",
    cta: { label: "انتقل للوحة الموظف", href: "/employee/dashboard" },
    steps: [
      { title: "1) الحاسبات", detail: "استخدم حاسبة نهاية الخدمة والإجازات فوراً." },
      { title: "2) الخطابات", detail: "أنشئ خطاب تعريف أو تحويل بنقرة." },
      { title: "3) الإشعارات", detail: "فعّل تنبيهات الرواتب والإجازات." },
    ],
    tags: ["حاسبات", "خطابات", "إشعارات"],
  },
  consultant: {
    title: "جولة المستشار",
    description: "اضبط التوفر، الحزم، و SLA لتحسين الحجوزات.",
    cta: { label: "لوحة المستشار", href: "/consultant-dashboard" },
    steps: [
      { title: "1) التوفر", detail: "فعّل الأيام والساعات المناسبة وتجنب التداخل." },
      { title: "2) الحزم وSLA", detail: "حدد الرد الأول والتسليم والاسترجاع، وأسعار الحزم." },
      { title: "3) المتابعة", detail: "راجع الدردشة والتذاكر مع إشعارات فورية." },
    ],
    tags: ["التوفر", "SLA", "حجوزات"],
  },
  admin: {
    title: "جولة الأدمن",
    description: "إدارة المستخدمين، الاشتراكات، وسجل التدقيق.",
    cta: { label: "انتقل للوحة الأدمن", href: "/admin" },
    steps: [
      { title: "1) الحوكمة", detail: "راجع الصلاحيات وسجل التدقيق." },
      { title: "2) الاشتراكات", detail: "تتبع المدفوعات، الأكواد، والاستردادات." },
      { title: "3) الأمن", detail: "راقب الحوادث وطلبات البيانات (PDPL)." },
    ],
    tags: ["صلاحيات", "اشتراكات", "أمن"],
  },
};

export default function GuidedTour() {
  const [, params] = useRoute("/guided/:role");
  const role = params?.role ?? "company";
  const tour = tours[role] ?? tours.company;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="container py-12">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="h-6 w-6 text-purple-600" />
          <p className="text-sm text-muted-foreground">
            جولة موجهة بحسب الدور — يمكن تفعيلها أثناء التسجيل أو لاحقاً
          </p>
        </div>

        <Card className="p-8 shadow-lg border-purple-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{tour.title}</h1>
              <p className="text-muted-foreground">{tour.description}</p>
            </div>
            <Link href={tour.cta.href}>
              <Button className="gap-2">
                {tour.cta.label}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap gap-2 mb-6">
            {tour.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {tour.steps.map(step => (
              <Card key={step.title} className="p-4 border-dashed border-purple-200">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-1" />
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="text-sm text-muted-foreground mt-1">{step.detail}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
