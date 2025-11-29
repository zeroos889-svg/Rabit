import * as React from "react";
import ReactMarkdown from "react-markdown";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

import { Loader2, Sparkles } from "lucide-react";

export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: Date | string;
}

const fallbackMessages: Message[] = [
  {
    id: "assistant-welcome",
    role: "assistant",
    content: "Hi! I'm Rabit, your HR assistant. How can I help today?",
  },
  {
    id: "user-question",
    role: "user",
    content: "Show me my remaining vacation balance.",
  },
  {
    id: "assistant-answer",
    role: "assistant",
    content: "You have 8 vacation days remaining for this cycle.",
  },
];

export interface AIChatBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  messages?: Message[];
  onSendMessage?: (content: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  height?: number | string;
  emptyStateMessage?: string;
  suggestedPrompts?: string[];
}

const defaultPrompts = [
  "Summarize the latest HR announcement",
  "Draft a vacation policy reminder",
  "Explain Saudi labor law notice periods",
];

const generateId = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export function AIChatBox({
  className,
  messages,
  onSendMessage,
  isLoading,
  placeholder = "Ask the assistant anything…",
  height = "420px",
  emptyStateMessage = "Start the conversation by sending a question.",
  suggestedPrompts = defaultPrompts,
  ...props
}: AIChatBoxProps) {
  const [draft, setDraft] = React.useState("");
  const [internalMessages, setInternalMessages] = React.useState<Message[]>(
    fallbackMessages
  );
  const [internalLoading, setInternalLoading] = React.useState(false);
  const endRef = React.useRef<HTMLDivElement | null>(null);

  const isControlled = Array.isArray(messages);
  const messageSource = isControlled ? messages ?? [] : internalMessages;
  const resolvedMessages = messageSource.map((message, index) => ({
    ...message,
    id: message.id ?? `${message.role}-${index}`,
  }));
  const loadingState = isControlled ? Boolean(isLoading) : internalLoading;

  React.useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [resolvedMessages.length, loadingState]);

  const resolvedHeight = typeof height === "number" ? `${height}px` : height;

  const handleSend = () => {
    const content = draft.trim();
    if (!content) return;

    if (onSendMessage) {
      onSendMessage(content);
    } else {
      const userMessage: Message = {
        id: generateId(),
        role: "user",
        content,
      };
      setInternalMessages((prev) => [...prev, userMessage]);
      setInternalLoading(true);

      setTimeout(() => {
        setInternalMessages((prev) => [
          ...prev,
          {
            id: generateId(),
            role: "assistant",
            content:
              "Thanks! This is a demo response. Connect to your AI backend to replace it.",
          },
        ]);
        setInternalLoading(false);
      }, 900);
    }

    setDraft("");
  };

  const handlePromptClick = (prompt: string) => {
    setDraft(prompt);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={cn("flex flex-col gap-4", className)} {...props}>
      <div>
        <p className="text-sm font-medium text-muted-foreground mb-2">
          Suggested prompts
        </p>
        <div className="flex flex-wrap gap-2">
          {(suggestedPrompts.length ? suggestedPrompts : defaultPrompts).map(
            (prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => handlePromptClick(prompt)}
              >
                <Sparkles className="ms-2 h-3.5 w-3.5" />
                {prompt}
              </Button>
            )
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card">
        <ScrollArea className="w-full" style={{ height: resolvedHeight }}>
          <div className="space-y-4 p-4">
            {resolvedMessages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center text-sm text-muted-foreground">
                <Sparkles className="h-5 w-5" />
                <p>{emptyStateMessage}</p>
              </div>
            ) : (
              resolvedMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 text-sm",
                    message.role === "user" && "flex-row-reverse text-right"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.role === "assistant"
                        ? "AI"
                        : message.role === "user"
                          ? "You"
                          : "Sys"}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={cn(
                      "rounded-lg border px-3 py-2 shadow-sm",
                      message.role === "system" && "bg-muted/60"
                    )}
                  >
                    <ReactMarkdown className="prose prose-sm max-w-none text-foreground prose-p:leading-relaxed">
                      {message.content}
                    </ReactMarkdown>
                    {message.timestamp && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {typeof message.timestamp === "string"
                          ? message.timestamp
                          : message.timestamp.toLocaleTimeString()}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
            {loadingState && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-2">
        <Textarea
          value={draft}
          rows={3}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="resize-none"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Shift + Enter for newline</span>
          <Button
            size="sm"
            onClick={handleSend}
            disabled={!draft.trim() || loadingState}
          >
            {loadingState ? (
              <>
                <Loader2 className="ms-2 h-4 w-4 animate-spin" /> Sending
              </>
            ) : (
              "Send"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
