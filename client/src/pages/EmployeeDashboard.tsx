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
  Briefcase,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Send,
  Eye,
  Star,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ApplicationItem {
  id: number;
  jobTitle?: string;
  jobTitleEn?: string;
  company?: string;
  companyEn?: string;
  status?: string;
  statusEn?: string;
  statusColor?: string;
  appliedDate?: string;
  location?: string;
  locationEn?: string;
  salary?: string;
}

interface RecommendedJob {
  id: number;
  title?: string;
  titleEn?: string;
  company?: string;
  companyEn?: string;
  location?: string;
  locationEn?: string;
  salary?: string;
  match?: number;
}

export default function EmployeeDashboard() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const overviewQuery = trpc.dashboard.employeeOverview.useQuery(undefined, {
    staleTime: 30_000,
  });

  const stats =
    overviewQuery.data?.stats || {
      applicationsSubmitted: 12,
      interviewsScheduled: 3,
      offersReceived: 1,
      profileViews: 156,
    };
  const hasError = overviewQuery.isError;

  const applications =
    overviewQuery.data?.applications ||
    [
      {
        id: 1,
        jobTitle: "مطور Full Stack",
        jobTitleEn: "Full Stack Developer",
        company: "شركة التقنية المتقدمة",
        companyEn: "Advanced Tech Company",
        status: "قيد المراجعة",
        statusEn: "Under Review",
        statusColor: "yellow",
        appliedDate: "2024-11-15",
        salary: "12,000 - 18,000 ﷼",
        location: "الرياض",
        locationEn: "Riyadh",
      },
      {
        id: 2,
        jobTitle: "محاسب رئيسي",
        jobTitleEn: "Senior Accountant",
        company: "مجموعة الأعمال الدولية",
        companyEn: "International Business Group",
        status: "مقابلة مجدولة",
        statusEn: "Interview Scheduled",
        statusColor: "blue",
        appliedDate: "2024-11-10",
        salary: "10,000 - 15,000 ﷼",
        location: "جدة",
        locationEn: "Jeddah",
      },
      {
        id: 3,
        jobTitle: "مدير مبيعات",
        jobTitleEn: "Sales Manager",
        company: "شركة التسويق الرقمي",
        companyEn: "Digital Marketing Company",
        status: "مرفوض",
        statusEn: "Rejected",
        statusColor: "red",
        appliedDate: "2024-11-05",
        salary: "15,000 - 20,000 ﷼",
        location: "الدمام",
        locationEn: "Dammam",
      },
    ];

  const recommendedJobs =
    overviewQuery.data?.recommendedJobs ||
    [
      {
        id: 1,
        title: "مطور React",
        titleEn: "React Developer",
        company: "شركة البرمجيات الحديثة",
        companyEn: "Modern Software Company",
        location: "الرياض",
        locationEn: "Riyadh",
        salary: "10,000 - 14,000 ﷼",
        type: "دوام كامل",
        typeEn: "Full Time",
        postedDays: 2,
        match: 95,
      },
      {
        id: 2,
        title: "مهندس DevOps",
        titleEn: "DevOps Engineer",
        company: "شركة الحلول التقنية",
        companyEn: "Tech Solutions Company",
        location: "جدة",
        locationEn: "Jeddah",
        salary: "14,000 - 20,000 ﷼",
        type: "دوام كامل",
        typeEn: "Full Time",
        postedDays: 5,
        match: 88,
      },
    ];

  const isLoading = overviewQuery.isLoading;

  const filteredApplications = useMemo(
    () =>
      applications.filter((app: ApplicationItem) => {
        const matchesSearch = `${app.jobTitle} ${app.company}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesStatus =
          statusFilter === "all" ||
          (app.status || "").toLowerCase() === statusFilter ||
          (app.statusEn || "").toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
      }),
    [applications, search, statusFilter]
  );

  const filteredRecommended = useMemo(
    () =>
      recommendedJobs.filter((job: RecommendedJob) =>
        `${job.title} ${job.company}`.toLowerCase().includes(search.toLowerCase())
      ),
    [recommendedJobs, search]
  );

  const [applicationsLimit, setApplicationsLimit] = useState(5);
  const [recommendedLimit, setRecommendedLimit] = useState(5);
  const limitedApplications = filteredApplications.slice(0, applicationsLimit);
  const limitedRecommended = filteredRecommended.slice(0, recommendedLimit);

  const getStatusBadge = (status: string | undefined, color: string | undefined) => {
    const colorMap = {
      yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
      blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      green: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    };

    return (
      <Badge className={colorMap[(color || "yellow") as keyof typeof colorMap] || colorMap.yellow}>
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout userType="employee">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? "لوحة التحكم" : "Dashboard"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic
                ? "تتبع طلباتك واكتشف فرص جديدة"
                : "Track your applications and discover new opportunities"}
            </p>
            {hasError && (
              <p className="text-sm text-red-500 mt-1">
                {isArabic
                  ? "تعذر تحميل البيانات، يتم عرض بيانات احتياطية."
                  : "Failed to load data. Showing fallback info."}
              </p>
            )}
          </div>
          <Link href="/jobs">
            <Button className="bg-gradient-to-r from-green-600 to-emerald-600">
              <Briefcase className="w-4 h-4 ml-2" />
              {isArabic ? "تصفح الوظائف" : "Browse Jobs"}
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isArabic ? "الطلبات المقدمة" : "Applications Submitted"}
            </CardTitle>
            <Send className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats.applicationsSubmitted}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isArabic ? "هذا الشهر" : "This month"}
            </p>
          </CardContent>
        </Card>

          <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isArabic ? "المقابلات المجدولة" : "Interviews Scheduled"}
            </CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats.interviewsScheduled}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isArabic ? "قادمة" : "Upcoming"}
            </p>
          </CardContent>
        </Card>

          <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isArabic ? "العروض المستلمة" : "Offers Received"}
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats.offersReceived}</div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {isArabic ? "هذا الشهر" : "This month"}
            </p>
          </CardContent>
        </Card>

          <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {isArabic ? "مشاهدات الملف" : "Profile Views"}
            </CardTitle>
            <Eye className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-6 w-12" />
            ) : (
              <div className="text-2xl font-bold">{stats.profileViews}</div>
            )}
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 inline text-green-500" />
              {isArabic ? "هذا الأسبوع" : "this week"}
            </p>
          </CardContent>
        </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* My Applications */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <CardTitle>{isArabic ? "طلباتي" : "My Applications"}</CardTitle>
                  <CardDescription>
                    {isArabic
                      ? "تتبع حالة طلبات التوظيف"
                      : "Track your job application status"}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder={isArabic ? "حالة الطلب" : "Status"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{isArabic ? "كل الحالات" : "All"}</SelectItem>
                      <SelectItem value="pending">{isArabic ? "قيد المراجعة" : "Pending"}</SelectItem>
                      <SelectItem value="reviewing">{isArabic ? "تحت المراجعة" : "Reviewing"}</SelectItem>
                      <SelectItem value="interview">{isArabic ? "مقابلة" : "Interview"}</SelectItem>
                      <SelectItem value="offer">{isArabic ? "عرض" : "Offer"}</SelectItem>
                      <SelectItem value="rejected">{isArabic ? "مرفوض" : "Rejected"}</SelectItem>
                      <SelectItem value="hired">{isArabic ? "موظف" : "Hired"}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder={isArabic ? "ابحث في الطلبات..." : "Search applications..."}
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="max-w-xs"
                  />
                  <Link href="/applications">
                    <Button variant="outline" size="sm">
                      {isArabic ? "عرض الكل" : "View All"}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && <Skeleton className="h-24 w-full" />}
                {!isLoading &&
                  limitedApplications.map((app: ApplicationItem) => {
                    const title = isArabic ? app.jobTitle : app.jobTitleEn ?? app.jobTitle;
                    const company = isArabic ? app.company : app.companyEn ?? app.company;
                    const statusLabel = isArabic ? app.status : app.statusEn ?? app.status;
                    const location = isArabic ? app.location : app.locationEn ?? app.location;
                    return (
                      <div
                        key={app.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold">
                                {title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                {company}
                              </p>
                            </div>
                            {getStatusBadge(
                              statusLabel,
                              app.statusColor
                            )}
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-3">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {location}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              {app.salary}
                            </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {app.appliedDate}
                          </span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    );
                  })}
                {!isLoading && !filteredApplications.length && !hasError && (
                  <p className="text-sm text-gray-500">
                    {isArabic ? "لا توجد طلبات بعد" : "No applications yet"}
                  </p>
                )}
                {!isLoading && hasError && (
                  <p className="text-sm text-red-500">
                    {isArabic ? "تعذر تحميل الطلبات." : "Failed to load applications."}
                  </p>
                )}
                {!isLoading && filteredApplications.length > limitedApplications.length && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setApplicationsLimit(prev => prev + 5)}
                  >
                    {isArabic ? "عرض المزيد" : "Show more"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recommended Jobs */}
          <Card>
            <CardHeader>
              <CardTitle>
                {isArabic ? "وظائف موصى بها" : "Recommended Jobs"}
              </CardTitle>
              <CardDescription>
                {isArabic ? "بناءً على ملفك الشخصي" : "Based on your profile"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading && <Skeleton className="h-24 w-full" />}
                {!isLoading &&
                  limitedRecommended.map((job: RecommendedJob) => {
                    const title = isArabic ? job.title : job.titleEn ?? job.title;
                    const company = isArabic ? job.company : job.companyEn ?? job.company;
                    const location = isArabic ? job.location : job.locationEn ?? job.location;
                    return (
                  <div
                    key={job.id}
                    className="p-4 rounded-lg border hover:border-green-500 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          {title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {company}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-xs font-medium">{job.match}%</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 text-xs text-gray-500 mt-2">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {job.salary}
                      </span>
                    </div>
                    <Button size="sm" className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600">
                      {isArabic ? "تقدم الآن" : "Apply Now"}
                    </Button>
                  </div>
                    );
                  })}
                {!isLoading && !filteredRecommended.length && !hasError && (
                  <p className="text-sm text-gray-500">
                    {isArabic ? "لا توجد وظائف مقترحة حالياً" : "No recommendations yet"}
                  </p>
                )}
                {!isLoading && hasError && (
                  <p className="text-sm text-red-500">
                    {isArabic ? "تعذر تحميل الوظائف المقترحة." : "Failed to load recommendations."}
                  </p>
                )}
                {!isLoading && filteredRecommended.length > limitedRecommended.length && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setRecommendedLimit(prev => prev + 5)}
                  >
                    {isArabic ? "عرض المزيد" : "Show more"}
                  </Button>
                )}
              </div>
              <Button variant="outline" className="w-full mt-4">
                {isArabic ? "المزيد من الوظائف" : "More Jobs"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
