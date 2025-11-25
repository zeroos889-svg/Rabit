import { useMemo, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import {
  Calculator,
  FileText,
  Wand2,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Plus,
  Download,
  Eye,
  DollarSign,
  Users,
  Briefcase,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";

export default function ConsultantDashboard() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // Data hooks
  const { data: bookingsData, isLoading: loadingBookings } =
    trpc.consultant.getConsultantBookings.useQuery();
  const { data: profileData } = trpc.consultant.getMyProfile.useQuery();

  const bookings = useMemo(() => bookingsData?.bookings || [], [bookingsData]);

  const stats = useMemo(() => {
    const active = bookings.filter(
      b => b.status !== "completed" && b.status !== "cancelled"
    );
    const completed = bookings.filter(b => b.status === "completed");
    const revenue = completed.reduce(
      (sum, b) => sum + (b.price || b.consultationType?.price || 0),
      0
    );
    return {
      activeCount: active.length,
      completedCount: completed.length,
      revenue,
      totalClients: new Set(bookings.map(b => b.clientId || b.userId)).size,
    };
  }, [bookings]);

  const quickTools = [
    {
      title: "حاسبة نهاية الخدمة",
      titleEn: "End of Service Calculator",
      description: "احسب مكافأة نهاية الخدمة حسب المادة 84",
      descriptionEn: "Calculate end of service benefits per Article 84",
      icon: Calculator,
      href: "/tools/end-of-service",
      color: "from-blue-600 to-cyan-600",
      count: 15,
    },
    {
      title: "حاسبة الإجازات",
      titleEn: "Leave Calculator",
      description: "احسب رصيد الإجازات المختلفة",
      descriptionEn: "Calculate various leave balances",
      icon: Calendar,
      href: "/tools/leave-calculator",
      color: "from-green-600 to-emerald-600",
      count: 18,
    },
    {
      title: "مولد الخطابات",
      titleEn: "Letter Generator",
      description: "ولّد خطابات احترافية بالذكاء الاصطناعي",
      descriptionEn: "Generate professional letters with AI",
      icon: Wand2,
      href: "/tools/letter-generator",
      color: "from-purple-600 to-pink-600",
      count: 12,
    },
  ];
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);

  const recentActivity = [
    {
      id: 1,
      type: "calculation",
      title: "حساب نهاية خدمة - شركة النور",
      titleEn: "End of Service - Alnoor Company",
      time: "منذ ساعة",
      timeEn: "1 hour ago",
      icon: Calculator,
      color: "text-blue-600",
    },
    {
      id: 2,
      type: "letter",
      title: "خطاب تعريف راتب - أحمد محمد",
      titleEn: "Salary Certificate - Ahmad Mohammed",
      time: "منذ 3 ساعات",
      timeEn: "3 hours ago",
      icon: FileText,
      color: "text-purple-600",
    },
    {
      id: 3,
      type: "calculation",
      title: "حساب إجازة سنوية - شركة المستقبل",
      titleEn: "Annual Leave - Future Company",
      time: "منذ 5 ساعات",
      timeEn: "5 hours ago",
      icon: Calendar,
      color: "text-green-600",
    },
  ];

  const filteredBookings = useMemo(
    () =>
      bookings
        .filter(b => {
          const typeName =
            (b.consultationType as any)?.nameAr ||
            (b.consultationType as any)?.nameEn ||
            "";
          return typeName.toLowerCase().includes(search.toLowerCase());
        })
        .slice(0, limit),
    [bookings, search, limit]
  );
  const hasBookingsError = false;

  const subscriptionInfo = {
    plan: "مستقل HR",
    planEn: "HR Consultant",
    status: "نشط",
    statusEn: "Active",
    price: 299,
    nextBilling: "2024-12-20",
    daysLeft: 30,
  };

  return (
    <DashboardLayout userType="consultant">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? "لوحة التحكم" : "Dashboard"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic
                ? `مرحباً ${profileData?.consultant?.fullNameAr || ""}`
                : "Welcome to Rabit platform for consultants"}
            </p>
          </div>
          <Link href="/tools">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Plus className="w-4 h-4 ml-2" />
              {isArabic ? "استخدم أداة" : "Use Tool"}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "استشارات نشطة" : "Active Consultations"}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.activeCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "استشارات مكتملة" : "Completed"}
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.completedCount}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "العملاء" : "Clients"}
              </CardTitle>
              <Users className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                <div className="text-2xl font-bold">{stats.totalClients}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "الإيرادات" : "Revenue"}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{stats.revenue} ﷼</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Tools */}
        <div>
          <h2 className="text-xl font-bold mb-4">
            {isArabic ? "الأدوات السريعة" : "Quick Tools"}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                    <CardHeader>
                      <div
                        className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl mb-3`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <CardTitle className="flex items-center justify-between">
                        {isArabic ? tool.title : tool.titleEn}
                        <Badge variant="secondary">{tool.count}</Badge>
                      </CardTitle>
                      <CardDescription>
                        {isArabic ? tool.description : tool.descriptionEn}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full">
                        {isArabic ? "استخدم الآن" : "Use Now"}
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isArabic ? "النشاط الأخير" : "Recent Activity"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "آخر الحجوزات وتحديثاتها"
                      : "Latest bookings and updates"}
                  </CardDescription>
                </div>
                <Input
                  placeholder={isArabic ? "ابحث في الحجوزات..." : "Search bookings..."}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingBookings ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : hasBookingsError ? (
                <p className="text-sm text-red-500">
                  {isArabic ? "تعذر تحميل الحجوزات." : "Failed to load bookings."}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredBookings.map(booking => (
                    <div
                      key={booking.id}
                      className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="text-purple-600">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">
                          {booking.consultationType?.nameAr || "استشارة"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {booking.scheduledDate
                            ? new Date(booking.scheduledDate).toLocaleDateString("ar-SA")
                            : "—"}{" "}
                          {booking.scheduledTime || ""}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          الحالة: {booking.status}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/consultation/${booking.id}/chat`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  {!loadingBookings && filteredBookings.length < bookings.length && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setLimit(prev => prev + 5)}
                    >
                      {isArabic ? "عرض المزيد" : "Show more"}
                    </Button>
                  )}
                  {!loadingBookings && !filteredBookings.length && (
                    <p className="text-sm text-muted-foreground">
                      {isArabic ? "لا توجد حجوزات" : "No bookings found"}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subscription Card */}
          <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">
                  {isArabic ? "اشتراكك" : "Your Subscription"}
                </CardTitle>
                <Sparkles className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm opacity-90">
                  {isArabic ? "الباقة" : "Plan"}
                </p>
                <p className="text-2xl font-bold">
                  {isArabic ? subscriptionInfo.plan : subscriptionInfo.planEn}
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/20">
                <span className="text-sm opacity-90">
                  {isArabic ? "الحالة" : "Status"}
                </span>
                <Badge className="bg-white text-purple-600">
                  {isArabic ? subscriptionInfo.status : subscriptionInfo.statusEn}
                </Badge>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/20">
                <span className="text-sm opacity-90">
                  {isArabic ? "السعر الشهري" : "Monthly Price"}
                </span>
                <span className="font-bold">{subscriptionInfo.price} ﷼</span>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-white/20">
                <span className="text-sm opacity-90">
                  {isArabic ? "التجديد القادم" : "Next Billing"}
                </span>
                <span className="text-sm">{subscriptionInfo.nextBilling}</span>
              </div>

              <div className="bg-white/10 rounded-lg p-3 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {subscriptionInfo.daysLeft}{" "}
                    {isArabic ? "يوم متبقي" : "days left"}
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div
                    className="bg-white rounded-full h-2"
                    style={{ width: `${(subscriptionInfo.daysLeft / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              <Button
                className="w-full bg-white text-purple-600 hover:bg-gray-100 mt-4"
              >
                {isArabic ? "إدارة الاشتراك" : "Manage Subscription"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
