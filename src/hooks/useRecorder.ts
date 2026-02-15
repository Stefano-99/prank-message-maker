import { useRef, useState, useCallback } from "react";

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const rafRef = useRef<number | null>(null);
  const recordingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const startRecording = useCallback(async (element: HTMLElement) => {
    chunksRef.current = [];
    recordingRef.current = true;

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 60, max: 60 },
          // @ts-ignore
          preferCurrentTab: true,
          selfBrowserSurface: "include",
        } as MediaTrackConstraints,
        audio: false,
        // @ts-ignore
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      });

      streamRef.current = displayStream;

      // Setup video element to read stream
      const video = document.createElement("video");
      video.srcObject = displayStream;
      video.muted = true;
      videoRef.current = video;
      await video.play();

      // Wait for video to have dimensions
      await new Promise<void>((resolve) => {
        const check = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) {
            resolve();
          } else {
            requestAnimationFrame(check);
          }
        };
        check();
      });

      // Calculate crop area based on element position
      const rect = element.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // The captured video dimensions
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // The viewport dimensions (what getDisplayMedia captures)
      const viewportW = window.innerWidth * dpr;
      const viewportH = window.innerHeight * dpr;

      // Scale factor between capture and viewport
      const scaleX = vw / (window.innerWidth * dpr);
      const scaleY = vh / (window.innerHeight * dpr);

      const cropX = rect.left * dpr * scaleX;
      const cropY = rect.top * dpr * scaleY;
      const cropW = rect.width * dpr * scaleX;
      const cropH = rect.height * dpr * scaleY;

      // Output canvas at 2x for high quality
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(rect.width * 2);
      canvas.height = Math.round(rect.height * 2);
      const ctx = canvas.getContext("2d")!;

      // Smooth draw loop at native refresh rate
      const drawFrame = () => {
        if (!recordingRef.current) return;
        ctx.drawImage(
          video,
          cropX, cropY, cropW, cropH,
          0, 0, canvas.width, canvas.height
        );
        rafRef.current = requestAnimationFrame(drawFrame);
      };
      rafRef.current = requestAnimationFrame(drawFrame);

      // Record from canvas
      const canvasStream = canvas.captureStream(60);
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
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        chunksRef.current = [];
        if (videoRef.current) {
          videoRef.current.pause();
          videoRef.current.srcObject = null;
          videoRef.current = null;
        }
      };

      // Auto-stop if user ends screen share
      displayStream.getVideoTracks()[0].onended = () => {
        if (recordingRef.current) stopRecording();
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
