"use client";

import { useState, useMemo } from "react";
import type { Album, Sticker } from "@/types/app";
import StickerSection from "@/components/album/StickerSection";
import AlbumFilters, { type FilterState } from "@/components/album/AlbumFilters";

interface ReadOnlyAlbumViewProps {
  album: Album;
  groupedStickers: Record<string, Sticker[]>;
  ownedStickers: { sticker_id: string; quantity: number }[];
}

export default function ReadOnlyAlbumView({
  album,
  groupedStickers,
  ownedStickers,
}: ReadOnlyAlbumViewProps) {
  const ownedMap = useMemo(
    () => new Map(ownedStickers.map((s) => [s.sticker_id, s.quantity])),
    [ownedStickers],
  );

  const [filter, setFilter] = useState<FilterState>("all");

  // Secciones ordenadas: FWC primero, CC al final, el resto alfabético
  const sections = useMemo(() => {
    const keys = Object.keys(groupedStickers);
    return [
      ...keys.filter((k) => k === "FWC"),
      ...keys.filter((k) => k !== "FWC" && k !== "CC").sort(),
      ...keys.filter((k) => k === "CC"),
    ];
  }, [groupedStickers]);

  const allStickers = useMemo(
    () => Object.values(groupedStickers).flat(),
    [groupedStickers],
  );

  const counts = useMemo<Record<FilterState, number>>(() => {
    const owned = [...ownedMap.values()].filter((q) => q >= 1).length;
    const repeated = [...ownedMap.values()].filter((q) => q >= 2).length;
    return {
      all: allStickers.length,
      owned,
      missing: allStickers.length - owned,
      repeated,
    };
  }, [ownedMap, allStickers]);

  function visibleStickers(stickers: Sticker[]): Sticker[] {
    if (filter === "all") return stickers;
    return stickers.filter((s) => {
      const q = ownedMap.get(s.id) ?? 0;
      if (filter === "owned") return q >= 1;
      if (filter === "missing") return q === 0;
      if (filter === "repeated") return q >= 2;
      return true;
    });
  }

  // No-op: la vista es de solo lectura
  const noOp = () => {};

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Título de sección */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">{album.name}</h2>
        <p className="text-xs text-muted mt-0.5">Colección en modo lectura</p>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <AlbumFilters active={filter} onChange={setFilter} counts={counts} />
      </div>

      {/* Secciones — sin interacción */}
      <div className="flex flex-col gap-8 pointer-events-none select-none">
        {sections.map((section) => {
          const stickers = visibleStickers(groupedStickers[section] ?? []);
          if (stickers.length === 0) return null;
          return (
            <StickerSection
              key={section}
              section={section}
              stickers={stickers}
              ownedMap={ownedMap}
              flashId={null}
              onTileClick={noOp}
            />
          );
        })}
      </div>

      {/* Estado vacío */}
      {sections.every(
        (s) => visibleStickers(groupedStickers[s] ?? []).length === 0,
      ) && (
        <div className="text-center py-20 text-muted">
          <p className="text-4xl mb-3">🎴</p>
          <p className="text-sm">No hay barajitas en este filtro</p>
        </div>
      )}
    </div>
  );
}
