import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useTranslation } from "react-i18next";

export function RouteAnnouncer() {
  const [currentLocation] = useLocation();
  const { i18n } = useTranslation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const title = document.title || currentLocation || "";
    const isArabic = i18n.language === "ar";
    setMessage(
      isArabic ? `تم الانتقال إلى ${title}` : `Navigated to ${title}`
    );
  }, [currentLocation, i18n.language]);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
