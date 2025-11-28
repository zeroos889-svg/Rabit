import { Suspense, lazy, useCallback, useEffect, useMemo, useState, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock3,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Mail,
  MessageCircle,
  MoreVertical,
  PhoneCall,
  Plus,
  RefreshCcw,
  ScrollText,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  Trash2,
  TrendingDown,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { MetricCard } from "@/components/design/MetricCard";

const AddEmployeeDialog = lazy(() => import("./components/AddEmployeeDialog"));

type EmployeeSegmentId = "all" | "active" | "on-leave";

interface Employee {
  id: number;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  startDate: string;
  salary: number;
  status: "active" | "on-leave" | "terminated";
  avatar?: string;
}

const employeeDemoExperienceIds = ["automation", "self-service"] as const;
type EmployeeDemoExperienceId = (typeof employeeDemoExperienceIds)[number];

type DemoExperienceContent = {
  title: string;
  description: string;
  checklist: string[];
  actionLabel: string;
  focusTargetId?: string;
};

const useEmployeeDemoExperience = (isArabic: boolean) => {
  const [experience, setExperience] = useState<EmployeeDemoExperienceId | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const locationRef = globalThis.location;
    if (!locationRef) return;

    const params = new globalThis.URLSearchParams(locationRef.search ?? "");
    const experienceParam = params.get("experience");

    if (
      experienceParam &&
      employeeDemoExperienceIds.includes(experienceParam as EmployeeDemoExperienceId)
    ) {
      setExperience(experienceParam as EmployeeDemoExperienceId);
      setShowBanner(true);
      globalThis.history?.replaceState?.({}, "", locationRef.pathname ?? "/");
    } else {
      setExperience(null);
      setShowBanner(false);
    }
  }, []);

  const activeContent = useMemo<DemoExperienceContent | null>(() => {
    if (!experience) {
      return null;
    }

    const contentMap: Record<EmployeeDemoExperienceId, DemoExperienceContent> = {
      automation: {
        title: isArabic ? "أتمتة إجراءات الموظفين" : "Automate Employee Tasks",
        description: isArabic
          ? "استخدم البحث السريع والفلاتر الذكية للعثور على الملفات الشخصية وتحديثها خلال ثوانٍ"
          : "Use rapid search and smart filters to locate and update employee records in seconds",
        checklist: isArabic
          ? [
              "استخدم البحث السريع للعثور على الموظف",
              "قم بتصفية النتائج حسب القسم",
              "استعرض الإجراءات الجاهزة",
            ]
          : [
              "Use quick search to find an employee",
              "Filter results by department",
              "Review the ready-to-run actions",
            ],
        actionLabel: isArabic ? "ابدأ البحث الآن" : "Start with search",
        focusTargetId: "employee-search",
      },
      "self-service": {
        title: isArabic ? "تجربة الخدمة الذاتية" : "Self-Service Experience",
        description: isArabic
          ? "تعرّف على كيفية إعداد القوالب وإشعارات الأقسام لدعم الطلبات الذاتية"
          : "See how templated actions and department alerts keep self-service moving",
        checklist: isArabic
          ? [
              "جرّب تصفية الأقسام",
              "افتح قائمة الإجراءات",
              "تابع التحديثات في الوقت الحقيقي",
            ]
          : [
              "Try the department filters",
              "Open the bulk actions menu",
              "Track real-time updates",
            ],
        actionLabel: isArabic ? "عرض الأقسام" : "View departments",
        focusTargetId: "department-filter",
      },
    };

    return contentMap[experience];
  }, [experience, isArabic]);

  const focusTarget = useCallback(() => {
    if (!activeContent?.focusTargetId) {
      return;
    }

    const target = document.getElementById(activeContent.focusTargetId);
    const HtmlElement = globalThis.HTMLElement;
    if (HtmlElement && target instanceof HtmlElement) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeContent]);

  const dismiss = useCallback(() => {
    setShowBanner(false);
    setExperience(null);
  }, []);

  return { activeContent, showBanner: showBanner && !!activeContent, focusTarget, dismiss };
};

const mockEmployees: Employee[] = [
  {
    id: 1,
    name: "أحمد محمد السعيد",
    email: "ahmed.mohammed@company.com",
    phone: "0501234567",
    position: "مدير تقني",
    department: "تقنية المعلومات",
    startDate: "2022-01-15",
    salary: 18000,
    status: "active",
  },
  {
    id: 2,
    name: "فاطمة علي الحارثي",
    email: "fatima.ali@company.com",
    phone: "0507654321",
    position: "محاسبة رئيسية",
    department: "المالية",
    startDate: "2021-06-20",
    salary: 15000,
    status: "active",
  },
  {
    id: 3,
    name: "خالد عبدالله القحطاني",
    email: "khaled.abdullah@company.com",
    phone: "0551234567",
    position: "مطور برمجيات",
    department: "تقنية المعلومات",
    startDate: "2023-03-10",
    salary: 12000,
    status: "active",
  },
  {
    id: 4,
    name: "نورة سعيد العتيبي",
    email: "noura.saeed@company.com",
    phone: "0559876543",
    position: "مديرة موارد بشرية",
    department: "الموارد البشرية",
    startDate: "2020-09-01",
    salary: 16000,
    status: "on-leave",
  },
  {
    id: 5,
    name: "محمد فهد الدوسري",
    email: "mohammed.fahad@company.com",
    phone: "0503456789",
    position: "مدير مبيعات",
    department: "المبيعات",
    startDate: "2019-11-15",
    salary: 17000,
    status: "active",
  },
];
const departmentOptions = [
  "تقنية المعلومات",
  "المالية",
  "الموارد البشرية",
  "المبيعات",
  "التسويق",
  "العمليات",
];

const useFilteredEmployees = (
  employees: Employee[],
  searchQuery: string,
  filterDepartment: string,
  filterStatus: string
) => {
  return useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return employees.filter((emp) => {
      const matchesSearch =
        !normalizedQuery ||
        emp.name.toLowerCase().includes(normalizedQuery) ||
        emp.email.toLowerCase().includes(normalizedQuery) ||
        emp.position.toLowerCase().includes(normalizedQuery);

      const matchesDepartment = filterDepartment === "all" || emp.department === filterDepartment;
      const matchesStatus = filterStatus === "all" || emp.status === filterStatus;

      return matchesSearch && matchesDepartment && matchesStatus;
    });
  }, [employees, searchQuery, filterDepartment, filterStatus]);
};

type DemoBannerProps = {
  isArabic: boolean;
  show: boolean;
  content: DemoExperienceContent | null;
  focusTarget: () => void;
  dismiss: () => void;
};

const DemoBanner = ({ isArabic, show, content, focusTarget, dismiss }: DemoBannerProps) => {
  if (!show || !content) {
    return null;
  }

  return (
    <Alert className="border-sky-200 bg-sky-50 text-slate-800">
      <AlertTitle className="flex flex-wrap items-center justify-between gap-3 text-base font-semibold">
        <span>{content.title}</span>
        <Badge variant="secondary" className="bg-white/80 text-sky-700">
          {isArabic ? "وضع العرض" : "Guided tour"}
        </Badge>
      </AlertTitle>
      <AlertDescription className="mt-4 space-y-4 text-sm">
        <p>{content.description}</p>
        <ul className="list-disc space-y-1 pr-5 text-slate-600">
          {content.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-3">
          <Button size="sm" onClick={focusTarget}>
            {content.actionLabel}
          </Button>
          <Button size="sm" variant="ghost" onClick={dismiss}>
            {isArabic ? "إخفاء الدليل" : "Hide guide"}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
};

type EmployeesPageHeaderProps = {
  readonly isArabic: boolean;
  readonly onImport: () => void;
  readonly onExport: () => void;
  readonly isAddDialogOpen: boolean;
  readonly onDialogChange: React.Dispatch<React.SetStateAction<boolean>>;
  readonly onAddEmployee: () => void;
  readonly departments: readonly string[];
};

const EmployeesPageHeader = ({
  isArabic,
  onImport,
  onExport,
  isAddDialogOpen,
  onDialogChange,
  onAddEmployee,
  departments,
}: EmployeesPageHeaderProps) => (
  <Card className="border-0 bg-gradient-to-br from-[#0F172A] via-[#1F2A52] to-[#14238A] text-white shadow-[0_40px_120px_rgba(15,23,42,0.35)]">
    <CardContent className="space-y-6 p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3 text-right">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">
            {isArabic ? "لوحة الموارد البشرية" : "HR Command Center"}
          </p>
          <h1 className="flex items-center justify-end gap-3 text-3xl font-bold leading-tight md:text-4xl">
            <Users className="h-9 w-9 text-sky-300" />
            {isArabic ? "إدارة الموظفين" : "Employee Management"}
          </h1>
          <p className="max-w-2xl text-base text-white/80">
            {isArabic
              ? "راقب صحة القوى العاملة، النسب النظامية، وسير العمل اليومي في لوحة واحدة متصلة بالعمليات السعودية."
              : "Monitor workforce health, compliance, and day-to-day execution from a single, Saudi-ready workspace."}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3 text-slate-900">
          <Button variant="secondary" className="bg-white/10 text-white" onClick={onExport}>
            <Download className="ml-2 h-4 w-4" />
            {isArabic ? "تقرير ربع سنوي" : "Quarterly export"}
          </Button>
          <Button variant="outline" className="border-white/40 text-white" onClick={onImport}>
            <Upload className="ml-2 h-4 w-4" />
            {isArabic ? "استيراد ملف" : "Import file"}
          </Button>
          <Button variant="ghost" className="text-emerald-300" asChild>
            <a href="https://wa.me/966500000000" target="_blank" rel="noopener noreferrer">
              <MessageCircle className="ml-2 h-4 w-4" />
              {isArabic ? "تحدث مع خبير" : "Talk to an expert"}
            </a>
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={onDialogChange}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-emerald-400 to-sky-500 text-slate-900">
                <Plus className="ml-2 h-4 w-4" />
                {isArabic ? "إضافة موظف" : "Add employee"}
              </Button>
            </DialogTrigger>
            {isAddDialogOpen ? (
              <Suspense
                fallback={
                  <div className="p-8 text-center text-sm text-muted-foreground" aria-busy="true">
                    {isArabic ? "يتم تحميل نموذج الإضافة..." : "Loading add form..."}
                  </div>
                }
              >
                <AddEmployeeDialog
                  isArabic={isArabic}
                  departments={departments}
                  onCancel={() => onDialogChange(false)}
                  onSubmit={onAddEmployee}
                />
              </Suspense>
            ) : null}
          </Dialog>
        </div>
      </div>
    </CardContent>
  </Card>
);

type EmployeesKpiGridProps = {
  cards: { label: string; value: string; delta?: string; icon?: ReactNode; emphasis?: "primary" | "secondary" | "neutral" }[];
};

const EmployeesKpiGrid = ({ cards }: EmployeesKpiGridProps) => (
  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
    {cards.map((card) => (
      <MetricCard key={card.label} {...card} />
    ))}
  </div>
);

const EmployeeInsightsRail = ({ isArabic }: { isArabic: boolean }) => {
  const insights = [
    {
      title: isArabic ? "ملخص الامتثال" : "Compliance health",
      description: isArabic
        ? "آخر تحديث لملف نطاقات تم منذ 32 دقيقة"
        : "Latest Nitaqat submission validated 32 minutes ago",
      icon: <ShieldCheck className="h-5 w-5 text-emerald-500" />,
      badge: isArabic ? "مستقر" : "Stable",
    },
    {
      title: isArabic ? "تحذيرات الموارد" : "Workforce alerts",
      description: isArabic
        ? "3 تأشيرات عمل تحتاج الإحلال هذا الأسبوع"
        : "3 work visas require replacement this week",
      icon: <AlertTriangle className="h-5 w-5 text-amber-500" />,
      badge: isArabic ? "يتطلب متابعة" : "Action needed",
    },
    {
      title: isArabic ? "قنوات الدعم" : "Support channels",
      description: isArabic
        ? "تم الرد على 14 طلب خدمة خلال ساعتين"
        : "14 service tickets resolved within 2h",
      icon: <PhoneCall className="h-5 w-5 text-sky-500" />,
      badge: isArabic ? "نشط" : "Live",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {insights.map((insight) => (
        <Card key={insight.title} className="border-slate-200/70 shadow-sm">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="rounded-2xl bg-slate-50 p-3 text-slate-900">
              {insight.icon}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <Badge variant="outline" className="border-slate-200 text-slate-600">
                  {insight.badge}
                </Badge>
              </div>
              <p className="font-semibold text-slate-900">{insight.title}</p>
              <p className="text-sm text-slate-600">{insight.description}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const WorkforceFocusPanel = ({ isArabic }: { isArabic: boolean }) => {
  const focusCards = [
    {
      title: isArabic ? "استبقاء المواهب" : "Talent retention",
      metric: "1.8%",
      meta: isArabic ? "معدل مغادرة خلال الربع" : "Quarterly attrition rate",
      change: isArabic ? "-0.3% مقابل الربع السابق" : "-0.3% vs last quarter",
      icon: <TrendingDown className="h-5 w-5 text-rose-500" />,
    },
    {
      title: isArabic ? "الانضمام والتوطين" : "Onboarding & localization",
      metric: "12",
      meta: isArabic ? "موظفون تحت التدريب" : "Employees in onboarding",
      change: isArabic ? "4 سعوديون قيد التوطين" : "4 Saudi hires localizing",
      icon: <UserPlus className="h-5 w-5 text-emerald-500" />,
    },
    {
      title: isArabic ? "سياسات قادمة" : "Policy reminders",
      metric: isArabic ? "5 مستندات" : "5 policies",
      meta: isArabic ? "تحتاج توقيع قبل 1 ديسمبر" : "Pending signature before Dec 1",
      change: isArabic ? "أرسل تذكير" : "Send reminder",
      icon: <ScrollText className="h-5 w-5 text-sky-500" />,
    },
  ];

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>{isArabic ? "تركيز القوى العاملة" : "Workforce focus"}</CardTitle>
          <CardDescription>
            {isArabic
              ? "تابع مؤشرات المغادرة، التوطين، والتنبيهات التشغيلية"
              : "Track attrition, localization, and operational reminders"}
          </CardDescription>
        </div>
        <Button variant="outline" className="gap-2 text-slate-600">
          <RefreshCcw className="h-4 w-4" />
          {isArabic ? "تحديث البيانات" : "Refresh data"}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-3">
          {focusCards.map((card) => (
            <div key={card.title} className="rounded-2xl border border-slate-100/80 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-50 p-2">{card.icon}</div>
                <p className="text-sm font-semibold text-slate-500">{card.title}</p>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{card.metric}</p>
              <p className="text-sm text-slate-600">{card.meta}</p>
              <p className="mt-2 text-xs text-emerald-600">{card.change}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

type EmployeeSegmentChipsProps = {
  readonly segments: readonly { id: EmployeeSegmentId; label: string; count: number; helper: string }[];
  readonly activeSegment: EmployeeSegmentId;
  readonly onSegmentSelect: (segment: EmployeeSegmentId) => void;
};

const EmployeeSegmentChips = ({ segments, activeSegment, onSegmentSelect }: EmployeeSegmentChipsProps) => (
  <div className="flex flex-wrap gap-3">
    {segments.map((segment) => {
      const isActive = segment.id === activeSegment;
      return (
        <button
          key={segment.id}
          type="button"
          onClick={() => onSegmentSelect(segment.id)}
          className={cn(
            "rounded-full border px-4 py-2 text-sm transition",
            isActive
              ? "border-slate-900 bg-slate-900 text-white shadow-lg"
              : "border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-900"
          )}
        >
          <span className="font-semibold">{segment.label}</span>
          <span className="mx-2 text-xs text-slate-400">•</span>
          <span className="text-xs text-slate-500">{segment.count}</span>
          <span className="ml-2 text-xs text-slate-400">{segment.helper}</span>
        </button>
      );
    })}
  </div>
);

type EmployeesCommandBarProps = {
  readonly isArabic: boolean;
  readonly searchQuery: string;
  readonly onSearchChange: React.Dispatch<React.SetStateAction<string>>;
  readonly filterDepartment: string;
  readonly onDepartmentChange: React.Dispatch<React.SetStateAction<string>>;
  readonly filterStatus: string;
  readonly onStatusChange: React.Dispatch<React.SetStateAction<string>>;
  readonly departments: readonly string[];
};

/** Helper to get localized command bar labels */
const getCommandBarLabels = (isArabic: boolean) => ({
  searchLabel: isArabic ? "بحث الموظفين" : "Search employees",
  searchPlaceholder: isArabic ? "ابحث بالاسم، البريد، أو المسمى..." : "Search by name, email, or title...",
  searchHint: isArabic ? "يتم تحديث النتائج فوراً مع الحفاظ على الإعدادات باللغة العربية." : "Results update in real time with Arabic-first formatting.",
  templates: isArabic ? "إدارة القوالب" : "Workflow templates",
  customExport: isArabic ? "تصدير مخصص" : "Custom export",
  supportLine: isArabic ? "خط الدعم" : "Support line",
  allDepartments: isArabic ? "جميع الأقسام" : "All Departments",
  departmentFilter: isArabic ? "تصفية الأقسام" : "Department filter",
  allStatuses: isArabic ? "جميع الحالات" : "All statuses",
  statusFilter: isArabic ? "تصفية الحالات" : "Status filter",
  active: isArabic ? "نشط" : "Active",
  onLeave: isArabic ? "في إجازة" : "On leave",
  terminated: isArabic ? "منتهي" : "Terminated",
  saveFilter: isArabic ? "حفظ التصفية" : "Save smart filter",
  saudization: isArabic ? "نسبة السعودة 92%" : "Saudization at 92%",
});

const EmployeesCommandBar = ({
  isArabic,
  searchQuery,
  onSearchChange,
  filterDepartment,
  onDepartmentChange,
  filterStatus,
  onStatusChange,
  departments,
}: EmployeesCommandBarProps) => {
  const labels = getCommandBarLabels(isArabic);
  
  return (
  <div className="sticky top-4 z-20">
    <Card className="border border-slate-200/70 shadow-2xl shadow-slate-900/5 backdrop-blur">
      <CardContent className="space-y-5 p-4 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <Label htmlFor="employee-search" className="sr-only">
              {labels.searchLabel}
            </Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <Input
                id="employee-search"
                type="search"
                placeholder={labels.searchPlaceholder}
                className="bg-white/60 pr-10"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">{labels.searchHint}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              {labels.templates}
            </Button>
            <Button variant="outline" className="gap-2">
              <FileText className="h-4 w-4" />
              {labels.customExport}
            </Button>
            <Button variant="ghost" className="text-emerald-600" asChild>
              <a href="tel:+966500000000" className="flex items-center gap-2">
                <PhoneCall className="h-4 w-4" />
                {labels.supportLine}
              </a>
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <Select value={filterDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger id="department-filter" aria-label={labels.departmentFilter}>
              <SelectValue placeholder={labels.allDepartments} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allDepartments}</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter" aria-label={labels.statusFilter}>
              <SelectValue placeholder={labels.allStatuses} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{labels.allStatuses}</SelectItem>
              <SelectItem value="active">{labels.active}</SelectItem>
              <SelectItem value="on-leave">{labels.onLeave}</SelectItem>
              <SelectItem value="terminated">{labels.terminated}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="w-full gap-2 text-slate-600">
            <Filter className="h-4 w-4" />
            {labels.saveFilter}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs">
          <Badge className="flex items-center gap-1 bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {labels.saudization}
          </Badge>
          <Badge className="flex items-center gap-1 bg-sky-50 text-sky-700">
            <Target className="h-3.5 w-3.5" />
            {isArabic ? "ساعات العمل 1.8h" : "Workflow SLA 1.8h"}
          </Badge>
          <Badge className="flex items-center gap-1 bg-amber-50 text-amber-700">
            <AlertTriangle className="h-3.5 w-3.5" />
            {isArabic ? "3 حالات بانتظار الموافقة" : "3 cases pending approval"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  </div>
  );
};

type EmployeeProfileDialogProps = {
  readonly employee: Employee | null;
  readonly isArabic: boolean;
  readonly onClose: () => void;
};

const BulkActionShortcuts = ({ isArabic }: { isArabic: boolean }) => (
  <Card className="border-slate-200/70 bg-gradient-to-br from-white to-slate-50">
    <CardHeader>
      <CardTitle>{isArabic ? "إجراءات جماعية" : "Bulk actions"}</CardTitle>
      <CardDescription>
        {isArabic
          ? "شغّل مهام الامتثال والرواتب المعتمدة في السعودية خلال ثوانٍ"
          : "Trigger Saudi-compliant HR workflows in just a few clicks"}
      </CardDescription>
    </CardHeader>
    <CardContent className="grid gap-3 md:grid-cols-3">
      <Button variant="outline" className="h-auto flex-col items-start gap-2 text-left">
        <span className="text-sm font-semibold text-slate-700">
          {isArabic ? "إرسال ملف رواتب" : "Send payroll file"}
        </span>
        <span className="text-xs text-slate-500">
          {isArabic ? "تصدير WPS وتوقيع خزينة" : "Export WPS + treasury approval"}
        </span>
      </Button>
      <Button variant="outline" className="h-auto flex-col items-start gap-2 text-left">
        <span className="text-sm font-semibold text-slate-700">
          {isArabic ? "تحديث مسير الإجازات" : "Update leave roster"}
        </span>
        <span className="text-xs text-slate-500">
          {isArabic ? "نمط موحد لجهات العمل" : "Unified format for ministries"}
        </span>
      </Button>
      <Button className="h-auto flex-col items-start gap-2 bg-gradient-to-r from-emerald-500 to-sky-500 text-left">
        <span className="text-sm font-semibold text-white">
          {isArabic ? "إطلاق حملة تقييم" : "Launch review cycle"}
        </span>
        <span className="text-xs text-white/80">
          {isArabic ? "مزامنة مع تمكين" : "Sync with Tamkeen"}
        </span>
      </Button>
    </CardContent>
  </Card>
);

const OperationsFeed = ({ isArabic }: { isArabic: boolean }) => {
  const events = [
    {
      title: isArabic ? "تمت الموافقة على ترقية" : "Promotion approved",
      detail: isArabic ? "للمدير التقني - ينتظر توقيع المالية" : "CTO promotion awaiting finance signature",
      timestamp: isArabic ? "منذ 12 دقيقة" : "12m ago",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />,
    },
    {
      title: isArabic ? "تصعيد رحلة دخول" : "Visa escalation",
      detail: isArabic ? "تأشيرة فنية بحاجة لتحديث خطاب العمل" : "Technical visa requires updated sponsor letter",
      timestamp: isArabic ? "قبل ساعة" : "1h ago",
      icon: <AlertTriangle className="h-4 w-4 text-amber-500" />,
    },
    {
      title: isArabic ? "تم إنشاء عقد" : "Contract generated",
      detail: isArabic ? "عقد دوام جزئي لإدارة التسويق" : "Part-time contract for marketing lead",
      timestamp: isArabic ? "اليوم 09:20" : "Today 09:20",
      icon: <FileText className="h-4 w-4 text-sky-500" />,
    },
  ];

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <CardTitle>{isArabic ? "آخر العمليات" : "Operations feed"}</CardTitle>
          <CardDescription>
            {isArabic ? "تحديثات مباشرة من الامتثال، الرواتب، والدعم" : "Live signals from compliance, payroll, and support"}
          </CardDescription>
        </div>
        <Button variant="ghost" className="gap-2 text-slate-600">
          {isArabic ? "عرض السجل" : "View full log"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {events.map((event) => (
          <div key={event.title} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3">
            <div className="rounded-full bg-slate-50 p-2">{event.icon}</div>
            <div>
              <p className="font-semibold text-slate-900">{event.title}</p>
              <p className="text-sm text-slate-600">{event.detail}</p>
            </div>
            <span className="ml-auto text-xs text-slate-400">{event.timestamp}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const EmployeeRiskPanel = ({ isArabic }: { isArabic: boolean }) => {
  const risks = [
    {
      employee: "نورة سعيد العتيبي",
      title: isArabic ? "إجازة متجاوزة" : "Leave extension",
      detail: isArabic ? "بحاجة اعتماد إضافي من الرئيس التنفيذي" : "Requires CEO approval to extend",
      badge: isArabic ? "عالي" : "High",
      badgeClass: "bg-rose-50 text-rose-700",
    },
    {
      employee: "محمد فهد الدوسري",
      title: isArabic ? "تسوية عمولات" : "Commission reconciliation",
      detail: isArabic ? "ينتظر إرفاق مستند المطابقة" : "Pending matched document upload",
      badge: isArabic ? "متوسط" : "Medium",
      badgeClass: "bg-amber-50 text-amber-700",
    },
  ];

  return (
    <Card className="border-slate-200/70">
      <CardHeader className="flex flex-col gap-3">
        <div>
          <CardTitle>{isArabic ? "تنبيهات المخاطر" : "Risk alerts"}</CardTitle>
          <CardDescription>
            {isArabic ? "ملفات تحتاج متابعة مالية أو قانونية" : "Profiles needing finance or legal escalation"}
          </CardDescription>
        </div>
        <Button variant="outline" className="gap-2 text-slate-600">
          <ShieldCheck className="h-4 w-4" />
          {isArabic ? "مزامنة مع الامتثال" : "Sync with compliance"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {risks.map((risk) => (
          <div key={risk.employee} className="rounded-2xl border border-slate-100 p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900">{risk.employee}</p>
              <Badge className={risk.badgeClass}>{risk.badge}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-600">{risk.title}</p>
            <p className="text-xs text-slate-500">{risk.detail}</p>
            <Button variant="ghost" className="mt-2 gap-2 text-emerald-600">
              {isArabic ? "عرض الحالة" : "View case"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const WorkflowTimeline = ({ isArabic }: { isArabic: boolean }) => {
  const steps = [
    {
      title: isArabic ? "تمت معالجة ملفات الرواتب" : "Payroll files processed",
      detail: isArabic ? "WPS + ملف البنك تمت مزامنتهما" : "WPS + bank file synced",
      status: "done" as const,
    },
    {
      title: isArabic ? "مراجعة تأشيرة تقنية" : "Tech visa review",
      detail: isArabic ? "بانتظار توقيع الموارد البشرية" : "Waiting for HR approval",
      status: "active" as const,
    },
    {
      title: isArabic ? "تذكير تقييم الأداء" : "Performance reminder",
      detail: isArabic ? "سيتم الإرسال آلياً خلال 4 ساعات" : "Auto dispatch in 4 hours",
      status: "pending" as const,
    },
  ];

  const statusClasses = {
    done: "bg-emerald-500",
    active: "bg-sky-500",
    pending: "bg-slate-300",
  } as const;

  return (
    <Card className="border-slate-200/70">
      <CardHeader>
        <CardTitle>{isArabic ? "سير العمل الآلي" : "Workflow timeline"}</CardTitle>
        <CardDescription>
          {isArabic ? "مراحل الأتمتة الجارية والقادمة" : "Automation steps running next"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {steps.map((step, index) => (
            <li key={step.title} className="flex items-start gap-4">
              <div className="flex flex-col items-center">
                <span className={cn("h-3 w-3 rounded-full", statusClasses[step.status])} />
                {index < steps.length - 1 ? <span className="my-1 h-6 w-px bg-slate-200" /> : null}
              </div>
              <div>
                <p className="font-semibold text-slate-900">{step.title}</p>
                <p className="text-sm text-slate-600">{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <Button variant="ghost" className="mt-4 gap-2 text-slate-600">
          <RefreshCcw className="h-4 w-4" />
          {isArabic ? "مزامنة الجدول" : "Sync schedule"}
        </Button>
      </CardContent>
    </Card>
  );
};

/** Helper for profile dialog localized labels */
const getProfileDialogLabels = (isArabic: boolean) => ({
  description: isArabic
    ? "نظرة سريعة على حالة الموظف، تفاصيل العقد، وخيارات التواصل المباشر."
    : "Quick view of employee status, contract context, and direct outreach options.",
  contact: isArabic ? "التواصل" : "Contact",
  startDate: isArabic ? "تاريخ البدء" : "Start date",
  indicators: isArabic ? "مؤشرات" : "Indicators",
  nitaqat: isArabic ? "متوافق مع نطاقات" : "Aligned with Nitaqat tier",
  devPlan: isArabic ? "خطة تطوير محدثة" : "Development plan updated",
  quickActions: isArabic ? "إجراءات سريعة" : "Quick actions",
  generateLetter: isArabic ? "إنشاء خطاب" : "Generate letter",
  updateStatus: isArabic ? "تحديث الحالة" : "Update status",
  bookCoaching: isArabic ? "حجز جلسة إرشاد" : "Book coaching session",
  recentActivity: isArabic ? "آخر الأنشطة" : "Recent activity",
  activities: isArabic
    ? ["تم اعتماد إجازة 12 نوفمبر", "تحديث هدف الأداء 2025", "تم إرسال إشعار للمالية"]
    : ["Leave approved on 12 Nov", "Performance goal 2025 refreshed", "Finance notified for payroll update"],
});

const EmployeeProfileDialog = ({ employee, isArabic, onClose }: EmployeeProfileDialogProps) => {
  const labels = getProfileDialogLabels(isArabic);
  
  return (
  <Dialog open={!!employee} onOpenChange={(open) => { if (!open) onClose(); }}>
    {employee ? (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-2xl">
            <span>{employee.name}</span>
            <Badge variant="outline">
              {employee.department} · {employee.position}
            </Badge>
          </DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-sm font-semibold text-slate-500">{labels.contact}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {employee.email}
                </div>
                <div className="flex items-center gap-2">
                  <PhoneCall className="h-4 w-4 text-slate-400" />
                  {employee.phone}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {labels.startDate}: {employee.startDate}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-sm font-semibold text-slate-500">{labels.indicators}</p>
              <div className="mt-3 space-y-2 text-sm text-slate-700">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  {labels.nitaqat}
                </div>
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-sky-500" />
                  {labels.devPlan}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-sm font-semibold text-slate-500">{labels.quickActions}</p>
              <div className="mt-3 grid gap-3">
                <Button variant="outline" className="justify-between">
                  {labels.generateLetter}
                  <FileText className="h-4 w-4" />
                </Button>
                <Button variant="outline" className="justify-between">
                  {labels.updateStatus}
                  <Activity className="h-4 w-4" />
                </Button>
                <Button className="justify-between bg-gradient-to-r from-emerald-500 to-sky-500">
                  {labels.bookCoaching}
                  <Calendar className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200/70 p-4">
              <p className="text-sm font-semibold text-slate-500">{labels.recentActivity}</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {labels.activities.map((activity) => (
                  <li key={activity}>{activity}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </DialogContent>
    ) : null}
  </Dialog>
  );
};

/** Helper for table section localized labels */
const getTableSectionLabels = (isArabic: boolean) => ({
  title: isArabic ? "قائمة الموظفين" : "Employees list",
  exportTable: isArabic ? "تصدير الجدول" : "Export table",
  auditLog: isArabic ? "سجل الإجراءات" : "Audit log",
  noResults: isArabic ? "لا توجد نتائج" : "No employees match these filters",
  adjustSearch: isArabic ? "عدّل البحث أو استخدم قسم التصفية الذكي أعلاه." : "Adjust your search or update the smart filter above.",
  employee: isArabic ? "الموظف" : "Employee",
  role: isArabic ? "المسمى" : "Role",
  department: isArabic ? "القسم" : "Department",
  startDate: isArabic ? "تاريخ البدء" : "Start date",
  status: isArabic ? "الحالة" : "Status",
  actions: isArabic ? "الإجراءات" : "Actions",
  edit: isArabic ? "تعديل" : "Edit",
  viewProfile: isArabic ? "عرض الملف" : "View profile",
  contract: isArabic ? "سجل العقد" : "Contract",
  delete: isArabic ? "حذف" : "Delete",
});

type EmployeesTableSectionProps = {
  readonly isArabic: boolean;
  readonly employees: readonly Employee[];
  readonly totalEmployees: number;
  readonly onEditEmployee: (emp: Employee) => void;
  readonly onDeleteEmployee: (emp: Employee) => void;
  readonly onViewProfile: (emp: Employee) => void;
};

const EmployeesTableSection = ({
  isArabic,
  employees,
  totalEmployees,
  onEditEmployee,
  onDeleteEmployee,
  onViewProfile,
}: EmployeesTableSectionProps) => {
  const labels = getTableSectionLabels(isArabic);
  const description = isArabic
    ? `عرض ${employees.length} من ${totalEmployees} ملف`
    : `Showing ${employees.length} of ${totalEmployees} profiles`;
  
  return (
  <Card className="border-slate-200/70 shadow-xl">
    <CardHeader className="gap-3 lg:flex lg:items-center lg:justify-between lg:space-y-0">
      <div>
        <CardTitle>{labels.title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1">
          <Download className="h-3.5 w-3.5" />
          {labels.exportTable}
        </Button>
        <Button variant="outline" size="sm" className="gap-1">
          <FileText className="h-3.5 w-3.5" />
          {labels.auditLog}
        </Button>
      </div>
    </CardHeader>
    <CardContent className="px-0">
      {employees.length === 0 ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          <p className="font-medium text-slate-900">{labels.noResults}</p>
          <p className="mt-1 text-slate-500">{labels.adjustSearch}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{labels.employee}</TableHead>
                <TableHead>{labels.role}</TableHead>
                <TableHead>{labels.department}</TableHead>
                <TableHead>{labels.startDate}</TableHead>
                <TableHead>{labels.status}</TableHead>
                <TableHead className="text-center">{labels.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-sm font-bold text-white">
                        {employee.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{employee.name}</p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <Mail className="h-3 w-3" />
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Briefcase className="h-4 w-4 text-slate-400" />
                      {employee.position}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-600">{employee.department}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      {employee.startDate}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={employee.status} isArabic={isArabic} />
                  </TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>{labels.actions}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
                          <Edit className="ml-2 h-4 w-4" />
                          {labels.edit}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onViewProfile(employee)}>
                          <Eye className="ml-2 h-4 w-4" />
                          {labels.viewProfile}
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="ml-2 h-4 w-4" />
                          {labels.contract}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600" onClick={() => onDeleteEmployee(employee)}>
                          <Trash2 className="ml-2 h-4 w-4" />
                          {labels.delete}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
  );
};

type StatusBadgeProps = {
  readonly status: Employee["status"];
  readonly isArabic: boolean;
};

const StatusBadge = ({ status, isArabic }: StatusBadgeProps) => {
  const statusConfig = {
    active: {
      label: isArabic ? "نشط" : "Active",
      className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    },
    "on-leave": {
      label: isArabic ? "في إجازة" : "On Leave",
      className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    },
    terminated: {
      label: isArabic ? "منتهي" : "Terminated",
      className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    },
  } as const;

  const config = statusConfig[status];
  return <Badge className={config.className}>{config.label}</Badge>;
};

export default function EmployeesManagement() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [activeSegment, setActiveSegment] = useState<EmployeeSegmentId>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [focusedEmployee, setFocusedEmployee] = useState<Employee | null>(null);
  const { activeContent, showBanner, focusTarget, dismiss } = useEmployeeDemoExperience(isArabic);

  const employees = mockEmployees;
  const departments = departmentOptions;

  const filteredEmployees = useFilteredEmployees(
    employees,
    searchQuery,
    filterDepartment,
    filterStatus
  );

  useEffect(() => {
    if (filterStatus === "active" || filterStatus === "on-leave" || filterStatus === "all") {
      setActiveSegment(filterStatus as EmployeeSegmentId);
    } else {
      setActiveSegment("all");
    }
  }, [filterStatus]);

  const handleSegmentSelect = useCallback((segment: EmployeeSegmentId) => {
    setActiveSegment(segment);
    setFilterStatus(segment === "all" ? "all" : segment);
  }, []);

  const segmentChips = useMemo(() => {
    const activeCount = employees.filter((emp) => emp.status === "active").length;
    const onLeaveCount = employees.filter((emp) => emp.status === "on-leave").length;

    return [
      {
        id: "all" as EmployeeSegmentId,
        label: isArabic ? "كل الموظفين" : "All employees",
        count: employees.length,
        helper: isArabic ? "عرض كامل" : "Full view",
      },
      {
        id: "active" as EmployeeSegmentId,
        label: isArabic ? "نشط" : "Active",
        count: activeCount,
        helper: isArabic ? "جاهز للعمل" : "Ready to work",
      },
      {
        id: "on-leave" as EmployeeSegmentId,
        label: isArabic ? "في إجازة" : "On leave",
        count: onLeaveCount,
        helper: isArabic ? "متابعة العودة" : "Return tracking",
      },
    ];
  }, [employees, isArabic]);

  const kpiCards = useMemo(() => {
    const activeCount = employees.filter((emp) => emp.status === "active").length;
    const onLeaveCount = employees.filter((emp) => emp.status === "on-leave").length;

    return [
      {
        label: isArabic ? "إجمالي القوة العاملة" : "Total workforce",
        value: `${employees.length}`,
        delta: isArabic ? "+3 هذا الشهر" : "+3 this month",
        icon: <Users className="h-4 w-4 text-sky-500" />,
        emphasis: "primary" as const,
      },
      {
        label: isArabic ? "نسبة السعودة" : "Saudization",
        value: "92%",
        delta: isArabic ? "المستهدف 85%" : "Target 85%",
        icon: <Target className="h-4 w-4 text-emerald-400" />,
        emphasis: "secondary" as const,
      },
      {
        label: isArabic ? "الموظفون النشطون" : "Active employees",
        value: `${activeCount}`,
        delta: isArabic ? `${onLeaveCount} في إجازة` : `${onLeaveCount} on leave`,
        icon: <Activity className="h-4 w-4 text-slate-500" />,
        emphasis: "neutral" as const,
      },
      {
        label: isArabic ? "متوسط زمن الإجراء" : "Avg. HR SLA",
        value: "1.8h",
        delta: isArabic ? "خلال هدف ساعتين" : "Inside 2h target",
        icon: <Clock3 className="h-4 w-4 text-indigo-500" />,
        emphasis: "neutral" as const,
      },
    ];
  }, [employees, isArabic]);

  const handleAddEmployee = () => {
    toast.success(isArabic ? "تم إضافة الموظف بنجاح" : "Employee added successfully");
    setIsAddDialogOpen(false);
  };

  const handleEditEmployee = (employee: Employee) => {
    toast.info(
      isArabic ? `جاري تحرير الموظف: ${employee.name}` : `Editing employee: ${employee.name}`
    );
  };

  const handleDeleteEmployee = (employee: Employee) => {
    toast.error(
      isArabic
        ? `تم حذف الموظف: ${employee.name}`
        : `Deleted employee: ${employee.name}`
    );
  };

  const handleExport = () => {
    toast.success(
      isArabic ? "جاري تصدير البيانات..." : "Exporting data..."
    );
  };

  const handleImport = () => {
    toast.info(isArabic ? "جاري استيراد البيانات..." : "Importing data...");
  };

  const handleCloseProfile = () => setFocusedEmployee(null);

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        <DemoBanner
          isArabic={isArabic}
          show={showBanner}
          content={activeContent}
          focusTarget={focusTarget}
          dismiss={dismiss}
        />

        <EmployeesPageHeader
          isArabic={isArabic}
          onImport={handleImport}
          onExport={handleExport}
          isAddDialogOpen={isAddDialogOpen}
          onDialogChange={setIsAddDialogOpen}
          onAddEmployee={handleAddEmployee}
          departments={departments}
        />

        <EmployeesKpiGrid cards={kpiCards} />

        <EmployeeInsightsRail isArabic={isArabic} />

        <WorkforceFocusPanel isArabic={isArabic} />

        <EmployeesCommandBar
          isArabic={isArabic}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterDepartment={filterDepartment}
          onDepartmentChange={setFilterDepartment}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          departments={departments}
        />

        <EmployeeSegmentChips
          segments={segmentChips}
          activeSegment={activeSegment}
          onSegmentSelect={handleSegmentSelect}
        />

        <BulkActionShortcuts isArabic={isArabic} />

        <div className="grid gap-6 lg:grid-cols-2">
          <EmployeeRiskPanel isArabic={isArabic} />
          <WorkflowTimeline isArabic={isArabic} />
        </div>

        <EmployeesTableSection
          isArabic={isArabic}
          employees={filteredEmployees}
          totalEmployees={employees.length}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onViewProfile={setFocusedEmployee}
        />

        <OperationsFeed isArabic={isArabic} />

        <EmployeeProfileDialog employee={focusedEmployee} isArabic={isArabic} onClose={handleCloseProfile} />
      </div>
    </DashboardLayout>
  );
}
