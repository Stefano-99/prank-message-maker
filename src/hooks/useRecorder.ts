import { useRef, useState, useCallback } from "react";
import { toSvg } from "html-to-image";

interface FrameData {
  svgDataUrl: string;
  timestamp: number;
}

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recordingRef = useRef(false);
  const framesRef = useRef<FrameData[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async (element: HTMLElement) => {
    framesRef.current = [];
    recordingRef.current = true;
    setIsRecording(true);

    const captureInterval = 16; // ~60fps SVG snapshots
    const rect = element.getBoundingClientRect();

    // Collect SVG snapshots during playback — toSvg is fast (string serialization only)
    timerRef.current = setInterval(async () => {
      if (!recordingRef.current) return;
      try {
        const svg = await toSvg(element, {
          width: rect.width,
          height: rect.height,
          pixelRatio: 2,
          cacheBust: false,
          skipAutoScale: true,
        });
        if (recordingRef.current) {
          framesRef.current.push({
            svgDataUrl: svg,
            timestamp: performance.now(),
          });
        }
      } catch {
        // skip frame
      }
    }, captureInterval);
  }, []);

  const stopRecording = useCallback(async () => {
    recordingRef.current = false;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRecording(false);

    const frames = framesRef.current;
    if (frames.length < 2) {
      framesRef.current = [];
      return;
    }

    // Post-process: render SVG frames to canvas → video
    setIsProcessing(true);

    try {
      // Get dimensions from first frame by loading it
      const probe = new Image();
      await new Promise<void>((resolve, reject) => {
        probe.onload = () => resolve();
        probe.onerror = () => reject();
        probe.src = frames[0].svgDataUrl;
      });

      const width = probe.naturalWidth;
      const height = probe.naturalHeight;

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d")!;

      // Draw first frame so captureStream has content
      ctx.drawImage(probe, 0, 0, width, height);

      const stream = canvas.captureStream(60);
      const chunks: Blob[] = [];
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 8_000_000,
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const donePromise = new Promise<void>((resolve) => {
        mediaRecorder.onstop = () => resolve();
      });

      mediaRecorder.start(100);

      // Render each frame with correct timing
      for (let i = 0; i < frames.length; i++) {
        const img = new Image();
        await new Promise<void>((resolve) => {
          img.onload = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.drawImage(img, 0, 0, width, height);
            resolve();
          };
          img.onerror = () => resolve();
          img.src = frames[i].svgDataUrl;
        });

        // Hold frame for its duration
        const duration =
          i < frames.length - 1
            ? frames[i + 1].timestamp - frames[i].timestamp
            : 200;
        await new Promise((r) => setTimeout(r, Math.min(duration, 500)));
      }

      // Hold last frame a bit
      await new Promise((r) => setTimeout(r, 500));

      mediaRecorder.stop();
      await donePromise;

      // Download
      const blob = new Blob(chunks, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fakechat-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch (err) {
      console.error("Video processing failed:", err);
    }

    framesRef.current = [];
    setIsProcessing(false);
  }, []);

  return { isRecording, isProcessing, startRecording, stopRecording };
}
