import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Users, CreditCard, Calendar, DollarSign, Globe2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminNotifications } from "@/components/AdminNotifications";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();
  const [dataRegion, setDataRegion] = useState<"sa-gcc" | "eu" | "us">("sa-gcc");

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-8">لوحة التحكم الإدارية</h1>

        {/* PDPL Notifications */}
        <div className="mb-6">
          <AdminNotifications />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "إجمالي المستخدمين",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "عدد المستخدمين المسجلين",
      color: "text-blue-600",
    },
    {
      title: "الاشتراكات النشطة",
      value: stats?.activeSubscriptions || 0,
      icon: CreditCard,
      description: "الاشتراكات الفعالة حالياً",
      color: "text-green-600",
    },
    {
      title: "الحجوزات المعلقة",
      value: stats?.pendingBookings || 0,
      icon: Calendar,
      description: "حجوزات تنتظر المعالجة",
      color: "text-orange-600",
    },
    {
      title: "إجمالي الإيرادات",
      value: `${((stats?.totalRevenue || 0) / 100).toLocaleString("ar-SA")} ﷼`,
      icon: DollarSign,
      description: "الإيرادات الإجمالية",
      color: "text-purple-600",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">لوحة التحكم الإدارية</h1>
        <p className="text-muted-foreground mt-2">
          مرحباً بك في لوحة التحكم الإدارية لمنصة رابِط
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map(stat => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>نظرة عامة</CardTitle>
            <CardDescription>إحصائيات سريعة عن المنصة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  معدل التحويل
                </span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  متوسط قيمة الاشتراك
                </span>
                <span className="font-medium">-</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  معدل الاحتفاظ
                </span>
                <span className="font-medium">-</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5 text-purple-600" />
              إعدادات منطقة البيانات
            </CardTitle>
            <CardDescription>اختر موقع استضافة البيانات: sa-gcc | eu | us</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={dataRegion} onValueChange={val => setDataRegion(val as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر المنطقة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sa-gcc">sa-gcc (الرياض)</SelectItem>
                <SelectItem value="eu">eu (فرانكفورت)</SelectItem>
                <SelectItem value="us">us (أوريغون)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              يطبق على تخزين المستندات والسجلات. يتطلب إعادة تشغيل الخدمات عند التبديل.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={() => toast.success(`تم حفظ المنطقة: ${dataRegion}`)}
                className="bg-gradient-to-r from-purple-600 to-blue-600"
              >
                حفظ الإعداد
              </Button>
              <Button variant="outline" onClick={() => setDataRegion("sa-gcc")}>
                إعادة التعيين لـ sa-gcc
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
