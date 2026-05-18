import type { Sticker } from "@/types/app";
import StickerTile from "./StickerTile";

// Nombres legibles para las secciones especiales
const SECTION_LABELS: Record<string, string> = {
  FWC: "FIFA World Cup",
  CC: "Coca-Cola",
};

interface StickerSectionProps {
  section: string;
  stickers: Sticker[];
  ownedMap: Map<string, number>; // sticker_id → quantity
  flashId: string | null;        // id del sticker que acaba de agregarse
  onTileClick: (sticker: Sticker) => void;
}

export default function StickerSection({
  section,
  stickers,
  ownedMap,
  flashId,
  onTileClick,
}: StickerSectionProps) {
  const label = SECTION_LABELS[section] ?? section;
  const owned = stickers.filter((s) => (ownedMap.get(s.id) ?? 0) >= 1).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header de sección */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            {label}
          </span>
          {section !== label && (
            <span className="text-[10px] text-muted bg-surface border border-border px-1.5 py-0.5 rounded-full">
              {section}
            </span>
          )}
        </div>
        <span className="text-xs text-muted tabular-nums">
          {owned}/{stickers.length}
        </span>
      </div>

      {/* Grid de tiles */}
      <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
        {stickers.map((sticker) => (
          <StickerTile
            key={sticker.id}
            sticker={sticker}
            quantity={ownedMap.get(sticker.id) ?? 0}
            flash={flashId === sticker.id}
            onClick={() => onTileClick(sticker)}
          />
        ))}
      </div>
    </div>
  );
}
