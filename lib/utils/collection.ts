import type { CollectionSummary } from "@/types/app";

type StickerEntry = { sticker_id: string; quantity: number };

/**
 * Calcula el resumen de una colección a partir de las barajitas registradas.
 * Esta es la función central del negocio — de aquí salen todos los números
 * que se muestran en la UI.
 *
 * @param stickers - Las filas de collection_stickers del usuario
 * @param totalStickers - El total oficial del álbum (de albums.total_stickers)
 */
export function computeSummary(
  stickers: StickerEntry[],
  totalStickers: number,
): CollectionSummary {
  const owned = stickers.filter((s) => s.quantity >= 1).length;
  const repeated = stickers.filter((s) => s.quantity >= 2).length;
  const available = stickers.reduce(
    (sum, s) => sum + Math.max(0, s.quantity - 1),
    0,
  );
  const missing = totalStickers - owned;
  const percentage =
    totalStickers > 0 ? Math.round((owned / totalStickers) * 100) : 0;

  return {
    total: totalStickers,
    owned,
    missing,
    repeated,
    available,
    percentage,
  };
}
