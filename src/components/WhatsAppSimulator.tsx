import { useEffect, useRef } from "react";
import { ChatMessage } from "@/hooks/useChatPlayback";
import { ArrowLeft, Phone, MoreVertical, Smile, Paperclip, Camera, Mic, Send, CheckCheck } from "lucide-react";
import ChatKeyboard from "./ChatKeyboard";

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
    <div className="w-[375px] h-[812px] mx-auto overflow-hidden bg-[#0b141a] flex flex-col shrink-0">
      {/* WhatsApp header */}
      <div className="flex items-center gap-2 px-2 py-2 bg-[#1f2c34]">
        <ArrowLeft className="w-5 h-5 text-[#00a884]" />
        <div className="w-9 h-9 rounded-full bg-[#2a3942] flex items-center justify-center text-sm font-bold text-[#aebac1]">
          {contactName[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-normal text-[#e9edef] truncate">{contactName}</p>
          <p className="text-[13px] text-[#8696a0]">
            {isTyping && typingSender === "them" ? "digitando..." : "online"}
          </p>
        </div>
        <div className="flex items-center gap-5 text-[#aebac1]">
          <Phone className="w-[19px] h-[19px]" />
          <MoreVertical className="w-[19px] h-[19px]" />
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-[10px] py-2 space-y-[3px] relative"
        style={{
          backgroundColor: "#0b141a",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M10 5a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM30 15a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM50 8a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM5 30l3-3 3 3-3 3zM45 28a2 2 0 1 1 0-4 2 2 0 0 1 0 4zM20 45l2-3h4l-2 3zM55 50a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zM15 55a1 1 0 1 1 0-2 1 1 0 0 1 0 2zM40 42l2-2 2 2-2 2zM8 18h3v1H8zM48 55h2v1h-2zM25 25a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} animate-message-in`}
          >
            <div
              className={`max-w-[80%] px-[9px] pt-[6px] pb-[8px] text-[14.2px] leading-[19px] relative ${
                msg.sender === "me"
                  ? "bg-[#005c4b] text-[#e9edef] rounded-[7.5px] rounded-tr-none"
                  : "bg-[#202c33] text-[#e9edef] rounded-[7.5px] rounded-tl-none"
              }`}
            >
              <span>{msg.text}</span>
              <span className="inline-flex items-center gap-[3px] ml-[8px] float-right translate-y-[4px]">
                <span className="text-[11px] text-[#ffffff99]">{formatTime()}</span>
                {msg.sender === "me" && <CheckCheck className="w-[16px] h-[16px] text-[#53bdeb]" />}
              </span>
            </div>
          </div>
        ))}

        {/* Typing indicator for "them" */}
        {isTyping && typingSender === "them" && (
          <div className="flex justify-start animate-message-in">
            <div className="bg-[#202c33] px-3 py-2.5 rounded-[7.5px] rounded-tl-none flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[#8696a0] typing-dot-1" />
              <div className="w-2 h-2 rounded-full bg-[#8696a0] typing-dot-2" />
              <div className="w-2 h-2 rounded-full bg-[#8696a0] typing-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-[6px] px-[6px] py-[6px]" style={{ backgroundColor: "#0b141a" }}>
        <div className="flex-1 flex items-center gap-[6px] bg-[#1f2c34] rounded-full px-[12px] py-[10px] min-h-[42px]">
          <Smile className="w-[24px] h-[24px] text-[#8696a0] shrink-0" />
          <div className="flex-1 text-[15px] text-[#e9edef] min-h-[20px]">
            {isTyping && typingSender === "me" ? (
              <span>
                {currentTypingText}
                <span className="inline-block w-[2px] h-[15px] bg-[#00a884] animate-pulse ml-[1px] align-text-bottom" />
              </span>
            ) : (
              <span className="text-[#8696a0]">Mensagem</span>
            )}
          </div>
          <Paperclip className="w-[22px] h-[22px] text-[#8696a0] shrink-0 rotate-[135deg]" />
          <Camera className="w-[22px] h-[22px] text-[#8696a0] shrink-0" />
        </div>
        <div className="w-[42px] h-[42px] rounded-full bg-[#00a884] flex items-center justify-center shrink-0">
          {isTyping && typingSender === "me" ? (
            <Send className="w-[18px] h-[18px] text-[#0b141a]" />
          ) : (
            <Mic className="w-[20px] h-[20px] text-[#0b141a]" />
          )}
        </div>
      </div>

      {/* Keyboard - only when "me" is typing */}
      <ChatKeyboard
        currentText={currentTypingText}
        isActive={isTyping && typingSender === "me"}
      />
    </div>
  );
}
