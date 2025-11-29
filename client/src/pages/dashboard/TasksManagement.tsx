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
  CheckSquare,
  Plus,
  Calendar,
  User,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  GripVertical,
  Edit,
  Trash2,
  Eye,
  Search,
} from "lucide-react";
import { toast } from "sonner";

interface Task {
  id: number;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "review" | "done";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo: string;
  dueDate: string;
  createdDate: string;
  category: string;
  tags: string[];
}

export default function TasksManagement() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data
  const tasks: Task[] = [
    {
      id: 1,
      title: "مراجعة طلبات الإجازات المعلقة",
      description: "مراجعة واعتماد 15 طلب إجازة معلق من الموظفين",
      status: "todo",
      priority: "high",
      assignedTo: "نورة سعيد",
      dueDate: "2024-11-25",
      createdDate: "2024-11-20",
      category: "HR",
      tags: ["إجازات", "موافقات"],
    },
    {
      id: 2,
      title: "إعداد تقرير الرواتب الشهري",
      description: "تجهيز تقرير الرواتب لشهر نوفمبر وإرساله للمالية",
      status: "in-progress",
      priority: "urgent",
      assignedTo: "سارة أحمد",
      dueDate: "2024-11-22",
      createdDate: "2024-11-18",
      category: "Finance",
      tags: ["رواتب", "تقارير"],
    },
    {
      id: 3,
      title: "مقابلة مرشح لوظيفة مطور",
      description: "إجراء مقابلة فنية مع المرشح أحمد محمد",
      status: "in-progress",
      priority: "medium",
      assignedTo: "خالد عبدالله",
      dueDate: "2024-11-21",
      createdDate: "2024-11-15",
      category: "Recruitment",
      tags: ["توظيف", "مقابلات"],
    },
    {
      id: 4,
      title: "تحديث سياسات الشركة",
      description: "مراجعة وتحديث سياسات العمل عن بُعد",
      status: "review",
      priority: "medium",
      assignedTo: "نورة سعيد",
      dueDate: "2024-11-28",
      createdDate: "2024-11-10",
      category: "HR",
      tags: ["سياسات", "توثيق"],
    },
    {
      id: 5,
      title: "تدريب الموظفين الجدد",
      description: "إعداد برنامج تدريبي للموظفين الجدد الثلاثة",
      status: "done",
      priority: "high",
      assignedTo: "فاطمة علي",
      dueDate: "2024-11-20",
      createdDate: "2024-11-12",
      category: "Training",
      tags: ["تدريب", "موظفين جدد"],
    },
    {
      id: 6,
      title: "حل مشكلة نظام الحضور",
      description: "إصلاح خلل في نظام تسجيل الحضور والانصراف",
      status: "todo",
      priority: "urgent",
      assignedTo: "خالد عبدالله",
      dueDate: "2024-11-21",
      createdDate: "2024-11-20",
      category: "IT",
      tags: ["تقني", "حضور"],
    },
  ];

  const statusColumns = [
    {
      id: "todo",
      label: isArabic ? "قائمة المهام" : "To Do",
      color: "blue",
      icon: Circle,
    },
    {
      id: "in-progress",
      label: isArabic ? "قيد التنفيذ" : "In Progress",
      color: "yellow",
      icon: Clock,
    },
    {
      id: "review",
      label: isArabic ? "للمراجعة" : "Review",
      color: "purple",
      icon: AlertCircle,
    },
    {
      id: "done",
      label: isArabic ? "مكتمل" : "Done",
      color: "green",
      icon: CheckCircle2,
    },
  ];

  const getPriorityBadge = (priority: Task["priority"]) => {
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

  const handleAddTask = () => {
    toast.success(isArabic ? "تم إنشاء المهمة بنجاح" : "Task created successfully");
    setIsAddDialogOpen(false);
  };

  const handleDeleteTask = (task: Task) => {
    toast.error(
      isArabic ? `تم حذف المهمة: ${task.title}` : `Deleted task: ${task.title}`
    );
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <CheckSquare className="w-8 h-8 text-blue-600" />
              {t("dashboard.tasks.title")}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {isArabic
                ? "تنظيم وتتبع مهام الفريق"
                : "Organize and track team tasks"}
            </p>
          </div>

          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <Button
                variant={view === "kanban" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("kanban")}
              >
                {isArabic ? "كانبان" : "Kanban"}
              </Button>
              <Button
                variant={view === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setView("list")}
              >
                {isArabic ? "قائمة" : "List"}
              </Button>
            </div>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Plus className="w-4 h-4 me-2" />
                  {isArabic ? "إضافة مهمة" : "Add Task"}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {isArabic ? "إنشاء مهمة جديدة" : "Create New Task"}
                  </DialogTitle>
                  <DialogDescription>
                    {isArabic ? "أدخل تفاصيل المهمة" : "Enter task details"}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>{isArabic ? "العنوان" : "Title"}</Label>
                    <Input placeholder={isArabic ? "عنوان المهمة..." : "Task title..."} />
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? "الوصف" : "Description"}</Label>
                    <Textarea
                      placeholder={
                        isArabic
                          ? "وصف تفصيلي للمهمة..."
                          : "Detailed task description..."
                      }
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? "تعيين إلى" : "Assign To"}</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={isArabic ? "اختر موظف" : "Select employee"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="noura">نورة سعيد</SelectItem>
                          <SelectItem value="khaled">خالد عبدالله</SelectItem>
                          <SelectItem value="sarah">سارة أحمد</SelectItem>
                          <SelectItem value="fatima">فاطمة علي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>{isArabic ? "تاريخ الاستحقاق" : "Due Date"}</Label>
                      <Input type="date" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{isArabic ? "الحالة" : "Status"}</Label>
                      <Select defaultValue="todo">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todo">
                            {isArabic ? "قائمة المهام" : "To Do"}
                          </SelectItem>
                          <SelectItem value="in-progress">
                            {isArabic ? "قيد التنفيذ" : "In Progress"}
                          </SelectItem>
                          <SelectItem value="review">
                            {isArabic ? "للمراجعة" : "Review"}
                          </SelectItem>
                          <SelectItem value="done">
                            {isArabic ? "مكتمل" : "Done"}
                          </SelectItem>
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
                      <Label>{isArabic ? "الفئة" : "Category"}</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="finance">
                            {isArabic ? "مالية" : "Finance"}
                          </SelectItem>
                          <SelectItem value="it">IT</SelectItem>
                          <SelectItem value="recruitment">
                            {isArabic ? "توظيف" : "Recruitment"}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{isArabic ? "الوسوم" : "Tags"}</Label>
                    <Input
                      placeholder={
                        isArabic ? "أضف وسوم مفصولة بفواصل..." : "Add tags separated by commas..."
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    {isArabic ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    onClick={handleAddTask}
                  >
                    {isArabic ? "إنشاء المهمة" : "Create Task"}
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
                {isArabic ? "إجمالي المهام" : "Total Tasks"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "جميع المهام" : "all tasks"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "قائمة المهام" : "To Do"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.todo}</div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "في الانتظار" : "pending"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "قيد التنفيذ" : "In Progress"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {stats.inProgress}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "قيد العمل" : "active"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {isArabic ? "مكتمل" : "Done"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.done}</div>
              <p className="text-xs text-gray-600 mt-1">
                {isArabic ? "هذا الأسبوع" : "this week"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder={isArabic ? "ابحث في المهام..." : "Search tasks..."}
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Kanban Board View */}
        {view === "kanban" && (
          <div className="grid md:grid-cols-4 gap-6">
            {statusColumns.map((column) => {
              const columnTasks = getTasksByStatus(column.id);
              const Icon = column.icon;

              return (
                <Card key={column.id} className="h-fit">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`w-5 h-5 text-${column.color}-600`} />
                        {column.label}
                      </div>
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {columnTasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-lg transition-shadow cursor-grab">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-2 mb-2">
                            <GripVertical className="w-4 h-4 text-gray-400 mt-1" />
                            <div className="flex-1">
                              <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                              <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                                {task.description}
                              </p>

                              <div className="flex flex-wrap gap-1 mb-3">
                                {task.tags.map((tag) => (
                                  <Badge
                                    key={tag}
                                    variant="secondary"
                                    className="text-xs px-2 py-0"
                                  >
                                    {tag}
                                  </Badge>
                                ))}
                              </div>

                              {getPriorityBadge(task.priority)}

                              <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                                <div className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {task.assignedTo}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {task.dueDate}
                                </div>
                              </div>

                              <div className="flex gap-1 mt-3">
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  <Eye className="w-3 h-3" />
                                </Button>
                                <Button variant="ghost" size="sm" className="h-7 px-2">
                                  <Edit className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-red-600"
                                  onClick={() => handleDeleteTask(task)}
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="text-center text-sm text-gray-400 py-8">
                        {isArabic ? "لا توجد مهام" : "No tasks"}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <Card>
            <CardHeader>
              <CardTitle>{isArabic ? "قائمة المهام" : "Tasks List"}</CardTitle>
              <CardDescription>
                {isArabic
                  ? `عرض ${filteredTasks.length} من ${tasks.length} مهمة`
                  : `Showing ${filteredTasks.length} of ${tasks.length} tasks`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredTasks.map((task) => (
                  <Card key={task.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-bold">{task.title}</h4>
                            {getPriorityBadge(task.priority)}
                            <Badge variant="secondary">{task.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                          <div className="flex items-center gap-6 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4" />
                              {task.assignedTo}
                            </div>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {task.dueDate}
                            </div>
                            <div className="flex gap-1">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 me-2" />
                            {isArabic ? "عرض" : "View"}
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 me-2" />
                            {isArabic ? "تعديل" : "Edit"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDeleteTask(task)}
                          >
                            <Trash2 className="w-4 h-4 me-2" />
                            {isArabic ? "حذف" : "Delete"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
