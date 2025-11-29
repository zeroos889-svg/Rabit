import { Link, useLocation } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CircleDollarSign,
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ConnectedPage = {
  key: string;
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  href: string;
  icon: LucideIcon;
  tag: { ar: string; en: string };
  accent: string;
};

const CONNECTED_PAGES: ConnectedPage[] = [
  {
    key: "consulting",
    title: { ar: "الاستشارات", en: "Consulting" },
    description: {
      ar: "احجز جلسة فورية أو مجدولة مع مستشار متخصص واطلع على الباقات.",
      en: "Book an instant or scheduled session with a specialist and review packages.",
    },
    href: "/consulting",
    icon: MessageSquare,
    tag: { ar: "خدمة مباشرة", en: "Live Service" },
    accent: "from-cyan-500 to-blue-500",
  },
  {
    key: "tools",
    title: { ar: "الأدوات", en: "Tools" },
    description: {
      ar: "حوّل العمليات اليدوية إلى مهام مؤتمتة مع حاسبات وخطابات ذكية.",
      en: "Turn manual HR work into automated flows with calculators and smart letters.",
    },
    href: "/tools",
    icon: Workflow,
    tag: { ar: "جاهز للاستخدام", en: "Ready to Use" },
    accent: "from-indigo-500 to-purple-500",
  },
  {
    key: "pricing",
    title: { ar: "الأسعار والباقات", en: "Pricing & Plans" },
    description: {
      ar: "اختر الخطة المناسبة: موظف، مستشار، أو باقة الشركات مع تجربة مجانية.",
      en: "Pick the right plan: employee, consultant, or company with free trials.",
    },
    href: "/pricing",
    icon: CircleDollarSign,
    tag: { ar: "تجربة مجانية", en: "Free Trial" },
    accent: "from-amber-500 to-orange-500",
  },
  {
    key: "dashboard",
    title: { ar: "لوحات التحكم", en: "Dashboards" },
    description: {
      ar: "تابع الموظفين، التوظيف، والتذاكر من لوحة شركة حديثة غنية بالمؤشرات.",
      en: "Track employees, hiring, and tickets from a modern, insight-rich dashboard.",
    },
    href: "/company/dashboard-enhanced",
    icon: LayoutDashboard,
    tag: { ar: "للشركات", en: "For Companies" },
    accent: "from-emerald-500 to-teal-500",
  },
];

interface ConnectedPagesSectionProps {
  readonly isArabic: boolean;
  readonly title?: { ar: string; en: string };
  readonly subtitle?: { ar: string; en: string };
  readonly highlight?: { ar: string; en: string };
  readonly className?: string;
}

export function ConnectedPagesSection({
  isArabic,
  title = {
    ar: "روابط سريعة بين صفحات رابِط",
    en: "Navigate the Rabit Experience",
  },
  subtitle = {
    ar: "انتقل بسهولة بين الأدوات، الباقات، والاستشارات من مكان واحد.",
    en: "Jump between tools, plans, and consulting without losing context.",
  },
  highlight = { ar: "رحلة متكاملة", en: "Connected Journey" },
  className = "",
}: ConnectedPagesSectionProps) {
  const [, navigate] = useLocation();

  return (
    <section className={cn("py-12 lg:py-16", className)}>
      <div className="container">
        <div className="text-center space-y-3 mb-10">
          <Badge className="inline-flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 text-white border-0 px-4 py-1.5">
            <Sparkles className="h-4 w-4" />
            {isArabic ? highlight.ar : highlight.en}
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">
            {isArabic ? title.ar : title.en}
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg">
            {isArabic ? subtitle.ar : subtitle.en}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {CONNECTED_PAGES.map((page) => {
            const Icon = page.icon;
            const ariaLabel = isArabic
              ? `${page.title.ar} - ${page.tag.ar}`
              : `${page.title.en} - ${page.tag.en}`;
            return (
              <Card
                key={page.key}
                role="link"
                tabIndex={0}
                aria-label={ariaLabel}
                onClick={() => navigate(page.href)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigate(page.href);
                  }
                }}
                className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer relative"
              >
                <div
                  className={`absolute inset-x-0 h-1 bg-gradient-to-r ${page.accent}`}
                />
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div
                      className={`h-12 w-12 rounded-xl bg-gradient-to-br ${page.accent} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <Badge variant="secondary" className="font-medium">
                      {isArabic ? page.tag.ar : page.tag.en}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">
                    {isArabic ? page.title.ar : page.title.en}
                  </CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    {isArabic ? page.description.ar : page.description.en}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="text-primary hover:text-primary flex items-center gap-2"
                    asChild
                  >
                    <Link href={page.href}>
                      {isArabic ? "استكشف الصفحة" : "Explore Page"}
                      <ArrowRight
                        className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${
                          isArabic ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
