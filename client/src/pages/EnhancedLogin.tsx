import { useState, useEffect } from "react";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  Linkedin,
  Shield,
  Check,
  AlertCircle,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import { cn } from "@/lib/utils";
import {
  TRIAL_PROFILES,
  type TrialProfile,
  getTrialProfileById,
  readTrialProfileSelection,
  storeTrialProfileSelection,
  clearTrialProfileSelection,
} from "@/lib/trialProfiles";

// eslint-disable-next-line sonarjs/cognitive-complexity
export default function EnhancedLogin() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTrialProfile, setActiveTrialProfile] = useState<TrialProfile | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  // Load saved email if remember me was checked
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    if (typeof window !== "undefined") {
      try {
        const params = new URLSearchParams(window.location.search);
        const trialId = params.get("trial");
        let profile: TrialProfile | null | undefined = getTrialProfileById(trialId);
        if (!profile) {
          profile = readTrialProfileSelection();
        }

        if (trialId) {
          window.history.replaceState({}, document.title, window.location.pathname);
        }

        if (profile) {
          applyTrialProfile(profile, { persist: false, silent: true });
        }
      } catch (error) {
        console.warn("Failed to hydrate trial profile", error);
      }
    }
  }, []);

  const applyTrialProfile = (
    profile: TrialProfile,
    options: { persist?: boolean; silent?: boolean } = {}
  ) => {
    setFormData({ email: profile.demoEmail, password: profile.demoPassword });
    setRememberMe(true);
    setActiveTrialProfile(profile);
    if (options.persist) {
      storeTrialProfileSelection(profile.id);
    }
    if (!options.silent) {
      toast.success(isArabic ? "تم تعبئة البيانات التجريبية" : "Demo credentials auto-filled");
    }
  };

  const handleTrialSelection = (profileId: string) => {
    const profile = getTrialProfileById(profileId);
    if (!profile) return;
    applyTrialProfile(profile, { persist: true });
  };

  const clearTrialSelection = () => {
    setActiveTrialProfile(null);
    clearTrialProfileSelection();
    setFormData({ email: "", password: "" });
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!formData.email) {
      errors.email = isArabic ? "البريد الإلكتروني مطلوب" : "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = isArabic ? "البريد الإلكتروني غير صحيح" : "Invalid email format";
    }
    
    if (!formData.password) {
      errors.password = isArabic ? "كلمة المرور مطلوبة" : "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = isArabic ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل" : "Password must be at least 8 characters";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message || (isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful"));
      
      // Save JWT token
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      
      // Save user profile
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Redirect based on user role and type
      setTimeout(() => {
        const role = data.user?.role;
        const userType = data.user?.userType;
        
        if (role === "admin") {
          setLocation("/admin/dashboard");
        } else if (userType === "company") {
          setLocation("/dashboard/company");
        } else if (userType === "consultant") {
          setLocation("/consultant-dashboard");
        } else if (userType === "employee") {
          setLocation("/employee/dashboard");
        } else {
          setLocation("/dashboard");
        }
      }, 500);
    },
    onError: (error) => {
      toast.error(error.message || (isArabic ? "فشل تسجيل الدخول" : "Login failed"));
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    loginMutation.mutate(formData);
  };

  const handleOAuthLogin = (provider: string) => {
    toast.info(
      isArabic
        ? `تسجيل الدخول عبر ${provider} - قريباً`
        : `${provider} login - Coming soon`
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      <BackButton />
      
      <div className="max-w-md mx-auto relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-4">
            <img src={APP_LOGO} alt="رابِط | Rabit" className="h-20 w-auto drop-shadow-lg" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {isArabic ? "مرحباً بعودتك" : "Welcome Back"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isArabic ? "قم بتسجيل الدخول للوصول إلى حسابك" : "Sign in to access your account"}
          </p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {isArabic ? "تسجيل الدخول" : "Login"}
            </CardTitle>
            <CardDescription className="text-center">
              {isArabic
                ? "أدخل بريدك الإلكتروني وكلمة المرور للمتابعة"
                : "Enter your email and password to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6 space-y-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{isArabic ? "اختر حساباً تجريبياً" : "Choose a trial persona"}</span>
                {activeTrialProfile && (
                  <Badge variant="outline" className="flex items-center gap-2">
                    {activeTrialProfile.title}
                    <button
                      type="button"
                      className="text-xs text-red-500"
                      onClick={clearTrialSelection}
                    >
                      {isArabic ? "إزالة" : "Clear"}
                    </button>
                  </Badge>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TRIAL_PROFILES.map(profile => {
                  const isActive = activeTrialProfile?.id === profile.id;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => handleTrialSelection(profile.id)}
                      className={cn(
                        "rounded-xl border p-3 text-start transition hover:border-primary/60",
                        isActive
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-muted"
                      )}
                    >
                      <p className="text-sm font-semibold">{profile.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {profile.subtitle}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  {isArabic ? "البريد الإلكتروني" : "Email"}
                </Label>
                <div className="relative">
                  <Mail className={cn(
                    "absolute top-3 h-4 w-4 text-gray-400",
                    isArabic ? "right-3" : "left-3"
                  )} />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    className={cn(
                      "transition-all",
                      isArabic ? "pr-10" : "pl-10",
                      validationErrors.email && "border-red-500 focus-visible:ring-red-500"
                    )}
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: undefined });
                      }
                    }}
                    disabled={isLoading}
                    autoComplete="email"
                    dir="ltr"
                  />
                </div>
                {validationErrors.email && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.email}</span>
                  </div>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {isArabic ? "كلمة المرور" : "Password"}
                  </Label>
                  <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 hover:underline">
                    {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className={cn(
                    "absolute top-3 h-4 w-4 text-gray-400",
                    isArabic ? "right-3" : "left-3"
                  )} />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "transition-all",
                      isArabic ? "pr-10 pl-10" : "pl-10 pr-10",
                      validationErrors.password && "border-red-500 focus-visible:ring-red-500"
                    )}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: undefined });
                      }
                    }}
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute top-3 text-gray-400 hover:text-gray-600 transition-colors",
                      isArabic ? "left-3" : "right-3"
                    )}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <div className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="h-3 w-3" />
                    <span>{validationErrors.password}</span>
                  </div>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                />
                <label
                  htmlFor="remember"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  {isArabic ? "تذكرني" : "Remember me"}
                </label>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>{isArabic ? "جاري تسجيل الدخول..." : "Logging in..."}</span>
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" />
                    {isArabic ? "تسجيل الدخول" : "Login"}
                  </span>
                )}
              </Button>
            </form>

            {/* OAuth Separator */}
            <div className="relative my-6">
              <Separator />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
                <span className="text-sm text-gray-500">
                  {isArabic ? "أو تابع مع" : "Or continue with"}
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleOAuthLogin("Google")}
                disabled={isLoading}
              >
                <Chrome className={cn("h-5 w-5", isArabic ? "ml-2" : "mr-2")} />
                Google
              </Button>

              <Button
                variant="outline"
                className="w-full hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onClick={() => handleOAuthLogin("Microsoft")}
                disabled={isLoading}
              >
                <svg
                  className={cn("h-5 w-5", isArabic ? "ml-2" : "mr-2")}
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="#f25022" d="M0 0h11v11H0z" />
                  <path fill="#00a4ef" d="M12 0h11v11H12z" />
                  <path fill="#7fba00" d="M0 12h11v11H0z" />
                  <path fill="#ffb900" d="M12 12h11v11H12z" />
                </svg>
                Microsoft
              </Button>
            </div>

            <Button
              variant="outline"
              className="w-full mt-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => handleOAuthLogin("LinkedIn")}
              disabled={isLoading}
            >
              <Linkedin className={cn("h-5 w-5", isArabic ? "ml-2" : "mr-2")} />
              LinkedIn
            </Button>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
                <Link href="/signup" className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
                  {isArabic ? "إنشاء حساب جديد" : "Sign up now"}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Security Badge */}
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
          <Shield className="h-4 w-4 text-green-600" />
          <span>{isArabic ? "محمي بتشفير 256-bit SSL" : "Secured with 256-bit SSL encryption"}</span>
        </div>

        {/* Additional Help */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500">
            {isArabic ? "تحتاج مساعدة؟" : "Need help?"}{" "}
            <Link href="/contact" className="text-blue-600 hover:text-blue-700 hover:underline">
              {isArabic ? "تواصل مع الدعم" : "Contact support"}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
