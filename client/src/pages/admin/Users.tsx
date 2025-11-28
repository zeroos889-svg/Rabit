import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Users,
  Search,
  Plus,
  MoreVertical,
  Mail,
  Phone,
  Shield,
  UserCheck,
  Building2,
  Calendar,
  TrendingUp,
  Download,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle2,
  Clock,
} from "lucide-react";

// بيانات تجريبية للمستخدمين
const usersData = [
  {
    id: 1,
    name: "أحمد محمد العلي",
    email: "ahmed@company.com",
    phone: "+966512345678",
    role: "admin",
    status: "active",
    company: "شركة التقنية المتقدمة",
    createdAt: "2024-01-15",
    lastLogin: "2025-01-20 10:30",
    emailVerified: true,
  },
  {
    id: 2,
    name: "فاطمة علي السالم",
    email: "fatima@hr.com",
    phone: "+966523456789",
    role: "company",
    status: "active",
    company: "مؤسسة الموارد البشرية",
    createdAt: "2024-03-20",
    lastLogin: "2025-01-19 15:45",
    emailVerified: true,
  },
  {
    id: 3,
    name: "محمد عبدالله",
    email: "mohamed@startup.sa",
    phone: "+966534567890",
    role: "company",
    status: "pending",
    company: "شركة الابتكار",
    createdAt: "2025-01-10",
    lastLogin: null,
    emailVerified: false,
  },
  {
    id: 4,
    name: "سارة خالد",
    email: "sara@business.com",
    phone: "+966545678901",
    role: "employee",
    status: "active",
    company: "شركة التقنية المتقدمة",
    createdAt: "2024-06-01",
    lastLogin: "2025-01-20 09:15",
    emailVerified: true,
  },
  {
    id: 5,
    name: "خالد أحمد",
    email: "khaled@test.com",
    phone: "+966556789012",
    role: "freelancer",
    status: "suspended",
    company: null,
    createdAt: "2024-08-15",
    lastLogin: "2024-12-01 11:00",
    emailVerified: true,
  },
];

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<typeof usersData[0] | null>(null);

  // حساب الإحصائيات
  const stats = useMemo(() => ({
    total: usersData.length,
    active: usersData.filter(u => u.status === "active").length,
    pending: usersData.filter(u => u.status === "pending").length,
    suspended: usersData.filter(u => u.status === "suspended").length,
    admins: usersData.filter(u => u.role === "admin").length,
    companies: usersData.filter(u => u.role === "company").length,
    employees: usersData.filter(u => u.role === "employee").length,
  }), []);

  // فلترة المستخدمين
  const filteredUsers = useMemo(() => {
    return usersData.filter(user => {
      const matchesSearch = 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === "all" || user.role === selectedRole;
      const matchesStatus = selectedStatus === "all" || user.status === selectedStatus;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [searchTerm, selectedRole, selectedStatus]);

  const getRoleBadge = (role: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      admin: { label: "مدير", className: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300" },
      company: { label: "شركة", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" },
      employee: { label: "موظف", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" },
      freelancer: { label: "مستقل", className: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300" },
    };
    const config = variants[role] || variants.employee;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
      active: { label: "نشط", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", icon: CheckCircle2 },
      pending: { label: "معلق", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", icon: Clock },
      suspended: { label: "موقوف", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", icon: Ban },
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleViewUser = (user: typeof usersData[0]) => {
    setSelectedUser(user);
    setIsViewDialogOpen(true);
  };

  const handleActivateUser = (_userId: number) => {
    toast.success("تم تفعيل المستخدم بنجاح");
  };

  const handleSuspendUser = (_userId: number) => {
    toast.success("تم إيقاف المستخدم");
  };

  const handleDeleteUser = (_userId: number) => {
    if (confirm("هل أنت متأكد من حذف هذا المستخدم؟")) {
      toast.success("تم حذف المستخدم");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
            <Users className="h-8 w-8 text-blue-600" />
            إدارة المستخدمين
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومراقبة جميع المستخدمين في المنصة
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="h-4 w-4 ml-2" />
                إضافة مستخدم
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  إضافة مستخدم جديد
                </DialogTitle>
                <DialogDescription>
                  أضف مستخدم جديد للمنصة
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user-name">الاسم الكامل *</Label>
                  <Input id="user-name" placeholder="أدخل اسم المستخدم" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-email">البريد الإلكتروني *</Label>
                  <Input id="user-email" type="email" placeholder="example@domain.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-phone">رقم الهاتف</Label>
                  <Input id="user-phone" placeholder="+966 5XX XXX XXXX" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user-role">الدور</Label>
                    <Select defaultValue="company">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">مدير</SelectItem>
                        <SelectItem value="company">شركة</SelectItem>
                        <SelectItem value="employee">موظف</SelectItem>
                        <SelectItem value="freelancer">مستقل</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user-status">الحالة</Label>
                    <Select defaultValue="active">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">نشط</SelectItem>
                        <SelectItem value="pending">معلق</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950 p-3 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    سيتم إرسال بريد إلكتروني للمستخدم لتفعيل حسابه وإنشاء كلمة مرور
                  </p>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  إنشاء المستخدم
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              إجمالي المستخدمين
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+12%</span> هذا الشهر
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              المستخدمون النشطون
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.active / stats.total) * 100)}% من الإجمالي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              في انتظار التفعيل
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              يحتاجون تفعيل البريد
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              الشركات المسجلة
            </CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.companies}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              + {stats.employees} موظف
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">جميع المستخدمين</TabsTrigger>
          <TabsTrigger value="companies">الشركات</TabsTrigger>
          <TabsTrigger value="employees">الموظفين</TabsTrigger>
          <TabsTrigger value="admins">المديرين</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث بالاسم أو البريد أو الشركة..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الدور" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأدوار</SelectItem>
                <SelectItem value="admin">مدير</SelectItem>
                <SelectItem value="company">شركة</SelectItem>
                <SelectItem value="employee">موظف</SelectItem>
                <SelectItem value="freelancer">مستقل</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="pending">معلق</SelectItem>
                <SelectItem value="suspended">موقوف</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Users Table */}
          <Card>
            <CardHeader>
              <CardTitle>المستخدمون ({filteredUsers.length})</CardTitle>
              <CardDescription>قائمة بجميع المستخدمين المسجلين</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">المستخدم</TableHead>
                      <TableHead className="text-right">الشركة</TableHead>
                      <TableHead className="text-right">الدور</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">تاريخ التسجيل</TableHead>
                      <TableHead className="text-right">آخر دخول</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map(user => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{user.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {user.company ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{user.company}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {user.createdAt}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {user.lastLogin || "لم يسجل دخول"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewUser(user)}>
                                <Eye className="h-4 w-4 ml-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 ml-2" />
                                تعديل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {user.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                                  <CheckCircle2 className="h-4 w-4 ml-2" />
                                  تفعيل
                                </DropdownMenuItem>
                              )}
                              {user.status === "active" && (
                                <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                  <Ban className="h-4 w-4 ml-2" />
                                  إيقاف
                                </DropdownMenuItem>
                              )}
                              {user.status === "suspended" && (
                                <DropdownMenuItem onClick={() => handleActivateUser(user.id)}>
                                  <CheckCircle2 className="h-4 w-4 ml-2" />
                                  إعادة التفعيل
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4 ml-2" />
                                حذف
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="companies">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>عرض الشركات المسجلة فقط</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>عرض الموظفين فقط</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="admins">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>عرض المديرين فقط</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تفاصيل المستخدم</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  {getRoleBadge(selectedUser.role)}
                </div>
              </div>
              
              <div className="grid gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.email}</span>
                  {selectedUser.emailVerified && (
                    <Badge variant="outline" className="mr-auto text-green-600">
                      <CheckCircle2 className="h-3 w-3 ml-1" />
                      مُفعّل
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{selectedUser.phone}</span>
                </div>
                {selectedUser.company && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedUser.company}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>مسجل منذ: {selectedUser.createdAt}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                {getStatusBadge(selectedUser.status)}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
            <Button>
              <Edit className="h-4 w-4 ml-2" />
              تعديل
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}