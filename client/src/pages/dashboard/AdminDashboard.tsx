import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">لوحة تحكم المدير (مؤقتة)</h1>
      <p className="text-neutral-600 dark:text-neutral-300 text-sm">
        هذه صفحة مؤقتة تم إنشاؤها كمكان حامل حتى يتم بناء لوحة التحكم الفعلية.
      </p>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>إحصائية المستخدمين</CardTitle></CardHeader>
          <CardContent>سيتم عرض عدد المستخدمين هنا.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>الاشتراكات</CardTitle></CardHeader>
          <CardContent>إحصائية الاشتراكات النشطة.</CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>المعاملات</CardTitle></CardHeader>
          <CardContent>أحدث عمليات الدفع.</CardContent>
        </Card>
      </div>
    </div>
  );
}
