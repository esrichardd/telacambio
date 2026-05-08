import { NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * Se ejecuta antes de cada request.
 * Responsabilidades:
 * 1. Refrescar el token de sesión de Supabase
 * 2. Redirigir al login si el usuario intenta entrar a rutas privadas sin sesión
 * 3. Redirigir al dashboard si el usuario autenticado intenta entrar al login
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

  return supabaseResponse;
}

export const config = {
  matcher: [
    // Excluye archivos estáticos y assets — el proxy solo corre en rutas de la app
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
