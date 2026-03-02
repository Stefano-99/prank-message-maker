import { useState, useCallback, useRef } from "react";
import { toCanvas } from "html-to-image";
import { Muxer, ArrayBufferTarget } from "webm-muxer";
import type { ChatMessage } from "./useChatPlayback";

export interface ExportChatState {
  visibleMessages: ChatMessage[];
  isTyping: boolean;
  typingSender: "me" | "them";
  currentTypingText: string;
}

interface ExportProgress {
  current: number;
  total: number;
}

/* ─── Pure timeline computation ─── */

function computeTotalDuration(messages: ChatMessage[], speed: number): number {
  const charDelay = 45 / speed;
  const pauseBetween = 600 / speed;
  const imagePause = 400 / speed;
  const sendPause = 200 / speed;

  let t = 0;
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    if (msg.image) {
      t += imagePause;
    } else if (msg.audio) {
      t += 300 / speed; // initial pause
      t += msg.audio.durationSec * 1000 / speed; // playback duration
    } else {
      t += charDelay * msg.text.length;
      t += sendPause;
    }
    if (i < messages.length - 1) t += pauseBetween;
  }
  return t;
}

function computeStateAtTime(
  messages: ChatMessage[],
  speed: number,
  timeMs: number
): ExportChatState {
  const charDelay = 45 / speed;
  const pauseBetween = 600 / speed;
  const imagePause = 400 / speed;
  const sendPause = 200 / speed;

  let t = 0;
  const visible: ChatMessage[] = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];

    if (msg.image) {
      const endTime = t + imagePause;
      if (timeMs < endTime) {
        return { visibleMessages: [...visible], isTyping: false, typingSender: "me", currentTypingText: "" };
      }
      t = endTime;
      visible.push(msg);
    } else if (msg.audio) {
      const initPause = 300 / speed;
      const audioDur = msg.audio.durationSec * 1000 / speed;
      
      if (timeMs < t + initPause) {
        // Audio bubble appears but not playing yet
        visible.push({ ...msg, audioPlayProgress: 0 });
        return { visibleMessages: [...visible], isTyping: false, typingSender: "me", currentTypingText: "" };
      }
      t += initPause;
      
      if (timeMs < t + audioDur) {
        const progress = (timeMs - t) / audioDur;
        visible.push({ ...msg, audioPlayProgress: progress });
        return { visibleMessages: [...visible], isTyping: false, typingSender: "me", currentTypingText: "" };
      }
      t += audioDur;
      visible.push({ ...msg, audioPlayProgress: 1 });
    } else {
      const typingEnd = t + charDelay * msg.text.length;

      if (timeMs < typingEnd) {
        const elapsed = timeMs - t;
        const charsTyped = Math.min(Math.floor(elapsed / charDelay), msg.text.length);
        return {
          visibleMessages: [...visible],
          isTyping: true,
          typingSender: msg.sender,
          currentTypingText: msg.text.substring(0, charsTyped),
        };
      }

      t = typingEnd;
      const sendEnd = t + sendPause;

      if (timeMs < sendEnd) {
        return {
          visibleMessages: [...visible],
          isTyping: true,
          typingSender: msg.sender,
          currentTypingText: msg.text,
        };
      }

      t = sendEnd;
      visible.push(msg);
    }

    if (i < messages.length - 1) {
      const pauseEnd = t + pauseBetween;
      if (timeMs < pauseEnd) {
        return { visibleMessages: [...visible], isTyping: false, typingSender: "me", currentTypingText: "" };
      }
      t = pauseEnd;
    }
  }

  return { visibleMessages: [...visible], isTyping: false, typingSender: "me", currentTypingText: "" };
}

/* ─── Hook ─── */

export function useRecorder() {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress | null>(null);
  const [chatState, setChatState] = useState<ExportChatState | null>(null);
  const cancelRef = useRef(false);

  const startExport = useCallback(
    async (element: HTMLElement, messages: ChatMessage[], speed: number) => {
      if (messages.length === 0) return;
      cancelRef.current = false;
      setIsExporting(true);

      const FPS = 60;
      const frameInterval = 1000 / FPS; // 16.667ms
      const totalDuration = computeTotalDuration(messages, speed) + 1000; // +1s hold at end
      const totalFrames = Math.ceil(totalDuration / frameInterval);

      setProgress({ current: 0, total: totalFrames });

      try {
        // Determine dimensions (even numbers required for video codecs)
        const rect = element.getBoundingClientRect();
        const pixelRatio = 1.5;
        const width = Math.round(rect.width * pixelRatio) & ~1; // nearest even
        const height = Math.round(rect.height * pixelRatio) & ~1;

        // Setup muxer
        const target = new ArrayBufferTarget();
        const muxer = new Muxer({
          target,
          video: { codec: "V_VP9", width, height },
        });

        // Setup WebCodecs encoder
        const encoder = new VideoEncoder({
          output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
          error: (err) => console.error("VideoEncoder error:", err),
        });

        encoder.configure({
          codec: "vp09.00.10.08",
          width,
          height,
          bitrate: 8_000_000,
          framerate: FPS,
        });

        // Frame-by-frame export loop
        for (let i = 0; i < totalFrames; i++) {
          if (cancelRef.current) break;

          const t = i * frameInterval;
          const state = computeStateAtTime(messages, speed, t);

          // Update React state (drives simulator re-render)
          setChatState(state);

          // Wait for React to render — double rAF ensures paint
          await new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
          );

          // Capture DOM to canvas
          const canvas = await toCanvas(element, {
            width: rect.width,
            height: rect.height,
            pixelRatio,
            cacheBust: false,
            skipAutoScale: true,
          });

          // Create VideoFrame and encode
          const frame = new VideoFrame(canvas, {
            timestamp: i * (1_000_000 / FPS), // microseconds
            duration: 1_000_000 / FPS,
          });
          encoder.encode(frame, { keyFrame: i % 60 === 0 });
          frame.close();

          setProgress({ current: i + 1, total: totalFrames });
        }

        // Finalize
        await encoder.flush();
        encoder.close();
        muxer.finalize();

        if (!cancelRef.current) {
          // Download
          const blob = new Blob([target.buffer], { type: "video/webm" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `fakechat-${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
        }
      } catch (err) {
        console.error("Frame-by-frame export failed:", err);
      }

      setChatState(null);
      setProgress(null);
      setIsExporting(false);
    },
    []
  );

  const cancelExport = useCallback(() => {
    cancelRef.current = true;
  }, []);

  return { isExporting, progress, chatState, startExport, cancelExport };
}
