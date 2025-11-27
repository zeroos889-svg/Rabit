import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
} from "react";
import type { TFunction } from "i18next";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Building2,
  User,
  Mail,
  Lock,
  ArrowRight,
  Shield,
  Phone,
  Briefcase,
  UserCircle,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Link } from "wouter";
import { APP_LOGO } from "@/const";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import analytics from "@/lib/analytics";

type SignupFormData = {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  password: string;
  confirmPassword: string;
};

type SignupFormErrors = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

type PasswordStrengthLevel = "empty" | "weak" | "medium" | "good" | "strong";

const validateEmail = (email: string) =>
  /\S+@\S+\.\S+/.test(email.trim().toLowerCase());

const validatePhone = (phone: string) => /^05\d{8}$/.test(phone);

const normalizeSaudiPhone = (value: string) => {
  let digits = value.replaceAll(/\D/g, "");
  if (digits.startsWith("966")) {
    digits = digits.slice(3);
  }
  if (!digits.startsWith("0") && digits.startsWith("5")) {
    digits = `0${digits}`;
  }
  return digits.slice(0, 10);
};

const validatePassword = (password: string) =>
  password.length >= 8 &&
  /[A-Za-z]/.test(password) &&
  /\d/.test(password) &&
  /[^A-Za-z0-9]/.test(password);

const getPasswordStrength = (password: string) => {
  const score =
    (password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(password) ? 1 : 0) +
    (/[a-z]/.test(password) ? 1 : 0) +
    (/\d/.test(password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(password) ? 1 : 0);

  if (!password) {
    return { score: 0, level: "empty" as PasswordStrengthLevel };
  }

  if (score <= 2) return { score, level: "weak" as const };
  if (score === 3) return { score, level: "medium" as const };
  if (score === 4) return { score, level: "good" as const };
  return { score, level: "strong" as const };
};

const getValidationErrors = (
  data: SignupFormData,
  t: TFunction,
): SignupFormErrors => ({
  fullName:
    data.fullName.trim().length < 3
      ? t("signup.validation.fullName")
      : "",
  email: validateEmail(data.email)
    ? ""
    : t("signup.validation.email"),
  phone: validatePhone(data.phone)
    ? ""
    : t("signup.validation.phone"),
  password: validatePassword(data.password)
    ? ""
    : t("signup.validation.password"),
  confirmPassword:
    data.password === data.confirmPassword
      ? ""
      : t("signup.validation.confirmPassword"),
});

export default function Signup() {
  const { t } = useTranslation();
  const [location, setLocation] = useLocation();
  const [accountType, setAccountType] = useState<
    "company" | "freelancer" | "employee"
  >("company");
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState<SignupFormErrors>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: data => {
      toast.success(t("signup.toast.success"));
      // Save user data to localStorage
      localStorage.setItem("registeredUser", JSON.stringify(data.user));
      analytics.auth.signUp("email", data.user?.userType || accountType);
      // Redirect to login
      setTimeout(() => {
        setLocation("/login");
      }, 1500);
    },
    onError: error => {
      toast.error(error.message || t("signup.toast.error"));
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });
  const [formData, setFormData] = useState<SignupFormData>({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  const phoneRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    analytics.trackPageView({
      page_title: "Signup",
      page_path: location,
    });
  }, [location]);
  const accountBenefits: Record<
    typeof accountType,
    { title: string; points: string[] }
  > = {
    company: {
      title: t("signup.benefits.company.title"),
      points: t("signup.benefits.company.points", {
        returnObjects: true,
      }) as string[],
    },
    freelancer: {
      title: t("signup.benefits.freelancer.title"),
      points: t("signup.benefits.freelancer.points", {
        returnObjects: true,
      }) as string[],
    },
    employee: {
      title: t("signup.benefits.employee.title"),
      points: t("signup.benefits.employee.points", {
        returnObjects: true,
      }) as string[],
    },
  };

  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    cookies: false,
  });

  const canSubmit =
    formData.fullName &&
    formData.email &&
    formData.phone &&
    formData.password &&
    formData.confirmPassword &&
    agreements.terms &&
    agreements.privacy &&
    agreements.cookies &&
    Object.values(getValidationErrors(formData, t)).every(error => !error);

  const validateForm = () => {
    const nextErrors = getValidationErrors(formData, t);
    setFormErrors(nextErrors);
    focusFirstError(nextErrors);
    return Object.values(nextErrors).every(error => !error);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in formErrors) {
      setFormErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const isSubmitting = isLoading || registerMutation.isLoading;
  const passwordStrength = getPasswordStrength(formData.password);
  const passwordStrengthLabel = t(
    `signup.passwordStrength.labels.${passwordStrength.level}`,
  );
  const handleBlurValidate = (field: keyof typeof formData) => {
    const errors = getValidationErrors(formData, t);
    if (errors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: errors[field] }));
    }
  };

  const focusFirstError = (errors: typeof formErrors) => {
    const order: Array<keyof typeof formErrors> = [
      "fullName",
      "phone",
      "email",
      "password",
      "confirmPassword",
    ];
    const firstError = order.find(key => errors[key]);
    if (!firstError) return;
    const refMap: Record<keyof typeof formErrors, HTMLInputElement | null> = {
      fullName: fullNameRef.current,
      phone: phoneRef.current,
      email: emailRef.current,
      password: passwordRef.current,
      confirmPassword: confirmPasswordRef.current,
    };
    refMap[firstError]?.focus();
  };

  const requirementStates = [
    {
      label: t("signup.readiness.requirements.basicInfo"),
      ok: Boolean(formData.fullName && formData.email && formData.phone),
    },
    {
      label: t("signup.readiness.requirements.strongPassword"),
      ok: validatePassword(formData.password),
    },
    {
      label: t("signup.readiness.requirements.matchingPasswords"),
      ok:
        Boolean(formData.password) &&
        formData.password === formData.confirmPassword,
    },
    {
      label: t("signup.readiness.requirements.acceptPolicies"),
      ok: agreements.terms && agreements.privacy && agreements.cookies,
    },
  ];

  const handleSignup = async (
    e: FormEvent<HTMLFormElement> | MouseEvent<HTMLButtonElement>,
  ) => {
    e.preventDefault();

    if (!agreements.terms || !agreements.privacy || !agreements.cookies) {
      toast.error(t("signup.toast.agreementsRequired"));
      return;
    }

    const isValid = validateForm();
    if (!isValid) {
      toast.error(t("signup.toast.fixFields"));
      return;
    }

    setIsLoading(true);

    // Map account type to userType
    const userTypeMap = {
      company: "company" as const,
      freelancer: "consultant" as const,
      employee: "employee" as const,
    };

    // Register with database
    registerMutation.mutate({
      name: formData.fullName.trim(),
      email: formData.email.trim(),
      password: formData.password,
      phoneNumber: formData.phone,
      userType: userTypeMap[accountType],
    });
  };

  const handleSocialSignup = (provider: string) => {
    if (!agreements.terms || !agreements.privacy || !agreements.cookies) {
      toast.error(t("signup.toast.agreementsBeforeSocial"));
      return;
    }

    const userTypeMap = {
      company: "company" as const,
      freelancer: "consultant" as const,
      employee: "employee" as const,
    };
    analytics.auth.signUp(provider, userTypeMap[accountType]);

    // Save account type and agreements
    const socialData = {
      accountType,
      agreements,
      provider,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("pendingSocialSignup", JSON.stringify(socialData));

    // Redirect to OAuth
    globalThis.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <div className="container max-w-2xl py-8">
        <BackButton />

        <Card className="mt-6">
          <CardHeader className="space-y-1 text-center">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 mb-4"
            >
              <img src={APP_LOGO} alt="Rabit" className="h-10 w-10" />
              <span className="text-2xl font-bold text-gradient-primary">
                رابِط
              </span>
            </Link>
            <CardTitle className="text-3xl">{t("signup.title")}</CardTitle>
            <CardDescription className="text-base">
              {t("signup.subtitle")}
            </CardDescription>

            {/* Free Month Offer */}
            <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg">
              <p className="text-sm font-semibold text-blue-700">
                {t("signup.offer.special")}
              </p>
            </div>
          </CardHeader>

          <CardContent>
            <form className="space-y-6" onSubmit={handleSignup}>
            {/* Account Type Selection */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {t("signup.accountType.label")}
              </Label>
              <RadioGroup
                value={accountType}
                onValueChange={(value: "company" | "freelancer" | "employee") =>
                  setAccountType(value)
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <label
                    className={`flex items-center space-x-2 space-x-reverse p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      accountType === "company"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="company" id="company" />
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {t("signup.accountType.company.label")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("signup.accountType.company.desc")}
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 space-x-reverse p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      accountType === "freelancer"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="freelancer" id="freelancer" />
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {t("signup.accountType.freelancer.label")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("signup.accountType.freelancer.desc")}
                        </p>
                      </div>
                    </div>
                  </label>

                  <label
                    className={`flex items-center space-x-2 space-x-reverse p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      accountType === "employee"
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <RadioGroupItem value="employee" id="employee" />
                    <div className="flex items-center gap-2">
                      <UserCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">
                          {t("signup.accountType.employee.label")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t("signup.accountType.employee.desc")}
                        </p>
                      </div>
                    </div>
                  </label>
                </div>
              </RadioGroup>
            </div>

            <div className="rounded-lg border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {accountBenefits[accountType].title}
                  </p>
                  <div className="text-xs text-muted-foreground flex flex-wrap gap-2 mt-2">
                    {accountBenefits[accountType].points.map(point => (
                      <span
                        key={point}
                        className="inline-flex items-center rounded-full bg-background px-3 py-1 border text-foreground"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  {t("signup.accountType.note")}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    {t("signup.form.fullName.label")}
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="fullName"
                      placeholder={t("signup.form.fullName.placeholder")}
                      className={`pr-10 ${
                        formErrors.fullName
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      autoComplete="name"
                      ref={fullNameRef}
                      value={formData.fullName}
                      onChange={e => updateField("fullName", e.target.value)}
                      onBlur={() => handleBlurValidate("fullName")}
                      aria-invalid={!!formErrors.fullName}
                      required
                    />
                  </div>
                  {formErrors.fullName && (
                    <p className="text-xs text-destructive">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t("signup.form.phone.label")}
                  </Label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder={t("signup.form.phone.placeholder")}
                      className={`pr-10 ${
                        formErrors.phone
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      dir="ltr"
                      inputMode="tel"
                      autoComplete="tel-national"
                      ref={phoneRef}
                      value={formData.phone}
                      onChange={e =>
                        updateField("phone", normalizeSaudiPhone(e.target.value))
                      }
                      onBlur={() => handleBlurValidate("phone")}
                      aria-invalid={!!formErrors.phone}
                      required
                    />
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center justify-between">
                    <span>{t("signup.form.phone.hint")}</span>
                    {formErrors.phone && (
                      <span className="text-destructive">
                        {formErrors.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t("signup.form.email.label")}
                </Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("signup.form.email.placeholder")}
                    className={`pr-10 ${
                      formErrors.email
                        ? "border-destructive focus-visible:ring-destructive"
                        : ""
                    }`}
                    dir="ltr"
                    autoComplete="email"
                    ref={emailRef}
                    value={formData.email}
                    onChange={e => updateField("email", e.target.value)}
                    onBlur={() => handleBlurValidate("email")}
                    aria-invalid={!!formErrors.email}
                    required
                  />
                </div>
                {formErrors.email && (
                  <p className="text-xs text-destructive">{formErrors.email}</p>
                )}
              </div>

              {accountType === "company" && (
                <div className="space-y-2">
                  <Label htmlFor="company">
                    {t("signup.form.company.label")}
                  </Label>
                  <div className="relative">
                    <Building2 className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="company"
                      placeholder={t("signup.form.company.placeholder")}
                      className="pr-10"
                      autoComplete="organization"
                      value={formData.company}
                      onChange={e => updateField("company", e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">
                    {t("signup.form.password.label")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                    className={`pr-10 ${
                        formErrors.password
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      dir="ltr"
                      autoComplete="new-password"
                      ref={passwordRef}
                      value={formData.password}
                      onChange={e => updateField("password", e.target.value)}
                      onBlur={() => handleBlurValidate("password")}
                      aria-invalid={!!formErrors.password}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute left-3 top-2.5 text-xs text-primary underline-offset-2 hover:underline"
                    >
                      {showPassword
                        ? t("signup.form.password.hide")
                        : t("signup.form.password.show")}
                    </button>
                  </div>
                  {formErrors.password && (
                    <p className="text-xs text-destructive">
                      {formErrors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">
                    {t("signup.form.confirmPassword.label")}
                  </Label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                    className={`pr-10 ${
                        formErrors.confirmPassword
                          ? "border-destructive focus-visible:ring-destructive"
                          : ""
                      }`}
                      dir="ltr"
                      autoComplete="new-password"
                      ref={confirmPasswordRef}
                      value={formData.confirmPassword}
                      onChange={e =>
                        updateField("confirmPassword", e.target.value)
                      }
                      onBlur={() => handleBlurValidate("confirmPassword")}
                      aria-invalid={!!formErrors.confirmPassword}
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(prev => !prev)
                      }
                      className="absolute left-3 top-2.5 text-xs text-primary underline-offset-2 hover:underline"
                    >
                      {showConfirmPassword
                        ? t("signup.form.password.hide")
                        : t("signup.form.password.show")}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      passwordStrength.score >= 4
                        ? "bg-emerald-500"
                        : passwordStrength.score === 3
                        ? "bg-amber-500"
                        : passwordStrength.score === 2
                        ? "bg-orange-500"
                        : "bg-destructive"
                    }`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {t("signup.passwordStrength.prefix", {
                      label: passwordStrengthLabel,
                    })}
                  </span>
                  <span>{t("signup.passwordStrength.hint")}</span>
                </div>
              </div>
            </div>

            {/* Agreements */}
            <div className="space-y-3 border-t pt-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t("signup.agreements.title")}
              </Label>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={agreements.terms}
                    onCheckedChange={checked =>
                      setAgreements({
                        ...agreements,
                        terms: checked as boolean,
                      })
                    }
                    required
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    {t("signup.agreements.terms.prefix")}{" "}
                    <Link
                      href="/terms"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      {t("signup.agreements.terms.link")}
                    </Link>{" "}
                    {t("signup.agreements.terms.suffix")}
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="privacy"
                    checked={agreements.privacy}
                    onCheckedChange={checked =>
                      setAgreements({
                        ...agreements,
                        privacy: checked as boolean,
                      })
                    }
                    required
                  />
                  <label
                    htmlFor="privacy"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    {t("signup.agreements.privacy.prefix")}{" "}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      {t("signup.agreements.privacy.link")}
                    </Link>{" "}
                    {t("signup.agreements.privacy.suffix")}
                  </label>
                </div>

                <div className="flex items-start gap-3">
                  <Checkbox
                    id="cookies"
                    checked={agreements.cookies}
                    onCheckedChange={checked =>
                      setAgreements({
                        ...agreements,
                        cookies: checked as boolean,
                      })
                    }
                    required
                  />
                  <label
                    htmlFor="cookies"
                    className="text-sm leading-relaxed cursor-pointer"
                  >
                    {t("signup.agreements.cookies.prefix")}{" "}
                    <Link
                      href="/cookies-policy"
                      target="_blank"
                      className="text-primary hover:underline font-medium"
                    >
                      {t("signup.agreements.cookies.link")}
                    </Link>{" "}
                    {t("signup.agreements.cookies.suffix")}
                  </label>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              className="w-full gradient-primary text-white"
              size="lg"
              type="submit"
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("signup.submit.loading")}
                </>
              ) : (
                <>
                  {t("signup.submit.cta")}
                  <ArrowRight className="mr-2 h-4 w-4" />
                </>
              )}
            </Button>

            <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-semibold text-muted-foreground">
                {t("signup.readiness.title")}
              </p>
              <div className="grid gap-1.5 sm:grid-cols-2">
                {requirementStates.map(req => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${
                      req.ok
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-amber-200 bg-amber-50 text-amber-800"
                    }`}
                  >
                    {req.ok ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{req.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  {t("signup.social.divider")}
                </span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignup("google")}
                type="button"
              >
                <img
                  src="https://www.google.com/favicon.ico"
                  alt="Google"
                  className="h-4 w-4 ml-2"
                />
                Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignup("apple")}
                type="button"
              >
                <svg
                  className="h-4 w-4 ml-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Apple
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => handleSocialSignup("microsoft")}
                type="button"
              >
                <svg
                  className="h-4 w-4 ml-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" />
                </svg>
                Microsoft
              </Button>
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-muted-foreground">
              {t("signup.loginPrompt")} {" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium"
              >
                {t("signup.loginLink")}
              </Link>
            </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
