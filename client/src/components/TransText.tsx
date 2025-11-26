/**
 * TransText Component - Advanced Translation Component
 * مكون ترجمة متقدم مع دعم المتغيرات والتنسيق
 */

import React from "react";
import { useI18n } from "@/hooks/useI18n";

interface TransTextProps {
  /** Translation key / مفتاح الترجمة */
  tKey: string;
  /** Default text if translation not found / النص الافتراضي إذا لم توجد الترجمة */
  defaultText?: string;
  /** Variables to interpolate / المتغيرات للاستبدال */
  values?: Record<string, any>;
  /** HTML element to render / عنصر HTML للعرض */
  as?: keyof JSX.IntrinsicElements;
  /** CSS classes / الأنماط */
  className?: string;
  /** Whether to render as HTML / هل يتم العرض كـ HTML */
  html?: boolean;
  /** Fallback component if translation fails / مكون بديل عند الفشل */
  fallback?: React.ReactNode;
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
}: TransTextProps) {
  const { t } = useI18n();

  try {
    const translatedText = t(tKey, defaultText, values);

    if (html) {
      return (
        <Component
          className={className}
          dangerouslySetInnerHTML={{ __html: translatedText }}
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
export function TransParagraph(props: Omit<TransTextProps, "as">) {
  return <TransText {...props} as="p" />;
}

/**
 * Shorthand for TransText with <h1> tag
 * اختصار لـ TransText مع وسم <h1>
 */
export function TransHeading1(props: Omit<TransTextProps, "as">) {
  return <TransText {...props} as="h1" />;
}

/**
 * Shorthand for TransText with <h2> tag
 * اختصار لـ TransText مع وسم <h2>
 */
export function TransHeading2(props: Omit<TransTextProps, "as">) {
  return <TransText {...props} as="h2" />;
}

/**
 * Shorthand for TransText with <h3> tag
 * اختصار لـ TransText مع وسم <h3>
 */
export function TransHeading3(props: Omit<TransTextProps, "as">) {
  return <TransText {...props} as="h3" />;
}

/**
 * Shorthand for TransText with <button> text
 * اختصار لـ TransText مع نص زر
 */
export function TransButton(props: Omit<TransTextProps, "as">) {
  return <TransText {...props} as="span" />;
}
