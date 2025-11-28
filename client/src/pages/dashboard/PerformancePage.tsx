import DashboardLayout from "@/components/DashboardLayout";
import { PerformanceEvaluation } from "@/components/hr/PerformanceEvaluation";

export default function PerformancePage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">تقييم الأداء</h1>
            <p className="text-muted-foreground mt-1">
              تقييم أداء الموظفين ومتابعة تحقيق الأهداف
            </p>
          </div>
        </div>

        {/* Performance Evaluation Component */}
        <PerformanceEvaluation />
      </div>
    </DashboardLayout>
  );
}
