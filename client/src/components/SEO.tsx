/**
 * SEO Component for Multilingual Support
 * مكون SEO لدعم اللغات المتعددة
 */

import { Helmet } from "react-helmet-async";
import { useI18n } from "@/hooks/useI18n";

interface SEOProps {
  /** Page title / عنوان الصفحة */
  title?: string;
  /** Page description / وصف الصفحة */
  description?: string;
  /** Page keywords / كلمات مفتاحية */
  keywords?: string[];
  /** Canonical URL / الرابط القانوني */
  canonical?: string;
  /** Open Graph image / صورة Open Graph */
  ogImage?: string;
  /** Page type / نوع الصفحة */
  type?: "website" | "article" | "profile";
  /** Article published time / وقت نشر المقال */
  publishedTime?: string;
  /** Article modified time / وقت تعديل المقال */
  modifiedTime?: string;
  /** Author / الكاتب */
  author?: string;
  /** No index / عدم الفهرسة */
  noIndex?: boolean;
}

const defaultMeta = {
  ar: {
    title: "رابِط - منصة الموارد البشرية الذكية",
    description:
      "منصة رابِط للموارد البشرية - جميع أدوات HR في مكان واحد: حاسبات، مولد خطابات، استشارات، ودورات تدريبية. متوافق 100% مع نظام العمل السعودي.",
    keywords: [
      "الموارد البشرية",
      "HR",
      "نظام العمل السعودي",
      "حاسبة نهاية الخدمة",
      "حاسبة الإجازات",
      "استشارات",
      "دورات تدريبية",
      "رابِط",
    ],
  },
  en: {
    title: "Rabit - Smart HR Platform",
    description:
      "Rabit HR Platform - All HR tools in one place: calculators, letter generator, consulting, and training courses. 100% compliant with Saudi Labor Law.",
    keywords: [
      "Human Resources",
      "HR",
      "Saudi Labor Law",
      "End of Service Calculator",
      "Leave Calculator",
      "Consulting",
      "Training Courses",
      "Rabit",
    ],
  },
};

/**
 * SEO component with multilingual support and hreflang tags
 * مكون SEO مع دعم اللغات المتعددة ووسوم hreflang
 */
export function SEO({
  title,
  description,
  keywords,
  canonical,
  ogImage = "/og-image.png",
  type = "website",
  publishedTime,
  modifiedTime,
  author,
  noIndex = false,
}: SEOProps) {
  const { lang, t } = useI18n();
  const isArabic = lang === "ar";

  // Get default values based on language
  const defaultValues = isArabic ? defaultMeta.ar : defaultMeta.en;

  // Construct full title
  const fullTitle = title
    ? `${title} | ${defaultValues.title}`
    : defaultValues.title;

  // Use provided or default description
  const finalDescription = description || defaultValues.description;

  // Combine keywords
  const finalKeywords = keywords
    ? [...keywords, ...defaultValues.keywords]
    : defaultValues.keywords;

  // Get current URL
  const currentUrl = typeof window !== "undefined" ? window.location.href : "";
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  // Construct alternate URLs for hreflang
  const alternateUrls = {
    ar: canonical
      ? `${baseUrl}${canonical}?lang=ar`
      : `${currentUrl.split("?")[0]}?lang=ar`,
    en: canonical
      ? `${baseUrl}${canonical}?lang=en`
      : `${currentUrl.split("?")[0]}?lang=en`,
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={lang} dir={isArabic ? "rtl" : "ltr"} />
      <title>{fullTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords.join(", ")} />

      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {!noIndex && <meta name="robots" content="index, follow" />}

      {/* Canonical URL */}
      {canonical && <link rel="canonical" href={`${baseUrl}${canonical}`} />}

      {/* Hreflang Tags */}
      <link rel="alternate" hrefLang="ar" href={alternateUrls.ar} />
      <link rel="alternate" hrefLang="en" href={alternateUrls.en} />
      <link rel="alternate" hrefLang="x-default" href={alternateUrls.ar} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={`${baseUrl}${ogImage}`} />
      <meta property="og:locale" content={isArabic ? "ar_SA" : "en_US"} />
      <meta
        property="og:locale:alternate"
        content={isArabic ? "en_US" : "ar_SA"}
      />
      <meta property="og:site_name" content={t("nav.home", "رابِط")} />

      {/* Article Meta (if type is article) */}
      {type === "article" && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === "article" && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === "article" && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={`${baseUrl}${ogImage}`} />

      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="theme-color" content="#667eea" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    </Helmet>
  );
}

/**
 * Specific SEO component for home page
 * مكون SEO خاص للصفحة الرئيسية
 */
export function HomeSEO() {
  const { t } = useI18n();

  return (
    <SEO
      title={t("hero.title")}
      description={t("hero.description")}
      canonical="/"
    />
  );
}

/**
 * Specific SEO component for tools page
 * مكون SEO خاص لصفحة الأدوات
 */
export function ToolsSEO() {
  const { t } = useI18n();

  return (
    <SEO
      title={t("tools.title")}
      description={t("tools.subtitle")}
      canonical="/tools"
      keywords={["HR Tools", "Calculators", "أدوات الموارد البشرية", "حاسبات"]}
    />
  );
}

/**
 * Specific SEO component for pricing page
 * مكون SEO خاص لصفحة الباقات
 */
export function PricingSEO() {
  const { t } = useI18n();

  return (
    <SEO
      title={t("pricing.page.title")}
      description={t("pricing.page.subtitle")}
      canonical="/pricing"
      keywords={["Pricing", "Plans", "الباقات", "الأسعار"]}
    />
  );
}

/**
 * Specific SEO component for contact page
 * مكون SEO خاص لصفحة التواصل
 */
export function ContactSEO() {
  const { t } = useI18n();

  return (
    <SEO
      title={t("contact.hero.title")}
      description={t("contact.hero.subtitle")}
      canonical="/contact"
      keywords={["Contact", "Support", "تواصل", "دعم"]}
    />
  );
}
