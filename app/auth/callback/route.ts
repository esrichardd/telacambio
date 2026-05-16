import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Procesa los tokens que Supabase incluye en los links de correo.
 *
 * @supabase/ssr usa PKCE por defecto → Supabase envía `?code=xxx`
 * Fallback OTP → `?token_hash=xxx&type=...`
 *
 * Flujos:
 *   code + type=signup   → confirmar cuenta    → /onboarding
 *   code + type=recovery → resetear contraseña → /reset-password
 *   token_hash + type    → mismo routing
 *   error                → /login?error=link-expirado
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as
    | "signup"
    | "recovery"
    | "email"
    | null;

  const supabase = await createClient();
  let authError: Error | null = null;

  if (code) {
    // PKCE flow — el más común con @supabase/ssr
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    authError = error;
  } else if (token_hash && type) {
    // OTP / token_hash flow — fallback
    const { error } = await supabase.auth.verifyOtp({ token_hash, type });
    authError = error;
  }

  if (!authError) {
    if (type === "recovery") {
      return NextResponse.redirect(new URL("/reset-password", origin));
    }
    // signup, email, invite → onboarding
    return NextResponse.redirect(new URL("/onboarding", origin));
  }

  return NextResponse.redirect(new URL("/login?error=link-expirado", origin));
}
