import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  UserCircle,
  Briefcase,
  Check,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Shield,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { type LucideIcon } from "lucide-react";

interface AccountTypeOption {
  type: "company" | "consultant" | "employee";
  icon: LucideIcon;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  price: string;
  priceEn: string;
  features: string[];
  featuresEn: string[];
  color: string;
  gradient: string;
  badge?: string;
  badgeEn?: string;
  href: string;
}

export default function AccountType() {
  const { i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const isArabic = i18n.language === "ar";

  const accountTypes: AccountTypeOption[] = [
    {
      type: "company",
      icon: Building2,
      title: "حساب شركة",
      titleEn: "Company Account",
      description: "للشركات والمؤسسات التي تحتاج نظام HR متكامل",
      descriptionEn: "For companies and organizations needing complete HR system",
      price: "يبدأ من 1,500 ريال/شهر",
      priceEn: "Starting from 1,500 SAR/month",
      features: [
        "نظام ATS كامل للتوظيف",
        "إدارة الموظفين والحضور",
        "نظام التذاكر والمهام",
        "التقارير والإحصائيات المتقدمة",
        "إدارة الرواتب والمزايا",
        "نظام الصلاحيات المتعدد",
        "الأدوات الذكية بالذكاء الاصطناعي",
        "دعم فني مخصص 24/7",
      ],
      featuresEn: [
        "Complete ATS recruitment system",
        "Employee & attendance management",
        "Tickets & tasks system",
        "Advanced reports & analytics",
        "Payroll & benefits management",
        "Multi-level permissions system",
        "AI-powered smart tools",
        "Dedicated 24/7 support",
      ],
      color: "blue",
      gradient: "from-blue-600 to-cyan-600",
      badge: "الأكثر شيوعاً",
      badgeEn: "Most Popular",
      href: "/signup/company",
    },
    {
      type: "consultant",
      icon: Briefcase,
      title: "حساب مستقل HR",
      titleEn: "HR Consultant Account",
      description: "للمستشارين ومستقلي الموارد البشرية",
      descriptionEn: "For HR consultants and freelancers",
      price: "299 ريال/شهر",
      priceEn: "299 SAR/month",
      features: [
        "الأدوات الذكية الثلاثة",
        "حاسبة نهاية الخدمة",
        "حاسبة الإجازات",
        "مولد الخطابات بالذكاء الاصطناعي",
        "سجل العملاء والمشاريع",
        "المساعد الذكي للاستشارات",
        "تصدير التقارير بـ PDF",
        "دعم فني سريع",
      ],
      featuresEn: [
        "Three smart tools",
        "End of service calculator",
        "Leave calculator",
        "AI-powered letter generator",
        "Clients & projects log",
        "Smart consultation assistant",
        "PDF reports export",
        "Fast technical support",
      ],
      color: "purple",
      gradient: "from-purple-600 to-pink-600",
      badge: "الأفضل للمستقلين",
      badgeEn: "Best for Freelancers",
      href: "/signup/consultant",
    },
    {
      type: "employee",
      icon: UserCircle,
      title: "حساب موظف",
      titleEn: "Employee Account",
      description: "للموظفين الباحثين عن وظائف",
      descriptionEn: "For employees looking for jobs",
      price: "مجاناً",
      priceEn: "Free",
      features: [
        "البحث عن الوظائف",
        "التقديم على الوظائف",
        "تحديث السيرة الذاتية",
        "متابعة حالة الطلبات",
        "الأدوات الذكية المجانية",
        "حاسبة نهاية الخدمة",
        "المساعد الذكي",
        "إشعارات الوظائف الجديدة",
      ],
      featuresEn: [
        "Job search",
        "Job applications",
        "Resume updates",
        "Application status tracking",
        "Free smart tools",
        "End of service calculator",
        "Smart assistant",
        "New job notifications",
      ],
      color: "green",
      gradient: "from-green-600 to-emerald-600",
      badge: "مجاني",
      badgeEn: "Free",
      href: "/signup/employee",
    },
  ];

  const handleSelectType = (type: string, href: string) => {
    setSelectedType(type);
    setTimeout(() => {
      setLocation(href);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <BackButton />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl mb-6 shadow-xl">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isArabic ? "اختر نوع حسابك" : "Choose Your Account Type"}
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            {isArabic
              ? "اختر الخطة المناسبة لاحتياجاتك واستمتع بميزات منصة رابِط"
              : "Choose the plan that fits your needs and enjoy Rabit platform features"}
          </p>
        </div>

        {/* Account Type Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {accountTypes.map((account) => {
            const Icon = account.icon;
            const isSelected = selectedType === account.type;

            return (
              <Card
                key={account.type}
                className={`relative overflow-hidden transition-all duration-300 cursor-pointer hover:shadow-2xl hover:-translate-y-2 ${
                  isSelected
                    ? "ring-4 ring-purple-500 shadow-2xl scale-105"
                    : "hover:shadow-xl"
                }`}
                onClick={() => handleSelectType(account.type, account.href)}
              >
                {/* Badge */}
                {account.badge && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge
                      className={`bg-gradient-to-r ${account.gradient} text-white`}
                    >
                      {isArabic ? account.badge : account.badgeEn}
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${account.gradient} rounded-2xl mb-4 mx-auto shadow-lg`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>

                  <CardTitle className="text-2xl mb-2">
                    {isArabic ? account.title : account.titleEn}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isArabic ? account.description : account.descriptionEn}
                  </CardDescription>

                  {/* Price */}
                  <div className="mt-4">
                    <span
                      className={`text-3xl font-bold bg-gradient-to-r ${account.gradient} bg-clip-text text-transparent`}
                    >
                      {isArabic ? account.price : account.priceEn}
                    </span>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    {(isArabic ? account.features : account.featuresEn).map(
                      (feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {feature}
                          </span>
                        </li>
                      )
                    )}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${account.gradient} hover:opacity-90 transition-all`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectType(account.type, account.href);
                    }}
                  >
                    {isArabic ? "ابدأ الآن" : "Get Started"}
                    <ArrowRight className="w-4 h-4 ms-2" />
                  </Button>
                </CardContent>

                {/* Selected Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-purple-500/10 pointer-events-none" />
                )}
              </Card>
            );
          })}
        </div>

        {/* Features Highlight */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mt-12">
          <h2 className="text-2xl font-bold text-center mb-8">
            {isArabic
              ? "جميع الحسابات تشمل"
              : "All Accounts Include"}
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl mb-3">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-1">
                {isArabic ? "أمان عالي" : "High Security"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic
                  ? "حماية بياناتك بأحدث معايير الأمان"
                  : "Data protection with latest security standards"}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl mb-3">
                <Zap className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">
                {isArabic ? "أداء سريع" : "Fast Performance"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic
                  ? "تجربة سلسة وسريعة"
                  : "Smooth and fast experience"}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl mb-3">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold mb-1">
                {isArabic ? "دعم فني" : "Technical Support"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic
                  ? "فريق دعم متاح لمساعدتك"
                  : "Support team available to help"}
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-xl mb-3">
                <Sparkles className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-1">
                {isArabic ? "ذكاء اصطناعي" : "AI Powered"}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic
                  ? "أدوات مدعومة بالذكاء الاصطناعي"
                  : "AI-powered smart tools"}
              </p>
            </div>
          </div>
        </div>

        {/* Already Have Account */}
        <div className="text-center mt-8">
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
            <Link href="/login">
              <a className="text-blue-600 hover:text-blue-700 font-semibold">
                {isArabic ? "تسجيل الدخول" : "Login"}
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
