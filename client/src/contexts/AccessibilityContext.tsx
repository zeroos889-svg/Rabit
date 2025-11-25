import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface AccessibilityContextValue {
  reducedMotion: boolean;
  toggleReducedMotion: () => void;
  setReducedMotion: (value: boolean) => void;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(
  null
);

const STORAGE_KEY = "rabithr:reduced-motion";

function getInitialPreference() {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === "true";
    }
  } catch {
    // ignore storage failures
  }

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [reducedMotion, setReducedMotion] = useState<boolean>(() =>
    getInitialPreference()
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (event: MediaQueryListEvent) => {
      setReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle(
        "reduce-motion",
        reducedMotion
      );
    }

    try {
      if (typeof window !== "undefined") {
        window.localStorage.setItem(STORAGE_KEY, String(reducedMotion));
      }
    } catch {
      // ignore storage failures
    }
  }, [reducedMotion]);

  const toggleReducedMotion = useCallback(() => {
    setReducedMotion(prev => !prev);
  }, []);

  const value = useMemo(
    () => ({ reducedMotion, toggleReducedMotion, setReducedMotion }),
    [reducedMotion, toggleReducedMotion]
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within an AccessibilityProvider"
    );
  }
  return context;
}
