import { useEffect, useMemo, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSafeRichTextProps } from "@/lib/sanitize";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  CheckCircle2,
  Copy,
  Download,
  FileText,
  Loader2,
  RefreshCw,
  Save,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/routers";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type TemplateApiModel = RouterOutputs["documentGenerator"]["getTemplates"]["templates"][number];

type TemplateField = {
  key: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
};

type TemplateOption = {
  code: string;
  title: string;
  category?: string;
  description?: string;
  body?: string;
  placeholders: TemplateField[];
};

const FALLBACK_TEMPLATES: TemplateOption[] = [
  {
    code: "salary-letter",
    title: "خطاب تعريف بالراتب",
    category: "تعريف",
    body: `إلى من يهمه الأمر،

نفيدكم بأن الموظف {{employee_name}} يعمل لدينا في {{company_name}} بوظيفة {{job_title}} منذ {{start_date}} ويتقاضى راتباً شهرياً قدره {{salary}} ريال.

تحريراً في {{issue_date}}،
{{company_name}}`,
    placeholders: [
      { key: "employee_name", label: "اسم الموظف" },
      { key: "company_name", label: "اسم الشركة" },
      { key: "job_title", label: "المسمى الوظيفي" },
      { key: "start_date", label: "تاريخ البداية" },
      { key: "salary", label: "الراتب" },
      { key: "issue_date", label: "تاريخ الإصدار" },
    ],
  },
  {
    code: "offer-letter",
    title: "عرض وظيفي",
    category: "توظيف",
    body: `يسر {{company_name}} أن يقدم لكم عرض عمل لوظيفة {{job_title}} في قسم {{department}} براتب شهري {{salary}} ريال.

تاريخ المباشرة المتوقع: {{start_date}}
يرجى تأكيد قبول العرض خلال 5 أيام عمل.

مع خالص التحية،
فريق الموارد البشرية`,
    placeholders: [
      { key: "company_name", label: "اسم الشركة" },
      { key: "job_title", label: "المسمى الوظيفي" },
      { key: "department", label: "القسم" },
      { key: "salary", label: "الراتب" },
      { key: "start_date", label: "تاريخ المباشرة" },
    ],
  },
  {
    code: "experience-letter",
    title: "شهادة خبرة",
    category: "خبرة",
    body: `نشهد بأن السيد/السيدة {{employee_name}} عمل معنا في {{company_name}} بوظيفة {{job_title}} في الفترة من {{start_date}} حتى {{end_date}}.

خلال تلك المدة أظهر التزاماً ومهنية عالية.
تمنياتنا له بالتوفيق.

{{company_name}}`,
    placeholders: [
      { key: "employee_name", label: "اسم الموظف" },
      { key: "company_name", label: "اسم الشركة" },
      { key: "job_title", label: "المسمى الوظيفي" },
      { key: "start_date", label: "تاريخ البداية" },
      { key: "end_date", label: "تاريخ النهاية" },
    ],
  },
];

const DEFAULT_FIELDS: TemplateField[] = [
  { key: "employeeName", label: "اسم الموظف" },
  { key: "employeeId", label: "الرقم الوظيفي" },
  { key: "companyName", label: "اسم الشركة" },
  { key: "jobTitle", label: "المسمى الوظيفي" },
  { key: "department", label: "القسم" },
  { key: "startDate", label: "تاريخ البداية" },
  { key: "endDate", label: "تاريخ النهاية" },
  { key: "salary", label: "الراتب" },
  { key: "issueDate", label: "تاريخ الإصدار" },
];

/**
 * Helper to get label from parsed placeholder item
 */
function getPlaceholderLabel(item: Record<string, unknown>): string {
  if (typeof item?.label === "string") return item.label;
  if (typeof item?.key === "string") return item.key;
  return "حقل";
}

const parsePlaceholderSchema = (schema?: string | null): TemplateField[] => {
  if (!schema) return [];
  try {
    const parsed = typeof schema === "string" ? JSON.parse(schema) : schema;
    if (Array.isArray(parsed)) {
      return parsed
        .map((item: Record<string, unknown>) => ({
          key: typeof item?.key === "string" ? item.key : "",
          label: getPlaceholderLabel(item),
          placeholder: typeof item?.placeholder === "string" ? item.placeholder : undefined,
          required: typeof item?.required === "boolean" ? item.required : undefined,
          type: typeof item?.type === "string" ? item.type : undefined,
        }))
        .filter(field => field.key);
    }
    if (parsed && Array.isArray(parsed.fields)) {
      return (parsed.fields as Record<string, unknown>[])
        .map(field => ({
          key: typeof field?.key === "string" ? field.key : "",
          label: getPlaceholderLabel(field),
          placeholder:
            typeof field?.placeholder === "string" ? field.placeholder : undefined,
          required: typeof field?.required === "boolean" ? field.required : undefined,
          type: typeof field?.type === "string" ? field.type : undefined,
        }))
        .filter(field => field.key);
    }
  } catch (error) {
    console.warn("Invalid placeholders schema", error);
  }
  return [];
};

const normalizeTemplateRecord = (template: TemplateApiModel): TemplateOption => ({
  code: template.code,
  title:
    template.titleAr ||
    template.nameAr ||
    template.titleEn ||
    template.nameEn ||
    template.code,
  category: template.nameAr,
  description: template.description || undefined,
  body: template.content || undefined,
  placeholders:
    parsePlaceholderSchema(template.placeholdersSchema).length > 0
      ? parsePlaceholderSchema(template.placeholdersSchema)
      : DEFAULT_FIELDS,
});

const toSnakeCase = (value: string) =>
  value
    .replaceAll(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replaceAll(/[-\s]+/g, "_")
    .toLowerCase();

const applyVariablesToBody = (body: string, variables: Record<string, string>) => {
  return Object.entries(variables).reduce((acc, [key, rawValue]) => {
    const value = rawValue || `{{${key}}}`;
    const variants = Array.from(
      new Set([
        key,
        key.toLowerCase(),
        toSnakeCase(key),
        key.replaceAll("_", ""),
        toSnakeCase(key).replaceAll("_", ""),
      ])
    );
    return variants.reduce((result, token) => {
      const regex = new RegExp(`{{\\s*${token}\\s*}}`, "gi");
      return result.replaceAll(regex, value);
    }, acc);
  }, body);
};

type ToneType = "رسمي" | "شبه رسمي" | "ودي";
type StyleType = "formal" | "semi-formal" | "friendly";
type DocumentLanguage = "ar" | "en" | "both";

const toneToStyleMap: Record<ToneType, StyleType> = {
  رسمي: "formal",
  "شبه رسمي": "semi-formal",
  ودي: "friendly",
};

const languageLabelMap: Record<DocumentLanguage, string> = {
  ar: "العربية",
  en: "English",
  both: "ثنائي",
};

const isDocumentLanguage = (value: string): value is DocumentLanguage =>
  value === "ar" || value === "en" || value === "both";

const isToneOption = (value: string): value is "رسمي" | "شبه رسمي" | "ودي" =>
  value === "رسمي" || value === "شبه رسمي" || value === "ودي";

export default function DocumentGenerator() {
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<string>(FALLBACK_TEMPLATES[0]?.code || "");
  const [language, setLanguage] = useState<"ar" | "en" | "both">("ar");
  const [tone, setTone] = useState<"رسمي" | "شبه رسمي" | "ودي">("رسمي");
  const [includeStamp, setIncludeStamp] = useState(true);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewText, setPreviewText] = useState("");
  const [lastDocumentId, setLastDocumentId] = useState<number | null>(null);
  const [isLastDocumentSaved, setIsLastDocumentSaved] = useState(false);

  const templatesQuery = trpc.documentGenerator.getTemplates.useQuery(undefined, {
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (templatesQuery.error) {
      toast.error("تعذر تحميل القوالب، سيتم استخدام القوالب الافتراضية");
    }
  }, [templatesQuery.error]);

  const templates = useMemo(() => {
    if (templatesQuery.data?.templates?.length) {
      return templatesQuery.data.templates.map(normalizeTemplateRecord);
    }
    return FALLBACK_TEMPLATES;
  }, [templatesQuery.data]);

  useEffect(() => {
    if (!templates.length) return;
    setSelectedTemplate(prev => {
      if (prev && templates.some(t => t.code === prev)) {
        return prev;
      }
      return templates[0].code;
    });
  }, [templates]);

  const template = useMemo(
    () => templates.find(t => t.code === selectedTemplate) || templates[0],
    [selectedTemplate, templates]
  );

  const templateFields = useMemo(() => {
    if (template?.placeholders?.length) {
      return template.placeholders;
    }
    return DEFAULT_FIELDS;
  }, [template]);

  useEffect(() => {
    if (!templateFields.length) return;
    setVariables(prev => {
      const updated: Record<string, string> = {};
      for (const field of templateFields) {
        updated[field.key] = prev[field.key] || "";
      }
      return updated;
    });
  }, [templateFields]);

  useEffect(() => {
    setPreviewHtml("");
    setPreviewText("");
    setLastDocumentId(null);
    setIsLastDocumentSaved(false);
  }, [selectedTemplate]);

  const fallbackBody = useMemo(() => {
    if (template?.body) {
      return applyVariablesToBody(template.body, variables);
    }
    const filledVariables = Object.entries(variables)
      .filter(([, value]) => Boolean(value))
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n");
    if (filledVariables) {
      return filledVariables;
    }
    return "سيتم توليد المستند فور تعبئة الحقول والضغط على توليد";
  }, [template, variables]);

  const documentMutation = trpc.documentGenerator.generateDocument.useMutation({
    onSuccess: data => {
      setPreviewHtml(data.outputHtml || "");
      setPreviewText(data.outputText || "");
      setLastDocumentId(data.documentId ?? null);
      setIsLastDocumentSaved(false);
      toast.success("تم توليد المستند وحفظه في السجل");
    },
    onError: error => {
      toast.error(error.message || "فشل في توليد المستند، حاول مرة أخرى");
    },
  });

  const toggleSaveMutation = trpc.documentGenerator.toggleSaveDocument.useMutation({
    onSuccess: data => {
      setIsLastDocumentSaved(data.isSaved);
      toast.success(data.isSaved ? "تم حفظ المستند في مكتبتي" : "تمت إزالة المستند من المفضلة");
    },
    onError: error => {
      toast.error(error.message || "تعذر تحديث حالة الحفظ");
    },
  });

  const handleGenerate = async () => {
    if (!user) {
      toast.error("الرجاء تسجيل الدخول للاستفادة من مولد المستندات");
      return;
    }
    if (!template) {
      toast.error("لم يتم العثور على القالب");
      return;
    }
    const missingRequired = templateFields.filter(
      field => field.required && !variables[field.key]?.trim()
    );
    if (missingRequired.length) {
      toast.error(`يرجى تعبئة الحقول: ${missingRequired.map(f => f.label).join("، ")}`);
      return;
    }

    const inputData = {
      ...variables,
      notes,
      includeStamp,
      tone,
      language,
    };

    const companyName =
      variables.companyName ||
      variables.company_name ||
      variables["company"] ||
      undefined;

    await documentMutation.mutateAsync({
      templateCode: template.code,
      inputData,
      lang: language,
      style: toneToStyleMap[tone],
      companyName,
      companyLogo: includeStamp ? "auto-stamp" : undefined,
    });
  };

  const handleCopy = async () => {
    const contentToCopy = previewText || fallbackBody;
    if (!contentToCopy) {
      toast.info("لا يوجد نص لنسخه بعد");
      return;
    }
    await navigator.clipboard.writeText(contentToCopy);
    toast.success("تم نسخ المستند للحافظة");
  };

  const handleDownload = () => {
    const content = previewHtml || previewText || fallbackBody;
    if (!content) {
      toast.info("قم بتوليد المستند قبل التحميل");
      return;
    }
    const isHtml = Boolean(previewHtml);
    const blob = new Blob([previewHtml || content], {
      type: isHtml ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const safeTitle = (template?.title || "document").replaceAll(/[^a-zA-Z0-9\u0600-\u06FF]+/g, "-");
    link.download = `${safeTitle || "document"}.${isHtml ? "html" : "txt"}`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("تم تجهيز المستند للتحميل");
  };

  const handleSaveDocument = () => {
    if (!user) {
      toast.error("الرجاء تسجيل الدخول لحفظ المستندات");
      return;
    }
    if (!lastDocumentId) {
      toast.info("قم بتوليد المستند أولاً");
      return;
    }
    toggleSaveMutation.mutate({ documentId: lastDocumentId });
  };

  const askAI = () => {
    setAiSuggestion(
      `اقتراح: أضف فقرة توضح الغرض من المستند "${template?.title || "المستند"}" وتأكيد صحة البيانات.`
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-10 space-y-6">
        <div className="flex flex-col gap-3">
          <Badge className="w-fit">مولد المستندات الذكي</Badge>
          <h1 className="text-3xl font-bold text-slate-900">أنشئ مستندات جاهزة بثوانٍ</h1>
          <p className="text-muted-foreground max-w-2xl">
            اختر قالباً، املأ المتغيرات الأساسية، واحصل على مستند منسق مع خيار ختم إلكتروني
            وإدراج الشعار لاحقاً.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          {/* Form */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-600" />
                بيانات المستند
              </CardTitle>
              <CardDescription>املأ المعلومات الأساسية وسيتم توليد المستند فوراً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label>القالب</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => templatesQuery.refetch()}
                      disabled={templatesQuery.isFetching}
                    >
                      {templatesQuery.isFetching ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map(t => (
                        <SelectItem key={t.code} value={t.code}>
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>اللغة</Label>
                  <Select
                    value={language}
                    onValueChange={val => {
                      if (isDocumentLanguage(val)) {
                        setLanguage(val);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="both">ثنائي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>نبرة المستند</Label>
                  <Select
                    value={tone}
                    onValueChange={val => {
                      if (isToneOption(val)) {
                        setTone(val);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="رسمي">رسمي</SelectItem>
                      <SelectItem value="شبه رسمي">شبه رسمي</SelectItem>
                      <SelectItem value="ودي">ودي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>الختم والشعار</Label>
                  <Button
                    variant={includeStamp ? "default" : "outline"}
                    onClick={() => setIncludeStamp(prev => !prev)}
                    className="w-full"
                  >
                    {includeStamp ? "تضمين الختم" : "بدون ختم"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>ملاحظات إضافية</Label>
                  <Input
                    placeholder="مثال: نسخة للبنك"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templateFields.map(field => (
                  <div key={field.key} className="space-y-2">
                    <Label className="flex items-center justify-between">
                      <span>{field.label}</span>
                      {field.required && <span className="text-xs text-red-500">مطلوب</span>}
                    </Label>
                    {field.type === "textarea" ? (
                      <Textarea
                        rows={3}
                        placeholder={field.placeholder}
                        value={variables[field.key] || ""}
                        onChange={e =>
                          setVariables(prev => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    ) : (
                      <Input
                        placeholder={field.placeholder}
                        value={variables[field.key] || ""}
                        onChange={e =>
                          setVariables(prev => ({ ...prev, [field.key]: e.target.value }))
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-purple-600 to-blue-600"
                  disabled={documentMutation.isPending}
                >
                  {documentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 ml-2" />
                  )}
                  {documentMutation.isPending ? "جاري التوليد" : "توليد المستند"}
                </Button>
                <Button variant="outline" onClick={askAI}>
                  <Bot className="h-4 w-4 ml-2" />
                  اقتراح من الذكاء الاصطناعي
                </Button>
              </div>

              {aiSuggestion && (
                <div className="p-3 rounded-lg bg-blue-50 text-sm text-blue-900">
                  {aiSuggestion}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>معاينة المستند</CardTitle>
              <CardDescription>يمكنك النسخ أو التحميل أو الحفظ في مكتبتي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{template?.title}</Badge>
                <Badge variant="secondary">{tone}</Badge>
                <Badge variant="outline">{languageLabelMap[language]}</Badge>
                {includeStamp && <Badge className="bg-emerald-100 text-emerald-700">ختم إلكتروني</Badge>}
                {templatesQuery.isFetching && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> تحديث القوالب
                  </Badge>
                )}
              </div>
              <div className="rounded-xl border bg-white p-4 min-h-[260px] space-y-3">
                {previewHtml ? (
                  <div
                    className="prose prose-sm max-w-none rtl text-right"
                    dangerouslySetInnerHTML={createSafeRichTextProps(previewHtml)}
                  />
                ) : (
                  <pre className="whitespace-pre-wrap text-sm leading-6">{previewText || fallbackBody}</pre>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleCopy}>
                  <Copy className="h-4 w-4 ml-2" />
                  نسخ
                </Button>
                <Button variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 ml-2" />
                  تحميل PDF/Word
                </Button>
                <Button
                  variant={isLastDocumentSaved ? "default" : "outline"}
                  onClick={handleSaveDocument}
                  disabled={toggleSaveMutation.isPending}
                >
                  {toggleSaveMutation.isPending ? (
                    <Loader2 className="h-4 w-4 ml-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ml-2" />
                  )}
                  {isLastDocumentSaved ? "تم الحفظ" : "حفظ في مكتبتي"}
                </Button>
                <Button variant="ghost">
                  <CheckCircle2 className="h-4 w-4 ml-2" />
                  إرسال للمراجعة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
