import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, FileText, PlayCircle, ArrowLeft } from "lucide-react";
import { Footer } from "@/components/Footer";

const courses = [
  {
    id: "hr-compliance",
    title: "الامتثال لنظام العمل السعودي",
    level: "متوسط",
    duration: "6 ساعات",
    lessons: 18,
    videos: 12,
    resources: 6,
    description:
      "دورة شاملة تغطي أحدث تحديثات نظام العمل السعودي، الحقوق والالتزامات، وإجراءات الامتثال.",
    outcomes: [
      "فهم مواد نظام العمل السعودي وتطبيقاتها العملية",
      "صياغة سياسات الموارد البشرية المتوافقة مع النظام",
      "إدارة المخاطر القانونية وتقليل المخالفات",
    ],
    modules: [
      { title: "مقدمة في نظام العمل", duration: "20 دقيقة" },
      { title: "العقود وأنواعها", duration: "35 دقيقة" },
      { title: "الإجازات ونهاية الخدمة", duration: "40 دقيقة" },
      { title: "المخالفات والعقوبات", duration: "25 دقيقة" },
      { title: "قوالب وسياسات جاهزة", duration: "20 دقيقة" },
    ],
  },
  {
    id: "ai-recruiting",
    title: "التوظيف الذكي بالذكاء الاصطناعي",
    level: "متقدم",
    duration: "4 ساعات",
    lessons: 12,
    videos: 10,
    resources: 4,
    description:
      "تعلم كيف تستخدم أدوات الذكاء الاصطناعي في الفرز، المقابلات، وصناعة قرارات توظيف أفضل.",
    outcomes: [
      "تصميم Pipeline توظيف مدعوم بالذكاء الاصطناعي",
      "استخدام تقييمات سلوكية وذكاء اصطناعي للمرشحين",
      "تحسين زمن التوظيف وتحسين جودة التعيين",
    ],
    modules: [
      { title: "مقدمة في AI للتوظيف", duration: "15 دقيقة" },
      { title: "تحليل السير الذاتية تلقائياً", duration: "25 دقيقة" },
      { title: "مقابلات فيديو ذكية", duration: "30 دقيقة" },
      { title: "قياس الأداء وتجربة المرشح", duration: "25 دقيقة" },
    ],
  },
];

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const course = useMemo(
    () => courses.find(c => c.id === id),
    [id]
  );

  if (!course) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-3">الدورة غير موجودة</h1>
          <p className="text-muted-foreground mb-6">
            لم نعثر على الدورة المطلوبة. يمكنك العودة لقائمة الدورات.
          </p>
          <Link href="/courses">
            <Button className="gradient-primary text-white">قائمة الدورات</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex flex-col">
      <div className="container py-10 flex-1">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/courses">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">الدورات التدريبية</p>
            <h1 className="text-3xl font-bold">{course.title}</h1>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Course overview */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{course.level}</Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{course.title}</CardTitle>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {course.description}
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid sm:grid-cols-3 gap-3">
                <Info stat={`${course.lessons}`} label="دروس" />
                <Info stat={`${course.videos}`} label="فيديو" />
                <Info stat={`${course.resources}`} label="مواد مساعدة" />
              </div>

              <div>
                <h3 className="font-semibold mb-2">نتائج التعلم</h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {course.outcomes.map(outcome => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">محتوى الدورة</h3>
                <div className="space-y-2">
                  {course.modules.map((module, idx) => (
                    <div
                      key={module.title}
                      className="flex items-center justify-between rounded-md border p-3 bg-white"
                    >
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="rounded-full">
                          {idx + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{module.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {module.duration}
                          </p>
                        </div>
                      </div>
                      <PlayCircle className="h-5 w-5 text-primary" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Enroll card */}
          <Card>
            <CardHeader>
              <CardTitle>اشترك في الدورة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 rounded-lg p-4 border">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <FileText className="h-4 w-4" />
                  شهادة إتمام معتمدة
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  وصول مدى الحياة للمحتوى
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold">تقدم التعلم</p>
                <Progress value={20} />
                <p className="text-xs text-muted-foreground">ابدأ اليوم وحقق تقدمك الأول</p>
              </div>

              <Button className="w-full gradient-primary text-white">
                ابدأ الآن
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/courses">عودة للدورات</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Info({ stat, label }: { stat: string; label: string }) {
  return (
    <div className="rounded-md border p-3 text-center bg-white">
      <p className="text-2xl font-bold">{stat}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
