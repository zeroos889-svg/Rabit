import { useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Briefcase,
  Ticket,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Plus,
} from "lucide-react";
import { Link } from "wouter";

interface ActivityItem {
  id: number;
  type: string;
  message: string;
  timeAgo: string;
}

interface TaskItem {
  id: number;
  title: string;
  due: string;
  priority: string;
}

export default function CompanyDashboard() {
  const overviewQuery = trpc.dashboard.companyOverview.useQuery(undefined, {
    staleTime: 30_000,
  });

  const fallbackStats = {
    totalEmployees: 156,
    activeJobs: 12,
    openTickets: 23,
    pendingApplicants: 45,
  };

  const stats = overviewQuery.data?.stats || fallbackStats;
  const hasError = overviewQuery.isError;

  const fallbackActivities = [
    {
      id: 1,
      type: "employee",
      message: "تم تعيين موظف جديد: أحمد محمد",
      timeAgo: "منذ ساعتين",
    },
    {
      id: 2,
      type: "job",
      message: "تم نشر وظيفة جديدة: مطور برمجيات",
      timeAgo: "منذ 3 ساعات",
    },
    {
      id: 3,
      type: "ticket",
      message: "تذكرة جديدة: طلب إجازة - سارة علي",
      timeAgo: "منذ 5 ساعات",
    },
    {
      id: 4,
      type: "applicant",
      message: "15 متقدم جديد لوظيفة محاسب",
      timeAgo: "منذ يوم",
    },
  ];

  const fallbackTasks = [
    {
      id: 1,
      title: "مقابلة مع مرشح لوظيفة مدير مبيعات",
      due: "اليوم، 2:00 م",
      priority: "high",
    },
    {
      id: 2,
      title: "مراجعة طلبات الإجازات المعلقة",
      due: "غداً، 10:00 ص",
      priority: "medium",
    },
    {
      id: 3,
      title: "إعداد تقرير الرواتب الشهري",
      due: "15 نوفمبر",
      priority: "low",
    },
  ];

  const recentActivities = overviewQuery.data?.activities || fallbackActivities;
  const upcomingTasks = overviewQuery.data?.tasks || fallbackTasks;
  const isLoading = overviewQuery.isLoading;
  const [taskQuery, setTaskQuery] = useState("");
  const [activitiesLimit, setActivitiesLimit] = useState(5);
  const [tasksLimit, setTasksLimit] = useState(5);
  const [activityFilter, setActivityFilter] = useState("all");
  const [taskPriority, setTaskPriority] = useState("all");

  const filteredActivities = useMemo(
    () =>
      recentActivities.filter(
        (act: ActivityItem) => activityFilter === "all" || act.type === activityFilter
      ),
    [recentActivities, activityFilter]
  );

  const limitedActivities = useMemo(
    () => filteredActivities.slice(0, activitiesLimit),
    [filteredActivities, activitiesLimit]
  );

  const filteredTasks = useMemo(() => {
    const base = upcomingTasks.filter(
      (task: TaskItem) =>
        task.title?.toLowerCase().includes(taskQuery.toLowerCase()) &&
        (taskPriority === "all" || task.priority === taskPriority)
    );
    return base.slice(0, tasksLimit);
  }, [upcomingTasks, taskQuery, taskPriority, tasksLimit]);

  const totalFilteredTasks = useMemo(
    () =>
      upcomingTasks.filter(
        (task: TaskItem) =>
          task.title?.toLowerCase().includes(taskQuery.toLowerCase()) &&
          (taskPriority === "all" || task.priority === taskPriority)
      ).length,
    [upcomingTasks, taskQuery, taskPriority]
  );

  const hasMoreActivities = filteredActivities.length > limitedActivities.length;
  const hasMoreTasks = filteredTasks.length < totalFilteredTasks;

  const quickActions = [
    {
      title: "إضافة موظف",
      icon: Users,
      href: "/dashboard/employees/new",
      color: "bg-blue-500",
    },
    {
      title: "نشر وظيفة",
      icon: Briefcase,
      href: "/dashboard/jobs/new",
      color: "bg-green-500",
    },
    {
      title: "إنشاء تذكرة",
      icon: Ticket,
      href: "/dashboard/tickets/new",
      color: "bg-purple-500",
    },
    {
      title: "إنشاء خطاب",
      icon: FileText,
      href: "/tools/letter-generator",
      color: "bg-orange-500",
    },
  ];

  const getActivityMeta = (type: string) => {
    if (type === "employee") return { Icon: Users, color: "text-green-500" };
    if (type === "job") return { Icon: Briefcase, color: "text-blue-500" };
    if (type === "ticket") return { Icon: Ticket, color: "text-purple-500" };
    if (type === "applicant") return { Icon: FileText, color: "text-orange-500" };
    return { Icon: Users, color: "text-primary" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 p-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold mb-2">لوحة التحكم</h1>
          <p className="text-muted-foreground">
            نظرة عامة على أداء الموارد البشرية في شركتك
          </p>
          {hasError && (
            <p className="text-sm text-red-500 mt-1">
              تعذر تحميل البيانات، يتم عرض بيانات احتياطية مؤقتاً.
            </p>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {["employees", "jobs", "tickets", "applicants"].map(key => (
            <Card key={key} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {key === "employees"
                    ? "إجمالي الموظفين"
                    : key === "jobs"
                    ? "الوظائف النشطة"
                    : key === "tickets"
                    ? "التذاكر المفتوحة"
                    : "المتقدمين الجدد"}
                </CardTitle>
                {key === "employees" && <Users className="h-5 w-5 text-blue-500" />}
                {key === "jobs" && <Briefcase className="h-5 w-5 text-green-500" />}
                {key === "tickets" && <Ticket className="h-5 w-5 text-purple-500" />}
                {key === "applicants" && <FileText className="h-5 w-5 text-orange-500" />}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">
                    {key === "employees" && stats.totalEmployees}
                    {key === "jobs" && stats.activeJobs}
                    {key === "tickets" && stats.openTickets}
                    {key === "applicants" && stats.pendingApplicants}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {key === "employees"
                    ? "عن الشهر الماضي"
                    : key === "jobs"
                    ? `${stats.pendingApplicants || 0} متقدم في الانتظار`
                    : key === "tickets"
                    ? "تابع التذاكر الحرجة"
                    : "متقدم جديد اليوم"}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>إجراءات سريعة</CardTitle>
            <CardDescription>الوصول السريع للمهام الشائعة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {quickActions.map(action => (
                <Link key={action.title} href={action.href}>
                  <Button
                    variant="outline"
                    className="w-full h-24 flex-col gap-2 hover:shadow-md transition-all"
                  >
                    <div className={`p-3 rounded-lg ${action.color}`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <span className="font-semibold">{action.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activities */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>النشاطات الأخيرة</CardTitle>
                <CardDescription>آخر التحديثات في النظام</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={activityFilter} onValueChange={setActivityFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="نوع النشاط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأنواع</SelectItem>
                    <SelectItem value="employee">موظف</SelectItem>
                    <SelectItem value="job">وظيفة</SelectItem>
                    <SelectItem value="ticket">تذكرة</SelectItem>
                    <SelectItem value="applicant">متقدم</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="sm">
                  عرض الكل
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && <Skeleton className="h-24 w-full" />}
                {!isLoading &&
                  limitedActivities.map((activity: ActivityItem) => {
                    const { Icon, color } = getActivityMeta(activity.type);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-2 rounded-lg bg-muted ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {activity.timeAgo || (activity as any).time}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                {!isLoading && !recentActivities.length && !hasError && (
                  <p className="text-sm text-muted-foreground">لا يوجد نشاط حديث حالياً.</p>
                )}
                {!isLoading && hasError && (
                  <p className="text-sm text-red-500">
                    تعذر تحميل النشاطات، يتم عرض بيانات احتياطية.
                  </p>
                )}
                {!isLoading && hasMoreActivities && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActivitiesLimit(prev => prev + 5)}
                  >
                    عرض المزيد
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>المهام القادمة</CardTitle>
                <CardDescription>المواعيد والمهام المجدولة</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Select value={taskPriority} onValueChange={setTaskPriority}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="الأولوية" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الأولويات</SelectItem>
                    <SelectItem value="high">عالي</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="low">منخفض</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="بحث عن مهمة..."
                  value={taskQuery}
                  onChange={e => setTaskQuery(e.target.value)}
                  className="max-w-xs"
                />
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  إضافة مهمة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && <Skeleton className="h-24 w-full" />}
                {!isLoading &&
                  filteredTasks.map((task: TaskItem) => (
                    <div
                      key={task.id}
                      className="flex items-start gap-4 p-3 rounded-lg border hover:shadow-sm transition-all"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium">{task.title}</p>
                          <Badge
                            variant={
                              task.priority === "high"
                                ? "destructive"
                                : task.priority === "medium"
                                  ? "default"
                                  : "secondary"
                            }
                            className="text-xs"
                          >
                            {task.priority === "high"
                              ? "عاجل"
                              : task.priority === "medium"
                                ? "متوسط"
                                : "عادي"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {task.due || (task as any).date}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                {!isLoading && !filteredTasks.length && !hasError && (
                  <p className="text-sm text-muted-foreground">لا توجد مهام قادمة.</p>
                )}
                {!isLoading && hasError && (
                  <p className="text-sm text-red-500">
                    تعذر تحميل المهام، حاول لاحقاً.
                  </p>
                )}
                {!isLoading && hasMoreTasks && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setTasksLimit(prev => prev + 5)}
                  >
                    عرض المزيد
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>حالة النظام</CardTitle>
            <CardDescription>معلومات سريعة عن استخدام النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm font-medium">جميع الأنظمة تعمل</p>
                  <p className="text-xs text-muted-foreground">
                    آخر تحديث: الآن
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">45 مستخدم نشط</p>
                  <p className="text-xs text-muted-foreground">متصلين الآن</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
                <AlertCircle className="h-8 w-8 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">3 إشعارات جديدة</p>
                  <p className="text-xs text-muted-foreground">تحتاج مراجعة</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
