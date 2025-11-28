import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, MapPin, Star } from "lucide-react";

export interface RecommendedJob {
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

interface RecommendedJobsProps {
  jobs: RecommendedJob[];
  isLoading: boolean;
  hasError: boolean;
  isArabic: boolean;
  onLoadMore: () => void;
  hasMore: boolean;
}

function JobCard({ job, isArabic }: Readonly<{ job: RecommendedJob; isArabic: boolean }>) {
  const title = isArabic ? job.title : job.titleEn ?? job.title;
  const company = isArabic ? job.company : job.companyEn ?? job.company;
  const location = isArabic ? job.location : job.locationEn ?? job.location;

  return (
    <div className="p-4 rounded-lg border hover:border-green-500 transition-colors cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-sm">{title}</h4>
          <p className="text-xs text-gray-600 dark:text-gray-400">{company}</p>
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
      <Button
        size="sm"
        className="w-full mt-3 bg-gradient-to-r from-green-600 to-emerald-600"
      >
        {isArabic ? "تقدم الآن" : "Apply Now"}
      </Button>
    </div>
  );
}

export function RecommendedJobs({
  jobs,
  isLoading,
  hasError,
  isArabic,
  onLoadMore,
  hasMore,
}: Readonly<RecommendedJobsProps>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{isArabic ? "وظائف موصى بها" : "Recommended Jobs"}</CardTitle>
        <CardDescription>
          {isArabic ? "بناءً على ملفك الشخصي" : "Based on your profile"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading && <Skeleton className="h-24 w-full" />}
          
          {!isLoading && jobs.map((job) => (
            <JobCard key={job.id} job={job} isArabic={isArabic} />
          ))}
          
          {!isLoading && jobs.length === 0 && !hasError && (
            <p className="text-sm text-gray-500">
              {isArabic ? "لا توجد وظائف مقترحة حالياً" : "No recommendations yet"}
            </p>
          )}
          
          {!isLoading && hasError && (
            <p className="text-sm text-red-500">
              {isArabic ? "تعذر تحميل الوظائف المقترحة." : "Failed to load recommendations."}
            </p>
          )}
          
          {!isLoading && hasMore && (
            <Button variant="outline" className="w-full" onClick={onLoadMore}>
              {isArabic ? "عرض المزيد" : "Show more"}
            </Button>
          )}
        </div>
        <Button variant="outline" className="w-full mt-4">
          {isArabic ? "المزيد من الوظائف" : "More Jobs"}
        </Button>
      </CardContent>
    </Card>
  );
}
