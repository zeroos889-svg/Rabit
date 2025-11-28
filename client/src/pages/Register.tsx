import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import {
  TRIAL_PROFILES,
  type TrialProfile,
  getTrialProfileById,
  storeTrialProfileSelection,
} from "@/lib/trialProfiles";

export default function Register() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phoneNumber: "",
    userType: "individual" as "employee" | "individual" | "company" | "consultant",
  });
  const [selectedTemplate, setSelectedTemplate] = useState<TrialProfile | null>(null);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data: { message?: string; token?: string; user?: Record<string, unknown> }) => {
      toast.success(data.message || "تم إنشاء الحساب بنجاح");
      
      // Save JWT token
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      
      // Save user profile
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect to appropriate dashboard
      setTimeout(() => {
        switch (formData.userType) {
          case "company":
            setLocation("/company/dashboard");
            break;
          case "consultant":
          case "individual":
            setLocation("/consultant-dashboard");
            break;
          case "employee":
            setLocation("/employee/dashboard");
            break;
          default:
            setLocation("/dashboard");
        }
      }, 500);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || "فشل إنشاء الحساب");
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password || !formData.name) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }

    setIsLoading(true);
    registerMutation.mutate(formData);
  };

  const applyTrialTemplate = (templateId: string) => {
    const profile = getTrialProfileById(templateId);
    if (!profile) return;
    setFormData(prev => ({
      ...prev,
      email: profile.demoEmail,
      password: profile.demoPassword,
      name: profile.title,
      userType: profile.suggestedUserType,
    }));
    setSelectedTemplate(profile);
    storeTrialProfileSelection(profile.id);
    toast.success("تم تجهيز البيانات التجريبية لهذا النموذج");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <BackButton />
      
      <div className="max-w-md mx-auto">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={APP_LOGO} alt="رابِط | Rabit" className="h-20 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("register.title", "إنشاء حساب جديد")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t("register.subtitle", "انضم إلى منصة رابِط لإدارة الموارد البشرية")}
          </p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader>
            <CardTitle>{t("register.cardTitle", "معلومات الحساب")}</CardTitle>
            <CardDescription>
              {t("register.cardDescription", "أدخل بياناتك لإنشاء حساب جديد")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-2">
              <p className="text-sm text-muted-foreground">
                {t("register.trialPrompt", "يمكنك استخدام قالب حساب تجريبي لملء الحقول تلقائياً")}
              </p>
              <div className="grid gap-2 sm:grid-cols-2">
                {TRIAL_PROFILES.map(profile => (
                  <button
                    key={profile.id}
                    type="button"
                    onClick={() => applyTrialTemplate(profile.id)}
                    className={`rounded-xl border p-3 text-start transition hover:border-primary/60 ${
                      selectedTemplate?.id === profile.id
                        ? "border-primary bg-primary/5"
                        : "border-muted"
                    }`}
                  >
                    <div className="text-sm font-semibold">{profile.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {profile.subtitle}
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <form onSubmit={handleRegister} className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">{t("register.name", "الاسم الكامل")}</Label>
                <div className="relative">
                  <User className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={t("register.namePlaceholder", "أدخل اسمك الكامل")}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("register.email", "البريد الإلكتروني")}</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("register.emailPlaceholder", "your@email.com")}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pr-10"
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="phone">{t("register.phone", "رقم الجوال (اختياري)")}</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t("register.phonePlaceholder", "05XXXXXXXX")}
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    className="pr-10"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">{t("register.password", "كلمة المرور")}</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("register.passwordPlaceholder", "8 أحرف على الأقل")}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pr-10 pl-10"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* User Type */}
              <div className="space-y-2">
                <Label htmlFor="userType">{t("register.userType", "نوع المستخدم")}</Label>
                <Select
                  value={formData.userType}
                  onValueChange={(value: typeof formData.userType) =>
                    setFormData({ ...formData, userType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">
                      {t("register.individual", "فرد")}
                    </SelectItem>
                    <SelectItem value="employee">
                      {t("register.employee", "موظف")}
                    </SelectItem>
                    <SelectItem value="company">
                      {t("register.company", "شركة")}
                    </SelectItem>
                    <SelectItem value="consultant">
                      {t("register.consultant", "مستشار")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? t("register.creating", "جاري إنشاء الحساب...") : t("register.submit", "إنشاء حساب")}
              </Button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t("register.hasAccount", "لديك حساب بالفعل؟")}{" "}
                  <Link href="/login">
                    <span className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer">
                      {t("register.loginLink", "تسجيل الدخول")}
                    </span>
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
