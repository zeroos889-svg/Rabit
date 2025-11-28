import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calendar,
  Clock,
  FileText,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  AlertCircle,
  BadgeCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export default function ConsultingBookingNew() {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(1);

  // Form data
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);
  const [selectedConsultantId, setSelectedConsultantId] = useState<
    number | null
  >(null);
  const [subject, setSubject] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [description, setDescription] = useState("");
  const [requiredInfo, setRequiredInfo] = useState<Record<string, string>>({});
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ name: string; url: string; type: string }>
  >([]);
  const [aiConsent, setAiConsent] = useState(true);
  const [savedPackage, setSavedPackage] = useState<{
    id?: number;
    name?: string;
    price?: number;
    slaHours?: number | null;
  } | null>(null);

  // Queries
  const { data: typesData, isLoading: loadingTypes } =
    trpc.consultant.getConsultationTypes.useQuery();
  const { data: consultantsData, isLoading: loadingConsultants } =
    trpc.consultant.getApprovedConsultants.useQuery(undefined, {
      enabled: step >= 2,
    });

  const uploadFileMutation = trpc.consultant.uploadFile.useMutation();
  const createBookingMutation = trpc.consultant.createBooking.useMutation();

  const selectedType = typesData?.types?.find(
    (t: any) => t.id === selectedTypeId
  );
  const selectedConsultant = consultantsData?.consultants?.find(
    (c: any) => c.id === selectedConsultantId
  );
  const summaryPrice =
    savedPackage?.price ??
    selectedType?.basePriceSAR ??
    selectedType?.price ??
    0;
  const summarySla = savedPackage?.slaHours ?? selectedType?.slaHours ?? 24;
  const summaryPackageName =
    savedPackage?.name || selectedType?.nameAr || "استشارة الموارد البشرية";
  const bookingSubject =
    summaryPackageName +
    " - " +
    (subject || selectedType?.nameAr || "استشارة الموارد البشرية");

  const estimatedDelivery = useMemo(() => {
    if (!selectedDate || !selectedTime || !summarySla) return null;
    const [h, m] = selectedTime.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    const dt = new Date(selectedDate);
    dt.setHours(h, m, 0, 0);
    dt.setHours(dt.getHours() + summarySla);
    return dt.toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }, [selectedDate, selectedTime, summarySla]);

  // Preselect consultant/type if passed via query param or saved preference
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("consultantId");
    const tid = params.get("typeId") || localStorage.getItem("rabit-preferred-type");
    const pkg = localStorage.getItem("rabit-consulting-package");
    const lastConsultant = localStorage.getItem("rabit-last-consultant");
    const lastSlot = localStorage.getItem("rabit-last-slot");
    if (cid) {
      setSelectedConsultantId(Number(cid));
      setStep(2);
    }
    if (lastConsultant && !cid) {
      const asNumber = Number(lastConsultant);
      if (!Number.isNaN(asNumber)) {
        setSelectedConsultantId(asNumber);
      }
    }
    if (tid) {
      const asNumber = Number(tid);
      if (!Number.isNaN(asNumber)) {
        setSelectedTypeId(asNumber);
      }
    }
    if (lastSlot) {
      try {
        const parsed = JSON.parse(lastSlot);
        setSelectedDate(parsed.date || "");
        setSelectedTime(parsed.time || "");
      } catch {
        /* ignore */
      }
    }
    if (pkg) {
      try {
        setSavedPackage(JSON.parse(pkg));
      } catch {
        setSavedPackage(null);
      }
    }
  }, []);

  // Parse required documents and info
  const requiredDocuments = Array.isArray(selectedType?.requiredDocuments)
    ? selectedType?.requiredDocuments
    : selectedType?.requiredDocuments
      ? JSON.parse(selectedType.requiredDocuments)
      : [];
  const requiredInfoFields = Array.isArray(selectedType?.requiredInfo)
    ? selectedType?.requiredInfo
    : selectedType?.requiredInfo
      ? JSON.parse(selectedType.requiredInfo)
      : [];

  // Handle file upload
  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    docType: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 10 ميجابايت");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const result = await uploadFileMutation.mutateAsync({
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
        });

        setUploadedFiles(prev => [
          ...prev,
          {
            name: docType,
            url: result.url,
            type: file.type,
          },
        ]);

        toast.success(`تم رفع ${docType} بنجاح`);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast.error("فشل رفع الملف");
    }
  };

  // Handle booking submission
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error("يجب تسجيل الدخول أولاً");
      navigate("/login");
      return;
    }

    if (
      !selectedTypeId ||
      !selectedConsultantId ||
      !selectedDate ||
      !selectedTime
    ) {
      toast.error("يرجى إكمال جميع الحقول المطلوبة");
      return;
    }

    // Validate required info fields
    const missingInfo = requiredInfoFields.filter(
      (field: { required?: boolean; nameAr: string }) => field.required && !requiredInfo[field.nameAr]
    );
    if (missingInfo.length > 0) {
      toast.error(
        t(
          "consulting.requiredInfoMissing",
          `يرجى تعبئة الحقول المطلوبة: ${missingInfo.map((f: { nameAr: string }) => f.nameAr).join(", ")}`
        )
      );
      return;
    }

    // Validate required documents
    const missingDocs = requiredDocuments.filter(
      (doc: { required?: boolean; nameAr: string }) => doc.required && !uploadedFiles.some(f => f.name === doc.nameAr)
    );
    if (missingDocs.length > 0) {
      toast.error(
        t(
          "consulting.requiredDocsMissing",
          `يرجى رفع المستندات المطلوبة: ${missingDocs.map((d: { nameAr: string }) => d.nameAr).join(", ")}`
        )
      );
      return;
    }

    try {
      const combinedRequiredInfo = {
        ...requiredInfo,
        aiConsent,
        ...(savedPackage ? { selectedPackage: savedPackage } : {}),
      };

      const result = await createBookingMutation.mutateAsync({
        consultationTypeId: selectedTypeId,
        consultantId: selectedConsultantId,
        scheduledDate: selectedDate,
        scheduledTime: selectedTime,
        description,
        subject: bookingSubject,
        requiredInfo: JSON.stringify(combinedRequiredInfo),
        attachments: JSON.stringify(uploadedFiles),
        packageName: savedPackage?.name,
        packagePrice: savedPackage?.price,
        packageSlaHours: savedPackage?.slaHours ?? undefined,
      });

      toast.success("تم حجز الاستشارة بنجاح!");
      navigate(`/consultation/${result.bookingId}`);
    } catch (error: any) {
      toast.error(error.message || "فشل حجز الاستشارة");
    }
  };

  // Generate available times
  const availableTimes = [
    "09:00",
    "10:00",
    "11:00",
    "12:00",
    "14:00",
    "15:00",
    "16:00",
    "17:00",
    "18:00",
    "19:00",
    "20:00",
  ];

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split("T")[0];

  // Persist preferred type when user changes it
  useEffect(() => {
    if (selectedTypeId) {
      localStorage.setItem("rabit-preferred-type", String(selectedTypeId));
    }
  }, [selectedTypeId]);

  useEffect(() => {
    if (selectedConsultantId) {
      localStorage.setItem("rabit-last-consultant", String(selectedConsultantId));
    }
  }, [selectedConsultantId]);

  useEffect(() => {
    if (selectedDate && selectedTime) {
      localStorage.setItem(
        "rabit-last-slot",
        JSON.stringify({ date: selectedDate, time: selectedTime })
      );
    }
  }, [selectedDate, selectedTime]);

  if (loadingTypes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
        <div className="container max-w-4xl">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12">
      <div className="container max-w-4xl">
        <Card className="mb-6 border-indigo-200 bg-white shadow-sm">
          <CardContent className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="h-12 w-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-indigo-900">مساعد DeepSeek الذكي</h3>
                <p className="text-sm text-muted-foreground">
                  سننشئ ملخصاً تلقائياً من معلومات الحجز والمرفقات لتصل للمستشار قبل الجلسة، مع اقتراح ردود أثناء المحادثة.
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-indigo-700 border-indigo-200 bg-indigo-50">
              يلتزم بالخصوصية وـSLA
            </Badge>
          </CardContent>
        </Card>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= s
                      ? "bg-purple-600 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step > s ? <CheckCircle2 className="h-5 w-5" /> : s}
                </div>
                {s < 4 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step > s ? "bg-purple-600" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span
              className={
                step >= 1 ? "text-purple-600 font-medium" : "text-gray-500"
              }
            >
              نوع الاستشارة
            </span>
            <span
              className={
                step >= 2 ? "text-purple-600 font-medium" : "text-gray-500"
              }
            >
              المستشار
            </span>
            <span
              className={
                step >= 3 ? "text-purple-600 font-medium" : "text-gray-500"
              }
            >
              الموعد والمتطلبات
            </span>
            <span
              className={
                step >= 4 ? "text-purple-600 font-medium" : "text-gray-500"
              }
            >
              التأكيد
            </span>
          </div>
        </div>

        {savedPackage && (
          <Card className="mb-6 border-green-200 bg-green-50/80">
            <CardContent className="py-4 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-green-800">
                      {savedPackage.name || "باقة استشارية"}
                    </p>
                    {typeof savedPackage.price === "number" && (
                      <Badge variant="secondary" className="bg-white text-green-700">
                        {savedPackage.price} ريال
                      </Badge>
                    )}
                  </div>
                  {savedPackage.slaHours ? (
                    <p className="text-sm text-green-700">
                      SLA {savedPackage.slaHours} ساعة • لن يتم تحصيل الدفع الآن
                    </p>
                  ) : (
                    <p className="text-sm text-green-700">لن يتم تحصيل الدفع الآن</p>
                  )}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("rabit-consulting-package");
                  setSavedPackage(null);
                }}
              >
                إزالة
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="p-8">
          {/* Step 1: Select Consultation Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Briefcase className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold">اختر نوع الاستشارة</h2>
                <p className="text-muted-foreground">
                  حدد نوع الاستشارة التي تحتاجها
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {typesData?.types?.map((type: any) => (
                  <Card
                    key={type.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                      selectedTypeId === type.id
                        ? "border-2 border-purple-600 bg-purple-50"
                        : ""
                    }`}
                    onClick={() => setSelectedTypeId(type.id)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{type.nameAr}</h3>
                      {selectedTypeId === type.id && (
                        <CheckCircle2 className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {type.descriptionAr}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-purple-600">
                        {type.price} ريال
                      </span>
                      <div className="text-right">
                        <span className="block text-sm text-muted-foreground">
                          {type.duration} دقيقة
                        </span>
                        <span className="block text-xs text-green-600">
                          SLA: {type.slaHours || 24} ساعة
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setStep(2)}
                  disabled={!selectedTypeId}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  التالي
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Select Consultant */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <User className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold">اختر المستشار</h2>
                <p className="text-muted-foreground">حدد المستشار المناسب لك</p>
              </div>

              {loadingConsultants ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {consultantsData?.consultants?.map((consultant: any) => (
                    <Card
                      key={consultant.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                        selectedConsultantId === consultant.id
                          ? "border-2 border-purple-600 bg-purple-50"
                          : ""
                      }`}
                      onClick={() => setSelectedConsultantId(consultant.id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-8 w-8 text-purple-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-bold">
                                {consultant.fullNameAr}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {consultant.yearsOfExperience} سنوات خبرة
                              </p>
                              <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                {consultant.mainSpecialization && (
                                  <Badge variant="secondary">{consultant.mainSpecialization}</Badge>
                                )}
                                {consultant.secondarySpecialization && (
                                  <Badge variant="outline">{consultant.secondarySpecialization}</Badge>
                                )}
                              </div>
                            </div>
                            {selectedConsultantId === consultant.id && (
                              <CheckCircle2 className="h-5 w-5 text-purple-600" />
                            )}
                          </div>
                          <p className="text-sm mt-2 line-clamp-2">
                            {consultant.bioAr}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-amber-500" />
                              <span>
                                {consultant.rating ??
                                  consultant.averageRating ??
                                  consultant.avgRating ??
                                  "جديد"}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              <span>
                                {(consultant.consultations ||
                                  consultant.completedConsultations ||
                                  consultant.totalBookings ||
                                  0) + " استشارة"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="flex justify-between">
                <Button onClick={() => setStep(1)} variant="outline">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  السابق
                </Button>
                <Button
                  onClick={() => setStep(3)}
                  disabled={!selectedConsultantId}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  التالي
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Date, Time & Requirements */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold">الموعد والمتطلبات</h2>
                <p className="text-muted-foreground">
                  حدد الموعد وأرفق المستندات المطلوبة
                </p>
              </div>

              {/* Date & Time */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>التاريخ *</Label>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={e => setSelectedDate(e.target.value)}
                    min={minDateStr}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>الوقت *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="اختر الوقت" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTimes.map(time => (
                        <SelectItem key={time} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded-lg border bg-white/70 p-3 text-sm text-muted-foreground flex items-start gap-2">
                <Clock className="h-4 w-4 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">زمن الاستجابة والتسليم</p>
                  <p>
                    رد أولي متوقع خلال{" "}
                    <strong>{summarySla <= 24 ? "90 دقيقة" : `${Math.min(summarySla, 24)} ساعة`}</strong>{" "}
                    حسب الباقة، وتسليم نهائي وفق {summarySla} ساعة SLA. سنرسل تذكيراً قبل الموعد، مع تنبيه للمستشار إذا اقترب وقت التسليم.
                  </p>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label>عنوان مختصر</Label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="مثال: مراجعة عقد عمل لموظف جديد"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>وصف المشكلة أو الاستفسار *</Label>
                <Textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="اشرح بالتفصيل ما تحتاج مساعدة فيه..."
                  rows={4}
                  className="mt-1"
                />
              </div>

              {/* Required Info Fields */}
              {requiredInfoFields.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    معلومات مطلوبة
                  </h3>
                  {requiredInfoFields.map((field: any, index: number) => (
                    <div key={index}>
                      <Label>
                        {field.nameAr} {field.required && "*"}
                      </Label>
                      {field.type === "textarea" ? (
                        <Textarea
                          value={requiredInfo[field.nameAr] || ""}
                          onChange={e =>
                            setRequiredInfo(prev => ({
                              ...prev,
                              [field.nameAr]: e.target.value,
                            }))
                          }
                          placeholder={field.nameAr}
                          rows={3}
                          className="mt-1"
                        />
                      ) : field.type === "select" && field.options ? (
                        <Select
                          value={requiredInfo[field.nameAr] || ""}
                          onValueChange={value =>
                            setRequiredInfo(prev => ({
                              ...prev,
                              [field.nameAr]: value,
                            }))
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder={`اختر ${field.nameAr}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option: string) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={field.type}
                          value={requiredInfo[field.nameAr] || ""}
                          onChange={e =>
                            setRequiredInfo(prev => ({
                              ...prev,
                              [field.nameAr]: e.target.value,
                            }))
                          }
                          placeholder={field.nameAr}
                          className="mt-1"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Required Documents */}
              {requiredDocuments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    المستندات المطلوبة
                  </h3>
                  {requiredDocuments.map((doc: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <Label className="text-base">
                            {doc.nameAr}{" "}
                            {doc.required && (
                              <span className="text-red-500">*</span>
                            )}
                          </Label>
                          <p className="text-sm text-muted-foreground mt-1">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                      <Input
                        type="file"
                        onChange={e => handleFileUpload(e, doc.nameAr)}
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        className="mt-2"
                      />
                      {uploadedFiles.find(f => f.name === doc.nameAr) && (
                        <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                          <CheckCircle2 className="h-4 w-4" />
                          تم الرفع بنجاح
                        </div>
                      )}
                    </div>
                  ))}
                  {uploadedFiles.length > 0 && (
                    <div className="rounded-lg border border-dashed p-3 bg-white/60">
                      <p className="text-sm font-semibold mb-2">المرفقات المرفوعة</p>
                      <div className="space-y-2">
                        {uploadedFiles.map(file => (
                          <div key={file.name} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="h-4 w-4 text-green-500" />
                              <span>{file.name}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-red-600"
                              onClick={() =>
                                setUploadedFiles(prev =>
                                  prev.filter(f => !(f.name === file.name && f.url === file.url))
                                )
                              }
                            >
                              إزالة
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedConsultant && selectedType && (
                <Card className="border-primary/20 bg-white/80">
                  <CardContent className="py-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">معلومات مختصرة</p>
                        <p className="text-lg font-bold">{selectedConsultant.fullNameAr}</p>
                        <p className="text-sm text-muted-foreground">
                          خبرة {selectedConsultant.yearsOfExperience || "-"} سنة • {selectedType.nameAr}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary">SLA {summarySla} ساعة</Badge>
                        <Badge variant="secondary">
                          {selectedType.duration || selectedType.estimatedDuration || 30} دقيقة
                        </Badge>
                        <Badge variant="secondary">
                          {(summaryPrice || 0).toLocaleString()} ريال
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="rounded-lg border bg-white/70 p-4 text-sm text-muted-foreground flex gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <p className="font-semibold text-foreground">ماذا يحدث بعد الحجز؟</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>يُنشئ مساعد DeepSeek ملخصاً من وصفك والمرفقات ليصل للمستشار قبل الموعد.</li>
                    <li>نرسل تذكيراً بالموعد ونضبط التنبيهات حسب الـ SLA الخاص بالباقة.</li>
                    <li>تأكيد السعر لن يتم تحصيله الآن؛ يتم التثبيت بعد مراجعة المستشار.</li>
                  </ul>
                </div>
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(2)} variant="outline">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  السابق
                </Button>
                <Button
                  onClick={() => setStep(4)}
                  disabled={!selectedDate || !selectedTime || !description}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  التالي
                  <ArrowRight className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <CheckCircle2 className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h2 className="text-2xl font-bold">تأكيد الحجز</h2>
                <p className="text-muted-foreground">
                  راجع تفاصيل حجزك قبل التأكيد
                </p>
              </div>

              <div className="space-y-4">
                <Card className="p-4 bg-purple-50">
                  <h3 className="font-bold mb-3">ملخص الحجز</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        نوع الاستشارة:
                      </span>
                      <span className="font-medium">
                        {bookingSubject}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المستشار:</span>
                      <span className="font-medium">
                        {selectedConsultant?.fullNameAr}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">التاريخ:</span>
                      <span className="font-medium">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">الوقت:</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المدة:</span>
                      <span className="font-medium">
                        {selectedType?.estimatedDuration || selectedType?.duration} دقيقة
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SLA:</span>
                      <span className="font-medium">{summarySla} ساعة</span>
                    </div>
                    {savedPackage && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الباقة:</span>
                        <span className="font-medium">{summaryPackageName}</span>
                      </div>
                    )}
                    {!savedPackage && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">الباقة:</span>
                        <span className="font-medium">أساسي</span>
                      </div>
                    )}
                    <div className="border-t pt-2 mt-2 flex justify-between text-lg">
                      <span className="font-bold">الإجمالي:</span>
                      <span className="font-bold text-purple-600">
                        {summaryPrice} ريال
                      </span>
                    </div>
                    {savedPackage && (
                      <div className="text-xs text-green-700 mt-1">
                        سيتم تطبيق باقة {savedPackage.name} دون تحصيل فوري
                      </div>
                    )}
                    {!savedPackage && (
                      <div className="text-xs text-blue-700 mt-1">
                        لم تختر باقة محددة؛ سيتم تأكيد السعر بعد مراجعة الاستشارة.
                      </div>
                    )}
                    {estimatedDelivery && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">تسليم متوقع:</span>
                        <span className="font-medium">{estimatedDelivery}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">المرفقات المرفوعة:</span>
                      <span className="font-medium">
                        {uploadedFiles.length > 0 ? `${uploadedFiles.length} ملف` : "لا يوجد"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">مساعد AI للمستشار:</span>
                      <Badge variant="secondary" className="bg-white text-purple-700 border-purple-100">
                        {aiConsent ? "مفعل" : "معطل"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      نعتمد على DeepSeek لتوليد ملخص من وصفك والمرفقات (يُشارك مع المستشار فقط) لتسريع الجودة والالتزام بالوقت.
                    </p>
                  </div>
                </Card>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">
                      ملاحظة مهمة
                    </p>
                    <p className="text-blue-700">
                      سيتم التواصل معك عبر لوحة الاستشارة بعد التأكيد. يرجى
                      متابعة الرسائل بانتظام. لن يتم تحصيل الدفع الآن. سيتم تأكيد
                      السعر والبنود عند مراجعة الباقة المختارة.
                    </p>
                  </div>
                </div>

                <Card className="border-muted">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="ai-consent"
                        checked={aiConsent}
                        onCheckedChange={checked => setAiConsent(Boolean(checked))}
                      />
                      <div>
                        <label htmlFor="ai-consent" className="font-medium">
                          أوافق على استخدام المساعد الذكي لإعداد المستشار
                        </label>
                        <p className="text-sm text-muted-foreground">
                          نستخدم بيانات هذا الحجز والمرفقات لإنشاء ملخص داخلي للمستشار فقط. يمكنك تعطيل المساعد، لكن قد يؤثر ذلك على سرعة الرد.
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      بالمتابعة، أنت موافق على معالجة بياناتك وفق{" "}
                      <Link href="/privacy" className="text-purple-700 underline">
                        سياسة الخصوصية
                      </Link>{" "}
                      وسياسات حماية البيانات المعتمدة لدينا.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex justify-between">
                <Button onClick={() => setStep(3)} variant="outline">
                  <ArrowLeft className="ml-2 h-4 w-4" />
                  السابق
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={createBookingMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {createBookingMutation.isPending
                    ? "جاري الحجز..."
                    : "تأكيد الحجز"}
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
