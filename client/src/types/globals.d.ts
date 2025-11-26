/**
 * Type declaration file for adding flexibility to strict TypeScript checks
 * while maintaining type safety in critical areas.
 * 
 * This file provides type declarations for third-party analytics and
 * monitoring scripts that inject themselves into the global scope.
 */

// Analytics global extensions
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: () => void;
    fbq?: () => void;
    [key: string]: unknown;
  }
  
  // Allow globalThis dynamic property access for analytics scripts
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const globalThis: typeof window & Record<string, any>;
}

export {};
