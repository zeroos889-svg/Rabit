import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Award,
  BarChart3,
  User,
  Plus,
  Save,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface KPI {
  id: string;
  name: string;
  nameAr: string;
  target: number;
  actual: number;
  unit: string;
  trend: "up" | "down" | "stable";
  weight: number;
}

interface Goal {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  status: "pending" | "in-progress" | "completed" | "overdue";
  dueDate: Date;
  progress: number;
}

interface _PerformanceReview {
  id: string;
  period: string;
  overallRating: number;
  strengths: string[];
  improvements: string[];
  kpis: KPI[];
  goals: Goal[];
  managerComments: string;
  employeeComments: string;
  status: "draft" | "pending" | "completed";
}

interface Employee {
  id: string;
  name: string;
  nameAr: string;
  position: string;
  positionAr: string;
  department: string;
  departmentAr: string;
  avatar?: string;
}

// Mock Data
const MOCK_EMPLOYEE: Employee = {
  id: "1",
  name: "Ahmed Mohammed",
  nameAr: "أحمد محمد",
  position: "Senior Developer",
  positionAr: "مطور أول",
  department: "Technology",
  departmentAr: "التقنية",
};

const MOCK_KPIS: KPI[] = [
  {
    id: "1",
    name: "Tasks Completed",
    nameAr: "المهام المكتملة",
    target: 50,
    actual: 45,
    unit: "tasks",
    trend: "up",
    weight: 25,
  },
  {
    id: "2",
    name: "Code Quality Score",
    nameAr: "جودة الكود",
    target: 90,
    actual: 88,
    unit: "%",
    trend: "stable",
    weight: 20,
  },
  {
    id: "3",
    name: "Customer Satisfaction",
    nameAr: "رضا العملاء",
    target: 95,
    actual: 92,
    unit: "%",
    trend: "up",
    weight: 20,
  },
  {
    id: "4",
    name: "On-time Delivery",
    nameAr: "التسليم في الوقت المحدد",
    target: 100,
    actual: 85,
    unit: "%",
    trend: "down",
    weight: 20,
  },
  {
    id: "5",
    name: "Team Collaboration",
    nameAr: "التعاون الفريقي",
    target: 100,
    actual: 95,
    unit: "%",
    trend: "up",
    weight: 15,
  },
];

const MOCK_GOALS: Goal[] = [
  {
    id: "1",
    title: "Complete React Certification",
    titleAr: "إكمال شهادة React",
    description: "Obtain advanced React certification",
    descriptionAr: "الحصول على شهادة React المتقدمة",
    status: "completed",
    dueDate: new Date("2025-10-01"),
    progress: 100,
  },
  {
    id: "2",
    title: "Lead New Project",
    titleAr: "قيادة مشروع جديد",
    description: "Successfully lead the new mobile app project",
    descriptionAr: "قيادة مشروع تطبيق الجوال الجديد بنجاح",
    status: "in-progress",
    dueDate: new Date("2025-12-31"),
    progress: 60,
  },
  {
    id: "3",
    title: "Mentor Junior Developers",
    titleAr: "توجيه المطورين الجدد",
    description: "Mentor at least 2 junior developers",
    descriptionAr: "توجيه مطورين جدد على الأقل 2",
    status: "in-progress",
    dueDate: new Date("2025-12-31"),
    progress: 75,
  },
];

// Components
interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

function RatingStars({
  rating,
  maxRating = 5,
  onChange,
  readonly = false,
  size = "md",
}: RatingStarsProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxRating }).map((_, i) => (
        <button
          key={i}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(i + 1)}
          title={`تقييم ${i + 1} نجوم`}
          aria-label={`تقييم ${i + 1} نجوم`}
          className={cn(
            "transition-colors",
            !readonly && "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              sizeClasses[size],
              i < rating
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300 dark:text-gray-600"
            )}
          />
        </button>
      ))}
    </div>
  );
}

interface KPICardProps {
  kpi: KPI;
  isArabic: boolean;
}

function KPICard({ kpi, isArabic }: KPICardProps) {
  const percentage = Math.round((kpi.actual / kpi.target) * 100);
  const TrendIcon =
    kpi.trend === "up"
      ? TrendingUp
      : kpi.trend === "down"
      ? TrendingDown
      : Minus;
  const trendColor =
    kpi.trend === "up"
      ? "text-green-600"
      : kpi.trend === "down"
      ? "text-red-600"
      : "text-gray-500";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-medium text-sm">
              {isArabic ? kpi.nameAr : kpi.name}
            </h4>
            <Badge variant="outline" className="mt-1">
              {isArabic ? `الوزن: ${kpi.weight}%` : `Weight: ${kpi.weight}%`}
            </Badge>
          </div>
          <TrendIcon className={cn("h-5 w-5", trendColor)} />
        </div>
        <div className="mt-3">
          <div className="flex items-end justify-between mb-1">
            <span className="text-2xl font-bold">
              {kpi.actual}
              <span className="text-sm font-normal text-muted-foreground">
                /{kpi.target} {kpi.unit}
              </span>
            </span>
            <span
              className={cn(
                "text-sm font-medium",
                percentage >= 100
                  ? "text-green-600"
                  : percentage >= 80
                  ? "text-yellow-600"
                  : "text-red-600"
              )}
            >
              {percentage}%
            </span>
          </div>
          <Progress
            value={Math.min(percentage, 100)}
            className={cn(
              "h-2",
              percentage >= 100
                ? "[&>div]:bg-green-600"
                : percentage >= 80
                ? "[&>div]:bg-yellow-600"
                : "[&>div]:bg-red-600"
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
}

interface GoalItemProps {
  goal: Goal;
  isArabic: boolean;
}

function GoalItem({ goal, isArabic }: GoalItemProps) {
  const statusConfig = {
    pending: {
      icon: Clock,
      color: "text-gray-500 bg-gray-100 dark:bg-gray-800",
      label: isArabic ? "قيد الانتظار" : "Pending",
    },
    "in-progress": {
      icon: AlertCircle,
      color: "text-blue-500 bg-blue-100 dark:bg-blue-900/30",
      label: isArabic ? "جاري العمل" : "In Progress",
    },
    completed: {
      icon: CheckCircle2,
      color: "text-green-500 bg-green-100 dark:bg-green-900/30",
      label: isArabic ? "مكتمل" : "Completed",
    },
    overdue: {
      icon: AlertCircle,
      color: "text-red-500 bg-red-100 dark:bg-red-900/30",
      label: isArabic ? "متأخر" : "Overdue",
    },
  };

  const config = statusConfig[goal.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border">
      <div className={cn("p-2 rounded-lg", config.color)}>
        <StatusIcon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium">
            {isArabic ? goal.titleAr : goal.title}
          </h4>
          <Badge variant="outline" className="shrink-0">
            {config.label}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          {isArabic ? goal.descriptionAr : goal.description}
        </p>
        <div className="flex items-center gap-4 mt-2">
          <div className="flex-1">
            <Progress value={goal.progress} className="h-1.5" />
          </div>
          <span className="text-xs text-muted-foreground">{goal.progress}%</span>
        </div>
      </div>
    </div>
  );
}

// Main Component
interface PerformanceEvaluationProps {
  employeeId?: string;
}

export function PerformanceEvaluation({ employeeId: _employeeId }: PerformanceEvaluationProps) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [employee] = useState<Employee>(MOCK_EMPLOYEE);
  const [kpis] = useState<KPI[]>(MOCK_KPIS);
  const [goals] = useState<Goal[]>(MOCK_GOALS);
  const [overallRating, setOverallRating] = useState(4);
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    titleAr: "",
    description: "",
    descriptionAr: "",
    dueDate: "",
  });

  // Calculate overall KPI score
  const overallKPIScore = Math.round(
    kpis.reduce((acc, kpi) => {
      const score = (kpi.actual / kpi.target) * kpi.weight;
      return acc + score;
    }, 0)
  );

  const handleAddGoal = () => {
    // Add goal logic here
    setIsAddGoalOpen(false);
    setNewGoal({
      title: "",
      titleAr: "",
      description: "",
      descriptionAr: "",
      dueDate: "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">
                  {isArabic ? employee.nameAr : employee.name}
                </h2>
                <p className="text-muted-foreground">
                  {isArabic ? employee.positionAr : employee.position} •{" "}
                  {isArabic ? employee.departmentAr : employee.department}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <RatingStars
                    rating={overallRating}
                    onChange={setOverallRating}
                    size="sm"
                  />
                  <span className="text-sm text-muted-foreground">
                    ({overallRating}/5)
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <Badge variant="outline" className="mb-2">
                Q4 2025
              </Badge>
              <div className="flex items-center gap-2 text-2xl font-bold">
                <BarChart3 className="h-6 w-6 text-primary" />
                {overallKPIScore}%
              </div>
              <p className="text-sm text-muted-foreground">
                {isArabic ? "النتيجة الإجمالية" : "Overall Score"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="kpis">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="kpis" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            {isArabic ? "مؤشرات الأداء" : "KPIs"}
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            {isArabic ? "الأهداف" : "Goals"}
          </TabsTrigger>
          <TabsTrigger value="feedback" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            {isArabic ? "التقييم" : "Feedback"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpis" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {kpis.map((kpi) => (
              <KPICard key={kpi.id} kpi={kpi} isArabic={isArabic} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="mt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>
                  {isArabic ? "الأهداف والمعالم" : "Goals & Milestones"}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? "تتبع تقدم الأهداف الفردية والفريقية"
                    : "Track progress on individual and team goals"}
                </CardDescription>
              </div>
              <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 ms-2" />
                    {isArabic ? "إضافة هدف" : "Add Goal"}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {isArabic ? "إضافة هدف جديد" : "Add New Goal"}
                    </DialogTitle>
                    <DialogDescription>
                      {isArabic
                        ? "حدد هدفاً جديداً للموظف"
                        : "Define a new goal for the employee"}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label>{isArabic ? "العنوان" : "Title"}</Label>
                      <Input
                        value={newGoal.title}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, title: e.target.value })
                        }
                        placeholder={
                          isArabic ? "عنوان الهدف" : "Goal title"
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{isArabic ? "الوصف" : "Description"}</Label>
                      <Textarea
                        value={newGoal.description}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, description: e.target.value })
                        }
                        placeholder={
                          isArabic ? "وصف الهدف" : "Goal description"
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label>{isArabic ? "تاريخ الاستحقاق" : "Due Date"}</Label>
                      <Input
                        type="date"
                        value={newGoal.dueDate}
                        onChange={(e) =>
                          setNewGoal({ ...newGoal, dueDate: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddGoalOpen(false)}>
                      {isArabic ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button onClick={handleAddGoal}>
                      <Save className="h-4 w-4 ms-2" />
                      {isArabic ? "حفظ" : "Save"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {goals.map((goal) => (
                  <GoalItem key={goal.id} goal={goal} isArabic={isArabic} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="feedback" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? "نقاط القوة" : "Strengths"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {isArabic
                        ? "مهارات تقنية ممتازة وحل المشكلات"
                        : "Excellent technical skills and problem-solving"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {isArabic
                        ? "تعاون فريقي رائع وقيادة المبادرات"
                        : "Great team collaboration and initiative leadership"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                    <span>
                      {isArabic
                        ? "التزام قوي بالجودة والتوثيق"
                        : "Strong commitment to quality and documentation"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {isArabic ? "مجالات التحسين" : "Areas for Improvement"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <span>
                      {isArabic
                        ? "إدارة الوقت وتحديد الأولويات"
                        : "Time management and prioritization"}
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
                    <span>
                      {isArabic
                        ? "مهارات العرض والتقديم"
                        : "Presentation and public speaking skills"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>
                {isArabic ? "ملاحظات إضافية" : "Additional Comments"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">
                  {isArabic ? "ملاحظات المدير" : "Manager Comments"}
                </Label>
                <Textarea
                  placeholder={
                    isArabic
                      ? "أضف ملاحظاتك هنا..."
                      : "Add your comments here..."
                  }
                  rows={4}
                />
              </div>
              <div>
                <Label className="mb-2 block">
                  {isArabic ? "ملاحظات الموظف" : "Employee Comments"}
                </Label>
                <Textarea
                  placeholder={
                    isArabic
                      ? "أضف ردك هنا..."
                      : "Add your response here..."
                  }
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline">
                  {isArabic ? "حفظ كمسودة" : "Save Draft"}
                </Button>
                <Button>
                  <Save className="h-4 w-4 ms-2" />
                  {isArabic ? "إرسال التقييم" : "Submit Review"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PerformanceEvaluation;
