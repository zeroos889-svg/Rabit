import { useState } from "react";
import { useTranslation } from "react-i18next";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Briefcase,
  UserPlus,
  AlertCircle,
  Settings,
  Activity,
  Calendar,
  Bell,
  BarChart3,
  Clock,
  FileText,
  DollarSign,
  Target,
  Search,
  Filter,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/PermissionGuard";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animated-card";
import { StatCard } from "@/components/ui/stat-card";
import { PageLoading } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";

interface CompanyStats {
  totalEmployees: number;
  activeJobs: number;
  pendingApplications: number;
  completionRate: number;
  newEmployeesThisMonth: number;
  activeTickets: number;
  monthlyGrowth: number;
}

interface Employee {
  id: number;
  name: string;
  position: string;
  department: string;
  status: "active" | "inactive" | "on-leave";
  joinDate: string;
  avatar?: string;
}

interface Job {
  id: number;
  title: string;
  department: string;
  applicants: number;
  status: "open" | "closed" | "draft";
  postedDate: string;
}

interface Activity {
  id: number;
  type: "employee" | "job" | "application" | "ticket";
  message: string;
  timestamp: string;
  user?: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function EnhancedCompanyDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedRegion, setSelectedRegion] = useState("all");
  usePermissions(); // تفعيل hook الصلاحيات

  // Fetch company stats
  const { data: stats, isLoading: loadingStats } = trpc.company.getStats.useQuery();

  // Mock data for demonstration
  const mockStats: CompanyStats = {
    totalEmployees: 156,
    activeJobs: 12,
    pendingApplications: 48,
    completionRate: 87.5,
    newEmployeesThisMonth: 8,
    activeTickets: 5,
    monthlyGrowth: 12.3,
  };

  const mockEmployees: Employee[] = [
    {
      id: 1,
      name: "أحمد محمد",
      position: "مطور برمجيات",
      department: "تقنية المعلومات",
      status: "active",
      joinDate: "2024-01-15",
    },
    {
      id: 2,
      name: "فاطمة علي",
      position: "مدير مشروع",
      department: "إدارة المشاريع",
      status: "active",
      joinDate: "2023-11-20",
    },
    {
      id: 3,
      name: "خالد سعيد",
      position: "محلل بيانات",
      department: "تحليل البيانات",
      status: "on-leave",
      joinDate: "2024-03-10",
    },
  ];

  const mockJobs: Job[] = [
    {
      id: 1,
      title: "مطور Full Stack",
      department: "تقنية المعلومات",
      applicants: 23,
      status: "open",
      postedDate: "2024-11-15",
    },
    {
      id: 2,
      title: "مدير تسويق",
      department: "التسويق",
      applicants: 15,
      status: "open",
      postedDate: "2024-11-10",
    },
    {
      id: 3,
      title: "محاسب قانوني",
      department: "المالية",
      applicants: 10,
      status: "draft",
      postedDate: "2024-11-20",
    },
  ];

  const mockActivities: Activity[] = [
    {
      id: 1,
      type: "employee",
      message: "تم تعيين موظف جديد: أحمد محمد",
      timestamp: "منذ ساعتين",
      user: "إدارة الموارد البشرية",
    },
    {
      id: 2,
      type: "application",
      message: "طلب جديد: مطور Full Stack",
      timestamp: "منذ 3 ساعات",
      user: "سارة أحمد",
    },
    {
      id: 3,
      type: "job",
      message: "تم نشر وظيفة جديدة: مدير تسويق",
      timestamp: "منذ 5 ساعات",
      user: "محمد علي",
    },
    {
      id: 4,
      type: "ticket",
      message: "تذكرة دعم جديدة: مشكلة في النظام",
      timestamp: "منذ 6 ساعات",
      user: "خالد سعيد",
    },
  ];

  const currentStats = stats || mockStats;

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "employee":
        return <UserPlus className="h-4 w-4 text-blue-600" />;
      case "job":
        return <Briefcase className="h-4 w-4 text-green-600" />;
      case "application":
        return <FileText className="h-4 w-4 text-purple-600" />;
      case "ticket":
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getEmployeeStatusBadge = (status: Employee["status"]) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 text-green-800">
            {isArabic ? "نشط" : "Active"}
          </Badge>
        );
      case "inactive":
        return (
          <Badge className="bg-red-100 text-red-800">
            {isArabic ? "غير نشط" : "Inactive"}
          </Badge>
        );
      case "on-leave":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            {isArabic ? "في إجازة" : "On Leave"}
          </Badge>
        );
    }
  };

  const getJobStatusBadge = (status: Job["status"]) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-green-100 text-green-800">
            {isArabic ? "مفتوحة" : "Open"}
          </Badge>
        );
      case "closed":
        return (
          <Badge className="bg-gray-100 text-gray-800">
            {isArabic ? "مغلقة" : "Closed"}
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {isArabic ? "مسودة" : "Draft"}
          </Badge>
        );
    }
  };

  if (loadingStats) {
    return <PageLoading message={isArabic ? "جاري تحميل لوحة التحكم..." : "Loading dashboard..."} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/10 to-cyan-400/10 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/10 to-pink-400/10 blur-3xl"
        />
      </div>

      <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Enhanced Header */}
        <FadeIn>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-purple-600 bg-clip-text text-transparent">
                {isArabic ? "لوحة التحكم - الشركة" : "Company Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {isArabic
                  ? "إدارة شاملة لموظفيك ووظائفك بكفاءة عالية"
                  : "Comprehensive and efficient management for your employees and jobs"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={isArabic ? "المنطقة" : "Region"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{isArabic ? "جميع المناطق" : "All Regions"}</SelectItem>
                  <SelectItem value="riyadh">{isArabic ? "الرياض" : "Riyadh"}</SelectItem>
                  <SelectItem value="jeddah">{isArabic ? "جدة" : "Jeddah"}</SelectItem>
                  <SelectItem value="dammam">{isArabic ? "الدمام" : "Dammam"}</SelectItem>
                </SelectContent>
              </Select>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    5
                  </span>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </FadeIn>

        {/* Enhanced Stats Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StaggerItem>
            <StatCard
              title={isArabic ? "إجمالي الموظفين" : "Total Employees"}
              value={currentStats.totalEmployees}
              icon={Users}
              trend={{ value: currentStats.monthlyGrowth, isPositive: true }}
              description={`${currentStats.newEmployeesThisMonth} ${isArabic ? "موظف جديد" : "new this month"}`}
              gradient="from-blue-500 to-cyan-600"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={isArabic ? "الوظائف النشطة" : "Active Jobs"}
              value={currentStats.activeJobs}
              icon={Briefcase}
              description={`${currentStats.pendingApplications} ${isArabic ? "طلب قيد المراجعة" : "pending applications"}`}
              gradient="from-purple-500 to-pink-600"
              delay={0.1}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={isArabic ? "معدل الإنجاز" : "Completion Rate"}
              value={`${currentStats.completionRate}%`}
              icon={Target}
              trend={{ value: 5.2, isPositive: true }}
              gradient="from-green-500 to-emerald-600"
              delay={0.2}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={isArabic ? "التذاكر النشطة" : "Active Tickets"}
              value={currentStats.activeTickets}
              icon={AlertCircle}
              gradient="from-orange-500 to-red-600"
              delay={0.3}
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Main Content Tabs */}        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">
              {isArabic ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="employees">
              {isArabic ? "الموظفون" : "Employees"}
            </TabsTrigger>
            <TabsTrigger value="jobs">
              {isArabic ? "الوظائف" : "Jobs"}
            </TabsTrigger>
            <TabsTrigger value="reports">
              {isArabic ? "التقارير" : "Reports"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Activity */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    {isArabic ? "النشاط الأخير" : "Recent Activity"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockActivities.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="mt-1">{getActivityIcon(activity.type)}</div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{activity.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-500">{activity.timestamp}</span>
                            {activity.user && (
                              <>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-500">{activity.user}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <PermissionGuard permission="employees.create">
                    <Button className="w-full justify-start" variant="outline">
                      <UserPlus className="h-4 w-4 mr-2" />
                      {isArabic ? "إضافة موظف" : "Add Employee"}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission="jobs.create">
                    <Button className="w-full justify-start" variant="outline">
                      <Plus className="h-4 w-4 mr-2" />
                      {isArabic ? "نشر وظيفة" : "Post Job"}
                    </Button>
                  </PermissionGuard>
                  <PermissionGuard permission="reports.view">
                    <Button className="w-full justify-start" variant="outline">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      {isArabic ? "عرض التقارير" : "View Reports"}
                    </Button>
                  </PermissionGuard>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    {isArabic ? "تصدير البيانات" : "Export Data"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Employees Tab */}
          <TabsContent value="employees" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>{isArabic ? "إدارة الموظفين" : "Employee Management"}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {isArabic ? "تصفية" : "Filter"}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      {isArabic ? "بحث" : "Search"}
                    </Button>
                    <PermissionGuard permission="employees.create">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {isArabic ? "إضافة موظف" : "Add Employee"}
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {employee.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium">{employee.name}</p>
                          <p className="text-sm text-gray-500">{employee.position}</p>
                          <p className="text-xs text-gray-400">{employee.department}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getEmployeeStatusBadge(employee.status)}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <PermissionGuard permission="employees.update">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission="employees.delete">
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>{isArabic ? "إدارة الوظائف" : "Job Management"}</CardTitle>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {isArabic ? "تصفية" : "Filter"}
                    </Button>
                    <PermissionGuard permission="jobs.create">
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        {isArabic ? "نشر وظيفة" : "Post Job"}
                      </Button>
                    </PermissionGuard>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockJobs.map((job) => (
                    <div
                      key={job.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 text-blue-600" />
                          <div>
                            <p className="font-medium">{job.title}</p>
                            <p className="text-sm text-gray-500">{job.department}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {job.applicants} {isArabic ? "متقدم" : "applicants"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {job.postedDate}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getJobStatusBadge(job.status)}
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <PermissionGuard permission="jobs.update">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                          <PermissionGuard permission="jobs.delete">
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGuard>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {isArabic ? "تقارير الأداء" : "Performance Reports"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? "تقرير الموظفين الشهري" : "Monthly Employee Report"}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? "تقرير التوظيف" : "Recruitment Report"}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? "تقرير الحضور" : "Attendance Report"}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    {isArabic ? "التقارير المالية" : "Financial Reports"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? "تقرير الرواتب" : "Payroll Report"}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? "تقرير التكاليف" : "Cost Report"}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? "تقرير الميزانية" : "Budget Report"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
