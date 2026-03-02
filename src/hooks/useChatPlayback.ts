import { useState, useCallback, useRef } from "react";

export interface ChatMessage {
  id: number;
  sender: "me" | "them";
  text: string;
  image?: string; // URL da imagem
  audio?: { url: string; durationSec: number }; // Audio message
  audioPlayProgress?: number; // 0-1, used during playback animation
}

export interface ParsedScript {
  contact: string;
  messages: ChatMessage[];
}

export function parseScript(
  script: string,
  images?: Record<string, string>,
  audios?: Record<string, { url: string; durationSec: number }>
): ParsedScript {
  const lines = script.trim().split("\n").filter((l) => l.trim());
  if (lines.length === 0) return { contact: "Contato", messages: [] };

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
      // Check if text is an audio reference
      const audioRef = audios?.[text.toLowerCase()];
      if (audioRef) {
        messages.push({ id: id++, sender, text: "", audio: audioRef });
        continue;
      }
      // Check if text is an image reference
      const imageUrl = images?.[text.toLowerCase()];
      if (imageUrl && sender === "me") {
        messages.push({ id: id++, sender, text: "", image: imageUrl });
      } else {
        messages.push({ id: id++, sender, text });
      }
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
      
      if (msg.image) {
        await new Promise((r) => setTimeout(r, 400 / speed));
        setVisibleMessages((prev) => [...prev, msg]);
      } else if (msg.audio) {
        // Show the audio bubble, then animate playback progress
        const audioMsg = { ...msg, audioPlayProgress: 0 };
        setVisibleMessages((prev) => [...prev, audioMsg]);
        
        // Brief pause before "playing"
        await new Promise((r) => setTimeout(r, 300 / speed));
        
        // Animate audio playback over the duration
        const audioDurationMs = msg.audio.durationSec * 1000 / speed;
        const stepMs = 50;
        const steps = Math.ceil(audioDurationMs / stepMs);
        
        for (let s = 0; s <= steps; s++) {
          if (cancelRef.current) break;
          const progress = Math.min(s / steps, 1);
          setVisibleMessages((prev) => {
            const updated = [...prev];
            const lastIdx = updated.length - 1;
            updated[lastIdx] = { ...updated[lastIdx], audioPlayProgress: progress };
            return updated;
          });
          await new Promise((r) => setTimeout(r, stepMs));
        }
      } else {
        setTypingSender(msg.sender);
        setIsTyping(true);
        setCurrentTypingText("");
        setTypingProgress(0);

        for (let c = 0; c <= msg.text.length; c++) {
          if (cancelRef.current) break;
          setCurrentTypingText(msg.text.substring(0, c));
          setTypingProgress(c / msg.text.length);
          await new Promise((r) => setTimeout(r, charDelay));
        }

        if (cancelRef.current) break;

        await new Promise((r) => setTimeout(r, 200 / speed));

        setIsTyping(false);
        setCurrentTypingText("");
        setVisibleMessages((prev) => [...prev, msg]);
      }

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
