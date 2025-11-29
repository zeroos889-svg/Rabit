import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Search,
  FileText,
  Users,
  Calendar,
  Settings,
  BarChart3,
  MessageSquare,
  Briefcase,
  Clock,
  ArrowRight,
  Command,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: "page" | "employee" | "document" | "report" | "setting" | "action";
  href: string;
  icon: React.ElementType;
  keywords: string[];
}

const SEARCH_DATA: SearchResult[] = [
  // Pages
  {
    id: "dashboard",
    title: "Dashboard",
    titleAr: "لوحة التحكم",
    description: "Main dashboard overview",
    descriptionAr: "نظرة عامة على لوحة التحكم",
    category: "page",
    href: "/dashboard",
    icon: BarChart3,
    keywords: ["home", "main", "الرئيسية", "لوحة"],
  },
  {
    id: "employees",
    title: "Employees",
    titleAr: "الموظفين",
    description: "Manage all employees",
    descriptionAr: "إدارة جميع الموظفين",
    category: "page",
    href: "/dashboard/employees",
    icon: Users,
    keywords: ["staff", "team", "فريق", "موظف"],
  },
  {
    id: "reports",
    title: "Reports",
    titleAr: "التقارير",
    description: "View and generate reports",
    descriptionAr: "عرض وإنشاء التقارير",
    category: "page",
    href: "/dashboard/reports",
    icon: FileText,
    keywords: ["analytics", "statistics", "إحصائيات", "تحليل"],
  },
  {
    id: "calendar",
    title: "Calendar",
    titleAr: "التقويم",
    description: "Schedule and events",
    descriptionAr: "الجدول والأحداث",
    category: "page",
    href: "/dashboard/reminders",
    icon: Calendar,
    keywords: ["schedule", "events", "جدول", "مواعيد"],
  },
  {
    id: "settings",
    title: "Settings",
    titleAr: "الإعدادات",
    description: "Application settings",
    descriptionAr: "إعدادات التطبيق",
    category: "page",
    href: "/dashboard/settings",
    icon: Settings,
    keywords: ["preferences", "config", "تفضيلات", "ضبط"],
  },
  {
    id: "tickets",
    title: "Support Tickets",
    titleAr: "تذاكر الدعم",
    description: "View and manage support tickets",
    descriptionAr: "عرض وإدارة تذاكر الدعم",
    category: "page",
    href: "/dashboard/tickets",
    icon: MessageSquare,
    keywords: ["support", "help", "دعم", "مساعدة"],
  },
  {
    id: "tasks",
    title: "Tasks",
    titleAr: "المهام",
    description: "Task management",
    descriptionAr: "إدارة المهام",
    category: "page",
    href: "/dashboard/tasks",
    icon: Briefcase,
    keywords: ["todo", "work", "عمل", "مهمة"],
  },
  // Actions
  {
    id: "add-employee",
    title: "Add New Employee",
    titleAr: "إضافة موظف جديد",
    description: "Create a new employee record",
    descriptionAr: "إنشاء سجل موظف جديد",
    category: "action",
    href: "/dashboard/employees?action=add",
    icon: Users,
    keywords: ["create", "new", "إنشاء", "جديد"],
  },
  {
    id: "generate-report",
    title: "Generate Report",
    titleAr: "إنشاء تقرير",
    description: "Create a new report",
    descriptionAr: "إنشاء تقرير جديد",
    category: "action",
    href: "/dashboard/reports?action=generate",
    icon: FileText,
    keywords: ["create", "export", "تصدير", "إنشاء"],
  },
  {
    id: "attendance",
    title: "Attendance",
    titleAr: "الحضور والانصراف",
    description: "View attendance records",
    descriptionAr: "عرض سجلات الحضور",
    category: "page",
    href: "/dashboard/attendance",
    icon: Clock,
    keywords: ["time", "check-in", "وقت", "تسجيل"],
  },
];

const CATEGORY_LABELS: Record<string, { en: string; ar: string }> = {
  page: { en: "Pages", ar: "الصفحات" },
  employee: { en: "Employees", ar: "الموظفين" },
  document: { en: "Documents", ar: "المستندات" },
  report: { en: "Reports", ar: "التقارير" },
  setting: { en: "Settings", ar: "الإعدادات" },
  action: { en: "Actions", ar: "الإجراءات" },
};

export interface GlobalSearchProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function GlobalSearch({ open: controlledOpen, onOpenChange: controlledOnOpenChange }: GlobalSearchProps = {}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Internal state for uncontrolled mode
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const open = controlledOpen ?? internalOpen;
  const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

  const filteredResults = SEARCH_DATA.filter((item) => {
    if (!query) return true;
    const searchLower = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(searchLower) ||
      item.titleAr.includes(query) ||
      item.description.toLowerCase().includes(searchLower) ||
      item.descriptionAr.includes(query) ||
      item.keywords.some((k) => k.toLowerCase().includes(searchLower))
    );
  });

  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const flatResults = Object.values(groupedResults).flat();

  const handleSelect = useCallback((result: SearchResult) => {
    setLocation(result.href);
    onOpenChange(false);
    setQuery("");
  }, [setLocation, onOpenChange]);

  useEffect(() => {
    if (open) {
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < flatResults.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatResults.length - 1
          );
          break;
        case "Enter":
          e.preventDefault();
          if (flatResults[selectedIndex]) {
            handleSelect(flatResults[selectedIndex]);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, flatResults, selectedIndex, handleSelect]);

  // Keyboard shortcut to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  return (
    <>
      {/* Search Trigger Button */}
      <Button
        variant="outline"
        className="relative h-9 w-full justify-start rounded-md bg-background text-sm text-muted-foreground sm:pr-12 md:w-40 lg:w-64"
        onClick={() => onOpenChange(true)}
      >
        <Search className="me-2 h-4 w-4 shrink-0" />
        <span className="hidden lg:inline-flex">
          {isArabic ? "بحث..." : "Search..."}
        </span>
        <kbd className="pointer-events-none absolute left-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      {/* Search Dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl p-0 gap-0">
          <DialogHeader className="p-4 pb-0">
            <DialogTitle className="sr-only">
              {isArabic ? "البحث الشامل" : "Global Search"}
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex items-center border-b px-4 py-3">
            <Search className="h-5 w-5 text-muted-foreground shrink-0" />
            <Input
              ref={inputRef}
              value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder={isArabic ? "ابحث عن أي شيء..." : "Search anything..."}
            className="border-0 focus-visible:ring-0 text-lg"
            dir={isArabic ? "rtl" : "ltr"}
          />
          <Badge variant="outline" className="shrink-0 gap-1">
            <Command className="h-3 w-3" />K
          </Badge>
        </div>

        <ScrollArea className="max-h-[400px]">
          {Object.entries(groupedResults).map(([category, items]) => (
            <div key={category} className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                {isArabic
                  ? CATEGORY_LABELS[category]?.ar
                  : CATEGORY_LABELS[category]?.en}
              </div>
              {items.map((result) => {
                const Icon = result.icon;
                const isSelected =
                  flatResults.indexOf(result) === selectedIndex;
                return (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-start transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <div
                      className={cn(
                        "p-2 rounded-lg",
                        isSelected ? "bg-primary/20" : "bg-muted"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {isArabic ? result.titleAr : result.title}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {isArabic ? result.descriptionAr : result.description}
                      </div>
                    </div>
                    <ArrowRight
                      className={cn(
                        "h-4 w-4 shrink-0 transition-opacity",
                        isSelected ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </button>
                );
              })}
            </div>
          ))}

          {flatResults.length === 0 && (
            <div className="py-12 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>{isArabic ? "لا توجد نتائج" : "No results found"}</p>
              <p className="text-sm mt-1">
                {isArabic
                  ? "جرب كلمات بحث مختلفة"
                  : "Try different search terms"}
              </p>
            </div>
          )}
        </ScrollArea>

        <div className="border-t p-3 flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↓</kbd>
              {isArabic ? "للتنقل" : "to navigate"}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
              {isArabic ? "للاختيار" : "to select"}
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">esc</kbd>
              {isArabic ? "للإغلاق" : "to close"}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}

export default GlobalSearch;
