import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  Calendar,
  Star,
  ArrowLeft,
  Loader2,
  Timer,
  AlertTriangle,
} from "lucide-react";
import { Streamdown } from "streamdown";
import { Progress } from "@/components/ui/progress";

type ConsultationMessageRecord = {
  id: number;
  senderId: number;
  senderType: "client" | "consultant";
  message: string;
  createdAt: string;
  isAiAssisted?: boolean;
};

type BookingRecord = {
  ticketNumber?: string;
  subject?: string;
  description?: string;
  status?: string;
  consultantId?: number;
  consultant?: {
    id: number;
    userId: number;
    fullNameAr?: string;
  } | null;
  consultationType?: {
    id: number;
    nameAr: string;
    duration?: number;
    price?: number;
    slaHours?: number;
  } | null;
  userId?: number;
  createdAt?: string | Date;
  scheduledDate?: string | Date;
  scheduledTime?: string;
  price?: number;
  slaHours?: number;
  clientId?: number;
};

export default function ConsultationChat() {
  const { id } = useParams<{ id: string }>();
  const bookingId = parseInt(id || "0");
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [message, setMessage] = useState("");
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const utils = trpc.useUtils();

  // Get booking details
  const { data: bookingData, isLoading: bookingLoading } =
    trpc.consultant.getBooking.useQuery(
      { bookingId },
      { enabled: !!bookingId && isAuthenticated }
    );

  // Get messages
  const { data: messagesData, isLoading: messagesLoading } =
    trpc.consultant.getMessages.useQuery(
      { bookingId },
      {
        enabled: !!bookingId && isAuthenticated,
        refetchInterval: 3000, // Refresh every 3 seconds
      }
    );

  // Send message mutation
  const sendMessageMutation = trpc.consultant.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      utils.consultant.getMessages.invalidate({ bookingId });
      scrollToBottom();
    },
    onError: (error: { message?: string }) => {
      toast.error("فشل إرسال الرسالة: " + error.message);
    },
  });

  // Get AI suggestion mutation
  const getAiSuggestionMutation = trpc.consultant.getAiSuggestion.useMutation({
    onSuccess: (data: { suggestion: string | string[] }) => {
      setMessage(
        Array.isArray(data.suggestion)
          ? JSON.stringify(data.suggestion)
          : data.suggestion
      );
      toast.success("تم إنشاء الاقتراح بنجاح!");
      setIsLoadingAi(false);
    },
    onError: (error: { message?: string }) => {
      toast.error("فشل إنشاء الاقتراح: " + error.message);
      setIsLoadingAi(false);
    },
  });

  // Update status mutation
  const updateStatusMutation =
    trpc.consultant.updateConsultationStatus.useMutation({
      onSuccess: () => {
        toast.success("تم تحديث الحالة بنجاح");
        utils.consulting.getTicket.invalidate({ ticketId: bookingId });
      },
      onError: (error: { message?: string }) => {
        toast.error("فشل تحديث الحالة: " + error.message);
      },
    });

  const escalateMutation = trpc.consulting.escalate.useMutation({
    onSuccess: () => {
      toast.success("تم تصعيد التذكرة لفريق الدعم");
    },
    onError: (error: { message?: string }) => {
      toast.error("فشل التصعيد: " + error.message);
    },
  });

  // Rate consultation mutation
  const rateConsultationMutation = trpc.consultant.rateConsultation.useMutation(
    {
      onSuccess: () => {
        toast.success("شكراً لتقييمك!");
        setShowRating(false);
        navigate("/my-consultations");
      },
      onError: (error: { message?: string }) => {
        toast.error("فشل إرسال التقييم: " + error.message);
      },
    }
  );

  const booking = (bookingData?.booking ?? undefined) as BookingRecord | undefined;
  const calculateRemaining = () => {
    if (!booking?.createdAt) return null;
    const sla = booking.slaHours || booking.consultationType?.slaHours || 24;
    const due = new Date(booking.createdAt as string);
    due.setHours(due.getHours() + sla);
    const diffMs = due.getTime() - Date.now();
    if (diffMs <= 0) return "انتهى الوقت المستهدف";
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours} ساعة ${minutes} دقيقة`;
  };
  const messages: ConsultationMessageRecord[] = useMemo(() => 
    (messagesData?.messages ?? []) as unknown as ConsultationMessageRecord[],
    [messagesData?.messages]
  );

  const slaInfo = (() => {
    if (!booking?.createdAt) return null;
    const sla = booking.slaHours || booking.consultationType?.slaHours || 24;
    const created = new Date(booking.createdAt as string).getTime();
    const due = created + sla * 60 * 60 * 1000;
    const now = Date.now();
    const total = due - created;
    const elapsed = Math.max(0, Math.min(total, now - created));
    const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
    const remainingMs = due - now;
    const isLate = remainingMs < 0;
    const isNear = !isLate && remainingMs <= 4 * 60 * 60 * 1000; // أقل من 4 ساعات
    return {
      progress,
      remainingLabel: calculateRemaining(),
      isLate,
      isNear,
      remainingMs,
    };
  })();

  // Check if user is consultant
  const [isConsultant, setIsConsultant] = useState(false);
  useEffect(() => {
    if (user && booking) {
      const consultantUserId = booking.consultant?.userId;
      const matchesId =
        consultantUserId === user.id || booking.consultantId === user.id;
      setIsConsultant(matchesId);
    }
  }, [user, booking]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("الرجاء كتابة رسالة");
      return;
    }

    sendMessageMutation.mutate({
      bookingId,
      message: message.trim(),
    });
  };

  const handleGetAiSuggestion = async () => {
    if (messages.length === 0) {
      toast.error("لا توجد رسائل للحصول على اقتراح");
      return;
    }

    setIsLoadingAi(true);

    // Get last client message
    const lastClientMessage = messages
      .filter(m => m.senderType === "client")
      .slice(-1)[0];

    if (!lastClientMessage) {
      toast.error("لا توجد رسالة من العميل");
      setIsLoadingAi(false);
      return;
    }

    // Build conversation history
    const conversationHistory = messages.slice(-10).map(m => ({
      role: m.senderType as "client" | "consultant",
      message: m.message,
    }));

    getAiSuggestionMutation.mutate({
      bookingId,
      clientMessage: lastClientMessage.message,
      conversationHistory,
    });
  };

  const handleUpdateStatus = (status: "in-progress" | "completed") => {
    updateStatusMutation.mutate({ bookingId, status });
  };

  const handleSubmitRating = () => {
    if (rating === 0) {
      toast.error("الرجاء اختيار تقييم");
      return;
    }

    rateConsultationMutation.mutate({
      bookingId,
      rating,
      comment: ratingComment,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              يجب تسجيل الدخول للوصول إلى هذه الصفحة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (bookingLoading || messagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              الاستشارة غير موجودة
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    open: "bg-blue-500",
    pending: "bg-yellow-500",
    confirmed: "bg-blue-500",
    "in-progress": "bg-purple-500",
    completed: "bg-green-500",
    cancelled: "bg-red-500",
  };

  const statusLabels: Record<string, string> = {
    open: "مفتوحة",
    pending: "قيد الانتظار",
    confirmed: "مؤكدة",
    "in-progress": "قيد التنفيذ",
    completed: "مكتملة",
    cancelled: "ملغاة",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  navigate(
                    isConsultant ? "/consultant/dashboard" : "/my-consultations"
                  )
                }
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">
                  استشارة #{booking.ticketNumber || bookingId}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {booking.subject || booking.consultationType?.nameAr}
                </p>
              </div>
            </div>
            <Badge className={statusColors[booking.status || "pending"]}>
              {statusLabels[booking.status || "pending"]}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
            <span className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded">
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
            <div className="mt-3 space-y-1">
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
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Area */}
          <div className="lg:col-span-2">
            <Card className="h-[calc(100vh-200px)] flex flex-col">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                  محادثة الاستشارة
                </CardTitle>
              </CardHeader>

              {/* Messages Area */}
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <h3 className="text-lg font-semibold mb-2">
                      ابدأ المحادثة
                    </h3>
                    <p className="text-muted-foreground">
                      {isConsultant
                        ? "قم بإرسال رسالة للعميل لبدء الاستشارة"
                        : "قم بإرسال رسالة للمستشار"}
                    </p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMyMessage = msg.senderId === user?.id;
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isMyMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            isMyMessage
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-semibold">
                              {msg.senderType === "consultant"
                                ? "المستشار"
                                : "العميل"}
                            </span>
                            {msg.isAiAssisted && (
                              <Sparkles className="h-3 w-3 text-yellow-500" />
                            )}
                          </div>
                          <Streamdown>{msg.message}</Streamdown>
                          <div className="text-xs opacity-70 mt-1">
                            {new Date(msg.createdAt).toLocaleTimeString(
                              "ar-SA",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </CardContent>

              {/* Input Area */}
              <div className="border-t p-4">
                {booking.status === "completed" &&
                !isConsultant &&
                !showRating ? (
                  <Button
                    className="w-full"
                    onClick={() => setShowRating(true)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    قيّم الاستشارة
                  </Button>
                ) : showRating ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        التقييم
                      </label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            onClick={() => setRating(star)}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <Textarea
                      placeholder="تعليقك (اختياري)"
                      value={ratingComment}
                      onChange={e => setRatingComment(e.target.value)}
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmitRating}
                        disabled={rateConsultationMutation.isPending}
                        className="flex-1"
                      >
                        {rateConsultationMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                        )}
                        إرسال التقييم
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowRating(false)}
                      >
                        إلغاء
                      </Button>
                    </div>
                  </div>
                ) : booking.status !== "cancelled" ? (
                  <div className="space-y-2">
                    {isConsultant && (
                      <div className="mb-2 rounded-lg border bg-muted/60 p-3 text-xs text-muted-foreground flex gap-2">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                          <Sparkles className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-foreground">
                            مساعد الذكاء الاصطناعي (DeepSeek)
                          </p>
                          <p>
                            يقرأ آخر 10 رسائل ويقترح رداً سريعاً مع مراعاة SLA والمتطلبات
                            المرفوعة. راجع الاقتراح قبل الإرسال.
                          </p>
                        </div>
                      </div>
                    )}
                    {isConsultant && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGetAiSuggestion}
                        disabled={isLoadingAi || messages.length === 0}
                        className="w-full mb-2"
                      >
                        {isLoadingAi ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        مساعدة AI - اقتراح رد ذكي
                      </Button>
                    )}
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="اكتب رسالتك هنا..."
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        rows={2}
                        className="flex-1"
                      />
                      <div className="flex flex-col gap-2">
                        <Button
                          size="icon"
                          onClick={handleSendMessage}
                          disabled={
                            sendMessageMutation.isPending || !message.trim()
                          }
                        >
                          {sendMessageMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-4">
                    الاستشارة ملغاة
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Sidebar - Booking Details */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">تفاصيل الاستشارة</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    نوع الاستشارة
                  </label>
                  <p className="font-medium">
                    {booking.consultationType?.nameAr || "غير محدد"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    الموضوع
                  </label>
                  <p className="font-medium">
                    {booking.subject || "استشارة الموارد البشرية"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    الوصف
                  </label>
                  <p className="text-sm">{booking.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      التاريخ
                    </label>
                    <p className="text-sm">
                      {booking.scheduledDate
                        ? new Date(booking.scheduledDate).toLocaleDateString("ar-SA")
                        : "-"}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      الوقت
                    </label>
                    <p className="text-sm">{booking.scheduledTime || "-"}</p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    تاريخ الإنشاء
                  </label>
                  <p className="text-sm">
                    {(booking.createdAt
                      ? new Date(booking.createdAt)
                      : new Date()
                    ).toLocaleDateString("ar-SA")}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      SLA
                    </label>
                    <p className="text-sm font-semibold">
                      {booking.slaHours ||
                        booking.consultationType?.slaHours ||
                        "24"}{" "}
                      ساعة
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      السعر
                    </label>
                    <p className="text-sm font-semibold text-primary">
                      {booking.price ||
                        booking.consultationType?.price ||
                        "—"}{" "}
                      ريال
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {isConsultant &&
              booking.status !== "completed" &&
              booking.status !== "cancelled" && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">إجراءات</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {booking.status === "pending" && (
                      <Button
                        className="w-full"
                        onClick={() => handleUpdateStatus("in-progress")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <Clock className="mr-2 h-4 w-4" />
                        بدء الاستشارة
                      </Button>
                    )}
                    {booking.status === "in-progress" && (
                      <Button
                        className="w-full"
                        onClick={() => handleUpdateStatus("completed")}
                        disabled={updateStatusMutation.isPending}
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        إنهاء الاستشارة
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
