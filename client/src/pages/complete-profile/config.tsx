import type { JSX } from "react";
import { User, Briefcase, Building2 } from "lucide-react";
import { UserType, Step } from "./types";

// Steps configuration by user type
export const STEPS_CONFIG: Record<UserType, { ar: string; en: string }[]> = {
  employee: [
    { ar: "المعلومات الأساسية", en: "Basic Info" },
    { ar: "الخبرة المهنية", en: "Work Experience" },
    { ar: "المهارات والتعليم", en: "Skills & Education" },
  ],
  consultant: [
    { ar: "المعلومات الأساسية", en: "Basic Info" },
    { ar: "التخصص والخبرة", en: "Specialty & Experience" },
    { ar: "التسعير والتواجد", en: "Pricing & Availability" },
  ],
  company: [
    { ar: "معلومات الشركة", en: "Company Info" },
    { ar: "تفاصيل النشاط", en: "Business Details" },
    { ar: "التواصل والروابط", en: "Contact & Links" },
  ],
};

// Get steps for user type
export function getStepsForType(userType: UserType, isArabic: boolean): Step[] {
  const config = STEPS_CONFIG[userType] || [];
  return config.map((step, index) => ({
    id: index,
    title: isArabic ? step.ar : step.en,
  }));
}

// Gradient configuration
export const GRADIENT_CONFIG: Record<UserType, { bg: string; accent: string }> = {
  employee: {
    bg: "from-green-50 via-emerald-50 to-teal-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/20",
    accent: "from-green-600 to-emerald-600",
  },
  consultant: {
    bg: "from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-pink-900/20",
    accent: "from-purple-600 to-pink-600",
  },
  company: {
    bg: "from-blue-50 via-cyan-50 to-sky-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-cyan-900/20",
    accent: "from-blue-600 to-cyan-600",
  },
};

// Get gradient for user type
export function getGradient(userType: UserType): string {
  return GRADIENT_CONFIG[userType]?.bg || "from-gray-50 to-white";
}

export function getAccentColor(userType: UserType): string {
  return GRADIENT_CONFIG[userType]?.accent || "from-gray-600 to-gray-600";
}

// Icon configuration
export function getIcon(userType: UserType): JSX.Element {
  const iconClass = "w-8 h-8 text-white";
  switch (userType) {
    case "employee":
      return <User className={iconClass} />;
    case "consultant":
      return <Briefcase className={iconClass} />;
    case "company":
      return <Building2 className={iconClass} />;
    default:
      return <User className={iconClass} />;
  }
}

// Title configuration
export const TITLE_CONFIG: Record<UserType, { ar: string; en: string }> = {
  employee: { ar: "أكمل ملفك الشخصي", en: "Complete Your Profile" },
  consultant: { ar: "أكمل ملفك الاستشاري", en: "Complete Your Consultant Profile" },
  company: { ar: "أكمل ملف الشركة", en: "Complete Company Profile" },
};

export function getTitle(userType: UserType, isArabic: boolean): string {
  const config = TITLE_CONFIG[userType];
  if (!config) return isArabic ? "أكمل ملفك" : "Complete Your Profile";
  return isArabic ? config.ar : config.en;
}
