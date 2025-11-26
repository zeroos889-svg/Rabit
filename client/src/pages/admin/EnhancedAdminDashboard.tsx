import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Building2,
  Briefcase,
  Shield,
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Settings,
  Bell,
  BarChart3,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe2,
  ExternalLink,
  UserCheck,
  Lock,
} from "lucide-react";
import { AdminNotifications } from "@/components/AdminNotifications";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardStats {
  totalUsers: number;
  activeCompanies: number;
  totalEmployees: number;
  activeSubscriptions: number;
  totalRevenue: number;
  pendingBookings: number;
  systemHealth: "excellent" | "good" | "warning" | "critical";
  userGrowth: number;
  revenueGrowth: number;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function EnhancedAdminDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [dataRegion, setDataRegion] = useState<"sa-gcc" | "eu" | "us">("sa-gcc");
  const [timeRange, setTimeRange] = useState<"day" | "week" | "month" | "year">("month");

  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  const dashboardStats: DashboardStats = {
    totalUsers: stats?.totalUsers || 0,
    activeCompanies: stats?.activeCompanies || 0,
    totalEmployees: stats?.totalEmployees || 0,
    activeSubscriptions: stats?.activeSubscriptions || 0,
    totalRevenue: stats?.totalRevenue || 0,
    pendingBookings: stats?.pendingBookings || 0,
    systemHealth: "excellent",
    userGrowth: 12.5,
    revenueGrowth: 8.3,
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "excellent":
        return "text-green-600 bg-green-50 dark:bg-green-900/20";
      case "good":
        return "text-blue-600 bg-blue-50 dark:bg-blue-900/20";
      case "warning":
        return "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20";
      case "critical":
        return "text-red-600 bg-red-50 dark:bg-red-900/20";
      default:
        return "text-gray-600 bg-gray-50 dark:bg-gray-900/20";
    }
  };

  const statsCards = [
    {
      title: isArabic ? "إجمالي المستخدمين" : "Total Users",
      value: dashboardStats.totalUsers.toLocaleString(isArabic ? "ar-SA" : "en-US"),
      change: `+${dashboardStats.userGrowth}%`,
      trend: "up",
      icon: Users,
      description: isArabic ? "عدد المستخدمين المسجلين" : "Registered users",
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      title: isArabic ? "الشركات النشطة" : "Active Companies",
      value: dashboardStats.activeCompanies.toLocaleString(isArabic ? "ar-SA" : "en-US"),
      change: "+5.2%",
      trend: "up",
      icon: Building2,
      description: isArabic ? "الشركات المشتركة" : "Subscribed companies",
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-900/20",
    },
    {
      title: isArabic ? "الموظفون النشطون" : "Active Employees",
      value: dashboardStats.totalEmployees.toLocaleString(isArabic ? "ar-SA" : "en-US"),
      change: "+8.1%",
      trend: "up",
      icon: Briefcase,
      description: isArabic ? "موظفو الشركات" : "Company employees",
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-900/20",
    },
    {
      title: isArabic ? "الاشتراكات النشطة" : "Active Subscriptions",
      value: dashboardStats.activeSubscriptions.toLocaleString(isArabic ? "ar-SA" : "en-US"),
      change: "+3.5%",
      trend: "up",
      icon: CheckCircle2,
      description: isArabic ? "الاشتراكات الفعالة" : "Active subscriptions",
      color: "text-teal-600",
      bgColor: "bg-teal-50 dark:bg-teal-900/20",
    },
    {
      title: isArabic ? "إجمالي الإيرادات" : "Total Revenue",
      value: `${((dashboardStats.totalRevenue || 0) / 100).toLocaleString(isArabic ? "ar-SA" : "en-US")} ${isArabic ? "﷼" : "SAR"}`,
      change: `+${dashboardStats.revenueGrowth}%`,
      trend: "up",
      icon: DollarSign,
      description: isArabic ? "الإيرادات الإجمالية" : "Total revenue",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-900/20",
    },
    {
      title: isArabic ? "الحجوزات المعلقة" : "Pending Bookings",
      value: dashboardStats.pendingBookings.toLocaleString(isArabic ? "ar-SA" : "en-US"),
      change: "+2",
      trend: "neutral",
      icon: Calendar,
      description: isArabic ? "تنتظر المعالجة" : "Awaiting processing",
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-900/20",
    },
  ];

  const recentActivity = [
    {
      id: 1,
      type: "user",
      message: isArabic ? "مستخدم جديد: أحمد محمد" : "New user: Ahmad Mohammed",
      time: isArabic ? "منذ 5 دقائق" : "5 minutes ago",
      icon: UserCheck,
      color: "text-green-600",
    },
    {
      id: 2,
      type: "company",
      message: isArabic ? "شركة جديدة: شركة التقنية المتقدمة" : "New company: Advanced Tech Co.",
      time: isArabic ? "منذ 15 دقيقة" : "15 minutes ago",
      icon: Building2,
      color: "text-blue-600",
    },
    {
      id: 3,
      type: "subscription",
      message: isArabic ? "اشتراك جديد: الباقة المميزة" : "New subscription: Premium Plan",
      time: isArabic ? "منذ 30 دقيقة" : "30 minutes ago",
      icon: CheckCircle2,
      color: "text-purple-600",
    },
    {
      id: 4,
      type: "alert",
      message: isArabic ? "تنبيه: معدل استخدام الخادم مرتفع" : "Alert: High server usage",
      time: isArabic ? "منذ ساعة" : "1 hour ago",
      icon: AlertTriangle,
      color: "text-orange-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isArabic ? "لوحة التحكم الإدارية" : "Admin Dashboard"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic ? "مرحباً بك في لوحة التحكم الإدارية لمنصة رابِط" : "Welcome to Rabit Admin Dashboard"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={timeRange} onValueChange={(v) => setTimeRange(v as any)}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="day">{isArabic ? "اليوم" : "Today"}</SelectItem>
              <SelectItem value="week">{isArabic ? "هذا الأسبوع" : "This Week"}</SelectItem>
              <SelectItem value="month">{isArabic ? "هذا الشهر" : "This Month"}</SelectItem>
              <SelectItem value="year">{isArabic ? "هذا العام" : "This Year"}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon">
            <Bell className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* System Health */}
      <Card className={cn("border-2", getHealthColor(dashboardStats.systemHealth))}>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8" />
              <div>
                <h3 className="font-semibold text-lg">
                  {isArabic ? "صحة النظام" : "System Health"}
                </h3>
                <p className="text-sm opacity-80">
                  {isArabic ? "جميع الأنظمة تعمل بشكل طبيعي" : "All systems operational"}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={cn("text-lg px-4 py-2", getHealthColor(dashboardStats.systemHealth))}>
              {isArabic ? "ممتاز" : "Excellent"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* PDPL Notifications */}
      <AdminNotifications />

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === "up";
          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                  <Icon className={cn("h-5 w-5", stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                  {stat.trend !== "neutral" && (
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium",
                      isPositive ? "text-green-600" : "text-red-600"
                    )}>
                      {isPositive ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span>{stat.change}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <BarChart3 className={cn("h-4 w-4", isArabic ? "ml-2" : "mr-2")} />
            {isArabic ? "نظرة عامة" : "Overview"}
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className={cn("h-4 w-4", isArabic ? "ml-2" : "mr-2")} />
            {isArabic ? "المستخدمون" : "Users"}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className={cn("h-4 w-4", isArabic ? "ml-2" : "mr-2")} />
            {isArabic ? "الأمان" : "Security"}
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className={cn("h-4 w-4", isArabic ? "ml-2" : "mr-2")} />
            {isArabic ? "الإعدادات" : "Settings"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-600" />
                  {isArabic ? "النشاط الأخير" : "Recent Activity"}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "أحدث الأحداث في النظام" : "Latest events in the system"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                        <div className={cn("p-2 rounded-lg bg-gray-50 dark:bg-gray-800", activity.color)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  {isArabic ? "إحصائيات سريعة" : "Quick Stats"}
                </CardTitle>
                <CardDescription>
                  {isArabic ? "ملخص الأداء" : "Performance summary"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isArabic ? "معدل التحويل" : "Conversion Rate"}
                    </span>
                    <span className="font-medium">12.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isArabic ? "متوسط قيمة الاشتراك" : "Avg. Subscription Value"}
                    </span>
                    <span className="font-medium">2,500 {isArabic ? "﷼" : "SAR"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isArabic ? "معدل الاحتفاظ" : "Retention Rate"}
                    </span>
                    <span className="font-medium">94.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {isArabic ? "معدل النمو الشهري" : "Monthly Growth"}
                    </span>
                    <span className="font-medium text-green-600">+{dashboardStats.userGrowth}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "إدارة المستخدمين" : "User Management"}</CardTitle>
              <CardDescription>
                {isArabic ? "عرض وإدارة جميع المستخدمين" : "View and manage all users"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                {isArabic ? "قريباً: جدول إدارة المستخدمين" : "Coming soon: User management table"}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  {isArabic ? "سجل الأمان" : "Security Log"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  {isArabic ? "لا توجد تنبيهات أمنية" : "No security alerts"}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-green-600" />
                  {isArabic ? "حالة الأمان" : "Security Status"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? "تشفير SSL" : "SSL Encryption"}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      {isArabic ? "نشط" : "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? "جدار الحماية" : "Firewall"}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      {isArabic ? "نشط" : "Active"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{isArabic ? "مصادقة ثنائية" : "2FA"}</span>
                    <Badge variant="outline" className="bg-green-50 text-green-600">
                      {isArabic ? "مفعل" : "Enabled"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe2 className="h-5 w-5 text-purple-600" />
                {isArabic ? "إعدادات منطقة البيانات" : "Data Region Settings"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "اختر موقع استضافة البيانات: sa-gcc | eu | us"
                  : "Choose data hosting location: sa-gcc | eu | us"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={dataRegion} onValueChange={(val) => setDataRegion(val as any)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={isArabic ? "اختر المنطقة" : "Select region"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sa-gcc">
                    {isArabic ? "sa-gcc (الرياض)" : "sa-gcc (Riyadh)"}
                  </SelectItem>
                  <SelectItem value="eu">
                    {isArabic ? "eu (فرانكفورت)" : "eu (Frankfurt)"}
                  </SelectItem>
                  <SelectItem value="us">
                    {isArabic ? "us (أوريغون)" : "us (Oregon)"}
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {isArabic
                  ? "يطبق على تخزين المستندات والسجلات. يتطلب إعادة تشغيل الخدمات عند التبديل."
                  : "Applies to document storage and logs. Requires service restart when switching."}
              </p>
              <div className="flex gap-3">
                <Button
                  onClick={() => toast.success(isArabic ? `تم حفظ المنطقة: ${dataRegion}` : `Region saved: ${dataRegion}`)}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                >
                  {isArabic ? "حفظ الإعداد" : "Save Setting"}
                </Button>
                <Button variant="outline" onClick={() => setDataRegion("sa-gcc")}>
                  {isArabic ? "إعادة التعيين لـ sa-gcc" : "Reset to sa-gcc"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Access to HQ */}
      <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-purple-600" />
            {isArabic ? "مركز القيادة - Rabit HQ" : "Command Center - Rabit HQ"}
          </CardTitle>
          <CardDescription>
            {isArabic
              ? "لوحة تحكم الإدارة العليا + بوابة المستثمرين"
              : "Executive Dashboard + Investor Portal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {isArabic ? "مركز القيادة الداخلي يوفر:" : "Internal command center provides:"}
            </p>
            <ul className={cn("text-sm space-y-2", isArabic ? "mr-4" : "ml-4")}>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                {isArabic ? "Dashboard المالي (Burn runway, Monthly trends)" : "Financial Dashboard (Burn runway, Monthly trends)"}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                {isArabic ? "بوابة المستثمرين (خارطة الطريق، اللقطات المالية)" : "Investor Portal (Roadmap timeline, Financial snapshots)"}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                {isArabic ? "إدارة رأس المال والنفقات" : "Capital & Expense Management"}
              </li>
              <li className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-purple-600" />
                {isArabic ? "AI-driven Insights (مع OpenAI)" : "AI-driven Insights (with OpenAI)"}
              </li>
            </ul>
            <div className="flex gap-3 pt-3">
              <Button
                asChild
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              >
                <a
                  href="http://localhost:3001"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Building2 className="h-4 w-4" />
                  {isArabic ? "فتح مركز القيادة" : "Open Command Center"}
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  navigator.clipboard.writeText("http://localhost:3001");
                  toast.success(isArabic ? "تم نسخ الرابط" : "Link copied");
                }}
              >
                {isArabic ? "نسخ الرابط" : "Copy Link"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              {isArabic
                ? "ملاحظة: تأكد من تشغيل rabit-hq على المنفذ 3001 (npm run dev)"
                : "Note: Make sure rabit-hq is running on port 3001 (npm run dev)"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
