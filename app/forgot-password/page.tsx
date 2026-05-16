"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthAlert from "@/components/auth/AuthAlert";

function translateError(message: string): string {
  if (message.includes("rate limit") || message.includes("too many"))
    return "Demasiados intentos. Espera unos minutos antes de volver a intentar.";
  if (
    message.includes("Unable to validate email") ||
    message.includes("invalid")
  )
    return "El correo electrónico no es válido.";
  return "No pudimos enviar el correo. Inténtalo de nuevo.";
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): boolean {
    if (!email.trim()) {
      setEmailError("El correo es obligatorio.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Ingresa un correo válido.");
      return false;
    }
    return true;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError("");
    setEmailError("");

    if (!validate()) return;

    setLoading(true);

    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo,
    });

    setLoading(false);

    if (error) {
      setGlobalError(translateError(error.message));
      return;
    }

    // Redirigir a la pantalla de "revisa tu correo"
    router.push(`/verify-email?type=reset&email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthCard
      title="Recupera tu contraseña"
      subtitle="Te enviamos un link para que puedas crear una nueva."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {globalError && <AuthAlert type="error" message={globalError} />}

        <AuthInput
          id="email"
          label="Correo electrónico"
          type="email"
          placeholder="tu@correo.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError("");
          }}
          error={emailError}
          hint="Usa el correo con el que creaste tu cuenta."
        />

        <div className="pt-1">
          <AuthButton type="submit" loading={loading}>
            Enviar link de recuperación
          </AuthButton>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/login"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Volver al login
        </Link>
      </div>
    </AuthCard>
  );
}
