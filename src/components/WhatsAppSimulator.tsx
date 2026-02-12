import { useEffect, useRef } from "react";
import { ChatMessage } from "@/hooks/useChatPlayback";
import { ArrowLeft, Phone, Video, MoreVertical, Smile, Paperclip, Mic, Send, Check, CheckCheck } from "lucide-react";

interface Props {
  contactName: string;
  contactAvatar?: string;
  messages: ChatMessage[];
  isTyping: boolean;
  typingSender: "me" | "them";
  currentTypingText: string;
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function WhatsAppSimulator({
  contactName,
  messages,
  isTyping,
  typingSender,
  currentTypingText,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isTyping, currentTypingText]);

  return (
    <div className="w-full max-w-[375px] h-[700px] mx-auto rounded-[2rem] overflow-hidden border-[3px] border-muted bg-wa-bg flex flex-col shadow-2xl shadow-primary/10">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-1.5 text-[11px] text-foreground/80 bg-wa-header">
        <span className="font-medium">{formatTime()}</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2.5 border border-foreground/60 rounded-sm relative">
            <div className="absolute inset-[1px] right-[2px] bg-primary rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* WhatsApp header */}
      <div className="flex items-center gap-2 px-2 py-2 bg-wa-header">
        <ArrowLeft className="w-5 h-5 text-foreground/70" />
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
          {contactName[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{contactName}</p>
          <p className="text-[11px] text-muted-foreground">
            {isTyping && typingSender === "them" ? "digitando..." : "online"}
          </p>
        </div>
        <div className="flex items-center gap-4 text-foreground/70">
          <Video className="w-5 h-5" />
          <Phone className="w-4 h-4" />
          <MoreVertical className="w-5 h-5" />
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 space-y-1 bg-wa-chat-bg">
        {/* Date divider */}
        <div className="flex justify-center my-2">
          <span className="text-[11px] bg-wa-bubble-in text-muted-foreground px-3 py-1 rounded-md">HOJE</span>
        </div>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} animate-message-in`}
          >
            <div
              className={`max-w-[75%] px-2.5 py-1.5 rounded-lg text-[14px] leading-[19px] relative ${
                msg.sender === "me"
                  ? "bg-wa-bubble-out text-foreground rounded-tr-none"
                  : "bg-wa-bubble-in text-foreground rounded-tl-none"
              }`}
            >
              <span>{msg.text}</span>
              <span className="inline-flex items-center gap-0.5 ml-2 float-right mt-1">
                <span className="text-[10px] text-muted-foreground/80">{formatTime()}</span>
                {msg.sender === "me" && <CheckCheck className="w-3.5 h-3.5 text-blue-400" />}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator for "them" */}
        {isTyping && typingSender === "them" && (
          <div className="flex justify-start animate-message-in">
            <div className="bg-wa-bubble-in px-3 py-2.5 rounded-lg rounded-tl-none flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot-1" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot-2" />
              <div className="w-2 h-2 rounded-full bg-muted-foreground typing-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-1.5 px-2 py-2 bg-wa-chat-bg">
        <div className="flex-1 flex items-center gap-2 bg-wa-input-bg rounded-full px-3 py-2 min-h-[40px]">
          <Smile className="w-5 h-5 text-muted-foreground shrink-0" />
          <div className="flex-1 text-[14px] text-foreground min-h-[20px]">
            {isTyping && typingSender === "me" ? (
              <span>
                {currentTypingText}
                <span className="inline-block w-[2px] h-[14px] bg-primary animate-pulse ml-[1px] align-text-bottom" />
              </span>
            ) : (
              <span className="text-muted-foreground">Mensagem</span>
            )}
          </div>
          <Paperclip className="w-5 h-5 text-muted-foreground shrink-0 rotate-45" />
        </div>
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
          {isTyping && typingSender === "me" ? (
            <Send className="w-4 h-4 text-primary-foreground" />
          ) : (
            <Mic className="w-5 h-5 text-primary-foreground" />
          )}
        </div>
      </div>
    </div>
  );
}
