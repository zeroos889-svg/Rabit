import {
  useMemo,
  useState,
  useCallback,
  memo,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MapView } from "@/components/Map";
import { Footer } from "@/components/Footer";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Building2,
  Send,
  Headphones,
  Loader2,
  CheckCircle2,
  Globe,
  Zap,
  Star,
  Trophy,
  type LucideIcon,
} from "lucide-react";

// ============================================================================
// Types
// ============================================================================

interface ContactChannel {
  title: { ar: string; en: string };
  description: { ar: string; en: string };
  icon: LucideIcon;
  email: string;
  gradient: string;
}

interface MetricItem {
  label: { ar: string; en: string };
  value: { ar: string; en: string };
  icon: LucideIcon;
}

interface FAQ {
  question: { ar: string; en: string };
  answer: { ar: string; en: string };
}

type ContactFieldElement =
  | globalThis.HTMLInputElement
  | globalThis.HTMLTextAreaElement;

// ============================================================================
// Animation Component
// ============================================================================

function AnimateOnScroll({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useCallback((node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
  }, []);

  return (
    <div
      ref={ref}
      className={`transform transition-all duration-700 ${
        isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Constants
// ============================================================================

const TEAM_SIZE_OPTIONS = [
  { value: "1-10", label: "1-10" },
  { value: "11-50", label: "11-50" },
  { value: "51-200", label: "51-200" },
  { value: "201-500", label: "201-500" },
  { value: "500+", label: "500+" },
];

const TOPIC_OPTIONS = [
  { value: "sales", label: { ar: "المبيعات", en: "Sales" } },
  { value: "support", label: { ar: "الدعم الفني", en: "Support" } },
  { value: "partnership", label: { ar: "الشراكات", en: "Partnership" } },
  { value: "media", label: { ar: "الإعلام", en: "Media" } },
  { value: "demo", label: { ar: "عرض توضيحي", en: "Demo" } },
  { value: "other", label: { ar: "أخرى", en: "Other" } },
];

const METHOD_OPTIONS = [
  { value: "email", label: { ar: "البريد الإلكتروني", en: "Email" } },
  { value: "phone", label: { ar: "الهاتف", en: "Phone" } },
  { value: "whatsapp", label: { ar: "واتساب", en: "WhatsApp" } },
];

const CONTACT_CHANNELS: ContactChannel[] = [
  {
    title: { ar: "المبيعات والأعمال", en: "Sales & Business" },
    description: {
      ar: "تواصل مع فريق المبيعات للحصول على عروض أسعار مخصصة وحلول للشركات.",
      en: "Connect with our sales team for custom quotes and enterprise solutions.",
    },
    icon: Sparkles,
    email: "sales@rabit.sa",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: { ar: "الدعم الفني", en: "Technical Support" },
    description: {
      ar: "فريق دعم متخصص جاهز لمساعدتك على مدار الساعة.",
      en: "Dedicated support team ready to help you 24/7.",
    },
    icon: ShieldCheck,
    email: "support@rabit.sa",
    gradient: "from-emerald-500 to-teal-500",
  },
  {
    title: { ar: "الشراكات والتعاون", en: "Partnerships" },
    description: {
      ar: "استكشف فرص الشراكة والتكامل مع منصة رابط.",
      en: "Explore partnership and integration opportunities with Rabit.",
    },
    icon: MessageSquare,
    email: "partners@rabit.sa",
    gradient: "from-purple-500 to-indigo-500",
  },
];

const METRICS: MetricItem[] = [
  {
    label: { ar: "وقت الاستجابة", en: "Response Time" },
    value: { ar: "< 2 ساعة", en: "< 2 hours" },
    icon: Clock,
  },
  {
    label: { ar: "العملاء النشطين", en: "Active Clients" },
    value: { ar: "+500 شركة", en: "+500 companies" },
    icon: Users,
  },
  {
    label: { ar: "رضا العملاء", en: "Satisfaction Rate" },
    value: { ar: "98%", en: "98%" },
    icon: Star,
  },
  {
    label: { ar: "التوفر", en: "Availability" },
    value: { ar: "24/7", en: "24/7" },
    icon: Globe,
  },
];

const FAQS: FAQ[] = [
  {
    question: {
      ar: "ما هي طرق التواصل المتاحة؟",
      en: "What contact methods are available?",
    },
    answer: {
      ar: "يمكنك التواصل معنا عبر البريد الإلكتروني، الهاتف، أو واتساب. كما يمكنك زيارة مقرنا الرئيسي في الرياض خلال ساعات العمل الرسمية.",
      en: "You can reach us via email, phone, or WhatsApp. You can also visit our headquarters in Riyadh during official working hours.",
    },
  },
  {
    question: {
      ar: "كم يستغرق الرد على الاستفسارات؟",
      en: "How long does it take to respond to inquiries?",
    },
    answer: {
      ar: "نلتزم بالرد خلال ساعتين كحد أقصى خلال ساعات العمل. للحالات الطارئة، يتوفر خط دعم مباشر على مدار الساعة.",
      en: "We commit to responding within 2 hours maximum during business hours. For emergencies, a direct support line is available 24/7.",
    },
  },
  {
    question: {
      ar: "هل تقدمون عروض توضيحية مجانية؟",
      en: "Do you offer free demos?",
    },
    answer: {
      ar: "نعم، نقدم عروضاً توضيحية مجانية ومخصصة لاحتياجات شركتك. احجز موعدك من خلال نموذج التواصل أو اتصل بفريق المبيعات.",
      en: "Yes, we offer free demos customized to your company's needs. Book your appointment through the contact form or call our sales team.",
    },
  },
  {
    question: {
      ar: "ما هي ساعات العمل الرسمية؟",
      en: "What are the official working hours?",
    },
    answer: {
      ar: "ساعات العمل من الأحد إلى الخميس، من 8 صباحاً حتى 6 مساءً بتوقيت السعودية. الدعم الفني متوفر على مدار الساعة.",
      en: "Working hours are Sunday to Thursday, from 8 AM to 6 PM Saudi time. Technical support is available 24/7.",
    },
  },
];

// ============================================================================
// Sub-Components
// ============================================================================

// Stat Badge Component
const StatBadge = memo(function StatBadge({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10">
      <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-white/70">{label}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
});

// Channel Card Component
const ChannelCard = memo(function ChannelCard({
  channel,
  isArabic,
}: {
  channel: ContactChannel;
  isArabic: boolean;
}) {
  const Icon = channel.icon;
  return (
    <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${channel.gradient}`} />
      <CardContent className="p-6 space-y-4">
        <div
          className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${channel.gradient} text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}
        >
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {isArabic ? channel.title.ar : channel.title.en}
          </h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {isArabic ? channel.description.ar : channel.description.en}
          </p>
        </div>
        <Button variant="ghost" className="px-0 group/btn" asChild>
          <a
            href={`mailto:${channel.email}`}
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80"
          >
            {channel.email}
            <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
          </a>
        </Button>
      </CardContent>
    </Card>
  );
});

// Info Item Component
const InfoItem = memo(function InfoItem({
  icon: Icon,
  title,
  value,
  href,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
}) {
  const content = (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {content}
      </a>
    );
  }

  return content;
});

// ============================================================================
// Main Component
// ============================================================================

export default function ContactRedesigned() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    companyName: "",
    teamSize: "11-50",
    topic: "sales",
    message: "",
    preferredContactMethod: "email",
    hearAboutUs: "",
  });

  const mutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      toast.success(
        isArabic
          ? "تم إرسال رسالتك بنجاح! سنتواصل معك قريباً."
          : "Your message was sent successfully! We'll contact you soon."
      );
      setFormData((prev) => ({
        ...prev,
        fullName: "",
        email: "",
        phoneNumber: "",
        companyName: "",
        message: "",
        hearAboutUs: "",
      }));
    },
    onError: () => {
      toast.error(
        isArabic
          ? "حدث خطأ أثناء إرسال الرسالة. يرجى المحاولة مرة أخرى."
          : "An error occurred while sending your message. Please try again."
      );
    },
  });

  const handleChange =
    (field: keyof typeof formData) =>
    (event: ChangeEvent<ContactFieldElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handleSelectChange = (field: keyof typeof formData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<globalThis.HTMLFormElement>) => {
    event.preventDefault();
    if (mutation.isPending) return;
    mutation.mutate({
      ...formData,
      phoneNumber: formData.phoneNumber || undefined,
      companyName: formData.companyName || undefined,
      hearAboutUs: formData.hearAboutUs || undefined,
      locale: i18n.language,
    });
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 ${isArabic ? "rtl" : "ltr"}`}
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* ============== Hero Section ============== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white">
        {/* Background decorations */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,_rgba(99,102,241,0.15)_0%,_transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,_rgba(168,85,247,0.15)_0%,_transparent_50%)]" />
        <div className="absolute top-1/4 -start-32 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-1/4 -end-32 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 start-[10%] h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
          <div className="absolute top-40 end-[15%] h-3 w-3 rounded-full bg-purple-400 animate-pulse delay-75" />
          <div className="absolute bottom-32 start-[20%] h-2 w-2 rounded-full bg-indigo-400 animate-pulse delay-150" />
        </div>

        <div className="container relative py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <AnimateOnScroll>
              <Badge className="bg-white/10 text-white border border-white/20 backdrop-blur-sm px-4 py-2">
                <Headphones className="h-4 w-4 me-2" />
                {isArabic ? "تواصل معنا على مدار الساعة" : "Contact us 24/7"}
              </Badge>
            </AnimateOnScroll>

            <AnimateOnScroll delay={100}>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text text-transparent">
                  {isArabic
                    ? "نحن هنا لمساعدتك في كل خطوة"
                    : "We're Here to Help You Every Step"}
                </span>
              </h1>
            </AnimateOnScroll>

            <AnimateOnScroll delay={200}>
              <p className="text-lg lg:text-xl text-white/80 leading-relaxed max-w-2xl mx-auto">
                {isArabic
                  ? "فريق متخصص جاهز للإجابة على استفساراتك ومساعدتك في اختيار الحلول المناسبة لعملك. تواصل معنا الآن."
                  : "A dedicated team ready to answer your questions and help you choose the right solutions for your business. Contact us now."}
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll delay={300}>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-gray-100 shadow-xl shadow-black/20"
                  asChild
                >
                  <a href="tel:+966500000000">
                    <Phone className="h-5 w-5 me-2" />
                    {isArabic ? "اتصل بنا مباشرة" : "Call Us Directly"}
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm"
                  asChild
                >
                  <a href="mailto:info@rabit.sa">
                    <Mail className="h-5 w-5 me-2" />
                    {isArabic ? "راسلنا عبر البريد" : "Email Us"}
                  </a>
                </Button>
              </div>
            </AnimateOnScroll>

            {/* Metrics */}
            <AnimateOnScroll delay={400}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                {METRICS.map((metric, index) => (
                  <StatBadge
                    key={index}
                    icon={metric.icon}
                    label={isArabic ? metric.label.ar : metric.label.en}
                    value={isArabic ? metric.value.ar : metric.value.en}
                  />
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>
      <QuickActionsBar isArabic={isArabic} className="border-0 bg-white/90 dark:bg-gray-950/90" />

      {/* ============== Contact Form & Info Section ============== */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Contact Form */}
            <AnimateOnScroll>
              <Card className="border-0 shadow-xl overflow-hidden sticky top-8">
                <div className="h-2 bg-gradient-to-r from-primary via-purple-500 to-cyan-500" />
                <CardHeader className="space-y-2">
                  <CardTitle className="text-2xl">
                    {isArabic ? "أرسل رسالتك" : "Send Your Message"}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {isArabic
                      ? "املأ النموذج أدناه وسنتواصل معك في أقرب وقت ممكن."
                      : "Fill out the form below and we'll get back to you as soon as possible."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-5" onSubmit={handleSubmit}>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="fullName">
                          {isArabic ? "الاسم الكامل" : "Full Name"}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange("fullName")}
                          placeholder={
                            isArabic ? "أدخل اسمك الكامل" : "Enter your full name"
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">
                          {isArabic ? "البريد الإلكتروني" : "Email"}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange("email")}
                          placeholder="example@company.com"
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">
                          {isArabic ? "رقم الهاتف" : "Phone Number"}
                        </Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleChange("phoneNumber")}
                          placeholder="+966 5XX XXX XXXX"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company">
                          {isArabic ? "اسم الشركة" : "Company Name"}
                        </Label>
                        <Input
                          id="company"
                          value={formData.companyName}
                          onChange={handleChange("companyName")}
                          placeholder={
                            isArabic ? "اسم شركتك" : "Your company name"
                          }
                        />
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="teamSize">
                          {isArabic ? "حجم الفريق" : "Team Size"}
                        </Label>
                        <Select
                          value={formData.teamSize}
                          onValueChange={handleSelectChange("teamSize")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TEAM_SIZE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}{" "}
                                {isArabic ? "موظف" : "employees"}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="topic">
                          {isArabic ? "موضوع الرسالة" : "Message Topic"}{" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.topic}
                          onValueChange={handleSelectChange("topic")}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {TOPIC_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {isArabic ? option.label.ar : option.label.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="method">
                          {isArabic
                            ? "طريقة التواصل المفضلة"
                            : "Preferred Contact Method"}
                        </Label>
                        <Select
                          value={formData.preferredContactMethod}
                          onValueChange={handleSelectChange(
                            "preferredContactMethod"
                          )}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {METHOD_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {isArabic ? option.label.ar : option.label.en}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="hearAboutUs">
                          {isArabic ? "كيف سمعت عنا؟" : "How did you hear about us?"}
                        </Label>
                        <Input
                          id="hearAboutUs"
                          value={formData.hearAboutUs}
                          onChange={handleChange("hearAboutUs")}
                          placeholder={
                            isArabic
                              ? "مثال: جوجل، تويتر، صديق"
                              : "e.g., Google, Twitter, Friend"
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">
                        {isArabic ? "رسالتك" : "Your Message"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <Textarea
                        id="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleChange("message")}
                        placeholder={
                          isArabic
                            ? "اكتب رسالتك هنا بالتفصيل..."
                            : "Write your message here in detail..."
                        }
                      />
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                      disabled={mutation.isPending}
                    >
                      {mutation.isPending ? (
                        <>
                          <Loader2 className="h-5 w-5 me-2 animate-spin" />
                          {isArabic ? "جاري الإرسال..." : "Sending..."}
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5 me-2" />
                          {isArabic ? "إرسال الرسالة" : "Send Message"}
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </AnimateOnScroll>

            {/* Contact Info */}
            <div className="space-y-8">
              <AnimateOnScroll>
                <div className="space-y-4">
                  <Badge variant="secondary" className="px-4 py-1">
                    {isArabic ? "معلومات التواصل" : "Contact Information"}
                  </Badge>
                  <h2 className="text-3xl font-bold">
                    {isArabic ? "طرق أخرى للتواصل" : "Other Ways to Reach Us"}
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    {isArabic
                      ? "اختر الطريقة الأنسب لك للتواصل مع فريقنا."
                      : "Choose the most convenient way for you to contact our team."}
                  </p>
                </div>
              </AnimateOnScroll>

              <AnimateOnScroll delay={100}>
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6 space-y-4">
                    <InfoItem
                      icon={Phone}
                      title={isArabic ? "رقم الهاتف" : "Phone Number"}
                      value="+966 50 000 0000"
                      href="tel:+966500000000"
                    />
                    <InfoItem
                      icon={Mail}
                      title={isArabic ? "البريد الإلكتروني" : "Email Address"}
                      value="info@rabit.sa"
                      href="mailto:info@rabit.sa"
                    />
                    <InfoItem
                      icon={MapPin}
                      title={isArabic ? "العنوان" : "Address"}
                      value={
                        isArabic
                          ? "الرياض، المملكة العربية السعودية"
                          : "Riyadh, Saudi Arabia"
                      }
                    />
                    <InfoItem
                      icon={Clock}
                      title={isArabic ? "ساعات العمل" : "Working Hours"}
                      value={
                        isArabic
                          ? "الأحد - الخميس، 8 ص - 6 م"
                          : "Sun - Thu, 8 AM - 6 PM"
                      }
                    />
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              {/* Map */}
              <AnimateOnScroll delay={200}>
                <Card className="border-0 shadow-md overflow-hidden">
                  <MapView
                    className="h-[300px]"
                    center={{ lat: 24.7136, lng: 46.6753 }}
                    zoom={12}
                  />
                </Card>
              </AnimateOnScroll>

              {/* Social Proof */}
              <AnimateOnScroll delay={300}>
                <Card className="border-0 shadow-md bg-gradient-to-br from-primary/5 to-purple-500/5">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                        <Trophy className="h-7 w-7 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-5 w-5 fill-amber-400 text-amber-400"
                            />
                          ))}
                        </div>
                        <p className="font-medium">
                          {isArabic
                            ? "أكثر من 500 شركة تثق بنا"
                            : "More than 500 companies trust us"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {isArabic
                            ? "انضم إلى عملائنا الناجحين اليوم"
                            : "Join our successful customers today"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </div>
      </section>

      {/* ============== Contact Channels Section ============== */}
      <section className="py-20 lg:py-28 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="container">
          <AnimateOnScroll>
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="px-4 py-1">
                {isArabic ? "قنوات التواصل المتخصصة" : "Specialized Contact Channels"}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                {isArabic
                  ? "تواصل مع الفريق المناسب مباشرة"
                  : "Contact the Right Team Directly"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                {isArabic
                  ? "لدينا فرق متخصصة جاهزة لمساعدتك في كل ما تحتاجه."
                  : "We have specialized teams ready to help you with everything you need."}
              </p>
            </div>
          </AnimateOnScroll>

          <div className="grid gap-6 md:grid-cols-3">
            {CONTACT_CHANNELS.map((channel, index) => (
              <AnimateOnScroll key={channel.email} delay={index * 100}>
                <ChannelCard channel={channel} isArabic={isArabic} />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FAQ Section ============== */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <AnimateOnScroll>
            <div className="text-center space-y-4 mb-16">
              <Badge variant="secondary" className="px-4 py-1">
                {isArabic ? "الأسئلة الشائعة" : "Frequently Asked Questions"}
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-bold">
                {isArabic ? "هل لديك استفسارات؟" : "Have Questions?"}
              </h2>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll delay={100}>
            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="w-full">
                {FAQS.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="border-b border-gray-200 dark:border-gray-800"
                  >
                    <AccordionTrigger className="text-start hover:no-underline py-6">
                      <span className="text-lg font-medium">
                        {isArabic ? faq.question.ar : faq.question.en}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground text-base pb-6">
                      {isArabic ? faq.answer.ar : faq.answer.en}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <ConnectedPagesSection
        isArabic={isArabic}
        highlight={{ ar: "روابط متصلة", en: "Stay Connected" }}
        title={{
          ar: "انتقل بسرعة لتكملة رحلتك",
          en: "Move quickly to continue your journey",
        }}
        subtitle={{
          ar: "من صفحة التواصل يمكنك الذهاب مباشرة للباقات، الأدوات، أو حجز الاستشارات دون الرجوع للصفحة الرئيسية.",
          en: "From Contact you can jump straight to plans, tools, or consulting bookings without going back home.",
        }}
      />

      {/* ============== CTA Section ============== */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-indigo-950 via-slate-950 to-purple-950 text-white">
        <div className="container">
          <AnimateOnScroll>
            <div className="text-center space-y-8 max-w-4xl mx-auto">
              <Badge className="bg-white/10 text-white border border-white/20 px-4 py-2">
                {isArabic ? "جاهزون لمساعدتك" : "Ready to Help You"}
              </Badge>

              <h2 className="text-3xl lg:text-5xl font-bold leading-tight">
                {isArabic
                  ? "ابدأ رحلتك مع رابط اليوم"
                  : "Start Your Journey with Rabit Today"}
              </h2>

              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                {isArabic
                  ? "فريقنا المتخصص جاهز للإجابة على جميع استفساراتك ومساعدتك في اختيار الحل الأمثل لعملك."
                  : "Our dedicated team is ready to answer all your questions and help you choose the optimal solution for your business."}
              </p>

              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-gray-100 shadow-xl shadow-black/20"
                  asChild
                >
                  <a href="tel:+966500000000">
                    <Phone className="h-5 w-5 me-2" />
                    {isArabic ? "اتصل الآن" : "Call Now"}
                  </a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                  asChild
                >
                  <Link href="/pricing">
                    {isArabic ? "عرض الأسعار" : "View Pricing"}
                    <ArrowRight className="h-5 w-5 ms-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      <Footer />
    </div>
  );
}
