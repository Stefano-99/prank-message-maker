import { useRef, useState, useCallback } from "react";
import html2canvas from "html2canvas";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const recordingRef = useRef(false);

  const startRecording = useCallback(async (element: HTMLElement) => {
    chunksRef.current = [];
    recordingRef.current = true;

    const rect = element.getBoundingClientRect();
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(rect.width * scale);
    canvas.height = Math.round(rect.height * scale);
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d")!;

    // Fill with initial background
    ctx.fillStyle = "#0b141a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      chunksRef.current = [];
    };

    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.start(200);
    setIsRecording(true);

    // Capture frames sequentially to avoid overlapping captures
    const captureFrame = async () => {
      if (!recordingRef.current || !canvasRef.current) return;
      try {
        const captured = await html2canvas(element, {
          scale,
          useCORS: true,
          logging: false,
          backgroundColor: null,
          foreignObjectRendering: true, // Uses SVG foreignObject - no DOM cloning
          width: rect.width,
          height: rect.height,
          x: 0,
          y: 0,
          scrollX: 0,
          scrollY: 0,
          windowWidth: rect.width,
          windowHeight: rect.height,
        });
        if (canvasRef.current) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(captured, 0, 0, canvas.width, canvas.height);
        }
      } catch {
        // skip frame
      }
      // Schedule next frame only after current one completes
      if (recordingRef.current) {
        intervalRef.current = setTimeout(captureFrame, 120); // ~8fps, sequential
      }
    };

    // Start capture loop
    captureFrame();
  }, []);

  const stopRecording = useCallback(() => {
    recordingRef.current = false;
    if (intervalRef.current) {
      clearTimeout(intervalRef.current);
      intervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording };
}
