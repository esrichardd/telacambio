"use client";

import { useState } from "react";
import type { Sticker } from "@/types/app";
import StickerTile from "./StickerTile";

// ---------------------------------------------------------------------------
// Metadatos de cada sección: nombre completo + bandera/emoji
// ---------------------------------------------------------------------------
const SECTION_META: Record<string, { name: string; flag: string }> = {
  // FWC — 3 sub-secciones virtuales
  FWC_ESP: { name: "Especiales", flag: "⭐" },
  FWC_BAL: { name: "Balón y países", flag: "⚽" },
  FWC_HIS: { name: "Historia", flag: "🏆" },

  // Especial patrocinador
  CC: { name: "Coca-Cola", flag: "🥤" },

  // América del Norte y Central / Caribe
  MEX: { name: "México", flag: "🇲🇽" },
  USA: { name: "Estados Unidos", flag: "🇺🇸" },
  CAN: { name: "Canadá", flag: "🇨🇦" },
  CUW: { name: "Curazao", flag: "🇨🇼" },
  HAI: { name: "Haití", flag: "🇭🇹" },
  PAN: { name: "Panamá", flag: "🇵🇦" },

  // América del Sur
  ARG: { name: "Argentina", flag: "🇦🇷" },
  BRA: { name: "Brasil", flag: "🇧🇷" },
  COL: { name: "Colombia", flag: "🇨🇴" },
  ECU: { name: "Ecuador", flag: "🇪🇨" },
  PAR: { name: "Paraguay", flag: "🇵🇾" },
  URU: { name: "Uruguay", flag: "🇺🇾" },

  // Europa
  AUT: { name: "Austria", flag: "🇦🇹" },
  BEL: { name: "Bélgica", flag: "🇧🇪" },
  BIH: { name: "Bosnia y Herz.", flag: "🇧🇦" },
  CRO: { name: "Croacia", flag: "🇭🇷" },
  CZE: { name: "Rep. Checa", flag: "🇨🇿" },
  ENG: { name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  ESP: { name: "España", flag: "🇪🇸" },
  FRA: { name: "Francia", flag: "🇫🇷" },
  GER: { name: "Alemania", flag: "🇩🇪" },
  NED: { name: "Países Bajos", flag: "🇳🇱" },
  NOR: { name: "Noruega", flag: "🇳🇴" },
  POR: { name: "Portugal", flag: "🇵🇹" },
  SCO: { name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
  SUI: { name: "Suiza", flag: "🇨🇭" },
  SWE: { name: "Suecia", flag: "🇸🇪" },
  TUR: { name: "Turquía", flag: "🇹🇷" },

  // África
  ALG: { name: "Argelia", flag: "🇩🇿" },
  CIV: { name: "Costa de Marfil", flag: "🇨🇮" },
  COD: { name: "RD Congo", flag: "🇨🇩" },
  CPV: { name: "Cabo Verde", flag: "🇨🇻" },
  EGY: { name: "Egipto", flag: "🇪🇬" },
  GHA: { name: "Ghana", flag: "🇬🇭" },
  MAR: { name: "Marruecos", flag: "🇲🇦" },
  RSA: { name: "Sudáfrica", flag: "🇿🇦" },
  SEN: { name: "Senegal", flag: "🇸🇳" },
  TUN: { name: "Túnez", flag: "🇹🇳" },

  // Asia y Oceanía
  AUS: { name: "Australia", flag: "🇦🇺" },
  IRN: { name: "Irán", flag: "🇮🇷" },
  IRQ: { name: "Irak", flag: "🇮🇶" },
  JOR: { name: "Jordania", flag: "🇯🇴" },
  JPN: { name: "Japón", flag: "🇯🇵" },
  KOR: { name: "Corea del Sur", flag: "🇰🇷" },
  KSA: { name: "Arabia Saudita", flag: "🇸🇦" },
  NZL: { name: "Nueva Zelanda", flag: "🇳🇿" },
  QAT: { name: "Catar", flag: "🇶🇦" },
  UZB: { name: "Uzbekistán", flag: "🇺🇿" },
};

// Prefijo de sección legible para los grupos FWC virtuales
const FWC_GROUP_LABELS: Record<string, string> = {
  FWC_ESP: "FWC",
  FWC_BAL: "FWC",
  FWC_HIS: "FWC",
};

interface StickerSectionProps {
  section: string;
  stickers: Sticker[];
  ownedMap: Map<string, number>;
  flashId: string | null;
  isSpecialFn: (sticker: Sticker) => boolean;
  onTileAdd: (sticker: Sticker) => void;
  onTileRemove: (sticker: Sticker) => void;
}

export default function StickerSection({
  section,
  stickers,
  ownedMap,
  flashId,
  isSpecialFn,
  onTileAdd,
  onTileRemove,
}: StickerSectionProps) {
  const [collapsed, setCollapsed] = useState(false);

  const meta = SECTION_META[section];
  const flag = meta?.flag ?? "🏳️";
  const name = meta?.name ?? section;

  // Para grupos FWC virtuales mostramos "FWC" como código corto
  const shortCode = FWC_GROUP_LABELS[section] ?? section;
  const showShortCode = name !== section;

  const owned = stickers.filter((s) => (ownedMap.get(s.id) ?? 0) >= 1).length;

  return (
    <div className="flex flex-col gap-3">
      {/* Header de sección — clickeable para colapsar */}
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
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
