import { memo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AnnouncementBarProps {
  readonly isArabic?: boolean;
  readonly messageAr?: string;
  readonly messageEn?: string;
  readonly primaryHref?: string;
  readonly primaryLabelAr?: string;
  readonly primaryLabelEn?: string;
  readonly secondaryHref?: string;
  readonly secondaryLabelAr?: string;
  readonly secondaryLabelEn?: string;
  readonly className?: string;
}

export const AnnouncementBar = memo(function AnnouncementBar({
  isArabic,
  messageAr = "عرض ترقية الربع: دعم مخصص مجاناً لأول شهر",
  messageEn = "Quarterly upgrade: Dedicated support free for the first month",
  primaryHref = "/pricing",
  primaryLabelAr = "استفد الآن",
  primaryLabelEn = "Claim offer",
  secondaryHref = "/contact",
  secondaryLabelAr = "تحدث مع خبير",
  secondaryLabelEn = "Talk to an expert",
  className = "",
}: AnnouncementBarProps) {
  const { i18n, t } = useTranslation();
  const isAr = typeof isArabic === "boolean" ? isArabic : i18n.language === "ar";

  const message = isAr ? messageAr : messageEn;
  const primaryLabel = isAr ? primaryLabelAr : primaryLabelEn;
  const secondaryLabel = isAr ? secondaryLabelAr : secondaryLabelEn;

  return (
    <section className={`bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white py-3 ${className}`}>
      <div className="container flex flex-col sm:flex-row items-center justify-between gap-3 text-sm md:text-base">
        <div className="flex items-center gap-2 font-semibold">
          <Sparkles className="w-4 h-4" />
          <span>{t("offer.special", message)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={primaryHref}>
            <Button size="sm" variant="secondary" className="text-amber-700 bg-white hover:bg-white/90">
              {t("offer.button", primaryLabel)}
            </Button>
          </Link>
          <Link href={secondaryHref}>
            <Button size="sm" variant="outline" className="text-white border-white hover:bg-white/10">
              {secondaryLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
});
