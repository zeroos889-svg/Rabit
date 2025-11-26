# 🚀 Quick Start - AI Tools

## تشغيل سريع للأدوات الجديدة

### ✅ ما تم إضافته

تم تطوير **3 وحدات ذكاء اصطناعي** احترافية جديدة:

1. **📊 AI Performance Evaluator** - تقييم أداء الموظفين
2. **🎯 AI Hiring Assistant** - مساعد التوظيف  
3. **🎓 AI Training Recommender** - نظام التوصية بالتدريب

---

## 🔧 الملفات المهمة

```
server/ai/
  ├── performance-evaluator.ts    # تقييم الأداء (541 سطر)
  ├── hiring-assistant.ts         # التوظيف (587 سطر)
  └── training-recommender.ts     # التدريب (513 سطر)

server/routes/
  └── ai-advanced.ts              # API Routes (183 سطر)

client/src/pages/
  └── AIPerformanceEvaluator.tsx  # واجهة التقييم (450 سطر)

docs/
  ├── AI_TOOLS_GUIDE.md          # دليل كامل (585 سطر)
  └── AI_DEVELOPMENT_SUMMARY.md  # ملخص التطوير
```

---

## ⚡ استخدام سريع

### مثال 1: تقييم أداء موظف

```typescript
import { evaluateEmployeePerformance } from "@/server/ai/performance-evaluator";

const evaluation = await evaluateEmployeePerformance({
  employeeId: 123,
  employeeName: "أحمد محمد",
  position: "مطور برمجيات",
  department: "تقنية المعلومات",
  joiningDate: "2022-01-15",
  reviewPeriod: "2024 Q4",
  metrics: {
    attendanceRate: 95,
    taskCompletionRate: 90,
    qualityScore: 88,
    teamworkScore: 92,
    initiativeScore: 85,
    communicationScore: 87,
    punctualityScore: 96,
  },
  currentSalary: 15000,
}, "ar");

console.log(evaluation.overallScore); // 89
console.log(evaluation.rating);       // "ممتاز"
console.log(evaluation.strengths);    // ["انضباط عالي", "جودة ممتازة"]
```

### مثال 2: تقييم مرشح

```typescript
import { evaluateCandidate } from "@/server/ai/hiring-assistant";

const evaluation = await evaluateCandidate({
  candidateName: "سارة علي",
  email: "sara@email.com",
  phone: "+966501234567",
  skills: ["React", "TypeScript", "Node.js"],
  experience: [{
    title: "Frontend Developer",
    company: "Tech Corp",
    duration: "2 years",
    responsibilities: ["Developed React apps"]
  }],
  education: [{
    degree: "Bachelor in CS",
    institution: "KSU",
    year: "2021"
  }]
}, {
  title: "Senior Frontend Developer",
  requiredSkills: ["React", "TypeScript"],
  minimumExperience: 2,
  education: "Bachelor's degree",
  responsibilities: []
}, "ar");

console.log(evaluation.matchPercentage); // 85
console.log(evaluation.recommendation);  // "يُنصح بشدة"
```

### مثال 3: توصيات تدريب

```typescript
import { recommendTraining } from "@/server/ai/training-recommender";

const recommendations = await recommendTraining({
  id: 456,
  name: "خالد أحمد",
  position: "محلل بيانات",
  department: "التحليلات",
  currentSkills: ["Excel", "SQL"],
  skillLevels: {
    "Excel": "advanced",
    "SQL": "intermediate",
  },
  targetSkills: ["Python", "Machine Learning"]
}, [], "ar");

console.log(recommendations.recommendations); // قائمة الدورات المقترحة
console.log(recommendations.totalCost);       // التكلفة الإجمالية
```

---

## 🌐 من Frontend

### استخدام tRPC:

```typescript
import { trpc } from "@/lib/trpc";

function MyComponent() {
  const { mutate, data, isLoading } = 
    trpc.aiAdvanced.evaluatePerformance.useMutation();

  const handleEvaluate = () => {
    mutate({
      employeeId: 123,
      employeeName: "أحمد",
      position: "مطور",
      department: "IT",
      joiningDate: "2022-01-01",
      reviewPeriod: "2024 Q4",
      metrics: {
        attendanceRate: 95,
        taskCompletionRate: 90,
        qualityScore: 85,
        teamworkScore: 90,
        initiativeScore: 80,
        communicationScore: 85,
        punctualityScore: 95,
      },
      language: "ar",
    });
  };

  return (
    <button onClick={handleEvaluate} disabled={isLoading}>
      {isLoading ? "جاري التقييم..." : "تقييم الأداء"}
    </button>
  );
}
```

---

## 📱 الصفحات الجاهزة

### صفحة تقييم الأداء

**المسار:** `/ai/performance-evaluator`

**الميزات:**
- ✅ نموذج كامل مع validation
- ✅ Sliders للمعدلات
- ✅ عرض نتائج مفصل
- ✅ دعم RTL

**كيفية الإضافة إلى Router:**

```typescript
// في app.tsx أو routing file
import AIPerformanceEvaluator from "@/pages/AIPerformanceEvaluator";

// أضف إلى routes:
{
  path: "/ai/performance-evaluator",
  element: <AIPerformanceEvaluator />
}
```

---

## 🔗 Deepseek Configuration

تأكد من وجود المتغيرات في `.env`:

```bash
DEEPSEEK_API_KEY=sk-fb660854bff04fba9169c72c176a4b73
DEEPSEEK_BASE_URL=https://api.deepseek.com
```

جميع الوحدات تستخدم `invokeLLM()` تلقائياً.

---

## 📚 التوثيق الكامل

للتفاصيل الكاملة، راجع:
- **`docs/AI_TOOLS_GUIDE.md`** - دليل شامل لكل دالة
- **`docs/AI_DEVELOPMENT_SUMMARY.md`** - ملخص التطوير

---

## ✅ نصائح سريعة

1. **جميع الدوال تدعم عربي/إنجليزي:**
   ```typescript
   await someFunction(data, "ar"); // عربي
   await someFunction(data, "en"); // إنجليزي
   ```

2. **معالجة الأخطاء مدمجة:**
   - كل دالة لديها try-catch
   - Fallback responses جاهزة
   - Error messages واضحة

3. **النتائج دائماً JSON:**
   - سهولة في التعامل
   - Type-safe مع TypeScript
   - Ready for display

---

## 🎯 الأهداف المحققة

✅ 3 وحدات AI احترافية (2,859 سطر)
✅ تكامل كامل مع Deepseek API  
✅ دعم ثنائي اللغة (عربي/إنجليزي)
✅ واجهة مستخدم جاهزة
✅ توثيق شامل ومفصل
✅ معالجة متقدمة للأخطاء
✅ Type-safe بالكامل

---

## 🚀 البداية السريعة

### خطوة 1: تأكد من تكوين Deepseek
```bash
# في .env
DEEPSEEK_API_KEY=your-key-here
```

### خطوة 2: استورد الدالة المطلوبة
```typescript
import { evaluateEmployeePerformance } from "@/server/ai/performance-evaluator";
```

### خطوة 3: استدعِ الدالة
```typescript
const result = await evaluateEmployeePerformance(data, "ar");
```

### خطوة 4: استخدم النتائج
```typescript
console.log(result.overallScore);
console.log(result.strengths);
console.log(result.recommendations);
```

---

**Status:** ✅ READY TO USE
**Support:** راجع `AI_TOOLS_GUIDE.md` للتفاصيل
