import { useTranslation } from "react-i18next";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayout";
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
  Calendar,
  Calculator,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  User,
  Briefcase,
  Award,
  DollarSign,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

interface ActivityItem {
  id: number;
  title: string;
  description: string;
  date: string | Date;
  status: string;
}

export default function EmployeeDashboardNew() {
  const { t } = useTranslation();
  const { user } = useAuth();

  const overviewQuery = trpc.dashboard.employeeOverview.useQuery();
  const statsQuery = trpc.dashboard.employeeStats.useQuery();

  const isLoading = overviewQuery.isLoading || statsQuery.isLoading;
  const overview = overviewQuery.data;
  const stats = statsQuery.data;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">
            {t("dashboard.welcome", "مرحباً")} {user?.name || ""}! 👋
          </h1>
          <p className="text-blue-100">
            {t("dashboard.welcomeMessage", "نتمنى لك يوماً منتجاً")}
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Leaves Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.totalLeaves", "إجمالي الإجازات")}
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.stats.totalLeaves || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.usedLeaves", "مستخدم:")} {overview?.stats.usedLeaves || 0} |{" "}
                    {t("dashboard.remainingLeaves", "متبقي:")} {overview?.stats.remainingLeaves || 0}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Pending Requests Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.pendingRequests", "الطلبات المعلقة")}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.stats.pendingRequests || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.awaitingApproval", "في انتظار الموافقة")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* EOSB Calculations Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.eosbCalculations", "حسابات نهاية الخدمة")}
              </CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.stats.eosbCalculations || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.totalCalculations", "إجمالي الحسابات")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Documents Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {t("dashboard.documents", "المستندات")}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{overview?.stats.documents || 0}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("dashboard.totalDocuments", "مستند محفوظ")}
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Employment Info & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Employment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t("dashboard.employmentInfo", "معلومات التوظيف")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">
                        {t("dashboard.currentSalary", "الراتب الحالي")}
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      {stats?.salary.current.toLocaleString()} {stats?.salary.currency}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium">
                        {t("dashboard.position", "المنصب")}
                      </span>
                    </div>
                    <span className="font-medium">{stats?.employment.position}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-medium">
                        {t("dashboard.yearsOfService", "سنوات الخدمة")}
                      </span>
                    </div>
                    <span className="font-medium">
                      {stats?.employment.yearsOfService.toFixed(1)}{" "}
                      {t("dashboard.years", "سنة")}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm font-medium">
                        {t("dashboard.performanceRating", "التقييم")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{stats?.performance.rating}</span>
                      <span className="text-yellow-500">★</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.quickActions", "إجراءات سريعة")}</CardTitle>
              <CardDescription>
                {t("dashboard.quickActionsDesc", "الوصول السريع للخدمات الأكثر استخداماً")}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline" size="lg">
                <Link href="/employee/leave-request">
                  <Calendar className="me-2 h-5 w-5" />
                  {t("dashboard.requestLeave", "طلب إجازة")}
                </Link>
              </Button>

              <Button asChild className="w-full justify-start" variant="outline" size="lg">
                <Link href="/eosb">
                  <Calculator className="me-2 h-5 w-5" />
                  {t("dashboard.calculateEOSB", "حساب نهاية الخدمة")}
                </Link>
              </Button>

              <Button asChild className="w-full justify-start" variant="outline" size="lg">
                <Link href="/letters">
                  <FileText className="me-2 h-5 w-5" />
                  {t("dashboard.generateDocument", "إنشاء مستند")}
                </Link>
              </Button>

              <Button asChild className="w-full justify-start" variant="outline" size="lg">
                <Link href="/profile">
                  <User className="me-2 h-5 w-5" />
                  {t("dashboard.viewProfile", "عرض الملف الشخصي")}
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>{t("dashboard.recentActivities", "النشاطات الأخيرة")}</CardTitle>
            <CardDescription>
              {t("dashboard.recentActivitiesDesc", "آخر الإجراءات والطلبات")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ) : overview?.recentActivities && overview.recentActivities.length > 0 ? (
              <div className="space-y-3">
                {overview.recentActivities.map((activity: ActivityItem) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="mt-1">
                      {activity.status === "completed" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {activity.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {activity.status === "rejected" && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.date).toLocaleDateString("ar-SA")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        activity.status === "completed"
                          ? "default"
                          : activity.status === "pending"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {activity.status === "completed" && t("status.completed", "مكتمل")}
                      {activity.status === "pending" && t("status.pending", "معلق")}
                      {activity.status === "rejected" && t("status.rejected", "مرفوض")}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>{t("dashboard.noActivities", "لا توجد نشاطات حديثة")}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
