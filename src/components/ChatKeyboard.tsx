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
    bg: "",
    key: "text-white",
    pressed: "text-white",
    space: "text-white",
    spacePressed: "text-white",
    special: "text-white",
    suggestions: false,
    uppercase: true,
  },
};

export default function ChatKeyboard({ currentText, isActive, theme = "whatsapp" }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const t = themes[theme];
  const isIOS = theme === "ios";
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

  if (isIOS) {
    return (
      <div
        className="w-full pt-[4px] pb-[4px] px-[3px]"
        style={{ backgroundColor: "#1c1c1e" }}
      >
        <div className="space-y-[6px]">
          {ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-[5px] px-[2px]">
              {ri === 1 && <div className="w-[4px]" />}
              {row.map((key) => {
                const isSpecial = key === "⇧" || key === "⌫";
                const pressed = isKeyPressed(key);
                return (
                  <div
                    key={key}
                    className={`flex items-center justify-center text-white transition-all duration-75
                      ${isSpecial ? "w-[40px]" : "flex-1 max-w-[35px]"} h-[42px]
                      ${pressed ? "scale-110 -translate-y-[4px]" : ""}`}
                    style={{
                      borderRadius: "6px",
                      backgroundColor: pressed
                        ? "#6b6b6e"
                        : isSpecial
                          ? "#3a3a3c"
                          : "#4a4a4c",
                      fontSize: isSpecial ? undefined : "22px",
                      fontWeight: 300,
                    }}
                  >
                    {key === "⌫" ? (
                      <svg width="22" height="17" viewBox="0 0 22 17" fill="none">
                        <path d="M7.5 1L1 8.5L7.5 16H21V1H7.5Z" stroke="white" strokeWidth="1.4" strokeLinejoin="round"/>
                        <path d="M11 5.5L16 11.5M16 5.5L11 11.5" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ) : key === "⇧" ? (
                      <svg width="18" height="20" viewBox="0 0 16 18" fill="none">
                        <path d="M8 2L1.5 10H5V17H11V10H14.5L8 2Z" fill="white"/>
                      </svg>
                    ) : (
                      key
                    )}
                  </div>
                );
              })}
              {ri === 1 && <div className="w-[4px]" />}
            </div>
          ))}
          {/* Bottom row */}
          <div className="flex justify-center gap-[5px] px-[2px]">
            <div
              className="w-[40px] h-[42px] flex items-center justify-center text-white text-[15px]"
              style={{ borderRadius: "6px", backgroundColor: "#3a3a3c" }}
            >
              123
            </div>
            <div
              className="w-[36px] h-[42px] flex items-center justify-center text-[22px]"
              style={{ borderRadius: "6px", backgroundColor: "#3a3a3c" }}
            >
              😊
            </div>
            <div
              className="flex-1 h-[42px] flex items-center justify-center text-white text-[15px] transition-all duration-75"
              style={{
                borderRadius: "6px",
                backgroundColor: activeKey === " " ? "#5a5a5c" : "#4a4a4c",
              }}
            >
              space
            </div>
            <div
              className="w-[76px] h-[42px] flex items-center justify-center text-white text-[15px]"
              style={{ borderRadius: "6px", backgroundColor: "#3a3a3c" }}
            >
              return
            </div>
          </div>
        </div>
      </div>
    );
  }

  // WhatsApp theme
  return (
    <div className={`w-full ${t.bg} pt-0 pb-[2px] px-[3px]`}>
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
            Português
          </div>
          <div className={`w-[70px] h-[42px] flex items-center justify-center rounded-[5px] ${t.special} text-[15px]`}>
            return
          </div>
        </div>
      </div>
    </div>
  );
}
