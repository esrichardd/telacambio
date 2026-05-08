import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@/types/database";

/**
 * Refresca el token de sesión del usuario en cada request.
 * Debe llamarse desde proxy.ts (raíz del proyecto).
 *
 * Retorna:
 * - supabaseResponse: la response con las cookies de sesión actualizadas
 * - user: el usuario autenticado, o null si no hay sesión
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Primero actualiza las cookies en la request
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          // Luego las propaga en la response
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // IMPORTANTE: No escribir lógica entre createServerClient y getUser().
  // getUser() valida el token con Supabase — es la fuente de verdad de la sesión.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { supabaseResponse, user };
}
