/**
 * AI Dashboard Page
 * Provides an overview of all AI-powered tools and Saudi regulations features
 */

import { useState } from 'react';
import { Link } from 'wouter';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Calculator, 
  Scale, 
  FileText, 
  Users, 
  Shield, 
  TrendingUp,
  MessageSquare,
  BarChart3,
  BookOpen,
  CheckCircle,
  ArrowRight,
  Sparkles,
  Building2,
  Landmark,
  AlertTriangle,
  Heart
} from 'lucide-react';
import { useRegulations } from '@/hooks/useAI';

interface FeatureCardProps {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

const FeatureCard = ({ 
  title, 
  titleAr, 
  description, 
  descriptionAr, 
  icon, 
  href, 
  badge, 
  badgeVariant = 'default' 
}: FeatureCardProps) => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';

  return (
    <Link href={href}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer group border-2 hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="p-3 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </div>
            {badge && (
              <Badge variant={badgeVariant}>{badge}</Badge>
            )}
          </div>
          <CardTitle className="mt-4 group-hover:text-primary transition-colors">
            {isArabic ? titleAr : title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {isArabic ? descriptionAr : description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="ghost" className="p-0 h-auto text-primary group-hover:gap-3 transition-all">
            {isArabic ? 'استكشف' : 'Explore'}
            <ArrowRight className="w-4 h-4 mr-2 rtl:rotate-180" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );
};

interface QuickStatProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

const QuickStat = ({ label, value, icon, trend }: QuickStatProps) => (
  <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
    <div className="p-2 rounded-lg bg-background">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold flex items-center gap-2">
        {value}
        {trend === 'up' && <TrendingUp className="w-4 h-4 text-green-500" />}
        {trend === 'down' && <TrendingUp className="w-4 h-4 text-red-500 rotate-180" />}
      </p>
    </div>
  </div>
);

export default function AIDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('overview');
  const { data: regulations } = useRegulations();

  const aiFeatures: FeatureCardProps[] = [
    {
      title: 'Saudi Regulations',
      titleAr: 'الأنظمة السعودية',
      description: 'Complete guide to Saudi labor laws and regulations',
      descriptionAr: 'دليل شامل لقوانين وأنظمة العمل السعودية',
      icon: <Scale className="w-6 h-6" />,
      href: '/regulations',
      badge: isArabic ? '10 أنظمة' : '10 Laws',
      badgeVariant: 'secondary'
    },
    {
      title: 'Financial Calculators',
      titleAr: 'الحاسبات المالية',
      description: 'GOSI, End of Service, and Leave calculators',
      descriptionAr: 'حاسبات التأمينات ومكافأة نهاية الخدمة والإجازات',
      icon: <Calculator className="w-6 h-6" />,
      href: '/calculators',
      badge: isArabic ? 'جديد' : 'New',
      badgeVariant: 'default'
    },
    {
      title: 'AI Chat Assistant',
      titleAr: 'مساعد الذكاء الاصطناعي',
      description: 'Get instant answers to HR questions',
      descriptionAr: 'احصل على إجابات فورية لأسئلة الموارد البشرية',
      icon: <MessageSquare className="w-6 h-6" />,
      href: '/ai/chat'
    },
    {
      title: 'AI Analytics',
      titleAr: 'تحليلات الذكاء الاصطناعي',
      description: 'Advanced workforce analytics and insights',
      descriptionAr: 'تحليلات متقدمة للقوى العاملة',
      icon: <BarChart3 className="w-6 h-6" />,
      href: '/ai/analytics'
    },
    {
      title: 'Performance Evaluator',
      titleAr: 'تقييم الأداء',
      description: 'AI-powered employee performance analysis',
      descriptionAr: 'تحليل أداء الموظفين بالذكاء الاصطناعي',
      icon: <TrendingUp className="w-6 h-6" />,
      href: '/ai/performance-evaluator'
    },
    {
      title: 'Document Generator',
      titleAr: 'منشئ المستندات',
      description: 'Generate HR documents and contracts',
      descriptionAr: 'إنشاء مستندات وعقود الموارد البشرية',
      icon: <FileText className="w-6 h-6" />,
      href: '/document-generator'
    }
  ];

  const regulationCategories = [
    {
      name: isArabic ? 'قوانين العمل' : 'Labor Laws',
      nameAr: 'قوانين العمل',
      count: 4,
      icon: <Scale className="w-5 h-5" />,
      color: 'text-blue-500'
    },
    {
      name: isArabic ? 'التأمينات' : 'Insurance',
      nameAr: 'التأمينات',
      count: 2,
      icon: <Shield className="w-5 h-5" />,
      color: 'text-green-500'
    },
    {
      name: isArabic ? 'التوظيف' : 'Employment',
      nameAr: 'التوظيف',
      count: 2,
      icon: <Users className="w-5 h-5" />,
      color: 'text-purple-500'
    },
    {
      name: isArabic ? 'التقنية' : 'Technology',
      nameAr: 'التقنية',
      count: 1,
      icon: <Brain className="w-5 h-5" />,
      color: 'text-orange-500'
    },
    {
      name: isArabic ? 'السلامة' : 'Safety',
      nameAr: 'السلامة',
      count: 1,
      icon: <AlertTriangle className="w-5 h-5" />,
      color: 'text-red-500'
    }
  ];

  const quickActions = [
    {
      title: isArabic ? 'حساب التأمينات' : 'Calculate GOSI',
      icon: <Landmark className="w-5 h-5" />,
      href: '/calculators'
    },
    {
      title: isArabic ? 'مكافأة نهاية الخدمة' : 'End of Service',
      icon: <Calculator className="w-5 h-5" />,
      href: '/calculators'
    },
    {
      title: isArabic ? 'فحص الامتثال' : 'Check Compliance',
      icon: <CheckCircle className="w-5 h-5" />,
      href: '/regulations'
    },
    {
      title: isArabic ? 'نظام العمل' : 'Labor Law',
      icon: <BookOpen className="w-5 h-5" />,
      href: '/regulations'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-background py-16 px-4">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.5))]" />
        <div className="container mx-auto max-w-7xl relative">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 rounded-2xl bg-primary text-primary-foreground">
              <Sparkles className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">
                {isArabic ? 'مركز الذكاء الاصطناعي' : 'AI Command Center'}
              </h1>
              <p className="text-xl text-muted-foreground">
                {isArabic 
                  ? 'أدوات ذكية لإدارة الموارد البشرية المتوافقة مع الأنظمة السعودية'
                  : 'Smart tools for Saudi-compliant HR management'}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <QuickStat 
              label={isArabic ? 'الأنظمة المتاحة' : 'Available Regulations'}
              value={regulations?.length || 10}
              icon={<Scale className="w-5 h-5 text-primary" />}
            />
            <QuickStat 
              label={isArabic ? 'أدوات الذكاء الاصطناعي' : 'AI Tools'}
              value={6}
              icon={<Brain className="w-5 h-5 text-primary" />}
            />
            <QuickStat 
              label={isArabic ? 'الحاسبات' : 'Calculators'}
              value={3}
              icon={<Calculator className="w-5 h-5 text-primary" />}
            />
            <QuickStat 
              label={isArabic ? 'فئات الأنظمة' : 'Categories'}
              value={5}
              icon={<BookOpen className="w-5 h-5 text-primary" />}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">
              {isArabic ? 'نظرة عامة' : 'Overview'}
            </TabsTrigger>
            <TabsTrigger value="regulations">
              {isArabic ? 'الأنظمة' : 'Regulations'}
            </TabsTrigger>
            <TabsTrigger value="tools">
              {isArabic ? 'الأدوات' : 'Tools'}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Quick Actions */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {isArabic ? 'إجراءات سريعة' : 'Quick Actions'}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickActions.map((action, index) => (
                  <Link key={index} href={action.href}>
                    <Button 
                      variant="outline" 
                      className="w-full h-auto py-4 flex flex-col gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {action.icon}
                      <span className="text-sm">{action.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </section>

            {/* AI Features Grid */}
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {isArabic ? 'جميع الميزات' : 'All Features'}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {aiFeatures.map((feature, index) => (
                  <FeatureCard key={index} {...feature} />
                ))}
              </div>
            </section>
          </TabsContent>

          {/* Regulations Tab */}
          <TabsContent value="regulations" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {isArabic ? 'فئات الأنظمة السعودية' : 'Saudi Regulations Categories'}
              </h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {regulationCategories.map((category, index) => (
                  <Link key={index} href="/regulations">
                    <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-lg bg-muted ${category.color}`}>
                              {category.icon}
                            </div>
                            <div>
                              <p className="font-semibold group-hover:text-primary transition-colors">
                                {category.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {category.count} {isArabic ? 'أنظمة' : 'regulations'}
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1 transition-all" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>

            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">
                  {isArabic ? 'الأنظمة الرئيسية' : 'Key Regulations'}
                </h2>
                <Link href="/regulations">
                  <Button variant="outline">
                    {isArabic ? 'عرض الكل' : 'View All'}
                    <ArrowRight className="w-4 h-4 mr-2 rtl:rotate-180" />
                  </Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Scale className="w-6 h-6 text-primary" />
                      <div>
                        <CardTitle className="text-lg">
                          {isArabic ? 'نظام العمل السعودي' : 'Saudi Labor Law'}
                        </CardTitle>
                        <CardDescription>
                          {isArabic ? '245 مادة قانونية' : '245 legal articles'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {isArabic 
                        ? 'القانون الأساسي المنظم لعلاقات العمل في المملكة العربية السعودية'
                        : 'The primary law governing employment relations in Saudi Arabia'}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Shield className="w-6 h-6 text-green-500" />
                      <div>
                        <CardTitle className="text-lg">
                          {isArabic ? 'نظام التأمينات الاجتماعية' : 'Social Insurance Law'}
                        </CardTitle>
                        <CardDescription>
                          {isArabic ? '62 مادة قانونية' : '62 legal articles'}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {isArabic 
                        ? 'ينظم التأمين ضد المخاطر المهنية والتقاعد للعاملين'
                        : 'Regulates occupational hazard insurance and retirement for workers'}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">
                {isArabic ? 'الحاسبات المالية' : 'Financial Calculators'}
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <Link href="/calculators">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-600 w-fit">
                        <Landmark className="w-6 h-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {isArabic ? 'حاسبة التأمينات (GOSI)' : 'GOSI Calculator'}
                      </CardTitle>
                      <CardDescription>
                        {isArabic 
                          ? 'احسب مساهمات التأمينات الاجتماعية للموظف وصاحب العمل'
                          : 'Calculate social insurance contributions for employee and employer'}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/calculators">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 w-fit">
                        <Calculator className="w-6 h-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {isArabic ? 'مكافأة نهاية الخدمة' : 'End of Service Benefit'}
                      </CardTitle>
                      <CardDescription>
                        {isArabic 
                          ? 'احسب مكافأة نهاية الخدمة حسب نظام العمل السعودي'
                          : 'Calculate end of service benefits per Saudi Labor Law'}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
                <Link href="/calculators">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="p-3 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 w-fit">
                        <Heart className="w-6 h-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {isArabic ? 'حاسبة الإجازات' : 'Leave Calculator'}
                      </CardTitle>
                      <CardDescription>
                        {isArabic 
                          ? 'احسب رصيد الإجازات السنوية المستحقة'
                          : 'Calculate annual leave entitlement balance'}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                {isArabic ? 'أدوات الامتثال' : 'Compliance Tools'}
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link href="/regulations">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="p-3 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 w-fit">
                        <CheckCircle className="w-6 h-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {isArabic ? 'فحص الامتثال' : 'Compliance Checker'}
                      </CardTitle>
                      <CardDescription>
                        {isArabic 
                          ? 'تحقق من امتثال شركتك للأنظمة واللوائح السعودية'
                          : 'Verify your company compliance with Saudi regulations'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {isArabic ? 'تحليل فوري' : 'Instant analysis'}</li>
                        <li>• {isArabic ? 'توصيات مفصلة' : 'Detailed recommendations'}</li>
                        <li>• {isArabic ? 'مستوى المخاطر' : 'Risk level assessment'}</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/regulations">
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader>
                      <div className="p-3 rounded-xl bg-teal-100 dark:bg-teal-900/30 text-teal-600 w-fit">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <CardTitle className="group-hover:text-primary transition-colors">
                        {isArabic ? 'تحليل السعودة' : 'Saudization Analysis'}
                      </CardTitle>
                      <CardDescription>
                        {isArabic 
                          ? 'تحليل نسب التوطين ومتطلبات نطاقات'
                          : 'Analyze localization ratios and Nitaqat requirements'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• {isArabic ? 'حساب النسبة الحالية' : 'Current ratio calculation'}</li>
                        <li>• {isArabic ? 'تصنيف نطاقات' : 'Nitaqat classification'}</li>
                        <li>• {isArabic ? 'خطة التحسين' : 'Improvement plan'}</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
