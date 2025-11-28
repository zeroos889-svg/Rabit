import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import {
  DashboardHeader,
  StatCard,
  ApplicationsList,
  RecommendedJobs,
} from "./employee-dashboard";
import { Send, Calendar, CheckCircle2, Eye, TrendingUp } from "lucide-react";

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

const DEFAULT_STATS = {
  applicationsSubmitted: 12,
  interviewsScheduled: 3,
  offersReceived: 1,
  profileViews: 156,
};

const DEFAULT_APPLICATIONS: ApplicationItem[] = [
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

const DEFAULT_RECOMMENDED_JOBS: RecommendedJob[] = [
  {
    id: 1,
    title: "مطور React",
    titleEn: "React Developer",
    company: "شركة البرمجيات الحديثة",
    companyEn: "Modern Software Company",
    location: "الرياض",
    locationEn: "Riyadh",
    salary: "10,000 - 14,000 ﷼",
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
    match: 88,
  },
];

export default function EmployeeDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [applicationsLimit, setApplicationsLimit] = useState(5);
  const [recommendedLimit, setRecommendedLimit] = useState(5);

  const overviewQuery = trpc.dashboard.employeeOverview.useQuery(undefined, {
    staleTime: 30_000,
  });

  const stats = overviewQuery.data?.stats || DEFAULT_STATS;
  const applications = overviewQuery.data?.applications || DEFAULT_APPLICATIONS;
  const recommendedJobs = overviewQuery.data?.recommendedJobs || DEFAULT_RECOMMENDED_JOBS;
  const hasError = overviewQuery.isError;
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

  const limitedApplications = filteredApplications.slice(0, applicationsLimit);
  const limitedRecommended = filteredRecommended.slice(0, recommendedLimit);

  return (
    <DashboardLayout userType="employee">
      <div className="space-y-6">
        <DashboardHeader isArabic={isArabic} hasError={hasError} />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard
            title={isArabic ? "الطلبات المقدمة" : "Applications Submitted"}
            value={stats.applicationsSubmitted}
            icon={Send}
            iconColor="text-blue-600"
            subtitle={isArabic ? "هذا الشهر" : "This month"}
            isLoading={isLoading}
          />
          <StatCard
            title={isArabic ? "المقابلات المجدولة" : "Interviews Scheduled"}
            value={stats.interviewsScheduled}
            icon={Calendar}
            iconColor="text-purple-600"
            subtitle={isArabic ? "قادمة" : "Upcoming"}
            isLoading={isLoading}
          />
          <StatCard
            title={isArabic ? "العروض المستلمة" : "Offers Received"}
            value={stats.offersReceived}
            icon={CheckCircle2}
            iconColor="text-green-600"
            subtitle={isArabic ? "هذا الشهر" : "This month"}
            isLoading={isLoading}
          />
          <StatCard
            title={isArabic ? "مشاهدات الملف" : "Profile Views"}
            value={stats.profileViews}
            icon={Eye}
            iconColor="text-orange-600"
            subtitle={isArabic ? "هذا الأسبوع" : "this week"}
            subtitleIcon={<TrendingUp className="w-3 h-3 inline text-green-500" />}
            isLoading={isLoading}
          />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <ApplicationsList
            applications={limitedApplications}
            isArabic={isArabic}
            isLoading={isLoading}
            hasError={hasError}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            onLoadMore={() => setApplicationsLimit(prev => prev + 5)}
            hasMore={filteredApplications.length > limitedApplications.length}
          />

          <RecommendedJobs
            jobs={limitedRecommended}
            isArabic={isArabic}
            isLoading={isLoading}
            hasError={hasError}
            onLoadMore={() => setRecommendedLimit(prev => prev + 5)}
            hasMore={filteredRecommended.length > limitedRecommended.length}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
