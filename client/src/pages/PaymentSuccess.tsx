import { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Download,
  Home,
  Mail,
  FileText,
  Calendar,
  CreditCard,
  ArrowRight,
  Sparkles,
  FlaskConical,
} from "lucide-react";
import { Link } from "wouter";
import confetti from "canvas-confetti";
import { IS_TRIAL_MODE, TRIAL_MESSAGE } from "@/const";

export default function PaymentSuccess() {
  // Success animation
  useEffect(() => {
    // Fire confetti on mount
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#35C6FF", "#1F8DFF", "#0B3DC2"],
      });

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#35C6FF", "#1F8DFF", "#0B3DC2"],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  const trialFromQuery = useMemo(() => {
    if (typeof globalThis === "undefined") return false;
    try {
      const params = new URLSearchParams(globalThis.location?.search ?? "");
      return params.get("trial") === "true";
    } catch (error) {
      console.warn("Failed to read trial query param", error);
      return false;
    }
  }, []);
  const isTrialExperience = IS_TRIAL_MODE || trialFromQuery;
  const transaction = isTrialExperience
    ? {
        id: "TRIAL-" + Date.now(),
        amount: 0,
        vat: 0,
        total: 0,
        date: new Date().toLocaleDateString("ar-SA"),
        time: new Date().toLocaleTimeString("ar-SA"),
        packageName: "الباقة الاحترافية",
        paymentMethod: "وضع تجريبي",
        cardLast4: "0000",
      }
    : {
        id: "TRX" + Date.now(),
        amount: 1499,
        vat: 224.85,
        total: 1723.85,
        date: new Date().toLocaleDateString("ar-SA"),
        time: new Date().toLocaleTimeString("ar-SA"),
        packageName: "الباقة الاحترافية",
        paymentMethod: "بطاقة مدى",
        cardLast4: "1234",
      };
  const heroTitle = isTrialExperience ? "تم تأكيد طلب الاشتراك التجريبي" : "تمت عملية الدفع بنجاح!";
  const heroSubtitle = isTrialExperience
    ? "لن يتم خصم أي مبالغ خلال هذه الفترة وسنتواصل معك لتفعيل الحساب الكامل."
    : "شكراً لك على الاشتراك في منصة رابِط";

  const handleDownloadReceipt = () => {
    console.log("Downloading receipt...");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-brand-100 flex items-center justify-center p-4 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="w-full max-w-2xl space-y-6">
        {isTrialExperience && (
          <Alert className="border-dashed border-primary/40 bg-primary/5">
            <FlaskConical className="h-5 w-5" />
            <AlertTitle>الفترة التجريبية مفعلة</AlertTitle>
            <AlertDescription>{TRIAL_MESSAGE}</AlertDescription>
          </Alert>
        )}
        {/* Success Message */}
        <Card className="border-2 border-brand-300 shadow-brand-soft">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-12 h-12 text-brand-600" />
              </div>

              <div>
                <h1 className="text-3xl font-bold text-gradient-primary mb-2">
                  {heroTitle}
                </h1>
                <p className="text-muted-foreground">{heroSubtitle}</p>
              </div>

              <Badge variant="secondary" className="text-lg px-4 py-2">
                <Sparkles className="w-4 h-4 ml-2" />
                رقم العملية: {transaction.id}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              تفاصيل العملية
            </CardTitle>
            <CardDescription>معلومات الدفع والاشتراك</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Package Info */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">الباقة</span>
                <span className="font-semibold">{transaction.packageName}</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">المبلغ</span>
                <span className="font-semibold">{transaction.amount} ﷼</span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  ضريبة القيمة المضافة (15%)
                </span>
                <span className="font-semibold">{transaction.vat} ﷼</span>
              </div>

              <Separator />

              <div className="flex justify-between items-center text-lg">
                <span className="font-bold">المجموع الإجمالي</span>
                <span className="font-bold text-primary">
                  {transaction.total} ﷼
                </span>
              </div>
            </div>

            <Separator />

            {/* Payment Method */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  طريقة الدفع
                </span>
                <span className="font-semibold">
                  {transaction.paymentMethod} •••• {transaction.cardLast4}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  التاريخ والوقت
                </span>
                <span className="font-semibold">
                  {transaction.date} - {transaction.time}
                </span>
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <p className="font-semibold flex items-center gap-2">
                <Mail className="w-4 h-4" />
                تم إرسال إيصال الدفع
              </p>
              <p className="text-sm text-muted-foreground">
                {isTrialExperience
                  ? "سيصلك إشعار بريدي عند تفعيل بوابات الدفع والبدء بالفوترة الفعلية."
                  : "تم إرسال إيصال الدفع التفصيلي إلى بريدك الإلكتروني المسجل. يمكنك أيضاً تحميله من هنا."}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle>الخطوات التالية</CardTitle>
            <CardDescription>ابدأ رحلتك مع رابِط الآن</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                1
              </div>
              <div>
                <p className="font-semibold">قم بإعداد حسابك</p>
                <p className="text-sm text-muted-foreground">
                  أضف معلومات شركتك وقم بتخصيص الإعدادات
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                2
              </div>
              <div>
                <p className="font-semibold">أضف فريق العمل</p>
                <p className="text-sm text-muted-foreground">
                  ابدأ بإضافة موظفيك وإدارة بياناتهم
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center flex-shrink-0 font-bold">
                3
              </div>
              <div>
                <p className="font-semibold">استكشف الأدوات</p>
                <p className="text-sm text-muted-foreground">
                  جرّب أدوات HR المتقدمة والتقارير الذكية
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleDownloadReceipt}
            variant="outline"
            className="flex-1"
            size="lg"
          >
            <Download className="ml-2 h-5 w-5" />
            تحميل الإيصال
          </Button>

          <Link href="/dashboard" className="flex-1">
            <Button className="w-full" size="lg">
              <Home className="ml-2 h-5 w-5" />
              {isTrialExperience ? "العودة إلى الصفحة الرئيسية" : "الانتقال إلى لوحة التحكم"}
              <ArrowRight className="mr-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Support */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                هل تحتاج إلى مساعدة؟
              </p>
              <Link href="/contact">
                <Button variant="ghost" size="sm">
                  تواصل مع الدعم الفني
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
