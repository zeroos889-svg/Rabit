import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Calculator,
  Wand2,
  Calendar,
  CheckCircle2,
  DollarSign,
  Users,
  Briefcase,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import {
  ConsultantHeader,
  ConsultantStatCard,
  QuickTools,
  RecentActivity,
  SubscriptionCard,
  type BookingItem,
  type QuickTool,
  type SubscriptionInfo,
} from "./consultant-dashboard";

const QUICK_TOOLS: QuickTool[] = [
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

const SUBSCRIPTION_INFO: SubscriptionInfo = {
  plan: "مستقل HR",
  planEn: "HR Consultant",
  status: "نشط",
  statusEn: "Active",
  price: 299,
  nextBilling: "2024-12-20",
  daysLeft: 30,
};

export default function ConsultantDashboard() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState(5);

  const { data: bookingsData, isLoading: loadingBookings } =
    trpc.consultant.getConsultantBookings.useQuery();
  const { data: profileData } = trpc.consultant.getMyProfile.useQuery();

  const bookings = useMemo<BookingItem[]>(
    () => (bookingsData?.bookings || []) as BookingItem[],
    [bookingsData]
  );

  const stats = useMemo(() => {
    const active = bookings.filter(
      (b) => b.status !== "completed" && b.status !== "cancelled"
    );
    const completed = bookings.filter((b) => b.status === "completed");
    const revenue = completed.reduce(
      (sum, b) => sum + (b.price || b.consultationType?.price || 0),
      0
    );
    return {
      activeCount: active.length,
      completedCount: completed.length,
      revenue,
      totalClients: new Set(bookings.map((b) => b.clientId || b.userId)).size,
    };
  }, [bookings]);

  const filteredBookings = useMemo(
    () =>
      bookings
        .filter((b) => {
          const typeName =
            b.consultationType?.nameAr || b.consultationType?.nameEn || "";
          return typeName.toLowerCase().includes(search.toLowerCase());
        })
        .slice(0, limit),
    [bookings, search, limit]
  );

  const welcomeName = profileData?.consultant?.fullNameAr || "";

  return (
    <DashboardLayout userType="consultant">
      <div className="space-y-6">
        <ConsultantHeader isArabic={isArabic} welcomeName={welcomeName} />

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <ConsultantStatCard
            title={isArabic ? "استشارات نشطة" : "Active Consultations"}
            value={stats.activeCount}
            icon={Briefcase}
            iconColor="text-blue-600"
            isLoading={loadingBookings}
          />
          <ConsultantStatCard
            title={isArabic ? "استشارات مكتملة" : "Completed"}
            value={stats.completedCount}
            icon={CheckCircle2}
            iconColor="text-green-600"
            isLoading={loadingBookings}
          />
          <ConsultantStatCard
            title={isArabic ? "العملاء" : "Clients"}
            value={stats.totalClients}
            icon={Users}
            iconColor="text-green-600"
            isLoading={loadingBookings}
          />
          <ConsultantStatCard
            title={isArabic ? "الإيرادات" : "Revenue"}
            value={stats.revenue}
            icon={DollarSign}
            iconColor="text-yellow-600"
            isLoading={loadingBookings}
            suffix=" ﷼"
          />
        </div>

        <QuickTools tools={QUICK_TOOLS} isArabic={isArabic} />

        <div className="grid md:grid-cols-3 gap-6">
          <RecentActivity
            bookings={filteredBookings}
            isLoading={loadingBookings}
            hasError={false}
            isArabic={isArabic}
            search={search}
            onSearchChange={setSearch}
            onLoadMore={() => setLimit((prev) => prev + 5)}
            hasMore={filteredBookings.length < bookings.length}
          />

          <SubscriptionCard subscription={SUBSCRIPTION_INFO} isArabic={isArabic} />
        </div>
      </div>
    </DashboardLayout>
  );
}
