/**
 * Lightweight language helper built on top of useI18n
 * هوك مبسط للغة مبني على useI18n
 */

import { useI18n } from "./useI18n";

type ToggleLanguage = () => Promise<void>;

type UseLanguageReturn = {
  t: ReturnType<typeof useI18n>["t"];
  lang: ReturnType<typeof useI18n>["lang"];
  isArabic: boolean;
  isEnglish: boolean;
  isRTL: boolean;
  dir: ReturnType<typeof useI18n>["dir"];
  changeLanguage: ReturnType<typeof useI18n>["changeLanguage"];
  toggleLanguage: ToggleLanguage;
  formatNumber: ReturnType<typeof useI18n>["formatNumber"];
  formatCurrency: ReturnType<typeof useI18n>["formatCurrency"];
  formatDate: ReturnType<typeof useI18n>["formatDate"];
  formatRelativeTime: ReturnType<typeof useI18n>["formatRelativeTime"];
};

export function useLanguage(): UseLanguageReturn {
  const {
    t,
    lang,
    isArabic,
    isEnglish,
    isRTL,
    dir,
    changeLanguage,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
  } = useI18n();

  const toggleLanguage: ToggleLanguage = async () => {
    const next = isArabic ? "en" : "ar";
    await changeLanguage(next);
  };

  return {
    t,
    lang,
    isArabic,
    isEnglish,
    isRTL,
    dir,
    changeLanguage,
    toggleLanguage,
    formatNumber,
    formatCurrency,
    formatDate,
    formatRelativeTime,
  };
}

export default useLanguage;
