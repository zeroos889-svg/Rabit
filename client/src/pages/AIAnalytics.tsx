import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Calendar,
  Award,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Bot,
  BarChart3,
  PieChart,
  LineChart,
  Download,
  RefreshCw,
  Lightbulb,
  Target,
} from "lucide-react";
import { useLanguage } from "@/hooks/use-language";

export default function AIAnalytics() {
  const { isArabic } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState("month");
  const [isGenerating, setIsGenerating] = useState(false);

  // Mock data - replace with real data
  const metrics = {
    totalEmployees: 245,
    activeEmployees: 238,
    newHires: 12,
    turnoverRate: 2.8,
    avgSalary: 8500,
    totalPayroll: 2082500,
    leaveRequests: 45,
    pendingTasks: 28,
  };

  const insights = isArabic
    ? [
        {
          type: "positive",
          title: "معدل دوران منخفض",
          description: "معدل دوران الموظفين 2.8% وهو أقل من متوسط الصناعة (5%)",
          action: "حافظ على سياسات الاحتفاظ الحالية",
        },
        {
          type: "warning",
          title: "تزايد طلبات الإجازات",
          description: "ارتفاع بنسبة 15% في طلبات الإجازات مقارنة بالشهر الماضي",
          action: "راجع جدول الإجازات لتجنب نقص الموظفين",
        },
        {
          type: "info",
          title: "معدل توظيف جيد",
          description: "تم توظيف 12 موظف جديد هذا الشهر",
          action: "تأكد من إكمال برامج التأهيل",
        },
        {
          type: "positive",
          title: "أداء عالي",
          description: "85% من الموظفين حققوا أو تجاوزوا أهدافهم",
          action: "قدّم التقدير والمكافآت للمتميزين",
        },
      ]
    : [
        {
          type: "positive",
          title: "Low Turnover Rate",
          description: "Employee turnover rate is 2.8%, below industry average (5%)",
          action: "Maintain current retention policies",
        },
        {
          type: "warning",
          title: "Increasing Leave Requests",
          description: "15% increase in leave requests compared to last month",
          action: "Review leave schedule to avoid understaffing",
        },
        {
          type: "info",
          title: "Good Hiring Rate",
          description: "12 new employees hired this month",
          action: "Ensure onboarding programs are completed",
        },
        {
          type: "positive",
          title: "High Performance",
          description: "85% of employees met or exceeded their goals",
          action: "Provide recognition and rewards for top performers",
        },
      ];

  const recommendations = isArabic
    ? [
        "قم بتنفيذ برنامج تطوير مهني ربع سنوي",
        "راجع هيكل الرواتب لضمان التنافسية",
        "أنشئ نظام مكافآت أداء شهري",
        "استثمر في برامج التدريب والتطوير",
        "قم بمراجعة سياسة الإجازات السنوية",
      ]
    : [
        "Implement quarterly professional development program",
        "Review salary structure for competitiveness",
        "Create monthly performance rewards system",
        "Invest in training and development programs",
        "Review annual leave policy",
      ];

  const departmentData = [
    { name: isArabic ? "الموارد البشرية" : "HR", employees: 15, performance: 92 },
    { name: isArabic ? "المبيعات" : "Sales", employees: 45, performance: 88 },
    { name: isArabic ? "التسويق" : "Marketing", employees: 25, performance: 85 },
    { name: isArabic ? "التقنية" : "Tech", employees: 80, performance: 94 },
    { name: isArabic ? "المالية" : "Finance", employees: 30, performance: 90 },
    { name: isArabic ? "العمليات" : "Operations", employees: 50, performance: 87 },
  ];

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">
                {isArabic ? "التحليلات الذكية" : "AI Analytics"}
              </h1>
              <p className="text-muted-foreground">
                {isArabic
                  ? "تحليلات وتقارير ذكية مدعومة بالذكاء الاصطناعي"
                  : "Smart analytics and reports powered by AI"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">
                  {isArabic ? "أسبوع" : "Week"}
                </SelectItem>
                <SelectItem value="month">
                  {isArabic ? "شهر" : "Month"}
                </SelectItem>
                <SelectItem value="quarter">
                  {isArabic ? "ربع سنة" : "Quarter"}
                </SelectItem>
                <SelectItem value="year">
                  {isArabic ? "سنة" : "Year"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{isArabic ? "إجمالي الموظفين" : "Total Employees"}</span>
              <Users className="h-4 w-4 text-blue-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEmployees}</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <TrendingUp className="h-3 w-3" />
              <span>+{metrics.newHires} {isArabic ? "هذا الشهر" : "this month"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{isArabic ? "معدل الدوران" : "Turnover Rate"}</span>
              <TrendingDown className="h-4 w-4 text-green-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.turnoverRate}%</div>
            <div className="flex items-center gap-1 text-sm text-green-600 mt-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>{isArabic ? "أقل من المتوسط" : "Below average"}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{isArabic ? "إجمالي الرواتب" : "Total Payroll"}</span>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalPayroll.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <span>
                {isArabic ? "متوسط" : "Avg"}: {metrics.avgSalary.toLocaleString()} {isArabic ? "ر.س" : "SAR"}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center justify-between">
              <span>{isArabic ? "طلبات الإجازات" : "Leave Requests"}</span>
              <Calendar className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.leaveRequests}</div>
            <div className="flex items-center gap-1 text-sm text-orange-600 mt-1">
              <AlertCircle className="h-3 w-3" />
              <span>+15% {isArabic ? "من الشهر الماضي" : "vs last month"}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* AI Insights */}
        <div className="lg:col-span-2 space-y-6">
          {/* Insights Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                {isArabic ? "رؤى ذكية" : "AI Insights"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "تحليلات وتوصيات مدعومة بالذكاء الاصطناعي"
                  : "AI-powered analysis and recommendations"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {insights.map((insight, idx) => (
                <Card
                  key={idx}
                  className={`border-l-4 ${
                    insight.type === "positive"
                      ? "border-l-green-500 bg-green-50/50"
                      : insight.type === "warning"
                        ? "border-l-orange-500 bg-orange-50/50"
                        : "border-l-blue-500 bg-blue-50/50"
                  }`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2">
                        {insight.type === "positive" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : insight.type === "warning" ? (
                          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                        ) : (
                          <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                        )}
                        <div>
                          <h4 className="font-semibold">{insight.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {insight.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="h-4 w-4 text-primary" />
                      <span className="font-medium">{isArabic ? "الإجراء المقترح:" : "Suggested Action:"}</span>
                      <span className="text-muted-foreground">{insight.action}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>

          {/* Department Performance */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-purple-600" />
                {isArabic ? "أداء الأقسام" : "Department Performance"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {departmentData.map((dept) => (
                <div key={dept.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dept.name}</span>
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">
                        {dept.employees} {isArabic ? "موظف" : "employees"}
                      </span>
                      <Badge
                        variant={dept.performance >= 90 ? "default" : "secondary"}
                      >
                        {dept.performance}%
                      </Badge>
                    </div>
                  </div>
                  <Progress value={dept.performance} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "إجراءات سريعة" : "Quick Actions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                className="w-full justify-start gap-2"
                variant="outline"
                onClick={handleGenerateReport}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <LineChart className="h-4 w-4" />
                )}
                {isArabic ? "توليد تقرير شامل" : "Generate Full Report"}
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Download className="h-4 w-4" />
                {isArabic ? "تحميل البيانات" : "Download Data"}
              </Button>
              <Button className="w-full justify-start gap-2" variant="outline">
                <Bot className="h-4 w-4" />
                {isArabic ? "تحليل مخصص" : "Custom Analysis"}
              </Button>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-600" />
                {isArabic ? "توصيات ذكية" : "Smart Recommendations"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <Award className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span>{rec}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Features */}
          <Card className="shadow-lg border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600" />
                {isArabic ? "مميزات AI" : "AI Features"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {isArabic ? "تحليل تنبؤي" : "Predictive Analysis"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? "توقع الاتجاهات المستقبلية"
                      : "Predict future trends"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {isArabic ? "توصيات ذكية" : "Smart Recommendations"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? "اقتراحات مخصصة لتحسين الأداء"
                      : "Personalized suggestions"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">
                    {isArabic ? "كشف الأنماط" : "Pattern Detection"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? "تحديد الأنماط والاتجاهات"
                      : "Identify patterns and trends"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
