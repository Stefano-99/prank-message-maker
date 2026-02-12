import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: number;
  sender: "me" | "them";
  text: string;
}

export interface ParsedScript {
  contact: string;
  messages: ChatMessage[];
}

export function parseScript(script: string): ParsedScript {
  const lines = script.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { contact: "Contato", messages: [] };

  // First line can be contact name: "Nome: João"
  let contact = "Contato";
  let startIdx = 0;

  if (lines[0].toLowerCase().startsWith("nome:")) {
    contact = lines[0].substring(5).trim();
    startIdx = 1;
  }

  const messages: ChatMessage[] = [];
  let id = 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    let sender: "me" | "them" = "me";
    let text = line;

    if (line.startsWith("eu:") || line.startsWith("Eu:") || line.startsWith("EU:")) {
      sender = "me";
      text = line.substring(3).trim();
    } else if (line.startsWith("ele:") || line.startsWith("Ele:") || line.startsWith("ELE:") ||
               line.startsWith("ela:") || line.startsWith("Ela:") || line.startsWith("ELA:")) {
      sender = "them";
      text = line.substring(4).trim();
    } else if (line.startsWith("1:")) {
      sender = "me";
      text = line.substring(2).trim();
    } else if (line.startsWith("2:")) {
      sender = "them";
      text = line.substring(2).trim();
    }

    if (text) {
      messages.push({ id: id++, sender, text });
    }
  }

  return { contact, messages };
}

export function useChatPlayback() {
  const [visibleMessages, setVisibleMessages] = useState<ChatMessage[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [typingSender, setTypingSender] = useState<"me" | "them">("me");
  const [typingProgress, setTypingProgress] = useState(0);
  const cancelRef = useRef(false);

  const reset = useCallback(() => {
    setVisibleMessages([]);
    setIsPlaying(false);
    setIsTyping(false);
    setCurrentTypingText("");
    setTypingProgress(0);
    cancelRef.current = true;
  }, []);

  const play = useCallback(async (messages: ChatMessage[], speed: number = 1) => {
    cancelRef.current = false;
    setIsPlaying(true);
    setVisibleMessages([]);

    const typingDelay = 1200 / speed;
    const charDelay = 45 / speed;
    const pauseBetween = 600 / speed;

    for (let i = 0; i < messages.length; i++) {
      if (cancelRef.current) break;

      const msg = messages[i];
      setTypingSender(msg.sender);
      setIsTyping(true);
      setCurrentTypingText("");
      setTypingProgress(0);

      // Simulate typing character by character
      for (let c = 0; c <= msg.text.length; c++) {
        if (cancelRef.current) break;
        setCurrentTypingText(msg.text.substring(0, c));
        setTypingProgress(c / msg.text.length);
        await new Promise((r) => setTimeout(r, charDelay));
      }

      if (cancelRef.current) break;

      // Small pause before sending
      await new Promise((r) => setTimeout(r, 200 / speed));

      setIsTyping(false);
      setCurrentTypingText("");
      setVisibleMessages((prev) => [...prev, msg]);

      // Pause between messages
      if (i < messages.length - 1) {
        await new Promise((r) => setTimeout(r, pauseBetween));
      }
    }

    setIsPlaying(false);
    setIsTyping(false);
  }, []);

  return {
    visibleMessages,
    isPlaying,
    isTyping,
    currentTypingText,
    typingSender,
    typingProgress,
    play,
    reset,
  };
}
