import { useParams, useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  Clock,
  MessageCircle,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  Timer,
  AlertTriangle,
  Send,
  Paperclip,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
  const escalateMutation = trpc.consulting.escalate.useMutation({
    onSuccess: () => {
      toast.success("تم تصعيد التذكرة لفريق الدعم");
    },
    onError: (error: { message?: string }) => {
      toast.error("فشل التصعيد: " + error.message);
    },
  });

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

  const slaInfo = (() => {
    const b = data?.booking;
    if (!b?.createdAt) return null;
    const sla = b.slaHours || b.consultationType?.slaHours || 24;
    const created = new Date(b.createdAt).getTime();
    const due = created + sla * 60 * 60 * 1000;
    const now = Date.now();
    const total = due - created;
    const elapsed = Math.max(0, Math.min(total, now - created));
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const remainingMs = due - now;
    const isLate = remainingMs < 0;
    const isNear = !isLate && remainingMs <= 4 * 60 * 60 * 1000;
    return {
      progress,
      remainingLabel: calculateRemaining(),
      isLate,
      isNear,
    };
  })();

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const booking = data?.booking;
  const attachments = (() => {
    const raw = booking?.attachments as any;
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try {
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

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

      <Card className="border-indigo-100">
        <CardContent className="py-4 space-y-2">
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              SLA: {booking.slaHours || booking.consultationType?.slaHours || 24} ساعة
            </span>
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
              <Timer className="h-3 w-3" />
              {calculateRemaining() || "—"}
            </span>
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
              <Calendar className="h-3 w-3" />
              {booking.scheduledDate
                ? new Date(booking.scheduledDate).toLocaleDateString("ar-SA")
                : "—"}{" "}
              {booking.scheduledTime || ""}
            </span>
          </div>
          {slaInfo && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">التقدم نحو الـ SLA</span>
                <span
                  className={
                    slaInfo.isLate
                      ? "text-red-600 font-semibold"
                      : slaInfo.isNear
                        ? "text-amber-600 font-semibold"
                        : "text-foreground"
                  }
                >
                  {slaInfo.isLate ? "تم تجاوز الوقت" : slaInfo.remainingLabel || "—"}
                </span>
              </div>
              <div className="flex items-center gap-2">
              <Progress
                value={slaInfo.progress}
                className={`flex-1 ${
                  slaInfo.isLate
                    ? "bg-red-100 [&>[data-slot=progress-indicator]]:bg-red-500"
                      : slaInfo.isNear
                        ? "bg-amber-100 [&>[data-slot=progress-indicator]]:bg-amber-500"
                        : ""
                  }`}
                />
                {(slaInfo.isLate || slaInfo.isNear) && (
                  <AlertTriangle
                    className={`h-4 w-4 ${
                      slaInfo.isLate ? "text-red-600" : "text-amber-600"
                    }`}
                  />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                يتم احتساب الوقت من تاريخ الإنشاء؛ في حال اقتراب الوقت يمكن التصعيد أو فتح المحادثة مباشرة.
              </p>
              {(slaInfo.isLate || slaInfo.isNear) && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={slaInfo.isLate ? "destructive" : "outline"}
                    disabled={escalateMutation.isPending}
                    onClick={() =>
                      escalateMutation.mutate({
                        bookingId,
                        reason: slaInfo.isLate ? "sla-missed" : "sla-risk",
                      })
                    }
                  >
                    {escalateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-1" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 mr-1" />
                    )}
                    تصعيد الدعم
                  </Button>
                  <Button size="sm" asChild variant="secondary">
                    <Link href={`/consultation/${bookingId}/chat`}>
                      <Send className="h-4 w-4 mr-1" />
                      فتح المحادثة الآن
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

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
