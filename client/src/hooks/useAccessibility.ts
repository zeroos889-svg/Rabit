import { useEffect } from "react";
import { useLocation } from "wouter";

interface FocusManagerOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: string; // CSS selector
}

/**
 * Focus Management Hook
 * Manages focus for modals, dialogs, and navigation
 */
export function useFocusManagement(
  containerRef: React.RefObject<HTMLElement>,
  options: FocusManagerOptions = {}
) {
  const { trapFocus = false, restoreFocus = true, initialFocus } = options;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const previousFocus = document.activeElement as HTMLElement;

    // Set initial focus
    if (initialFocus) {
      const element = container.querySelector(initialFocus) as HTMLElement;
      element?.focus();
    }

    // Focus trap for modals/dialogs
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!trapFocus || e.key !== "Tab") return;

      const focusableElements = container.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    if (trapFocus) {
      container.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      if (trapFocus) {
        container.removeEventListener("keydown", handleKeyDown);
      }
      if (restoreFocus && previousFocus) {
        previousFocus.focus();
      }
    };
  }, [containerRef, trapFocus, restoreFocus, initialFocus]);
}

/**
 * Keyboard Navigation Hook
 * Handles custom keyboard shortcuts and navigation
 */
interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardNavigation(shortcuts: KeyboardShortcut[]) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchingShortcut = shortcuts.find(
        (shortcut) =>
          shortcut.key.toLowerCase() === e.key.toLowerCase() &&
          shortcut.ctrl === (e.ctrlKey || e.metaKey) &&
          shortcut.shift === e.shiftKey &&
          shortcut.alt === e.altKey
      );

      if (matchingShortcut) {
        e.preventDefault();
        matchingShortcut.action();
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    return () => globalThis.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

/**
 * Focus Visible Hook
 * Manages :focus-visible state for better keyboard navigation
 */
export function useFocusVisible() {
  useEffect(() => {
    let hadKeyboardEvent = true;
    let hadFocusVisibleRecentlyTimeout: number;

    const inputTypesAllowlist: Record<string, boolean> = {
      text: true,
      search: true,
      url: true,
      tel: true,
      email: true,
      password: true,
      number: true,
      date: true,
      month: true,
      week: true,
      time: true,
      datetime: true,
      "datetime-local": true,
    };

    function focusTriggersKeyboardModality(node: HTMLElement): boolean {
      const tagName = node.tagName;

      if (tagName === "INPUT") {
        const input = node as HTMLInputElement;
        return inputTypesAllowlist[input.type] && !input.readOnly;
      }

      if (tagName === "TEXTAREA") {
        const textarea = node as HTMLTextAreaElement;
        return !textarea.readOnly;
      }

      if (node.isContentEditable) {
        return true;
      }

      return false;
    }

    function addFocusVisibleClass(el: Element) {
      if (el.classList.contains("focus-visible")) {
        return;
      }
      el.classList.add("focus-visible");
      el.dispatchEvent(new CustomEvent("focus-visible-added"));
    }

    function removeFocusVisibleClass(el: Element) {
      if (!el.classList.contains("focus-visible")) {
        return;
      }
      el.classList.remove("focus-visible");
      el.dispatchEvent(new CustomEvent("focus-visible-removed"));
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.metaKey || e.altKey || e.ctrlKey) {
        return;
      }
      hadKeyboardEvent = true;
    }

    function onPointerDown() {
      hadKeyboardEvent = false;
    }

    function onFocus(e: FocusEvent) {
      if (!(e.target instanceof HTMLElement)) return;

      if (hadKeyboardEvent || focusTriggersKeyboardModality(e.target)) {
        addFocusVisibleClass(e.target);
      }
    }

    function onBlur(e: FocusEvent) {
      if (!(e.target instanceof HTMLElement)) return;

      if (e.target.classList.contains("focus-visible")) {
        globalThis.clearTimeout(hadFocusVisibleRecentlyTimeout);
        hadFocusVisibleRecentlyTimeout = globalThis.setTimeout(() => {
          // Focus was recently visible
        }, 100);
        removeFocusVisibleClass(e.target);
      }
    }

    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("mousedown", onPointerDown, true);
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("touchstart", onPointerDown, true);
    document.addEventListener("focus", onFocus, true);
    document.addEventListener("blur", onBlur, true);

    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("mousedown", onPointerDown, true);
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("touchstart", onPointerDown, true);
      document.removeEventListener("focus", onFocus, true);
      document.removeEventListener("blur", onBlur, true);
    };
  }, []);
}

/**
 * Route Focus Hook
 * Manages focus when navigating between routes
 */
export function useRouteFocus() {
  const [location] = useLocation();

  useEffect(() => {
    // Focus main content on route change
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.focus();
    }

    // Scroll to top on route change
    globalThis.scrollTo(0, 0);
  }, [location]);
}

/**
 * Accessible Modal Hook
 * Combines focus trap, initial focus, and restore focus
 */
export function useAccessibleModal(
  isOpen: boolean,
  onClose: () => void,
  containerRef: React.RefObject<HTMLElement>
) {
  useFocusManagement(containerRef, {
    trapFocus: isOpen,
    restoreFocus: true,
    initialFocus: "[data-autofocus]",
  });

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);
}
