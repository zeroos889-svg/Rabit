import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  DollarSign,
  TrendingUp,
  FileText,
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const reportDemoExperienceIds = ["compliance"] as const;
type ReportDemoExperienceId = (typeof reportDemoExperienceIds)[number];

type ReportDemoExperienceContent = {
  title: string;
  description: string;
  checklist: string[];
  actionLabel: string;
  focusTargetId?: string;
};

const useReportDemoExperience = (isArabic: boolean) => {
  const [experience, setExperience] = useState<ReportDemoExperienceId | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const locationRef = globalThis.location;
    if (!locationRef) return;

    const params = new globalThis.URLSearchParams(locationRef.search ?? "");
    const experienceParam = params.get("experience");

    if (experienceParam && (reportDemoExperienceIds as readonly string[]).includes(experienceParam)) {
      setExperience(experienceParam as ReportDemoExperienceId);
      setShowBanner(true);

      params.delete("experience");
      const nextSearch = params.toString();
      const basePath = locationRef.pathname ?? "";
      const hashSuffix = locationRef.hash ?? "";
      const searchSuffix = nextSearch ? `?${nextSearch}` : "";
      const nextUrl = `${basePath}${searchSuffix}${hashSuffix}`;
      globalThis.history?.replaceState?.({}, "", nextUrl);
    }
  }, []);

  const content = useMemo<Record<ReportDemoExperienceId, ReportDemoExperienceContent>>(
    () => ({
      compliance: {
        title: isArabic ? "جولة الامتثال مفعّلة" : "Compliance tour active",
        description: isArabic
          ? "تأكد من اختيار الفترة الزمنية الصحيحة ثم استعرض علامات التقدم لمعرفة ما إذا كانت التزاماتك في المسار الصحيح."
          : "Pick the correct reporting window and review the highlights to confirm deadlines stay on track.",
        checklist: isArabic
          ? [
              "ابدأ بتحديد الفترة الزمنية من القائمة العلوية",
              "انتقل إلى تبويب نظرة عامة لعرض الاتجاهات",
              "استخدم البطاقات السفلية لتوثيق أي مخاطر",
            ]
          : [
              "Start by selecting the reporting period above",
              "Switch to the overview tab to inspect trends",
              "Use the lower cards to log any risks",
            ],
        actionLabel: isArabic ? "حدد الفترة الزمنية" : "Set reporting period",
        focusTargetId: "report-period-select",
      },
    }),
    [isArabic]
  );

  const activeContent = experience ? content[experience] : null;

  const focusTarget = useCallback(() => {
    if (!activeContent?.focusTargetId || typeof document === "undefined") return;
    const element = document.getElementById(activeContent.focusTargetId);
    element?.focus();
    element?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [activeContent]);

  const dismiss = useCallback(() => setShowBanner(false), []);

  return { activeContent, showBanner: showBanner && !!activeContent, focusTarget, dismiss };
};

export default function ReportsManagement() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [reportPeriod, setReportPeriod] = useState("month");
  const [reportType, setReportType] = useState("overview");
  const { activeContent, showBanner, focusTarget, dismiss } = useReportDemoExperience(isArabic);

  const handleDemoAction = () => {
    setReportType("overview");
    focusTarget();
  };

  // Mock data for charts
  const employeeData = {
    total: 156,
    newThisMonth: 12,
    leftThisMonth: 3,
    growth: "+5.8%",
  };

  const attendanceData = {
    present: 142,
    absent: 8,
    leave: 6,
    rate: "94.2%",
  };

  const recruitmentData = {
    activeJobs: 12,
    totalApplicants: 145,
    interviews: 32,
    hired: 8,
  };

  const payrollData = {
    totalAmount: 2340000,
    avgSalary: 15000,
    increases: "+3.2%",
    pending: 0,
  };

  const monthlyTrend = [
    { month: "يناير", employees: 140, revenue: 2100000 },
    { month: "فبراير", employees: 143, revenue: 2145000 },
    { month: "مارس", employees: 145, revenue: 2175000 },
    { month: "أبريل", employees: 148, revenue: 2220000 },
    { month: "مايو", employees: 150, revenue: 2250000 },
    { month: "يونيو", employees: 152, revenue: 2280000 },
    { month: "يوليو", employees: 154, revenue: 2310000 },
    { month: "أغسطس", employees: 156, revenue: 2340000 },
  ];

  const handleExportReport = (format: string) => {
    toast.success(
      isArabic
        ? `جاري تصدير التقرير بصيغة ${format}...`
        : `Exporting report as ${format}...`
    );
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {showBanner && activeContent && (
          <Alert className="border-amber-200 bg-amber-50 text-slate-900 dark:border-amber-400/30 dark:bg-amber-900/30 dark:text-amber-50">
            <AlertTitle>{activeContent.title}</AlertTitle>
            <AlertDescription>
              <p>{activeContent.description}</p>
              <ul className="mt-3 list-disc space-y-1 pr-5 text-xs text-amber-900 dark:text-amber-100">
                {activeContent.checklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" onClick={handleDemoAction}>
                  {activeContent.actionLabel}
                </Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>
                  {isArabic ? "إخفاء الدليل" : "Hide guide"}
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="w-8 h-8 text-blue-600" />
              {isArabic ? "التقارير والإحصائيات" : "Reports & Analytics"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic
                ? "تحليل شامل لأداء الموارد البشرية"
                : "Comprehensive HR performance analysis"}
            </p>
          </div>

          <div className="flex gap-2">
            <div>
              <Label htmlFor="report-period-select" className="sr-only">
                {isArabic ? "تغيير الفترة الزمنية" : "Change report period"}
              </Label>
              <Select value={reportPeriod} onValueChange={setReportPeriod}>
                <SelectTrigger
                  id="report-period-select"
                  className="w-40"
                  aria-label={isArabic ? "الفترة الزمنية للتقرير" : "Report period"}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">
                    {isArabic ? "هذا الأسبوع" : "This Week"}
                  </SelectItem>
                  <SelectItem value="month">
                    {isArabic ? "هذا الشهر" : "This Month"}
                  </SelectItem>
                  <SelectItem value="quarter">
                    {isArabic ? "هذا الربع" : "This Quarter"}
                  </SelectItem>
                  <SelectItem value="year">
                    {isArabic ? "هذا العام" : "This Year"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              onClick={() => handleExportReport("PDF")}
            >
              <Download className="w-4 h-4 ml-2" />
              PDF
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExportReport("Excel")}
            >
              <Download className="w-4 h-4 ml-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {isArabic ? "الموظفين" : "Employees"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employeeData.total}</div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {employeeData.growth}
                </span>
                <span className="text-xs text-gray-600">
                  {isArabic ? "عن الشهر الماضي" : "vs last month"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {isArabic ? "الحضور" : "Attendance"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {attendanceData.rate}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {attendanceData.present} {isArabic ? "حاضر" : "present"} / {attendanceData.absent}{" "}
                {isArabic ? "غائب" : "absent"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {isArabic ? "التوظيف" : "Recruitment"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {recruitmentData.hired}
              </div>
              <p className="text-xs text-gray-600 mt-2">
                {isArabic ? "تعيينات هذا الشهر" : "hires this month"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                {isArabic ? "الرواتب" : "Payroll"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {(payrollData.totalAmount / 1000000).toFixed(1)}M
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">
                  {payrollData.increases}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports Tabs */}
        <Tabs value={reportType} onValueChange={setReportType}>
          <TabsList>
            <TabsTrigger value="overview">
              <FileText className="w-4 h-4 ml-2" />
              {isArabic ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="employees">
              <Users className="w-4 h-4 ml-2" />
              {isArabic ? "الموظفين" : "Employees"}
            </TabsTrigger>
            <TabsTrigger value="attendance">
              <Clock className="w-4 h-4 ml-2" />
              {isArabic ? "الحضور" : "Attendance"}
            </TabsTrigger>
            <TabsTrigger value="recruitment">
              <Briefcase className="w-4 h-4 ml-2" />
              {isArabic ? "التوظيف" : "Recruitment"}
            </TabsTrigger>
            <TabsTrigger value="payroll">
              <DollarSign className="w-4 h-4 ml-2" />
              {isArabic ? "الرواتب" : "Payroll"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "اتجاهات الأداء الشهرية" : "Monthly Performance Trends"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "تتبع نمو الموظفين والإيرادات على مدار الـ 8 أشهر الماضية"
                    : "Track employee growth and revenue over the past 8 months"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80 flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
                  <div className="text-center">
                    <BarChart3 className="w-16 h-16 mx-auto text-blue-600 mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      {isArabic
                        ? "الرسوم البيانية ستظهر هنا"
                        : "Charts will appear here"}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {isArabic
                        ? "يمكن دمج مكتبة مثل Recharts أو Chart.js"
                        : "Can integrate library like Recharts or Chart.js"}
                    </p>
                  </div>
                </div>

                {/* Simple table representation */}
                <div className="mt-6 grid grid-cols-8 gap-2">
                  {monthlyTrend.map((data) => (
                    <div key={data.month} className="text-center">
                      <div className="text-xs text-gray-600 mb-2">{data.month}</div>
                      <div className="h-32 bg-gradient-to-t from-blue-600 to-purple-600 rounded-t-lg flex items-end justify-center pb-2">
                        <span className="text-white text-xs font-bold">
                          {data.employees}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "أداء الأقسام" : "Department Performance"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: "تقنية المعلومات", employees: 45, performance: 92 },
                      { name: "المالية", employees: 32, performance: 88 },
                      { name: "الموارد البشرية", employees: 28, performance: 95 },
                      { name: "المبيعات", employees: 51, performance: 85 },
                    ].map((dept) => (
                      <div key={dept.name}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{dept.name}</span>
                          <span className="text-gray-600">
                            {dept.employees} {isArabic ? "موظف" : "employees"}
                          </span>
                        </div>
                        <progress
                          className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 accent-blue-600"
                          value={dept.performance}
                          max={100}
                          aria-valuetext={`${dept.performance}%`}
                          aria-label={
                            isArabic
                              ? `أداء قسم ${dept.name}`
                              : `${dept.name} performance`
                          }
                        />
                        <span className="text-xs text-gray-500">
                          {dept.performance}% {isArabic ? "أداء" : "performance"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "المؤشرات الرئيسية" : "Key Metrics"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600">
                          {isArabic ? "معدل الرضا الوظيفي" : "Job Satisfaction"}
                        </div>
                        <div className="text-2xl font-bold text-green-600">87%</div>
                      </div>
                      <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600">
                          {isArabic ? "معدل الاحتفاظ بالموظفين" : "Retention Rate"}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">94%</div>
                      </div>
                      <Users className="w-10 h-10 text-blue-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600">
                          {isArabic ? "متوسط مدة التوظيف" : "Avg Hiring Time"}
                        </div>
                        <div className="text-2xl font-bold text-yellow-600">
                          21 {isArabic ? "يوم" : "days"}
                        </div>
                      </div>
                      <Clock className="w-10 h-10 text-yellow-600" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div>
                        <div className="text-sm text-gray-600">
                          {isArabic ? "معدل التدريب" : "Training Rate"}
                        </div>
                        <div className="text-2xl font-bold text-purple-600">78%</div>
                      </div>
                      <TrendingUp className="w-10 h-10 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "تقرير الموظفين" : "Employees Report"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "إحصائيات مفصلة عن الموظفين"
                    : "Detailed employee statistics"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-4xl font-bold text-blue-600">
                      {employeeData.total}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {isArabic ? "إجمالي الموظفين" : "Total Employees"}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-4xl font-bold text-green-600">
                      +{employeeData.newThisMonth}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {isArabic ? "تعيينات جديدة" : "New Hires"}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <div className="text-4xl font-bold text-red-600">
                      -{employeeData.leftThisMonth}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {isArabic ? "استقالات" : "Departures"}
                    </div>
                  </div>
                </div>

                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">
                    {isArabic ? "رسم بياني توزيع الموظفين حسب القسم" : "Employee distribution by department chart"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "تقرير الحضور" : "Attendance Report"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "تحليل الحضور والغياب"
                    : "Attendance and absence analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold">{attendanceData.present}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "حاضر" : "Present"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                    <div className="text-2xl font-bold">{attendanceData.absent}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "غائب" : "Absent"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Calendar className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                    <div className="text-2xl font-bold">{attendanceData.leave}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "في إجازة" : "On Leave"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold">{attendanceData.rate}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "معدل الحضور" : "Rate"}
                    </div>
                  </div>
                </div>

                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">
                    {isArabic ? "رسم بياني اتجاهات الحضور الشهرية" : "Monthly attendance trends chart"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recruitment Tab */}
          <TabsContent value="recruitment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "تقرير التوظيف" : "Recruitment Report"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "إحصائيات عملية التوظيف"
                    : "Hiring process statistics"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <Briefcase className="w-6 h-6 text-blue-600 mb-2" />
                    <div className="text-2xl font-bold">{recruitmentData.activeJobs}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "وظائف نشطة" : "Active Jobs"}
                    </div>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <Users className="w-6 h-6 text-purple-600 mb-2" />
                    <div className="text-2xl font-bold">{recruitmentData.totalApplicants}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "متقدمين" : "Applicants"}
                    </div>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <Calendar className="w-6 h-6 text-yellow-600 mb-2" />
                    <div className="text-2xl font-bold">{recruitmentData.interviews}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "مقابلات" : "Interviews"}
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-green-600 mb-2" />
                    <div className="text-2xl font-bold">{recruitmentData.hired}</div>
                    <div className="text-xs text-gray-600">
                      {isArabic ? "تم التعيين" : "Hired"}
                    </div>
                  </div>
                </div>

                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">
                    {isArabic ? "رسم بياني مسار التوظيف" : "Hiring funnel chart"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payroll Tab */}
          <TabsContent value="payroll" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "تقرير الرواتب" : "Payroll Report"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "تحليل الرواتب والتعويضات"
                    : "Salary and compensation analysis"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <DollarSign className="w-10 h-10 mx-auto text-purple-600 mb-2" />
                    <div className="text-3xl font-bold">
                      {(payrollData.totalAmount / 1000000).toFixed(2)}M
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {isArabic ? "إجمالي الرواتب" : "Total Payroll"}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <TrendingUp className="w-10 h-10 mx-auto text-blue-600 mb-2" />
                    <div className="text-3xl font-bold">
                      {payrollData.avgSalary.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {isArabic ? "متوسط الراتب" : "Avg Salary"}
                    </div>
                  </div>
                  <div className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-green-600 mb-2" />
                    <div className="text-3xl font-bold">{payrollData.pending}</div>
                    <div className="text-sm text-gray-600 mt-2">
                      {isArabic ? "معلق" : "Pending"}
                    </div>
                  </div>
                </div>

                <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-gray-500">
                    {isArabic ? "رسم بياني توزيع الرواتب" : "Salary distribution chart"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
