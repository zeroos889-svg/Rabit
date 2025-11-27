import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { APP_LOGO } from "@/const";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Send,
  Shield,
  Lock,
  Globe2,
} from "lucide-react";

export function Footer() {
  return (
    <footer className="relative border-t bg-brand-surface/50 dark:bg-slate-950/70">
      <div className="absolute inset-0 bg-gradient-to-br from-white/70 via-transparent to-brand-50 dark:from-slate-900/60 dark:via-slate-950/30 dark:to-brand-900/30" />
      <div className="container relative py-12 space-y-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-2xl bg-white shadow-brand-glow flex items-center justify-center">
                <img
                  src={APP_LOGO}
                  alt="Rabit"
                  className="h-8 w-8"
                  loading="lazy"
                  width={32}
                  height={32}
                  sizes="32px"
                />
              </div>
              <div>
                <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  HR Platform
                </span>
                <p className="text-2xl font-bold text-gradient-primary">رابِط</p>
              </div>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              مساعدك الذكي في إدارة الموارد البشرية. أدوات الذكاء الاصطناعي، الاستشارات، ولوحات المتابعة في تجربة واحدة متوافقة مع نظام العمل السعودي.
            </p>

            {/* Newsletter */}
            <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-sm backdrop-blur dark:bg-slate-900/60 dark:border-slate-800">
              <h4 className="font-semibold mb-3 text-foreground">اشترك في النشرة البريدية</h4>
              <div className="flex gap-2 flex-col sm:flex-row">
                <Input placeholder="بريدك الإلكتروني" className="text-right flex-1" />
                <Button size="icon" className="gradient-primary flex-shrink-0 shadow-brand-glow">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">أخبار الامتثال والتحديثات القانونية مباشرة إلى بريدك.</p>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">روابط سريعة</h4>
            <ul className="space-y-3 text-muted-foreground">
              {[{ href: "/", label: "الرئيسية" }, { href: "/about", label: "من نحن" }, { href: "/services", label: "الخدمات" }, { href: "/pricing", label: "الباقات والأسعار" }, { href: "/blog", label: "المدونة" }, { href: "/contact", label: "اتصل بنا" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/80 hover:text-brand-700 transition-colors dark:hover:bg-slate-900/70"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">الخدمات</h4>
            <ul className="space-y-3 text-muted-foreground">
              {[{ href: "/consulting", label: "الاستشارات القانونية" }, { href: "/courses", label: "الدورات التدريبية" }, { href: "/knowledge-base", label: "قاعدة المعرفة" }, { href: "/tools/end-of-service", label: "حاسبة نهاية الخدمة" }, { href: "/tools/leave-calculator", label: "حاسبة الإجازات" }, { href: "/tools/letter-generator", label: "مولد الخطابات" }, { href: "/verify-decision", label: "التحقق القانوني" }, { href: "/faq", label: "الأسئلة الشائعة" }].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-brand-700 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">تواصل معنا</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground mb-1">البريد الإلكتروني</div>
                  <a href="mailto:info@rbithr.com" className="hover:text-brand-700 transition-colors">
                    info@rbithr.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground mb-1">الهاتف / واتساب</div>
                  <a href="tel:0570700355" className="hover:text-brand-700 transition-colors">
                    0570700355
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-brand-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground mb-1">الموقع</div>
                  <span>الرياض، المملكة العربية السعودية</span>
                </div>
              </li>
            </ul>

            {/* Social Media */}
            <div className="mt-6">
              <h5 className="font-medium mb-3">تابعنا</h5>
              <div className="flex gap-2">
                {[
                  { href: "https://twitter.com/rbithr", icon: Twitter },
                  { href: "https://linkedin.com/company/rbithr", icon: Linkedin },
                  { href: "https://instagram.com/rbithr", icon: Instagram },
                  { href: "https://facebook.com/rbithr", icon: Facebook },
                ].map(({ href, icon: Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white hover:scale-110 transition-transform"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Security */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">الأمان والامتثال</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              {[{
                icon: Shield,
                title: "SSL & ISO 27001",
                desc: "اتصالات مشفرة وتشغيل متوافق مع معايير أمن المعلومات",
              },
              {
                icon: Lock,
                title: "SOC 2 Controls",
                desc: "ضوابط حماية البيانات وتدقيق مستمر",
              },
              {
                icon: Globe2,
                title: "مناطق بيانات",
                desc: "خيارات data_region: sa-gcc | eu | us",
              }].map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="flex items-start gap-3 p-3 rounded-xl border border-white/60 bg-white/80 dark:bg-slate-900/60 dark:border-slate-800"
                >
                  <Icon className="h-5 w-5 text-brand-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">{title}</p>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/60 dark:border-slate-800 pt-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-muted-foreground text-center md:text-right">
            © {new Date().getFullYear()} رابِط. جميع الحقوق محفوظة.
          </p>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center">
            {[
              { href: "/privacy", label: "سياسة الخصوصية" },
              { href: "/terms", label: "الشروط والأحكام" },
              { href: "/cookies", label: "سياسة الكوكيز" },
            ].map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-700 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
