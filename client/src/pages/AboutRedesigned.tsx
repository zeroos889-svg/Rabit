import { memo, useCallback, useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Footer } from "@/components/Footer";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Eye,
  Heart,
  Users,
  Zap,
  Shield,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Globe,
  Rocket,
  Lightbulb,
  Building2,
  Clock,
  Star,
  LinkedinIcon,
  Twitter,
} from "lucide-react";

// Animation Hook
function useAnimateOnScroll(options: IntersectionObserverInit = { threshold: 0.1 }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

// Animated Section Component
const AnimatedSection = memo(function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, isVisible } = useAnimateOnScroll();

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translateY(0)" : "translateY(30px)",
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
});

// Glass Card Component
const GlassCard = memo(function GlassCard({
  children,
  className = "",
  hover = true,
}: {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}) {
  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl
        bg-white/70 dark:bg-gray-900/70
        backdrop-blur-xl border border-white/20 dark:border-gray-700/30
        shadow-xl shadow-black/5 dark:shadow-black/20
        ${hover ? "hover:shadow-2xl hover:scale-[1.02] hover:border-primary/30" : ""}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </div>
  );
});

// Value Card Component
const ValueCard = memo(function ValueCard({
  icon: Icon,
  title,
  description,
  color,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  color: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <GlassCard className="p-6 h-full text-center group">
        <div
          className={`
            w-16 h-16 mx-auto mb-4 rounded-2xl
            bg-gradient-to-br ${color}
            flex items-center justify-center
            group-hover:scale-110 transition-transform duration-300
            shadow-lg
          `}
        >
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
      </GlassCard>
    </AnimatedSection>
  );
});

// Timeline Item Component
const TimelineItem = memo(function TimelineItem({
  year,
  title,
  description,
  isLast,
  index,
}: {
  year: string;
  title: string;
  description: string;
  isLast: boolean;
  index: number;
}) {
  const isEven = index % 2 === 0;

  return (
    <AnimatedSection delay={index * 150} className="relative">
      <div className={`flex items-center gap-4 md:gap-8 ${isEven ? "md:flex-row" : "md:flex-row-reverse"}`}>
        {/* Content */}
        <div className="flex-1 hidden md:block" />
        
        {/* Center dot and line */}
        <div className="relative flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold shadow-lg z-10">
            {year}
          </div>
          {!isLast && (
            <div className="w-0.5 h-24 bg-gradient-to-b from-primary to-purple-600 opacity-30" />
          )}
        </div>
        
        {/* Card */}
        <div className="flex-1">
          <GlassCard className="p-6">
            <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
          </GlassCard>
        </div>
      </div>
    </AnimatedSection>
  );
});

// Team Member Card
const TeamMemberCard = memo(function TeamMemberCard({
  name,
  role,
  description,
  linkedin,
  delay,
}: {
  name: string;
  role: string;
  description: string;
  linkedin?: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay}>
      <GlassCard className="p-6 text-center group">
        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
          {name.charAt(0)}
        </div>
        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{name}</h3>
        <p className="text-primary font-medium text-sm mb-2">{role}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{description}</p>
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline text-sm"
          >
            <LinkedinIcon className="w-4 h-4" />
            LinkedIn
          </a>
        )}
      </GlassCard>
    </AnimatedSection>
  );
});

// Stat Card Component
const StatCard = memo(function StatCard({
  icon: Icon,
  value,
  label,
  delay,
}: {
  icon: React.ElementType;
  value: string;
  label: string;
  delay: number;
}) {
  return (
    <AnimatedSection delay={delay} className="text-center text-white">
      <div className="flex justify-center mb-3">
        <Icon className="w-8 h-8" />
      </div>
      <div className="text-4xl md:text-5xl font-bold mb-2">{value}</div>
      <div className="text-white/80">{label}</div>
    </AnimatedSection>
  );
});

export default function AboutRedesigned() {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar";

  const values = [
    {
      icon: Heart,
      title: isArabic ? "الشغف بالتميز" : "Passion for Excellence",
      description: isArabic
        ? "نسعى دائماً لتقديم أفضل الحلول التقنية التي تتجاوز توقعات عملائنا"
        : "We always strive to deliver the best tech solutions that exceed our clients' expectations",
      color: "from-rose-500 to-pink-600",
    },
    {
      icon: Shield,
      title: isArabic ? "الموثوقية" : "Reliability",
      description: isArabic
        ? "نبني علاقات طويلة الأمد مع عملائنا من خلال الشفافية والمصداقية"
        : "We build long-term relationships with our clients through transparency and credibility",
      color: "from-blue-500 to-cyan-600",
    },
    {
      icon: Zap,
      title: isArabic ? "الابتكار المستمر" : "Continuous Innovation",
      description: isArabic
        ? "نواكب أحدث التقنيات ونطور حلولنا باستمرار لخدمة عملائنا بشكل أفضل"
        : "We keep up with the latest technologies and continuously develop our solutions",
      color: "from-amber-500 to-orange-600",
    },
    {
      icon: Users,
      title: isArabic ? "التركيز على العميل" : "Customer Focus",
      description: isArabic
        ? "نضع احتياجات عملائنا في صميم كل قرار نتخذه"
        : "We put our customers' needs at the heart of every decision we make",
      color: "from-emerald-500 to-green-600",
    },
  ];

  const team = [
    {
      name: isArabic ? "صالح العقيل" : "Saleh Alaqil",
      role: isArabic ? "المؤسس والرئيس التنفيذي" : "Founder & CEO",
      description: isArabic
        ? "خبير في مجال الموارد البشرية والتحول الرقمي"
        : "Expert in HR and Digital Transformation",
      linkedin: "https://www.linkedin.com/in/saleh0alaqil",
    },
    {
      name: isArabic ? "منصور الجابر" : "Mansour Aljaber",
      role: isArabic ? "المؤسس المشارك" : "Co-Founder",
      description: isArabic
        ? "متخصص في تطوير الأعمال والاستراتيجية"
        : "Specialist in Business Development and Strategy",
      linkedin: "https://www.linkedin.com/in/mansouraljaber11a",
    },
  ];

  const timeline = [
    {
      year: "2023",
      title: isArabic ? "الانطلاقة" : "Launch",
      description: isArabic
        ? "تأسيس رابِط بهدف تبسيط عمل أقسام الموارد البشرية في السعودية"
        : "Founded Rabt to simplify HR operations in Saudi Arabia",
    },
    {
      year: "2024",
      title: isArabic ? "النمو السريع" : "Rapid Growth",
      description: isArabic
        ? "وصلنا لخدمة أكثر من 500 شركة و10,000 موظف"
        : "Reached over 500 companies and 10,000 employees",
    },
    {
      year: "2025",
      title: isArabic ? "التوسع" : "Expansion",
      description: isArabic
        ? "إطلاق ميزات الذكاء الاصطناعي والتكامل مع الأنظمة الحكومية"
        : "Launching AI features and government systems integration",
    },
    {
      year: isArabic ? "المستقبل" : "Future",
      title: isArabic ? "الريادة الإقليمية" : "Regional Leadership",
      description: isArabic
        ? "نطمح لنكون المنصة الأولى للموارد البشرية في الشرق الأوسط"
        : "We aspire to be the #1 HR platform in the Middle East",
    },
  ];

  const stats = [
    { icon: Users, value: "500+", label: isArabic ? "شركة تثق بنا" : "Companies Trust Us" },
    { icon: TrendingUp, value: "10,000+", label: isArabic ? "موظف نخدمهم" : "Employees Served" },
    { icon: Award, value: "99%", label: isArabic ? "رضا العملاء" : "Customer Satisfaction" },
    { icon: Clock, value: "24/7", label: isArabic ? "دعم فني" : "Technical Support" },
  ];

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20 px-4 py-2">
              <Sparkles className="w-4 h-4 me-2" />
              {isArabic ? "من نحن" : "About Us"}
            </Badge>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6">
              {isArabic ? "نحن " : "We are "}
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {isArabic ? "رابِط" : "Rabt"}
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed max-w-3xl mx-auto">
              {isArabic
                ? "منصة سعودية متخصصة في تبسيط وأتمتة عمليات الموارد البشرية باستخدام أحدث التقنيات والذكاء الاصطناعي"
                : "A Saudi platform specialized in simplifying and automating HR operations using the latest technologies and AI"}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white px-8">
                  {isArabic ? "تواصل معنا" : "Contact Us"}
                  <ArrowRight className={`w-5 h-5 ${isArabic ? "rotate-180 me-2" : "ms-2"}`} />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="px-8">
                  {isArabic ? "اطلع على الباقات" : "View Plans"}
                </Button>
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
                <Lightbulb className="w-4 h-4 me-2" />
                {isArabic ? "قصتنا" : "Our Story"}
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                {isArabic ? "كيف بدأت رابِط؟" : "How Did Rabt Start?"}
              </h2>
            </div>
            
            <GlassCard className="p-8 md:p-12">
              <div className="prose prose-lg dark:prose-invert max-w-none text-center">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {isArabic
                    ? "بدأت رابِط من فكرة بسيطة: لماذا يقضي موظفو الموارد البشرية ساعات طويلة في مهام روتينية يمكن أتمتتها؟"
                    : "Rabt started from a simple idea: Why do HR employees spend long hours on routine tasks that can be automated?"}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  {isArabic
                    ? "بعد دراسة معمقة لتحديات أقسام الموارد البشرية في الشركات السعودية، اكتشفنا أن معظم الوقت يُهدر في: إصدار الشهادات يدوياً، الرد على نفس الأسئلة المتكررة، متابعة مواعيد انتهاء العقود والتأشيرات، وإدارة التذاكر والطلبات."
                    : "After an in-depth study of HR challenges in Saudi companies, we discovered that most time is wasted on: manually issuing certificates, answering repetitive questions, tracking contract and visa expiration dates, and managing tickets and requests."}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {isArabic
                    ? "من هنا ولدت رابِط - منصة ذكية تجمع كل ما يحتاجه موظف الموارد البشرية في مكان واحد، مع أتمتة المهام الروتينية وتوفير أدوات ذكية تعمل بالذكاء الاصطناعي."
                    : "From here, Rabt was born - a smart platform that brings together everything HR employees need in one place, with automation of routine tasks and AI-powered smart tools."}
                </p>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gradient-to-br from-gray-100/50 to-blue-100/30 dark:from-gray-900/50 dark:to-blue-900/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <AnimatedSection delay={0}>
              <GlassCard className="p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
                    <Eye className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isArabic ? "رؤيتنا" : "Our Vision"}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {isArabic
                    ? "أن نكون المنصة الأولى والأكثر ثقة لإدارة الموارد البشرية في الشرق الأوسط، ونساهم في تحويل أقسام HR من إدارية إلى استراتيجية."
                    : "To be the most trusted and leading HR management platform in the Middle East, and to help transform HR departments from administrative to strategic."}
                </p>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={150}>
              <GlassCard className="p-8 h-full">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Target className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {isArabic ? "رسالتنا" : "Our Mission"}
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {isArabic
                    ? "تمكين أقسام الموارد البشرية من خلال توفير أدوات ذكية وسهلة الاستخدام تُوفر الوقت وتُحسّن الإنتاجية وتُعزز تجربة الموظفين."
                    : "Empowering HR departments by providing smart, easy-to-use tools that save time, improve productivity, and enhance employee experience."}
                </p>
              </GlassCard>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <Badge className="mb-4 bg-purple-500/10 text-purple-600 border-purple-500/20">
              <Heart className="w-4 h-4 me-2" />
              {isArabic ? "قيمنا" : "Our Values"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? "المبادئ التي نؤمن بها" : "The Principles We Believe In"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {isArabic
                ? "هذه القيم توجهنا في كل قرار نتخذه وكل منتج نبنيه"
                : "These values guide us in every decision we make and every product we build"}
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {values.map((value, index) => (
              <ValueCard key={value.title} {...value} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100/50 to-purple-100/30 dark:from-gray-900/50 dark:to-purple-900/20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4 bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
              <Rocket className="w-4 h-4 me-2" />
              {isArabic ? "رحلتنا" : "Our Journey"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? "من الفكرة إلى الواقع" : "From Idea to Reality"}
            </h2>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto space-y-8">
            {timeline.map((item, index) => (
              <TimelineItem
                key={item.year}
                {...item}
                index={index}
                isLast={index === timeline.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection className="text-center mb-12">
            <Badge className="mb-4 bg-blue-500/10 text-blue-600 border-blue-500/20">
              <Users className="w-4 h-4 me-2" />
              {isArabic ? "فريقنا" : "Our Team"}
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {isArabic ? "الأشخاص الذين يجعلون رابِط ممكناً" : "The People Who Make Rabt Possible"}
            </h2>
          </AnimatedSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {team.map((member, index) => (
              <TeamMemberCard key={member.name} {...member} delay={index * 150} />
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-primary via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <StatCard key={stat.label} {...stat} delay={index * 100} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <GlassCard className="max-w-4xl mx-auto p-12 text-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/50 dark:to-purple-950/50">
              <Sparkles className="w-12 h-12 text-primary mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {isArabic ? "هل أنت مستعد للانضمام إلينا؟" : "Ready to Join Us?"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg max-w-2xl mx-auto">
                {isArabic
                  ? "ابدأ رحلتك مع رابِط اليوم ووفر ساعات من العمل الروتيني"
                  : "Start your journey with Rabt today and save hours of routine work"}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/pricing">
                  <Button size="lg" className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white px-8">
                    {isArabic ? "ابدأ الآن" : "Start Now"}
                    <ArrowRight className={`w-5 h-5 ${isArabic ? "rotate-180 me-2" : "ms-2"}`} />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="px-8">
                    {isArabic ? "تحدث مع فريقنا" : "Talk to Our Team"}
                  </Button>
                </Link>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </section>

      {/* Commercial Register Notice */}
      <section className="py-6 bg-amber-50 dark:bg-amber-950/30">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>{isArabic ? "ملاحظة:" : "Note:"}</strong>{" "}
            {isArabic
              ? "السجل التجاري تحت الإصدار. هذه النسخة التجريبية من منصة رابِط."
              : "Commercial registration is under processing. This is the beta version of Rabt platform."}
          </p>
        </div>
      </section>

      <ConnectedPagesSection
        isArabic={isArabic}
        highlight={{ ar: "روابط مباشرة", en: "Direct Links" }}
        title={{
          ar: "اكمل رحلتك من صفحة من نحن",
          en: "Continue your journey from About",
        }}
        subtitle={{
          ar: "انتقل سريعاً إلى الباقات، الأدوات، أو حجز الاستشارات لتجربة المنصة بالكامل.",
          en: "Hop to plans, tools, or consulting bookings to experience the full platform.",
        }}
        className="pb-12"
      />
      <Footer />
    </div>
  );
}
