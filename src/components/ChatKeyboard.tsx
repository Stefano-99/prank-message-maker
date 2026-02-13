import { useEffect, useState } from "react";

const ROWS = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["⇧", "z", "x", "c", "v", "b", "n", "m", "⌫"],
];

const BOTTOM_ROW = ["😊", ",", " ", ".", "↵"];

interface Props {
  currentText: string;
  isActive: boolean;
}

export default function ChatKeyboard({ currentText, isActive }: Props) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isActive || !currentText) {
      setActiveKey(null);
      return;
    }
    const lastChar = currentText[currentText.length - 1]?.toLowerCase() || null;
    setActiveKey(lastChar);

    const t = setTimeout(() => setActiveKey(null), 150);
    return () => clearTimeout(t);
  }, [currentText, isActive]);

  if (!isActive) return null;

  return (
    <div className="w-full bg-[#1b2b36] pt-[6px] pb-[4px] px-[3px] space-y-[5px]">
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
                  ${isPressed
                    ? "bg-[#00a884] text-[#0b141a] scale-110 -translate-y-[4px] shadow-lg"
                    : "bg-[#2a3942] text-[#d1d7db]"
                  }`}
              >
                {key}
              </div>
            );
          })}
        </div>
      ))}
      {/* Bottom row */}
      <div className="flex justify-center gap-[4px]">
        <div className="w-[36px] h-[42px] flex items-center justify-center rounded-[5px] bg-[#2a3942] text-[16px] text-[#d1d7db]">
          😊
        </div>
        <div className={`w-[30px] h-[42px] flex items-center justify-center rounded-[5px] text-[18px] transition-all duration-75 ${activeKey === "," ? "bg-[#00a884] text-[#0b141a] scale-110" : "bg-[#2a3942] text-[#d1d7db]"}`}>
          ,
        </div>
        <div className={`flex-1 h-[42px] flex items-center justify-center rounded-[5px] text-[14px] transition-all duration-75 ${activeKey === " " ? "bg-[#3a4f5a] text-[#d1d7db]" : "bg-[#2a3942] text-[#d1d7db]"}`}>
          Português
        </div>
        <div className={`w-[30px] h-[42px] flex items-center justify-center rounded-[5px] text-[18px] transition-all duration-75 ${activeKey === "." ? "bg-[#00a884] text-[#0b141a] scale-110" : "bg-[#2a3942] text-[#d1d7db]"}`}>
          .
        </div>
        <div className="w-[36px] h-[42px] flex items-center justify-center rounded-[5px] bg-[#2a3942] text-[14px] text-[#d1d7db]">
          ↵
        </div>
      </div>
    </div>
  );
}
