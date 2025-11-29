import { useState, useEffect, useCallback, memo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useTranslation } from "react-i18next";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Edit3,
  CheckCircle2,
  X,
  Key,
  Globe,
  Bell,
  CreditCard,
  Lock,
  type LucideIcon,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import {
  AUDIT_ACTION_META,
  type AuditAction,
  type AuditTone,
  useAccountAudit,
} from "@/hooks/useAccountAudit";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";

// ============================================================================
// Types
// ============================================================================

interface StatCardProps {
  icon: LucideIcon;
  title: string;
  value: string | number;
  subtitle?: string;
  gradient?: string;
}

// ============================================================================
// Animation Component
// ============================================================================

function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Constants
// ============================================================================

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
  info: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-400/40 dark:bg-sky-400/10 dark:text-sky-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-400/40 dark:bg-emerald-400/10 dark:text-emerald-300",
  warning:
    "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/40 dark:bg-amber-400/10 dark:text-amber-300",
  critical:
    "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-400/40 dark:bg-rose-400/10 dark:text-rose-300",
};

const TONE_DOT_STYLES: Record<AuditTone, string> = {
  info: "border-sky-200 bg-sky-500",
  success: "border-emerald-200 bg-emerald-500",
  warning: "border-amber-200 bg-amber-500",
  critical: "border-rose-200 bg-rose-500",
};

const FALLBACK_ACTION_META = {
  label: "نشاط",
  labelEn: "Activity",
  tone: "info" as AuditTone,
  description: "تم تسجيل حدث جديد على حسابك.",
  descriptionEn: "A new event was recorded on your account.",
};

const getActionVisuals = (action: AuditAction) => {
  const meta = AUDIT_ACTION_META[action] ?? FALLBACK_ACTION_META;
  const Icon = ACTION_ICONS[action] ?? Activity;
  return { meta, Icon, tone: meta.tone ?? FALLBACK_ACTION_META.tone };
};

// ============================================================================
// Sub-Components
// ============================================================================

// Glass Card Component
const GlassCard = memo(function GlassCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-white/20 dark:border-gray-800/50 rounded-2xl shadow-xl shadow-black/5 ${className}`}
    >
      {children}
    </div>
  );
});

// Stat Card Component
const StatCard = memo(function StatCard({
  icon: Icon,
  title,
  value,
  subtitle,
  gradient = "from-primary to-purple-600",
}: StatCardProps) {
  return (
    <Card className="border-0 shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden group">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div
            className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
          >
            <Icon className="h-7 w-7 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

// Info Field Component
const InfoField = memo(function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className="text-lg font-medium">{value}</p>
    </div>
  );
});

// Quick Action Button Component
const QuickActionButton = memo(function QuickActionButton({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  variant?: "default" | "outline";
}) {
  return (
    <Button
      variant={variant}
      className="h-auto py-4 px-5 flex-col gap-2 group"
      onClick={onClick}
    >
      <div className="h-10 w-10 rounded-xl bg-white/20 dark:bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5" />
      </div>
      <span className="text-sm">{label}</span>
    </Button>
  );
});

// ============================================================================
// Main Component
// ============================================================================

export default function ProfileRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const { user, loading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

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

  // Mutations
  const updateProfileMutation = trpc.profile.updateProfile.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic
          ? "تم تحديث الملف الشخصي بنجاح"
          : "Profile updated successfully"
      );
      setIsEditing(false);
      refetch();
    },
    onError: (error: { message?: string }) => {
      toast.error(
        (isArabic ? "فشل تحديث الملف الشخصي: " : "Failed to update profile: ") +
          error.message
      );
    },
  });

  const uploadFileMutation = trpc.consulting.uploadFile.useMutation();

  const uploadProfilePictureMutation =
    trpc.profile.uploadProfilePicture.useMutation({
      onSuccess: () => {
        toast.success(
          isArabic
            ? "تم تحديث صورة الملف الشخصي بنجاح"
            : "Profile picture updated successfully"
        );
        refetch();
      },
      onError: (error: { message?: string }) => {
        toast.error(
          (isArabic ? "فشل تحديث الصورة: " : "Failed to update picture: ") +
            error.message
        );
      },
    });

  // Handlers
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

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        isArabic
          ? "حجم الملف يجب أن يكون أقل من 5MB"
          : "File size must be less than 5MB"
      );
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error(
        isArabic ? "يجب أن يكون الملف صورة" : "File must be an image"
      );
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const uploadResult = await uploadFileMutation.mutateAsync({
          fileName: file.name,
          fileType: file.type,
          fileData: base64,
        });
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
    if (!date) return isArabic ? "غير متوفر" : "Not available";
    return new Date(date).toLocaleDateString(isArabic ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Loading state
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-purple-600 animate-pulse mx-auto" />
            <Loader2 className="h-8 w-8 animate-spin text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground">
            {isArabic ? "جاري التحميل..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  const userData = profileData?.user;
  const hasAuditData = auditEntries.length > 0;
  const totalActions = auditStats?.totals ?? auditEntries.length;
  const showInitialAuditLoading = auditLoading && !hasAuditData;

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ============== Hero Section ============== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(99,102,241,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(168,85,247,0.15)_0%,_transparent_50%)]" />
        <div className="absolute top-1/4 -start-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 -end-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        <div className="container relative py-16 lg:py-24">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            {/* Avatar Section */}
            <AnimateOnScroll>
              <div className="relative group">
                <div className="absolute -inset-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500 rounded-full opacity-75 blur-lg group-hover:opacity-100 transition-opacity" />
                <Avatar className="relative h-32 w-32 lg:h-40 lg:w-40 ring-4 ring-white/20">
                  <AvatarImage src={userData?.profilePicture || undefined} />
                  <AvatarFallback className="text-4xl lg:text-5xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {getInitials(userData?.name || null)}
                  </AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-picture-upload"
                  className="absolute bottom-2 end-2 h-10 w-10 rounded-full bg-white text-slate-900 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors shadow-lg"
                >
                  <Camera className="h-5 w-5" />
                  <input
                    id="profile-picture-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    aria-label={
                      isArabic
                        ? "تحميل صورة الملف الشخصي"
                        : "Upload profile picture"
                    }
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
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
            </AnimateOnScroll>

            {/* Info Section */}
            <AnimateOnScroll delay={100} className="text-center lg:text-start">
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <h1 className="text-3xl lg:text-4xl font-bold">
                    {userData?.name || (isArabic ? "مستخدم" : "User")}
                  </h1>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="h-3 w-3 me-1" />
                    {isArabic ? "نشط" : "Active"}
                  </Badge>
                </div>

                <p className="text-lg text-white/70 flex items-center justify-center lg:justify-start gap-2">
                  <Mail className="h-5 w-5" />
                  {userData?.email ||
                    (isArabic ? "لا يوجد بريد إلكتروني" : "No email")}
                </p>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm text-white/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {isArabic ? "انضم في " : "Joined "}
                    {formatDate(userData?.createdAt || null)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-white/40" />
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    {userData?.role === "admin"
                      ? isArabic
                        ? "مدير"
                        : "Admin"
                      : isArabic
                        ? "مستخدم"
                        : "User"}
                  </span>
                </div>

                <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-white text-slate-900 hover:bg-gray-100"
                  >
                    <Edit3 className="h-4 w-4 me-2" />
                    {isArabic ? "تعديل الملف الشخصي" : "Edit Profile"}
                  </Button>
                  <Button
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <Settings className="h-4 w-4 me-2" />
                    {isArabic ? "الإعدادات" : "Settings"}
                  </Button>
                </div>
              </div>
            </AnimateOnScroll>
          </div>

          {/* Stats Row */}
          <AnimateOnScroll delay={200}>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                <p className="text-3xl font-bold">{totalActions}</p>
                <p className="text-sm text-white/70">
                  {isArabic ? "إجمالي الأنشطة" : "Total Activities"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                <p className="text-3xl font-bold">{topActions.length}</p>
                <p className="text-sm text-white/70">
                  {isArabic ? "أنواع النشاط" : "Activity Types"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                <p className="text-3xl font-bold">
                  {lastActivityRelative || (isArabic ? "لا يوجد" : "None")}
                </p>
                <p className="text-sm text-white/70">
                  {isArabic ? "آخر نشاط" : "Last Activity"}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 text-center">
                <p className="text-3xl font-bold text-emerald-400">
                  {isArabic ? "نشط" : "Active"}
                </p>
                <p className="text-sm text-white/70">
                  {isArabic ? "حالة الحساب" : "Account Status"}
                </p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ============== Main Content ============== */}
      <main className="container py-12">
        <AnimateOnScroll>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-8"
          >
            <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-gray-100 dark:bg-gray-800/50 p-1 rounded-xl">
              <TabsTrigger
                value="overview"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
              >
                <User className="h-4 w-4 me-2" />
                {isArabic ? "نظرة عامة" : "Overview"}
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
              >
                <Activity className="h-4 w-4 me-2" />
                {isArabic ? "النشاط" : "Activity"}
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-sm"
              >
                <Shield className="h-4 w-4 me-2" />
                {isArabic ? "الأمان" : "Security"}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-8">
              {/* Edit Profile Form */}
              {isEditing && (
                <AnimateOnScroll>
                  <Card className="border-0 shadow-lg overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500" />
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            {isArabic
                              ? "تعديل الملف الشخصي"
                              : "Edit Profile"}
                          </CardTitle>
                          <CardDescription>
                            {isArabic
                              ? "قم بتحديث معلوماتك الشخصية"
                              : "Update your personal information"}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancel}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="name">
                            {isArabic ? "الاسم الكامل" : "Full Name"}
                          </Label>
                          <div className="relative">
                            <User className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder={
                                isArabic
                                  ? "أدخل اسمك الكامل"
                                  : "Enter your full name"
                              }
                              className="ps-10"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">
                            {isArabic ? "البريد الإلكتروني" : "Email"}
                          </Label>
                          <div className="relative">
                            <Mail className="absolute start-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              placeholder="example@company.com"
                              className="ps-10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={handleSave}
                          disabled={updateProfileMutation.isPending}
                          className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="me-2 h-4 w-4 animate-spin" />
                              {isArabic ? "جاري الحفظ..." : "Saving..."}
                            </>
                          ) : (
                            <>
                              <Save className="me-2 h-4 w-4" />
                              {isArabic ? "حفظ التغييرات" : "Save Changes"}
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancel}
                          disabled={updateProfileMutation.isPending}
                        >
                          {isArabic ? "إلغاء" : "Cancel"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              )}

              {/* Profile Info Cards */}
              <div className="grid gap-6 md:grid-cols-2">
                <AnimateOnScroll>
                  <Card className="border-0 shadow-md h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <User className="h-5 w-5 text-primary" />
                        {isArabic ? "المعلومات الشخصية" : "Personal Information"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <InfoField
                        icon={User}
                        label={isArabic ? "الاسم الكامل" : "Full Name"}
                        value={
                          userData?.name ||
                          (isArabic ? "غير محدد" : "Not specified")
                        }
                      />
                      <InfoField
                        icon={Mail}
                        label={isArabic ? "البريد الإلكتروني" : "Email"}
                        value={
                          userData?.email ||
                          (isArabic ? "غير محدد" : "Not specified")
                        }
                      />
                      <InfoField
                        icon={Shield}
                        label={isArabic ? "نوع الحساب" : "Account Type"}
                        value={
                          userData?.role === "admin"
                            ? isArabic
                              ? "مدير"
                              : "Admin"
                            : isArabic
                              ? "مستخدم"
                              : "User"
                        }
                      />
                    </CardContent>
                  </Card>
                </AnimateOnScroll>

                <AnimateOnScroll delay={100}>
                  <Card className="border-0 shadow-md h-full">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Clock className="h-5 w-5 text-primary" />
                        {isArabic ? "معلومات الحساب" : "Account Information"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <InfoField
                        icon={Calendar}
                        label={isArabic ? "تاريخ التسجيل" : "Registration Date"}
                        value={formatDate(userData?.createdAt || null)}
                      />
                      <InfoField
                        icon={Clock}
                        label={isArabic ? "آخر تسجيل دخول" : "Last Sign In"}
                        value={formatDate(userData?.lastSignedIn || null)}
                      />
                      <InfoField
                        icon={Key}
                        label={isArabic ? "طريقة تسجيل الدخول" : "Login Method"}
                        value={userData?.loginMethod || "Manus OAuth"}
                      />
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              </div>

              {/* Quick Actions */}
              <AnimateOnScroll delay={200}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                      {isArabic ? "إجراءات سريعة" : "Quick Actions"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                        onClick={() => setIsEditing(true)}
                      >
                        <Edit3 className="h-5 w-5 text-primary" />
                        <span className="text-sm">
                          {isArabic ? "تعديل الملف" : "Edit Profile"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <Lock className="h-5 w-5 text-amber-500" />
                        <span className="text-sm">
                          {isArabic ? "تغيير كلمة المرور" : "Change Password"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <Bell className="h-5 w-5 text-blue-500" />
                        <span className="text-sm">
                          {isArabic ? "الإشعارات" : "Notifications"}
                        </span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto py-4 flex-col gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                      >
                        <Globe className="h-5 w-5 text-emerald-500" />
                        <span className="text-sm">
                          {isArabic ? "اللغة" : "Language"}
                        </span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-8">
              {/* Activity Stats */}
              <AnimateOnScroll>
                <div className="grid gap-4 md:grid-cols-3">
                  <StatCard
                    icon={Activity}
                    title={isArabic ? "إجمالي الأنشطة" : "Total Activities"}
                    value={totalActions}
                    subtitle={
                      lastActivityRelative
                        ? `${isArabic ? "آخر نشاط " : "Last activity "}${lastActivityRelative}`
                        : undefined
                    }
                    gradient="from-blue-500 to-cyan-500"
                  />
                  {topActions.slice(0, 2).map((action, index) => {
                    const { Icon, meta, tone } = getActionVisuals(action.action);
                    const gradients = [
                      "from-emerald-500 to-teal-500",
                      "from-amber-500 to-orange-500",
                    ];
                    return (
                      <StatCard
                        key={action.action}
                        icon={Icon}
                        title={meta.label}
                        value={action.count}
                        subtitle={meta.description}
                        gradient={gradients[index] || "from-primary to-purple-600"}
                      />
                    );
                  })}
                </div>
              </AnimateOnScroll>

              {/* Refresh Button */}
              <AnimateOnScroll delay={100}>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchAudit()}
                    disabled={auditLoading}
                    className="gap-2"
                  >
                    {auditRefetching ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCcw className="h-4 w-4" />
                    )}
                    {isArabic ? "تحديث البيانات" : "Refresh Data"}
                  </Button>
                </div>
              </AnimateOnScroll>

              {/* Activity Timeline */}
              <AnimateOnScroll delay={200}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <History className="h-5 w-5 text-primary" />
                      {isArabic
                        ? "سجل النشاط التفصيلي"
                        : "Detailed Activity Log"}
                    </CardTitle>
                    <CardDescription>
                      {isArabic
                        ? "أحدث العمليات المنفذة مع توقيت زمني وترتيب حسب اليوم"
                        : "Latest operations with timestamps sorted by day"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {showInitialAuditLoading ? (
                      <div className="flex items-center justify-center py-16">
                        <div className="text-center space-y-4">
                          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                          <p className="text-muted-foreground">
                            {isArabic ? "جاري تحميل النشاط..." : "Loading activity..."}
                          </p>
                        </div>
                      </div>
                    ) : hasAuditData ? (
                      <div className="space-y-8">
                        {groupedEntries.map((group) => (
                          <div key={group.key} className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                              <Badge
                                variant="secondary"
                                className="font-semibold"
                              >
                                {group.dayLabel}
                              </Badge>
                              <span className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                            </div>
                            <div className="space-y-4 border-s-2 border-dashed border-gray-200 dark:border-gray-700 ps-6 ms-2">
                              {group.items.map((entry) => {
                                const { Icon, meta, tone } = getActionVisuals(
                                  entry.action
                                );
                                return (
                                  <div key={entry.id} className="relative">
                                    <span
                                      className={`absolute -start-[calc(1.5rem+5px)] top-5 h-3 w-3 rounded-full ring-4 ring-white dark:ring-gray-900 ${TONE_DOT_STYLES[tone]}`}
                                    />
                                    <Card className="border shadow-sm hover:shadow-md transition-shadow">
                                      <CardContent className="p-4">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                          <Badge
                                            variant="outline"
                                            className={`gap-1.5 ${TONE_CHIP_STYLES[tone]}`}
                                          >
                                            <Icon className="h-3.5 w-3.5" />
                                            {meta.label}
                                          </Badge>
                                          <span className="text-xs text-muted-foreground">
                                            {entry.timeLabel} •{" "}
                                            {entry.relativeLabel}
                                          </span>
                                        </div>
                                        <p className="text-sm">
                                          {entry.summary ||
                                            meta.description ||
                                            FALLBACK_ACTION_META.description}
                                        </p>
                                        {entry.resource && (
                                          <Badge
                                            variant="secondary"
                                            className="mt-3"
                                          >
                                            {entry.resource}
                                          </Badge>
                                        )}
                                      </CardContent>
                                    </Card>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl border-2 border-dashed bg-gray-50/50 dark:bg-gray-800/20 p-12 text-center">
                        <Activity className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                        <p className="text-muted-foreground">
                          {isArabic
                            ? "لا توجد عمليات لعرضها حالياً. سيتم تحديث السجل تلقائياً مع كل نشاط جديد."
                            : "No activities to display. The log will update automatically with each new activity."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-8">
              <AnimateOnScroll>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5 text-primary" />
                      {isArabic ? "أمان الحساب" : "Account Security"}
                    </CardTitle>
                    <CardDescription>
                      {isArabic
                        ? "إدارة إعدادات الأمان والخصوصية لحسابك"
                        : "Manage your account security and privacy settings"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Password Section */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Key className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {isArabic ? "كلمة المرور" : "Password"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic
                              ? "آخر تغيير منذ 30 يوم"
                              : "Last changed 30 days ago"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        {isArabic ? "تغيير" : "Change"}
                      </Button>
                    </div>

                    {/* Two-Factor Authentication */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                          <Shield className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {isArabic
                              ? "التحقق بخطوتين"
                              : "Two-Factor Authentication"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic
                              ? "أضف طبقة حماية إضافية لحسابك"
                              : "Add an extra layer of security to your account"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        {isArabic ? "تفعيل" : "Enable"}
                      </Button>
                    </div>

                    {/* Active Sessions */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                          <Globe className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {isArabic ? "الجلسات النشطة" : "Active Sessions"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isArabic
                              ? "إدارة الأجهزة المتصلة بحسابك"
                              : "Manage devices connected to your account"}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline">
                        {isArabic ? "عرض" : "View"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              {/* Privacy Settings */}
              <AnimateOnScroll delay={100}>
                <Card className="border-0 shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-primary" />
                      {isArabic ? "إعدادات الخصوصية" : "Privacy Settings"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">
                          {isArabic ? "إظهار البريد الإلكتروني" : "Show Email"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic
                            ? "السماح للآخرين برؤية بريدك الإلكتروني"
                            : "Allow others to see your email address"}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {isArabic ? "مخفي" : "Hidden"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b">
                      <div>
                        <p className="font-medium">
                          {isArabic ? "سجل النشاط" : "Activity Log"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic
                            ? "حفظ سجل لجميع نشاطاتك"
                            : "Keep a log of all your activities"}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {isArabic ? "مفعل" : "Enabled"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">
                          {isArabic ? "الإشعارات البريدية" : "Email Notifications"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic
                            ? "استلام إشعارات على بريدك الإلكتروني"
                            : "Receive notifications via email"}
                        </p>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                        {isArabic ? "مفعل" : "Enabled"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              {/* Danger Zone */}
              <AnimateOnScroll delay={200}>
                <Card className="border-0 shadow-md border-red-200 dark:border-red-900/50">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <Trash2 className="h-5 w-5" />
                      {isArabic ? "منطقة الخطر" : "Danger Zone"}
                    </CardTitle>
                    <CardDescription>
                      {isArabic
                        ? "إجراءات لا يمكن التراجع عنها"
                        : "Actions that cannot be undone"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-700 dark:text-red-400">
                          {isArabic ? "حذف الحساب" : "Delete Account"}
                        </p>
                        <p className="text-sm text-red-600/70 dark:text-red-400/70">
                          {isArabic
                            ? "سيتم حذف جميع بياناتك نهائياً"
                            : "All your data will be permanently deleted"}
                        </p>
                      </div>
                      <Button variant="destructive">
                        {isArabic ? "حذف الحساب" : "Delete Account"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </TabsContent>
          </Tabs>
        </AnimateOnScroll>
      </main>

      <div className="bg-white dark:bg-slate-950 py-10">
        <div className="container">
          <ConnectedPagesSection
            isArabic={isArabic}
            highlight={{ ar: "روابط متصلة", en: "Stay Connected" }}
            title={{
              ar: "أكمل رحلتك بعد تحديث ملفك",
              en: "Continue after updating your profile",
            }}
            subtitle={{
              ar: "انتقل بسرعة إلى الأدوات، الباقات، أو الاستشارات لتجربة المنصة كاملة.",
              en: "Jump quickly to tools, plans, or consulting to experience the full platform.",
            }}
            className="py-0"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
