export type TrialPersonaId = "admin" | "company" | "consultant" | "employee";

export interface TrialProfile {
  id: TrialPersonaId;
  title: string;
  subtitle: string;
  description: string;
  demoEmail: string;
  demoPassword: string;
  dashboardPath: string;
  levelTag: string;
  highlights: string[];
  recommendedSignupPath: string;
  suggestedUserType: "employee" | "individual" | "company" | "consultant";
}

export const TRIAL_PROFILES: TrialProfile[] = [
  {
    id: "admin",
    title: "حساب المشرف العام",
    subtitle: "للمؤسسين والمديرين التنفيذيين",
    description:
      "استكشف جميع لوحات القيادة والتحكم بالسياسات، الأسعار، وإعدادات الأمان قبل الالتزام.",
    demoEmail: "demo.admin@rabithr.com",
    demoPassword: "Demo@12345",
    dashboardPath: "/admin/dashboard",
    levelTag: "متقدم",
    highlights: [
      "رؤية مباشرة للإيرادات، الحوكمة، وسجل التعديلات",
      "إدارة الصلاحيات وتوزيع الأدوار على فرق HR",
      "محاكاة كاملة للسياسات والتنبيهات دون المساس بالبيانات الحقيقية",
    ],
    recommendedSignupPath: "/signup/company",
    suggestedUserType: "company",
  },
  {
    id: "company",
    title: "مسؤول الموارد البشرية",
    subtitle: "للشركات الصغيرة والمتوسطة",
    description:
      "اختبر أتمتة الحضور، إدارة العقود، والتقارير التشغيلية باستخدام بيانات تجريبية ثرية.",
    demoEmail: "demo.hr@rabithr.com",
    demoPassword: "Demo@12345",
    dashboardPath: "/dashboard/company",
    levelTag: "قياسي",
    highlights: [
      "قوالب عقود، سياسات، وتنبيهات جاهزة للسوق السعودي",
      "لوحة حضور وإجازات تتزامن مع نظام مكتب العمل",
      "ربط مباشر بمنصة الاستشارات لإحالة الحالات الحساسة",
    ],
    recommendedSignupPath: "/signup/company",
    suggestedUserType: "company",
  },
  {
    id: "consultant",
    title: "حساب المستشار",
    subtitle: "للخبراء القانونيين ومستشاري الموارد البشرية",
    description:
      "جرّب تقويم الحجوزات، تسعير الجلسات، والدردشة المؤمنة مع عملاء تجريبيين.",
    demoEmail: "demo.consultant@rabithr.com",
    demoPassword: "Demo@12345",
    dashboardPath: "/consultant-dashboard",
    levelTag: "محترف",
    highlights: [
      "مطابقة تلقائية للطلبات حسب التخصص وخبرة السنوات",
      "رفع مرفقات مؤمنة وتسليم ملخصات التنفيذ",
      "لوحة أرباح ومؤشرات SLA للمسارات الفورية",
    ],
    recommendedSignupPath: "/signup/consultant",
    suggestedUserType: "consultant",
  },
  {
    id: "employee",
    title: "تجربة الموظف",
    subtitle: "للموظفين ومديري الأقسام",
    description:
      "اختبر بوابة الموظف، تتبع الطلبات، والوصول لجميع الوثائق باللغة العربية.",
    demoEmail: "demo.employee@rabithr.com",
    demoPassword: "Demo@12345",
    dashboardPath: "/employee/dashboard",
    levelTag: "مبتدئ",
    highlights: [
      "متابعة الإجازات، المستحقات، والتنبيهات من الجوال",
      "قناة تواصل فورية مع فريق الموارد البشرية",
      "وصول منظم للوثائق وشهادات الخبرة",
    ],
    recommendedSignupPath: "/signup/employee",
    suggestedUserType: "employee",
  },
];

export const TRIAL_PROFILE_STORAGE_KEY = "rabithr:trial-profile";

const isBrowser = typeof window !== "undefined";

export const getTrialProfileById = (id: string | null | undefined) =>
  TRIAL_PROFILES.find(profile => profile.id === id);

export const storeTrialProfileSelection = (profileId: TrialPersonaId) => {
  if (!isBrowser) return;
  const profile = getTrialProfileById(profileId);
  if (!profile) return;
  localStorage.setItem(TRIAL_PROFILE_STORAGE_KEY, JSON.stringify(profile));
  localStorage.setItem(`${TRIAL_PROFILE_STORAGE_KEY}:ts`, String(Date.now()));
};

export const readTrialProfileSelection = (): TrialProfile | null => {
  if (!isBrowser) return null;
  const serialized = localStorage.getItem(TRIAL_PROFILE_STORAGE_KEY);
  if (!serialized) return null;
  try {
    return JSON.parse(serialized) as TrialProfile;
  } catch (error) {
    console.warn("Failed to parse stored trial profile", error);
    return null;
  }
};

export const clearTrialProfileSelection = () => {
  if (!isBrowser) return;
  localStorage.removeItem(TRIAL_PROFILE_STORAGE_KEY);
  localStorage.removeItem(`${TRIAL_PROFILE_STORAGE_KEY}:ts`);
};
