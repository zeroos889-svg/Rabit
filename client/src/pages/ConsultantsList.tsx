import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const placeholderConsultants = [
  {
    id: "1",
    name: "سارة العتيبي",
    specialty: "موارد بشرية",
    blurb: "خبرة 10 سنوات في تطوير الاستراتيجيات وعمليات التوظيف.",
  },
  {
    id: "2",
    name: "أحمد الغامدي",
    specialty: "تحول رقمي",
    blurb: "يساعد الشركات على اعتماد أنظمة الموارد البشرية السحابية.",
  },
  {
    id: "3",
    name: "نورة الشهري",
    specialty: "قانون عمل",
    blurb: "تقدم استشارات الامتثال واللوائح السعودية.",
  },
  {
    id: "4",
    name: "عبدالله الحربي",
    specialty: "تحليلات بيانات",
    blurb: "يُحسّن قرارات الموارد البشرية بالاعتماد على لوحات بيانات فورية.",
  },
];

export default function ConsultantsList() {
  return (
    <section className="mx-auto max-w-5xl space-y-6 px-6 py-10">
      <header className="space-y-2 text-center">
        <p className="text-sm font-semibold text-primary">الاستشاريون</p>
        <h1 className="text-3xl font-bold">التواصل مع نخبة الخبراء</h1>
        <p className="text-muted-foreground">
          هذه قائمة مؤقتة للتجربة. سيتم استبدالها ببيانات حقيقية من واجهة برمجة
          التطبيقات عند ربط الواجهة الخلفية.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {placeholderConsultants.map(consultant => (
          <Card key={consultant.id}>
            <CardHeader>
              <CardTitle className="text-xl">{consultant.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p className="font-medium">التخصص: {consultant.specialty}</p>
              <p className="text-muted-foreground">{consultant.blurb}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
