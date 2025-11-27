import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "wouter";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Phone,
  User,
  Globe,
  Users,
  MapPin,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import type { AuthResponse, Package } from "@/shared/types/consulting";

type CompanyForm = {
  companyName: string;
  tradeNumber: string;
  taxNumber: string;
  industry: string;
  companySize: string;
  website: string;
  location: string;
  contactName: string;
  jobTitle: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  packageId?: number | null;
};

type Agreements = {
  terms: boolean;
  privacy: boolean;
  marketing: boolean;
};

const DRAFT_KEY = "rabit-company-signup-draft";

/**
 * Helper function to get step card styles based on state
 */
function getStepCardStyles(active: boolean, done: boolean): string {
  if (active) {
    return "border-purple-500 bg-purple-50 text-purple-800";
  }
  if (done) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  return "border-slate-200 bg-white text-slate-600";
}

const StepCard = ({
  title,
  active,
  done,
}: {
  readonly title: string;
  readonly active: boolean;
  readonly done: boolean;
}) => (
  <div
    className={`p-3 rounded-lg border flex items-center gap-2 text-sm ${getStepCardStyles(active, done)}`}
  >
    {done ? (
      <CheckCircle2 className="h-4 w-4" />
    ) : (
      <ShieldCheck className="h-4 w-4" />
    )}
    <span>{title}</span>
  </div>
);

// ========== Step Components ==========

interface StepCompanyInfoProps {
  readonly formData: CompanyForm;
  readonly setFormData: React.Dispatch<React.SetStateAction<CompanyForm>>;
  readonly isLoading: boolean;
  readonly isArabic: boolean;
}

function StepCompanyInfo({ formData, setFormData, isLoading, isArabic }: StepCompanyInfoProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="companyName">
          {isArabic ? "اسم الشركة" : "Company Name"} *
        </Label>
        <div className="relative">
          <Building2 className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="companyName"
            type="text"
            placeholder={isArabic ? "شركة الموارد البشرية المتحدة" : "Rabit HR Solutions"}
            className="pr-10"
            value={formData.companyName}
            onChange={e => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tradeNumber">
            {isArabic ? "السجل التجاري" : "Trade license"}
          </Label>
          <Input
            id="tradeNumber"
            type="text"
            placeholder="1010xxxx"
            value={formData.tradeNumber}
            onChange={e => setFormData(prev => ({ ...prev, tradeNumber: e.target.value }))}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="taxNumber">
            {isArabic ? "الرقم الضريبي" : "Tax number"}
          </Label>
          <Input
            id="taxNumber"
            type="text"
            placeholder="3xx-xxxx-xxxxxx"
            value={formData.taxNumber}
            onChange={e => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="industry">
            {isArabic ? "القطاع" : "Industry"}
          </Label>
          <Input
            id="industry"
            type="text"
            placeholder={isArabic ? "تقنية / خدمات / تصنيع" : "Tech / Services / Manufacturing"}
            value={formData.industry}
            onChange={e => setFormData(prev => ({ ...prev, industry: e.target.value }))}
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companySize">
            {isArabic ? "حجم الشركة" : "Company Size"}
          </Label>
          <div className="relative">
            <Users className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="companySize"
              type="text"
              placeholder={isArabic ? "11-50 موظف" : "11-50 employees"}
              className="pr-10"
              value={formData.companySize}
              onChange={e => setFormData(prev => ({ ...prev, companySize: e.target.value }))}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="website">
            {isArabic ? "الموقع الإلكتروني" : "Website"}
          </Label>
          <div className="relative">
            <Globe className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="website"
              type="url"
              placeholder="https://company.com"
              className="pr-10"
              value={formData.website}
              onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
              disabled={isLoading}
              dir="ltr"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="location">
            {isArabic ? "الموقع" : "Location"}
          </Label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="location"
              type="text"
              placeholder={isArabic ? "الرياض، السعودية" : "Riyadh, Saudi Arabia"}
              className="pr-10"
              value={formData.location}
              onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
              disabled={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepOwnerDetailsProps {
  readonly formData: CompanyForm;
  readonly setFormData: React.Dispatch<React.SetStateAction<CompanyForm>>;
  readonly isLoading: boolean;
  readonly isArabic: boolean;
  readonly showPassword: boolean;
  readonly setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  readonly showConfirmPassword: boolean;
  readonly setShowConfirmPassword: React.Dispatch<React.SetStateAction<boolean>>;
}

function StepOwnerDetails({
  formData,
  setFormData,
  isLoading,
  isArabic,
  showPassword,
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
}: StepOwnerDetailsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="contactName">
          {isArabic ? "اسم المسؤول" : "Contact Person"} *
        </Label>
        <div className="relative">
          <User className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            id="contactName"
            type="text"
            placeholder={isArabic ? "أحمد محمد" : "Ahmad Mohammed"}
            className="pr-10"
            value={formData.contactName}
            onChange={e => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="jobTitle">
          {isArabic ? "المسمى الوظيفي" : "Job Title"}
        </Label>
        <Input
          id="jobTitle"
          type="text"
          placeholder={isArabic ? "مدير موارد بشرية" : "HR Manager"}
          value={formData.jobTitle}
          onChange={e => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
          disabled={isLoading}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              disabled={isLoading}
              dir="ltr"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">
            {isArabic ? "البريد الإلكتروني" : "Email"} *
          </Label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="admin@company.com"
              className="pr-10"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={isLoading}
              dir="ltr"
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
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
              onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute left-3 top-2.5 text-gray-500"
              onClick={() => setShowPassword(prev => !prev)}
              aria-label={isArabic ? "عرض كلمة المرور" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

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
              onChange={e => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute left-3 top-2.5 text-gray-500"
              onClick={() => setShowConfirmPassword(prev => !prev)}
              aria-label={isArabic ? "عرض كلمة المرور" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StepPackageReviewProps {
  readonly formData: CompanyForm;
  readonly setFormData: React.Dispatch<React.SetStateAction<CompanyForm>>;
  readonly agreements: Agreements;
  readonly setAgreements: React.Dispatch<React.SetStateAction<Agreements>>;
  readonly isLoading: boolean;
  readonly isArabic: boolean;
  readonly loadingPackages: boolean;
  readonly packages: Package[] | undefined;
}

function StepPackageReview({
  formData,
  setFormData,
  agreements,
  setAgreements,
  isLoading,
  isArabic,
  loadingPackages,
  packages,
}: StepPackageReviewProps) {
  const handlePackageSelect = (pkgId: number) => {
    setFormData(prev => ({ ...prev, packageId: pkgId }));
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          {isArabic
            ? "اختر الباقة المناسبة. يمكن تغييرها لاحقاً من الإعدادات."
            : "Pick a package; you can switch later from settings."}
        </p>
        {loadingPackages ? (
          <PackageSkeletons />
        ) : (
          <PackageList
            packages={packages}
            selectedPackageId={formData.packageId}
            onSelect={handlePackageSelect}
            isArabic={isArabic}
          />
        )}
      </div>

      <Separator />

      <AgreementsSection
        agreements={agreements}
        setAgreements={setAgreements}
        isLoading={isLoading}
        isArabic={isArabic}
      />
    </div>
  );
}

function PackageSkeletons() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {[1, 2].map(i => (
        <Card key={`skeleton-${i}`} className="p-4">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-24 mb-4" />
          <Skeleton className="h-10 w-full" />
        </Card>
      ))}
    </div>
  );
}

interface PackageListProps {
  readonly packages: Package[] | undefined;
  readonly selectedPackageId: number | null | undefined;
  readonly onSelect: (id: number) => void;
  readonly isArabic: boolean;
}

function PackageList({ packages, selectedPackageId, onSelect, isArabic }: PackageListProps) {
  if (!packages?.length) return null;

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {packages.map(pkg => (
        <PackageCard
          key={pkg.id}
          pkg={pkg}
          isSelected={selectedPackageId === pkg.id}
          onSelect={onSelect}
          isArabic={isArabic}
        />
      ))}
    </div>
  );
}

interface PackageCardProps {
  readonly pkg: Package;
  readonly isSelected: boolean;
  readonly onSelect: (id: number) => void;
  readonly isArabic: boolean;
}

function PackageCard({ pkg, isSelected, onSelect, isArabic }: PackageCardProps) {
  const borderClass = isSelected
    ? "border-purple-500 shadow"
    : "border-transparent hover:border-slate-200";

  return (
    <Card
      className={`p-4 cursor-pointer border-2 ${borderClass}`}
      onClick={() => onSelect(pkg.id)}
    >
      <div className="flex items-start justify-between">
        <div>
          <CardTitle className="text-lg">{pkg.name}</CardTitle>
          {pkg.description && (
            <CardDescription className="mt-1 text-sm">{pkg.description}</CardDescription>
          )}
        </div>
        <Badge variant="secondary" className="text-xs">
          SLA {pkg.slaHours || 24}h
        </Badge>
      </div>
      <div className="mt-3">
        <div className="text-2xl font-bold text-purple-700">
          {pkg.priceSAR ?? pkg.price ?? 0} ريال
        </div>
        {pkg.duration && (
          <p className="text-xs text-muted-foreground">
            {isArabic ? "مدة الجلسة" : "Session length"} ~ {pkg.duration} {isArabic ? "دقيقة" : "min"}
          </p>
        )}
      </div>
    </Card>
  );
}

interface AgreementsSectionProps {
  readonly agreements: Agreements;
  readonly setAgreements: React.Dispatch<React.SetStateAction<Agreements>>;
  readonly isLoading: boolean;
  readonly isArabic: boolean;
}

function AgreementsSection({ agreements, setAgreements, isLoading, isArabic }: AgreementsSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Checkbox
          id="terms"
          checked={agreements.terms}
          onCheckedChange={checked => setAgreements(prev => ({ ...prev, terms: Boolean(checked) }))}
          disabled={isLoading}
        />
        <Label htmlFor="terms" className="text-sm">
          {isArabic ? "أوافق على الشروط والأحكام" : "I agree to the terms and conditions"}
        </Label>
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Checkbox
          id="privacy"
          checked={agreements.privacy}
          onCheckedChange={checked => setAgreements(prev => ({ ...prev, privacy: Boolean(checked) }))}
          disabled={isLoading}
        />
        <Label htmlFor="privacy" className="text-sm">
          {isArabic ? "أوافق على سياسة الخصوصية" : "I agree to the privacy policy"}
        </Label>
      </div>
      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <Checkbox
          id="marketing"
          checked={agreements.marketing}
          onCheckedChange={checked => setAgreements(prev => ({ ...prev, marketing: Boolean(checked) }))}
          disabled={isLoading}
        />
        <Label htmlFor="marketing" className="text-sm">
          {isArabic ? "أرغب في استلام تحديثات وعروض" : "I want to receive updates and offers"}
        </Label>
      </div>
    </div>
  );
}

export default function SignupCompany() {
  const { t, i18n } = useTranslation();
  const [, setLocation] = useLocation();
  const isArabic = i18n.language === "ar";

  const [formData, setFormData] = useState<CompanyForm>({
    companyName: "",
    tradeNumber: "",
    taxNumber: "",
    industry: "",
    companySize: "",
    website: "",
    location: "",
    contactName: "",
    jobTitle: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    packageId: null,
  });
  const [agreements, setAgreements] = useState({
    terms: false,
    privacy: false,
    marketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { data: packagesData, isLoading: loadingPackages } =
    trpc.consulting.getPackages.useQuery(undefined, {
      refetchOnWindowFocus: false,
    });

  const steps = [
    { id: 0, title: isArabic ? "بيانات الشركة" : "Company info" },
    { id: 1, title: isArabic ? "بيانات المسؤول" : "Owner details" },
    { id: 2, title: isArabic ? "الباقة والمراجعة" : "Package & review" },
  ];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setFormData(parsed.formData ?? formData);
        setAgreements(parsed.agreements ?? agreements);
        setCurrentStep(parsed.currentStep ?? 0);
      }
    } catch {
      /* ignore corrupted drafts */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const draft = {
      formData,
      agreements,
      currentStep,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [formData, agreements, currentStep]);

  useEffect(() => {
    if (!formData.packageId && packagesData?.packages?.length) {
      setFormData(prev => ({ ...prev, packageId: packagesData.packages[0].id }));
    }
  }, [formData.packageId, packagesData]);

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data: AuthResponse) => {
      toast.success(
        isArabic
          ? "تم إنشاء حساب الشركة بنجاح"
          : "Company account created successfully"
      );
      localStorage.removeItem(DRAFT_KEY);
      localStorage.setItem("user", JSON.stringify(data.user));
      const token = data.token || data.accessToken;
      if (token) localStorage.setItem("token", token);
      setTimeout(() => setLocation("/complete-profile"), 600);
    },
    onError: error => {
      toast.error(error.message || t("signup.error"));
      setIsLoading(false);
    },
    onSettled: () => setIsLoading(false),
  });

  const validateStep = (step: number) => {
    if (step === 0) {
      return !!formData.companyName;
    }
    if (step === 1) {
      return (
        formData.contactName &&
        formData.email &&
        formData.phone &&
        formData.password &&
        formData.confirmPassword &&
        formData.password === formData.confirmPassword &&
        formData.password.length >= 8
      );
    }
    if (step === 2) {
      return agreements.terms && agreements.privacy;
    }
    return true;
  };

  const goNext = () => {
    if (!validateStep(currentStep)) {
      toast.error(
        isArabic
          ? "أكمل الحقول المطلوبة في هذه الخطوة"
          : "Please complete required fields"
      );
      return;
    }
    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const goBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) {
      toast.error(
        isArabic
          ? "أكمل البيانات والاتفاقيات قبل المتابعة"
          : "Complete data and agreements first"
      );
      return;
    }
    setIsLoading(true);
    registerMutation.mutate({
      name: formData.companyName,
      email: formData.email,
      password: formData.password,
      phoneNumber: formData.phone,
      userType: "company",
    });
  };

  const features = [
    isArabic ? "إدارة الموظفين والملفات" : "Employee & docs management",
    isArabic ? "نظام ATS كامل" : "Full ATS pipeline",
    isArabic ? "التذاكر والمهام" : "Tickets & tasks",
    isArabic ? "الأدوات الذكية" : "Smart HR tools",
    isArabic ? "تنبيهات وإشعارات" : "Alerts & notifications",
    isArabic ? "تقارير متقدمة" : "Advanced analytics",
  ];

  const renderStepContent = () => {
    if (currentStep === 0) {
      return (
        <StepCompanyInfo
          formData={formData}
          setFormData={setFormData}
          isLoading={isLoading}
          isArabic={isArabic}
        />
      );
    }

    if (currentStep === 1) {
      return (
        <StepOwnerDetails
          formData={formData}
          setFormData={setFormData}
          isLoading={isLoading}
          isArabic={isArabic}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
          showConfirmPassword={showConfirmPassword}
          setShowConfirmPassword={setShowConfirmPassword}
        />
      );
    }

    return (
      <StepPackageReview
        formData={formData}
        setFormData={setFormData}
        agreements={agreements}
        setAgreements={setAgreements}
        isLoading={isLoading}
        isArabic={isArabic}
        loadingPackages={loadingPackages}
        packages={packagesData?.packages}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-blue-950/40 dark:to-purple-950/40 py-12 px-4 sm:px-6 lg:px-8">
      <BackButton />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Building2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {isArabic ? "إنشاء حساب شركة" : "Create Company Account"}
            </span>
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isArabic
              ? "رحلة بثلاث خطوات: بيانات، مسؤول، باقة — مع حفظ مسودة تلقائي."
              : "A 3-step journey: company, owner, package — with autosave."}
          </p>
          <div className="mt-4 flex items-center justify-center gap-4">
            <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
              {isArabic ? "ابتداءً من 599 ريال/شهر" : "From 599 SAR/month"}
            </Badge>
            <Badge variant="outline">
              {isArabic ? "تجربة مجانية 14 يوم" : "14-day free trial"}
            </Badge>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form */}
          <Card className="lg:col-span-2 shadow-xl">
            <CardHeader className="pb-2">
              <CardTitle>
                {isArabic ? "خطوات التسجيل" : "Sign-up steps"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "نراجع الحقول الأساسية، ثم نختار الباقة، ثم ننشئ الحساب."
                  : "We capture essentials, select a package, then create your account."}
              </CardDescription>
              <div className="mt-4 grid grid-cols-3 gap-3">
                {steps.map(step => (
                  <StepCard
                    key={step.id}
                    title={step.title}
                    active={step.id === currentStep}
                    done={step.id < currentStep}
                  />
                ))}
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {renderStepContent()}
              </form>
            </CardContent>

            <div className="px-6 pb-6 flex items-center justify-between">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {isArabic ? "سجّل للدخول؟" : "Already have an account?"}{" "}
                <Link href="/login" className="text-primary hover:underline">
                  {isArabic ? "تسجيل الدخول" : "Login"}
                </Link>
              </div>

              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <Button variant="outline" onClick={goBack} disabled={isLoading}>
                    {isArabic ? "السابق" : "Back"}
                  </Button>
                )}
                {currentStep < steps.length - 1 ? (
                  <Button onClick={goNext} disabled={isLoading}>
                    {isArabic ? "التالي" : "Next"}
                  </Button>
                ) : (
                  <Button onClick={() => handleSubmit()} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        {isArabic ? "جاري التسجيل..." : "Signing up..."}
                      </>
                    ) : (
                      <>{isArabic ? "إنشاء حساب شركة" : "Create Company Account"}</>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Sidebar */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle>
                {isArabic ? "لماذا رابِط للشركات؟" : "Why Rabit for Companies?"}
              </CardTitle>
              <CardDescription>
                {isArabic
                  ? "حلول متكاملة للموارد البشرية"
                  : "Integrated HR solutions"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-white/60 rounded-lg border">
                <Sparkles className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-semibold">
                    {isArabic ? "تشغيل متكامل" : "End-to-end operations"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isArabic
                      ? "من التوظيف إلى نهاية الخدمة مع لوحة تحكم واحدة"
                      : "From hiring to exit in one dashboard"}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {features.map(feature => (
                  <div
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-600 to-purple-600" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {isArabic
                    ? "بالنقر على التسجيل، أنت توافق على"
                    : "By signing up you agree to our"}
                </p>
                <div className="flex gap-2 text-sm">
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                  >
                    {isArabic ? "الشروط" : "Terms"}
                  </Link>
                  <span>•</span>
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    {isArabic ? "الخصوصية" : "Privacy"}
                  </Link>
                  <span>•</span>
                  <Link
                    href="/cookies"
                    className="text-primary hover:underline"
                  >
                    {isArabic ? "الكوكيز" : "Cookies"}
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
