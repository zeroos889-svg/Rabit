import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Signup from "./Signup";
import { renderWithProviders } from "../../tests/utils";

const mockMutate = vi.hoisted(() => vi.fn());
const mockSignUpAnalytics = vi.hoisted(() => vi.fn());
const mockTrackPageView = vi.hoisted(() => vi.fn());
const mockToast = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}));
const mockSetLocation = vi.hoisted(() => vi.fn());

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

describe("Signup page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("tracks page view on mount", () => {
    renderWithProviders(<Signup />);
    expect(mockTrackPageView).toHaveBeenCalledWith(
      expect.objectContaining({
        page_path: "/signup",
      })
    );
  });

  it("submits valid form and triggers mutation and analytics", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Signup />);

    await user.click(screen.getByText("مستقل HR"));
    await user.type(screen.getByLabelText(/الاسم الكامل/), "  علي أحمد  ");
    await user.type(screen.getByLabelText(/رقم الجوال/), "0555555555");
    await user.type(screen.getByLabelText(/البريد الإلكتروني/), "user@test.com");
  await user.type(screen.getByLabelText(/^كلمة المرور/), "Passw0rd!");
  await user.type(screen.getByLabelText(/^تأكيد كلمة المرور/), "Passw0rd!");

    await user.click(screen.getByRole("checkbox", { name: /الشروط والأحكام/ }));
    await user.click(screen.getByRole("checkbox", { name: /سياسة الخصوصية/ }));
    await user.click(screen.getByRole("checkbox", { name: /سياسة الكوكيز/ }));

    await user.click(screen.getByRole("button", { name: /إنشاء الحساب/ }));

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

  it("keeps زر الإرسال معطلاً حتى تكتمل الحقول والموافقات", async () => {
    const user = userEvent.setup({ delay: null });
    renderWithProviders(<Signup />);

    const submitButton = screen.getByRole("button", { name: /إنشاء الحساب/ });
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/الاسم الكامل/), "ليان يوسف");
    expect(submitButton).toBeDisabled();

    await user.type(screen.getByLabelText(/رقم الجوال/), "0555555555");
    await user.type(screen.getByLabelText(/البريد الإلكتروني/), "l@test.com");
  await user.type(screen.getByLabelText(/^كلمة المرور/), "Passw0rd!");
  await user.type(screen.getByLabelText(/^تأكيد كلمة المرور/), "Passw0rd!");

    await user.click(screen.getByRole("checkbox", { name: /الشروط والأحكام/ }));
    await user.click(screen.getByRole("checkbox", { name: /سياسة الخصوصية/ }));
    await user.click(screen.getByRole("checkbox", { name: /سياسة الكوكيز/ }));

    await waitFor(() => expect(submitButton).toBeEnabled());
  });
});
