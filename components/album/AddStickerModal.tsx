"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { normalizeStickerCode, isValidStickerCode } from "@/lib/utils/sticker";

interface AddStickerModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (code: string) => "ok" | "not_found" | "already_max";
}

export default function AddStickerModal({
  open,
  onClose,
  onAdd,
}: AddStickerModalProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "not_found" | "invalid">(
    "idle",
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Resetear estado y hacer focus cuando el modal abre.
  // Los setState van dentro del setTimeout para no ejecutarse síncronamente
  // en el cuerpo del efecto (React 19 lo marca como error).
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => {
      setValue("");
      setStatus("idle");
      inputRef.current?.focus();
    }, 80);
    return () => clearTimeout(t);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

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
        ? {
            text: "✕ Código no encontrado. Ej: ARG5, FWC1",
            color: "text-red-400",
          }
        : status === "invalid"
          ? {
              text: "✕ Formato inválido. Ej: MEX12, FWC3",
              color: "text-red-400",
            }
          : { text: "Escribe el código de la barajita", color: "text-muted" };

  if (!open) return null;

  return (
    <>
      {/* ── Overlay — z-[55] para cubrir también el BottomNav (z-50) ─────── */}
      <div
        className="fixed inset-0 z-[55] bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* ── Panel: bottom-sheet en mobile, modal centrado en sm+ ─────────── */}
      {/* z-[60] asegura que el sheet quede encima del overlay y del nav      */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Agregar barajitas"
        className={`
          fixed z-[60]
          /* mobile: bottom sheet */
          bottom-0 left-0 right-0 rounded-t-2xl
          /* sm+: modal centrado */
          sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2
          sm:right-auto sm:w-full sm:max-w-md sm:rounded-2xl
          bg-surface border border-border shadow-2xl
          animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95
          duration-200
        `}
      >
        {/* Handle visual (solo mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Cabecera */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 sm:pt-5">
          <h2 className="text-base font-bold text-foreground">
            Agregar barajitas
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full flex items-center justify-center text-muted
              hover:text-foreground hover:bg-surface-subtle transition-colors"
            aria-label="Cerrar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido */}
        <div
          className="px-5 pb-6 sm:pb-5 flex flex-col gap-4"
          style={{
            paddingBottom: "max(1.5rem, env(safe-area-inset-bottom, 0px))",
          }}
        >
          {/* ── Entrada manual ─────────────────────────────────────────────── */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(
                    e.target.value.toUpperCase().replace(/[^A-Z0-9\-]/g, ""),
                  );
                  if (status !== "idle") setStatus("idle");
                }}
                placeholder="ARG5, MEX12, FWC1…"
                maxLength={8}
                autoCapitalize="characters"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                className={`
                  flex-1 px-4 py-3 rounded-xl bg-surface-subtle border text-sm
                  text-foreground placeholder:text-muted font-mono tracking-wide
                  outline-none transition-all duration-150 focus:ring-2
                  ${borderColor}
                `}
              />
              <button
                type="submit"
                disabled={!value.trim()}
                className="px-4 py-3 rounded-xl bg-brand text-white text-sm font-semibold
                  hover:bg-brand-dark transition-colors disabled:opacity-40
                  disabled:cursor-not-allowed flex-shrink-0"
              >
                Agregar
              </button>
            </div>
            <p
              className={`text-xs ${hint.color} transition-colors min-h-[1rem]`}
            >
              {hint.text}
            </p>
          </form>

          {/* ── Divisor ────────────────────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted">o</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          {/* ── Escanear (placeholder) ─────────────────────────────────────── */}
          <div className="relative">
            <button
              type="button"
              disabled
              className="w-full flex items-center gap-3 px-4 py-3.5 rounded-xl
                border border-border bg-surface-subtle
                opacity-50 cursor-not-allowed text-left"
            >
              <span className="text-xl leading-none">📷</span>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Escanear código
                </p>
                <p className="text-xs text-muted">
                  Apunta la cámara al código de la barajita
                </p>
              </div>
            </button>
            {/* Badge "Próximamente" */}
            <span
              className="absolute -top-2 right-3 text-[10px] font-bold
              bg-amber-500/20 text-amber-400 border border-amber-500/30
              px-2 py-0.5 rounded-full"
            >
              Próximamente
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
