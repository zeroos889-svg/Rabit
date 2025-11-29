import { memo, useRef, useEffect, useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { Footer } from "@/components/Footer";
import { ConnectedPagesSection } from "@/components/ConnectedPagesSection";
import { QuickActionsBar } from "@/components/QuickActionsBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
  FileText,
  Users,
  Briefcase,
  Scale,
  Lightbulb,
  ChevronLeft,
  Sparkles,
  Eye,
  Tag,
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

// Blog Post Card Component
const BlogPostCard = memo(function BlogPostCard({
  post,
  featured = false,
  delay = 0,
}: {
  post: BlogPost;
  featured?: boolean;
  delay?: number;
}) {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";

  return (
    <AnimatedSection delay={delay}>
      <Link href={`/blog/${post.id}`}>
        <GlassCard className={`h-full group cursor-pointer ${featured ? "" : ""}`}>
          {/* Image */}
          <div className={`relative overflow-hidden ${featured ? "h-56" : "h-48"}`}>
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Badge
              className={`absolute top-4 ${isArabic ? "right-4" : "left-4"} bg-primary/90 text-white border-0`}
            >
              {post.categoryName}
            </Badge>
            {featured && (
              <Badge className={`absolute top-4 ${isArabic ? "left-4" : "right-4"} bg-amber-500 text-white border-0`}>
                <TrendingUp className="w-3 h-3 me-1" />
                {isArabic ? "مميز" : "Featured"}
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="p-6">
            <h3 className={`font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors line-clamp-2 ${featured ? "text-xl" : "text-lg"}`}>
              {post.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
              {post.excerpt}
            </p>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
              <div className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(post.date).toLocaleDateString(isArabic ? "ar-SA" : "en-US")}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span>{post.readTime}</span>
              </div>
            </div>

            {/* Read More */}
            <div className={`mt-4 flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all`}>
              <span>{isArabic ? "اقرأ المزيد" : "Read More"}</span>
              <ArrowRight className={`w-4 h-4 ${isArabic ? "rotate-180" : ""}`} />
            </div>
          </div>
        </GlassCard>
      </Link>
    </AnimatedSection>
  );
});

// Category Button Component
const CategoryButton = memo(function CategoryButton({
  id,
  name,
  icon: Icon,
  color,
  isSelected,
  onClick,
}: {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-5 py-2.5 rounded-full
        transition-all duration-300 whitespace-nowrap
        ${isSelected
          ? `bg-gradient-to-r ${color} text-white shadow-lg`
          : "bg-white/70 dark:bg-gray-800/70 hover:bg-white dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
        }
      `}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm font-medium">{name}</span>
    </button>
  );
});

// Types
interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  categoryName: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
  featured: boolean;
}

export default function BlogRedesigned() {
  const { i18n, t } = useTranslation();
  const isArabic = i18n.language === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Categories
  const categories = [
    {
      id: "all",
      name: isArabic ? "الكل" : "All",
      icon: BookOpen,
      color: "from-primary to-purple-600",
    },
    {
      id: "hr-tips",
      name: isArabic ? "نصائح HR" : "HR Tips",
      icon: Lightbulb,
      color: "from-amber-500 to-orange-600",
    },
    {
      id: "labor-law",
      name: isArabic ? "نظام العمل" : "Labor Law",
      icon: Scale,
      color: "from-purple-500 to-pink-600",
    },
    {
      id: "recruitment",
      name: isArabic ? "التوظيف" : "Recruitment",
      icon: Users,
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "management",
      name: isArabic ? "الإدارة" : "Management",
      icon: Briefcase,
      color: "from-blue-500 to-cyan-600",
    },
    {
      id: "news",
      name: isArabic ? "أخبار" : "News",
      icon: TrendingUp,
      color: "from-red-500 to-rose-600",
    },
  ];

  // Blog Posts
  const blogPosts: BlogPost[] = [
    {
      id: "1",
      title: isArabic
        ? "دليلك الشامل لحساب نهاية الخدمة وفق نظام العمل السعودي 2024"
        : "Complete Guide to End of Service Calculation According to Saudi Labor Law 2024",
      excerpt: isArabic
        ? "تعرف على كيفية حساب مكافأة نهاية الخدمة بشكل صحيح وفق المادة 84 من نظام العمل السعودي، مع أمثلة عملية وحالات خاصة."
        : "Learn how to correctly calculate end of service benefits according to Article 84 of Saudi Labor Law, with practical examples and special cases.",
      category: "labor-law",
      categoryName: isArabic ? "نظام العمل" : "Labor Law",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2024-01-15",
      readTime: isArabic ? "8 دقائق" : "8 min",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=400&fit=crop",
      featured: true,
    },
    {
      id: "2",
      title: isArabic
        ? "10 أخطاء شائعة في إدارة الموارد البشرية وكيفية تجنبها"
        : "10 Common HR Management Mistakes and How to Avoid Them",
      excerpt: isArabic
        ? "اكتشف الأخطاء الأكثر شيوعاً التي تقع فيها أقسام الموارد البشرية وتعلم كيفية تجنبها لتحسين كفاءة فريقك."
        : "Discover the most common mistakes HR departments make and learn how to avoid them to improve your team's efficiency.",
      category: "hr-tips",
      categoryName: isArabic ? "نصائح HR" : "HR Tips",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2024-01-12",
      readTime: isArabic ? "6 دقائق" : "6 min",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop",
      featured: true,
    },
    {
      id: "3",
      title: isArabic
        ? "كيف تبني نظام توظيف فعال باستخدام ATS"
        : "How to Build an Effective Recruitment System Using ATS",
      excerpt: isArabic
        ? "خطوات عملية لبناء نظام تتبع المتقدمين (ATS) يوفر وقتك ويساعدك في اختيار أفضل المرشحين لشركتك."
        : "Practical steps to build an Applicant Tracking System (ATS) that saves your time and helps you select the best candidates.",
      category: "recruitment",
      categoryName: isArabic ? "التوظيف" : "Recruitment",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2024-01-10",
      readTime: isArabic ? "10 دقائق" : "10 min",
      image: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&h=400&fit=crop",
      featured: true,
    },
    {
      id: "4",
      title: isArabic
        ? "التحديثات الجديدة في نظام العمل السعودي لعام 2024"
        : "New Updates in Saudi Labor Law for 2024",
      excerpt: isArabic
        ? "ملخص شامل لأهم التعديلات والتحديثات على نظام العمل السعودي وتأثيرها على الشركات والموظفين."
        : "Comprehensive summary of the most important amendments and updates to Saudi Labor Law and their impact on companies and employees.",
      category: "news",
      categoryName: isArabic ? "أخبار" : "News",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2024-01-08",
      readTime: isArabic ? "7 دقائق" : "7 min",
      image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=400&fit=crop",
      featured: false,
    },
    {
      id: "5",
      title: isArabic
        ? "أنواع الإجازات في نظام العمل السعودي وكيفية حسابها"
        : "Types of Leave in Saudi Labor Law and How to Calculate Them",
      excerpt: isArabic
        ? "دليل مفصل لجميع أنواع الإجازات المتاحة للموظفين في السعودية وطريقة احتسابها وفق النظام."
        : "Detailed guide to all types of leave available to employees in Saudi Arabia and how to calculate them according to the law.",
      category: "labor-law",
      categoryName: isArabic ? "نظام العمل" : "Labor Law",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2024-01-05",
      readTime: isArabic ? "9 دقائق" : "9 min",
      image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800&h=400&fit=crop",
      featured: false,
    },
    {
      id: "6",
      title: isArabic
        ? "كيف تكتب خطاب توظيف احترافي يجذب أفضل المواهب"
        : "How to Write a Professional Job Offer Letter That Attracts Top Talent",
      excerpt: isArabic
        ? "نصائح عملية وأمثلة لكتابة خطابات توظيف فعالة تعكس احترافية شركتك وتجذب المرشحين المميزين."
        : "Practical tips and examples for writing effective job offer letters that reflect your company's professionalism.",
      category: "recruitment",
      categoryName: isArabic ? "التوظيف" : "Recruitment",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2024-01-03",
      readTime: isArabic ? "5 دقائق" : "5 min",
      image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&h=400&fit=crop",
      featured: false,
    },
    {
      id: "7",
      title: isArabic
        ? "استراتيجيات فعالة لتحسين رضا الموظفين والاحتفاظ بهم"
        : "Effective Strategies to Improve Employee Satisfaction and Retention",
      excerpt: isArabic
        ? "تعرف على أفضل الممارسات والاستراتيجيات التي تساعدك في بناء بيئة عمل إيجابية وتقليل معدل دوران الموظفين."
        : "Learn the best practices and strategies that help you build a positive work environment and reduce employee turnover.",
      category: "management",
      categoryName: isArabic ? "الإدارة" : "Management",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2024-01-01",
      readTime: isArabic ? "8 دقائق" : "8 min",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=400&fit=crop",
      featured: false,
    },
    {
      id: "8",
      title: isArabic
        ? "الذكاء الاصطناعي في الموارد البشرية: الحاضر والمستقبل"
        : "AI in Human Resources: Present and Future",
      excerpt: isArabic
        ? "كيف يغير الذكاء الاصطناعي مجال الموارد البشرية وما هي الأدوات التي يمكنك استخدامها اليوم."
        : "How AI is changing the HR field and what tools you can use today.",
      category: "hr-tips",
      categoryName: isArabic ? "نصائح HR" : "HR Tips",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2023-12-28",
      readTime: isArabic ? "11 دقيقة" : "11 min",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
      featured: false,
    },
    {
      id: "9",
      title: isArabic
        ? "حقوق الموظف عند إنهاء العقد: ما يجب أن تعرفه"
        : "Employee Rights Upon Contract Termination: What You Need to Know",
      excerpt: isArabic
        ? "دليل شامل لحقوق الموظف القانونية عند إنهاء عقد العمل، سواء كان الإنهاء من الموظف أو صاحب العمل."
        : "Comprehensive guide to employee legal rights upon employment contract termination, whether by employee or employer.",
      category: "labor-law",
      categoryName: isArabic ? "نظام العمل" : "Labor Law",
      author: isArabic ? "فريق رابِط" : "Rabt Team",
      date: "2023-12-25",
      readTime: isArabic ? "7 دقائق" : "7 min",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=400&fit=crop",
      featured: false,
    },
  ];

  // Filter posts
  const filteredPosts = blogPosts.filter(
    (post) =>
      (selectedCategory === "all" || post.category === selectedCategory) &&
      (searchQuery === "" ||
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const featuredPosts = filteredPosts.filter((post) => post.featured);
  const regularPosts = filteredPosts.filter((post) => !post.featured);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Back Button */}
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary mb-8 transition-colors">
            <ChevronLeft className={`w-5 h-5 ${isArabic ? "rotate-180" : ""}`} />
            {isArabic ? "العودة للرئيسية" : "Back to Home"}
          </Link>

          <AnimatedSection className="text-center">
            <div className="inline-flex items-center justify-center p-4 rounded-full bg-gradient-to-br from-primary to-purple-600 mb-6 shadow-lg">
              <FileText className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-primary via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {isArabic ? "مدونة رابِط" : "Rabt Blog"}
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
              {isArabic
                ? "مقالات ونصائح حول الموارد البشرية ونظام العمل السعودي"
                : "Articles and tips about HR and Saudi Labor Law"}
            </p>
          </AnimatedSection>
        </div>
      </section>
      <QuickActionsBar isArabic={isArabic} />

      {/* Search & Filter Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <AnimatedSection delay={100}>
            <GlassCard className="p-6 mb-8 max-w-3xl mx-auto">
              <div className="relative">
                <Search className={`absolute top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 ${isArabic ? "right-4" : "left-4"}`} />
                <Input
                  placeholder={isArabic ? "ابحث في المقالات..." : "Search articles..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`${isArabic ? "pr-12 text-right" : "pl-12"} h-12 text-lg bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50`}
                />
              </div>
            </GlassCard>
          </AnimatedSection>

          {/* Category Filters */}
          <AnimatedSection delay={200} className="mb-12">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  {...category}
                  isSelected={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-8">
          <div className="container mx-auto px-4">
            <AnimatedSection className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {isArabic ? "مقالات مميزة" : "Featured Articles"}
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-6">
              {featuredPosts.map((post, index) => (
                <BlogPostCard key={post.id} post={post} featured delay={index * 100} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-8 pb-20">
        <div className="container mx-auto px-4">
          {regularPosts.length > 0 && (
            <>
              <AnimatedSection className="flex items-center gap-3 mb-8">
                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isArabic ? "جميع المقالات" : "All Articles"}
                </h2>
              </AnimatedSection>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, index) => (
                  <BlogPostCard key={post.id} post={post} delay={index * 100} />
                ))}
              </div>
            </>
          )}

          {/* No Results */}
          {filteredPosts.length === 0 && (
            <AnimatedSection>
              <GlassCard className="p-12 text-center max-w-md mx-auto">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  {isArabic ? "لم نجد مقالات" : "No Articles Found"}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isArabic
                    ? "جرب البحث بكلمات مختلفة أو اختر فئة أخرى"
                    : "Try searching with different words or choose another category"}
                </p>
              </GlassCard>
            </AnimatedSection>
          )}
        </div>
      </section>

      <ConnectedPagesSection
        isArabic={isArabic}
        highlight={{ ar: "انتقل بسهولة", en: "Keep Exploring" }}
        title={{
          ar: "استمر في رحلتك بعد قراءة المقالات",
          en: "Continue your journey after reading",
        }}
        subtitle={{
          ar: "اذهب للباقات، الأدوات، أو حجز الاستشارات لتطبيق ما تعلمته فوراً.",
          en: "Jump to plans, tools, or consulting bookings to apply insights immediately.",
        }}
        className="pt-6"
      />

      {/* Newsletter CTA */}
      <section className="py-16 bg-gradient-to-br from-primary via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.4%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection className="text-center text-white">
            <Sparkles className="w-16 h-16 mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {isArabic ? "اشترك في النشرة البريدية" : "Subscribe to Newsletter"}
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              {isArabic
                ? "احصل على أحدث المقالات والنصائح مباشرة في بريدك الإلكتروني"
                : "Get the latest articles and tips directly to your email"}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                placeholder={isArabic ? "بريدك الإلكتروني" : "Your email"}
                className={`bg-white text-gray-900 h-12 ${isArabic ? "text-right" : ""}`}
              />
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 whitespace-nowrap">
                {isArabic ? "اشترك الآن" : "Subscribe Now"}
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <Footer />
    </div>
  );
}
