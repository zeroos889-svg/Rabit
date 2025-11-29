import { render, screen } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import ConsultingRedesigned from "@/pages/ConsultingRedesigned";

vi.mock("@/components/Footer", () => ({
  Footer: () => <div data-testid="footer" />,
}));

vi.mock("@/components/ConnectedPagesSection", () => ({
  ConnectedPagesSection: () => <div data-testid="connected-pages" />,
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "ar", changeLanguage: vi.fn() },
  }),
}));

describe("ConsultingRedesigned page", () => {
  it("renders SLA and quick FAQ sections with translation keys", () => {
    render(<ConsultingRedesigned />);

    expect(screen.getByText("consulting.sla.title")).toBeInTheDocument();
    expect(screen.getByText("consulting.faq.quick.title")).toBeInTheDocument();
    expect(screen.getByText("consulting.contact.title")).toBeInTheDocument();
  });
});
