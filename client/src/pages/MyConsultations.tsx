import { useMemo } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MessageCircle, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BookingItem {
  id: number;
  subject?: string;
  consultationType?: { nameAr?: string; slaHours?: number | null; price?: number | null };
  consultant?: { fullNameAr?: string };
  status?: string;
  scheduledDate?: string | Date;
  scheduledTime?: string;
  price?: number | null;
  slaHours?: number | null;
}

const statusLabels: Record<string, string> = {
  open: "مفتوحة",
  pending: "قيد الانتظار",
  confirmed: "مؤكدة",
  "in-progress": "قيد التنفيذ",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

const statusVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  open: "secondary",
  pending: "outline",
  confirmed: "secondary",
  "in-progress": "default",
  completed: "default",
  cancelled: "destructive",
};

export default function MyConsultations() {
  const [, navigate] = useLocation();
  const { data, isLoading, refetch, isFetching } =
    trpc.consultant.getMyBookings.useQuery();

  const bookings = useMemo(() => data?.bookings ?? [], [data]);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">استشاراتي</h1>
          <p className="text-sm text-muted-foreground">
            جميع جلساتك المحجوزة مع المستشارين.
          </p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className="h-4 w-4 me-2" />
          تحديث
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            لا توجد استشارات بعد. احجز استشارة جديدة من صفحة الاستشارات.
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {bookings.map((booking: BookingItem) => (
            <Card key={booking.id}>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {booking.subject || booking.consultationType?.nameAr || "استشارة"}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {booking.consultant?.fullNameAr || "سيتم التعيين لاحقاً"}
                  </p>
                </div>
                <Badge variant={statusVariants[booking.status || "pending"] || "secondary"}>
                  {statusLabels[booking.status || "pending"]}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {booking.scheduledDate
                      ? new Date(booking.scheduledDate).toLocaleDateString("ar-SA")
                      : "لم يحدد"}
                  </span>
                  <Clock className="h-4 w-4 ms-3" />
                  <span>{booking.scheduledTime || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    SLA: {booking.slaHours || booking.consultationType?.slaHours || 24} ساعة
                  </div>
                  <div className="font-semibold text-primary">
                    {(booking.price || booking.consultationType?.price || 0).toLocaleString()} ريال
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                  >
                    <Link href={`/consultation/${booking.id}`}>التفاصيل</Link>
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => navigate(`/consultation/${booking.id}/chat`)}
                  >
                    <MessageCircle className="h-4 w-4 me-1" />
                    المحادثة
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
