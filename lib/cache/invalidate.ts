"use server";

import { revalidateTag } from "next/cache";

/**
 * Invalidates the cache of active albums.
 * Call this from admin actions that mutate the albums table
 * (e.g., publishing a new album, deactivating an old one).
 */
export async function invalidateAlbumsCache(): Promise<void> {
  revalidateTag("albums:active", {});
}

/**
 * Invalidates the sticker catalog cache for a specific album.
 * Call this from admin actions that mutate the stickers table.
 */
export async function invalidateStickersCache(albumId: string): Promise<void> {
  revalidateTag(`stickers:album:${albumId}`, {});
}

/**
 * Invalida el cache del perfil de un usuario.
 * Llamar desde cualquier acción que mute la tabla profiles (settings save,
 * onboarding completo, cambio de avatar, etc.).
 */
export async function invalidateProfileCache(userId: string): Promise<void> {
  revalidateTag(`profile:${userId}`, {});
}
