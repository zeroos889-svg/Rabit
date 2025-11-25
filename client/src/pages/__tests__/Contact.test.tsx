// @ts-nocheck
/**
 * @vitest-environment jsdom
 */

import "@testing-library/jest-dom";
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Contact from "../Contact";

type MutationOptions = {
  onSuccess?: () => void;
  onError?: () => void;
};

const mutateSpy = vi.fn();
const mutationBehavior = { shouldError: false };
const mockUseMutation = vi.fn((options?: MutationOptions) => ({
  mutate: (variables: unknown) => {
    mutateSpy(variables);
    if (mutationBehavior.shouldError) {
      options?.onError?.(new Error("Failed"), variables, undefined);
      return;
    }
    options?.onSuccess?.({ id: "contact-req" }, variables, undefined);
  },
  isPending: false,
}));

vi.mock("@/lib/trpc", () => ({
  trpc: {
    contact: {
      submit: {
        useMutation: (options?: MutationOptions) => mockUseMutation(options),
      },
    },
  },
}));

const toastSuccess = vi.fn();
const toastError = vi.fn();

vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: (...args: unknown[]) => toastError(...args),
  },
}));

vi.mock("@/components/Map", () => ({
  MapView: ({ className }: { className?: string }) => (
    <div data-testid="map-view" className={className}>
      Map placeholder
    </div>
  ),
}));

const translations: Record<string, string> = {
  "contact.hero.badge": "رابِط معك على مدار الأسبوع",
  "contact.hero.title": "كلّم خبراء رابِط",
  "contact.hero.subtitle": "نرد خلال أقل من ساعة",
  "contact.hero.cta.primary": "احجز اتصال",
  "contact.hero.cta.secondary": "راسل الفريق",
  "contact.form.title": "ارسل رسالة لفريقنا",
  "contact.form.description": "سنرد خلال 30 دقيقة",
  "contact.form.fullName": "الاسم الكامل",
  "contact.form.email": "البريد الإلكتروني",
  "contact.form.phone": "رقم الجوال",
  "contact.form.company": "اسم الشركة",
  "contact.form.teamSize": "حجم الفريق",
  "contact.form.topic": "موضوع الرسالة",
  "contact.form.method": "طريقة التواصل المفضلة",
  "contact.form.hearAboutUs": "كيف سمعت عنا؟",
  "contact.form.hearAboutUs.placeholder": "مثال: تويتر",
  "contact.form.message": "نص الرسالة",
  "contact.form.submit": "إرسال الرسالة",
  "contact.form.sending": "جاري الإرسال",
  "contact.form.success": "تم الإرسال بنجاح",
  "contact.form.error": "حدث خطأ أثناء الإرسال",
  "contact.channels.title": "قنوات التواصل",
  "contact.channels.cta": "راسل الآن",
  "contact.channels.sales.title": "المبيعات",
  "contact.channels.sales.desc": "فريق العروض الخاصة",
  "contact.channels.support.title": "الدعم",
  "contact.channels.support.desc": "مساعدة فورية",
  "contact.channels.partnerships.title": "الشراكات",
  "contact.channels.partnerships.desc": "فرص التعاون",
  "contact.metric.response_time": "متوسط زمن الرد",
  "contact.metric.response_time_value": "30 دقيقة",
  "contact.metric.clients": "شركة موثوقة",
  "contact.metric.clients_value": "280+",
  "contact.metric.satisfaction": "معدل الرضا",
  "contact.metric.satisfaction_value": "4.9/5",
  "contact.metric.availability": "ساعات العمل",
  "contact.metric.availability_value": "9 ص - 9 م",
  "contact.faq.title": "الأسئلة الشائعة",
  "contact.faq.q1": "كيف يتم التواصل؟",
  "contact.faq.a1": "نتواصل عبر القنوات التي تختارها.",
  "contact.faq.q2": "هل يوجد دعم عربي؟",
  "contact.faq.a2": "نعم، فريقنا محلي.",
  "contact.faq.q3": "هل يمكن جدولة جلسة؟",
  "contact.faq.a3": "بالطبع.",
  "contact.topic.sales": "المبيعات",
  "contact.topic.support": "الدعم",
  "contact.topic.partnership": "الشراكات",
  "contact.topic.media": "الإعلام",
  "contact.topic.demo": "عرض تجريبي",
  "contact.topic.other": "أخرى",
  "contact.method.email": "البريد الإلكتروني",
  "contact.method.phone": "مكالمة هاتفية",
  "contact.method.whatsapp": "واتساب",
};

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string, defaultValue?: string) => translations[key] ?? defaultValue ?? key,
    i18n: {
      language: "ar",
      changeLanguage: vi.fn(),
    },
  }),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  mutationBehavior.shouldError = false;
});

describe("Contact page", () => {
  it("renders hero content, badge, metrics, and quick channels", () => {
    render(<Contact />);

    expect(screen.getByText("رابِط معك على مدار الأسبوع")).toBeInTheDocument();
    expect(screen.getByText("كلّم خبراء رابِط")).toBeInTheDocument();
    expect(screen.getByText("نرد خلال أقل من ساعة")).toBeInTheDocument();

  expect(screen.getAllByText("المبيعات")[0]).toBeInTheDocument();
  expect(screen.getAllByText("الدعم")[0]).toBeInTheDocument();
  expect(screen.getAllByText("الشراكات")[0]).toBeInTheDocument();

    expect(screen.getByRole("button", { name: "احجز اتصال" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "راسل الفريق" })).toBeInTheDocument();

    expect(screen.getByText("30 دقيقة")).toBeInTheDocument();
    expect(screen.getByText("280+")).toBeInTheDocument();
    expect(screen.getByText("4.9/5")).toBeInTheDocument();
    expect(screen.getByText("9 ص - 9 م")).toBeInTheDocument();
  });

  it("submits the form, normalizes optional fields, and shows a success toast", () => {
    render(<Contact />);

    fireEvent.change(screen.getByLabelText("الاسم الكامل"), {
      target: { value: "أحمد المطيري" },
    });
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني"), {
      target: { value: "ahmad@example.com" },
    });
    fireEvent.change(screen.getByLabelText("نص الرسالة"), {
      target: { value: "أحتاج إلى جلسة تعريفية" },
    });

    fireEvent.click(screen.getByRole("button", { name: "إرسال الرسالة" }));

    expect(mutateSpy).toHaveBeenCalledTimes(1);
    expect(mutateSpy).toHaveBeenCalledWith({
      fullName: "أحمد المطيري",
      email: "ahmad@example.com",
      phoneNumber: undefined,
      companyName: undefined,
      teamSize: "11-50",
      topic: "sales",
      message: "أحتاج إلى جلسة تعريفية",
      preferredContactMethod: "email",
      hearAboutUs: undefined,
      locale: "ar",
    });

    expect(toastSuccess).toHaveBeenCalledWith("تم الإرسال بنجاح");
    expect(toastError).not.toHaveBeenCalled();

    expect(screen.getByLabelText("الاسم الكامل")).toHaveValue("");
    expect(screen.getByLabelText("البريد الإلكتروني")).toHaveValue("");
    expect(screen.getByLabelText("نص الرسالة")).toHaveValue("");
  });

  it("surfaces submission errors without clearing the form", () => {
    mutationBehavior.shouldError = true;
    render(<Contact />);

    fireEvent.change(screen.getByLabelText("الاسم الكامل"), {
      target: { value: "ليان" },
    });
    fireEvent.change(screen.getByLabelText("البريد الإلكتروني"), {
      target: { value: "lian@example.com" },
    });
    fireEvent.change(screen.getByLabelText("نص الرسالة"), {
      target: { value: "أحتاج دعم" },
    });

    fireEvent.click(screen.getByRole("button", { name: "إرسال الرسالة" }));

    expect(mutateSpy).toHaveBeenCalledTimes(1);
    expect(toastError).toHaveBeenCalledWith("حدث خطأ أثناء الإرسال");
    expect(toastSuccess).not.toHaveBeenCalled();
    expect(screen.getByLabelText("الاسم الكامل")).toHaveValue("ليان");
  });
});
