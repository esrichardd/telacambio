import { unstable_cache } from "next/cache";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, TablesUpdate } from "@/types/database";
import type { Profile, OnboardingData } from "@/types/app";
import { createPublicClient } from "@/lib/supabase/public";

type Client = SupabaseClient<Database>;

type ProfileUpdates = Partial<
  OnboardingData & {
    avatar_url: string;
    bio: string;
    is_public: boolean;
    onboarding_completed: boolean;
  }
>;

/** Busca un perfil público por username. Retorna null si no existe o es privado. */
export async function getProfileByUsername(
  client: Client,
  username: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("username", username)
    .eq("is_public", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Busca el perfil propio del usuario autenticado.
 * No filtra por is_public — el dueño siempre puede ver su perfil.
 */
export async function getProfileById(
  client: Client,
  id: string,
): Promise<Profile | null> {
  const { data, error } = await client
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

/**
 * Versión cacheada de getProfileById.
 * El perfil cambia solo cuando el usuario guarda settings — en ese momento
 * se invalida llamando invalidateProfileCache(userId) desde lib/cache/invalidate.ts.
 * Revalidación automática cada 5 minutos como red de seguridad.
 *
 * Usa createPublicClient() internamente porque unstable_cache no puede
 * aceptar un cliente con cookies (request-scoped).
 * El perfil es legible por la anon key (no filtra por is_public aquí).
 */
export function getProfileByIdCached(userId: string): Promise<Profile | null> {
  return unstable_cache(
    async (): Promise<Profile | null> => {
      const supabase = createPublicClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        if (error.code === "PGRST116") return null;
        throw error;
      }
      return data;
    },
    [`profile:${userId}`],
    { tags: [`profile:${userId}`], revalidate: 300 },
  )();
}

/**
 * Verifica si un username está disponible.
 * Útil para validación en tiempo real en el formulario de onboarding.
 */
export async function checkUsernameAvailable(
  client: Client,
  username: string,
  currentUserId?: string,
): Promise<boolean> {
  let query = client.from("profiles").select("id").eq("username", username);

  if (currentUserId) {
    query = query.neq("id", currentUserId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) throw error;
  return data === null; // null = no existe = disponible
}

/** Actualiza los datos del perfil del usuario. Solo puede editar el propio (RLS lo garantiza). */
export async function updateProfile(
  client: Client,
  id: string,
  updates: ProfileUpdates,
): Promise<Profile> {
  const payload = updates as TablesUpdate<"profiles">;

  const { data, error } = await client
    .from("profiles")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .update(payload as unknown as never)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/** Marca el onboarding como completado */
export async function completeOnboarding(
  client: Client,
  id: string,
  data: OnboardingData,
): Promise<Profile> {
  return updateProfile(client, id, {
    ...data,
    onboarding_completed: true,
  });
}
