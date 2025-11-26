import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  AnimatedSection, 
  FadeIn, 
  StaggerContainer,
  StaggerItem,
  AnimatedCard
} from "@/components/ui/animated-card";
import { motion } from "framer-motion";
import {
  Building2,
  UserCheck,
  Users,
  CheckCircle2,
  Brain,
  Smartphone,
  BarChart3,
  Shield,
  Headphones,
  ArrowRight,
  Play,
  Star,
  Zap,
  Award,
  TrendingUp,
  Globe,
  Clock,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { FAQSection } from "@/components/FAQSection";

const heroStats = [
  { value: "5000+", label: "عميل راضٍ", icon: Users },
  { value: "99.9%", label: "معدل الرضا", icon: Star },
  { value: "24/7", label: "دعم متواصل", icon: Clock },
  { value: "50+", label: "خبير قانوني", icon: Award },
];

const categories = [
  {
    id: "companies",
    titleKey: "category.companies",
    descKey: "category.companies.desc",
    icon: Building2,
    gradient: "from-blue-600 via-blue-500 to-cyan-400",
    features: [
      "إدارة شاملة للموارد البشرية",
      "تتبع الحضور والانصراف",
      "إدارة الرواتب والمزايا",
      "تقارير وتحليلات متقدمة",
    ],
    buttonText: "ابدأ الآن",
    borderHover: "hover:border-blue-500",
  },
  {
    id: "individual",
    titleKey: "category.individual",
    descKey: "category.individual.desc",
    icon: UserCheck,
    gradient: "from-purple-600 via-purple-500 to-pink-400",
    features: [
      "استشارات قانونية فورية",
      "حماية حقوقك العمالية",
      "حساب المستحقات بدقة",
      "دعم قانوني متخصص",
    ],
    buttonText: "احجز استشارة",
    badge: "الأكثر شعبية",
    borderHover: "hover:border-purple-500",
  },
  {
    id: "employee",
    titleKey: "category.employee",
    descKey: "category.employee.desc",
    icon: Users,
    gradient: "from-green-600 via-green-500 to-emerald-400",
    features: [
      "إدارة الإجازات بسهولة",
      "تتبع المهام والمشاريع",
      "تقييم الأداء الذاتي",
      "الوصول للوثائق",
    ],
    buttonText: "سجل الآن",
    borderHover: "hover:border-green-500",
  },
];

const features = [
  {
    title: "متوافق مع الأنظمة السعودية",
    description: "نظام شامل يتماشى مع قوانين العمل السعودية ومتطلبات وزارة الموارد البشرية",
    icon: CheckCircle2,
    gradient: "from-green-500 to-emerald-600",
  },
  {
    title: "ذكاء اصطناعي متقدم",
    description: "تحليلات ذكية وتوصيات مدعومة بالذكاء الاصطناعي لتحسين إدارة الموارد البشرية",
    icon: Brain,
    gradient: "from-purple-500 to-pink-600",
  },
  {
    title: "سهل الاستخدام",
    description: "واجهة بديهية وسهلة الاستخدام على جميع الأجهزة مع تجربة مستخدم استثنائية",
    icon: Smartphone,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    title: "تقارير شاملة",
    description: "تقارير وتحليلات متقدمة تساعدك في اتخاذ قرارات مبنية على البيانات",
    icon: BarChart3,
    gradient: "from-orange-500 to-red-600",
  },
  {
    title: "أمان عالي",
    description: "حماية متقدمة لبياناتك مع التشفير الكامل والامتثال للمعايير الدولية",
    icon: Shield,
    gradient: "from-indigo-500 to-purple-600",
  },
  {
    title: "دعم فني متميز",
    description: "فريق دعم متواجد على مدار الساعة لمساعدتك في أي وقت",
    icon: Headphones,
    gradient: "from-teal-500 to-green-600",
  },
];

const steps = [
  {
    number: "1",
    title: "سجل حسابك",
    description: "إنشاء حساب مجاني في دقائق معدودة",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    number: "2",
    title: "اختر الخطة المناسبة",
    description: "اختر من بين باقاتنا المتنوعة حسب احتياجاتك",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    number: "3",
    title: "ابدأ الاستخدام",
    description: "استمتع بجميع المميزات فوراً بعد التسجيل",
    gradient: "from-green-500 to-emerald-500",
  },
];

export default function EnhancedHome() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section - Enhanced */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20 blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute -bottom-20 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Hero Content */}
            <FadeIn direction="left">
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Badge className="mb-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                    <Zap className="mr-2 h-4 w-4" />
                    الحل الأمثل للموارد البشرية في السعودية
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-5xl font-bold leading-tight tracking-tight lg:text-7xl"
                >
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ربط
                  </span>
                  <br />
                  <span className="text-foreground">
                    نظام الموارد البشرية الذكي
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl text-muted-foreground lg:text-2xl"
                >
                  حلول متكاملة لإدارة الموارد البشرية مدعومة بالذكاء الاصطناعي
                  ومتوافقة مع الأنظمة السعودية
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="flex flex-wrap gap-4"
                >
                  <Button
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-lg shadow-xl transition-all hover:scale-105 hover:shadow-2xl"
                    asChild
                  >
                    <Link href="/signup">
                      ابدأ مجاناً
                      <ArrowRight className="mr-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 text-lg transition-all hover:scale-105"
                  >
                    <Play className="ml-2 h-5 w-5" />
                    شاهد الفيديو التوضيحي
                  </Button>
                </motion.div>

                {/* Hero Stats */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-2 gap-4 pt-8 md:grid-cols-4"
                >
                  {heroStats.map((stat, index) => (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="text-center"
                    >
                      <div className="mb-2 flex justify-center">
                        <stat.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <div className="text-sm text-muted-foreground">
                        {stat.label}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </FadeIn>

            {/* Hero Image/Illustration */}
            <FadeIn direction="right" delay={0.3}>
              <div className="relative">
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-1 shadow-2xl"
                >
                  <div className="rounded-xl bg-background p-8">
                    <img
                      src="/hero-illustration.svg"
                      alt="Rabit HR System"
                      className="w-full"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    {/* Placeholder if image doesn't exist */}
                    <div className="flex h-96 items-center justify-center">
                      <Globe className="h-48 w-48 text-primary/20" />
                    </div>
                  </div>
                </motion.div>

                {/* Floating Cards */}
                <motion.div
                  animate={{
                    y: [0, 15, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-8 top-20 hidden lg:block"
                >
                  <Card className="shadow-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-green-500/10 p-2">
                          <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">إنتاجية أعلى</div>
                          <div className="text-2xl font-bold text-green-500">
                            +45%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  animate={{
                    y: [0, -15, 0],
                  }}
                  transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-8 bottom-20 hidden lg:block"
                >
                  <Card className="shadow-xl">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-blue-500/10 p-2">
                          <Clock className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-sm font-medium">توفير الوقت</div>
                          <div className="text-2xl font-bold text-blue-500">
                            70%
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Categories Section - Enhanced */}
      <AnimatedSection className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <FadeIn>
            <Badge className="mb-4">خدماتنا</Badge>
            <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
              اختر الحل المناسب لك
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              نقدم حلولاً متنوعة تناسب جميع احتياجاتك في إدارة الموارد البشرية
            </p>
          </FadeIn>
        </div>

        <StaggerContainer className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <StaggerItem key={category.id}>
              <AnimatedCard
                delay={index * 0.1}
                className={`group relative h-full overflow-hidden border-2 transition-all duration-300 ${category.borderHover}`}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-300 group-hover:opacity-10 ${category.gradient}`}
                />

                <CardContent className="relative p-8">
                  {category.badge && (
                    <Badge className="absolute left-4 top-4 bg-gradient-to-r from-purple-600 to-pink-600">
                      {category.badge}
                    </Badge>
                  )}

                  {/* Icon */}
                  <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.6 }}
                    className={`mb-6 inline-flex rounded-2xl bg-gradient-to-br p-4 ${category.gradient}`}
                  >
                    <category.icon className="h-10 w-10 text-white" />
                  </motion.div>

                  <h3 className="mb-3 text-2xl font-bold">
                    {t(category.titleKey)}
                  </h3>
                  <p className="mb-6 text-muted-foreground">
                    {t(category.descKey)}
                  </p>

                  {/* Features List */}
                  <div className="mb-8 space-y-3">
                    {category.features.map((feature, idx) => (
                      <motion.div
                        key={`feature-${category.id}-${idx}`}
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                        <div className="text-sm">{feature}</div>
                      </motion.div>
                    ))}
                  </div>

                  <Button
                    className={`w-full bg-gradient-to-r ${category.gradient} shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
                    asChild
                  >
                    <Link href="/signup">
                      {category.buttonText}
                      <ArrowRight className="mr-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </AnimatedCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </AnimatedSection>

      {/* Features Section - Enhanced */}
      <AnimatedSection className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <FadeIn>
              <Badge className="mb-4">المميزات</Badge>
              <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
                لماذا تختار ربط؟
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                نوفر لك أفضل الأدوات والتقنيات لإدارة موارد بشرية فعالة
              </p>
            </FadeIn>
          </div>

          <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <Card className="group h-full border-0 shadow-lg transition-all duration-300 hover:shadow-2xl">
                    <CardContent className="p-6">
                      <motion.div
                        whileHover={{ rotate: 360 }}
                        transition={{ duration: 0.6 }}
                        className={`mb-4 inline-flex rounded-xl bg-gradient-to-br p-3 ${feature.gradient}`}
                      >
                        <feature.icon className="h-6 w-6 text-white" />
                      </motion.div>
                      <h3 className="mb-3 text-xl font-bold">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </AnimatedSection>

      {/* How It Works - Enhanced */}
      <AnimatedSection className="container mx-auto px-4 py-20">
        <div className="mb-12 text-center">
          <FadeIn>
            <Badge className="mb-4">كيف تبدأ</Badge>
            <h2 className="mb-4 text-4xl font-bold lg:text-5xl">
              ابدأ في 3 خطوات بسيطة
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              عملية سهلة وسريعة للبدء في استخدام نظام ربط
            </p>
          </FadeIn>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-1 -translate-x-1/2 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 lg:block" />

          <div className="space-y-12">
            {steps.map((step, index) => (
              <FadeIn key={step.number} delay={index * 0.2}>
                <div
                  className={`flex items-center gap-8 ${
                    index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                  }`}
                >
                  <div className="flex-1">
                    <Card className="group border-2 shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                      <CardContent className="p-8">
                        <h3 className="mb-3 text-2xl font-bold">
                          {step.title}
                        </h3>
                        <p className="text-muted-foreground">
                          {step.description}
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.2, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                    className={`flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${step.gradient} text-3xl font-bold text-white shadow-2xl`}
                  >
                    {step.number}
                  </motion.div>

                  <div className="hidden flex-1 lg:block" />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* CTA Section - Enhanced */}
      <AnimatedSection className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 py-20">
        <div className="absolute inset-0 bg-grid-white/10" />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl"
        />

        <div className="container relative mx-auto px-4">
          <FadeIn>
            <div className="mx-auto max-w-3xl text-center text-white">
              <h2 className="mb-6 text-4xl font-bold lg:text-6xl">
                هل أنت مستعد للبدء؟
              </h2>
              <p className="mb-8 text-xl opacity-90">
                انضم إلى آلاف الشركات التي تثق بنظام ربط لإدارة مواردها البشرية
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-white text-lg text-purple-600 transition-all hover:scale-105 hover:bg-white/90"
                  asChild
                >
                  <Link href="/signup">
                    ابدأ الآن مجاناً
                    <ArrowRight className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-lg text-white transition-all hover:scale-105 hover:bg-white/10"
                  asChild
                >
                  <Link href="/contact">
                    تواصل معنا
                  </Link>
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </AnimatedSection>

      {/* FAQ Section */}
      <AnimatedSection className="container mx-auto px-4 py-20">
        <FAQSection />
      </AnimatedSection>

      {/* Footer */}
      <Footer />
    </div>
  );
}
