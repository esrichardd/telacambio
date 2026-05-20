import { cache } from "react";
import { headers } from "next/headers";
import type { User } from "@supabase/supabase-js";

/**
 * Retorna el usuario autenticado leyendo el header x-user-id que inyecta
 * proxy.ts después de validar el JWT con Supabase.
 *
 * Costo: ~0ms (lectura de header en memoria, sin llamada de red).
 * La validación real del JWT ocurre una sola vez en proxy.ts por request.
 *
 * Memoizado con cache() de React para que layout y page compartan el mismo
 * resultado dentro del mismo render tree.
 *
 * Nota: retorna un objeto User parcial — solo `id` está garantizado.
 * Las páginas no deben acceder a otros campos sin verificar que existen.
 */
export const getAuthUser = cache(async (): Promise<User | null> => {
  const headersList = await headers();
  const userId = headersList.get("x-user-id");
  if (!userId) return null;
  return { id: userId } as User;
});
