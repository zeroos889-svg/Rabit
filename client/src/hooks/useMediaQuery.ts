import { useState, useEffect } from "react";

/**
 * Hook to detect media query changes
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const isDesktop = useMediaQuery("(min-width: 1024px)");
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (globalThis.window !== undefined) {
      return globalThis.matchMedia(query).matches;
    }
    return false;
  });

  useEffect(() => {
    if (globalThis.window === undefined) return;

    const mediaQuery = globalThis.matchMedia(query);

    // Update state
    setMatches(mediaQuery.matches);

    // Listen for changes
    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Use modern addEventListener API
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [query]);

  return matches;
}

/**
 * Breakpoint constants (Tailwind CSS defaults)
 */
export const breakpoints = {
  sm: "(min-width: 640px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 1024px)",
  xl: "(min-width: 1280px)",
  "2xl": "(min-width: 1536px)",
} as const;

/**
 * Helper function to determine current breakpoint
 */
function getCurrentBreakpoint(
  is2Xl: boolean,
  isXl: boolean,
  isLg: boolean,
  isMd: boolean,
  isSm: boolean
): "2xl" | "xl" | "lg" | "md" | "sm" | "xs" {
  if (is2Xl) return "2xl";
  if (isXl) return "xl";
  if (isLg) return "lg";
  if (isMd) return "md";
  if (isSm) return "sm";
  return "xs";
}

/**
 * Predefined hooks for common breakpoints
 */
export function useBreakpoint() {
  const isSm = useMediaQuery(breakpoints.sm);
  const isMd = useMediaQuery(breakpoints.md);
  const isLg = useMediaQuery(breakpoints.lg);
  const isXl = useMediaQuery(breakpoints.xl);
  const is2Xl = useMediaQuery(breakpoints["2xl"]);

  // Determine current breakpoint
  const current = getCurrentBreakpoint(is2Xl, isXl, isLg, isMd, isSm);

  return {
    isSm,
    isMd,
    isLg,
    isXl,
    is2Xl,
    current,
    // Convenience flags
    isMobile: !isMd, // < 768px
    isTablet: isMd && !isLg, // 768px - 1024px
    isDesktop: isLg, // >= 1024px
  };
}

/**
 * Hook to detect touch device
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(false);

  useEffect(() => {
    if (globalThis.window === undefined) return;

    const hasTouchScreen =
      "ontouchstart" in globalThis ||
      navigator.maxTouchPoints > 0 ||
      // Legacy IE support
      ("msMaxTouchPoints" in navigator && (navigator as unknown as { msMaxTouchPoints: number }).msMaxTouchPoints > 0);

    setIsTouch(hasTouchScreen);
  }, []);

  return isTouch;
}
