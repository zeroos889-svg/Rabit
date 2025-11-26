/**
 * AI Document Generator Component
 * مولد المستندات الذكي المتقدم
 */

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Bot,
  Sparkles,
  Loader2,
  CheckCircle2,
  Copy,
  RefreshCw,
  Wand2,
  FileText,
  Lightbulb,
} from "lucide-react";
import { toast } from "sonner";

interface AIDocumentGeneratorProps {
  templateType?: string;
  variables?: Record<string, string>;
  onGenerate: (content: string) => void;
  language?: "ar" | "en";
}

export default function AIDocumentGenerator({
  templateType,
  variables = {},
  onGenerate,
  language = "ar",
}: AIDocumentGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [tone, setTone] = useState<"formal" | "semi-formal" | "friendly">("formal");
  const [generatedContent, setGeneratedContent] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const isArabic = language === "ar";

  // Document types
  const documentTypes = isArabic
    ? [
        { value: "salary-letter", label: "خطاب تعريف بالراتب" },
        { value: "offer-letter", label: "عرض وظيفي" },
        { value: "experience-letter", label: "شهادة خبرة" },
        { value: "termination-letter", label: "خطاب إنهاء خدمات" },
        { value: "warning-letter", label: "خطاب إنذار" },
        { value: "promotion-letter", label: "خطاب ترقية" },
        { value: "contract", label: "عقد عمل" },
        { value: "policy", label: "سياسة داخلية" },
        { value: "memo", label: "مذكرة داخلية" },
        { value: "certificate", label: "شهادة تقدير" },
      ]
    : [
        { value: "salary-letter", label: "Salary Certificate" },
        { value: "offer-letter", label: "Job Offer" },
        { value: "experience-letter", label: "Experience Certificate" },
        { value: "termination-letter", label: "Termination Letter" },
        { value: "warning-letter", label: "Warning Letter" },
        { value: "promotion-letter", label: "Promotion Letter" },
        { value: "contract", label: "Employment Contract" },
        { value: "policy", label: "Internal Policy" },
        { value: "memo", label: "Internal Memo" },
        { value: "certificate", label: "Certificate of Appreciation" },
      ];

  // Tone options
  const toneOptions = isArabic
    ? [
        { value: "formal", label: "رسمي جداً" },
        { value: "semi-formal", label: "شبه رسمي" },
        { value: "friendly", label: "ودي" },
      ]
    : [
        { value: "formal", label: "Very Formal" },
        { value: "semi-formal", label: "Semi-formal" },
        { value: "friendly", label: "Friendly" },
      ];

  // Generate document with AI
  const handleGenerate = async () => {
    if (!templateType && !customPrompt) {
      toast.error(
        isArabic
          ? "الرجاء اختيار نوع المستند أو كتابة وصف"
          : "Please select document type or write a description"
      );
      return;
    }

    setIsGenerating(true);
    setSuggestions([]);

    try {
      // Call AI generation API
      const response = await fetch("/api/ai/generate-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateType,
          variables,
          customPrompt,
          tone,
          language,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate document");

      const data = await response.json();

      setGeneratedContent(data.content || "");
      setSuggestions(data.suggestions || []);

      toast.success(
        isArabic ? "تم توليد المستند بنجاح" : "Document generated successfully"
      );
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error(
        isArabic
          ? "حدث خطأ في توليد المستند"
          : "An error occurred generating the document"
      );

      // Fallback generated content
      setGeneratedContent(
        isArabic
          ? `إلى من يهمه الأمر،

نفيد بأن ${variables.employee_name || "الموظف"} يعمل لدى ${variables.company_name || "الشركة"} بوظيفة ${variables.job_title || "الوظيفة"}.

تحريراً في ${new Date().toLocaleDateString("ar-SA")}

مع التحية،
${variables.company_name || "الشركة"}`
          : `To Whom It May Concern,

We certify that ${variables.employee_name || "the employee"} works at ${variables.company_name || "the company"} as ${variables.job_title || "position"}.

Issued on ${new Date().toLocaleDateString("en-US")}

Best regards,
${variables.company_name || "Company"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Apply generated content
  const handleApply = () => {
    if (generatedContent) {
      onGenerate(generatedContent);
      setIsOpen(false);
      toast.success(
        isArabic ? "تم تطبيق المحتوى المولد" : "Generated content applied"
      );
    }
  };

  // Copy content
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast.success(
      isArabic ? "تم نسخ المحتوى بنجاح" : "Content copied successfully"
    );
  };

  // Regenerate
  const handleRegenerate = () => {
    handleGenerate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
          <Wand2 className="h-4 w-4" />
          {isArabic ? "توليد بالذكاء الاصطناعي" : "Generate with AI"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
              <Bot className="h-5 w-5 text-white" />
            </div>
            {isArabic ? "مولد المستندات الذكي" : "AI Document Generator"}
          </DialogTitle>
          <DialogDescription>
            {isArabic
              ? "استخدم الذكاء الاصطناعي لتوليد مستندات احترافية في ثوانٍ"
              : "Use AI to generate professional documents in seconds"}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          {/* Configuration Panel */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="doc-type" className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4" />
                {isArabic ? "نوع المستند" : "Document Type"}
              </Label>
              <Select defaultValue={templateType}>
                <SelectTrigger id="doc-type">
                  <SelectValue
                    placeholder={
                      isArabic ? "اختر نوع المستند" : "Select document type"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {documentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="tone" className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4" />
                {isArabic ? "نبرة الكتابة" : "Writing Tone"}
              </Label>
              <Select value={tone} onValueChange={(v: any) => setTone(v)}>
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {toneOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="prompt" className="flex items-center gap-2 mb-2">
                <Lightbulb className="h-4 w-4" />
                {isArabic ? "تعليمات إضافية (اختياري)" : "Additional Instructions"}
              </Label>
              <Textarea
                id="prompt"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder={
                  isArabic
                    ? "اكتب أي تعليمات إضافية للمستند..."
                    : "Write any additional instructions..."
                }
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Variables Preview */}
            {Object.keys(variables).length > 0 && (
              <div>
                <Label className="mb-2 block">
                  {isArabic ? "البيانات المستخدمة" : "Data Used"}
                </Label>
                <div className="p-3 bg-muted rounded-lg space-y-1 text-sm">
                  {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground">{key}:</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isArabic ? "جاري التوليد..." : "Generating..."}
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4" />
                  {isArabic ? "توليد المستند" : "Generate Document"}
                </>
              )}
            </Button>
          </div>

          {/* Preview Panel */}
          <div className="flex flex-col">
            <Label className="mb-2">
              {isArabic ? "معاينة المستند" : "Document Preview"}
            </Label>

            <ScrollArea className="flex-1 border rounded-lg p-4 bg-muted/30 min-h-[400px]">
              {generatedContent ? (
                <div className="space-y-4">
                  <div className="whitespace-pre-wrap text-sm">
                    {generatedContent}
                  </div>

                  {suggestions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <p className="text-xs font-medium mb-2 text-muted-foreground">
                          {isArabic ? "اقتراحات للتحسين:" : "Suggestions:"}
                        </p>
                        <div className="space-y-2">
                          {suggestions.map((suggestion) => (
                            <div
                              key={suggestion}
                              className="flex items-start gap-2 text-xs"
                            >
                              <Lightbulb className="h-3 w-3 text-amber-500 mt-0.5" />
                              <span>{suggestion}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                  <Bot className="h-16 w-16 mb-4 opacity-20" />
                  <p>
                    {isArabic
                      ? "قم بتكوين المستند واضغط على توليد"
                      : "Configure the document and click generate"}
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Actions */}
            {generatedContent && (
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  className="gap-2"
                >
                  <Copy className="h-3 w-3" />
                  {isArabic ? "نسخ" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerate}
                  className="gap-2"
                >
                  <RefreshCw className="h-3 w-3" />
                  {isArabic ? "إعادة توليد" : "Regenerate"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleApply}
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600"
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {isArabic ? "تطبيق المحتوى" : "Apply Content"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
