import { useRef, useState, useCallback } from "react";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const recordingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = useCallback(async (element: HTMLElement) => {
    chunksRef.current = [];
    recordingRef.current = true;

    try {
      // Capture current tab natively - perfect quality
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          // @ts-ignore - preferCurrentTab is valid in Chrome
          preferCurrentTab: true,
          frameRate: 30,
        },
        audio: false,
      });

      streamRef.current = displayStream;

      // Get element bounds to crop
      const rect = element.getBoundingClientRect();
      const scale = window.devicePixelRatio || 1;

      const cropX = rect.left * scale;
      const cropY = rect.top * scale;
      const cropW = rect.width * scale;
      const cropH = rect.height * scale;

      // Create canvas for cropping
      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d")!;

      // Create video element to read the display stream
      const video = document.createElement("video");
      video.srcObject = displayStream;
      video.muted = true;
      await video.play();

      // Draw cropped frames to canvas
      const drawFrame = () => {
        if (!recordingRef.current) return;
        ctx.drawImage(
          video,
          cropX, cropY, cropW, cropH,
          0, 0, cropW, cropH
        );
        rafRef.current = requestAnimationFrame(drawFrame);
      };
      rafRef.current = requestAnimationFrame(drawFrame);

      // Record from the cropped canvas
      const canvasStream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(canvasStream, {
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
        video.pause();
        video.srcObject = null;
      };

      // Stop recording if user stops screen share
      displayStream.getVideoTracks()[0].onended = () => {
        if (recordingRef.current) {
          stopRecording();
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
    } catch (err) {
      console.error("Recording failed:", err);
      recordingRef.current = false;
      setIsRecording(false);
    }
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
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setIsRecording(false);
  }, []);

  return { isRecording, startRecording, stopRecording };
}
