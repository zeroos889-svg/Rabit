import { memo } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  Send,
  ArrowUp,
  Sparkles,
  Calculator,
  Users,
  BookOpen,
  CreditCard,
  HelpCircle,
  MessageSquare,
  FileText,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Footer Link Component
const FooterLink = memo(function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href}>
      <span className="text-gray-400 hover:text-white transition-colors duration-300 cursor-pointer text-sm">
        {children}
      </span>
    </Link>
  );
});

// Footer Column Component
const FooterColumn = memo(function FooterColumn({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-white font-semibold mb-4">{title}</h3>
      <ul className="space-y-3">{children}</ul>
    </div>
  );
});

// Social Link Component
const SocialLink = memo(function SocialLink({
  href,
  icon: Icon,
  label,
  color,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  color: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={`
        p-2.5 rounded-xl bg-gray-800 hover:${color} 
        text-gray-400 hover:text-white
        transition-all duration-300 hover:scale-110 hover:-translate-y-1
      `}
    >
      <Icon className="w-5 h-5" />
    </a>
  );
});

export const FooterRedesigned = memo(function FooterRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Quick Links
  const quickLinks = [
    { href: "/", label: isArabic ? "الرئيسية" : "Home" },
    { href: "/about", label: isArabic ? "من نحن" : "About Us" },
    { href: "/pricing", label: isArabic ? "الأسعار" : "Pricing" },
    { href: "/contact", label: isArabic ? "تواصل معنا" : "Contact Us" },
    { href: "/blog", label: isArabic ? "المدونة" : "Blog" },
    { href: "/faq", label: isArabic ? "الأسئلة الشائعة" : "FAQ" },
  ];

  // Services Links
  const servicesLinks = [
    { href: "/tools", label: isArabic ? "حاسبة نهاية الخدمة" : "End of Service Calculator" },
    { href: "/tools", label: isArabic ? "حاسبة الإجازات" : "Leave Calculator" },
    { href: "/consulting", label: isArabic ? "الاستشارات" : "Consulting" },
    { href: "/company/dashboard", label: isArabic ? "لوحة التحكم" : "Dashboard" },
  ];

  // Legal Links
  const legalLinks = [
    { href: "/privacy", label: isArabic ? "سياسة الخصوصية" : "Privacy Policy" },
    { href: "/terms", label: isArabic ? "شروط الاستخدام" : "Terms of Service" },
    { href: "/cookies", label: isArabic ? "سياسة الكوكيز" : "Cookie Policy" },
  ];

  // Social Links
  const socialLinks = [
    { href: "https://twitter.com/rbithr", icon: Twitter, label: "Twitter", color: "bg-[#1DA1F2]" },
    { href: "https://linkedin.com/company/rbithr", icon: Linkedin, label: "LinkedIn", color: "bg-[#0A66C2]" },
    { href: "https://instagram.com/rbithr", icon: Instagram, label: "Instagram", color: "bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737]" },
    { href: "https://youtube.com/@rbithr", icon: Youtube, label: "YouTube", color: "bg-[#FF0000]" },
  ];

  return (
    <footer className="bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
      </div>

      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-purple-600 to-pink-600" />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/">
              <div className="flex items-center gap-3 mb-6 cursor-pointer group">
                <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-primary via-purple-600 to-pink-600 shadow-lg group-hover:scale-105 transition-transform">
                  <Building2 className="w-6 h-6 text-white" />
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-amber-400 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold text-white">
                    {isArabic ? "رابِط" : "Rabt"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {isArabic ? "للموارد البشرية" : "HR Solutions"}
                  </span>
                </div>
              </div>
            </Link>
            
            <p className="text-gray-400 mb-6 max-w-md leading-relaxed">
              {isArabic
                ? "منصة رابِط للموارد البشرية توفر أدوات ذكية وحلول متكاملة لإدارة الموارد البشرية وفق نظام العمل السعودي."
                : "Rabt HR platform provides smart tools and integrated solutions for human resources management according to Saudi Labor Law."}
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <a
                href="mailto:info@rbithr.com"
                className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors"
              >
                <Mail className="w-5 h-5" />
                <span>info@rbithr.com</span>
              </a>
              <a
                href="tel:+966570700355"
                className="flex items-center gap-3 text-gray-400 hover:text-primary transition-colors"
              >
                <Phone className="w-5 h-5" />
                <span dir="ltr">+966 570 700 355</span>
              </a>
              <div className="flex items-center gap-3 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>{isArabic ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <FooterColumn title={isArabic ? "روابط سريعة" : "Quick Links"}>
            {quickLinks.map((link) => (
              <li key={link.href}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          {/* Services */}
          <FooterColumn title={isArabic ? "الخدمات" : "Services"}>
            {servicesLinks.map((link, index) => (
              <li key={index}>
                <FooterLink href={link.href}>{link.label}</FooterLink>
              </li>
            ))}
          </FooterColumn>

          {/* Newsletter */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              {isArabic ? "النشرة البريدية" : "Newsletter"}
            </h3>
            <p className="text-gray-400 text-sm mb-4">
              {isArabic
                ? "اشترك للحصول على أحدث النصائح والتحديثات"
                : "Subscribe for the latest tips and updates"}
            </p>
            <div className="flex gap-2">
              <Input
                placeholder={isArabic ? "بريدك الإلكتروني" : "Your email"}
                className={`bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-primary ${isArabic ? "text-right" : ""}`}
              />
              <Button size="icon" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 shrink-0">
                <Send className={`w-4 h-4 ${isArabic ? "rotate-180" : ""}`} />
              </Button>
            </div>

            {/* Legal Links */}
            <div className="mt-6 pt-6 border-t border-gray-800">
              <h4 className="text-white text-sm font-medium mb-3">
                {isArabic ? "القانونية" : "Legal"}
              </h4>
              <ul className="space-y-2">
                {legalLinks.map((link) => (
                  <li key={link.href}>
                    <FooterLink href={link.href}>{link.label}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Copyright */}
            <p className="text-gray-400 text-sm text-center md:text-start">
              © {new Date().getFullYear()} {isArabic ? "رابِط للموارد البشرية" : "Rabt HR Solutions"}.{" "}
              {isArabic ? "جميع الحقوق محفوظة." : "All rights reserved."}
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="p-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all duration-300 hover:scale-110"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Back to Top */}
            <button
              onClick={scrollToTop}
              className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors group"
            >
              <span className="text-sm">{isArabic ? "العودة للأعلى" : "Back to top"}</span>
              <div className="p-2 rounded-full bg-gray-800 group-hover:bg-primary/20 transition-colors">
                <ArrowUp className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default FooterRedesigned;
