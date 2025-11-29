/**
 * AI Performance Evaluator Page
 * صفحة تقييم الأداء بالذكاء الاصطناعي
 */

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Loader2, Brain, TrendingUp, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { withCsrfHeader } from "@/lib/csrf";

const evaluationSchema = z.object({
  employeeId: z.number(),
  employeeName: z.string().min(1, "الاسم مطلوب"),
  position: z.string().min(1, "المسمى الوظيفي مطلوب"),
  department: z.string().min(1, "القسم مطلوب"),
  joiningDate: z.string(),
  reviewPeriod: z.string(),
  attendanceRate: z.number().min(0).max(100),
  taskCompletionRate: z.number().min(0).max(100),
  qualityScore: z.number().min(0).max(100),
  teamworkScore: z.number().min(0).max(100),
  initiativeScore: z.number().min(0).max(100),
  communicationScore: z.number().min(0).max(100),
  punctualityScore: z.number().min(0).max(100),
  achievements: z.string().optional(),
  challenges: z.string().optional(),
  goals: z.string().optional(),
  managerNotes: z.string().optional(),
  currentSalary: z.number().optional(),
});

type EvaluationForm = z.infer<typeof evaluationSchema>;

interface EvaluationResult {
  overallScore: number;
  rating: string;
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
  salaryRecommendation?: string;
}

export default function AIPerformanceEvaluator() {
  const [isLoading, setIsLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<EvaluationForm>({
    resolver: zodResolver(evaluationSchema),
    defaultValues: {
      employeeId: 1,
      employeeName: "",
      position: "",
      department: "",
      joiningDate: new Date().toISOString().split("T")[0],
      reviewPeriod: "2024 Q4",
      attendanceRate: 95,
      taskCompletionRate: 90,
      qualityScore: 85,
      teamworkScore: 90,
      initiativeScore: 80,
      communicationScore: 85,
      punctualityScore: 95,
    },
  });

  const onSubmit = async (data: EvaluationForm) => {
    setIsLoading(true);
    setError(null);
    setEvaluation(null);

    try {
      // Call the AI evaluation endpoint
      const response = await fetch("/api/ai/evaluate-performance", {
        method: "POST",
        headers: withCsrfHeader({
          "Content-Type": "application/json",
        }),
        body: JSON.stringify({
          ...data,
          metrics: {
            attendanceRate: data.attendanceRate,
            taskCompletionRate: data.taskCompletionRate,
            qualityScore: data.qualityScore,
            teamworkScore: data.teamworkScore,
            initiativeScore: data.initiativeScore,
            communicationScore: data.communicationScore,
            punctualityScore: data.punctualityScore,
          },
          achievements: data.achievements?.split("\n").filter(Boolean),
          challenges: data.challenges?.split("\n").filter(Boolean),
          goals: data.goals?.split("\n").filter(Boolean),
          language: "ar",
        }),
      });

      if (!response.ok) {
        throw new Error("فشل في تقييم الأداء");
      }

      const result = (await response.json()) as EvaluationResult;
      setEvaluation(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "حدث خطأ غير متوقع");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl" dir="rtl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-primary" />
          تقييم الأداء بالذكاء الاصطناعي
        </h1>
        <p className="text-muted-foreground">
          استخدم الذكاء الاصطناعي لتقييم أداء الموظفين وتقديم توصيات مخصصة
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">بيانات التقييم</h2>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم الموظف</FormLabel>
                    <FormControl>
                      <Input placeholder="أحمد محمد" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>المسمى الوظيفي</FormLabel>
                    <FormControl>
                      <Input placeholder="مطور برمجيات" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>القسم</FormLabel>
                    <FormControl>
                      <Input placeholder="تقنية المعلومات" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="joiningDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاريخ التوظيف</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="reviewPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>فترة التقييم</FormLabel>
                      <FormControl>
                        <Input placeholder="2024 Q4" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-3 border-t pt-4">
                <h3 className="font-medium">معدلات الأداء</h3>

                <FormField
                  control={form.control}
                  name="attendanceRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معدل الحضور: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          max={100}
                          step={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="taskCompletionRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>معدل إنجاز المهام: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          max={100}
                          step={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualityScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>جودة العمل: {field.value}%</FormLabel>
                      <FormControl>
                        <Slider
                          value={[field.value]}
                          onValueChange={(vals) => field.onChange(vals[0])}
                          max={100}
                          step={1}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الإنجازات (سطر لكل إنجاز)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أكمل مشروع X في الموعد&#10;حسّن الأداء بنسبة 20%"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>الراتب الحالي (اختياري)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="15000"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : undefined
                          )
                        }
                        value={field.value || ""}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="me-2 h-4 w-4 animate-spin" />
                    جاري التقييم...
                  </>
                ) : (
                  <>
                    <Brain className="me-2 h-4 w-4" />
                    تقييم الأداء
                  </>
                )}
              </Button>
            </form>
          </Form>
        </Card>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {evaluation && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                نتيجة التقييم
              </h2>

              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">التقييم الإجمالي</span>
                    <span className="text-2xl font-bold text-primary">
                      {evaluation.overallScore}/100
                    </span>
                  </div>
                  <div className="bg-primary/10 p-3 rounded">
                    <p className="font-semibold text-lg">{evaluation.rating}</p>
                  </div>
                </div>

                {evaluation.strengths && evaluation.strengths.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-green-600">
                      نقاط القوة
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {evaluation.strengths.map((strength: string, idx: number) => (
                        <li key={idx} className="text-sm">
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {evaluation.weaknesses && evaluation.weaknesses.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2 text-orange-600">
                      نقاط التحسين
                    </h3>
                    <ul className="list-disc list-inside space-y-1">
                      {evaluation.weaknesses.map(
                        (weakness: string, idx: number) => (
                          <li key={idx} className="text-sm">
                            {weakness}
                          </li>
                        )
                      )}
                    </ul>
                  </div>
                )}

                {evaluation.recommendations &&
                  evaluation.recommendations.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2 text-blue-600">
                        التوصيات
                      </h3>
                      <ul className="list-disc list-inside space-y-1">
                        {evaluation.recommendations.map(
                          (rec: string, idx: number) => (
                            <li key={idx} className="text-sm">
                              {rec}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  )}

                {evaluation.salaryRecommendation && (
                  <div className="bg-blue-50 p-4 rounded mt-4">
                    <h3 className="font-semibold mb-2">توصية الراتب</h3>
                    <p className="text-sm">{evaluation.salaryRecommendation}</p>
                  </div>
                )}
              </div>
            </Card>
          )}

          {!evaluation && !error && (
            <Card className="p-12 text-center text-muted-foreground">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>املأ النموذج واضغط على "تقييم الأداء" لبدء التحليل</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
