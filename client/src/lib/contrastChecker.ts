/**
 * Contrast Checker Utility
 * Validates WCAG 2.1 color contrast ratios
 */

// WCAG 2.1 Standards
const WCAG_AA_NORMAL = 4.5;
const WCAG_AA_LARGE = 3;
const WCAG_AAA_NORMAL = 7;
const WCAG_AAA_LARGE = 4.5;

interface ContrastResult {
  ratio: number;
  passesAA: boolean;
  passesAAA: boolean;
  level: "AA" | "AAA" | "Fail";
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

/**
 * Calculate relative luminance
 * Formula: https://www.w3.org/TR/WCAG20-TECHS/G17.html
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * Formula: (L1 + 0.05) / (L2 + 0.05)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) {
    throw new Error("Invalid color format. Use hex colors (#RRGGBB)");
  }

  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG standards
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText: boolean = false
): ContrastResult {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? WCAG_AA_LARGE : WCAG_AA_NORMAL;
  const thresholdAAA = isLargeText ? WCAG_AAA_LARGE : WCAG_AAA_NORMAL;

  const passesAA = ratio >= threshold;
  const passesAAA = ratio >= thresholdAAA;

  let level: "AA" | "AAA" | "Fail" = "Fail";
  if (passesAAA) level = "AAA";
  else if (passesAA) level = "AA";

  return {
    ratio: Math.round(ratio * 100) / 100,
    passesAA,
    passesAAA,
    level,
  };
}

/**
 * Validate all color combinations in theme
 */
export interface ColorPair {
  name: string;
  foreground: string;
  background: string;
  isLargeText?: boolean;
}

export function validateThemeContrast(colorPairs: ColorPair[]): {
  passed: ColorPair[];
  failed: ColorPair[];
  results: Record<string, ContrastResult>;
} {
  const passed: ColorPair[] = [];
  const failed: ColorPair[] = [];
  const results: Record<string, ContrastResult> = {};

  colorPairs.forEach((pair) => {
    const result = checkContrast(
      pair.foreground,
      pair.background,
      pair.isLargeText
    );
    results[pair.name] = result;

    if (result.passesAA) {
      passed.push(pair);
    } else {
      failed.push(pair);
    }
  });

  return { passed, failed, results };
}

/**
 * Get suggested color adjustments for better contrast
 */
export function suggestBetterContrast(
  foreground: string,
  background: string,
  targetRatio: number = WCAG_AA_NORMAL
): string {
  const bgRgb = hexToRgb(background);
  if (!bgRgb) throw new Error("Invalid background color");

  const bgLum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
  const targetLum = targetRatio * (bgLum + 0.05) - 0.05;

  // Adjust foreground color to meet target ratio
  const adjustedLum = Math.max(0, Math.min(1, targetLum));
  
  // Convert luminance back to RGB (simplified)
  const adjustedColor = adjustedLum > bgLum ? "#FFFFFF" : "#000000";
  
  return adjustedColor;
}

/**
 * Check contrast for all interactive elements on page
 */
export function auditPageContrast(): ColorPair[] {
  const interactiveElements = document.querySelectorAll(
    "button, a, input, select, textarea, [role='button'], [role='link']"
  );

  const colorPairs: ColorPair[] = [];

  interactiveElements.forEach((element, index) => {
    const styles = globalThis.getComputedStyle(element);
    const foreground = rgbToHex(styles.color);
    const background = rgbToHex(styles.backgroundColor);

    if (foreground && background && background !== "#00000000") {
      colorPairs.push({
        name: `Element ${index + 1}: ${element.tagName}`,
        foreground,
        background,
        isLargeText: parseFloat(styles.fontSize) >= 18,
      });
    }
  });

  return colorPairs;
}

/**
 * Convert RGB to Hex
 */
function rgbToHex(rgb: string): string | null {
  const match = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (!match) return null;

  const [, r, g, b] = match;
  return `#${[r, g, b]
    .map((x) => {
      const hex = parseInt(x).toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("")}`;
}

/**
 * React hook for contrast checking
 */
import { useEffect, useState } from "react";

export function useContrastChecker(
  foreground: string,
  background: string,
  isLargeText: boolean = false
) {
  const [result, setResult] = useState<ContrastResult | null>(null);

  useEffect(() => {
    try {
      const contrastResult = checkContrast(foreground, background, isLargeText);
      setResult(contrastResult);
    } catch (error) {
      console.error("Contrast check error:", error);
      setResult(null);
    }
  }, [foreground, background, isLargeText]);

  return result;
}
