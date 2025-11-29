import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { BackButton } from "@/components/BackButton";
import { Button } from "@/components/ui/button";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
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
import { QuickActionsBar } from "@/components/QuickActionsBar";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,

  ArrowRight,
  Shield,
  Sparkles,
  Users,
  Building2,
  CheckCircle2,
  Loader2,
  Fingerprint,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";
import { motion, AnimatePresence } from "framer-motion";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// Feature highlights for the left panel
const features = [
  {
    icon: Shield,
    title: "أمان متقدم",
    description: "تشفير SSL وحماية بيانات على مستوى البنوك",
  },
  {
    icon: Users,
    title: "+10,000 مستخدم",
    description: "يثقون بنا لإدارة مواردهم البشرية",
  },
  {
    icon: Building2,
    title: "+500 شركة",
    description: "تستخدم رابِط لتحسين عملياتها",
  },
  {
    icon: Sparkles,
    title: "ذكاء اصطناعي",
    description: "مساعد ذكي لتبسيط المهام",
  },
];

export default function LoginEnhanced() {
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail }));
      setRememberMe(true);
    }
  }, []);

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message || t("login.success"), {
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
      });
      
      // Handle remember me
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
      
      // Save JWT token
      if (data.token) {
        localStorage.setItem("authToken", data.token);
      }
      
      // Save user profile
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Redirect based on user type
      setTimeout(() => {
        const role = data.user?.role;
        const userType = data.user?.userType;
        
        if (role === "admin") {
          setLocation("/admin/dashboard");
        } else {
          switch (userType) {
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
        }
      }, 500);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || t("login.error"));
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast.error(t("login.fillAllFields"));
      return;
    }

    setIsLoading(true);
    loginMutation.mutate(formData);
  };

  const handleOAuthLogin = (provider: string) => {
    toast.info(`${t("login.oauth")} ${provider} - ${t("login.comingSoon", { defaultValue: "قريباً" })}`);
  };

  return (
    <div className="min-h-screen flex flex-col" dir={isArabic ? "rtl" : "ltr"}>
      <QuickActionsBar isArabic={isArabic} className="border-0" />
      <div className="flex flex-1">
        {/* Left Panel - Branding & Features */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
        
        {/* Animated Background Patterns */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-xl animate-blob" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-2000" />
          <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-overlay filter blur-xl animate-blob animation-delay-4000" />
        </div>

        {/* Glass Card Content */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12">
          {/* Logo */}
          <motion.div 
            className="flex items-center gap-3 mb-12"
            variants={floatingVariants}
            animate="animate"
          >
            <img src={APP_LOGO} alt="رابِط" className="h-16 w-16 drop-shadow-2xl" />
            <span className="text-4xl font-bold text-white drop-shadow-lg">رابِط</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white text-center mb-4 drop-shadow-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            مرحباً بعودتك!
          </motion.h1>
          <motion.p 
            className="text-xl text-blue-100 text-center mb-12 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            سجّل دخولك للوصول إلى لوحة التحكم وإدارة مواردك البشرية بكفاءة
          </motion.p>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-2 gap-4 w-full max-w-lg"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="group"
              >
                <div className="backdrop-blur-md bg-white/10 rounded-2xl p-4 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 cursor-default">
                  <feature.icon className="h-8 w-8 text-white mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="text-white font-semibold text-sm mb-1">{feature.title}</h3>
                  <p className="text-blue-100 text-xs">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Bottom Quote */}
          <motion.div 
            className="absolute bottom-8 left-0 right-0 text-center px-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            <p className="text-blue-100 text-sm italic">
              "رابِط غيّر طريقة إدارتنا للموارد البشرية بالكامل"
            </p>
            <p className="text-white/70 text-xs mt-1">- مدير موارد بشرية، شركة رائدة</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full max-w-md">
          <div className="mb-6"><BackButton /></div>
          
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <img src={APP_LOGO} alt="رابِط" className="h-12 w-12" />
              <span className="text-2xl font-bold text-gradient-primary">رابِط</span>
            </div>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/80 dark:bg-gray-800/80">
              <CardHeader className="space-y-1 text-center pb-2">
                <motion.div variants={itemVariants}>
                  <CardTitle className="text-2xl font-bold">
                    {t("login.title")}
                  </CardTitle>
                  <CardDescription className="text-base mt-2">
                    {t("login.description")}
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <CardContent className="pt-4">
                <form onSubmit={handleLogin} className="space-y-5">
                  {/* Email Field */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      {t("login.email")}
                    </Label>
                    <div className="relative group">
                      <Mail className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                        focusedField === 'email' ? 'text-primary' : 'text-gray-400'
                      }`} />
                      <Input
                        id="email"
                        type="email"
                        placeholder={t("login.emailPlaceholder")}
                        className={`pr-11 h-12 text-base transition-all border-2 ${
                          focusedField === 'email' 
                            ? 'border-primary ring-4 ring-primary/10' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onFocus={() => setFocusedField('email')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading}
                        autoComplete="email"
                        dir="ltr"
                      />
                    </div>
                  </motion.div>

                  {/* Password Field */}
                  <motion.div variants={itemVariants} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="password" className="text-sm font-medium">
                        {t("login.password")}
                      </Label>
                      <Link href="/forgot-password">
                        <span className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors">
                          {t("login.forgotPassword")}
                        </span>
                      </Link>
                    </div>
                    <div className="relative group">
                      <Lock className={`absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 transition-colors ${
                        focusedField === 'password' ? 'text-primary' : 'text-gray-400'
                      }`} />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t("login.passwordPlaceholder")}
                        className={`pr-11 pl-12 h-12 text-base transition-all border-2 ${
                          focusedField === 'password' 
                            ? 'border-primary ring-4 ring-primary/10' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        onFocus={() => setFocusedField('password')}
                        onBlur={() => setFocusedField(null)}
                        disabled={isLoading}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
                        aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </motion.div>

                  {/* Remember Me */}
                  <motion.div variants={itemVariants} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked === true)}
                      />
                      <label
                        htmlFor="remember"
                        className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                      >
                        تذكرني
                      </label>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Fingerprint className="h-4 w-4" />
                      <span>تسجيل آمن</span>
                    </div>
                  </motion.div>

                  {/* Login Button */}
                  <motion.div variants={itemVariants}>
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300"
                      disabled={isLoading}
                    >
                      <AnimatePresence mode="wait">
                        {isLoading ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            <Loader2 className="h-5 w-5 animate-spin" />
                            {t("login.loggingIn")}
                          </motion.div>
                        ) : (
                          <motion.div
                            key="idle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex items-center gap-2"
                          >
                            {t("login.loginButton")}
                            <ArrowRight className="h-5 w-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </Button>
                  </motion.div>
                </form>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative my-6">
                  <Separator />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
                    <span className="text-sm text-gray-500">{t("login.or")}</span>
                  </div>
                </motion.div>

                {/* OAuth Buttons */}
                <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    className="h-12 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
                    onClick={() => handleOAuthLogin("Google")}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
                    onClick={() => handleOAuthLogin("Microsoft")}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 23 23" fill="none">
                      <path fill="#f25022" d="M0 0h11v11H0z" />
                      <path fill="#00a4ef" d="M12 0h11v11H12z" />
                      <path fill="#7fba00" d="M0 12h11v11H0z" />
                      <path fill="#ffb900" d="M12 12h11v11H12z" />
                    </svg>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-12 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all hover:scale-105"
                    onClick={() => handleOAuthLogin("LinkedIn")}
                    disabled={isLoading}
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#0077b5"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </Button>
                </motion.div>

                {/* Sign Up Link */}
                <motion.div variants={itemVariants} className="mt-6 text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("login.noAccount")}{" "}
                    <Link href="/signup">
                      <span className="text-primary hover:text-primary/80 font-semibold hover:underline transition-colors">
                        {t("login.signUpNow")}
                      </span>
                    </Link>
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Help Link */}
          <motion.div 
            className="mt-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-sm text-gray-500">
              {t("login.needHelp")}{" "}
              <Link href="/faq">
                <span className="text-primary hover:underline">
                  {t("login.contactSupport")}
                </span>
              </Link>
            </p>
          </motion.div>
        </div>
      </motion.div>
      </div>

      <div className="bg-white dark:bg-slate-950">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <ConnectedPagesSection
            isArabic={isArabic}
            highlight={{ ar: "روابط متصلة", en: "Stay Connected" }}
            title={{
              ar: "أكمل رحلتك بعد تسجيل الدخول",
              en: "Continue after logging in",
            }}
            subtitle={{
              ar: "اذهب مباشرة للأدوات، الباقات، أو حجز الاستشارات لتجربة المنصة كاملة.",
              en: "Go straight to tools, plans, or consulting to experience the full platform.",
            }}
            className="py-0"
          />
        </div>
      </div>

      {/* CSS for blob animation */}
      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
