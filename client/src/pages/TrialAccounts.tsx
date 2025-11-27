import { useMemo } from "react";
import { useLocation, Link } from "wouter";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Footer } from "@/components/Footer";
import {
  TRIAL_PROFILES,
  type TrialProfile,
  storeTrialProfileSelection,
} from "@/lib/trialProfiles";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Layers,
  Rocket,
  ShieldCheck,
  Sparkles,
  Timer,
  Users,
} from "lucide-react";

const completionHighlights = [
  {
    title: "استكمال الصفحات الحرجة",
    description:
      "تم ربط صفحات الحجز، إدارة الوثائق، وسيناريوهات الدعم مع تجربة سجّل الدخول الجديدة.",
    icon: Layers,
  },
  {
    title: "منصة الاستشارات",
    description:
      "حجوزات فورية، مسارات اشتراكات، وتجربة مستشار معززة جاهزة للاستخدام التجريبي.",
    icon: Rocket,
  },
  {
    title: "تجربة دخول موحدة",
    description:
      "نفس الحسابات التجريبية تعمل على الويب والتطبيق، مع ملء تلقائي ونصائح أمان.",
    icon: ShieldCheck,
  },
];

const consultingOps = [
  "مطابقة ذكية للحالات الحساسة مع نخبة الخبراء",
  "متابعة SLA مع تنبيهات آنية للطلبات المتأخرة",
  "غرف استشارة موحدة للدردشة، الصوت، والفيديو",
  "ملخصات تنفيذية جاهزة ومرفقات مشفرة",
];

const personaLevels: Record<string, "مستوى مبتدئ" | "مستوى قياسي" | "مستوى متقدم"> = {
  employee: "مستوى مبتدئ",
  company: "مستوى قياسي",
  consultant: "مستوى متقدم",
  admin: "مستوى متقدم",
};

export default function TrialAccounts() {
  const [, navigate] = useLocation();

  const totalHighlights = useMemo(
    () => TRIAL_PROFILES.reduce((acc, profile) => acc + profile.highlights.length, 0),
    []
  );

  const handleLaunch = (profile: TrialProfile, action: "login" | "signup") => {
    storeTrialProfileSelection(profile.id);
    toast.success(`تم تجهيز بيانات ${profile.title}`);

    if (action === "login") {
      navigate(`/login-enhanced?trial=${profile.id}`);
    } else {
      navigate(profile.recommendedSignupPath);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-900 to-slate-900 text-white">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_top,_#4f46e5_0,_transparent_35%)]" />
        <div className="container relative py-20 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-2 items-center">
            <div className="space-y-6">
              <Badge className="bg-white/10 text-white border border-white/20">
                حسابات تجريبية جاهزة للجميع
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                انطلق بتجربة كاملة دون إعدادات معقدة
              </h1>
              <p className="text-lg text-white/80">
                اختر شخصية من رابط، نملأ حقول تسجيل الدخول والتسجيل تلقائياً، ونأخذك مباشرة إلى لوحات التحكم، منصة الاستشارات، وجميع الصفحات التي تم استكمالها.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100" asChild>
                  <Link href="/consulting">جولة في منصة الاستشارات</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/40 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/login-enhanced">تجربة تسجيل الدخول المتطور</Link>
                </Button>
              </div>
            </div>
            <Card className="bg-white/10 border-white/10 text-white backdrop-blur lg:translate-y-6">
              <CardHeader>
                <CardTitle>جاهزية المنصة</CardTitle>
                <CardDescription className="text-white/80">
                  اكتمال {TRIAL_PROFILES.length} شخصيات تجريبية و{totalHighlights}+ نقطة لمسار تجربة المستخدم
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {completionHighlights.map(highlight => (
                  <div key={highlight.title} className="flex gap-3">
                    <div className="h-10 w-10 rounded-xl bg-white/15 flex items-center justify-center">
                      <highlight.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{highlight.title}</p>
                      <p className="text-sm text-white/80">{highlight.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container space-y-8">
          <div className="space-y-3 text-center">
            <Badge variant="outline" className="border-brand-200 text-brand-700 bg-brand-50">
              حسابات حسب المستوى
            </Badge>
            <h2 className="text-3xl font-bold">اختر تجربة تناسب دورك ومستوى خبرتك</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              يتم ربط كل شخصية بمسار التسجيل الصحيح، ملء تلقائي لبيانات تسجيل الدخول، وشرح للصفحات المستكملة داخل المنصة.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {TRIAL_PROFILES.map(profile => (
              <Card key={profile.id} className="shadow-lg border-brand-50 hover:border-brand-200 transition">
                <CardHeader className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="bg-brand-100 text-brand-800">
                      {personaLevels[profile.id]}
                    </Badge>
                    <Badge variant="outline">{profile.levelTag}</Badge>
                  </div>
                  <CardTitle className="text-2xl">{profile.title}</CardTitle>
                  <CardDescription>{profile.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-sm text-muted-foreground">{profile.description}</p>
                  <div className="rounded-2xl bg-slate-100/80 p-4 text-sm text-slate-700">
                    <p className="font-semibold mb-2">بيانات الدخول الجاهزة</p>
                    <div className="grid gap-1">
                      <span className="font-mono text-xs">{profile.demoEmail}</span>
                      <span className="font-mono text-xs">كلمة المرور: {profile.demoPassword}</span>
                      <span className="text-xs text-slate-500">لوحة التحكم: {profile.dashboardPath}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {profile.highlights.map(point => (
                      <li key={point} className="flex gap-2 text-sm text-slate-700">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    <Button className="flex-1" onClick={() => handleLaunch(profile, "login")}>
                      املأ تسجيل الدخول تلقائياً
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => handleLaunch(profile, "signup")}>
                      متابعة التسجيل
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white">
        <div className="container space-y-10">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">
                منصة الاستشارات المكتملة
              </p>
              <h2 className="text-3xl font-bold mt-2">جرب دورة الاستشارة كاملة من الطلب حتى التسليم</h2>
              <p className="text-white/80 mt-3 max-w-2xl">
                كل الحسابات التجريبية متصلة بصفحات الحجز الجديدة، دردشة الاستشارة، ولوحة متابعة SLA لضمان تدفق سلس حتى في الوضع التجريبي.
              </p>
            </div>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/consulting/book-new">ابدأ حجزاً تجريبياً</Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/10 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  قدرات العمليات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-white/80">
                  {consultingOps.map(item => (
                    <li key={item} className="flex gap-2">
                      <Users className="h-4 w-4 text-emerald-300" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer className="h-5 w-5 text-cyan-300" />
                  خط زمني للحالة التجريبية
                </CardTitle>
                <CardDescription className="text-white/70">
                  هكذا تبدو رحلة عميل في وضع التجربة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {["طلب الخدمة", "مطابقة المستشار", "الجلسة", "تقرير التنفيذ"].map((step, index) => (
                  <div key={step} className="flex gap-4 items-start">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{step}</p>
                      <p className="text-sm text-white/70">
                        يتم دفع الإشعارات والمرفقات تلقائياً لتريك ما سيحصل عليه العميل الحقيقي.
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline">تكامل تسجيل الدخول والتسجيل</Badge>
            <h2 className="text-3xl font-bold">مسار دخول واحد، أياً كان مستوى خبرتك</h2>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              بلمسة واحدة من صفحة الحسابات التجريبية يتم ملء حقول تسجيل الدخول الجديدة، أو توجيهك لمسار التسجيل الصحيح حسب المستوى (مبتدئ، قياسي، متقدم).
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {["دخول أسرع", "تسجيل ذكي", "تجربة موحدة"].map(title => (
              <Card key={title} className="relative overflow-hidden">
                <CardHeader>
                  <CardTitle>{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-4">
                  <p>
                    {title === "دخول أسرع"
                      ? "تعبئة تلقائية لبريد وكلمة مرور كل شخصية مع تذكير أمني ببيانات حساسة."
                      : title === "تسجيل ذكي"
                        ? "انتقال مباشر إلى صفحة التسجيل المناسبة مع تفضيلات تمهيدية لكل دور."
                        : "نفس الهوية البصرية، الرسائل، وقوائم الصفحات المكتملة مع اللغة العربية والإنجليزية."}
                  </p>
                  <Button variant="ghost" className="px-0" asChild>
                    <Link href={title === "تسجيل ذكي" ? "/register" : "/login-enhanced"}>
                      المزيد
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
