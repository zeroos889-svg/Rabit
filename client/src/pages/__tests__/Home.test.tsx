/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import Home from "../Home";

const mockConsultationQuery = vi.fn();
const mockGetLoginUrl = vi.fn(() => "https://example.com/login");

const translations: Record<string, string> = {
  "offer.special": "عرض شهر مجاني",
  "offer.description": "احصل على شهر مجاني عند الاشتراك الآن",
  "offer.button": "جرّب مجاناً",
  "nav.home": "الرئيسية",
  "nav.consulting": "الاستشارات",
  "nav.courses": "الدورات",
  "nav.knowledge_base": "قاعدة المعرفة",
  "nav.tools": "الأدوات",
  "nav.pricing": "الأسعار",
  "nav.about": "من نحن",
  "nav.contact": "اتصل بنا",
  "btn.login": "تسجيل الدخول",
  "btn.start_free": "ابدأ مجاناً",
  "hero.badge": "حل الموارد البشرية الشامل",
  "hero.title": "منصة رابِط",
  "hero.description": "إدارة الموارد البشرية من مكان واحد",
  "hero.watch_demo": "مشاهدة العرض",
  "hero.watch_demo.desc": "شاهد العرض التوضيحي داخل الصفحة أو خارجه",
  "hero.stats.companies": "شركة",
  "hero.stats.users": "مستخدم",
  "hero.stats.satisfaction": "رضا",
  "categories.title": "لمن هذه المنصة",
  "categories.subtitle": "حلول متنوعة تناسب الشركات والأفراد",
  "category.companies": "الشركات",
  "category.individual": "أخصائي الموارد البشرية",
  "category.employee": "الموظفين",
  "how.title": "كيف تعمل رابِط؟",
  "how.subtitle": "خطوات سهلة",
  "tools.title": "أدوات الموارد البشرية الذكية",
  "tools.subtitle": "أدوات عملية لليوم اليومي",
  "tools.end_of_service": "حاسبة نهاية الخدمة",
  "tools.end_of_service.desc": "احسب مكافأة نهاية الخدمة",
  "tools.vacation": "حاسبة الإجازات",
  "tools.vacation.desc": "احسب رصيد الإجازات",
  "tools.letter_generator": "مولد الخطابات الذكي",
  "tools.letter_generator.desc": "أنشئ خطابات فورية",
  "tools.smart_form_generator.title": "مولد النماذج الذكي",
  "tools.smart_form_generator.desc": "إنشاء نماذج HR بسهولة",
  "tools.certificates.title": "مولد الشهادات",
  "tools.certificates.desc": "أصدر شهادات العمل",
  "tools.reports.title": "التقارير الذكية",
  "tools.reports.desc": "تقارير جاهزة",
  "tools.try_now": "جرّب الآن",
  "tools.all_tools": "عرض جميع الأدوات",
  "features.title": "مزايا المنصة",
  "testimonials.title": "آراء العملاء",
  "testimonials.subtitle": "قصص نجاح حقيقية",
  "testimonials.cta": "شاهد المزيد",
  "partners.title": "شركاؤنا",
  "partners.subtitle": "يثق بنا الكثير",
  "partners.stat1.label": "عميل",
  "partners.stat2.label": "مستخدم",
  "partners.stat3.label": "رضا",
  "partners.stat4.label": "دعم",
  "learning.title": "تعلّم وتطور",
  "learning.subtitle": "مسارات تعليمية",
  "learning.courses.title": "دورات مباشرة",
  "learning.courses.desc": "تعلم مع خبراء",
  "learning.courses.cta": "استعراض الدورات",
  "learning.courses.benefit1": "جلسات تفاعلية",
  "learning.courses.benefit2": "تطبيق عملي",
  "learning.courses.benefit3": "شهادات حضور",
  "learning.knowledge.title": "قاعدة المعرفة",
  "learning.knowledge.desc": "مقالات ونماذج",
  "learning.knowledge.cta": "تصفح المقالات",
  "learning.knowledge.benefit1": "مقالات محدثة",
  "learning.knowledge.benefit2": "قوالب جاهزة",
  "learning.knowledge.benefit3": "إرشادات قانونية",
  "cta.final.title": "جاهز للبدء؟",
  "cta.final.subtitle": "انطلق في إدارة الموارد البشرية بسهولة",
  "cta.final.start": "ابدأ الآن",
  "cta.final.contact": "تحدث مع خبير",
  "faq.title": "الأسئلة الشائعة",
  "faq.subtitle": "إجابات سريعة",
  "faq.category.general": "عام",
  "faq.category.account": "الحساب",
  "faq.category.billing": "الفوترة",
  "faq.category.usage": "الاستخدام",
  "faq.category.security": "الأمان",
};

vi.mock("@/lib/trpc", () => ({
  trpc: {
    consultant: {
      getConsultationTypes: {
        useQuery: (...args: unknown[]) => mockConsultationQuery(...args),
      },
    },
  },
}));

vi.mock("@/const", () => ({
  APP_LOGO: "/LOGO.svg",
  APP_TITLE: "رابِط",
  TRIAL_MESSAGE: "الوصول الكامل بدون بطاقة",
  IS_TRIAL_MODE: true,
  getLoginUrl: () => mockGetLoginUrl(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) =>
      translations[key] ?? defaultValue ?? key,
    i18n: {
      language: "ar",
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children: unknown }) => children as any,
}));

describe("Home page", () => {
  beforeEach(() => {
    mockConsultationQuery.mockReturnValue({
      data: { types: [] },
      isLoading: false,
    });
    mockGetLoginUrl.mockClear();
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    document.head.innerHTML = "";
    localStorage.clear();
    document.documentElement.dir = "rtl";
  });

  it("renders the hero and main navigation", async () => {
    render(<Home />);

    // Wait for component to fully render with increased timeout
    await vi.waitFor(() => {
      expect(screen.getByRole("banner")).toBeInTheDocument();
    }, { timeout: 10000 });

    const header = screen.getByRole("banner");
    const labels = ["الرئيسية", "الاستشارات", "الدورات", "قاعدة المعرفة", "الأدوات", "الأسعار"];
    for (const label of labels) {
      expect(within(header).getAllByRole("link", { name: label }).length).toBeGreaterThan(0);
    }

    expect(screen.getByText("حل الموارد البشرية الشامل")).toBeInTheDocument();
    expect(screen.getByText("منصة رابِط")).toBeInTheDocument();
    expect(screen.getAllByText("ابدأ مجاناً").length).toBeGreaterThan(0);
    expect(screen.getByText("لمن هذه المنصة")).toBeInTheDocument();
    expect(screen.getByText("حلول متنوعة تناسب الشركات والأفراد")).toBeInTheDocument();
  }, 15000);

  it("opens and closes the mobile menu", () => {
    render(<Home />);

    const header = screen.getByRole("banner");
    const menuToggle = screen.getByLabelText("فتح القائمة");
    expect(within(header).queryByText("اتصل بنا")).not.toBeInTheDocument();

    fireEvent.click(menuToggle);
    expect(within(header).getByText("اتصل بنا")).toBeInTheDocument();
    expect(within(header).getByText("من نحن")).toBeInTheDocument();

    fireEvent.click(menuToggle);
    expect(within(header).queryByText("اتصل بنا")).not.toBeInTheDocument();
  });

  it("renders consultation types when data is available", () => {
    mockConsultationQuery.mockReturnValue({
      data: {
        types: [
          {
            id: "type-1",
            nameAr: "استشارة التزام",
            descriptionAr: "تفاصيل حول الامتثال",
            price: 200,
            duration: 45,
          },
          {
            id: "type-2",
            nameAr: "استشارة توظيف",
            descriptionAr: "مراجعة عمليات التوظيف",
            price: 180,
            duration: 30,
          },
        ],
      },
      isLoading: false,
    });

    render(<Home />);

    expect(screen.getByText("استشارة التزام")).toBeInTheDocument();
    expect(screen.getByText("45 دقيقة")).toBeInTheDocument();
    expect(screen.getByText("200 ر.س")).toBeInTheDocument();
    expect(screen.getByText("استشارة توظيف")).toBeInTheDocument();
    expect(screen.getAllByText("احجز الآن")).toHaveLength(2);
    expect(screen.getByText("عرض جميع الاستشارات")).toBeInTheDocument();
  });

  it("shows a loading placeholder while consultation types are loading", () => {
    mockConsultationQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    render(<Home />);

    expect(screen.getByText("جاري التحميل...")).toBeInTheDocument();
    expect(screen.queryByText("احجز الآن")).not.toBeInTheDocument();
  });

  it("adds prefetch links for common routes and cleans them up on unmount", () => {
    const { unmount } = render(<Home />);

    const hrefs = Array.from(document.head.querySelectorAll("link[rel='prefetch']")).map(
      link => link.getAttribute("href") || ""
    );

    const routes = ["/consulting/book-new", "/consulting/experts", "/pricing", "/signup"];
    for (const route of routes) {
      expect(hrefs.some(href => href.endsWith(route))).toBe(true);
    }
    expect(hrefs).toHaveLength(4);

    unmount();
    expect(document.head.querySelectorAll("link[rel='prefetch']").length).toBe(0);
  });

  it("opens the demo video modal when requested", () => {
    render(<Home />);

    fireEvent.click(screen.getByText("مشاهدة العرض"));
    expect(screen.getByText(/Vimeo ID: 906999651/)).toBeInTheDocument();
  });

  it("shows key tools and final call-to-action sections", () => {
    render(<Home />);

    const toolsSection = screen.getByText("أدوات الموارد البشرية الذكية").closest("section");
    expect(toolsSection).toBeInTheDocument();
    if (!toolsSection) throw new Error("Tools section not found");

    expect(within(toolsSection).getAllByText("حاسبة نهاية الخدمة").length).toBeGreaterThan(0);
    expect(within(toolsSection).getByText("حاسبة الإجازات")).toBeInTheDocument();
    expect(within(toolsSection).getByText("مولد الخطابات الذكي")).toBeInTheDocument();
    expect(within(toolsSection).getByText("عرض جميع الأدوات")).toBeInTheDocument();

    expect(screen.getByText("جاهز للبدء؟")).toBeInTheDocument();
    expect(screen.getByText("انطلق في إدارة الموارد البشرية بسهولة")).toBeInTheDocument();
  });

  it("applies RTL by default and switches to LTR when stored locale is English", () => {
    render(<Home />);
    expect(document.documentElement.dir).toBe("rtl");

    cleanup();
    localStorage.setItem("rabithr:locale", "en");
    render(<Home />);
    expect(document.documentElement.dir).toBe("ltr");
  });

  it("redirects to login when clicking start buttons", () => {
    render(<Home />);
    const startButtons = screen.getAllByText("ابدأ مجاناً");

    startButtons[0].click();

    expect(mockGetLoginUrl).toHaveBeenCalled();
    expect(globalThis.location.href).toContain("https://example.com/login");
  });
});
