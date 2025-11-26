/**
 * AI Test Examples - أمثلة اختبار الذكاء الاصطناعي
 * استخدم هذا الملف لاختبار الدوال مباشرة
 */

import { evaluateEmployeePerformance } from "./ai/performance-evaluator";
import { evaluateCandidate, generateInterviewQuestions } from "./ai/hiring-assistant";
import { recommendTraining } from "./ai/training-recommender";

// ========================================
// 1. اختبار تقييم الأداء
// ========================================
async function testPerformanceEvaluation() {
  console.log("🔍 اختبار تقييم الأداء...\n");

  const testData = {
    employeeId: 123,
    employeeName: "أحمد محمد السعيد",
    position: "مطور برمجيات أول",
    department: "تقنية المعلومات",
    joiningDate: "2022-01-15",
    reviewPeriod: "2024",
    metrics: {
      attendanceRate: 95,
      taskCompletionRate: 92,
      qualityScore: 88,
      teamworkScore: 94,
      initiativeScore: 87,
      communicationScore: 91,
      punctualityScore: 96,
    },
    achievements: [
      "أكمل مشروع نظام إدارة الموارد البشرية بنجاح قبل الموعد المحدد",
      "قاد فريق من 5 مطورين في تطوير تطبيق الموبايل",
      "حصل على شهادة AWS Solutions Architect",
    ],
    challenges: [
      "التعامل مع التقنيات الجديدة مثل Kubernetes",
      "إدارة الوقت بين المهام المتعددة",
    ],
    goals: [
      "تعلم React Native وتطوير تطبيق موبايل كامل",
      "قيادة مشروع كبير بشكل مستقل",
      "الحصول على شهادة DevOps Professional",
    ],
    currentSalary: 12000,
    managerNotes: "موظف متميز يظهر قيادة طبيعية",
  };

  try {
    const result = await evaluateEmployeePerformance(testData, "ar");
    console.log("✅ نتيجة التقييم:");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n" + "=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ خطأ في تقييم الأداء:", error);
  }
}

// ========================================
// 2. اختبار تقييم المرشح
// ========================================
async function testCandidateEvaluation() {
  console.log("🔍 اختبار تقييم المرشح...\n");

  const testResume = {
    candidateName: "سارة أحمد الخالدي",
    email: "sara.alkhalidi@example.com",
    phone: "+966501234567",
    summary:
      "مطورة برمجيات متمرسة مع 5 سنوات من الخبرة في تطوير تطبيقات الويب والموبايل",
    skills: [
      "JavaScript",
      "TypeScript",
      "React",
      "React Native",
      "Node.js",
      "Express",
      "MongoDB",
      "PostgreSQL",
      "AWS",
      "Docker",
      "Git",
    ],
    experience: [
      {
        title: "مطورة Full Stack أول",
        company: "شركة التقنية المتقدمة",
        duration: "3 سنوات (2021-2024)",
        responsibilities: [
          "تطوير وصيانة تطبيقات ويب باستخدام React و Node.js",
          "قيادة فريق من 3 مطورين جونيور",
          "تصميم وتنفيذ RESTful APIs",
          "تحسين أداء التطبيقات بنسبة 40%",
          "كتابة اختبارات unit و integration",
        ],
      },
      {
        title: "مطورة Frontend",
        company: "شركة الابتكار الرقمي",
        duration: "2 سنوات (2019-2021)",
        responsibilities: [
          "تطوير واجهات مستخدم تفاعلية باستخدام React",
          "التعاون مع فريق UX/UI لتحسين تجربة المستخدم",
          "تطوير مكونات قابلة لإعادة الاستخدام",
        ],
      },
    ],
    education: [
      {
        degree: "بكالوريوس علوم الحاسب",
        institution: "جامعة الملك سعود",
        year: "2019",
        gpa: "4.5/5.0",
      },
    ],
    certifications: [
      "AWS Certified Solutions Architect",
      "React Developer Certification",
      "MongoDB Certified Developer",
    ],
    languages: [
      {
        language: "العربية",
        proficiency: "Native",
      },
      {
        language: "الإنجليزية",
        proficiency: "Fluent",
      },
    ],
    projects: [
      "نظام إدارة المحتوى CMS باستخدام MERN Stack",
      "تطبيق موبايل للتجارة الإلكترونية باستخدام React Native",
    ],
  };

  const testJobRequirements = {
    title: "مهندسة برمجيات أول",
    department: "الهندسة",
    level: "senior" as const,
    requiredSkills: [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "AWS",
      "Docker",
      "قيادة الفريق",
    ],
    preferredSkills: ["Kubernetes", "GraphQL", "Microservices"],
    minExperience: 5,
    education: ["بكالوريوس علوم الحاسب أو مجال ذي صلة"],
    responsibilities: [
      "قيادة فريق التطوير",
      "تصميم معمارية الأنظمة",
      "مراجعة الكود والإرشاد",
      "التعاون مع الأقسام الأخرى",
    ],
    salary: {
      min: 15000,
      max: 20000,
    },
  };

  try {
    const result = await evaluateCandidate(testResume, testJobRequirements, "ar");
    console.log("✅ نتيجة تقييم المرشح:");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n" + "=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ خطأ في تقييم المرشح:", error);
  }
}

// ========================================
// 3. اختبار توليد أسئلة المقابلة
// ========================================
async function testInterviewQuestions() {
  console.log("🔍 اختبار توليد أسئلة المقابلة...\n");

  const testResume = {
    candidateName: "محمد علي الأحمدي",
    email: "mohamed.alahmadi@example.com",
    phone: "+966502345678",
    skills: ["Python", "Django", "PostgreSQL", "AWS", "Docker", "Redis", "Celery"],
    experience: [
      {
        title: "مطور Backend أول",
        company: "شركة الحلول التقنية",
        duration: "4 سنوات",
        responsibilities: [
          "تطوير APIs باستخدام Django REST Framework",
          "إدارة وتحسين قواعد البيانات PostgreSQL",
          "تطوير مهام asynchronous باستخدام Celery",
          "نشر التطبيقات على AWS",
        ],
      },
    ],
    education: [
      {
        degree: "ماجستير هندسة البرمجيات",
        institution: "جامعة الملك عبدالله للعلوم والتقنية",
        year: "2020",
        gpa: "4.8/5.0",
      },
    ],
  };

  const testJobRequirements = {
    title: "مهندس برمجيات أول - Backend",
    department: "الهندسة",
    level: "senior" as const,
    requiredSkills: ["Python", "Django", "PostgreSQL", "AWS", "Docker", "Microservices"],
    minExperience: 5,
    education: ["ماجستير علوم الحاسب أو مجال ذي صلة"],
    responsibilities: [
      "تصميم وتطوير microservices",
      "قيادة فريق Backend",
      "تحسين الأداء وقابلية التوسع",
    ],
  };

  const focusAreas = [
    "تصميم الأنظمة الموزعة",
    "قيادة الفريق التقني",
    "تحسين أداء قواعد البيانات",
    "الأمان السيبراني",
  ];

  try {
    const result = await generateInterviewQuestions(
      testResume,
      testJobRequirements,
      focusAreas,
      "ar"
    );
    console.log("✅ أسئلة المقابلة:");
    console.log("\n📋 أسئلة تقنية:");
    result.technical.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    console.log("\n💼 أسئلة سلوكية:");
    result.behavioral.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    console.log("\n🎯 أسئلة موقفية:");
    result.situational.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    console.log("\n🏢 أسئلة ثقافة العمل:");
    result.cultureF.forEach((q, i) => console.log(`${i + 1}. ${q}`));
    console.log("\n" + "=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ خطأ في توليد أسئلة المقابلة:", error);
  }
}

// ========================================
// 4. اختبار توصيات التدريب
// ========================================
async function testTrainingRecommendations() {
  console.log("🔍 اختبار توصيات التدريب...\n");

  const testEmployee = {
    id: 789,
    name: "فاطمة حسن العمري",
    position: "محللة بيانات",
    department: "التحليل والذكاء الاصطناعي",
    currentSkills: ["SQL", "Python", "Excel", "Power BI", "Pandas", "NumPy"],
    skillLevels: {
      SQL: "advanced" as const,
      Python: "intermediate" as const,
      Excel: "expert" as const,
      "Power BI": "advanced" as const,
      Pandas: "intermediate" as const,
      NumPy: "intermediate" as const,
    },
    interests: ["Machine Learning", "Deep Learning", "Data Visualization"],
    careerGoals: ["أن أصبح عالمة بيانات", "قيادة فريق تحليل البيانات"],
    performanceScore: 88,
    weakAreas: ["Machine Learning", "Cloud Computing", "Big Data"],
  };

  const testCourses = [
    {
      id: "ML101",
      title: "Introduction to Machine Learning",
      titleAr: "مقدمة في تعلم الآلة",
      provider: "Coursera",
      type: "online" as const,
      duration: "8 أسابيع",
      level: "beginner" as const,
      skills: ["Machine Learning", "Python", "scikit-learn"],
      cost: 2000,
      language: "en" as const,
      certification: true,
      url: "https://coursera.org/ml101",
    },
    {
      id: "DL202",
      title: "Deep Learning Specialization",
      titleAr: "تخصص التعلم العميق",
      provider: "deeplearning.ai",
      type: "online" as const,
      duration: "5 أشهر",
      level: "intermediate" as const,
      skills: ["Deep Learning", "TensorFlow", "Neural Networks"],
      cost: 5000,
      language: "en" as const,
      certification: true,
      url: "https://deeplearning.ai/dl-specialization",
    },
    {
      id: "AWS303",
      title: "AWS for Data Scientists",
      titleAr: "AWS لعلماء البيانات",
      provider: "AWS Training",
      type: "online" as const,
      duration: "3 أسابيع",
      level: "intermediate" as const,
      skills: ["AWS", "Cloud Computing", "S3", "SageMaker"],
      cost: 1500,
      language: "en" as const,
      certification: true,
      url: "https://aws.training/data-science",
    },
    {
      id: "VIZ404",
      title: "Advanced Data Visualization",
      titleAr: "تصور البيانات المتقدم",
      provider: "DataCamp",
      type: "online" as const,
      duration: "4 أسابيع",
      level: "advanced" as const,
      skills: ["Data Visualization", "D3.js", "Tableau"],
      cost: 1200,
      language: "en" as const,
      certification: true,
      url: "https://datacamp.com/viz-advanced",
    },
  ];

  const departmentNeeds = [
    "تحليلات متقدمة باستخدام Machine Learning",
    "معالجة Big Data",
    "تصور البيانات الاحترافي",
  ];

  try {
    const result = await recommendTraining(testEmployee, testCourses, departmentNeeds, "ar");
    console.log("✅ توصيات التدريب:");
    console.log(JSON.stringify(result, null, 2));
    console.log("\n" + "=".repeat(80) + "\n");
  } catch (error) {
    console.error("❌ خطأ في توصيات التدريب:", error);
  }
}

// ========================================
// تشغيل جميع الاختبارات
// ========================================
async function runAllTests() {
  console.log("\n" + "=".repeat(80));
  console.log("🚀 بدء اختبار جميع وحدات الذكاء الاصطناعي");
  console.log("=".repeat(80) + "\n");

  await testPerformanceEvaluation();
  await testCandidateEvaluation();
  await testInterviewQuestions();
  await testTrainingRecommendations();

  console.log("=".repeat(80));
  console.log("✅ اكتملت جميع الاختبارات بنجاح!");
  console.log("=".repeat(80) + "\n");
}

// لتشغيل الاختبارات، قم بإلغاء التعليق على السطر التالي:
// runAllTests().catch(console.error);

// تصدير الدوال للاستخدام الفردي
export {
  testPerformanceEvaluation,
  testCandidateEvaluation,
  testInterviewQuestions,
  testTrainingRecommendations,
  runAllTests,
};
