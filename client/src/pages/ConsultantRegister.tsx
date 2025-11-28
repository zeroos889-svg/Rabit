import { useState } from "react";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Link } from "wouter";
import { Upload, CheckCircle2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const MAX_FILES = 10;
const MAX_FILE_SIZE_MB = 5;
const BIO_MIN_LENGTH = 120;
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

const defaultAvailability = [
  { day: "الأحد", slot: "09:00 - 13:00 / 17:00 - 20:00", active: true },
  { day: "الاثنين", slot: "09:00 - 13:00 / 17:00 - 20:00", active: true },
  { day: "الثلاثاء", slot: "09:00 - 13:00 / 17:00 - 20:00", active: true },
  { day: "الأربعاء", slot: "09:00 - 13:00", active: true },
  { day: "الخميس", slot: "09:00 - 13:00", active: false },
  { day: "الجمعة", slot: "إجازة", active: false },
  { day: "السبت", slot: "إجازة", active: false },
];

export default function ConsultantRegister() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    specialization: "",
    yearsOfExperience: "",
    bio: "",
    certificates: null as File[] | null,
  });

  const [services, setServices] = useState({
    instantAdvice: true,
    session30: true,
    policyReview: false,
    workshop: false,
    hourlyRate: "450",
    currency: "SAR",
  });

  const [sla, setSla] = useState({
    responseHours: "8",
    deliveryHours: "48",
    refundWindowHours: "24",
  });

  const [channels, setChannels] = useState({
    chat: true,
    voice: true,
    inPerson: false,
  });

  const [availability, setAvailability] = useState(defaultAvailability);

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    cookies: false,
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login",
  });
  const registerMutation = trpc.consultant.register.useMutation({
    onSuccess: () => {
      setIsSuccess(true);
      toast.success("تم إرسال طلب التسجيل بنجاح! سنتواصل معك قريباً.");
    },
    onError: (error: { message?: string }) => {
      const message =
        error?.message ||
        "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.";
      toast.error(message);
    },
  });

  const uploadDocumentMutation = trpc.consultant.uploadDocument.useMutation({
    onError: (error: { message?: string }) => {
      const message =
        error?.message || "تعذر رفع المستند. يمكنك إعادة المحاولة لاحقاً.";
      toast.error(message);
    },
  });

  const isSubmitting =
    registerMutation.isPending || uploadDocumentMutation.isPending;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);

    if (files.length > MAX_FILES) {
      toast.error(`الحد الأقصى ${MAX_FILES} ملفات لكل طلب`);
      return;
    }

    const invalidType = files.find(file => !ALLOWED_FILE_TYPES.includes(file.type));
    if (invalidType) {
      toast.error("الملفات المسموحة: PDF, PNG, JPG فقط");
      return;
    }

    const oversize = files.find(file => file.size / (1024 * 1024) > MAX_FILE_SIZE_MB);
    if (oversize) {
      toast.error(`حجم كل ملف يجب ألا يتجاوز ${MAX_FILE_SIZE_MB}MB`);
      return;
    }

    setFormData({ ...formData, certificates: files });
  };

  const canSubmit =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.specialization &&
    formData.yearsOfExperience &&
    formData.bio &&
    formData.bio.length >= BIO_MIN_LENGTH &&
    agreements.terms &&
    agreements.privacy &&
    agreements.cookies;

  const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("تعذر قراءة الملف"));
        }
      };
      reader.onerror = () => reject(new Error("تعذر قراءة الملف"));
      reader.readAsDataURL(file);
    });

  const toggleAvailability = (day: string) => {
    setAvailability(prev =>
      prev.map(slot =>
        slot.day === day ? { ...slot, active: !slot.active } : slot
      )
    );
  };

  const setServiceValue = (
    key: keyof typeof services,
    value: boolean | string
  ) => {
    setServices(prev => ({ ...prev, [key]: value }));
  };

  const setSlaValue = (key: keyof typeof sla, value: string) => {
    setSla(prev => ({ ...prev, [key]: value }));
  };

  const toggleChannel = (key: keyof typeof channels) => {
    setChannels(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canSubmit) {
      toast.error("يرجى ملء جميع الحقول والموافقة على الإقرارات");
      return;
    }

    if (!isAuthenticated) {
      toast.error("يرجى تسجيل الدخول أولاً لإكمال التسجيل كمستشار");
      return;
    }

    try {
      const years = Number(formData.yearsOfExperience) || 0;
      const certificateNames =
        formData.certificates?.map(file => file.name) ?? [];

      await registerMutation.mutateAsync({
        fullNameAr: formData.fullName,
        fullNameEn: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        mainSpecialization: formData.specialization,
        subSpecializations: [],
        yearsOfExperience: years,
        bioAr: formData.bio,
        bioEn: formData.bio,
        certifications: certificateNames,
        services,
        availability,
        sla,
        channels,
      });

      if (formData.certificates?.length) {
        const uploads = await Promise.all(
          formData.certificates.map(async file => {
            const dataUrl = await fileToDataUrl(file);
            return uploadDocumentMutation.mutateAsync({
              documentType: "certificate",
              documentName: file.name,
              documentUrl: dataUrl,
              fileSize: file.size,
              mimeType: file.type,
            });
          })
        );

        if (uploads.some(result => !result?.success)) {
          toast.error("تم التسجيل، لكن تعذر رفع بعض المستندات");
        }
      }
    } catch (_error) {
      toast.error("حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">جار التحقق من تسجيل الدخول...</p>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <h2 className="text-3xl font-bold mb-4">تم إرسال طلبك بنجاح!</h2>
          <p className="text-lg text-muted-foreground mb-8">
            شكراً لك على التسجيل كمستشار في منصة رابِط. سيقوم فريقنا بمراجعة
            طلبك والتواصل معك خلال 2-3 أيام عمل.
          </p>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              ستتلقى رسالة تأكيد على بريدك الإلكتروني:{" "}
              <strong>{formData.email}</strong>
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/">
                <Button variant="outline">العودة للصفحة الرئيسية</Button>
              </Link>
              <Link href="/consulting">
                <Button className="gradient-primary text-white">
                  تصفح الاستشارات
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <BackButton />

        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">التسجيل كمستشار</h1>
            <p className="text-lg text-muted-foreground">
              انضم إلى فريق المستشارين المحترفين في منصة رابِط وشارك خبرتك مع
              الآلاف من الشركات والأفراد
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <section>
                <h2 className="text-2xl font-bold mb-4">المعلومات الشخصية</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">الاسم الكامل *</Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={e =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">رقم الجوال *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* Professional Information */}
              <section>
                <h2 className="text-2xl font-bold mb-4">المعلومات المهنية</h2>

                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="specialization">التخصص *</Label>
                      <Input
                        id="specialization"
                        value={formData.specialization}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            specialization: e.target.value,
                          })
                        }
                        placeholder="مثال: استشارات قانونية، تطوير الموارد البشرية"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="yearsOfExperience">سنوات الخبرة *</Label>
                      <Input
                        id="yearsOfExperience"
                        type="number"
                        min="1"
                        value={formData.yearsOfExperience}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            yearsOfExperience: e.target.value,
                          })
                        }
                        placeholder="عدد سنوات الخبرة"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="bio">نبذة عنك وخبراتك *</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={e =>
                        setFormData({ ...formData, bio: e.target.value })
                      }
                      placeholder="اكتب نبذة مختصرة عن خبراتك ومؤهلاتك (لا تقل عن 100 كلمة)"
                      rows={6}
                      required
                    />
                    <p
                      className={`text-sm mt-1 ${
                        formData.bio.length >= BIO_MIN_LENGTH
                          ? "text-muted-foreground"
                          : "text-amber-600"
                      }`}
                    >
                      {formData.bio.length} / {BIO_MIN_LENGTH} حرف مطلوبة لضمان قبول الملف
                    </p>
                  </div>
                </div>
              </section>

              {/* Service Packages */}
              <section className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">حزم الخدمات والتسعير</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 border rounded-lg p-4">
                      <Checkbox
                        id="instantAdvice"
                        checked={services.instantAdvice}
                        onCheckedChange={checked =>
                          setServiceValue("instantAdvice", Boolean(checked))
                        }
                      />
                      <div className="space-y-1">
                        <p className="font-medium">استشارة فورية (دردشة/مكالمة)</p>
                        <p className="text-sm text-muted-foreground">
                          رد خلال {sla.responseHours} ساعة مع ملخص مكتوب.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border rounded-lg p-4">
                      <Checkbox
                        id="session30"
                        checked={services.session30}
                        onCheckedChange={checked =>
                          setServiceValue("session30", Boolean(checked))
                        }
                      />
                      <div className="space-y-1">
                        <p className="font-medium">جلسة 30 دقيقة مجدولة</p>
                        <p className="text-sm text-muted-foreground">
                          مع أجندة مسبقة وتسجيل نقاط الإجراء.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border rounded-lg p-4">
                      <Checkbox
                        id="policyReview"
                        checked={services.policyReview}
                        onCheckedChange={checked =>
                          setServiceValue("policyReview", Boolean(checked))
                        }
                      />
                      <div className="space-y-1">
                        <p className="font-medium">مراجعة سياسات/عقود</p>
                        <p className="text-sm text-muted-foreground">
                          تسليم خلال {sla.deliveryHours} ساعة مع ملاحظات قانونية.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 border rounded-lg p-4">
                      <Checkbox
                        id="workshop"
                        checked={services.workshop}
                        onCheckedChange={checked =>
                          setServiceValue("workshop", Boolean(checked))
                        }
                      />
                      <div className="space-y-1">
                        <p className="font-medium">ورشة أو تدريب داخلي</p>
                        <p className="text-sm text-muted-foreground">
                          يشمل مواد PDF وشهادة حضور.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-[1fr_auto] gap-4 items-end">
                    <div>
                      <Label htmlFor="hourlyRate">سعر الساعة</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        min="150"
                        value={services.hourlyRate}
                        onChange={e => setServiceValue("hourlyRate", e.target.value)}
                        placeholder="مثال: 450"
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        يشمل التحضير، الملخص، والمتابعة بعد الجلسة.
                      </p>
                    </div>
                    <div>
                      <Label>العملة</Label>
                      <Select
                        value={services.currency}
                        onValueChange={value => setServiceValue("currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر العملة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SAR">ريال (SAR)</SelectItem>
                          <SelectItem value="USD">دولار (USD)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Availability */}
              <section className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">التوفر والحجز</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {availability.map(slot => (
                    <div
                      key={slot.day}
                      className="flex items-center justify-between border rounded-lg p-4"
                    >
                      <div>
                        <p className="font-medium">{slot.day}</p>
                        <p className="text-sm text-muted-foreground">{slot.slot}</p>
                      </div>
                      <Switch
                        checked={slot.active}
                        onCheckedChange={() => toggleAvailability(slot.day)}
                        aria-label={`تفعيل الحجز في ${slot.day}`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  يتم منع التداخل مع المواعيد المؤكدة تلقائياً وإغلاق المواعيد بعد الحجز.
                </p>
              </section>

              {/* SLA */}
              <section className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">معايير الجودة و SLA</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="responseHours">الرد الأول خلال (ساعات)</Label>
                    <Input
                      id="responseHours"
                      type="number"
                      min="1"
                      value={sla.responseHours}
                      onChange={e => setSlaValue("responseHours", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryHours">تسليم الملاحظات خلال (ساعات)</Label>
                    <Input
                      id="deliveryHours"
                      type="number"
                      min="12"
                      value={sla.deliveryHours}
                      onChange={e => setSlaValue("deliveryHours", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="refundWindowHours">نافذة استرجاع في حال التأخر (ساعات)</Label>
                    <Input
                      id="refundWindowHours"
                      type="number"
                      min="12"
                      value={sla.refundWindowHours}
                      onChange={e => setSlaValue("refundWindowHours", e.target.value)}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge variant={channels.chat ? "default" : "outline"}>
                    دردشة فورية
                  </Badge>
                  <Badge variant={channels.voice ? "default" : "outline"}>
                    مكالمة صوتية/فيديو
                  </Badge>
                  <Badge variant={channels.inPerson ? "default" : "outline"}>
                    حضورياً
                  </Badge>
                </div>
                <div className="flex gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <Switch
                      id="channel-chat"
                      checked={channels.chat}
                      onCheckedChange={() => toggleChannel("chat")}
                    />
                    <Label htmlFor="channel-chat">دعم الدردشة</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="channel-voice"
                      checked={channels.voice}
                      onCheckedChange={() => toggleChannel("voice")}
                    />
                    <Label htmlFor="channel-voice">مكالمة صوتية/فيديو</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="channel-inperson"
                      checked={channels.inPerson}
                      onCheckedChange={() => toggleChannel("inPerson")}
                    />
                    <Label htmlFor="channel-inperson">جلسة حضورية</Label>
                  </div>
                </div>
              </section>

              {/* Summary */}
              <section className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">ملخص العرض للمراجعة السريعة</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <Card className="p-4 space-y-2">
                    <p className="font-semibold">الحزم المفعّلة</p>
                    <div className="flex flex-wrap gap-2">
                      {services.instantAdvice && <Badge>استشارة فورية</Badge>}
                      {services.session30 && <Badge>جلسة 30 دقيقة</Badge>}
                      {services.policyReview && <Badge>مراجعة سياسات</Badge>}
                      {services.workshop && <Badge>ورشة/تدريب</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      سعر الساعة: {services.hourlyRate} {services.currency}
                    </p>
                  </Card>

                  <Card className="p-4 space-y-2">
                    <p className="font-semibold">SLA وقنوات الاتصال</p>
                    <p className="text-sm text-muted-foreground">
                      رد أول خلال {sla.responseHours} ساعة، تسليم خلال {sla.deliveryHours} ساعة،
                      استرجاع عند التأخر أكثر من {sla.refundWindowHours} ساعة.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {channels.chat && <Badge variant="outline">دردشة</Badge>}
                      {channels.voice && <Badge variant="outline">صوت/فيديو</Badge>}
                      {channels.inPerson && <Badge variant="outline">حضوري</Badge>}
                    </div>
                  </Card>
                </div>
              </section>

              {/* Certificates Upload */}
              <section>
                <h2 className="text-2xl font-bold mb-4">الشهادات والمستندات</h2>

                <div>
                  <Label htmlFor="certificates">
                    رفع الشهادات والمستندات (اختياري)
                  </Label>
                  <div className="mt-2">
                    <label
                      htmlFor="certificates"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold">
                            اضغط لرفع الملفات
                          </span>{" "}
                          أو اسحب وأفلت
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          PDF, PNG, JPG (حد أقصى {MAX_FILES} ملفات، {MAX_FILE_SIZE_MB}MB لكل ملف)
                        </p>
                      </div>
                      <input
                        id="certificates"
                        type="file"
                        className="hidden"
                        multiple
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleFileChange}
                      />
                    </label>

                    {formData.certificates &&
                      formData.certificates.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">
                            الملفات المرفوعة:
                          </p>
                          <ul className="space-y-1">
                            {formData.certificates.map((file, index) => (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground flex items-center gap-2"
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                                {file.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </div>
                </div>
              </section>

              {/* Agreements */}
              <section className="border-t pt-6">
                <h2 className="text-2xl font-bold mb-4">الإقرارات *</h2>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={agreements.terms}
                      onCheckedChange={checked =>
                        setAgreements({
                          ...agreements,
                          terms: checked as boolean,
                        })
                      }
                      required
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      أوافق على{" "}
                      <Link
                        href="/terms"
                        className="text-primary hover:underline"
                      >
                        الشروط والأحكام
                      </Link>{" "}
                      الخاصة بمنصة رابِط
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="privacy"
                      checked={agreements.privacy}
                      onCheckedChange={checked =>
                        setAgreements({
                          ...agreements,
                          privacy: checked as boolean,
                        })
                      }
                      required
                    />
                    <label
                      htmlFor="privacy"
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      أوافق على{" "}
                      <Link
                        href="/privacy"
                        className="text-primary hover:underline"
                      >
                        سياسة الخصوصية
                      </Link>{" "}
                      وأفهم كيفية استخدام بياناتي
                    </label>
                  </div>

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="cookies"
                      checked={agreements.cookies}
                      onCheckedChange={checked =>
                        setAgreements({
                          ...agreements,
                          cookies: checked as boolean,
                        })
                      }
                      required
                    />
                    <label
                      htmlFor="cookies"
                      className="text-sm leading-relaxed cursor-pointer"
                    >
                      أوافق على{" "}
                      <Link
                        href="/cookies-policy"
                        className="text-primary hover:underline"
                      >
                        سياسة الكوكيز
                      </Link>{" "}
                      واستخدام ملفات تعريف الارتباط
                    </label>
                  </div>
                </div>
              </section>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <Button
                  type="submit"
                  className="flex-1 gradient-primary text-white"
                  disabled={!canSubmit || isSubmitting}
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال طلب التسجيل"}
                </Button>

                <Link href="/">
                  <Button type="button" variant="outline">
                    إلغاء
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
