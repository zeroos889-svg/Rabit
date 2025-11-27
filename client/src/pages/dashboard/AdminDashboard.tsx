import { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
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
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  Shield,
  Bell,
  Search,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  Settings,
  Filter,
  MoreHorizontal,
  Zap,
  Globe,
  Server,
  Database,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Stats card component
function StatsCard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon: Icon, 
  iconColor,
  isLoading 
}: {
  title: string;
  value: string | number;
  change: string;
  changeType: "up" | "down" | "neutral";
  icon: React.ElementType;
  iconColor: string;
  isLoading?: boolean;
}) {
  return (
    <motion.div variants={fadeInUp}>
      <Card className="hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <p className="text-3xl font-bold">{value}</p>
              )}
              <div className="flex items-center gap-1">
                {changeType === "up" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : changeType === "down" ? (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                ) : null}
                <span className={`text-sm ${
                  changeType === "up" ? "text-green-500" : 
                  changeType === "down" ? "text-red-500" : "text-muted-foreground"
                }`}>
                  {change}
                </span>
              </div>
            </div>
            <div className={`p-4 rounded-2xl ${iconColor}`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Activity item component
function ActivityItem({ 
  type, 
  message, 
  time, 
  user 
}: { 
  type: string; 
  message: string; 
  time: string;
  user?: string;
}) {
  const getTypeStyles = () => {
    switch (type) {
      case "user": return { bg: "bg-blue-100 dark:bg-blue-900", text: "text-blue-600 dark:text-blue-400", Icon: Users };
      case "subscription": return { bg: "bg-green-100 dark:bg-green-900", text: "text-green-600 dark:text-green-400", Icon: CreditCard };
      case "security": return { bg: "bg-red-100 dark:bg-red-900", text: "text-red-600 dark:text-red-400", Icon: Shield };
      case "system": return { bg: "bg-purple-100 dark:bg-purple-900", text: "text-purple-600 dark:text-purple-400", Icon: Server };
      default: return { bg: "bg-slate-100 dark:bg-slate-800", text: "text-slate-600 dark:text-slate-400", Icon: Activity };
    }
  };

  const { bg, text, Icon } = getTypeStyles();

  return (
    <motion.div 
      variants={fadeInUp}
      className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted/50 transition-colors group"
    >
      <div className={`p-2 rounded-lg ${bg}`}>
        <Icon className={`h-4 w-4 ${text}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{message}</p>
        <div className="flex items-center gap-2 mt-1">
          {user && <span className="text-xs text-muted-foreground">{user}</span>}
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {time}
          </span>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
        <Eye className="h-4 w-4" />
      </Button>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("week");
  const [searchQuery, setSearchQuery] = useState("");
  const [activityFilter, setActivityFilter] = useState("all");

  // Simulated data - replace with actual tRPC queries
  const isLoading = false;
  
  const stats = {
    totalUsers: 2847,
    activeCompanies: 156,
    totalRevenue: "543,200",
    activeSubscriptions: 142,
    userGrowth: "+12.5%",
    companyGrowth: "+8.3%",
    revenueGrowth: "+23.1%",
    subscriptionGrowth: "+5.2%",
  };

  const systemHealth = {
    uptime: 99.9,
    responseTime: 145,
    activeConnections: 234,
    cpuUsage: 45,
    memoryUsage: 62,
    storageUsage: 38,
  };

  const recentActivities = [
    { id: 1, type: "user", message: "مستخدم جديد: شركة النور للتجارة", time: "منذ 5 دقائق", user: "admin@rabt.sa" },
    { id: 2, type: "subscription", message: "تجديد اشتراك باقة المؤسسات", time: "منذ 15 دقيقة", user: "billing@rabt.sa" },
    { id: 3, type: "security", message: "محاولة دخول مشبوهة - تم الحظر", time: "منذ 30 دقيقة" },
    { id: 4, type: "system", message: "تحديث قاعدة البيانات بنجاح", time: "منذ ساعة" },
    { id: 5, type: "user", message: "إضافة 25 موظف لشركة الفهد", time: "منذ ساعتين", user: "hr@alfahd.sa" },
    { id: 6, type: "subscription", message: "ترقية باقة من أساسية لمتقدمة", time: "منذ 3 ساعات" },
  ];

  const topCompanies = [
    { name: "شركة الفهد التجارية", employees: 450, plan: "مؤسسات", status: "active" },
    { name: "مجموعة النور", employees: 320, plan: "متقدمة", status: "active" },
    { name: "شركة الأمل للتقنية", employees: 180, plan: "متقدمة", status: "active" },
    { name: "مؤسسة البناء الحديث", employees: 95, plan: "أساسية", status: "trial" },
    { name: "شركة الخليج للاستشارات", employees: 45, plan: "أساسية", status: "active" },
  ];

  const filteredActivities = useMemo(() => {
    return recentActivities.filter(activity => 
      activityFilter === "all" || activity.type === activityFilter
    );
  }, [activityFilter]);

  return (
    <DashboardLayout>
      <motion.div 
        className="space-y-8 p-8"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              لوحة تحكم النظام
            </h1>
            <p className="text-muted-foreground mt-1">
              مرحباً بك، هذه نظرة شاملة على أداء منصة رابِط
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="بحث سريع..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 w-64"
              />
            </div>
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-40">
                <Calendar className="h-4 w-4 ml-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">اليوم</SelectItem>
                <SelectItem value="week">هذا الأسبوع</SelectItem>
                <SelectItem value="month">هذا الشهر</SelectItem>
                <SelectItem value="quarter">ربع سنوي</SelectItem>
                <SelectItem value="year">سنوي</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          variants={staggerContainer}
        >
          <StatsCard
            title="إجمالي المستخدمين"
            value={stats.totalUsers.toLocaleString()}
            change={stats.userGrowth}
            changeType="up"
            icon={Users}
            iconColor="bg-blue-500"
            isLoading={isLoading}
          />
          <StatsCard
            title="الشركات النشطة"
            value={stats.activeCompanies}
            change={stats.companyGrowth}
            changeType="up"
            icon={Building2}
            iconColor="bg-green-500"
            isLoading={isLoading}
          />
          <StatsCard
            title="الإيرادات (ريال)"
            value={stats.totalRevenue}
            change={stats.revenueGrowth}
            changeType="up"
            icon={CreditCard}
            iconColor="bg-purple-500"
            isLoading={isLoading}
          />
          <StatsCard
            title="الاشتراكات الفعالة"
            value={stats.activeSubscriptions}
            change={stats.subscriptionGrowth}
            changeType="up"
            icon={Zap}
            iconColor="bg-orange-500"
            isLoading={isLoading}
          />
        </motion.div>

        {/* System Health */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5 text-green-500" />
                  صحة النظام
                </CardTitle>
                <CardDescription>حالة الخوادم والأداء</CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <CheckCircle2 className="h-3 w-3 ml-1" />
                جميع الأنظمة تعمل
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">وقت التشغيل</span>
                    <span className="font-medium">{systemHealth.uptime}%</span>
                  </div>
                  <Progress value={systemHealth.uptime} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">استخدام المعالج</span>
                    <span className="font-medium">{systemHealth.cpuUsage}%</span>
                  </div>
                  <Progress value={systemHealth.cpuUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">استخدام الذاكرة</span>
                    <span className="font-medium">{systemHealth.memoryUsage}%</span>
                  </div>
                  <Progress value={systemHealth.memoryUsage} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">التخزين</span>
                    <span className="font-medium">{systemHealth.storageUsage}%</span>
                  </div>
                  <Progress value={systemHealth.storageUsage} className="h-2" />
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <Activity className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">زمن الاستجابة</p>
                    <p className="text-xs text-muted-foreground">{systemHealth.responseTime}ms</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                  <Globe className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-sm font-medium">الاتصالات النشطة</p>
                    <p className="text-xs text-muted-foreground">{systemHealth.activeConnections} مستخدم</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activities */}
          <motion.div variants={fadeInUp} className="lg:col-span-2">
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>النشاطات الأخيرة</CardTitle>
                  <CardDescription>آخر التحديثات في النظام</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={activityFilter} onValueChange={setActivityFilter}>
                    <SelectTrigger className="w-32">
                      <Filter className="h-4 w-4 ml-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="user">المستخدمين</SelectItem>
                      <SelectItem value="subscription">الاشتراكات</SelectItem>
                      <SelectItem value="security">الأمان</SelectItem>
                      <SelectItem value="system">النظام</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="ghost" size="sm">
                    عرض الكل
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AnimatePresence mode="wait">
                  <motion.div 
                    key={activityFilter}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    variants={staggerContainer}
                    className="space-y-2"
                  >
                    {filteredActivities.map((activity) => (
                      <ActivityItem
                        key={activity.id}
                        type={activity.type}
                        message={activity.message}
                        time={activity.time}
                        user={activity.user}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Top Companies */}
          <motion.div variants={fadeInUp}>
            <Card className="border-0 shadow-lg h-full">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>أكبر الشركات</CardTitle>
                  <CardDescription>حسب عدد الموظفين</CardDescription>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCompanies.map((company, index) => (
                    <motion.div
                      key={company.name}
                      variants={fadeInUp}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{company.name}</p>
                          <p className="text-xs text-muted-foreground">{company.employees} موظف</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={company.status === "active" ? "default" : "secondary"}>
                          {company.plan}
                        </Badge>
                        {company.status === "trial" && (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            تجريبي
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>إجراءات سريعة</CardTitle>
              <CardDescription>الوصول السريع لأهم الوظائف الإدارية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "إدارة المستخدمين", icon: Users, href: "/admin/users", color: "from-blue-500 to-blue-600" },
                  { title: "إدارة الاشتراكات", icon: CreditCard, href: "/admin/subscriptions", color: "from-green-500 to-green-600" },
                  { title: "سجلات الأمان", icon: Shield, href: "/admin/security", color: "from-red-500 to-red-600" },
                  { title: "إعدادات النظام", icon: Settings, href: "/admin/settings", color: "from-purple-500 to-purple-600" },
                ].map((action) => (
                  <Link key={action.title} href={action.href}>
                    <Button
                      variant="outline"
                      className="w-full h-24 flex-col gap-2 hover:shadow-md transition-all border-dashed hover:border-solid group"
                    >
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} group-hover:scale-110 transition-transform`}>
                        <action.icon className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium text-sm">{action.title}</span>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
