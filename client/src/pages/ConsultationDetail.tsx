import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  MessageCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Timer,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const statusLabels: Record<string, string> = {
  open: "مفتوحة",
  pending: "قيد الانتظار",
  confirmed: "مؤكدة",
  "in-progress": "قيد التنفيذ",
  completed: "مكتملة",
  cancelled: "ملغاة",
};

export default function ConsultationDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const bookingId = Number(id);

  const { data, isLoading } = trpc.consultant.getBooking.useQuery(
    { bookingId },
    { enabled: !!bookingId }
  );

  const calculateRemaining = () => {
    const b = data?.booking;
    if (!b?.createdAt) return null;
    const sla = b.slaHours || b.consultationType?.slaHours || 24;
    const due = new Date(b.createdAt);
    due.setHours(due.getHours() + sla);
    const diffMs = due.getTime() - Date.now();
    if (diffMs <= 0) return "انتهى الوقت المستهدف";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة ${minutes} دقيقة`;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const booking = data?.booking;

  if (!booking) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            الاستشارة غير موجودة.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/my-consultations")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              استشارة #{booking.ticketNumber || bookingId}
            </h1>
            <p className="text-sm text-muted-foreground">
              {booking.subject || booking.consultationType?.nameAr || "استشارة الموارد البشرية"}
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {statusLabels[booking.status || "pending"] || "قيد الانتظار"}
        </Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ملخص الاستشارة</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground">المستشار</p>
                <p className="font-semibold">
                  {booking.consultant?.fullNameAr || "سيتم التعيين لاحقاً"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">نوع الاستشارة</p>
                <p className="font-semibold">
                  {booking.consultationType?.nameAr || "غير محدد"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">التاريخ</p>
                <p className="font-semibold">
                  {booking.scheduledDate
                    ? new Date(booking.scheduledDate).toLocaleDateString("ar-SA")
                    : "لم يحدد"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">الوقت</p>
                <p className="font-semibold">{booking.scheduledTime || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground">SLA</p>
                <p className="font-semibold">
                  {booking.slaHours || booking.consultationType?.slaHours || 24} ساعة
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">السعر</p>
                <p className="font-semibold text-primary">
                  {(booking.price || booking.consultationType?.price || 0).toLocaleString()} ريال
                </p>
              </div>
            </div>

            <div>
              <p className="text-muted-foreground mb-1">الوصف</p>
              <p className="text-sm leading-relaxed">{booking.description}</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الإجراءات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" asChild>
                <Link href={`/consultation/${bookingId}/chat`}>
                  <MessageCircle className="h-4 w-4 mr-2" />
                  الانتقال للمحادثة
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate("/consulting/book-new")}
              >
                حجز استشارة جديدة
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-600" />
                SLA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                يتم الرد خلال{" "}
                <strong className="text-primary">
                  {booking.slaHours || booking.consultationType?.slaHours || 24} ساعة
                </strong>{" "}
                من وقت الحجز.
              </p>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>تاريخ الإنشاء: {new Date(booking.createdAt || new Date()).toLocaleDateString("ar-SA")}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>الوقت المتبقي: {calculateRemaining() || "—"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4" />
                <span>الوقت المستهدف للإنجاز وفق SLA</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
