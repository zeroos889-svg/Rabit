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
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  FileText,
  Award,
  Target,
  CheckCircle,
  Activity,
  BookOpen,
  MessageSquare,
  Bell,
  Settings,
  Download,
  Upload,
  Eye,
  Edit,
} from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/animated-card";
import { StatCard } from "@/components/ui/stat-card";
import { PageLoading } from "@/components/ui/loading-spinner";
import { motion } from "framer-motion";

interface EmployeeStats {
  tasksCompleted: number;
  tasksInProgress: number;
  leaveBalance: number;
  attendanceRate: number;
  performanceScore: number;
  upcomingLeaves: number;
}

interface Task {
  id: number;
  title: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "in-progress" | "completed";
  dueDate: string;
  progress: number;
}

interface LeaveRequest {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "pending" | "approved" | "rejected";
}

interface Document {
  id: number;
  name: string;
  type: string;
  uploadDate: string;
  size: string;
}

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function EnhancedEmployeeDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch employee stats
  const { data: stats, isLoading: loadingStats } = trpc.employee.getStats.useQuery();

  // Mock data for demonstration
  const mockStats: EmployeeStats = {
    tasksCompleted: 24,
    tasksInProgress: 5,
    leaveBalance: 15,
    attendanceRate: 96.5,
    performanceScore: 4.3,
    upcomingLeaves: 2,
  };

  const mockTasks: Task[] = [
    {
      id: 1,
      title: "إكمال تقرير الأداء الشهري",
      priority: "high",
      status: "in-progress",
      dueDate: "2024-11-28",
      progress: 65,
    },
    {
      id: 2,
      title: "مراجعة الوثائق القانونية",
      priority: "medium",
      status: "pending",
      dueDate: "2024-11-30",
      progress: 0,
    },
    {
      id: 3,
      title: "حضور اجتماع الفريق",
      priority: "high",
      status: "completed",
      dueDate: "2024-11-26",
      progress: 100,
    },
  ];

  const mockLeaveRequests: LeaveRequest[] = [
    {
      id: 1,
      type: "إجازة سنوية",
      startDate: "2024-12-01",
      endDate: "2024-12-05",
      days: 5,
      status: "approved",
    },
    {
      id: 2,
      type: "إجازة مرضية",
      startDate: "2024-11-20",
      endDate: "2024-11-21",
      days: 2,
      status: "pending",
    },
  ];

  const mockDocuments: Document[] = [
    {
      id: 1,
      name: "عقد العمل",
      type: "PDF",
      uploadDate: "2024-01-15",
      size: "2.4 MB",
    },
    {
      id: 2,
      name: "شهادة الخبرة",
      type: "PDF",
      uploadDate: "2024-06-10",
      size: "1.2 MB",
    },
    {
      id: 3,
      name: "تقرير الأداء Q3",
      type: "DOCX",
      uploadDate: "2024-10-01",
      size: "856 KB",
    },
  ];

  const currentStats = stats || mockStats;

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return (
          <Badge className="bg-red-100 text-red-800">
            {isArabic ? "عالية" : "High"}
          </Badge>
        );
      case "medium":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            {isArabic ? "متوسطة" : "Medium"}
          </Badge>
        );
      case "low":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            {isArabic ? "منخفضة" : "Low"}
          </Badge>
        );
    }
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity
  const getStatusBadge = (status: Task["status"] | LeaveRequest["status"]) => {
    const isCompleted = status === "completed";
    const isApproved = status === "approved";
    
    if (isCompleted || isApproved) {
      let text = "";
      if (isArabic) {
        text = isCompleted ? "مكتملة" : "موافق عليها";
      } else {
        text = isCompleted ? "Completed" : "Approved";
      }
      
      return (
        <Badge className="bg-green-100 text-green-800">
          {text}
        </Badge>
      );
    }
    
    if (status === "in-progress") {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          {isArabic ? "قيد التنفيذ" : "In Progress"}
        </Badge>
      );
    }
    
    if (status === "pending") {
      return (
        <Badge className="bg-yellow-100 text-yellow-800">
          {isArabic ? "قيد الانتظار" : "Pending"}
        </Badge>
      );
    }
    
    if (status === "rejected") {
      return (
        <Badge className="bg-red-100 text-red-800">
          {isArabic ? "مرفوضة" : "Rejected"}
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
          className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-green-400/10 to-blue-400/10 blur-3xl"
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
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
                {isArabic ? "لوحة التحكم - الموظف" : "Employee Dashboard"}
              </h1>
              <p className="text-muted-foreground">
                {isArabic
                  ? "مرحباً بك! تابع مهامك وإنجازاتك اليومية"
                  : "Welcome! Track your daily tasks and achievements"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    3
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
              title={isArabic ? "المهام المكتملة" : "Tasks Completed"}
              value={currentStats.tasksCompleted}
              icon={CheckCircle}
              trend={{ value: 12.5, isPositive: true }}
              description={`${currentStats.tasksInProgress} ${isArabic ? "قيد التنفيذ" : "in progress"}`}
              gradient="from-green-500 to-emerald-600"
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={isArabic ? "رصيد الإجازات" : "Leave Balance"}
              value={`${currentStats.leaveBalance} ${isArabic ? "يوم" : "days"}`}
              icon={Calendar}
              description={`${currentStats.upcomingLeaves} ${isArabic ? "إجازة قادمة" : "upcoming"}`}
              gradient="from-blue-500 to-cyan-600"
              delay={0.1}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={isArabic ? "معدل الحضور" : "Attendance Rate"}
              value={`${currentStats.attendanceRate}%`}
              icon={Activity}
              trend={{ value: 2.3, isPositive: true }}
              gradient="from-purple-500 to-pink-600"
              delay={0.2}
            />
          </StaggerItem>
          <StaggerItem>
            <StatCard
              title={isArabic ? "تقييم الأداء" : "Performance Score"}
              value={`${currentStats.performanceScore}/5`}
              icon={Award}
              trend={{ value: 8.5, isPositive: true }}
              description={isArabic ? "ممتاز" : "Excellent"}
              gradient="from-orange-500 to-red-600"
              delay={0.3}
            />
          </StaggerItem>
        </StaggerContainer>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto">
            <TabsTrigger value="overview">
              {isArabic ? "نظرة عامة" : "Overview"}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              {isArabic ? "المهام" : "Tasks"}
            </TabsTrigger>
            <TabsTrigger value="leaves">
              {isArabic ? "الإجازات" : "Leaves"}
            </TabsTrigger>
            <TabsTrigger value="documents">
              {isArabic ? "المستندات" : "Documents"}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Today's Schedule */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    {isArabic ? "جدول اليوم" : "Today's Schedule"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                      <Clock className="h-5 w-5 text-blue-600 mt-1" />
                      <div>
                        <p className="font-medium">
                          {isArabic ? "اجتماع الفريق الصباحي" : "Morning Team Meeting"}
                        </p>
                        <p className="text-sm text-gray-500">9:00 - 10:00 AM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium">
                          {isArabic ? "تقديم عرض المشروع" : "Project Presentation"}
                        </p>
                        <p className="text-sm text-gray-500">2:00 - 3:30 PM</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                      <BookOpen className="h-5 w-5 text-purple-600 mt-1" />
                      <div>
                        <p className="font-medium">
                          {isArabic ? "جلسة تدريبية" : "Training Session"}
                        </p>
                        <p className="text-sm text-gray-500">4:00 - 5:00 PM</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>{isArabic ? "إجراءات سريعة" : "Quick Actions"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <Calendar className="h-4 w-4 mr-2" />
                    {isArabic ? "طلب إجازة" : "Request Leave"}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    {isArabic ? "عرض كشف الراتب" : "View Payslip"}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    {isArabic ? "رفع مستند" : "Upload Document"}
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    {isArabic ? "تواصل مع الموارد البشرية" : "Contact HR"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Performance Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  {isArabic ? "ملخص الأداء" : "Performance Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isArabic ? "المهام المكتملة" : "Tasks Completed"}
                      </span>
                      <span className="text-sm text-gray-500">85%</span>
                    </div>
                    <Progress value={85} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isArabic ? "الجودة" : "Quality"}
                      </span>
                      <span className="text-sm text-gray-500">92%</span>
                    </div>
                    <Progress value={92} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">
                        {isArabic ? "الحضور" : "Attendance"}
                      </span>
                      <span className="text-sm text-gray-500">96.5%</span>
                    </div>
                    <Progress value={96.5} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tasks Tab */}
          <TabsContent value="tasks" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>{isArabic ? "مهامي" : "My Tasks"}</CardTitle>
                  <Button size="sm">
                    {isArabic ? "عرض الكل" : "View All"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">{task.title}</p>
                          {getPriorityBadge(task.priority)}
                          {getStatusBadge(task.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {isArabic ? "الموعد النهائي:" : "Due:"} {task.dueDate}
                          </span>
                          <span>{isArabic ? "التقدم:" : "Progress:"} {task.progress}%</span>
                        </div>
                        <Progress value={task.progress} className="mt-2" />
                      </div>
                      <div className="flex gap-1 ml-4">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Leaves Tab */}
          <TabsContent value="leaves" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>{isArabic ? "طلبات الإجازة" : "Leave Requests"}</CardTitle>
                  <Button size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    {isArabic ? "طلب جديد" : "New Request"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockLeaveRequests.map((leave) => (
                    <div
                      key={leave.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">{leave.type}</p>
                          {getStatusBadge(leave.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{leave.startDate}</span>
                          <span>→</span>
                          <span>{leave.endDate}</span>
                          <span>({leave.days} {isArabic ? "أيام" : "days"})</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <CardTitle>{isArabic ? "مستنداتي" : "My Documents"}</CardTitle>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    {isArabic ? "رفع مستند" : "Upload"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-500">
                            {doc.type} • {doc.size} • {isArabic ? "رُفع في" : "Uploaded on"} {doc.uploadDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
