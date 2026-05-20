import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Sticker } from "@/types/app";
import { normalizeStickerCode } from "@/lib/utils/sticker";
import { createPublicClient } from "@/lib/supabase/public";

type Client = SupabaseClient<Database>;

/** Devuelve todas las barajitas de un álbum, ordenadas por sección y número */
export async function getStickersByAlbum(
  client: Client,
  albumId: string,
): Promise<Sticker[]> {
  const { data, error } = await client
    .from("stickers")
    .select("*")
    .eq("album_id", albumId)
    .order("section")
    .order("number");

  if (error) throw error;
  return data;
}

/**
 * Agrupa las barajitas de un álbum por sección.
 * Útil para renderizar el álbum dividido por país/equipo.
 */
export async function getStickersByAlbumGrouped(
  client: Client,
  albumId: string,
): Promise<Record<string, Sticker[]>> {
  const stickers = await getStickersByAlbum(client, albumId);

  return stickers.reduce(
    (acc, sticker) => {
      if (!acc[sticker.section]) acc[sticker.section] = [];
      acc[sticker.section].push(sticker);
      return acc;
    },
    {} as Record<string, Sticker[]>,
  );
}

/**
 * Cached version of getStickersByAlbumGrouped.
 * Sticker catalog per album is stable — only changes on admin edits.
 * Persists across requests for 1 hour. Call invalidateStickersCache(albumId)
 * from admin actions that mutate the stickers table.
 *
 * Factory function: receives albumId so each album gets its own cache key.
 * Creates its own Supabase client internally.
 */
export function getStickersByAlbumGroupedCached(
  albumId: string,
): Promise<Record<string, Sticker[]>> {
  const cached = unstable_cache(
    async (): Promise<Record<string, Sticker[]>> => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("stickers")
        .select("*")
        .eq("album_id", albumId)
        .order("section")
        .order("number");

      if (error) throw error;

      return data.reduce(
        (acc, sticker) => {
          if (!acc[sticker.section]) acc[sticker.section] = [];
          acc[sticker.section].push(sticker);
          return acc;
        },
        {} as Record<string, Sticker[]>,
      );
    },
    [`stickers:album:${albumId}`],
    { tags: [`stickers:album:${albumId}`], revalidate: 3600 },
  );

  return cached();
}

/**
 * Busca una barajita por su código dentro de un álbum.
 * Normaliza el input antes de buscar: "arg2" → "ARG-2"
 * Retorna null si no existe.
 */
export async function getStickerByCode(
  client: Client,
  albumId: string,
  rawCode: string,
): Promise<Sticker | null> {
  const code = normalizeStickerCode(rawCode);

  const { data, error } = await client
    .from("stickers")
    .select("*")
    .eq("album_id", albumId)
    .eq("code", code)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    throw error;
  }
  return data;
}
