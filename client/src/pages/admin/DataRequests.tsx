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
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  Search,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Mail,
  Download,
  Eye,
  Check,
  X,
  Shield,
  AlertCircle,
  Trash2,
  FileDown,
  UserX,
  Database,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

// أنواع طلبات البيانات حسب PDPL
type RequestType = "access" | "correction" | "deletion" | "portability" | "objection";

// بيانات تجريبية لطلبات البيانات
const dataRequestsData = [
  {
    id: "DR-001",
    requestType: "access" as RequestType,
    requestTypeName: "طلب الوصول للبيانات",
    userName: "أحمد محمد العلي",
    userEmail: "ahmed@example.com",
    userPhone: "+966512345678",
    description: "أريد نسخة من جميع بياناتي الشخصية المخزنة لديكم",
    status: "pending",
    priority: "normal",
    submittedAt: "2025-01-18 09:30",
    dueDate: "2025-02-17",
    assignedTo: "فريق الخصوصية",
    response: null,
    attachments: [],
  },
  {
    id: "DR-002",
    requestType: "deletion" as RequestType,
    requestTypeName: "طلب حذف البيانات",
    userName: "فاطمة علي السالم",
    userEmail: "fatima@example.com",
    userPhone: "+966523456789",
    description: "أرغب في حذف حسابي وجميع البيانات المرتبطة به نهائياً",
    status: "in_progress",
    priority: "high",
    submittedAt: "2025-01-15 14:45",
    dueDate: "2025-02-14",
    assignedTo: "فريق الخصوصية",
    response: null,
    attachments: [],
  },
  {
    id: "DR-003",
    requestType: "correction" as RequestType,
    requestTypeName: "طلب تصحيح البيانات",
    userName: "محمد عبدالله",
    userEmail: "mohamed@example.com",
    userPhone: "+966534567890",
    description: "رقم الهاتف المسجل خاطئ، الرجاء تصحيحه",
    status: "completed",
    priority: "normal",
    submittedAt: "2025-01-10 11:00",
    dueDate: "2025-02-09",
    assignedTo: "فريق الخصوصية",
    response: "تم تصحيح رقم الهاتف بنجاح",
    attachments: [],
  },
  {
    id: "DR-004",
    requestType: "portability" as RequestType,
    requestTypeName: "طلب نقل البيانات",
    userName: "سارة خالد",
    userEmail: "sara@example.com",
    userPhone: "+966545678901",
    description: "أريد تصدير جميع بياناتي بصيغة قابلة للقراءة",
    status: "pending",
    priority: "normal",
    submittedAt: "2025-01-20 16:20",
    dueDate: "2025-02-19",
    assignedTo: null,
    response: null,
    attachments: [],
  },
  {
    id: "DR-005",
    requestType: "objection" as RequestType,
    requestTypeName: "طلب الاعتراض على المعالجة",
    userName: "خالد أحمد",
    userEmail: "khaled@example.com",
    userPhone: "+966556789012",
    description: "أعترض على استخدام بياناتي للتسويق",
    status: "rejected",
    priority: "low",
    submittedAt: "2025-01-05 10:15",
    dueDate: "2025-02-04",
    assignedTo: "فريق الخصوصية",
    response: "تم رفض الطلب: البيانات مطلوبة لتنفيذ العقد",
    attachments: [],
  },
];

export default function AdminDataRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<typeof dataRequestsData[0] | null>(null);
  const [responseText, setResponseText] = useState("");

  // حساب الإحصائيات
  const stats = useMemo(() => {
    const now = new Date();
    const overdue = dataRequestsData.filter(r => {
      const dueDate = new Date(r.dueDate);
      return dueDate < now && r.status !== "completed" && r.status !== "rejected";
    }).length;

    return {
      total: dataRequestsData.length,
      pending: dataRequestsData.filter(r => r.status === "pending").length,
      inProgress: dataRequestsData.filter(r => r.status === "in_progress").length,
      completed: dataRequestsData.filter(r => r.status === "completed").length,
      rejected: dataRequestsData.filter(r => r.status === "rejected").length,
      overdue,
      access: dataRequestsData.filter(r => r.requestType === "access").length,
      deletion: dataRequestsData.filter(r => r.requestType === "deletion").length,
    };
  }, []);

  // فلترة الطلبات
  const filteredRequests = useMemo(() => {
    return dataRequestsData.filter(request => {
      const matchesSearch = 
        request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        request.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || request.status === selectedStatus;
      const matchesType = selectedType === "all" || request.requestType === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, selectedStatus, selectedType]);

  const getRequestTypeIcon = (type: RequestType) => {
    const icons: Record<RequestType, typeof FileText> = {
      access: FileDown,
      correction: FileText,
      deletion: Trash2,
      portability: Database,
      objection: UserX,
    };
    return icons[type] || FileText;
  };

  const getRequestTypeBadge = (type: RequestType, name: string) => {
    const colors: Record<RequestType, string> = {
      access: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
      correction: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
      deletion: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
      portability: "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
      objection: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
    };
    const Icon = getRequestTypeIcon(type);
    return (
      <Badge className={`${colors[type]} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {name}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
      pending: { label: "قيد الانتظار", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", icon: Clock },
      in_progress: { label: "قيد المعالجة", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", icon: Clock },
      completed: { label: "مكتمل", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", icon: CheckCircle2 },
      rejected: { label: "مرفوض", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", icon: XCircle },
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

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-red-600 font-semibold">متأخر {Math.abs(diffDays)} يوم!</span>;
    } else if (diffDays <= 7) {
      return <span className="text-yellow-600 font-semibold">متبقي {diffDays} أيام</span>;
    }
    return <span className="text-muted-foreground">متبقي {diffDays} يوم</span>;
  };

  const handleViewRequest = (request: typeof dataRequestsData[0]) => {
    setSelectedRequest(request);
    setIsViewDialogOpen(true);
  };

  const handleOpenResponse = (request: typeof dataRequestsData[0]) => {
    setSelectedRequest(request);
    setResponseText("");
    setIsResponseDialogOpen(true);
  };

  const handleCompleteRequest = () => {
    if (!responseText.trim()) {
      toast.error("يرجى إدخال الرد");
      return;
    }
    toast.success("تم إكمال الطلب بنجاح");
    setIsResponseDialogOpen(false);
  };

  const handleRejectRequest = () => {
    if (!responseText.trim()) {
      toast.error("يرجى إدخال سبب الرفض");
      return;
    }
    toast.success("تم رفض الطلب");
    setIsResponseDialogOpen(false);
  };

  const handleStartProcessing = (requestId: string) => {
    toast.success("تم بدء معالجة الطلب");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-2">
            <Shield className="h-8 w-8 text-teal-600" />
            طلبات البيانات (PDPL)
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة طلبات الوصول والحذف والتصحيح حسب نظام حماية البيانات الشخصية
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* PDPL Compliance Notice */}
      <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950 dark:to-cyan-950 border-teal-200 dark:border-teal-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Shield className="h-6 w-6 text-teal-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-teal-800 dark:text-teal-200">متطلبات PDPL</h3>
              <ul className="text-sm text-teal-700 dark:text-teal-300 mt-2 space-y-1">
                <li>• يجب الرد على طلبات الوصول خلال <strong>30 يوماً</strong></li>
                <li>• يجب الرد على طلبات الحذف خلال <strong>30 يوماً</strong> (قابل للتمديد 30 يوماً إضافية)</li>
                <li>• يجب توفير البيانات بصيغة قابلة للقراءة عند طلب النقل</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              إجمالي الطلبات
            </CardDescription>
            <CardTitle className="text-3xl text-teal-600">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              هذا الشهر
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              قيد الانتظار
            </CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{stats.pending}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              تحتاج معالجة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              مكتملة
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.completed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              تم الرد عليها
            </p>
          </CardContent>
        </Card>
        <Card className={stats.overdue > 0 ? "border-red-300 dark:border-red-800" : ""}>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-4 w-4" />
              متأخرة
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.overdue}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-red-600">
              تجاوزت المدة القانونية!
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Trash2 className="h-4 w-4" />
              طلبات حذف
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.deletion}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              تحتاج أولوية
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Alert */}
      {stats.overdue > 0 && (
        <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-semibold text-red-800 dark:text-red-200">
                  تحذير: {stats.overdue} طلبات تجاوزت المدة القانونية!
                </p>
                <p className="text-sm text-red-700 dark:text-red-300">
                  يجب معالجة هذه الطلبات فوراً لتجنب المخالفات
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Requests Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">جميع الطلبات</TabsTrigger>
          <TabsTrigger value="access">طلبات الوصول</TabsTrigger>
          <TabsTrigger value="deletion">طلبات الحذف</TabsTrigger>
          <TabsTrigger value="correction">طلبات التصحيح</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث بالاسم أو البريد أو رقم الطلب..."
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
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="نوع الطلب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="access">طلب وصول</SelectItem>
                <SelectItem value="correction">طلب تصحيح</SelectItem>
                <SelectItem value="deletion">طلب حذف</SelectItem>
                <SelectItem value="portability">طلب نقل</SelectItem>
                <SelectItem value="objection">اعتراض</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Requests Table */}
          <Card>
            <CardHeader>
              <CardTitle>طلبات البيانات ({filteredRequests.length})</CardTitle>
              <CardDescription>قائمة بجميع طلبات البيانات الشخصية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الطلب</TableHead>
                      <TableHead className="text-right">مقدم الطلب</TableHead>
                      <TableHead className="text-right">نوع الطلب</TableHead>
                      <TableHead className="text-right">تاريخ التقديم</TableHead>
                      <TableHead className="text-right">الموعد النهائي</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map(request => (
                      <TableRow key={request.id}>
                        <TableCell className="font-mono font-semibold">
                          {request.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                              {request.userName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{request.userName}</p>
                              <p className="text-xs text-muted-foreground">{request.userEmail}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getRequestTypeBadge(request.requestType, request.requestTypeName)}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {request.submittedAt.split(" ")[0]}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {getDaysRemaining(request.dueDate)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewRequest(request)}>
                                <Eye className="h-4 w-4 ml-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {request.status === "pending" && (
                                <DropdownMenuItem onClick={() => handleStartProcessing(request.id)}>
                                  <Clock className="h-4 w-4 ml-2" />
                                  بدء المعالجة
                                </DropdownMenuItem>
                              )}
                              {(request.status === "pending" || request.status === "in_progress") && (
                                  <DropdownMenuItem onClick={() => handleOpenResponse(request)}>
                                    <Check className="h-4 w-4 ml-2" />
                                    الرد على الطلب
                                  </DropdownMenuItem>
                              )}
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

        <TabsContent value="access">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileDown className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>طلبات الوصول للبيانات فقط</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deletion">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Trash2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>طلبات حذف البيانات فقط</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="correction">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>طلبات تصحيح البيانات فقط</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Request Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-teal-600" />
              تفاصيل الطلب
            </DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-lg">{selectedRequest.id}</span>
                {getStatusBadge(selectedRequest.status)}
              </div>
              
              <div className="grid gap-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    معلومات مقدم الطلب
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>{selectedRequest.userName}</p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {selectedRequest.userEmail}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">تفاصيل الطلب</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <strong>النوع:</strong>
                      {getRequestTypeBadge(selectedRequest.requestType, selectedRequest.requestTypeName)}
                    </div>
                    <p><strong>الوصف:</strong> {selectedRequest.description}</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <strong>تاريخ التقديم:</strong> {selectedRequest.submittedAt}
                    </p>
                    <p>
                      <strong>الموعد النهائي:</strong> {selectedRequest.dueDate} ({getDaysRemaining(selectedRequest.dueDate)})
                    </p>
                  </div>
                </div>

                {selectedRequest.response && (
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold mb-2">الرد</h4>
                    <p className="text-sm">{selectedRequest.response}</p>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
            {selectedRequest && (selectedRequest.status === "pending" || selectedRequest.status === "in_progress") && (
              <Button 
                className="bg-teal-600 hover:bg-teal-700"
                onClick={() => {
                  setIsViewDialogOpen(false);
                  handleOpenResponse(selectedRequest);
                }}
              >
                <Check className="h-4 w-4 ml-2" />
                الرد على الطلب
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Response Dialog */}
      <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>الرد على الطلب</DialogTitle>
            <DialogDescription>
              أدخل ردك على طلب البيانات
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>الرد / الإجراء المتخذ *</Label>
              <Textarea
                placeholder="اشرح الإجراء المتخذ أو سبب الرفض..."
                value={responseText}
                onChange={e => setResponseText(e.target.value)}
                rows={5}
              />
            </div>
            <div className="bg-teal-50 dark:bg-teal-950 p-3 rounded-lg text-sm">
              <p className="text-teal-700 dark:text-teal-300">
                سيتم إرسال إشعار تلقائي لمقدم الطلب عند إكمال الرد
              </p>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={() => setIsResponseDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectRequest}
            >
              <X className="h-4 w-4 ml-2" />
              رفض الطلب
            </Button>
            <Button 
              className="bg-teal-600 hover:bg-teal-700"
              onClick={handleCompleteRequest}
            >
              <Check className="h-4 w-4 ml-2" />
              إكمال الطلب
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}