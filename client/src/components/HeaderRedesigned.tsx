import { memo, useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "wouter";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Menu,
  X,
  Moon,
  Sun,
  Languages,
  ChevronDown,
  User,
  LogOut,
  LayoutDashboard,
  Settings,
  Home,
  Calculator,
  Users,
  MessageSquare,
  CreditCard,
  BookOpen,
  HelpCircle,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Navigation Links Type
interface NavLink {
  href: string;
  label: string;
  icon: React.ElementType;
}

// Nav Link Component
const NavLinkItem = memo(function NavLinkItem({
  href,
  label,
  icon: Icon,
  isActive,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick}>
      <span
        className={`
          group flex items-center gap-2 px-4 py-2 rounded-xl
          transition-all duration-300 cursor-pointer
          ${isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary"
          }
        `}
      >
        <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-gray-400 group-hover:text-primary"} transition-colors`} />
        <span>{label}</span>
      </span>
    </Link>
  );
});

// Mobile Nav Link Component
const MobileNavLink = memo(function MobileNavLink({
  href,
  label,
  icon: Icon,
  isActive,
  onClose,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  isActive: boolean;
  onClose: () => void;
}) {
  return (
    <Link href={href} onClick={onClose}>
      <span
        className={`
          flex items-center gap-3 px-4 py-3 rounded-xl
          transition-all duration-300 cursor-pointer
          ${isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
          }
        `}
      >
        <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-gray-400"}`} />
        <span className="text-base">{label}</span>
      </span>
    </Link>
  );
});

export const HeaderRedesigned = memo(function HeaderRedesigned() {
  const { t, i18n } = useTranslation();
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const isArabic = i18n.language === "ar";

  // Check scroll position
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Initialize dark mode from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle("dark", newMode);
    localStorage.setItem("theme", newMode ? "dark" : "light");
  }, [isDarkMode]);

  // Toggle language
  const toggleLanguage = useCallback(() => {
    const newLang = isArabic ? "en" : "ar";
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = newLang;
    localStorage.setItem("language", newLang);
  }, [isArabic, i18n]);

  // Close mobile menu
  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  // Navigation links
  const navLinks: NavLink[] = [
    { href: "/", label: isArabic ? "الرئيسية" : "Home", icon: Home },
    { href: "/tools", label: isArabic ? "الأدوات" : "Tools", icon: Calculator },
    { href: "/consulting", label: isArabic ? "الاستشارات" : "Consulting", icon: Users },
    { href: "/pricing", label: isArabic ? "الأسعار" : "Pricing", icon: CreditCard },
    { href: "/blog", label: isArabic ? "المدونة" : "Blog", icon: BookOpen },
    { href: "/contact", label: isArabic ? "تواصل معنا" : "Contact", icon: MessageSquare },
  ];

  const isLinkActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all duration-300
        ${isScrolled
          ? "py-2 bg-white/80 dark:bg-gray-950/80 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20"
          : "py-4 bg-transparent"
        }
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer group">
              <div className={`
                relative p-2.5 rounded-xl
                bg-gradient-to-br from-primary via-purple-600 to-pink-600
                shadow-lg shadow-primary/30
                transition-transform duration-300
                group-hover:scale-105
              `}>
                <Building2 className="w-6 h-6 text-white" />
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  {isArabic ? "رابِط" : "Rabt"}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                  {isArabic ? "للموارد البشرية" : "HR Solutions"}
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLinkItem
                key={link.href}
                {...link}
                isActive={isLinkActive(link.href)}
              />
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleLanguage}
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              title={isArabic ? "Switch to English" : "التحويل للعربية"}
            >
              <Languages className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>

            {/* Dark Mode Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
              title={isDarkMode ? "Light Mode" : "Dark Mode"}
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </Button>

            {/* User Menu / Auth Buttons */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 max-w-[100px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
                  <div className="px-3 py-2 text-sm border-b border-gray-200 dark:border-gray-700 mb-2">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.email?.split("@")[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" />
                      <span>{isArabic ? "الملف الشخصي" : "Profile"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/company/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <LayoutDashboard className="w-4 h-4" />
                      <span>{isArabic ? "لوحة التحكم" : "Dashboard"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="w-4 h-4" />
                      <span>{isArabic ? "الإعدادات" : "Settings"}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-red-600 dark:text-red-400 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 me-2" />
                    <span>{isArabic ? "تسجيل الخروج" : "Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-xl">
                    {isArabic ? "تسجيل الدخول" : "Login"}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-xl bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white">
                    {isArabic ? "ابدأ مجاناً" : "Get Started"}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Trigger */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side={isArabic ? "right" : "left"}
                className="w-[85%] max-w-[350px] p-0 border-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl"
              >
                <div className="flex flex-col h-full">
                  {/* Mobile Header */}
                  <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-600">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {isArabic ? "رابِط" : "Rabt"}
                      </span>
                    </div>
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="rounded-xl">
                        <X className="w-5 h-5" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="space-y-1">
                      {navLinks.map((link) => (
                        <MobileNavLink
                          key={link.href}
                          {...link}
                          isActive={isLinkActive(link.href)}
                          onClose={closeMobileMenu}
                        />
                      ))}
                      
                      {/* Extra Links */}
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-800 mt-4">
                        <MobileNavLink
                          href="/about"
                          label={isArabic ? "من نحن" : "About"}
                          icon={Building2}
                          isActive={isLinkActive("/about")}
                          onClose={closeMobileMenu}
                        />
                        <MobileNavLink
                          href="/faq"
                          label={isArabic ? "الأسئلة الشائعة" : "FAQ"}
                          icon={HelpCircle}
                          isActive={isLinkActive("/faq")}
                          onClose={closeMobileMenu}
                        />
                      </div>
                    </div>
                  </nav>

                  {/* Mobile Footer / Auth */}
                  <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                    {user ? (
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">
                              {user.email?.split("@")[0]}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Link href="/profile" onClick={closeMobileMenu}>
                            <Button variant="outline" className="w-full rounded-xl">
                              <User className="w-4 h-4 me-2" />
                              {isArabic ? "الملف" : "Profile"}
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            className="w-full rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              logout();
                              closeMobileMenu();
                            }}
                          >
                            <LogOut className="w-4 h-4 me-2" />
                            {isArabic ? "خروج" : "Logout"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Link href="/login" onClick={closeMobileMenu}>
                          <Button variant="outline" className="w-full rounded-xl">
                            {isArabic ? "تسجيل الدخول" : "Login"}
                          </Button>
                        </Link>
                        <Link href="/signup" onClick={closeMobileMenu}>
                          <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-purple-600 text-white">
                            {isArabic ? "ابدأ مجاناً" : "Get Started"}
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
});

export default HeaderRedesigned;
