import { useState, useMemo, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  MessageCircle,
  Send,
  Search,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  Image,
  File,
  Smile,
  Check,
  CheckCheck,
  Circle,
  X,
  Plus,
  Settings,
  Users,
  Archive,
  Star,
  Pin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { ar, enUS } from "date-fns/locale";

// Types
interface User {
  id: string;
  name: string;
  nameAr: string;
  avatar?: string;
  status: "online" | "offline" | "away" | "busy";
  role: string;
  roleAr: string;
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: Date;
  status: "sent" | "delivered" | "read";
  attachments?: {
    type: "image" | "file";
    name: string;
    url: string;
  }[];
}

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  isPinned: boolean;
  isStarred: boolean;
  isGroup: boolean;
  groupName?: string;
  groupNameAr?: string;
}

// Mock Data
const CURRENT_USER_ID = "current";

const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "Ahmed Mohammed",
    nameAr: "أحمد محمد",
    status: "online",
    role: "Engineering Manager",
    roleAr: "مدير الهندسة",
  },
  {
    id: "2",
    name: "Sara Ali",
    nameAr: "سارة علي",
    status: "away",
    role: "HR Manager",
    roleAr: "مدير الموارد البشرية",
  },
  {
    id: "3",
    name: "Mohammed Hassan",
    nameAr: "محمد حسن",
    status: "offline",
    role: "Developer",
    roleAr: "مطور",
  },
  {
    id: "4",
    name: "Fatima Khalid",
    nameAr: "فاطمة خالد",
    status: "busy",
    role: "Designer",
    roleAr: "مصممة",
  },
];

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "1",
    participants: [MOCK_USERS[0]],
    lastMessage: {
      id: "m1",
      content: "شكراً على التحديث!",
      senderId: "1",
      timestamp: new Date(Date.now() - 300000),
      status: "read",
    },
    unreadCount: 0,
    isPinned: true,
    isStarred: false,
    isGroup: false,
  },
  {
    id: "2",
    participants: [MOCK_USERS[1]],
    lastMessage: {
      id: "m2",
      content: "هل يمكنك إرسال التقرير؟",
      senderId: "current",
      timestamp: new Date(Date.now() - 3600000),
      status: "delivered",
    },
    unreadCount: 2,
    isPinned: false,
    isStarred: true,
    isGroup: false,
  },
  {
    id: "3",
    participants: MOCK_USERS,
    lastMessage: {
      id: "m3",
      content: "اجتماع الفريق غداً الساعة 10",
      senderId: "2",
      timestamp: new Date(Date.now() - 86400000),
      status: "read",
    },
    unreadCount: 5,
    isPinned: true,
    isStarred: false,
    isGroup: true,
    groupName: "Development Team",
    groupNameAr: "فريق التطوير",
  },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "1": [
    {
      id: "1-1",
      content: "مرحباً، كيف حالك؟",
      senderId: "1",
      timestamp: new Date(Date.now() - 3600000),
      status: "read",
    },
    {
      id: "1-2",
      content: "أهلاً! الحمد لله بخير، شكراً",
      senderId: "current",
      timestamp: new Date(Date.now() - 3500000),
      status: "read",
    },
    {
      id: "1-3",
      content: "هل انتهيت من مراجعة المشروع؟",
      senderId: "1",
      timestamp: new Date(Date.now() - 3400000),
      status: "read",
    },
    {
      id: "1-4",
      content: "نعم، انتهيت منه. سأرسل لك التحديثات",
      senderId: "current",
      timestamp: new Date(Date.now() - 3300000),
      status: "read",
    },
    {
      id: "1-5",
      content: "شكراً على التحديث!",
      senderId: "1",
      timestamp: new Date(Date.now() - 300000),
      status: "read",
    },
  ],
};

// Components
interface StatusBadgeProps {
  status: User["status"];
}

function StatusBadge({ status }: StatusBadgeProps) {
  const statusColors = {
    online: "bg-green-500",
    away: "bg-yellow-500",
    busy: "bg-red-500",
    offline: "bg-gray-400",
  };

  return (
    <span
      className={cn(
        "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
        statusColors[status]
      )}
    />
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  onClick: () => void;
  isArabic: boolean;
}

function ConversationItem({
  conversation,
  isSelected,
  onClick,
  isArabic,
}: ConversationItemProps) {
  const participant = conversation.participants[0];
  const displayName = conversation.isGroup
    ? isArabic
      ? conversation.groupNameAr
      : conversation.groupName
    : isArabic
    ? participant.nameAr
    : participant.name;

  const formatTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, "HH:mm");
    } else if (isYesterday(date)) {
      return isArabic ? "أمس" : "Yesterday";
    }
    return format(date, "MM/dd");
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg transition-colors text-start",
        isSelected ? "bg-accent" : "hover:bg-accent/50"
      )}
    >
      <div className="relative">
        {conversation.isGroup ? (
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
        ) : (
          <>
            <Avatar className="h-12 w-12">
              <AvatarImage src={participant.avatar} />
              <AvatarFallback>
                {participant.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <StatusBadge status={participant.status} />
          </>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {conversation.isPinned && (
              <Pin className="h-3 w-3 text-muted-foreground" />
            )}
            <span className="font-medium truncate">{displayName}</span>
          </div>
          {conversation.lastMessage && (
            <span className="text-xs text-muted-foreground">
              {formatTime(conversation.lastMessage.timestamp)}
            </span>
          )}
        </div>
        {conversation.lastMessage && (
          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground truncate max-w-[180px]">
              {conversation.lastMessage.senderId === CURRENT_USER_ID && (
                <span className="inline-flex mr-1">
                  {conversation.lastMessage.status === "read" ? (
                    <CheckCheck className="h-3 w-3 text-primary" />
                  ) : conversation.lastMessage.status === "delivered" ? (
                    <CheckCheck className="h-3 w-3" />
                  ) : (
                    <Check className="h-3 w-3" />
                  )}
                </span>
              )}
              {conversation.lastMessage.content}
            </p>
            {conversation.unreadCount > 0 && (
              <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full text-xs">
                {conversation.unreadCount}
              </Badge>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  isArabic: boolean;
}

function MessageBubble({ message, isOwn, isArabic }: MessageBubbleProps) {
  return (
    <div
      className={cn(
        "flex flex-col max-w-[70%] gap-1",
        isOwn ? "items-end self-end" : "items-start self-start"
      )}
    >
      <div
        className={cn(
          "px-4 py-2 rounded-2xl",
          isOwn
            ? "bg-primary text-primary-foreground rounded-br-sm"
            : "bg-accent rounded-bl-sm"
        )}
      >
        <p className="text-sm">{message.content}</p>
        {message.attachments?.map((attachment, i) => (
          <div
            key={i}
            className="mt-2 p-2 rounded bg-background/10 flex items-center gap-2"
          >
            {attachment.type === "image" ? (
              <Image className="h-4 w-4" />
            ) : (
              <File className="h-4 w-4" />
            )}
            <span className="text-xs truncate">{attachment.name}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1 px-1">
        <span className="text-xs text-muted-foreground">
          {format(message.timestamp, "HH:mm")}
        </span>
        {isOwn && (
          <span className="text-muted-foreground">
            {message.status === "read" ? (
              <CheckCheck className="h-3 w-3 text-primary" />
            ) : message.status === "delivered" ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )}
          </span>
        )}
      </div>
    </div>
  );
}

// Main Component
export function InternalMessaging() {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === "ar";
  const [conversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(
    MOCK_CONVERSATIONS[0]
  );
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES["1"] || []);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations
  const filteredConversations = useMemo(() => {
    if (!searchQuery) return conversations;
    return conversations.filter((c) => {
      const name = c.isGroup
        ? `${c.groupName} ${c.groupNameAr}`
        : `${c.participants[0].name} ${c.participants[0].nameAr}`;
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery]);

  // Sort conversations - pinned first
  const sortedConversations = useMemo(() => {
    return [...filteredConversations].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      const timeA = a.lastMessage?.timestamp.getTime() || 0;
      const timeB = b.lastMessage?.timestamp.getTime() || 0;
      return timeB - timeA;
    });
  }, [filteredConversations]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setMessages(MOCK_MESSAGES[conversation.id] || []);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      senderId: CURRENT_USER_ID,
      timestamp: new Date(),
      status: "sent",
    };

    setMessages((prev) => [...prev, message]);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex overflow-hidden">
      {/* Conversations List */}
      <div className="w-80 border-e flex flex-col">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              {isArabic ? "الرسائل" : "Messages"}
            </h2>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isArabic ? "بحث..." : "Search..."}
              className="pl-9"
            />
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {sortedConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onClick={() => handleSelectConversation(conversation)}
                isArabic={isArabic}
              />
            ))}
            {sortedConversations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {isArabic ? "لا توجد محادثات" : "No conversations"}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      {selectedConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              {selectedConversation.isGroup ? (
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
              ) : (
                <div className="relative">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={selectedConversation.participants[0].avatar} />
                    <AvatarFallback>
                      {selectedConversation.participants[0].name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <StatusBadge status={selectedConversation.participants[0].status} />
                </div>
              )}
              <div>
                <h3 className="font-medium">
                  {selectedConversation.isGroup
                    ? isArabic
                      ? selectedConversation.groupNameAr
                      : selectedConversation.groupName
                    : isArabic
                    ? selectedConversation.participants[0].nameAr
                    : selectedConversation.participants[0].name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {selectedConversation.isGroup
                    ? `${selectedConversation.participants.length} ${
                        isArabic ? "أعضاء" : "members"
                      }`
                    : isArabic
                    ? selectedConversation.participants[0].roleAr
                    : selectedConversation.participants[0].role}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost">
                <Phone className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Video className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-3">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.senderId === CURRENT_USER_ID}
                  isArabic={isArabic}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost">
                <Image className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isArabic ? "اكتب رسالة..." : "Type a message..."}
                className="flex-1"
              />
              <Button size="icon" variant="ghost">
                <Smile className="h-4 w-4" />
              </Button>
              <Button size="icon" onClick={handleSendMessage} disabled={!newMessage.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">
              {isArabic ? "اختر محادثة للبدء" : "Select a conversation to start"}
            </h3>
          </div>
        </div>
      )}
    </Card>
  );
}

export default InternalMessaging;
