import { useEffect } from "react";

/**
 * ARIA Live Region Announcer
 * For screen reader announcements
 */
export class Announcer {
  private static instance: Announcer;
  private liveRegion: HTMLDivElement | null = null;

  private constructor() {
    this.createLiveRegion();
  }

  static getInstance(): Announcer {
    if (!Announcer.instance) {
      Announcer.instance = new Announcer();
    }
    return Announcer.instance;
  }

  private createLiveRegion() {
    if (typeof document === "undefined") return;

    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("role", "status");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "true");
    this.liveRegion.className = "sr-only";
    document.body.appendChild(this.liveRegion);
  }

  announce(message: string, priority: "polite" | "assertive" = "polite") {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute("aria-live", priority);
    this.liveRegion.textContent = "";

    // Small delay to ensure screen reader picks up the change
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = message;
      }
    }, 100);

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = "";
      }
    }, 3000);
  }
}

/**
 * Hook for announcing messages to screen readers
 */
export function useAnnouncer() {
  const announcer = Announcer.getInstance();

  return {
    announce: (message: string, priority?: "polite" | "assertive") =>
      announcer.announce(message, priority),
  };
}

/**
 * Add ARIA labels to common elements
 */
export function enhanceARIA() {
  // Add aria-label to links without text
  const links = document.querySelectorAll<HTMLAnchorElement>("a:not([aria-label])");
  for (const link of links) {
    if (!link.textContent?.trim()) {
      const title = link.getAttribute("title");
      if (title) {
        link.setAttribute("aria-label", title);
      }
    }
  }

  // Add aria-label to buttons without text
  const buttons = document.querySelectorAll<HTMLButtonElement>("button:not([aria-label])");
  for (const button of buttons) {
    if (!button.textContent?.trim()) {
      const title = button.getAttribute("title");
      if (title) {
        button.setAttribute("aria-label", title);
      }
    }
  }

  // Add role="img" to SVGs
  const svgs = document.querySelectorAll<SVGElement>("svg:not([role])");
  for (const svg of svgs) {
    svg.setAttribute("role", "img");
    if (!svg.hasAttribute("aria-label") && !svg.hasAttribute("aria-labelledby")) {
      svg.setAttribute("aria-hidden", "true");
    }
  }

  // Mark decorative images
  const images = document.querySelectorAll<HTMLImageElement>("img[alt='']");
  for (const img of images) {
    img.setAttribute("role", "presentation");
    img.setAttribute("aria-hidden", "true");
  }
}

/**
 * Hook to enhance ARIA attributes on mount
 */
export function useARIAEnhancer() {
  useEffect(() => {
    enhanceARIA();

    // Re-run on DOM changes
    const observer = new MutationObserver(() => {
      enhanceARIA();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);
}

/**
 * Get accessible name for an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-label
  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent || "";
  }

  // Check associated label
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent || "";
  }

  // Check title
  const title = element.getAttribute("title");
  if (title) return title;

  // Check alt text for images
  if (element instanceof HTMLImageElement) {
    return element.alt;
  }

  // Fallback to text content
  return element.textContent || "";
}

/**
 * Validate ARIA attributes
 */
interface ARIAValidationResult {
  element: HTMLElement;
  errors: string[];
  warnings: string[];
}

export function validateARIA(): ARIAValidationResult[] {
  const results: ARIAValidationResult[] = [];
  const elements = document.querySelectorAll<HTMLElement>("[role], [aria-label], [aria-labelledby]");

  for (const element of elements) {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for empty aria-label
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel !== null && !ariaLabel.trim()) {
      errors.push("Empty aria-label attribute");
    }

    // Check for invalid aria-labelledby
    const labelledBy = element.getAttribute("aria-labelledby");
    if (labelledBy) {
      const ids = labelledBy.split(" ");
      for (const id of ids) {
        if (!document.getElementById(id)) {
          errors.push(`aria-labelledby references non-existent ID: ${id}`);
        }
      }
    }

    // Check for required accessible name
    const role = element.getAttribute("role");
    const requiresName = ["button", "link", "img", "checkbox", "radio", "switch"];
    if (role && requiresName.includes(role)) {
      const name = getAccessibleName(element);
      if (!name) {
        errors.push(`Element with role="${role}" requires an accessible name`);
      }
    }

    // Check for interactive elements without accessible name
    if (element.tagName === "BUTTON" || element.tagName === "A") {
      const name = getAccessibleName(element);
      if (!name) {
        errors.push(`Interactive element without accessible name`);
      }
    }

    if (errors.length > 0 || warnings.length > 0) {
      results.push({ element, errors, warnings });
    }
  }

  return results;
}

/**
 * Hook to log ARIA validation errors in development
 */
export function useARIAValidation() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;

    const results = validateARIA();
    if (results.length > 0) {
      console.group("ARIA Validation Issues");
      for (const result of results) {
        console.group(result.element);
        if (result.errors.length > 0) {
          console.error("Errors:", result.errors);
        }
        if (result.warnings.length > 0) {
          console.warn("Warnings:", result.warnings);
        }
        console.groupEnd();
      }
      console.groupEnd();
    }
  }, []);
}
