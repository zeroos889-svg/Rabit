import { type ReactNode, useEffect, useState, useCallback, memo, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  Ticket,
  CheckSquare,
  BarChart3,
  Settings,
  FileText,
  ShieldCheck,
  Clock,
  Bell,
  Wrench,
  Menu,
  X,
  Brain,
  Calculator,
  BookOpen,
  GraduationCap,
  UserCheck,
  Target,
  MessageSquare,
  FileOutput,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Search,
  Moon,
  Sun,
  Command,
  HelpCircle,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ============================================================================
// Types
// ============================================================================

interface DashboardLayoutProps {
  readonly children: ReactNode;
  readonly userType?: "company" | "employee" | "consultant" | "admin";
  readonly title?: string;
}

interface MenuItem {
  label: string;
  labelEn: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  isNew?: boolean;
}

interface MenuSection {
  title: string;
  titleEn: string;
  items: MenuItem[];
}

// ============================================================================
// Menu Configuration
// ============================================================================

const COMPANY_MENU_SECTIONS: MenuSection[] = [
  {
    title: "الرئيسية",
    titleEn: "Main",
    items: [
      {
        label: "لوحة التحكم",
        labelEn: "Dashboard",
        icon: LayoutDashboard,
        href: "/dashboard",
      },
      {
        label: "التحليلات",
        labelEn: "Analytics",
        icon: BarChart3,
        href: "/dashboard/analytics",
      },
    ],
  },
  {
    title: "إدارة الموارد البشرية",
    titleEn: "HR Management",
    items: [
      {
        label: "الموظفين",
        labelEn: "Employees",
        icon: Users,
        href: "/dashboard/employees",
      },
      {
        label: "نظام التوظيف",
        labelEn: "ATS",
        icon: Briefcase,
        href: "/dashboard/ats",
        badge: "12",
        badgeVariant: "default",
      },
      {
        label: "المقابلات",
        labelEn: "Interviews",
        icon: UserCheck,
        href: "/dashboard/interviews",
      },
      {
        label: "تقييم الأداء",
        labelEn: "Performance",
        icon: Target,
        href: "/dashboard/performance",
      },
      {
        label: "التدريب",
        labelEn: "Training",
        icon: GraduationCap,
        href: "/dashboard/training",
      },
    ],
  },
  {
    title: "الذكاء الاصطناعي",
    titleEn: "AI Tools",
    items: [
      {
        label: "مساعد الذكاء الاصطناعي",
        labelEn: "AI Assistant",
        icon: Brain,
        href: "/ai",
        isNew: true,
      },
      {
        label: "الآلات الحاسبة",
        labelEn: "Calculators",
        icon: Calculator,
        href: "/calculators",
      },
      {
        label: "الأنظمة السعودية",
        labelEn: "Saudi Regulations",
        icon: BookOpen,
        href: "/regulations",
      },
    ],
  },
  {
    title: "الإدارة",
    titleEn: "Administration",
    items: [
      {
        label: "التذاكر",
        labelEn: "Tickets",
        icon: Ticket,
        href: "/dashboard/tickets",
        badge: "3",
        badgeVariant: "destructive",
      },
      {
        label: "المهام",
        labelEn: "Tasks",
        icon: CheckSquare,
        href: "/dashboard/tasks",
      },
      {
        label: "الرسائل",
        labelEn: "Messaging",
        icon: MessageSquare,
        href: "/dashboard/messaging",
      },
      {
        label: "التقارير",
        labelEn: "Reports",
        icon: FileText,
        href: "/dashboard/reports",
      },
      {
        label: "تصدير التقارير",
        labelEn: "Export Reports",
        icon: FileOutput,
        href: "/dashboard/reports-export",
      },
    ],
  },
  {
    title: "النظام",
    titleEn: "System",
    items: [
      {
        label: "الشهادات",
        labelEn: "Certificates",
        icon: FileText,
        href: "/dashboard/certificates",
      },
      {
        label: "المراجعة القانونية",
        labelEn: "Legal Check",
        icon: ShieldCheck,
        href: "/dashboard/legal-check",
      },
      {
        label: "التذكيرات",
        labelEn: "Reminders",
        icon: Clock,
        href: "/dashboard/reminders",
      },
      {
        label: "الإشعارات",
        labelEn: "Notifications",
        icon: Bell,
        href: "/dashboard/notifications",
      },
      {
        label: "الأدوات",
        labelEn: "Tools",
        icon: Wrench,
        href: "/dashboard/tools",
      },
      {
        label: "الإعدادات",
        labelEn: "Settings",
        icon: Settings,
        href: "/dashboard/settings",
      },
    ],
  },
];

// ============================================================================
// Helper Functions
// ============================================================================

function getUserTypeConfig(userType: string): { title: string; titleEn: string; gradient: string } {
  switch (userType) {
    case "employee":
      return {
        title: "لوحة الموظف",
        titleEn: "Employee Dashboard",
        gradient: "from-emerald-600 via-teal-600 to-cyan-700",
      };
    case "consultant":
      return {
        title: "لوحة المستشار",
        titleEn: "Consultant Dashboard",
        gradient: "from-amber-600 via-orange-600 to-red-700",
      };
    case "admin":
      return {
        title: "لوحة الإدارة",
        titleEn: "Admin Dashboard",
        gradient: "from-violet-600 via-purple-600 to-fuchsia-700",
      };
    default:
      return {
        title: "لوحة الشركة",
        titleEn: "Company Dashboard",
        gradient: "from-blue-600 via-indigo-600 to-purple-700",
      };
  }
}

// ============================================================================
// Sub-Components
// ============================================================================

// Navigation Item Component
const NavItem = memo(function NavItem({
  item,
  isActive,
  isCollapsed,
  isArabic,
  onClick,
}: {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  isArabic: boolean;
  onClick?: () => void;
}) {
  const Icon = item.icon;
  const label = isArabic ? item.label : item.labelEn;

  const content = (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
        isActive
          ? "bg-white/20 text-white shadow-lg shadow-black/10"
          : "text-white/70 hover:text-white hover:bg-white/10"
      )}
      aria-current={isActive ? "page" : undefined}
    >
      {/* Active indicator */}
      {isActive && (
        <span
          className={cn(
            "absolute h-8 w-1 rounded-full bg-white",
            isArabic ? "-right-3" : "-left-3"
          )}
        />
      )}

      <Icon
        className={cn(
          "h-5 w-5 transition-transform duration-200",
          isActive ? "scale-110" : "group-hover:scale-105"
        )}
        aria-hidden="true"
      />

      {!isCollapsed && (
        <>
          <span className="flex-1 text-sm font-medium truncate">
            {label}
          </span>

          {/* Badges */}
          {item.badge && (
            <Badge
              variant={item.badgeVariant || "secondary"}
              className="h-5 min-w-5 px-1.5 text-xs font-medium"
            >
              {item.badge}
            </Badge>
          )}

          {item.isNew && (
            <Badge className="h-5 px-1.5 text-xs bg-gradient-to-r from-amber-500 to-orange-500 border-0">
              <Sparkles className="h-3 w-3 me-1" />
              جديد
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side={isArabic ? "left" : "right"} className="flex items-center gap-2">
          {label}
          {item.badge && (
            <Badge variant={item.badgeVariant || "secondary"} className="h-5">
              {item.badge}
            </Badge>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
});

// Navigation Section Component
const NavSection = memo(function NavSection({
  section,
  isCollapsed,
  isArabic,
  location,
  onItemClick,
}: {
  section: MenuSection;
  isCollapsed: boolean;
  isArabic: boolean;
  location: string;
  onItemClick?: () => void;
}) {
  return (
    <div className="space-y-1">
      {!isCollapsed && (
        <h3 className="px-3 mb-2 text-xs font-semibold text-white/50 uppercase tracking-wider">
          {isArabic ? section.title : section.titleEn}
        </h3>
      )}
      <nav className="space-y-1">
        {section.items.map((item) => (
          <NavItem
            key={item.href}
            item={item}
            isActive={location?.startsWith(item.href) || false}
            isCollapsed={isCollapsed}
            isArabic={isArabic}
            onClick={onItemClick}
          />
        ))}
      </nav>
    </div>
  );
});

// Search Command Dialog
function SearchDialog({
  open,
  onOpenChange,
  isArabic,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isArabic: boolean;
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = useMemo(
    () => COMPANY_MENU_SECTIONS.flatMap((section) => section.items),
    []
  );

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems.slice(0, 5);
    const query = searchQuery.toLowerCase();
    return allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(query) ||
        item.labelEn.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            {isArabic ? "البحث السريع" : "Quick Search"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder={isArabic ? "ابحث عن صفحة أو أداة..." : "Search for a page or tool..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12"
            autoFocus
          />
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {isArabic ? item.label : item.labelEn}
                  </span>
                </Link>
              );
            })}
            {filteredItems.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                {isArabic ? "لا توجد نتائج" : "No results found"}
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// User Profile Dropdown
function UserProfileDropdown({ isArabic }: { isArabic: boolean }) {
  const { user, logout } = useAuth();

  const userInitials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
    : "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border-2 border-primary/20 hover:border-primary/40 transition-colors"
        >
          <Avatar className="h-9 w-9">
            <AvatarImage src={user?.profileImage || undefined} alt={user?.fullName || "User"} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-semibold">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align={isArabic ? "start" : "end"}>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.fullName || "المستخدم"}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || "user@example.com"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard/profile" className="flex items-center gap-2 cursor-pointer">
            <User className="h-4 w-4" />
            {isArabic ? "الملف الشخصي" : "Profile"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer">
            <Settings className="h-4 w-4" />
            {isArabic ? "الإعدادات" : "Settings"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/help" className="flex items-center gap-2 cursor-pointer">
            <HelpCircle className="h-4 w-4" />
            {isArabic ? "المساعدة" : "Help"}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => logout()}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="h-4 w-4 me-2" />
          {isArabic ? "تسجيل الخروج" : "Logout"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export default function DashboardLayoutRedesigned({
  children,
  userType = "company",
  title,
}: Readonly<DashboardLayoutProps>) {
  const [location] = useLocation();
  const { t, i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  
  // State
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  // User type configuration
  const userTypeConfig = getUserTypeConfig(userType);

  // Close mobile nav on location change
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      // Cmd/Ctrl + B for sidebar toggle
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setIsDarkMode((prev) => {
      const newValue = !prev;
      document.documentElement.classList.toggle("dark", newValue);
      return newValue;
    });
  }, []);

  // Accessibility labels
  const navLabel = t("dashboard.nav", { defaultValue: "التنقل داخل لوحة التحكم" });
  const skipContentLabel = t("dashboard.skipContent", { defaultValue: "تخطي إلى المحتوى" });
  const mainLabel = t("dashboard.main", { defaultValue: "المحتوى الرئيسي للوحة التحكم" });
  const navId = "dashboard-primary-nav";

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-50 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900"
        dir={isArabic ? "rtl" : "ltr"}
      >
        {/* Skip to content link */}
        <a
          href="#dashboard-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:start-4 focus:z-[60] rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-lg"
        >
          {skipContentLabel}
        </a>

        {/* Search Dialog */}
        <SearchDialog open={isSearchOpen} onOpenChange={setIsSearchOpen} isArabic={isArabic} />

        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between border-b border-border/40 bg-background/80 backdrop-blur-xl px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileNavOpen((prev) => !prev)}
              aria-expanded={isMobileNavOpen}
              aria-controls={navId}
              className="hover:bg-primary/10"
            >
              {isMobileNavOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </Button>
            <div>
              <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                رابِط HR
              </p>
              {(title || userType) && (
                <span className="text-xs text-muted-foreground">
                  {title || (isArabic ? userTypeConfig.title : userTypeConfig.titleEn)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSearchOpen(true)}
              className="hover:bg-primary/10"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="hover:bg-primary/10"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <UserProfileDropdown isArabic={isArabic} />
          </div>
        </header>

        <div className="flex">
          {/* Sidebar */}
          <aside
            id={navId}
            aria-label={navLabel}
            className={cn(
              // Base styles
              "fixed lg:sticky top-0 h-screen z-50 lg:z-0 transition-all duration-300",
              // Background gradient
              `bg-gradient-to-b ${userTypeConfig.gradient}`,
              // Shadow
              "shadow-xl shadow-black/10",
              // Width transitions
              isCollapsed ? "lg:w-20" : "lg:w-72",
              // Mobile visibility
              isMobileNavOpen
                ? "translate-x-0 w-72"
                : isArabic
                ? "translate-x-full lg:translate-x-0"
                : "-translate-x-full lg:translate-x-0",
              // Position
              isArabic ? "right-0" : "left-0"
            )}
          >
            {/* Sidebar Header */}
            <div
              className={cn(
                "flex items-center h-16 px-4 border-b border-white/10",
                isCollapsed ? "justify-center" : "justify-between"
              )}
            >
              {!isCollapsed && (
                <Link href="/" className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">ر</span>
                  </div>
                  <div>
                    <h2 className="font-bold text-white">رابِط HR</h2>
                    <p className="text-xs text-white/60">
                      {isArabic ? "نظام الموارد البشرية" : "HR System"}
                    </p>
                  </div>
                </Link>
              )}

              {/* Collapse Toggle - Desktop only */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed((prev) => !prev)}
                className="hidden lg:flex h-8 w-8 text-white/70 hover:text-white hover:bg-white/10"
              >
                {isCollapsed ? (
                  isArabic ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )
                ) : isArabic ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </div>

            {/* Search Button */}
            {!isCollapsed && (
              <div className="p-4">
                <Button
                  variant="ghost"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-full justify-start gap-3 h-11 bg-white/10 hover:bg-white/20 text-white/70 hover:text-white border border-white/10"
                >
                  <Search className="h-4 w-4" />
                  <span className="text-sm">{isArabic ? "بحث سريع..." : "Quick search..."}</span>
                  <kbd className="ms-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[10px] font-medium text-white/50">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </div>
            )}

            {/* Navigation */}
            <div className={cn("flex-1 overflow-y-auto px-3 py-4 space-y-6", isCollapsed && "px-2")}>
              {COMPANY_MENU_SECTIONS.map((section) => (
                <NavSection
                  key={section.title}
                  section={section}
                  isCollapsed={isCollapsed}
                  isArabic={isArabic}
                  location={location}
                  onItemClick={() => setIsMobileNavOpen(false)}
                />
              ))}
            </div>

            {/* Sidebar Footer */}
            {!isCollapsed && (
              <div className="p-4 border-t border-white/10">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/10">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <Command className="h-5 w-5 text-white/70" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/60">
                      {isArabic ? "اختصارات لوحة المفاتيح" : "Keyboard shortcuts"}
                    </p>
                    <p className="text-xs text-white/40">⌘K {isArabic ? "للبحث" : "to search"}</p>
                  </div>
                </div>
              </div>
            )}
          </aside>

          {/* Mobile Overlay */}
          {isMobileNavOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsMobileNavOpen(false)}
              aria-hidden="true"
            />
          )}

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col min-h-screen">
            {/* Desktop Top Bar */}
            <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-30">
              {/* Breadcrumb / Title */}
              <div className="flex items-center gap-4">
                {title && (
                  <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                {/* Quick Search */}
                <Button
                  variant="outline"
                  onClick={() => setIsSearchOpen(true)}
                  className="w-64 justify-start text-muted-foreground hidden xl:flex"
                >
                  <Search className="h-4 w-4 me-2" />
                  <span className="text-sm">{isArabic ? "بحث سريع..." : "Quick search..."}</span>
                  <kbd className="ms-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>

                {/* Search Icon for smaller screens */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className="xl:hidden hover:bg-primary/10"
                >
                  <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-0.5 -end-0.5 h-4 w-4 rounded-full bg-red-500 text-[10px] text-white flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Theme Toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleDarkMode}
                  className="hover:bg-primary/10"
                >
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </Button>

                {/* User Profile */}
                <UserProfileDropdown isArabic={isArabic} />
              </div>
            </header>

            {/* Page Content */}
            <main
              id="dashboard-content"
              tabIndex={-1}
              aria-label={mainLabel}
              className="flex-1 p-4 lg:p-6 focus-visible:outline-none"
            >
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t border-border/40 bg-background/80 py-4 px-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
                <p>
                  © {new Date().getFullYear()} رابِط HR.{" "}
                  {isArabic ? "جميع الحقوق محفوظة" : "All rights reserved"}
                </p>
                <div className="flex items-center gap-4">
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    {isArabic ? "سياسة الخصوصية" : "Privacy Policy"}
                  </Link>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    {isArabic ? "الشروط والأحكام" : "Terms of Service"}
                  </Link>
                  <Link href="/help" className="hover:text-foreground transition-colors">
                    {isArabic ? "المساعدة" : "Help"}
                  </Link>
                </div>
              </div>
            </footer>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
