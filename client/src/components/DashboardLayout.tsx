import { ReactNode } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
  userType?: string;
  title?: string;
}

export default function DashboardLayout({ children, userType = "company", title }: DashboardLayoutProps) {
  const menuItems = [
    {
      label: "لوحة التحكم",
      labelEn: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      label: "إدارة الموظفين",
      labelEn: "Employees",
      icon: Users,
      href: "/dashboard/employees",
    },
    {
      label: "نظام التوظيف",
      labelEn: "ATS",
      icon: Briefcase,
      href: "/dashboard/ats",
    },
    {
      label: "التذاكر",
      labelEn: "Tickets",
      icon: Ticket,
      href: "/dashboard/tickets",
    },
    {
      label: "المهام",
      labelEn: "Tasks",
      icon: CheckSquare,
      href: "/dashboard/tasks",
    },
    {
      label: "التقارير",
      labelEn: "Reports",
      icon: BarChart3,
      href: "/dashboard/reports",
    },
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
  ];

  return (
    <div className={cn("min-h-screen flex flex-col md:flex-row")}>
      <aside className="w-full md:w-64 bg-gradient-to-b from-blue-600 via-purple-600 to-purple-700 text-white p-4 space-y-4">
        <div className="mb-6">
          <h2 className="font-bold text-xl">رابِط HR</h2>
          <p className="text-xs opacity-75 mt-1">نظام الموارد البشرية</p>
        </div>
        
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <a className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors group">
                <item.icon className="w-5 h-5 opacity-75 group-hover:opacity-100" />
                <span className="text-sm font-medium opacity-90 group-hover:opacity-100">
                  {item.label}
                </span>
              </a>
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        {title && (
          <div className="mb-6 md:hidden">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h1>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}