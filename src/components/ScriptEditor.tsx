import { useState } from "react";
import { Play, RotateCcw, Zap } from "lucide-react";

interface Props {
  onPlay: (script: string, speed: number) => void;
  onReset: () => void;
  isPlaying: boolean;
  platform: "whatsapp" | "instagram" | "imessage";
  onPlatformChange: (p: "whatsapp" | "instagram" | "imessage") => void;
  contactName: string;
  onContactNameChange: (name: string) => void;
}

const EXAMPLE_SCRIPT = `Nome: João
eu: E aí mano, tudo bem?
ele: Salve! Tudo certo e vc?
eu: De boa, escuta só
eu: Tu viu aquele vídeo que te mandei?
ele: Qual vídeo?
eu: O do cara caindo da bike kkkkk
ele: KKKKKKK sim mano, muito bom
eu: Rachei demais
ele: Manda mais desses`;

export default function ScriptEditor({
  onPlay,
  onReset,
  isPlaying,
  platform,
  onPlatformChange,
  contactName,
  onContactNameChange,
}: Props) {
  const [script, setScript] = useState(EXAMPLE_SCRIPT);
  const [speed, setSpeed] = useState(1);

  return (
    <div className="w-full max-w-md space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-foreground mb-1">FakeChat</h1>
        <p className="text-sm text-muted-foreground">
          Simule conversas realistas para seus vídeos
        </p>
      </div>

      {/* Platform toggle */}
      <div className="flex gap-1 bg-muted rounded-lg p-1">
        <button
          onClick={() => onPlatformChange("whatsapp")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            platform === "whatsapp"
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          WhatsApp
        </button>
        <button
          onClick={() => onPlatformChange("instagram")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            platform === "instagram"
              ? "bg-accent text-accent-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Instagram
        </button>
        <button
          onClick={() => onPlatformChange("imessage")}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
            platform === "imessage"
              ? "bg-[#0a84ff] text-white shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          iMessage
        </button>
      </div>

      {/* Contact name */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Nome do contato
        </label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => onContactNameChange(e.target.value)}
          className="w-full bg-muted border-none rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder="Nome do contato"
        />
      </div>

      {/* Script textarea */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Script da conversa
        </label>
        <textarea
          value={script}
          onChange={(e) => setScript(e.target.value)}
          rows={10}
          className="w-full bg-muted border-none rounded-lg px-3 py-2.5 text-sm text-foreground font-mono leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
          placeholder={`eu: Mensagem do remetente\nele: Mensagem do contato`}
        />
        <p className="text-[11px] text-muted-foreground mt-1">
          Use <code className="bg-muted-foreground/20 px-1 rounded">eu:</code> e{" "}
          <code className="bg-muted-foreground/20 px-1 rounded">ele:</code> ou{" "}
          <code className="bg-muted-foreground/20 px-1 rounded">ela:</code> para cada mensagem
        </p>
      </div>

      {/* Speed control */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Velocidade: {speed}x
        </label>
        <input
          type="range"
          min={0.5}
          max={3}
          step={0.5}
          value={speed}
          onChange={(e) => setSpeed(parseFloat(e.target.value))}
          className="w-full accent-primary h-1"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>0.5x</span>
          <span>3x</span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onPlay(script, speed)}
          disabled={isPlaying || !script.trim()}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Play className="w-4 h-4" />
          {isPlaying ? "Reproduzindo..." : "Reproduzir"}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 bg-muted text-muted-foreground px-4 py-2.5 rounded-lg text-sm hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          Limpar
        </button>
      </div>
    </div>
  );
}
