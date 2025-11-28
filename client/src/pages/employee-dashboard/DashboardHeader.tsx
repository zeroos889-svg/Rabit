import { Button } from "@/components/ui/button";
import { Briefcase } from "lucide-react";
import { Link } from "wouter";

interface DashboardHeaderProps {
  isArabic: boolean;
  hasError: boolean;
}

export function DashboardHeader({ isArabic, hasError }: Readonly<DashboardHeaderProps>) {
  return (
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
  );
}
