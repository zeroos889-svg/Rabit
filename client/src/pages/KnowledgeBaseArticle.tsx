import { useMemo } from "react";
import { useParams, Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, BookOpen } from "lucide-react";
import { Footer } from "@/components/Footer";

const articles = [
  {
    id: "eos-article-84",
    title: "كيفية احتساب مكافأة نهاية الخدمة وفق المادة 84",
    category: "الحسابات والمستحقات",
    readTime: "8 دقائق",
    summary:
      "إرشادات عملية لحساب مكافأة نهاية الخدمة بدقة مع أمثلة وحالات خاصة موضّحة.",
    content: [
      "تلتزم المنشآت بحساب مكافأة نهاية الخدمة وفق المادة 84 من نظام العمل السعودي، بحيث يُحسب نصف راتب عن كل سنة من السنوات الخمس الأولى، وراتب كامل عن كل سنة بعدها.",
      "يُستحق الموظف المكافأة عند انتهاء العلاقة العمالية بما فيها الاستقالة أو الفصل غير المشروع. في حال الاستقالة قبل خمس سنوات تُخفض النسبة حسب المدة.",
      "يجب احتساب الأجر الشامل (الراتب الأساسي + البدلات الثابتة) عند حساب المكافأة، مع توثيق جميع المكونات الحسابية لضمان الامتثال.",
    ],
  },
  {
    id: "saudi-labor-updates",
    title: "تحديثات نظام العمل السعودي 2024",
    category: "نظام العمل السعودي",
    readTime: "12 دقيقة",
    summary:
      "أبرز التعديلات الجديدة في نظام العمل وكيفية مواءمة سياسات الموارد البشرية معها.",
    content: [
      "التعديلات الأخيرة ركزت على مرونة العمل عن بُعد وساعات العمل، مع تشديد على توثيق الاتفاقيات الإضافية.",
      "إدخال آليات أسرع لتسوية النزاعات العمالية وتشجيع التسويات المبكرة لتقليل المخاطر على المنشآت.",
      "ضرورة تحديث اللوائح الداخلية وسياسات الشركة لتعكس التعديلات، مع تدريب المدراء على التحديثات لضمان التطبيق السليم.",
    ],
  },
  {
    id: "hybrid-work-policy",
    title: "كيف تطبق سياسة عمل هجين متوافقة",
    category: "تشغيل HR",
    readTime: "9 دقائق",
    summary:
      "وصفة سريعة لصياغة سياسة عمل هجين تشمل ساعات العمل، الحضور، الأمن، والخصوصية.",
    content: [
      "حدد نطاق العمل الهجين بوضوح: عدد الأيام من المكتب، جداول العمل، وآلية الموافقة على التغييرات الاستثنائية.",
      "استخدم نظام حضور يدعم العمل الهجين (سجل دخول/خروج)، مع توثيق مواقع العمل للحفاظ على الامتثال والتأمين.",
      "أضف ضوابط الأمن والخصوصية: استخدام VPN، حماية الأجهزة، ومنع مشاركة الحسابات. عرّف إجراءات الإبلاغ عن الأعطال الأمنية.",
      "ضمن السياسة بنود الأداء: مخرجات أسبوعية، اجتماعات مراجعة، ومؤشرات قياس الإنتاجية، لضمان العدالة بين فرق المكتب والعمل عن بُعد.",
    ],
  },
  {
    id: "onboarding-30-days",
    title: "برنامج تأهيلي للموظفين الجدد خلال 30 يوماً",
    category: "تشغيل HR",
    readTime: "7 دقائق",
    summary:
      "خريطة طريق بأهداف أسبوعية لتسريع إنتاجية الموظف الجديد وتقليل الاستقالات المبكرة.",
    content: [
      "أسبوع 1: تجهيز الحسابات والأدوات، جلسة تعريف بالقيم والثقافة، وتعيين موجه (Buddy) لكل موظف جديد.",
      "أسبوع 2: تدريب عملي على العمليات اليومية، مهام صغيرة قابلة للإنجاز، ومراجعة نهاية أسبوع لتقييم الدعم المطلوب.",
      "أسبوع 3: مهام أعلى تأثيراً مع مسؤولية واضحة، تقديم تغذية راجعة ثنائية الاتجاه، وتحديث خطة الشهر الأول.",
      "أسبوع 4: قياس الأثر (OKRs/نتائج), توقيع الاستلام على السياسات، وجدولة خطة التطوير الفردية للأشهر الثلاثة التالية.",
    ],
  },
  {
    id: "ex-data-journey",
    title: "استخدام البيانات لتحسين تجربة الموظف (EX)",
    category: "تجربة الموظف",
    readTime: "6 دقائق",
    summary:
      "كيفية جمع بيانات نبض الموظف وتحويلها إلى قرارات قابلة للتنفيذ.",
    content: [
      "ابدأ بقياس نبض الموظف بأسئلة قصيرة ومتكررة (Pulse) بدلاً من استبيانات طويلة; ركّز على الأمان النفسي، الحمل الوظيفي، والتمكين.",
      "حلل البيانات حسب الفريق/الدور مع حماية الخصوصية (حد أدنى لعدد الردود)، وحدد مواضيع مكررة تظهر في أكثر من 20% من الإجابات.",
      "حوّل النتائج إلى خطط عمل صغيرة بجدول زمني واضح (مثل تحسين الاجتماعات أو وضوح الأدوار) وشارك التقدم مع الفريق لتعزيز الثقة.",
    ],
  },
  {
    id: "video-interviews",
    title: "مقابلات الفيديو: خطوات لضمان عدالة واتساق",
    category: "التوظيف",
    readTime: "5 دقائق",
    summary:
      "أسئلة موحدة، تقييم موضوعي، ونصائح لحماية خصوصية المرشحين في المقابلات عن بعد.",
    content: [
      "استخدم بنك أسئلة موحد لكل دور وظيفي مع معايير تقييم رقمية (مثلاً 1-5) لتقليل التحيز بين المقابلين.",
      "أبلغ المرشح بوضوح عن التسجيل، الغرض، وكيفية تخزين البيانات، واطلب موافقة صريحة قبل بدء المقابلة.",
      "فصل الهوية عن التقييم قدر الإمكان: راجع الإجابات أو التسجيلات بدون معلومات شخصية قدر الإمكان لتقليل التحيز اللاواعي.",
    ],
  },
  {
    id: "leave-entitlements",
    title: "دليل الإجازات: سنوية، مرضية، أمومة، حج",
    category: "نظام العمل السعودي",
    readTime: "10 دقائق",
    summary:
      "أهم أنواع الإجازات في المملكة وطريقة حساب الرصيد والاستحقاق وفق النظام.",
    content: [
      "الإجازة السنوية: 21 يوماً مدفوعة الأجر تزيد إلى 30 يوماً بعد 5 سنوات خدمة، مع أجر كامل يحسب على الراتب الشامل.",
      "الإجازة المرضية: 30 يوماً بأجر كامل، ثم 60 يوماً بثلاثة أرباع الأجر، ثم 30 يوماً دون أجر، خلال سنة واحدة.",
      "إجازة الأمومة: 10 أسابيع يمكن تفصيلها قبل/بعد الولادة، مع استحقاق الأجر الكامل أو نصفه حسب مدة الخدمة.",
      "إجازة الحج مرة واحدة بعد قضاء سنتين خدمة، مدتها تتراوح بين 10 إلى 15 يوماً وفق النظام ولوائح المنشأة.",
    ],
  },
];

export default function KnowledgeBaseArticle() {
  const { id } = useParams<{ id: string }>();
  const article = useMemo(
    () => articles.find(item => item.id === id),
    [id]
  );

  if (!article) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="container py-12 text-center">
          <h1 className="text-3xl font-bold mb-3">المقالة غير موجودة</h1>
          <p className="text-muted-foreground mb-6">
            لم نعثر على المقالة المطلوبة. يمكنك العودة لقاعدة المعرفة.
          </p>
          <Link href="/knowledge-base">
            <Button className="gradient-primary text-white">عودة لقاعدة المعرفة</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 flex flex-col">
      <a
        href="#kb-content"
        className="sr-only focus:not-sr-only focus:text-blue-700 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow"
      >
        تخطي إلى المحتوى الرئيسي
      </a>
      <main id="kb-content" className="container py-10 flex-1" role="main" aria-label="مقالة قاعدة المعرفة">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/knowledge-base">
            <Button variant="ghost" size="icon" aria-label="عودة لقاعدة المعرفة">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">قاعدة المعرفة</p>
            <h1 className="text-3xl font-bold">{article.title}</h1>
          </div>
        </div>

        <Card>
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{article.category}</Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="h-4 w-4" />
                {article.readTime}
              </Badge>
            </div>
            <CardTitle className="text-xl">{article.summary}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 leading-relaxed text-muted-foreground">
            {article.content.map(paragraph => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <div className="flex items-center gap-2 text-sm text-blue-600">
              <BookOpen className="h-4 w-4" />
              <span>محدث وفق نظام العمل السعودي</span>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
