export const colors = {
  brand: {
    skyLink: "#6AD4FF",
    azureCore: "#4F9DFF",
    royalChain: "#1F53FF",
    indigoWordmark: "#14238A",
  },
  neutrals: {
    surface: "#F5F7FB",
    card: "#FFFFFF",
    subtle: "#E2E8F0",
    textPrimary: "#0F172A",
    textSecondary: "#475569",
    divider: "rgba(15, 23, 42, 0.08)",
  },
  signals: {
    success: "#0EA5E9",
    positive: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#3B82F6",
  },
};

export const gradients = {
  primary: "linear-gradient(120deg, #6AD4FF 0%, #4F9DFF 40%, #1F53FF 100%)",
  secondary: "linear-gradient(135deg, #7C3AED 0%, #5B21B6 50%, #3B82F6 100%)",
  success: "linear-gradient(135deg, #34D399 0%, #059669 100%)",
  cardGlow: "radial-gradient(circle at top, rgba(79, 157, 255, 0.32), transparent 70%)",
};

export const layout = {
  sectionPadding: {
    desktop: "5rem 0",
    mobile: "3rem 0",
  },
  containerWidth: {
    desktop: "1280px",
    wide: "1344px",
  },
};

export const typography = {
  display: "clamp(2.5rem, 4vw, 3.5rem)",
  headline: "clamp(1.75rem, 3vw, 2.5rem)",
  subtitle: "1.125rem",
  body: "1rem",
  eyebrow: "0.85rem",
};

export const shadows = {
  card: "0 20px 60px rgba(20, 35, 138, 0.07)",
  glow: "0 25px 80px rgba(79, 157, 255, 0.35)",
};

export const metrics = {
  heroStats: [
    { label: "منشأة سعودية موثوقة", value: "+180", delta: "+26 هذا الربع" },
    { label: "التزام وزارة الموارد البشرية", value: "99.4%", delta: "تدقيق 2025" },
    { label: "متوسط إطلاق المنصة", value: "< 3 أيام", delta: "جاهزية فرقنا" },
  ],
  trustBadges: [
    { label: "متوافق مع منصة قوى", description: "API محدث" },
    { label: "جاهز لهيئة الزكاة والدخل", description: "توافق e-Invoice" },
    { label: "سعودة مدعومة", description: "لوحات قياس % التوطين" },
  ],
};
