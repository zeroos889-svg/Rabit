import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface ConsultantStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor: string;
  isLoading: boolean;
  suffix?: ReactNode;
}

export function ConsultantStatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  isLoading,
  suffix,
}: Readonly<ConsultantStatCardProps>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-16" />
        ) : (
          <div className="text-2xl font-bold">
            {value}{suffix}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
