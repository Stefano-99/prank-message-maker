import { useEffect, useState, useRef } from "react";

interface Props {
  isMe: boolean;
  durationSec: number;
  isPlaying?: boolean; // whether this audio is currently "playing" animation
  playProgress?: number; // 0-1
  tailClass: string;
}

export default function IMessageAudioBubble({ isMe, durationSec, isPlaying, playProgress = 0, tailClass }: Props) {
  const formatDuration = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const remaining = Math.max(0, durationSec - durationSec * playProgress);
  const barCount = 30;

  return (
    <div
      className={`imsg-bubble ${isMe ? "imsg-me" : "imsg-them"} ${tailClass}`}
      style={{ minWidth: 200, maxWidth: "75%", padding: "6px 10px" }}
    >
      <div className="flex items-center gap-[8px]">
        {/* Play/Pause button */}
        <div className="w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(255,255,255,0.15)" }}>
          {isPlaying ? (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <rect x="1" y="1" width="3.5" height="12" rx="1" fill="white" />
              <rect x="7.5" y="1" width="3.5" height="12" rx="1" fill="white" />
            </svg>
          ) : (
            <svg width="12" height="14" viewBox="0 0 12 14" fill="none">
              <path d="M2 1.5V12.5L11 7L2 1.5Z" fill="white" />
            </svg>
          )}
        </div>

        {/* Waveform */}
        <div className="flex-1 flex items-center gap-[1.5px] h-[28px]">
          {Array.from({ length: barCount }).map((_, i) => {
            const seed = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
            const normalHeight = 0.2 + (seed - Math.floor(seed)) * 0.8;
            const heightPx = 4 + normalHeight * 20;

            const barPosition = i / barCount;
            const played = barPosition <= playProgress;

            return (
              <div
                key={i}
                className="rounded-full transition-all duration-100"
                style={{
                  width: 2.5,
                  height: heightPx,
                  backgroundColor: played
                    ? "rgba(255,255,255,0.95)"
                    : "rgba(255,255,255,0.35)",
                }}
              />
            );
          })}
        </div>

        {/* Duration */}
        <span className="text-[11px] text-white/70 font-normal tabular-nums shrink-0 min-w-[28px] text-right">
          {isPlaying ? formatDuration(remaining) : formatDuration(durationSec)}
        </span>
      </div>
    </div>
  );
}
