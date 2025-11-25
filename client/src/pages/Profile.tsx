import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  User,
  Mail,
  Calendar,
  Clock,
  Loader2,
  Save,
  Shield,
  Camera,
  History,
  RefreshCcw,
  Activity,
  LogIn,
  UserPlus,
  FilePlus,
  FileText,
  Trash2,
  Download,
  Bookmark,
  BellRing,
  MessageSquare,
  Sparkles,
  Headphones,
  Settings,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  AUDIT_ACTION_META,
  type AuditAction,
  type AuditTone,
  useAccountAudit,
} from "@/hooks/useAccountAudit";

const ACTION_ICONS: Partial<Record<AuditAction, LucideIcon>> = {
  "auth:login": LogIn,
  "auth:register": UserPlus,
  "document:create": FilePlus,
  "document:delete": Trash2,
  "document:download": Download,
  "letter:save": Bookmark,
  "letter:delete": Trash2,
  "chat:send": MessageSquare,
  "chat:ai_reply": Sparkles,
  "notification:dispatch": BellRing,
  "pdf:generate": FileText,
  "consulting:ticket": Headphones,
  "account:update": Settings,
};

const TONE_CHIP_STYLES: Record<AuditTone, string> = {
  info: "border-sky-100 bg-sky-50 text-sky-900 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-100",
  success:
    "border-emerald-100 bg-emerald-50 text-emerald-900 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-100",
  warning:
    "border-amber-100 bg-amber-50 text-amber-900 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-100",
  critical:
    "border-rose-100 bg-rose-50 text-rose-900 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-100",
};

const TONE_DOT_STYLES: Record<AuditTone, string> = {
  info: "border-sky-200 bg-sky-500/80",
  success: "border-emerald-200 bg-emerald-500/80",
  warning: "border-amber-200 bg-amber-500/80",
  critical: "border-rose-200 bg-rose-500/80",
};

const FALLBACK_ACTION_META: { label: string; tone: AuditTone; description: string } = {
  label: "نشاط",
  tone: "info",
  description: "تم تسجيل حدث جديد على حسابك.",
};

const getActionVisuals = (action: AuditAction) => {
  const meta = AUDIT_ACTION_META[action] ?? FALLBACK_ACTION_META;
  const Icon = ACTION_ICONS[action] ?? Activity;
  return { meta, Icon, tone: meta.tone ?? FALLBACK_ACTION_META.tone };
};

export default function Profile() {
  const { user, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  // Get profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    refetch,
  } = trpc.profile.getProfile.useQuery(undefined, {
    enabled: !!user,
  });

  const {
    entries: auditEntries,
    groupedEntries,
    stats: auditStats,
    topActions,
    lastActivityRelative,
    isLoading: auditLoading,
    isRefetching: auditRefetching,
    refetch: refetchAudit,
  } = useAccountAudit({
    limit: 40,
    enabled: !!user,
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profileData?.user) {
      setName(profileData.user.name || "");
      setEmail(profileData.user.email || "");
    }
  }, [profileData]);

  // Update profile mutation
  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      setIsEditing(false);
      refetch();
    },
    onError: error => {
      toast.error("فشل تحديث الملف الشخصي: " + error.message);
    },
  });

  // Upload file mutation
  const uploadFileMutation = trpc.consulting.uploadFile.useMutation();

  // Upload profile picture mutation
  const uploadProfilePictureMutation =
    trpc.profile.uploadProfilePicture.useMutation({
      onSuccess: () => {
        toast.success("تم تحديث صورة الملف الشخصي بنجاح");
        refetch();
      },
      onError: error => {
        toast.error("فشل تحديث الصورة: " + error.message);
      },
    });

  const handleSave = () => {
    updateProfileMutation.mutate({
      name: name || undefined,
      email: email || undefined,
    });
  };

  const handleCancel = () => {
    if (profileData?.user) {
      setName(profileData.user.name || "");
      setEmail(profileData.user.email || "");
    }
    setIsEditing(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("حجم الملف يجب أن يكون أقل من 5MB");
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("يجب أن يكون الملف صورة");
      return;
    }

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;

        // Upload to S3
        const uploadResult = await uploadFileMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        });

        // Update profile picture
        await uploadProfilePictureMutation.mutateAsync({
          imageUrl: uploadResult.url,
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return parts[0][0] + parts[1][0];
    }
    return name[0];
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "غير متوفر";
    return new Date(date).toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userData = profileData?.user;
  const hasAuditData = auditEntries.length > 0;
  const totalActions = auditStats?.totals ?? auditEntries.length;
  const showInitialAuditLoading = auditLoading && !hasAuditData;

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <Header />

      <main className="flex-1 container py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gradient-primary">
              الملف الشخصي
            </h1>
            <p className="text-muted-foreground mt-2">
              إدارة معلوماتك الشخصية وإعدادات حسابك
            </p>
          </div>

          {/* Profile Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      <AvatarImage
                        src={userData?.profilePicture || undefined}
                      />
                      <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                        {getInitials(userData?.name || null)}
                      </AvatarFallback>
                    </Avatar>
                    <label
                      htmlFor="profile-picture-upload"
                      className="absolute bottom-0 left-0 h-7 w-7 rounded-full bg-primary text-white flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={
                          uploadFileMutation.isPending ||
                          uploadProfilePictureMutation.isPending
                        }
                      />
                    </label>
                    {(uploadFileMutation.isPending ||
                      uploadProfilePictureMutation.isPending) && (
                      <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-2xl">
                      {userData?.name || "مستخدم"}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <Mail className="h-4 w-4" />
                      {userData?.email || "لا يوجد بريد إلكتروني"}
                    </CardDescription>
                  </div>
                </div>
                {!isEditing && (
                  <Button onClick={() => setIsEditing(true)}>
                    تعديل الملف الشخصي
                  </Button>
                )}
              </div>
            </CardHeader>

            <Separator />

            <CardContent className="pt-6">
              {isEditing ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">الاسم الكامل</Label>
                    <div className="relative">
                      <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="أدخل اسمك الكامل"
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">البريد الإلكتروني</Label>
                    <div className="relative">
                      <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="example@company.com"
                        className="pr-10"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={handleSave}
                      disabled={updateProfileMutation.isPending}
                      className="gradient-primary text-white"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          جاري الحفظ...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          حفظ التغييرات
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={updateProfileMutation.isPending}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <User className="h-4 w-4" />
                        <span>الاسم الكامل</span>
                      </div>
                      <p className="text-lg font-medium">
                        {userData?.name || "غير محدد"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Mail className="h-4 w-4" />
                        <span>البريد الإلكتروني</span>
                      </div>
                      <p className="text-lg font-medium">
                        {userData?.email || "غير محدد"}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Shield className="h-4 w-4" />
                        <span>نوع الحساب</span>
                      </div>
                      <p className="text-lg font-medium">
                        {userData?.role === "admin" ? "مدير" : "مستخدم"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Calendar className="h-4 w-4" />
                        <span>تاريخ التسجيل</span>
                      </div>
                      <p className="text-lg font-medium">
                        {formatDate(userData?.createdAt || null)}
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Clock className="h-4 w-4" />
                        <span>آخر تسجيل دخول</span>
                      </div>
                      <p className="text-lg font-medium">
                        {formatDate(userData?.lastSignedIn || null)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>معلومات الحساب</CardTitle>
              <CardDescription>معلومات إضافية حول حسابك ونشاطك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">
                    معرف المستخدم
                  </span>
                  <span className="font-mono text-sm">{userData?.id}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b">
                  <span className="text-sm text-muted-foreground">
                    طريقة تسجيل الدخول
                  </span>
                  <span className="text-sm">
                    {userData?.loginMethod || "Manus OAuth"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-muted-foreground">
                    حالة الحساب
                  </span>
                  <span className="text-sm text-green-600 font-medium">
                    نشط
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Audit Stats */}
          <Card>
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <History className="h-5 w-5" />
                  نشاط الحساب
                </CardTitle>
                <CardDescription>
                  متابعة استخدامك خلال الأيام الأخيرة وإجمالي الأنشطة
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={refetchAudit}
                disabled={auditLoading}
                className="gap-2"
              >
                {auditRefetching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4" />
                )}
                تحديث البيانات
              </Button>
            </CardHeader>
            <CardContent className="space-y-6">
              {showInitialAuditLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : hasAuditData ? (
                <>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border bg-muted/30 p-4">
                      <p className="text-sm text-muted-foreground">
                        إجمالي الأنشطة
                      </p>
                      <p className="text-3xl font-bold mt-1">{totalActions}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {lastActivityRelative
                          ? `آخر نشاط ${lastActivityRelative}`
                          : "لا يوجد نشاط حديث"}
                      </p>
                    </div>
                    {topActions.slice(0, 2).map(action => {
                      const { Icon, meta, tone } = getActionVisuals(action.action);
                      return (
                        <div
                          key={action.action}
                          className="rounded-2xl border bg-card/40 p-4"
                        >
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Icon className="h-4 w-4" />
                            {meta.label}
                          </div>
                          <p className="text-2xl font-semibold mt-1">
                            {action.count}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {meta.description || FALLBACK_ACTION_META.description}
                          </p>
                          <span
                            className={`mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium ${TONE_CHIP_STYLES[tone]}`}
                          >
                            الأكثر تكراراً
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {topActions.length > 2 && (
                    <div className="flex flex-wrap gap-2">
                      {topActions.slice(2).map(action => (
                        <Badge
                          key={action.action}
                          variant="outline"
                          className="rounded-full border-dashed bg-background/60"
                        >
                          {action.label}
                          <span className="mx-1 text-xs text-muted-foreground">
                            •
                          </span>
                          {action.count}
                        </Badge>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  لم يتم تسجيل أي نشاط حتى الآن. ستظهر الأحداث هنا فور تفاعلك
                  مع المنصة.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Audit Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                سجل النشاط التفصيلي
              </CardTitle>
              <CardDescription>
                أحدث العمليات المنفذة مع توقيت زمني وترتيب حسب اليوم
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showInitialAuditLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : hasAuditData ? (
                <div className="space-y-8">
                  {groupedEntries.map(group => (
                    <div key={group.key} className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                        <span className="h-px flex-1 bg-border" />
                        {group.dayLabel}
                        <span className="h-px flex-1 bg-border" />
                      </div>
                      <div className="space-y-4 border-r border-dashed pr-4">
                        {group.items.map(entry => {
                          const { Icon, meta, tone } = getActionVisuals(entry.action);
                          return (
                            <div key={entry.id} className="relative pr-6">
                              <span
                                className={`absolute right-[-10px] top-5 h-4 w-4 rounded-full border-2 ${TONE_DOT_STYLES[tone]}`}
                              />
                              <div className="rounded-xl border bg-card/60 p-4 shadow-sm">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${TONE_CHIP_STYLES[tone]}`}
                                  >
                                    <Icon className="h-3.5 w-3.5" />
                                    {meta.label}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {entry.timeLabel} • {entry.relativeLabel}
                                  </span>
                                </div>
                                <p className="mt-3 text-sm">
                                  {entry.summary ||
                                    meta.description ||
                                    FALLBACK_ACTION_META.description}
                                </p>
                                {entry.resource && (
                                  <Badge
                                    variant="secondary"
                                    className="mt-3 w-fit rounded-full"
                                  >
                                    {entry.resource}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed bg-muted/20 p-8 text-center text-sm text-muted-foreground">
                  لا توجد عمليات لعرضها حالياً. سيتم تحديث السجل تلقائياً مع كل
                  نشاط جديد.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
