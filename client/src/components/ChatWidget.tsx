import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Minimize2,
  Maximize2,
  FileText,
  Calculator,
  HelpCircle,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface QuickAction {
  icon: any;
  label: string;
  labelEn: string;
  query: string;
  queryEn: string;
}

export function ChatWidget() {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [visitorToken, setVisitorToken] = useState<string | null>(null);
  const createWelcomeMessage = (): Message => ({
    id: "1",
    role: "assistant",
    content:
      i18n.language === "ar"
        ? "مرحباً! أنا المساعد الذكي لمنصة رابِط. كيف يمكنني مساعدتك اليوم؟"
        : "Hello! I'm the Rabit platform smart assistant. How can I help you today?",
    timestamp: new Date(),
  });
  const [messages, setMessages] = useState<Message[]>(() => [
    createWelcomeMessage(),
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const isArabic = i18n.language === "ar";
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const savedId = localStorage.getItem("chatConversationId");
    if (savedId) {
      const parsed = Number(savedId);
      if (!Number.isNaN(parsed)) {
        setConversationId(parsed);
      }
    }

    const savedToken = localStorage.getItem("chatVisitorToken");
    if (savedToken) {
      setVisitorToken(savedToken);
    }

    const savedMessages = localStorage.getItem("chatMessages");
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages) as Array<
          Omit<Message, "timestamp"> & { timestamp: string }
        >;
        const hydrated = parsed.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        if (hydrated.length) {
          setMessages(hydrated);
        }
      } catch (error) {
        console.error("Failed to parse saved chat messages", error);
      }
    }
  }, []);

  const quickActions: QuickAction[] = [
    {
      icon: Calculator,
      label: "حساب نهاية الخدمة",
      labelEn: "End of Service Calculation",
      query: "كيف أحسب مكافأة نهاية الخدمة حسب نظام العمل السعودي؟",
      queryEn: "How do I calculate end of service benefits according to Saudi labor law?",
    },
    {
      icon: FileText,
      label: "الإجازات السنوية",
      labelEn: "Annual Leave",
      query: "ما هي حقوق الموظف في الإجازات السنوية؟",
      queryEn: "What are employee rights for annual leave?",
    },
    {
      icon: HelpCircle,
      label: "عقود العمل",
      labelEn: "Employment Contracts",
      query: "ما الفرق بين العقد محدد المدة وغير محدد المدة؟",
      queryEn: "What's the difference between fixed and open-ended contracts?",
    },
    {
      icon: Sparkles,
      label: "توليد خطاب",
      labelEn: "Generate Letter",
      query: "كيف أولد خطاب تعريف بالراتب؟",
      queryEn: "How do I generate a salary certificate?",
    },
  ];

  const messagesQuery = trpc.chat.getMessages.useQuery(
    { conversationId: conversationId as number, visitorToken: visitorToken ?? undefined },
    { enabled: !!conversationId, refetchInterval: 4000 }
  );

  const chatMutation = trpc.chat.askAssistant.useMutation({
    onSuccess: (data: any) => {
      if (data?.conversationId) {
        setConversationId(data.conversationId);
        localStorage.setItem(
          "chatConversationId",
          String(data.conversationId)
        );
      }
      if (data?.visitorToken) {
        setVisitorToken(data.visitorToken);
        localStorage.setItem("chatVisitorToken", data.visitorToken);
      }
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response || data.message || "...",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      messagesQuery.refetch();
    },
    onError: error => {
      toast.error(error.message || "فشل في إرسال الرسالة");
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!messages.length) return;
    const toSave = messages.slice(-50).map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString(),
    }));
    localStorage.setItem("chatMessages", JSON.stringify(toSave));
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  useEffect(() => {
    if (!messagesQuery.data || !messagesQuery.data.length) return;

    const fromServer: Message[] = messagesQuery.data.map((msg: any) => ({
      id: String(msg.id ?? `${msg.createdAt}`),
      role: msg.senderType === "visitor" ? "user" : "assistant",
      content: msg.message ?? "",
      timestamp: new Date(msg.createdAt || new Date().toISOString()),
    }));

    const merged = fromServer
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .slice(-50);

    setMessages(merged);
  }, [messagesQuery.data]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Call API
    chatMutation.mutate({
      message: input,
      conversationId: conversationId ?? undefined,
      visitorToken: visitorToken ?? undefined,
    });
  };

  const handleQuickAction = (action: QuickAction) => {
    const query = isArabic ? action.query : action.queryEn;
    setInput(query);
  };

  const handleResetConversation = () => {
    const welcome = createWelcomeMessage();
    setMessages([welcome]);
    setConversationId(null);
    setVisitorToken(null);
    localStorage.removeItem("chatConversationId");
    localStorage.removeItem("chatMessages");
    localStorage.removeItem("chatVisitorToken");
  };

  const handleExportConversation = () => {
    const lines = messages.map(msg => {
      const who =
        msg.role === "assistant"
          ? isArabic ? "المساعد" : "Assistant"
          : isArabic ? "أنت" : "You";
      const time = msg.timestamp.toLocaleString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
        day: "2-digit",
        month: "2-digit",
      });
      return `[${time}] ${who}: ${msg.content}`;
    });

    const blob = new Blob([lines.join("\n\n")], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "rabit-chat.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 h-14 w-14 rounded-full shadow-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 z-50 p-0"
        aria-label="Open chat"
      >
        <MessageSquare className="h-6 w-6 text-white" />
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-500 rounded-full animate-pulse"></span>
      </Button>
    );
  }

  return (
    <Card
      className={`fixed z-50 shadow-2xl transition-all duration-300 ${
        isMinimized
          ? "bottom-6 left-6 w-80 h-16"
          : "bottom-6 left-6 w-[400px] h-[600px]"
      }`}
    >
      {/* Header */}
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 bg-white">
              <AvatarFallback>
                <Bot className="h-5 w-5 text-purple-600" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
          </div>
          {!isMinimized && (
            <div>
              <h3 className="font-semibold text-white text-sm">
                {isArabic ? "المساعد الذكي" : "Smart Assistant"}
              </h3>
              <p className="text-xs text-blue-100">
                {isArabic ? "متصل الآن" : "Online now"}
              </p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsMinimized(!isMinimized)}
            aria-label={
              isMinimized
                ? isArabic
                  ? "تكبير الدردشة"
                  : "Expand chat"
                : isArabic
                  ? "تصغير الدردشة"
                  : "Minimize chat"
            }
            aria-pressed={isMinimized}
          >
            {isMinimized ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white/20"
            onClick={() => setIsOpen(false)}
            aria-label={isArabic ? "إغلاق الدردشة" : "Close chat"}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-0 flex flex-col h-[calc(100%-140px)]">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div
                ref={scrollRef}
                className="space-y-4 pr-1"
                role="log"
                aria-live="polite"
                aria-relevant="additions text"
                aria-label={isArabic ? "سجل المحادثة" : "Chat transcript"}
              >
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback
                        className={
                          message.role === "user"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-purple-100 text-purple-600"
                        }
                      >
                        {message.role === "user" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <Bot className="h-4 w-4" />
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`flex-1 ${
                        message.role === "user" ? "text-right" : ""
                      }`}
                    >
                      <div
                        className={`inline-block px-4 py-2 rounded-2xl ${
                          message.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {message.role === "assistant" ? (
                          <ReactMarkdown className="text-sm prose prose-sm max-w-none dark:prose-invert">
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {message.timestamp.toLocaleTimeString(
                          isArabic ? "ar-SA" : "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </p>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-start gap-3" role="status" aria-live="polite">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-purple-100 text-purple-600">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                      <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </ScrollArea>

            {/* Quick Actions */}
            {messages.length === 1 && (
              <div className="p-4 border-t">
                <p className="text-xs text-gray-500 mb-2">
                  {isArabic ? "أسئلة سريعة:" : "Quick questions:"}
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="justify-start text-xs h-auto py-2"
                        onClick={() => handleQuickAction(action)}
                        aria-label={
                          isArabic
                            ? `سؤال سريع: ${action.label}`
                            : `Quick question: ${action.labelEn}`
                        }
                      >
                        <Icon className="h-3 w-3 ml-1" />
                        {isArabic ? action.label : action.labelEn}
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>

          {/* Input */}
          <div className="px-4 pt-2 pb-1 flex items-center justify-between text-xs text-gray-500">
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={handleResetConversation}
              >
                {isArabic ? "إعادة تعيين" : "Reset"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3"
                onClick={handleExportConversation}
              >
                {isArabic ? "تصدير المحادثة" : "Export chat"}
              </Button>
            </div>
            {conversationId && (
              <span className="text-[11px] text-muted-foreground">
                {isArabic ? "مزامنة تلقائية" : "Auto-synced"}
              </span>
            )}
          </div>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder={
                  isArabic ? "اكتب رسالتك..." : "Type your message..."
                }
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                ref={inputRef}
                className="flex-1"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
                aria-busy={isLoading}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-400 mt-2 text-center">
              {isArabic
                ? "مدعوم بالذكاء الاصطناعي - قد تحدث أخطاء"
                : "Powered by AI - Errors may occur"}
            </p>
          </div>
        </>
      )}
    </Card>
  );
}
