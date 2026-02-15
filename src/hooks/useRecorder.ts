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
      // Native browser capture — zero main-thread impact
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: { ideal: 60, max: 60 },
          // @ts-ignore – Chrome-specific flags
          preferCurrentTab: true,
          selfBrowserSurface: "include",
        } as MediaTrackConstraints,
        audio: false,
        // @ts-ignore
        preferCurrentTab: true,
        selfBrowserSurface: "include",
      });

      streamRef.current = displayStream;

      const video = document.createElement("video");
      video.srcObject = displayStream;
      video.muted = true;
      videoRef.current = video;
      await video.play();

      // Wait for video dimensions
      await new Promise<void>((resolve) => {
        const check = () => {
          if (video.videoWidth > 0 && video.videoHeight > 0) resolve();
          else requestAnimationFrame(check);
        };
        check();
      });

      // Crop to just the chat element
      const rect = element.getBoundingClientRect();
      const vw = video.videoWidth;
      const vh = video.videoHeight;

      // Map element CSS coordinates to captured video coordinates
      // getDisplayMedia captures the viewport, so scale is simply video/viewport
      const scaleX = vw / window.innerWidth;
      const scaleY = vh / window.innerHeight;
      const cropX = rect.left * scaleX;
      const cropY = rect.top * scaleY;
      const cropW = rect.width * scaleX;
      const cropH = rect.height * scaleY;

      // Output canvas preserving aspect ratio
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(cropW);
      canvas.height = Math.round(cropH);
      const ctx = canvas.getContext("2d")!;

      // 60fps draw loop — just a blit, no DOM serialization
      const drawFrame = () => {
        if (!recordingRef.current) return;
        ctx.drawImage(video, cropX, cropY, cropW, cropH, 0, 0, canvas.width, canvas.height);
        rafRef.current = requestAnimationFrame(drawFrame);
      };
      rafRef.current = requestAnimationFrame(drawFrame);

      // Record canvas stream
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
