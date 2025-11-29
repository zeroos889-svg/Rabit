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
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  CreditCard,
  Search,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Download,
  Eye,
  RefreshCw,
  Pause,
  Play,
  DollarSign,
  Users,
  Calendar,
  AlertTriangle,
  Crown,
  Zap,
  Star,
} from "lucide-react";

// بيانات تجريبية للاشتراكات
const subscriptionsData = [
  {
    id: "SUB-001",
    companyName: "شركة التقنية المتقدمة",
    companyEmail: "info@tech-advanced.sa",
    plan: "enterprise",
    planName: "باقة المؤسسات",
    price: 2999,
    billingCycle: "monthly",
    status: "active",
    startDate: "2024-06-15",
    nextBillingDate: "2025-02-15",
    employeesLimit: 500,
    employeesUsed: 156,
    features: ["جميع المميزات", "دعم أولوية", "API مخصص", "تدريب مجاني"],
    createdAt: "2024-06-15",
  },
  {
    id: "SUB-002",
    companyName: "مؤسسة الموارد البشرية",
    companyEmail: "contact@hr-foundation.sa",
    plan: "professional",
    planName: "باقة الشركات",
    price: 999,
    billingCycle: "monthly",
    status: "active",
    startDate: "2024-08-01",
    nextBillingDate: "2025-02-01",
    employeesLimit: 100,
    employeesUsed: 45,
    features: ["إدارة الموظفين", "نظام الرواتب", "التقارير", "الدعم الفني"],
    createdAt: "2024-08-01",
  },
  {
    id: "SUB-003",
    companyName: "شركة الابتكار",
    companyEmail: "hello@innovation.sa",
    plan: "starter",
    planName: "باقة البداية",
    price: 299,
    billingCycle: "monthly",
    status: "trial",
    startDate: "2025-01-10",
    nextBillingDate: "2025-01-24",
    employeesLimit: 25,
    employeesUsed: 8,
    features: ["إدارة الموظفين", "نظام الحضور", "التقارير الأساسية"],
    createdAt: "2025-01-10",
  },
  {
    id: "SUB-004",
    companyName: "مؤسسة الأعمال التجارية",
    companyEmail: "admin@business.sa",
    plan: "professional",
    planName: "باقة الشركات",
    price: 999,
    billingCycle: "yearly",
    status: "expired",
    startDate: "2024-01-01",
    nextBillingDate: "2025-01-01",
    employeesLimit: 100,
    employeesUsed: 78,
    features: ["إدارة الموظفين", "نظام الرواتب", "التقارير", "الدعم الفني"],
    createdAt: "2024-01-01",
  },
  {
    id: "SUB-005",
    companyName: "شركة النمو السريع",
    companyEmail: "growth@fastgrowth.sa",
    plan: "enterprise",
    planName: "باقة المؤسسات",
    price: 2999,
    billingCycle: "yearly",
    status: "paused",
    startDate: "2024-03-01",
    nextBillingDate: "2025-03-01",
    employeesLimit: 500,
    employeesUsed: 234,
    features: ["جميع المميزات", "دعم أولوية", "API مخصص", "تدريب مجاني"],
    createdAt: "2024-03-01",
  },
];

export default function AdminSubscriptions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<typeof subscriptionsData[0] | null>(null);

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const totalRevenue = subscriptionsData
      .filter(s => s.status === "active")
      .reduce((acc, s) => acc + s.price, 0);
    
    return {
      total: subscriptionsData.length,
      active: subscriptionsData.filter(s => s.status === "active").length,
      trial: subscriptionsData.filter(s => s.status === "trial").length,
      expired: subscriptionsData.filter(s => s.status === "expired").length,
      paused: subscriptionsData.filter(s => s.status === "paused").length,
      monthlyRevenue: totalRevenue,
      yearlyRevenue: totalRevenue * 12,
      totalEmployees: subscriptionsData.reduce((acc, s) => acc + s.employeesUsed, 0),
    };
  }, []);

  // فلترة الاشتراكات
  const filteredSubscriptions = useMemo(() => {
    return subscriptionsData.filter(sub => {
      const matchesSearch = 
        sub.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.companyEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || sub.status === selectedStatus;
      const matchesPlan = selectedPlan === "all" || sub.plan === selectedPlan;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [searchTerm, selectedStatus, selectedPlan]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
      active: { label: "نشط", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", icon: CheckCircle2 },
      trial: { label: "تجريبي", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", icon: Clock },
      expired: { label: "منتهي", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", icon: XCircle },
      paused: { label: "متوقف", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", icon: Pause },
      cancelled: { label: "ملغي", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: XCircle },
    };
    const config = variants[status] || variants.active;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const getPlanBadge = (plan: string) => {
    const variants: Record<string, { label: string; className: string; icon: typeof Star }> = {
      starter: { label: "بداية", className: "bg-gray-100 text-gray-700", icon: Star },
      professional: { label: "شركات", className: "bg-blue-100 text-blue-700", icon: Zap },
      enterprise: { label: "مؤسسات", className: "bg-purple-100 text-purple-700", icon: Crown },
    };
    const config = variants[plan] || variants.starter;
    const Icon = config.icon;
    return (
      <Badge className={`${config.className} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleViewSubscription = (sub: typeof subscriptionsData[0]) => {
    setSelectedSubscription(sub);
    setIsViewDialogOpen(true);
  };

  const handleRenewSubscription = (_subId: string) => {
    toast.success("تم تجديد الاشتراك بنجاح");
  };

  const handlePauseSubscription = (_subId: string) => {
    toast.success("تم إيقاف الاشتراك مؤقتاً");
  };

  const handleResumeSubscription = (_subId: string) => {
    toast.success("تم استئناف الاشتراك");
  };

  const handleCancelSubscription = (_subId: string) => {
    if (confirm("هل أنت متأكد من إلغاء هذا الاشتراك؟")) {
      toast.success("تم إلغاء الاشتراك");
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-purple-600" />
            إدارة الاشتراكات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومتابعة جميع اشتراكات الشركات
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 me-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <DollarSign className="h-4 w-4" />
              الإيرادات الشهرية
            </CardDescription>
            <CardTitle className="text-3xl text-green-700 dark:text-green-300">
              ﷼ {stats.monthlyRevenue.toLocaleString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              +15% عن الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              الاشتراكات النشطة
            </CardDescription>
            <CardTitle className="text-3xl text-purple-600">{stats.active}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              من أصل {stats.total} اشتراك
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              تجريبي
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.trial}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              قيد التجربة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              إجمالي الموظفين
            </CardDescription>
            <CardTitle className="text-3xl text-orange-600">{stats.totalEmployees}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              عبر جميع الشركات
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Expiring Soon Alert */}
      {stats.trial > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-800 dark:text-blue-200">
                  {stats.trial} اشتراكات تجريبية قاربت على الانتهاء
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  تواصل مع هذه الشركات لتحويلها إلى اشتراكات مدفوعة
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subscriptions Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">جميع الاشتراكات</TabsTrigger>
          <TabsTrigger value="active">النشطة</TabsTrigger>
          <TabsTrigger value="trial">التجريبية</TabsTrigger>
          <TabsTrigger value="expired">المنتهية</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث بالشركة أو البريد أو رقم الاشتراك..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="active">نشط</SelectItem>
                <SelectItem value="trial">تجريبي</SelectItem>
                <SelectItem value="expired">منتهي</SelectItem>
                <SelectItem value="paused">متوقف</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedPlan} onValueChange={setSelectedPlan}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="الباقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الباقات</SelectItem>
                <SelectItem value="starter">بداية</SelectItem>
                <SelectItem value="professional">شركات</SelectItem>
                <SelectItem value="enterprise">مؤسسات</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Subscriptions Table */}
          <Card>
            <CardHeader>
              <CardTitle>الاشتراكات ({filteredSubscriptions.length})</CardTitle>
              <CardDescription>قائمة بجميع اشتراكات الشركات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">الشركة</TableHead>
                      <TableHead className="text-right">الباقة</TableHead>
                      <TableHead className="text-right">السعر</TableHead>
                      <TableHead className="text-right">الموظفين</TableHead>
                      <TableHead className="text-right">الفوترة القادمة</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubscriptions.map(sub => (
                      <TableRow key={sub.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                              {sub.companyName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{sub.companyName}</p>
                              <p className="text-xs text-muted-foreground">{sub.companyEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{getPlanBadge(sub.plan)}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-semibold">﷼ {sub.price}</p>
                            <p className="text-xs text-muted-foreground">
                              {sub.billingCycle === "monthly" ? "شهرياً" : "سنوياً"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span>{sub.employeesUsed}</span>
                              <span className="text-muted-foreground">/ {sub.employeesLimit}</span>
                            </div>
                            <Progress 
                              value={(sub.employeesUsed / sub.employeesLimit) * 100} 
                              className="h-1.5"
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {sub.nextBillingDate}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(sub.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewSubscription(sub)}>
                                <Eye className="h-4 w-4 me-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {sub.status === "expired" && (
                                <DropdownMenuItem onClick={() => handleRenewSubscription(sub.id)}>
                                  <RefreshCw className="h-4 w-4 me-2" />
                                  تجديد الاشتراك
                                </DropdownMenuItem>
                              )}
                              {sub.status === "active" && (
                                <DropdownMenuItem onClick={() => handlePauseSubscription(sub.id)}>
                                  <Pause className="h-4 w-4 me-2" />
                                  إيقاف مؤقت
                                </DropdownMenuItem>
                              )}
                              {sub.status === "paused" && (
                                <DropdownMenuItem onClick={() => handleResumeSubscription(sub.id)}>
                                  <Play className="h-4 w-4 me-2" />
                                  استئناف
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleCancelSubscription(sub.id)}
                              >
                                <XCircle className="h-4 w-4 me-2" />
                                إلغاء الاشتراك
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

        <TabsContent value="active">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>الاشتراكات النشطة فقط</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>الاشتراكات التجريبية</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expired">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <XCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>الاشتراكات المنتهية</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Subscription Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-purple-600" />
              تفاصيل الاشتراك
            </DialogTitle>
          </DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                    {selectedSubscription.companyName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{selectedSubscription.companyName}</h3>
                    <p className="text-sm text-muted-foreground">{selectedSubscription.companyEmail}</p>
                  </div>
                </div>
                {getStatusBadge(selectedSubscription.status)}
              </div>
              
              <div className="grid gap-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-3">تفاصيل الباقة</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">الباقة</p>
                      <div className="mt-1">{getPlanBadge(selectedSubscription.plan)}</div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">السعر</p>
                      <p className="font-semibold">﷼ {selectedSubscription.price} / {selectedSubscription.billingCycle === "monthly" ? "شهر" : "سنة"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">تاريخ البدء</p>
                      <p>{selectedSubscription.startDate}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">الفوترة القادمة</p>
                      <p>{selectedSubscription.nextBillingDate}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-3">استخدام الموظفين</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{selectedSubscription.employeesUsed} موظف مستخدم</span>
                      <span className="text-muted-foreground">من أصل {selectedSubscription.employeesLimit}</span>
                    </div>
                    <Progress 
                      value={(selectedSubscription.employeesUsed / selectedSubscription.employeesLimit) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h4 className="font-semibold mb-2">المميزات المتاحة</h4>
                  <ul className="grid grid-cols-2 gap-2 text-sm">
                    {selectedSubscription.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
            {selectedSubscription?.status === "expired" && (
              <Button 
                className="bg-gradient-to-r from-purple-600 to-pink-600"
                onClick={() => {
                  handleRenewSubscription(selectedSubscription.id);
                  setIsViewDialogOpen(false);
                }}
              >
                <RefreshCw className="h-4 w-4 me-2" />
                تجديد الاشتراك
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}