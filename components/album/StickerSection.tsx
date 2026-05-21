"use client";

import type { Sticker } from "@/types/app";
import { SECTION_META } from "@/lib/constants/section-names";
import StickerTile from "./StickerTile";

// Prefijo de sección legible para los grupos FWC virtuales
const FWC_GROUP_LABELS: Record<string, string> = {
  FWC_ESP: "FWC",
  FWC_BAL: "FWC",
  FWC_HIS: "FWC",
};

type StickerSectionProps =
  | { skeleton: true; skeletonTiles?: number }
  | {
      skeleton?: false;
      section: string;
      stickers: Sticker[];
      ownedMap: Map<string, number>;
      flashId: string | null;
      isSpecialFn: (sticker: Sticker) => boolean;
      collapsed: boolean;
      onToggle: () => void;
      onTileAdd: (sticker: Sticker) => void;
      onTileRemove: (sticker: Sticker) => void;
    };

export default function StickerSection(props: StickerSectionProps) {
  const skeletonTiles = props.skeleton ? (props.skeletonTiles ?? 14) : 14;
  if (props.skeleton) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-4 w-10 rounded bg-surface-subtle animate-pulse" />
            <div className="h-3 w-1 rounded bg-surface-subtle animate-pulse" />
            <div className="h-3 w-20 rounded bg-surface-subtle animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-8 rounded bg-surface-subtle animate-pulse" />
            <div className="h-3.5 w-3.5 rounded bg-surface-subtle animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
          {Array.from({ length: skeletonTiles }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg bg-surface-subtle animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const {
    section,
    stickers,
    ownedMap,
    flashId,
    isSpecialFn,
    collapsed,
    onToggle,
    onTileAdd,
    onTileRemove,
  } = props;

  const meta = SECTION_META[section];
  const flag = meta?.flag ?? "🏳️";
  const name = meta?.name ?? section;

  // Para grupos FWC virtuales mostramos "FWC" como código corto
  const shortCode = FWC_GROUP_LABELS[section] ?? section;
  const owned = stickers.filter((s) => (ownedMap.get(s.id) ?? 0) >= 1).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header de sección — clickeable para colapsar */}
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full text-left group"
      >
        <div className="flex items-center gap-2 min-w-0">
          {/* Código — protagonista */}
          <span className="text-sm font-black text-foreground tracking-widest uppercase shrink-0">
            {shortCode}
          </span>
          {/* Separador + nombre completo + bandera */}
          <span className="text-muted text-xs shrink-0">·</span>
          <span className="text-xs text-muted truncate">{name}</span>
          <span className="text-sm leading-none shrink-0">{flag}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted tabular-nums">
            {owned}/{stickers.length}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`text-muted transition-transform duration-200 ${
              collapsed ? "-rotate-90" : "rotate-0"
            }`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </button>

      {/* Grid de tiles */}
      {!collapsed && (
        <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-8 md:grid-cols-10">
          {stickers.map((sticker) => (
            <StickerTile
              key={sticker.id}
              sticker={sticker}
              quantity={ownedMap.get(sticker.id) ?? 0}
              flash={flashId === sticker.id}
              isSpecial={isSpecialFn(sticker)}
              onAdd={() => onTileAdd(sticker)}
              onRemove={() => onTileRemove(sticker)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
