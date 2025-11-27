/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Hoisted mocks - must be defined with vi.hoisted before vi.mock
const mockMutate = vi.hoisted(() => vi.fn());
const mockSignUpAnalytics = vi.hoisted(() => vi.fn());
const mockTrackPageView = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const mockSetLocation = vi.hoisted(() => vi.fn());

// Mock i18n - must be before component import
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, options?: any) => {
      const translations: Record<string, any> = {
        "signup.title": "إنشاء حساب جديد",
        "signup.subtitle": "ابدأ رحلتك مع مساعد الموارد البشرية الذكي",
        "signup.offer.special": "🎁 عرض خاص",
        "signup.accountType.label": "نوع الحساب",
        "signup.accountType.company.label": "شركة",
        "signup.accountType.company.desc": "إدارة الموظفين",
        "signup.accountType.freelancer.label": "مستقل HR",
        "signup.accountType.freelancer.desc": "مستشار موارد بشرية",
        "signup.accountType.employee.label": "موظف",
        "signup.accountType.employee.desc": "استخدام شخصي",
        "signup.accountType.note": "يمكنك التبديل لاحقاً",
        "signup.form.fullName.label": "الاسم الكامل *",
        "signup.form.fullName.placeholder": "أدخل اسمك الكامل",
        "signup.form.phone.label": "رقم الجوال *",
        "signup.form.phone.placeholder": "05xxxxxxxx",
        "signup.form.phone.hint": "تنسيق سعودي",
        "signup.form.email.label": "البريد الإلكتروني *",
        "signup.form.email.placeholder": "example@company.com",
        "signup.form.password.label": "كلمة المرور *",
        "signup.form.password.show": "إظهار",
        "signup.form.password.hide": "إخفاء",
        "signup.form.confirmPassword.label": "تأكيد كلمة المرور *",
        "signup.agreements.title": "الإقرارات الإلزامية",
        "signup.agreements.terms.prefix": "أوافق على",
        "signup.agreements.terms.link": "الشروط والأحكام",
        "signup.agreements.terms.suffix": "الخاصة بمنصة رابِط",
        "signup.agreements.privacy.prefix": "أوافق على",
        "signup.agreements.privacy.link": "سياسة الخصوصية",
        "signup.agreements.privacy.suffix": "وأفهم كيفية معالجة بياناتي",
        "signup.agreements.cookies.prefix": "أوافق على",
        "signup.agreements.cookies.link": "سياسة الكوكيز",
        "signup.agreements.cookies.suffix": "واستخدام ملفات تعريف الارتباط",
        "signup.submit.cta": "إنشاء الحساب",
        "signup.submit.loading": "جاري إنشاء الحساب...",
        "signup.validation.fullName": "الاسم يجب أن يكون 3 أحرف",
        "signup.validation.email": "البريد الإلكتروني غير صالح",
        "signup.validation.phone": "رقم الجوال غير صالح",
        "signup.validation.password": "كلمة المرور ضعيفة",
        "signup.validation.confirmPassword": "كلمتا المرور غير متطابقتين",
        "signup.toast.success": "تم إنشاء الحساب بنجاح",
        "signup.toast.error": "فشل في إنشاء الحساب",
        "signup.toast.agreementsRequired": "يرجى الموافقة على الإقرارات",
        "signup.toast.fixFields": "يرجى تصحيح الحقول",
        "signup.benefits.company.title": "مناسب للشركات",
        "signup.benefits.company.points": ["إدارة الموظفين", "لوحة تحكم"],
        "signup.benefits.freelancer.title": "للمستقلين",
        "signup.benefits.freelancer.points": ["تتبع العملاء", "مولد الخطابات"],
        "signup.benefits.employee.title": "للاستخدام الشخصي",
        "signup.benefits.employee.points": ["إدارة الإجازات", "سجل الرواتب"],
        "signup.readiness.title": "جاهزية الإرسال",
        "signup.readiness.requirements.basicInfo": "إكمال البيانات",
        "signup.readiness.requirements.strongPassword": "كلمة مرور قوية",
        "signup.readiness.requirements.matchingPasswords": "تطابق كلمة المرور",
        "signup.readiness.requirements.acceptPolicies": "الموافقة على الشروط",
        "signup.passwordStrength.labels.empty": "أدخل كلمة مرور",
        "signup.passwordStrength.labels.weak": "ضعيفة",
        "signup.passwordStrength.labels.medium": "متوسطة",
        "signup.passwordStrength.labels.good": "جيدة",
        "signup.passwordStrength.labels.strong": "قوية",
        "signup.passwordStrength.prefix": "قوة كلمة المرور",
        "signup.passwordStrength.hint": "استخدم أحرف وأرقام ورموز",
        "signup.social.divider": "أو التسجيل عبر",
        "signup.loginPrompt": "لديك حساب بالفعل؟",
        "signup.loginLink": "تسجيل الدخول",
      };
      
      if (options?.returnObjects && key.includes("points")) {
        return translations[key] || [];
      }
      return translations[key] || key;
    },
    i18n: { language: "ar", changeLanguage: vi.fn() },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("sonner", () => ({
  toast: mockToast,
}));

vi.mock("@/lib/analytics", () => ({
  default: {
    auth: { signUp: mockSignUpAnalytics },
    trackPageView: mockTrackPageView,
  },
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    auth: {
      register: {
        useMutation: (opts?: any) => ({
          mutate: (input: any) => {
            mockMutate(input);
            opts?.onSuccess?.(
              { user: { userType: "consultant" } },
              input,
              undefined
            );
            opts?.onSettled?.();
          },
          isLoading: false,
        }),
      },
    },
  },
}));

vi.mock("wouter", () => ({
  Link: ({ href, children }: any) => <a href={href}>{children}</a>,
  useLocation: () => ["/signup", mockSetLocation] as const,
}));

vi.mock("@/const", () => ({
  APP_LOGO: "/LOGO.svg",
  getLoginUrl: () => "/login",
}));

// Import component after mocks
import Signup from "./Signup";

describe("Signup page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tracks page view on mount", async () => {
    render(<Signup />);
    
    await waitFor(() => {
      expect(mockTrackPageView).toHaveBeenCalledWith(
        expect.objectContaining({
          page_path: "/signup",
        })
      );
    });
  });

  it("renders the signup form with all required fields", () => {
    render(<Signup />);

    // Check main elements are rendered
    expect(screen.getByText("إنشاء حساب جديد")).toBeInTheDocument();
    expect(screen.getByText("الاسم الكامل *")).toBeInTheDocument();
    expect(screen.getByText("رقم الجوال *")).toBeInTheDocument();
    expect(screen.getByText("البريد الإلكتروني *")).toBeInTheDocument();
    expect(screen.getByText("كلمة المرور *")).toBeInTheDocument();
    expect(screen.getByText("تأكيد كلمة المرور *")).toBeInTheDocument();
  });

  it("shows account type options", () => {
    render(<Signup />);

    expect(screen.getByText("شركة")).toBeInTheDocument();
    expect(screen.getByText("مستقل HR")).toBeInTheDocument();
    expect(screen.getByText("موظف")).toBeInTheDocument();
  });

  it("submit button is disabled when form is incomplete", () => {
    render(<Signup />);

    const submitButton = screen.getByRole("button", { name: /إنشاء الحساب/i });
    expect(submitButton).toBeDisabled();
  });

  it("submits form with valid data", async () => {
    const user = userEvent.setup({ delay: null });
    render(<Signup />);

    // Select freelancer account type
    await user.click(screen.getByText("مستقل HR"));

    // Fill form fields
    const nameInput = screen.getByPlaceholderText("أدخل اسمك الكامل");
    const phoneInput = screen.getByPlaceholderText("05xxxxxxxx");
    const emailInput = screen.getByPlaceholderText("example@company.com");
    const passwordInputs = screen.getAllByPlaceholderText("••••••••");

    await user.type(nameInput, "علي أحمد");
    await user.type(phoneInput, "0555555555");
    await user.type(emailInput, "user@test.com");
    await user.type(passwordInputs[0], "Passw0rd!");
    await user.type(passwordInputs[1], "Passw0rd!");

    // Accept agreements
    const checkboxes = screen.getAllByRole("checkbox");
    for (const checkbox of checkboxes) {
      await user.click(checkbox);
    }

    // Submit
    const submitButton = screen.getByRole("button", { name: /إنشاء الحساب/i });
    
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "علي أحمد",
          email: "user@test.com",
          phoneNumber: "0555555555",
          userType: "consultant",
        })
      );
    });

    expect(mockSignUpAnalytics).toHaveBeenCalledWith("email", "consultant");
    expect(mockToast.success).toHaveBeenCalled();
  });
});
