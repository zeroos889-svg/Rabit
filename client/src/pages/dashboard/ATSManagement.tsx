import { useEffect, useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Briefcase,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  Mail,
  Phone,
  Download,
  Filter,
  BarChart3,
  CalendarClock,
  Video,
  MessageSquareMore,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: "full-time" | "part-time" | "contract";
  salary: { min: number; max: number };
  postedDate: string;
  status: "active" | "closed" | "draft";
  applicantsCount: number;
}

interface Applicant {
  id: number;
  name: string;
  email: string;
  phone: string;
  jobId: number;
  jobTitle: string;
  appliedDate: string;
  stage: "new" | "screening" | "interview" | "offer" | "hired" | "rejected";
  rating: number;
  resume?: string;
}

export default function ATSManagement() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [activeTab, setActiveTab] = useState("jobs");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddJobDialogOpen, setIsAddJobDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null);
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleMode, setScheduleMode] = useState<"video" | "phone" | "onsite">(
    "video"
  );
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [aiInsights, setAiInsights] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [scheduledInterviews, setScheduledInterviews] = useState<
    Array<{
      id: number;
      applicantId: number;
      candidateName: string;
      jobTitle: string;
      date: string;
      time: string;
      mode: "video" | "phone" | "onsite";
      notes?: string;
    }>
  >([]);

  // Mock data - Jobs
  const jobs: Job[] = [
    {
      id: 1,
      title: "مطور Full Stack",
      department: "تقنية المعلومات",
      location: "الرياض",
      type: "full-time",
      salary: { min: 12000, max: 18000 },
      postedDate: "2024-11-10",
      status: "active",
      applicantsCount: 45,
    },
    {
      id: 2,
      title: "محاسب رئيسي",
      department: "المالية",
      location: "جدة",
      type: "full-time",
      salary: { min: 10000, max: 15000 },
      postedDate: "2024-11-15",
      status: "active",
      applicantsCount: 32,
    },
    {
      id: 3,
      title: "مدير مبيعات",
      department: "المبيعات",
      location: "الدمام",
      type: "full-time",
      salary: { min: 15000, max: 20000 },
      postedDate: "2024-11-05",
      status: "active",
      applicantsCount: 28,
    },
    {
      id: 4,
      title: "مصمم UI/UX",
      department: "التصميم",
      location: "الرياض",
      type: "contract",
      salary: { min: 8000, max: 12000 },
      postedDate: "2024-10-20",
      status: "closed",
      applicantsCount: 67,
    },
  ];

  // Mock data - Applicants
  const initialApplicants: Applicant[] = [
    {
      id: 1,
      name: "أحمد محمد السعيد",
      email: "ahmed.mohammed@email.com",
      phone: "0501234567",
      jobId: 1,
      jobTitle: "مطور Full Stack",
      appliedDate: "2024-11-18",
      stage: "interview",
      rating: 4.5,
    },
    {
      id: 2,
      name: "فاطمة علي الحارثي",
      email: "fatima.ali@email.com",
      phone: "0507654321",
      jobId: 2,
      jobTitle: "محاسب رئيسي",
      appliedDate: "2024-11-17",
      stage: "screening",
      rating: 4.0,
    },
    {
      id: 3,
      name: "خالد عبدالله القحطاني",
      email: "khaled.abdullah@email.com",
      phone: "0551234567",
      jobId: 1,
      jobTitle: "مطور Full Stack",
      appliedDate: "2024-11-16",
      stage: "offer",
      rating: 4.8,
    },
    {
      id: 4,
      name: "نورة سعيد العتيبي",
      email: "noura.saeed@email.com",
      phone: "0559876543",
      jobId: 3,
      jobTitle: "مدير مبيعات",
      appliedDate: "2024-11-15",
      stage: "new",
      rating: 3.5,
    },
  ];

  const [applicants, setApplicants] = useState<Applicant[]>(initialApplicants);

  const [activityLog, setActivityLog] = useState(
    () => [
      {
        id: 1,
        title: "تم إنشاء وظيفة جديدة",
        detail: "مطور Full Stack - الرياض",
        time: "منذ 2 ساعة",
      },
      {
        id: 2,
        title: "تم جدولة مقابلة",
        detail: "أحمد محمد - مقابلة فيديو غداً 10 صباحاً",
        time: "منذ 30 دقيقة",
      },
      {
        id: 3,
        title: "تحليل AI للسيرة الذاتية",
        detail: "فاطمة علي - درجة توافق 87%",
        time: "الآن",
      },
    ] satisfies { id: number; title: string; detail: string; time: string }[]
  );

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  const getJobStatusBadge = (status: Job["status"]) => {
    const statusConfig = {
      active: {
        label: isArabic ? "نشط" : "Active",
        className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      },
      closed: {
        label: isArabic ? "مغلق" : "Closed",
        className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      },
      draft: {
        label: isArabic ? "مسودة" : "Draft",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      },
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getApplicantStageBadge = (stage: Applicant["stage"]) => {
    const stageConfig = {
      new: {
        label: isArabic ? "جديد" : "New",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      },
      screening: {
        label: isArabic ? "فحص" : "Screening",
        className: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
      },
      interview: {
        label: isArabic ? "مقابلة" : "Interview",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      },
      offer: {
        label: isArabic ? "عرض" : "Offer",
        className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      },
      hired: {
        label: isArabic ? "تم التعيين" : "Hired",
        className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400",
      },
      rejected: {
        label: isArabic ? "مرفوض" : "Rejected",
        className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      },
    };

    const config = stageConfig[stage];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const handleScheduleInterview = (applicantId: number) => {
    setSelectedApplicantId(applicantId);
    setIsScheduleDialogOpen(true);
  };

  const submitSchedule = () => {
    if (!scheduleDate || !scheduleTime || !selectedApplicantId) {
      toast.error(isArabic ? "يرجى تحديد التاريخ والوقت" : "Please select date & time");
      return;
    }
    const candidate = applicants.find(a => a.id === selectedApplicantId);

    setApplicants(prev =>
      prev.map(a => (a.id === selectedApplicantId ? { ...a, stage: "interview" } : a))
    );
    setScheduledInterviews(prev => {
      const next = [
        ...prev,
        {
          id: Date.now(),
          applicantId: selectedApplicantId,
          candidateName: candidate?.name || (isArabic ? "مرشح" : "Candidate"),
          jobTitle: candidate?.jobTitle || "",
          date: scheduleDate,
          time: scheduleTime,
          mode: scheduleMode,
          notes: scheduleNotes,
        },
      ];
      return next.sort(
        (a, b) =>
          new Date(`${a.date}T${a.time}`).getTime() -
          new Date(`${b.date}T${b.time}`).getTime()
      );
    });
    setActivityLog(prev => [
      {
        id: Date.now(),
        title: isArabic ? "تم جدولة مقابلة" : "Interview scheduled",
        detail: `${candidate?.name || (isArabic ? "مرشح" : "Candidate")} - ${
          scheduleMode === "video"
            ? isArabic
              ? "فيديو"
              : "Video"
            : scheduleMode === "phone"
              ? isArabic
                ? "هاتفية"
                : "Phone"
              : isArabic
                ? "حضورية"
                : "Onsite"
        } / ${scheduleDate} ${scheduleTime}`,
        time: isArabic ? "الآن" : "Just now",
      },
      ...prev,
    ]);
    setIsScheduleDialogOpen(false);
    toast.success(
      isArabic
        ? "تم جدولة المقابلة وإشعار المرشح"
        : "Interview scheduled and candidate notified"
    );
    setScheduleDate("");
    setScheduleTime("");
    setScheduleNotes("");
  };

  const runAiScreening = (applicant: Applicant) => {
    const summary =
      isArabic
        ? `تحليل سريع: خبرة ${applicant.stage === "offer" ? "قوية" : "متوسطة"}, درجة توافق تقديرية 85% لمتطلبات الوظيفة. توصية: إجراء مقابلة تقنية مركزة.`
        : `Quick screen: solid experience, estimated fit 85%. Recommendation: schedule focused technical interview.`;
    setAiInsights(prev => ({ ...prev, [applicant.id]: summary }));
    toast.success(isArabic ? "تم إنشاء تحليل AI" : "AI screening created");
  };

  const handleAddJob = () => {
    toast.success(isArabic ? "تم نشر الوظيفة بنجاح" : "Job posted successfully");
    setIsAddJobDialogOpen(false);
  };

  const handleDeleteJob = (job: Job) => {
    toast.error(
      isArabic ? `تم حذف الوظيفة: ${job.title}` : `Deleted job: ${job.title}`
    );
  };

  const stats = {
    totalJobs: jobs.length,
    activeJobs: jobs.filter((j) => j.status === "active").length,
    totalApplicants: applicants.length,
    interviewsScheduled: applicants.filter((a) => a.stage === "interview").length,
  };

  return (
    <DashboardLayout userType="company">
      <a
        href="#ats-main"
        className="sr-only focus:not-sr-only focus:text-blue-700 focus:bg-white focus:px-4 focus:py-2 focus:rounded-md focus:shadow"
      >
        {isArabic ? "تخطي إلى المحتوى الرئيسي" : "Skip to main content"}
      </a>
      <div id="ats-main" role="main" aria-label={isArabic ? "لوحة التوظيف" : "Recruitment dashboard"} className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Briefcase className="w-8 h-8 text-blue-600" />
              {isArabic ? "نظام التوظيف (ATS)" : "Recruitment System (ATS)"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic
                ? "إدارة الوظائف والمتقدمين ومراحل التوظيف"
                : "Manage jobs, applicants, and hiring pipeline"}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                {isArabic ? "إجمالي الوظائف" : "Total Jobs"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold">{stats.totalJobs}</div>
                  <p className="text-xs text-green-600 mt-1">
                    {stats.activeJobs} {isArabic ? "نشط" : "active"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                {isArabic ? "المتقدمين" : "Applicants"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalApplicants}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {isArabic ? "متقدم جديد" : "new applicants"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {isArabic ? "مقابلات مجدولة" : "Interviews"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-7 w-16" />
                  <Skeleton className="h-3 w-24" />
                </div>
              ) : (
                <>
                  <div className="text-3xl font-bold text-yellow-600">
                    {stats.interviewsScheduled}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {isArabic ? "هذا الأسبوع" : "this week"}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {isArabic ? "معدل التوظيف" : "Hire Rate"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">68%</div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "+5% عن الشهر الماضي" : "+5% from last month"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Scheduled Interviews */}
        <Card>
          <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {isArabic ? "المقابلات القادمة" : "Upcoming Interviews"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "أحدث المواعيد المجدولة مع تفاصيل الطريقة والملاحظات"
                  : "Latest scheduled interviews with mode and notes"}
              </CardDescription>
            </div>
            <p className="text-xs text-muted-foreground">
              {scheduledInterviews.length} {isArabic ? "مخالصة" : "scheduled"}
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : scheduledInterviews.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                {isArabic
                  ? "لا توجد مقابلات مجدولة حالياً. اختر مرشحاً واضغط جدولة."
                  : "No interviews scheduled yet. Pick a candidate and schedule."}
              </div>
            ) : (
              <div className="space-y-3">
                {scheduledInterviews.map(item => (
                  <div
                    key={item.id}
                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {item.candidateName}
                        {item.jobTitle ? ` • ${item.jobTitle}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isArabic ? "التاريخ" : "Date"}: {item.date} ـ {item.time} |{" "}
                        {isArabic ? "النمط" : "Mode"}:{" "}
                        {item.mode === "video"
                          ? isArabic
                            ? "فيديو"
                            : "Video"
                          : item.mode === "phone"
                            ? isArabic
                              ? "هاتفية"
                              : "Phone"
                            : isArabic
                              ? "حضورية"
                              : "Onsite"}
                      </p>
                      {item.notes && (
                        <p className="text-xs text-blue-600 mt-1">
                          {isArabic ? "ملاحظات: " : "Notes: "}
                          {item.notes}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {isArabic ? "مجدولة" : "Scheduled"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="jobs">
              <Briefcase className="w-4 h-4 ml-2" />
              {isArabic ? "الوظائف" : "Jobs"}
            </TabsTrigger>
            <TabsTrigger value="applicants">
              <Users className="w-4 h-4 ml-2" />
              {isArabic ? "المتقدمين" : "Applicants"}
            </TabsTrigger>
            <TabsTrigger value="pipeline">
              <BarChart3 className="w-4 h-4 ml-2" />
              {isArabic ? "مسار التوظيف" : "Pipeline"}
            </TabsTrigger>
          </TabsList>

          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{isArabic ? "الوظائف المنشورة" : "Posted Jobs"}</CardTitle>
                    <CardDescription>
                      {isArabic
                        ? "إدارة الوظائف المفتوحة والمغلقة"
                        : "Manage open and closed positions"}
                    </CardDescription>
                  </div>
                  <Dialog open={isAddJobDialogOpen} onOpenChange={setIsAddJobDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                        <Plus className="w-4 h-4 ml-2" />
                        {isArabic ? "نشر وظيفة" : "Post Job"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>
                          {isArabic ? "نشر وظيفة جديدة" : "Post New Job"}
                        </DialogTitle>
                        <DialogDescription>
                          {isArabic
                            ? "أدخل تفاصيل الوظيفة"
                            : "Enter job details"}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{isArabic ? "المسمى الوظيفي" : "Job Title"}</Label>
                            <Input
                              placeholder={
                                isArabic ? "مطور برمجيات" : "Software Developer"
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>{isArabic ? "القسم" : "Department"}</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="it">
                                  {isArabic ? "تقنية المعلومات" : "IT"}
                                </SelectItem>
                                <SelectItem value="finance">
                                  {isArabic ? "المالية" : "Finance"}
                                </SelectItem>
                                <SelectItem value="sales">
                                  {isArabic ? "المبيعات" : "Sales"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>{isArabic ? "الوصف الوظيفي" : "Job Description"}</Label>
                          <Textarea
                            placeholder={
                              isArabic
                                ? "اكتب وصف تفصيلي للوظيفة..."
                                : "Write detailed job description..."
                            }
                            rows={4}
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label>{isArabic ? "الموقع" : "Location"}</Label>
                            <Input placeholder={isArabic ? "الرياض" : "Riyadh"} />
                          </div>
                          <div className="space-y-2">
                            <Label>{isArabic ? "نوع العمل" : "Job Type"}</Label>
                            <Select defaultValue="full-time">
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="full-time">
                                  {isArabic ? "دوام كامل" : "Full Time"}
                                </SelectItem>
                                <SelectItem value="part-time">
                                  {isArabic ? "دوام جزئي" : "Part Time"}
                                </SelectItem>
                                <SelectItem value="contract">
                                  {isArabic ? "عقد" : "Contract"}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label>{isArabic ? "الخبرة المطلوبة" : "Experience"}</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0-2">0-2 {isArabic ? "سنة" : "years"}</SelectItem>
                                <SelectItem value="3-5">3-5 {isArabic ? "سنوات" : "years"}</SelectItem>
                                <SelectItem value="5+">5+ {isArabic ? "سنوات" : "years"}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>{isArabic ? "الراتب من" : "Salary From"}</Label>
                            <Input type="number" placeholder="10000" dir="ltr" />
                          </div>
                          <div className="space-y-2">
                            <Label>{isArabic ? "الراتب إلى" : "Salary To"}</Label>
                            <Input type="number" placeholder="15000" dir="ltr" />
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddJobDialogOpen(false)}
                        >
                          {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                        <Button
                          className="bg-gradient-to-r from-blue-600 to-purple-600"
                          onClick={handleAddJob}
                        >
                          {isArabic ? "نشر الوظيفة" : "Post Job"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="md:col-span-2">
                    <div className="relative">
                      <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder={
                          isArabic ? "ابحث عن وظيفة..." : "Search for a job..."
                        }
                        className="pr-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        aria-label={isArabic ? "بحث عن الوظائف" : "Search jobs"}
                      />
                    </div>
                  </div>
                  <div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <Filter className="w-4 h-4 ml-2" />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">
                          {isArabic ? "جميع الحالات" : "All Status"}
                        </SelectItem>
                        <SelectItem value="active">
                          {isArabic ? "نشط" : "Active"}
                        </SelectItem>
                        <SelectItem value="closed">
                          {isArabic ? "مغلق" : "Closed"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Jobs List */}
                <div className="space-y-4">
                  {isLoading
                    ? [1, 2, 3].map(i => (
                        <Card key={`job-skel-${i}`}>
                          <CardContent className="p-6 space-y-3">
                            <Skeleton className="h-6 w-48" />
                            <Skeleton className="h-4 w-64" />
                            <Skeleton className="h-4 w-72" />
                          </CardContent>
                        </Card>
                      ))
                    : jobs.map((job) => (
                        <Card key={job.id}>
                          <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold">{job.title}</h3>
                                  {getJobStatusBadge(job.status)}
                                </div>
                                <div className="grid md:grid-cols-4 gap-4 text-sm text-gray-600">
                                  <div className="flex items-center gap-2">
                                    <Briefcase className="w-4 h-4" />
                                    {job.department}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="w-4 h-4" />
                                    {job.location}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4" />
                                    {job.salary.min.toLocaleString()} - {job.salary.max.toLocaleString()} ﷼
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {job.applicantsCount} {isArabic ? "متقدم" : "applicants"}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                                  <Calendar className="w-3 h-3" />
                                  {isArabic ? "نُشر في" : "Posted on"} {job.postedDate}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm">
                                  <Eye className="w-4 h-4 ml-2" />
                                  {isArabic ? "عرض" : "View"}
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Edit className="w-4 h-4 ml-2" />
                                  {isArabic ? "تعديل" : "Edit"}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600"
                                  onClick={() => handleDeleteJob(job)}
                                >
                                  <Trash2 className="w-4 h-4 ml-2" />
                                  {isArabic ? "حذف" : "Delete"}
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Applicants Tab */}
          <TabsContent value="applicants" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "المتقدمين" : "Applicants"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "إدارة طلبات التقديم، تحليل AI، وجدولة المقابلات"
                    : "Manage candidates, AI screening, and interview scheduling"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applicants.map(applicant => (
                    <Card key={applicant.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {applicant.name.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold">{applicant.name}</h4>
                              <p className="text-sm text-gray-600">{applicant.jobTitle}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {applicant.email}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {applicant.phone}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {applicant.appliedDate}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-center">
                              <div className="text-sm text-gray-600 mb-1">
                                {isArabic ? "التقييم" : "Rating"}
                              </div>
                              <div className="text-lg font-bold text-yellow-600">
                                ⭐ {applicant.rating}
                              </div>
                            </div>
                            <div>{getApplicantStageBadge(applicant.stage)}</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 pt-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 ml-2" />
                            {isArabic ? "عرض" : "View"}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 ml-2" />
                            {isArabic ? "السيرة" : "Resume"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleScheduleInterview(applicant.id)}
                          >
                            <CalendarClock className="w-4 h-4 ml-2" />
                            {isArabic ? "جدولة" : "Schedule"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => runAiScreening(applicant)}
                          >
                            <Sparkles className="w-4 h-4 ml-2" />
                            {isArabic ? "تحليل AI" : "AI Screen"}
                          </Button>
                        </div>

                        {aiInsights[applicant.id] && (
                          <div className="rounded-md border bg-muted/40 p-3 text-sm space-y-2">
                            <div className="flex items-center gap-2 text-primary">
                              <Sparkles className="h-4 w-4" />
                              <span>{isArabic ? "نتائج الذكاء الاصطناعي" : "AI Insight"}</span>
                            </div>
                            <p className="text-muted-foreground">
                              {aiInsights[applicant.id]}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Pipeline Tab */}
          <TabsContent value="pipeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{isArabic ? "مسار التوظيف" : "Hiring Pipeline"}</CardTitle>
                <CardDescription>
                  {isArabic
                    ? "تتبع المتقدمين عبر مراحل التوظيف"
                    : "Track candidates through hiring stages"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-6 gap-4">
                  {/* New Stage */}
                  <Card className="bg-blue-50 dark:bg-blue-900/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-600">
                        {isArabic ? "جديد" : "New"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-600">
                        {applicants.filter((a) => a.stage === "new").length}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Screening Stage */}
                  <Card className="bg-purple-50 dark:bg-purple-900/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-purple-600">
                        {isArabic ? "فحص" : "Screening"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-600">
                        {applicants.filter((a) => a.stage === "screening").length}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Interview Stage */}
                  <Card className="bg-yellow-50 dark:bg-yellow-900/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-yellow-600">
                        {isArabic ? "مقابلة" : "Interview"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">
                        {applicants.filter((a) => a.stage === "interview").length}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Offer Stage */}
                  <Card className="bg-green-50 dark:bg-green-900/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-green-600">
                        {isArabic ? "عرض" : "Offer"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        {applicants.filter((a) => a.stage === "offer").length}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Hired Stage */}
                  <Card className="bg-emerald-50 dark:bg-emerald-900/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-emerald-600">
                        {isArabic ? "تم التعيين" : "Hired"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-emerald-600">
                        {applicants.filter((a) => a.stage === "hired").length}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Rejected Stage */}
                  <Card className="bg-red-50 dark:bg-red-900/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-red-600">
                        {isArabic ? "مرفوض" : "Rejected"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        {applicants.filter((a) => a.stage === "rejected").length}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Activity Log */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>{isArabic ? "سجل الأنشطة" : "Activity Log"}</CardTitle>
            <CardDescription>
              {isArabic
                ? "آخر التحديثات على الوظائف والمتقدمين"
                : "Latest updates for jobs and candidates"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityLog.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md border p-3 bg-muted/30"
              >
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <span className="text-xs text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Schedule Interview Dialog */}
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isArabic ? "جدولة مقابلة" : "Schedule Interview"}</DialogTitle>
              <DialogDescription>
                {isArabic
                  ? "حدد موعد المقابلة ونوعها وسيتم تنبيه المرشح"
                  : "Pick date, time, and type. Candidate will be notified."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>{isArabic ? "التاريخ" : "Date"}</Label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={e => setScheduleDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{isArabic ? "الوقت" : "Time"}</Label>
                  <Input
                    type="time"
                    value={scheduleTime}
                    onChange={e => setScheduleTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>{isArabic ? "نوع المقابلة" : "Interview Type"}</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button
                    type="button"
                    variant={scheduleMode === "video" ? "default" : "outline"}
                    onClick={() => setScheduleMode("video")}
                    className="w-full"
                  >
                    <Video className="w-4 h-4 ml-1" />
                    {isArabic ? "فيديو" : "Video"}
                  </Button>
                  <Button
                    type="button"
                    variant={scheduleMode === "phone" ? "default" : "outline"}
                    onClick={() => setScheduleMode("phone")}
                    className="w-full"
                  >
                    <Phone className="w-4 h-4 ml-1" />
                    {isArabic ? "هاتف" : "Phone"}
                  </Button>
                  <Button
                    type="button"
                    variant={scheduleMode === "onsite" ? "default" : "outline"}
                    onClick={() => setScheduleMode("onsite")}
                    className="w-full"
                  >
                    <MessageSquareMore className="w-4 h-4 ml-1" />
                    {isArabic ? "حضوري" : "On-site"}
                  </Button>
                </div>
              </div>

              <div>
                <Label>{isArabic ? "ملاحظات" : "Notes"}</Label>
                <Textarea
                  value={scheduleNotes}
                  onChange={e => setScheduleNotes(e.target.value)}
                  placeholder={
                    isArabic
                      ? "أرسل الأسئلة أو الروابط قبل المقابلة..."
                      : "Share questions or links before the interview..."
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsScheduleDialogOpen(false)}>
                {isArabic ? "إلغاء" : "Cancel"}
              </Button>
              <Button onClick={submitSchedule}>
                {isArabic ? "تأكيد الجدولة" : "Confirm"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
