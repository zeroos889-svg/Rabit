import { useState, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Shield,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  FileText,
  Scale,
  Users,
  Clock,
  Download,
  Eye,
  CreditCard,
  Heart,
  Plane,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

type ComplianceStatus = "متوافق" | "تحذير" | "غير متوافق" | "قيد المراجعة";

type ComplianceCategory = {
  id: string;
  name: string;
  icon: React.ElementType;
  items: ComplianceItem[];
};

type ComplianceItem = {
  id: number;
  title: string;
  description: string;
  status: ComplianceStatus;
  regulation: string;
  lastChecked: string;
  dueDate?: string;
  affectedEmployees?: number;
  action?: string;
};

const complianceCategories: ComplianceCategory[] = [
  {
    id: "contracts",
    name: "العقود",
    icon: FileText,
    items: [
      {
        id: 1,
        title: "عقود العمل المكتوبة",
        description: "جميع الموظفين لديهم عقود عمل مكتوبة وموقعة",
        status: "متوافق",
        regulation: "المادة 51 - نظام العمل",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 2,
        title: "فترة التجربة",
        description: "فترة التجربة لا تتجاوز 90 يوماً",
        status: "متوافق",
        regulation: "المادة 53 - نظام العمل",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 3,
        title: "تجديد العقود المحددة المدة",
        description: "3 عقود تنتهي خلال 30 يوم",
        status: "تحذير",
        regulation: "المادة 55 - نظام العمل",
        lastChecked: "2025-01-20",
        dueDate: "2025-02-20",
        affectedEmployees: 3,
        action: "مراجعة العقود المنتهية",
      },
    ],
  },
  {
    id: "wages",
    name: "الأجور",
    icon: CreditCard,
    items: [
      {
        id: 4,
        title: "الحد الأدنى للأجور",
        description: "جميع الرواتب أعلى من الحد الأدنى (4,000 ريال)",
        status: "متوافق",
        regulation: "قرار وزاري - الحد الأدنى للأجور",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 5,
        title: "صرف الرواتب في الموعد",
        description: "صرف الرواتب قبل اليوم 7 من كل شهر",
        status: "متوافق",
        regulation: "المادة 90 - نظام العمل",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 6,
        title: "حماية الأجور",
        description: "تسجيل الرواتب في نظام حماية الأجور",
        status: "متوافق",
        regulation: "برنامج حماية الأجور",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 7,
        title: "أجر العمل الإضافي",
        description: "2 موظفين لم يحصلوا على بدل العمل الإضافي",
        status: "غير متوافق",
        regulation: "المادة 107 - نظام العمل",
        lastChecked: "2025-01-20",
        affectedEmployees: 2,
        action: "صرف بدل العمل الإضافي",
      },
    ],
  },
  {
    id: "leaves",
    name: "الإجازات",
    icon: Plane,
    items: [
      {
        id: 8,
        title: "الإجازة السنوية",
        description: "جميع الموظفين لديهم 21 يوم إجازة على الأقل",
        status: "متوافق",
        regulation: "المادة 109 - نظام العمل",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 9,
        title: "رصيد الإجازات المتراكم",
        description: "5 موظفين لديهم رصيد إجازات متراكم يتجاوز السنة",
        status: "تحذير",
        regulation: "المادة 109 - نظام العمل",
        lastChecked: "2025-01-20",
        affectedEmployees: 5,
        action: "جدولة إجازات الموظفين",
      },
      {
        id: 10,
        title: "إجازة الأمومة",
        description: "منح إجازة أمومة 70 يوم للموظفات",
        status: "متوافق",
        regulation: "المادة 151 - نظام العمل",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
    ],
  },
  {
    id: "insurance",
    name: "التأمينات",
    icon: Heart,
    items: [
      {
        id: 11,
        title: "التأمينات الاجتماعية",
        description: "جميع الموظفين مسجلين في التأمينات الاجتماعية",
        status: "متوافق",
        regulation: "نظام التأمينات الاجتماعية",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 12,
        title: "التأمين الطبي",
        description: "جميع الموظفين لديهم تأمين طبي ساري",
        status: "متوافق",
        regulation: "نظام الضمان الصحي التعاوني",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 13,
        title: "تجديد التأمين الطبي",
        description: "تأمين 8 موظفين ينتهي خلال 30 يوم",
        status: "تحذير",
        regulation: "نظام الضمان الصحي التعاوني",
        lastChecked: "2025-01-20",
        dueDate: "2025-02-15",
        affectedEmployees: 8,
        action: "تجديد التأمين الطبي",
      },
    ],
  },
  {
    id: "saudization",
    name: "التوطين",
    icon: Users,
    items: [
      {
        id: 14,
        title: "نسبة السعودة (نطاقات)",
        description: "نسبة السعودة الحالية 35% - المطلوب 30%",
        status: "متوافق",
        regulation: "برنامج نطاقات",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 15,
        title: "توظيف ذوي الإعاقة",
        description: "يجب توظيف 4% من ذوي الإعاقة",
        status: "قيد المراجعة",
        regulation: "نظام رعاية المعوقين",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
        action: "مراجعة سياسة التوظيف",
      },
    ],
  },
  {
    id: "safety",
    name: "السلامة",
    icon: Shield,
    items: [
      {
        id: 16,
        title: "تدريب السلامة المهنية",
        description: "جميع الموظفين أكملوا تدريب السلامة",
        status: "متوافق",
        regulation: "نظام العمل - السلامة المهنية",
        lastChecked: "2025-01-20",
        affectedEmployees: 0,
      },
      {
        id: 17,
        title: "فحص بيئة العمل",
        description: "آخر فحص قبل 8 أشهر - يجب الفحص سنوياً",
        status: "تحذير",
        regulation: "نظام العمل - السلامة المهنية",
        lastChecked: "2025-01-20",
        dueDate: "2025-03-01",
        action: "جدولة فحص السلامة",
      },
    ],
  },
];

export default function LegalCheck() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<ComplianceItem | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // Calculate overall compliance stats
  const stats = useMemo(() => {
    const allItems = complianceCategories.flatMap(cat => cat.items);
    return {
      total: allItems.length,
      compliant: allItems.filter(i => i.status === "متوافق").length,
      warning: allItems.filter(i => i.status === "تحذير").length,
      nonCompliant: allItems.filter(i => i.status === "غير متوافق").length,
      inReview: allItems.filter(i => i.status === "قيد المراجعة").length,
    };
  }, []);

  const complianceScore = Math.round(
    ((stats.compliant + stats.inReview * 0.5) / stats.total) * 100
  );

  // Filter items
  const filteredCategories = useMemo(() => {
    return complianceCategories
      .filter(cat => selectedCategory === "all" || cat.id === selectedCategory)
      .map(cat => ({
        ...cat,
        items: cat.items.filter(
          item =>
            item.title.includes(searchQuery) ||
            item.description.includes(searchQuery) ||
            item.regulation.includes(searchQuery)
        ),
      }))
      .filter(cat => cat.items.length > 0);
  }, [selectedCategory, searchQuery]);

  // Issues requiring action
  const actionItems = useMemo(() => {
    return complianceCategories
      .flatMap(cat => cat.items)
      .filter(item => item.status !== "متوافق" && item.action);
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    toast.info("جاري فحص الامتثال القانوني...");
    setTimeout(() => {
      setIsScanning(false);
      toast.success("تم إكمال الفحص القانوني");
    }, 3000);
  };

  const getStatusBadge = (status: ComplianceStatus) => {
    const config = {
      "متوافق": { color: "bg-green-100 text-green-700", icon: CheckCircle2 },
      "تحذير": { color: "bg-amber-100 text-amber-700", icon: AlertTriangle },
      "غير متوافق": { color: "bg-red-100 text-red-700", icon: XCircle },
      "قيد المراجعة": { color: "bg-blue-100 text-blue-700", icon: Clock },
    };
    const { color, icon: Icon } = config[status];
    return (
      <Badge className={`${color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  return (
    <DashboardLayout title="الفحص القانوني">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Scale className="h-6 w-6 text-purple-600" />
              الفحص القانوني والامتثال
            </h1>
            <p className="text-muted-foreground">
              فحص شامل للامتثال لنظام العمل السعودي واللوائح التنظيمية
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success("تم تحميل التقرير")}>
              <Download className="h-4 w-4 ml-2" />
              تصدير التقرير
            </Button>
            <Button
              onClick={handleScan}
              disabled={isScanning}
              className="bg-gradient-to-r from-purple-600 to-blue-600"
            >
              <RefreshCw className={`h-4 w-4 ml-2 ${isScanning ? "animate-spin" : ""}`} />
              {isScanning ? "جاري الفحص..." : "فحص الآن"}
            </Button>
          </div>
        </div>

        {/* Compliance Score */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">نسبة الامتثال الإجمالية</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Progress value={complianceScore} className="h-4" />
                  </div>
                  <span className="text-3xl font-bold text-purple-600">
                    {complianceScore}%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  آخر فحص: {new Date().toLocaleDateString("ar-SA")}
                </p>
              </div>
              <div className="flex gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.compliant}</div>
                  <div className="text-xs text-muted-foreground">متوافق</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">{stats.warning}</div>
                  <div className="text-xs text-muted-foreground">تحذير</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.nonCompliant}</div>
                  <div className="text-xs text-muted-foreground">غير متوافق</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.inReview}</div>
                  <div className="text-xs text-muted-foreground">قيد المراجعة</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-6 gap-4">
          {complianceCategories.map(category => {
            const catStats = {
              total: category.items.length,
              issues: category.items.filter(i => i.status !== "متوافق").length,
            };
            return (
              <Card
                key={category.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedCategory === category.id ? "ring-2 ring-purple-500" : ""
                }`}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.id ? "all" : category.id
                )}
              >
                <CardContent className="pt-6 text-center">
                  <category.icon className={`h-8 w-8 mx-auto mb-2 ${
                    catStats.issues > 0 ? "text-amber-600" : "text-green-600"
                  }`} />
                  <p className="font-semibold">{category.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {catStats.issues > 0 ? (
                      <span className="text-amber-600">{catStats.issues} مشكلة</span>
                    ) : (
                      <span className="text-green-600">✓ متوافق</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Items Alert */}
        {actionItems.length > 0 && (
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-5 w-5" />
                إجراءات مطلوبة ({actionItems.length})
              </CardTitle>
              <CardDescription className="text-amber-600">
                هذه المشكلات تتطلب اتخاذ إجراء لتجنب المخالفات
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-3">
                {actionItems.map(item => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg border"
                  >
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.action}</p>
                    </div>
                    {getStatusBadge(item.status)}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="ابحث في بنود الامتثال..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            عرض الكل
          </Button>
        </div>

        {/* Compliance Details */}
        <Tabs defaultValue="list" className="space-y-4">
          <TabsList>
            <TabsTrigger value="list">قائمة البنود</TabsTrigger>
            <TabsTrigger value="regulations">الأنظمة والقوانين</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {filteredCategories.map(category => (
              <Card key={category.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-purple-600" />
                    {category.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">البند</TableHead>
                        <TableHead className="text-right">المرجع القانوني</TableHead>
                        <TableHead className="text-right">الموظفون المتأثرون</TableHead>
                        <TableHead className="text-right">آخر فحص</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">إجراء</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {category.items.map(item => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.regulation}</Badge>
                          </TableCell>
                          <TableCell>
                            {item.affectedEmployees !== undefined && (
                              <span className={item.affectedEmployees > 0 ? "text-amber-600 font-medium" : ""}>
                                {item.affectedEmployees} موظف
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{item.lastChecked}</TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedItem(item)}
                            >
                              <Eye className="h-4 w-4 ml-1" />
                              تفاصيل
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="regulations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  الأنظمة والقوانين المرجعية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    {
                      title: "نظام العمل السعودي",
                      description: "الصادر بالمرسوم الملكي رقم م/51",
                      articles: "245 مادة",
                      lastUpdate: "1443هـ",
                    },
                    {
                      title: "نظام التأمينات الاجتماعية",
                      description: "تنظيم التأمين الاجتماعي للعاملين",
                      articles: "67 مادة",
                      lastUpdate: "1421هـ",
                    },
                    {
                      title: "نظام الضمان الصحي التعاوني",
                      description: "تنظيم التأمين الصحي الإلزامي",
                      articles: "23 مادة",
                      lastUpdate: "1440هـ",
                    },
                    {
                      title: "برنامج نطاقات",
                      description: "تنظيم نسب التوطين في القطاع الخاص",
                      articles: "لائحة تنفيذية",
                      lastUpdate: "1444هـ",
                    },
                    {
                      title: "برنامج حماية الأجور",
                      description: "رصد ومتابعة صرف الرواتب",
                      articles: "لائحة تنفيذية",
                      lastUpdate: "1434هـ",
                    },
                    {
                      title: "نظام حماية البيانات الشخصية",
                      description: "PDPL - حماية خصوصية البيانات",
                      articles: "43 مادة",
                      lastUpdate: "1443هـ",
                    },
                  ].map((reg) => (
                    <Card key={reg.title} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{reg.title}</h4>
                            <p className="text-sm text-muted-foreground mt-1">
                              {reg.description}
                            </p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary">{reg.articles}</Badge>
                              <Badge variant="outline">تحديث: {reg.lastUpdate}</Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="ghost">
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Detail Dialog */}
        {selectedItem && (
          <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedItem.title}
                  {getStatusBadge(selectedItem.status)}
                </DialogTitle>
                <DialogDescription>{selectedItem.description}</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">المرجع القانوني</p>
                    <p className="font-medium">{selectedItem.regulation}</p>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">آخر فحص</p>
                    <p className="font-medium">{selectedItem.lastChecked}</p>
                  </div>
                  {selectedItem.dueDate && (
                    <div className="p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                      <p className="text-sm text-amber-600">تاريخ الاستحقاق</p>
                      <p className="font-medium text-amber-700">{selectedItem.dueDate}</p>
                    </div>
                  )}
                  {selectedItem.affectedEmployees !== undefined && (
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground">الموظفون المتأثرون</p>
                      <p className="font-medium">{selectedItem.affectedEmployees} موظف</p>
                    </div>
                  )}
                </div>
                {selectedItem.action && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="text-sm text-blue-600 mb-2">الإجراء المطلوب:</p>
                    <p className="font-medium text-blue-700">{selectedItem.action}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={() => {
                    toast.success("تم تعيين المهمة لقسم الموارد البشرية");
                    setSelectedItem(null);
                  }}>
                    تعيين لـ HR
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedItem(null)}>
                    إغلاق
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
}