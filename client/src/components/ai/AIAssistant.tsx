import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Lightbulb,
  HelpCircle,
  FileText,
  Calculator,
  Calendar,
  Users,
  X,
  Loader2,
  MessageSquare,
  Mic,
  MicOff,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  suggestions?: string[];
  actions?: {
    label: string;
    labelAr: string;
    action: () => void;
  }[];
  feedback?: "positive" | "negative";
}

interface SuggestionCategory {
  icon: React.ElementType;
  label: string;
  labelAr: string;
  suggestions: { text: string; textAr: string }[];
}

// Mock AI Responses
const AI_RESPONSES: Record<string, { response: string; responseAr: string; suggestions?: string[] }> = {
  leave: {
    response: "To request leave, go to the Leave Management section and click 'New Request'. You can check your leave balance in your profile.",
    responseAr: "لطلب إجازة، اذهب إلى قسم إدارة الإجازات واضغط على 'طلب جديد'. يمكنك التحقق من رصيد إجازاتك في ملفك الشخصي.",
    suggestions: ["What's my leave balance?", "Show leave policy", "Pending requests"],
  },
  payroll: {
    response: "Your payroll information is available in the Payroll section. You can view your salary slips, tax documents, and payment history there.",
    responseAr: "معلومات رواتبك متاحة في قسم الرواتب. يمكنك عرض قسائم الراتب والمستندات الضريبية وسجل الدفعات هناك.",
    suggestions: ["Download payslip", "Tax deductions", "Payment schedule"],
  },
  employee: {
    response: "The Employees section allows you to view and manage employee information. You can search, filter, and access detailed profiles.",
    responseAr: "قسم الموظفين يتيح لك عرض وإدارة معلومات الموظفين. يمكنك البحث والتصفية والوصول للملفات التفصيلية.",
    suggestions: ["Add new employee", "View org chart", "Export employee list"],
  },
  attendance: {
    response: "Attendance tracking is available in your dashboard. You can clock in/out, view your attendance history, and check your working hours.",
    responseAr: "تتبع الحضور متاح في لوحة التحكم الخاصة بك. يمكنك تسجيل الحضور/الانصراف وعرض سجل حضورك والتحقق من ساعات عملك.",
    suggestions: ["My attendance today", "Monthly report", "Late arrivals"],
  },
  default: {
    response: "I'm here to help you with HR-related questions. You can ask about leave, payroll, employees, attendance, or any other HR matters.",
    responseAr: "أنا هنا لمساعدتك في الأسئلة المتعلقة بالموارد البشرية. يمكنك السؤال عن الإجازات والرواتب والموظفين والحضور أو أي مسائل أخرى.",
    suggestions: ["Request leave", "View payroll", "Find employee", "Check attendance"],
  },
};

// Suggestion Categories
const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  {
    icon: Calendar,
    label: "Leave",
    labelAr: "الإجازات",
    suggestions: [
      { text: "How to request leave?", textAr: "كيف أطلب إجازة؟" },
      { text: "Check my leave balance", textAr: "التحقق من رصيد إجازاتي" },
    ],
  },
  {
    icon: Calculator,
    label: "Payroll",
    labelAr: "الرواتب",
    suggestions: [
      { text: "View my payslip", textAr: "عرض قسيمة راتبي" },
      { text: "Payment schedule", textAr: "جدول الدفعات" },
    ],
  },
  {
    icon: Users,
    label: "Employees",
    labelAr: "الموظفين",
    suggestions: [
      { text: "Find an employee", textAr: "البحث عن موظف" },
      { text: "Team directory", textAr: "دليل الفريق" },
    ],
  },
  {
    icon: HelpCircle,
    label: "Help",
    labelAr: "المساعدة",
    suggestions: [
      { text: "How to use the system?", textAr: "كيف أستخدم النظام؟" },
      { text: "Contact support", textAr: "التواصل مع الدعم" },
    ],
  },
];

// Main Component
export function AIAssistant() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Process AI response
  const getAIResponse = useCallback(
    (query: string): { response: string; suggestions?: string[] } => {
      const lowerQuery = query.toLowerCase();

      if (lowerQuery.includes("leave") || lowerQuery.includes("إجازة") || lowerQuery.includes("vacation")) {
        return {
          response: isArabic ? AI_RESPONSES.leave.responseAr : AI_RESPONSES.leave.response,
          suggestions: AI_RESPONSES.leave.suggestions,
        };
      }
      if (lowerQuery.includes("payroll") || lowerQuery.includes("salary") || lowerQuery.includes("راتب")) {
        return {
          response: isArabic ? AI_RESPONSES.payroll.responseAr : AI_RESPONSES.payroll.response,
          suggestions: AI_RESPONSES.payroll.suggestions,
        };
      }
      if (lowerQuery.includes("employee") || lowerQuery.includes("موظف") || lowerQuery.includes("staff")) {
        return {
          response: isArabic ? AI_RESPONSES.employee.responseAr : AI_RESPONSES.employee.response,
          suggestions: AI_RESPONSES.employee.suggestions,
        };
      }
      if (lowerQuery.includes("attendance") || lowerQuery.includes("حضور") || lowerQuery.includes("clock")) {
        return {
          response: isArabic ? AI_RESPONSES.attendance.responseAr : AI_RESPONSES.attendance.response,
          suggestions: AI_RESPONSES.attendance.suggestions,
        };
      }

      return {
        response: isArabic ? AI_RESPONSES.default.responseAr : AI_RESPONSES.default.response,
        suggestions: AI_RESPONSES.default.suggestions,
      };
    },
    [isArabic]
  );

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

    const aiResponse = getAIResponse(userMessage.content);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: "assistant",
      content: aiResponse.response,
      timestamp: new Date(),
      suggestions: aiResponse.suggestions,
    };

    setMessages((prev) => [...prev, assistantMessage]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    inputRef.current?.focus();
  };

  const handleFeedback = (messageId: string, feedback: "positive" | "negative") => {
    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, feedback } : m))
    );
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const handleRegenerate = (messageId: string) => {
    const messageIndex = messages.findIndex((m) => m.id === messageId);
    if (messageIndex > 0) {
      const userMessage = messages[messageIndex - 1];
      if (userMessage.role === "user") {
        setInputValue(userMessage.content);
        handleSendMessage();
      }
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  return (
    <>
      {/* Floating Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        size="icon"
      >
        <Bot className="h-6 w-6" />
      </Button>

      {/* Chat Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:w-[400px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <SheetTitle>
                    {isArabic ? "مساعد الموارد البشرية" : "HR Assistant"}
                  </SheetTitle>
                  <SheetDescription className="text-xs">
                    {isArabic ? "مدعوم بالذكاء الاصطناعي" : "Powered by AI"}
                  </SheetDescription>
                </div>
              </div>
              {messages.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearChat}>
                  {isArabic ? "مسح" : "Clear"}
                </Button>
              )}
            </div>
          </SheetHeader>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="space-y-6">
                {/* Welcome Message */}
                <div className="text-center py-6">
                  <div className="h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Bot className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">
                    {isArabic ? "مرحباً! كيف يمكنني مساعدتك؟" : "Hi! How can I help you?"}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    {isArabic
                      ? "اسألني عن الإجازات، الرواتب، أو أي شيء متعلق بالموارد البشرية"
                      : "Ask me about leave, payroll, or anything HR related"}
                  </p>
                </div>

                {/* Suggestion Categories */}
                <div className="grid grid-cols-2 gap-3">
                  {SUGGESTION_CATEGORIES.map((category, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <category.icon className="h-4 w-4 text-muted-foreground" />
                        <span>{isArabic ? category.labelAr : category.label}</span>
                      </div>
                      {category.suggestions.map((suggestion, j) => (
                        <Button
                          key={j}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start text-xs h-auto py-2"
                          onClick={() =>
                            handleSuggestionClick(
                              isArabic ? suggestion.textAr : suggestion.text
                            )
                          }
                        >
                          <Lightbulb className="h-3 w-3 mr-2 shrink-0" />
                          <span className="truncate">
                            {isArabic ? suggestion.textAr : suggestion.text}
                          </span>
                        </Button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3",
                      message.role === "user" && "flex-row-reverse"
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback>
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={cn(
                        "max-w-[80%] space-y-2",
                        message.role === "user" && "text-end"
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2 rounded-2xl",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "bg-accent rounded-bl-sm"
                        )}
                      >
                        <p className="text-sm">{message.content}</p>
                      </div>

                      {/* Suggestions */}
                      {message.role === "assistant" && message.suggestions && (
                        <div className="flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, i) => (
                            <Badge
                              key={i}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent text-xs"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Message Actions */}
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleCopy(message.content)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleRegenerate(message.id)}
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6",
                              message.feedback === "positive" && "text-green-600"
                            )}
                            onClick={() => handleFeedback(message.id, "positive")}
                          >
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6",
                              message.feedback === "negative" && "text-red-600"
                            )}
                            onClick={() => handleFeedback(message.id, "negative")}
                          >
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-accent px-4 py-2 rounded-2xl rounded-bl-sm">
                      <div className="flex items-center gap-1">
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce" />
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-100" />
                        <span className="h-2 w-2 bg-primary rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsListening(!isListening)}
                className={cn(isListening && "text-red-500")}
              >
                {isListening ? (
                  <MicOff className="h-4 w-4" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={isArabic ? "اكتب رسالتك..." : "Type your message..."}
                className="flex-1"
                disabled={isTyping}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isTyping}
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {isArabic
                ? "المساعد قد يقدم معلومات غير دقيقة"
                : "Assistant may provide inaccurate information"}
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

export default AIAssistant;
