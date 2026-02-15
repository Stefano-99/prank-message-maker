import { useRef, useState, useCallback } from "react";
import domtoimage from "dom-to-image-more";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const recordingRef = useRef(false);

  const startRecording = useCallback(async (element: HTMLElement) => {
    targetRef.current = element;
    chunksRef.current = [];
    recordingRef.current = true;

    const rect = element.getBoundingClientRect();
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;
    canvasRef.current = canvas;
    const ctx = canvas.getContext("2d")!;

    // Fill initial frame with black
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream(30);
    const mediaRecorder = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9",
      videoBitsPerSecond: 10_000_000,
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

    // Use requestAnimationFrame for smooth frame capture
    let lastFrameTime = 0;
    const frameInterval = 1000 / 20; // 20fps is practical for dom-to-image

    const captureLoop = async (timestamp: number) => {
      if (!recordingRef.current) return;

      if (timestamp - lastFrameTime >= frameInterval) {
        lastFrameTime = timestamp;
        try {
          if (targetRef.current && canvasRef.current) {
            const dataUrl = await domtoimage.toPng(targetRef.current, {
              width: rect.width,
              height: rect.height,
              style: {
                transform: "none",
                "transform-origin": "top left",
              },
              quality: 1,
            });
            const img = new Image();
            img.onload = () => {
              if (canvasRef.current) {
                const c = canvasRef.current.getContext("2d");
                if (c) {
                  c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                  c.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
                }
              }
            };
            img.src = dataUrl;
          }
        } catch {
          // skip frame on error
        }
      }

      rafRef.current = requestAnimationFrame(captureLoop);
    };

    rafRef.current = requestAnimationFrame(captureLoop);
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
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording };
}
