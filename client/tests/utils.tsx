import { render } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import i18n from "@/lib/i18n";

type RenderOptions = {
  locale?: string;
};

export function renderWithProviders(
  ui: React.ReactElement,
  { locale = "ar" }: RenderOptions = {}
) {
  if (i18n.language !== locale) {
    void i18n.changeLanguage(locale);
  }

  return render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);
}
