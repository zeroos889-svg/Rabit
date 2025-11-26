import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Loader2,
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  BookOpen,
  Lightbulb,
  FileText,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  relatedTopics?: string[];
  confidence?: number;
}

export default function AIChat() {
  const { user } = useAuth();
  const { t, isArabic } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // tRPC mutations
  const chatMutation = trpc.ai.chat.useMutation();
  const suggestionQuery = trpc.ai.getSuggestions.useQuery({
    language: isArabic ? "ar" : "en",
    context: "general",
  });

  // Suggested questions
  const suggestedQuestions = isArabic
    ? [
        "كيف أحسب نهاية الخدمة وفق المادة 84؟",
        "ما هي حقوق الموظف في الإجازات السنوية؟",
        "كيف أتعامل مع موظف متغيب بدون عذر؟",
        "ما هي شروط إنهاء العقد من قبل الموظف؟",
        "كيف أحسب راتب الموظف مع البدلات؟",
        "ما هي إجراءات التوظيف القانونية؟",
      ]
    : [
        "How do I calculate end of service per Article 84?",
        "What are employee rights for annual leave?",
        "How do I handle an employee absent without excuse?",
        "What are the conditions for contract termination by employee?",
        "How do I calculate employee salary with allowances?",
        "What are the legal hiring procedures?",
      ];

  // Quick actions
  const quickActions = isArabic
    ? [
        { icon: FileText, label: "توليد خطاب", action: "generate_letter" },
        { icon: TrendingUp, label: "تحليل بيانات", action: "analyze_data" },
        { icon: BookOpen, label: "قاعدة المعرفة", action: "knowledge_base" },
        { icon: Lightbulb, label: "نصائح HR", action: "hr_tips" },
      ]
    : [
        { icon: FileText, label: "Generate Letter", action: "generate_letter" },
        { icon: TrendingUp, label: "Analyze Data", action: "analyze_data" },
        { icon: BookOpen, label: "Knowledge Base", action: "knowledge_base" },
        { icon: Lightbulb, label: "HR Tips", action: "hr_tips" },
      ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Send message to AI
  const handleSendMessage = async (messageText?: string) => {
    const text = messageText || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Prepare conversation history
      const conversationHistory = messages.slice(-5).map((msg) => ({
        role: msg.role === "user" ? "user" as const : "assistant" as const,
        content: msg.content,
      }));

      // Call tRPC API
      const response = await chatMutation.mutateAsync({
        message: text,
        language: isArabic ? "ar" : "en",
        conversationHistory,
      });

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          response.message ||
          (isArabic
            ? "عذراً، لم أتمكن من معالجة طلبك. يرجى المحاولة مرة أخرى."
            : "Sorry, I couldn't process your request. Please try again."),
        timestamp: new Date(),
        suggestions: response.suggestions,
        relatedTopics: response.relatedTopics,
        confidence: response.confidence,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      toast.error(isArabic
        ? "حدث خطأ في الاتصال بالمساعد الذكي"
        : "An error occurred connecting to the AI assistant");

      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: isArabic
          ? "عذراً، حدث خطأ في معالجة طلبك. يرجى المحاولة مرة أخرى لاحقاً."
          : "Sorry, an error occurred processing your request. Please try again later.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Copy message content
  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success(isArabic ? "تم نسخ المحتوى بنجاح" : "Content copied successfully");
  };

  // Handle feedback
  const handleFeedback = (messageId: string, positive: boolean) => {
    toast.success(
      isArabic
        ? "شكراً لتقييمك. سنستخدمه لتحسين الخدمة"
        : "Thanks for your feedback. We'll use it to improve the service"
    );
  };

  // Clear conversation
  const handleClearConversation = () => {
    setMessages([]);
    toast.success(isArabic ? "تم مسح جميع الرسائل بنجاح" : "All messages cleared successfully");
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <Bot className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {isArabic ? "المساعد الذكي" : "AI Assistant"}
            </h1>
            <p className="text-muted-foreground">
              {isArabic
                ? "مساعد ذكي متخصص في الموارد البشرية والقوانين العمالية السعودية"
                : "AI assistant specialized in HR and Saudi Labor Law"}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {quickActions.map((action) => (
            <Button
              key={action.action}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Area */}
        <Card className="lg:col-span-2 shadow-lg">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  {isArabic ? "المحادثة" : "Conversation"}
                </CardTitle>
                <CardDescription>
                  {isArabic
                    ? "اطرح أسئلتك واحصل على إجابات فورية"
                    : "Ask your questions and get instant answers"}
                </CardDescription>
              </div>
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearConversation}
                  className="gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {isArabic ? "مسح" : "Clear"}
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages */}
            <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="p-4 bg-purple-100 rounded-full mb-4">
                    <Bot className="h-12 w-12 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {isArabic ? "مرحباً بك!" : "Welcome!"}
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    {isArabic
                      ? "أنا هنا لمساعدتك في جميع استفساراتك المتعلقة بالموارد البشرية ونظام العمل السعودي"
                      : "I'm here to help you with all your HR and Saudi Labor Law questions"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div
                        className={`flex gap-3 ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        {message.role === "assistant" && (
                          <div className="p-2 bg-purple-100 rounded-full h-fit">
                            <Bot className="h-5 w-5 text-purple-600" />
                          </div>
                        )}

                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {message.content}
                          </p>

                          {message.role === "assistant" && (
                            <div className="mt-3 pt-3 border-t border-border/50">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopy(message.content)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleFeedback(message.id, true)
                                    }
                                  >
                                    <ThumbsUp className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleFeedback(message.id, false)
                                    }
                                  >
                                    <ThumbsDown className="h-3 w-3" />
                                  </Button>
                                </div>
                                {message.confidence && (
                                  <Badge variant="outline" className="text-xs">
                                    {Math.round(message.confidence * 100)}%{" "}
                                    {isArabic ? "دقة" : "confidence"}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {message.role === "user" && (
                          <div className="p-2 bg-primary/10 rounded-full h-fit">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Suggestions */}
                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-2 mr-14 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, idx) => (
                            <Button
                              key={idx}
                              variant="outline"
                              size="sm"
                              className="text-xs"
                              onClick={() => handleSendMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex gap-3">
                      <div className="p-2 bg-purple-100 rounded-full h-fit">
                        <Bot className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="bg-muted rounded-2xl px-4 py-3">
                        <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={
                    isArabic ? "اكتب سؤالك هنا..." : "Type your question here..."
                  }
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {isArabic ? "إرسال" : "Send"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Suggested Questions */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg">
                {isArabic ? "أسئلة مقترحة" : "Suggested Questions"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {suggestedQuestions.map((question, idx) => (
                <Button
                  key={idx}
                  variant="ghost"
                  className="w-full justify-start text-right h-auto py-3 px-3"
                  onClick={() => handleSendMessage(question)}
                >
                  <span className="text-sm text-right">{question}</span>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Features */}
          <Card className="shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                {isArabic ? "المميزات" : "Features"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="p-1 bg-purple-100 rounded mt-1">
                  <Bot className="h-3 w-3 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {isArabic ? "ذكاء اصطناعي متقدم" : "Advanced AI"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? "مدعوم بأحدث تقنيات الذكاء الاصطناعي"
                      : "Powered by latest AI technology"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <div className="p-1 bg-green-100 rounded mt-1">
                  <BookOpen className="h-3 w-3 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {isArabic ? "قاعدة معرفة شاملة" : "Comprehensive Knowledge"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? "يغطي جميع جوانب نظام العمل السعودي"
                      : "Covers all aspects of Saudi Labor Law"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-2">
                <div className="p-1 bg-blue-100 rounded mt-1">
                  <TrendingUp className="h-3 w-3 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {isArabic ? "تحليلات ذكية" : "Smart Analytics"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isArabic
                      ? "تحليل البيانات وتقديم توصيات"
                      : "Analyze data and provide recommendations"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
