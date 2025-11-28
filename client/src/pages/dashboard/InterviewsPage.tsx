import DashboardLayout from "@/components/DashboardLayout";
import { InterviewScheduler } from "@/components/hr/InterviewScheduler";

export default function InterviewsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">جدولة المقابلات</h1>
            <p className="text-muted-foreground mt-1">
              إدارة وجدولة مقابلات التوظيف مع المرشحين
            </p>
          </div>
        </div>

        {/* Interview Scheduler Component */}
        <InterviewScheduler />
      </div>
    </DashboardLayout>
  );
}
