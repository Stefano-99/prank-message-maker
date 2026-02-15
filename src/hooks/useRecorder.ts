import { useRef, useState, useCallback } from "react";
import { toPng } from "html-to-image";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordingRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const startRecording = useCallback(async (element: HTMLElement) => {
    chunksRef.current = [];
    recordingRef.current = true;

    const rect = element.getBoundingClientRect();
    const scale = 2; // HD output
    const width = Math.round(rect.width * scale);
    const height = Math.round(rect.height * scale);

    // Create off-screen canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d")!;

    // Start recording from canvas
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
    mediaRecorder.start(100);
    setIsRecording(true);

    // Capture loop: snapshot DOM → draw on canvas
    const img = new Image();
    let capturing = false;

    const captureFrame = async () => {
      if (!recordingRef.current) return;

      if (!capturing) {
        capturing = true;
        try {
          const dataUrl = await toPng(element, {
            width: rect.width,
            height: rect.height,
            pixelRatio: scale,
            cacheBust: true,
            skipAutoScale: true,
            includeQueryParams: true,
          });

          await new Promise<void>((resolve) => {
            img.onload = () => {
              ctx.clearRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              resolve();
            };
            img.onerror = () => resolve();
            img.src = dataUrl;
          });
        } catch {
          // skip frame on error
        }
        capturing = false;
      }

      if (recordingRef.current) {
        rafRef.current = requestAnimationFrame(captureFrame);
      }
    };

    rafRef.current = requestAnimationFrame(captureFrame);
  }, []);

  const stopRecording = useCallback(() => {
    recordingRef.current = false;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    canvasRef.current = null;
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording };
}
