"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthAlert from "@/components/auth/AuthAlert";

function translateError(message: string): string {
  if (
    message.includes("User already registered") ||
    message.includes("already been registered")
  )
    return "Ya existe una cuenta con este correo electrónico.";
  if (message.includes("Password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (message.includes("Unable to validate email"))
    return "El correo electrónico no es válido.";
  if (message.includes("rate limit") || message.includes("too many"))
    return "Demasiados intentos. Espera un momento antes de volver a intentar.";
  return "Ocurrió un error. Inténtalo de nuevo.";
}

type FieldErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState("");
  const [loading, setLoading] = useState(false);

  function validate(): FieldErrors {
    const errors: FieldErrors = {};

    if (!email.trim()) {
      errors.email = "El correo es obligatorio.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Ingresa un correo válido.";
    }

    if (!password) {
      errors.password = "La contraseña es obligatoria.";
    } else if (password.length < 6) {
      errors.password = "La contraseña debe tener al menos 6 caracteres.";
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Confirma tu contraseña.";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    return errors;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setGlobalError("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);

    const supabase = createClient();

    // emailRedirectTo le dice a Supabase a dónde redirigir al confirmar
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    setLoading(false);

    if (error) {
      setGlobalError(translateError(error.message));
      return;
    }

    // Redirigir a la pantalla de verificación con el correo como contexto
    router.push(`/verify-email?type=signup&email=${encodeURIComponent(email)}`);
  }

  return (
    <AuthCard
      title="Crea tu cuenta"
      subtitle="Empieza a registrar tu álbum gratis."
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
            if (fieldErrors.email)
              setFieldErrors((p) => ({ ...p, email: undefined }));
          }}
          error={fieldErrors.email}
        />

        <AuthInput
          id="password"
          label="Contraseña"
          type="password"
          showToggle
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password)
              setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          error={fieldErrors.password}
        />

        <AuthInput
          id="confirmPassword"
          label="Confirmar contraseña"
          type="password"
          showToggle
          placeholder="Repite tu contraseña"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword)
              setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
          }}
          error={fieldErrors.confirmPassword}
        />

        <div className="pt-1">
          <AuthButton type="submit" loading={loading}>
            Crear cuenta
          </AuthButton>
        </div>

        <p className="text-center text-xs text-muted leading-relaxed pt-1">
          Al crear tu cuenta aceptas nuestros{" "}
          <span className="text-foreground/60">términos y condiciones</span>.
        </p>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">¿Ya tienes cuenta?</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link
        href="/login"
        className="block w-full py-3 px-4 rounded-full border border-border text-sm font-semibold text-foreground text-center hover:bg-surface-subtle transition-colors"
      >
        Entrar →
      </Link>
    </AuthCard>
  );
}
