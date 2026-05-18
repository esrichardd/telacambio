import type { Sticker } from "@/types/app";

type TileState = "missing" | "owned" | "repeated";

interface StickerTileProps {
  sticker: Sticker;
  quantity: number; // 0 = missing, 1 = owned, ≥2 = repeated
  flash: boolean;   // breve destello verde cuando se agrega por código
  onClick: () => void;
}

function getTileState(quantity: number): TileState {
  if (quantity === 0) return "missing";
  if (quantity === 1) return "owned";
  return "repeated";
}

const TILE_STYLES: Record<TileState, string> = {
  missing:
    "bg-surface-subtle border-border text-muted",
  owned:
    "bg-brand/15 border-brand/40 text-brand",
  repeated:
    "bg-amber-500/15 border-amber-500/40 text-amber-400",
};

export default function StickerTile({
  sticker,
  quantity,
  flash,
  onClick,
}: StickerTileProps) {
  const state = getTileState(quantity);

  return (
    <button
      type="button"
      onClick={onClick}
      title={sticker.name ?? sticker.code}
      className={`
        relative flex flex-col items-center justify-center
        w-full aspect-square rounded-lg border text-xs font-bold
        transition-all duration-150 active:scale-95 select-none
        ${TILE_STYLES[state]}
        ${flash ? "ring-2 ring-brand ring-offset-1 ring-offset-background scale-110" : ""}
      `}
    >
      {/* Número de la barajita (sin el prefijo de sección) */}
      <span className="leading-none">{sticker.number ?? sticker.code}</span>

      {/* Badge de cantidad cuando hay repetidas */}
      {quantity >= 2 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center leading-none">
          {quantity}
        </span>
      )}
    </button>
  );
}
