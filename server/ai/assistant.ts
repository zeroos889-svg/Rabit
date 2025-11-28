/**
 * AI Assistant Module - Advanced HR AI Assistant
 * مساعد الذكاء الاصطناعي المتقدم للموارد البشرية
 */

import { callLLM, type Message } from "../_core/llm";

export interface AIAssistantContext {
  userType: "employee" | "company" | "consultant" | "admin";
  language: "ar" | "en";
  conversationHistory?: Message[];
  companyContext?: {
    industry?: string;
    size?: string;
    location?: string;
  };
}

export interface AIResponse {
  message: string;
  suggestions?: string[];
  relatedTopics?: string[];
  confidence: number;
  sources?: string[];
}

/**
 * System prompts for different contexts
 */
const SYSTEM_PROMPTS = {
  ar: {
    general: `أنت مساعد ذكي متخصص في إدارة الموارد البشرية والقوانين العمالية السعودية. 
    
مسؤولياتك:
- الإجابة على أسئلة الموارد البشرية بدقة واحترافية
- تقديم نصائح قانونية وفق نظام العمل السعودي
- المساعدة في حساب المستحقات والإجازات
- اقتراح أفضل الممارسات في إدارة الموارد البشرية
- توليد محتوى احترافي للخطابات والمستندات

قواعد الإجابة:
1. استخدم لغة عربية فصحى واضحة ومباشرة
2. اذكر المواد القانونية ذات الصلة من نظام العمل السعودي
3. قدم أمثلة عملية عند الحاجة
4. نبّه على النقاط القانونية المهمة
5. اقترح خطوات عملية قابلة للتنفيذ

عند عدم التأكد من معلومة، صرح بذلك واقترح استشارة متخصص قانوني.`,

    employee: `أنت مساعد ذكي متخصص في مساعدة الموظفين في فهم حقوقهم ومسؤولياتهم.

ركز على:
- حقوق الموظف في نظام العمل السعودي
- حساب الإجازات والمستحقات
- كيفية التعامل مع المواقف الصعبة في العمل
- النصائح للتطوير المهني

استخدم لغة بسيطة ومشجعة، وقدم إجابات واضحة ومباشرة.`,

    company: `أنت مساعد ذكي متخصص في مساعدة إدارات الموارد البشرية في الشركات.

ركز على:
- الامتثال القانوني لنظام العمل السعودي
- أفضل الممارسات في إدارة الموارد البشرية
- حلول للمشاكل الشائعة في إدارة الموظفين
- استراتيجيات تحسين الأداء والإنتاجية
- إجراءات التوظيف والفصل القانونية

قدم نصائح استراتيجية واحترافية تساعد على اتخاذ قرارات مدروسة.`,

    consultant: `أنت مساعد ذكي متخصص في دعم مستشاري الموارد البشرية.

ركز على:
- تحليل معمق للقضايا المعقدة
- مراجع قانونية دقيقة
- أمثلة ودراسات حالة
- توصيات قابلة للتطبيق على العملاء
- أدوات وموارد مفيدة

قدم معلومات متخصصة وعميقة تساعد المستشار في تقديم خدمة احترافية.`,

    admin: `أنت مساعد ذكي متخصص في دعم مديري النظام والمسؤولين.

ركز على:
- إدارة المستخدمين والصلاحيات
- تقارير النظام والإحصائيات
- الإعدادات والتخصيص
- أفضل ممارسات الأمان والخصوصية

قدم معلومات تقنية وإدارية دقيقة.`,
  },

  en: {
    general: `You are an AI assistant specialized in Human Resources management and Saudi Labor Law.

Your responsibilities:
- Answer HR questions accurately and professionally
- Provide legal advice according to Saudi Labor Law
- Help calculate entitlements and leave balances
- Suggest best practices in HR management
- Generate professional content for letters and documents

Answer guidelines:
1. Use clear and direct professional English
2. Cite relevant articles from Saudi Labor Law
3. Provide practical examples when needed
4. Highlight important legal points
5. Suggest actionable steps

When unsure about information, state that and suggest consulting a legal specialist.`,

    employee: `You are an AI assistant specialized in helping employees understand their rights and responsibilities.

Focus on:
- Employee rights under Saudi Labor Law
- Calculating leave and entitlements
- How to handle difficult workplace situations
- Professional development advice

Use simple and encouraging language, provide clear and direct answers.`,

    company: `You are an AI assistant specialized in helping HR departments in companies.

Focus on:
- Legal compliance with Saudi Labor Law
- HR management best practices
- Solutions to common employee management problems
- Performance and productivity improvement strategies
- Legal hiring and termination procedures

Provide strategic and professional advice to help make informed decisions.`,

    consultant: `You are an AI assistant specialized in supporting HR consultants.

Focus on:
- In-depth analysis of complex issues
- Accurate legal references
- Examples and case studies
- Actionable recommendations for clients
- Useful tools and resources

Provide specialized and deep information to help consultants deliver professional services.`,

    admin: `You are an AI assistant specialized in supporting system administrators.

Focus on:
- User management and permissions
- System reports and statistics
- Settings and customization
- Security and privacy best practices

Provide accurate technical and administrative information.`,
  },
};

/**
 * Get appropriate system prompt based on context
 */
function getSystemPrompt(context: AIAssistantContext): string {
  const langPrompts = SYSTEM_PROMPTS[context.language];
  return langPrompts[context.userType] || langPrompts.general;
}

/**
 * Main AI Assistant function
 */
export async function getAIAssistantResponse(
  userMessage: string,
  context: AIAssistantContext
): Promise<AIResponse> {
  try {
    // Build messages array
    const messages: Message[] = [
      {
        role: "system",
        content: getSystemPrompt(context),
      },
      // Add conversation history if available
      ...(context.conversationHistory || []),
      {
        role: "user",
        content: userMessage,
      },
    ];

    // Add company context if available
    if (context.companyContext) {
      const contextInfo =
        context.language === "ar"
          ? `معلومات الشركة: الصناعة: ${context.companyContext.industry || "غير محدد"}, الحجم: ${context.companyContext.size || "غير محدد"}, الموقع: ${context.companyContext.location || "غير محدد"}`
          : `Company info: Industry: ${context.companyContext.industry || "N/A"}, Size: ${context.companyContext.size || "N/A"}, Location: ${context.companyContext.location || "N/A"}`;

      messages.splice(1, 0, {
        role: "system",
        content: contextInfo,
      });
    }

    // Call LLM
    const response = await callLLM({
      messages,
      maxTokens: 2000,
    });

    const assistantMessage =
      response.choices[0]?.message?.content?.toString() || "";

    // Extract suggestions and related topics (simple parsing)
    const suggestions = extractSuggestions(assistantMessage, context.language);
    const relatedTopics = extractRelatedTopics(
      assistantMessage,
      context.language
    );

    return {
      message: assistantMessage,
      suggestions,
      relatedTopics,
      confidence: 0.9, // Could be enhanced with actual confidence scoring
      sources: ["Saudi Labor Law", "Rabit HR Knowledge Base"],
    };
  } catch (error) {
    console.error("AI Assistant Error:", error);
    const errorMsg =
      context.language === "ar"
        ? "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى."
        : "Sorry, an error occurred processing your request. Please try again.";

    return {
      message: errorMsg,
      confidence: 0,
    };
  }
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(
  message: string,
  language: "ar" | "en"
): string[] {
  const suggestions: string[] = [];

  // Look for bullet points or numbered lists
  const matches = message.match(/[-•]\s*(.+)/g);
  if (matches && matches.length > 0) {
    suggestions.push(...matches.slice(0, 3).map((m) => m.replace(/[-•]\s*/, "")));
  }

  return suggestions;
}

/**
 * Extract related topics from AI response
 */
function extractRelatedTopics(
  message: string,
  language: "ar" | "en"
): string[] {
  const topics: string[] = [];

  // Common HR topics in Arabic
  const arTopics = [
    "نهاية الخدمة",
    "الإجازات",
    "الرواتب",
    "التأمينات الاجتماعية",
    "العقود",
    "الفصل التأديبي",
    "التوظيف",
    "التدريب",
  ];

  // Common HR topics in English
  const enTopics = [
    "End of Service",
    "Leave",
    "Salaries",
    "Social Insurance",
    "Contracts",
    "Termination",
    "Recruitment",
    "Training",
  ];

  const relevantTopics = language === "ar" ? arTopics : enTopics;

  for (const topic of relevantTopics) {
    if (message.includes(topic)) {
      topics.push(topic);
    }
  }

  return topics.slice(0, 5);
}

/**
 * Generate document content with AI
 */
export async function generateDocumentContent(
  templateType: string,
  variables: Record<string, string>,
  language: "ar" | "en",
  tone: "formal" | "semi-formal" | "friendly" = "formal"
): Promise<string> {
  const toneDescriptions = {
    ar: {
      formal: "رسمي جداً ومهني",
      "semi-formal": "شبه رسمي ومتوازن",
      friendly: "ودي ومشجع",
    },
    en: {
      formal: "very formal and professional",
      "semi-formal": "semi-formal and balanced",
      friendly: "friendly and encouraging",
    },
  };

  const prompt =
    language === "ar"
      ? `أنشئ ${templateType} بأسلوب ${toneDescriptions.ar[tone]} باللغة العربية.

المتغيرات:
${Object.entries(variables)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

المتطلبات:
- استخدم لغة عربية فصحى واضحة
- اتبع المعايير القانونية السعودية
- اجعل المحتوى احترافياً ومنظماً
- لا تضف تعليقات أو ملاحظات، فقط المحتوى النهائي`
      : `Create a ${templateType} in ${toneDescriptions.en[tone]} style in English.

Variables:
${Object.entries(variables)
  .map(([key, value]) => `- ${key}: ${value}`)
  .join("\n")}

Requirements:
- Use clear professional English
- Follow Saudi legal standards
- Make content professional and organized
- Don't add comments or notes, just the final content`;

  try {
    const response = await callLLM({
      messages: [
        {
          role: "system",
          content:
            language === "ar"
              ? "أنت خبير في صياغة المستندات والخطابات الرسمية للموارد البشرية."
              : "You are an expert in drafting formal HR documents and letters.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 1500,
    });

    return response.choices[0]?.message?.content?.toString() || "";
  } catch (error) {
    console.error("Document Generation Error:", error);
    return language === "ar"
      ? "عذراً، حدث خطأ في توليد المستند."
      : "Sorry, an error occurred generating the document.";
  }
}

/**
 * Analyze HR data and provide insights
 */
export async function analyzeHRData(
  dataType: "employees" | "leave" | "salaries" | "performance",
  data: any[],
  language: "ar" | "en"
): Promise<{
  summary: string;
  insights: string[];
  recommendations: string[];
}> {
  const dataTypeMap = {
    ar: {
      employees: "الموظفين",
      leave: "الإجازات",
      salaries: "الرواتب",
      performance: "الأداء",
    },
    en: {
      employees: "employees",
      leave: "leave",
      salaries: "salaries",
      performance: "performance",
    },
  };

  const dataDescription =
    language === "ar"
      ? `تحليل بيانات ${dataTypeMap.ar[dataType]}`
      : `Analysis of ${dataTypeMap.en[dataType]} data`;

  const prompt =
    language === "ar"
      ? `قم بتحليل البيانات التالية وقدم ملخصاً ورؤى وتوصيات:

نوع البيانات: ${dataDescription}
عدد السجلات: ${data.length}

قدم:
1. ملخص عام للبيانات
2. 3-5 رؤى مهمة
3. 3-5 توصيات قابلة للتطبيق`
      : `Analyze the following data and provide a summary, insights, and recommendations:

Data type: ${dataDescription}
Number of records: ${data.length}

Provide:
1. General summary of the data
2. 3-5 important insights
3. 3-5 actionable recommendations`;

  try {
    const response = await callLLM({
      messages: [
        {
          role: "system",
          content:
            language === "ar"
              ? "أنت محلل بيانات موارد بشرية متخصص."
              : "You are a specialized HR data analyst.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      maxTokens: 1000,
    });

    const content = response.choices[0]?.message?.content?.toString() || "";

    // Parse response (simplified)
    return {
      summary: content,
      insights: [],
      recommendations: [],
    };
  } catch (error) {
    console.error("Data Analysis Error:", error);
    return {
      summary:
        language === "ar"
          ? "عذراً، حدث خطأ في تحليل البيانات."
          : "Sorry, an error occurred analyzing the data.",
      insights: [],
      recommendations: [],
    };
  }
}
