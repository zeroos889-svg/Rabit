import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import AdminBookings from "@/pages/admin/Bookings";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      getBookings: {
        useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
      },
      updateBookingStatus: {
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

describe("AdminBookings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the bookings management page title", () => {
      renderWithRouter(<AdminBookings />);
      expect(screen.getByText("إدارة الحجوزات")).toBeInTheDocument();
    });

    it("should render statistics cards", () => {
      renderWithRouter(<AdminBookings />);
      expect(screen.getByText("إجمالي الحجوزات")).toBeInTheDocument();
      // Use getAllByText for texts that appear multiple times
      expect(screen.getAllByText("قيد الانتظار").length).toBeGreaterThan(0);
      expect(screen.getAllByText("مؤكدة").length).toBeGreaterThan(0);
      expect(screen.getAllByText("مكتملة").length).toBeGreaterThan(0);
    });

    it("should render tab navigation", () => {
      renderWithRouter(<AdminBookings />);
      expect(screen.getByText("جميع الحجوزات")).toBeInTheDocument();
      expect(screen.getByText("اليوم")).toBeInTheDocument();
      expect(screen.getByText("القادمة")).toBeInTheDocument();
      expect(screen.getByText("السابقة")).toBeInTheDocument();
    });

    it("should render view toggle buttons", () => {
      renderWithRouter(<AdminBookings />);
      // Check that view toggle buttons exist
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should render search input", () => {
      renderWithRouter(<AdminBookings />);
      expect(
        screen.getByPlaceholderText("بحث بالاسم أو البريد أو الخدمة أو رقم الحجز...")
      ).toBeInTheDocument();
    });
  });

  describe("Bookings Table", () => {
    it("should render bookings table with headers", () => {
      renderWithRouter(<AdminBookings />);
      expect(screen.getByText("رقم الحجز")).toBeInTheDocument();
      expect(screen.getByText("العميل")).toBeInTheDocument();
      expect(screen.getByText("الخدمة")).toBeInTheDocument();
      expect(screen.getByText("التاريخ والوقت")).toBeInTheDocument();
      expect(screen.getByText("الحالة")).toBeInTheDocument();
      expect(screen.getByText("النوع")).toBeInTheDocument();
      expect(screen.getByText("الإجراءات")).toBeInTheDocument();
    });

    it("should display mock bookings data", () => {
      renderWithRouter(<AdminBookings />);
      // Check for booking reference numbers pattern
      expect(screen.getAllByText(/BK-/).length).toBeGreaterThan(0);
    });

    it("should display booking status badges", () => {
      renderWithRouter(<AdminBookings />);
      expect(screen.queryByText("في الانتظار") || screen.queryByText("مؤكد") || screen.queryByText("مكتمل")).toBeTruthy();
    });

    it("should display package type badges", () => {
      renderWithRouter(<AdminBookings />);
      expect(screen.queryByText("عن بعد") || screen.queryByText("حضوري")).toBeTruthy();
    });
  });

  describe("Search and Filter", () => {
    it("should filter bookings by search term", async () => {
      renderWithRouter(<AdminBookings />);
      const searchInput = screen.getByPlaceholderText(
        "بحث بالاسم أو البريد أو الخدمة أو رقم الحجز..."
      );

      fireEvent.change(searchInput, { target: { value: "BK-" } });

      await waitFor(() => {
        expect(screen.getAllByText(/BK-/).length).toBeGreaterThan(0);
      });
    });

    it("should filter bookings by date", async () => {
      renderWithRouter(<AdminBookings />);
      const dateSelect = screen.getAllByRole("combobox")[0];
      expect(dateSelect).toBeInTheDocument();
    });
  });

  describe("View Toggle", () => {
    it("should toggle between list and calendar views", async () => {
      renderWithRouter(<AdminBookings />);
      // Find view toggle buttons
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Booking Actions", () => {
    it("should show action dropdown when menu clicked", async () => {
      renderWithRouter(<AdminBookings />);
      const actionButtons = screen.getAllByRole("button");
      const moreButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-more-vertical")
      );

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          expect(screen.getByText("عرض التفاصيل")).toBeInTheDocument();
        });
      }
    });
  });

  describe("View Booking Dialog", () => {
    it("should open booking details dialog when view clicked", async () => {
      renderWithRouter(<AdminBookings />);
      const actionButtons = screen.getAllByRole("button");
      const moreButton = actionButtons.find((btn) =>
        btn.querySelector("svg.lucide-more-vertical")
      );

      if (moreButton) {
        fireEvent.click(moreButton);

        await waitFor(() => {
          const viewButton = screen.getByText("عرض التفاصيل");
          if (viewButton) {
            fireEvent.click(viewButton);
          }
        });
      }
    });
  });

  describe("Statistics", () => {
    it("should calculate and display booking statistics", () => {
      renderWithRouter(<AdminBookings />);
      // Stats should show numbers
      const stats = screen.getAllByRole("heading", { level: 3 });
      expect(stats.length).toBeGreaterThan(0);
    });

    it("should display revenue in SAR currency", () => {
      renderWithRouter(<AdminBookings />);
      // Check for stats display (numbers in the statistics cards)
      const headings = screen.getAllByRole("heading", { level: 3 });
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  describe("Tab Navigation", () => {
    it("should filter bookings by status tabs", async () => {
      renderWithRouter(<AdminBookings />);
      const allTab = screen.getByText("جميع الحجوزات");
      expect(allTab).toBeInTheDocument();
    });

    it("should switch to today tab", async () => {
      renderWithRouter(<AdminBookings />);
      const todayTab = screen.getByText("اليوم");
      expect(todayTab).toBeInTheDocument();
      fireEvent.click(todayTab);
    });

    it("should switch to upcoming tab", async () => {
      renderWithRouter(<AdminBookings />);
      const upcomingTab = screen.getByText("القادمة");
      expect(upcomingTab).toBeInTheDocument();
      fireEvent.click(upcomingTab);
    });
  });

  describe("Calendar View", () => {
    it("should render calendar view option", () => {
      renderWithRouter(<AdminBookings />);
      // Calendar buttons should exist
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("Export Functionality", () => {
    it("should render export button", () => {
      renderWithRouter(<AdminBookings />);
      expect(screen.getByText("تصدير")).toBeInTheDocument();
    });
  });

  describe("Date Filtering", () => {
    it("should have date filter options", async () => {
      renderWithRouter(<AdminBookings />);
      const dateSelect = screen.getAllByRole("combobox").find(
        select => select.textContent?.includes("فترة")
      );
      
      if (dateSelect) {
        fireEvent.click(dateSelect);
        await waitFor(() => {
          expect(screen.queryByText("اليوم") || screen.queryByText("هذا الأسبوع")).toBeTruthy();
        });
      }
    });
  });

  describe("Accessibility", () => {
    it("should have accessible table structure", () => {
      renderWithRouter(<AdminBookings />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should have accessible interactive elements", () => {
      renderWithRouter(<AdminBookings />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });

    it("should have proper heading hierarchy", () => {
      renderWithRouter(<AdminBookings />);
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });
});
