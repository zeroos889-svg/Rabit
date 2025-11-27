/**
 * TransText Component - Advanced Translation Component
 * مكون ترجمة متقدم مع دعم المتغيرات والتنسيق
 */

import React from "react";
import { useI18n } from "@/hooks/useI18n";

interface TransTextProps {
  /** Translation key / مفتاح الترجمة */
  readonly tKey: string;
  /** Default text if translation not found / النص الافتراضي إذا لم توجد الترجمة */
  readonly defaultText?: string;
  /** Variables to interpolate / المتغيرات للاستبدال */
  readonly values?: Record<string, unknown>;
  /** HTML element to render / عنصر HTML للعرض */
  readonly as?: keyof JSX.IntrinsicElements;
  /** CSS classes / الأنماط */
  readonly className?: string;
  /** Whether to render as HTML / هل يتم العرض كـ HTML */
  readonly html?: boolean;
  /** Fallback component if translation fails / مكون بديل عند الفشل */
  readonly fallback?: React.ReactNode;
}

/**
 * Advanced translation component with features:
 * - Variable interpolation
 * - HTML rendering
 * - Fallback support
 * - Custom element rendering
 * 
 * مكون ترجمة متقدم مع ميزات:
 * - استبدال المتغيرات
 * - عرض HTML
 * - دعم البديل
 * - عرض عنصر مخصص
 */
export function TransText({
  tKey,
  defaultText,
  values,
  as: Component = "span",
  className,
  html = false,
  fallback,
}: Readonly<TransTextProps>) {
  const { t } = useI18n();

  try {
    const translatedText = t(tKey, defaultText, values);

    if (html) {
      // Import sanitization dynamically to avoid circular deps
      const sanitized = translatedText
        .replaceAll(/<script[^>]*>.*?<\/script>/gi, '')
        .replaceAll(/on\w+="[^"]*"/gi, '')
        .replaceAll(/javascript:/gi, '');
      
      return (
        <Component
          className={className}
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      );
    }

    return <Component className={className}>{translatedText}</Component>;
  } catch (error) {
    console.error(`Translation error for key: ${tKey}`, error);
    
    if (fallback) {
      return <>{fallback}</>;
    }

    return <Component className={className}>{defaultText || tKey}</Component>;
  }
}

/**
 * Shorthand for TransText with <p> tag
 * اختصار لـ TransText مع وسم <p>
 */
export function TransParagraph(props: Readonly<Omit<TransTextProps, "as">>) {
  return <TransText {...props} as="p" />;
}

/**
 * Shorthand for TransText with <h1> tag
 * اختصار لـ TransText مع وسم <h1>
 */
export function TransHeading1(props: Readonly<Omit<TransTextProps, "as">>) {
  return <TransText {...props} as="h1" />;
}

/**
 * Shorthand for TransText with <h2> tag
 * اختصار لـ TransText مع وسم <h2>
 */
export function TransHeading2(props: Readonly<Omit<TransTextProps, "as">>) {
  return <TransText {...props} as="h2" />;
}

/**
 * Shorthand for TransText with <h3> tag
 * اختصار لـ TransText مع وسم <h3>
 */
export function TransHeading3(props: Readonly<Omit<TransTextProps, "as">>) {
  return <TransText {...props} as="h3" />;
}

/**
 * Shorthand for TransText with <button> text
 * اختصار لـ TransText مع نص زر
 */
export function TransButton(props: Readonly<Omit<TransTextProps, "as">>) {
  return <TransText {...props} as="span" />;
}
