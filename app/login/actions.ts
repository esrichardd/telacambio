"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
  fieldErrors?: { email?: string; password?: string };
};

function translateError(message: string): string {
  if (message.includes("Invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (message.includes("Email not confirmed"))
    return "Tu correo aún no está confirmado. Revisa tu bandeja de entrada.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Demasiados intentos. Espera un momento antes de volver a intentar.";
  if (message.includes("network") || message.includes("fetch"))
    return "Sin conexión. Verifica tu internet e inténtalo de nuevo.";
  return "Ocurrió un error. Inténtalo de nuevo.";
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const fieldErrors: LoginState["fieldErrors"] = {};
  if (!email) {
    fieldErrors.email = "El correo es obligatorio.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldErrors.email = "Ingresa un correo válido.";
  }
  if (!password) {
    fieldErrors.password = "La contraseña es obligatoria.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: translateError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
