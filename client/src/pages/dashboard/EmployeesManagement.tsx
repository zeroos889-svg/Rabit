import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Users,
  Plus,
  Search,
  Filter,
  Download,
  Upload,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Edit,
  Trash2,
  Eye,
  MoreVertical,
  UserPlus,
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

export default function Employees() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Mock data
  const employees: Employee[] = [
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

  const departments = [
    "تقنية المعلومات",
    "المالية",
    "الموارد البشرية",
    "المبيعات",
    "التسويق",
    "العمليات",
  ];

  const getStatusBadge = (status: Employee["status"]) => {
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
    };

    const config = statusConfig[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment =
      filterDepartment === "all" || emp.department === filterDepartment;

    const matchesStatus = filterStatus === "all" || emp.status === filterStatus;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleAddEmployee = () => {
    toast.success(isArabic ? "تم إضافة الموظف بنجاح" : "Employee added successfully");
    setIsAddDialogOpen(false);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    toast.info(isArabic ? "جاري تحرير الموظف..." : "Editing employee...");
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
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Users className="w-8 h-8 text-blue-600" />
              {isArabic ? "إدارة الموظفين" : "Employee Management"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic
                ? "إدارة بيانات وحسابات الموظفين"
                : "Manage employee data and accounts"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleImport}>
              <Upload className="w-4 h-4 ml-2" />
              {isArabic ? "استيراد" : "Import"}
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 ml-2" />
              {isArabic ? "تصدير" : "Export"}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="w-4 h-4 ml-2" />
                  {isArabic ? "إضافة موظف" : "Add Employee"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isArabic ? "إضافة موظف جديد" : "Add New Employee"}
                  </DialogTitle>
                  <DialogDescription>
                    {isArabic
                      ? "أدخل بيانات الموظف الجديد"
                      : "Enter new employee information"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? "الاسم الكامل" : "Full Name"}</Label>
                    <Input placeholder={isArabic ? "أحمد محمد" : "Ahmad Mohammed"} />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "البريد الإلكتروني" : "Email"}</Label>
                    <Input type="email" placeholder="ahmad@company.com" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "رقم الجوال" : "Phone"}</Label>
                    <Input placeholder="05xxxxxxxx" dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "المسمى الوظيفي" : "Position"}</Label>
                    <Input
                      placeholder={isArabic ? "مطور برمجيات" : "Software Developer"}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "القسم" : "Department"}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isArabic ? "اختر القسم" : "Select department"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "تاريخ البدء" : "Start Date"}</Label>
                    <Input type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "الراتب الأساسي" : "Base Salary"}</Label>
                    <Input
                      type="number"
                      placeholder={isArabic ? "12000" : "12000"}
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{isArabic ? "الحالة" : "Status"}</Label>
                    <Select defaultValue="active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">
                          {isArabic ? "نشط" : "Active"}
                        </SelectItem>
                        <SelectItem value="on-leave">
                          {isArabic ? "في إجازة" : "On Leave"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={handleAddEmployee}
                  >
                    <UserPlus className="w-4 h-4 ml-2" />
                    {isArabic ? "إضافة" : "Add"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "إجمالي الموظفين" : "Total Employees"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{employees.length}</div>
              <p className="text-xs text-green-600 mt-1">
                {isArabic ? "+3 هذا الشهر" : "+3 this month"}
              </p>
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
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "موظف نشط" : "active employees"}
              </p>
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
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "موظف حالياً" : "employees currently"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "الأقسام" : "Departments"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {departments.length}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "قسم نشط" : "active departments"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {isArabic ? "البحث والتصفية" : "Search & Filter"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder={
                      isArabic
                        ? "ابحث بالاسم، البريد، أو المسمى الوظيفي..."
                        : "Search by name, email, or position..."
                    }
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue
                      placeholder={isArabic ? "جميع الأقسام" : "All Departments"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {isArabic ? "جميع الأقسام" : "All Departments"}
                    </SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={isArabic ? "جميع الحالات" : "All Statuses"}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {isArabic ? "جميع الحالات" : "All Statuses"}
                    </SelectItem>
                    <SelectItem value="active">
                      {isArabic ? "نشط" : "Active"}
                    </SelectItem>
                    <SelectItem value="on-leave">
                      {isArabic ? "في إجازة" : "On Leave"}
                    </SelectItem>
                    <SelectItem value="terminated">
                      {isArabic ? "منتهي" : "Terminated"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employees Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {isArabic ? "قائمة الموظفين" : "Employees List"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? `عرض ${filteredEmployees.length} من ${employees.length} موظف`
                : `Showing ${filteredEmployees.length} of ${employees.length} employees`}
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
                  <TableHead className="text-center">
                    {isArabic ? "الإجراءات" : "Actions"}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
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
                    <TableCell>{getStatusBadge(employee.status)}</TableCell>
                    <TableCell>
                      <div className="flex justify-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {isArabic ? "الإجراءات" : "Actions"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleEditEmployee(employee)}
                            >
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
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteEmployee(employee)}
                            >
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
      </div>
    </DashboardLayout>
  );
}
