import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesInsert } from "@/types/database";
import type { Collection } from "@/types/app";

type Client = SupabaseClient<Database>;

/** Busca la colección de un usuario para un álbum. Retorna null si no existe. */
export async function getCollection(
  client: Client,
  profileId: string,
  albumId: string,
): Promise<Collection | null> {
  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("profile_id", profileId)
    .eq("album_id", albumId)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/** Crea una colección nueva para un usuario y álbum. */
export async function createCollection(
  client: Client,
  profileId: string,
  albumId: string,
): Promise<Collection> {
  const payload: TablesInsert<"collections"> = {
    profile_id: profileId,
    album_id: albumId,
  };

  const { data, error } = await client
    .from("collections")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .insert(payload as any)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Busca la colección de un usuario para un álbum y la crea si no existe.
 * Es la función más usada — casi siempre quieres trabajar con la colección
 * sin preocuparte si ya existía o no.
 */
export async function getOrCreateCollection(
  client: Client,
  profileId: string,
  albumId: string,
): Promise<Collection> {
  const existing = await getCollection(client, profileId, albumId);
  if (existing) return existing;
  return createCollection(client, profileId, albumId);
}

/** Busca una colección por su ID. */
export async function getCollectionById(
  client: Client,
  id: string,
): Promise<Collection | null> {
  const { data, error } = await client
    .from("collections")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}
