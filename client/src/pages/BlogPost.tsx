import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ChevronLeft,
  Calendar,
  Clock,
  User,
  Share2,
  Bookmark,
  ThumbsUp,
  MessageCircle,
  Facebook,
  Twitter,
  Linkedin,
} from "lucide-react";
import { Link, useParams } from "wouter";
import { Footer } from "@/components/Footer";

// Mock blog posts data (aligned with Blog.tsx)
const blogPosts = [
  {
    id: "1",
    title: "دليلك الشامل لحساب نهاية الخدمة وفق نظام العمل السعودي 2024",
    excerpt:
      "تعرف على كيفية حساب مكافأة نهاية الخدمة بشكل صحيح وفق المادة 84 من نظام العمل السعودي، مع أمثلة عملية وحالات خاصة.",
    content: `
## نظرة سريعة
المادة 84 تنص على نصف راتب عن كل سنة من السنوات الخمس الأولى، وراتب كامل عن كل سنة بعدها. الأجر الشامل هو الأساس للحساب.

## خطوات مختصرة
1) اجمع الأجر الشامل (أساسي + بدلات ثابتة).
2) احسب نصف راتب × عدد السنوات لأول خمس سنوات.
3) احسب راتب كامل × السنوات بعد السنة الخامسة.
4) طبّق نسب الاستقالة إن وجدت (ثلث/ثلثين/كامل حسب المدة).

## حالات خاصة
الاستقالة قبل سنتين لا تمنح المكافأة؛ بعد 5 سنوات ثلثيها؛ بعد 10 سنوات كاملة. الفصل النظامي يستثنى حسب المادة 80.`,
    category: "نظام العمل",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-01-15",
    readTime: "8 دقائق",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
    featured: true,
    likes: 245,
    comments: 32,
  },
  {
    id: "2",
    title: "10 أخطاء شائعة في إدارة الموارد البشرية وكيفية تجنبها",
    excerpt:
      "اكتشف الأخطاء الأكثر شيوعاً التي تقع فيها أقسام الموارد البشرية وتعلم كيفية تجنبها لتحسين كفاءة فريقك.",
    content: `
## أبرز الأخطاء
- تأخير تحديث اللوائح الداخلية مع التغيرات النظامية.
- اعتماد قرارات بلا بيانات أداء أو مؤشرات رضا الموظفين.
- مقابلات غير موحدة تؤدي لتحيزات في الاختيار.

## كيف تتجنبها
اعتمد سياسات محدثة، أسئلة موحدة للتوظيف، ولوحة مؤشرات شهرية (دوران، رضا، زمن التوظيف). عزز التواصل والتوثيق الرقمي للقرارات.`,
    category: "نصائح HR",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-01-12",
    readTime: "6 دقائق",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
    featured: true,
    likes: 210,
    comments: 18,
  },
  {
    id: "3",
    title: "كيف تبني نظام توظيف فعال باستخدام ATS",
    excerpt:
      "خطوات عملية لبناء نظام تتبع المتقدمين (ATS) يوفر وقتك ويساعدك في اختيار أفضل المرشحين لشركتك.",
    content: `
ابدأ بتعريف المراحل (تقديم، فرز، مقابلات، عرض وظيفي) وحدد معايير قبول/رفض واضحة.
استخدم أسئلة موحدة وتقييم عددي، وأتمتة الردود ورسائل المواعيد.
تابع زمن التوظيف ونسبة القبول لتحسين الإعلانات والقنوات.`,
    category: "التوظيف",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-01-10",
    readTime: "10 دقائق",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop",
    featured: true,
    likes: 180,
    comments: 14,
  },
  {
    id: "4",
    title: "التحديثات الجديدة في نظام العمل السعودي لعام 2024",
    excerpt:
      "ملخص شامل لأهم التعديلات والتحديثات على نظام العمل السعودي وتأثيرها على الشركات والموظفين.",
    content: `
تغييرات 2024 ركزت على العمل الهجين، وضوابط الحضور، وتسوية المنازعات.
راجِع لوائحك الداخلية، حدّث عقود العمل، ودرب المدراء على المتطلبات الجديدة.
التطبيق المسبق يقلل المخاطر ويجنب الغرامات.`,
    category: "أخبار",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-01-08",
    readTime: "7 دقائق",
    image:
      "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop",
    featured: false,
    likes: 130,
    comments: 9,
  },
  {
    id: "5",
    title: "أنواع الإجازات في نظام العمل السعودي وكيفية حسابها",
    excerpt:
      "دليل مفصل لجميع أنواع الإجازات المتاحة للموظفين في السعودية وطريقة احتسابها وفق النظام.",
    content: `
الإجازة السنوية: 21 يوماً بأجر كامل (30 بعد 5 سنوات).
الإجازة المرضية: 30 يوماً بأجر كامل ثم 60 بثلاثة أرباع الأجر ثم 30 دون أجر.
إجازة الأمومة 10 أسابيع؛ وإجازة الحج مرة واحدة بعد سنتين خدمة.`,
    category: "نظام العمل",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-01-05",
    readTime: "9 دقائق",
    image:
      "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=400&fit=crop",
    featured: false,
    likes: 165,
    comments: 12,
  },
  {
    id: "6",
    title: "كيف تكتب خطاب توظيف احترافي يجذب أفضل المواهب",
    excerpt:
      "نصائح عملية وأمثلة لكتابة خطابات توظيف فعالة تعكس احترافية شركتك وتجذب المرشحين المميزين.",
    content: `
استخدم لغة واضحة ومختصرة، أظهر أثر الوظيفة، واذكر نطاق الرواتب لو أمكن.
أضف نقاط تميّز الشركة (ثقافة، مزايا، نمو)، وروابط لملف الشركة.
اختتم بخطوة واضحة للتقديم وجدول زمني للتواصل.`,
    category: "التوظيف",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-01-03",
    readTime: "5 دقائق",
    image:
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
    featured: false,
    likes: 120,
    comments: 7,
  },
  {
    id: "7",
    title: "استراتيجيات فعالة لتحسين رضا الموظفين والاحتفاظ بهم",
    excerpt:
      "تعرف على أفضل الممارسات والاستراتيجيات التي تساعدك في بناء بيئة عمل إيجابية وتقليل معدل دوران الموظفين.",
    content: `
ركّز على الوضوح الوظيفي، مرونة العمل، والتقدير المتكرر.
تابع مؤشرات الرضا ودوران الموظفين شهرياً، وضع خطط عمل قصيرة لمعالجة أي تراجع.
فعل الاستبيانات النبضية ونقاشات 1:1 منتظمة.`,
    category: "الإدارة",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-01-01",
    readTime: "8 دقائق",
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
    featured: false,
    likes: 140,
    comments: 10,
  },
  {
    id: "8",
    title: "الذكاء الاصطناعي في الموارد البشرية: الحاضر والمستقبل",
    excerpt:
      "كيف يغير الذكاء الاصطناعي مجال الموارد البشرية وما هي الأدوات التي يمكنك استخدامها اليوم.",
    content: `
التصنيف الآلي للسير الذاتية، تلخيص المقابلات، وتوليد سياسات أولية هي أسرع مكاسب AI اليوم.
ابدأ بحالات استخدام منخفضة المخاطر ودرّب الفريق على ضوابط الخصوصية وجودة المخرجات.`,
    category: "نصائح HR",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2023-12-28",
    readTime: "11 دقيقة",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
    featured: false,
    likes: 190,
    comments: 15,
  },
  {
    id: "9",
    title: "حقوق الموظف عند إنهاء العقد: ما يجب أن تعرفه",
    excerpt:
      "دليل شامل لحقوق الموظف القانونية عند إنهاء عقد العمل، سواء كان الإنهاء من الموظف أو صاحب العمل.",
    content: `
الإنهاء المشروع يتطلب إشعاراً، مستحقات الإجازات، ومكافأة نهاية الخدمة. الفصل التأديبي له شروط محددة بالمادة 80.
يُنصح بتوثيق الإنهاء وخيارات التسوية الودية لتقليل المخاطر.`,
    category: "نظام العمل",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2023-12-25",
    readTime: "7 دقائق",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
    featured: false,
    likes: 125,
    comments: 8,
  },
  {
    id: "10",
    title: "بناء برنامج تأهيلي للموظفين الجدد خلال 30 يوماً",
    excerpt:
      "خطة عملية لتصميم برنامج Onboarding يقلل معدل الاستقالات المبكرة ويرفع سرعة الإنتاجية للموظفين الجدد.",
    content: `
قسّم الشهر إلى أسابيع: تجهيز الأدوات، تعريف الثقافة، مهام تدريجية، ثم قياس الأثر.
عين موجهاً لكل موظف جديد، وحدد أهداف أسبوعية واضحة ومؤشرات نجاح.`,
    category: "الإدارة",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-02-02",
    readTime: "6 دقائق",
    image:
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&h=400&fit=crop",
    featured: false,
    likes: 110,
    comments: 6,
  },
  {
    id: "11",
    title: "كيف تطبق سياسة عمل هجين متوافقة مع نظام العمل السعودي",
    excerpt:
      "إرشادات لصياغة سياسة العمل الهجين، وضبط ساعات العمل، وتتبع الحضور بما يضمن الامتثال والمرونة.",
    content: `
عرّف عدد أيام المكتب والعمل عن بُعد، وآلية التناوب.
استخدم نظام حضور يدعم المواقع المتعددة، وحدد قواعد الأمن والخصوصية للأجهزة والبيانات.
وثّق الاتفاقيات الإضافية وحدث اللوائح الداخلية.`,
    category: "نظام العمل",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-02-10",
    readTime: "8 دقائق",
    image:
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop",
    featured: false,
    likes: 115,
    comments: 7,
  },
  {
    id: "12",
    title: "استخدام البيانات لتحسين تجربة الموظف (EX) في 2024",
    excerpt:
      "مؤشرات رئيسية ونصائح عملية لجمع وتحليل بيانات تجربة الموظف لتحسين الرضا والاحتفاظ بالمواهب.",
    content: `
ابدأ باستبيانات نبض قصيرة، حلل النتائج حسب الفرق مع حماية الخصوصية.
حوّل النتائج لخطط عمل صغيرة (اجتماعات فعالة، وضوح الأدوار)، وشارك التقدم مع الفريق.`,
    category: "نصائح HR",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-02-18",
    readTime: "7 دقائق",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&h=400&fit=crop",
    featured: true,
    likes: 150,
    comments: 9,
  },
  {
    id: "13",
    title: "مقابلات الفيديو: دليل سريع لإجراءات عادلة ومتسقة",
    excerpt:
      "خطوات إعداد أسئلة موحّدة، تقييم موضوعي، وتعليمات خصوصية عند استخدام المقابلات عبر الفيديو.",
    content: `
ثبّت أسئلة موحدة ومعايير تقييم رقمية، وأبلغ المرشح عن التسجيل والحفظ.
قلل التحيز بمراجعة الإجابات دون معلومات شخصية قدر الإمكان، واحفظ التسجيلات بمدة محددة وسياسة خصوصية واضحة.`,
    category: "التوظيف",
    author: "فريق رابِط",
    authorRole: "فريق المحتوى",
    date: "2024-02-22",
    readTime: "5 دقائق",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&h=400&fit=crop",
    featured: false,
    likes: 105,
    comments: 5,
  },
];

export default function BlogPost() {
  const params = useParams();
  const postId = params.id;

  const post = blogPosts.find(p => p.id === postId);
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">المقال غير موجود</h1>
          <Link href="/blog">
            <Button>العودة للمدونة</Button>
          </Link>
        </div>
      </div>
    );
  }

  const relatedPosts = blogPosts
    .filter(p => p.id !== postId && p.category === post.category)
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/blog">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <Link href="/">
              <span className="text-2xl font-bold gradient-text">رابِط</span>
            </Link>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setBookmarked(!bookmarked)}
          >
            <Bookmark
              className={`h-4 w-4 ${bookmarked ? "fill-current" : ""}`}
            />
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Article */}
      <article className="py-12 px-4">
        <div className="container max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Badge className="mb-4">{post.category}</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {post.title}
            </h1>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-6 text-muted-foreground mb-8">
              <div className="flex items-center gap-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`}
                  />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold text-foreground">
                    {post.author}
                  </div>
                  <div className="text-sm">{post.authorRole}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.date).toLocaleDateString("ar-SA")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Featured Image */}
            <div className="rounded-xl overflow-hidden mb-8">
              <img
                src={post.image}
                alt={post.title}
                className="w-full h-96 object-cover"
                loading="lazy"
                decoding="async"
                width={1200}
                height={500}
                sizes="(min-width: 1024px) 1024px, 100vw"
              />
            </div>
          </div>

          {/* Content */}
          <Card className="mb-8">
            <CardContent className="pt-8 prose prose-lg max-w-none text-right">
              <div
                className="leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: post.content.replace(/\n/g, "<br/>"),
                }}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant={liked ? "default" : "outline"}
                    onClick={() => setLiked(!liked)}
                    className="gap-2"
                  >
                    <ThumbsUp
                      className={`h-4 w-4 ${liked ? "fill-current" : ""}`}
                    />
                    {post.likes + (liked ? 1 : 0)}
                  </Button>
                  <Button variant="outline" className="gap-2">
                    <MessageCircle className="h-4 w-4" />
                    {post.comments}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground ml-2">
                    مشاركة:
                  </span>
                  <Button variant="outline" size="icon">
                    <Facebook className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Twitter className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Linkedin className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Author Bio */}
          <Card className="mb-8 bg-gradient-to-br from-blue-50 to-purple-50 border-0">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${post.author}`}
                  />
                  <AvatarFallback>{post.author[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{post.author}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {post.authorRole}
                  </p>
                  <p className="text-sm leading-relaxed">
                    {post.authorRole === "خبير موارد بشرية"
                      ? "خبير في مجال الموارد البشرية مع أكثر من 10 سنوات من الخبرة في تطبيق أنظمة العمل السعودية."
                      : "فريق رابِط للمحتوى يقدم أدلة عملية ونصائح تطبيقية للامتثال وتحسين تجربة الموظف."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Related Posts */}
          {relatedPosts.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold mb-6">مقالات ذات صلة</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {relatedPosts.map(relatedPost => (
                  <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                      <div className="aspect-video overflow-hidden">
                        <img
                          src={relatedPost.image}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                          loading="lazy"
                          decoding="async"
                          width={640}
                          height={360}
                          sizes="(min-width: 1024px) 50vw, 100vw"
                        />
                      </div>
                      <CardContent className="pt-4">
                        <Badge className="mb-2">{relatedPost.category}</Badge>
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {relatedPost.author}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {relatedPost.readTime}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>

      {/* Footer */}
      <Footer />
    </div>
  );
}
