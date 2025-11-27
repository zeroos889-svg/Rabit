import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "@/components/DashboardLayout";
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
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
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
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Calendar,
  Briefcase,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  FileText,
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

const AddEmployeeDialog = lazy(() => import("./components/AddEmployeeDialog"));

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
    const normalizedQuery = searchQuery.toLowerCase();

    return employees.filter((emp) => {
      const matchesSearch =
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
    <Alert className="border-blue-200 bg-blue-50 text-slate-900 dark:border-blue-400/30 dark:bg-blue-950/30 dark:text-blue-50">
      <AlertTitle>{content.title}</AlertTitle>
      <AlertDescription>
        <p>{content.description}</p>
        <ul className="mt-3 list-disc space-y-1 pr-5 text-xs text-slate-700 dark:text-slate-100">
          {content.checklist.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
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
  isArabic: boolean;
  onImport: () => void;
  onExport: () => void;
  isAddDialogOpen: boolean;
  onDialogChange: (open: boolean) => void;
  onAddEmployee: () => void;
  departments: string[];
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
  <div className="flex justify-between items-start">
    <div>
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Users className="w-8 h-8 text-blue-600" />
        {isArabic ? "إدارة الموظفين" : "Employee Management"}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">
        {isArabic ? "إدارة بيانات وحسابات الموظفين" : "Manage employee data and accounts"}
      </p>
    </div>

    <div className="flex gap-2">
      <Button variant="outline" onClick={onImport}>
        <Upload className="w-4 h-4 ml-2" />
        {isArabic ? "استيراد" : "Import"}
      </Button>
      <Button variant="outline" onClick={onExport}>
        <Download className="w-4 h-4 ml-2" />
        {isArabic ? "تصدير" : "Export"}
      </Button>
      <Dialog open={isAddDialogOpen} onOpenChange={onDialogChange}>
        <DialogTrigger asChild>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            <Plus className="w-4 h-4 ml-2" />
            {isArabic ? "إضافة موظف" : "Add Employee"}
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
);

type EmployeeStatsGridProps = {
  isArabic: boolean;
  employees: Employee[];
  departments: string[];
};

const EmployeeStatsGrid = ({ isArabic, employees, departments }: EmployeeStatsGridProps) => (
  <div className="grid md:grid-cols-4 gap-6">
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {isArabic ? "إجمالي الموظفين" : "Total Employees"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{employees.length}</div>
        <p className="text-xs text-green-600 mt-1">{isArabic ? "+3 هذا الشهر" : "+3 this month"}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {isArabic ? "نشطون" : "Active"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-green-600">
          {employees.filter((e) => e.status === "active").length}
        </div>
        <p className="text-xs text-gray-600 mt-1">{isArabic ? "موظف نشط" : "active employees"}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {isArabic ? "في إجازة" : "On Leave"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-yellow-600">
          {employees.filter((e) => e.status === "on-leave").length}
        </div>
        <p className="text-xs text-gray-600 mt-1">{isArabic ? "موظف حالياً" : "employees currently"}</p>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {isArabic ? "الأقسام" : "Departments"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-blue-600">{departments.length}</div>
        <p className="text-xs text-gray-600 mt-1">{isArabic ? "قسم نشط" : "active departments"}</p>
      </CardContent>
    </Card>
  </div>
);

type EmployeeFiltersCardProps = {
  isArabic: boolean;
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filterDepartment: string;
  onDepartmentChange: (value: string) => void;
  filterStatus: string;
  onStatusChange: (value: string) => void;
  departments: string[];
};

const EmployeeFiltersCard = ({
  isArabic,
  searchQuery,
  onSearchChange,
  filterDepartment,
  onDepartmentChange,
  filterStatus,
  onStatusChange,
  departments,
}: EmployeeFiltersCardProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-lg">{isArabic ? "البحث والتصفية" : "Search & Filter"}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="employee-search" className="sr-only">
            {isArabic ? "بحث الموظفين" : "Search employees"}
          </Label>
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" aria-hidden="true" />
            <Input
              id="employee-search"
              type="search"
              placeholder={
                isArabic ? "ابحث بالاسم، البريد، أو المسمى الوظيفي..." : "Search by name, email, or position..."
              }
              className="pr-10"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="department-filter" className="sr-only">
            {isArabic ? "تصفية حسب القسم" : "Filter by department"}
          </Label>
          <Select value={filterDepartment} onValueChange={onDepartmentChange}>
            <SelectTrigger id="department-filter" aria-label={isArabic ? "تصفية الأقسام" : "Department filter"}>
              <Filter className="w-4 h-4 ml-2" aria-hidden="true" />
              <SelectValue placeholder={isArabic ? "جميع الأقسام" : "All Departments"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "جميع الأقسام" : "All Departments"}</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status-filter" className="sr-only">
            {isArabic ? "تصفية حسب الحالة" : "Filter by status"}
          </Label>
          <Select value={filterStatus} onValueChange={onStatusChange}>
            <SelectTrigger id="status-filter" aria-label={isArabic ? "تصفية الحالات" : "Status filter"}>
              <SelectValue placeholder={isArabic ? "جميع الحالات" : "All Statuses"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{isArabic ? "جميع الحالات" : "All Statuses"}</SelectItem>
              <SelectItem value="active">{isArabic ? "نشط" : "Active"}</SelectItem>
              <SelectItem value="on-leave">{isArabic ? "في إجازة" : "On Leave"}</SelectItem>
              <SelectItem value="terminated">{isArabic ? "منتهي" : "Terminated"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CardContent>
  </Card>
);

type EmployeesTableSectionProps = {
  isArabic: boolean;
  employees: Employee[];
  totalEmployees: number;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employee: Employee) => void;
};

const EmployeesTableSection = ({
  isArabic,
  employees,
  totalEmployees,
  onEditEmployee,
  onDeleteEmployee,
}: EmployeesTableSectionProps) => (
  <Card>
    <CardHeader>
      <CardTitle>{isArabic ? "قائمة الموظفين" : "Employees List"}</CardTitle>
      <CardDescription>
        {isArabic
          ? `عرض ${employees.length} من ${totalEmployees} موظف`
          : `Showing ${employees.length} of ${totalEmployees} employees`}
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{isArabic ? "الموظف" : "Employee"}</TableHead>
            <TableHead>{isArabic ? "المسمى الوظيفي" : "Position"}</TableHead>
            <TableHead>{isArabic ? "القسم" : "Department"}</TableHead>
            <TableHead>{isArabic ? "تاريخ البدء" : "Start Date"}</TableHead>
            <TableHead>{isArabic ? "الحالة" : "Status"}</TableHead>
            <TableHead className="text-center">{isArabic ? "الإجراءات" : "Actions"}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <Mail className="w-3 h-3" />
                      {employee.email}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-gray-400" />
                  {employee.position}
                </div>
              </TableCell>
              <TableCell>{employee.department}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {employee.startDate}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={employee.status} isArabic={isArabic} />
              </TableCell>
              <TableCell>
                <div className="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={isArabic ? "فتح قائمة إجراءات الموظف" : "Open employee actions menu"}
                        title={isArabic ? "إجراءات الموظف" : "Employee actions"}
                      >
                        <MoreVertical className="w-4 h-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>{isArabic ? "الإجراءات" : "Actions"}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onEditEmployee(employee)}>
                        <Edit className="w-4 h-4 ml-2" />
                        {isArabic ? "تعديل" : "Edit"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 ml-2" />
                        {isArabic ? "عرض الملف الشخصي" : "View Profile"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <FileText className="w-4 h-4 ml-2" />
                        {isArabic ? "إنشاء خطاب" : "Generate Letter"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => onDeleteEmployee(employee)}>
                        <Trash2 className="w-4 h-4 ml-2" />
                        {isArabic ? "حذف" : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

type StatusBadgeProps = {
  status: Employee["status"];
  isArabic: boolean;
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
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { activeContent, showBanner, focusTarget, dismiss } = useEmployeeDemoExperience(isArabic);

  const employees = mockEmployees;
  const departments = departmentOptions;

  const filteredEmployees = useFilteredEmployees(
    employees,
    searchQuery,
    filterDepartment,
    filterStatus
  );

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

        <EmployeeStatsGrid isArabic={isArabic} employees={employees} departments={departments} />

        <EmployeeFiltersCard
          isArabic={isArabic}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterDepartment={filterDepartment}
          onDepartmentChange={setFilterDepartment}
          filterStatus={filterStatus}
          onStatusChange={setFilterStatus}
          departments={departments}
        />

        <EmployeesTableSection
          isArabic={isArabic}
          employees={filteredEmployees}
          totalEmployees={employees.length}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
        />
      </div>
    </DashboardLayout>
  );
}
