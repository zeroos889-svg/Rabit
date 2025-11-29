import { useState } from "react";
import { useLocation } from "wouter";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  CreditCard,
  Building2,
  CheckCircle2,
  Shield,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
  Tag,
  FlaskConical,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { IS_TRIAL_MODE, TRIAL_MESSAGE } from "@/const";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const isTrialMode = IS_TRIAL_MODE;
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<
    "credit_card" | "bank_transfer"
  >("credit_card");
  // Selected package (from previous step)
  const [selectedPackage] = useState({
    id: "professional",
    name: "الباقة الاحترافية",
    price: 1499,
    originalPrice: 1999,
    discount: 25,
    features: [
      "حتى 50 موظف",
      "جميع أدوات HR",
      "تقارير متقدمة",
      "دعم فني مباشر",
      "استشارة مجانية شهرياً",
      "تكامل مع الأنظمة الحكومية",
    ],
  });

  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountAmount: number;
    discountType: "percentage" | "fixed";
    discountValue: number;
    finalAmount: number;
  } | null>(null);
  const createMoyasarPayment = trpc.payment.createMoyasarPayment.useMutation();
  const createTapPayment = trpc.payment.createTapPayment.useMutation();
  const validateDiscountQuery = trpc.discountCodes.validate.useQuery(
    { code: discountCode },
    { enabled: false, retry: false }
  );
  const calculateDiscountQuery = trpc.discountCodes.calculateDiscount.useQuery(
    { code: discountCode, originalAmount: selectedPackage.price },
    { enabled: false, retry: false }
  );
  const isApplyingDiscount =
    validateDiscountQuery.isFetching || calculateDiscountQuery.isFetching;

  // Form data
  const [billingData, setBillingData] = useState({
    fullName: "",
    email: "",
    phone: "",
    companyName: "",
    taxNumber: "",
    address: "",
  });

  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
  });

  // Calculate final price
  const calculateFinalPrice = () => {
    if (appliedDiscount) {
      return appliedDiscount.finalAmount;
    }
    return selectedPackage.price;
  };

  const handleApplyDiscount = async () => {
    const code = discountCode.trim().toUpperCase();
    if (!code) {
      toast.error("الرجاء إدخال كود الخصم");
      return;
    }

    setDiscountCode(code);
    setAppliedDiscount(null);

    try {
      const validateResult = await validateDiscountQuery.refetch({
        throwOnError: true,
      });

      if (!validateResult.data?.valid) {
        toast.error(validateResult.data?.message || "كود الخصم غير صالح");
        return;
      }

      const calculation = await calculateDiscountQuery.refetch({
        throwOnError: true,
      });

      if (!calculation.data) {
        toast.error("تعذر حساب قيمة الخصم");
        return;
      }

      setAppliedDiscount({
        code,
        discountAmount: calculation.data.discountAmount,
        discountType: calculation.data.discountType,
        discountValue: calculation.data.discountValue,
        finalAmount: calculation.data.finalAmount,
      });
      toast.success("تم تطبيق كود الخصم بنجاح!");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "كود الخصم غير صالح";
      toast.error(message);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!billingData.fullName || !billingData.email || !billingData.phone) {
      toast.error("الرجاء إكمال جميع البيانات المطلوبة");
      return;
    }

    if (isTrialMode) {
      toast.success("تم تسجيل طلبك خلال الفترة التجريبية. لن يتم خصم أي مبالغ حالياً.");
      setLocation("/payment-success?trial=true");
      return;
    }

    if (paymentMethod === "credit_card") {
      if (
        !cardData.cardNumber ||
        !cardData.cardName ||
        !cardData.expiryDate ||
        !cardData.cvv
      ) {
        toast.error("الرجاء إكمال بيانات البطاقة");
        return;
      }
    }

    setIsLoading(true);

    try {
      const paymentPayload = {
        planKey: selectedPackage.id,
        amount: totalAmount,
        discountCode: appliedDiscount?.code,
        customerEmail: billingData.email,
      };
      const result =
        paymentMethod === "credit_card"
          ? await createMoyasarPayment.mutateAsync(paymentPayload)
          : await createTapPayment.mutateAsync(paymentPayload);

      if (result?.redirectUrl) {
          globalThis?.location?.assign(result.redirectUrl);
        return;
      }

      toast.success("تمت عملية الدفع بنجاح!");
      setLocation("/payment-success");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "حدث خطأ أثناء معالجة الدفع";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const finalPrice = calculateFinalPrice();
  const vatAmount = finalPrice * 0.15; // 15% VAT
  const totalAmount = finalPrice + vatAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 py-12">
      <BackButton />

      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <p className="text-muted-foreground">
            أنت على بعد خطوة واحدة من الانضمام إلى منصة رابِط
          </p>
        </div>

        {isTrialMode && (
          <Alert className="mb-8 border-dashed border-primary/40 bg-primary/5">
            <FlaskConical className="h-5 w-5" />
            <AlertTitle>الفترة التجريبية مفعلة</AlertTitle>
            <AlertDescription>{TRIAL_MESSAGE}</AlertDescription>
          </Alert>
        )}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Billing Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  معلومات الفوترة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePayment} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">
                        الاسم الكامل <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="fullName"
                        value={billingData.fullName}
                        onChange={e =>
                          setBillingData({
                            ...billingData,
                            fullName: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">
                        البريد الإلكتروني{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        value={billingData.email}
                        onChange={e =>
                          setBillingData({
                            ...billingData,
                            email: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">
                        رقم الجوال <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="05xxxxxxxx"
                        value={billingData.phone}
                        onChange={e =>
                          setBillingData({
                            ...billingData,
                            phone: e.target.value,
                          })
                        }
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="companyName">اسم الشركة</Label>
                      <Input
                        id="companyName"
                        value={billingData.companyName}
                        onChange={e =>
                          setBillingData({
                            ...billingData,
                            companyName: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="taxNumber">الرقم الضريبي</Label>
                      <Input
                        id="taxNumber"
                        placeholder="300xxxxxxxxx"
                        value={billingData.taxNumber}
                        onChange={e =>
                          setBillingData({
                            ...billingData,
                            taxNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">العنوان</Label>
                      <Input
                        id="address"
                        value={billingData.address}
                        onChange={e =>
                          setBillingData({
                            ...billingData,
                            address: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  طريقة الدفع
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={value => {
                    if (isTrialMode) return;
                    setPaymentMethod(value as "credit_card" | "bank_transfer");
                  }}
                  className={isTrialMode ? "opacity-60 pointer-events-none" : ""}
                >
                  <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="credit_card" id="credit_card" />
                    <Label
                      htmlFor="credit_card"
                      className="flex-1 cursor-pointer"
                    >
                      بطاقة الائتمان / مدى
                    </Label>
                    <div className="flex gap-2">
                      <Badge variant="secondary">Visa</Badge>
                      <Badge variant="secondary">Mastercard</Badge>
                      <Badge variant="secondary">مدى</Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label
                      htmlFor="bank_transfer"
                      className="flex-1 cursor-pointer"
                    >
                      تحويل بنكي
                    </Label>
                  </div>
                </RadioGroup>

                {paymentMethod === "credit_card" && (
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">رقم البطاقة</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        value={cardData.cardNumber}
                        onChange={e =>
                          setCardData({
                            ...cardData,
                            cardNumber: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cardName">اسم حامل البطاقة</Label>
                      <Input
                        id="cardName"
                        placeholder="كما هو مكتوب على البطاقة"
                        value={cardData.cardName}
                        onChange={e =>
                          setCardData({ ...cardData, cardName: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiryDate">تاريخ الانتهاء</Label>
                        <Input
                          id="expiryDate"
                          placeholder="MM/YY"
                          maxLength={5}
                          value={cardData.expiryDate}
                          onChange={e =>
                            setCardData({
                              ...cardData,
                              expiryDate: e.target.value,
                            })
                          }
                          required={!isTrialMode}
                          disabled={isTrialMode || isLoading}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input
                          id="cvv"
                          type="password"
                          placeholder="123"
                          maxLength={4}
                          value={cardData.cvv}
                          onChange={e =>
                            setCardData({ ...cardData, cvv: e.target.value })
                          }
                          required={!isTrialMode}
                          disabled={isTrialMode || isLoading}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === "bank_transfer" && (
                  <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                    <p className="font-semibold">معلومات الحساب البنكي:</p>
                    <div className="space-y-1 text-sm">
                      <p>اسم البنك: البنك الأهلي السعودي</p>
                      <p>رقم الحساب: SA1234567890123456789012</p>
                      <p>اسم المستفيد: شركة رابِط للتقنية</p>
                      <p className="text-muted-foreground mt-2">
                        يرجى إرفاق إثبات التحويل عند التواصل معنا
                      </p>
                    </div>
                  </div>
                )}

                <Button
                  type="button"
                  onClick={handlePayment}
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="me-2 h-5 w-5 animate-spin" />
                      جاري معالجة الطلب...
                    </>
                  ) : isTrialMode ? (
                    <>
                      تأكيد الاشتراك التجريبي
                      <Sparkles className="ms-2 h-5 w-5" />
                    </>
                  ) : (
                    <>
                      إتمام الدفع - {totalAmount.toFixed(2)} ﷼
                      <ArrowRight className="ms-2 h-5 w-5" />
                    </>
                  )}
                </Button>

                {isTrialMode && (
                  <p className="text-xs text-center text-primary font-medium">
                    {TRIAL_MESSAGE}
                  </p>
                )}

                <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    <span>تشفير SSL آمن</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    <span>PCI DSS معتمد</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package Details */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedPackage.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        اشتراك شهري
                      </p>
                    </div>
                    <div className="text-left">
                      {selectedPackage.discount > 0 && (
                        <p className="text-sm text-muted-foreground line-through">
                          {selectedPackage.originalPrice} ﷼
                        </p>
                      )}
                      <p className="font-semibold">{selectedPackage.price} ﷼</p>
                    </div>
                  </div>

                  {selectedPackage.discount > 0 && (
                    <Badge
                      variant="secondary"
                      className="bg-green-100 text-green-800"
                    >
                      <Sparkles className="w-3 h-3 me-1" />
                      خصم {selectedPackage.discount}%
                    </Badge>
                  )}

                  <ul className="text-sm text-muted-foreground space-y-1">
                    {selectedPackage.features
                      .slice(0, 3)
                      .map(feature => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    {selectedPackage.features.length > 3 && (
                      <li className="text-primary">
                        +{selectedPackage.features.length - 3} ميزة أخرى
                      </li>
                    )}
                  </ul>
                </div>

                <Separator />

                {/* Discount Code */}
                <div className="space-y-2">
                  <Label htmlFor="discount">كود الخصم</Label>
                  <div className="flex gap-2">
                    <Input
                      id="discount"
                      placeholder="أدخل الكود"
                      value={discountCode}
                      onChange={e =>
                        setDiscountCode(e.target.value.toUpperCase())
                      }
                      disabled={!!appliedDiscount || isApplyingDiscount}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyDiscount}
                      disabled={!!appliedDiscount || isApplyingDiscount}
                    >
                      {isApplyingDiscount ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Tag className="h-4 w-4" />
                      )}
                    </Button>
                    {appliedDiscount && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleRemoveDiscount}
                      >
                        إزالة
                      </Button>
                    )}
                  </div>
                  {appliedDiscount && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="h-4 w-4" />
                      تم تطبيق خصم{" "}
                      {appliedDiscount.discountType === "percentage"
                        ? `${appliedDiscount.discountValue}%`
                        : `${appliedDiscount.discountAmount.toFixed(2)} ﷼`}
                    </p>
                  )}
                </div>

                <Separator />

                {/* Price Breakdown */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>المجموع الفرعي</span>
                    <span>{selectedPackage.price.toFixed(2)} ﷼</span>
                  </div>

                  {appliedDiscount && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>الخصم</span>
                      <span>
                        - {appliedDiscount.discountAmount.toFixed(2)} ﷼
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm">
                    <span>الضريبة المضافة (15%)</span>
                    <span>{vatAmount.toFixed(2)} ﷼</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>المجموع الإجمالي</span>
                    <span>{totalAmount.toFixed(2)} ﷼</span>
                  </div>
                </div>

                <div className="bg-primary/5 p-3 rounded-lg text-sm text-center">
                  <p className="text-muted-foreground">
                    سيتم تجديد الاشتراك تلقائياً كل شهر
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
