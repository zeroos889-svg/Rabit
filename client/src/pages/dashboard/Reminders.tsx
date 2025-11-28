import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Bell,
  CheckCircle2,
  Clock,
  Plus,
  RefreshCw,
  Search,
  Send,
  AlertTriangle,
  CalendarDays,
  BellRing,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

type Reminder = {
  id: number;
  title: string;
  type: "عقود" | "تأشيرات" | "تأمين" | "أعياد ميلاد" | "مواعيد" | "مخصص";
  date: string;
  time: string;
  channel: "بريد" | "SMS" | "إشعار";
  priority: "عالي" | "متوسط" | "عادي";
  status: "قادمة" | "متأخرة" | "مكتملة";
};

const initialReminders: Reminder[] = [
  {
    id: 1,
    title: "تجديد عقد موظف: أحمد محمد",
    type: "عقود",
    date: "2025-02-05",
    time: "10:00",
    channel: "بريد",
    priority: "عالي",
    status: "قادمة",
  },
  {
    id: 2,
    title: "تأشيرة عمل - فاطمة السالم",
    type: "تأشيرات",
    date: "2025-01-28",
    time: "09:00",
    channel: "SMS",
    priority: "متوسط",
    status: "متأخرة",
  },
  {
    id: 3,
    title: "تجديد تأمين طبي - قسم التقنية",
    type: "تأمين",
    date: "2025-02-20",
    time: "12:00",
    channel: "إشعار",
    priority: "عالي",
    status: "قادمة",
  },
  {
    id: 4,
    title: "عيد ميلاد - خالد الغامدي",
    type: "أعياد ميلاد",
    date: "2025-01-26",
    time: "14:00",
    channel: "إشعار",
    priority: "عادي",
    status: "مكتملة",
  },
];

export default function Reminders() {
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
  const [tab, setTab] = useState<"all" | "coming" | "overdue" | "done">("all");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [autoNotify, setAutoNotify] = useState(true);
  const [calendarMonth] = useState("2025-01");

  const [form, setForm] = useState({
    title: "",
    type: "عقود",
    date: "",
    time: "09:00",
    channel: "بريد",
    priority: "متوسط",
  });

  const filtered = useMemo(() => {
    return reminders.filter(reminder => {
      if (tab === "coming" && reminder.status !== "قادمة") return false;
      if (tab === "overdue" && reminder.status !== "متأخرة") return false;
      if (tab === "done" && reminder.status !== "مكتملة") return false;
      if (filterType !== "all" && reminder.type !== filterType) return false;
      if (search && !reminder.title.includes(search)) return false;
      return true;
    });
  }, [reminders, tab, search, filterType]);

  const stats = useMemo(() => {
    return {
      total: reminders.length,
      coming: reminders.filter(r => r.status === "قادمة").length,
      overdue: reminders.filter(r => r.status === "متأخرة").length,
      done: reminders.filter(r => r.status === "مكتملة").length,
    };
  }, [reminders]);

  const addReminder = () => {
    if (!form.title || !form.date) {
      toast.error("يرجى إدخال عنوان وتاريخ التذكير");
      return;
    }
    const newReminder: Reminder = {
      id: reminders.length + 1,
      title: form.title,
      type: form.type as Reminder["type"],
      date: form.date,
      time: form.time,
      channel: form.channel as Reminder["channel"],
      priority: form.priority as Reminder["priority"],
      status: "قادمة",
    };
    setReminders(prev => [...prev, newReminder]);
    setIsDialogOpen(false);
    setForm({
      title: "",
      type: "عقود",
      date: "",
      time: "09:00",
      channel: "بريد",
      priority: "متوسط",
    });
    toast.success("تم إنشاء التذكير بنجاح");
  };

  return (
    <DashboardLayout title="التذكيرات">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-600" />
            مركز التذكيرات
          </h1>
          <p className="text-muted-foreground">
            تابع مواعيد العقود، التأشيرات، التأمين، والمناسبات المهمة.
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
              <Plus className="h-4 w-4 ml-2" />
              إنشاء تذكير
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>تذكير جديد</DialogTitle>
              <DialogDescription>
                أدخل تفاصيل التذكير وسيتم إشعارك عبر القناة المختارة.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3">
              <div className="space-y-2">
                <Label>العنوان</Label>
                <Input
                  placeholder="مثال: تجديد عقد محمد"
                  value={form.title}
                  onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>الفئة</Label>
                  <Select
                    value={form.type}
                    onValueChange={val => setForm(prev => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="عقود">عقود</SelectItem>
                      <SelectItem value="تأشيرات">تأشيرات</SelectItem>
                      <SelectItem value="تأمين">تأمين</SelectItem>
                      <SelectItem value="أعياد ميلاد">أعياد ميلاد</SelectItem>
                      <SelectItem value="مواعيد">مواعيد</SelectItem>
                      <SelectItem value="مخصص">مخصص</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>القناة</Label>
                  <Select
                    value={form.channel}
                    onValueChange={val => setForm(prev => ({ ...prev, channel: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="بريد">بريد</SelectItem>
                      <SelectItem value="SMS">SMS</SelectItem>
                      <SelectItem value="إشعار">إشعار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>التاريخ</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>الوقت</Label>
                  <Input
                    type="time"
                    value={form.time}
                    onChange={e => setForm(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>الأولوية</Label>
                <Select
                  value={form.priority}
                  onValueChange={val => setForm(prev => ({ ...prev, priority: val }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عالي">عالي</SelectItem>
                    <SelectItem value="متوسط">متوسط</SelectItem>
                    <SelectItem value="عادي">عادي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={addReminder} className="bg-gradient-to-r from-purple-600 to-blue-600">
                إنشاء
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "إجمالي التذكيرات", value: stats.total, icon: Bell, tone: "text-slate-900" },
          { label: "قادمة", value: stats.coming, icon: Clock, tone: "text-blue-600" },
          { label: "متأخرة", value: stats.overdue, icon: AlertTriangle, tone: "text-amber-600" },
          { label: "مكتملة", value: stats.done, icon: CheckCircle2, tone: "text-emerald-600" },
        ].map(item => (
          <Card key={item.label}>
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value}</p>
              </div>
              <item.icon className={`h-6 w-6 ${item.tone}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardContent className="p-4 flex flex-wrap gap-2">
            {[
              { key: "all", label: "الكل" },
              { key: "coming", label: "قادمة" },
              { key: "overdue", label: "متأخرة" },
              { key: "done", label: "مكتملة" },
            ].map(item => (
              <Button
                key={item.key}
                variant={tab === item.key ? "default" : "outline"}
                onClick={() => setTab(item.key as typeof tab)}
              >
                {item.label}
              </Button>
            ))}
            <div className="flex-1" />
            <div className="flex items-center gap-2 w-full md:w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="بحث بعنوان التذكير"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="الفئة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الفئات</SelectItem>
                <SelectItem value="عقود">عقود</SelectItem>
                <SelectItem value="تأشيرات">تأشيرات</SelectItem>
                <SelectItem value="تأمين">تأمين</SelectItem>
                <SelectItem value="أعياد ميلاد">أعياد ميلاد</SelectItem>
                <SelectItem value="مواعيد">مواعيد</SelectItem>
                <SelectItem value="مخصص">مخصص</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Auto notifications + Calendar */}
      <div className="grid gap-3 md:grid-cols-3 mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-purple-600" />
              الإشعارات التلقائية
            </CardTitle>
            <CardDescription>إرسال تنبيهات قبل الموعد بـ 30/15/7 أيام</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">تفعيل الإشعارات</p>
                <p className="text-sm text-muted-foreground">إرسال بريد + SMS + إشعار داخل النظام</p>
              </div>
              <Switch checked={autoNotify} onCheckedChange={setAutoNotify} />
            </div>
            <div className="rounded-lg border p-3 text-sm text-muted-foreground bg-muted/40">
              عند التفعيل سيتم جدولة التنبيهات تلقائياً لكل التذكيرات القادمة.
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-blue-600" />
              تقويم HR
            </CardTitle>
            <CardDescription>عرض سريع للتذكيرات حسب اليوم</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center text-sm">
              {Array.from({ length: 30 }, (_, i) => i + 1).map(day => {
                const hasReminder = reminders.some(r => r.date.endsWith(`-${String(day).padStart(2, "0")}`));
                const isOverdue = reminders.some(
                  r => r.status === "متأخرة" && r.date.endsWith(`-${String(day).padStart(2, "0")}`)
                );
                return (
                  <div
                    key={day}
                    className={`rounded-lg border py-3 ${
                      hasReminder ? "border-blue-200 bg-blue-50" : "border-muted"
                    } ${isOverdue ? "border-amber-300 bg-amber-50" : ""}`}
                  >
                    <div className="font-semibold">{day}</div>
                    {hasReminder && (
                      <span className="text-[11px] text-blue-700">
                        {calendarMonth}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle>التذكيرات</CardTitle>
          <CardDescription>يتم التحديث كل 30 ثانية مع تنبيهات متعددة القنوات</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">العنوان</TableHead>
                <TableHead className="text-right">الفئة</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الوقت</TableHead>
                <TableHead className="text-right">القناة</TableHead>
                <TableHead className="text-right">الأولوية</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">إجراء</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(reminder => (
                <TableRow key={reminder.id}>
                  <TableCell className="font-medium">{reminder.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{reminder.type}</Badge>
                  </TableCell>
                  <TableCell>{reminder.date}</TableCell>
                  <TableCell>{reminder.time}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{reminder.channel}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        reminder.priority === "عالي"
                          ? "bg-red-100 text-red-700"
                          : reminder.priority === "متوسط"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-slate-100 text-slate-700"
                      }
                    >
                      {reminder.priority}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        reminder.status === "مكتملة"
                          ? "bg-emerald-100 text-emerald-700"
                          : reminder.status === "متأخرة"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-blue-100 text-blue-700"
                      }
                    >
                      {reminder.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 ml-1" />
                        إرسال الآن
                      </Button>
                      {reminder.status !== "مكتملة" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setReminders(prev =>
                              prev.map(r =>
                                r.id === reminder.id ? { ...r, status: "مكتملة" } : r
                              )
                            )
                          }
                        >
                          تم
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
