import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Se ejecuta antes de cada request.
 * Responsabilidades:
 * 1. Refrescar el token de sesión de Supabase
 * 2. Redirigir al login si el usuario intenta entrar a rutas privadas sin sesión
 * 3. Redirigir al dashboard si el usuario autenticado intenta entrar al login
 * 4. Inyectar x-user-id en los request headers para que las páginas no
 *    necesiten llamar a supabase.auth.getUser() de nuevo (~350ms ahorrados
 *    por navegación — la validación del JWT ya ocurrió en updateSession).
 */
export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  // Rutas que requieren sesión activa
  const privatePaths = ["/dashboard", "/groups"];
  const isPrivate = privatePaths.some((path) => pathname.startsWith(path));

  // Rutas solo para usuarios no autenticados
  const authPaths = ["/login", "/register"];
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  if (isPrivate && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Construir request headers con x-user-id inyectado.
  // Stripear primero el header entrante para evitar spoofing: un cliente
  // malicioso no puede hacerse pasar por otro usuario enviando x-user-id.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete("x-user-id");
  if (user) {
    requestHeaders.set("x-user-id", user.id);
  }

  // Nueva response que pasa los headers modificados a la page.
  // Los Server Components los leen via headers() de next/headers.
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // Copiar cookies de sesión que Supabase pudo haber refrescado
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value, cookie);
  });

  return response;
}

export const config = {
  // Lista positiva: el proxy solo corre donde es necesario.
  // Rutas públicas (/[username], /, /forgot-password, etc.) quedan fuera
  // y no pagan el costo de supabase.auth.getUser().
  matcher: [
    "/dashboard/:path*",
    "/album/:path*",
    "/intercambios/:path*",
    "/settings/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
    "/auth/callback",
  ],
};
