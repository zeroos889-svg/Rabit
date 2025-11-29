import { useMemo, useState, useCallback, memo } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import DashboardLayoutRedesigned from "@/components/DashboardLayoutRedesigned";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  ArrowUp,
  ArrowDown,
  Plus,
  TrendingUp,
  DollarSign,
  Building2,
  Target,
  Sparkles,
  Activity,
  Zap,
  MoreHorizontal,
  RefreshCw,
  Eye,
  Star,
  Award,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { QuickActionsBar } from "@/components/QuickActionsBar";

// ============================================================================
// Types
// ============================================================================

interface StatCardData {
  title: string;
  titleEn: string;
  value: number | string;
  change: number;
  changeLabel: string;
  changeLabelEn: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  href?: string;
}

interface ActivityItem {
  id: number;
  type: "employee" | "job" | "ticket" | "applicant" | "performance" | "system";
  message: string;
  messageEn: string;
  timeAgo: string;
  timeAgoEn: string;
  user?: string;
  userAvatar?: string;
}

interface TaskItem {
  id: number;
  title: string;
  titleEn: string;
  due: string;
  dueEn: string;
  priority: "high" | "medium" | "low";
  assignee?: string;
  completed?: boolean;
}

interface QuickAction {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: LucideIcon;
  href: string;
  color: string;
  gradient: string;
}

// ============================================================================
// Animation Component
// ============================================================================

function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

// Stat Card Component
const StatCard = memo(function StatCard({
  stat,
  isArabic,
  isLoading,
}: {
  stat: StatCardData;
  isArabic: boolean;
  isLoading: boolean;
}) {
  const Icon = stat.icon;
  const isPositive = stat.change >= 0;

  return (
    <Card className="group relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      {/* Decorative gradient */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 ${stat.iconBg}`}
      />

      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {isArabic ? stat.title : stat.titleEn}
        </CardTitle>
        <div className={`p-2.5 rounded-xl ${stat.iconBg}`}>
          <Icon className={`h-5 w-5 ${stat.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <>
            <div className="text-3xl font-bold tracking-tight">{stat.value}</div>
            <div className="flex items-center gap-1.5 mt-2">
              <Badge
                variant="outline"
                className={`px-1.5 py-0.5 text-xs font-medium border-0 ${
                  isPositive
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }`}
              >
                {isPositive ? (
                  <ArrowUp className="h-3 w-3 me-0.5" />
                ) : (
                  <ArrowDown className="h-3 w-3 me-0.5" />
                )}
                {Math.abs(stat.change)}%
              </Badge>
              <span className="text-xs text-muted-foreground">
                {isArabic ? stat.changeLabel : stat.changeLabelEn}
              </span>
            </div>
          </>
        )}
      </CardContent>

      {/* Hover effect */}
      {stat.href && (
        <Link
          href={stat.href}
          className="absolute inset-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center bg-primary/5 backdrop-blur-sm"
        >
          <Button variant="secondary" size="sm">
            {isArabic ? "عرض التفاصيل" : "View Details"}
            <ArrowUpRight className="h-4 w-4 ms-1" />
          </Button>
        </Link>
      )}
    </Card>
  );
});

// Quick Action Card Component
const QuickActionCard = memo(function QuickActionCard({
  action,
  isArabic,
}: {
  action: QuickAction;
  isArabic: boolean;
}) {
  const Icon = action.icon;

  return (
    <Link href={action.href}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-300 border-0 bg-white dark:bg-gray-900 overflow-hidden h-full">
        <CardContent className="p-6 relative">
          {/* Background decoration */}
          <div
            className={`absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20 blur-2xl ${action.color} transition-all duration-300 group-hover:opacity-30 group-hover:scale-110`}
          />

          <div
            className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${action.gradient} shadow-lg shadow-black/10 dark:shadow-black/30 group-hover:scale-110 transition-transform duration-300`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>

          <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
            {isArabic ? action.title : action.titleEn}
          </h3>
          <p className="text-sm text-muted-foreground">
            {isArabic ? action.description : action.descriptionEn}
          </p>

          {/* Hover indicator */}
          <div className="absolute bottom-6 end-6 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="h-5 w-5 text-primary" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
});

// Activity Item Component
const ActivityItemCard = memo(function ActivityItemCard({
  activity,
  isArabic,
}: {
  activity: ActivityItem;
  isArabic: boolean;
}) {
  const getActivityMeta = (type: ActivityItem["type"]) => {
    const map: Record<
      ActivityItem["type"],
      { icon: LucideIcon; bg: string; color: string }
    > = {
      employee: { icon: Users, bg: "bg-blue-100 dark:bg-blue-900/30", color: "text-blue-600 dark:text-blue-400" },
      job: { icon: Briefcase, bg: "bg-green-100 dark:bg-green-900/30", color: "text-green-600 dark:text-green-400" },
      ticket: { icon: Ticket, bg: "bg-purple-100 dark:bg-purple-900/30", color: "text-purple-600 dark:text-purple-400" },
      applicant: { icon: FileText, bg: "bg-orange-100 dark:bg-orange-900/30", color: "text-orange-600 dark:text-orange-400" },
      performance: { icon: Target, bg: "bg-pink-100 dark:bg-pink-900/30", color: "text-pink-600 dark:text-pink-400" },
      system: { icon: Activity, bg: "bg-gray-100 dark:bg-gray-800", color: "text-gray-600 dark:text-gray-400" },
    };
    return map[type];
  };

  const { icon: Icon, bg, color } = getActivityMeta(activity.type);

  return (
    <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer">
      <div className={`p-2.5 rounded-xl ${bg} ${color} transition-transform group-hover:scale-110`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed">
          {isArabic ? activity.message : activity.messageEn}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <Clock className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {isArabic ? activity.timeAgo : activity.timeAgoEn}
          </span>
          {activity.user && (
            <>
              <span className="text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{activity.user}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

// Task Item Component
const TaskItemCard = memo(function TaskItemCard({
  task,
  isArabic,
  onToggle,
}: {
  task: TaskItem;
  isArabic: boolean;
  onToggle: () => void;
}) {
  const priorityConfig = {
    high: {
      label: "عاجل",
      labelEn: "Urgent",
      variant: "destructive" as const,
    },
    medium: {
      label: "متوسط",
      labelEn: "Medium",
      variant: "default" as const,
    },
    low: {
      label: "عادي",
      labelEn: "Low",
      variant: "secondary" as const,
    },
  };

  const priority = priorityConfig[task.priority];

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm ${
        task.completed ? "bg-muted/30 opacity-60" : "bg-white dark:bg-gray-900"
      }`}
    >
      <button
        onClick={onToggle}
        className={`mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors ${
          task.completed
            ? "bg-primary border-primary"
            : "border-muted-foreground/30 hover:border-primary"
        }`}
      >
        {task.completed && <CheckCircle2 className="h-3 w-3 text-white" />}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p
            className={`text-sm font-medium ${
              task.completed ? "line-through text-muted-foreground" : ""
            }`}
          >
            {isArabic ? task.title : task.titleEn}
          </p>
          <Badge variant={priority.variant} className="text-xs">
            {isArabic ? priority.label : priority.labelEn}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {isArabic ? task.due : task.dueEn}
          </span>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align={isArabic ? "start" : "end"}>
          <DropdownMenuItem>{isArabic ? "تعديل" : "Edit"}</DropdownMenuItem>
          <DropdownMenuItem>{isArabic ? "تأجيل" : "Postpone"}</DropdownMenuItem>
          <DropdownMenuItem className="text-destructive">
            {isArabic ? "حذف" : "Delete"}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
});

// Performance Metrics Component
function PerformanceMetrics({ isArabic, isLoading }: { isArabic: boolean; isLoading: boolean }) {
  const metrics = [
    {
      label: "رضا الموظفين",
      labelEn: "Employee Satisfaction",
      value: 87,
      color: "bg-emerald-500",
      icon: Star,
    },
    {
      label: "معدل الاحتفاظ",
      labelEn: "Retention Rate",
      value: 92,
      color: "bg-blue-500",
      icon: Users,
    },
    {
      label: "إنجاز المهام",
      labelEn: "Task Completion",
      value: 78,
      color: "bg-purple-500",
      icon: Target,
    },
    {
      label: "كفاءة التوظيف",
      labelEn: "Hiring Efficiency",
      value: 65,
      color: "bg-amber-500",
      icon: Briefcase,
    },
  ];

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {isArabic ? "مؤشرات الأداء" : "Performance Metrics"}
          </CardTitle>
          <CardDescription>
            {isArabic ? "نظرة سريعة على أداء الموارد البشرية" : "Quick overview of HR performance"}
          </CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Eye className="h-4 w-4 me-2" />
          {isArabic ? "تقرير كامل" : "Full Report"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))
        ) : (
          metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {isArabic ? metric.label : metric.labelEn}
                    </span>
                  </div>
                  <span className="text-sm font-bold">{metric.value}%</span>
                </div>
                <Progress value={metric.value} className={`h-2 ${metric.color}`} />
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

// System Status Component
function SystemStatus({ isArabic }: { isArabic: boolean }) {
  const statuses = [
    {
      label: "جميع الأنظمة تعمل",
      labelEn: "All Systems Operational",
      status: "operational",
      icon: CheckCircle2,
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-200 dark:border-emerald-800",
      color: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "45 مستخدم نشط",
      labelEn: "45 Active Users",
      status: "info",
      icon: Users,
      bg: "bg-blue-50 dark:bg-blue-900/20",
      border: "border-blue-200 dark:border-blue-800",
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "3 إشعارات جديدة",
      labelEn: "3 New Notifications",
      status: "warning",
      icon: AlertCircle,
      bg: "bg-amber-50 dark:bg-amber-900/20",
      border: "border-amber-200 dark:border-amber-800",
      color: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {isArabic ? "حالة النظام" : "System Status"}
        </CardTitle>
        <CardDescription>
          {isArabic ? "معلومات سريعة عن استخدام النظام" : "Quick system usage info"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          {statuses.map((status) => {
            const Icon = status.icon;
            return (
              <div
                key={status.label}
                className={`flex items-center gap-3 p-4 rounded-xl ${status.bg} border ${status.border}`}
              >
                <Icon className={`h-6 w-6 ${status.color}`} />
                <div>
                  <p className="text-sm font-medium">
                    {isArabic ? status.label : status.labelEn}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic ? "آخر تحديث: الآن" : "Last updated: now"}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Data Constants
// ============================================================================

const QUICK_ACTIONS: QuickAction[] = [
  {
    title: "إضافة موظف",
    titleEn: "Add Employee",
    description: "إضافة موظف جديد للنظام",
    descriptionEn: "Add a new employee to the system",
    icon: Users,
    href: "/dashboard/employees/new",
    color: "bg-blue-500",
    gradient: "bg-gradient-to-br from-blue-500 to-blue-700",
  },
  {
    title: "نشر وظيفة",
    titleEn: "Post Job",
    description: "إنشاء إعلان وظيفي جديد",
    descriptionEn: "Create a new job posting",
    icon: Briefcase,
    href: "/dashboard/jobs/new",
    color: "bg-green-500",
    gradient: "bg-gradient-to-br from-green-500 to-emerald-700",
  },
  {
    title: "إنشاء تذكرة",
    titleEn: "Create Ticket",
    description: "فتح تذكرة دعم جديدة",
    descriptionEn: "Open a new support ticket",
    icon: Ticket,
    href: "/dashboard/tickets/new",
    color: "bg-purple-500",
    gradient: "bg-gradient-to-br from-purple-500 to-purple-700",
  },
  {
    title: "إنشاء خطاب",
    titleEn: "Create Letter",
    description: "إنشاء خطاب رسمي بالذكاء الاصطناعي",
    descriptionEn: "Create an official letter with AI",
    icon: FileText,
    href: "/tools/letter-generator",
    color: "bg-orange-500",
    gradient: "bg-gradient-to-br from-orange-500 to-red-600",
  },
];

const FALLBACK_STATS: StatCardData[] = [
  {
    title: "إجمالي الموظفين",
    titleEn: "Total Employees",
    value: 156,
    change: 12,
    changeLabel: "عن الشهر الماضي",
    changeLabelEn: "from last month",
    icon: Users,
    iconBg: "bg-blue-100 dark:bg-blue-900/30",
    iconColor: "text-blue-600 dark:text-blue-400",
    href: "/dashboard/employees",
  },
  {
    title: "الوظائف النشطة",
    titleEn: "Active Jobs",
    value: 12,
    change: 25,
    changeLabel: "وظيفة جديدة",
    changeLabelEn: "new positions",
    icon: Briefcase,
    iconBg: "bg-green-100 dark:bg-green-900/30",
    iconColor: "text-green-600 dark:text-green-400",
    href: "/dashboard/ats",
  },
  {
    title: "التذاكر المفتوحة",
    titleEn: "Open Tickets",
    value: 23,
    change: -8,
    changeLabel: "عن الأسبوع الماضي",
    changeLabelEn: "from last week",
    icon: Ticket,
    iconBg: "bg-purple-100 dark:bg-purple-900/30",
    iconColor: "text-purple-600 dark:text-purple-400",
    href: "/dashboard/tickets",
  },
  {
    title: "المتقدمين الجدد",
    titleEn: "New Applicants",
    value: 45,
    change: 32,
    changeLabel: "متقدم هذا الأسبوع",
    changeLabelEn: "this week",
    icon: FileText,
    iconBg: "bg-orange-100 dark:bg-orange-900/30",
    iconColor: "text-orange-600 dark:text-orange-400",
    href: "/dashboard/ats/applicants",
  },
];

const FALLBACK_ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    type: "employee",
    message: "تم تعيين موظف جديد: أحمد محمد",
    messageEn: "New employee hired: Ahmed Mohammed",
    timeAgo: "منذ ساعتين",
    timeAgoEn: "2 hours ago",
    user: "HR Manager",
  },
  {
    id: 2,
    type: "job",
    message: "تم نشر وظيفة جديدة: مطور برمجيات",
    messageEn: "New job posted: Software Developer",
    timeAgo: "منذ 3 ساعات",
    timeAgoEn: "3 hours ago",
  },
  {
    id: 3,
    type: "ticket",
    message: "تذكرة جديدة: طلب إجازة - سارة علي",
    messageEn: "New ticket: Leave request - Sara Ali",
    timeAgo: "منذ 5 ساعات",
    timeAgoEn: "5 hours ago",
  },
  {
    id: 4,
    type: "performance",
    message: "اكتمل تقييم الأداء الربعي",
    messageEn: "Quarterly performance review completed",
    timeAgo: "منذ يوم",
    timeAgoEn: "1 day ago",
  },
  {
    id: 5,
    type: "applicant",
    message: "15 متقدم جديد لوظيفة محاسب",
    messageEn: "15 new applicants for Accountant position",
    timeAgo: "منذ يومين",
    timeAgoEn: "2 days ago",
  },
];

const FALLBACK_TASKS: TaskItem[] = [
  {
    id: 1,
    title: "مقابلة مع مرشح لوظيفة مدير مبيعات",
    titleEn: "Interview with Sales Manager candidate",
    due: "اليوم، 2:00 م",
    dueEn: "Today, 2:00 PM",
    priority: "high",
  },
  {
    id: 2,
    title: "مراجعة طلبات الإجازات المعلقة",
    titleEn: "Review pending leave requests",
    due: "غداً، 10:00 ص",
    dueEn: "Tomorrow, 10:00 AM",
    priority: "medium",
  },
  {
    id: 3,
    title: "إعداد تقرير الرواتب الشهري",
    titleEn: "Prepare monthly payroll report",
    due: "15 نوفمبر",
    dueEn: "November 15",
    priority: "low",
  },
  {
    id: 4,
    title: "تحديث سياسات العمل عن بعد",
    titleEn: "Update remote work policies",
    due: "نهاية الأسبوع",
    dueEn: "End of week",
    priority: "medium",
  },
];

const QUICK_NAV_ACTIONS = [
  {
    href: "/dashboard/employees",
    icon: Users,
    labelAr: "الموظفون",
    labelEn: "Employees",
  },
  {
    href: "/dashboard/ats",
    icon: Briefcase,
    labelAr: "نظام التوظيف",
    labelEn: "ATS",
  },
  {
    href: "/dashboard/tickets",
    icon: Ticket,
    labelAr: "التذاكر",
    labelEn: "Tickets",
  },
  {
    href: "/tools",
    icon: Calculator,
    labelAr: "الأدوات",
    labelEn: "Tools",
  },
];

// ============================================================================
// Main Component
// ============================================================================

export default function CompanyDashboardRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  // API Query
  const overviewQuery = trpc.dashboard.companyOverview.useQuery(undefined, {
    staleTime: 30_000,
  });

  // State
  const [taskQuery, setTaskQuery] = useState("");
  const [activitiesLimit, setActivitiesLimit] = useState(5);
  const [tasksLimit, setTasksLimit] = useState(5);
  const [activityFilter, setActivityFilter] = useState("all");
  const [taskPriority, setTaskPriority] = useState("all");
  const [completedTasks, setCompletedTasks] = useState<Set<number>>(new Set());

  // Data
  const isLoading = overviewQuery.isLoading;
  const hasError = overviewQuery.isError;

  const stats = useMemo(() => {
    if (!overviewQuery.data?.stats) return FALLBACK_STATS;
    const { totalEmployees, activeJobs, openTickets, pendingApplicants } = overviewQuery.data.stats;
    return FALLBACK_STATS.map((stat, index) => ({
      ...stat,
      value: [totalEmployees, activeJobs, openTickets, pendingApplicants][index],
    }));
  }, [overviewQuery.data]);

  const activities = overviewQuery.data?.activities || FALLBACK_ACTIVITIES;
  const tasks = overviewQuery.data?.tasks || FALLBACK_TASKS;

  // Filtered Data
  const filteredActivities = useMemo(
    () =>
      (activities as ActivityItem[]).filter(
        (act) => activityFilter === "all" || act.type === activityFilter
      ),
    [activities, activityFilter]
  );

  const limitedActivities = useMemo(
    () => filteredActivities.slice(0, activitiesLimit),
    [filteredActivities, activitiesLimit]
  );

  const filteredTasks = useMemo(() => {
    return (tasks as TaskItem[])
      .filter(
        (task) =>
          (task.title?.toLowerCase().includes(taskQuery.toLowerCase()) ||
            task.titleEn?.toLowerCase().includes(taskQuery.toLowerCase())) &&
          (taskPriority === "all" || task.priority === taskPriority)
      )
      .map((task) => ({
        ...task,
        completed: completedTasks.has(task.id),
      }))
      .slice(0, tasksLimit);
  }, [tasks, taskQuery, taskPriority, tasksLimit, completedTasks]);

  const hasMoreActivities = filteredActivities.length > limitedActivities.length;
  const hasMoreTasks = tasks.length > tasksLimit;

  // Handlers
  const handleToggleTask = useCallback((taskId: number) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  }, []);

  return (
    <DashboardLayoutRedesigned
      userType="company"
      title={isArabic ? "لوحة التحكم" : "Dashboard"}
    >
      <div className="space-y-8">
        {/* Welcome Section */}
        <AnimateOnScroll>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 text-white">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-medium text-white/80">
                    {isArabic ? "مرحباً بعودتك" : "Welcome back"}
                  </span>
                </div>
                <h1 className="text-3xl font-bold mb-2">
                  {isArabic ? "لوحة تحكم الشركة" : "Company Dashboard"}
                </h1>
                <p className="text-white/80 max-w-xl">
                  {isArabic
                    ? "نظرة شاملة على أداء الموارد البشرية في شركتك. تابع الموظفين، والتوظيف، والمهام في مكان واحد."
                    : "A comprehensive overview of your company's HR performance. Track employees, recruitment, and tasks in one place."}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-white border-0"
                >
                  <RefreshCw className="h-4 w-4 me-2" />
                  {isArabic ? "تحديث" : "Refresh"}
                </Button>
                <Button className="bg-white text-primary hover:bg-white/90">
                  <Award className="h-4 w-4 me-2" />
                  {isArabic ? "عرض التقارير" : "View Reports"}
                </Button>
              </div>
            </div>

            {/* Error message */}
            {hasError && (
              <div className="mt-4 p-3 bg-red-500/20 rounded-lg border border-red-400/30">
                <p className="text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {isArabic
                    ? "تعذر تحميل البيانات، يتم عرض بيانات احتياطية مؤقتاً."
                    : "Failed to load data, showing fallback data temporarily."}
                </p>
              </div>
            )}
          </div>
        </AnimateOnScroll>

        <QuickActionsBar
          isArabic={isArabic}
          actions={QUICK_NAV_ACTIONS}
          sticky={false}
          className="border-0 bg-transparent px-0 py-2"
        />

        {/* Stats Grid */}
        <AnimateOnScroll delay={100}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, index) => (
              <StatCard
                key={stat.title}
                stat={stat}
                isArabic={isArabic}
                isLoading={isLoading}
              />
            ))}
          </div>
        </AnimateOnScroll>

        {/* Quick Actions */}
        <AnimateOnScroll delay={200}>
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Zap className="h-5 w-5 text-amber-500" />
                  {isArabic ? "إجراءات سريعة" : "Quick Actions"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isArabic ? "الوصول السريع للمهام الشائعة" : "Quick access to common tasks"}
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_ACTIONS.map((action) => (
                <QuickActionCard key={action.title} action={action} isArabic={isArabic} />
              ))}
            </div>
          </div>
        </AnimateOnScroll>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Recent Activities */}
          <AnimateOnScroll delay={300}>
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    {isArabic ? "النشاطات الأخيرة" : "Recent Activities"}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? "آخر التحديثات في النظام" : "Latest system updates"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder={isArabic ? "الكل" : "All"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? "كل الأنواع" : "All Types"}</SelectItem>
                      <SelectItem value="employee">{isArabic ? "موظف" : "Employee"}</SelectItem>
                      <SelectItem value="job">{isArabic ? "وظيفة" : "Job"}</SelectItem>
                      <SelectItem value="ticket">{isArabic ? "تذكرة" : "Ticket"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {isLoading && (
                    <>
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                      <Skeleton className="h-16 w-full rounded-xl" />
                    </>
                  )}
                  {!isLoading &&
                    limitedActivities.map((activity) => (
                      <ActivityItemCard
                        key={activity.id}
                        activity={activity as ActivityItem}
                        isArabic={isArabic}
                      />
                    ))}
                  {!isLoading && !limitedActivities.length && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {isArabic ? "لا يوجد نشاط حديث" : "No recent activity"}
                    </p>
                  )}
                </div>
                {hasMoreActivities && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setActivitiesLimit((prev) => prev + 5)}
                  >
                    {isArabic ? "عرض المزيد" : "Show More"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </AnimateOnScroll>

          {/* Upcoming Tasks */}
          <AnimateOnScroll delay={400}>
            <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                    {isArabic ? "المهام القادمة" : "Upcoming Tasks"}
                  </CardTitle>
                  <CardDescription>
                    {isArabic ? "المواعيد والمهام المجدولة" : "Scheduled appointments and tasks"}
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 me-2" />
                  {isArabic ? "إضافة" : "Add"}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Input
                    placeholder={isArabic ? "بحث عن مهمة..." : "Search tasks..."}
                    value={taskQuery}
                    onChange={(e) => setTaskQuery(e.target.value)}
                    className="h-9"
                  />
                  <Select value={taskPriority} onValueChange={setTaskPriority}>
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue placeholder={isArabic ? "الأولوية" : "Priority"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? "الكل" : "All"}</SelectItem>
                      <SelectItem value="high">{isArabic ? "عاجل" : "High"}</SelectItem>
                      <SelectItem value="medium">{isArabic ? "متوسط" : "Medium"}</SelectItem>
                      <SelectItem value="low">{isArabic ? "عادي" : "Low"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  {isLoading && (
                    <>
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                      <Skeleton className="h-20 w-full rounded-xl" />
                    </>
                  )}
                  {!isLoading &&
                    filteredTasks.map((task) => (
                      <TaskItemCard
                        key={task.id}
                        task={task}
                        isArabic={isArabic}
                        onToggle={() => handleToggleTask(task.id)}
                      />
                    ))}
                  {!isLoading && !filteredTasks.length && (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      {isArabic ? "لا توجد مهام" : "No tasks found"}
                    </p>
                  )}
                </div>

                {hasMoreTasks && (
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setTasksLimit((prev) => prev + 5)}
                  >
                    {isArabic ? "عرض المزيد" : "Show More"}
                  </Button>
                )}
              </CardContent>
            </Card>
          </AnimateOnScroll>
        </div>

        {/* Bottom Section */}
        <div className="grid gap-6 lg:grid-cols-2">
          <AnimateOnScroll delay={500}>
            <PerformanceMetrics isArabic={isArabic} isLoading={isLoading} />
          </AnimateOnScroll>

          <AnimateOnScroll delay={600}>
            <SystemStatus isArabic={isArabic} />
          </AnimateOnScroll>
        </div>

        <AnimateOnScroll delay={700}>
          <ConnectedPagesSection
            isArabic={isArabic}
            highlight={{ ar: "روابط المنصة", en: "Platform Shortcuts" }}
            title={{
              ar: "تابع الرحلة من لوحة التحكم",
              en: "Continue the journey from your dashboard",
            }}
            subtitle={{
              ar: "انتقل مباشرةً للأدوات، الباقات، أو حجز الاستشارات لإنهاء مسار العمل بدون مغادرة لوحة الشركة.",
              en: "Jump to tools, pricing, or consulting bookings to finish workflows without leaving the company dashboard.",
            }}
            className="pt-4"
          />
        </AnimateOnScroll>
      </div>
    </DashboardLayoutRedesigned>
  );
}
