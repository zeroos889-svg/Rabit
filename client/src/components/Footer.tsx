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
    <footer className="border-t bg-gradient-to-br from-brand-50 via-white to-brand-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="container py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand & Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img
                src={APP_LOGO}
                alt="Rabit"
                className="h-10 w-10"
                loading="lazy"
                width={40}
                height={40}
                sizes="40px"
              />
              <span className="text-2xl font-bold text-gradient-primary">
                رابِط
              </span>
            </div>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              مساعدك الذكي في إدارة الموارد البشرية. نوفر أدوات متقدمة بتقنية
              الذكاء الاصطناعي لتسهيل عمل HR وتوفير الوقت والجهد، مع التوافق
              الكامل مع نظام العمل السعودي.
            </p>

            {/* Newsletter */}
            <div>
              <h4 className="font-semibold mb-3">اشترك في النشرة البريدية</h4>
              <div className="flex gap-2">
                <Input placeholder="بريدك الإلكتروني" className="text-right" />
                <Button
                  size="icon"
                  className="gradient-primary flex-shrink-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">روابط سريعة</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  href="/"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link
                  href="/services"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  الخدمات
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  الباقات والأسعار
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  المدونة
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-primary transition-colors flex items-center gap-2"
                >
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">الخدمات</h4>
            <ul className="space-y-3 text-muted-foreground">
              <li>
                <Link
                  href="/consulting"
                  className="hover:text-primary transition-colors"
                >
                  الاستشارات القانونية
                </Link>
              </li>
              <li>
                <Link
                  href="/courses"
                  className="hover:text-primary transition-colors"
                >
                  الدورات التدريبية
                </Link>
              </li>
              <li>
                <Link
                  href="/knowledge-base"
                  className="hover:text-primary transition-colors"
                >
                  قاعدة المعرفة
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/end-of-service"
                  className="hover:text-primary transition-colors"
                >
                  حاسبة نهاية الخدمة
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/leave-calculator"
                  className="hover:text-primary transition-colors"
                >
                  حاسبة الإجازات
                </Link>
              </li>
              <li>
                <Link
                  href="/tools/letter-generator"
                  className="hover:text-primary transition-colors"
                >
                  مولد الخطابات
                </Link>
              </li>
              <li>
                <Link
                  href="/verify-decision"
                  className="hover:text-primary transition-colors"
                >
                  التحقق القانوني
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-primary transition-colors"
                >
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">تواصل معنا</h4>
            <ul className="space-y-4 text-muted-foreground">
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-brand-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground mb-1">
                    البريد الإلكتروني
                  </div>
                  <a
                    href="mailto:info@rbithr.com"
                    className="hover:text-primary transition-colors"
                  >
                    info@rbithr.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-foreground mb-1">
                    الهاتف / واتساب
                  </div>
                  <a
                    href="tel:0570700355"
                    className="hover:text-primary transition-colors"
                  >
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
                <a
                  href="https://twitter.com/rbithr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a
                  href="https://linkedin.com/company/rbithr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-600 to-brand-700 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a
                  href="https://instagram.com/rbithr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-rose-500 to-brand-500 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Instagram className="h-4 w-4" />
                </a>
                <a
                  href="https://facebook.com/rbithr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-500 to-brand-800 flex items-center justify-center text-white hover:scale-110 transition-transform"
                >
                  <Facebook className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
  <div className="border-t pt-8 border-white/40 dark:border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-right">
              © {new Date().getFullYear()} رابِط. جميع الحقوق محفوظة.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors"
              >
                سياسة الخصوصية
              </Link>
              <Link
                href="/terms"
                className="hover:text-primary transition-colors"
              >
                الشروط والأحكام
              </Link>
              <Link
                href="/cookies"
                className="hover:text-primary transition-colors"
              >
                سياسة الكوكيز
              </Link>
            </div>
          </div>
        </div>

          {/* Security Badges */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">الأمان والامتثال</h4>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-white/60 dark:bg-slate-900/60">
                <Shield className="h-5 w-5 text-emerald-500 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">SSL & ISO 27001</p>
                  <p>اتصالات آمنة ومعايير إدارة أمن المعلومات.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-white/60 dark:bg-slate-900/60">
                <Lock className="h-5 w-5 text-brand-600 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">SOC 2 Controls</p>
                  <p>ضوابط حماية البيانات وسجل تدقيق شامل.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-white/60 dark:bg-slate-900/60">
                <Globe2 className="h-5 w-5 text-brand-500 mt-0.5" />
                <div>
                  <p className="font-medium text-foreground">مناطق بيانات</p>
                  <p>خيارات data_region: sa-gcc | eu | us.</p>
                </div>
              </div>
            </div>
          </div>
      </div>
    </footer>
  );
}
