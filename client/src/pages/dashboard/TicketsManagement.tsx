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
import { Textarea } from "@/components/ui/textarea";
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
  Ticket as TicketIcon,
  Plus,
  Search,
  Filter,
  Clock,
  AlertCircle,
  CheckCircle2,
  User,
  Calendar,
  MessageSquare,
  Paperclip,
  Send,
  Eye,
  Edit,
  Trash2,
  TrendingUp,
  MoreVertical,
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

interface Ticket {
  id: number;
  title: string;
  description: string;
  category: "leave" | "technical" | "hr" | "payroll" | "other";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in-progress" | "resolved" | "closed";
  createdBy: string;
  assignedTo?: string;
  createdDate: string;
  updatedDate: string;
  comments: number;
  attachments: number;
}

export default function TicketsManagement() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  // Mock data
  const tickets: Ticket[] = [
    {
      id: 1,
      title: "طلب إجازة سنوية - 15 يوم",
      description: "أرغب في الحصول على إجازة سنوية لمدة 15 يوم بدءاً من تاريخ 1 ديسمبر",
      category: "leave",
      priority: "medium",
      status: "open",
      createdBy: "أحمد محمد السعيد",
      assignedTo: "نورة سعيد (مدير HR)",
      createdDate: "2024-11-20",
      updatedDate: "2024-11-20",
      comments: 2,
      attachments: 1,
    },
    {
      id: 2,
      title: "مشكلة في تسجيل الدخول للنظام",
      description: "لا أستطيع تسجيل الدخول للنظام منذ صباح اليوم، رسالة خطأ غير واضحة",
      category: "technical",
      priority: "urgent",
      status: "in-progress",
      createdBy: "فاطمة علي الحارثي",
      assignedTo: "خالد عبدالله (IT)",
      createdDate: "2024-11-21",
      updatedDate: "2024-11-21",
      comments: 5,
      attachments: 2,
    },
    {
      id: 3,
      title: "استفسار عن كشف الراتب",
      description: "لدي استفسار بخصوص بند مخصصات السكن في كشف الراتب الأخير",
      category: "payroll",
      priority: "high",
      status: "open",
      createdBy: "محمد فهد الدوسري",
      assignedTo: "سارة أحمد (مالية)",
      createdDate: "2024-11-19",
      updatedDate: "2024-11-20",
      comments: 3,
      attachments: 0,
    },
    {
      id: 4,
      title: "طلب تحديث بيانات الاتصال",
      description: "أرغب في تحديث رقم الجوال والعنوان في ملفي الشخصي",
      category: "hr",
      priority: "low",
      status: "resolved",
      createdBy: "خالد عبدالله القحطاني",
      assignedTo: "نورة سعيد (مدير HR)",
      createdDate: "2024-11-18",
      updatedDate: "2024-11-19",
      comments: 1,
      attachments: 0,
    },
    {
      id: 5,
      title: "شكوى ضد زميل العمل",
      description: "أود تقديم شكوى رسمية بخصوص سلوك غير مهني من أحد الزملاء",
      category: "hr",
      priority: "urgent",
      status: "in-progress",
      createdBy: "نورة سعيد العتيبي",
      assignedTo: "مدير الموارد البشرية",
      createdDate: "2024-11-21",
      updatedDate: "2024-11-21",
      comments: 8,
      attachments: 3,
    },
  ];

  const categories = {
    leave: { label: isArabic ? "إجازة" : "Leave", color: "blue" },
    technical: { label: isArabic ? "تقني" : "Technical", color: "purple" },
    hr: { label: isArabic ? "موارد بشرية" : "HR", color: "green" },
    payroll: { label: isArabic ? "رواتب" : "Payroll", color: "orange" },
    other: { label: isArabic ? "أخرى" : "Other", color: "gray" },
  };

  const getPriorityBadge = (priority: Ticket["priority"]) => {
    const priorityConfig = {
      low: {
        label: isArabic ? "منخفض" : "Low",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
      },
      medium: {
        label: isArabic ? "متوسط" : "Medium",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
      },
      high: {
        label: isArabic ? "عالي" : "High",
        className: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
      },
      urgent: {
        label: isArabic ? "عاجل" : "Urgent",
        className: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
      },
    };

    const config = priorityConfig[priority];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: Ticket["status"]) => {
    const statusConfig = {
      open: {
        label: isArabic ? "مفتوح" : "Open",
        className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
        icon: Clock,
      },
      "in-progress": {
        label: isArabic ? "قيد المعالجة" : "In Progress",
        className: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
        icon: AlertCircle,
      },
      resolved: {
        label: isArabic ? "تم الحل" : "Resolved",
        className: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
        icon: CheckCircle2,
      },
      closed: {
        label: isArabic ? "مغلق" : "Closed",
        className: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
        icon: CheckCircle2,
      },
    };

    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    );
  };

  const handleAddTicket = () => {
    toast.success(isArabic ? "تم إنشاء التذكرة بنجاح" : "Ticket created successfully");
    setIsAddDialogOpen(false);
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsViewDialogOpen(true);
  };

  const handleDeleteTicket = (ticket: Ticket) => {
    toast.error(
      isArabic ? `تم حذف التذكرة: ${ticket.title}` : `Deleted ticket: ${ticket.title}`
    );
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    const matchesPriority =
      filterPriority === "all" || ticket.priority === filterPriority;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <TicketIcon className="w-8 h-8 text-blue-600" />
              {isArabic ? "نظام التذاكر" : "Tickets System"}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic
                ? "إدارة طلبات واستفسارات الموظفين"
                : "Manage employee requests and inquiries"}
            </p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                <Plus className="w-4 h-4 ml-2" />
                {isArabic ? "إنشاء تذكرة" : "Create Ticket"}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {isArabic ? "إنشاء تذكرة جديدة" : "Create New Ticket"}
                </DialogTitle>
                <DialogDescription>
                  {isArabic ? "أدخل تفاصيل التذكرة" : "Enter ticket details"}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>{isArabic ? "العنوان" : "Title"}</Label>
                  <Input
                    placeholder={
                      isArabic ? "عنوان التذكرة..." : "Ticket title..."
                    }
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? "الفئة" : "Category"}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(categories).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? "الأولوية" : "Priority"}</Label>
                    <Select defaultValue="medium">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">
                          {isArabic ? "منخفض" : "Low"}
                        </SelectItem>
                        <SelectItem value="medium">
                          {isArabic ? "متوسط" : "Medium"}
                        </SelectItem>
                        <SelectItem value="high">
                          {isArabic ? "عالي" : "High"}
                        </SelectItem>
                        <SelectItem value="urgent">
                          {isArabic ? "عاجل" : "Urgent"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? "تعيين إلى" : "Assign To"}</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={isArabic ? "اختر موظف" : "Select employee"}
                        />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hr">
                          {isArabic ? "فريق الموارد البشرية" : "HR Team"}
                        </SelectItem>
                        <SelectItem value="it">
                          {isArabic ? "فريق تقنية المعلومات" : "IT Team"}
                        </SelectItem>
                        <SelectItem value="finance">
                          {isArabic ? "فريق المالية" : "Finance Team"}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{isArabic ? "الوصف" : "Description"}</Label>
                  <Textarea
                    placeholder={
                      isArabic
                        ? "اكتب وصف تفصيلي للمشكلة أو الطلب..."
                        : "Write detailed description..."
                    }
                    rows={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isArabic ? "المرفقات" : "Attachments"}</Label>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Paperclip className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      {isArabic
                        ? "اسحب وأفلت الملفات هنا أو انقر للتصفح"
                        : "Drag & drop files here or click to browse"}
                    </p>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-purple-600"
                  onClick={handleAddTicket}
                >
                  <Send className="w-4 h-4 ml-2" />
                  {isArabic ? "إرسال" : "Submit"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "إجمالي التذاكر" : "Total Tickets"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "جميع التذاكر" : "all tickets"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "مفتوحة" : "Open"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.open}</div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "بانتظار الرد" : "awaiting response"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "قيد المعالجة" : "In Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {stats.inProgress}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "قيد العمل" : "being worked on"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "تم الحل" : "Resolved"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.resolved}</div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "هذا الشهر" : "this month"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
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
                      isArabic ? "ابحث في التذاكر..." : "Search tickets..."
                    }
                    className="pr-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 ml-2" />
                    <SelectValue placeholder={isArabic ? "الحالة" : "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {isArabic ? "جميع الحالات" : "All Status"}
                    </SelectItem>
                    <SelectItem value="open">
                      {isArabic ? "مفتوح" : "Open"}
                    </SelectItem>
                    <SelectItem value="in-progress">
                      {isArabic ? "قيد المعالجة" : "In Progress"}
                    </SelectItem>
                    <SelectItem value="resolved">
                      {isArabic ? "تم الحل" : "Resolved"}
                    </SelectItem>
                    <SelectItem value="closed">
                      {isArabic ? "مغلق" : "Closed"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder={isArabic ? "الأولوية" : "Priority"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {isArabic ? "جميع الأولويات" : "All Priorities"}
                    </SelectItem>
                    <SelectItem value="urgent">
                      {isArabic ? "عاجل" : "Urgent"}
                    </SelectItem>
                    <SelectItem value="high">
                      {isArabic ? "عالي" : "High"}
                    </SelectItem>
                    <SelectItem value="medium">
                      {isArabic ? "متوسط" : "Medium"}
                    </SelectItem>
                    <SelectItem value="low">
                      {isArabic ? "منخفض" : "Low"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tickets List */}
        <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "قائمة التذاكر" : "Tickets List"}</CardTitle>
            <CardDescription>
              {isArabic
                ? `عرض ${filteredTickets.length} من ${tickets.length} تذكرة`
                : `Showing ${filteredTickets.length} of ${tickets.length} tickets`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                            #{ticket.id}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold mb-1">{ticket.title}</h3>
                            <p className="text-sm text-gray-600 mb-3">
                              {ticket.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                className={`bg-${categories[ticket.category].color}-100 text-${categories[ticket.category].color}-800`}
                              >
                                {categories[ticket.category].label}
                              </Badge>
                              {getPriorityBadge(ticket.priority)}
                              {getStatusBadge(ticket.status)}
                            </div>
                          </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 mt-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>
                              {isArabic ? "أنشأ بواسطة:" : "Created by:"}{" "}
                              {ticket.createdBy}
                            </span>
                          </div>
                          {ticket.assignedTo && (
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              <span>
                                {isArabic ? "معين إلى:" : "Assigned to:"}{" "}
                                {ticket.assignedTo}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {isArabic ? "تاريخ الإنشاء:" : "Created:"}{" "}
                              {ticket.createdDate}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4" />
                            <span>
                              {ticket.comments} {isArabic ? "تعليق" : "comments"}
                            </span>
                            {ticket.attachments > 0 && (
                              <>
                                <Paperclip className="w-4 h-4 mr-2" />
                                <span>
                                  {ticket.attachments} {isArabic ? "مرفق" : "attachments"}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewTicket(ticket)}
                        >
                          <Eye className="w-4 h-4 ml-2" />
                          {isArabic ? "عرض" : "View"}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>
                              {isArabic ? "الإجراءات" : "Actions"}
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 ml-2" />
                              {isArabic ? "تعديل" : "Edit"}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MessageSquare className="w-4 h-4 ml-2" />
                              {isArabic ? "إضافة تعليق" : "Add Comment"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteTicket(ticket)}
                            >
                              <Trash2 className="w-4 h-4 ml-2" />
                              {isArabic ? "حذف" : "Delete"}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* View Ticket Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            {selectedTicket && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <span className="text-blue-600">#{selectedTicket.id}</span>
                    {selectedTicket.title}
                  </DialogTitle>
                  <DialogDescription className="flex gap-2 mt-2">
                    {getPriorityBadge(selectedTicket.priority)}
                    {getStatusBadge(selectedTicket.status)}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">
                      {isArabic ? "الوصف" : "Description"}
                    </h4>
                    <p className="text-gray-600">{selectedTicket.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-semibold">
                        {isArabic ? "أنشأ بواسطة:" : "Created by:"}
                      </span>
                      <p className="text-gray-600">{selectedTicket.createdBy}</p>
                    </div>
                    {selectedTicket.assignedTo && (
                      <div>
                        <span className="font-semibold">
                          {isArabic ? "معين إلى:" : "Assigned to:"}
                        </span>
                        <p className="text-gray-600">{selectedTicket.assignedTo}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-semibold">
                        {isArabic ? "تاريخ الإنشاء:" : "Created:"}
                      </span>
                      <p className="text-gray-600">{selectedTicket.createdDate}</p>
                    </div>
                    <div>
                      <span className="font-semibold">
                        {isArabic ? "آخر تحديث:" : "Last updated:"}
                      </span>
                      <p className="text-gray-600">{selectedTicket.updatedDate}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">
                      {isArabic ? "التعليقات" : "Comments"} ({selectedTicket.comments})
                    </h4>
                    <div className="space-y-3">
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm text-gray-600">
                            {isArabic
                              ? "لا توجد تعليقات بعد..."
                              : "No comments yet..."}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder={
                        isArabic ? "اكتب تعليقاً..." : "Write a comment..."
                      }
                    />
                    <Button>
                      <Send className="w-4 h-4 ml-2" />
                      {isArabic ? "إرسال" : "Send"}
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
