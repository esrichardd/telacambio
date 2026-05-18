"use client";

import { useRef, useCallback } from "react";
import type { Sticker } from "@/types/app";

type TileState = "missing" | "owned" | "repeated";

interface StickerTileProps {
  sticker: Sticker;
  quantity: number; // 0 = missing, 1 = owned, ≥2 = repeated
  flash: boolean; // breve destello verde cuando se agrega por código
  isSpecial?: boolean; // barajitas especiales: FWC completas + #1 de cada selección
  onAdd: () => void;
  onRemove: () => void;
}

function getTileState(quantity: number): TileState {
  if (quantity === 0) return "missing";
  if (quantity === 1) return "owned";
  return "repeated";
}

// Estilos para barajitas normales
const TILE_STYLES: Record<TileState, string> = {
  missing: "bg-surface-subtle border-border text-muted",
  owned: "bg-brand/15 border-brand/40 text-brand",
  repeated: "bg-amber-500/15 border-amber-500/40 text-amber-400",
};

// Estilos para barajitas especiales (doradas)
const SPECIAL_TILE_STYLES: Record<TileState, string> = {
  missing: "bg-yellow-500/5 border-yellow-600/30 text-yellow-600/60",
  owned: "bg-yellow-400/20 border-yellow-400/60 text-yellow-300",
  repeated: "bg-amber-500/15 border-amber-500/40 text-amber-400",
};

const LONG_PRESS_DURATION = 400; // ms

export default function StickerTile({
  sticker,
  quantity,
  flash,
  isSpecial = false,
  onAdd,
  onRemove,
}: StickerTileProps) {
  const state = getTileState(quantity);
  const styles = isSpecial ? SPECIAL_TILE_STYLES : TILE_STYLES;

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPressRef = useRef(false);

  const startPress = useCallback(() => {
    didLongPressRef.current = false;
    timerRef.current = setTimeout(() => {
      didLongPressRef.current = true;
      if (quantity > 0) onRemove();
    }, LONG_PRESS_DURATION);
  }, [quantity, onRemove]);

  const cancelPress = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleClick = useCallback(() => {
    if (didLongPressRef.current) {
      didLongPressRef.current = false;
      return;
    }
    onAdd();
  }, [onAdd]);

  return (
    <button
      type="button"
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress}
      onClick={handleClick}
      title={sticker.name ?? sticker.code}
      className={`
        relative flex flex-col items-center justify-center
        w-full aspect-square rounded-lg border text-xs font-bold
        transition-all duration-150 active:scale-95 select-none
        touch-none
        ${styles[state]}
        ${flash ? "ring-2 ring-brand ring-offset-1 ring-offset-background scale-110" : ""}
      `}
    >
      {/* Indicador de especial — estrella en esquina superior izquierda */}
      {isSpecial && (
        <span
          className={`
            absolute top-0.5 left-0.5 text-[8px] leading-none
            ${state === "missing" ? "text-yellow-600/50" : "text-yellow-300"}
          `}
        >
          ✦
        </span>
      )}

      {/* Número de la barajita — name tiene prioridad (ej: "00") */}
      <span className="leading-none">
        {sticker.name ?? sticker.number ?? sticker.code}
      </span>

      {/* Badge de cantidad cuando hay repetidas */}
      {quantity >= 2 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center leading-none">
          {quantity}
        </span>
      )}
    </button>
  );
}
