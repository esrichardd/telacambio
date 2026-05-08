import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { Album } from "@/types/app";

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
