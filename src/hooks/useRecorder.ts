import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingRef = useRef(false);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);

  const startRecording = useCallback(async (element: HTMLElement) => {
    chunksRef.current = [];
    recordingRef.current = true;

    const rect = element.getBoundingClientRect();
    const scale = 2;
    const w = Math.round(rect.width * scale);
    const h = Math.round(rect.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d")!;
    ctxRef.current = ctx;

    // Initial fill
    ctx.fillStyle = "#0b141a";
    ctx.fillRect(0, 0, w, h);

    // First frame before starting recorder
    try {
      const first = await html2canvas(element, {
        scale,
        useCORS: true,
        logging: false,
        backgroundColor: "#0b141a",
        removeContainer: true,
      });
      ctx.drawImage(first, 0, 0, w, h);
    } catch {}

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 8_000_000,
    });

    mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fakechat-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      chunksRef.current = [];
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(500);
    setIsRecording(true);

    // Sequential frame capture - waits for each capture to complete before next
    const captureLoop = async () => {
      if (!recordingRef.current) return;
      try {
        const captured = await html2canvas(element, {
          scale,
          useCORS: true,
          logging: false,
          backgroundColor: "#0b141a",
          removeContainer: true,
        });
        if (ctxRef.current && canvasRef.current) {
          ctxRef.current.clearRect(0, 0, w, h);
          ctxRef.current.drawImage(captured, 0, 0, w, h);
        }
      } catch {}

      if (recordingRef.current) {
        // ~5fps sequential - low enough to avoid visual interference
        timeoutRef.current = setTimeout(captureLoop, 200);
      }
    };

    // Small delay before starting capture loop
    timeoutRef.current = setTimeout(captureLoop, 300);
  }, []);

  const stopRecording = useCallback(() => {
    recordingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    // Wait a moment to capture final state
    setTimeout(() => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        mediaRecorderRef.current.stop();
      }
    }, 300);
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording };
}
