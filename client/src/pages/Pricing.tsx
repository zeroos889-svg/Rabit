import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  X,
  Sparkles,
  Users,
  Building2,
  Briefcase,
  ChevronLeft,
  Crown,
  Zap,
  Shield,
  HeadphonesIcon,
  HelpCircle,
  type LucideIcon,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Link } from "wouter";
import { Footer } from "@/components/Footer";

type PlanFeature = {
  nameKey?: string;
  name?: string;
  included: boolean;
};

type CompanyTier = {
  id: string;
  nameKey?: string;
  name?: string;
  price: number | null;
  employees: number;
  employeesLabel?: string;
  descriptionKey?: string;
  popular?: boolean;
};

type PricingPlan = {
  id: string;
  nameKey: string;
  periodKey?: string;
  price?: number;
  icon: LucideIcon;
  color: string;
  descriptionKey: string;
  features: PlanFeature[];
  ctaKey: string;
  popular?: boolean;
  tiers?: CompanyTier[];
};

// Pricing Plans
const pricingPlans: Record<string, PricingPlan> = {
  employee: {
    id: "employee",
    nameKey: "pricing.plan.employee.name",
    price: 0,
    periodKey: "pricing.plan.employee.free",
    icon: Users,
    color: "from-green-500 to-emerald-600",
    descriptionKey: "pricing.plan.employee.desc",
    features: [
      { nameKey: "pricing.table.row.eos", included: true },
      { nameKey: "pricing.table.row.vacation", included: true },
      { nameKey: "pricing.table.row.letters", included: true },
      { nameKey: "pricing.table.row.ai", included: true },
      { nameKey: "pricing.table.row.support.employee", included: true },
      { nameKey: "pricing.table.row.export_pdf", included: true },
      { nameKey: "pricing.table.row.advanced_tools", included: false },
      { nameKey: "pricing.table.row.dashboard", included: false },
      { nameKey: "pricing.table.row.team", included: false },
      { nameKey: "pricing.table.row.ats", included: false },
    ],
    ctaKey: "pricing.plan.employee.cta",
    popular: false,
  },
  freelancer: {
    id: "freelancer",
    nameKey: "pricing.plan.freelancer.name",
    price: 299,
    periodKey: "pricing.plan.freelancer.price_period",
    icon: Briefcase,
    color: "from-purple-500 to-pink-600",
    descriptionKey: "pricing.plan.freelancer.desc",
    features: [
      { nameKey: "pricing.table.row.all_employee_features", included: true },
      { nameKey: "pricing.table.row.letters", included: true },
      { nameKey: "pricing.table.row.advanced_tools", included: true },
      { nameKey: "pricing.table.row.advanced_reports", included: true },
      { nameKey: "pricing.table.row.dashboard", included: true },
      { nameKey: "pricing.table.row.support.freelancer", included: true },
      { nameKey: "pricing.table.row.export_word", included: true },
      { nameKey: "pricing.table.row.templates", included: true },
      { nameKey: "pricing.table.row.team", included: false },
      { nameKey: "pricing.table.row.ats", included: false },
    ],
    ctaKey: "pricing.plan.freelancer.cta",
    popular: true,
  },
  company: {
    id: "company",
    nameKey: "pricing.plan.company.name",
    tiers: [
      {
        id: "starter",
        nameKey: "pricing.plan.company.tier.starter",
        price: 799,
        employees: 50,
        descriptionKey: "pricing.plan.company.tier.starter_desc",
      },
      {
        id: "professional",
        nameKey: "pricing.plan.company.tier.professional",
        price: 1499,
        employees: 200,
        descriptionKey: "pricing.plan.company.tier.professional_desc",
        popular: true,
      },
      {
        id: "enterprise",
        nameKey: "pricing.plan.company.tier.enterprise",
        price: 2999,
        employees: 1000,
        descriptionKey: "pricing.plan.company.tier.enterprise_desc",
      },
      {
        id: "custom",
        nameKey: "pricing.plan.company.tier.custom",
        price: null,
        employees: 1000,
        employeesLabel: "1000+",
        descriptionKey: "pricing.plan.company.tier.custom_desc",
      },
    ],
    icon: Building2,
    color: "from-blue-500 to-indigo-600",
    descriptionKey: "pricing.plan.company.desc",
    features: [
      { nameKey: "pricing.table.row.all_freelancer_features", included: true },
      { nameKey: "pricing.table.row.ats", included: true },
      { nameKey: "pricing.table.row.employees_management", included: true },
      { nameKey: "pricing.table.row.tickets", included: true },
      { nameKey: "pricing.table.row.advanced_reports", included: true },
      { nameKey: "pricing.table.row.team", included: true },
      { nameKey: "pricing.table.row.roles", included: true },
      { nameKey: "pricing.table.row.api", included: true },
      { nameKey: "pricing.table.row.support.company", included: true },
      { nameKey: "pricing.table.row.training", included: true },
    ],
    ctaKey: "pricing.plan.company.cta",
    popular: false,
  },
};

const trustBadges = [
  {
    icon: Shield,
    titleKey: "pricing.trust.security.title",
    descKey: "pricing.trust.security.desc",
    color: "text-blue-500",
  },
  {
    icon: Zap,
    titleKey: "pricing.trust.performance.title",
    descKey: "pricing.trust.performance.desc",
    color: "text-yellow-500",
  },
  {
    icon: Crown,
    titleKey: "pricing.trust.compliance.title",
    descKey: "pricing.trust.compliance.desc",
    color: "text-purple-500",
  },
  {
    icon: HeadphonesIcon,
    titleKey: "pricing.trust.support.title",
    descKey: "pricing.trust.support.desc",
    color: "text-green-500",
  },
];

const pricingFaq = [
  { id: "item-1", questionKey: "pricing.faq.q1", answerKey: "pricing.faq.a1" },
  { id: "item-2", questionKey: "pricing.faq.q2", answerKey: "pricing.faq.a2" },
  { id: "item-3", questionKey: "pricing.faq.q3", answerKey: "pricing.faq.a3" },
  { id: "item-4", questionKey: "pricing.faq.q4", answerKey: "pricing.faq.a4" },
  { id: "item-5", questionKey: "pricing.faq.q5", answerKey: "pricing.faq.a5" },
  { id: "item-6", questionKey: "pricing.faq.q6", answerKey: "pricing.faq.a6" },
  { id: "item-7", questionKey: "pricing.faq.q7", answerKey: "pricing.faq.a7" },
  { id: "item-8", questionKey: "pricing.faq.q8", answerKey: "pricing.faq.a8" },
  { id: "item-9", questionKey: "pricing.faq.q9", answerKey: "pricing.faq.a9" },
  { id: "item-10", questionKey: "pricing.faq.q10", answerKey: "pricing.faq.a10" },
];

export default function Pricing() {
  const { t } = useTranslation();
  const [selectedCompanyTier, setSelectedCompanyTier] =
    useState("professional");
  const includedLabel = t("pricing.a11y.included", {
    defaultValue: "متاح",
  });
  const excludedLabel = t("pricing.a11y.excluded", {
    defaultValue: "غير متاح",
  });
  const backLabel = t("pricing.a11y.back", {
    defaultValue: "العودة إلى الصفحة الرئيسية",
  });
  const tableCaption = t("pricing.table.caption", {
    defaultValue: "مقارنة تفصيلية بين خطط الأسعار.",
  });

  return (
    <main
      id="main-content"
      role="main"
      aria-labelledby="pricing-page-title"
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-12">
          <Link href="/">
            <Button variant="ghost" size="icon" aria-label={backLabel}>
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </Button>
          </Link>
          <div className="flex-1 text-center">
            <h1
              id="pricing-page-title"
              className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4"
            >
              {t("pricing.page.title")}
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("pricing.page.subtitle")}
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {/* Employee Plan */}
          <Card
            className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300 ${
              pricingPlans.employee.popular
                ? "ring-2 ring-purple-500 scale-105"
                : ""
            }`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${pricingPlans.employee.color}`}
            />

            <CardHeader className="text-center pb-8 pt-8">
              <div
                className={`mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br ${pricingPlans.employee.color} w-fit`}
              >
                <pricingPlans.employee.icon
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
              <CardTitle className="text-2xl mb-2">
                {t(pricingPlans.employee.nameKey)}
              </CardTitle>
              <CardDescription className="text-sm">
                {t(pricingPlans.employee.descriptionKey)}
              </CardDescription>

              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">
                    {t(pricingPlans.employee.periodKey || "pricing.plan.employee.free")}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("pricing.plan.employee.forever")}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {pricingPlans.employee.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check
                        className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                        aria-label={includedLabel}
                        role="img"
                        focusable="false"
                      />
                    ) : (
                      <X
                        className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5"
                        aria-label={excludedLabel}
                        role="img"
                        focusable="false"
                      />
                    )}
                    <span
                      className={`text-sm ${!feature.included ? "text-muted-foreground line-through" : ""}`}
                    >
                      {feature.nameKey ? t(feature.nameKey) : feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/signup">
                <Button
                  className={`w-full bg-gradient-to-r ${pricingPlans.employee.color} hover:opacity-90`}
                >
                  {t(pricingPlans.employee.ctaKey)}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Freelancer Plan */}
          <Card
            className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300 ${
              pricingPlans.freelancer.popular
                ? "ring-2 ring-purple-500 scale-105 md:scale-110"
                : ""
            }`}
          >
            {pricingPlans.freelancer.popular && (
              <div className="absolute top-4 -right-12 rotate-45 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-12 py-1 text-sm font-semibold">
                {t("pricing.plan.freelancer.badge")}
              </div>
            )}
            <div
              className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${pricingPlans.freelancer.color}`}
            />

            <CardHeader className="text-center pb-8 pt-8">
              <div
                className={`mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br ${pricingPlans.freelancer.color} w-fit relative`}
              >
                <pricingPlans.freelancer.icon
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                  focusable="false"
                />
                <Sparkles
                  className="h-4 w-4 text-yellow-300 absolute -top-1 -right-1"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
              <CardTitle className="text-2xl mb-2">
                {t(pricingPlans.freelancer.nameKey)}
              </CardTitle>
              <CardDescription className="text-sm">
                {t(pricingPlans.freelancer.descriptionKey)}
              </CardDescription>

              <div className="mt-6">
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-bold">299</span>
                  <span className="text-2xl text-muted-foreground">﷼</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {pricingPlans.freelancer.periodKey
                    ? t(pricingPlans.freelancer.periodKey)
                    : ""}
                </p>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-3">
                {pricingPlans.freelancer.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    {feature.included ? (
                      <Check
                        className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                        aria-label={includedLabel}
                        role="img"
                        focusable="false"
                      />
                    ) : (
                      <X
                        className="h-5 w-5 text-gray-300 flex-shrink-0 mt-0.5"
                        aria-label={excludedLabel}
                        role="img"
                        focusable="false"
                      />
                    )}
                    <span
                      className={`text-sm ${!feature.included ? "text-muted-foreground line-through" : ""}`}
                    >
                      {feature.nameKey ? t(feature.nameKey) : feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/signup">
                <Button
                  className={`w-full bg-gradient-to-r ${pricingPlans.freelancer.color} hover:opacity-90`}
                >
                  {t(pricingPlans.freelancer.ctaKey)}
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Company Plan */}
          <Card
            className={`relative overflow-hidden hover:shadow-2xl transition-all duration-300`}
          >
            <div
              className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${pricingPlans.company.color}`}
            />

            <CardHeader className="text-center pb-6 pt-8">
              <div
                className={`mx-auto mb-4 p-4 rounded-2xl bg-gradient-to-br ${pricingPlans.company.color} w-fit`}
              >
                <pricingPlans.company.icon
                  className="h-8 w-8 text-white"
                  aria-hidden="true"
                  focusable="false"
                />
              </div>
              <CardTitle className="text-2xl mb-2">
                {t(pricingPlans.company.nameKey)}
              </CardTitle>
              <CardDescription className="text-sm">
                {t(pricingPlans.company.descriptionKey)}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Company Tiers */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {(pricingPlans.company.tiers ?? []).map(tier => {
                  const tierDescriptionId = `tier-${tier.id}-details`;
                  const tierPrice = tier.price
                    ? `${tier.price} ﷼`
                    : t("pricing.plan.company.tier.custom_price");
                  const tierEmployees = (() => {
                    const employeesLabel =
                      tier.employeesLabel ?? tier.employees.toString();
                    const translated = t(
                      "pricing.plan.company.tier.employees",
                      {
                        count: tier.employees,
                        defaultValue: `حتى ${employeesLabel} موظف`,
                      }
                    );
                    return translated.replace(
                      "{{count}}",
                      employeesLabel.toString()
                    );
                  })();

                  return (
                  <button
                      key={tier.id}
                      type="button"
                      aria-pressed={selectedCompanyTier === tier.id}
                      aria-describedby={tierDescriptionId}
                      className={`p-3 rounded-lg border-2 transition-all text-center ${
                        selectedCompanyTier === tier.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      onClick={() => setSelectedCompanyTier(tier.id)}
                    >
                      <div className="font-semibold text-sm">
                        {tier.nameKey ? t(tier.nameKey) : tier.name}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {tierPrice}
                      </div>
                      <div
                        id={tierDescriptionId}
                        className="text-xs text-muted-foreground"
                      >
                        {tierEmployees}
                      </div>
                      {tier.popular && (
                        <Badge className="mt-1 text-xs bg-purple-500">
                          {t("pricing.plan.company.tier.popular_badge")}
                        </Badge>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-3">
                {pricingPlans.company.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Check
                      className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5"
                      aria-label={includedLabel}
                      role="img"
                      focusable="false"
                    />
                    <span className="text-sm">
                      {feature.nameKey ? t(feature.nameKey) : feature.name}
                    </span>
                  </div>
                ))}
              </div>

              <Link href="/signup">
                <Button
                  className={`w-full bg-gradient-to-r ${pricingPlans.company.color} hover:opacity-90`}
                >
                  {t(pricingPlans.company.ctaKey)}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {(() => {
          const comparisonRows: Array<{
            nameKey?: string;
            name?: string;
            employee: boolean | string;
            freelancer: boolean | string;
            company: boolean | string;
            employeeKey?: string;
            freelancerKey?: string;
            companyKey?: string;
          }> = [
            {
              nameKey: "pricing.table.row.eos",
              employee: true,
              freelancer: true,
              company: true,
            },
            {
              nameKey: "pricing.table.row.vacation",
              employee: true,
              freelancer: true,
              company: true,
            },
            {
              nameKey: "pricing.table.row.letters",
              employee: "15",
              freelancer: "55+",
              company: "55+",
            },
            {
              nameKey: "pricing.table.row.ai",
              employee: true,
              freelancer: true,
              company: true,
            },
            {
              nameKey: "pricing.table.row.export_pdf",
              employee: true,
              freelancer: true,
              company: true,
            },
            {
              nameKey: "pricing.table.row.export_word",
              employee: false,
              freelancer: true,
              company: true,
            },
            {
              nameKey: "pricing.table.row.dashboard",
              employee: false,
              freelancer: true,
              company: true,
            },
            {
              nameKey: "pricing.table.row.advanced_reports",
              employee: false,
              freelancer: true,
              company: true,
            },
            {
              nameKey: "pricing.table.row.ats",
              employee: false,
              freelancer: false,
              company: true,
            },
            {
              nameKey: "pricing.table.row.team",
              employee: false,
              freelancer: false,
              company: true,
            },
            {
              nameKey: "pricing.table.row.tickets",
              employee: false,
              freelancer: false,
              company: true,
            },
            {
              nameKey: "pricing.table.row.api",
              employee: false,
              freelancer: false,
              company: true,
            },
            {
              nameKey: "pricing.table.row.support",
              employeeKey: "pricing.table.row.support.employee",
              freelancerKey: "pricing.table.row.support.freelancer",
              companyKey: "pricing.table.row.support.company",
              employee: "",
              freelancer: "",
              company: "",
            },
          ];

          return (
            <Card className="mb-16">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">
                  {t("pricing.table.title")}
                </CardTitle>
                <CardDescription>
                  {t("pricing.table.subtitle")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full" role="table">
                    <caption className="sr-only">{tableCaption}</caption>
                    <thead>
                      <tr className="border-b">
                        <th scope="col" className="text-right p-4 font-semibold">
                          {t("pricing.table.col.feature")}
                        </th>
                        <th scope="col" className="text-center p-4 font-semibold">
                          {t("pricing.table.col.employee")}
                        </th>
                        <th
                          scope="col"
                          className="text-center p-4 font-semibold bg-purple-50"
                        >
                          {t("pricing.table.col.freelancer")}
                        </th>
                        <th scope="col" className="text-center p-4 font-semibold">
                          {t("pricing.table.col.company")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, index) => (
                        <tr key={index} className="border-b hover:bg-gray-50">
                          <td className="p-4">
                            {row.nameKey ? t(row.nameKey) : row.name}
                          </td>
                          <td className="p-4 text-center">
                            {typeof row.employee === "boolean" ? (
                              row.employee ? (
                                <Check
                                  className="h-5 w-5 text-green-500 mx-auto"
                                  aria-label={includedLabel}
                                  role="img"
                                  focusable="false"
                                />
                              ) : (
                                <X
                                  className="h-5 w-5 text-gray-300 mx-auto"
                                  aria-label={excludedLabel}
                                  role="img"
                                  focusable="false"
                                />
                              )
                            ) : (
                              <span className="text-sm">
                                {row.employeeKey
                                  ? t(row.employeeKey)
                                  : row.employee}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center bg-purple-50">
                            {typeof row.freelancer === "boolean" ? (
                              row.freelancer ? (
                                <Check
                                  className="h-5 w-5 text-green-500 mx-auto"
                                  aria-label={includedLabel}
                                  role="img"
                                  focusable="false"
                                />
                              ) : (
                                <X
                                  className="h-5 w-5 text-gray-300 mx-auto"
                                  aria-label={excludedLabel}
                                  role="img"
                                  focusable="false"
                                />
                              )
                            ) : (
                              <span className="text-sm font-semibold">
                                {row.freelancerKey
                                  ? t(row.freelancerKey)
                                  : row.freelancer}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {typeof row.company === "boolean" ? (
                              row.company ? (
                                <Check
                                  className="h-5 w-5 text-green-500 mx-auto"
                                  aria-label={includedLabel}
                                  role="img"
                                  focusable="false"
                                />
                              ) : (
                                <X
                                  className="h-5 w-5 text-gray-300 mx-auto"
                                  aria-label={excludedLabel}
                                  role="img"
                                  focusable="false"
                                />
                              )
                            ) : (
                              <span className="text-sm font-semibold">
                                {row.companyKey
                                  ? t(row.companyKey)
                                  : row.company}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          );
        })()}

        {/* Trust Badges */}
        <div className="grid md:grid-cols-4 gap-6 mb-16">
          {trustBadges.map(badge => (
            <Card key={badge.titleKey} className="text-center p-6">
              <badge.icon
                className={`h-8 w-8 mx-auto mb-3 ${badge.color}`}
                aria-hidden="true"
                focusable="false"
              />
              <h3 className="font-semibold mb-2">{t(badge.titleKey)}</h3>
              <p className="text-sm text-muted-foreground">
                {t(badge.descKey)}
              </p>
            </Card>
          ))}
        </div>

        {/* Pricing FAQ */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 p-3 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 w-fit">
              <HelpCircle
                className="h-6 w-6 text-white"
                aria-hidden="true"
                focusable="false"
              />
            </div>
            <CardTitle className="text-2xl">{t("pricing.faq.title")}</CardTitle>
            <CardDescription>{t("pricing.faq.subtitle")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {pricingFaq.map(item => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-right">
                    <span className="font-semibold">
                      {t(item.questionKey)}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {t(item.answerKey)}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0">
          <CardContent className="py-12 text-center">
            <h2 className="text-3xl font-bold mb-4">{t("pricing.cta.title")}</h2>
            <p className="text-lg mb-8 text-white/90 max-w-2xl mx-auto">
              {t("pricing.cta.subtitle")}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/signup">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  {t("pricing.cta.primary")}
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10"
                >
                  {t("pricing.cta.secondary")}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
