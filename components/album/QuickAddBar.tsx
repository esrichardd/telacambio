import { useState, useRef, type FormEvent } from "react";
import { normalizeStickerCode, isValidStickerCode } from "@/lib/utils/sticker";

interface QuickAddBarProps {
  onAdd: (code: string) => "ok" | "not_found" | "already_max";
}

export default function QuickAddBar({ onAdd }: QuickAddBarProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "not_found" | "invalid">("idle");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const normalized = normalizeStickerCode(value);

    if (!normalized || !isValidStickerCode(normalized)) {
      setStatus("invalid");
      return;
    }

    const result = onAdd(normalized);

    if (result === "ok") {
      setStatus("ok");
      setValue("");
      // Limpiar feedback luego de un momento
      setTimeout(() => setStatus("idle"), 1500);
    } else if (result === "not_found") {
      setStatus("not_found");
    }

    inputRef.current?.focus();
  }

  const borderColor =
    status === "ok"
      ? "border-brand focus:border-brand focus:ring-brand/15"
      : status === "not_found" || status === "invalid"
      ? "border-red-500/60 focus:border-red-500 focus:ring-red-500/15"
      : "border-border focus:border-brand focus:ring-brand/15";

  const hint =
    status === "ok"
      ? { text: "✓ Barajita agregada", color: "text-brand" }
      : status === "not_found"
      ? { text: "✕ Código no encontrado. Ej: ARG5, FWC1", color: "text-red-400" }
      : status === "invalid"
      ? { text: "✕ Formato inválido. Ej: MEX12, FWC3", color: "text-red-400" }
      : { text: "Escribe el código de la barajita. Ej: ARG5, MEX12", color: "text-muted" };

  return (
    <div className="flex flex-col gap-1.5">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, ""));
              if (status !== "idle") setStatus("idle");
            }}
            placeholder="ARG5, MEX12, FWC1…"
            maxLength={8}
            autoCapitalize="characters"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className={`
              w-full px-4 py-3 rounded-xl bg-surface-subtle border text-sm
              text-foreground placeholder:text-muted font-mono tracking-wide
              outline-none transition-all duration-150 focus:ring-2
              ${borderColor}
            `}
          />
        </div>
        <button
          type="submit"
          disabled={!value.trim()}
          className="px-4 py-3 rounded-xl bg-brand text-white text-sm font-semibold
            hover:bg-brand-dark transition-colors disabled:opacity-40
            disabled:cursor-not-allowed flex-shrink-0"
        >
          Agregar
        </button>
      </form>
      <p className={`text-xs ${hint.color} transition-colors`}>{hint.text}</p>
    </div>
  );
}
