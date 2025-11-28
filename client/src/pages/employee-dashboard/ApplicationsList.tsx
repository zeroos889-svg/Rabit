import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, DollarSign, Eye, MapPin } from "lucide-react";
import { Link } from "wouter";

export interface ApplicationItem {
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

interface ApplicationsListProps {
  applications: ApplicationItem[];
  isLoading: boolean;
  hasError: boolean;
  isArabic: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

const STATUS_COLOR_MAP = {
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  green: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  red: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
} as const;

function getStatusBadge(status: string | undefined, color: string | undefined) {
  const colorClass = STATUS_COLOR_MAP[(color || "yellow") as keyof typeof STATUS_COLOR_MAP] || STATUS_COLOR_MAP.yellow;
  return <Badge className={colorClass}>{status}</Badge>;
}

function ApplicationCard({ app, isArabic }: Readonly<{ app: ApplicationItem; isArabic: boolean }>) {
  const title = isArabic ? app.jobTitle : app.jobTitleEn ?? app.jobTitle;
  const company = isArabic ? app.company : app.companyEn ?? app.company;
  const statusLabel = isArabic ? app.status : app.statusEn ?? app.status;
  const location = isArabic ? app.location : app.locationEn ?? app.location;

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:shadow-md transition-shadow">
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-semibold">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{company}</p>
          </div>
          {getStatusBadge(statusLabel, app.statusColor)}
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
}

function StatusFilterSelect({ 
  value, 
  onChange, 
  isArabic 
}: Readonly<{ value: string; onChange: (v: string) => void; isArabic: boolean }>) {
  return (
    <Select value={value} onValueChange={onChange}>
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
  );
}

export function ApplicationsList({
  applications,
  isLoading,
  hasError,
  isArabic,
  search,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onLoadMore,
  hasMore,
}: Readonly<ApplicationsListProps>) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle>{isArabic ? "طلباتي" : "My Applications"}</CardTitle>
            <CardDescription>
              {isArabic ? "تتبع حالة طلبات التوظيف" : "Track your job application status"}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusFilterSelect
              value={statusFilter}
              onChange={onStatusFilterChange}
              isArabic={isArabic}
            />
            <Input
              placeholder={isArabic ? "ابحث في الطلبات..." : "Search applications..."}
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
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
          
          {!isLoading && applications.map((app) => (
            <ApplicationCard key={app.id} app={app} isArabic={isArabic} />
          ))}
          
          {!isLoading && applications.length === 0 && !hasError && (
            <p className="text-sm text-gray-500">
              {isArabic ? "لا توجد طلبات بعد" : "No applications yet"}
            </p>
          )}
          
          {!isLoading && hasError && (
            <p className="text-sm text-red-500">
              {isArabic ? "تعذر تحميل الطلبات." : "Failed to load applications."}
            </p>
          )}
          
          {!isLoading && hasMore && (
            <Button variant="outline" className="w-full" onClick={onLoadMore}>
              {isArabic ? "عرض المزيد" : "Show more"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
