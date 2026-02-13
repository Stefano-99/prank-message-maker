import { useEffect, useState } from "react";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

interface Props {
  currentText: string;
  isActive: boolean;
  theme?: "whatsapp" | "ios";
}

const themes = {
  whatsapp: {
    bg: "bg-[#1b2b36]",
    key: "bg-[#2a3942] text-[#d1d7db]",
    pressed: "bg-[#00a884] text-[#0b141a]",
    space: "bg-[#2a3942] text-[#d1d7db]",
    spacePressed: "bg-[#3a4f5a] text-[#d1d7db]",
  },
  ios: {
    bg: "bg-[#1c1c1e]",
    key: "bg-[#3a3a3c] text-white",
    pressed: "bg-[#0a84ff] text-white",
    space: "bg-[#3a3a3c] text-white",
    spacePressed: "bg-[#4a4a4c] text-white",
  },
};

export default function ChatKeyboard({ currentText, isActive, theme = "whatsapp" }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const t = themes[theme];

  useEffect(() => {
    if (!isActive || !currentText) {
      setActiveKey(null);
      return;
    }
    const lastChar = currentText[currentText.length - 1]?.toLowerCase() || null;
    setActiveKey(lastChar);

    const timer = setTimeout(() => setActiveKey(null), 150);
    return () => clearTimeout(timer);
  }, [currentText, isActive]);

  if (!isActive) return null;

  return (
    <div className={`w-full ${t.bg} pt-[6px] pb-[4px] px-[3px] space-y-[5px]`}>
      {ROWS.map((row, ri) => (
        <div key={ri} className="flex justify-center gap-[4px]">
          {row.map((key) => {
            const isSpecial = key === "⇧" || key === "⌫";
            const isPressed = activeKey === key.toLowerCase();
            return (
              <div
                key={key}
                className={`flex items-center justify-center rounded-[5px] text-[16px] transition-all duration-75
                  ${isSpecial ? "w-[36px]" : "flex-1 max-w-[34px]"} h-[42px]
                  ${isPressed ? `${t.pressed} scale-110 -translate-y-[4px] shadow-lg` : t.key}`}
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}
      {/* Bottom row */}
      <div className="flex justify-center gap-[4px]">
        <div className={`w-[36px] h-[42px] flex items-center justify-center rounded-[5px] ${t.key} text-[16px]`}>
          😊
        </div>
        <div className={`w-[30px] h-[42px] flex items-center justify-center rounded-[5px] text-[18px] transition-all duration-75 ${activeKey === "," ? `${t.pressed} scale-110` : t.key}`}>
          ,
        </div>
        <div className={`flex-1 h-[42px] flex items-center justify-center rounded-[5px] text-[14px] transition-all duration-75 ${activeKey === " " ? t.spacePressed : t.space}`}>
          {theme === "ios" ? "espaço" : "Português"}
        </div>
        <div className={`w-[30px] h-[42px] flex items-center justify-center rounded-[5px] text-[18px] transition-all duration-75 ${activeKey === "." ? `${t.pressed} scale-110` : t.key}`}>
          .
        </div>
        <div className={`w-[36px] h-[42px] flex items-center justify-center rounded-[5px] ${t.key} text-[14px]`}>
          ↵
        </div>
      </div>
    </div>
  );
}
