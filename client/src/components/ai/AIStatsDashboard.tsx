/**
 * AI Statistics Dashboard Component
 * لوحة إحصائيات الذكاء الاصطناعي
 * 
 * يعرض:
 * - إحصائيات الامتثال
 * - رسوم بيانية للحسابات
 * - تحليلات السعودة
 */

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Shield,
  Calculator,
  Scale,
  Building2,
} from "lucide-react";

// Chart colors
const COLORS = {
  primary: "#3b82f6",
  success: "#22c55e",
  warning: "#f59e0b",
  danger: "#ef4444",
  purple: "#8b5cf6",
  cyan: "#06b6d4",
};

const _PIE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

// Sample data for GOSI contributions breakdown
const gosiBreakdownData = [
  { name: "معاش التقاعد", nameEn: "Pension", value: 18, color: COLORS.primary },
  { name: "أخطار مهنية", nameEn: "Hazards", value: 2, color: COLORS.warning },
  { name: "ساند", nameEn: "SANED", value: 2, color: COLORS.cyan },
];

// Sample monthly contribution trends
const monthlyTrendsData = [
  { month: "يناير", monthEn: "Jan", contributions: 4500, employees: 50 },
  { month: "فبراير", monthEn: "Feb", contributions: 4650, employees: 52 },
  { month: "مارس", monthEn: "Mar", contributions: 4800, employees: 54 },
  { month: "أبريل", monthEn: "Apr", contributions: 4750, employees: 53 },
  { month: "مايو", monthEn: "May", contributions: 5100, employees: 57 },
  { month: "يونيو", monthEn: "Jun", contributions: 5400, employees: 60 },
];

// Saudization by department
const saudizationByDeptData = [
  { dept: "الموارد البشرية", deptEn: "HR", saudi: 80, nonSaudi: 20 },
  { dept: "المبيعات", deptEn: "Sales", saudi: 45, nonSaudi: 55 },
  { dept: "التقنية", deptEn: "IT", saudi: 35, nonSaudi: 65 },
  { dept: "المالية", deptEn: "Finance", saudi: 70, nonSaudi: 30 },
  { dept: "العمليات", deptEn: "Operations", saudi: 50, nonSaudi: 50 },
];

// Nitaqat distribution
const nitaqatDistribution = [
  { name: "بلاتيني", nameEn: "Platinum", value: 15, color: "#06b6d4" },
  { name: "أخضر عالي", nameEn: "High Green", value: 35, color: "#22c55e" },
  { name: "أخضر منخفض", nameEn: "Low Green", value: 25, color: "#84cc16" },
  { name: "أصفر", nameEn: "Yellow", value: 15, color: "#f59e0b" },
  { name: "أحمر", nameEn: "Red", value: 10, color: "#ef4444" },
];

// Compliance score history
const complianceHistory = [
  { month: "يناير", monthEn: "Jan", score: 75 },
  { month: "فبراير", monthEn: "Feb", score: 78 },
  { month: "مارس", monthEn: "Mar", score: 82 },
  { month: "أبريل", monthEn: "Apr", score: 80 },
  { month: "مايو", monthEn: "May", score: 85 },
  { month: "يونيو", monthEn: "Jun", score: 92 },
];

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

const StatCard = ({ title, value, change, icon, description }: StatCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {title}
      </CardTitle>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center text-xs mt-1 ${change >= 0 ? "text-green-600" : "text-red-600"}`}>
          {change >= 0 ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
          {Math.abs(change)}% {change >= 0 ? "زيادة" : "انخفاض"}
        </div>
      )}
      {description && (
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      )}
    </CardContent>
  </Card>
);

export function GOSIStatsChart() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          {isArabic ? "توزيع مساهمات التأمينات" : "GOSI Contributions Breakdown"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "النسب المئوية لكل نوع من المساهمات" : "Percentage breakdown of contribution types"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={gosiBreakdownData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ value }) => `${value}%`}
              >
                {gosiBreakdownData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, ""]}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return isArabic ? payload[0].payload.name : payload[0].payload.nameEn;
                  }
                  return "";
                }}
              />
              <Legend 
                formatter={(_, entry) => {
                  const item = gosiBreakdownData.find(d => d.value === entry.payload?.value);
                  return isArabic ? item?.name : item?.nameEn;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function MonthlyContributionsChart() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          {isArabic ? "اتجاه المساهمات الشهرية" : "Monthly Contributions Trend"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "تطور إجمالي المساهمات خلال الأشهر الماضية" : "Total contributions trend over recent months"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyTrendsData}>
              <defs>
                <linearGradient id="colorContributions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey={isArabic ? "month" : "monthEn"} 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip 
                formatter={(value: number) => [`${value.toLocaleString()} ${isArabic ? "ريال" : "SAR"}`, isArabic ? "المساهمات" : "Contributions"]}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Area
                type="monotone"
                dataKey="contributions"
                stroke={COLORS.primary}
                fillOpacity={1}
                fill="url(#colorContributions)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function SaudizationByDeptChart() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          {isArabic ? "السعودة حسب القسم" : "Saudization by Department"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "نسبة الموظفين السعوديين في كل قسم" : "Saudi employee percentage by department"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={saudizationByDeptData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fill: "hsl(var(--muted-foreground))" }} />
              <YAxis 
                type="category" 
                dataKey={isArabic ? "dept" : "deptEn"} 
                width={80}
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  `${value}%`, 
                  name === "saudi" ? (isArabic ? "سعودي" : "Saudi") : (isArabic ? "غير سعودي" : "Non-Saudi")
                ]}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Legend 
                formatter={(value) => value === "saudi" ? (isArabic ? "سعودي" : "Saudi") : (isArabic ? "غير سعودي" : "Non-Saudi")}
              />
              <Bar dataKey="saudi" stackId="a" fill={COLORS.success} radius={[0, 0, 0, 0]} />
              <Bar dataKey="nonSaudi" stackId="a" fill={COLORS.warning} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function NitaqatDistributionChart() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          {isArabic ? "توزيع نطاقات" : "Nitaqat Distribution"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "توزيع الشركات حسب تصنيف نطاقات" : "Company distribution by Nitaqat classification"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={nitaqatDistribution}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, payload, value }) => `${isArabic ? name : (payload?.nameEn || name)}: ${value}%`}
                labelLine={false}
              >
                {nitaqatDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value}%`, ""]}
                labelFormatter={(_, payload) => {
                  if (payload && payload[0]) {
                    return isArabic ? payload[0].payload.name : payload[0].payload.nameEn;
                  }
                  return "";
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          {nitaqatDistribution.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-muted-foreground">
                {isArabic ? item.name : item.nameEn}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function ComplianceScoreChart() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const currentScore = complianceHistory[complianceHistory.length - 1].score;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          {isArabic ? "درجة الامتثال" : "Compliance Score"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "تطور درجة الامتثال خلال الأشهر الماضية" : "Compliance score trend over recent months"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {isArabic ? "الدرجة الحالية" : "Current Score"}
            </span>
            <Badge variant={currentScore >= 80 ? "default" : currentScore >= 60 ? "secondary" : "destructive"}>
              {currentScore}%
            </Badge>
          </div>
          <Progress value={currentScore} className="h-2" />
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={complianceHistory}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey={isArabic ? "month" : "monthEn"} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value: number) => [`${value}%`, isArabic ? "الدرجة" : "Score"]}
                contentStyle={{ 
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px"
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={COLORS.success}
                strokeWidth={2}
                dot={{ fill: COLORS.success, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AIStatsDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title={isArabic ? "درجة الامتثال" : "Compliance Score"}
          value="92%"
          change={7}
          icon={<Shield className="w-4 h-4" />}
          description={isArabic ? "متوافق مع الأنظمة" : "Regulation compliant"}
        />
        <StatCard
          title={isArabic ? "نسبة السعودة" : "Saudization Rate"}
          value="54%"
          change={3}
          icon={<Users className="w-4 h-4" />}
          description={isArabic ? "نطاق أخضر" : "Green zone"}
        />
        <StatCard
          title={isArabic ? "مساهمات التأمينات" : "GOSI Contributions"}
          value="5,400"
          change={5.5}
          icon={<Calculator className="w-4 h-4" />}
          description={isArabic ? "ريال/شهر" : "SAR/month"}
        />
        <StatCard
          title={isArabic ? "الأنظمة المتوافقة" : "Compliant Regulations"}
          value="8/10"
          icon={<Scale className="w-4 h-4" />}
          description={isArabic ? "أنظمة سعودية" : "Saudi regulations"}
        />
      </div>

      {/* Tabs for different chart views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">
            {isArabic ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="gosi">
            {isArabic ? "التأمينات" : "GOSI"}
          </TabsTrigger>
          <TabsTrigger value="saudization">
            {isArabic ? "السعودة" : "Saudization"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <ComplianceScoreChart />
            <MonthlyContributionsChart />
          </div>
        </TabsContent>

        <TabsContent value="gosi" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <GOSIStatsChart />
            <MonthlyContributionsChart />
          </div>
        </TabsContent>

        <TabsContent value="saudization" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <SaudizationByDeptChart />
            <NitaqatDistributionChart />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
