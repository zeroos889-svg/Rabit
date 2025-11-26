/**
 * Custom i18n Hook - Advanced Translation Management
 * هوك مخصص لإدارة الترجمة بشكل احترافي
 */

import { useTranslation } from "react-i18next";
import { useCallback, useMemo } from "react";

interface UseI18nReturn {
  t: (key: string, defaultValue?: string, params?: Record<string, any>) => string;
  lang: string;
  isRTL: boolean;
  isArabic: boolean;
  isEnglish: boolean;
  changeLanguage: (lng: string) => Promise<void>;
  dir: "rtl" | "ltr";
  formatNumber: (num: number) => string;
  formatCurrency: (amount: number, currency?: string) => string;
  formatDate: (date: Date | string, format?: "short" | "long" | "medium") => string;
  formatRelativeTime: (date: Date | string) => string;
}

const STORAGE_KEY = "rabithr:locale";

/**
 * Advanced i18n hook with utilities
 * هوك متقدم للترجمة مع أدوات مساعدة
 */
export function useI18n(): UseI18nReturn {
  const { t: originalT, i18n } = useTranslation();
  
  const lang = i18n.language;
  const isRTL = lang === "ar";
  const isArabic = lang === "ar";
  const isEnglish = lang === "en";
  const dir = isRTL ? "rtl" : "ltr";

  /**
   * Enhanced translation function with fallback
   * دالة ترجمة محسّنة مع قيمة افتراضية
   */
  const t = useCallback(
    (key: string, defaultValue?: string, params?: Record<string, any>) => {
      const translated = originalT(key, params);
      // If translation is the same as key, return default value if provided
      if (translated === key && defaultValue) {
        return defaultValue;
      }
      return translated;
    },
    [originalT]
  );

  /**
   * Change language with proper direction and storage
   * تغيير اللغة مع الاتجاه والتخزين الصحيح
   */
  const changeLanguage = useCallback(
    async (lng: string) => {
      await i18n.changeLanguage(lng);
      document.documentElement.dir = lng === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lng;
      try {
        localStorage.setItem(STORAGE_KEY, lng);
      } catch {
        // Ignore storage errors
      }
    },
    [i18n]
  );

  /**
   * Format number according to locale
   * تنسيق الأرقام حسب اللغة
   */
  const formatNumber = useCallback(
    (num: number): string => {
      try {
        return new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US").format(num);
      } catch {
        return num.toString();
      }
    },
    [lang]
  );

  /**
   * Format currency according to locale
   * تنسيق العملة حسب اللغة
   */
  const formatCurrency = useCallback(
    (amount: number, currency: string = "SAR"): string => {
      try {
        return new Intl.NumberFormat(lang === "ar" ? "ar-SA" : "en-US", {
          style: "currency",
          currency: currency,
        }).format(amount);
      } catch {
        return `${amount} ${currency}`;
      }
    },
    [lang]
  );

  /**
   * Format date according to locale
   * تنسيق التاريخ حسب اللغة
   */
  const formatDate = useCallback(
    (date: Date | string, format: "short" | "long" | "medium" = "medium"): string => {
      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
          short: { year: "numeric", month: "2-digit", day: "2-digit" },
          medium: { year: "numeric", month: "short", day: "numeric" },
          long: { year: "numeric", month: "long", day: "numeric", weekday: "long" },
        };
        const options = optionsMap[format];

        return new Intl.DateTimeFormat(lang === "ar" ? "ar-SA" : "en-US", options).format(
          dateObj
        );
      } catch {
        return date.toString();
      }
    },
    [lang]
  );

  /**
   * Format relative time (e.g., "2 days ago")
   * تنسيق الوقت النسبي (مثل: "منذ يومين")
   */
  const formatRelativeTime = useCallback(
    (date: Date | string): string => {
      try {
        const dateObj = typeof date === "string" ? new Date(date) : date;
        const now = new Date();
        const diffMs = now.getTime() - dateObj.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffSeconds < 60) {
          return isArabic ? "الآن" : "just now";
        } else if (diffMinutes < 60) {
          return isArabic
            ? `منذ ${diffMinutes} دقيقة`
            : `${diffMinutes} minute${diffMinutes > 1 ? "s" : ""} ago`;
        } else if (diffHours < 24) {
          return isArabic
            ? `منذ ${diffHours} ساعة`
            : `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
        } else if (diffDays < 7) {
          return isArabic
            ? `منذ ${diffDays} يوم`
            : `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
        } else {
          return formatDate(dateObj, "short");
        }
      } catch {
        return date.toString();
      }
    },
    [isArabic, formatDate]
  );

  return useMemo(
    () => ({
      t,
      lang,
      isRTL,
      isArabic,
      isEnglish,
      changeLanguage,
      dir,
      formatNumber,
      formatCurrency,
      formatDate,
      formatRelativeTime,
    }),
    [
      t,
      lang,
      isRTL,
      isArabic,
      isEnglish,
      changeLanguage,
      dir,
      formatNumber,
      formatCurrency,
      formatDate,
      formatRelativeTime,
    ]
  );
}

/**
 * Hook for checking if translations are loaded
 * هوك للتحقق من تحميل الترجمات
 */
export function useTranslationsReady(): boolean {
  const { i18n } = useTranslation();
  return i18n.isInitialized;
}

/**
 * Hook for getting available languages
 * هوك للحصول على اللغات المتاحة
 */
export function useAvailableLanguages() {
  const { i18n } = useTranslation();
  
  return useMemo(() => {
    const languages = Object.keys(i18n.options.resources || {});
    return languages.map((code) => ({
      code,
      name: code === "ar" ? "العربية" : "English",
      nativeName: code === "ar" ? "العربية" : "English",
      dir: code === "ar" ? "rtl" : "ltr",
    }));
  }, [i18n.options.resources]);
}
