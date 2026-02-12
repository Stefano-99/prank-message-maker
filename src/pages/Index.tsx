import { useState, useCallback } from "react";
import ScriptEditor from "@/components/ScriptEditor";
import WhatsAppSimulator from "@/components/WhatsAppSimulator";
import InstagramSimulator from "@/components/InstagramSimulator";
import { useChatPlayback, parseScript } from "@/hooks/useChatPlayback";

const Index = () => {
  const [platform, setPlatform] = useState<"whatsapp" | "instagram">("whatsapp");
  const [contactName, setContactName] = useState("João");
  const playback = useChatPlayback();

  const handlePlay = useCallback(
    (script: string, speed: number) => {
      const parsed = parseScript(script);
      if (parsed.contact !== "Contato") {
        setContactName(parsed.contact);
      }
      playback.play(parsed.messages, speed);
    },
    [playback]
  );

  const handleReset = useCallback(() => {
    playback.reset();
  }, [playback]);

  const SimulatorComponent = platform === "whatsapp" ? WhatsAppSimulator : InstagramSimulator;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row items-center justify-center gap-8 p-6">
      <ScriptEditor
        onPlay={handlePlay}
        onReset={handleReset}
        isPlaying={playback.isPlaying}
        platform={platform}
        onPlatformChange={setPlatform}
        contactName={contactName}
        onContactNameChange={setContactName}
      />

      <div className="shrink-0">
        <SimulatorComponent
          contactName={contactName}
          messages={playback.visibleMessages}
          isTyping={playback.isTyping}
          typingSender={playback.typingSender}
          currentTypingText={playback.currentTypingText}
        />
      </div>
    </div>
  );
};

export default Index;
