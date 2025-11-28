/**
 * AI Assistant Module - Advanced HR AI Assistant
 * مساعد الذكاء الاصطناعي المتقدم للموارد البشرية
 * 
 * متكامل مع قاعدة المعرفة للأنظمة السعودية
 * 
 * @module server/ai/assistant
 */

import { callLLM, type Message } from "../_core/llm";
import { loadRegulation, searchRegulations, type Regulation } from "./knowledge-base-loader";

// ============================================
// Knowledge Base Integration
// ============================================

let laborLawCache: Regulation | null = null;
let gosiCache: Regulation | null = null;
let nitaqatCache: Regulation | null = null;

/**
 * تحميل نظام العمل من قاعدة المعرفة
 */
function getLaborLaw(): Regulation | null {
  if (!laborLawCache) {
    try {
      laborLawCache = loadRegulation('labor-law');
    } catch {
      return null;
    }
  }
  return laborLawCache;
}

/**
 * تحميل نظام التأمينات من قاعدة المعرفة
 */
function getGOSI(): Regulation | null {
  if (!gosiCache) {
    try {
      gosiCache = loadRegulation('gosi');
    } catch {
      return null;
    }
  }
  return gosiCache;
}

/**
 * تحميل نظام نطاقات من قاعدة المعرفة
 */
function getNitaqat(): Regulation | null {
  if (!nitaqatCache) {
    try {
      nitaqatCache = loadRegulation('nitaqat');
    } catch {
      return null;
    }
  }
  return nitaqatCache;
}

/**
 * البحث في قاعدة المعرفة
 */
function searchKnowledgeBase(query: string): string {
  const results = searchRegulations(query);
  if (results.length === 0) return '';
  
  return results.slice(0, 3).map(r => {
    const reg = r as Record<string, unknown>;
    return `📚 ${reg.title || reg.id}: ${reg.description || ''}`;
  }).join('\n');
}

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
 * محسّن بمعلومات من قاعدة المعرفة
 */
function buildSystemPrompt(lang: 'ar' | 'en', userType: string): string {
  // تحميل المعلومات من قاعدة المعرفة
  const laborLaw = getLaborLaw();
  const gosi = getGOSI();
  const nitaqat = getNitaqat();
  
  let kbContext = '';
  
  if (laborLaw || gosi || nitaqat) {
    const laborData = laborLaw as Record<string, unknown> | null;
    const gosiData = gosi as Record<string, unknown> | null;
    const nitaqatData = nitaqat as Record<string, unknown> | null;
    
    if (lang === 'ar') {
      kbContext = `

📖 معلومات من قاعدة المعرفة:
${laborData ? `- نظام العمل السعودي (${laborData.lastUpdate || '2024'})` : ''}
${gosiData ? `- نظام التأمينات الاجتماعية` : ''}
${nitaqatData ? `- برنامج نطاقات للسعودة` : ''}

استخدم هذه المعلومات عند الإجابة على أسئلة الموارد البشرية.`;
    } else {
      kbContext = `

📖 Knowledge Base Info:
${laborData ? `- Saudi Labor Law (${laborData.lastUpdate || '2024'})` : ''}
${gosiData ? `- Social Insurance (GOSI) System` : ''}
${nitaqatData ? `- Nitaqat Saudization Program` : ''}

Use this information when answering HR questions.`;
    }
  }
  
  const basePrompt = SYSTEM_PROMPTS[lang][userType as keyof typeof SYSTEM_PROMPTS['ar']] || SYSTEM_PROMPTS[lang].general;
  return basePrompt + kbContext;
}

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
 * استخدام الدالة المحسّنة مع قاعدة المعرفة
 */
function getSystemPrompt(context: AIAssistantContext): string {
  return buildSystemPrompt(context.language, context.userType);
}

/**
 * Main AI Assistant function
 * مع تكامل قاعدة المعرفة للإجابات الدقيقة
 */
export async function getAIAssistantResponse(
  userMessage: string,
  context: AIAssistantContext
): Promise<AIResponse> {
  try {
    // البحث في قاعدة المعرفة للسياق الإضافي
    const kbContext = searchKnowledgeBase(userMessage);
    
    // Build messages array
    const messages: Message[] = [
      {
        role: "system",
        content: getSystemPrompt(context),
      },
      // Add conversation history if available
      ...(context.conversationHistory || []),
    ];
    
    // إضافة سياق قاعدة المعرفة إذا وجد
    if (kbContext) {
      messages.push({
        role: "system",
        content: context.language === 'ar' 
          ? `معلومات ذات صلة من قاعدة المعرفة:\n${kbContext}`
          : `Relevant information from knowledge base:\n${kbContext}`,
      });
    }

    // Add company context if available
    if (context.companyContext) {
      const contextInfo =
        context.language === "ar"
          ? `معلومات الشركة: الصناعة: ${context.companyContext.industry || "غير محدد"}, الحجم: ${context.companyContext.size || "غير محدد"}, الموقع: ${context.companyContext.location || "غير محدد"}`
          : `Company info: Industry: ${context.companyContext.industry || "N/A"}, Size: ${context.companyContext.size || "N/A"}, Location: ${context.companyContext.location || "N/A"}`;

      messages.push({
        role: "system",
        content: contextInfo,
      });
    }
    
    // إضافة رسالة المستخدم
    messages.push({
      role: "user",
      content: userMessage,
    });

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
    
    // تحديد المصادر بناءً على السياق
    const sources = buildSources(userMessage, context.language);

    return {
      message: assistantMessage,
      suggestions,
      relatedTopics,
      confidence: 0.9, // Could be enhanced with actual confidence scoring
      sources,
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
 * تحديد المصادر المستخدمة في الإجابة
 */
function buildSources(query: string, language: 'ar' | 'en'): string[] {
  const sources: string[] = [];
  const queryLower = query.toLowerCase();
  
  // الكلمات المفتاحية للأنظمة المختلفة
  const laborKeywords = ['عمل', 'عقد', 'إجازة', 'راتب', 'فصل', 'استقالة', 'contract', 'leave', 'salary', 'termination'];
  const gosiKeywords = ['تأمين', 'تقاعد', 'ساند', 'gosi', 'insurance', 'retirement'];
  const nitaqatKeywords = ['سعودة', 'نطاقات', 'توطين', 'saudization', 'nitaqat', 'localization'];
  const eosbKeywords = ['نهاية خدمة', 'مكافأة', 'end of service', 'eosb'];
  
  if (laborKeywords.some(k => queryLower.includes(k))) {
    sources.push(language === 'ar' ? 'نظام العمل السعودي' : 'Saudi Labor Law');
  }
  if (gosiKeywords.some(k => queryLower.includes(k))) {
    sources.push(language === 'ar' ? 'نظام التأمينات الاجتماعية' : 'GOSI Regulations');
  }
  if (nitaqatKeywords.some(k => queryLower.includes(k))) {
    sources.push(language === 'ar' ? 'برنامج نطاقات' : 'Nitaqat Program');
  }
  if (eosbKeywords.some(k => queryLower.includes(k))) {
    sources.push(language === 'ar' ? 'لائحة مكافأة نهاية الخدمة' : 'End of Service Regulations');
  }
  
  // مصدر افتراضي
  if (sources.length === 0) {
    sources.push(language === 'ar' ? 'قاعدة معرفة Rabit HR' : 'Rabit HR Knowledge Base');
  }
  
  return sources;
}

/**
 * Extract suggestions from AI response
 */
function extractSuggestions(
  message: string,
  _language: "ar" | "en"
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
  data: unknown[],
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
  
  // إضافة سياق من قاعدة المعرفة
  const kbContext = searchKnowledgeBase(dataType);

  const prompt =
    language === "ar"
      ? `قم بتحليل البيانات التالية وقدم ملخصاً ورؤى وتوصيات:

نوع البيانات: ${dataDescription}
عدد السجلات: ${data.length}

${kbContext ? `معلومات من قاعدة المعرفة:\n${kbContext}\n` : ''}

قدم:
1. ملخص عام للبيانات
2. 3-5 رؤى مهمة
3. 3-5 توصيات قابلة للتطبيق`
      : `Analyze the following data and provide a summary, insights, and recommendations:

Data type: ${dataDescription}
Number of records: ${data.length}

${kbContext ? `Knowledge base info:\n${kbContext}\n` : ''}

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
              ? "أنت محلل بيانات موارد بشرية متخصص في الأنظمة السعودية."
              : "You are a specialized HR data analyst with Saudi regulations expertise.",
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

// ============================================
// New Knowledge Base Enhanced Functions
// ============================================

/**
 * الإجابة على سؤال قانوني باستخدام قاعدة المعرفة
 */
export async function answerLegalQuestion(
  question: string,
  language: 'ar' | 'en' = 'ar'
): Promise<{
  answer: string;
  references: string[];
  confidence: number;
  relatedArticles: string[];
}> {
  // البحث في قاعدة المعرفة
  const kbResults = searchKnowledgeBase(question);
  const laborLaw = getLaborLaw();
  
  const systemPrompt = language === 'ar'
    ? `أنت مستشار قانوني متخصص في نظام العمل السعودي والأنظمة ذات الصلة.
قواعد الإجابة:
1. استند دائماً إلى النصوص القانونية الرسمية
2. اذكر رقم المادة القانونية عند الإمكان
3. وضح إن كان هناك استثناءات أو حالات خاصة
4. نبّه على تحديثات الأنظمة الأخيرة
5. اقترح استشارة محامي في الحالات المعقدة`
    : `You are a legal consultant specialized in Saudi Labor Law and related regulations.
Answer guidelines:
1. Always base answers on official legal texts
2. Cite article numbers when possible
3. Clarify exceptions or special cases
4. Note recent regulatory updates
5. Suggest consulting a lawyer for complex cases`;

  const userPrompt = language === 'ar'
    ? `السؤال: ${question}

${kbResults ? `معلومات من قاعدة المعرفة:\n${kbResults}` : ''}

أجب بشكل واضح ومفصل مع ذكر المراجع القانونية.`
    : `Question: ${question}

${kbResults ? `Knowledge base info:\n${kbResults}` : ''}

Provide a clear, detailed answer with legal references.`;

  try {
    const response = await callLLM({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      maxTokens: 1500
    });

    const answer = response.choices[0]?.message?.content?.toString() || '';
    
    // تحديد المراجع
    const references: string[] = [];
    const laborData = laborLaw as Record<string, unknown> | null;
    if (laborData) {
      references.push(language === 'ar' ? 'نظام العمل السعودي' : 'Saudi Labor Law');
    }
    if (kbResults) {
      references.push(language === 'ar' ? 'قاعدة معرفة Rabit' : 'Rabit Knowledge Base');
    }

    return {
      answer,
      references,
      confidence: kbResults ? 0.9 : 0.7,
      relatedArticles: extractArticleNumbers(answer)
    };
  } catch (error) {
    console.error('Legal question error:', error);
    return {
      answer: language === 'ar' 
        ? 'عذراً، حدث خطأ في معالجة السؤال.'
        : 'Sorry, an error occurred processing your question.',
      references: [],
      confidence: 0,
      relatedArticles: []
    };
  }
}

/**
 * استخراج أرقام المواد القانونية من النص
 */
function extractArticleNumbers(text: string): string[] {
  const articles: string[] = [];
  
  // البحث عن أرقام المواد بالعربية
  const arabicPattern = /المادة\s*(\d+)/g;
  let match;
  while ((match = arabicPattern.exec(text)) !== null) {
    articles.push(`المادة ${match[1]}`);
  }
  
  // البحث عن أرقام المواد بالإنجليزية
  const englishPattern = /Article\s*(\d+)/gi;
  while ((match = englishPattern.exec(text)) !== null) {
    articles.push(`Article ${match[1]}`);
  }
  
  return [...new Set(articles)]; // إزالة التكرار
}

/**
 * الحصول على ملخص سريع لموضوع HR
 */
export async function getQuickSummary(
  topic: string,
  language: 'ar' | 'en' = 'ar'
): Promise<{
  summary: string;
  keyPoints: string[];
  sources: string[];
}> {
  const kbContext = searchKnowledgeBase(topic);
  
  const prompt = language === 'ar'
    ? `قدم ملخصاً سريعاً عن: ${topic}
    
${kbContext ? `معلومات من قاعدة المعرفة:\n${kbContext}` : ''}

قدم:
1. ملخص في 2-3 جمل
2. 3-5 نقاط رئيسية
3. المراجع المستخدمة

الرد بصيغة JSON:
{
  "summary": "الملخص",
  "keyPoints": ["نقطة 1", "نقطة 2"],
  "sources": ["المصدر 1"]
}`
    : `Provide a quick summary about: ${topic}

${kbContext ? `Knowledge base info:\n${kbContext}` : ''}

Provide:
1. Summary in 2-3 sentences
2. 3-5 key points
3. Sources used

Reply in JSON format:
{
  "summary": "summary text",
  "keyPoints": ["point 1", "point 2"],
  "sources": ["source 1"]
}`;

  try {
    const response = await callLLM({
      messages: [
        {
          role: 'system',
          content: language === 'ar'
            ? 'أنت خبير موارد بشرية. أجب بصيغة JSON فقط.'
            : 'You are an HR expert. Reply in JSON format only.'
        },
        { role: 'user', content: prompt }
      ],
      maxTokens: 800
    });

    const content = response.choices[0]?.message?.content?.toString() || '{}';
    const cleanedContent = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    const result = JSON.parse(cleanedContent);
    
    return {
      summary: result.summary || '',
      keyPoints: result.keyPoints || [],
      sources: result.sources || []
    };
  } catch (error) {
    console.error('Quick summary error:', error);
    return {
      summary: language === 'ar' ? 'غير متاح' : 'Not available',
      keyPoints: [],
      sources: []
    };
  }
}
