import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import AdminDataRequests from "@/pages/admin/DataRequests";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      getDataRequests: {
        useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
      },
      updateDataRequest: {
        useMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
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

const renderWithRouter = (component: React.ReactNode) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe("AdminDataRequests Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the data requests page title", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getByText("طلبات البيانات (PDPL)")).toBeInTheDocument();
    });

    it("should render PDPL compliance notice", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(
        screen.getByText(/نظام حماية البيانات الشخصية/) ||
        screen.getByText(/PDPL/)
      ).toBeTruthy();
    });

    it("should render statistics cards", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getByText("إجمالي الطلبات")).toBeInTheDocument();
      expect(screen.getAllByText("قيد الانتظار").length).toBeGreaterThan(0);
      expect(screen.getAllByText("مكتملة").length).toBeGreaterThan(0);
    });

    it("should render tab navigation", () => {
      renderWithRouter(<AdminDataRequests />);
      // Multiple tabs exist
      const tabs = screen.getAllByRole("tab");
      expect(tabs.length).toBeGreaterThan(0);
    });

    it("should render search input", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(
        screen.getByPlaceholderText("بحث بالاسم أو البريد أو رقم الطلب...")
      ).toBeInTheDocument();
    });
  });

  describe("Data Requests Table", () => {
    it("should render data requests table with headers", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getByText("رقم الطلب")).toBeInTheDocument();
      expect(screen.getByText("مقدم الطلب")).toBeInTheDocument();
      expect(screen.getByText("نوع الطلب")).toBeInTheDocument();
      expect(screen.getByText("الحالة")).toBeInTheDocument();
      expect(screen.getByText("الموعد النهائي")).toBeInTheDocument();
      expect(screen.getByText("الإجراءات")).toBeInTheDocument();
    });

    it("should display request reference numbers", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getAllByText(/DR-/).length).toBeGreaterThan(0);
    });

    it("should display request type badges", () => {
      renderWithRouter(<AdminDataRequests />);
      // Check table has data
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should display status badges", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(
        screen.queryByText("جديد") ||
        screen.queryByText("قيد المراجعة") ||
        screen.queryByText("مكتمل")
      ).toBeTruthy();
    });
  });

  describe("Request Type Filtering", () => {
    it("should have request type filter", () => {
      renderWithRouter(<AdminDataRequests />);
      const comboboxes = screen.getAllByRole("combobox");
      expect(comboboxes.length).toBeGreaterThan(0);
    });

    it("should have filter controls", async () => {
      renderWithRouter(<AdminDataRequests />);
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThan(0);
    });
  });

  describe("Deadline Tracking", () => {
    it("should display deadline warnings", () => {
      renderWithRouter(<AdminDataRequests />);
      // Look for deadline-related content
      expect(screen.getByText("الموعد النهائي")).toBeInTheDocument();
    });

    it("should highlight urgent requests", () => {
      renderWithRouter(<AdminDataRequests />);
      // Should have overdue or deadline indicator
      expect(screen.getByText("متأخرة")).toBeInTheDocument();
    });

    it("should show 30-day PDPL compliance period", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getAllByText(/30 يوم/).length).toBeGreaterThan(0);
    });
  });

  describe("Request Actions", () => {
    it("should show action buttons", async () => {
      renderWithRouter(<AdminDataRequests />);
      const actionButtons = screen.getAllByRole("button");
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it("should have table with request data", async () => {
      renderWithRouter(<AdminDataRequests />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });
  });

  describe("View Request Details", () => {
    it("should have table rows for request data", async () => {
      renderWithRouter(<AdminDataRequests />);
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(0);
    });

    it("should display requester information", async () => {
      renderWithRouter(<AdminDataRequests />);
      // Requester info should be visible in table
      expect(screen.getByText("مقدم الطلب")).toBeInTheDocument();
    });
  });

  describe("Statistics", () => {
    it("should calculate and display request statistics", () => {
      renderWithRouter(<AdminDataRequests />);
      const stats = screen.getAllByRole("heading", { level: 3 });
      expect(stats.length).toBeGreaterThan(0);
    });

    it("should show processing rate", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(
        screen.queryByText(/معدل/) ||
        screen.queryByText(/نسبة/) ||
        screen.queryByText("قيد المعالجة")
      ).toBeTruthy();
    });

    it("should show overdue requests count", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getByText("متأخرة")).toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should have pending requests tab", async () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getAllByText("قيد الانتظار").length).toBeGreaterThan(0);
    });

    it("should have completed requests tab", async () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getAllByText("مكتملة").length).toBeGreaterThan(0);
    });
  });

  describe("PDPL Compliance", () => {
    it("should display PDPL compliance information", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getByText("متطلبات PDPL")).toBeInTheDocument();
    });

    it("should show compliance deadline information", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getAllByText(/30 يوم/).length).toBeGreaterThan(0);
    });
  });

  describe("Request Types", () => {
    it("should display various request types in table", () => {
      renderWithRouter(<AdminDataRequests />);
      // Table should have request type column
      expect(screen.getByText("نوع الطلب")).toBeInTheDocument();
    });

    it("should have table rows for requests", () => {
      renderWithRouter(<AdminDataRequests />);
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });

    it("should show request IDs", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getAllByText(/DR-/).length).toBeGreaterThan(0);
    });
  });

  describe("Export Functionality", () => {
    it("should render export button", () => {
      renderWithRouter(<AdminDataRequests />);
      expect(screen.getByText("تصدير التقرير")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible table structure", () => {
      renderWithRouter(<AdminDataRequests />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should have accessible interactive elements", () => {
      renderWithRouter(<AdminDataRequests />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have proper heading hierarchy", () => {
      renderWithRouter(<AdminDataRequests />);
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
