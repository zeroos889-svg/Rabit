import {
  CalendarClock,
  CheckCircle2,
  Compass,
  FileText,
  Layers,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ConsultingServicesSection } from "@/components/ConsultingServicesSection";
import { trpc } from "@/lib/trpc";
import { Footer } from "@/components/Footer";

interface PackageItem {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  priceSAR?: number;
  slaHours?: number | null;
  duration?: number;
  features?: unknown;
}

const quickLinks = [
  {
    title: "حجز استشارة فوري",
    description: "بدء الطلب بخطوتين مع اختيار نوع الخدمة",
    href: "/consulting/book-new",
    icon: CalendarClock,
  },
  {
    title: "تصفح المستشارين",
    description: "اطلع على الخبرات والتخصصات واختر المستشار الأنسب",
    href: "/consulting/experts",
    icon: Users,
  },
  {
    title: "متابعة تذاكري",
    description: "راجع حالة الاستشارات السابقة والردود والملفات",
    href: "/my-consultations",
    icon: FileText,
  },
  {
    title: "دليل الحجز خطوة بخطوة",
    description: "تعرف على سير العمل والوقت المتوقع للتسليم",
    href: "/consulting/how-to-book",
    icon: Compass,
  },
];

const supportLinks = [
  {
    title: "الأدوات المساندة",
    href: "/tools",
    detail: "حاسبات نهاية الخدمة والإجازات والتذاكر",
  },
  {
    title: "بوابة الخدمات",
    href: "/services",
    detail: "نظرة موحدة لكل حلول رابِط",
  },
  {
    title: "الأسعار والباقات",
    href: "/pricing",
    detail: "خطط الشركات والمستقلين والموظفين",
  },
  {
    title: "قاعدة المعرفة",
    href: "/knowledge-base",
    detail: "مقالات جاهزة وإجابات سريعة",
  },
];

function parseFeatures(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map(item => String(item)).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map(item => String(item)).filter(Boolean);
      }
    } catch {
      /* ignore parse errors */
    }
    return value
      .split(/[\n,]/)
      .map(item => item.trim())
      .filter(Boolean);
  }
  return [];
}

export default function ConsultingServices() {
  const { data: packagesData, isLoading: loadingPackages } =
    trpc.consulting.getPackages.useQuery();
  const { data: typesData, isLoading: loadingTypes } =
    trpc.consultant.getConsultationTypes.useQuery();

  const packages = packagesData?.packages ?? [];
  const consultationCount = typesData?.types?.length ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100">
      {/* Hero */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-white" />
        <div className="container relative py-14 space-y-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4 max-w-2xl">
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                خدمات الاستشارات القانونية للموارد البشرية
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
                مسار واضح من الطلب حتى التسليم
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  حجز، متابعة، وتسليم في مكان واحد
                </span>
              </h1>
              <p className="text-lg text-muted-foreground">
                صممنا رحلة الاستشارة لتكون مترابطة: اختيار الخدمة، حجز الموعد،
                رفع المستندات، متابعة الردود، وتقييم التجربة مع مؤشرات SLA واضحة.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/consulting/book-new">
                    ابدأ الحجز الآن
                    <Sparkles className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/consulting/how-to-book">عرض خطوات الحجز</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  <span>مؤشرات SLA تلقائية</span>
                </div>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-blue-600" />
                  <span>ربط الأدوات والملفات</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>إشعارات بريد وSMS</span>
                </div>
              </div>
            </div>

            <Card className="w-full max-w-md shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5 text-purple-600" />
                  ملخص سريع
                </CardTitle>
                <CardDescription>
                  ربط واضح بين صفحات الحجز والمتابعة والأدوات
                </CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                  <div className="text-sm text-muted-foreground">أنواع الاستشارة</div>
                  <div className="text-2xl font-bold text-purple-700">
                    {loadingTypes ? <Skeleton className="h-7 w-16" /> : consultationCount || 8}+
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    مرتبطة مباشرة بصفحة الحجز
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
                  <div className="text-sm text-muted-foreground">متوسط التسليم</div>
                  <div className="text-2xl font-bold text-blue-700">24-48h</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    حسب الباقة وSLA المحدد
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                  <div className="text-sm text-muted-foreground">متابعة التذاكر</div>
                  <div className="text-lg font-semibold text-emerald-700">
                    /my-consultations
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    كل الردود والملفات في مكان واحد
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                  <div className="text-sm text-muted-foreground">الدعم المساند</div>
                  <div className="text-lg font-semibold text-amber-700">
                    الأدوات + المعرفة
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    روابط مباشرة للأدوات القانونية
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick navigation */}
      <section className="container py-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">انتقل بسرعة</h2>
            <p className="text-muted-foreground">
              روابط مترابطة بين الحجز، المستشارين، والمتابعة
            </p>
          </div>
          <Badge variant="outline" className="border-dashed">
            متوافقة مع نظام التذاكر والاستشارات
          </Badge>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map(link => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href}>
                <Card className="h-full border shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
                  <CardHeader className="pb-2 flex flex-row items-center justify-between">
                    <CardTitle className="text-lg">{link.title}</CardTitle>
                    <span className="rounded-full bg-slate-100 p-2 text-slate-600 group-hover:text-purple-600">
                      <Icon className="h-4 w-4" />
                    </span>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Packages */}
      <section className="container pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">باقات الاستشارة</h2>
            <p className="text-muted-foreground">
              اختر السرعة ومستوى التفصيل المناسب، وستجد نفس الباقة في تدفق الحجز
            </p>
          </div>
          <Link href="/pricing">
            <Button variant="outline" size="sm">مقارنة الباقات</Button>
          </Link>
        </div>

        {loadingPackages ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-24 mb-2" />
                <Skeleton className="h-4 w-32 mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-6 w-20 mb-2" />
                <Skeleton className="h-6 w-28" />
              </Card>
            ))}
          </div>
        ) : packages.length === 0 ? (
          <Card className="p-6">
            <CardTitle className="text-lg mb-2">لا توجد باقات مفعلة حالياً</CardTitle>
            <CardDescription className="mb-4">
              يمكنك متابعة الحجز مباشرة وسيتم اختيار الباقة الأنسب تلقائياً.
            </CardDescription>
            <Button asChild>
              <Link href="/consulting/book-new">بدء الحجز</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {packages.map((pkg: PackageItem) => {
              const features = parseFeatures(pkg.features);
              const price = pkg.priceSAR ?? pkg.price ?? 0;
              return (
                <Card
                  key={pkg.id}
                  className="h-full border shadow-sm flex flex-col"
                  onClick={() =>
                    localStorage.setItem(
                      "rabit-consulting-package",
                      JSON.stringify({
                        id: pkg.id,
                        name: pkg.name,
                        price: pkg.priceSAR ?? pkg.price ?? 0,
                        slaHours: pkg.slaHours ?? null,
                      })
                    )
                  }
                >
                  <CardHeader className="space-y-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{pkg.name}</CardTitle>
                      {pkg.slaHours && (
                        <Badge variant="secondary" className="text-xs">
                          SLA {pkg.slaHours} ساعة
                        </Badge>
                      )}
                    </div>
                    {pkg.description && (
                      <CardDescription className="leading-relaxed">
                        {pkg.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col gap-3">
                    <div>
                      <div className="text-3xl font-bold text-purple-700">
                        {price} ريال
                      </div>
                      {pkg.duration && (
                        <p className="text-sm text-muted-foreground">
                          مدة الجلسة ~ {pkg.duration} دقيقة
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      {(features.length ? features : ["تحليل الحالة", "توصيات مكتوبة", "متابعة على التذكرة"]).map(
                        feature => (
                          <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            <span>{feature}</span>
                          </div>
                        )
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <Button className="flex-1" asChild>
                        <Link href="/consulting/book-new">اختر هذه الباقة</Link>
                      </Button>
                      <Button variant="outline" asChild>
                        <Link href="/consulting/book-new?from=services">التفاصيل</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Consultation types grid reused from home */}
      <ConsultingServicesSection />

      {/* Supporting services */}
      <section className="container pb-16">
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              خدمات مساندة مرتبطة مباشرة
            </CardTitle>
            <CardDescription>
              روابط مختصرة للأدوات وصفحات الدعم لضمان ترابط الرحلة
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            {supportLinks.map(item => (
              <Link key={item.href} href={item.href}>
                <div className="p-4 rounded-xl bg-slate-50 border hover:border-purple-200 transition-colors cursor-pointer h-full">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <Sparkles className="h-4 w-4 text-purple-600" />
                  </div>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
}
