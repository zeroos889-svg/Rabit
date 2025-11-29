import { useMemo, useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Clock, Download, Filter, Shield, User } from "lucide-react";

type LogItem = {
  id: number;
  actor: string;
  action: string;
  entity: string;
  severity: "info" | "warn" | "error";
  timestamp: string;
  ip: string;
};

const initialLogs: LogItem[] = [
  {
    id: 1,
    actor: "admin@rabit.com",
    action: "تحديث صلاحيات مستخدم",
    entity: "user: 104",
    severity: "info",
    timestamp: "2025-01-20 10:25",
    ip: "192.168.1.12",
  },
  {
    id: 2,
    actor: "security@rabit.com",
    action: "محاولة تسجيل دخول فاشلة",
    entity: "admin@demo",
    severity: "warn",
    timestamp: "2025-01-20 09:40",
    ip: "10.0.0.3",
  },
  {
    id: 3,
    actor: "ops@rabit.com",
    action: "حذف تذكرة دعم",
    entity: "ticket: 552",
    severity: "error",
    timestamp: "2025-01-19 18:10",
    ip: "172.16.1.8",
  },
];

export default function AdminAuditLogs() {
  const [logs] = useState<LogItem[]>(initialLogs);
  const [severity, setSeverity] = useState<"all" | "info" | "warn" | "error">("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (severity !== "all" && log.severity !== severity) return false;
      if (search && !log.action.includes(search) && !log.actor.includes(search)) return false;
      return true;
    });
  }, [logs, severity, search]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      warn: logs.filter(l => l.severity === "warn").length,
      error: logs.filter(l => l.severity === "error").length,
    };
  }, [logs]);

  return (
    <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">سجلات التدقيق</h1>
            <p className="text-muted-foreground">
              مراقبة التغييرات، محاولات الدخول، والعمليات الحساسة.
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 me-2" />
            تصدير CSV
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأحداث</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-amber-600" />
              <div>
                <p className="text-sm text-muted-foreground">تحذيرات</p>
                <p className="text-2xl font-bold">{stats.warn}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Clock className="h-6 w-6 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">أخطاء حرجة</p>
                <p className="text-2xl font-bold">{stats.error}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل النشاطات</CardTitle>
            <CardDescription>فلترة حسب الخطورة أو البحث عن مستخدم/حدث</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Select value={severity} onValueChange={val => setSeverity(val as any)}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="الخطورة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الكل</SelectItem>
                  <SelectItem value="info">معلوماتي</SelectItem>
                  <SelectItem value="warn">تحذيري</SelectItem>
                  <SelectItem value="error">حرج</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 w-full md:w-72">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث في الأحداث أو المستخدم"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الإجراء</TableHead>
                  <TableHead className="text-right">الكائن</TableHead>
                  <TableHead className="text-right">الوقت</TableHead>
                  <TableHead className="text-right">IP</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(log => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4 text-purple-600" />
                      {log.actor}
                    </TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.entity}</Badge>
                    </TableCell>
                    <TableCell>{log.timestamp}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell>
                      <Badge
                        className={
                          log.severity === "error"
                            ? "bg-red-100 text-red-700"
                            : log.severity === "warn"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-slate-100 text-slate-700"
                        }
                      >
                        {log.severity}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
  );
}
