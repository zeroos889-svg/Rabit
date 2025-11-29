import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  TrendingUp,
  DollarSign,
  Clock,
  UserMinus,
  Briefcase,
  Target,
  Award,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Metric {
  id: string;
  name: string;
  nameAr: string;
  value: number | string;
  previousValue?: number;
  unit?: string;
  trend?: "up" | "down" | "stable";
  trendValue?: number;
  icon: React.ElementType;
  color: string;
}

interface DepartmentData {
  name: string;
  nameAr: string;
  employees: number;
  turnover: number;
  satisfaction: number;
}

interface ChartData {
  label: string;
  labelAr: string;
  value: number;
  color: string;
}

// Mock Data
const MOCK_METRICS: Metric[] = [
  {
    id: "1",
    name: "Total Employees",
    nameAr: "إجمالي الموظفين",
    value: 248,
    previousValue: 235,
    trend: "up",
    trendValue: 5.5,
    icon: Users,
    color: "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
  },
  {
    id: "2",
    name: "Turnover Rate",
    nameAr: "معدل الدوران",
    value: "8.2%",
    previousValue: 9.1,
    trend: "down",
    trendValue: 9.9,
    icon: UserMinus,
    color: "text-red-600 bg-red-100 dark:bg-red-900/30",
  },
  {
    id: "3",
    name: "Avg. Tenure",
    nameAr: "متوسط مدة الخدمة",
    value: "3.2",
    unit: "years",
    trend: "up",
    trendValue: 4.2,
    icon: Clock,
    color: "text-purple-600 bg-purple-100 dark:bg-purple-900/30",
  },
  {
    id: "4",
    name: "Time to Hire",
    nameAr: "وقت التوظيف",
    value: "24",
    unit: "days",
    trend: "down",
    trendValue: 8.0,
    icon: Calendar,
    color: "text-orange-600 bg-orange-100 dark:bg-orange-900/30",
  },
  {
    id: "5",
    name: "Employee Satisfaction",
    nameAr: "رضا الموظفين",
    value: "87%",
    previousValue: 84,
    trend: "up",
    trendValue: 3.6,
    icon: Award,
    color: "text-green-600 bg-green-100 dark:bg-green-900/30",
  },
  {
    id: "6",
    name: "Training Completion",
    nameAr: "إتمام التدريب",
    value: "92%",
    previousValue: 88,
    trend: "up",
    trendValue: 4.5,
    icon: Target,
    color: "text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30",
  },
  {
    id: "7",
    name: "Open Positions",
    nameAr: "الوظائف الشاغرة",
    value: 12,
    previousValue: 15,
    trend: "down",
    trendValue: 20,
    icon: Briefcase,
    color: "text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30",
  },
  {
    id: "8",
    name: "Cost per Hire",
    nameAr: "تكلفة التوظيف",
    value: "12,500",
    unit: "SAR",
    trend: "down",
    trendValue: 5.2,
    icon: DollarSign,
    color: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30",
  },
];

const MOCK_DEPARTMENTS: DepartmentData[] = [
  { name: "Engineering", nameAr: "الهندسة", employees: 65, turnover: 5.2, satisfaction: 89 },
  { name: "Sales", nameAr: "المبيعات", employees: 42, turnover: 12.1, satisfaction: 82 },
  { name: "Marketing", nameAr: "التسويق", employees: 28, turnover: 7.4, satisfaction: 86 },
  { name: "HR", nameAr: "الموارد البشرية", employees: 15, turnover: 3.2, satisfaction: 91 },
  { name: "Finance", nameAr: "المالية", employees: 22, turnover: 4.8, satisfaction: 88 },
  { name: "Operations", nameAr: "العمليات", employees: 35, turnover: 8.6, satisfaction: 84 },
  { name: "IT", nameAr: "تقنية المعلومات", employees: 18, turnover: 6.1, satisfaction: 87 },
  { name: "Customer Service", nameAr: "خدمة العملاء", employees: 23, turnover: 15.3, satisfaction: 78 },
];

const GENDER_DATA: ChartData[] = [
  { label: "Male", labelAr: "ذكور", value: 156, color: "bg-blue-500" },
  { label: "Female", labelAr: "إناث", value: 92, color: "bg-pink-500" },
];

const AGE_DATA: ChartData[] = [
  { label: "18-25", labelAr: "18-25", value: 35, color: "bg-green-500" },
  { label: "26-35", labelAr: "26-35", value: 98, color: "bg-blue-500" },
  { label: "36-45", labelAr: "36-45", value: 72, color: "bg-purple-500" },
  { label: "46-55", labelAr: "46-55", value: 31, color: "bg-orange-500" },
  { label: "55+", labelAr: "55+", value: 12, color: "bg-red-500" },
];

// Components
interface MetricCardProps {
  metric: Metric;
  isArabic: boolean;
}

function MetricCard({ metric, isArabic }: MetricCardProps) {
  const Icon = metric.icon;
  const TrendIcon = metric.trend === "up" ? ArrowUpRight : ArrowDownRight;
  const isPositive =
    (metric.trend === "up" && metric.id !== "2" && metric.id !== "7") ||
    (metric.trend === "down" && (metric.id === "2" || metric.id === "4" || metric.id === "7" || metric.id === "8"));

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className={cn("p-2 rounded-lg", metric.color)}>
            <Icon className="h-5 w-5" />
          </div>
          {metric.trendValue && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs font-medium",
                isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              <TrendIcon className="h-3 w-3" />
              <span>{metric.trendValue}%</span>
            </div>
          )}
        </div>
        <div className="mt-3">
          <p className="text-2xl font-bold">
            {metric.value}
            {metric.unit && (
              <span className="text-sm font-normal text-muted-foreground ml-1">
                {metric.unit}
              </span>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {isArabic ? metric.nameAr : metric.name}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

interface PieChartSimpleProps {
  data: ChartData[];
  isArabic: boolean;
}

function PieChartSimple({ data, isArabic }: PieChartSimpleProps) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  let accumulated = 0;

  return (
    <div className="flex items-center gap-6">
      <div className="relative h-32 w-32">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          {data.map((item, i) => {
            const percentage = (item.value / total) * 100;
            const offset = accumulated;
            accumulated += percentage;
            return (
              <circle
                key={i}
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="20"
                strokeDasharray={`${percentage * 2.512} ${251.2 - percentage * 2.512}`}
                strokeDashoffset={-offset * 2.512}
                className={item.color.replace("bg-", "text-")}
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{total}</span>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={cn("h-3 w-3 rounded-full", item.color)} />
            <span className="text-sm">
              {isArabic ? item.labelAr : item.label}
            </span>
            <span className="text-sm text-muted-foreground">
              ({Math.round((item.value / total) * 100)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BarChartSimpleProps {
  data: ChartData[];
  isArabic: boolean;
}

function BarChartSimple({ data, isArabic }: BarChartSimpleProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="space-y-3">
      {data.map((item, i) => (
        <div key={i}>
          <div className="flex items-center justify-between text-sm mb-1">
            <span>{isArabic ? item.labelAr : item.label}</span>
            <span className="font-medium">{item.value}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", item.color)}
              style={{ width: `${(item.value / maxValue) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Component
export function AnalyticsDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [timePeriod, setTimePeriod] = useState("month");

  // Sort departments by employee count
  const sortedDepartments = useMemo(() => {
    return [...MOCK_DEPARTMENTS].sort((a, b) => b.employees - a.employees);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? "لوحة تحليلات الموارد البشرية" : "HR Analytics Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {isArabic
              ? "رؤى شاملة حول مقاييس الموارد البشرية"
              : "Comprehensive insights into HR metrics"}
          </p>
        </div>
        <Select value={timePeriod} onValueChange={setTimePeriod}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">{isArabic ? "أسبوع" : "Week"}</SelectItem>
            <SelectItem value="month">{isArabic ? "شهر" : "Month"}</SelectItem>
            <SelectItem value="quarter">{isArabic ? "ربع سنة" : "Quarter"}</SelectItem>
            <SelectItem value="year">{isArabic ? "سنة" : "Year"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_METRICS.slice(0, 4).map((metric) => (
          <MetricCard key={metric.id} metric={metric} isArabic={isArabic} />
        ))}
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MOCK_METRICS.slice(4).map((metric) => (
          <MetricCard key={metric.id} metric={metric} isArabic={isArabic} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gender Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {isArabic ? "توزيع الجنس" : "Gender Distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChartSimple data={GENDER_DATA} isArabic={isArabic} />
          </CardContent>
        </Card>

        {/* Age Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {isArabic ? "توزيع الأعمار" : "Age Distribution"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChartSimple data={AGE_DATA} isArabic={isArabic} />
          </CardContent>
        </Card>
      </div>

      {/* Departments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            {isArabic ? "مقاييس الأقسام" : "Department Metrics"}
          </CardTitle>
          <CardDescription>
            {isArabic
              ? "نظرة عامة على أداء كل قسم"
              : "Overview of each department's performance"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-start p-3 font-medium">
                    {isArabic ? "القسم" : "Department"}
                  </th>
                  <th className="text-start p-3 font-medium">
                    {isArabic ? "الموظفين" : "Employees"}
                  </th>
                  <th className="text-start p-3 font-medium">
                    {isArabic ? "معدل الدوران" : "Turnover"}
                  </th>
                  <th className="text-start p-3 font-medium">
                    {isArabic ? "الرضا" : "Satisfaction"}
                  </th>
                  <th className="text-start p-3 font-medium">
                    {isArabic ? "الحالة" : "Status"}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedDepartments.map((dept, i) => (
                  <tr key={i} className="border-b last:border-0 hover:bg-muted/50">
                    <td className="p-3 font-medium">
                      {isArabic ? dept.nameAr : dept.name}
                    </td>
                    <td className="p-3">{dept.employees}</td>
                    <td className="p-3">
                      <span
                        className={cn(
                          "font-medium",
                          dept.turnover > 10
                            ? "text-red-600"
                            : dept.turnover > 7
                            ? "text-yellow-600"
                            : "text-green-600"
                        )}
                      >
                        {dept.turnover}%
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-muted rounded-full max-w-[100px]">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              dept.satisfaction >= 85
                                ? "bg-green-500"
                                : dept.satisfaction >= 75
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            )}
                            style={{ width: `${dept.satisfaction}%` }}
                          />
                        </div>
                        <span className="text-sm">{dept.satisfaction}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          dept.satisfaction >= 85 && dept.turnover < 8
                            ? "border-green-500 text-green-600"
                            : dept.satisfaction < 80 || dept.turnover > 12
                            ? "border-red-500 text-red-600"
                            : "border-yellow-500 text-yellow-600"
                        )}
                      >
                        {dept.satisfaction >= 85 && dept.turnover < 8
                          ? isArabic
                            ? "ممتاز"
                            : "Excellent"
                          : dept.satisfaction < 80 || dept.turnover > 12
                          ? isArabic
                            ? "يحتاج تحسين"
                            : "Needs Attention"
                          : isArabic
                          ? "جيد"
                          : "Good"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-900/20 dark:to-green-900/10 border-green-200 dark:border-green-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">
                {isArabic ? "أفضل أداء" : "Top Performer"}
              </span>
            </div>
            <p className="text-2xl font-bold mt-2 text-green-800 dark:text-green-300">
              {isArabic ? "قسم الموارد البشرية" : "HR Department"}
            </p>
            <p className="text-sm text-green-600 dark:text-green-400 mt-1">
              {isArabic
                ? "أعلى رضا 91% وأقل دوران 3.2%"
                : "Highest satisfaction 91% & lowest turnover 3.2%"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10 border-yellow-200 dark:border-yellow-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
              <Activity className="h-5 w-5" />
              <span className="font-medium">
                {isArabic ? "يحتاج انتباه" : "Needs Attention"}
              </span>
            </div>
            <p className="text-2xl font-bold mt-2 text-yellow-800 dark:text-yellow-300">
              {isArabic ? "خدمة العملاء" : "Customer Service"}
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400 mt-1">
              {isArabic
                ? "معدل دوران مرتفع 15.3%"
                : "High turnover rate at 15.3%"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10 border-blue-200 dark:border-blue-900">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
              <Target className="h-5 w-5" />
              <span className="font-medium">
                {isArabic ? "هدف الشهر" : "Monthly Goal"}
              </span>
            </div>
            <p className="text-2xl font-bold mt-2 text-blue-800 dark:text-blue-300">
              {isArabic ? "خفض وقت التوظيف" : "Reduce Time to Hire"}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
              {isArabic
                ? "الهدف: 20 يوم (الحالي: 24 يوم)"
                : "Target: 20 days (Current: 24 days)"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;
