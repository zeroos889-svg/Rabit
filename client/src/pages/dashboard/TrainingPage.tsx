import DashboardLayout from "@/components/DashboardLayout";
import { TrainingManagement } from "@/components/hr/TrainingManagement";

export default function TrainingPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إدارة التدريب</h1>
            <p className="text-muted-foreground mt-1">
              إدارة الدورات التدريبية وتطوير مهارات الموظفين
            </p>
          </div>
        </div>

        {/* Training Management Component */}
        <TrainingManagement />
      </div>
    </DashboardLayout>
  );
}
