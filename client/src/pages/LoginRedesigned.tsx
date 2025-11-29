import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Building2,
  Users,
  Briefcase,
  UserCog,
  Zap,
  Globe,
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

// =====================================================
// REUSABLE COMPONENTS
// =====================================================

// Glass Card Component
const GlassCard = ({ 
  children, 
  className = "",
  hover = true,
}: { 
  children: React.ReactNode; 
  className?: string;
  hover?: boolean;
}) => (
  <div 
    className={cn(
      "relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
      "border border-white/20 dark:border-gray-700/30",
      "rounded-2xl shadow-xl",
      hover && "transition-all duration-300 hover:shadow-2xl hover:bg-white/90 dark:hover:bg-gray-900/90",
      className
    )}
  >
    {children}
  </div>
);

const floatingParticleClasses = [
  "left-[5%] top-[10%] animate-[float_8s_ease-in-out_infinite] [animation-delay:0s]",
  "left-[15%] top-[70%] animate-[float_6s_ease-in-out_infinite] [animation-delay:1s]",
  "left-[30%] top-[30%] animate-[float_7s_ease-in-out_infinite] [animation-delay:2s]",
  "left-[45%] top-[80%] animate-[float_9s_ease-in-out_infinite] [animation-delay:1.5s]",
  "left-[60%] top-[20%] animate-[float_6.5s_ease-in-out_infinite] [animation-delay:0.75s]",
  "left-[75%] top-[65%] animate-[float_8.5s_ease-in-out_infinite] [animation-delay:2.3s]",
  "left-[85%] top-[35%] animate-[float_7.5s_ease-in-out_infinite] [animation-delay:1.2s]",
  "left-[25%] top-[85%] animate-[float_9.5s_ease-in-out_infinite] [animation-delay:2.8s]",
  "left-[50%] top-[5%] animate-[float_10s_ease-in-out_infinite] [animation-delay:3s]",
  "left-[90%] top-[10%] animate-[float_7s_ease-in-out_infinite] [animation-delay:0.5s]",
];

// Animated Background
const AnimatedBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {/* Gradient Background */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-950 dark:via-blue-950/30 dark:to-purple-950/20" />
    
    {/* Animated Orbs */}
    <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl animate-blob" />
    <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
    <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-gradient-to-br from-indigo-400/25 to-blue-400/25 rounded-full blur-3xl animate-blob animation-delay-4000" />
    
    {/* Grid Pattern */}
    <div 
      className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-grid-brand-tight"
    />

    {/* Floating Particles */}
    {floatingParticleClasses.map((particleClass) => (
      <div
        key={particleClass}
        className={cn(
          "absolute w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20",
          particleClass
        )}
      />
    ))}
  </div>
);

// Trial Profile Card
const TrialProfileCard = ({
  profile,
  isActive,
  onClick,
  isArabic: _isArabic,
}: {
  profile: TrialProfile;
  isActive: boolean;
  onClick: () => void;
  isArabic: boolean;
}) => {
  const getIcon = () => {
    switch (profile.id) {
      case 'company':
        return Building2;
      case 'employee':
        return Users;
      case 'consultant':
        return Briefcase;
      case 'admin':
        return UserCog;
      default:
        return Users;
    }
  };
  
  const Icon = getIcon();
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative group rounded-xl border p-4 text-start transition-all duration-300",
        "hover:scale-[1.02] hover:shadow-lg",
        isActive
          ? "border-brand-primary bg-gradient-to-br from-brand-primary/10 to-brand-secondary/10 shadow-lg"
          : "border-gray-200 dark:border-gray-700 hover:border-brand-primary/50 bg-white/50 dark:bg-gray-800/50"
      )}
    >
      {isActive && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-brand-primary rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className={cn(
          "p-2 rounded-lg",
          isActive 
            ? "bg-brand-primary/20 text-brand-primary" 
            : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 group-hover:bg-brand-primary/10 group-hover:text-brand-primary"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn(
            "font-semibold truncate",
            isActive ? "text-brand-primary" : "text-gray-900 dark:text-white"
          )}>
            {profile.title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {profile.subtitle}
          </p>
        </div>
      </div>
    </button>
  );
};

// Input with Icon Component
const InputWithIcon = ({
  id,
  type,
  placeholder,
  value,
  onChange,
  disabled,
  error,
  icon: Icon,
  isArabic,
  autoComplete,
  dir,
  rightElement,
}: {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  error?: string;
  icon: any;
  isArabic: boolean;
  autoComplete?: string;
  dir?: string;
  rightElement?: React.ReactNode;
}) => (
  <div className="relative group">
    <div className={cn(
      "absolute top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-brand-primary",
      isArabic ? "right-4" : "left-4"
    )}>
      <Icon className="w-5 h-5" />
    </div>
    <Input
      id={id}
      type={type}
      placeholder={placeholder}
      className={cn(
        "h-14 text-base transition-all duration-300",
        "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
        "border-gray-200 dark:border-gray-700",
        "focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20",
        "rounded-xl",
        isArabic ? "pr-12" : "pl-12",
        rightElement && (isArabic ? "pl-12" : "pr-12"),
        error && "border-red-500 focus:border-red-500 focus:ring-red-500/20"
      )}
      value={value}
      onChange={onChange}
      disabled={disabled}
      autoComplete={autoComplete}
      dir={dir}
    />
    {rightElement && (
      <div className={cn(
        "absolute top-1/2 -translate-y-1/2",
        isArabic ? "left-4" : "right-4"
      )}>
        {rightElement}
      </div>
    )}
  </div>
);

// OAuth Button Component
const OAuthButton = ({
  provider,
  icon,
  onClick,
  disabled,
  isArabic: _isArabic,
}: {
  provider: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  isArabic: boolean;
}) => (
  <Button
    variant="outline"
    className={cn(
      "h-12 gap-3 rounded-xl transition-all duration-300",
      "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
      "hover:bg-white dark:hover:bg-gray-800 hover:shadow-md",
      "border-gray-200 dark:border-gray-700"
    )}
    onClick={onClick}
    disabled={disabled}
  >
    {icon}
    <span className="font-medium">{provider}</span>
  </Button>
);

// =====================================================
// MAIN COMPONENT
// =====================================================

const useLoginState = (
  isArabic: boolean,
  setLocation: (path: string) => void
) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [activeTrialProfile, setActiveTrialProfile] = useState<TrialProfile | null>(null);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const applyTrialProfile = useCallback((
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
  }, [isArabic]);

  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }

    if (globalThis.window !== undefined) {
      try {
        const params = new URLSearchParams(globalThis.location.search);
        const trialId = params.get("trial");
        let profile: TrialProfile | null | undefined = getTrialProfileById(trialId);
        profile ??= readTrialProfileSelection();

        if (trialId) {
          globalThis.history.replaceState({}, document.title, globalThis.location.pathname);
        }

        if (profile) {
          applyTrialProfile(profile, { persist: false, silent: true });
        }
      } catch (error) {
        console.warn("Failed to hydrate trial profile", error);
      }
    }
  }, [applyTrialProfile]);

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
    } else if (formData.password.length < 6) {
      errors.password = isArabic ? "كلمة المرور يجب أن تكون 6 أحرف على الأقل" : "Password must be at least 6 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message || (isArabic ? "تم تسجيل الدخول بنجاح" : "Login successful"));

      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      setTimeout(() => {
        const role = data.user?.role;
        const userType = data.user?.userType;

        if (role === "admin") {
          setLocation("/admin/dashboard");
        } else if (userType === "company") {
          setLocation("/company/dashboard");
        } else if (userType === "consultant") {
          setLocation("/consultant-dashboard");
        } else if (userType === "employee") {
          setLocation("/employee/dashboard");
        } else {
          setLocation("/dashboard");
        }
      }, 500);
    },
    onError: (error: { message?: string }) => {
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

  return {
    isVisible,
    showPassword,
    togglePasswordVisibility: () => setShowPassword(prev => !prev),
    isLoading,
    rememberMe,
    setRememberMe,
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    activeTrialProfile,
    handleTrialSelection,
    clearTrialSelection,
    handleLogin,
    handleOAuthLogin,
  };
};

export default function LoginRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [, setLocation] = useLocation();
  const {
    isVisible,
    showPassword,
    togglePasswordVisibility,
    isLoading,
    rememberMe,
    setRememberMe,
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    activeTrialProfile,
    handleTrialSelection,
    clearTrialSelection,
    handleLogin,
    handleOAuthLogin,
  } = useLoginState(isArabic, setLocation);

  const Arrow = isArabic ? ArrowLeft : ArrowRight;

  return (
    <div className="min-h-screen relative overflow-hidden" dir={isArabic ? "rtl" : "ltr"}>
      <QuickActionsBar isArabic={isArabic} className="border-0" />
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Form */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
          <div 
            className={cn(
              "w-full max-w-md space-y-8 transition-all duration-700",
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            {/* Logo & Back */}
            <div className="flex items-center justify-between">
              <Link href="/">
                <div className="flex items-center gap-3 group cursor-pointer">
                  <img src={APP_LOGO} alt="رابِط | Rabit" className="h-12 w-auto transition-transform group-hover:scale-105" />
                </div>
              </Link>
              <Link href="/">
                <Button variant="ghost" className="gap-2 text-gray-600 hover:text-brand-primary">
                  {isArabic ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
                  {isArabic ? "الرئيسية" : "Home"}
                </Button>
              </Link>
            </div>

            {/* Header */}
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {isArabic ? "مرحباً بعودتك" : "Welcome Back"}
                <span className="inline-block ms-2 animate-wave">👋</span>
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                {isArabic 
                  ? "قم بتسجيل الدخول للوصول إلى حسابك" 
                  : "Sign in to access your account"}
              </p>
            </div>

            {/* Trial Profiles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand-primary" />
                  {isArabic ? "جرب الآن" : "Try Demo"}
                </span>
                {activeTrialProfile && (
                  <button
                    type="button"
                    className="text-xs text-red-500 hover:text-red-600 transition-colors"
                    onClick={clearTrialSelection}
                  >
                    {isArabic ? "إزالة" : "Clear"}
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {TRIAL_PROFILES.map(profile => (
                  <TrialProfileCard
                    key={profile.id}
                    profile={profile}
                    isActive={activeTrialProfile?.id === profile.id}
                    onClick={() => handleTrialSelection(profile.id)}
                    isArabic={isArabic}
                  />
                ))}
              </div>
            </div>

            {/* Login Form */}
            <GlassCard className="p-6 lg:p-8" hover={false}>
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {isArabic ? "البريد الإلكتروني" : "Email Address"}
                  </Label>
                  <InputWithIcon
                    id="email"
                    type="email"
                    placeholder="example@company.com"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (validationErrors.email) {
                        setValidationErrors({ ...validationErrors, email: undefined });
                      }
                    }}
                    disabled={isLoading}
                    error={validationErrors.email}
                    icon={Mail}
                    isArabic={isArabic}
                    autoComplete="email"
                    dir="ltr"
                  />
                  {validationErrors.email && (
                    <div className="flex items-center gap-1.5 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationErrors.email}</span>
                    </div>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {isArabic ? "كلمة المرور" : "Password"}
                    </Label>
                    <Link 
                      href="/forgot-password" 
                      className="text-sm text-brand-primary hover:text-brand-dark transition-colors"
                    >
                      {isArabic ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </Link>
                  </div>
                  <InputWithIcon
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (validationErrors.password) {
                        setValidationErrors({ ...validationErrors, password: undefined });
                      }
                    }}
                    disabled={isLoading}
                    error={validationErrors.password}
                    icon={Lock}
                    isArabic={isArabic}
                    autoComplete="current-password"
                    rightElement={
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                  />
                  {validationErrors.password && (
                    <div className="flex items-center gap-1.5 text-red-500 text-sm">
                      <AlertCircle className="h-4 w-4" />
                      <span>{validationErrors.password}</span>
                    </div>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(Boolean(checked))}
                    className="border-gray-300 dark:border-gray-600"
                  />
                  <label
                    htmlFor="remember"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer select-none"
                  >
                    {isArabic ? "تذكرني" : "Remember me"}
                  </label>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className={cn(
                    "w-full h-14 text-lg font-semibold rounded-xl",
                    "bg-gradient-to-r from-brand-primary to-brand-secondary",
                    "hover:from-brand-dark hover:to-brand-primary",
                    "shadow-lg hover:shadow-xl hover:shadow-brand-primary/25",
                    "transition-all duration-300 hover:scale-[1.02]"
                  )}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{isArabic ? "جاري تسجيل الدخول..." : "Signing in..."}</span>
                    </div>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      {isArabic ? "تسجيل الدخول" : "Sign In"}
                      <Arrow className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                {/* Divider */}
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white dark:bg-gray-900 text-gray-500">
                      {isArabic ? "أو تابع مع" : "Or continue with"}
                    </span>
                  </div>
                </div>

                {/* OAuth Buttons */}
                <div className="grid grid-cols-3 gap-3">
                  <OAuthButton
                    provider="Google"
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    }
                    onClick={() => handleOAuthLogin("Google")}
                    disabled={isLoading}
                    isArabic={isArabic}
                  />
                  <OAuthButton
                    provider="Microsoft"
                    icon={
                      <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                        <path fill="#f25022" d="M0 0h11v11H0z" />
                        <path fill="#00a4ef" d="M12 0h11v11H12z" />
                        <path fill="#7fba00" d="M0 12h11v11H0z" />
                        <path fill="#ffb900" d="M12 12h11v11H12z" />
                      </svg>
                    }
                    onClick={() => handleOAuthLogin("Microsoft")}
                    disabled={isLoading}
                    isArabic={isArabic}
                  />
                  <OAuthButton
                    provider="LinkedIn"
                    icon={
                      <svg className="w-5 h-5 text-[#0077B5]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    }
                    onClick={() => handleOAuthLogin("LinkedIn")}
                    disabled={isLoading}
                    isArabic={isArabic}
                  />
                </div>
              </form>
            </GlassCard>

            {/* Sign Up Link */}
            <p className="text-center text-gray-600 dark:text-gray-400">
              {isArabic ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
              <Link 
                href="/signup" 
                className="font-semibold text-brand-primary hover:text-brand-dark transition-colors"
              >
                {isArabic ? "إنشاء حساب جديد" : "Sign up for free"}
              </Link>
            </p>

            {/* Security Badge */}
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <Shield className="h-4 w-4 text-green-600" />
              <span>{isArabic ? "محمي بتشفير SSL" : "Secured with SSL encryption"}</span>
            </div>
          </div>
        </div>

        {/* Right Side - Features (Hidden on mobile) */}
        <div className="hidden lg:flex flex-1 items-center justify-center p-12 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/10">
          <div 
            className={cn(
              "max-w-lg space-y-8 transition-all duration-700 delay-300",
              isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
            )}
          >
            <div className="space-y-4">
              <Badge className="bg-brand-primary/10 text-brand-primary border-0 text-sm px-4 py-1">
                <Zap className="w-4 h-4 me-1" />
                {isArabic ? "منصة متكاملة للموارد البشرية" : "All-in-One HR Platform"}
              </Badge>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {isArabic 
                  ? "أدر مواردك البشرية بكفاءة وسهولة" 
                  : "Manage Your HR Resources Efficiently"}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {isArabic
                  ? "منصة رابِط تقدم لك حلولاً متكاملة لإدارة الموارد البشرية، من التوظيف إلى إدارة الرواتب والحضور."
                  : "Rabit platform offers you comprehensive solutions for HR management, from recruitment to payroll and attendance management."}
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-4">
              {[
                {
                  icon: Building2,
                  titleAr: "إدارة الشركات",
                  titleEn: "Company Management",
                  descAr: "أدر شركتك وموظفيك بكل سهولة",
                  descEn: "Manage your company and employees easily"
                },
                {
                  icon: Users,
                  titleAr: "إدارة الموظفين",
                  titleEn: "Employee Management",
                  descAr: "تتبع الحضور والإجازات والرواتب",
                  descEn: "Track attendance, leaves, and salaries"
                },
                {
                  icon: Globe,
                  titleAr: "دعم متعدد اللغات",
                  titleEn: "Multi-language Support",
                  descAr: "واجهة بالعربية والإنجليزية",
                  descEn: "Arabic and English interface"
                },
              ].map((feature) => (
                <div 
                  key={feature.titleEn}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-white/20 dark:border-gray-700/30"
                >
                  <div className="p-2 rounded-lg bg-brand-primary/10">
                    <feature.icon className="w-6 h-6 text-brand-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {isArabic ? feature.titleAr : feature.titleEn}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {isArabic ? feature.descAr : feature.descEn}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              {[
                { value: "+1000", labelAr: "شركة", labelEn: "Companies" },
                { value: "+50K", labelAr: "موظف", labelEn: "Employees" },
                { value: "99.9%", labelAr: "وقت التشغيل", labelEn: "Uptime" },
              ].map((stat) => (
                <div key={stat.labelEn} className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-500">
                    {isArabic ? stat.labelAr : stat.labelEn}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <ConnectedPagesSection
            isArabic={isArabic}
            highlight={{ ar: "روابط سريعة", en: "Quick Access" }}
            title={{
              ar: "ماذا بعد تسجيل الدخول؟",
              en: "Where to next after logging in?",
            }}
            subtitle={{
              ar: "انتقل مباشرة إلى الأدوات، الباقات، أو حجز الاستشارات لتجربة المنصة كاملة.",
              en: "Jump straight to tools, plans, or consulting to experience the platform fully.",
            }}
            className="py-0"
          />
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -30px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(30px, 10px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.2; }
          50% { transform: translateY(-20px) rotate(180deg); opacity: 0.5; }
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }
        
        .animate-blob {
          animation: blob 15s infinite ease-in-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-wave {
          display: inline-block;
          animation: wave 2s infinite;
        }
      `}</style>
    </div>
  );
}
