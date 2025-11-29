/**
 * Saudi Regulations Page - صفحة الأنظمة السعودية
 * 
 * صفحة شاملة لعرض جميع الأنظمة واللوائح السعودية المتعلقة بالموارد البشرية
 * تشمل: نظام العمل، التأمينات الاجتماعية، نظام النطاقات، وغيرها
 */

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Scale,
  Shield,
  Users,
  FileText,
  Search,
  Calculator,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Building2,
  Wallet,
  Clock,
  FileCheck,
  Globe,
  Lock,
  Laptop,
  HeartPulse,
} from "lucide-react";
import { useKnowledgeBase } from "@/hooks/useAI";

// Regulation card data
const regulationsData = [
  {
    id: "labor-law",
    title: "نظام العمل السعودي",
    titleEn: "Saudi Labor Law",
    description: "القوانين واللوائح المنظمة لعلاقات العمل في المملكة العربية السعودية",
    icon: Scale,
    color: "from-blue-500 to-blue-600",
    bgColor: "bg-blue-50",
    category: "labor",
    highlights: [
      "عقود العمل وأنواعها",
      "فترة التجربة (90-180 يوم)",
      "ساعات العمل (8 ساعات/يوم)",
      "الإجازات السنوية (21-30 يوم)",
      "مكافأة نهاية الخدمة",
    ],
  },
  {
    id: "gosi",
    title: "التأمينات الاجتماعية",
    titleEn: "GOSI - Social Insurance",
    description: "نظام التأمينات الاجتماعية ومعاشات التقاعد والأخطار المهنية",
    icon: Shield,
    color: "from-green-500 to-green-600",
    bgColor: "bg-green-50",
    category: "insurance",
    highlights: [
      "اشتراك المعاشات (9% + 9%)",
      "أخطار مهنية (2% صاحب عمل)",
      "ساند (0.75% + 0.75%)",
      "سقف الاشتراك 45,000 ريال",
      "معاش التقاعد المبكر",
    ],
  },
  {
    id: "nitaqat",
    title: "نظام نطاقات",
    titleEn: "Nitaqat System",
    description: "برنامج توطين الوظائف وتصنيف المنشآت حسب نسبة السعودة",
    icon: Users,
    color: "from-purple-500 to-purple-600",
    bgColor: "bg-purple-50",
    category: "saudization",
    highlights: [
      "النطاق البلاتيني (فوق المطلوب)",
      "النطاق الأخضر (مطابق)",
      "النطاق الأصفر (أقل من المطلوب)",
      "النطاق الأحمر (غير ملتزم)",
      "نسب السعودة حسب القطاع",
    ],
  },
  {
    id: "wps-mudad",
    title: "حماية الأجور (مُدد)",
    titleEn: "WPS - Mudad",
    description: "نظام حماية الأجور لضمان صرف رواتب العاملين في الوقت المحدد",
    icon: Wallet,
    color: "from-amber-500 to-amber-600",
    bgColor: "bg-amber-50",
    category: "wages",
    highlights: [
      "الالتزام بالتحويل البنكي",
      "مهلة 7 أيام للصرف",
      "رفع ملف الأجور شهرياً",
      "مخالفات التأخير",
      "ربط مع التأمينات",
    ],
  },
  {
    id: "qiwa",
    title: "منصة قوى",
    titleEn: "Qiwa Platform",
    description: "المنصة الوطنية لخدمات سوق العمل وتوثيق العقود",
    icon: Laptop,
    color: "from-cyan-500 to-cyan-600",
    bgColor: "bg-cyan-50",
    category: "digital",
    highlights: [
      "توثيق عقود العمل",
      "نقل الخدمات",
      "تجديد رخص العمل",
      "خدمات التأشيرات",
      "تحديث بيانات العاملين",
    ],
  },
  {
    id: "remote-work",
    title: "العمل عن بعد",
    titleEn: "Remote Work Regulations",
    description: "ضوابط وأحكام العمل عن بعد في المملكة العربية السعودية",
    icon: Globe,
    color: "from-indigo-500 to-indigo-600",
    bgColor: "bg-indigo-50",
    category: "work-arrangements",
    highlights: [
      "احتساب في نسبة التوطين",
      "عقد العمل عن بعد",
      "حقوق الموظف",
      "التزامات صاحب العمل",
      "ساعات العمل المرنة",
    ],
  },
  {
    id: "ohs",
    title: "السلامة والصحة المهنية",
    titleEn: "Occupational Health & Safety",
    description: "معايير السلامة والصحة المهنية في بيئة العمل",
    icon: HeartPulse,
    color: "from-red-500 to-red-600",
    bgColor: "bg-red-50",
    category: "safety",
    highlights: [
      "معايير بيئة العمل",
      "معدات الحماية الشخصية",
      "التدريب على السلامة",
      "الإبلاغ عن الحوادث",
      "الفحوصات الطبية الدورية",
    ],
  },
  {
    id: "women-employment",
    title: "عمل المرأة",
    titleEn: "Women Employment",
    description: "الأحكام الخاصة بتوظيف المرأة وحقوقها في بيئة العمل",
    icon: Users,
    color: "from-pink-500 to-pink-600",
    bgColor: "bg-pink-50",
    category: "employment",
    highlights: [
      "إجازة الأمومة (70 يوم)",
      "ساعة الرضاعة",
      "الأعمال المحظورة",
      "العمل الليلي",
      "بيئة عمل مناسبة",
    ],
  },
  {
    id: "violations",
    title: "جدول المخالفات والعقوبات",
    titleEn: "Violations & Penalties",
    description: "المخالفات العمالية والغرامات المترتبة عليها",
    icon: AlertTriangle,
    color: "from-orange-500 to-orange-600",
    bgColor: "bg-orange-50",
    category: "compliance",
    highlights: [
      "مخالفات نظام العمل",
      "مخالفات التأمينات",
      "مخالفات السعودة",
      "درجات الغرامات",
      "تكرار المخالفات",
    ],
  },
  {
    id: "pdpl",
    title: "حماية البيانات الشخصية",
    titleEn: "Personal Data Protection Law",
    description: "نظام حماية البيانات الشخصية وخصوصية المعلومات",
    icon: Lock,
    color: "from-slate-500 to-slate-600",
    bgColor: "bg-slate-50",
    category: "privacy",
    highlights: [
      "حقوق صاحب البيانات",
      "موافقة جمع البيانات",
      "نقل البيانات عبر الحدود",
      "الإفصاح والشفافية",
      "عقوبات المخالفات",
    ],
  },
];

// Category definitions
const categories = [
  { id: "all", label: "الكل", labelEn: "All" },
  { id: "labor", label: "نظام العمل", labelEn: "Labor" },
  { id: "insurance", label: "التأمينات", labelEn: "Insurance" },
  { id: "saudization", label: "التوطين", labelEn: "Saudization" },
  { id: "wages", label: "الأجور", labelEn: "Wages" },
  { id: "digital", label: "المنصات الرقمية", labelEn: "Digital" },
  { id: "compliance", label: "الامتثال", labelEn: "Compliance" },
];

export default function SaudiRegulations() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegulation, setSelectedRegulation] = useState<string | null>(null);
  const { loading, error, getRegulation } = useKnowledgeBase();
  const [regulationDetails, setRegulationDetails] = useState<Record<string, unknown> | null>(null);

  // Filter regulations based on search and category
  const filteredRegulations = regulationsData.filter((reg) => {
    const matchesSearch =
      reg.title.includes(searchQuery) ||
      reg.titleEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      reg.description.includes(searchQuery);
    const matchesCategory =
      selectedCategory === "all" || reg.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Load regulation details when selected
  useEffect(() => {
    if (selectedRegulation) {
      getRegulation(selectedRegulation).then((data) => {
        setRegulationDetails(data);
      });
    }
  }, [selectedRegulation, getRegulation]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
              <BookOpen className="w-4 h-4 me-2" />
              {isArabic ? "قاعدة المعرفة" : "Knowledge Base"}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
              {isArabic ? "الأنظمة واللوائح السعودية" : "Saudi Regulations & Laws"}
            </h1>
            <p className="text-lg text-muted-foreground">
              {isArabic
                ? "دليلك الشامل لجميع الأنظمة واللوائح المتعلقة بالموارد البشرية في المملكة العربية السعودية"
                : "Your comprehensive guide to all HR-related regulations and laws in Saudi Arabia"}
            </p>
          </div>

          {/* Search Bar */}
          <div className="mt-8 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={isArabic ? "ابحث في الأنظمة..." : "Search regulations..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 h-12 text-lg"
              />
            </div>
          </div>

          {/* Category Filters */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className="rounded-full"
              >
                {isArabic ? cat.label : cat.labelEn}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Regulations Grid */}
      <section className="py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredRegulations.map((reg) => {
              const Icon = reg.icon;
              return (
                <Card
                  key={reg.id}
                  className={`group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                    selectedRegulation === reg.id ? "ring-2 ring-primary" : ""
                  }`}
                  onClick={() => setSelectedRegulation(reg.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${reg.color} flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {isArabic
                          ? categories.find((c) => c.id === reg.category)?.label
                          : categories.find((c) => c.id === reg.category)?.labelEn}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4 text-lg group-hover:text-primary transition-colors">
                      {isArabic ? reg.title : reg.titleEn}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {reg.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`rounded-lg ${reg.bgColor} p-3`}>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        {isArabic ? "أبرز النقاط:" : "Key Points:"}
                      </p>
                      <ul className="space-y-1">
                        {reg.highlights.slice(0, 3).map((highlight, idx) => (
                          <li
                            key={idx}
                            className="flex items-center gap-2 text-sm"
                          >
                            <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span className="text-slate-700">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Button
                      variant="ghost"
                      className="w-full mt-3 group-hover:bg-primary/5"
                    >
                      {isArabic ? "عرض التفاصيل" : "View Details"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredRegulations.length === 0 && (
            <div className="text-center py-12">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">
                {isArabic ? "لم يتم العثور على نتائج" : "No results found"}
              </h3>
              <p className="text-muted-foreground">
                {isArabic
                  ? "جرب البحث بكلمات مختلفة"
                  : "Try searching with different keywords"}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Regulation Details Modal/Section */}
      {selectedRegulation && (
        <section className="py-12 bg-white border-t">
          <div className="container max-w-4xl mx-auto px-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
                <p className="mt-4 text-muted-foreground">
                  {isArabic ? "جاري التحميل..." : "Loading..."}
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
                <p>{error}</p>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">
                    {isArabic
                      ? regulationsData.find((r) => r.id === selectedRegulation)?.title
                      : regulationsData.find((r) => r.id === selectedRegulation)?.titleEn}
                  </h2>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedRegulation(null)}
                  >
                    {isArabic ? "إغلاق" : "Close"}
                  </Button>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">
                      {isArabic ? "نظرة عامة" : "Overview"}
                    </TabsTrigger>
                    <TabsTrigger value="articles">
                      {isArabic ? "المواد" : "Articles"}
                    </TabsTrigger>
                    <TabsTrigger value="faq">
                      {isArabic ? "الأسئلة الشائعة" : "FAQ"}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="prose prose-slate max-w-none">
                          <p className="text-muted-foreground leading-relaxed">
                            {regulationsData.find((r) => r.id === selectedRegulation)?.description}
                          </p>
                          <div className="mt-6 grid gap-4 md:grid-cols-2">
                            {regulationsData
                              .find((r) => r.id === selectedRegulation)
                              ?.highlights.map((highlight, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-start gap-3 p-3 rounded-lg bg-slate-50"
                                >
                                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                  <span>{highlight}</span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="articles" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <Accordion type="single" collapsible className="w-full">
                          {regulationDetails && Array.isArray((regulationDetails as Record<string, unknown>).articles) ? (
                            ((regulationDetails as Record<string, unknown>).articles as Array<{
                              number: number;
                              title: string;
                              content: string;
                            }>).map((article, idx) => (
                              <AccordionItem key={idx} value={`article-${idx}`}>
                                <AccordionTrigger className="text-right">
                                  <span className="flex items-center gap-2">
                                    <Badge variant="outline">
                                      {isArabic ? `مادة ${article.number}` : `Article ${article.number}`}
                                    </Badge>
                                    {article.title}
                                  </span>
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                  {article.content}
                                </AccordionContent>
                              </AccordionItem>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <FileText className="h-8 w-8 mx-auto mb-2" />
                              <p>
                                {isArabic
                                  ? "لا توجد مواد متاحة حالياً"
                                  : "No articles available at the moment"}
                              </p>
                            </div>
                          )}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="faq" className="mt-6">
                    <Card>
                      <CardContent className="pt-6">
                        <Accordion type="single" collapsible className="w-full">
                          {regulationDetails && Array.isArray((regulationDetails as Record<string, unknown>).faq) ? (
                            ((regulationDetails as Record<string, unknown>).faq as Array<{
                              question: string;
                              answer: string;
                            }>).map((faq, idx) => (
                              <AccordionItem key={idx} value={`faq-${idx}`}>
                                <AccordionTrigger className="text-right">
                                  {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </AccordionContent>
                              </AccordionItem>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              <BookOpen className="h-8 w-8 mx-auto mb-2" />
                              <p>
                                {isArabic
                                  ? "لا توجد أسئلة شائعة متاحة حالياً"
                                  : "No FAQ available at the moment"}
                              </p>
                            </div>
                          )}
                        </Accordion>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Tools Section */}
      <section className="py-12 bg-gradient-to-br from-primary/5 to-transparent">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold">
              {isArabic ? "أدوات سريعة" : "Quick Tools"}
            </h2>
            <p className="text-muted-foreground mt-2">
              {isArabic
                ? "حاسبات وأدوات مبنية على الأنظمة السعودية"
                : "Calculators and tools based on Saudi regulations"}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Calculator className="h-10 w-10 mx-auto text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">
                  {isArabic ? "حاسبة نهاية الخدمة" : "EOSB Calculator"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isArabic ? "احسب مكافأتك" : "Calculate your benefit"}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Wallet className="h-10 w-10 mx-auto text-green-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">
                  {isArabic ? "حاسبة التأمينات" : "GOSI Calculator"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isArabic ? "احسب اشتراكاتك" : "Calculate contributions"}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <Clock className="h-10 w-10 mx-auto text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">
                  {isArabic ? "حاسبة الإجازات" : "Leave Calculator"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isArabic ? "احسب رصيدك" : "Calculate your balance"}
                </p>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <FileCheck className="h-10 w-10 mx-auto text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-semibold">
                  {isArabic ? "فحص الامتثال" : "Compliance Check"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isArabic ? "تحقق من التزامك" : "Verify compliance"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-white">
            <CardContent className="p-8 text-center">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-90" />
              <h2 className="text-2xl font-bold mb-2">
                {isArabic ? "هل تحتاج مساعدة؟" : "Need Help?"}
              </h2>
              <p className="text-white/80 mb-6 max-w-xl mx-auto">
                {isArabic
                  ? "فريق الخبراء لدينا جاهز لمساعدتك في فهم الأنظمة وتطبيقها بشكل صحيح"
                  : "Our expert team is ready to help you understand and properly implement regulations"}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="secondary" size="lg">
                  {isArabic ? "تواصل مع مستشار" : "Contact a Consultant"}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-transparent text-white border-white hover:bg-white/10"
                >
                  {isArabic ? "احجز استشارة" : "Book a Consultation"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
