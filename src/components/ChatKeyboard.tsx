import { useEffect, useState } from "react";

const ROWS_LOWER = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

const ROWS_UPPER = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["⇧", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
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
    special: "bg-[#1f2e37] text-[#d1d7db]",
    suggestions: false,
    uppercase: false,
  },
  ios: {
    bg: "bg-[#1c1c1e]",
    key: "bg-[#3a3a3c] text-white",
    pressed: "bg-[#636366] text-white",
    space: "bg-[#3a3a3c] text-white",
    spacePressed: "bg-[#4a4a4c] text-white",
    special: "bg-[#2c2c2e] text-white",
    suggestions: false,
    uppercase: true,
  },
};

export default function ChatKeyboard({ currentText, isActive, theme = "whatsapp" }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const t = themes[theme];
  const ROWS = t.uppercase ? ROWS_UPPER : ROWS_LOWER;

  useEffect(() => {
    if (!isActive || !currentText) {
      setActiveKey(null);
      return;
    }
    const lastChar = currentText[currentText.length - 1] || null;
    setActiveKey(lastChar);

    const timer = setTimeout(() => setActiveKey(null), 150);
    return () => clearTimeout(timer);
  }, [currentText, isActive]);

  if (!isActive) return null;

  const isKeyPressed = (key: string) => {
    if (!activeKey) return false;
    return key.toLowerCase() === activeKey.toLowerCase();
  };

  return (
    <div className={`w-full ${t.bg} pt-0 pb-[2px] px-[3px]`}>
      {/* Suggestions bar (iOS only) */}
      {t.suggestions && (
        <div className="flex items-center h-[40px] border-b border-[#3a3a3c] px-[4px] gap-0">
          <div className="flex-1 flex items-center justify-center h-full text-[15px] text-white">Nu</div>
          <div className="w-[1px] h-[20px] bg-[#3a3a3c]" />
          <div className="flex-1 flex items-center justify-center h-full text-[15px] text-white">Și</div>
          <div className="w-[1px] h-[20px] bg-[#3a3a3c]" />
          <div className="flex-1 flex items-center justify-center h-full text-[15px] text-white">Rpd</div>
          <div className="w-[1px] h-[20px] bg-[#3a3a3c]" />
          <div className="w-[40px] flex items-center justify-center h-full text-[14px] text-[#8e8e93]">≡A</div>
        </div>
      )}

      <div className="pt-[6px] space-y-[6px]">
        {ROWS.map((row, ri) => (
          <div key={ri} className="flex justify-center gap-[5px] px-[2px]">
            {row.map((key) => {
              const isSpecial = key === "⇧" || key === "⌫";
              const pressed = isKeyPressed(key);
              return (
                <div
                  key={key}
                  className={`flex items-center justify-center rounded-[5px] text-[17px] font-normal transition-all duration-75
                    ${isSpecial ? "w-[38px]" : "flex-1 max-w-[35px]"} h-[42px]
                    ${pressed ? `${t.pressed} scale-110 -translate-y-[4px] shadow-lg` : isSpecial ? t.special : t.key}`}
                >
                  {key === "⌫" ? (
                    <svg width="20" height="16" viewBox="0 0 20 16" fill="none">
                      <path d="M7 1L1 8L7 15H19V1H7Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M10.5 5.5L14.5 10.5M14.5 5.5L10.5 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                    </svg>
                  ) : key === "⇧" ? (
                    <svg width="16" height="18" viewBox="0 0 16 18" fill="none">
                      <path d="M8 1L1 10H5V17H11V10H15L8 1Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    key
                  )}
                </div>
              );
            })}
          </div>
        ))}
        {/* Bottom row */}
        <div className="flex justify-center gap-[5px] px-[2px]">
          <div className={`w-[38px] h-[42px] flex items-center justify-center rounded-[5px] ${t.special} text-[16px]`}>
            123
          </div>
          <div className={`w-[34px] h-[42px] flex items-center justify-center rounded-[5px] ${t.special} text-[20px]`}>
            😊
          </div>
          <div className={`flex-1 h-[42px] flex items-center justify-center rounded-[5px] text-[15px] transition-all duration-75 ${activeKey === " " ? t.spacePressed : t.space}`}>
            {theme === "ios" ? "space" : "Português"}
          </div>
          <div className={`w-[70px] h-[42px] flex items-center justify-center rounded-[5px] ${t.special} text-[15px]`}>
            return
          </div>
        </div>
      </div>
    </div>
  );
}
