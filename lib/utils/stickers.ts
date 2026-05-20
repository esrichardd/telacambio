import type { Sticker } from "@/types/app";

/**
 * Returns true if a sticker is considered "especial":
 *   - All FWC section stickers (FIFA World Cup specials)
 *   - The #1 sticker of any team section (excluding CC and FWC)
 *
 * This mirrors the SQL logic in 008_stats_rpc.sql:
 *   (s.section = 'FWC' OR (s.section <> 'CC' AND s.number = 1))
 */
export function isSpecialSticker(sticker: Sticker): boolean {
  if (sticker.section === "FWC") return true;
  if (sticker.section === "CC") return false;
  return sticker.number === 1;
}
