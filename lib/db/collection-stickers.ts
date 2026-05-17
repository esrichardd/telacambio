import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/types/database";
import type {
  CollectionSticker,
  CollectionSummary,
  Sticker,
  StickerWithStatus,
} from "@/types/app";
import { deriveStickerStatus } from "@/types/app";

type Client = SupabaseClient<Database>;

// Tipo local para la respuesta del join sticker + collection_sticker
type CollectionStickerWithSticker = CollectionSticker & { sticker: Sticker };

/**
 * Calcula el resumen numérico de una colección (tengo, faltan, repetidas, etc.)
 * Hace una sola query y computa en JS — la colección tiene máx. 993 filas.
 */
export async function getCollectionSummary(
  client: Client,
  collectionId: string,
  totalStickers: number,
): Promise<CollectionSummary> {
  const { data, error } = await client
    .from("collection_stickers")
    .select("quantity")
    .eq("collection_id", collectionId);

  if (error) throw error;

  const rows = data as { quantity: number }[];
  const owned = rows.length;
  const repeated = rows.filter((r) => r.quantity >= 2).length;
  const available = rows.reduce((sum, r) => sum + Math.max(0, r.quantity - 1), 0);
  const missing = totalStickers - owned;
  const percentage = totalStickers > 0 ? Math.round((owned / totalStickers) * 100) : 0;

  return { total: totalStickers, owned, missing, repeated, available, percentage };
}

/**
 * Devuelve todas las barajitas registradas en una colección.
 * Solo incluye las que el usuario tiene (quantity >= 1).
 * Las que no aparecen aquí = "me falta".
 */
export async function getCollectionStickers(
  client: Client,
  collectionId: string,
): Promise<CollectionSticker[]> {
  const { data, error } = await client
    .from("collection_stickers")
    .select("*")
    .eq("collection_id", collectionId);

  if (error) throw error;
  return data;
}

/**
 * Devuelve las barajitas de una colección enriquecidas con su estado y datos del sticker.
 * Útil para la vista del álbum completo.
 */
export async function getCollectionStickersWithDetails(
  client: Client,
  collectionId: string,
): Promise<StickerWithStatus[]> {
  const { data, error } = await client
    .from("collection_stickers")
    .select("*, sticker:stickers(*)")
    .eq("collection_id", collectionId);

  if (error) throw error;

  const rows = data as CollectionStickerWithSticker[];

  return rows.map(({ sticker, quantity, ...rest }) => ({
    ...sticker,
    ...rest,
    quantity,
    status: deriveStickerStatus(quantity),
    available_to_trade: Math.max(0, quantity - 1),
  }));
}

/**
 * Agrega o actualiza una barajita en la colección.
 * Si ya existe, actualiza la quantity. Si no, la crea.
 * Esta es la operación central de la app.
 */
export async function upsertSticker(
  client: Client,
  collectionId: string,
  stickerId: string,
  quantity: number,
): Promise<CollectionSticker> {
  const payload: TablesInsert<"collection_stickers"> = {
    collection_id: collectionId,
    sticker_id: stickerId,
    quantity,
  };

  const { data, error } = await client
    .from("collection_stickers")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .upsert(payload as any, { onConflict: "collection_id,sticker_id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Elimina una barajita de la colección (la marca como "me falta").
 * Equivale a que el usuario ya no la tiene.
 */
export async function removeSticker(
  client: Client,
  collectionId: string,
  stickerId: string,
): Promise<void> {
  const { error } = await client
    .from("collection_stickers")
    .delete()
    .eq("collection_id", collectionId)
    .eq("sticker_id", stickerId);

  if (error) throw error;
}

/**
 * Devuelve las barajitas que le faltan al usuario en un álbum.
 * Son las que están en el catálogo pero NO en su colección.
 */
export async function getMissingStickers(
  client: Client,
  collectionId: string,
  albumId: string,
): Promise<Sticker[]> {
  // Primero obtenemos los IDs que ya tiene
  const { data: owned, error: ownedError } = await client
    .from("collection_stickers")
    .select("sticker_id")
    .eq("collection_id", collectionId);

  if (ownedError) throw ownedError;

  const ownedIds = (owned as { sticker_id: string }[]).map((r) => r.sticker_id);

  // Luego buscamos las que no están en esa lista
  const query = client
    .from("stickers")
    .select("*")
    .eq("album_id", albumId)
    .order("section")
    .order("number");

  if (ownedIds.length > 0) {
    query.not("id", "in", `(${ownedIds.join(",")})`);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

/**
 * Devuelve las barajitas repetidas (quantity >= 2).
 * Incluye cuántas unidades disponibles tiene para intercambiar.
 */
export async function getRepeatedStickers(
  client: Client,
  collectionId: string,
): Promise<(Sticker & CollectionSticker & { available_to_trade: number })[]> {
  const { data, error } = await client
    .from("collection_stickers")
    .select("*, sticker:stickers(*)")
    .eq("collection_id", collectionId)
    .gte("quantity", 2)
    .order("quantity", { ascending: false });

  if (error) throw error;

  const rows = data as CollectionStickerWithSticker[];

  return rows.map(({ sticker, quantity, ...rest }) => ({
    ...sticker,
    ...rest,
    quantity,
    available_to_trade: quantity - 1,
  }));
}
