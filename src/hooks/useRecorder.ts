import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  const startRecording = useCallback(async (element: HTMLElement) => {
    targetRef.current = element;
    chunksRef.current = [];

    // Create offscreen canvas matching element size
    const rect = element.getBoundingClientRect();
    const scale = 2; // 2x for high quality
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    canvasRef.current = canvas;

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 8_000_000, // 8 Mbps for high quality
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
      a.click();
      URL.revokeObjectURL(url);
      chunksRef.current = [];
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(100);
    setIsRecording(true);

    // Capture frames
    const captureFrame = async () => {
      if (!targetRef.current || !canvasRef.current) return;
      try {
        const captured = await html2canvas(targetRef.current, {
          scale,
          useCORS: true,
          logging: false,
          backgroundColor: null,
        });
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          ctx.drawImage(captured, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      } catch {
        // ignore frame errors
      }
    };

    // Capture at ~15fps (html2canvas is heavy, 15 is practical)
    await captureFrame();
    intervalRef.current = window.setInterval(captureFrame, 66);
  }, []);

  const stopRecording = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording };
}
