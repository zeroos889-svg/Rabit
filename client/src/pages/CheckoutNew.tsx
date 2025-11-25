import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Gift, PauseCircle, Shield, Building2, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Plan definitions
const PLANS = {
  basic: {
    key: "basic" as const,
    name: "Basic",
    nameAr: "الأساسية",
    price: 0,
    features: [
      "حتى 20 موظف",
      "أدوات HR أساسية",
      "تقارير شهرية",
      "دعم فني عبر البريد",
    ],
  },
  pro: {
    key: "pro" as const,
    name: "Professional",
    nameAr: "الاحترافية",
    price: 0,
    features: [
      "حتى 50 موظف",
      "جميع أدوات HR",
      "تقارير متقدمة",
      "دعم فني مباشر",
      "استشارة مجانية شهرياً",
    ],
    popular: true,
  },
  enterprise: {
    key: "enterprise" as const,
    name: "Enterprise",
    nameAr: "الشركات الكبرى",
    price: 0,
    features: [
      "عدد غير محدود من الموظفين",
      "جميع الميزات المتقدمة",
      "تقارير مخصصة",
      "دعم فني مخصص 24/7",
      "استشارات غير محدودة",
      "API مخصص",
    ],
  },
};

type PlanKey = keyof typeof PLANS;

export default function CheckoutNew() {
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("pro");
  const [isActivating, setIsActivating] = useState(false);

  const handleActivatePlan = async () => {
    setIsActivating(true);

    try {
      // TODO: Connect to backend endpoint when activation API becomes available
      await new Promise(resolve => setTimeout(resolve, 1200));
      toast.success("تم تفعيل الباقة مجاناً - سنبلغك قبل بدء الفوترة");
    } catch (error) {
      console.error("Activation error:", error);
      toast.error("حدث خطأ أثناء التفعيل المجاني، حاول لاحقاً");
    } finally {
      setIsActivating(false);
    }
  };

  const selectedPlanData = PLANS[selectedPlan];
  const vatAmount = 0;
  const totalAmount = 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-12">
      <BackButton />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">اختر باقتك وفعّلها مجاناً</h1>
          <p className="text-muted-foreground">
            جميع الباقات متاحة حالياً بدون أي رسوم أثناء تجهيز ربط بوابات الدفع
          </p>
        </div>

        <Card className="mb-8 border border-dashed border-primary/40 bg-primary/5">
          <CardContent className="py-6 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-primary font-semibold">
              <Gift className="h-5 w-5" />
              <span>جميع الباقات مجانية حالياً</span>
            </div>
            <p className="text-sm text-muted-foreground">
              الربط مع بوابات الدفع ما زال قيد التنفيذ، لذلك نتيح لك تفعيل أي باقة بدون بطاقة ائتمانية.
              سيتم إشعارك مسبقاً عند تفعيل المدفوعات.
            </p>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Plan Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  اختر الباقة
                </CardTitle>
                <CardDescription>
                  اختر الباقة التي تناسب احتياجات شركتك
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {(Object.keys(PLANS) as PlanKey[]).map(planKey => {
                    const plan = PLANS[planKey];
                    const isSelected = selectedPlan === planKey;

                    return (
                      <Card
                        key={planKey}
                        className={`relative cursor-pointer transition-all hover:shadow-lg ${
                          isSelected ? "border-primary ring-2 ring-primary" : ""
                        }`}
                        onClick={() => setSelectedPlan(planKey)}
                      >
                        {"popular" in plan && plan.popular && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <Badge className="bg-primary text-white">
                              <Sparkles className="w-3 h-3 ml-1" />
                              الأكثر شعبية
                            </Badge>
                          </div>
                        )}

                        <CardHeader>
                          <CardTitle className="text-lg">
                            {plan.nameAr}
                          </CardTitle>
                          <div className="text-3xl font-bold text-primary">
                            {plan.price} ﷼
                            <span className="text-sm text-muted-foreground">
                              /شهر
                            </span>
                          </div>
                        </CardHeader>

                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            {plan.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>

                        {isSelected && (
                          <div className="absolute top-4 right-4">
                            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Temporary free activation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PauseCircle className="w-5 h-5" />
                  التفعيل المجاني المؤقت
                </CardTitle>
                <CardDescription>
                  جرّب النظام الآن بدون بطاقة ائتمانية، وسنبلغك قبل بدء الفوترة
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground">لا حاجة لبطاقة</p>
                      <p>لن يتم خصم أي مبلغ خلال الفترة الحالية.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground">تفعيل فوري</p>
                      <p>اختر الباقة المفضلة واضغط على زر التفعيل المجاني.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-1" />
                    <div>
                      <p className="font-semibold text-foreground">إشعار مسبق</p>
                      <p>سنرسل لك بريداً إلكترونياً قبل إعادة تفعيل بوابات الدفع.</p>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleActivatePlan}
                  className="w-full"
                  size="lg"
                  disabled={isActivating}
                >
                  {isActivating ? (
                    <>
                      <Loader2 className="ml-2 h-5 w-5 animate-spin" />
                      جاري التفعيل المجاني...
                    </>
                  ) : (
                    <>
                      <Sparkles className="ml-2 h-5 w-5" />
                      تفعيل الباقة الآن
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  بعد انتهاء الفترة المجانية، ستتم مطالبتك بتأكيد وسيلة الدفع قبل أي رسوم مستقبلية
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
                <CardDescription>
                  الاستفادة من الفترة المجانية الحالية لجميع الباقات
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selected Plan */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">
                        باقة {selectedPlanData.nameAr}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        اشتراك شهري
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {selectedPlanData.price} ﷼
                      </p>
                      <p className="text-xs text-green-700">مجاني مؤقتاً</p>
                    </div>
                  </div>

                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedPlanData.features
                      .slice(0, 3)
                      .map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    {selectedPlanData.features.length > 3 && (
                      <li className="text-primary">
                        +{selectedPlanData.features.length - 3} ميزة أخرى
                      </li>
                    )}
                  </ul>
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{selectedPlanData.price.toFixed(2)} ﷼</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span>الضريبة المضافة (15%)</span>
                    <span>{vatAmount.toFixed(2)} ﷼</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الإجمالي</span>
                    <span>{totalAmount.toFixed(2)} ﷼</span>
                  </div>

                  <p className="text-xs text-center text-green-700">
                    السعر النهائي 0 ﷼ حتى يتم تفعيل بوابات الدفع
                  </p>
                </div>

                <div className="bg-primary/5 p-3 rounded-lg text-sm text-center">
                  <p className="text-muted-foreground">
                    لن يتم تحصيل أي رسوم خلال الفترة الحالية، وسنخطرُك قبل استئناف الفوترة.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-muted/30">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">معاملات آمنة 100%</p>
                    <p className="text-xs text-muted-foreground">
                      جميع البيانات مشفرة بتقنية SSL
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-sm">
                      ضمان استرجاع الأموال
                    </p>
                    <p className="text-xs text-muted-foreground">
                      في حال عدم الرضا خلال 14 يوم
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
