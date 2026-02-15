import { useEffect, useRef } from "react";
import { ChatMessage } from "@/hooks/useChatPlayback";
import { ArrowLeft, Phone, Video, Info, Heart, Image, Mic, Send } from "lucide-react";

interface Props {
  contactName: string;
  messages: ChatMessage[];
  isTyping: boolean;
  typingSender: "me" | "them";
  currentTypingText: string;
}

function formatTime() {
  const now = new Date();
  return now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export default function InstagramSimulator({
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
    <div className="w-[375px] h-[812px] mx-auto overflow-hidden bg-ig-bg flex flex-col shrink-0">
      {/* Status bar */}
      <div className="flex items-center justify-between px-5 py-1.5 text-[11px] text-foreground/80 bg-ig-header">
        <span className="font-medium">{formatTime()}</span>
        <div className="flex items-center gap-1">
          <div className="w-4 h-2.5 border border-foreground/60 rounded-sm relative">
            <div className="absolute inset-[1px] right-[2px] bg-accent rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Instagram header */}
      <div className="flex items-center gap-3 px-3 py-2.5 bg-ig-header border-b border-border/30">
        <ArrowLeft className="w-5 h-5 text-foreground" />
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 via-accent to-purple-600 p-[2px]">
          <div className="w-full h-full rounded-full bg-ig-bg flex items-center justify-center text-[10px] font-bold text-foreground">
            {contactName[0]?.toUpperCase()}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{contactName}</p>
          <p className="text-[11px] text-muted-foreground">
            {isTyping && typingSender === "them" ? "Digitando..." : "Ativo(a) agora"}
          </p>
        </div>
        <div className="flex items-center gap-5 text-foreground">
          <Phone className="w-5 h-5" />
          <Video className="w-5 h-5" />
        </div>
      </div>

      {/* Chat area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 bg-ig-bg">
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          const isMe = msg.sender === "me";
          const sameSenderAsPrev = prevMsg && prevMsg.sender === msg.sender;
          const sameSenderAsNext = nextMsg && nextMsg.sender === msg.sender;
          const marginTop = idx === 0 ? "" : sameSenderAsPrev ? "mt-[2px]" : "mt-[12px]";

          // When grouped, flatten the side facing the adjacent bubble
          let radiusClass = "rounded-full";
          if (sameSenderAsPrev && sameSenderAsNext) {
            radiusClass = isMe
              ? "rounded-full rounded-tr-[6px] rounded-br-[6px]"
              : "rounded-full rounded-tl-[6px] rounded-bl-[6px]";
          } else if (sameSenderAsPrev) {
            radiusClass = isMe
              ? "rounded-full rounded-tr-[6px]"
              : "rounded-full rounded-tl-[6px]";
          } else if (sameSenderAsNext) {
            radiusClass = isMe
              ? "rounded-full rounded-br-[6px]"
              : "rounded-full rounded-bl-[6px]";
          }

          return (
            <div
              key={msg.id}
              className={`flex ${isMe ? "justify-end" : "justify-start"} ${marginTop} animate-message-in`}
            >
              {msg.image ? (
                <div className="max-w-[70%] rounded-[20px] overflow-hidden">
                  <img src={msg.image} alt="" className="max-w-full w-[200px] object-cover" />
                </div>
              ) : (
                <div
                  className={`max-w-[70%] px-4 py-2.5 text-[15px] leading-[20px] ${radiusClass} ${
                    isMe
                      ? "bg-[#5b5bf6] text-white"
                      : "bg-[#262626] text-white"
                  }`}
                >
                  {msg.text}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator */}
        {isTyping && typingSender === "them" && (
          <div className="flex justify-start animate-message-in">
            <div className="bg-ig-bubble-in px-4 py-3 rounded-[20px] flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot-1" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot-2" />
              <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-2 px-3 py-2.5 bg-ig-bg">
        <div className="flex-1 flex items-center gap-2 border border-border/40 rounded-full px-3 py-2 min-h-[40px]">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-accent flex items-center justify-center">
            <span className="text-white text-xs">📷</span>
          </div>
          <div className="flex-1 text-[14px] text-foreground min-h-[20px]">
            {isTyping && typingSender === "me" ? (
              <span>
                {currentTypingText}
                <span className="inline-block w-[2px] h-[14px] bg-foreground animate-pulse ml-[1px] align-text-bottom" />
              </span>
            ) : (
              <span className="text-muted-foreground">Mensagem...</span>
            )}
          </div>
          {isTyping && typingSender === "me" ? (
            <Send className="w-5 h-5 text-ig-bubble-out shrink-0" />
          ) : (
            <>
              <Mic className="w-5 h-5 text-foreground shrink-0" />
              <Image className="w-5 h-5 text-foreground shrink-0" />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
