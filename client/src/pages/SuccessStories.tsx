import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  Users,
  TrendingUp,
  DollarSign,
  CheckCircle2,
  ArrowRight,
  Star,
  Quote,
  Target,
  Zap,
  Award,
  Clock,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { Link } from "wouter";

export default function SuccessStories() {
  const { isArabic } = useLanguage();

  const stories = [
    {
      company: isArabic ? "شركة التقنية المتقدمة" : "Advanced Tech Company",
      industry: isArabic ? "التقنية" : "Technology",
      employees: 250,
      logo: "🚀",
      gradient: "from-blue-500 to-cyan-500",
      challenge: isArabic
        ? "كانت الشركة تعاني من صعوبة في إدارة عملية التوظيف وتتبع الموظفين الجدد، مما أدى إلى تأخيرات وأخطاء في البيانات"
        : "The company struggled with managing the recruitment process and tracking new employees, leading to delays and data errors",
      solution: isArabic
        ? "تم تطبيق نظام رابِط الشامل لإدارة الموارد البشرية مع نظام ATS المتقدم وأدوات الذكاء الاصطناعي"
        : "Implemented Rabit's comprehensive HR management system with advanced ATS and AI tools",
      results: [
        {
          metric: "50%",
          label: isArabic ? "تقليل وقت التوظيف" : "Reduced hiring time",
          icon: Clock,
        },
        {
          metric: "85%",
          label: isArabic ? "تحسين دقة البيانات" : "Improved data accuracy",
          icon: Target,
        },
        {
          metric: "40%",
          label: isArabic ? "توفير في التكاليف" : "Cost savings",
          icon: DollarSign,
        },
      ],
      testimonial: isArabic
        ? "رابِط غيّر الطريقة التي ندير بها الموارد البشرية. النظام سهل الاستخدام والأدوات الذكية توفر لنا ساعات من العمل اليدوي"
        : "Rabit transformed how we manage HR. The system is easy to use and the smart tools save us hours of manual work",
      author: isArabic ? "أحمد المالك - مدير الموارد البشرية" : "Ahmed Al-Malik - HR Manager",
      rating: 5,
    },
    {
      company: isArabic ? "مجموعة الخدمات المالية" : "Financial Services Group",
      industry: isArabic ? "الخدمات المالية" : "Financial Services",
      employees: 450,
      logo: "💼",
      gradient: "from-purple-500 to-pink-500",
      challenge: isArabic
        ? "تعقيد في إدارة الرواتب والإجازات مع الحاجة للامتثال الكامل لنظام العمل السعودي"
        : "Complexity in managing payroll and leave with need for full compliance with Saudi Labor Law",
      solution: isArabic
        ? "استخدام أدوات رابِط لإدارة الرواتب والإجازات مع نظام التحقق القانوني التلقائي"
        : "Used Rabit's payroll and leave management tools with automatic legal verification system",
      results: [
        {
          metric: "100%",
          label: isArabic ? "توافق قانوني" : "Legal compliance",
          icon: CheckCircle2,
        },
        {
          metric: "60%",
          label: isArabic ? "توفير الوقت" : "Time saved",
          icon: Zap,
        },
        {
          metric: "95%",
          label: isArabic ? "رضا الموظفين" : "Employee satisfaction",
          icon: Star,
        },
      ],
      testimonial: isArabic
        ? "أصبح حساب الرواتب والإجازات أمراً بسيطاً وسريعاً. لم نعد نقلق بشأن الامتثال القانوني"
        : "Payroll and leave calculations became simple and fast. We no longer worry about legal compliance",
      author: isArabic ? "سارة العمري - مديرة المالية" : "Sarah Al-Omari - Finance Manager",
      rating: 5,
    },
    {
      company: isArabic ? "شركة التجزئة الكبرى" : "Major Retail Company",
      industry: isArabic ? "التجزئة" : "Retail",
      employees: 1200,
      logo: "🛍️",
      gradient: "from-green-500 to-emerald-500",
      challenge: isArabic
        ? "إدارة عدد كبير من الموظفين عبر فروع متعددة وصعوبة في التواصل والتنسيق"
        : "Managing a large number of employees across multiple branches with communication and coordination difficulties",
      solution: isArabic
        ? "تطبيق منصة رابِط السحابية مع نظام التذاكر والمهام والتقارير المركزية"
        : "Implemented Rabit's cloud platform with ticketing, tasks, and centralized reporting",
      results: [
        {
          metric: "70%",
          label: isArabic ? "تحسين التواصل" : "Improved communication",
          icon: Users,
        },
        {
          metric: "45%",
          label: isArabic ? "زيادة الإنتاجية" : "Productivity increase",
          icon: TrendingUp,
        },
        {
          metric: "80%",
          label: isArabic ? "تقليل الأخطاء" : "Error reduction",
          icon: Award,
        },
      ],
      testimonial: isArabic
        ? "رابِط ساعدنا في توحيد عمليات الموارد البشرية عبر جميع الفروع. النظام موثوق وسريع"
        : "Rabit helped us unify HR processes across all branches. The system is reliable and fast",
      author: isArabic ? "خالد السعيد - المدير العام" : "Khaled Al-Saeed - General Manager",
      rating: 5,
    },
  ];

  const stats = [
    {
      number: "500+",
      label: isArabic ? "شركة تثق بنا" : "Companies trust us",
      icon: Building2,
    },
    {
      number: "50K+",
      label: isArabic ? "موظف يستخدم المنصة" : "Employees use the platform",
      icon: Users,
    },
    {
      number: "98%",
      label: isArabic ? "معدل الرضا" : "Satisfaction rate",
      icon: Star,
    },
    {
      number: "45%",
      label: isArabic ? "متوسط التوفير" : "Average savings",
      icon: TrendingUp,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <Badge className="mb-4" variant="secondary">
          {isArabic ? "قصص النجاح" : "Success Stories"}
        </Badge>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          {isArabic
            ? "شركات حققت نجاحاً مع رابِط"
            : "Companies Achieving Success with Rabit"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {isArabic
            ? "اكتشف كيف ساعدت منصة رابِط الشركات على تحسين إدارة الموارد البشرية وتحقيق نتائج استثنائية"
            : "Discover how Rabit platform helped companies improve HR management and achieve exceptional results"}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-12">
          {stats.map((stat, idx) => (
            <Card key={idx} className="text-center">
              <CardContent className="pt-6">
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold mb-1">{stat.number}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Success Stories */}
      <section className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          {stories.map((story, idx) => (
            <Card
              key={idx}
              className="overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
            >
              <div className={`h-2 bg-gradient-to-r ${story.gradient}`} />
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-5xl">{story.logo}</div>
                    <div>
                      <CardTitle className="text-2xl mb-2">
                        {story.company}
                      </CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{story.industry}</Badge>
                        <Badge variant="outline">
                          {story.employees} {isArabic ? "موظف" : "employees"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(story.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Challenge */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Target className="h-5 w-5 text-red-600" />
                    {isArabic ? "التحدي" : "Challenge"}
                  </h3>
                  <p className="text-muted-foreground">{story.challenge}</p>
                </div>

                <Separator />

                {/* Solution */}
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                    {isArabic ? "الحل" : "Solution"}
                  </h3>
                  <p className="text-muted-foreground">{story.solution}</p>
                </div>

                <Separator />

                {/* Results */}
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    {isArabic ? "النتائج" : "Results"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {story.results.map((result, idx) => (
                      <Card key={idx} className="text-center bg-muted/50">
                        <CardContent className="pt-6">
                          <result.icon className="h-8 w-8 mx-auto mb-2 text-primary" />
                          <div className="text-3xl font-bold mb-1">
                            {result.metric}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {result.label}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Testimonial */}
                <div className="bg-muted/50 rounded-lg p-6 relative">
                  <Quote className="h-8 w-8 text-primary/20 absolute top-4 left-4" />
                  <p className="text-lg italic mb-4 pr-12">{story.testimonial}</p>
                  <p className="font-semibold text-right">{story.author}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none shadow-2xl">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic
                ? "هل أنت مستعد لتحقيق النجاح؟"
                : "Ready to Achieve Success?"}
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              {isArabic
                ? "انضم إلى مئات الشركات التي تستخدم رابِط لتحسين إدارة الموارد البشرية"
                : "Join hundreds of companies using Rabit to improve HR management"}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100 gap-2"
                >
                  {isArabic ? "ابدأ مجاناً" : "Start Free"}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white text-white hover:bg-white/10 gap-2"
                >
                  {isArabic ? "تحدث مع خبير" : "Talk to an Expert"}
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
