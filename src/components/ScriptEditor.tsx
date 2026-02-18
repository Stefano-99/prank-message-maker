import { useState, useRef } from "react";
import { Play, RotateCcw, Zap, ImagePlus, X, Video, Maximize, UserCircle } from "lucide-react";

interface Props {
  onPlay: (script: string, speed: number) => void;
  onReset: () => void;
  onExport: (script: string, speed: number) => void;
  onStartPreview: (script: string, speed: number) => void;
  isPlaying: boolean;
  isExporting: boolean;
  exportProgress: { current: number; total: number } | null;
  platform: "whatsapp" | "instagram" | "imessage";
  onPlatformChange: (p: "whatsapp" | "instagram" | "imessage") => void;
  contactName: string;
  onContactNameChange: (name: string) => void;
  contactAvatar: string | null;
  onContactAvatarChange: (avatar: string | null) => void;
  images: Record<string, string>;
  onImagesChange: (images: Record<string, string>) => void;
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
  onExport,
  onStartPreview,
  isPlaying,
  isExporting,
  exportProgress,
  platform,
  onPlatformChange,
  contactName,
  onContactNameChange,
  contactAvatar,
  onContactAvatarChange,
  images,
  onImagesChange,
}: Props) {
  const [script, setScript] = useState(EXAMPLE_SCRIPT);
  const [speed, setSpeed] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const imageCounter = useRef(Object.keys(images).length + 1);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newImages = { ...images };
    Array.from(files).forEach((file) => {
      const name = `foto${imageCounter.current++}`;
      const url = URL.createObjectURL(file);
      newImages[name] = url;
    });
    onImagesChange(newImages);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (name: string) => {
    const newImages = { ...images };
    URL.revokeObjectURL(newImages[name]);
    delete newImages[name];
    onImagesChange(newImages);
  };

  const busy = isPlaying || isExporting;

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

      {/* Contact name + avatar */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Nome do contato
        </label>
        <div className="flex gap-2 items-center">
          <input
            type="text"
            value={contactName}
            onChange={(e) => onContactNameChange(e.target.value)}
            className="flex-1 bg-muted border-none rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            placeholder="Nome do contato"
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                if (contactAvatar) URL.revokeObjectURL(contactAvatar);
                onContactAvatarChange(URL.createObjectURL(file));
              }
              if (avatarInputRef.current) avatarInputRef.current.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            className="relative w-[36px] h-[36px] rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all group"
            title="Foto de perfil"
          >
            {contactAvatar ? (
              <>
                <img src={contactAvatar} alt="Avatar" className="w-full h-full object-cover" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    URL.revokeObjectURL(contactAvatar);
                    onContactAvatarChange(null);
                  }}
                  className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </>
            ) : (
              <UserCircle className="w-5 h-5 text-muted-foreground" />
            )}
          </button>
        </div>
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
          <code className="bg-muted-foreground/20 px-1 rounded">ela:</code> para cada mensagem.
          Para enviar uma imagem: <code className="bg-muted-foreground/20 px-1 rounded">eu: foto1</code>
        </p>
      </div>

      {/* Image uploads */}
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Imagens
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 bg-muted text-muted-foreground px-3 py-2 rounded-lg text-sm hover:text-foreground transition-colors mb-2"
        >
          <ImagePlus className="w-4 h-4" />
          Adicionar imagem
        </button>
        {Object.keys(images).length > 0 && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(images).map(([name, url]) => (
              <div key={name} className="relative group">
                <img src={url} alt={name} className="w-16 h-16 object-cover rounded-lg border border-border/40" />
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[9px] text-center py-0.5 rounded-b-lg">
                  {name}
                </span>
                <button
                  onClick={() => removeImage(name)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
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
          disabled={busy || !script.trim()}
          className="flex-1 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Play className="w-4 h-4" />
          {isPlaying ? "Reproduzindo..." : "Reproduzir"}
        </button>
        <button
          onClick={() => onExport(script, speed)}
          disabled={busy || !script.trim()}
          className="flex items-center justify-center gap-1.5 bg-destructive text-destructive-foreground px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
        >
          <Video className="w-4 h-4" />
          Exportar
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-1.5 bg-muted text-muted-foreground px-3 py-2.5 rounded-lg text-sm hover:text-foreground transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Preview button */}
      <button
        onClick={() => onStartPreview(script, speed)}
        disabled={busy || !script.trim()}
        className="w-full flex items-center justify-center gap-2 bg-muted text-foreground py-2.5 rounded-lg font-medium text-sm hover:bg-muted/80 transition-colors disabled:opacity-40 border border-border/50"
      >
        <Maximize className="w-4 h-4" />
        Start Preview
      </button>
    </div>
  );
}
