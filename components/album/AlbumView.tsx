"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import type { Album, Sticker } from "@/types/app";
import { createClient } from "@/lib/supabase/client";
import { upsertSticker, removeSticker } from "@/lib/db/collection-stickers";
import { normalizeStickerCode } from "@/lib/utils/sticker";

import QuickAddBar from "./QuickAddBar";
import AlbumFilters, { type FilterState } from "./AlbumFilters";
import StickerSection from "./StickerSection";

interface AlbumViewProps {
  album: Album;
  collectionId: string;
  groupedStickers: Record<string, Sticker[]>;
  initialOwned: { sticker_id: string; quantity: number }[];
}

export default function AlbumView({
  album,
  collectionId,
  groupedStickers,
  initialOwned,
}: AlbumViewProps) {
  const [ownedMap, setOwnedMap] = useState<Map<string, number>>(
    () => new Map(initialOwned.map((s) => [s.sticker_id, s.quantity])),
  );

  const codeMap = useMemo<Map<string, Sticker>>(() => {
    const map = new Map<string, Sticker>();
    for (const stickers of Object.values(groupedStickers)) {
      for (const s of stickers) {
        map.set(normalizeStickerCode(s.code), s);
      }
    }
    return map;
  }, [groupedStickers]);

  const [filter, setFilter] = useState<FilterState>("all");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const sections = useMemo(() => {
    const keys = Object.keys(groupedStickers);
    return [
      ...keys.filter((k) => k === "FWC"),
      ...keys.filter((k) => k !== "FWC" && k !== "CC").sort(),
      ...keys.filter((k) => k === "CC"),
    ];
  }, [groupedStickers]);

  async function syncUpsert(stickerId: string, quantity: number) {
    const supabase = createClient();
    await upsertSticker(supabase, collectionId, stickerId, quantity);
  }

  async function syncRemove(stickerId: string) {
    const supabase = createClient();
    await removeSticker(supabase, collectionId, stickerId);
  }

  const handleQuickAdd = useCallback(
    (code: string): "ok" | "not_found" | "already_max" => {
      const sticker = codeMap.get(code);
      if (!sticker) return "not_found";

      const current = ownedMap.get(sticker.id) ?? 0;
      const next = current + 1;

      setOwnedMap((prev) => new Map(prev).set(sticker.id, next));
      setFlashId(sticker.id);
      setTimeout(() => setFlashId(null), 600);
      startTransition(() => { syncUpsert(sticker.id, next); });

      return "ok";
    },
    [codeMap, ownedMap, collectionId],
  );

  const handleTileClick = useCallback(
    (sticker: Sticker) => {
      const current = ownedMap.get(sticker.id) ?? 0;

      if (current === 0) {
        setOwnedMap((prev) => new Map(prev).set(sticker.id, 1));
        startTransition(() => { syncUpsert(sticker.id, 1); });
      } else if (current === 1) {
        setOwnedMap((prev) => new Map(prev).set(sticker.id, 2));
        startTransition(() => { syncUpsert(sticker.id, 2); });
      } else {
        setOwnedMap((prev) => {
          const next = new Map(prev);
          next.delete(sticker.id);
          return next;
        });
        startTransition(() => { syncRemove(sticker.id); });
      }
    },
    [ownedMap, collectionId],
  );

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

  const percentage = allStickers.length > 0
    ? Math.round((counts.owned / allStickers.length) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 40% at 50% -5%, rgba(29,158,117,0.05) 0%, transparent 60%)",
        }}
      />

      {/* ── Cabecera no-sticky — respira bajo el AppHeader ──────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Mi álbum</h1>
        <p className="text-sm text-muted mt-0.5">{album.name}</p>
      </div>

      {/* ── Sticky — pega justo bajo el AppHeader ────────────────────────── */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 pt-2 pb-2">
          <QuickAddBar onAdd={handleQuickAdd} />
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <AlbumFilters active={filter} onChange={setFilter} counts={counts} />
        </div>
      </div>

      {/* ── Contenido ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-28">

        {/* Tarjeta de stats — no sticky, aparece al tope del scroll */}
        <div className="mt-5 mb-8 rounded-2xl bg-surface border border-border p-5">
          {/* Porcentaje grande + nombre del álbum */}
          <div className="flex items-end justify-between mb-3">
            <div>
              <p className="text-xs text-muted mb-0.5">{album.name}</p>
              <p className="text-4xl font-black text-brand leading-none">
                {percentage}
                <span className="text-2xl">%</span>
              </p>
              <p className="text-xs text-muted mt-1">completado</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {counts.owned}
              </p>
              <p className="text-xs text-muted">de {allStickers.length}</p>
            </div>
          </div>

          {/* Barra de progreso */}
          <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          {/* Stats secundarios */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 rounded-xl bg-surface-subtle">
              <p className="text-base font-bold text-brand tabular-nums">
                {counts.owned}
              </p>
              <p className="text-[10px] text-muted mt-0.5">tengo</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-surface-subtle">
              <p className="text-base font-bold text-foreground tabular-nums">
                {counts.missing}
              </p>
              <p className="text-[10px] text-muted mt-0.5">me faltan</p>
            </div>
            <div className="text-center p-2 rounded-xl bg-surface-subtle">
              <p className="text-base font-bold text-amber-400 tabular-nums">
                {counts.repeated}
              </p>
              <p className="text-[10px] text-muted mt-0.5">repetidas</p>
            </div>
          </div>
        </div>

        {/* Secciones de barajitas */}
        <div className="flex flex-col gap-8">
          {sections.map((section) => {
            const stickers = visibleStickers(groupedStickers[section] ?? []);
            if (stickers.length === 0) return null;
            return (
              <StickerSection
                key={section}
                section={section}
                stickers={stickers}
                ownedMap={ownedMap}
                flashId={flashId}
                onTileClick={handleTileClick}
              />
            );
          })}

          {sections.every(
            (s) => visibleStickers(groupedStickers[s] ?? []).length === 0,
          ) && (
            <div className="text-center py-20 text-muted">
              <p className="text-4xl mb-3">🎴</p>
              <p className="text-sm">No hay barajitas en este filtro</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
