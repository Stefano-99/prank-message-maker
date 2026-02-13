import { useEffect, useRef } from "react";
import { ChatMessage } from "@/hooks/useChatPlayback";
import { ArrowLeft, Video, ChevronRight } from "lucide-react";
import ChatKeyboard from "./ChatKeyboard";

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

export default function IMessageSimulator({
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
    <div className="w-[375px] h-[812px] mx-auto overflow-hidden bg-[#000000] flex flex-col shrink-0">
      {/* iOS Status bar */}
      <div className="flex items-center justify-between px-6 pt-[14px] pb-[6px] text-[15px] font-semibold text-white bg-[#000000]">
        <span>{formatTime()}</span>
        <div className="flex items-center gap-[5px]">
          <div className="flex gap-[3px] items-end">
            <div className="w-[3px] h-[4px] bg-white rounded-[0.5px]" />
            <div className="w-[3px] h-[6px] bg-white rounded-[0.5px]" />
            <div className="w-[3px] h-[9px] bg-white rounded-[0.5px]" />
            <div className="w-[3px] h-[12px] bg-white rounded-[0.5px]" />
          </div>
          <div className="w-[22px] h-[11px] border border-white rounded-[3px] relative ml-1">
            <div className="absolute inset-[1.5px] right-[2px] bg-white rounded-[1px]" />
            <div className="absolute -right-[3px] top-[2.5px] w-[1.5px] h-[5px] bg-white rounded-r-[1px]" />
          </div>
        </div>
      </div>

      {/* iMessage header */}
      <div className="flex items-center px-2 py-[6px] bg-[#000000] border-b border-[#2c2c2e]">
        <div className="flex items-center gap-[2px] text-[#0a84ff]">
          <ArrowLeft className="w-[22px] h-[22px]" />
          <span className="text-[17px]">3</span>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-[40px] h-[40px] rounded-full bg-[#636366] flex items-center justify-center text-[18px] font-medium text-white mb-[2px]">
            {contactName[0]?.toUpperCase()}
          </div>
          <p className="text-[11px] font-semibold text-white">{contactName}</p>
          {isTyping && typingSender === "them" && (
            <p className="text-[10px] text-[#8e8e93]">digitando...</p>
          )}
        </div>
        <div className="text-[#0a84ff]">
          <Video className="w-[24px] h-[24px]" />
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-[10px] py-3 space-y-[4px]"
        style={{ backgroundColor: "#000000" }}
      >
        {/* Date label */}
        <div className="flex justify-center mb-2">
          <span className="text-[11px] text-[#8e8e93] font-medium">Hoje</span>
        </div>

        {messages.map((msg, idx) => {
          // Group: show tail only on last message of same sender
          const nextMsg = messages[idx + 1];
          const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;

          return (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} animate-message-in`}
            >
              <div
                className={`max-w-[75%] px-[12px] py-[7px] text-[16px] leading-[21px] ${
                  msg.sender === "me"
                    ? `bg-[#0a84ff] text-white ${isLastInGroup ? "rounded-[18px] rounded-br-[4px]" : "rounded-[18px]"}`
                    : `bg-[#1c1c1e] text-white ${isLastInGroup ? "rounded-[18px] rounded-bl-[4px]" : "rounded-[18px]"}`
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Delivered label */}
        {messages.length > 0 && messages[messages.length - 1]?.sender === "me" && !isTyping && (
          <div className="flex justify-end pr-1">
            <span className="text-[11px] text-[#8e8e93] font-medium">Entregue</span>
          </div>
        )}

        {/* Typing indicator for "them" */}
        {isTyping && typingSender === "them" && (
          <div className="flex justify-start animate-message-in">
            <div className="bg-[#1c1c1e] px-[14px] py-[10px] rounded-[18px] rounded-bl-[4px] flex items-center gap-[5px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] typing-dot-1" />
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] typing-dot-2" />
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] typing-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-end gap-[6px] px-[8px] py-[8px] bg-[#000000] border-t border-[#2c2c2e]">
        <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0">
          <span className="text-[24px]">＋</span>
        </div>
        <div className="flex-1 flex items-center border border-[#3a3a3c] rounded-full px-[14px] py-[8px] min-h-[36px]">
          <div className="flex-1 text-[16px] text-white min-h-[20px]">
            {isTyping && typingSender === "me" ? (
              <span>
                {currentTypingText}
                <span className="inline-block w-[2px] h-[16px] bg-[#0a84ff] animate-pulse ml-[1px] align-text-bottom" />
              </span>
            ) : (
              <span className="text-[#8e8e93]">iMessage</span>
            )}
          </div>
        </div>
        <div className="w-[34px] h-[34px] flex items-center justify-center shrink-0">
          {isTyping && typingSender === "me" ? (
            <div className="w-[30px] h-[30px] rounded-full bg-[#0a84ff] flex items-center justify-center">
              <ChevronRight className="w-[18px] h-[18px] text-white" />
            </div>
          ) : (
            <span className="text-[#8e8e93] text-[20px]">🎙</span>
          )}
        </div>
      </div>

      {/* Keyboard */}
      <ChatKeyboard
        currentText={currentTypingText}
        isActive={isTyping && typingSender === "me"}
        theme="ios"
      />
    </div>
  );
}
