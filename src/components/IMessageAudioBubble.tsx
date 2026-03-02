import { useState, useRef, useCallback } from "react";

interface Props {
  isMe: boolean;
  durationSec: number;
  audioUrl?: string;
  isAnimPlaying?: boolean;
  playProgress?: number; // 0-1
  tailClass: string;
}

export default function IMessageAudioBubble({ isMe, durationSec, audioUrl, isAnimPlaying, playProgress = 0, tailClass }: Props) {
  const [manualPlaying, setManualPlaying] = useState(false);
  const [manualProgress, setManualProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const rafRef = useRef<number>(0);

  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = useCallback(() => {
    if (!audioUrl) return;

    if (manualPlaying && audioRef.current) {
      audioRef.current.pause();
      cancelAnimationFrame(rafRef.current);
      setManualPlaying(false);
      return;
    }

    // Create or reuse audio element synchronously in user gesture
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "auto";
    }
    const audio = audioRef.current;
    
    // Only set src if changed
    if (audio.src !== audioUrl) {
      audio.src = audioUrl;
      audio.load();
    }

    // Reset to beginning if ended
    if (audio.ended || audio.currentTime > 0) {
      audio.currentTime = 0;
    }

    const updateProgress = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setManualProgress(audio.currentTime / audio.duration);
      }
      if (!audio.paused && !audio.ended) {
        rafRef.current = requestAnimationFrame(updateProgress);
      }
    };

    audio.onended = () => {
      setManualPlaying(false);
      setManualProgress(0);
      cancelAnimationFrame(rafRef.current);
    };

    // Play immediately in user gesture context
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => {
        setManualPlaying(true);
        rafRef.current = requestAnimationFrame(updateProgress);
      }).catch((err) => {
        console.error("Audio play failed:", err);
      });
    }
  }, [audioUrl, manualPlaying]);

  // Use manual playback state if user clicked play, otherwise use animation state
  const activeProgress = manualPlaying ? manualProgress : playProgress;
  const activePlaying = manualPlaying || isAnimPlaying;
  const remaining = Math.max(0, durationSec - durationSec * activeProgress);
  const barCount = 30;

  return (
    <div
      className={`imsg-bubble ${isMe ? "imsg-me" : "imsg-them"} ${tailClass}`}
      style={{ minWidth: 200, maxWidth: "75%", padding: "6px 10px" }}
    >
      <div className="flex items-center gap-[8px]">
        {/* Play/Pause button */}
        <button
          onClick={handlePlayPause}
          className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 cursor-pointer"
          style={{ backgroundColor: isMe ? "rgba(255,255,255,0.15)" : "#0A84FF" }}
        >
          {activePlaying ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <rect x="1" y="1" width="3.5" height="12" rx="1" fill="white" />
              <rect x="7.5" y="1" width="3.5" height="12" rx="1" fill="white" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M2 1.5V12.5L11 7L2 1.5Z" fill="white" />
            </svg>
          )}
        </button>

        {/* Waveform */}
        <div className="flex-1 flex items-center gap-[1.5px] h-[28px]">
          {Array.from({ length: barCount }).map((_, i) => {
            const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
            const normalHeight = 0.2 + (seed - Math.floor(seed)) * 0.8;
            const heightPx = 4 + normalHeight * 20;
            const barPosition = i / barCount;
            const played = barPosition <= activeProgress;

            return (
              <div
                key={i}
                className="rounded-full transition-all duration-100"
                style={{
                  width: 2.5,
                  height: heightPx,
                  backgroundColor: isMe
                    ? (played ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)")
                    : (played ? "#8E8E93" : "rgba(255,255,255,0.3)"),
                }}
              />
            );
          })}
        </div>

        {/* Duration */}
        <span className="text-[11px] text-white/70 font-normal tabular-nums shrink-0 min-w-[28px] text-right">
          {activePlaying ? formatDuration(remaining) : formatDuration(durationSec)}
        </span>
      </div>
    </div>
  );
}
