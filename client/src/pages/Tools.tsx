import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import {
  Calculator,
  ClipboardCheck,
  FileText,
  ListChecks,
  PenSquare,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Workflow,
} from "lucide-react";

const toolCards = [
  {
    key: "tools.end_of_service",
    descKey: "tools.end_of_service.desc",
    icon: Calculator,
    color: "from-orange-100 to-orange-50",
  },
  {
    key: "tools.vacation",
    descKey: "tools.vacation.desc",
    icon: ListChecks,
    color: "from-blue-100 to-blue-50",
  },
  {
    key: "tools.letter_generator",
    descKey: "tools.letter_generator.desc",
    icon: PenSquare,
    color: "from-purple-100 to-pink-50",
  },
  {
    key: "tools.smart_form_generator.title",
    descKey: "tools.smart_form_generator.desc",
    icon: FileText,
    color: "from-emerald-100 to-green-50",
  },
  {
    key: "tools.certificates.title",
    descKey: "tools.certificates.desc",
    icon: ShieldCheck,
    color: "from-slate-100 to-slate-50",
  },
  {
    key: "tools.reports.title",
    descKey: "tools.reports.desc",
    icon: TrendingUp,
    color: "from-indigo-100 to-indigo-50",
  },
];

const workflowSteps = [
  { titleKey: "tools.workflow.step1.title", descKey: "tools.workflow.step1.desc" },
  { titleKey: "tools.workflow.step2.title", descKey: "tools.workflow.step2.desc" },
  { titleKey: "tools.workflow.step3.title", descKey: "tools.workflow.step3.desc" },
  { titleKey: "tools.workflow.step4.title", descKey: "tools.workflow.step4.desc" },
];

const highlights = [
  {
    titleKey: "tools.highlight.automation.title",
    descKey: "tools.highlight.automation.desc",
    icon: Sparkles,
  },
  {
    titleKey: "tools.highlight.compliance.title",
    descKey: "tools.highlight.compliance.desc",
    icon: ClipboardCheck,
  },
  {
    titleKey: "tools.highlight.workflow.title",
    descKey: "tools.highlight.workflow.desc",
    icon: Workflow,
  },
];

export default function ToolsPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-neutral-50 py-16">
      <div className="container max-w-6xl mx-auto px-4 space-y-16">
        <section className="grid gap-10 lg:grid-cols-2 items-center">
          <div className="space-y-6">
            <Badge className="w-fit px-4 py-1 rounded-full text-sm">
              {t("tools.hero.badge")}
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-balance">
              {t("tools.title")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("tools.subtitle")}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <p className="text-3xl font-semibold">70%</p>
                  <p className="text-sm text-muted-foreground">
                    {t("tools.stats.automation")}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardContent className="p-4">
                  <p className="text-3xl font-semibold">3x</p>
                  <p className="text-sm text-muted-foreground">
                    {t("tools.stats.accuracy")}
                  </p>
                </CardContent>
              </Card>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/pricing">
                <Button size="lg" className="gap-2">
                  {t("tools.cta.primary")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg" className="gap-2">
                  {t("tools.cta.secondary")}
                </Button>
              </Link>
            </div>
          </div>
          <Card className="border-none shadow-xl bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>{t("tools.categories.title")}</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
              {highlights.map(item => (
                <div key={item.titleKey} className="rounded-2xl border p-4 space-y-2">
                  <item.icon className="h-6 w-6 text-primary" />
                  <p className="font-semibold">{t(item.titleKey)}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {t(item.descKey)}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-wide text-primary/80">
              {t("tools.categories.subtitle")}
            </p>
            <h2 className="text-3xl font-semibold mt-2">
              {t("tools.categories.title")}
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {toolCards.map(card => (
              <Card key={card.key} className="border-none shadow-md hover:-translate-y-1 transition-transform">
                <CardContent className="p-6 space-y-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                    <card.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{t(card.key)}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {t(card.descKey)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary">
                    {t("tools.try_now")}
                    <span aria-hidden>→</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2 items-center">
          <div className="space-y-4">
            <Badge className="w-fit" variant="secondary">
              {t("tools.workflow.badge")}
            </Badge>
            <h2 className="text-3xl font-semibold">{t("tools.workflow.title")}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {t("tools.workflow.subtitle")}
            </p>
            <div className="space-y-4">
              {workflowSteps.map(step => (
                <div key={step.titleKey} className="rounded-2xl border p-4">
                  <p className="font-semibold">{t(step.titleKey)}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t(step.descKey)}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <Card className="border-none shadow-lg bg-white">
            <CardHeader>
              <CardTitle>{t("tools.workflow.metrics.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl border p-4">
                  <p className="text-3xl font-bold">15</p>
                  <p className="text-sm text-muted-foreground">
                    {t("tools.workflow.metrics.templates")}
                  </p>
                </div>
                <div className="rounded-2xl border p-4">
                  <p className="text-3xl font-bold">24/7</p>
                  <p className="text-sm text-muted-foreground">
                    {t("tools.workflow.metrics.support")}
                  </p>
                </div>
              </div>
              <div className="rounded-2xl border p-4">
                <p className="text-3xl font-bold">+40</p>
                <p className="text-sm text-muted-foreground">
                  {t("tools.workflow.metrics.integrations")}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="text-center space-y-4 bg-white rounded-3xl border shadow-inner py-12">
          <p className="text-sm uppercase tracking-wide text-primary/80">
            {t("tools.cta.badge")}
          </p>
          <h2 className="text-3xl font-semibold max-w-3xl mx-auto">
            {t("tools.cta.headline")}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t("tools.cta.description")}
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/contact">
              <Button size="lg">{t("tools.cta.secondary")}</Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                {t("tools.cta.primary")}
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
