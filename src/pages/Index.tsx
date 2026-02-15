import { useState, useCallback, useRef, useEffect } from "react";
import ScriptEditor from "@/components/ScriptEditor";
import WhatsAppSimulator from "@/components/WhatsAppSimulator";
import InstagramSimulator from "@/components/InstagramSimulator";
import IMessageSimulator from "@/components/IMessageSimulator";
import { useChatPlayback, parseScript } from "@/hooks/useChatPlayback";
import { useRecorder } from "@/hooks/useRecorder";
import { X } from "lucide-react";

const Index = () => {
  const [platform, setPlatform] = useState<"whatsapp" | "instagram" | "imessage">("whatsapp");
  const [contactName, setContactName] = useState("João");
  const [images, setImages] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState(false);
  const [pendingScript, setPendingScript] = useState("");
  const [pendingSpeed, setPendingSpeed] = useState(1);
  const playback = useChatPlayback();
  const recorder = useRecorder();
  const simulatorRef = useRef<HTMLDivElement>(null);
  const [recordOnPlay, setRecordOnPlay] = useState(false);
  const scriptRef = useRef("");
  const speedRef = useRef(1);

  const handlePlay = useCallback(
    (script: string, speed: number, shouldRecord: boolean) => {
      const parsed = parseScript(script, images);
      if (parsed.contact !== "Contato") {
        setContactName(parsed.contact);
      }
      if (shouldRecord) {
        setRecordOnPlay(true);
      }
      scriptRef.current = script;
      speedRef.current = speed;
      playback.play(parsed.messages, speed);
    },
    [playback, images]
  );

  const handleStartPreview = useCallback(
    (script: string, speed: number) => {
      const parsed = parseScript(script, images);
      if (parsed.contact !== "Contato") {
        setContactName(parsed.contact);
      }
      setPendingScript(script);
      setPendingSpeed(speed);
      playback.reset();
      setPreviewMode(true);
    },
    [playback, images]
  );

  // Auto-play when entering preview mode
  useEffect(() => {
    if (previewMode && pendingScript) {
      const parsed = parseScript(pendingScript, images);
      // Small delay to let the UI transition
      const timer = setTimeout(() => {
        playback.play(parsed.messages, pendingSpeed);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [previewMode]);

  // Exit preview when playback ends
  // (optional: keep preview showing the final state)

  const handleExitPreview = useCallback(() => {
    setPreviewMode(false);
    playback.reset();
    setPendingScript("");
  }, [playback]);

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

  if (previewMode) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <button
          onClick={handleExitPreview}
          className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
        <div ref={simulatorRef}>
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
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row items-center justify-center gap-8 p-6">
      <ScriptEditor
        onPlay={handlePlay}
        onReset={handleReset}
        onStartPreview={handleStartPreview}
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
