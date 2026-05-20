import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Album } from "@/types/app";
import { createPublicClient } from "@/lib/supabase/public";

type Client = SupabaseClient<Database>;

/** Devuelve todos los álbumes activos, ordenados por nombre */
export async function getActiveAlbums(client: Client): Promise<Album[]> {
  const { data, error } = await client
    .from("albums")
    .select("*")
    .eq("is_active", true)
    .order("name");

  if (error) throw error;
  return data;
}

/**
 * Cached version of getActiveAlbums.
 * Albums are catalog data — they change rarely (once per album release).
 * Persists across requests for 1 hour. Call invalidateAlbumsCache()
 * from admin actions that mutate the albums table.
 *
 * Creates its own Supabase client internally — unstable_cache cannot
 * accept a request-scoped client as input (cookies would leak across users).
 */
export const getActiveAlbumsCached = unstable_cache(
  async (): Promise<Album[]> => {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data;
  },
  ["albums:active"],
  { tags: ["albums:active"], revalidate: 3600 },
);

/** Busca un álbum por su slug. Retorna null si no existe. */
export async function getAlbumBySlug(
  client: Client,
  slug: string,
): Promise<Album | null> {
  const { data, error } = await client
    .from("albums")
    .select("*")
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null; // no rows
    throw error;
  }
  return data;
}
