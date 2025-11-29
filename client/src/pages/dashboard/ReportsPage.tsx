import DashboardLayout from "@/components/DashboardLayout";
import { ReportExport } from "@/components/reports/ReportExport";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileSpreadsheet, FileText, Download, History } from "lucide-react";

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">إنشاء وتصدير التقارير</h1>
            <p className="text-muted-foreground mt-1">
              إنشاء تقارير مخصصة وتصديرها بصيغ متعددة
            </p>
          </div>
        </div>

        {/* Reports Tabs */}
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="create" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">إنشاء تقرير</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              <span className="hidden sm:inline">القوالب</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              <span className="hidden sm:inline">السجل</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <ReportExport />
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <CardTitle>قوالب التقارير الجاهزة</CardTitle>
                <CardDescription>
                  استخدم القوالب الجاهزة لإنشاء تقارير سريعة
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: "تقرير الرواتب الشهري", icon: FileSpreadsheet },
                    { title: "تقرير الحضور والانصراف", icon: FileText },
                    { title: "تقرير الإجازات", icon: FileText },
                    { title: "تقرير تقييم الأداء", icon: FileSpreadsheet },
                    { title: "تقرير التوظيف", icon: FileText },
                    { title: "تقرير التدريب", icon: FileSpreadsheet },
                  ].map((template, index) => (
                    <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="flex items-center gap-4 p-4">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <template.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-medium">{template.title}</h4>
                          <p className="text-sm text-muted-foreground">جاهز للتصدير</p>
                        </div>
                        <Download className="h-4 w-4 ms-auto text-muted-foreground" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>سجل التقارير</CardTitle>
                <CardDescription>
                  التقارير التي تم إنشاؤها سابقاً
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <History className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium">لا توجد تقارير سابقة</h3>
                  <p>التقارير التي تقوم بإنشائها ستظهر هنا</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
