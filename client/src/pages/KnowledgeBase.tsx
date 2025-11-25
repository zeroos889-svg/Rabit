import { useMemo, useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";
import {
  Search,
  BookOpen,
  Sparkles,
  Scale,
  Users,
  ShieldCheck,
  Clock,
  FileText,
  Laptop,
  ClipboardList,
  ArrowLeft,
  Calculator,
} from "lucide-react";

type Article = {
  id: string;
  title: string;
  summary: string;
  category: string;
  categoryName: string;
  tags: string[];
  readTime: string;
  updatedAt: string;
  featured?: boolean;
};

const categories = [
  {
    id: "all",
    name: "الكل",
    description: "كل المقالات والأدلة",
    icon: BookOpen,
    color: "from-blue-500 to-purple-600",
  },
  {
    id: "labor-law",
    name: "نظام العمل",
    description: "إرشادات الامتثال",
    icon: Scale,
    color: "from-purple-500 to-pink-600",
  },
  {
    id: "hr-ops",
    name: "تشغيل HR",
    description: "إجراءات وسياسات",
    icon: ClipboardList,
    color: "from-emerald-500 to-teal-600",
  },
  {
    id: "recruitment",
    name: "التوظيف",
    description: "ممارسات وأدوات جذب المواهب",
    icon: Users,
    color: "from-orange-500 to-amber-600",
  },
  {
    id: "experience",
    name: "تجربة الموظف",
    description: "EX ورضا الموظفين",
    icon: Sparkles,
    color: "from-pink-500 to-rose-600",
  },
];

const articles: Article[] = [
  {
    id: "eos-article-84",
    title: "كيفية احتساب مكافأة نهاية الخدمة وفق المادة 84",
    summary: "خطوات عملية لحساب مكافأة نهاية الخدمة مع حالات خاصة وأمثلة رقمية.",
    category: "labor-law",
    categoryName: "نظام العمل",
    tags: ["مستحقات", "مادة 84", "حسابات"],
    readTime: "8 دقائق",
    updatedAt: "فبراير 2024",
    featured: true,
  },
  {
    id: "saudi-labor-updates",
    title: "أبرز تحديثات نظام العمل السعودي 2024",
    summary: "ملخص سريع للتعديلات الجديدة وكيفية مواءمة السياسات الداخلية معها.",
    category: "labor-law",
    categoryName: "نظام العمل",
    tags: ["تشريعات", "امتثال", "سياسات"],
    readTime: "12 دقيقة",
    updatedAt: "يناير 2024",
    featured: true,
  },
  {
    id: "hybrid-work-policy",
    title: "كيف تطبق سياسة عمل هجين متوافقة",
    summary: "قالب جاهز لساعات العمل، تتبع الحضور، وضوابط الأمن والخصوصية.",
    category: "hr-ops",
    categoryName: "تشغيل HR",
    tags: ["سياسات", "حضور", "عمل عن بُعد"],
    readTime: "9 دقائق",
    updatedAt: "مارس 2024",
    featured: false,
  },
  {
    id: "onboarding-30-days",
    title: "برنامج تأهيلي للموظفين الجدد خلال 30 يوماً",
    summary: "خريطة طريق بأهداف أسبوعية تقلل الاستقالات المبكرة وترفع الإنتاجية.",
    category: "hr-ops",
    categoryName: "تشغيل HR",
    tags: ["Onboarding", "تجربة موظف", "إنتاجية"],
    readTime: "7 دقائق",
    updatedAt: "مارس 2024",
    featured: true,
  },
  {
    id: "ex-data-journey",
    title: "استخدام البيانات لتحسين تجربة الموظف (EX)",
    summary: "كيفية جمع بيانات نبض الموظف وتحويلها لقرارات ملموسة.",
    category: "experience",
    categoryName: "تجربة الموظف",
    tags: ["EX", "بيانات", "استبيانات"],
    readTime: "6 دقائق",
    updatedAt: "إبريل 2024",
    featured: false,
  },
  {
    id: "video-interviews",
    title: "مقابلات الفيديو: خطوات لضمان عدالة واتساق",
    summary: "أسئلة موحدة، تقييم موضوعي، ونصائح لخصوصية المرشحين.",
    category: "recruitment",
    categoryName: "التوظيف",
    tags: ["ATS", "مقابلات", "التزام"],
    readTime: "5 دقائق",
    updatedAt: "إبريل 2024",
    featured: false,
  },
  {
    id: "leave-entitlements",
    title: "دليل الإجازات: سنوية، مرضية، أمومة، حج",
    summary: "ما يستحقه الموظف من رصيد وطريقة حسابه وفق نظام العمل.",
    category: "labor-law",
    categoryName: "نظام العمل",
    tags: ["إجازات", "سياسات", "حسابات"],
    readTime: "10 دقائق",
    updatedAt: "مايو 2024",
    featured: true,
  },
];

export default function KnowledgeBase() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredArticles = useMemo(() => {
    return articles.filter(article => {
      const matchesCategory =
        selectedCategory === "all" || article.category === selectedCategory;
      const term = search.trim().toLowerCase();
      const matchesSearch =
        term.length === 0 ||
        article.title.toLowerCase().includes(term) ||
        article.summary.toLowerCase().includes(term) ||
        article.tags.some(tag => tag.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [search, selectedCategory]);

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-purple-50 flex flex-col">
      <div className="container max-w-6xl py-12 flex-1">
        <div className="flex items-center gap-3 mb-6 text-muted-foreground text-sm">
          <Link href="/">
            <a className="flex items-center gap-1 hover:text-primary">
              <ArrowLeft className="h-4 w-4" />
              الرئيسية
            </a>
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">قاعدة المعرفة</span>
        </div>

        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white shadow-sm mb-4 border">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">مركز المعرفة</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            أجوبة واضحة وسريعة لأسئلة الموارد البشرية
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            أدلة مختصرة، سياسات جاهزة، وتحديثات نظام العمل السعودي في مكان واحد
          </p>

          <div className="relative max-w-2xl mx-auto mt-8">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="ابحث عن موضوع: مكافأة نهاية الخدمة، الإجازات، العمل الهجين..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pr-12 h-12 text-base shadow-sm"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-4 gap-3 mb-10">
          {categories.map(category => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`w-full text-right p-4 rounded-xl border transition ${
                  isActive
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "hover:border-primary/50 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`h-10 w-10 rounded-lg bg-gradient-to-r ${category.color} flex items-center justify-center text-white`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {category.id !== "all" && (
                    <Badge variant={isActive ? "default" : "outline"}>
                      {articles.filter(a => a.category === category.id).length}
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Featured */}
        {featuredArticles.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">مقالات مميزة</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {featuredArticles.map(article => (
                <Card key={article.id} className="border-primary/20 shadow-md hover:shadow-lg transition">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{article.categoryName}</Badge>
                      <Badge variant="secondary" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg leading-7">
                      {article.title}
                    </CardTitle>
                    <CardDescription>{article.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {article.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/knowledge-base/${article.id}`}>
                      <Button size="sm" variant="outline">
                        اقرأ
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All articles */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">كل المقالات</h2>
            <Badge variant="outline">{filteredArticles.length}</Badge>
          </div>

          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                لا توجد نتائج مطابقة. جرّب كلمة مفتاحية أقصر أو فئة مختلفة.
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {regularArticles.map(article => (
                <Card key={article.id} className="hover:shadow-md transition">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{article.categoryName}</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{article.title}</CardTitle>
                    <CardDescription>{article.summary}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex items-center justify-between">
                    <div className="flex gap-2 flex-wrap">
                      {article.tags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/knowledge-base/${article.id}`}>
                      <Button variant="ghost" size="sm">
                        التفاصيل
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Quick tools */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-primary" />
                حاسبات الموارد البشرية
              </CardTitle>
              <CardDescription>
                نهاية الخدمة، الإجازات، وخطابات جاهزة للتحميل
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Link href="/tools/end-of-service">
                <Button size="sm" variant="outline">
                  نهاية الخدمة
                </Button>
              </Link>
              <Link href="/tools/leave-calculator">
                <Button size="sm" variant="outline">
                  الإجازات
                </Button>
              </Link>
              <Link href="/tools/letter-generator">
                <Button size="sm" variant="outline">
                  خطابات
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                سياسات جاهزة
              </CardTitle>
              <CardDescription>
                قوالب عمل هجين، إجازات، ولوائح داخلية متوافقة
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Badge variant="secondary">عمل هجين</Badge>
              <Badge variant="secondary">إجازات</Badge>
              <Badge variant="secondary">ساعات العمل</Badge>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Laptop className="h-5 w-5 text-primary" />
                دعم واستفسارات
              </CardTitle>
              <CardDescription>
                تواصل مع فريقنا أو استعمل مساعد الدردشة الذكي
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 flex-wrap">
              <Link href="/contact">
                <Button size="sm" variant="outline">
                  تواصل معنا
                </Button>
              </Link>
              <Link href="/consulting">
                <Button size="sm" variant="outline">
                  احجز استشارة
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
