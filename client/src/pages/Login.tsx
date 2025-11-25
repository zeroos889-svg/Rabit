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
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Chrome,
  Github,
  Linkedin,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { APP_LOGO } from "@/const";

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: (data: any) => {
      toast.success(data.message || t("login.success"));
      
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
        switch (data.user?.userType) {
          case "company":
            setLocation("/dashboard/company");
            break;
          case "consultant":
          case "individual":
            setLocation("/dashboard/consultant");
            break;
          case "employee":
            setLocation("/dashboard/employee");
            break;
          case "admin":
            setLocation("/admin/dashboard");
            break;
          default:
            setLocation("/");
        }
      }, 500);
    },
    onError: (error) => {
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
    // Placeholder until OAuth endpoints are wired
    toast.info(`${t("login.oauth")} ${provider} - ${t("login.comingSoon", { defaultValue: "قريباً" })}`);
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
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {t("login.welcomeBack")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t("login.subtitle")}
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>{t("login.title")}</CardTitle>
            <CardDescription>{t("login.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">{t("login.email")}</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("login.emailPlaceholder")}
                    className="pr-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={isLoading}
                    autoComplete="email"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="password">{t("login.password")}</Label>
                  <Link href="/forgot-password">
                    <a className="text-sm text-blue-600 hover:text-blue-700">
                      {t("login.forgotPassword")}
                    </a>
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("login.passwordPlaceholder")}
                    className="pr-10 pl-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                    aria-label={
                      showPassword
                        ? t("login.hidePassword", { defaultValue: "إخفاء كلمة المرور" })
                        : t("login.showPassword", { defaultValue: "إظهار كلمة المرور" })
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {t("login.loggingIn")}
                  </div>
                ) : (
                  t("login.loginButton")
                )}
              </Button>
            </form>

            {/* OAuth Separator */}
            <div className="relative my-6">
              <Separator />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
                <span className="text-sm text-gray-500">{t("login.or")}</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("Google")}
                disabled={isLoading}
              >
                <Chrome className="w-5 h-5 ml-2" />
                {t("login.continueWithGoogle")}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("Microsoft")}
                disabled={isLoading}
              >
                <svg
                  className="w-5 h-5 ml-2"
                  viewBox="0 0 23 23"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path fill="#f25022" d="M0 0h11v11H0z" />
                  <path fill="#00a4ef" d="M12 0h11v11H12z" />
                  <path fill="#7fba00" d="M0 12h11v11H0z" />
                  <path fill="#ffb900" d="M12 12h11v11H12z" />
                </svg>
                {t("login.continueWithMicrosoft")}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthLogin("LinkedIn")}
                disabled={isLoading}
              >
                <Linkedin className="w-5 h-5 ml-2" />
                {t("login.continueWithLinkedIn")}
              </Button>
            </div>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t("login.noAccount")}{" "}
                <Link href="/signup">
                  <a className="text-blue-600 hover:text-blue-700 font-semibold">
                    {t("login.signUpNow")}
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Help */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500">
            {t("login.needHelp")}{" "}
            <Link href="/faq">
              <a className="text-blue-600 hover:text-blue-700">
                {t("login.contactSupport")}
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
