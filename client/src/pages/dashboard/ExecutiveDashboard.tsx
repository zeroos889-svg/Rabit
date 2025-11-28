import { useMemo, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  BellRing,
  ShieldAlert,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  BarChart3,
  Zap,
} from "lucide-react";
import { isFeatureEnabled, listFeatureFlags, setFeatureFlag } from "@/lib/featureFlags";
import { trpc } from "@/lib/trpc";
import { Skeleton } from "@/components/ui/skeleton";

interface AnomalyItem {
  title: string;
  detail: string;
  severity: "high" | "medium" | "low";
  action?: string;
}

export default function ExecutiveDashboard() {
  const [flags, setFlags] = useState(listFeatureFlags());
  const [tab, setTab] = useState("overview");
  const anomaliesEnabled = isFeatureEnabled("anomalyAlerts");
  const execEnabled = isFeatureEnabled("execDashboard");
  const dataQuery = trpc.dashboard.executive.useQuery(undefined, {
    enabled: execEnabled || anomaliesEnabled,
    staleTime: 30_000,
  });

  const severityTone = (s: "high" | "medium" | "low") => {
    if (s === "high") return "text-red-600 bg-red-50 border-red-200";
    if (s === "medium") return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-blue-600 bg-blue-50 border-blue-200";
  };

  const handleToggleFlag = (key: (typeof flags)[number]["key"]) => {
    const current = flags.find(f => f.key === key)?.enabled ?? false;
    setFeatureFlag(key, !current);
    setFlags(listFeatureFlags());
  };

  const metricCards = useMemo(() => {
    const metrics = dataQuery.data?.metrics;
    if (!execEnabled || !metrics) return [];
    return [
      {
        label: "وقت ملء الوظيفة",
        value: `${metrics.timeToFillDays} يوم`,
        delta: `${Math.abs(metrics.timeToFillDelta)} يوم`,
        deltaTone: metrics.timeToFillDelta <= 0 ? "up" : "down",
        hint: "المستهدف < 25 يوم",
      },
      {
        label: "وقت حل التذاكر",
        value: `${metrics.timeToResolveHours} ساعة`,
        delta: `${Math.abs(metrics.timeToResolveHours - 12)} ساعة`,
        deltaTone: metrics.timeToResolveHours <= 12 ? "up" : "down",
        hint: "المستهدف < 12 ساعة",
      },
      {
        label: "عائد الاستشارات",
        value: `﷼ ${Number(metrics.consultingRevenueSar || 0).toLocaleString("ar-SA")}`,
        delta: "+12%",
        deltaTone: "up",
        hint: "نمو أسبوعي",
      },
      {
        label: "نسبة قبول العرض",
        value: `${metrics.offerAcceptanceRate}%`,
        delta: metrics.offerAcceptanceRate >= 85 ? "+3%" : "-6%",
        deltaTone: metrics.offerAcceptanceRate >= 85 ? "up" : "down",
        hint: "المستهدف > 85%",
      },
    ];
  }, [execEnabled, dataQuery.isLoading, dataQuery.data?.metrics]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-purple-600" />
              لوحة تنفيذية
            </h1>
            <p className="text-muted-foreground">
              مؤشرات التوظيف، القضايا، والاستشارات مع تنبيهات الشذوذ.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="gap-1">
              <Zap className="h-4 w-4" />
              تجريبية عبر Feature Flags
            </Badge>
          </div>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Feature Flags</CardTitle>
            <CardDescription>تشغيل/إيقاف الميزات التجريبية للمؤشرات والتنبيهات.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            {flags.map(flag => (
              <div key={flag.key} className="flex items-center justify-between border rounded-lg px-3 py-2">
                <div>
                  <p className="font-medium">{flag.key}</p>
                  <p className="text-xs text-muted-foreground">
                    {flag.key === "execDashboard"
                      ? "تفعيل اللوحة التنفيذية"
                      : flag.key === "anomalyAlerts"
                        ? "تفعيل تنبيهات الشذوذ"
                        : "تجارب الجولات الموجهة"}
                  </p>
                </div>
                <Switch checked={flag.enabled} onCheckedChange={() => handleToggleFlag(flag.key)} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="anomalies">تنبيهات الشذوذ</TabsTrigger>
            <TabsTrigger value="sla">SLA</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {!execEnabled && (
              <Alert variant="destructive">
                <ShieldAlert className="h-4 w-4" />
                <AlertTitle>اللوحة التنفيذية غير مفعلة</AlertTitle>
                <AlertDescription>فعّل علم execDashboard أعلاه لعرض المؤشرات.</AlertDescription>
              </Alert>
            )}
            {execEnabled && (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  {dataQuery.isLoading &&
                    Array.from({ length: 4 }).map((_, idx) => (
                      <Card key={idx}>
                        <CardHeader className="pb-1 space-y-2">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-6 w-16" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-3 w-32" />
                        </CardContent>
                      </Card>
                    ))}
                  {!dataQuery.isLoading &&
                    metricCards.map(metric => (
                      <Card key={metric.label}>
                        <CardHeader className="pb-1">
                          <CardDescription className="flex items-center gap-2">
                            <Activity className="h-4 w-4 text-purple-600" />
                            {metric.label}
                          </CardDescription>
                          <CardTitle className="text-2xl">{metric.value}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center justify-between">
                          <div
                            className={`text-sm font-semibold flex items-center gap-1 ${
                              metric.deltaTone === "up" ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {metric.deltaTone === "up" ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                            {metric.delta}
                          </div>
                          <p className="text-xs text-muted-foreground">{metric.hint}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
                {!dataQuery.isLoading && dataQuery.data?.metrics && (
                  <div className="flex flex-wrap gap-6 text-sm text-muted-foreground pl-1">
                    <span>
                      حجوزات معلقة: <strong>{dataQuery.data.metrics.pendingConsultations}</strong>
                    </span>
                    <span>
                      حجوزات مكتملة: <strong>{dataQuery.data.metrics.completedConsultations}</strong>
                    </span>
                    <span>
                      تذاكر معلقة: <strong>{dataQuery.data.metrics.pendingTickets}</strong>
                    </span>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            {!anomaliesEnabled && (
              <Alert variant="destructive">
                <BellRing className="h-4 w-4" />
                <AlertTitle>تنبيهات الشذوذ غير مفعلة</AlertTitle>
                <AlertDescription>فعّل علم anomalyAlerts لرؤية التنبيهات.</AlertDescription>
              </Alert>
            )}
            {anomaliesEnabled && (
              <div className="grid gap-4 md:grid-cols-2">
                {dataQuery.isLoading &&
                  Array.from({ length: 2 }).map((_, idx) => (
                    <Card key={idx} className="border">
                      <CardHeader className="space-y-2">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-56" />
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-8 w-20" />
                      </CardContent>
                    </Card>
                  ))}
                {!dataQuery.isLoading &&
                  (dataQuery.data?.anomalies ?? []).map((anomaly: AnomalyItem) => (
                    <Card
                      key={anomaly.title}
                      className={`border ${severityTone(anomaly.severity)}`}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                          {anomaly.severity === "high" ? <AlertTriangle className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                          {anomaly.title}
                        </CardTitle>
                        <CardDescription>{anomaly.detail}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between">
                        <Badge variant="outline">
                          {anomaly.severity === "high"
                            ? "مرتفع"
                            : anomaly.severity === "medium"
                              ? "متوسط"
                              : "منخفض"}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {anomaly.action}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="sla" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    SLA التوظيف
                  </CardTitle>
                  <CardDescription>
                    الرد الأول {dataQuery.data?.sla?.hiring.firstResponseHours ?? 24} ساعة،
                    القرار {dataQuery.data?.sla?.hiring.decisionDays ?? 7} أيام
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge>قيد المتابعة</Badge>
                  <p className="text-sm text-muted-foreground">المستهدف 95% التزام</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-green-600" />
                    SLA التذاكر
                  </CardTitle>
                  <CardDescription>
                    الرد الأول {dataQuery.data?.sla?.tickets.firstResponseHours ?? 4} ساعة،
                    الحل {dataQuery.data?.sla?.tickets.resolutionHours ?? 24} ساعة
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="secondary">مستقر</Badge>
                  <p className="text-sm text-muted-foreground">المستهدف 90% التزام</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    SLA الاستشارات
                  </CardTitle>
                  <CardDescription>
                    الرد الأول {dataQuery.data?.sla?.consulting.firstResponseHours ?? 8} ساعة،
                    التسليم {dataQuery.data?.sla?.consulting.deliveryHours ?? 48} ساعة
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-between">
                  <Badge variant="outline">تحت المراجعة</Badge>
                  <p className="text-sm text-muted-foreground">
                    المستهدف {dataQuery.data?.sla?.targetCompliance ?? 92}% التزام
                  </p>
                </CardContent>
              </Card>
            </div>
            <Separator />
            <div className="grid md:grid-cols-2 gap-4">
              <Alert>
                <AlertTitle>اقتراح تحسين</AlertTitle>
                <AlertDescription>
                  فعّل تنبيه دفع فوري لإعادة محاولة التحصيل بعد 15 دقيقة للحالات المتعثرة.
                </AlertDescription>
              </Alert>
              <Alert>
                <AlertTitle>انخفاض نشاط مستشارين</AlertTitle>
                <AlertDescription>
                  جدولة ترويج تلقائي لحزم الاستشارة للمستشارين الخاملين خلال 7 أيام.
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
