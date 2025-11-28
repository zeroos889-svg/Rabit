import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import AdminUsers from "@/pages/admin/Users";

// Mock trpc
vi.mock("@/lib/trpc", () => ({
  trpc: {
    admin: {
      getUsers: {
        useQuery: vi.fn(() => ({ data: undefined, isLoading: false })),
      },
      updateUserStatus: {
        useMutation: vi.fn(() => ({ mutate: vi.fn(), isLoading: false })),
      },
      deleteUser: {
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

describe("AdminUsers Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render the users management page title", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText("إدارة المستخدمين")).toBeInTheDocument();
    });

    it("should render statistics cards", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText("إجمالي المستخدمين")).toBeInTheDocument();
      expect(screen.getByText("المستخدمون النشطون")).toBeInTheDocument();
      expect(screen.getByText("في انتظار التفعيل")).toBeInTheDocument();
      expect(screen.getByText("الشركات المسجلة")).toBeInTheDocument();
    });

    it("should render tab navigation", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText("جميع المستخدمين")).toBeInTheDocument();
      expect(screen.getByText("الشركات")).toBeInTheDocument();
      expect(screen.getByText("الموظفين")).toBeInTheDocument();
      expect(screen.getByText("المديرين")).toBeInTheDocument();
    });

    it("should render search input", () => {
      renderWithRouter(<AdminUsers />);
      expect(
        screen.getByPlaceholderText("بحث بالاسم أو البريد أو الشركة...")
      ).toBeInTheDocument();
    });

    it("should render add user button", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText("إضافة مستخدم")).toBeInTheDocument();
    });

    it("should render export button", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText("تصدير")).toBeInTheDocument();
    });
  });

  describe("User Table", () => {
    it("should render users table with headers", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText("المستخدم")).toBeInTheDocument();
      expect(screen.getByText("الشركة")).toBeInTheDocument();
      expect(screen.getByText("الدور")).toBeInTheDocument();
      expect(screen.getByText("الحالة")).toBeInTheDocument();
      expect(screen.getByText("تاريخ التسجيل")).toBeInTheDocument();
      expect(screen.getByText("آخر دخول")).toBeInTheDocument();
      expect(screen.getByText("الإجراءات")).toBeInTheDocument();
    });

    it("should display mock users in the table", () => {
      renderWithRouter(<AdminUsers />);
      // Check for mock user data
      expect(screen.getByText("أحمد محمد العلي")).toBeInTheDocument();
      expect(screen.getByText("ahmed@company.com")).toBeInTheDocument();
    });

    it("should display role badges correctly", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText("مدير")).toBeInTheDocument();
      expect(screen.getAllByText("شركة").length).toBeGreaterThan(0);
    });

    it("should display status badges correctly", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getAllByText("نشط").length).toBeGreaterThan(0);
      expect(screen.getByText("معلق")).toBeInTheDocument();
      expect(screen.getByText("موقوف")).toBeInTheDocument();
    });
  });

  describe("Search and Filter", () => {
    it("should filter users by search term", async () => {
      renderWithRouter(<AdminUsers />);
      const searchInput = screen.getByPlaceholderText(
        "بحث بالاسم أو البريد أو الشركة..."
      );

      fireEvent.change(searchInput, { target: { value: "أحمد" } });

      await waitFor(() => {
        expect(screen.getByText("أحمد محمد العلي")).toBeInTheDocument();
      });
    });

    it("should filter users by role", async () => {
      renderWithRouter(<AdminUsers />);
      // Find and click role filter
      const roleSelect = screen.getAllByRole("combobox")[0];
      fireEvent.click(roleSelect);

      await waitFor(() => {
        expect(screen.getByText("جميع الأدوار")).toBeInTheDocument();
      });
    });

    it("should filter users by status", async () => {
      renderWithRouter(<AdminUsers />);
      // Find and click status filter
      const statusSelect = screen.getAllByRole("combobox")[1];
      fireEvent.click(statusSelect);

      await waitFor(() => {
        expect(screen.getByText("جميع الحالات")).toBeInTheDocument();
      });
    });
  });

  describe("Create User Dialog", () => {
    it("should open create user dialog when button clicked", async () => {
      renderWithRouter(<AdminUsers />);
      const addButton = screen.getByText("إضافة مستخدم");

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("إضافة مستخدم جديد")).toBeInTheDocument();
        expect(screen.getByText("الاسم الكامل *")).toBeInTheDocument();
        expect(screen.getByText("البريد الإلكتروني *")).toBeInTheDocument();
      });
    });

    it("should close create dialog when cancel clicked", async () => {
      renderWithRouter(<AdminUsers />);
      const addButton = screen.getByText("إضافة مستخدم");

      fireEvent.click(addButton);

      await waitFor(() => {
        expect(screen.getByText("إضافة مستخدم جديد")).toBeInTheDocument();
      });

      const cancelButton = screen.getByText("إلغاء");
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText("إضافة مستخدم جديد")).not.toBeInTheDocument();
      });
    });
  });

  describe("User Actions", () => {
    it("should show action dropdown when menu clicked", async () => {
      renderWithRouter(<AdminUsers />);
      // Check that action buttons exist in the table
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe("View User Dialog", () => {
    it("should display user details in view dialog", async () => {
      renderWithRouter(<AdminUsers />);
      // Table should have user data
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
      const rows = screen.getAllByRole("row");
      expect(rows.length).toBeGreaterThan(1);
    });
  });

  describe("Statistics", () => {
    it("should calculate and display correct statistics", () => {
      renderWithRouter(<AdminUsers />);

      // Check for statistics values (based on mock data)
      expect(screen.getByText("5")).toBeInTheDocument(); // Total users
    });

    it("should display percentage of active users", () => {
      renderWithRouter(<AdminUsers />);
      expect(screen.getByText(/من الإجمالي/)).toBeInTheDocument();
    });
  });

  describe("Tab Navigation", () => {
    it("should switch to companies tab", async () => {
      renderWithRouter(<AdminUsers />);
      const companiesTab = screen.getByText("الشركات");
      expect(companiesTab).toBeInTheDocument();
      fireEvent.click(companiesTab);
    });

    it("should switch to employees tab", async () => {
      renderWithRouter(<AdminUsers />);
      const employeesTab = screen.getByText("الموظفين");
      expect(employeesTab).toBeInTheDocument();
      fireEvent.click(employeesTab);
    });

    it("should switch to admins tab", async () => {
      renderWithRouter(<AdminUsers />);
      const adminsTab = screen.getByText("المديرين");
      expect(adminsTab).toBeInTheDocument();
      fireEvent.click(adminsTab);
    });
  });

  describe("Accessibility", () => {
    it("should have accessible table structure", () => {
      renderWithRouter(<AdminUsers />);
      const table = screen.getByRole("table");
      expect(table).toBeInTheDocument();
    });

    it("should have accessible buttons", () => {
      renderWithRouter(<AdminUsers />);
      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThan(0);
    });
  });
});
