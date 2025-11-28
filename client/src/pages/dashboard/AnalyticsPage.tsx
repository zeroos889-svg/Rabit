import DashboardLayout from "@/components/DashboardLayout";
import { AnalyticsDashboard } from "@/components/analytics/AnalyticsDashboard";
import { HRKPIsDashboard } from "@/components/hr/HRKPIsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Target, TrendingUp, PieChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">التحليلات والإحصائيات</h1>
            <p className="text-muted-foreground mt-1">
              تتبع أداء الموارد البشرية واتخاذ قرارات مستنيرة
            </p>
          </div>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">نظرة عامة</span>
            </TabsTrigger>
            <TabsTrigger value="kpis" className="gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">المؤشرات</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">الاتجاهات</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">التقارير</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="kpis">
            <HRKPIsDashboard />
          </TabsContent>

          <TabsContent value="trends">
            <AnalyticsDashboard />
          </TabsContent>

          <TabsContent value="reports">
            <div className="text-center py-12 text-muted-foreground">
              <PieChart className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium">التقارير المخصصة</h3>
              <p>يمكنك إنشاء تقارير مخصصة من صفحة التقارير</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
