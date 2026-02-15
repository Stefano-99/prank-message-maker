import { useEffect, useRef } from "react";
import { ChatMessage } from "@/hooks/useChatPlayback";
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
    <div className="w-[375px] h-[812px] mx-auto overflow-hidden bg-black flex flex-col shrink-0" style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
      {/* iOS Status bar */}
      <div className="flex items-center justify-between px-6 pt-[14px] pb-[6px] text-[15px] font-semibold text-white bg-black">
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
      <div className="flex items-center px-2 py-[6px] bg-black border-b border-[#2c2c2e]">
        <div className="flex items-center gap-[2px] text-[#0a84ff]">
          <svg width="12" height="20" viewBox="0 0 12 20" fill="none">
            <path d="M10 2L2 10L10 18" stroke="#0a84ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-[17px]">3</span>
        </div>
        <div className="flex-1 flex flex-col items-center">
          <div className="w-[40px] h-[40px] rounded-full bg-[#636366] flex items-center justify-center text-[18px] font-medium text-white mb-[2px]">
            {contactName[0]?.toUpperCase()}
          </div>
          <p className="text-[11px] font-semibold text-white">{contactName}</p>
        </div>
        <div className="text-[#0a84ff]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="13" height="12" rx="2" stroke="#0a84ff" strokeWidth="1.8"/>
            <path d="M16 10.5L21 7.5V16.5L16 13.5" stroke="#0a84ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>

      {/* Chat area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-[20px] py-3"
        style={{ backgroundColor: "#000000" }}
      >
        {messages.map((msg, idx) => {
          const prevMsg = messages[idx - 1];
          const nextMsg = messages[idx + 1];
          const isLastInGroup = !nextMsg || nextMsg.sender !== msg.sender;
          const isFirstInGroup = !prevMsg || prevMsg.sender !== msg.sender;
          const sameSenderAsPrev = prevMsg && prevMsg.sender === msg.sender;

          // Spacing: tight between same sender, wider between different
          const marginTop = idx === 0 ? "" : sameSenderAsPrev ? "mt-[2px]" : "mt-[8px]";

          // Bubble radius logic matching iOS
          const isMe = msg.sender === "me";
          const showTail = isLastInGroup;

          // Radius: last in group gets a tight corner where the tail is
          let borderRadius: string;
          if (isMe) {
            borderRadius = isLastInGroup
              ? "20px 20px 0px 20px"
              : isFirstInGroup
                ? "20px 20px 4px 20px"
                : "20px 4px 4px 20px";
          } else {
            borderRadius = isLastInGroup
              ? "20px 20px 20px 0px"
              : isFirstInGroup
                ? "20px 20px 20px 4px"
                : "4px 20px 20px 4px";
          }

          return (
            <div
              key={msg.id}
              className={`flex items-end ${isMe ? "justify-end" : "justify-start"} ${marginTop} animate-message-in`}
            >
              {/* Tail left (them) */}
              {showTail && !isMe && (
                <svg width="8" height="16" viewBox="0 0 8 16" className="shrink-0 -mr-[2px]" style={{ marginBottom: -0.5 }}>
                  <path d="M8,0 C8,6 6,10 3,13 C1.5,14.5 0,16 0,16 L8,16 Z" fill="#262626"/>
                </svg>
              )}
              {!showTail && !isMe && <div className="w-[6px] shrink-0" />}

              <div
                className={`${msg.image ? "p-[3px]" : "px-[16px] py-[8px]"} text-[17px] leading-[22px] tracking-[-0.01em] text-white`}
                style={{
                  borderRadius,
                  backgroundColor: isMe ? "#0A84FF" : "#262626",
                  maxWidth: "75%",
                }}
              >
                {msg.image ? (
                  <img src={msg.image} alt="" className="rounded-[17px] max-w-full w-[220px] object-cover" />
                ) : (
                  msg.text
                )}
              </div>

              {/* Tail right (me) */}
              {showTail && isMe && (
                <svg width="8" height="16" viewBox="0 0 8 16" className="shrink-0 -ml-[2px]" style={{ marginBottom: -0.5 }}>
                  <path d="M0,0 C0,6 2,10 5,13 C6.5,14.5 8,16 8,16 L0,16 Z" fill="#0A84FF"/>
                </svg>
              )}
              {!showTail && isMe && <div className="w-[6px] shrink-0" />}
            </div>
          );
        })}

        {/* Read timestamp */}
        {messages.length > 0 && messages[messages.length - 1]?.sender === "me" && !isTyping && (
          <div className="flex justify-end pr-[2px] mt-[2px]">
            <span className="text-[11px] text-[#8e8e93] font-normal tracking-[-0.01em]">
              Read {formatTime()}
            </span>
          </div>
        )}

        {/* Typing indicator for "them" */}
        {isTyping && typingSender === "them" && (
          <div className="flex justify-start mt-[8px] animate-message-in">
            <div className="bg-[#26262a] px-[14px] py-[10px] rounded-[18px] rounded-bl-[4px] flex items-center gap-[5px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] typing-dot-1" />
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] typing-dot-2" />
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] typing-dot-3" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-[8px] px-[10px] py-[8px] bg-black border-t border-[#2c2c2e]">
        <div className="w-[32px] h-[32px] flex items-center justify-center shrink-0 rounded-full bg-[#3a3a3c]">
          <span className="text-[20px] text-white leading-none font-light">+</span>
        </div>
        <div className="flex-1 flex items-center border border-[#3a3a3c] rounded-full px-[14px] py-[7px] min-h-[36px]">
          <div className="flex-1 text-[17px] text-white min-h-[20px]">
            {isTyping && typingSender === "me" ? (
              <span>
                {currentTypingText}
                <span className="inline-block w-[2px] h-[17px] bg-[#0a84ff] animate-pulse ml-[1px] align-text-bottom" />
              </span>
            ) : (
              <span className="text-[#8e8e93]">iMessage</span>
            )}
          </div>
        </div>
        <div className="w-[32px] h-[32px] flex items-center justify-center shrink-0">
          {isTyping && typingSender === "me" ? (
            <div className="w-[30px] h-[30px] rounded-full bg-[#0b84fe] flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1V13M7 1L12 6M7 1L2 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 18.5C15.59 18.5 18.5 15.59 18.5 12V10C18.5 6.41 15.59 3.5 12 3.5C8.41 3.5 5.5 6.41 5.5 10V12C5.5 15.59 8.41 18.5 12 18.5Z" stroke="#8e8e93" strokeWidth="1.5"/>
              <path d="M12 18.5V21.5" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 21.5H16" stroke="#8e8e93" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
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
