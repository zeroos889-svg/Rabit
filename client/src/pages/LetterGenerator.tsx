import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  FileText,
  Sparkles,
  Download,
  Eye,
  Copy,
  Briefcase,
  Users,
  AlertTriangle,
  Award,
  Building2,
  Calendar,
  UserX,
  Wand2,
  ChevronLeft,
  History,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type LetterHistoryItem = RouterOutputs["letters"]["getHistory"]["letters"][number];
type LetterFormData = Record<string, string>;

interface LetterHistoryMetadata {
  formData?: LetterFormData;
  customPrompt?: string;
  selection?: {
    category?: string;
    letterId?: string;
  };
}

const HISTORY_LIMIT = 10;

const formatTimestamp = (value?: string | Date | null) => {
  if (!value) return "—";
  try {
    const date = typeof value === "string" ? new Date(value) : value;
    return date.toLocaleString("ar-SA", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return "—";
  }
};

const formatLanguageLabel = (lang?: string | null) => {
  if (!lang) return "";
  if (lang === "ar") return "العربية";
  if (lang === "en") return "الإنجليزية";
  if (lang === "both") return "ثنائي";
  return lang;
};

const parseLetterMetadata = (
  metadata?: Record<string, unknown> | null
): LetterHistoryMetadata => {
  if (!metadata) return {};
  const data = metadata as Record<string, unknown> & {
    formData?: LetterFormData;
    customPrompt?: string;
    selection?: Record<string, unknown> | null;
  };

  const selection =
    data.selection && typeof data.selection === "object"
      ? (data.selection as Record<string, unknown>)
      : undefined;

  const selectionCategory =
    selection && typeof selection.category === "string" ? (selection.category as string) : undefined;
  const selectionLetterId =
    selection && typeof selection.letterId === "string" ? (selection.letterId as string) : undefined;

  return {
    formData: typeof data.formData === "object" ? (data.formData as LetterFormData) : undefined,
    customPrompt: typeof data.customPrompt === "string" ? data.customPrompt : undefined,
    selection: selection
      ? {
          category: selectionCategory,
          letterId: selectionLetterId,
        }
      : undefined,
  };
};

// Letter Categories
const letterCategories = {
  employment: {
    icon: Briefcase,
    label: "خطابات التوظيف",
    color: "bg-blue-500",
    letters: [
      {
        id: "job_offer",
        label: "عرض توظيف",
        description: "خطاب عرض وظيفة لمرشح",
      },
      {
        id: "job_rejection",
        label: "رفض طلب توظيف",
        description: "إشعار برفض طلب التوظيف",
      },
      {
        id: "interview_invitation",
        label: "دعوة لمقابلة",
        description: "دعوة مرشح لإجراء مقابلة",
      },
      {
        id: "interview_cancellation",
        label: "إلغاء مقابلة",
        description: "إشعار بإلغاء موعد المقابلة",
      },
      {
        id: "appointment_letter",
        label: "خطاب تعيين",
        description: "خطاب رسمي بتعيين موظف جديد",
      },
      {
        id: "probation_completion",
        label: "إنهاء فترة تجريبية",
        description: "إشعار بإنهاء الفترة التجريبية بنجاح",
      },
      {
        id: "contract_renewal",
        label: "تجديد عقد",
        description: "خطاب تجديد عقد العمل",
      },
      {
        id: "contract_extension",
        label: "تمديد عقد",
        description: "خطاب تمديد مدة العقد",
      },
    ],
  },
  internal: {
    icon: Users,
    label: "خطابات داخلية",
    color: "bg-green-500",
    letters: [
      {
        id: "promotion",
        label: "ترقية موظف",
        description: "إشعار بترقية الموظف",
      },
      {
        id: "transfer",
        label: "نقل موظف",
        description: "خطاب نقل موظف لقسم آخر",
      },
      {
        id: "assignment",
        label: "تكليف بمهام",
        description: "تكليف موظف بمهام إضافية",
      },
      {
        id: "salary_increase",
        label: "زيادة راتب",
        description: "إشعار بزيادة الراتب",
      },
      {
        id: "allowance",
        label: "بدل إضافي",
        description: "خطاب منح بدل إضافي",
      },
      {
        id: "deduction",
        label: "خصم من الراتب",
        description: "إشعار بخصم من الراتب",
      },
      {
        id: "training",
        label: "تكليف بدورة تدريبية",
        description: "إشعار بالتسجيل في دورة تدريبية",
      },
      {
        id: "meeting_notice",
        label: "إشعار اجتماع",
        description: "دعوة لحضور اجتماع",
      },
      {
        id: "policy_update",
        label: "تحديث سياسة",
        description: "إشعار بتحديث سياسات الشركة",
      },
      {
        id: "performance_review",
        label: "تقييم أداء",
        description: "خطاب تقييم الأداء السنوي",
      },
      {
        id: "job_title_change",
        label: "تغيير مسمى وظيفي",
        description: "إشعار بتغيير المسمى الوظيفي",
      },
      {
        id: "department_change",
        label: "تحويل قسم",
        description: "خطاب تحويل لقسم آخر",
      },
    ],
  },
  disciplinary: {
    icon: AlertTriangle,
    label: "إجراءات تأديبية",
    color: "bg-red-500",
    letters: [
      {
        id: "warning_first",
        label: "إنذار أول",
        description: "إنذار كتابي أول للموظف",
      },
      {
        id: "warning_second",
        label: "إنذار ثاني",
        description: "إنذار كتابي ثاني للموظف",
      },
      {
        id: "warning_final",
        label: "إنذار نهائي",
        description: "إنذار نهائي قبل الفصل",
      },
      { id: "penalty", label: "جزاء", description: "خطاب جزاء على مخالفة" },
      {
        id: "suspension",
        label: "إيقاف عن العمل",
        description: "إشعار بالإيقاف المؤقت",
      },
    ],
  },
  certificates: {
    icon: Award,
    label: "شهادات وإفادات",
    color: "bg-purple-500",
    letters: [
      {
        id: "experience_certificate",
        label: "شهادة خبرة",
        description: "شهادة خبرة للموظف",
      },
      {
        id: "salary_certificate",
        label: "شهادة راتب",
        description: "شهادة راتب للبنك",
      },
      {
        id: "work_certificate",
        label: "شهادة عمل",
        description: "شهادة عمل للسفارة",
      },
      {
        id: "to_whom_it_may_concern",
        label: "لمن يهمه الأمر",
        description: "إفادة عامة",
      },
      {
        id: "employee_introduction",
        label: "تعريف بالموظف",
        description: "خطاب تعريف بموظف",
      },
      { id: "income_proof", label: "إثبات دخل", description: "إثبات دخل شهري" },
      {
        id: "no_objection",
        label: "عدم ممانعة",
        description: "خطاب عدم ممانعة",
      },
      {
        id: "recommendation",
        label: "توصية",
        description: "خطاب توصية للموظف",
      },
      {
        id: "clearance_internal",
        label: "إخلاء طرف داخلي",
        description: "إخلاء طرف من الأقسام",
      },
      {
        id: "appreciation",
        label: "شكر وتقدير",
        description: "خطاب شكر وتقدير",
      },
    ],
  },
  external: {
    icon: Building2,
    label: "خطابات خارجية",
    color: "bg-orange-500",
    letters: [
      {
        id: "bank_account",
        label: "فتح حساب بنكي",
        description: "خطاب للبنك لفتح حساب",
      },
      { id: "bank_loan", label: "طلب قرض", description: "خطاب للبنك لطلب قرض" },
      {
        id: "gosi",
        label: "التأمينات الاجتماعية",
        description: "خطاب للتأمينات",
      },
      {
        id: "labor_office",
        label: "مكتب العمل",
        description: "خطاب لمكتب العمل",
      },
      { id: "embassy", label: "السفارة", description: "خطاب للسفارة" },
      { id: "authorization", label: "تفويض", description: "خطاب تفويض رسمي" },
      { id: "guarantee", label: "خطاب ضمان", description: "خطاب ضمان بنكي" },
      {
        id: "inquiry_response",
        label: "رد على استفسار",
        description: "رد على استفسار خارجي",
      },
    ],
  },
  leave: {
    icon: Calendar,
    label: "إجازات وغياب",
    color: "bg-cyan-500",
    letters: [
      {
        id: "leave_approval",
        label: "موافقة على إجازة",
        description: "خطاب موافقة على طلب إجازة",
      },
      {
        id: "leave_rejection",
        label: "رفض إجازة",
        description: "خطاب رفض طلب إجازة",
      },
      {
        id: "leave_return",
        label: "عودة من إجازة",
        description: "إشعار بالعودة من الإجازة",
      },
      {
        id: "absence_warning",
        label: "إنذار غياب",
        description: "إنذار بسبب الغياب",
      },
      {
        id: "sick_leave_request",
        label: "طلب إجازة مرضية",
        description: "طلب إجازة مرضية بتقرير طبي",
      },
      {
        id: "unpaid_leave",
        label: "إجازة بدون راتب",
        description: "موافقة على إجازة بدون راتب",
      },
    ],
  },
  termination: {
    icon: UserX,
    label: "إنهاء الخدمة",
    color: "bg-gray-500",
    letters: [
      {
        id: "resignation_acceptance",
        label: "قبول استقالة",
        description: "خطاب قبول استقالة موظف",
      },
      {
        id: "termination",
        label: "إنهاء خدمة",
        description: "خطاب إنهاء خدمة موظف",
      },
      { id: "dismissal", label: "فصل", description: "خطاب فصل من العمل" },
      {
        id: "contract_end",
        label: "انتهاء عقد",
        description: "إشعار بانتهاء العقد",
      },
      {
        id: "final_clearance",
        label: "إخلاء طرف نهائي",
        description: "إخلاء طرف نهائي",
      },
      {
        id: "final_settlement",
        label: "تسوية نهائية",
        description: "خطاب التسوية النهائية",
      },
    ],
  },
};

const LETTER_STYLE_LABELS: Record<string, string> = {
  formal: "رسمي",
  "semi-formal": "شبه رسمي",
  friendly: "ودي",
};

const getLetterDefinitionById = (letterId?: string | null) => {
  if (!letterId) return undefined;
  for (const category of Object.values(letterCategories)) {
    const match = category.letters.find(letter => letter.id === letterId);
    if (match) {
      return match;
    }
  }
  return undefined;
};

const getLetterLabelById = (letterId?: string | null) => {
  if (!letterId) return "خطاب مخصص";
  return getLetterDefinitionById(letterId)?.label ?? "خطاب";
};

const getCategoryLabel = (key?: string | null) => {
  if (!key) return "مخصص";
  return letterCategories[key as keyof typeof letterCategories]?.label ?? key;
};

export default function LetterGenerator() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const historyQueryInput = { limit: HISTORY_LIMIT } as const;

  // State
  const [selectedCategory, setSelectedCategory] =
    useState<string>("employment");
  const [selectedLetter, setSelectedLetter] = useState<string>("");
  const [letterData, setLetterData] = useState<LetterFormData>({
    employeeName: "",
    employeeId: "",
    position: "",
    department: "",
    date: new Date().toISOString().split("T")[0],
    additionalInfo: "",
  });
  const [customPrompt, setCustomPrompt] = useState<string>("");
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [letterLanguage, setLetterLanguage] = useState<string>("ar");
  const [letterStyle, setLetterStyle] = useState<string>("formal");
  const [deletingLetterId, setDeletingLetterId] = useState<number | null>(null);

  const {
    data: letterHistoryData,
    isLoading: letterHistoryLoading,
    isFetching: letterHistoryFetching,
  } = trpc.letters.getHistory.useQuery(historyQueryInput, {
    enabled: isAuthenticated,
  });

  const saveLetterMutation = trpc.letters.saveLetter.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الخطاب في السجل");
      utils.letters.getHistory.invalidate(historyQueryInput);
    },
    onError: () => {
      toast.error("تعذر حفظ الخطاب في السجل");
    },
  });

  const deleteLetterMutation = trpc.letters.deleteLetter.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الخطاب من السجل");
    },
    onError: () => {
      toast.error("تعذر حذف الخطاب");
    },
    onSettled: () => {
      utils.letters.getHistory.invalidate(historyQueryInput);
      setDeletingLetterId(null);
    },
  });

  const letterHistory = letterHistoryData?.letters ?? [];
  const isHistoryLoading = letterHistoryLoading && isAuthenticated;
  const isHistoryRefreshing = letterHistoryFetching && !letterHistoryLoading;

  const handleGenerateLetter = async () => {
    if (!selectedLetter && !customPrompt) {
      toast.error("يرجى اختيار نوع الخطاب أو كتابة طلب مخصص");
      return;
    }

    setIsGenerating(true);
    toast.info("جاري إنشاء الخطاب...");

    try {
      // Simulate AI generation (will be connected to real API)
      await new Promise(resolve => setTimeout(resolve, 2000));

      const sampleLetter = `
بسم الله الرحمن الرحيم

التاريخ: ${new Date(letterData.date).toLocaleDateString("ar-SA")}
الرقم: ${letterData.employeeId || "XXX/2025"}

السيد/ة: ${letterData.employeeName || "[اسم الموظف]"}
المسمى الوظيفي: ${letterData.position || "[المسمى الوظيفي]"}
القسم: ${letterData.department || "[القسم]"}

السلام عليكم ورحمة الله وبركاته،

الموضوع: ${getLetterTitle()}

نود إفادتكم بأنه تم ${getLetterAction()} وذلك اعتباراً من تاريخه.

${letterData.additionalInfo ? `\n${letterData.additionalInfo}\n` : ""}

نتمنى لكم التوفيق والنجاح.

وتفضلوا بقبول فائق الاحترام والتقدير.


إدارة الموارد البشرية
[اسم الشركة]
[ختم الشركة]
      `.trim();

      setGeneratedLetter(sampleLetter);
      handleSaveLetterHistory(sampleLetter);
      toast.success("تم إنشاء الخطاب بنجاح");
    } catch (error) {
      console.error("Generation Error:", error);
      toast.error("حدث خطأ في إنشاء الخطاب");
    } finally {
      setIsGenerating(false);
    }
  };

  const getLetterTitle = (): string => {
    if (!selectedLetter) return "خطاب مخصص";

    for (const category of Object.values(letterCategories)) {
      const letter = category.letters.find(l => l.id === selectedLetter);
      if (letter) return letter.label;
    }
    return "خطاب";
  };

  const getLetterAction = (): string => {
    // This will be enhanced with AI
    return "اتخاذ الإجراء المطلوب";
  };

  const handleCopyLetter = () => {
    if (!generatedLetter) {
      toast.info("لا يوجد خطاب لنسخه بعد");
      return;
    }
    navigator.clipboard.writeText(generatedLetter);
    toast.success("تم نسخ الخطاب");
  };

  const handleDownloadPDF = () => {
    toast.info("ميزة التصدير قيد التطوير");
  };

  const getCurrentCategory = () => {
    return letterCategories[selectedCategory as keyof typeof letterCategories];
  };

  const CategoryIcon = getCurrentCategory()?.icon || FileText;

  const handleSaveLetterHistory = (content: string) => {
    if (!isAuthenticated) {
      toast.info("سجل الدخول لحفظ الخطابات في السجل");
      return;
    }

    saveLetterMutation.mutate({
      letterType: selectedLetter || "custom",
      title: getLetterTitle(),
      category: selectedCategory,
      language: letterLanguage,
      style: letterStyle,
      content,
      metadata: {
        formData: letterData,
        customPrompt,
        selection: {
          category: selectedCategory,
          letterId: selectedLetter,
        },
      },
    });
  };

  const handleLoadLetterFromHistory = (entry: LetterHistoryItem) => {
    setGeneratedLetter(entry.content);
    if (entry.language) {
      setLetterLanguage(entry.language);
    }
    if (entry.style) {
      setLetterStyle(entry.style);
    }

    const metadata = parseLetterMetadata(entry.metadata ?? undefined);
    if (metadata.selection?.category) {
      setSelectedCategory(metadata.selection.category);
    } else if (entry.category) {
      setSelectedCategory(entry.category);
    }

    if (metadata.selection?.letterId) {
      setSelectedLetter(metadata.selection.letterId);
    } else if (entry.letterType) {
      setSelectedLetter(entry.letterType);
    }

    if (metadata.formData) {
      setLetterData(prev => ({ ...prev, ...metadata.formData }));
    }

    if (metadata.customPrompt) {
      setCustomPrompt(metadata.customPrompt);
    }

    toast.success("تم تحميل الخطاب من السجل");
  };

  const handleCopyHistoryLetter = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("تم نسخ الخطاب من السجل");
  };

  const handleDeleteHistoryLetter = (letterId: number) => {
    if (!isAuthenticated) {
      toast.info("سجل الدخول لإدارة سجل الخطابات");
      return;
    }
    setDeletingLetterId(letterId);
    deleteLetterMutation.mutate({ letterId });
  };

  const handleRefreshHistory = () => {
    if (!isAuthenticated) return;
    utils.letters.getHistory.invalidate(historyQueryInput);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4">
      <div className="container max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl text-white">
                <FileText className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  مولد الخطابات
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-purple-500" />
                  أكثر من 55 نوع خطاب جاهز - مدعوم بالذكاء الاصطناعي
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Categories & Letters */}
          <div className="lg:col-span-1 space-y-4">
            {/* Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الفئات</CardTitle>
                <CardDescription>اختر فئة الخطاب</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.entries(letterCategories).map(([key, category]) => {
                  const Icon = category.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => {
                        setSelectedCategory(key);
                        setSelectedLetter("");
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                        selectedCategory === key
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg ${selectedCategory === key ? "bg-white/20" : category.color} text-white`}
                      >
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-right">
                        <div className="font-semibold text-sm">
                          {category.label}
                        </div>
                        <div
                          className={`text-xs ${selectedCategory === key ? "text-white/80" : "text-muted-foreground"}`}
                        >
                          {category.letters.length} خطاب
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* AI Custom Generator */}
                <button
                  onClick={() => {
                    setSelectedCategory("custom");
                    setSelectedLetter("");
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                    selectedCategory === "custom"
                      ? "bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg"
                      : "bg-gradient-to-r from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200"
                  }`}
                >
                  <div
                    className={`p-2 rounded-lg ${selectedCategory === "custom" ? "bg-white/20" : "bg-purple-500"} text-white`}
                  >
                    <Wand2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="font-semibold text-sm">
                      مولد مخصص بالذكاء الاصطناعي
                    </div>
                    <div
                      className={`text-xs ${selectedCategory === "custom" ? "text-white/80" : "text-purple-700"}`}
                    >
                      اكتب طلبك بحرية
                    </div>
                  </div>
                </button>
              </CardContent>
            </Card>

            {/* Letter Types */}
            {selectedCategory !== "custom" && (
              <Card className="max-h-[600px] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CategoryIcon className="h-5 w-5" />
                    {getCurrentCategory()?.label}
                  </CardTitle>
                  <CardDescription>اختر نوع الخطاب</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {getCurrentCategory()?.letters.map(letter => (
                    <button
                      key={letter.id}
                      onClick={() => setSelectedLetter(letter.id)}
                      className={`w-full text-right p-3 rounded-lg transition-all ${
                        selectedLetter === letter.id
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <div className="font-semibold text-sm">
                        {letter.label}
                      </div>
                      <div
                        className={`text-xs ${selectedLetter === letter.id ? "text-white/80" : "text-muted-foreground"}`}
                      >
                        {letter.description}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Panel - Form & Preview */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCategory === "custom" ? (
              // Custom AI Generator
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wand2 className="h-5 w-5 text-purple-500" />
                    مولد مخصص بالذكاء الاصطناعي
                  </CardTitle>
                  <CardDescription>
                    اكتب طلبك بحرية وسيقوم الذكاء الاصطناعي بصياغة الخطاب
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom-prompt">اكتب طلبك</Label>
                    <Textarea
                      id="custom-prompt"
                      placeholder="مثال: اكتب خطاب شكر لموظف متميز حصل على جائزة أفضل موظف للشهر..."
                      value={customPrompt}
                      onChange={e => setCustomPrompt(e.target.value)}
                      rows={6}
                      className="resize-none"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>اللغة</Label>
                      <Select
                        value={letterLanguage}
                        onValueChange={setLetterLanguage}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ar">العربية</SelectItem>
                          <SelectItem value="en">الإنجليزية</SelectItem>
                          <SelectItem value="both">ثنائي اللغة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>الأسلوب</Label>
                      <Select
                        value={letterStyle}
                        onValueChange={setLetterStyle}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="formal">رسمي</SelectItem>
                          <SelectItem value="semi-formal">شبه رسمي</SelectItem>
                          <SelectItem value="friendly">ودي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerateLetter}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
                    disabled={!customPrompt.trim() || isGenerating}
                  >
                    <Sparkles className="h-4 w-4 ml-2" />
                    {isGenerating
                      ? "جاري الإنشاء..."
                      : "إنشاء الخطاب بالذكاء الاصطناعي"}
                  </Button>
                </CardContent>
              </Card>
            ) : (
              // Standard Letter Form
              <>
                {selectedLetter && (
                  <Card>
                    <CardHeader>
                      <CardTitle>معلومات الخطاب</CardTitle>
                      <CardDescription>
                        أدخل البيانات المطلوبة لإنشاء الخطاب
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="employee-name">اسم الموظف *</Label>
                          <Input
                            id="employee-name"
                            placeholder="مثال: أحمد محمد"
                            value={letterData.employeeName}
                            onChange={e =>
                              setLetterData({
                                ...letterData,
                                employeeName: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="employee-id">رقم الموظف</Label>
                          <Input
                            id="employee-id"
                            placeholder="مثال: 12345"
                            value={letterData.employeeId}
                            onChange={e =>
                              setLetterData({
                                ...letterData,
                                employeeId: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="position">المسمى الوظيفي *</Label>
                          <Input
                            id="position"
                            placeholder="مثال: مدير مبيعات"
                            value={letterData.position}
                            onChange={e =>
                              setLetterData({
                                ...letterData,
                                position: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="department">القسم</Label>
                          <Input
                            id="department"
                            placeholder="مثال: المبيعات"
                            value={letterData.department}
                            onChange={e =>
                              setLetterData({
                                ...letterData,
                                department: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="date">التاريخ</Label>
                          <Input
                            id="date"
                            type="date"
                            value={letterData.date}
                            onChange={e =>
                              setLetterData({
                                ...letterData,
                                date: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>اللغة</Label>
                          <Select
                            value={letterLanguage}
                            onValueChange={setLetterLanguage}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="ar">العربية</SelectItem>
                              <SelectItem value="en">الإنجليزية</SelectItem>
                              <SelectItem value="both">ثنائي اللغة</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additional-info">معلومات إضافية</Label>
                        <Textarea
                          id="additional-info"
                          placeholder="أي معلومات إضافية تريد إضافتها للخطاب..."
                          value={letterData.additionalInfo}
                          onChange={e =>
                            setLetterData({
                              ...letterData,
                              additionalInfo: e.target.value,
                            })
                          }
                          rows={4}
                        />
                      </div>

                      <Button
                        onClick={handleGenerateLetter}
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                        disabled={
                          !letterData.employeeName ||
                          !letterData.position ||
                          isGenerating
                        }
                      >
                        <Sparkles className="h-4 w-4 ml-2" />
                        {isGenerating ? "جاري الإنشاء..." : "إنشاء الخطاب"}
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Preview */}
            {generatedLetter && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      معاينة الخطاب
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLetter}
                      >
                        <Copy className="h-4 w-4 ml-2" />
                        نسخ
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPDF}
                      >
                        <Download className="h-4 w-4 ml-2" />
                        تصدير PDF
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-8 min-h-[600px] font-serif">
                    <pre className="whitespace-pre-wrap text-right leading-relaxed">
                      {generatedLetter}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Empty State */}
            {!selectedLetter && selectedCategory !== "custom" && (
              <Card className="border-dashed border-2">
                <CardContent className="py-16 text-center">
                  <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    اختر نوع الخطاب
                  </h3>
                  <p className="text-muted-foreground">
                    اختر فئة ونوع الخطاب من القائمة اليمنى للبدء
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="mt-10">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5 text-blue-600" />
                  سجل الخطابات الأخيرة
                </CardTitle>
                <CardDescription>
                  يتم حفظ آخر {HISTORY_LIMIT} خطابات تم توليدها لكل مستخدم
                </CardDescription>
              </div>
              {isAuthenticated && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshHistory}
                  disabled={isHistoryRefreshing}
                >
                  {isHistoryRefreshing ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 ml-2" />
                  )}
                  تحديث
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {!isAuthenticated ? (
                <div className="p-6 text-center text-muted-foreground">
                  قم بتسجيل الدخول لحفظ الخطابات والوصول إلى السجل الشخصي.
                </div>
              ) : isHistoryLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(key => (
                    <div key={key} className="h-24 rounded-2xl bg-muted/70 animate-pulse" />
                  ))}
                </div>
              ) : letterHistory.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  لم يتم حفظ أي خطابات بعد. قم بإنشاء خطاب جديد وسيظهر هنا تلقائياً.
                </div>
              ) : (
                <div className="space-y-4">
                  {letterHistory.map((entry: LetterHistoryItem) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border bg-white/40 p-4 shadow-sm backdrop-blur"
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="font-semibold text-base">
                              {entry.title || getLetterLabelById(entry.letterType)}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(entry.createdAt)}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            {entry.category && (
                              <Badge variant="outline">{getCategoryLabel(entry.category)}</Badge>
                            )}
                            {entry.language && (
                              <Badge variant="secondary">
                                {formatLanguageLabel(entry.language)}
                              </Badge>
                            )}
                            {entry.style && (
                              <Badge variant="outline">
                                {LETTER_STYLE_LABELS[entry.style] || entry.style}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground max-h-24 overflow-hidden">
                            {entry.content}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-2 md:w-60">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleLoadLetterFromHistory(entry)}
                          >
                            <Eye className="h-4 w-4 ml-2" />
                            عرض
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopyHistoryLetter(entry.content)}
                          >
                            <Copy className="h-4 w-4 ml-2" />
                            نسخ
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteHistoryLetter(entry.id)}
                            disabled={deletingLetterId === entry.id && deleteLetterMutation.isPending}
                          >
                            {deletingLetterId === entry.id && deleteLetterMutation.isPending ? (
                              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 ml-2" />
                            )}
                            حذف
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
