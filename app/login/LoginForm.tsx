"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/auth/AuthCard";
import AuthInput from "@/components/auth/AuthInput";
import AuthButton from "@/components/auth/AuthButton";
import AuthAlert from "@/components/auth/AuthAlert";

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

function translateUrlError(code: string | null): string | null {
  if (code === "link-expirado")
    return "El link ha expirado o ya fue usado. Solicita uno nuevo.";
  return null;
}

type FieldErrors = {
  email?: string;
  password?: string;
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = translateUrlError(searchParams.get("error"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setGlobalError(translateError(error.message));
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <AuthCard
      title="Bienvenido de nuevo"
      subtitle="Entra para ver y gestionar tu álbum."
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        {urlError && !globalError && (
          <AuthAlert type="error" message={urlError} />
        )}

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

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-foreground"
            >
              Contraseña
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted hover:text-brand transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <AuthInput
            id="password"
            label=""
            type="password"
            showToggle
            placeholder="Tu contraseña"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (fieldErrors.password)
                setFieldErrors((p) => ({ ...p, password: undefined }));
            }}
            error={fieldErrors.password}
          />
        </div>

        <div className="pt-1">
          <AuthButton type="submit" loading={loading}>
            Entrar
          </AuthButton>
        </div>
      </form>

      <div className="my-6 flex items-center gap-3">
        <div className="flex-1 h-px bg-border" />
        <span className="text-xs text-muted">¿No tienes cuenta?</span>
        <div className="flex-1 h-px bg-border" />
      </div>

      <Link
        href="/register"
        className="block w-full py-3 px-4 rounded-full border border-border text-sm font-semibold text-foreground text-center hover:bg-surface-subtle transition-colors"
      >
        Crear cuenta gratis
      </Link>
    </AuthCard>
  );
}
