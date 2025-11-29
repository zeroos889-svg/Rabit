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
  Briefcase,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  Sparkles,
  Chrome,
  Check,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";

export default function SignupConsultant() {
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
    specialty: "",
    experience: "",
    companyName: "",
  });

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
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
        setLocation("/complete-profile");
      }, 1500);
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || t("signup.error"));
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      userType: "consultant",
    });
  };

  const handleOAuthSignup = (provider: string) => {
    toast.info(`${isArabic ? "التسجيل عبر" : "Sign up with"} ${provider}`);
  };

  const features = [
    "حاسبة نهاية الخدمة",
    "حاسبة الإجازات",
    "مولد الخطابات بالذكاء الاصطناعي",
    "سجل العملاء والمشاريع",
    "المساعد الذكي",
    "تصدير PDF",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20 py-12 px-4 sm:px-6 lg:px-8">
      <BackButton />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4 shadow-lg">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {isArabic ? "إنشاء حساب مستقل HR" : "Create HR Consultant Account"}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic
              ? "انضم إلى شبكة مستقلي الموارد البشرية المحترفين"
              : "Join the network of professional HR consultants"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              {isArabic ? "299 ريال/شهر" : "299 SAR/month"}
            </Badge>
            <Badge variant="outline">
              {isArabic ? "تجربة مجانية 14 يوم" : "14-day free trial"}
            </Badge>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="md:col-span-2 shadow-xl">
            <CardHeader>
              <CardTitle>
                {isArabic ? "معلومات الحساب" : "Account Information"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "أدخل بياناتك للبدء في رحلتك المهنية"
                  : "Enter your details to start your professional journey"}
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
                    <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={isArabic ? "أحمد محمد" : "Ahmad Mohammed"}
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

                {/* Specialty & Experience */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">
                      {isArabic ? "التخصص" : "Specialty"}
                    </Label>
                    <Input
                      id="specialty"
                      type="text"
                      placeholder={
                        isArabic ? "مستشار توظيف" : "Recruitment Consultant"
                      }
                      value={formData.specialty}
                      onChange={(e) =>
                        setFormData({ ...formData, specialty: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">
                      {isArabic ? "سنوات الخبرة" : "Years of Experience"}
                    </Label>
                    <Input
                      id="experience"
                      type="number"
                      placeholder="5"
                      value={formData.experience}
                      onChange={(e) =>
                        setFormData({ ...formData, experience: e.target.value })
                      }
                      disabled={isLoading}
                      min="0"
                    />
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    {isArabic ? "اسم الشركة (اختياري)" : "Company Name (Optional)"}
                  </Label>
                  <Input
                    id="companyName"
                    type="text"
                    placeholder={
                      isArabic ? "استشارات الموارد البشرية" : "HR Consultancy"
                    }
                    value={formData.companyName}
                    onChange={(e) =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    disabled={isLoading}
                  />
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
                        <a className="text-purple-600 hover:text-purple-700 font-medium">
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
                        <a className="text-purple-600 hover:text-purple-700 font-medium">
                          {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
                        </a>
                      </Link>
                      *
                    </label>
                  </div>

                  <div className="flex items-start gap-2">
                    <Checkbox
                      id="marketing"
                      checked={agreements.marketing}
                      onCheckedChange={(checked: boolean) =>
                        setAgreements({ ...agreements, marketing: !!checked })
                      }
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="marketing"
                      className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                    >
                      {isArabic
                        ? "أرغب في تلقي العروض والتحديثات"
                        : "I want to receive offers and updates"}
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isArabic ? "جاري الإنشاء..." : "Creating..."}
                    </div>
                  ) : (
                    <>
                      {isArabic ? "ابدأ التجربة المجانية" : "Start Free Trial"}
                      <Sparkles className="w-4 h-4 ms-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* OAuth */}
              <div className="relative my-6">
                <Separator />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-4">
                  <span className="text-sm text-gray-500">
                    {isArabic ? "أو" : "Or"}
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleOAuthSignup("Google")}
                disabled={isLoading}
              >
                <Chrome className="w-5 h-5 me-2" />
                {isArabic ? "التسجيل عبر Google" : "Sign up with Google"}
              </Button>

              {/* Login Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {isArabic ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                  <Link href="/login">
                    <a className="text-purple-600 hover:text-purple-700 font-semibold">
                      {isArabic ? "تسجيل الدخول" : "Login"}
                    </a>
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="shadow-xl bg-gradient-to-br from-purple-600 to-pink-600 text-white">
            <CardHeader>
              <CardTitle className="text-white">
                {isArabic ? "ما تحصل عليه" : "What You Get"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                  <span className="text-sm">{feature}</span>
                </div>
              ))}

              <div className="pt-4 mt-4 border-t border-white/20">
                <p className="text-sm opacity-90 mb-2">
                  {isArabic ? "💰 السعر" : "💰 Price"}
                </p>
                <p className="text-2xl font-bold">
                  299 {isArabic ? "ريال/شهر" : "SAR/month"}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {isArabic ? "تجربة مجانية 14 يوم" : "14-day free trial"}
                </p>
              </div>

              <div className="bg-white/10 rounded-lg p-4 mt-4">
                <p className="text-sm font-medium mb-2">
                  {isArabic ? "🎁 عرض خاص" : "🎁 Special Offer"}
                </p>
                <p className="text-xs opacity-90">
                  {isArabic
                    ? "احصل على خصم 20% عند الاشتراك السنوي"
                    : "Get 20% off on annual subscription"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
