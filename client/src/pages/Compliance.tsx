import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, CheckCircle2, Lock, Globe2 } from "lucide-react";

export default function Compliance() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 py-12">
      <div className="container space-y-8 px-4">
        <div className="space-y-3 text-center max-w-3xl mx-auto">
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
            الامتثال والأمان
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
            حماية البيانات والامتثال التشريعي في رابِط
          </h1>
          <p className="text-lg text-muted-foreground">
            سياسات أمنية وقانونية واضحة، مع التزام بمعايير ISO 27001 و SOC 2 وخصوصية البيانات في المملكة.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[{
            title: "ISO 27001 & SOC 2",
            desc: "نستهدف التوافق الكامل مع معايير إدارة أمن المعلومات والضوابط الداخلية.",
            icon: Shield,
          }, {
            title: "خصوصية البيانات",
            desc: "عدم استخدام البيانات للتدريب على النماذج وحفظ المستندات داخل حساب المستخدم.",
            icon: Lock,
          }, {
            title: "تجزئة المناطق",
            desc: "خيارات data_region: sa-gcc | eu | us وفق متطلبات العميل.",
            icon: Globe2,
          }].map(item => (
            <Card key={item.title} className="h-full">
              <CardContent className="p-5 space-y-3">
                <item.icon className="h-10 w-10 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              سياسات واضحة
            </CardTitle>
            <CardDescription>مختصر لأهم البنود القانونية والأمنية في المنصة</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                مصادقة ثنائية وإدارة الجلسات النشطة.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                سجل تدقيق شامل لجميع العمليات الحساسة.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                تشفير الاتصالات HTTPS و Webhook verification.
              </li>
            </ul>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                سياسة خصوصية للذكاء الاصطناعي مع human-in-the-loop.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                إدارة ملفات تعريف الارتباط (Cookie Consent) وربط بالسياسات.
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                حماية من المعدل (Rate Limiting) للـ API والدفعات والوثائق.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
