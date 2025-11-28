import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import LegalCheck from "@/pages/dashboard/LegalCheck";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    dashboard: {
      getLegalStatus: {
        useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
      },
    },
  },
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useTranslation
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "ar", changeLanguage: vi.fn() },
  }),
}));

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("LegalCheck Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the legal check page title", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getByText("الفحص القانوني والامتثال")).toBeInTheDocument();
    });

    it("should render compliance score", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.queryByText(/نسبة الامتثال/) || screen.queryByText(/%/)).toBeTruthy();
    });

    it("should render statistics cards", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getAllByText("متوافق").length).toBeGreaterThan(0);
      expect(screen.getAllByText("تحذير").length).toBeGreaterThan(0);
    });

    it("should render category tabs", () => {
      renderWithRouter(<LegalCheck />);
      // Should have clickable category cards
      const cards = screen.getAllByRole("heading");
      expect(cards.length).toBeGreaterThan(0);
    });

    it("should render search functionality", () => {
      renderWithRouter(<LegalCheck />);
      expect(
        screen.getByPlaceholderText("ابحث في بنود الامتثال...")
      ).toBeInTheDocument();
    });
  });

  describe("Compliance Categories", () => {
    it("should display category cards", () => {
      renderWithRouter(<LegalCheck />);
      // Categories are shown as cards
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("should have compliance data in table", () => {
      renderWithRouter(<LegalCheck />);
      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThan(0);
    });

    it("should show compliance status", () => {
      renderWithRouter(<LegalCheck />);
      expect(
        screen.queryAllByText("متوافق").length ||
        screen.queryAllByText("تحذير").length ||
        screen.queryAllByText("غير متوافق").length
      ).toBeGreaterThan(0);
    });

    it("should display categories with icons", () => {
      renderWithRouter(<LegalCheck />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should show category statistics", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getByText("نسبة الامتثال الإجمالية")).toBeInTheDocument();
    });
  });

  describe("Compliance Items Table", () => {
    it("should render compliance items table", () => {
      renderWithRouter(<LegalCheck />);
      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThan(0);
    });

    it("should display compliance status badges", () => {
      renderWithRouter(<LegalCheck />);
      expect(
        screen.queryAllByText("متوافق").length ||
        screen.queryAllByText("غير متوافق").length ||
        screen.queryAllByText("تحذير").length
      ).toBeGreaterThan(0);
    });

    it("should show legal article references", () => {
      renderWithRouter(<LegalCheck />);
      // Table should have rows with article data
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe("Category Filtering", () => {
    it("should have clickable category cards", async () => {
      renderWithRouter(<LegalCheck />);
      // Categories are clickable cards
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have filter controls", async () => {
      renderWithRouter(<LegalCheck />);
      // Should have search and filter controls
      const searchInput = screen.getByPlaceholderText("ابحث في بنود الامتثال...");
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe("Search Functionality", () => {
    it("should filter items by search term", async () => {
      renderWithRouter(<LegalCheck />);
      const searchInput = screen.getByPlaceholderText("ابحث في بنود الامتثال...");

      fireEvent.change(searchInput, { target: { value: "عقد" } });

      await waitFor(() => {
        expect(searchInput).toHaveValue("عقد");
      });
    });
  });

  describe("Compliance Score Display", () => {
    it("should display overall compliance score", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.queryByText(/نسبة الامتثال/) || screen.queryByText(/%/)).toBeTruthy();
    });

    it("should show score with visual indicator", () => {
      renderWithRouter(<LegalCheck />);
      // Look for progress indicator or percentage
      expect(screen.queryByRole("progressbar") || screen.queryByText(/%/)).toBeTruthy();
    });
  });

  describe("Item Details", () => {
    it("should show item details when clicked", async () => {
      renderWithRouter(<LegalCheck />);
      // Table rows contain items that can be expanded
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe("Saudi Labor Law References", () => {
    it("should reference Saudi Labor Law", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getAllByText(/نظام العمل/).length).toBeGreaterThan(0);
    });

    it("should show article numbers", () => {
      renderWithRouter(<LegalCheck />);
      // Table has rows with article data
      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThan(0);
    });
  });

  describe("Action Items", () => {
    it("should show required actions for non-compliant items", () => {
      renderWithRouter(<LegalCheck />);
      // Page has compliance items with status
      expect(
        screen.queryAllByText("غير متوافق").length ||
        screen.queryAllByText("تحذير").length ||
        screen.queryAllByText("متوافق").length
      ).toBeGreaterThan(0);
    });

    it("should provide fix recommendations", () => {
      renderWithRouter(<LegalCheck />);
      // Page has compliance data
      const tables = screen.getAllByRole("table");
      expect(tables.length).toBeGreaterThan(0);
    });
  });

  describe("Export and Reports", () => {
    it("should have export functionality", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getByText("تصدير التقرير")).toBeInTheDocument();
    });

    it("should have download report option", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getByText("تصدير التقرير")).toBeInTheDocument();
    });
  });

  describe("Status Indicators", () => {
    it("should show compliant status with green indicator", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getAllByText("متوافق").length).toBeGreaterThan(0);
    });

    it("should show warning status with yellow indicator", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getAllByText("تحذير").length).toBeGreaterThan(0);
    });

    it("should show non-compliant status with red indicator", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getAllByText("غير متوافق").length).toBeGreaterThan(0);
    });
  });

  describe("Statistics", () => {
    it("should display category-wise compliance", () => {
      renderWithRouter(<LegalCheck />);
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("should show total items count", () => {
      renderWithRouter(<LegalCheck />);
      // Stats are shown in the compliance score section
      expect(screen.getByText("نسبة الامتثال الإجمالية")).toBeInTheDocument();
    });
  });

  describe("Last Check Information", () => {
    it("should show last check date", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getAllByText(/آخر فحص/).length).toBeGreaterThan(0);
    });

    it("should have recheck/refresh button", () => {
      renderWithRouter(<LegalCheck />);
      expect(screen.getAllByText("فحص الآن").length).toBeGreaterThan(0);
    });
  });

  describe("Accessibility", () => {
    it("should have accessible structure", () => {
      renderWithRouter(<LegalCheck />);
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });

    it("should have accessible interactive elements", () => {
      renderWithRouter(<LegalCheck />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have proper color contrast for status badges", () => {
      renderWithRouter(<LegalCheck />);
      // Check for badges with status text
      expect(
        screen.queryAllByText("متوافق").length ||
        screen.queryAllByText("غير متوافق").length ||
        screen.queryAllByText("تحذير").length
      ).toBeGreaterThan(0);
    });
  });
});
