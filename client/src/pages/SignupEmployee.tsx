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
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  UserCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Sparkles,
  Chrome,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function SignupEmployee() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isArabic = i18n.language === "ar";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    city: "",
    jobTitle: "",
    yearsOfExperience: "",
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    notifications: false,
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data: any) => {
      toast.success(
        isArabic
          ? "تم إنشاء الحساب بنجاح! مرحباً بك في رابِط"
          : "Account created successfully! Welcome to Rabit"
      );
      localStorage.setItem("user", JSON.stringify(data.user));
      const token = data.token || data.accessToken;
      if (token) localStorage.setItem("token", token);
      setTimeout(() => {
        // Redirect to complete profile page
        setLocation("/complete-profile");
      }, 1500);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || t("signup.error"));
      setIsLoading(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error(
        isArabic ? "يرجى ملء جميع الحقول المطلوبة" : "Please fill all required fields"
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(
        isArabic ? "كلمات المرور غير متطابقة" : "Passwords do not match"
      );
      return;
    }

    if (formData.password.length < 8) {
      toast.error(
        isArabic
          ? "كلمة المرور يجب أن تكون 8 أحرف على الأقل"
          : "Password must be at least 8 characters"
      );
      return;
    }

    if (!agreements.terms || !agreements.privacy) {
      toast.error(
        isArabic
          ? "يرجى الموافقة على الشروط والأحكام وسياسة الخصوصية"
          : "Please agree to Terms and Privacy Policy"
      );
      return;
    }

    setIsLoading(true);
    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.fullName,
      phoneNumber: formData.phone,
      userType: "employee",
    });
  };

  const handleOAuthSignup = (provider: string) => {
    toast.info(`${isArabic ? "التسجيل عبر" : "Sign up with"} ${provider}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-green-900/20 dark:to-blue-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <BackButton />

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <UserCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              {isArabic ? "إنشاء حساب موظف" : "Create Employee Account"}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic
              ? "انضم إلى آلاف الموظفين الباحثين عن فرص أفضل"
              : "Join thousands of employees looking for better opportunities"}
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/20 px-4 py-2 rounded-full">
            <Sparkles className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">
              {isArabic ? "مجاناً للأبد" : "Free Forever"}
            </span>
          </div>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <CardTitle>
              {isArabic ? "معلومات الحساب" : "Account Information"}
            </CardTitle>
            <CardDescription>
              {isArabic
                ? "أدخل بياناتك للبدء في رحلتك المهنية"
                : "Enter your details to start your career journey"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  {isArabic ? "الاسم الكامل" : "Full Name"} *
                </Label>
                <div className="relative">
                  <UserCircle className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={
                      isArabic ? "أحمد محمد العلي" : "Ahmad Mohammed Alali"
                    }
                    className="pr-10"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email & Phone */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    {isArabic ? "البريد الإلكتروني" : "Email"} *
                  </Label>
                  <div className="relative">
                    <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="ahmad@example.com"
                      className="pr-10"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      disabled={isLoading}
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {isArabic ? "رقم الجوال" : "Phone Number"} *
                  </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="05XXXXXXXX"
                      className="pr-10"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      disabled={isLoading}
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>

              {/* City & Job Title */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">{isArabic ? "المدينة" : "City"}</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="city"
                      type="text"
                      placeholder={isArabic ? "الرياض" : "Riyadh"}
                      className="pr-10"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({ ...formData, city: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="jobTitle">
                    {isArabic ? "المسمى الوظيفي" : "Job Title"}
                  </Label>
                  <div className="relative">
                    <Briefcase className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="jobTitle"
                      type="text"
                      placeholder={isArabic ? "مطور برمجيات" : "Software Developer"}
                      className="pr-10"
                      value={formData.jobTitle}
                      onChange={(e) =>
                        setFormData({ ...formData, jobTitle: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

              {/* Years of Experience */}
              <div className="space-y-2">
                <Label htmlFor="experience">
                  {isArabic ? "سنوات الخبرة" : "Years of Experience"}
                </Label>
                <div className="relative">
                  <FileText className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="experience"
                    type="number"
                    placeholder={isArabic ? "5" : "5"}
                    className="pr-10"
                    value={formData.yearsOfExperience}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        yearsOfExperience: e.target.value,
                      })
                    }
                    disabled={isLoading}
                    min="0"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {isArabic ? "كلمة المرور" : "Password"} *
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10 pl-10"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500">
                  {isArabic
                    ? "يجب أن تكون 8 أحرف على الأقل"
                    : "Must be at least 8 characters"}
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  {isArabic ? "تأكيد كلمة المرور" : "Confirm Password"} *
                </Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pr-10 pl-10"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirmPassword: e.target.value,
                      })
                    }
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Agreements */}
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={agreements.terms}
                    onCheckedChange={(checked: boolean) =>
                      setAgreements({ ...agreements, terms: !!checked })
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    {isArabic ? "أوافق على " : "I agree to "}
                    <Link href="/terms">
                      <a className="text-blue-600 hover:text-blue-700 font-medium">
                        {isArabic ? "الشروط والأحكام" : "Terms and Conditions"}
                      </a>
                    </Link>
                    *
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="privacy"
                    checked={agreements.privacy}
                    onCheckedChange={(checked: boolean) =>
                      setAgreements({ ...agreements, privacy: !!checked })
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="privacy"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    {isArabic ? "أوافق على " : "I agree to "}
                    <Link href="/privacy-policy">
                      <a className="text-blue-600 hover:text-blue-700 font-medium">
                        {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
                      </a>
                    </Link>
                    *
                  </label>
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="notifications"
                    checked={agreements.notifications}
                    onCheckedChange={(checked: boolean) =>
                      setAgreements({ ...agreements, notifications: !!checked })
                    }
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="notifications"
                    className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                  >
                    {isArabic
                      ? "أرغب في تلقي إشعارات عن الوظائف الجديدة"
                      : "I want to receive notifications about new jobs"}
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {isArabic ? "جاري الإنشاء..." : "Creating..."}
                  </div>
                ) : (
                  <>
                    {isArabic ? "إنشاء الحساب" : "Create Account"}
                    <Sparkles className="w-4 h-4 mr-2" />
                  </>
                )}
              </Button>
            </form>

            {/* OAuth Separator */}
            <div className="relative my-6">
              <Separator />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
                <span className="text-sm text-gray-500">
                  {isArabic ? "أو" : "Or"}
                </span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignup("Google")}
                disabled={isLoading}
              >
                <Chrome className="w-5 h-5 ml-2" />
                {isArabic ? "التسجيل عبر Google" : "Sign up with Google"}
              </Button>
            </div>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <Link href="/login">
                  <a className="text-green-600 hover:text-green-700 font-semibold">
                    {isArabic ? "تسجيل الدخول" : "Login"}
                  </a>
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
