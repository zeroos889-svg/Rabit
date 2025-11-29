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
import { toast } from "sonner";
import {
  Calendar,
  Search,
  MoreVertical,
  Clock,
  CheckCircle2,
  XCircle,
  User,
  Building2,
  Phone,
  Mail,
  Video,
  MapPin,
  TrendingUp,
  Download,
  Eye,
  Check,
  X,
  CalendarDays,
  AlertCircle,
} from "lucide-react";

// بيانات تجريبية للحجوزات
const bookingsData = [
  {
    id: "BK-001",
    clientName: "أحمد محمد العلي",
    clientEmail: "ahmed@company.com",
    clientPhone: "+966512345678",
    company: "شركة التقنية المتقدمة",
    service: "استشارة موارد بشرية",
    date: "2025-01-25",
    time: "10:00",
    duration: 60,
    type: "online",
    status: "pending",
    notes: "يريد مناقشة نظام الرواتب",
    createdAt: "2025-01-20 09:30",
  },
  {
    id: "BK-002",
    clientName: "فاطمة علي السالم",
    clientEmail: "fatima@hr.com",
    clientPhone: "+966523456789",
    company: "مؤسسة الموارد البشرية",
    service: "تدريب فريق الموارد البشرية",
    date: "2025-01-23",
    time: "14:00",
    duration: 120,
    type: "onsite",
    status: "confirmed",
    notes: "تدريب 10 موظفين",
    createdAt: "2025-01-18 15:45",
  },
  {
    id: "BK-003",
    clientName: "محمد عبدالله",
    clientEmail: "mohamed@startup.sa",
    clientPhone: "+966534567890",
    company: "شركة الابتكار",
    service: "إعداد نظام التوظيف",
    date: "2025-01-22",
    time: "11:30",
    duration: 90,
    type: "online",
    status: "completed",
    notes: null,
    createdAt: "2025-01-15 10:00",
  },
  {
    id: "BK-004",
    clientName: "سارة خالد",
    clientEmail: "sara@business.com",
    clientPhone: "+966545678901",
    company: "شركة الأعمال",
    service: "مراجعة سياسات الشركة",
    date: "2025-01-24",
    time: "09:00",
    duration: 60,
    type: "online",
    status: "pending",
    notes: "مراجعة سياسات الإجازات",
    createdAt: "2025-01-19 14:20",
  },
  {
    id: "BK-005",
    clientName: "خالد أحمد",
    clientEmail: "khaled@test.com",
    clientPhone: "+966556789012",
    company: null,
    service: "استشارة فردية",
    date: "2025-01-21",
    time: "16:00",
    duration: 45,
    type: "online",
    status: "cancelled",
    notes: "تم الإلغاء من قبل العميل",
    createdAt: "2025-01-17 11:00",
  },
];

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<typeof bookingsData[0] | null>(null);

  // حساب الإحصائيات
  const stats = useMemo(() => ({
    total: bookingsData.length,
    pending: bookingsData.filter(b => b.status === "pending").length,
    confirmed: bookingsData.filter(b => b.status === "confirmed").length,
    completed: bookingsData.filter(b => b.status === "completed").length,
    cancelled: bookingsData.filter(b => b.status === "cancelled").length,
    online: bookingsData.filter(b => b.type === "online").length,
    onsite: bookingsData.filter(b => b.type === "onsite").length,
  }), []);

  // فلترة الحجوزات
  const filteredBookings = useMemo(() => {
    return bookingsData.filter(booking => {
      const matchesSearch = 
        booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = selectedStatus === "all" || booking.status === selectedStatus;
      const matchesType = selectedType === "all" || booking.type === selectedType;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [searchTerm, selectedStatus, selectedType]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
      pending: { label: "قيد الانتظار", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300", icon: Clock },
      confirmed: { label: "مؤكد", className: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300", icon: CheckCircle2 },
      completed: { label: "مكتمل", className: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300", icon: CheckCircle2 },
      cancelled: { label: "ملغي", className: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300", icon: XCircle },
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

  const getTypeBadge = (type: string) => {
    if (type === "online") {
      return (
        <Badge variant="outline" className="flex items-center gap-1">
          <Video className="h-3 w-3" />
          أونلاين
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <MapPin className="h-3 w-3" />
        حضوري
      </Badge>
    );
  };

  const handleViewBooking = (booking: typeof bookingsData[0]) => {
    setSelectedBooking(booking);
    setIsViewDialogOpen(true);
  };

  const handleConfirmBooking = (_bookingId: string) => {
    toast.success("تم تأكيد الحجز بنجاح");
  };

  const handleCancelBooking = (_bookingId: string) => {
    if (confirm("هل أنت متأكد من إلغاء هذا الحجز؟")) {
      toast.success("تم إلغاء الحجز");
    }
  };

  const handleCompleteBooking = (_bookingId: string) => {
    toast.success("تم تحديد الحجز كمكتمل");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
            <Calendar className="h-8 w-8 text-emerald-600" />
            إدارة الحجوزات
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة ومتابعة جميع حجوزات الاستشارات والخدمات
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 me-2" />
            تصدير
          </Button>
          <Button variant="outline">
            <CalendarDays className="h-4 w-4 me-2" />
            عرض التقويم
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              إجمالي الحجوزات
            </CardDescription>
            <CardTitle className="text-3xl text-emerald-600">{stats.total}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3 text-green-600" />
              <span className="text-green-600">+8%</span> هذا الأسبوع
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
              تحتاج تأكيد
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              مؤكدة
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.confirmed}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              جاهزة للتنفيذ
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
              تم تنفيذها
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              ملغاة
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{stats.cancelled}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.cancelled / stats.total) * 100)}% معدل الإلغاء
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions for Pending */}
      {stats.pending > 0 && (
        <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-semibold text-yellow-800 dark:text-yellow-200">
                  لديك {stats.pending} حجوزات تنتظر التأكيد
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  يرجى مراجعتها وتأكيدها في أقرب وقت
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bookings Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">جميع الحجوزات</TabsTrigger>
          <TabsTrigger value="today">اليوم</TabsTrigger>
          <TabsTrigger value="upcoming">القادمة</TabsTrigger>
          <TabsTrigger value="past">السابقة</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="بحث بالاسم أو البريد أو الخدمة أو رقم الحجز..."
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
                <SelectItem value="confirmed">مؤكد</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                <SelectItem value="online">أونلاين</SelectItem>
                <SelectItem value="onsite">حضوري</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <CardTitle>الحجوزات ({filteredBookings.length})</CardTitle>
              <CardDescription>قائمة بجميع الحجوزات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right">رقم الحجز</TableHead>
                      <TableHead className="text-right">العميل</TableHead>
                      <TableHead className="text-right">الخدمة</TableHead>
                      <TableHead className="text-right">التاريخ والوقت</TableHead>
                      <TableHead className="text-right">النوع</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-center">الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map(booking => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-mono font-semibold">
                          {booking.id}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                              {booking.clientName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{booking.clientName}</p>
                              <p className="text-xs text-muted-foreground">{booking.company || "فرد"}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm">{booking.service}</p>
                            <p className="text-xs text-muted-foreground">{booking.duration} دقيقة</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            {booking.date}
                            <Clock className="h-3 w-3 text-muted-foreground me-2" />
                            {booking.time}
                          </div>
                        </TableCell>
                        <TableCell>{getTypeBadge(booking.type)}</TableCell>
                        <TableCell>{getStatusBadge(booking.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewBooking(booking)}>
                                <Eye className="h-4 w-4 me-2" />
                                عرض التفاصيل
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {booking.status === "pending" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleConfirmBooking(booking.id)}>
                                    <Check className="h-4 w-4 me-2" />
                                    تأكيد الحجز
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <X className="h-4 w-4 me-2" />
                                    إلغاء الحجز
                                  </DropdownMenuItem>
                                </>
                              )}
                              {booking.status === "confirmed" && (
                                <>
                                  <DropdownMenuItem onClick={() => handleCompleteBooking(booking.id)}>
                                    <CheckCircle2 className="h-4 w-4 me-2" />
                                    تحديد كمكتمل
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    className="text-red-600"
                                    onClick={() => handleCancelBooking(booking.id)}
                                  >
                                    <X className="h-4 w-4 me-2" />
                                    إلغاء الحجز
                                  </DropdownMenuItem>
                                </>
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

        <TabsContent value="today">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>حجوزات اليوم</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="upcoming">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>الحجوزات القادمة</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="past">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>الحجوزات السابقة</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* View Booking Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-emerald-600" />
              تفاصيل الحجز
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono font-semibold text-lg">{selectedBooking.id}</span>
                {getStatusBadge(selectedBooking.status)}
              </div>
              
              <div className="grid gap-3">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    معلومات العميل
                  </h4>
                  <div className="space-y-2 text-sm">
                    <p>{selectedBooking.clientName}</p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {selectedBooking.clientEmail}
                    </p>
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3 w-3" />
                      {selectedBooking.clientPhone}
                    </p>
                    {selectedBooking.company && (
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="h-3 w-3" />
                        {selectedBooking.company}
                      </p>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h4 className="font-semibold mb-2">تفاصيل الحجز</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>الخدمة:</strong> {selectedBooking.service}</p>
                    <p className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      {selectedBooking.date} - {selectedBooking.time}
                    </p>
                    <p><strong>المدة:</strong> {selectedBooking.duration} دقيقة</p>
                    <div className="flex items-center gap-2">
                      <strong>النوع:</strong>
                      {getTypeBadge(selectedBooking.type)}
                    </div>
                  </div>
                </div>

                {selectedBooking.notes && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold mb-2">ملاحظات</h4>
                    <p className="text-sm">{selectedBooking.notes}</p>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  تم إنشاء الحجز في: {selectedBooking.createdAt}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              إغلاق
            </Button>
            {selectedBooking?.status === "pending" && (
              <Button 
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => {
                  handleConfirmBooking(selectedBooking.id);
                  setIsViewDialogOpen(false);
                }}
              >
                <Check className="h-4 w-4 me-2" />
                تأكيد الحجز
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}