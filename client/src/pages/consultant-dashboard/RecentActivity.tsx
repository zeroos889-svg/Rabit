import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Eye } from "lucide-react";
import { Link } from "wouter";

export interface BookingItem {
  id: number;
  status: string;
  price?: number;
  clientId?: number;
  userId?: number;
  scheduledDate?: string;
  scheduledTime?: string;
  consultationType?: {
    nameAr?: string;
    nameEn?: string;
    price?: number;
  };
}

interface RecentActivityProps {
  bookings: BookingItem[];
  isLoading: boolean;
  hasError: boolean;
  isArabic: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
}

function BookingCard({ booking, isArabic }: Readonly<{ booking: BookingItem; isArabic: boolean }>) {
  const locale = isArabic ? "ar-SA" : "en-US";
  const formattedDate = booking.scheduledDate
    ? new Date(booking.scheduledDate).toLocaleDateString(locale)
    : "—";

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="text-purple-600">
        <Calendar className="w-5 h-5" />
      </div>
      <div className="flex-1">
        <p className="font-medium">
          {booking.consultationType?.nameAr || (isArabic ? "استشارة" : "Consultation")}
        </p>
        <p className="text-sm text-gray-500">
          {formattedDate} {booking.scheduledTime || ""}
        </p>
        <div className="text-xs text-muted-foreground">
          {isArabic ? "الحالة" : "Status"}: {booking.status}
        </div>
      </div>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/consultation/${booking.id}/chat`}>
          <Eye className="w-4 h-4" />
        </Link>
      </Button>
    </div>
  );
}

export function RecentActivity({
  bookings,
  isLoading,
  hasError,
  isArabic,
  search,
  onSearchChange,
  onLoadMore,
  hasMore,
}: Readonly<RecentActivityProps>) {
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (hasError) {
      return (
        <p className="text-sm text-red-500">
          {isArabic ? "تعذر تحميل الحجوزات." : "Failed to load bookings."}
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {bookings.map((booking) => (
          <BookingCard key={booking.id} booking={booking} isArabic={isArabic} />
        ))}

        {hasMore && (
          <Button variant="outline" className="w-full" onClick={onLoadMore}>
            {isArabic ? "عرض المزيد" : "Show more"}
          </Button>
        )}

        {bookings.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {isArabic ? "لا توجد حجوزات" : "No bookings found"}
          </p>
        )}
      </div>
    );
  };

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{isArabic ? "النشاط الأخير" : "Recent Activity"}</CardTitle>
            <CardDescription>
              {isArabic ? "آخر الحجوزات وتحديثاتها" : "Latest bookings and updates"}
            </CardDescription>
          </div>
          <Input
            placeholder={isArabic ? "ابحث في الحجوزات..." : "Search bookings..."}
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-xs"
          />
        </div>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
}
