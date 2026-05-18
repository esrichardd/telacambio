"use client";

import { useState, useCallback, useMemo, useTransition } from "react";
import type { Album, Sticker } from "@/types/app";
import { createClient } from "@/lib/supabase/client";
import { upsertSticker, removeSticker } from "@/lib/db/collection-stickers";
import { normalizeStickerCode } from "@/lib/utils/sticker";

import AlbumFilters, { type FilterState } from "./AlbumFilters";
import StickerSection from "./StickerSection";
import AddStickerModal from "./AddStickerModal";

// ---------------------------------------------------------------------------
// Rangos de las sub-secciones FWC
// ---------------------------------------------------------------------------
const FWC_GROUPS = {
  FWC_ESP: { label: "Especiales", min: 0, max: 4 },
  FWC_BAL: { label: "Balón y países", min: 5, max: 8 },
  FWC_HIS: { label: "Historia", min: 9, max: 19 },
} as const;

type FwcGroupKey = keyof typeof FWC_GROUPS;

// ---------------------------------------------------------------------------
// Detecta si una barajita es "especial":
//   - Todas las FWC (section === "FWC")
//   - La #1 de cada selección (number === 1, excluyendo FWC y CC)
// ---------------------------------------------------------------------------
function isSpecialSticker(sticker: Sticker): boolean {
  if (sticker.section === "FWC") return true;
  if (sticker.section === "CC") return false;
  return sticker.number === 1;
}

interface AlbumViewProps {
  album: Album;
  groupedStickers: Record<string, Sticker[]>;
  initialOwned: { sticker_id: string; quantity: number }[];
  /** En modo escritura, el ID de la colección del usuario. No requerido en readOnly. */
  collectionId?: string;
  /** Cuando es true: sin FAB, sin modal, sin hints de interacción, grid no-interactivo. */
  readOnly?: boolean;
}

export default function AlbumView({
  album,
  collectionId,
  groupedStickers,
  initialOwned,
  readOnly = false,
}: AlbumViewProps) {
  const [ownedMap, setOwnedMap] = useState<Map<string, number>>(
    () => new Map(initialOwned.map((s) => [s.sticker_id, s.quantity])),
  );

  // ── Transformar groupedStickers: partir FWC en 3 grupos virtuales ─────────
  const expandedGroups = useMemo<Record<string, Sticker[]>>(() => {
    const result: Record<string, Sticker[]> = {};

    for (const [section, stickers] of Object.entries(groupedStickers)) {
      if (section !== "FWC") {
        result[section] = stickers;
        continue;
      }

      // Ordenar FWC por número para garantizar el orden correcto
      const sorted = [...stickers].sort(
        (a, b) => (a.number ?? 0) - (b.number ?? 0),
      );

      for (const [key, { min, max }] of Object.entries(FWC_GROUPS) as [
        FwcGroupKey,
        { min: number; max: number },
      ][]) {
        const group = sorted.filter((s) => {
          const n = s.number ?? 0;
          return n >= min && n <= max;
        });
        if (group.length > 0) result[key] = group;
      }
    }

    return result;
  }, [groupedStickers]);

  const codeMap = useMemo<Map<string, Sticker>>(() => {
    const map = new Map<string, Sticker>();
    for (const stickers of Object.values(expandedGroups)) {
      for (const s of stickers) {
        map.set(normalizeStickerCode(s.code), s);
      }
    }
    return map;
  }, [expandedGroups]);

  const [filter, setFilter] = useState<FilterState>("all");
  const [flashId, setFlashId] = useState<string | null>(null);
  const [sectionSearch, setSectionSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [, startTransition] = useTransition();

  // ── Orden oficial del álbum Panini Mundial 2026 ───────────────────────────
  const ALBUM_ORDER = [
    "MEX",
    "RSA",
    "KOR",
    "CZE",
    "CAN",
    "BIH",
    "QAT",
    "SUI",
    "BRA",
    "MAR",
    "HAI",
    "SCO",
    "USA",
    "PAR",
    "AUS",
    "TUR",
    "GER",
    "CUW",
    "CIV",
    "ECU",
    "NED",
    "JPN",
    "SWE",
    "TUN",
    "BEL",
    "EGY",
    "IRN",
    "NZL",
    "ESP",
    "CPV",
    "KSA",
    "URU",
    "FRA",
    "SEN",
    "IRQ",
    "NOR",
    "ARG",
    "ALG",
    "AUT",
    "JOR",
    "POR",
    "COD",
    "UZB",
    "COL",
    "ENG",
    "CRO",
    "GHA",
    "PAN",
  ];

  // ── Secciones en orden del álbum: FWC primero → selecciones → CC al final ─
  const allSections = useMemo(() => {
    const keys = new Set(Object.keys(expandedGroups));
    const fwcKeys = (["FWC_ESP", "FWC_BAL", "FWC_HIS"] as const).filter((k) =>
      keys.has(k),
    );
    const middle = ALBUM_ORDER.filter((k) => keys.has(k));
    // Cualquier clave no prevista (ej: selección nueva) va al final antes de CC
    const known = new Set([...fwcKeys, ...middle, "CC"]);
    const extra = [...keys].filter((k) => !known.has(k));
    const cc = keys.has("CC") ? ["CC"] : [];
    return [...fwcKeys, ...middle, ...extra, ...cc];
  }, [expandedGroups]);

  // ── Sync helpers (solo usados en modo escritura) ──────────────────────────
  async function syncUpsert(stickerId: string, quantity: number) {
    if (!collectionId) return;
    const supabase = createClient();
    await upsertSticker(supabase, collectionId, stickerId, quantity);
  }

  async function syncRemove(stickerId: string) {
    if (!collectionId) return;
    const supabase = createClient();
    await removeSticker(supabase, collectionId, stickerId);
  }

  // ── Handlers de tiles (no-ops en readOnly) ────────────────────────────────
  const handleTileAdd = useCallback(
    (sticker: Sticker) => {
      if (readOnly) return;
      const current = ownedMap.get(sticker.id) ?? 0;
      const next = current + 1;
      setOwnedMap((prev) => new Map(prev).set(sticker.id, next));
      startTransition(() => {
        syncUpsert(sticker.id, next);
      });
    },
    [ownedMap, collectionId, readOnly],
  );

  const handleTileRemove = useCallback(
    (sticker: Sticker) => {
      if (readOnly) return;
      const current = ownedMap.get(sticker.id) ?? 0;
      if (current <= 0) return;

      if (current === 1) {
        setOwnedMap((prev) => {
          const next = new Map(prev);
          next.delete(sticker.id);
          return next;
        });
        startTransition(() => {
          syncRemove(sticker.id);
        });
      } else {
        const next = current - 1;
        setOwnedMap((prev) => new Map(prev).set(sticker.id, next));
        startTransition(() => {
          syncUpsert(sticker.id, next);
        });
      }
    },
    [ownedMap, collectionId, readOnly],
  );

  // ── Handler del modal (agregar por código) ────────────────────────────────
  const handleQuickAdd = useCallback(
    (code: string): "ok" | "not_found" | "already_max" => {
      const sticker = codeMap.get(code);
      if (!sticker) return "not_found";

      const current = ownedMap.get(sticker.id) ?? 0;
      const next = current + 1;

      setOwnedMap((prev) => new Map(prev).set(sticker.id, next));
      setFlashId(sticker.id);
      setTimeout(() => setFlashId(null), 600);
      startTransition(() => {
        syncUpsert(sticker.id, next);
      });

      return "ok";
    },
    [codeMap, ownedMap, collectionId],
  );

  // ── Counts ────────────────────────────────────────────────────────────────
  const allStickers = useMemo(
    () => Object.values(expandedGroups).flat(),
    [expandedGroups],
  );

  const specialStickers = useMemo(
    () => allStickers.filter(isSpecialSticker),
    [allStickers],
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

  const specialsOwned = useMemo(
    () => specialStickers.filter((s) => (ownedMap.get(s.id) ?? 0) >= 1).length,
    [specialStickers, ownedMap],
  );

  // ── Filtro de barajitas ───────────────────────────────────────────────────
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

  // ── Nombres de secciones para búsqueda ───────────────────────────────────
  const SECTION_NAMES: Record<string, string> = {
    FWC_ESP: "fwc especiales fifa world cup",
    FWC_BAL: "fwc balon paises fifa",
    FWC_HIS: "fwc historia fifa world cup",
    CC: "coca-cola",
    MEX: "méxico mexico",
    USA: "estados unidos",
    CAN: "canadá canada",
    CUW: "curazao",
    HAI: "haití haiti",
    PAN: "panamá panama",
    ARG: "argentina",
    BRA: "brasil",
    COL: "colombia",
    ECU: "ecuador",
    PAR: "paraguay",
    URU: "uruguay",
    AUT: "austria",
    BEL: "bélgica belgica",
    BIH: "bosnia herzegovina",
    CRO: "croacia",
    CZE: "república checa republica",
    ENG: "inglaterra",
    ESP: "españa espana",
    FRA: "francia",
    GER: "alemania",
    NED: "países bajos paises",
    NOR: "noruega",
    POR: "portugal",
    SCO: "escocia",
    SUI: "suiza",
    SWE: "suecia",
    TUR: "turquía turquia",
    ALG: "argelia",
    CIV: "costa de marfil",
    COD: "rd congo república democrática",
    CPV: "cabo verde",
    EGY: "egipto",
    GHA: "ghana",
    MAR: "marruecos",
    RSA: "sudáfrica sudafrica",
    SEN: "senegal",
    TUN: "túnez tunez",
    AUS: "australia",
    IRN: "irán iran",
    IRQ: "irak iraq",
    JOR: "jordania",
    JPN: "japón japon",
    KOR: "corea del sur",
    KSA: "arabia saudita",
    NZL: "nueva zelanda",
    QAT: "catar qatar",
    UZB: "uzbekistán uzbekistan",
  };

  const sections = useMemo(() => {
    if (!sectionSearch.trim()) return allSections;
    const q = sectionSearch.trim().toLowerCase();
    return allSections.filter((s) => {
      const searchable = `${s.toLowerCase()} ${SECTION_NAMES[s] ?? ""}`;
      return searchable.includes(q);
    });
  }, [allSections, sectionSearch]);

  const percentage =
    allStickers.length > 0
      ? Math.round((counts.owned / allStickers.length) * 100)
      : 0;

  const noResults = sections.every(
    (s) => visibleStickers(expandedGroups[s] ?? []).length === 0,
  );

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

      {/* ── Cabecera no-sticky ───────────────────────────────────────────── */}
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-4">
        {readOnly ? (
          <>
            <h2 className="text-xl font-bold text-foreground">Álbum</h2>
            <p className="text-sm text-muted mt-0.5">{album.name}</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-foreground">Mi álbum</h1>
            <p className="text-sm text-muted mt-0.5">{album.name}</p>
          </>
        )}
      </div>

      {/* ── Sticky — filtros + buscador + hint ───────────────────────────── */}
      <div className="sticky top-14 z-20 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-2xl mx-auto px-4 pt-3 pb-1">
          <AlbumFilters active={filter} onChange={setFilter} counts={counts} />
        </div>

        {/* Buscador de secciones */}
        <div className="max-w-2xl mx-auto px-4 py-2">
          <div className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              placeholder="Buscar selección… ej: arg, brasil, france"
              className="w-full pl-8 pr-8 py-2 rounded-xl bg-surface-subtle border border-border
                text-sm text-foreground placeholder:text-muted
                outline-none focus:border-brand focus:ring-2 focus:ring-brand/15
                transition-all duration-150"
            />
            {sectionSearch && (
              <button
                type="button"
                onClick={() => setSectionSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted
                  hover:text-foreground transition-colors"
                aria-label="Limpiar búsqueda"
              >
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
                >
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Hint de uso — solo en modo escritura */}
        {!readOnly && (
          <div className="max-w-2xl mx-auto px-4 pb-2.5">
            <p className="text-[10px] text-muted text-center">
              Toca para agregar · Mantén presionado para eliminar
            </p>
          </div>
        )}
      </div>

      {/* ── Contenido ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-2xl mx-auto px-4 pb-28">
        {/* Tarjeta de stats */}
        <div className="mt-5 mb-8 rounded-2xl bg-surface border border-border p-5">
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

          <div className="w-full h-2 rounded-full bg-surface-subtle overflow-hidden">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${percentage}%` }}
            />
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4">
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
            <div className="text-center p-2 rounded-xl bg-yellow-500/10 border border-yellow-600/20">
              <p className="text-base font-bold text-yellow-300 tabular-nums">
                {specialsOwned}
                <span className="text-[10px] font-normal text-yellow-600/70">
                  /{specialStickers.length}
                </span>
              </p>
              <p className="text-[10px] text-yellow-600/80 mt-0.5">
                ✦ especiales
              </p>
            </div>
          </div>
        </div>

        {/* Secciones de barajitas */}
        <div
          className={`flex flex-col gap-8 ${readOnly ? "pointer-events-none select-none" : ""}`}
        >
          {sections.map((section) => {
            const stickers = visibleStickers(expandedGroups[section] ?? []);
            if (stickers.length === 0) return null;
            return (
              <StickerSection
                key={section}
                section={section}
                stickers={stickers}
                ownedMap={ownedMap}
                flashId={flashId}
                isSpecialFn={isSpecialSticker}
                onTileAdd={handleTileAdd}
                onTileRemove={handleTileRemove}
              />
            );
          })}

          {noResults && (
            <div className="text-center py-20 text-muted">
              <p className="text-4xl mb-3">🎴</p>
              <p className="text-sm">
                {sectionSearch
                  ? `No se encontró ninguna selección con "${sectionSearch}"`
                  : "No hay barajitas en este filtro"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── FAB — solo en modo escritura ──────────────────────────────────── */}
      {!readOnly && (
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="fixed bottom-20 right-4 z-30
            w-14 h-14 rounded-full bg-brand text-white shadow-lg shadow-brand/30
            hover:bg-brand-dark active:scale-95
            transition-all duration-150
            flex items-center justify-center"
          aria-label="Agregar barajitas"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M12 5v14" />
          </svg>
        </button>
      )}

      {/* ── Modal — solo en modo escritura ────────────────────────────────── */}
      {!readOnly && (
        <AddStickerModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onAdd={handleQuickAdd}
        />
      )}
    </div>
  );
}
