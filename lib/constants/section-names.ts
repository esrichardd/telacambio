/**
 * Display metadata for each album section code.
 * Used in StickerSection (album view) and SectionProgressList (stats page).
 *
 * FWC sections are split into virtual sub-groups by AlbumView — those keys
 * (FWC_ESP, FWC_BAL, FWC_HIS) are also included here.
 *
 * Fallback: if a code is not present, display the raw code as-is.
 */
export const SECTION_META: Record<string, { name: string; flag: string }> = {
  // FWC — 3 virtual sub-sections
  FWC_ESP: { name: "Especiales", flag: "⭐" },
  FWC_BAL: { name: "Balón y países", flag: "⚽" },
  FWC_HIS: { name: "Historia", flag: "🏆" },

  // Special sponsor section
  CC: { name: "Coca-Cola", flag: "🥤" },

  // North & Central America / Caribbean
  MEX: { name: "México", flag: "🇲🇽" },
  USA: { name: "Estados Unidos", flag: "🇺🇸" },
  CAN: { name: "Canadá", flag: "🇨🇦" },
  CUW: { name: "Curazao", flag: "🇨🇼" },
  HAI: { name: "Haití", flag: "🇭🇹" },
  PAN: { name: "Panamá", flag: "🇵🇦" },

  // South America
  ARG: { name: "Argentina", flag: "🇦🇷" },
  BRA: { name: "Brasil", flag: "🇧🇷" },
  COL: { name: "Colombia", flag: "🇨🇴" },
  ECU: { name: "Ecuador", flag: "🇪🇨" },
  PAR: { name: "Paraguay", flag: "🇵🇾" },
  URU: { name: "Uruguay", flag: "🇺🇾" },

  // Europe
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

  // Africa
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

  // Asia & Oceania
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
