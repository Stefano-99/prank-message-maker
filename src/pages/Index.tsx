import { useState, useCallback, useRef, useEffect } from "react";
import ScriptEditor from "@/components/ScriptEditor";
import WhatsAppSimulator from "@/components/WhatsAppSimulator";
import InstagramSimulator from "@/components/InstagramSimulator";
import IMessageSimulator from "@/components/IMessageSimulator";
import { useChatPlayback, parseScript } from "@/hooks/useChatPlayback";
import { useRecorder } from "@/hooks/useRecorder";

const Index = () => {
  const [platform, setPlatform] = useState<"whatsapp" | "instagram" | "imessage">("whatsapp");
  const [contactName, setContactName] = useState("João");
  const [images, setImages] = useState<Record<string, string>>({});
  const playback = useChatPlayback();
  const recorder = useRecorder();
  const simulatorRef = useRef<HTMLDivElement>(null);
  const [recordOnPlay, setRecordOnPlay] = useState(false);

  const handlePlay = useCallback(
    (script: string, speed: number, shouldRecord: boolean) => {
      const parsed = parseScript(script, images);
      if (parsed.contact !== "Contato") {
        setContactName(parsed.contact);
      }
      if (shouldRecord) {
        setRecordOnPlay(true);
      }
      playback.play(parsed.messages, speed);
    },
    [playback, images]
  );

  // Start recording after playback begins (so the first frame is ready)
  useEffect(() => {
    if (recordOnPlay && playback.isPlaying && simulatorRef.current && !recorder.isRecording) {
      recorder.startRecording(simulatorRef.current);
      setRecordOnPlay(false);
    }
  }, [recordOnPlay, playback.isPlaying, recorder]);

  // Auto-stop recording when playback ends
  useEffect(() => {
    if (recorder.isRecording && !playback.isPlaying) {
      // Small delay to capture the final state
      setTimeout(() => recorder.stopRecording(), 500);
    }
  }, [playback.isPlaying, recorder]);

  const handleReset = useCallback(() => {
    playback.reset();
    if (recorder.isRecording) recorder.stopRecording();
  }, [playback, recorder]);

  const SimulatorComponent = platform === "whatsapp" 
    ? WhatsAppSimulator 
    : platform === "imessage" 
      ? IMessageSimulator 
      : InstagramSimulator;

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row items-center justify-center gap-8 p-6">
      <ScriptEditor
        onPlay={handlePlay}
        onReset={handleReset}
        isPlaying={playback.isPlaying}
        isRecording={recorder.isRecording}
        isProcessing={recorder.isProcessing}
        platform={platform}
        onPlatformChange={setPlatform}
        contactName={contactName}
        onContactNameChange={setContactName}
        images={images}
        onImagesChange={setImages}
      />

      <div className="shrink-0" ref={simulatorRef}>
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
